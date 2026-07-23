'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSession, signOut } from 'next-auth/react';
import api from '@/lib/api';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import SidebarNav from '@/components/dashboard/SidebarNav';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function RootAppPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const hasHandledSession = useRef(false);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  const navItems = [
    { name: 'Dashboard', icon: '⚡', href: '/', color: 'blue' },
    { name: 'Workout Logger', icon: '🏋️‍♂️', href: '/workout', color: 'green' },
    { name: 'Workout Plans', icon: '📋', href: '/plans', color: 'purple' },
    { name: 'Nutrition', icon: '🥗', href: '/nutrition', color: 'emerald' },
    { name: 'AI Coach', icon: '🤖', href: '/ai-coach', color: 'cyan' },
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

    // Guard session evaluation with useRef to prevent re-triggering loops
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
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, plansRes] = await Promise.all([
        api.get('/profile'),
        api.get('/all-workout-plans').catch(() => ({ data: { plans: [] } }))
      ]);

      setUser(profileRes.data.user);
      setWorkoutPlans(plansRes.data.plans || []);
    } catch (err: any) {
      console.error('Failed to load user dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsGuest(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        fetchPublicPlans();
      }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white flex">
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

        {/* Main Content */}
        <main className={`flex-1 p-6 md:p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <div>
              <p className="text-blue-400 text-sm font-semibold tracking-wide uppercase">{greeting}</p>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {isGuest ? 'Welcome to FitSphere 👋' : `Welcome Back, ${user?.name?.split(' ')[0] || 'Athlete'}! 💪`}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {isGuest
                  ? 'Explore workout programs & fitness features. Sign in to start tracking!'
                  : `Goal: ${user?.goal || 'General Fitness'} • Keep crushing your targets`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                🕒 {currentTime}
              </span>
              {isGuest ? (
                <Link
                  href="/auth/login?next=/"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  Sign In / Register
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl border border-gray-700 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 p-6 rounded-2xl border border-blue-800/40 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Weekly Workouts</span>
                <span className="text-xl">🏋️‍♂️</span>
              </div>
              <p className="text-3xl font-extrabold">{isGuest ? '--' : (user?.weeklyWorkouts || '0')}</p>
              <p className="text-xs text-gray-400 mt-1">{isGuest ? 'Sign in to track workouts' : 'Target: 4 workouts/week'}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 p-6 rounded-2xl border border-purple-800/40 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Current Streak</span>
                <span className="text-xl">🔥</span>
              </div>
              <p className="text-3xl font-extrabold">{isGuest ? '--' : `${user?.streak || 0} days`}</p>
              <p className="text-xs text-gray-400 mt-1">{isGuest ? 'Sign in to build your streak' : 'Consistency is key'}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 p-6 rounded-2xl border border-emerald-800/40 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Total Volume</span>
                <span className="text-xl">📈</span>
              </div>
              <p className="text-3xl font-extrabold">{isGuest ? '--' : `${user?.totalVolume || 0} kg`}</p>
              <p className="text-xs text-gray-400 mt-1">{isGuest ? 'Sign in to log volume' : 'Cumulative weight lifted'}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-6 rounded-2xl border border-amber-800/40 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Athlete Rank</span>
                <span className="text-xl">🏆</span>
              </div>
              <p className="text-3xl font-extrabold">{isGuest ? 'Guest' : (user?.levelName || 'Bronze')}</p>
              <p className="text-xs text-gray-400 mt-1">{isGuest ? 'Sign in to unlock badges' : 'Level 1 Lifter'}</p>
            </div>
          </div>

          {/* Interactive Features Grid */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🚀</span> Explore FitSphere Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {navItems.slice(1).map((item) => (
                <div
                  key={item.href}
                  onClick={() => handleGatedFeatureClick(item.href, item.name)}
                  className="group bg-gray-900/50 hover:bg-gray-800/80 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">{item.icon}</div>
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition">{item.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {isGuest ? 'Click to explore feature' : 'Open feature tool'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition">
                    <span>{isGuest ? 'Try Feature' : 'Launch'}</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Workout Programs */}
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">📋 Featured Workout Templates</h2>
                <p className="text-gray-400 text-xs">Science-backed training programs for all levels</p>
              </div>
              <Link
                href="/plans"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                Browse All Plans →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workoutPlans.length > 0 ? (
                workoutPlans.slice(0, 3).map((plan: any, idx: number) => (
                  <div key={plan._id || idx} className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-base">{plan.title || plan.name}</h3>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-semibold">
                          {plan.category || plan.difficulty || 'All Levels'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-4 line-clamp-2">{plan.description || 'Structured workout routine designed for strength & hypertrophy.'}</p>
                    </div>
                    <Link
                      href={`/workout-plan/${plan._id}`}
                      className="w-full text-center py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition"
                    >
                      View Template Details
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500 text-sm">
                  No public templates loaded. Visit <Link href="/plans" className="text-blue-400 underline">Plans Page</Link> to view routines.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Soft-Gate Auth Modal */}
        <AuthModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={authConfig.title}
          description={authConfig.description}
          nextUrl={authConfig.nextUrl}
        />
      </div>
    </ErrorBoundary>
  );
}