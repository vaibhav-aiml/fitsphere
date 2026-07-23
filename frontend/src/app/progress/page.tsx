'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [bodyWeights, setBodyWeights] = useState<any[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    exerciseName: '',
    weight: '',
    reps: '',
    sets: '',
    notes: ''
  });
  const [bodyWeightForm, setBodyWeightForm] = useState({ weight: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes, weightRes] = await Promise.all([
        api.get('/stats'),
        api.get('/workout-logs?limit=20'),
        api.get('/body-weight')
      ]);
      
      setStats(statsRes.data.stats);
      setWorkoutLogs(logsRes.data.logs);
      setBodyWeights(weightRes.data.weights);
    } catch (error) {
      toast.error('Failed to load progress data');
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/workout-logs', logForm);
      toast.success('Workout logged successfully!');
      setShowLogForm(false);
      setLogForm({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to log workout');
    }
  };

  const handleLogBodyWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/body-weight', bodyWeightForm);
      toast.success('Body weight logged!');
      setBodyWeightForm({ weight: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to log body weight');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-blue-500 hover:text-blue-400 transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Your Progress Tracker</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Total Workouts</p>
              <p className="text-white text-3xl font-bold mt-1">{stats.totalWorkouts}</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Total Volume (kg)</p>
              <p className="text-white text-3xl font-bold mt-1">{stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Unique Exercises</p>
              <p className="text-white text-3xl font-bold mt-1">{stats.uniqueExercises}</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Workouts This Week</p>
              <p className="text-white text-3xl font-bold mt-1">{stats.workoutsThisWeek}</p>
            </div>
          </div>
        )}

        {/* Log Workout Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {showLogForm ? 'Cancel' : '+ Log Workout'}
          </button>
        </div>

        {/* Log Workout Form */}
        {showLogForm && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Log Your Workout</h2>
            <form onSubmit={handleLogWorkout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Exercise Name (e.g., Bench Press)"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  value={logForm.exerciseName}
                  onChange={(e) => setLogForm({...logForm, exerciseName: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  value={logForm.weight}
                  onChange={(e) => setLogForm({...logForm, weight: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Reps"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  value={logForm.reps}
                  onChange={(e) => setLogForm({...logForm, reps: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Sets"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  value={logForm.sets}
                  onChange={(e) => setLogForm({...logForm, sets: e.target.value})}
                  required
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                rows={2}
                value={logForm.notes}
                onChange={(e) => setLogForm({...logForm, notes: e.target.value})}
              />
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Save Workout
              </button>
            </form>
          </div>
        )}

        {/* Body Weight Log Form */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Log Body Weight</h2>
          <form onSubmit={handleLogBodyWeight} className="flex gap-4">
            <input
              type="number"
              placeholder="Weight (kg)"
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              value={bodyWeightForm.weight}
              onChange={(e) => setBodyWeightForm({ weight: e.target.value })}
              required
            />
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Log Weight
            </button>
          </form>
        </div>

        {/* Recent Workouts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>
          {workoutLogs.length === 0 ? (
            <div className="bg-gray-800/50 p-8 rounded-xl text-center border border-gray-700">
              <p className="text-gray-400">No workouts logged yet.</p>
              <p className="text-gray-500 text-sm mt-2">Start logging your workouts to see progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutLogs.map((log: any) => (
                <div key={log._id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">{log.exerciseName}</p>
                      <p className="text-gray-400 text-sm">
                        {log.sets} sets × {log.reps} reps @ {log.weight} kg
                      </p>
                      {log.notes && <p className="text-gray-500 text-xs mt-1">📝 {log.notes}</p>}
                    </div>
                    <p className="text-gray-500 text-sm">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body Weight History */}
        {bodyWeights.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Body Weight History</h2>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="space-y-2">
                {bodyWeights.map((weight: any) => (
                  <div key={weight._id} className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <p className="text-white">{weight.weight} kg</p>
                    <p className="text-gray-500 text-sm">{new Date(weight.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}