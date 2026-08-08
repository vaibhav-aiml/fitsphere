'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTracker } from '@/hooks/useStepTracker';
import { ActivityType } from '@/lib/metCalculations';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import useRequireAuth from '@/hooks/useRequireAuth';
import AuthModal from '@/components/AuthModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ActivityOption {
  type: ActivityType;
  label: string;
  icon: string;
  driverLabel: string;
  hasDistance: boolean;
}

const ACTIVITIES: ActivityOption[] = [
  { type: 'running', label: 'Outdoor Run', icon: '🏃', driverLabel: 'GPS Speed', hasDistance: true },
  { type: 'outdoor_walking', label: 'Outdoor Walk', icon: '🚶', driverLabel: 'GPS Speed', hasDistance: true },
  { type: 'cycling', label: 'Cycling', icon: '🚴', driverLabel: 'GPS Speed', hasDistance: true },
  { type: 'trekking', label: 'Trekking / Hike', icon: '🧗', driverLabel: 'GPS + Altitude', hasDistance: true },
  { type: 'indoor_treadmill', label: 'Treadmill', icon: '🏃‍♂️', driverLabel: 'Cadence (SPM)', hasDistance: true },
  { type: 'badminton', label: 'Badminton', icon: '🏸', driverLabel: 'Movement SPM', hasDistance: false },
  { type: 'basketball', label: 'Basketball', icon: '🏀', driverLabel: 'Movement SPM', hasDistance: false },
  { type: 'hiit', label: 'Gym / HIIT', icon: '🏋️', driverLabel: 'Rep Bursts', hasDistance: false },
  { type: 'jump_rope', label: 'Jump Rope', icon: '🪢', driverLabel: 'Skips / Min', hasDistance: false }
];

export default function LiveStepTrackerPage() {
  const router = useRouter();
  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  const [notes, setNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [editedSteps, setEditedSteps] = useState<number | null>(null);
  const [editedDistance, setEditedDistance] = useState<number | null>(null);

  const {
    activityType,
    setActivityType,
    status,
    durationSeconds,
    steps,
    setSteps,
    calories,
    distanceKm,
    setDistanceKm,
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
  } = useStepTracker('running', 70);

  const selectedActivity = ACTIVITIES.find(a => a.type === activityType) || ACTIVITIES[0];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    }
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleStartTap = () => {
    requireAuth(
      () => {
        startTracking();
      },
      {
        title: 'Live Tracking Account Required',
        description: 'Sign in to record live step, calorie, and distance telemetry to your personal profile.',
        nextUrl: '/workout/live'
      }
    );
  };

  const handleFinishTap = () => {
    finishTracking();
    setEditedSteps(steps);
    setEditedDistance(distanceKm);
    setShowReviewModal(true);
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    const finalSteps = editedSteps !== null ? editedSteps : steps;
    const finalDistance = editedDistance !== null ? editedDistance : distanceKm;
    const wasEdited = finalSteps !== steps || finalDistance !== distanceKm;

    const payload = {
      activityType,
      durationSeconds,
      stepsCount: finalSteps,
      caloriesBurned: calories,
      distanceKm: selectedActivity.hasDistance ? finalDistance : null,
      avgPaceMinPerKm: selectedActivity.hasDistance ? avgPaceMinPerKm : null,
      avgCadenceSpm: currentCadence,
      elevationGainMeters: elevationGain,
      maxSpeedKmh: maxSpeed,
      telemetryData: telemetry,
      isManuallyEdited: wasEdited,
      notes,
      status: 'completed'
    };

    try {
      await api.post('/active-sessions', payload);
      clearAutosave();
      toast.success('Live workout session saved to history! 🎉');
      setShowReviewModal(false);
      resetTracker();
      router.push('/progress');
    } catch (err) {
      console.error('Failed to save session:', err);
      toast.error('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareToSocial = async () => {
    setIsSharing(true);
    const finalSteps = editedSteps !== null ? editedSteps : steps;
    const finalDistance = editedDistance !== null ? editedDistance : distanceKm;

    // Build privacy-safe summary content WITHOUT raw lat/lng telemetry coordinates
    const distanceText = selectedActivity.hasDistance && finalDistance ? ` | 📍 ${finalDistance} km` : '';
    const paceText = avgPaceMinPerKm ? ` | ⚡ ${avgPaceMinPerKm} min/km` : '';
    const shareContent = `🔥 Just completed a ${selectedActivity.label} session on FitSphere!
⏱️ Duration: ${formatTime(durationSeconds)}
👟 Steps: ${finalSteps.toLocaleString()}${distanceText}
🔥 Calories: ${calories} kcal${paceText}
#FitSphere #LiveTracker #WorkoutComplete`;

    try {
      await api.post('/social/posts', { content: shareContent });
      toast.success('Session summary shared to community feed! 🚀');
    } catch (err) {
      console.error('Failed to share session:', err);
      toast.error('Failed to share to social feed');
    } finally {
      setIsSharing(false);
    }
  };

  // Step gauge progress circle calculation (target 10,000 steps)
  const stepTarget = 10000;
  const progressPercent = Math.min(Math.round((steps / stepTarget) * 100), 100);
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 md:p-8">
      <AuthModal isOpen={modalOpen} onClose={closeModal} {...authConfig} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202938] pb-4">
          <div>
            <span className="text-xs font-bold text-[#FF5500] uppercase tracking-widest bg-[#FF5500]/10 px-3 py-1 rounded-full border border-[#FF5500]/20">
              FitSphere Live Engine
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-white mt-2">
              Real-Time Step & Sport Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Live step counting, MET-calculated calories, distance, and cadence analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {wakeLockActive && (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Screen Awake
              </div>
            )}

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                audioEnabled
                  ? 'bg-[#18202C] text-emerald-400 border-emerald-500/30'
                  : 'bg-[#18202C] text-gray-400 border-[#202938]'
              }`}
            >
              {audioEnabled ? '🔊 Audio Cues On' : '🔇 Audio Cues Off'}
            </button>

            <button
              onClick={() => setIsSimulator(!isSimulator)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isSimulator
                  ? 'bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/40'
                  : 'bg-[#18202C] text-gray-300 border-[#202938]'
              }`}
            >
              {isSimulator ? '⚡ Simulator ON' : '📱 Live Sensor Mode'}
            </button>
          </div>
        </div>

        {/* 1. Crash Recovery Banner */}
        {hasRestoredSession && restoredSessionData && (
          <div className="bg-[#FF5500]/15 border border-[#FF5500]/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span> In-Progress Session Detected!
              </h4>
              <p className="text-gray-300 text-xs mt-0.5">
                Saved state: {restoredSessionData.stepsCount} steps, {restoredSessionData.caloriesBurned} kcal ({formatTime(restoredSessionData.durationSeconds)} elapsed).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={restoreSession}
                className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                Resume Session
              </button>
              <button
                onClick={clearAutosave}
                className="bg-[#18202C] hover:bg-[#202938] text-gray-300 font-bold text-xs px-3 py-2 rounded-lg border border-[#202938] transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* 2. Background Warning Banner */}
        {status === 'paused-background' && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-amber-400 font-bold text-sm flex items-center gap-2">
                <span>⏸️</span> Session Paused (Tab Backgrounded)
              </h4>
              <p className="text-gray-300 text-xs mt-0.5">
                Browser paused motion sensors while tab was inactive to save battery.
              </p>
            </div>
            <button
              onClick={resumeTracking}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-4 py-2 rounded-lg transition"
            >
              Resume Tracking
            </button>
          </div>
        )}

        {/* 3. Permission Error Fallback Banner */}
        {status === 'permission-denied' && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-4 space-y-2">
            <h4 className="text-rose-400 font-bold text-sm flex items-center gap-2">
              <span>🚫</span> Motion & Sensor Permission Denied
            </h4>
            <p className="text-gray-300 text-xs">{permissionError}</p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  setIsSimulator(true);
                  startTracking();
                }}
                className="bg-[#FF5500] text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                Switch to Simulator Mode
              </button>
            </div>
          </div>
        )}

        {/* 4. Activity Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Activity Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {ACTIVITIES.map(item => {
              const active = activityType === item.type;
              return (
                <button
                  key={item.type}
                  disabled={status === 'tracking' || status === 'paused-manual'}
                  onClick={() => setActivityType(item.type)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition border ${
                    active
                      ? 'bg-[#18202C] border-[#FF5500] text-white shadow-lg shadow-[#FF5500]/10'
                      : 'bg-[#11161F] border-[#202938] text-gray-400 hover:text-white hover:border-gray-600'
                  } ${status === 'tracking' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-bold mt-1 line-clamp-1">{item.label}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{item.driverLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Main Live Futuristic HUD */}
        <div className="bg-[#11161F] border border-[#202938] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Active Pulse Glow */}
          {status === 'tracking' && (
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Center Circular Step Gauge */}
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#18202C"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#FF5500"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  {selectedActivity.icon} {selectedActivity.label}
                </span>
                <span className="text-4xl font-black font-heading text-white mt-0.5">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 font-medium">Steps Counted</span>
                <span className="text-[10px] text-[#FF5500] font-bold mt-1">
                  {progressPercent}% of 10,000 goal
                </span>
              </div>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Duration</span>
                <p className="text-2xl font-black text-white font-heading mt-1">
                  {formatTime(durationSeconds)}
                </p>
                <span className="text-[10px] text-gray-500">Active Elapsed Time</span>
              </div>

              <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Calories</span>
                <p className="text-2xl font-black text-[#FF5500] font-heading mt-1">
                  {calories} <span className="text-xs font-normal text-gray-400">kcal</span>
                </p>
                <span className="text-[10px] text-gray-500">Dynamic MET Burn</span>
              </div>

              {selectedActivity.hasDistance && (
                <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Distance</span>
                  <p className="text-2xl font-black text-white font-heading mt-1">
                    {distanceKm !== null ? distanceKm : '0.00'}{' '}
                    <span className="text-xs font-normal text-gray-400">km</span>
                  </p>
                  <span className="text-[10px] text-gray-500">
                    {activityType === 'indoor_treadmill' ? 'Stride Estimate' : 'Filtered GPS'}
                  </span>
                </div>
              )}

              <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Cadence</span>
                <p className="text-2xl font-black text-emerald-400 font-heading mt-1">
                  {currentCadence} <span className="text-xs font-normal text-gray-400">SPM</span>
                </p>
                <span className="text-[10px] text-gray-500">Steps / Min</span>
              </div>

              {selectedActivity.hasDistance && (
                <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Avg Pace</span>
                  <p className="text-2xl font-black text-cyan-400 font-heading mt-1">
                    {avgPaceMinPerKm ? avgPaceMinPerKm : '--'}{' '}
                    <span className="text-xs font-normal text-gray-400">min/km</span>
                  </p>
                  <span className="text-[10px] text-gray-500">Speed: {currentSpeedKmh || 0} km/h</span>
                </div>
              )}

              {/* Best-effort elevation stat (hidden gracefully if null) */}
              {elevationGain !== null && elevationGain > 0 && (
                <div className="bg-[#18202C] border border-[#202938] rounded-xl p-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Elevation</span>
                  <p className="text-2xl font-black text-purple-400 font-heading mt-1">
                    {elevationGain} <span className="text-xs font-normal text-gray-400">m</span>
                  </p>
                  <span className="text-[10px] text-gray-500">Best-Effort GPS Gain</span>
                </div>
              )}
            </div>
          </div>

          {/* HUD Action Controls */}
          <div className="mt-6 pt-6 border-t border-[#202938] flex flex-wrap items-center justify-center gap-4">
            {status === 'idle' && (
              <button
                onClick={handleStartTap}
                className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-extrabold text-lg px-8 py-3.5 rounded-xl shadow-lg shadow-[#FF5500]/25 transition transform hover:scale-105"
              >
                🚀 Start Tracking Session
              </button>
            )}

            {status === 'tracking' && (
              <>
                <button
                  onClick={pauseTracking}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-base px-6 py-3 rounded-xl transition"
                >
                  ⏸️ Pause Session
                </button>

                <button
                  onClick={handleFinishTap}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base px-6 py-3 rounded-xl shadow-lg transition"
                >
                  🏁 Finish & Save
                </button>
              </>
            )}

            {(status === 'paused-manual' || status === 'paused-background') && (
              <>
                <button
                  onClick={resumeTracking}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-extrabold text-base px-6 py-3 rounded-xl shadow-lg transition"
                >
                  ▶️ Resume Tracking
                </button>

                <button
                  onClick={handleFinishTap}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base px-6 py-3 rounded-xl transition"
                >
                  🏁 Finish & Save
                </button>

                <button
                  onClick={resetTracker}
                  className="bg-[#18202C] hover:bg-[#202938] text-gray-400 font-bold text-base px-4 py-3 rounded-xl border border-[#202938] transition"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>

        {/* 6. Real-Time Telemetry Cadence & Calorie Graph */}
        {telemetry.length > 0 && (
          <div className="bg-[#11161F] border border-[#202938] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Live Telemetry Snapshot
                </h3>
                <p className="text-gray-400 text-xs">
                  Sampled every 10 seconds. Step Cadence (SPM) vs Cumulative Calories.
                </p>
              </div>
              <span className="text-xs text-gray-500">{telemetry.length} data points</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#202938" />
                  <XAxis dataKey="timestamp" stroke="#6B7280" tickFormatter={s => `${Math.floor(s / 60)}m`} />
                  <YAxis yAxisId="left" stroke="#10B981" label={{ value: 'SPM', angle: -90, position: 'insideLeft', fill: '#10B981' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF5500" label={{ value: 'kcal', angle: 90, position: 'insideRight', fill: '#FF5500' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18202C', borderColor: '#202938', color: '#FFF' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#10B981" strokeWidth={2} dot={false} name="Steps" />
                  <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#FF5500" strokeWidth={2} dot={false} name="Calories (kcal)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 7. Post-Workout Review & Step Correction Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#11161F] border border-[#202938] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#202938] pb-3">
                <h3 className="text-xl font-extrabold text-white font-heading">
                  🎉 Session Summary & Review
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#18202C] p-3 rounded-xl border border-[#202938]">
                  <span className="text-gray-400 text-xs font-semibold">Duration</span>
                  <p className="text-lg font-bold text-white font-heading mt-0.5">
                    {formatTime(durationSeconds)}
                  </p>
                </div>

                <div className="bg-[#18202C] p-3 rounded-xl border border-[#202938]">
                  <span className="text-gray-400 text-xs font-semibold">Calories</span>
                  <p className="text-lg font-bold text-[#FF5500] font-heading mt-0.5">
                    {calories} kcal
                  </p>
                </div>
              </div>

              {/* Editable Step & Distance Fields */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-300">
                  Step Count & Metric Adjustments (Manual Correction)
                </label>

                <div>
                  <span className="text-xs text-gray-400">Total Steps:</span>
                  <input
                    type="number"
                    value={editedSteps !== null ? editedSteps : steps}
                    onChange={e => setEditedSteps(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-1 bg-[#18202C] border border-[#202938] rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                {selectedActivity.hasDistance && (
                  <div>
                    <span className="text-xs text-gray-400">Total Distance (km):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editedDistance !== null ? editedDistance : (distanceKm || 0)}
                      onChange={e => setEditedDistance(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-[#18202C] border border-[#202938] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-400">Session Notes (Optional):</span>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Great outdoor morning run, felt energetic!"
                    className="w-full mt-1 bg-[#18202C] border border-[#202938] rounded-xl px-3 py-2 text-white text-xs"
                    rows={2}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#202938] flex flex-col sm:flex-row gap-3">
                <button
                  disabled={isSaving}
                  onClick={handleSaveSession}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-2.5 rounded-xl transition"
                >
                  {isSaving ? 'Saving...' : '💾 Save to Profile'}
                </button>

                <button
                  disabled={isSharing}
                  onClick={handleShareToSocial}
                  className="bg-[#18202C] hover:bg-[#202938] text-cyan-400 font-bold text-sm px-4 py-2.5 rounded-xl border border-cyan-500/30 transition"
                >
                  {isSharing ? 'Sharing...' : '🌐 Share Summary'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
