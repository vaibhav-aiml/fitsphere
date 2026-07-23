'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface WorkoutEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  completed: boolean;
}

export default function WorkoutCalendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          title: 'Workout Session',
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
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const selectedWorkouts = selectedDate 
    ? events.filter(e => e.date.toDateString() === selectedDate.toDateString())
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Training Calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition mb-2 block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              📅 TRAINING CALENDAR
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Schedule workout sessions, rest days, and track daily consistency
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl text-xs font-black font-heading uppercase transition ${
                view === 'month' ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.3)]' : 'bg-[#18202C] text-gray-400 hover:text-white border border-[#202938] neu-raised'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-xl text-xs font-black font-heading uppercase transition ${
                view === 'week' ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.3)]' : 'bg-[#18202C] text-gray-400 hover:text-white border border-[#202938] neu-raised'
              }`}
            >
              Week View
            </button>
          </div>
        </div>

        {/* Calendar Bento Card */}
        <div className="bg-[#11161F] rounded-3xl border border-[#202938] neu-raised overflow-hidden">
          
          {/* Calendar Header Control */}
          <div className="p-5 border-b border-[#202938] flex justify-between items-center bg-[#0D1117]">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2.5 rounded-xl bg-[#18202C] hover:bg-[#202938] text-white font-bold border border-[#202938] transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ←
            </button>
            <h2 className="text-white font-black text-xl font-heading">{getMonthName(currentDate)}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2.5 rounded-xl bg-[#18202C] hover:bg-[#202938] text-white font-bold border border-[#202938] transition focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              →
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 p-4 pb-2 bg-[#090C10]/50 border-b border-[#202938]">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-[#FF5500] text-xs font-black uppercase font-heading">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 p-4">
            {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-2xl bg-transparent" />
            ))}

            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());
              
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`h-24 p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isToday(date)
                      ? 'bg-[#18202C] border-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.25)]'
                      : isSelected(date)
                      ? 'bg-[#18202C] border-[#FF5500]'
                      : 'bg-[#0D1117] border-[#202938] hover:border-[#FF5500]/50 neu-inset'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold font-heading ${isToday(date) ? 'text-[#FF5500]' : 'text-white'}`}>
                      {day}
                    </span>
                    {isToday(date) && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        className={`text-[10px] font-black uppercase font-heading px-1.5 py-0.5 rounded-lg truncate ${
                          e.type === 'workout'
                            ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}