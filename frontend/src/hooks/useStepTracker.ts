'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityType,
  calculateDynamicMET,
  calculateTreadmillDistanceKm
} from '@/lib/metCalculations';

export type TrackerStatus =
  | 'idle'
  | 'permission-requesting'
  | 'permission-denied'
  | 'tracking'
  | 'paused-manual'
  | 'paused-background'
  | 'finished';

export interface TelemetryPoint {
  timestamp: number; // elapsed seconds
  steps: number;
  calories: number;
  speed: number | null;
  distance: number | null;
  lat: number | null;
  lng: number | null;
}

export interface SavedSessionState {
  activityType: ActivityType;
  startTime: string;
  durationSeconds: number;
  stepsCount: number;
  caloriesBurned: number;
  distanceKm: number | null;
  telemetryData: TelemetryPoint[];
  maxSpeedKmh: number | null;
  elevationGainMeters: number | null;
}

const LOCAL_STORAGE_KEY = 'fitsphere_active_session';

/**
 * Haversine formula to compute distance between two lat/lng points in meters
 */
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useStepTracker(initialActivity: ActivityType = 'running', userWeightKg = 70) {
  const [activityType, setActivityType] = useState<ActivityType>(initialActivity);
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [currentCadence, setCurrentCadence] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number | null>(null);
  const [elevationGain, setElevationGain] = useState<number | null>(null);
  const [maxSpeed, setMaxSpeed] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [isSimulator, setIsSimulator] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [restoredSessionData, setRestoredSessionData] = useState<SavedSessionState | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Refs for tracking mutable values inside event listeners & intervals
  const wakeLockRef = useRef<any>(null);
  const watchPositionIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const accelMagnitudeBufferRef = useRef<number[]>([]);
  const stepTimesRef = useRef<number[]>([]);
  const lastGpsPointRef = useRef<{ lat: number; lng: number; altitude: number | null; timestamp: number } | null>(null);
  const stepsAtLastMile = useRef(0);
  const caloriesAtLastMile = useRef(0);
  const distanceAtLastMile = useRef(0);
  const telemetryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Check for stored crash session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: SavedSessionState = JSON.parse(stored);
        if (parsed && parsed.durationSeconds > 0) {
          setRestoredSessionData(parsed);
          setHasRestoredSession(true);
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored session:', e);
    }
  }, []);

  // 2. Web Audio API milestone tone generator
  const playMilestoneTone = useCallback((frequency = 880, type: OscillatorType = 'sine') => {
    if (!audioEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (err) {
      console.warn('Web Audio error:', err);
    }

    // Android-only vibration enhancement with feature detection
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {
        // ignore WebKit / unsupported restriction
      }
    }
  }, [audioEnabled]);

  // 3. Web Screen Wake Lock management
  const requestWakeLock = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        setWakeLockActive(false);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch (e) {}
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  // 4. Page Visibility API auto-pause & background detector
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (status === 'tracking') {
          setStatus('paused-background');
          releaseWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, releaseWakeLock]);

  // 5. Accelerometer Motion Sensor step peak detector
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (status !== 'tracking' || isSimulator) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const now = Date.now();

    // Smooth buffer with low-pass filter
    accelMagnitudeBufferRef.current.push(mag);
    if (accelMagnitudeBufferRef.current.length > 5) {
      accelMagnitudeBufferRef.current.shift();
    }
    const avgMag = accelMagnitudeBufferRef.current.reduce((a, b) => a + b, 0) / accelMagnitudeBufferRef.current.length;

    // Peak threshold step detection (magnitude > 11.8 m/s² with min 250ms interval)
    if (avgMag > 11.8 && now - lastStepTimeRef.current > 250) {
      lastStepTimeRef.current = now;
      setSteps(prev => prev + 1);

      // Track recent step timestamps for SPM cadence calculation
      stepTimesRef.current.push(now);
      stepTimesRef.current = stepTimesRef.current.filter(t => now - t <= 10000);
      const spm = Math.round((stepTimesRef.current.length / 10) * 60);
      setCurrentCadence(spm);
    }
  }, [status, isSimulator]);

  // 6. Geolocation watchPosition sensor with accuracy & noise filtering
  useEffect(() => {
    if (status !== 'tracking' || isSimulator) {
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
      return;
    }

    // Only outdoor speed activities track GPS
    const isGpsActivity = ['running', 'outdoor_walking', 'cycling', 'trekking'].includes(activityType);
    if (!isGpsActivity || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    const maxAllowedSpeedKmh = activityType === 'cycling' ? 65 : 30;

    watchPositionIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, altitude } = position.coords;

        // Filter 1: Accuracy > 20m threshold filter
        if (accuracy > 20) return;

        const now = Date.now();

        if (lastGpsPointRef.current) {
          const deltaMeters = haversineDistanceMeters(
            lastGpsPointRef.current.lat,
            lastGpsPointRef.current.lng,
            latitude,
            longitude
          );

          // Filter 2: Noise floor threshold (ignore < 3m movement deltas)
          if (deltaMeters >= 3) {
            const timeDeltaSec = (now - lastGpsPointRef.current.timestamp) / 1000;
            if (timeDeltaSec > 0) {
              const speedMs = deltaMeters / timeDeltaSec;
              const speedKmhCalc = speedMs * 3.6;

              // Filter 3: Activity-specific max speed gate
              if (speedKmhCalc <= maxAllowedSpeedKmh) {
                setDistanceKm(prev => (prev || 0) + deltaMeters / 1000);
                setCurrentSpeedKmh(Math.round(speedKmhCalc * 10) / 10);
                setMaxSpeed(prev => Math.max(prev || 0, Math.round(speedKmhCalc * 10) / 10));

                // Best-effort altitude gain calculation
                if (altitude !== null && lastGpsPointRef.current.altitude !== null) {
                  const altDelta = altitude - lastGpsPointRef.current.altitude;
                  if (altDelta > 0.5 && altDelta < 50) {
                    setElevationGain(prev => Math.round(((prev || 0) + altDelta) * 10) / 10);
                  }
                }
              }
            }
          }
        } else {
          setCurrentSpeedKmh(speed ? Math.round(speed * 3.6 * 10) / 10 : 0);
        }

        lastGpsPointRef.current = {
          lat: latitude,
          lng: longitude,
          altitude: altitude,
          timestamp: now
        };
      },
      (err) => {
        console.warn('Geolocation watch warning:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    return () => {
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
    };
  }, [status, isSimulator, activityType]);

  // 7. Active session timer tick & dynamic MET calorie burn engine
  useEffect(() => {
    if (status !== 'tracking') return;

    const timer = setInterval(() => {
      setDurationSeconds(prev => prev + 1);

      // Derive cadence and speed for dynamic MET calculation
      let activeCadence = currentCadence;
      let activeSpeed = currentSpeedKmh || 0;

      // Treadmill distance calculation
      if (activityType === 'indoor_treadmill') {
        const computedDist = calculateTreadmillDistanceKm(steps);
        setDistanceKm(computedDist);
      }

      // Calculate dynamic MET burn
      const metResult = calculateDynamicMET({
        activityType,
        speedKmh: activeSpeed,
        cadenceSpm: activeCadence,
        weightKg: userWeightKg,
        altitudeMeters: elevationGain
      });

      setCalories(prev => prev + metResult.caloriesPerSecond);

      // Milestone audio cues (Every 1,000 steps, 1km, 100 kcal)
      if (steps > 0 && steps % 1000 === 0 && steps !== stepsAtLastMile.current) {
        stepsAtLastMile.current = steps;
        playMilestoneTone(880, 'sine');
      }
      if (calories > 0 && Math.floor(calories) % 100 === 0 && Math.floor(calories) !== caloriesAtLastMile.current) {
        caloriesAtLastMile.current = Math.floor(calories);
        playMilestoneTone(1046, 'triangle');
      }
      if (distanceKm && distanceKm >= distanceAtLastMile.current + 1.0) {
        distanceAtLastMile.current = Math.floor(distanceKm);
        playMilestoneTone(1318, 'square');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, activityType, currentCadence, currentSpeedKmh, userWeightKg, elevationGain, steps, calories, distanceKm, playMilestoneTone]);

  // 8. Desktop Simulator Mode tick generator
  useEffect(() => {
    if (status !== 'tracking' || !isSimulator) return;

    const simPacePresets: Record<ActivityType, { spm: number; speedKmh: number }> = {
      running: { spm: 165, speedKmh: 9.5 },
      outdoor_walking: { spm: 110, speedKmh: 4.8 },
      cycling: { spm: 90, speedKmh: 22.0 },
      trekking: { spm: 120, speedKmh: 4.0 },
      indoor_treadmill: { spm: 140, speedKmh: 6.5 },
      badminton: { spm: 115, speedKmh: 0 },
      basketball: { spm: 130, speedKmh: 0 },
      hiit: { spm: 110, speedKmh: 0 },
      jump_rope: { spm: 135, speedKmh: 0 }
    };

    const preset = simPacePresets[activityType] || { spm: 120, speedKmh: 5 };
    setCurrentCadence(preset.spm);
    if (preset.speedKmh > 0) {
      setCurrentSpeedKmh(preset.speedKmh);
      setMaxSpeed(prev => Math.max(prev || 0, preset.speedKmh));
    }

    const intervalMs = Math.round(60000 / preset.spm);
    const simInterval = setInterval(() => {
      setSteps(prev => prev + 1);
      if (['running', 'outdoor_walking', 'cycling', 'trekking'].includes(activityType)) {
        const stepDistKm = preset.speedKmh / 3600; // km per second
        setDistanceKm(prev => (prev || 0) + stepDistKm);
      }
    }, intervalMs);

    return () => clearInterval(simInterval);
  }, [status, isSimulator, activityType]);

  // 9. Telemetry buffer sampling (every 10 seconds)
  useEffect(() => {
    if (status !== 'tracking') return;

    telemetryTimerRef.current = setInterval(() => {
      setTelemetry(prev => [
        ...prev,
        {
          timestamp: durationSeconds,
          steps,
          calories: Math.round(calories * 10) / 10,
          speed: currentSpeedKmh,
          distance: distanceKm ? Math.round(distanceKm * 1000) / 1000 : null,
          lat: lastGpsPointRef.current?.lat || null,
          lng: lastGpsPointRef.current?.lng || null
        }
      ]);
    }, 10000);

    return () => {
      if (telemetryTimerRef.current) clearInterval(telemetryTimerRef.current);
    };
  }, [status, durationSeconds, steps, calories, currentSpeedKmh, distanceKm]);

  // 10. Autosave to localStorage (every 15 seconds)
  useEffect(() => {
    if (status !== 'tracking' && status !== 'paused-manual' && status !== 'paused-background') return;

    autosaveTimerRef.current = setInterval(() => {
      try {
        const stateToSave: SavedSessionState = {
          activityType,
          startTime: new Date().toISOString(),
          durationSeconds,
          stepsCount: steps,
          caloriesBurned: Math.round(calories),
          distanceKm: distanceKm ? Math.round(distanceKm * 100) / 100 : null,
          telemetryData: telemetry,
          maxSpeedKmh: maxSpeed,
          elevationGainMeters: elevationGain
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.warn('Autosave error:', e);
      }
    }, 15000);

    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [status, activityType, durationSeconds, steps, calories, distanceKm, telemetry, maxSpeed, elevationGain]);

  // Attach DeviceMotion listener when tracking
  useEffect(() => {
    if (status === 'tracking' && !isSimulator) {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    } else {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
    }
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
    };
  }, [status, isSimulator, handleDeviceMotion]);

  // Start Session handler with explicit permission check
  const startTracking = useCallback(async () => {
    setPermissionError(null);
    setStatus('permission-requesting');

    // Handle iOS DeviceMotion permission request on direct user gesture
    if (
      !isSimulator &&
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response !== 'granted') {
          setStatus('permission-denied');
          setPermissionError('Motion sensor access was denied. Please allow motion access in browser settings or use Simulator Mode.');
          return;
        }
      } catch (err: any) {
        setStatus('permission-denied');
        setPermissionError(err?.message || 'Permission request error. Try Simulator Mode.');
        return;
      }
    }

    // Acquire Wake Lock
    await requestWakeLock();
    setStatus('tracking');
  }, [isSimulator, requestWakeLock]);

  const pauseTracking = useCallback(() => {
    setStatus('paused-manual');
    releaseWakeLock();
  }, [releaseWakeLock]);

  const resumeTracking = useCallback(async () => {
    await requestWakeLock();
    setStatus('tracking');
  }, [requestWakeLock]);

  const finishTracking = useCallback(() => {
    setStatus('finished');
    releaseWakeLock();
  }, [releaseWakeLock]);

  const clearAutosave = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setHasRestoredSession(false);
    setRestoredSessionData(null);
  }, []);

  const restoreSession = useCallback(() => {
    if (restoredSessionData) {
      setActivityType(restoredSessionData.activityType);
      setDurationSeconds(restoredSessionData.durationSeconds);
      setSteps(restoredSessionData.stepsCount);
      setCalories(restoredSessionData.caloriesBurned);
      setDistanceKm(restoredSessionData.distanceKm);
      setTelemetry(restoredSessionData.telemetryData || []);
      setMaxSpeed(restoredSessionData.maxSpeedKmh);
      setElevationGain(restoredSessionData.elevationGainMeters);
      setStatus('paused-manual');
      setHasRestoredSession(false);
    }
  }, [restoredSessionData]);

  const resetTracker = useCallback(() => {
    setStatus('idle');
    setDurationSeconds(0);
    setSteps(0);
    setCalories(0);
    setDistanceKm(null);
    setCurrentCadence(0);
    setCurrentSpeedKmh(null);
    setElevationGain(null);
    setMaxSpeed(null);
    setTelemetry([]);
    clearAutosave();
  }, [clearAutosave]);

  // Average pace calculation (min / km)
  const avgPaceMinPerKm = distanceKm && distanceKm > 0.05
    ? Math.round((durationSeconds / 60 / distanceKm) * 10) / 10
    : null;

  return {
    activityType,
    setActivityType,
    status,
    durationSeconds,
    steps,
    setSteps, // for post-workout manual edit
    calories: Math.round(calories),
    distanceKm: distanceKm ? Math.round(distanceKm * 100) / 100 : null,
    setDistanceKm, // for post-workout manual edit
    currentCadence,
    currentSpeedKmh,
    elevationGain,
    maxSpeed,
    telemetry,
    isSimulator,
    setIsSimulator,
    audioEnabled,
    setAudioEnabled,
    wakeLockActive,
    permissionError,
    hasRestoredSession,
    restoredSessionData,
    avgPaceMinPerKm,
    startTracking,
    pauseTracking,
    resumeTracking,
    finishTracking,
    resetTracker,
    clearAutosave,
    restoreSession
  };
}
