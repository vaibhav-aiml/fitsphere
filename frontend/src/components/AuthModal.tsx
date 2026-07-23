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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-500/30">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/auth/login?next=${encodedNext}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-600/25"
          >
            Sign In to Continue
          </Link>
          <Link
            href={`/auth/signup?next=${encodedNext}`}
            className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl border border-gray-700 transition"
          >
            Create Free Account
          </Link>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-400 transition"
          >
            Continue as Guest (Read-Only)
          </button>
        </div>
      </div>
    </div>
  );
}
