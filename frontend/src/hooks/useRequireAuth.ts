'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function useRequireAuth() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [authConfig, setAuthConfig] = useState<{
    title?: string;
    description?: string;
    nextUrl?: string;
  }>({});

  const requireAuth = (
    action: () => void,
    options?: { title?: string; description?: string; nextUrl?: string }
  ) => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (token) {
      action();
    } else {
      setAuthConfig({
        title: options?.title || 'Authentication Required',
        description: options?.description || 'Sign in or create an account to use this feature.',
        nextUrl: options?.nextUrl || pathname || '/'
      });
      setModalOpen(true);
    }
  };

  const closeModal = () => setModalOpen(false);

  return {
    requireAuth,
    modalOpen,
    closeModal,
    authConfig
  };
}

export default useRequireAuth;
