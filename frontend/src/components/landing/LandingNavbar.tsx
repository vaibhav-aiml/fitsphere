'use client';

import React from 'react';
import Link from 'next/link';

interface LandingNavbarProps {
  darkMode: boolean;
  scrolled: boolean;
  toggleTheme: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ darkMode, scrolled, toggleTheme }) => {
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  const navBg = scrolled
    ? (darkMode ? 'bg-black/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl')
    : 'bg-transparent';
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navBg} border-b ${borderColor}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className={`text-xl font-bold ${textColor}`}>FitSphere</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className={`${subTextColor} hover:${darkMode ? 'text-white' : 'text-gray-900'} transition text-sm`}>Features</a>
          <a href="#pricing" className={`${subTextColor} hover:${darkMode ? 'text-white' : 'text-gray-900'} transition text-sm`}>Pricing</a>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <Link href="/auth/login">
            <button className={`px-5 py-2 ${subTextColor} hover:${darkMode ? 'text-white' : 'text-gray-900'} transition rounded-lg`}>
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
