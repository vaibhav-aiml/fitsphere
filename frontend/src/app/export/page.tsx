'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
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

export default function ExportPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [workoutsRes, profileRes] = await Promise.all([
        axios.get('http://localhost:5000/api/workout-logs?limit=500', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const workoutData: WorkoutData[] = workoutsRes.data.logs.map((log: any) => ({
        date: new Date(log.date).toLocaleDateString(),
        exerciseName: log.exerciseName,
        weight: log.weight,
        reps: log.reps,
        sets: log.sets,
        volume: log.weight * log.reps * log.sets,
        oneRM: Math.round(log.weight * (1 + log.reps / 30))
      }));

      setWorkouts(workoutData);
      setUserName(profileRes.data.user.name);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
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
    
    const canvas = await html2canvas(shareRef.current, { scale: 2, backgroundColor: '#1f2937' });
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `fitsphere_share.png`, { type: 'image/png' });
      
      if (navigator.share) {
        try {
          await navigator.share({ title: 'FitSphere Progress', files: [file] });
        } catch (e) { console.log('Share cancelled'); }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fitsphere_share.png';
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Image ready!');
    }, 'image/png');
  };

  const copyShareText = () => {
    if (workouts.length === 0) return;
    const lastWorkout = workouts[0];
    const shareText = `💪 Just crushed my workout on FitSphere!\n\n🏋️ ${lastWorkout.exerciseName}: ${lastWorkout.weight}kg × ${lastWorkout.reps} reps × ${lastWorkout.sets} sets\n📊 Volume: ${lastWorkout.volume}kg\n🎯 1RM: ${lastWorkout.oneRM}kg\n\n#FitSphere #Fitness #Workout`;
    navigator.clipboard.writeText(shareText);
    toast.success('Share text copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const totalVolume = workouts.reduce((sum, w) => sum + w.volume, 0);
  const uniqueExercises = [...new Set(workouts.map(w => w.exerciseName))].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-400 transition mb-2 block">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">📤 Export & Share</h1>
            <p className="text-gray-400 mt-1">Export your workout data and share progress</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={exportToCSV} className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-semibold">Export CSV</p>
            <p className="text-xs opacity-80">Download spreadsheet</p>
          </button>
          <button onClick={shareAsImage} className="bg-pink-600 text-white p-4 rounded-xl hover:bg-pink-700 transition text-center">
            <div className="text-2xl mb-2">📸</div>
            <p className="font-semibold">Share as Image</p>
            <p className="text-xs opacity-80">Share on social media</p>
          </button>
          <button onClick={copyShareText} className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition text-center">
            <div className="text-2xl mb-2">📝</div>
            <p className="font-semibold">Copy Share Text</p>
            <p className="text-xs opacity-80">Paste on Instagram/Twitter</p>
          </button>
        </div>

        {/* Hidden Share Content */}
        <div ref={shareRef} className="hidden">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl" style={{ width: '500px' }}>
            <div className="text-center">
              <div className="text-5xl mb-4">💪</div>
              <h2 className="text-2xl font-bold text-white">FitSphere Progress</h2>
              <p className="text-gray-400">{userName}</p>
              <hr className="my-4 border-gray-700" />
              <div className="text-left">
                <p className="text-white">🏋️ Workouts: {workouts.length}</p>
                <p className="text-white">📊 Total Volume: {totalVolume.toLocaleString()} kg</p>
                <p className="text-white">🎯 Unique Exercises: {uniqueExercises}</p>
              </div>
              <hr className="my-4 border-gray-700" />
              <p className="text-blue-400">#FitSphere #Fitness #Progress</p>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">📊 Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Total Workouts</p>
              <p className="text-white text-3xl font-bold">{workouts.length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-white text-3xl font-bold">{totalVolume.toLocaleString()} kg</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
              <p className="text-gray-400 text-sm">Unique Exercises</p>
              <p className="text-white text-3xl font-bold">{uniqueExercises}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-3">🏆 Best Lifts</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(
              workouts.reduce((acc: any, w) => {
                if (!acc[w.exerciseName] || w.oneRM > acc[w.exerciseName]) {
                  acc[w.exerciseName] = w.oneRM;
                }
                return acc;
              }, {})
            ).slice(0, 5).map(([exercise, oneRM]) => (
              <div key={exercise} className="bg-gray-700/30 p-3 rounded-lg flex justify-between">
                <span className="text-white">{exercise}</span>
                <span className="text-yellow-400 font-bold">{oneRM as number} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}