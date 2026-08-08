'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [bodyWeights, setBodyWeights] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [activeStats, setActiveStats] = useState<any>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    exerciseName: '',
    weight: '',
    reps: '',
    sets: '',
    notes: ''
  });
  const [bodyWeightForm, setBodyWeightForm] = useState({ weight: '' });

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes, weightRes, activeSessionsRes, activeStatsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/workout-logs?limit=20'),
        api.get('/body-weight'),
        api.get('/active-sessions?limit=10').catch(() => ({ data: { sessions: [] } })),
        api.get('/active-sessions/stats').catch(() => ({ data: { stats: null } }))
      ]);
      
      setStats(statsRes.data.stats);
      setWorkoutLogs(logsRes.data.logs || []);
      setBodyWeights(weightRes.data.weights || []);
      setActiveSessions(activeSessionsRes.data.sessions || []);
      setActiveStats(activeStatsRes.data.stats || null);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        await api.post('/workout-logs', logForm);
        toast.success('Workout logged successfully!');
        setShowLogForm(false);
        setLogForm({ exerciseName: '', weight: '', reps: '', sets: '', notes: '' });
        fetchData();
      } catch (error) {
        toast.error('Failed to log workout');
      }
    }, {
      title: 'Progress Logging Requires Account',
      description: 'Sign in to record your workout logs and track progress.',
      nextUrl: '/progress'
    });
  };

  const handleLogBodyWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        await api.post('/body-weight', bodyWeightForm);
        toast.success('Body weight logged!');
        setBodyWeightForm({ weight: '' });
        fetchData();
      } catch (error) {
        toast.error('Failed to log body weight');
      }
    }, {
      title: 'Weight Tracking Requires Account',
      description: 'Sign in to log body weight and track trend graphs.',
      nextUrl: '/progress'
    });
  };

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
              📈 ATHLETIC PROGRESS TRACKER
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track progressive overload, body metrics, and training frequency
            </p>
          </div>

          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="px-5 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading tracking-wider uppercase rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            {showLogForm ? 'Cancel Form' : '+ Log Workout Session'}
          </button>
        </div>

        {/* Bento Stats Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Total Workouts</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{stats?.totalWorkouts ?? '--'}</p>
            <p className="text-gray-500 text-xs mt-1">Logged sessions</p>
          </div>
          
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Cumulative Volume</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{stats ? `${stats.totalVolume.toLocaleString()} KG` : '--'}</p>
            <p className="text-gray-500 text-xs mt-1">Total weight lifted</p>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Exercise Variety</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{stats?.uniqueExercises ?? '--'}</p>
            <p className="text-gray-500 text-xs mt-1">Unique movements</p>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider font-heading">7-Day Frequency</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{stats?.workoutsThisWeek ?? '--'}</p>
            <p className="text-gray-500 text-xs mt-1">Sessions this week</p>
          </div>
        </div>

        {/* Log Workout Form */}
        {showLogForm && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised">
            <h2 className="text-xl font-black text-white font-heading mb-4">🏋️‍♂️ LOG WORKOUT SESSION</h2>
            <form onSubmit={handleLogWorkout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Exercise Name (e.g., Barbell Squat)"
                  className="px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  value={logForm.exerciseName}
                  onChange={(e) => setLogForm({...logForm, exerciseName: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  className="px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  value={logForm.weight}
                  onChange={(e) => setLogForm({...logForm, weight: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Reps"
                  className="px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  value={logForm.reps}
                  onChange={(e) => setLogForm({...logForm, reps: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Sets"
                  className="px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                  value={logForm.sets}
                  onChange={(e) => setLogForm({...logForm, sets: e.target.value})}
                  required
                />
              </div>
              <textarea
                placeholder="Training notes, form feedback, RPE..."
                className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                rows={2}
                value={logForm.notes}
                onChange={(e) => setLogForm({...logForm, notes: e.target.value})}
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading tracking-wider uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                Save Workout Log
              </button>
            </form>
          </div>
        )}

        {/* Body Weight Log & History Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Log Body Weight Card */}
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <h2 className="text-lg font-black text-white font-heading mb-3">⚖️ RECORD BODY WEIGHT</h2>
            <form onSubmit={handleLogBodyWeight} className="space-y-3">
              <input
                type="number"
                step="0.1"
                placeholder="Weight in kg (e.g. 78.5)"
                className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                value={bodyWeightForm.weight}
                onChange={(e) => setBodyWeightForm({ weight: e.target.value })}
                required
              />
              <button 
                type="submit" 
                className="w-full py-3 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-extrabold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                Log Weight Entry
              </button>
            </form>
          </div>

          {/* Body Weight History List */}
          <div className="md:col-span-2 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <h2 className="text-lg font-black text-white font-heading mb-3">📋 WEIGHT ENTRY HISTORY</h2>
            {bodyWeights.length === 0 ? (
              <p className="text-gray-500 text-xs italic">No weight entries logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bodyWeights.map((w: any) => (
                  <div key={w._id} className="flex justify-between items-center bg-[#0D1117] px-4 py-2.5 rounded-xl border border-[#202938]">
                    <span className="text-white font-bold text-sm font-heading">{w.weight} KG</span>
                    <span className="text-gray-500 text-xs">{new Date(w.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Workout Activity Logs */}
        <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised">
          <h2 className="text-2xl font-black text-white font-heading mb-5">📜 RECENT WORKOUT HISTORY</h2>
          {workoutLogs.length === 0 ? (
            <div className="bg-[#0D1117] p-8 rounded-2xl text-center border border-[#202938] neu-inset">
              <p className="text-gray-400 font-semibold">No workouts logged in your profile yet.</p>
              <p className="text-gray-500 text-xs mt-1">Log a workout above or browse template plans to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutLogs.map((log: any) => (
                <div key={log._id} className="bg-[#18202C] p-4 rounded-2xl border border-[#202938] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[#FF5500] font-black text-base font-heading block">{log.exerciseName}</span>
                    <span className="text-gray-300 text-xs font-semibold">
                      {log.sets} Sets × {log.reps} Reps @ <span className="text-white font-bold">{log.weight} KG</span>
                    </span>
                    {log.notes && <p className="text-gray-400 text-xs mt-1 italic">📝 {log.notes}</p>}
                  </div>
                  <span className="text-gray-500 text-xs font-mono bg-[#0D1117] px-3 py-1 rounded-lg border border-[#202938]">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Step & Multi-Sport Activity Tracking History */}
        <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-black text-white font-heading flex items-center gap-2">
                <span>🏃‍♂️</span> LIVE STEP & SPORT TRACKING HISTORY
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">Real-time step counter, MET calories, pace, and active sport sessions</p>
            </div>
            <Link
              href="/workout/live"
              className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold font-heading uppercase rounded-xl transition"
            >
              + Start Live Session
            </Link>
          </div>

          {activeStats && activeStats.totalSessions > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-[#18202C] p-3.5 rounded-2xl border border-[#202938]">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Total Live Steps</span>
                <p className="text-xl font-black text-white font-heading mt-1">{activeStats.totalSteps?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-[#18202C] p-3.5 rounded-2xl border border-[#202938]">
                <span className="text-[#FF5500] text-[10px] uppercase font-bold">Total Live Calories</span>
                <p className="text-xl font-black text-[#FF5500] font-heading mt-1">{activeStats.totalCalories || 0} kcal</p>
              </div>
              <div className="bg-[#18202C] p-3.5 rounded-2xl border border-[#202938]">
                <span className="text-cyan-400 text-[10px] uppercase font-bold">Total Outdoor Dist</span>
                <p className="text-xl font-black text-white font-heading mt-1">{activeStats.totalDistanceKm || 0} km</p>
              </div>
              <div className="bg-[#18202C] p-3.5 rounded-2xl border border-[#202938]">
                <span className="text-emerald-400 text-[10px] uppercase font-bold">Live Sessions</span>
                <p className="text-xl font-black text-white font-heading mt-1">{activeStats.totalSessions || 0}</p>
              </div>
            </div>
          )}

          {activeSessions.length === 0 ? (
            <div className="bg-[#0D1117] p-8 rounded-2xl text-center border border-[#202938] neu-inset">
              <p className="text-gray-400 font-semibold">No live tracking sessions recorded yet.</p>
              <p className="text-gray-500 text-xs mt-1">Launch the Real-Time Step Tracker during your next run, walk, or indoor game!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session: any) => (
                <div key={session._id} className="bg-[#18202C] p-4 rounded-2xl border border-[#202938] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-base font-heading capitalize">
                        {session.activityType?.replace('_', ' ')}
                      </span>
                      {session.isManuallyEdited && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-1">
                      <span>👟 <strong className="text-white">{session.stepsCount?.toLocaleString()}</strong> steps</span>
                      <span>🔥 <strong className="text-[#FF5500]">{session.caloriesBurned}</strong> kcal</span>
                      {session.distanceKm && (
                        <span>📍 <strong className="text-white">{session.distanceKm}</strong> km</span>
                      )}
                      {session.avgPaceMinPerKm && (
                        <span>⚡ <strong className="text-cyan-400">{session.avgPaceMinPerKm}</strong> min/km</span>
                      )}
                      <span>⏱️ {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s</span>
                    </div>
                    {session.notes && <p className="text-gray-400 text-xs mt-1 italic">📝 {session.notes}</p>}
                  </div>
                  <span className="text-gray-500 text-xs font-mono bg-[#0D1117] px-3 py-1 rounded-lg border border-[#202938]">
                    {new Date(session.startTime || session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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