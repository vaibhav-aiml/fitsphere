const WorkoutLog = require('../models/WorkoutLog');

const getAdvice = async (req, res) => {
  const { question } = req.body;
  const recentWorkouts = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(10);
  let recentVolume = 0;
  recentWorkouts.forEach(w => { recentVolume += w.weight * w.reps * w.sets; });
  
  let response = "💪 I'm your AI Coach! Ask me about plateau, form, weight progression, or recovery!";
  const q = (question || '').toLowerCase();
  
  if (q.includes('plateau')) response = "🎯 PLATEAU HELP: Change rep ranges (15-20 reps), add variations, take a deload week (50% weight), increase protein to 2.2g/kg, get 7-8 hours sleep.";
  else if (q.includes('form')) response = "🧠 FORM TIPS: Control the negative (2-3 sec), focus on mind-muscle connection, keep core braced, use full range of motion.";
  else if (q.includes('weight')) response = "⚡ WEIGHT PROGRESSION: Add 2.5-5kg when you hit all target reps for 2 sessions. If you miss reps, stay at same weight.";
  else if (q.includes('recovery')) response = "😴 RECOVERY TIPS: Sleep 7-9 hours, eat protein within 30 min post-workout, drink 3-4L water daily, take 1-2 rest days per week.";
  else if (q.includes('motivation')) response = "🔥 STAY MOTIVATED: Set small weekly goals, share workouts on Social Feed, celebrate small wins, find a workout buddy!";
  
  res.json({ success: true, response, userContext: { recentWorkouts: recentWorkouts.length, recentVolume } });
};

const getFormFeedback = async (req, res) => {
  const { notes, exerciseName } = req.body;
  let feedback = "✅ Good form awareness! Keep focusing on quality reps.";
  let tips = ["Watch demo videos", "Control the eccentric", "Breathe properly"];
  
  const n = (notes || '').toLowerCase();
  if (n.includes('back') && n.includes('pain')) { feedback = "⚠️ Lower Back Pain Detected!"; tips = ["Brace your core", "Keep spine neutral", "Reduce weight"]; }
  else if (n.includes('knee') && n.includes('pain')) { feedback = "⚠️ Knee Pain Detected!"; tips = ["Knees track over toes", "Don't let knees cave in", "Try box squats"]; }
  else if (n.includes('shoulder') && n.includes('pain')) { feedback = "⚠️ Shoulder Pain Detected!"; tips = ["Keep elbows at 45°", "Add face pulls", "Strengthen rear delts"]; }
  
  res.json({ success: true, feedback, tips, exercise: exerciseName });
};

const detectPlateau = async (req, res) => {
  const workouts = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(20);
  if (workouts.length < 3) {
    return res.json({ success: true, plateauDetected: false, message: `📊 Not enough data yet! (${workouts.length} workouts logged)`, suggestions: ["Log more workouts", "Track consistently"] });
  }
  
  const exerciseGroups = {};
  workouts.forEach(w => {
    if (!exerciseGroups[w.exerciseName]) exerciseGroups[w.exerciseName] = [];
    exerciseGroups[w.exerciseName].push({ date: w.date, oneRM: w.weight * (1 + w.reps / 30) });
  });
  
  let plateauDetected = false, message = "", suggestions = [];
  for (const [exName, exWorkouts] of Object.entries(exerciseGroups)) {
    if (exWorkouts.length >= 3) {
      const sorted = exWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const last3 = sorted.slice(-3);
      const first3 = sorted.slice(0, 3);
      const avgLast3 = last3.reduce((s, w) => s + w.oneRM, 0) / last3.length;
      const avgFirst3 = first3.reduce((s, w) => s + w.oneRM, 0) / first3.length;
      const improvement = ((avgLast3 - avgFirst3) / avgFirst3) * 100;
      
      if (improvement < 2 && improvement > -2) {
        plateauDetected = true;
        message = `⚠️ PLATEAU DETECTED in ${exName}!`;
        suggestions = ["Change rep ranges", "Add exercise variations", "Take a deload week", "Increase calories by 200-300"];
        break;
      } else if (improvement < 5) {
        message = `📈 Slow progress in ${exName} (${improvement.toFixed(1)}% improvement)`;
        suggestions = ["Add 2.5kg to sets", "Get 1-2 more reps", "Ensure proper recovery"];
      } else {
        message = `🎉 Great progress in ${exName}! ${improvement.toFixed(1)}% improvement!`;
        suggestions = ["Continue progressive overload", "You're on the right track!"];
      }
    }
  }
  
  if (!plateauDetected && !message) message = "📊 No plateaus detected! Keep up the great work! 💪";
  res.json({ success: true, plateauDetected, message, suggestions });
};

const getWeightRecommendation = async (req, res) => {
  const { exerciseName } = req.query;
  const workouts = await WorkoutLog.find({ userId: req.user._id, exerciseName }).sort({ date: -1 }).limit(5);
  
  if (workouts.length === 0) {
    return res.json({ success: true, recommendedWeight: null, message: "No previous workouts. Start with light weight!" });
  }
  
  const lastWorkout = workouts[0];
  let recommendedWeight = lastWorkout.weight;
  let adjustmentReason = "";
  
  if (lastWorkout.reps >= 12) { recommendedWeight = Math.round(lastWorkout.weight * 1.05); adjustmentReason = "You crushed it! Time to increase weight."; }
  else if (lastWorkout.reps <= 6) { recommendedWeight = lastWorkout.weight; adjustmentReason = "Stay at this weight and focus on form."; }
  else { recommendedWeight = lastWorkout.weight; adjustmentReason = "Try to get more reps before increasing weight."; }
  
  res.json({ success: true, exercise: exerciseName, lastWorkout: { weight: lastWorkout.weight, reps: lastWorkout.reps }, recommendedWeight, adjustmentReason });
};

module.exports = {
  getAdvice,
  getFormFeedback,
  detectPlateau,
  getWeightRecommendation
};
