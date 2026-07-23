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
      <div className="min-h-screen bg-[#090C10] flex items-center justify-center">
        <div className="text-[#FF5500] font-black font-heading text-xl">Loading Routine Details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/plans" 
          className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition inline-block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
        >
          ← Back to Training Programs
        </Link>

        {plan ? (
          <div className="space-y-8">
            {/* Header Hero Card */}
            <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-[10px] px-3 py-1 bg-[#FF5500]/15 text-[#FF5500] rounded-full border border-[#FF5500]/30 font-black uppercase font-heading">
                  {plan.difficulty || 'All Levels'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight mt-3">
                  {plan.name || plan.title}
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">{plan.description}</p>
              </div>

              <button
                onClick={handleStartPlan}
                className="px-6 py-3.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.35)] focus-visible:ring-2 focus-visible:ring-[#FF5500] whitespace-nowrap"
              >
                🚀 Start This Routine
              </button>
            </div>

            {/* Routine Exercise Grid */}
            {plan.schedule && plan.schedule.length > 0 && (
              <div className="bg-[#11161F] p-6 sm:p-8 rounded-3xl border border-[#202938] neu-raised space-y-5">
                <h2 className="text-2xl font-black text-white font-heading">ROUTINE EXERCISES</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {plan.schedule.map((item: any, idx: number) => (
                    <div key={idx} className="bg-[#18202C] p-5 rounded-2xl border border-[#202938] flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-white text-base font-heading mb-1">{item.exerciseName || item.name}</h3>
                        <p className="text-gray-300 text-xs font-semibold">{item.sets || 3} Sets × {item.reps || 10} Reps</p>
                        {item.notes && <p className="text-gray-400 text-xs mt-2 italic">📝 {item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#11161F] p-12 rounded-3xl text-center border border-[#202938] neu-raised">
            <p className="text-gray-400 text-sm">Workout plan details unavailable.</p>
            <Link href="/plans" className="text-[#FF5500] font-bold text-xs underline mt-2 block">Return to Programs</Link>
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