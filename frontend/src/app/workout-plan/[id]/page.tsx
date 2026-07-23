'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function WorkoutPlanDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const response = await api.get(`/workout-plans/${params.id}`);
      setPlan(response.data.plan);
    } catch (error) {
      console.error('Failed to load workout plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = () => {
    requireAuth(() => {
      toast.success(`Started routine: ${plan?.name || 'Workout Plan'}!`);
      router.push('/workout');
    }, {
      title: 'Routine Tracking Requires Account',
      description: 'Sign in or create an account to record your sets & weights for this plan.',
      nextUrl: `/workout-plan/${params.id}`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading workout plan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/plans" className="text-blue-400 hover:text-blue-300 text-sm font-semibold mb-6 inline-block">
          ← Back to All Plans
        </Link>

        {plan ? (
          <div>
            <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 uppercase font-bold">
                  {plan.difficulty || 'All Levels'}
                </span>
                <h1 className="text-3xl font-extrabold mt-2">{plan.name || plan.title}</h1>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
              </div>

              <button
                onClick={handleStartPlan}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                🚀 Start This Routine
              </button>
            </div>

            {/* Routine Schedule */}
            {plan.schedule && plan.schedule.length > 0 && (
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Routine Exercises</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.schedule.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                      <h3 className="font-bold text-white text-base mb-1">{item.exerciseName || item.name}</h3>
                      <p className="text-gray-400 text-xs">{item.sets || 3} sets × {item.reps || 10} reps</p>
                      {item.notes && <p className="text-gray-500 text-xs mt-2 italic">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Workout plan details unavailable. <Link href="/plans" className="text-blue-400 underline">Return to Plans</Link>
          </div>
        )}
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