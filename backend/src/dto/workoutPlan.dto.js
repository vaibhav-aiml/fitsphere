/**
 * DTO Transformer: Converts raw MongoDB document to client-safe Plan DTO
 */
function toPlanDTO(planDoc, derivedMarkdown = '') {
  if (!planDoc) return null;
  const raw = typeof planDoc.toObject === 'function' ? planDoc.toObject() : planDoc;

  const idStr = raw._id ? raw._id.toString() : (raw.id || '');

  return {
    id: idStr,
    title: raw.title,
    status: raw.status,
    goal: raw.goal,
    experienceLevel: raw.experienceLevel,
    daysPerWeek: raw.daysPerWeek,
    sessionDurationMinutes: raw.sessionDurationMinutes,
    equipment: raw.equipment,
    location: raw.location,
    injuries: raw.injuries || [],
    focusMuscles: raw.focusMuscles || [],
    durationWeeks: raw.durationWeeks,
    recoveryScore: raw.recoveryScore || 85,
    mesocycleStructure: raw.mesocycleStructure || [],
    structuredSchedule: raw.structuredSchedule || [],
    content: derivedMarkdown || raw.content || '',
    confidence: raw.confidence || { score: 90, assumptions: [] },
    currentVersion: raw.currentVersion || 1,
    versions: (raw.versions || []).map(v => ({
      versionNumber: v.versionNumber,
      title: v.title,
      changedReason: v.changedReason,
      authorType: v.authorType,
      createdAt: v.createdAt
    })),
    aiSuggestions: (raw.aiSuggestions || []).map(s => ({
      id: s.id,
      type: s.type,
      title: s.title,
      description: s.description,
      status: s.status,
      createdAt: s.createdAt
    })),
    analytics: raw.analytics || {},
    generationMetadata: {
      generationTimeMs: raw.generationMetadata?.generationTimeMs || 0,
      validationPassed: raw.generationMetadata?.validationPassed ?? true,
      mappedExercises: raw.generationMetadata?.mappedExercises || 0,
      totalTokens: raw.generationMetadata?.totalTokens || 450,
      estimatedCostUsd: raw.generationMetadata?.estimatedCostUsd || 0.000045,
      stageTimings: raw.generationMetadata?.stageTimings || {},
      pipelineTrace: raw.generationMetadata?.pipelineTrace || []
    },
    activatedAt: raw.activatedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * DTO Transformer for Paginated List Views
 */
function toPlanSummaryDTO(planDoc) {
  if (!planDoc) return null;
  const raw = typeof planDoc.toObject === 'function' ? planDoc.toObject() : planDoc;

  const idStr = raw._id ? raw._id.toString() : (raw.id || '');

  return {
    id: idStr,
    title: raw.title,
    status: raw.status,
    goal: raw.goal,
    daysPerWeek: raw.daysPerWeek,
    durationWeeks: raw.durationWeeks,
    recoveryScore: raw.recoveryScore || 85,
    currentVersion: raw.currentVersion || 1,
    updatedAt: raw.updatedAt
  };
}

module.exports = {
  toPlanDTO,
  toPlanSummaryDTO,
};
