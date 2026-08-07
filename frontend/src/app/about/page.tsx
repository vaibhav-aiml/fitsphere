'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AboutPage() {
  const features = [
    { 
      icon: '🤖', 
      title: 'AI Coaching', 
      desc: 'Personalized advice and form feedback' 
    },
    { 
      icon: '🏋️', 
      title: 'Smart Workout Plans', 
      desc: 'Jeff Nippard-style structured programs' 
    },
    { 
      icon: '🥗', 
      title: 'AI Nutrition Hub', 
      desc: 'AI meal scanning and diet planning' 
    },
    { 
      icon: '📊', 
      title: 'Progress Tracking', 
      desc: 'Real-time analytics and insights' 
    },
  ];

  const techStack = [
    'Next.js 14',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'Express',
    'MongoDB',
    'Groq AI',
  ];

  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: 'forever',
      features: ['3 Basic Workout Plans', 'Basic Analytics', 'Community Access'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹499',
      period: 'month',
      features: [
        'All Starter Features',
        'Advanced Analytics',
        'AI Coach Access',
        'Export Reports',
        'Priority Support',
      ],
      popular: true,
    },
    {
      name: 'Elite',
      price: '₹999',
      period: 'month',
      features: [
        'Everything in Pro',
        '1-on-1 Coaching',
        'Custom Meal Plans',
        'Video Analysis',
        'Monthly Progress Call',
      ],
      popular: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-obsidian text-white relative overflow-hidden font-sans">
        {/* Ambient Background Glows */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blaze/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blaze/5 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 border-b border-borderMuted/50 bg-obsidian/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze rounded">
              <h1 className="font-heading text-xl font-bold text-white tracking-tight">
                Fit<span className="text-blaze">Sphere</span>
              </h1>
            </Link>
            <Link
              href="/"
              className="px-5 py-2 bg-blaze hover:bg-blaze-hover text-white rounded-lg font-heading font-bold text-sm transition-all duration-200 shadow-[0_0_16px_rgba(255,85,0,0.25)] hover:shadow-[0_0_24px_rgba(255,85,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
            >
              Open App
            </Link>
          </div>
        </nav>

        {/* 1. Hero Section */}
        <section className="relative z-10 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-6 max-w-3xl"
          >
            <div className="inline-block px-4 py-1.5 bg-blaze/10 border border-blaze/20 rounded-full mb-6">
              <span className="text-blaze text-xs font-sans font-semibold uppercase tracking-wider">
                About FitSphere
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight mb-5">
              Train Smarter.<br />
              <span className="text-blaze">Get Stronger.</span>
            </h2>
            <p className="text-gray-400 text-lg font-sans max-w-xl mx-auto leading-relaxed">
              The all-in-one fitness platform built for serious lifters. AI coaching, advanced analytics, and structured powerbuilding routines.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blaze hover:bg-blaze-hover text-white rounded-xl font-heading font-bold text-sm tracking-wide transition-all duration-200 shadow-[0_0_24px_rgba(255,85,0,0.3)] hover:shadow-[0_0_36px_rgba(255,85,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
              >
                Launch App →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 2. Features Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                Everything You Need
              </h2>
              <p className="text-gray-400 font-sans">Built for serious lifters and fitness enthusiasts</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="p-6 rounded-2xl bg-charcoal border border-borderMuted hover:border-blaze/50 transition-all duration-300 group neu-raised flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-obsidian border border-borderMuted flex items-center justify-center text-2xl mb-4 group-hover:border-blaze/40 transition-colors">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-heading font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-gray-400 text-sm font-sans leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. New About Section (Creator & Tech Stack) */}
        <section className="py-20 relative z-10 border-t border-borderMuted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                Behind FitSphere
              </h2>
              <p className="text-gray-400 font-sans">Crafted with passion, modern tech, and evidence-based principles</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {/* Creator Card */}
              <motion.div
                variants={itemVariants}
                className="p-7 rounded-2xl bg-charcoal border border-borderMuted hover:border-blaze/50 transition-all duration-300 neu-raised flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-blaze/10 border border-blaze/40 flex items-center justify-center text-blaze font-heading font-extrabold text-xl shadow-[0_0_16px_rgba(255,85,0,0.2)]">
                      VB
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white">Vaibhav Badaya</h3>
                      <p className="text-blaze text-xs font-sans font-medium">Creator & Lead Developer</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm font-sans leading-relaxed mb-6">
                    Building intelligent SaaS applications combining cutting-edge web technologies, full-stack engineering, and AI-driven coaching systems.
                  </p>
                </div>

                <a
                  href="https://github.com/vaibhav-aiml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-elevated hover:bg-borderMuted border border-borderMuted hover:border-blaze/40 text-gray-200 hover:text-white font-heading font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze"
                >
                  <span>💻</span> GitHub (vaibhav-aiml) ↗
                </a>
              </motion.div>

              {/* Tech Stack Card */}
              <motion.div
                variants={itemVariants}
                className="p-7 rounded-2xl bg-charcoal border border-borderMuted hover:border-blaze/50 transition-all duration-300 neu-raised flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⚡</span>
                    <h3 className="text-xl font-heading font-bold text-white">Tech Stack</h3>
                  </div>
                  <p className="text-gray-400 text-sm font-sans leading-relaxed mb-6">
                    Engineered with modern full-stack performance, robust data safety, and real-time AI response streaming.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full bg-elevated border border-borderMuted text-xs font-sans font-medium text-gray-300 hover:border-blaze/40 hover:text-white transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4. Pricing Section */}
        <section className="py-20 relative z-10 border-t border-borderMuted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                Simple Pricing
              </h2>
              <p className="text-gray-400 font-sans">Choose the plan that fits your goals</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {plans.map((p, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className={`p-7 rounded-2xl bg-charcoal border relative flex flex-col justify-between neu-raised transition-all duration-300 hover:border-blaze/50 ${
                    p.popular
                      ? 'border-blaze/50 shadow-[0_0_30px_rgba(255,85,0,0.15)]'
                      : 'border-borderMuted'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blaze text-white text-[10px] font-heading font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(255,85,0,0.4)]">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white mb-1">{p.name}</h3>
                    <div className="mb-6">
                      <span className="text-3xl font-heading font-extrabold text-white">{p.price}</span>
                      <span className="text-gray-400 text-sm font-sans">/{p.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {p.features.map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-gray-300 font-sans">
                          <span className="text-blaze text-xs font-bold">✓</span> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/auth/signup"
                    className={`w-full text-center py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze ${
                      p.popular
                        ? 'bg-blaze hover:bg-blaze-hover text-white shadow-[0_0_16px_rgba(255,85,0,0.25)]'
                        : 'bg-elevated hover:bg-borderMuted text-gray-200 hover:text-white border border-borderMuted'
                    }`}
                  >
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer className="relative z-10 border-t border-borderMuted py-8 bg-obsidian">
          <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-400 text-sm font-sans">
              © 2026 FitSphere. Built for lifters, by lifters.
            </p>
            <p className="text-gray-400 text-sm font-sans">
              Created by{' '}
              <a
                href="https://github.com/vaibhav-aiml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blaze hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze rounded"
              >
                Vaibhav Badaya
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
