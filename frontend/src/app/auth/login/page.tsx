'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ErrorBoundary from '@/components/ErrorBoundary';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const hasRedirected = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle session after Google login
  useEffect(() => {
    if (status === 'authenticated' && session && !hasRedirected.current) {
      const backendToken = (session.user as any)?.backendToken;
      const backendUser = (session.user as any)?.backendUser;
      
      if (backendToken && backendUser) {
        hasRedirected.current = true;
        localStorage.setItem('token', backendToken);
        localStorage.setItem('user', JSON.stringify(backendUser));
        toast.success('Google login successful!');
        router.push(nextUrl);
      }
    }
  }, [session, status, router, nextUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/login', formData);
      
      if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push(nextUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: nextUrl,
        redirect: false 
      });
      
      if (result?.error) {
        console.error('Google login error:', result.error);
        toast.error('Google login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090C10] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF5500]/5 rounded-full blur-[120px] pointer-events-none" />

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
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm font-sans mb-7">Sign in to continue your training</p>
          
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white text-gray-800 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center justify-center gap-3 mb-6 disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E2A3A]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#11161F] text-gray-600 font-sans uppercase tracking-wider">or</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5500] text-white py-2.5 rounded-xl hover:bg-[#e64d00] transition-all duration-200 font-heading font-bold text-sm tracking-wide disabled:opacity-50 shadow-[0_0_20px_rgba(255,85,0,0.2)] hover:shadow-[0_0_30px_rgba(255,85,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11161F]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-gray-500 text-center mt-6 text-sm font-sans">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup?next=${encodeURIComponent(nextUrl)}`} className="text-[#FF5500] hover:text-[#ff7733] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-[#090C10] text-white flex items-center justify-center font-sans">Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </ErrorBoundary>
  );
}