'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

interface WorkoutData {
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  oneRM: number;
}

import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function ExportPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, profileRes] = await Promise.all([
        api.get('/workout-logs?limit=500'),
        api.get('/profile')
      ]);

      const workoutData: WorkoutData[] = (workoutsRes.data.logs || []).map((log: any) => ({
        date: new Date(log.date).toLocaleDateString(),
        exerciseName: log.exerciseName,
        weight: log.weight,
        reps: log.reps,
        sets: log.sets,
        volume: log.weight * log.reps * log.sets,
        oneRM: Math.round(log.weight * (1 + log.reps / 30))
      }));

      setWorkouts(workoutData);
      setUserName(profileRes.data.user?.name || 'Athlete');
    } catch (error) {
      console.error('Failed to fetch export data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (workouts.length === 0) {
      toast.error('No workouts to export');
      return;
    }
    const headers = ['Date', 'Exercise', 'Weight (kg)', 'Reps', 'Sets', 'Volume (kg)', '1RM (kg)'];
    const csvRows = [headers.join(',')];
    
    for (const row of workouts) {
      const values = [
        row.date,
        `"${row.exerciseName}"`,
        row.weight,
        row.reps,
        row.sets,
        row.volume,
        row.oneRM
      ];
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `fitsphere_workouts_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV exported!');
  };

  const shareAsImage = async () => {
    if (!shareRef.current) return;
    
    const canvas = await html2canvas(shareRef.current, { scale: 2, backgroundColor: '#090C10' });
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fitsphere_share.png';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    }, 'image/png');
  };

  const copyShareText = () => {
    if (workouts.length === 0) {
      toast.error('No workouts to copy');
      return;
    }
    const lastWorkout = workouts[0];
    const shareText = `💪 Just crushed my workout on FitSphere!\n\n🏋️ ${lastWorkout.exerciseName}: ${lastWorkout.weight}kg × ${lastWorkout.reps} reps × ${lastWorkout.sets} sets\n📊 Volume: ${lastWorkout.volume}kg\n🎯 1RM: ${lastWorkout.oneRM}kg\n\n#FitSphere #Fitness #Workout`;
    navigator.clipboard.writeText(shareText);
    toast.success('Share text copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Export Tools...</div>
      </div>
    );
  }

  const totalVolume = workouts.reduce((sum, w) => sum + w.volume, 0);
  const uniqueExercises = [...new Set(workouts.map(w => w.exerciseName))].length;

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
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
              📦 EXPORT & SHARE DATA
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Download your workout history as CSV, create shareable summary cards, or copy workout summaries
            </p>
          </div>
        </div>

        {/* Action Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <button 
            onClick={exportToCSV} 
            className="bg-[#11161F] hover:bg-[#18202C] p-6 rounded-3xl border border-[#202938] hover:border-[#FF5500]/50 neu-raised transition text-center space-y-2 group focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">📊</div>
            <h3 className="font-bold text-white font-heading text-base group-hover:text-[#FF5500] transition">Export CSV File</h3>
            <p className="text-gray-400 text-xs">Download full log spreadsheet</p>
          </button>

          <button 
            onClick={shareAsImage} 
            className="bg-[#11161F] hover:bg-[#18202C] p-6 rounded-3xl border border-[#202938] hover:border-[#FF5500]/50 neu-raised transition text-center space-y-2 group focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">📸</div>
            <h3 className="font-bold text-white font-heading text-base group-hover:text-[#FF5500] transition">Share Card Image</h3>
            <p className="text-gray-400 text-xs">Generate graphic card for social media</p>
          </button>

          <button 
            onClick={copyShareText} 
            className="bg-[#11161F] hover:bg-[#18202C] p-6 rounded-3xl border border-[#202938] hover:border-[#FF5500]/50 neu-raised transition text-center space-y-2 group focus-visible:ring-2 focus-visible:ring-[#FF5500]"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">📝</div>
            <h3 className="font-bold text-white font-heading text-base group-hover:text-[#FF5500] transition">Copy Summary Text</h3>
            <p className="text-gray-400 text-xs">Copy formatted workout stats</p>
          </button>
        </div>

        {/* Hidden Share Canvas Content */}
        <div ref={shareRef} className="hidden">
          <div className="bg-[#090C10] p-8 rounded-3xl border border-[#202938]" style={{ width: '500px' }}>
            <div className="text-center space-y-4">
              <div className="text-5xl">⚡</div>
              <h2 className="text-3xl font-black text-white font-heading">FITSPHERE ATHLETE STATS</h2>
              <p className="text-[#FF5500] font-bold text-sm">{userName}</p>
              <div className="grid grid-cols-3 gap-3 text-left pt-4 border-t border-[#202938]">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-heading">Sessions</span>
                  <p className="text-white font-black text-lg">{workouts.length}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-heading">Volume</span>
                  <p className="text-[#FF5500] font-black text-lg">{totalVolume.toLocaleString()} KG</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-heading">Movements</span>
                  <p className="text-white font-black text-lg">{uniqueExercises}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Bento Container */}
        <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-6">
          <h2 className="text-2xl font-black text-white font-heading">📊 LOG SUMMARY OVERVIEW</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938]">
              <span className="text-gray-400 text-xs font-bold uppercase font-heading">Total Workouts</span>
              <p className="text-3xl font-black text-white font-heading mt-1">{workouts.length}</p>
            </div>

            <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938]">
              <span className="text-gray-400 text-xs font-bold uppercase font-heading">Cumulative Volume</span>
              <p className="text-3xl font-black text-white font-heading mt-1">{totalVolume.toLocaleString()} <span className="text-xs text-[#FF5500]">KG</span></p>
            </div>

            <div className="bg-[#0D1117] p-5 rounded-2xl border border-[#202938]">
              <span className="text-gray-400 text-xs font-bold uppercase font-heading">Unique Movements</span>
              <p className="text-3xl font-black text-white font-heading mt-1">{uniqueExercises}</p>
            </div>
          </div>
        </div>

      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={authConfig.title}
        description={authConfig.description}
        nextUrl={authConfig.nextUrl}
      />
    </div>
  );
}