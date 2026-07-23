'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  icon: string;
  href: string;
  color: string;
}

interface SidebarNavProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  user: any;
  navItems: NavItem[];
  pathname: string;
  handleLogout: () => void;
  isGuest?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  user,
  navItems,
  pathname,
  handleLogout,
  isGuest = false
}) => {
  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-full bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              FitSphere
            </span>
          </Link>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 text-white transition"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {isGuest ? '👤' : (user?.name?.charAt(0) || 'U')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">
                {isGuest ? 'Guest Athlete' : (user?.name || 'Athlete')}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {isGuest ? 'Browse Mode' : `${user?.goal || 'Fitness'} • Level 1`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}>
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </div>
            </Link>
          );
        })}

        {/* Link to About & Pricing */}
        <Link href="/about">
          <div className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${
            pathname === '/about'
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
              : 'hover:bg-white/5 text-gray-400 hover:text-white'
          }`}>
            <span className="text-xl">ℹ️</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">About & Pricing</span>}
          </div>
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/90">
        {isGuest ? (
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm"
          >
            <span>🔑</span>
            {!sidebarCollapsed && <span>Sign In / Register</span>}
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 transition"
          >
            <span className="text-xl">🚪</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SidebarNav;
