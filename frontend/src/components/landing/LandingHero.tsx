'use client';

import React from 'react';
import Link from 'next/link';

interface LandingHeroProps {
  darkMode: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ darkMode }) => {
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6 text-center max-w-5xl z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 ${darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-100 border-blue-200'} rounded-full border mb-6`}>
          <span className="text-blue-500 text-xs font-medium">✨ AI-Powered Fitness Platform</span>
        </div>
        
        <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${textColor}`}>
          Train Smarter,{' '}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            Get Stronger
          </span>
        </h1>
        
        <p className={`${subTextColor} text-lg max-w-2xl mx-auto mb-10 leading-relaxed`}>
          The ultimate fitness platform with AI coaching, personalized programs, and real-time tracking. Join 10,000+ athletes transforming their bodies.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Free Trial
            </button>
          </Link>
          <a 
            href="#features" 
            className={`px-8 py-3 border ${darkMode ? 'border-gray-700 text-white hover:bg-white/5' : 'border-gray-300 text-gray-900 hover:bg-gray-100'} rounded-lg font-medium transition-all duration-300`}
          >
            View Features
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-12">
          {[
            { value: "50,000+", label: "Workouts Completed" },
            { value: "10,000+", label: "Active Users" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "4.9", label: "App Rating" }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className={`text-3xl font-bold ${textColor} group-hover:scale-110 transition-transform duration-300`}>{stat.value}</div>
              <div className={subTextColor}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
