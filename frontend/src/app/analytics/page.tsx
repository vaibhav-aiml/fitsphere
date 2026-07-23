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

export default function AdvancedAnalytics() {
  const router = useRouter();
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [oneRMProgression, setOneRMProgression] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    volumeData: [],
    totalVolume: 0,
    totalWorkouts: 0,
    caloriesData: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [volumeRes, summaryRes, caloriesRes, workoutsRes] = await Promise.all([
        api.get('/analytics/volume'),
        api.get('/analytics/summary'),
        api.get('/analytics/calories'),
        api.get('/workout-logs?limit=100')
      ]);

      const uniqueExercises = Array.from(new Set((workoutsRes.data.logs || []).map((log: any) => log.exerciseName))) as string[];
      setExercises(uniqueExercises);
      if (uniqueExercises.length > 0) {
        const firstEx = uniqueExercises[0] as string;
        setSelectedExercise(firstEx);
        await fetchOneRM('', firstEx);
      }

      setAnalytics({
        volumeData: volumeRes.data.volumeData || [],
        totalVolume: volumeRes.data.totalVolume || 0,
        totalWorkouts: volumeRes.data.totalWorkouts || 0,
        caloriesData: caloriesRes.data.caloriesData || [],
        summary: summaryRes.data.summary || {}
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
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

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">📊 Advanced Analytics</h1>
            <p className="text-gray-400 mt-1">Deep insights into your fitness journey</p>
          </div>
          <Link href="/progress">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Simple Progress →
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-xl border border-blue-700">
            <p className="text-gray-400 text-sm">Total Workouts</p>
            <p className="text-white text-3xl font-bold mt-1">{analytics?.summary?.totalWorkouts || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-6 rounded-xl border border-green-700">
            <p className="text-gray-400 text-sm">Total Volume (kg)</p>
            <p className="text-white text-3xl font-bold mt-1">{(analytics?.totalVolume || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-xl border border-purple-700">
            <p className="text-gray-400 text-sm">Unique Exercises</p>
            <p className="text-white text-3xl font-bold mt-1">{analytics?.summary?.uniqueExercises || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 p-6 rounded-xl border border-orange-700">
            <p className="text-gray-400 text-sm">Est. Calories</p>
            <p className="text-white text-3xl font-bold mt-1">
              {analytics?.caloriesData?.reduce((sum: number, d: any) => sum + d.calories, 0) || 0}
            </p>
          </div>
        </div>

        {/* Best Lifts Section */}
        {analytics?.summary?.bestLifts && Object.keys(analytics.summary.bestLifts).length > 0 && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🏆 Personal Records (1RM)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.summary.bestLifts).slice(0, 8).map(([exercise, value]) => (
                <div key={exercise} className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">{exercise}</p>
                  <p className="text-white text-xl font-bold">{value as number} kg</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1RM Progression Chart */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📈 1RM Progression</h2>
          {exercises.length > 0 ? (
            <>
              <div className="mb-4">
                <label className="text-gray-300 mr-3">Select Exercise:</label>
                <select
                  value={selectedExercise}
                  onChange={(e) => handleExerciseChange(e.target.value)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                >
                  {exercises.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
              {oneRMProgression.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={oneRMProgression}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="oneRM" stroke="#3b82f6" name="1RM (kg)" strokeWidth={2} />
                    <Line type="monotone" dataKey="weight" stroke="#22c55e" name="Weight (kg)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-8">Log more workouts of this exercise to see progression!</p>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No exercise data yet. Log workouts to see your 1RM progression!</p>
          )}
        </div>

        {/* Volume Tracking Chart */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Volume Tracking (Total Weight Lifted)</h2>
          {analytics?.volumeData && analytics.volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: 'white' }}
                  formatter={(value: any) => `${value.toLocaleString()} kg`}
                />
                <Area type="monotone" dataKey="volume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No volume data yet. Log workouts to see your progress!</p>
          )}
        </div>

        {/* Calories Burned Chart */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🔥 Estimated Calories Burned</h2>
          {analytics?.caloriesData && analytics.caloriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.caloriesData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="calories" fill="#f59e0b" name="Calories Burned" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Log workouts to see calories burned estimates!</p>
          )}
        </div>

        {/* Exercise Distribution */}
        {analytics?.caloriesData && analytics.caloriesData.length > 0 && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🎯 Exercise Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    analytics.caloriesData.reduce((acc: any, curr: any) => {
                      acc[curr.exerciseName] = (acc[curr.exerciseName] || 0) + curr.calories;
                      return acc;
                    }, {})
                  ).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(
                    analytics.caloriesData.reduce((acc: any, curr: any) => {
                      acc[curr.exerciseName] = (acc[curr.exerciseName] || 0) + curr.calories;
                      return acc;
                    }, {})
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700">
          <h3 className="text-xl font-bold text-white mb-3">💡 Analytics Insights</h3>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Track your 1RM progression to see strength gains over time</li>
            <li>✓ Volume tracking shows your total work capacity improvement</li>
            <li>✓ Log consistently to get accurate calorie burn estimates</li>
            <li>✓ Use the exercise filter to focus on specific lifts</li>
            <li>✓ Compare your progress month over month</li>
          </ul>
        </div>
      </div>
    </div>
  );
}