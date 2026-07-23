'use client';

import React from 'react';
import Link from 'next/link';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AboutPage() {

  const features = [
    { icon: '🤖', title: 'AI-Powered Coaching', desc: 'Personalized workout plans and real-time form feedback' },
    { icon: '📊', title: 'Advanced Analytics', desc: 'Track 1RM, volume, and progress with detailed insights' },
    { icon: '🎯', title: 'Smart Programs', desc: 'Science-based 10-week powerlifting & bodybuilding plans' },
    { icon: '👥', title: 'Community Feed', desc: 'Share achievements and connect with fitness enthusiasts' },
    { icon: '🏆', title: 'Gamification', desc: 'Earn badges, level up, and complete monthly challenges' },
    { icon: '🔒', title: 'Privacy First', desc: 'Your data is encrypted and completely secure' },
  ];

  const plans = [
    { name: 'Starter', price: '$0', period: 'forever', features: ['3 Workout Plans', 'Basic Analytics', 'Community Access'], popular: false },
    { name: 'Pro', price: '$9.99', period: 'month', features: ['All Workout Plans', 'Advanced Analytics', 'AI Coach', 'Export Reports', 'Priority Support'], popular: true },
    { name: 'Elite', price: '$19.99', period: 'month', features: ['Everything in Pro', '1-on-1 Coaching', 'Custom Meal Plans', 'Video Analysis', 'Monthly Progress Call'], popular: false }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#090C10] relative overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF5500]/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#FF5500]/5 rounded-full blur-[140px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 border-b border-[#1E2A3A]/50 bg-[#090C10]/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] rounded">
              <h1 className="font-heading text-xl font-bold text-white tracking-tight">
                Fit<span className="text-[#FF5500]">Sphere</span>
              </h1>
            </Link>
            <Link
              href="/"
              className="px-5 py-2 bg-[#FF5500] hover:bg-[#e64d00] text-white rounded-lg font-heading font-bold text-sm transition-all duration-200 shadow-[0_0_16px_rgba(255,85,0,0.2)] hover:shadow-[0_0_24px_rgba(255,85,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090C10]"
            >
              Open App
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 pt-20 pb-16 text-center">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-full mb-6">
              <span className="text-[#FF5500] text-xs font-sans font-medium uppercase tracking-wider">About FitSphere</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-5">
              Train Smarter.<br />
              <span className="text-[#FF5500]">Get Stronger.</span>
            </h2>
            <p className="text-gray-400 text-lg font-sans max-w-xl mx-auto leading-relaxed">
              The all-in-one fitness platform built for serious lifters. AI coaching, advanced analytics, and a community that pushes you forward.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF5500] hover:bg-[#e64d00] text-white rounded-xl font-heading font-bold text-sm tracking-wide transition-all duration-200 shadow-[0_0_24px_rgba(255,85,0,0.3)] hover:shadow-[0_0_36px_rgba(255,85,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090C10]"
              >
                Launch App →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                Everything You Need
              </h2>
              <p className="text-gray-500 font-sans">Built for serious lifters and fitness enthusiasts</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-xl bg-[#11161F] border border-[#1E2A3A] hover:border-[#FF5500]/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-lg bg-[#0D1117] border border-[#1E2A3A] flex items-center justify-center text-2xl mb-4 group-hover:border-[#FF5500]/30 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm font-sans leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                Simple Pricing
              </h2>
              <p className="text-gray-500 font-sans">Choose the plan that fits your goals</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((p, i) => (
                <div key={i} className={`p-7 rounded-2xl bg-[#11161F] border relative flex flex-col ${
                  p.popular 
                    ? 'border-[#FF5500]/50 shadow-[0_0_30px_rgba(255,85,0,0.1)]' 
                    : 'border-[#1E2A3A]'
                }`}>
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5500] text-white text-[10px] font-heading font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-heading font-bold text-white mb-1">{p.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-heading font-extrabold text-white">{p.price}</span>
                    <span className="text-gray-500 text-sm font-sans">/{p.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((feat, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-gray-400 font-sans">
                        <span className="text-[#FF5500] text-xs">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className={`w-full text-center py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500] ${
                      p.popular
                        ? 'bg-[#FF5500] hover:bg-[#e64d00] text-white shadow-[0_0_16px_rgba(255,85,0,0.25)]'
                        : 'bg-[#18202C] hover:bg-[#1E2A3A] text-gray-300'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#1E2A3A] py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-600 text-sm font-sans">© 2024 FitSphere. Built for lifters, by lifters.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
