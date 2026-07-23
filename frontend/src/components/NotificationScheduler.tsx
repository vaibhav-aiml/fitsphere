'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

export default function NotificationScheduler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour === 8 || hour === 12 || hour === 18) {
        api.post('/send-workout-reminder', {}).catch(() => {});
      }
    };
    
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    checkReminders();
    
    return () => clearInterval(interval);
  }, [session]);

  return null;
}