'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function AdvancedAnalytics() {
  const router = useRouter();
  const [exercises, setExercises] = useState<string[]>(['Bench Press', 'Squat', 'Deadlift']);
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [oneRMProgression, setOneRMProgression] = useState<any[]>([
    { date: '2026-01-01', oneRM: 80 },
    { date: '2026-02-01', oneRM: 90 },
    { date: '2026-03-01', oneRM: 100 }
  ]);
  const [analytics, setAnalytics] = useState<any>({
    volumeData: [
      { date: 'Mon', volume: 2400 },
      { date: 'Wed', volume: 3100 },
      { date: 'Fri', volume: 2900 }
    ],
    totalVolume: 8400,
    totalWorkouts: 12,
    caloriesData: [],
    summary: {}
  });
  const [loading, setLoading] = useState(false);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAnalytics();
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [volumeRes, summaryRes, caloriesRes, workoutsRes] = await Promise.all([
        api.get('/analytics/volume'),
        api.get('/analytics/summary'),
        api.get('/analytics/calories'),
        api.get('/workout-logs?limit=100')
      ]);

      const uniqueExercises = Array.from(new Set((workoutsRes.data.logs || []).map((log: any) => log.exerciseName))) as string[];
      if (uniqueExercises.length > 0) {
        setExercises(uniqueExercises);
        const firstEx = uniqueExercises[0] as string;
        setSelectedExercise(firstEx);
        await fetchOneRM('', firstEx);
      }

      setAnalytics({
        volumeData: volumeRes.data.volumeData || [],
        totalVolume: summaryRes.data.totalVolume || 0,
        totalWorkouts: summaryRes.data.totalWorkouts || 0,
        caloriesData: caloriesRes.data.caloriesData || [],
        summary: summaryRes.data || {}
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOneRM = async (token: string, exercise: string) => {
    try {
      const response = await api.get(`/analytics/1rm/${exercise}`);
      setOneRMProgression(response.data.progression || []);
    } catch (error) {
      console.error('Failed to fetch 1RM data:', error);
    }
  };

  const handleExerciseChange = async (exercise: string) => {
    setSelectedExercise(exercise);
    await fetchOneRM('', exercise);
  };

  const CHART_COLORS = ['#FF5500', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Performance Analytics...</div>
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
              📊 PERFORMANCE ANALYTICS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Data-driven insights for 1RM strength curves, daily volume, and energy expenditure
            </p>
          </div>

          <Link href="/progress">
            <button className="px-5 py-3 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-extrabold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition">
              Simple Progress View →
            </button>
          </Link>
        </div>

        {/* Bento Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Total Sessions</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{analytics?.summary?.totalWorkouts || 0}</p>
            <p className="text-gray-500 text-xs mt-1">Completed workouts</p>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Total Tonnage</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{(analytics?.totalVolume || 0).toLocaleString()} KG</p>
            <p className="text-gray-500 text-xs mt-1">Cumulative load</p>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-[#FF5500] text-[10px] font-black uppercase tracking-wider font-heading">Unique Movements</span>
            <p className="text-3xl font-black text-white font-heading mt-2">{analytics?.summary?.uniqueExercises || 0}</p>
            <p className="text-gray-500 text-xs mt-1">Movement variation</p>
          </div>

          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider font-heading">Est. Energy Burn</span>
            <p className="text-3xl font-black text-white font-heading mt-2">
              {analytics?.caloriesData?.reduce((sum: number, d: any) => sum + d.calories, 0) || 0} KCAL
            </p>
            <p className="text-gray-500 text-xs mt-1">Calculated expenditure</p>
          </div>
        </div>

        {/* 1RM Progression Bento Card */}
        <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-black text-white font-heading">📈 1RM STRENGTH PROGRESSION</h2>
              <p className="text-gray-400 text-xs">Calculated 1-Rep Max curve across training logs</p>
            </div>
            {exercises.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs font-bold">Movement:</span>
                <select
                  value={selectedExercise}
                  onChange={(e) => handleExerciseChange(e.target.value)}
                  className="px-3 py-2 bg-[#0D1117] text-white font-bold text-xs rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  {exercises.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {oneRMProgression.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={oneRMProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202938" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11161F', border: '1px solid #202938', borderRadius: '12px' }}
                  labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                />
                <Legend />
                <Line type="monotone" dataKey="oneRM" stroke="#FF5500" name="1RM (kg)" strokeWidth={3} dot={{ fill: '#FF5500', r: 5 }} />
                <Line type="monotone" dataKey="weight" stroke="#10B981" name="Working Load (kg)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12 text-sm italic">Log more workouts of this exercise to see strength curves.</p>
          )}
        </div>

        {/* Volume & Energy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Volume Area Chart */}
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <h2 className="text-lg font-black text-white font-heading mb-4">📊 VOLUME TONNAGE TRACKING</h2>
            {analytics?.volumeData && analytics.volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#202938" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#11161F', border: '1px solid #202938', borderRadius: '12px' }}
                    formatter={(val: any) => `${val.toLocaleString()} kg`}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#FF5500" fill="#FF5500" fillOpacity={0.25} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12 text-xs italic">No volume history recorded yet.</p>
            )}
          </div>

          {/* Calories Bar Chart */}
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <h2 className="text-lg font-black text-white font-heading mb-4">🔥 DAILY CALORIC EXPENDITURE</h2>
            {analytics?.caloriesData && analytics.caloriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.caloriesData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#202938" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#11161F', border: '1px solid #202938', borderRadius: '12px' }}
                  />
                  <Bar dataKey="calories" fill="#FF5500" radius={[6, 6, 0, 0]} name="Calories Burned" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12 text-xs italic">Log workouts to calculate caloric estimates.</p>
            )}
          </div>

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