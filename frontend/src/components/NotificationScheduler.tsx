'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificationScheduler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    // Check for workout reminders daily at 8 AM
    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Send reminder at 8 AM, 12 PM, 6 PM
      if (hour === 8 || hour === 12 || hour === 18) {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/send-workout-reminder', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(console.error);
      }
    };
    
    // Check every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    checkReminders();
    
    return () => clearInterval(interval);
  }, [session]);

  return null;
}