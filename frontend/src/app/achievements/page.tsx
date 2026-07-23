'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface UserLevel {
  level: number;
  xp: number;
  totalXp: number;
  streakDays: number;
  longestStreak: number;
  totalWorkouts: number;
  xpForNextLevel: number;
  xpProgress: number;
}

export default function Achievements() {
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<UserLevel | null>({
    level: 1,
    xp: 150,
    totalXp: 150,
    streakDays: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    xpForNextLevel: 500,
    xpProgress: 30
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [levelRes, badgesRes, challengeRes] = await Promise.all([
        api.get('/user-level'),
        api.get('/user-badges'),
        api.get('/monthly-challenges')
      ]);
      
      if (levelRes.data) setUserLevel(levelRes.data);
      setBadges(badgesRes.data.badges || []);
      setChallenge(challengeRes.data.challenges?.[0]);
      setChallengeProgress(challengeRes.data.progress || 0);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryNames: Record<string, string> = {
    strength: '🏋️ Strength Badges',
    consistency: '🔥 Consistency Badges',
    volume: '📊 Volume Badges',
    milestone: '🎉 Milestone Badges',
    challenge: '🏆 Challenge Badges'
  };

  const groupBadges = () => {
    const groups: Record<string, Badge[]> = {};
    badges.forEach(badge => {
      if (!groups[badge.category]) groups[badge.category] = [];
      groups[badge.category].push(badge);
    });
    return groups;
  };

  const badgeGroups = groupBadges();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Achievements...</div>
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
              🏆 ATHLETE ACHIEVEMENTS & RANKS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Unlock metallic medals, earn XP points, and complete monthly challenges
            </p>
          </div>
        </div>

        {/* Level Bento Card */}
        {userLevel && (
          <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised relative overflow-hidden">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5500] to-[#CC4400] flex items-center justify-center text-3xl text-white font-black shadow-[0_0_20px_rgba(255,85,0,0.4)]">
                  ⭐
                </div>
                <div>
                  <span className="text-[#FF5500] text-xs font-black uppercase font-heading tracking-wider">ATHLETE RANK</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">Level {userLevel.level}</h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-gray-400 text-xs font-bold uppercase font-heading tracking-wider">TOTAL EXPERIENCE</span>
                <p className="text-2xl sm:text-3xl font-black text-white font-heading">{userLevel.totalXp.toLocaleString()} <span className="text-[#FF5500] text-sm">XP</span></p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold text-gray-400 font-heading">
                <span>Progress to Level {userLevel.level + 1}</span>
                <span>{userLevel.xp} / {userLevel.xpForNextLevel} XP</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-3 overflow-hidden neu-inset">
                <div 
                  className="bg-[#FF5500] h-3 rounded-full transition-all duration-700 shadow-[0_0_12px_#FF5500]" 
                  style={{ width: `${Math.min(100, (userLevel.xpProgress || 30))}%` }} 
                />
              </div>
            </div>

            {/* Mini Metric Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#202938]">
              <div className="text-center">
                <span className="text-gray-500 text-[10px] font-black uppercase font-heading">Workouts</span>
                <p className="text-white text-xl font-bold font-heading">{userLevel.totalWorkouts || 0}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-[10px] font-black uppercase font-heading">Active Streak</span>
                <p className="text-[#FF5500] text-xl font-bold font-heading">🔥 {userLevel.streakDays || 0} DAYS</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-[10px] font-black uppercase font-heading">Best Streak</span>
                <p className="text-white text-xl font-bold font-heading">🏆 {userLevel.longestStreak || 0} DAYS</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-[10px] font-black uppercase font-heading">Unlocked Medals</span>
                <p className="text-emerald-400 text-xl font-bold font-heading">{badges.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Challenge Banner */}
        {challenge && (
          <div className="bg-[#11161F] p-6 rounded-3xl border border-[#FF5500]/40 neu-raised relative">
            <div className="flex items-center gap-2 text-[#FF5500] text-xs font-black uppercase font-heading tracking-wider mb-2">
              <span>📅</span> Monthly Challenge
            </div>
            <h2 className="text-2xl font-black text-white font-heading">{challenge.name}</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 mb-4">{challenge.description}</p>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs font-bold text-gray-400 font-heading">
                <span>Challenge Progress</span>
                <span>{challengeProgress} / {challenge.target}</span>
              </div>
              <div className="w-full bg-[#0D1117] rounded-full h-3 overflow-hidden neu-inset">
                <div 
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (challengeProgress / challenge.target) * 100)}%` }} 
                />
              </div>
            </div>
            <span className="text-[#FF5500] text-xs font-bold">🏆 Reward: +{challenge.reward?.xpBonus} XP + "{challenge.reward?.badgeName}" Badge</span>
          </div>
        )}

        {/* Badges Grid by Category */}
        {Object.entries(badgeGroups).map(([category, categoryBadges]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-black text-white font-heading">{categoryNames[category] || category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBadges.map((badge) => (
                <div key={badge._id} className="bg-[#11161F] p-5 rounded-3xl border border-[#202938] neu-raised hover:border-[#FF5500]/50 transition text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0D1117] border border-[#202938] neu-inset flex items-center justify-center text-3xl mx-auto mb-3">
                    {badge.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm font-heading">{badge.name}</h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{badge.description}</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase font-heading border border-[#FF5500]/30">
                    +{badge.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {badges.length === 0 && (
          <div className="bg-[#11161F] p-12 rounded-3xl text-center border border-[#202938] neu-raised">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-white font-black text-xl font-heading">No Medals Unlocked Yet</h3>
            <p className="text-gray-400 text-xs mt-1">Log workouts and hit volume benchmarks to earn your first athletic medal!</p>
          </div>
        )}

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