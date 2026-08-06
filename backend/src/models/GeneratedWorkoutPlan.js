const mongoose = require('mongoose');

const generatedWorkoutPlanSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    default: 'default_tenant',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  requestHash: {
    type: String,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  activatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  title: {
    type: String,
    default: 'AI Workout Plan',
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'completed', 'archived'],
    default: 'active',
    index: true,
  },
  goal: { type: String, default: 'hypertrophy' },
  experienceLevel: { type: String, default: 'intermediate' },
  daysPerWeek: { type: Number, default: 4 },
  sessionDurationMinutes: { type: Number, default: 60 },
  equipment: { type: String, default: 'full_gym' },
  location: { type: String, default: 'gym' },
  injuries: [{ type: String }],
  focusMuscles: [{ type: String }],
  durationWeeks: { type: Number, default: 8 },
  lockedWeeks: [{ type: Number }],

  recoveryScore: { type: Number, default: 85 },

  mesocycleStructure: [{
    phaseName: String,
    startWeek: Number,
    endWeek: Number,
    focusNotes: String,
  }],

  // Canonical Schedule
  structuredSchedule: { type: Array, required: true },

  generationMetadata: {
    generationTimeMs: Number,
    validationPassed: Boolean,
    repairAttempted: Boolean,
    mappedExercises: Number,
    unmappedExercises: Number,
    safetyAdjustments: [String],
    promptTokens: { type: Number, default: 300 },
    completionTokens: { type: Number, default: 150 },
    totalTokens: { type: Number, default: 450 },
    estimatedCostUsd: { type: Number, default: 0.000045 },
    retryCount: { type: Number, default: 0 },
    dlqRetries: { type: Number, default: 0 },
    stageTimings: {
      aiGenerationMs: { type: Number, default: 0 },
      schemaValidationMs: { type: Number, default: 0 },
      exerciseMappingMs: { type: Number, default: 0 },
      safetyRulesMs: { type: Number, default: 0 },
      persistenceMs: { type: Number, default: 0 }
    },
    pipelineTrace: [{
      stage: String,
      durationMs: Number
    }]
  },

  confidence: {
    score: { type: Number, default: 90 },
    assumptions: [{ type: String }],
  },

  aiMetadata: {
    provider: { type: String, default: 'groq' },
    model: { type: String, default: 'llama-3.3-70b-versatile' },
    promptVersion: { type: String, default: 'v1.0' },
    generatedAt: { type: Date, default: Date.now },
  },

  currentVersion: { type: Number, default: 1 },
  versions: [{
    versionNumber: Number,
    title: String,
    structuredSchedule: Array,
    changedReason: String,
    authorType: { type: String, enum: ['AI', 'USER', 'SUGGESTION_ACCEPTED', 'ROLLBACK'], default: 'AI' },
    createdAt: { type: Date, default: Date.now },
  }],

  aiSuggestions: [{
    id: String,
    type: { type: String, enum: ['weight_increase', 'deload', 'exercise_swap', 'volume_change', 'checkin_adjustment'] },
    title: String,
    description: String,
    proposedChanges: Object,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  }],

  weeklyCheckIns: [{
    weekNumber: Number,
    rating: { type: String, enum: ['easy', 'good', 'difficult', 'too_hard'] },
    feedbackNotes: String,
    createdAt: { type: Date, default: Date.now },
  }],

  analytics: {
    completionRate: { type: Number, default: 0 },
    totalWorkoutsLogged: { type: Number, default: 0 },
    totalVolumeKg: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    avgRpe: { type: Number, default: 8.0 },
    consistencyScore: { type: Number, default: 95 },
    weeklyVolumePerMuscle: { type: Object, default: {} }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Production Multi-Tenant & Compound Indexes Strategy
generatedWorkoutPlanSchema.index({ tenantId: 1, userId: 1, isDeleted: 1, status: 1 });
generatedWorkoutPlanSchema.index({ tenantId: 1, userId: 1, isDeleted: 1, updatedAt: -1 });
generatedWorkoutPlanSchema.index({ requestHash: 1, isDeleted: 1 });

// Full-Text Search Index for Fast Multi-Field Search
generatedWorkoutPlanSchema.index({ title: 'text', goal: 'text', focusMuscles: 'text' });

generatedWorkoutPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GeneratedWorkoutPlan', generatedWorkoutPlanSchema);
