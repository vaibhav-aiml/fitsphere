'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Exercise {
  name: string;
  category: string;
  warmupSets: any[];
  workingSets: any[];
  targetReps: string;
  restSeconds: number;
  notes: string;
  formTips: string[];
}

interface Day {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

interface WeekSchedule {
  week: number;
  days: Day[];
}

interface WorkoutPlan {
  _id: string;
  name: string;
  type: string;
  duration: number;
  description: string;
  difficulty: string;
  weeklySchedule: WeekSchedule[];
  weeklyProgression: any[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    tips: string[];
  };
  recovery: {
    sleep: string;
    deloadWeeks: number[];
    mobilityWork: string[];
  };
}

export default function WorkoutPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [planType, setPlanType] = useState<string>('powerlifting');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchPlans(token);
  }, []);

  const fetchPlans = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/advanced-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data.plans);
      
      const powerliftingPlan = response.data.plans.find((p: WorkoutPlan) => p.type === 'powerlifting');
      if (powerliftingPlan) {
        setSelectedPlan(powerliftingPlan);
        setPlanType('powerlifting');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanByType = (type: string) => {
    const plan = plans.find(p => p.type === type);
    if (plan) {
      setSelectedPlan(plan);
      setPlanType(type);
      setSelectedWeek(1);
    }
  };

  const getWeekSchedule = (week: number) => {
    if (!selectedPlan?.weeklySchedule) return null;
    return selectedPlan.weeklySchedule.find(w => w.week === week);
  };

  const currentWeekSchedule = getWeekSchedule(selectedWeek);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading professional plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">📋 Professional Training Plans</h1>
            <p className="text-gray-400 mt-1">10-week structured programs with 1RM%, RPE, and detailed guidance</p>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Powerlifting Plan */}
          <div 
            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
              planType === 'powerlifting' 
                ? 'bg-red-600/20 border-red-600 shadow-lg scale-105' 
                : 'bg-gray-800/50 border-gray-700 hover:border-red-600 hover:scale-105'
            }`}
            onClick={() => getPlanByType('powerlifting')}
          >
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className="text-xl font-bold text-white">Powerlifting Plan</h3>
            <p className="text-gray-400 text-sm mt-2">10 weeks • Intermediate</p>
            <p className="text-gray-400 text-sm mt-1">Focus on Squat, Bench, Deadlift</p>
            <div className="mt-4 flex gap-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">Strength</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">1RM Based</span>
            </div>
          </div>

          {/* Powerbuilding Plan */}
          <div 
            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
              planType === 'powerbuilding' 
                ? 'bg-yellow-600/20 border-yellow-600 shadow-lg scale-105' 
                : 'bg-gray-800/50 border-gray-700 hover:border-yellow-600 hover:scale-105'
            }`}
            onClick={() => getPlanByType('powerbuilding')}
          >
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-bold text-white">Powerbuilding Plan</h3>
            <p className="text-gray-400 text-sm mt-2">10 weeks • Intermediate</p>
            <p className="text-gray-400 text-sm mt-1">Strength + Hypertrophy Combined</p>
            <div className="mt-4 flex gap-2">
              <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">Hybrid</span>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Aesthetics</span>
            </div>
          </div>

          {/* Bodybuilding Plan */}
          <div 
            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
              planType === 'bodybuilding' 
                ? 'bg-green-600/20 border-green-600 shadow-lg scale-105' 
                : 'bg-gray-800/50 border-gray-700 hover:border-green-600 hover:scale-105'
            }`}
            onClick={() => getPlanByType('bodybuilding')}
          >
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-bold text-white">Bodybuilding Plan</h3>
            <p className="text-gray-400 text-sm mt-2">10 weeks • All Levels</p>
            <p className="text-gray-400 text-sm mt-1">Muscle Growth & Aesthetics</p>
            <div className="mt-4 flex gap-2">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Hypertrophy</span>
              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">Volume Based</span>
            </div>
          </div>
        </div>

        {/* Selected Plan Details */}
        {selectedPlan && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPlan.name}</h2>
                <p className="text-gray-400 mt-1">{selectedPlan.description}</p>
              </div>
              <button
                onClick={() => toast('PDF download coming soon!', { icon: '📄' })}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                📄 Download Week {selectedWeek} as PDF
              </button>
            </div>

            {/* Week Selector */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 text-sm font-medium">Select Training Week</label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: selectedPlan.duration || 10 }, (_, i) => i + 1).map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedWeek === week
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Week {week}
                    {selectedPlan.recovery?.deloadWeeks?.includes(week) && (
                      <span className="ml-1 text-xs text-yellow-400">(Deload)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Intensity Guide */}
            {selectedPlan.weeklyProgression && selectedPlan.weeklyProgression[selectedWeek - 1] && (
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700 mb-6">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Week {selectedWeek} Focus</h4>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-300">
                    🎯 {selectedPlan.weeklyProgression[selectedWeek - 1].focus}
                  </span>
                  <span className="text-gray-300">
                    📈 Intensity: +{selectedPlan.weeklyProgression[selectedWeek - 1].intensityIncrease}%
                  </span>
                  <span className="text-gray-300">
                    📊 Volume: {selectedPlan.weeklyProgression[selectedWeek - 1].volumeIncrease > 0 ? '+' : ''}
                    {selectedPlan.weeklyProgression[selectedWeek - 1].volumeIncrease}%
                  </span>
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            {currentWeekSchedule && currentWeekSchedule.days ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Week {selectedWeek} Training Schedule</h3>
                
                {currentWeekSchedule.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-bold text-blue-400 mb-3">
                      Day {day.dayNumber}: {day.dayName} - {day.focus}
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="p-3 text-left text-gray-300">Exercise</th>
                            <th className="p-3 text-left text-gray-300">Warmup Sets</th>
                            <th className="p-3 text-left text-gray-300">Working Sets</th>
                            <th className="p-3 text-left text-gray-300">RPE</th>
                            <th className="p-3 text-left text-gray-300">Rest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.exercises.map((exercise, exIndex) => (
                            <tr key={exIndex} className="border-b border-gray-800">
                              <td className="p-3">
                                <div className="text-white font-semibold">{exercise.name}</div>
                                <div className="text-gray-500 text-xs mt-1 capitalize">{exercise.category}</div>
                              </td>
                              <td className="p-3 text-gray-300">
                                {exercise.warmupSets && exercise.warmupSets.length > 0 ? (
                                  exercise.warmupSets.map((set, idx) => (
                                    <div key={idx}>
                                      {set.reps} reps @ {set.percentage}%
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-500">None</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-300">
                                {exercise.workingSets.map((set, idx) => (
                                  <div key={idx}>
                                    {set.reps} reps @ {set.percentage}%
                                  </div>
                                ))}
                              </td>
                              <td className="p-3">
                                <span className="text-yellow-400">
                                  RPE {exercise.workingSets[0]?.rpe || 'N/A'}
                                </span>
                              </td>
                              <td className="p-3 text-gray-300">{exercise.restSeconds}s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Exercise Notes */}
                    {day.exercises.some(ex => ex.notes) && (
                      <div className="mt-3 p-3 bg-yellow-900/30 rounded-lg">
                        <p className="text-yellow-400 text-xs font-semibold mb-1">💡 Exercise Notes:</p>
                        {day.exercises.map((exercise, idx) => (
                          exercise.notes && (
                            <p key={idx} className="text-gray-300 text-xs">
                              <span className="font-semibold">{exercise.name}:</span> {exercise.notes}
                            </p>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-900/30 p-8 rounded-xl text-center border border-yellow-700">
                <p className="text-yellow-400">Detailed weekly schedule coming soon for this plan!</p>
                <p className="text-gray-400 text-sm mt-2">Check back for full workout details</p>
              </div>
            )}

            {/* Nutrition & Recovery */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                <h4 className="text-lg font-bold text-green-400 mb-3">🥗 Nutrition Guidelines</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><span className="text-green-400">•</span> Calories: {selectedPlan.nutrition?.calories || 'Maintenance + 300-500'}</li>
                  <li><span className="text-green-400">•</span> Protein: {selectedPlan.nutrition?.protein || '2.2g per kg'}</li>
                  <li><span className="text-green-400">•</span> Carbs: {selectedPlan.nutrition?.carbs || '4-6g per kg'}</li>
                  <li><span className="text-green-400">•</span> Fats: {selectedPlan.nutrition?.fats || '0.8-1g per kg'}</li>
                  {selectedPlan.nutrition?.tips && (
                    <li className="mt-2 pt-2 border-t border-green-800">
                      <span className="text-green-400">💡</span> {selectedPlan.nutrition.tips[0]}
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
                <h4 className="text-lg font-bold text-purple-400 mb-3">😴 Recovery Protocol</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><span className="text-purple-400">•</span> Sleep: {selectedPlan.recovery?.sleep || '7-9 hours minimum'}</li>
                  <li><span className="text-purple-400">•</span> Deload Weeks: Week {selectedPlan.recovery?.deloadWeeks?.join(', ') || '6'}</li>
                  <li><span className="text-purple-400">•</span> Mobility: {selectedPlan.recovery?.mobilityWork?.[0] || '10 min daily'}</li>
                  <li><span className="text-purple-400">•</span> Active Recovery: Light cardio on rest days</li>
                </ul>
              </div>
            </div>

            {/* RPE Scale Reference */}
            <div className="mt-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-3">🎯 RPE Scale Reference (Rate of Perceived Exertion)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="text-center p-2 bg-gray-800 rounded">
                  <span className="text-green-400 font-bold">RPE 6-7</span>
                  <div className="text-gray-400 text-xs">Light to Moderate</div>
                  <div className="text-gray-500 text-xs mt-1">3-4 reps left</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <span className="text-yellow-400 font-bold">RPE 8</span>
                  <div className="text-gray-400 text-xs">Challenging</div>
                  <div className="text-gray-500 text-xs mt-1">2 reps left</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <span className="text-orange-400 font-bold">RPE 9</span>
                  <div className="text-gray-400 text-xs">Hard</div>
                  <div className="text-gray-500 text-xs mt-1">1 rep left</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <span className="text-red-400 font-bold">RPE 10</span>
                  <div className="text-gray-400 text-xs">Max Effort</div>
                  <div className="text-gray-500 text-xs mt-1">0 reps left</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <span className="text-blue-400 font-bold">1RM%</span>
                  <div className="text-gray-400 text-xs">% of Max</div>
                  <div className="text-gray-500 text-xs mt-1">Calculate 1RM</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}