'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function NotificationPermission() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    setLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled! You will receive workout reminders 📢');
        
        // Send test notification
        setTimeout(() => {
          new Notification('Welcome to FitSphere! 🎉', {
            body: 'You will now receive workout reminders and progress updates!',
            icon: '/icon-192.png'
          });
        }, 1000);
      } else {
        toast.error('Please allow notifications to get workout reminders');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    toast.success('Notifications disabled');
  };

  if (!('Notification' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!notificationsEnabled ? (
        <button
          onClick={requestNotificationPermission}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
        >
          <span>🔔</span>
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </button>
      ) : (
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span>🔔</span>
          <span>Notifications On</span>
          <button
            onClick={disableNotifications}
            className="ml-2 text-xs bg-green-700 px-2 py-1 rounded hover:bg-green-800"
          >
            Turn Off
          </button>
        </div>
      )}
    </div>
  );
}
