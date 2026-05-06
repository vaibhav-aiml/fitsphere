'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const features = [
    { icon: "🧠", title: "AI-Powered Coaching", desc: "Get personalized workout recommendations and form feedback from our intelligent coach.", color: "from-violet-500 to-purple-500", stat: "98% Accuracy" },
    { icon: "📊", title: "Advanced Analytics", desc: "Track your 1RM, volume, and progress with detailed charts and insights.", color: "from-blue-500 to-cyan-500", stat: "10+ Metrics" },
    { icon: "🎯", title: "Smart Programs", desc: "Follow science-based 10-week programs for powerlifting, bodybuilding, and more.", color: "from-orange-500 to-red-500", stat: "3 Programs" },
    { icon: "👥", title: "Community Feed", desc: "Share achievements, get inspired, and connect with fitness enthusiasts worldwide.", color: "from-green-500 to-emerald-500", stat: "10K+ Members" },
    { icon: "🏆", title: "Gamification", desc: "Earn badges, level up, complete challenges, and track your streaks.", color: "from-yellow-500 to-amber-500", stat: "20+ Badges" },
    { icon: "🔒", title: "Privacy First", desc: "Your data is encrypted and secure. You're in control of your information.", color: "from-indigo-500 to-blue-500", stat: "100% Secure" }
  ];

  const stats = [
    { value: "50,000+", label: "Workouts Completed", icon: "🏋️", suffix: "workouts" },
    { value: "10,000+", label: "Active Users", icon: "👥", suffix: "members" },
    { value: "98%", label: "Satisfaction Rate", icon: "⭐", suffix: "satisfied" },
    { value: "4.9", label: "App Rating", icon: "📱", suffix: "/5.0" }
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background with Mouse Follower */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
        
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ x: [0, 150, 0], y: [0, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[200px] opacity-15"
        />
        <motion.div 
          animate={{ x: [0, -150, 0], y: [0, -80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[200px] opacity-15"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600 rounded-full blur-[250px] opacity-10"
        />
        
        {/* Mouse Follower Glow */}
        <motion.div 
          className="fixed w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none z-50 hidden lg:block"
          animate={{ x: mousePosition.x - 160, y: mousePosition.y - 160 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer group">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl"
            >
              💪
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-pink-500 transition-all">
              FitSphere
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Stats', 'Pricing'].map((item, i) => (
              <motion.a 
                key={i}
                href={`#${item.toLowerCase()}`}
                whileHover={{ scale: 1.1, color: "#60A5FA" }}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                {item}
              </motion.a>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Link href="/auth/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition"
              >
                Sign In
              </motion.button>
            </Link>
            <Link href="/auth/signup">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg"
              >
                Start Free
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-6 relative z-10"
        >
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-blue-400 text-sm font-semibold border border-blue-500/20 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                ⚡ The Future of Fitness
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.2]"
            >
              <span className="text-white">Your</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Fitness Journey
              </span>
              <br />
              <span className="text-white">Starts Here</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            >
              Experience the perfect blend of AI coaching, personalized training, and community support. 
              Transform your body with intelligent workout plans and real-time progress tracking.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <span className="text-xl">→</span>
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/5 transition-all flex items-center gap-2"
              >
                Watch Demo
                <span className="text-xl">▶️</span>
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {['🏆 Best Fitness App 2024', '⚡ 4.9 App Store Rating', '🔒 256-bit Encryption', '🌍 10+ Countries'].map((badge, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-gray-400 text-sm">{badge}</span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-400 text-xs">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by <span className="text-blue-500">Thousands</span> of Athletes
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real results from real users around the world
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700 backdrop-blur-sm"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Succeed</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to accelerate your fitness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/40 p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400">{feature.stat}</span>
                  <span className="text-gray-600">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Transparent</span> Pricing
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your goals. Start free, upgrade anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700 transition-all"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">✓ 3 Basic Workout Plans</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Basic Analytics</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Community Access</li>
                <li className="flex items-center gap-2 text-gray-500">✗ AI Coach</li>
                <li className="flex items-center gap-2 text-gray-500">✗ Export Reports</li>
              </ul>
              <Link href="/auth/signup">
                <button className="w-full py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                  Get Started
                </button>
              </Link>
            </motion.div>

            {/* Pro Plan - Most Popular */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-blue-500 shadow-xl shadow-blue-500/10 transition-all"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">✓ All Workout Plans</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Advanced Analytics</li>
                <li className="flex items-center gap-2 text-gray-300">✓ AI Coach</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Export Reports</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Priority Support</li>
              </ul>
              <Link href="/auth/signup">
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition">
                  Start Pro Trial
                </button>
              </Link>
            </motion.div>

            {/* Elite Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700 transition-all"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$19.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">✓ Everything in Pro</li>
                <li className="flex items-center gap-2 text-gray-300">✓ 1-on-1 Coaching</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Custom Meal Plans</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Video Analysis</li>
                <li className="flex items-center gap-2 text-gray-300">✓ Monthly Progress Call</li>
              </ul>
              <Link href="/auth/signup">
                <button className="w-full py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                  Join Elite
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Transform</span> Your Body?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join 10,000+ members who are already achieving their fitness goals with FitSphere.
            </p>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(59,130,246,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xl shadow-2xl transition-all"
              >
                Start Your Journey Today 🚀
              </motion.button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">✓ No credit card required ✓ Free forever plan ✓ Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💪</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  FitSphere
                </span>
              </div>
              <p className="text-gray-500 text-sm">Your intelligent fitness companion for a stronger, healthier you.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm pt-8 border-t border-gray-800">
            <p>© 2024 FitSphere. All rights reserved. Made with 💪 for fitness enthusiasts worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}