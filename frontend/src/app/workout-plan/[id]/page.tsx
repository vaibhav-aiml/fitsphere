'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function WorkoutPlanDetail() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchPlanDetails(token);
  }, []);

  const fetchPlanDetails = async (token: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/workout-plans/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlan(response.data.plan);
    } catch (error) {
      toast.error('Failed to load workout plan');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading workout plan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-500 hover:text-blue-400 transition"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{plan?.name}</h1>
          <p className="text-gray-400 mb-4">{plan?.description}</p>
          <div className="flex gap-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              {plan?.durationWeeks} weeks
            </span>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm capitalize">
              {plan?.goal}
            </span>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm capitalize">
              {plan?.experienceLevel}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Weekly Schedule</h2>
        <div className="space-y-6">
          {plan?.weeklySchedule.map((day: any) => (
            <div key={day.day} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">
                Day {day.day}: {day.dayName}
              </h3>
              <p className="text-blue-500 mb-4">Focus: {day.focus}</p>
              
              <div className="space-y-3">
                {day.exercises.map((exercise: any, idx: number) => (
                  <div key={idx} className="border-t border-gray-700 pt-3">
                    <p className="text-white font-semibold">{exercise.name}</p>
                    <p className="text-gray-400 text-sm">
                      {exercise.sets} sets × {exercise.reps} reps • Rest: {exercise.restSeconds}s
                    </p>
                    {exercise.notes && (
                      <p className="text-gray-500 text-xs mt-1">💡 {exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {plan?.tips && plan.tips.length > 0 && (
          <div className="mt-8 bg-blue-900/30 p-6 rounded-xl border border-blue-700">
            <h3 className="text-xl font-bold text-white mb-3">💡 Pro Tips</h3>
            <ul className="list-disc list-inside space-y-2">
              {plan.tips.map((tip: string, idx: number) => (
                <li key={idx} className="text-gray-300">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}