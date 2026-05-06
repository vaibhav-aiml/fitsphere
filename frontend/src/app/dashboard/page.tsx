'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchUserData(token);
    fetchWorkoutPlans(token);
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning 🌅');
    else if (hour < 18) setGreeting('Good Afternoon ☀️');
    else setGreeting('Good Evening 🌙');
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      toast.error('Session expired. Please login again.');
      localStorage.clear();
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutPlans = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkoutPlans(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to load workout plans:', error);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ redirect: false });
    toast.success('Logged out successfully!');
    window.location.href = '/auth/login';
  };

  // Navigation items with icons and colors
  const navItems = [
  { name: 'AI Coach', icon: '🧠', href: '/ai-coach', color: 'from-purple-500 to-pink-500' },
  { name: 'Nutrition', icon: '🍎', href: '/nutrition', color: 'from-green-500 to-emerald-500' },
  { name: 'Achievements', icon: '⭐', href: '/achievements', color: 'from-yellow-500 to-orange-500' },
  { name: 'Music', icon: '🎧', href: '/music', color: 'from-pink-500 to-rose-500' },
  { name: 'Export', icon: '📎', href: '/export', color: 'from-teal-500 to-cyan-500' },
  { name: 'Calendar', icon: '📆', href: '/calendar', color: 'from-blue-500 to-indigo-500' },
  { name: 'Workout', icon: '🏋️', href: '/workout', color: 'from-red-500 to-orange-500' },
  { name: 'Exercises', icon: '📋', href: '/exercises', color: 'from-yellow-500 to-amber-500' },
  { name: 'Plans', icon: '🎯', href: '/plans', color: 'from-indigo-500 to-purple-500' },
  { name: 'Progress', icon: '📈', href: '/progress', color: 'from-green-500 to-teal-500' },
  { name: 'Analytics', icon: '🔍', href: '/analytics', color: 'from-blue-500 to-cyan-500' },
  { name: 'Social', icon: '🌐', href: '/social', color: 'from-pink-500 to-purple-500' },
];
  // Quick stats cards
  const stats = [
    { label: 'Current Goal', value: user?.goal || 'Set Goal', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
    { label: 'Experience', value: user?.experience || 'Beginner', icon: '📈', color: 'from-purple-500 to-pink-500' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: '🎉', color: 'from-orange-500 to-red-500' },
    { label: 'Workouts', value: workoutPlans.length || 0, icon: '💪', color: 'from-green-500 to-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white mt-4 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full blur-[150px] opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl md:text-3xl font-bold text-white"
                >
                  {greeting}, {user?.name?.split(' ')[0]}! <span className="text-2xl">🎉</span>
                </motion.h1>
                <p className="text-gray-400 text-sm mt-1">Let's crush your fitness goals today! 💪</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-gray-400 text-xs">Current Time</p>
                  <p className="text-white font-semibold">{currentTime}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-red-600/30"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Quick Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs uppercase tracking-wider">{stat.label}</p>
                    <p className="text-white text-xl font-bold mt-1 capitalize">{stat.value}</p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Quick Access
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
              {navItems.map((item, idx) => (
                <Link href={item.href} key={idx}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl text-center border border-gray-700 hover:border-${item.color.split('-')[1]}-500/50 transition-all cursor-pointer group`}
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <p className="text-white text-xs font-medium">{item.name}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Workout Plans Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Recommended Plans for You
              </h2>
              <Link href="/plans">
                <button className="text-blue-400 text-sm hover:text-blue-300 transition">View All →</button>
              </Link>
            </div>
            
            {workoutPlans.length === 0 ? (
              <div className="bg-gray-800/30 backdrop-blur-sm p-12 rounded-2xl text-center border border-gray-700">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400">No workout plans found for your goal.</p>
                <p className="text-gray-500 text-sm mt-2">Complete your profile to get personalized recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutPlans.map((plan: any, idx) => (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                          {plan.name}
                        </h3>
                        <div className="px-2 py-1 bg-blue-500/20 rounded-lg">
                          <span className="text-blue-400 text-xs font-semibold capitalize">{plan.goal}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description}</p>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-white text-sm">4.8</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400">📅</span>
                          <span className="text-gray-300 text-sm">{plan.durationWeeks} weeks</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/workout-plan/${plan._id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        View Plan →
                      </button>
                    </div>
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Motivation Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-blue-500/20"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Daily Motivation</h3>
                  <p className="text-gray-300 text-sm">
                    "The only bad workout is the one that didn't happen. Keep pushing!"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-white font-bold text-2xl">{user?.totalWorkouts || 0}</div>
                  <div className="text-gray-500 text-xs">Total Workouts</div>
                </div>
                <div className="w-px h-10 bg-gray-700" />
                <div className="text-center">
                  <div className="text-white font-bold text-2xl">{user?.streakDays || 0}</div>
                  <div className="text-gray-500 text-xs">Day Streak 🔥</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}