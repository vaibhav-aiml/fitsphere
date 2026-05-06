'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Navigation items
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
          <div className="w-12 h-12 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white mt-4 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="flex">
        {/* Sidebar Navigation */}
        <motion.div 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed left-0 top-0 h-full bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">💪</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  FitSphere
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {/* User Profile in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{user?.name?.split(' ')[0]}</p>
                  <p className="text-gray-500 text-xs">{user?.goal} • Level 1</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {navItems.map((item, idx) => (
              <Link href={item.href} key={idx}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all cursor-pointer group ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`text-2xl group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`text-sm font-medium ${
                      pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  {!sidebarCollapsed && pathname === item.href && (
                    <div className="ml-auto w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  )}
                </motion.div>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-red-600/20 transition-all mt-4"
            >
              <div className="text-2xl">🚪</div>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium text-gray-400 hover:text-white">
                  Logout
                </span>
              )}
            </button>
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          {/* Header */}
          <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {greeting}, {user?.name?.split(' ')[0]}! <span className="text-2xl">🎉</span>
                </h1>
                <p className="text-gray-400 text-sm">Let's crush your fitness goals today! 💪</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Current Time</p>
                <p className="text-white font-semibold">{currentTime}</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6">
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

            {/* Workout Plans Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  Recommended Plans for You
                </h2>
                <Link href="/plans">
                  <button className="text-blue-400 text-sm hover:text-blue-300 transition">
                    View All →
                  </button>
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
              transition={{ delay: 0.2 }}
              className="mt-8 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-blue-500/20"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-bounce">🔥</div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Daily Motivation</h3>
                    <p className="text-gray-300 text-sm">
                      "The only bad workout is the one that didn't happen. Keep pushing!"
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
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
    </div>
  );
}