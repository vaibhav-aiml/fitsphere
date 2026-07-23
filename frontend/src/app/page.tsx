'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import SidebarNav from '@/components/dashboard/SidebarNav';
import IronDial from '@/components/IronDial';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import useRequireAuth from '@/hooks/useRequireAuth';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const pathname = '/';
  const hasHandledSession = useRef(false);

  // Main navigation items for the sidebar
  const navItems = [
    { name: 'Dashboard', icon: '⚡', href: '/', color: 'blaze' },
    { name: 'Workout Logger', icon: '🏋️‍♂️', href: '/workout', color: 'emerald' },
    { name: 'Workout Plans', icon: '📋', href: '/plans', color: 'purple' },
    { name: 'Exercises', icon: '💪', href: '/exercises', color: 'cyan' },
    { name: 'Nutrition', icon: '🥗', href: '/nutrition', color: 'emerald' },
    { name: 'AI Coach', icon: '🤖', href: '/ai-coach', color: 'cyan' },
    { name: 'Music', icon: '🎵', href: '/music', color: 'pink' },
    { name: 'Calendar', icon: '📅', href: '/calendar', color: 'amber' },
    { name: 'Social Feed', icon: '👥', href: '/social', color: 'pink' },
    { name: 'Progress', icon: '📈', href: '/progress', color: 'amber' },
    { name: 'Analytics', icon: '📊', href: '/analytics', color: 'indigo' },
    { name: 'Achievements', icon: '🏆', href: '/achievements', color: 'yellow' },
    { name: 'Export', icon: '📦', href: '/export', color: 'rose' }
  ];

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning 🌅');
    else if (hour < 18) setGreeting('Good Afternoon ☀️');
    else setGreeting('Good Evening 🌙');

    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    if (!hasHandledSession.current) {
      hasHandledSession.current = true;

      const token = localStorage.getItem('token');
      if (token) {
        setIsGuest(false);
        fetchDashboardData();
      } else if (status === 'authenticated' && session) {
        const backendToken = (session.user as any)?.backendToken;
        const backendUser = (session.user as any)?.backendUser;
        if (backendToken && backendUser) {
          localStorage.setItem('token', backendToken);
          localStorage.setItem('user', JSON.stringify(backendUser));
          setIsGuest(false);
          fetchDashboardData();
        } else {
          setIsGuest(true);
          fetchPublicPlans();
        }
      } else {
        setIsGuest(true);
        fetchPublicPlans();
      }
    }
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      fetchPublicPlans();
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setIsGuest(true);
      fetchPublicPlans();
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/all-workout-plans').catch(() => ({ data: { plans: [] } }));
      setWorkoutPlans(res.data.plans || []);
    } catch (err) {
      console.error('Failed to fetch public plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsGuest(true);
    toast.success('Logged out successfully');
    signOut({ redirect: false });
    fetchPublicPlans();
  };

  const handleGatedFeatureClick = (targetHref: string, featureName: string) => {
    if (targetHref === '/plans' || targetHref === '/nutrition' || targetHref === '/exercises') {
      router.push(targetHref);
      return;
    }

    if (isGuest) {
      requireAuth(() => router.push(targetHref), {
        title: `${featureName} Requires Account`,
        description: `Sign in or create a free account to access ${featureName}.`,
        nextUrl: targetHref
      });
    } else {
      router.push(targetHref);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading FitSphere..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] flex font-sans">
        {/* Sidebar */}
        <SidebarNav
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          user={user}
          navItems={navItems}
          pathname={pathname}
          handleLogout={handleLogout}
          isGuest={isGuest}
        />

        {/* Main Content Viewport */}
        <main className={`flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised">
            <div>
              <p className="text-[#FF5500] text-xs font-black tracking-wider uppercase font-heading">{greeting}</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight mt-1">
                {isGuest ? 'FITSPHERE ATHLETE COMMAND CENTER ⚡' : `WELCOME BACK, ${user?.name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}!`}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {isGuest
                  ? 'Explore workouts, training programs & performance metrics.'
                  : `Current Training Focus: ${user?.goal || 'General Hypertrophy & Progressive Strength'}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono bg-[#0D1117] px-3.5 py-2 rounded-xl border border-[#202938] neu-inset">
                🕒 {currentTime}
              </span>
              {isGuest ? (
                <Link
                  href="/auth/login?next=/"
                  className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-extrabold rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  Sign In / Register
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-gray-300 text-sm font-bold rounded-xl border border-[#202938] neu-raised transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Hero Section: Signature Iron Dial + Quick Launcher Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* HERO BENTO CARD (Span 2 cols): Signature Iron Dial */}
            <div className="md:col-span-2 bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex-1 space-y-3 text-center sm:text-left z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-xs font-black uppercase font-heading">
                  <span>⚡</span> Signature Metric Meter
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                  {isGuest ? 'Daily Volume Capacity' : 'Target Volume Output'}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
                  {isGuest 
                    ? 'Track cumulative weight lifted, progressive overload targets, and consistency.'
                    : 'Your active target volume based on current progressive overload strength targets.'}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button 
                    onClick={() => handleGatedFeatureClick('/workout', 'Workout Logger')}
                    className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
                  >
                    + Start Live Workout
                  </button>
                  <Link
                    href="/plans"
                    className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-gray-300 text-xs font-bold rounded-xl border border-[#202938] neu-raised transition"
                  >
                    Browse Routines →
                  </Link>
                </div>
              </div>

              {/* Iron Dial Component */}
              <div className="z-10 flex-shrink-0">
                <IronDial
                  value={isGuest ? '0' : (user?.totalVolume || 4850)}
                  max={10000}
                  label="Daily Volume"
                  unit="KG"
                  sublabel={isGuest ? 'Sign in to record' : '74% of Target'}
                  size="md"
                />
              </div>
            </div>

            {/* Quick Session Launcher & Focus (1 col) */}
            <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#FF5500] text-xs font-black uppercase tracking-wider font-heading">Today&apos;s Workout Focus</span>
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-black text-white font-heading mb-1">
                  {isGuest ? 'Hypertrophy & Strength' : 'Upper Body Power - Day 1'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Focus: Bench Press, Barbell Row, Overhead Press & Arm Hypertrophy (Est. 45 min)
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleGatedFeatureClick('/workout', 'Workout Logger')}
                  className="w-full py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-heading font-extrabold text-xs rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] flex items-center justify-center gap-2"
                >
                  <span>🚀 Launch Session</span>
                </button>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Target: 4 Sets x 8-10 Reps</span>
                  <span className="text-emerald-400 font-bold">Ready</span>
                </div>
              </div>
            </div>

          </div>

          {/* Productive Dashboard Widgets Grid (Stats, AI Insight, Music, Badges) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            
            {/* Widget 1: Training Streak */}
            <div className="bg-[#11161F] p-5 rounded-2xl border border-[#202938] neu-raised">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#FF5500] text-xs font-black uppercase font-heading">Consistency Streak</span>
                <span className="text-xl">🔥</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-heading">
                  {isGuest ? '0' : (user?.streak || 5)}
                </span>
                <span className="text-gray-400 text-xs font-bold">DAYS</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                {isGuest ? 'Build your workout momentum' : '5 days active streak!'}
              </p>
            </div>

            {/* Widget 2: Weekly Workouts Goal */}
            <div className="bg-[#11161F] p-5 rounded-2xl border border-[#202938] neu-raised">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 text-xs font-black uppercase font-heading">Weekly Target</span>
                <span className="text-xl">🏋️‍♂️</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-heading">
                  {isGuest ? '0' : (user?.weeklyWorkouts || 3)}
                </span>
                <span className="text-gray-400 text-xs font-bold">/ 4 SESSIONS</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-1.5 mt-3 overflow-hidden neu-inset">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: isGuest ? '0%' : `${Math.min(100, ((user?.weeklyWorkouts || 3) / 4) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Widget 3: AI Coach Daily Advice */}
            <div className="bg-[#11161F] p-5 rounded-2xl border border-[#202938] neu-raised flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cyan-400 text-xs font-black uppercase font-heading">AI Coach Tip</span>
                  <span className="text-xl">🤖</span>
                </div>
                <p className="text-xs text-gray-300 leading-snug font-sans">
                  &quot;Maintain 2-3 sec eccentric control on heavy compound lifts to boost muscle tension.&quot;
                </p>
              </div>
              <button
                onClick={() => handleGatedFeatureClick('/ai-coach', 'AI Coach')}
                className="mt-3 text-[11px] text-cyan-400 hover:text-cyan-300 font-heading font-bold text-left"
              >
                Ask AI Coach →
              </button>
            </div>

            {/* Widget 4: Workout Beats Shortcut */}
            <div className="bg-[#11161F] p-5 rounded-2xl border border-[#202938] neu-raised flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-pink-400 text-xs font-black uppercase font-heading">Workout Beats</span>
                  <span className="text-xl">🎵</span>
                </div>
                <p className="text-xs text-gray-300 leading-snug font-sans">
                  High-BPM Hindi & English audio playlists tuned to your lifting pace.
                </p>
              </div>
              <button
                onClick={() => handleGatedFeatureClick('/music', 'Workout Music')}
                className="mt-3 text-[11px] text-pink-400 hover:text-pink-300 font-heading font-bold text-left"
              >
                Play Workout Music →
              </button>
            </div>

          </div>

          {/* Productive Categorized Hub Portals (Clean 4-Card Portal Hub) */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-2xl font-black text-white font-heading flex items-center gap-2">
                  <span>⚡</span> ATHLETIC PORTALS & TOOLS
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">Quick access to training, performance, and intelligent modules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Portal 1: Training & Exercises */}
              <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4 hover:border-[#FF5500]/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-2xl">
                    🏋️‍♂️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-heading">Training & Routines</h3>
                    <p className="text-gray-400 text-xs">Workouts, Plans & Exercises</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#202938]">
                  <button
                    onClick={() => handleGatedFeatureClick('/workout', 'Workout Logger')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>🏋️ Start Workout Logger</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <Link
                    href="/plans"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>📋 Browse Workout Plans</span>
                    <span className="text-[#FF5500]">→</span>
                  </Link>
                  <Link
                    href="/exercises"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>💪 Exercise Library</span>
                    <span className="text-[#FF5500]">→</span>
                  </Link>
                </div>
              </div>

              {/* Portal 2: Analytics & Progression */}
              <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4 hover:border-[#FF5500]/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-heading">Analytics & Progress</h3>
                    <p className="text-gray-400 text-xs">Volume, 1RM & Export</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#202938]">
                  <button
                    onClick={() => handleGatedFeatureClick('/progress', 'Progress Tracking')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>📈 Progress Tracking</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <button
                    onClick={() => handleGatedFeatureClick('/analytics', 'Analytics')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>📊 1RM & Volume Analytics</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <button
                    onClick={() => handleGatedFeatureClick('/export', 'Export Data')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>📦 Export Reports</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                </div>
              </div>

              {/* Portal 3: AI Intelligence & Nutrition */}
              <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4 hover:border-[#FF5500]/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-heading">AI & Nutrition</h3>
                    <p className="text-gray-400 text-xs">Coach, Macros & Calendar</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#202938]">
                  <button
                    onClick={() => handleGatedFeatureClick('/ai-coach', 'AI Coach')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>🤖 AI Personal Coach</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <Link
                    href="/nutrition"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>🥗 Nutrition Tracker</span>
                    <span className="text-[#FF5500]">→</span>
                  </Link>
                  <button
                    onClick={() => handleGatedFeatureClick('/calendar', 'Calendar')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>📅 Workout Calendar</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                </div>
              </div>

              {/* Portal 4: Community & Motivation */}
              <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4 hover:border-[#FF5500]/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-heading">Community & Beats</h3>
                    <p className="text-gray-400 text-xs">Social, Badges & Audio</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#202938]">
                  <button
                    onClick={() => handleGatedFeatureClick('/social', 'Social Feed')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>👥 Social Feed</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <button
                    onClick={() => handleGatedFeatureClick('/achievements', 'Achievements')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>🏆 Badges & Level XP</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                  <button
                    onClick={() => handleGatedFeatureClick('/music', 'Workout Music')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] hover:bg-[#18202C] text-xs font-bold text-gray-200 transition"
                  >
                    <span>🎵 Workout Music Player</span>
                    <span className="text-[#FF5500]">→</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Featured Workout Programs Section */}
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-2xl font-black text-white font-heading">📋 FEATURED TRAINING PROGRAMS</h2>
                <p className="text-gray-400 text-xs">Proven progressive overload routines for hypertrophy & power</p>
              </div>
              <Link
                href="/plans"
                className="text-[#FF5500] hover:text-[#E04B00] text-xs font-black uppercase tracking-wider font-heading transition"
              >
                View All Plans →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workoutPlans.length > 0 ? (
                workoutPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938] neu-inset flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-extrabold uppercase font-heading px-2 py-0.5 rounded bg-[#FF5500]/15 text-[#FF5500]">
                          {plan.level || 'Intermediate'}
                        </span>
                        <span className="text-gray-500 text-xs">{plan.duration || '8 Weeks'}</span>
                      </div>
                      <h3 className="font-bold text-white text-base font-heading mb-1">{plan.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2">{plan.description}</p>
                    </div>
                    <Link
                      href={`/workout-plan/${plan.id}`}
                      className="w-full py-2 bg-[#18202C] hover:bg-[#202938] text-white text-center text-xs font-bold rounded-xl border border-[#202938] transition block"
                    >
                      View Routine Details
                    </Link>
                  </div>
                ))
              ) : (
                [
                  { title: 'Push Pull Legs Overload', level: 'Intermediate', duration: '10 Weeks', desc: 'Complete hypertrophy split targeting all muscle groups twice weekly.' },
                  { title: '5x5 Strength Foundation', level: 'Beginner', duration: '6 Weeks', desc: 'Focus on core compound lifts: Squat, Bench Press, Deadlift & Overhead Press.' },
                  { title: 'Advanced Powerlifting Cycle', level: 'Advanced', duration: '12 Weeks', desc: 'Periodized peaking routine for maximum 1RM strength output.' }
                ].map((plan, i) => (
                  <div key={i} className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938] neu-inset flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-extrabold uppercase font-heading px-2 py-0.5 rounded bg-[#FF5500]/15 text-[#FF5500]">
                          {plan.level}
                        </span>
                        <span className="text-gray-500 text-xs">{plan.duration}</span>
                      </div>
                      <h3 className="font-bold text-white text-base font-heading mb-1">{plan.title}</h3>
                      <p className="text-gray-400 text-xs">{plan.desc}</p>
                    </div>
                    <Link
                      href="/plans"
                      className="w-full py-2 bg-[#18202C] hover:bg-[#202938] text-white text-center text-xs font-bold rounded-xl border border-[#202938] transition block"
                    >
                      View Routine Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Auth Gating Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={authConfig.title}
        description={authConfig.description}
        nextUrl={authConfig.nextUrl}
      />
    </ErrorBoundary>
  );
}