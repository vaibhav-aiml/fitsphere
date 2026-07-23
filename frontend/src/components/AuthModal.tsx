'use client';

import React from 'react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  nextUrl?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = 'Authentication Required',
  description = 'Sign in or create a free account to access this feature.',
  nextUrl = '/'
}: AuthModalProps) {
  if (!isOpen) return null;

  const encodedNext = encodeURIComponent(nextUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#11161F] border border-[#202938] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative neu-raised">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#18202C] text-gray-400 hover:text-white flex items-center justify-center border border-[#202938] transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#FF5500]/15 text-[#FF5500] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-[#FF5500]/30 shadow-[0_0_20px_rgba(255,85,0,0.2)]">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-white font-heading mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/auth/login?next=${encodedNext}`}
            className="block w-full text-center bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.35)] focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Sign In to Continue
          </Link>
          <Link
            href={`/auth/signup?next=${encodedNext}`}
            className="block w-full text-center bg-[#18202C] hover:bg-[#202938] text-white font-bold py-3.5 rounded-xl border border-[#202938] neu-raised transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Create Free Account
          </Link>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-300 transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            Continue Browsing as Guest (Read-Only)
          </button>
        </div>
      </div>
    </div>
  );
}
