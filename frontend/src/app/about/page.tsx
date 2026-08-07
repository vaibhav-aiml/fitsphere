'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';
import LogoMark from '@/components/LogoMark';

export default function AboutPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const features = [
    {
      num: '01',
      title: 'AI Coaching',
      desc: 'Personalized advice and form feedback powered by domain-tuned LLM reasoning.',
      featured: true,
      icon: (
        <svg className="w-7 h-7 text-blaze" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Smart Workout Plans',
      desc: 'Jeff Nippard-style structured programs with periodized volume and load tracking.',
      featured: false,
      icon: (
        <svg className="w-7 h-7 text-blaze" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'AI Nutrition Hub',
      desc: 'AI meal scanning and diet planning tailored to your exact macro & calorie targets.',
      featured: false,
      icon: (
        <svg className="w-7 h-7 text-blaze" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Progress Tracking',
      desc: 'Real-time analytics, 1RM progression curves, and volume breakdown charts.',
      featured: false,
      icon: (
        <svg className="w-7 h-7 text-blaze" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
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

  const marqueeTech = [...techStack, ...techStack, ...techStack, ...techStack];

  const plans = [
    {
      name: 'Starter',
      priceMonthly: '₹0',
      priceAnnual: '₹0',
      period: 'forever',
      features: ['3 Basic Workout Plans', 'Basic Analytics', 'Community Access'],
      popular: false,
      icon: (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'Pro',
      priceMonthly: '₹499',
      priceAnnual: '₹399',
      period: 'month',
      features: [
        'All Starter Features',
        'Advanced Analytics',
        'AI Coach Access',
        'Export Reports',
        'Priority Support',
      ],
      popular: true,
      icon: (
        <svg className="w-5 h-5 text-blaze drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    {
      name: 'Elite',
      priceMonthly: '₹999',
      priceAnnual: '₹799',
      period: 'month',
      features: [
        'Everything in Pro',
        '1-on-1 Coaching',
        'Custom Meal Plans',
        'Video Analysis',
        'Monthly Progress Call',
      ],
      popular: false,
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 5 5.5.8-4 3.9 1 5.3-5-2.6-5 2.6 1-5.3-4-3.9 5.5-.8L12 3z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-obsidian text-white relative overflow-hidden font-sans selection:bg-blaze selection:text-white">
        {/* Keyframe & Custom Styles */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-infinite {
            display: flex;
            width: max-content;
            animation: marquee 22s linear infinite;
          }
          .animate-marquee-infinite:hover {
            animation-play-state: paused;
          }
          .text-stroke-ghost {
            -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.05);
          }
        `}</style>

        {/* Film Grain Noise Texture Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Off-Center Radial Glow & Faint Diagonal Grid Overlay */}
        <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-blaze/10 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#20293818_1px,transparent_1px),linear-gradient(to_bottom,#20293818_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_70%_20%,#000_60%,transparent_100%)] pointer-events-none z-0" />

        {/* Navigation */}
        <nav className="relative z-20 border-b border-borderMuted/50 bg-obsidian/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze rounded">
              <div className="w-7 h-7 rounded-lg bg-elevated border border-blaze/25 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(255,85,0,0.2)]">
                <LogoMark size={18} />
              </div>
              <h1 className="font-heading text-xl font-semibold text-white tracking-tight">
                Fit<span className="text-blaze">Sphere</span>
              </h1>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-blaze hover:bg-blaze-hover text-white rounded-lg font-heading font-semibold text-sm transition-all duration-200 shadow-[0_0_16px_rgba(255,85,0,0.25)] hover:shadow-[0_0_24px_rgba(255,85,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
            >
              Open App
            </Link>
          </div>
        </nav>

        {/* 1. HERO SECTION */}
        <section className="relative z-10 pt-20 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Restrained Ghost Text */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 select-none pointer-events-none z-0 hidden lg:block">
            <span className="text-[9rem] md:text-[11rem] font-heading font-bold text-transparent text-stroke-ghost tracking-tighter opacity-[0.04] block uppercase leading-none">
              FITSPHERE
            </span>
          </div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blaze/10 border border-blaze/20 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blaze animate-pulse" />
                <span className="text-blaze text-xs font-sans font-medium uppercase tracking-wider">
                  About FitSphere
                </span>
              </div>

              {/* Hero Headline: text-4xl md:text-5xl font-heading font-bold leading-tight tracking-tight */}
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight tracking-tight mb-5">
                Train Smarter.<br />
                <span className="text-blaze">Get Stronger.</span>
              </h1>

              {/* Hero Subtext: text-base md:text-lg font-sans font-normal text-gray-400 */}
              <p className="text-gray-400 text-base md:text-lg font-sans font-normal max-w-xl leading-relaxed mb-8">
                The all-in-one fitness platform built for serious lifters. AI coaching, advanced analytics, and a community that pushes you forward.
              </p>

              <div className="flex items-center gap-4">
                {/* Hero Button: text-sm font-heading font-semibold */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 px-7 py-3 bg-blaze hover:bg-blaze-hover text-white rounded-xl font-heading font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_0_24px_rgba(255,85,0,0.3)] hover:shadow-[0_0_36px_rgba(255,85,0,0.45)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze"
                >
                  <span>Launch App</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. FEATURES SECTION */}
        <section className="py-20 relative z-10 border-t border-borderMuted/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4"
            >
              <div>
                {/* Eyebrow: text-xs font-sans font-medium uppercase tracking-wider */}
                <span className="text-blaze text-xs font-sans font-medium uppercase tracking-wider block mb-2">
                  System Architecture
                </span>
                {/* Section Heading: text-2xl md:text-3xl font-heading font-semibold tracking-tight */}
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white tracking-tight">
                  Everything You Need
                </h2>
              </div>
              {/* Section Subheading: text-sm font-sans font-normal text-gray-500 */}
              <p className="text-gray-500 font-sans font-normal max-w-md text-sm leading-relaxed">
                Built specifically for serious lifters, powerbuilders, and fitness enthusiasts who demand data integrity and real intelligence.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className={`neu-raised rounded-2xl p-7 relative flex flex-col justify-between overflow-hidden transition-all duration-300 group border border-borderMuted hover:border-blaze/60 ${
                    f.featured
                      ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-charcoal via-charcoal to-elevated/70'
                      : 'bg-charcoal'
                  }`}
                >
                  {/* Numerals in corner */}
                  <span className="text-4xl font-heading font-bold text-white/5 absolute bottom-4 right-5 select-none font-mono group-hover:text-blaze/10 transition-colors">
                    {f.num}
                  </span>

                  <div>
                    {/* Featured Pill Badge: text-[10px] font-sans font-medium uppercase tracking-wider */}
                    {f.featured && (
                      <span className="inline-block px-3 py-1 bg-blaze/15 border border-blaze/30 text-blaze text-[10px] font-sans font-medium rounded-full uppercase tracking-wider mb-5">
                        Primary Intelligence
                      </span>
                    )}

                    {/* Unboxed SVG Line Icon */}
                    <div className="mb-5 group-hover:scale-105 transition-transform duration-300 origin-left">
                      {f.icon}
                    </div>

                    {/* Card Title: text-base md:text-lg font-heading font-semibold */}
                    <h3 className="text-base md:text-lg font-heading font-semibold text-white mb-2">
                      {f.title}
                    </h3>

                    {/* Card Body: text-sm font-sans font-normal text-gray-400 */}
                    <p className="text-gray-400 text-sm font-sans font-normal leading-relaxed max-w-md">
                      {f.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-borderMuted/40 flex items-center gap-2 text-xs font-sans font-medium text-blaze opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>EXPLORE CAPABILITIES</span>
                    <span>→</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ABOUT / CREATOR SECTION */}
        <section className="py-20 relative z-10 border-t border-borderMuted/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-9 h-9 rounded-xl bg-blaze/10 border border-blaze/30 flex items-center justify-center text-blaze">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <div>
                {/* Eyebrow */}
                <span className="text-blaze text-xs font-sans font-medium uppercase tracking-wider block">
                  Origin & Craft
                </span>
                {/* Section Heading */}
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white tracking-tight">
                  Behind FitSphere
                </h2>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Creator Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 bg-charcoal neu-raised rounded-2xl p-7 md:p-8 relative overflow-hidden border-l-4 border-l-blaze border border-borderMuted flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blaze/5 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-blaze/10 border border-blaze/40 flex items-center justify-center text-blaze font-heading font-bold text-xl shadow-[0_0_16px_rgba(255,85,0,0.2)]">
                      VB
                    </div>
                    <div>
                      {/* Card Title */}
                      <h3 className="text-base md:text-lg font-heading font-semibold text-white">Vaibhav Badaya</h3>
                      <p className="text-blaze text-xs font-sans font-medium uppercase tracking-wider mt-0.5">
                        Creator & Lead Engineer
                      </p>
                    </div>
                  </div>

                  {/* Creator Pull-Quote */}
                  <blockquote className="border-l-2 border-blaze/40 pl-4 my-5 text-gray-400 font-sans italic text-sm md:text-base leading-relaxed font-normal">
                    &ldquo;I built FitSphere because I was tired of generic workout apps—lifters deserve AI tools engineered with science, precision, and zero fluff.&rdquo;
                  </blockquote>
                </div>

                <div className="mt-6 pt-5 border-t border-borderMuted/50">
                  <a
                    href="https://github.com/vaibhav-aiml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-elevated hover:bg-borderMuted border border-borderMuted hover:border-blaze/50 text-gray-300 hover:text-white font-heading font-semibold text-sm transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze"
                  >
                    <svg className="w-4 h-4 text-blaze shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>github.com/vaibhav-aiml</span>
                    <span className="text-blaze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                </div>
              </motion.div>

              {/* Tech Stack Marquee Strip */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 bg-charcoal neu-raised rounded-2xl p-7 md:p-8 border border-borderMuted flex flex-col justify-between overflow-hidden relative"
              >
                <div>
                  {/* Eyebrow */}
                  <span className="text-blaze text-xs font-sans font-medium uppercase tracking-wider block mb-2">
                    Infrastructure
                  </span>
                  {/* Card Title */}
                  <h3 className="text-base md:text-lg font-heading font-semibold text-white mb-2">
                    Modern Stack
                  </h3>
                  {/* Card Body */}
                  <p className="text-gray-400 text-sm font-sans font-normal leading-relaxed mb-6">
                    Built with production-grade Next.js App Router, Express REST APIs, Mongoose models, and Groq LLM streaming capabilities.
                  </p>
                </div>

                {/* Auto-Scrolling Marquee Strip */}
                <div className="py-3 border-y border-borderMuted/50 overflow-hidden relative w-full bg-elevated/40 rounded-xl">
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-charcoal to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-charcoal to-transparent z-10 pointer-events-none" />

                  <div className="animate-marquee-infinite gap-2.5 px-2">
                    {marqueeTech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-elevated border border-borderMuted text-xs font-sans font-medium text-gray-300 hover:border-blaze/50 hover:text-white whitespace-nowrap transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. PRICING SECTION */}
        <section className="py-20 relative z-10 border-t border-borderMuted/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              {/* Eyebrow */}
              <span className="text-blaze text-xs font-sans font-medium uppercase tracking-wider block mb-2">
                Transparent Plans
              </span>
              {/* Section Heading */}
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white tracking-tight mb-2">
                Simple Pricing
              </h2>
              {/* Section Subheading */}
              <p className="text-gray-500 font-sans font-normal max-w-md mx-auto text-sm">
                Choose the plan tailored to your fitness journey. Upgrade or cancel anytime.
              </p>
            </motion.div>

            {/* Interactive Monthly/Annual Toggle Switch */}
            <div className="flex items-center justify-center gap-3.5 mb-14">
              <span className={`text-sm font-sans font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                Monthly Billing
              </span>

              <button
                onClick={() => setBillingCycle(prev => (prev === 'monthly' ? 'annual' : 'monthly'))}
                className="w-12 h-7 bg-elevated border border-borderMuted rounded-full p-1 relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze"
                aria-label="Toggle Billing Cycle"
              >
                <motion.div
                  animate={{ x: billingCycle === 'annual' ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-blaze rounded-full shadow-md"
                />
              </button>

              <span className={`text-sm font-sans font-medium flex items-center gap-2 transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-gray-500'}`}>
                Annual Billing
                <span className="px-2 py-0.5 bg-blaze/15 border border-blaze/30 text-blaze text-[10px] font-sans font-medium rounded-full uppercase tracking-wider">
                  Save 20%
                </span>
              </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
              {plans.map((p, i) => {
                const currentPrice = billingCycle === 'annual' ? p.priceAnnual : p.priceMonthly;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: p.popular ? 0.1 : i * 0.15 }}
                    className={`neu-raised rounded-2xl p-7 relative flex flex-col justify-between transition-all duration-300 ${
                      p.popular
                        ? 'md:-translate-y-4 md:z-10 bg-charcoal border-2 border-blaze/80 shadow-[0_0_36px_rgba(255,85,0,0.18)]'
                        : 'bg-charcoal border border-borderMuted hover:border-blaze/40'
                    }`}
                  >
                    {/* Featured Podium Badge */}
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blaze text-white text-[10px] font-heading font-semibold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_14px_rgba(255,85,0,0.4)]">
                        Most Popular
                      </span>
                    )}

                    <div>
                      {/* Tier Icon */}
                      <div className="mb-5 flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-elevated border border-borderMuted">
                          {p.icon}
                        </div>
                        {billingCycle === 'annual' && p.priceMonthly !== '₹0' && (
                          <span className="text-xs text-gray-500 line-through font-mono">
                            {p.priceMonthly}/mo
                          </span>
                        )}
                      </div>

                      {/* Card Title: Tier Name */}
                      <h3 className="text-base md:text-lg font-heading font-semibold text-white mb-2">{p.name}</h3>

                      {/* Pricing Number: text-3xl md:text-4xl font-heading font-bold */}
                      <div className="mb-6">
                        <span className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
                          {currentPrice}
                        </span>
                        <span className="text-gray-500 text-sm font-sans font-normal ml-1">/{p.period}</span>
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-3 mb-8">
                        {p.features.map((feat, fi) => (
                          <li key={fi} className="flex items-center gap-2.5 text-sm text-gray-400 font-sans font-normal">
                            <svg className="w-3.5 h-3.5 text-blaze shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <Link
                      href="/auth/signup"
                      className={`w-full text-center py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-300 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blaze ${
                        p.popular
                          ? 'bg-blaze hover:bg-blaze-hover text-white shadow-[0_0_18px_rgba(255,85,0,0.28)] hover:shadow-[0_0_28px_rgba(255,85,0,0.4)]'
                          : 'bg-elevated hover:bg-borderMuted text-gray-300 hover:text-white border border-borderMuted'
                      }`}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. FOOTER */}
        <footer className="relative z-10 border-t border-borderMuted py-8 bg-obsidian">
          <div className="container mx-auto px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-500 text-sm font-sans font-normal">
              © 2026 FitSphere. Built for lifters, by lifters.
            </p>
            <p className="text-gray-500 text-sm font-sans font-normal flex items-center justify-center gap-1">
              <span>Created by</span>
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
