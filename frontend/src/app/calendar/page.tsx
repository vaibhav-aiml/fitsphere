'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface WorkoutEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  completed: boolean;
  exercises?: any[];
}

export default function WorkoutCalendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    generateEvents();
    setLoading(false);
  }, []);

  const generateEvents = () => {
    const generatedEvents: WorkoutEvent[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        generatedEvents.push({
          id: `rest-${i}`,
          title: 'Rest Day',
          date: new Date(date),
          type: 'rest',
          completed: false,
        });
      } else {
        generatedEvents.push({
          id: `workout-${i}`,
          title: 'Workout Day',
          date: new Date(date),
          type: 'workout',
          completed: i % 3 === 0,
        });
      }
    }
    setEvents(generatedEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const getEventForDate = (date: Date) => {
    return events.find(e => e.date.toDateString() === date.toDateString());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getWorkoutTypeColor = (type: string, completed: boolean) => {
    if (completed) return 'bg-purple-500';
    if (type === 'rest') return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500';
  };

  const getWorkoutTypeIcon = (type: string, completed: boolean) => {
    if (completed) return '✅';
    if (type === 'rest') return '🧘';
    return '💪';
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const days = getDaysInMonth(currentDate);
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  // Get workouts for selected date
  const selectedWorkouts = selectedDate 
    ? events.filter(e => e.date.toDateString() === selectedDate.toDateString())
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition mb-2 inline-flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">📅 Workout Calendar</h1>
            <p className="text-gray-500 text-sm">Track your workouts and stay consistent</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-800 rounded-xl transition"
            >
              ←
            </button>
            <h2 className="text-white font-semibold text-lg">{getMonthName(currentDate)}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-800 rounded-xl transition"
            >
              →
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 p-4 pb-0">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-gray-500 text-xs font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square bg-gray-900/30 rounded-xl" />;
              }
              
              const event = getEventForDate(date);
              const isCurrentDay = isToday(date);
              const selected = isSelected(date);
              
              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square rounded-xl p-2 relative transition-all ${
                    selected ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`flex flex-col items-center h-full ${isCurrentDay ? 'font-bold' : ''}`}>
                    <span className={`text-sm ${isCurrentDay ? 'text-blue-400' : 'text-gray-300'}`}>
                      {date.getDate()}
                    </span>
                    {event && (
                      <div className="mt-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getWorkoutTypeColor(event.type, event.completed)}`}>
                          {getWorkoutTypeIcon(event.type, event.completed)}
                        </div>
                      </div>
                    )}
                  </div>
                  {isCurrentDay && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-gray-500 text-sm">Your schedule for today</p>
                </div>
                <button
                  onClick={() => router.push('/workout')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
                >
                  + Log Workout
                </button>
              </div>

              {selectedWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-400">No workouts scheduled</p>
                  <p className="text-gray-500 text-sm mt-1">Click "Log Workout" to add your first workout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedWorkouts.map(workout => (
                    <div
                      key={workout.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        workout.completed ? 'border-purple-500/30 bg-purple-500/5' : 'border-gray-700 bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          workout.completed ? 'bg-purple-500/20' : 'bg-blue-500/20'
                        }`}>
                          {workout.type === 'rest' ? '🧘' : workout.completed ? '✅' : '💪'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{workout.title}</p>
                          <p className="text-gray-500 text-xs">
                            {workout.type === 'rest' ? 'Recovery day' : 'Ready to crush it!'}
                          </p>
                        </div>
                      </div>
                      {workout.type !== 'rest' && !workout.completed && (
                        <button
                          onClick={() => router.push('/workout')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          Start
                        </button>
                      )}
                      {workout.completed && (
                        <span className="text-green-500 text-sm">Completed ✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-400 text-xs">Workout Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/50 rounded-full" />
            <span className="text-gray-400 text-xs">Rest Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-400 text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-xs">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}