'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItem {
  name: string;
  icon: string;
  href: string;
  color?: string;
  category?: string;
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
  // Group navigation items logically for cleaner visual hierarchy
  const categories = [
    { title: 'CORE', items: ['/', '/workout'] },
    { title: 'TRAINING & PLANS', items: ['/plans', '/exercises', '/nutrition'] },
    { title: 'TOOLS & AI', items: ['/ai-coach', '/music', '/calendar'] },
    { title: 'PROGRESS & MORE', items: ['/progress', '/analytics', '/achievements', '/social', '/export'] }
  ];

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-full bg-[#0D1117] border-r border-[#202938] z-50 transition-all duration-300 flex flex-col justify-between ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#202938] flex justify-between items-center bg-[#090C10] shrink-0">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#CC4400] flex items-center justify-center text-white text-base font-black shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                ⚡
              </div>
              <span className="text-xl font-black font-heading text-white tracking-tight group-hover:text-[#FF5500] transition">
                FIT<span className="text-[#FF5500]">SPHERE</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-xl bg-[#11161F] hover:bg-[#18202C] text-gray-400 hover:text-white border border-[#202938] neu-raised transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Card */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-[#202938] bg-[#11161F]/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18202C] to-[#0D1117] border border-[#FF5500]/30 flex items-center justify-center text-white font-bold text-sm shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                {isGuest ? '👤' : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white font-bold text-xs truncate font-heading">
                  {isGuest ? 'Guest Athlete' : (user?.name || 'Athlete')}
                </p>
                <p className="text-gray-400 text-[10px] truncate">
                  {isGuest ? 'Browse Mode' : `${user?.goal || 'General Fitness'}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categorized Sleek Navigation List (Without ugly scrollbars) */}
        <nav className="flex-1 p-2.5 space-y-4 overflow-y-auto sleek-scrollbar">
          {categories.map((cat, catIdx) => {
            const catNavItems = navItems.filter(item => cat.items.includes(item.href));
            if (catNavItems.length === 0) return null;

            return (
              <div key={cat.title || catIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-black uppercase font-heading tracking-widest text-gray-500 mb-1">
                    {cat.title}
                  </p>
                )}
                {catNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition duration-150 text-xs font-medium ${
                        isActive
                          ? 'bg-[#18202C] text-white border border-[#FF5500]/50 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4),0_0_10px_rgba(255,85,0,0.15)] font-bold'
                          : 'text-gray-400 hover:text-white hover:bg-[#11161F] border border-transparent'
                      } ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : ''}`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <span className={`text-base ${isActive ? 'scale-110' : ''} transition`}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate flex-1 font-heading text-xs">{item.name}</span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_6px_#FF5500]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer / About Link / Logout */}
        <div className="p-2.5 border-t border-[#202938] bg-[#090C10] shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <Link
                href="/about"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#11161F] hover:bg-[#18202C] text-gray-300 text-[11px] font-bold border border-[#202938] transition"
              >
                ℹ️ About & Pricing
              </Link>
              {!isGuest ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 text-[11px] font-bold border border-red-800/30 transition"
                >
                  🚪 Logout
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center py-1.5 px-3 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white text-[11px] font-bold shadow-[0_0_12px_rgba(255,85,0,0.3)] transition"
                >
                  ⚡ Sign In / Register
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/about"
              className="w-full flex items-center justify-center p-2 rounded-xl bg-[#11161F] text-gray-300 hover:text-white text-xs"
              title="About FitSphere"
            >
              ℹ️
            </Link>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default SidebarNav;
