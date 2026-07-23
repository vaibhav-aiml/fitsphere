'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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

import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function Achievements() {
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<UserLevel | null>({
    currentLevel: 1,
    levelName: 'Bronze Lifter',
    currentXP: 150,
    nextLevelXP: 500
  } as any);
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
      
      setUserLevel(levelRes.data);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-400 transition mb-2 block">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🏆 Achievements</h1>
            <p className="text-gray-400 mt-1">Track your progress and earn badges</p>
          </div>
        </div>

        {/* Level Card */}
        {userLevel && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 rounded-xl border border-yellow-700 mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-5xl">⭐</div>
                  <div>
                    <p className="text-gray-300 text-sm">YOUR LEVEL</p>
                    <p className="text-white text-4xl font-bold">Level {userLevel.level}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm">TOTAL XP</p>
                <p className="text-white text-2xl font-bold">{userLevel.totalXp.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress to Level {userLevel.level + 1}</span>
                <span>{userLevel.xp} / {userLevel.xpForNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${userLevel.xpProgress}%` }} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-yellow-800">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Workouts</p>
                <p className="text-white text-xl font-bold">{userLevel.totalWorkouts}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-white text-xl font-bold">🔥 {userLevel.streakDays} days</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Longest Streak</p>
                <p className="text-white text-xl font-bold">🏆 {userLevel.longestStreak} days</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Badges Earned</p>
                <p className="text-white text-xl font-bold">{badges.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Challenge */}
        {challenge && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-blue-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-3">📅 Monthly Challenge</h2>
            <p className="text-white text-lg font-semibold">{challenge.name}</p>
            <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{challengeProgress} / {challenge.target}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (challengeProgress / challenge.target) * 100)}%` }} />
              </div>
            </div>
            <p className="text-yellow-400 text-sm">🏆 Reward: {challenge.reward?.xpBonus} XP + "{challenge.reward?.badgeName}" Badge</p>
          </div>
        )}

        {/* Badges Section */}
        {Object.entries(badgeGroups).map(([category, categoryBadges]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{categoryNames[category] || category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBadges.map((badge) => (
                <div key={badge._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-yellow-500 transition text-center">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-white font-semibold text-sm">{badge.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{badge.description}</p>
                  <p className="text-yellow-500 text-xs mt-2">+{badge.points} XP</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {badges.length === 0 && (
          <div className="bg-gray-800/50 p-12 rounded-xl text-center border border-gray-700">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400 text-lg">No badges earned yet</p>
            <p className="text-gray-500 text-sm mt-2">Complete workouts to earn your first badge!</p>
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