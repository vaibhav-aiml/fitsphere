'use client';

import React, { useEffect, useState } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
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
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-[120px] opacity-20 animate-pulse delay-1000" />
        </div>

        <LandingNavbar darkMode={darkMode} scrolled={scrolled} toggleTheme={toggleTheme} />
        <LandingHero darkMode={darkMode} />

        {/* Features Section */}
        <section id="features" className="py-20 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textColor}`}>
                Everything You <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Need</span>
              </h2>
              <p className={subTextColor}>Powerful features designed for your fitness journey</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className={`${cardBg} backdrop-blur-sm p-6 rounded-xl border ${cardBorder} hover:border-blue-500/50 transition-all duration-300 group`}>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className={`font-semibold text-lg mb-2 ${textColor}`}>{feature.title}</h3>
                  <p className={subTextColor}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 border-t border-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textColor}`}>
                Simple, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Transparent</span> Pricing
              </h2>
              <p className={subTextColor}>Choose the plan that works for you</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <div key={i} className={`relative ${cardBg} p-6 rounded-xl border ${plan.popular ? 'border-blue-500/50 shadow-xl' : cardBorder}`}>
                  <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-bold ${textColor}`}>{plan.price}</span>
                    <span className={subTextColor}>/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className={`text-sm ${subTextColor} flex items-center gap-2`}>
                        <span className="text-blue-500">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}