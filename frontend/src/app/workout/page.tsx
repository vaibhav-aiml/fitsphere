'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function WorkoutLogger() {
  const router = useRouter();
  const [currentWorkout, setCurrentWorkout] = useState<any[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    exerciseName: '',
    weight: '',
    reps: '',
    sets: '',
    notes: ''
  });

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchWorkoutHistory();
    }
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const response = await api.get('/workout-logs');
      const uniqueExercises = Array.from(new Set((response.data.logs || []).map((log: any) => log.exerciseName))) as string[];
      setExercises(uniqueExercises);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const calculate1RM = (weight: number, reps: number) => {
    return Math.round(weight * (1 + reps / 30));
  };

  const handleWeightChange = (weight: number, reps: number) => {
    if (weight && reps && reps > 0) {
      const rm = calculate1RM(weight, reps);
      setOneRepMax(rm);
    } else {
      setOneRepMax(null);
    }
  };

  const handleAddExercise = async () => {
    if (!formData.exerciseName || !formData.weight || !formData.reps || !formData.sets) {
      toast.error('Please fill all required fields');
      return;
    }

    requireAuth(async () => {
      try {
        await api.post('/workout-logs', formData);
        
        setCurrentWorkout([...currentWorkout, { ...formData, id: Date.now() }]);
        toast.success(`${formData.exerciseName} added to workout!`);
        
        setFormData({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
        setShowAddExercise(false);
        setOneRepMax(null);
      } catch (error) {
        toast.error('Failed to add exercise');
      }
    }, {
      title: 'Workout Logging Requires Account',
      description: 'Sign in to record your sets, reps, and weights in your personal history.',
      nextUrl: '/workout'
    });
  };

  const handleFinishWorkout = () => {
    if (currentWorkout.length === 0) {
      toast.error('No exercises logged in this workout');
      return;
    }
    
    toast.success(`Workout completed! ${currentWorkout.length} exercises logged`);
    setCurrentWorkout([]);
    setTimeout(() => {
      router.push('/progress');
    }, 1500);
  };

  const handleShareWorkout = () => {
    if (currentWorkout.length === 0) {
      toast.error('No exercises to share');
      return;
    }
    
    const workoutSummary = currentWorkout.map(ex => 
      `${ex.exerciseName}: ${ex.weight}kg × ${ex.reps} reps × ${ex.sets} sets`
    ).join('\n');
    
    const shareText = `💪 Just finished my workout at FitSphere!\n\n${workoutSummary}\n\n#FitSphere #Fitness #WorkoutComplete`;
    
    navigator.clipboard.writeText(shareText);
    toast.success('Workout summary copied! Share on social media 📱');
  };

  const removeExercise = (index: number) => {
    const updated = currentWorkout.filter((_, i) => i !== index);
    setCurrentWorkout(updated);
    toast.success('Exercise removed');
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
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
              🏋️‍♂️ LIVE WORKOUT LOGGER
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Record active working sets, load percentages, and progressive overload benchmarks
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShareWorkout}
              className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition"
            >
              📱 Share Summary
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              View Progress →
            </button>
          </div>
        </div>

        {/* Current Workout Summary */}
        {currentWorkout.length > 0 && (
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#FF5500]/40 neu-raised space-y-4">
            <h2 className="text-xl font-black text-white font-heading">ACTIVE SESSION SUMMARY</h2>
            <div className="space-y-2">
              {currentWorkout.map((exercise, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#0D1117] p-4 rounded-2xl border border-[#202938]">
                  <div>
                    <span className="text-white font-bold font-heading block">{exercise.exerciseName}</span>
                    <span className="text-gray-400 text-xs">
                      {exercise.sets} Sets × {exercise.reps} Reps @ <span className="text-[#FF5500] font-bold">{exercise.weight} KG</span>
                    </span>
                  </div>
                  <button
                    onClick={() => removeExercise(idx)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleFinishWorkout}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold font-heading uppercase py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Complete Workout ({currentWorkout.length} Movements)
              </button>
            </div>
          </div>
        )}

        {/* Add Exercise Form View */}
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white py-4 rounded-3xl font-black font-heading text-lg tracking-wider uppercase transition shadow-[0_0_20px_rgba(255,85,0,0.35)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            + Add Exercise Movement
          </button>
        ) : (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6">
            <h2 className="text-2xl font-black text-white font-heading">ADD MOVEMENT TO SESSION</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  list="exercises"
                  className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  placeholder="e.g., Barbell Bench Press, Incline Dumbbell Press"
                  value={formData.exerciseName}
                  onChange={(e) => setFormData({...formData, exerciseName: e.target.value})}
                />
                <datalist id="exercises">
                  {exercises.map((ex, idx) => (
                    <option key={idx} value={ex} />
                  ))}
                  <option value="Bench Press" />
                  <option value="Squat" />
                  <option value="Deadlift" />
                  <option value="Overhead Press" />
                  <option value="Barbell Row" />
                  <option value="Pull Up" />
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                    placeholder="60"
                    value={formData.weight}
                    onChange={(e) => {
                      const weight = parseFloat(e.target.value);
                      setFormData({...formData, weight: e.target.value});
                      handleWeightChange(weight, parseInt(formData.reps));
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">
                    Reps *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                    placeholder="10"
                    value={formData.reps}
                    onChange={(e) => {
                      const reps = parseInt(e.target.value);
                      setFormData({...formData, reps: e.target.value});
                      handleWeightChange(parseFloat(formData.weight), reps);
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">
                    Sets *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                    placeholder="3"
                    value={formData.sets}
                    onChange={(e) => setFormData({...formData, sets: e.target.value})}
                  />
                </div>
              </div>

              {oneRepMax && (
                <div className="bg-[#18202C] p-4 rounded-2xl border border-[#FF5500]/30 neu-raised flex items-center justify-between">
                  <div>
                    <span className="text-[#FF5500] text-[10px] font-black uppercase font-heading">Estimated 1RM</span>
                    <p className="text-white text-2xl font-black font-heading">{oneRepMax} KG</p>
                  </div>
                  <span className="text-gray-500 text-[10px]">Epley Benchmark</span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  rows={2}
                  placeholder="RPE 8, smooth bar path, clean form..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddExercise}
                  className="flex-1 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  Save Movement
                </button>
                <button
                  onClick={() => {
                    setShowAddExercise(false);
                    setFormData({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
                    setOneRepMax(null);
                  }}
                  className="flex-1 bg-[#18202C] hover:bg-[#202938] text-gray-300 text-xs font-bold font-heading uppercase py-3.5 rounded-xl border border-[#202938] neu-raised transition"
                >
                  Cancel
                </button>
              </div>
            </div>
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