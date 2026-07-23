'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

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

export default function AdvancedPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [planType, setPlanType] = useState<string>('powerlifting');

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/advanced-plans');
      setPlans(response.data.plans || []);
      
      const powerliftingPlan = (response.data.plans || []).find((p: WorkoutPlan) => p.type === 'powerlifting');
      if (powerliftingPlan) {
        setSelectedPlan(powerliftingPlan);
        setPlanType('powerlifting');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (planName: string) => {
    requireAuth(() => {
      toast.success(`Enrolled in ${planName}! 🎉`);
    }, {
      title: 'Enrollment Requires Account',
      description: 'Create an account to save progress and track weekly workouts.',
      nextUrl: '/plans'
    });
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
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Training Programs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition mb-2 block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              📋 ATHLETIC TRAINING PROGRAMS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Structured multi-week programs with 1RM percentages, RPE targets, and weekly progression
            </p>
          </div>
        </div>

        {/* Plan Type Selector Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Powerlifting Card */}
          <div 
            className={`p-6 rounded-3xl border transition-all cursor-pointer neu-raised ${
              planType === 'powerlifting' 
                ? 'bg-[#18202C] border-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.25)]' 
                : 'bg-[#11161F] border-[#202938] hover:border-[#FF5500]/50'
            }`}
            onClick={() => getPlanByType('powerlifting')}
          >
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className="text-xl font-black text-white font-heading">Powerlifting Plan</h3>
            <p className="text-gray-400 text-xs mt-1">10 Weeks • Intermediate to Advanced</p>

            <div className="mt-4 flex gap-2">
              <span className="bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 text-[10px] font-black uppercase font-heading px-2.5 py-1 rounded-full">
                Max Strength
              </span>
              <span className="bg-[#18202C] text-gray-300 border border-[#202938] text-[10px] font-bold px-2.5 py-1 rounded-full">
                1RM % Based
              </span>
            </div>
          </div>

          {/* Powerbuilding Card */}
          <div 
            className={`p-6 rounded-3xl border transition-all cursor-pointer neu-raised ${
              planType === 'powerbuilding' 
                ? 'bg-[#18202C] border-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.25)]' 
                : 'bg-[#11161F] border-[#202938] hover:border-[#FF5500]/50'
            }`}
            onClick={() => getPlanByType('powerbuilding')}
          >
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-black text-white font-heading">Powerbuilding Plan</h3>
            <p className="text-gray-400 text-xs mt-1">10 Weeks • Intermediate</p>

            <div className="mt-4 flex gap-2">
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase font-heading px-2.5 py-1 rounded-full">
                Strength + Hypertrophy
              </span>
            </div>
          </div>

          {/* Bodybuilding Card */}
          <div 
            className={`p-6 rounded-3xl border transition-all cursor-pointer neu-raised ${
              planType === 'bodybuilding' 
                ? 'bg-[#18202C] border-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.25)]' 
                : 'bg-[#11161F] border-[#202938] hover:border-[#FF5500]/50'
            }`}
            onClick={() => getPlanByType('bodybuilding')}
          >
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-black text-white font-heading">Bodybuilding Plan</h3>
            <p className="text-gray-400 text-xs mt-1">10 Weeks • All Fitness Levels</p>

            <div className="mt-4 flex gap-2">
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-heading px-2.5 py-1 rounded-full">
                Hypertrophy
              </span>
            </div>
          </div>

        </div>

        {/* Selected Plan Details Container */}
        {selectedPlan && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#202938] pb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">{selectedPlan.name}</h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{selectedPlan.description}</p>
              </div>

              <button
                onClick={() => handleEnrollClick(selectedPlan.name)}
                className="px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                + Enroll in Routine
              </button>
            </div>

            {/* Week Selector Chips */}
            <div>
              <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-3">
                Select Training Week (1-10)
              </label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: selectedPlan.duration || 10 }, (_, i) => i + 1).map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-heading transition ${
                      selectedWeek === week
                        ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.3)]'
                        : 'bg-[#0D1117] text-gray-400 hover:text-white border border-[#202938] neu-inset'
                    }`}
                  >
                    Week {week}
                    {selectedPlan.recovery?.deloadWeeks?.includes(week) && (
                      <span className="ml-1 text-[10px] text-amber-400">(Deload)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Schedule Table */}
            {currentWeekSchedule && currentWeekSchedule.days ? (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-white font-heading">WEEK {selectedWeek} SCHEDULE</h3>
                
                {currentWeekSchedule.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-[#18202C] p-5 rounded-2xl border border-[#202938]">
                    <h4 className="text-base font-black text-[#FF5500] font-heading mb-3">
                      Day {day.dayNumber}: {day.dayName} — {day.focus}
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#0D1117] text-gray-400 uppercase font-heading">
                          <tr>
                            <th className="p-3 rounded-l-xl">Exercise</th>
                            <th className="p-3">Warmup Sets</th>
                            <th className="p-3">Working Sets</th>
                            <th className="p-3">RPE</th>
                            <th className="p-3 rounded-r-xl">Rest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#202938]">
                          {day.exercises.map((exercise, exIndex) => (
                            <tr key={exIndex} className="hover:bg-[#11161F]/50 transition">
                              <td className="p-3">
                                <span className="text-white font-bold block">{exercise.name}</span>
                                <span className="text-gray-500 text-[10px] capitalize">{exercise.category}</span>
                              </td>
                              <td className="p-3 text-gray-300">
                                {exercise.warmupSets && exercise.warmupSets.length > 0 ? (
                                  exercise.warmupSets.map((set, idx) => (
                                    <div key={idx}>{set.reps} reps @ {set.percentage}%</div>
                                  ))
                                ) : (
                                  <span className="text-gray-500">None</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-300 font-semibold">
                                {exercise.workingSets.map((set, idx) => (
                                  <div key={idx}>{set.reps} reps @ {set.percentage}%</div>
                                ))}
                              </td>
                              <td className="p-3">
                                <span className="text-amber-400 font-bold">RPE {exercise.workingSets[0]?.rpe || 'N/A'}</span>
                              </td>
                              <td className="p-3 text-gray-300">{exercise.restSeconds}s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0D1117] p-8 rounded-2xl text-center border border-[#202938]">
                <p className="text-gray-400 font-semibold">Weekly schedule view for Week {selectedWeek}.</p>
              </div>
            )}

          </div>
        )}

      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={authConfig.title}
        description={authConfig.description}
        nextUrl={authConfig.nextUrl}
      />
    </div>
  );
}