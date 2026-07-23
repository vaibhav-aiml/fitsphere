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

  const goals = [
    { value: 'bodybuilding', label: 'Bodybuilding' },
    { value: 'powerlifting', label: 'Powerlifting' },
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'general-fitness', label: 'General Fitness' },
  ];

  return (
    <div className="min-h-screen bg-[#090C10] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF5500]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded">
            <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
              Fit<span className="text-[#FF5500]">Sphere</span>
            </h2>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#11161F] p-8 rounded-2xl border border-[#1E2A3A] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm font-sans mb-7">Start your training journey</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1.5 text-xs font-sans font-medium uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-[#0D1117] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500] border border-[#1E2A3A] text-sm font-sans placeholder-gray-600 transition"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 text-xs font-sans font-medium uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-[#0D1117] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500] border border-[#1E2A3A] text-sm font-sans placeholder-gray-600 transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 text-xs font-sans font-medium uppercase tracking-wider">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-[#0D1117] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500] border border-[#1E2A3A] text-sm font-sans placeholder-gray-600 transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 text-xs font-sans font-medium uppercase tracking-wider">Primary Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setFormData({...formData, goal: g.value})}
                    className={`px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                      formData.goal === g.value
                        ? 'bg-[#FF5500]/10 border-[#FF5500]/50 text-[#FF5500]'
                        : 'bg-[#0D1117] border-[#1E2A3A] text-gray-400 hover:border-[#2A3544]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5500] text-white py-2.5 rounded-xl hover:bg-[#e64d00] transition-all duration-200 font-heading font-bold text-sm tracking-wide disabled:opacity-50 shadow-[0_0_20px_rgba(255,85,0,0.2)] hover:shadow-[0_0_30px_rgba(255,85,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11161F] mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-gray-500 text-center mt-6 text-sm font-sans">
            Already have an account?{' '}
            <Link href={`/auth/login?next=${encodeURIComponent(nextUrl)}`} className="text-[#FF5500] hover:text-[#ff7733] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-[#090C10] text-white flex items-center justify-center font-sans">Loading...</div>}>
        <SignupFormContent />
      </Suspense>
    </ErrorBoundary>
  );
}