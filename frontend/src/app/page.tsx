'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

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
  const navBg = scrolled 
    ? (darkMode ? "bg-black/80 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl")
    : "bg-transparent";
  const borderColor = darkMode ? "border-white/10" : "border-gray-200";

  return (
    <div className={`min-h-screen transition-all duration-500 ${bgGradient}`}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-[120px] opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-[150px] opacity-10" />
      </div>

      {/* Navbar */}
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
            {/* Theme Toggle Button */}
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

      {/* Hero Section */}
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

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

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
              <div 
                key={idx} 
                className={`${cardBg} backdrop-blur-sm p-6 rounded-xl border ${cardBorder} hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 group`}
              >
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
              <div 
                key={i} 
                className={`relative ${cardBg} p-6 rounded-xl border ${plan.popular ? 'border-blue-500/50 shadow-xl shadow-blue-500/10' : cardBorder} transition-all duration-300 hover:-translate-y-2`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-medium">
                    🔥 Popular
                  </div>
                )}
                <h3 className={`font-semibold text-lg mb-1 ${textColor}`}>{plan.name}</h3>
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${textColor}`}>{plan.price}</span>
                  {plan.period !== "forever" && <span className={subTextColor}>/{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-green-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl' 
                      : `border ${cardBorder} ${textColor} hover:bg-white/5`
                  }`}>
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${borderColor} py-12 ${darkMode ? 'bg-black/30' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className={`font-semibold text-sm mb-4 ${textColor}`}>COMPANY</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>About</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Press</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold text-sm mb-4 ${textColor}`}>RESOURCES</h4>
              <ul className="space-y-2">
                <li><a href="#features" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Features</a></li>
                <li><a href="#pricing" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Pricing</a></li>
                <li><Link href="/auth/login" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold text-sm mb-4 ${textColor}`}>SUPPORT</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Help Center</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Contact</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold text-sm mb-4 ${textColor}`}>LEGAL</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Privacy</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Terms</a></li>
                <li><a href="#" className={`${subTextColor} text-sm hover:${darkMode ? 'text-white' : 'text-gray-900'} transition`}>Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t ${borderColor} pt-6 text-center`}>
            <p className={`${subTextColor} text-sm`}>© 2026 FitSphere. All rights reserved.</p>
            <p className={`${subTextColor} text-xs mt-2`}>
              <a href="mailto:vaibhavbadaya53@gmail.com" className="hover:text-white transition">vaibhavbadaya53@gmail.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}