'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import api from '@/lib/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import SidebarNav from '@/components/dashboard/SidebarNav';

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchDashboardData();
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning 🌅');
    else if (hour < 18) setGreeting('Good Afternoon ☀️');
    else setGreeting('Good Evening 🌙');
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileRes, plansRes] = await Promise.all([
        api.get('/profile'),
        api.get('/recommendations').catch(() => ({ data: { recommendations: [] } }))
      ]);

      setUser(profileRes.data.user);
      setWorkoutPlans(plansRes.data.recommendations || []);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.error || 'Session expired or failed to load profile.');
      toast.error('Session expired. Please login again.');
      localStorage.clear();
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ redirect: false });
    toast.success('Logged out successfully!');
    window.location.href = '/auth/login';
  };

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
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
        <div className="flex">
          <SidebarNav
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            user={user}
            navItems={navItems}
            pathname={pathname}
            handleLogout={handleLogout}
          />

          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} p-8`}>
            {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {greeting}, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-400 text-sm">Here's your fitness overview for today</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono text-blue-400">{currentTime}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-xl`} />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-gray-400 text-xs font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white capitalize">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <h2 className="text-xl font-bold text-white mb-4">Features & Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {navItems.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 rounded-2xl p-5 text-center transition group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h3 className="text-white font-semibold text-sm mb-1">{item.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}