'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const features = [
    { icon: "🤖", title: "AI-Powered Coaching", desc: "Personalized workout plans and real-time form feedback" },
    { icon: "📊", title: "Advanced Analytics", desc: "Track 1RM, volume, and progress with detailed insights" },
    { icon: "🎯", title: "Smart Programs", desc: "Science-based 10-week powerlifting & bodybuilding plans" },
    { icon: "👥", title: "Community Feed", desc: "Share achievements and connect with fitness enthusiasts" },
    { icon: "🏆", title: "Gamification", desc: "Earn badges, level up, and complete monthly challenges" },
    { icon: "🔒", title: "Privacy First", desc: "Your data is encrypted and completely secure" },
  ];

  const plans = [
    { name: "Starter", price: "$0", period: "forever", features: ["3 Workout Plans", "Basic Analytics", "Community Access"], popular: false },
    { name: "Pro", price: "$9.99", period: "month", features: ["All Workout Plans", "Advanced Analytics", "AI Coach", "Export Reports", "Priority Support"], popular: true },
    { name: "Elite", price: "$19.99", period: "month", features: ["Everything in Pro", "1-on-1 Coaching", "Custom Meal Plans", "Video Analysis", "Monthly Progress Call"], popular: false }
  ];

  const bgGradient = darkMode 
    ? "bg-gradient-to-br from-gray-950 via-black to-gray-950"
    : "bg-gradient-to-br from-gray-50 via-white to-gray-100";
  
  const cardBg = darkMode ? "bg-gray-900/40" : "bg-white/80";
  const cardBorder = darkMode ? "border-gray-800" : "border-gray-200";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-all duration-500 ${bgGradient}`}>
        {/* Background Orbs */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-[120px] opacity-20 animate-pulse delay-1000" />
        </div>

        <LandingNavbar darkMode={darkMode} scrolled={scrolled} toggleTheme={toggleTheme} />
        
        {/* Hero Section */}
        <LandingHero darkMode={darkMode} />

        {/* CTA Launch App */}
        <div className="relative z-10 text-center py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 transition duration-300 hover:scale-105"
          >
            <span>🚀 Open FitSphere App Now</span>
          </Link>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textColor}`}>
                Everything You Need to Transform
              </h2>
              <p className={subTextColor}>Designed for serious lifters and fitness enthusiasts</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className={`p-6 rounded-xl border ${cardBg} ${cardBorder} backdrop-blur-sm hover:border-blue-500/50 transition duration-300`}>
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>{f.title}</h3>
                  <p className={subTextColor}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textColor}`}>
                Simple, Transparent Pricing
              </h2>
              <p className={subTextColor}>Choose the plan that fits your goals</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((p, i) => (
                <div key={i} className={`p-8 rounded-2xl border ${cardBg} ${cardBorder} relative flex flex-col ${p.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}>
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Most Popular
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{p.name}</h3>
                  <div className="mb-6">
                    <span className={`text-4xl font-extrabold ${textColor}`}>{p.price}</span>
                    <span className={subTextColor}>/{p.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((feat, fi) => (
                      <li key={fi} className={`flex items-center gap-2 text-sm ${subTextColor}`}>
                        <span className="text-blue-500">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className={`w-full text-center py-3 rounded-xl font-semibold transition ${
                      p.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}
