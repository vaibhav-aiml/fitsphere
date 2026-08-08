export type ActivityType =
  | 'running'
  | 'outdoor_walking'
  | 'cycling'
  | 'trekking'
  | 'indoor_treadmill'
  | 'badminton'
  | 'basketball'
  | 'hiit'
  | 'jump_rope';

export interface METCalculationInput {
  activityType: ActivityType;
  speedKmh?: number | null;
  cadenceSpm?: number | null;
  weightKg?: number;
  altitudeMeters?: number | null;
  inclineGradePercent?: number | null;
}

export interface METCalculationResult {
  met: number;
  caloriesPerSecond: number;
  isAltitudeEstimated: boolean;
  driverType: 'speed' | 'cadence' | 'combined';
  distanceSource: 'gps' | 'treadmill_stride' | null;
}

/**
 * Linear interpolation helper between (x0, y0) and (x1, y1)
 */
function interpolate(x: number, x0: number, y0: number, x1: number, y1: number): number {
  if (x <= x0) return y0;
  if (x >= x1) return y1;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

/**
 * Calculates dynamic MET and calorie burn rate per second for a given activity state
 */
export function calculateDynamicMET(input: METCalculationInput): METCalculationResult {
  const {
    activityType,
    speedKmh = 0,
    cadenceSpm = 0,
    weightKg = 70, // default 70kg user if profile un-set
    altitudeMeters = null,
    inclineGradePercent = null
  } = input;

  const validSpeed = speedKmh && speedKmh > 0 ? speedKmh : 0;
  const validCadence = cadenceSpm && cadenceSpm > 0 ? cadenceSpm : 0;
  const validWeight = weightKg > 0 ? weightKg : 70;

  let met = 4.0;
  let isAltitudeEstimated = false;
  let driverType: 'speed' | 'cadence' | 'combined' = 'cadence';
  let distanceSource: 'gps' | 'treadmill_stride' | null = null;

  switch (activityType) {
    case 'running': {
      driverType = 'speed';
      distanceSource = 'gps';
      // Breakpoints: <7 = 6.0, 10 = 9.8, >14 = 13.0
      if (validSpeed <= 7) {
        met = 6.0;
      } else if (validSpeed <= 10) {
        met = interpolate(validSpeed, 7, 6.0, 10, 9.8);
      } else {
        met = interpolate(validSpeed, 10, 9.8, 14, 13.0);
      }
      break;
    }

    case 'outdoor_walking': {
      driverType = 'speed';
      distanceSource = 'gps';
      // Breakpoints: <4 = 3.3, 6 = 4.5 (+ incline modifier)
      if (validSpeed <= 4) {
        met = 3.3;
      } else {
        met = interpolate(validSpeed, 4, 3.3, 6, 4.5);
      }

      if (altitudeMeters === null && (inclineGradePercent === null || inclineGradePercent === undefined)) {
        isAltitudeEstimated = true;
      } else if (inclineGradePercent && inclineGradePercent > 0) {
        // Additional MET modifier for climbing slopes
        const inclineBonus = Math.min(inclineGradePercent * 0.15, 3.5);
        met += inclineBonus;
      }
      break;
    }

    case 'cycling': {
      driverType = 'speed';
      distanceSource = 'gps';
      // Breakpoints: <15 = 5.8, 20 = 8.0, >25 = 10.0
      if (validSpeed <= 15) {
        met = 5.8;
      } else if (validSpeed <= 20) {
        met = interpolate(validSpeed, 15, 5.8, 20, 8.0);
      } else {
        met = interpolate(validSpeed, 20, 8.0, 25, 10.0);
      }
      break;
    }

    case 'trekking': {
      driverType = 'combined';
      distanceSource = 'gps';
      // Base 7.5 MET; >110 SPM = 8.8 MET; flat base fallback if altitude is null
      let baseMet = 7.5;
      if (validCadence > 110) {
        baseMet = interpolate(validCadence, 110, 7.5, 150, 8.8);
      }

      if (altitudeMeters === null) {
        isAltitudeEstimated = true;
        met = baseMet; // Fall back to flat base explicitly without error
      } else if (inclineGradePercent && inclineGradePercent > 0) {
        const inclineBonus = Math.min(inclineGradePercent * 0.2, 4.0);
        met = baseMet + inclineBonus;
      } else {
        met = baseMet;
      }
      break;
    }

    case 'indoor_treadmill': {
      driverType = 'cadence';
      distanceSource = 'treadmill_stride';
      // Breakpoints: <100 = 3.5, 130 = 5.0, >160 = 8.0
      if (validCadence <= 100) {
        met = 3.5;
      } else if (validCadence <= 130) {
        met = interpolate(validCadence, 100, 3.5, 130, 5.0);
      } else {
        met = interpolate(validCadence, 130, 5.0, 160, 8.0);
      }
      break;
    }

    case 'jump_rope': {
      driverType = 'cadence';
      distanceSource = null;
      // Breakpoints: <100 = 8.8, 120 = 11.0, >150 = 12.5
      if (validCadence <= 100) {
        met = 8.8;
      } else if (validCadence <= 120) {
        met = interpolate(validCadence, 100, 8.8, 120, 11.0);
      } else {
        met = interpolate(validCadence, 120, 11.0, 150, 12.5);
      }
      break;
    }

    case 'badminton': {
      driverType = 'cadence';
      distanceSource = null;
      // Base 5.5, <80 SPM = 4.5, >130 SPM = 7.0
      if (validCadence <= 80) {
        met = 4.5;
      } else if (validCadence <= 130) {
        met = interpolate(validCadence, 80, 4.5, 130, 7.0);
      } else {
        met = 7.0;
      }
      break;
    }

    case 'basketball': {
      driverType = 'cadence';
      distanceSource = null;
      // Base 6.5, <80 SPM = 5.5, >140 SPM = 8.5
      if (validCadence <= 80) {
        met = 5.5;
      } else if (validCadence <= 140) {
        met = interpolate(validCadence, 80, 5.5, 140, 8.5);
      } else {
        met = 8.5;
      }
      break;
    }

    case 'hiit': {
      driverType = 'cadence';
      distanceSource = null;
      // Base 7.0, <50 SPM = 4.5, >120 SPM = 9.0
      if (validCadence <= 50) {
        met = 4.5;
      } else if (validCadence <= 120) {
        met = interpolate(validCadence, 50, 4.5, 120, 9.0);
      } else {
        met = 9.0;
      }
      break;
    }

    default: {
      met = 5.0;
    }
  }

  // Formula: calories/sec = (MET * 3.5 * weightKg) / (200 * 60)
  const caloriesPerSecond = (met * 3.5 * validWeight) / (200 * 60);

  return {
    met: Math.round(met * 100) / 100,
    caloriesPerSecond,
    isAltitudeEstimated,
    driverType,
    distanceSource
  };
}

/**
 * Derives distance in kilometers for indoor treadmill based on steps and stride length (default 0.76m)
 */
export function calculateTreadmillDistanceKm(steps: number, strideLengthMeters = 0.76): number {
  if (steps <= 0) return 0;
  return Math.round((steps * strideLengthMeters) / 1000 * 1000) / 1000;
}
