'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchWorkoutHistory(token);
  }, []);

  const fetchWorkoutHistory = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/workout-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const uniqueExercises = [...new Set(response.data.logs.map((log: any) => log.exerciseName))];
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
    const token = localStorage.getItem('token');
    
    if (!formData.exerciseName || !formData.weight || !formData.reps || !formData.sets) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/workout-logs', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentWorkout([...currentWorkout, { ...formData, id: Date.now() }]);
      toast.success(`${formData.exerciseName} added to workout!`);
      
      setFormData({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
      setShowAddExercise(false);
      setOneRepMax(null);
    } catch (error) {
      toast.error('Failed to add exercise');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">💪 Workout Logger</h1>
            <p className="text-gray-400 mt-1">Log your exercises and track your progress</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShareWorkout}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
            >
              📱 Share Workout
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              View Progress
            </button>
          </div>
        </div>

        {/* Current Workout Summary */}
        {currentWorkout.length > 0 && (
          <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-3">Current Workout</h2>
            <div className="space-y-2 mb-4">
              {currentWorkout.map((exercise, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{exercise.exerciseName}</p>
                    <p className="text-gray-400 text-sm">
                      {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} kg
                    </p>
                  </div>
                  <button
                    onClick={() => removeExercise(idx)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFinishWorkout}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Finish Workout ({currentWorkout.length} exercises)
              </button>
              <button
                onClick={handleShareWorkout}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
              >
                📱 Share
              </button>
            </div>
          </div>
        )}

        {/* Add Exercise Form */}
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg"
          >
            + Add Exercise to Workout
          </button>
        ) : (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Exercise</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Exercise Name *</label>
                <input
                  type="text"
                  list="exercises"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  placeholder="e.g., Bench Press, Squat, Deadlift"
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
                  <option value="Leg Press" />
                </datalist>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Weight (kg) *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
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
                  <label className="block text-gray-300 mb-2">Reps *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
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
                  <label className="block text-gray-300 mb-2">Sets *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="3"
                    value={formData.sets}
                    onChange={(e) => setFormData({...formData, sets: e.target.value})}
                  />
                </div>
              </div>

              {oneRepMax && (
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                  <p className="text-green-400 text-sm">Estimated 1 Rep Max (1RM)</p>
                  <p className="text-white text-2xl font-bold">{oneRepMax} kg</p>
                  <p className="text-gray-400 text-xs mt-1">Based on Epley formula</p>
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">Notes (optional)</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  rows={2}
                  placeholder="Form notes, difficulty, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddExercise}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Add to Workout
                </button>
                <button
                  onClick={() => {
                    setShowAddExercise(false);
                    setFormData({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
                    setOneRepMax(null);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-gray-800/30 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-3">💡 Tips for Logging Workouts</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Log your working sets (not warm-up sets)</li>
            <li>✓ Be consistent with exercise names for accurate tracking</li>
            <li>✓ Add notes for form corrections or difficulty level</li>
            <li>✓ Track your 1RM to monitor strength gains</li>
            <li>✓ Share your achievements to stay motivated! 📱</li>
          </ul>
        </div>
      </div>
    </div>
  );
}