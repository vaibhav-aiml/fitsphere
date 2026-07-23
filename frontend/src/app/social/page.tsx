'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Post {
  _id: string;
  content: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    goal: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    userId: { name: string };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  imageUrl?: string;
  privacy: string;
}

export default function SocialFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recentWorkout, setRecentWorkout] = useState<any>(null);
  const [userName, setUserName] = useState('');

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
      } catch (e) {
        setUserName('User');
      }
    }
    
    if (token) {
      fetchFeed();
      fetchRecentWorkout();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentWorkout = async () => {
    try {
      const response = await api.get('/workout-logs?limit=1');
      if (response.data.logs && response.data.logs.length > 0) {
        setRecentWorkout(response.data.logs[0]);
      }
    } catch (error) {
      console.error('Failed to fetch recent workout:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error('Please write something');
      return;
    }

    requireAuth(async () => {
      try {
        const response = await api.post('/posts', { content: newPost, privacy: postPrivacy });
        
        if (response.data.success) {
          setPosts([response.data.post, ...posts]);
          setNewPost('');
          toast.success('Post created! 🎉');
          fetchFeed();
        }
      } catch (error) {
        console.error('Failed to create post:', error);
        toast.error('Failed to create post');
      }
    }, {
      title: 'Community Feed Requires Account',
      description: 'Sign in or create an account to share posts & connect with athletes.',
      nextUrl: '/social'
    });
  };

  const handleLike = async (postId: string) => {
    requireAuth(async () => {
      try {
        await api.post(`/posts/${postId}/like`, {});
        fetchFeed();
        toast.success('Liked! ❤️');
      } catch (error) {
        toast.error('Failed to like post');
      }
    }, {
      title: 'Community Feed Requires Account',
      description: 'Sign in to like posts and support fellow lifters.',
      nextUrl: '/social'
    });
  };

  const handleShareWorkout = async () => {
    if (!recentWorkout) {
      toast.error('No recent workout to share. Log a workout first!');
      return;
    }

    requireAuth(async () => {
      try {
        const response = await api.post('/share-workout', { workoutId: recentWorkout._id });
        
        if (response.data.success) {
          toast.success('Workout shared! 🎉');
          fetchFeed();
          setShowShareModal(false);
          navigator.clipboard.writeText(response.data.shareText);
        }
      } catch (error) {
        toast.error('Failed to share workout');
      }
    }, {
      title: 'Workout Sharing Requires Account',
      description: 'Sign in to share your workout logs with the community.',
      nextUrl: '/social'
    });
  };

  const formatDate = (date: string) => {
    if (!date) return 'Just now';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Athletic Feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
              👥 ATHLETE SOCIAL FEED
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Connect with fellow lifters, share personal records, and build accountability
            </p>
          </div>

          <Link href="/progress">
            <button className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition">
              View Progress →
            </button>
          </Link>
        </div>

        {/* Create Post Container */}
        <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-4">
          <textarea
            placeholder="Share a milestone, workout PR, or training thoughts with the community... 💪"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <select
              value={postPrivacy}
              onChange={(e) => setPostPrivacy(e.target.value)}
              className="px-3.5 py-2.5 bg-[#0D1117] text-white font-bold text-xs rounded-xl border border-[#202938] neu-inset"
            >
              <option value="public">🌍 Public Feed</option>
              <option value="friends">👥 Athletes Only</option>
              <option value="private">🔒 Private Log</option>
            </select>

            <div className="flex gap-2">
              {recentWorkout && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition"
                >
                  Share Recent PR 🔄
                </button>
              )}
              <button
                onClick={handleCreatePost}
                className="px-6 py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
              >
                Publish Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="bg-[#11161F] p-12 rounded-3xl text-center border border-[#202938] neu-raised">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="text-white font-black text-lg font-heading">No Posts Published Yet</h3>
              <p className="text-gray-400 text-xs mt-1">Be the first to publish a post or share a workout log!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#CC4400] flex items-center justify-center text-white font-black text-sm">
                      {getInitials(post.userId?.name)}
                    </div>
                    <div>
                      <p className="text-white font-bold font-heading text-sm">{post.userId?.name || 'Athlete'}</p>
                      <p className="text-gray-500 text-xs">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {post.privacy === 'public' ? '🌍' : '🔒'}
                  </span>
                </div>

                {/* Content */}
                <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-3 border-t border-[#202938]">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#FF5500] transition"
                  >
                    ❤️ {post.likes?.length || 0} Likes
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(post.content);
                      toast.success('Copied post text!');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition"
                  >
                    🔗 Share Link
                  </button>
                </div>
              </div>
            ))
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