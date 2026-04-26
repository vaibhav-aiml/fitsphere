'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle session after Google login
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    
    if (status === 'authenticated' && session) {
      const backendToken = (session.user as any)?.backendToken;
      const backendUser = (session.user as any)?.backendUser;
      
      console.log("Backend token:", backendToken);
      console.log("Backend user:", backendUser);
      
      if (backendToken && backendUser) {
        localStorage.setItem('token', backendToken);
        localStorage.setItem('user', JSON.stringify(backendUser));
        toast.success('Google login successful!');
        router.push('/dashboard');
      } else {
        console.error("No backend token received");
        toast.error('Login failed - no token received');
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', formData);
      
      if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/dashboard');
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
        callbackUrl: '/dashboard',
        redirect: false 
      });
      
      console.log("SignIn result:", result);
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-400 text-center mb-8">Login to continue your fitness journey</p>
        
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full bg-white text-gray-800 py-3 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
          </div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}