/**
 * Deterministically renders a structured workout schedule into Markdown format (.md).
 */
function renderMarkdownFromSchedule(title, mesocycle, weeks, confidence) {
  let md = `# 🏋️ ${title || 'AI Workout Plan'}\n\n`;

  if (confidence && confidence.score) {
    md += `> 🎯 **AI Confidence Score**: ${confidence.score}%  \n`;
    if (confidence.assumptions && confidence.assumptions.length > 0) {
      md += `> **Assumptions**: ${confidence.assumptions.join(', ')}\n\n`;
    }
  }

  if (mesocycle && mesocycle.length > 0) {
    md += `## 📅 Periodization & Mesocycle Blocks\n\n`;
    md += `| Phase | Weeks | Focus & Guidelines |\n`;
    md += `|---|---|---|\n`;
    mesocycle.forEach(m => {
      const wStr = Array.isArray(m.weeks) ? m.weeks.join(', ') : m.weeks;
      md += `| **${m.phase}** | Weeks ${wStr} | ${m.focus || 'Progressive Overload'} |\n`;
    });
    md += `\n---\n\n`;
  }

  md += `## 📋 Weekly Workout Routine\n\n`;

  if (Array.isArray(weeks)) {
    weeks.forEach(day => {
      md += `### ${day.dayName || `Day ${day.dayNumber}`}\n`;
      if (day.focus) md += `*Focus: ${day.focus}*\n\n`;

      md += `| Exercise | Sets | Reps | RPE / RIR | Rest | Notes |\n`;
      md += `|---|---|---|---|---|---|\n`;

      if (Array.isArray(day.exercises)) {
        day.exercises.forEach(ex => {
          md += `| **${ex.exerciseName}** | ${ex.sets} | ${ex.reps} | ${ex.rpeOrRir || '2 RIR'} | ${ex.restSeconds || 90}s | ${ex.notes || '-'} |\n`;
        });
      }
      md += `\n`;
    });
  }

  md += `\n## 🛡️ Progressive Overload & Safety Notes\n`;
  md += `- **Progression Rule**: When you hit the upper rep target on all sets, add 2.5kg next session.\n`;
  md += `- **Deload**: If you fail reps 2 workouts in a row, take a 1-week deload with 50% volume.\n`;
  md += `- **Safety**: Never push through joint pain. Stay hydrated and get 7-9 hours sleep.\n`;

  return md;
}

/**
 * Deterministically renders a structured workout schedule into CSV format (.csv).
 */
function renderCSVFromSchedule(title, weeks) {
  const rows = [['Day Name', 'Focus', 'Exercise Name', 'Sets', 'Reps', 'RPE/RIR', 'Rest (sec)', 'Notes']];

  if (Array.isArray(weeks)) {
    weeks.forEach(day => {
      if (Array.isArray(day.exercises)) {
        day.exercises.forEach(ex => {
          rows.push([
            `"${day.dayName || `Day ${day.dayNumber}`}"`,
            `"${day.focus || ''}"`,
            `"${ex.exerciseName}"`,
            ex.sets,
            `"${ex.reps}"`,
            `"${ex.rpeOrRir || '2 RIR'}"`,
            ex.restSeconds || 90,
            `"${ex.notes || ''}"`
          ]);
        });
      }
    });
  }

  return rows.map(r => r.join(',')).join('\n');
}

module.exports = {
  renderMarkdownFromSchedule,
  renderCSVFromSchedule,
};
