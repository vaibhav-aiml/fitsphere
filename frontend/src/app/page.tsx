'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    { name: "Rajesh K.", role: "Powerlifter", text: "Added 40kg to my total in 12 weeks! The AI coach is game-changing.", rating: 5, avatar: "🏋️" },
    { name: "Priya S.", role: "Bodybuilder", text: "Best decision ever! Lost 12kg and gained muscle. The community keeps me motivated.", rating: 5, avatar: "💪" },
    { name: "Amit V.", role: "Fitness Enthusiast", text: "Finally an app that understands my goals. The 10-week program is intense but effective!", rating: 5, avatar: "🔥" }
  ];

  const plans = [
    { name: "Basic", price: "Free", features: ["3 Workout Plans", "Basic Analytics", "Community Access"], popular: false, color: "from-gray-600 to-gray-700" },
    { name: "Pro", price: "$9.99", features: ["All Workout Plans", "Advanced Analytics", "AI Coach", "Export Reports", "Priority Support"], popular: true, color: "from-blue-600 to-purple-600" },
    { name: "Elite", price: "$19.99", features: ["Everything in Pro", "1-on-1 Coaching", "Custom Meal Plans", "Video Analysis", "Monthly Progress Call"], popular: false, color: "from-purple-600 to-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background with Moving Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
        <motion.div 
          animate={{ x: [0, 200, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20"
        />
        <motion.div 
          animate={{ x: [0, -200, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600 rounded-full blur-[200px] opacity-10"
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              💪
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              FitSphere
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Testimonials', 'Pricing'].map((item, i) => (
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
                Login
              </motion.button>
            </Link>
            <Link href="/auth/signup">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59,130,246,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg"
              >
                Join Free
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
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-blue-400 text-sm font-semibold border border-blue-500/30 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                🔥 10,000+ Active Users
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.2]"
            >
              <span className="text-white">The Ultimate</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fitness Intelligence
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            >
              AI-powered coaching, personalized programs, and real-time tracking — everything you need to crush your fitness goals.
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
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/5 transition-all"
              >
                Watch Demo ▶️
              </motion.button>
            </motion.div>

            {/* Animated Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-20 flex flex-wrap justify-center gap-12"
            >
              {[
                { value: "50K+", label: "Workouts Completed", icon: "🏋️" },
                { value: "10K+", label: "Active Members", icon: "👥" },
                { value: "98%", label: "Success Rate", icon: "📈" },
                { value: "4.9", label: "App Rating", icon: "⭐" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-5 lg:left-20 top-1/3 text-6xl opacity-20 hidden lg:block"
        >
          💪
        </motion.div>
        <motion.div 
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute right-5 lg:right-20 bottom-1/3 text-5xl opacity-20 hidden lg:block"
        >
          🏃
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-1/2 top-20 text-4xl opacity-10 hidden lg:block"
        >
          🎯
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 overflow-hidden">
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
              Powerful features designed to help you reach your fitness potential
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🤖", title: "AI Coach", desc: "Personalized recommendations and form feedback", color: "from-blue-500 to-cyan-500", gradient: "blue", delay: 0 },
              { icon: "📊", title: "Advanced Analytics", desc: "Track volume, 1RM, and progress over time", color: "from-purple-500 to-pink-500", gradient: "purple", delay: 0.1 },
              { icon: "🎯", title: "Smart Programs", desc: "10-week powerlifting & bodybuilding plans", color: "from-orange-500 to-red-500", gradient: "orange", delay: 0.2 },
              { icon: "👥", title: "Social Feed", desc: "Share achievements & stay motivated", color: "from-green-500 to-teal-500", gradient: "green", delay: 0.3 },
              { icon: "🏆", title: "Gamification", desc: "Earn badges, level up, and complete challenges", color: "from-yellow-500 to-orange-500", gradient: "yellow", delay: 0.4 },
              { icon: "📱", title: "Works Everywhere", desc: "Fully responsive design for all devices", color: "from-indigo-500 to-blue-500", gradient: "indigo", delay: 0.5 }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              What Our <span className="text-yellow-500">Warriors</span> Say
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied users who transformed their lives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{t.avatar}</div>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-gray-300 italic">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
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
              Choose the plan that works for you. Upgrade or cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border ${
                  plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-700'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-gray-400">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-full font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'border border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Transform</span> Yourself?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join the fitness revolution. Start your free trial today — no credit card required.
            </p>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-blue-500/25 transition-all"
              >
                Start Your Journey 🚀
              </motion.button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">✓ Free forever ✓ No credit card required ✓ Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <div className="flex gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">Blog</a>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 FitSphere. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}