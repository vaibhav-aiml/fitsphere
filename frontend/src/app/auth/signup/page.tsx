'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    goal: 'bodybuilding',
    experience: 'beginner'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/register', formData);
      
      if (response.data.success) {
        toast.success('Account created successfully!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push(nextUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h1>
        <p className="text-gray-400 text-center mb-8">Join FitSphere and start your fitness journey</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-600"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-600"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-600"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Primary Goal</label>
            <select
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-600"
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
            >
              <option value="bodybuilding">Bodybuilding</option>
              <option value="powerlifting">Powerlifting</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="general-fitness">General Fitness</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link href={`/auth/login?next=${encodeURIComponent(nextUrl)}`} className="text-blue-500 hover:text-blue-400 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
        <SignupFormContent />
      </Suspense>
    </ErrorBoundary>
  );
}