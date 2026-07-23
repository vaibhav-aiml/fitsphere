'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    
    // Get user name from localStorage
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
      } catch (e) {
        setUserName('User');
      }
    }
    
    fetchFeed();
    fetchRecentWorkout();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      toast.error('Failed to load feed');
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

    try {
      const response = await api.post('/posts', { content: newPost, privacy: postPrivacy });
      
      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPost('');
        toast.success('Post created! 🎉');
        fetchFeed(); // Refresh feed
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`, {});
      fetchFeed(); // Refresh to show updated likes
      toast.success('Liked! ❤️');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShareWorkout = async () => {
    if (!recentWorkout) {
      toast.error('No recent workout to share. Log a workout first!');
      return;
    }

    try {
      const response = await api.post('/share-workout', { workoutId: recentWorkout._id });
      
      if (response.data.success) {
        toast.success('Workout shared! 🎉');
        fetchFeed();
        setShowShareModal(false);
        
        // Copy to clipboard
        navigator.clipboard.writeText(response.data.shareText);
        toast.success('Share text copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share workout:', error);
      toast.error('Failed to share workout');
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Just now';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">👥 Social Feed</h1>
            <p className="text-gray-400 mt-1">Share your journey and stay motivated</p>
          </div>
          <Link href="/progress">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              View Progress →
            </button>
          </Link>
        </div>

        {/* Share Workout Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Share Your Achievement! 🎉</h2>
              {recentWorkout && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-white font-semibold">{recentWorkout.exerciseName}</p>
                  <p className="text-gray-400">{recentWorkout.weight}kg × {recentWorkout.reps} reps × {recentWorkout.sets} sets</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleShareWorkout}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Share Now
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Post */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <textarea
            placeholder="Share your workout achievement, progress, or motivation... 💪"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <select
              value={postPrivacy}
              onChange={(e) => setPostPrivacy(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends Only</option>
              <option value="private">🔒 Only Me</option>
            </select>
            <div className="flex gap-2">
              {recentWorkout && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Share Workout 🔄
                </button>
              )}
              <button
                onClick={handleCreatePost}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-gray-800/50 p-12 rounded-xl text-center border border-gray-700">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-lg">No posts yet</p>
              <p className="text-gray-500 text-sm mt-2">Share your first workout achievement!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(post.userId?.name)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{post.userId?.name || 'User'}</p>
                      <p className="text-gray-400 text-xs">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {post.privacy === 'public' ? '🌍' : post.privacy === 'friends' ? '👥' : '🔒'}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Actions */}
                <div className="flex gap-6 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition"
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition">
                    💬 {post.comments?.length || 0}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(post.content);
                      toast.success('Copied to clipboard!');
                    }}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition"
                  >
                    🔗 Share
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment._id} className="bg-gray-700/50 p-2 rounded-lg">
                        <span className="text-blue-400 text-sm font-semibold">{comment.userId?.name}: </span>
                        <span className="text-gray-300 text-sm">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}