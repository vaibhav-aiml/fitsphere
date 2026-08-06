'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import jsPDF from 'jspdf';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Exercise {
  exerciseName: string;
  sets: number;
  reps: string;
  rpeOrRir?: string;
  restSeconds?: number;
  notes?: string;
}

interface DaySchedule {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

interface MesocyclePhase {
  phaseName?: string;
  phase?: string;
  startWeek?: number;
  endWeek?: number;
  weeks?: number[] | string;
  focusNotes?: string;
  focus?: string;
}

interface AISuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface PlanVersion {
  versionNumber: number;
  title: string;
  changedReason: string;
  authorType: string;
  createdAt: string;
}

interface GeneratedPlan {
  _id: string;
  id?: string;
  title: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  goal: string;
  experienceLevel: string;
  daysPerWeek: number;
  sessionDurationMinutes: number;
  equipment: string;
  location: string;
  injuries: string[];
  focusMuscles: string[];
  durationWeeks: number;
  recoveryScore: number;
  mesocycleStructure: MesocyclePhase[];
  structuredSchedule: DaySchedule[];
  content?: string;
  confidence?: {
    score: number;
    assumptions: string[];
  };
  currentVersion: number;
  versions: PlanVersion[];
  aiSuggestions: AISuggestion[];
  analytics?: {
    completionRate: number;
    avgRpe: number;
    weeklyVolumePerMuscle: Record<string, number>;
  };
}

export default function AIWorkoutPlanner() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ai_generator' | 'my_plans'>('ai_generator');
  const [userPlans, setUserPlans] = useState<GeneratedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [streamProgressStep, setStreamProgressStep] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [goal, setGoal] = useState('hypertrophy');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [equipment, setEquipment] = useState('full_gym');
  const [location, setLocation] = useState('gym');
  const [injuriesInput, setInjuriesInput] = useState('');
  const [focusMusclesInput, setFocusMusclesInput] = useState('');

  // UI Modals & Drawers
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainQuestion, setExplainQuestion] = useState('');
  const [explanationResult, setExplanationResult] = useState('');
  const [isDeterministicExplanation, setIsDeterministicExplanation] = useState(false);
  const [explaining, setExplaining] = useState(false);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserPlans();
    }
  }, []);

  const fetchPlanDetails = async (planId: string) => {
    if (!planId) return;
    setLoadingPlan(true);
    try {
      const response = await api.get(`/ai-planner/plans/${planId}`);
      if (response.data.success && response.data.plan) {
        setSelectedPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch plan details:', error);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchUserPlans = async () => {
    try {
      const response = await api.get('/ai-planner/plans');
      if (response.data.success) {
        const plansList = response.data.plans || [];
        setUserPlans(plansList);
        const active = plansList.find((p: GeneratedPlan) => p.status === 'active');
        const target = active || (plansList.length > 0 ? plansList[0] : null);
        if (target) {
          const targetId = target.id || target._id;
          await fetchPlanDetails(targetId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user plans:', error);
    }
  };

  const handleGeneratePlan = async () => {
    requireAuth(async () => {
      setIsGenerating(true);
      setStreamProgressStep('Initializing generation pipeline...');

      try {
        const token = localStorage.getItem('token');
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;

        const response = await fetch(`${baseUrl}/ai-planner/generate-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            goal,
            experienceLevel,
            daysPerWeek,
            sessionDurationMinutes: sessionDuration,
            equipment,
            location,
            injuries: injuriesInput.split(',').map(s => s.trim()).filter(Boolean),
            focusMuscles: focusMusclesInput.split(',').map(s => s.trim()).filter(Boolean),
            durationWeeks: 8
          })
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to connect to generator stream');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line.trim());
              if (event.type === 'progress') {
                setStreamProgressStep(event.step);
              } else if (event.type === 'done') {
                toast.success('AI Workout Plan generated successfully! 🎉');
                if (event.planId) {
                  await fetchPlanDetails(event.planId);
                }
                await fetchUserPlans();
                setActiveTab('my_plans');
              } else if (event.type === 'error') {
                toast.error(event.content || 'Plan generation failed');
              }
            } catch (e) {}
          }
        }
      } catch (error) {
        toast.error('Failed to generate AI plan');
      } finally {
        setIsGenerating(false);
        setStreamProgressStep('');
      }
    }, {
      title: 'Plan Generator Requires Account',
      description: 'Sign in to create, customize, and save AI-powered workout plans.',
      nextUrl: '/plans'
    });
  };

  const currentPlanId = selectedPlan ? (selectedPlan.id || selectedPlan._id) : '';

  const handleWeeklyCheckIn = async (rating: string) => {
    if (!currentPlanId) return;
    try {
      await api.post(`/ai-planner/plans/${currentPlanId}/weekly-checkin`, {
        weekNumber: 2,
        rating,
        feedbackNotes: `User checked in as ${rating}`
      });

      toast.success('Weekly Check-In submitted! Check AI suggestions below.');
      await fetchPlanDetails(currentPlanId);
      await fetchUserPlans();
    } catch (error) {
      toast.error('Failed to submit check-in');
    }
  };

  const handleAcceptSuggestion = async (sugId: string) => {
    if (!currentPlanId) return;
    try {
      await api.post(`/ai-planner/plans/${currentPlanId}/suggestions/${sugId}/accept`);
      toast.success('Suggestion accepted! Plan updated & version incremented.');
      await fetchPlanDetails(currentPlanId);
      await fetchUserPlans();
    } catch (error) {
      toast.error('Failed to accept suggestion');
    }
  };

  const handleRejectSuggestion = async (sugId: string) => {
    if (!currentPlanId) return;
    try {
      await api.post(`/ai-planner/plans/${currentPlanId}/suggestions/${sugId}/reject`);
      toast.success('Suggestion rejected.');
      await fetchPlanDetails(currentPlanId);
      await fetchUserPlans();
    } catch (error) {
      toast.error('Failed to reject suggestion');
    }
  };

  const handleRegenerateExercise = async (dayNumber: number, exerciseIndex: number) => {
    if (!currentPlanId) return;
    const customReason = prompt('Why do you want to replace this exercise? (e.g. knee pain, equipment busy):');
    if (!customReason) return;

    try {
      await api.post(`/ai-planner/plans/${currentPlanId}/regenerate-exercise`, {
        dayNumber,
        exerciseIndex,
        customReason
      });
      toast.success('Exercise replaced with alternative! 🔄');
      await fetchPlanDetails(currentPlanId);
      await fetchUserPlans();
    } catch (error) {
      toast.error('Failed to replace exercise');
    }
  };

  const handleExplainSubmit = async () => {
    if (!currentPlanId || !explainQuestion.trim()) return;
    setExplaining(true);
    try {
      const response = await api.post(`/ai-planner/plans/${currentPlanId}/explain`, {
        question: explainQuestion
      });
      setExplanationResult(response.data.explanation);
      setIsDeterministicExplanation(!!response.data.deterministic);
    } catch (error) {
      toast.error('Failed to get explanation');
    } finally {
      setExplaining(false);
    }
  };

  const handleExportPDF = () => {
    if (!selectedPlan) return;
    try {
      const doc = new jsPDF();
      let y = 15;

      // Plan Header Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedPlan.title || 'AI Workout Plan', 14, y);
      y += 8;

      // Meta Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${selectedPlan.durationWeeks || 8} Weeks • ${selectedPlan.daysPerWeek || 4} Days/Wk • ${(selectedPlan.goal || 'HYPERTROPHY').toUpperCase()} • Version v${selectedPlan.currentVersion || 1} • Recovery Score: ${selectedPlan.recoveryScore || 85}/100`,
        14,
        y
      );
      y += 10;

      // Mesocycle Periodization
      if (selectedPlan.mesocycleStructure && selectedPlan.mesocycleStructure.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Periodization & Mesocycle Blocks', 14, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        selectedPlan.mesocycleStructure.forEach((m) => {
          const wStr = Array.isArray(m.weeks) ? m.weeks.join(', ') : m.weeks || `${m.startWeek}-${m.endWeek}`;
          doc.text(`• ${m.phase || m.phaseName || 'Phase'} (Weeks ${wStr}): ${m.focus || m.focusNotes || 'Progressive Overload'}`, 14, y);
          y += 5;
        });
        y += 5;
      }

      // Schedule Days
      if (selectedPlan.structuredSchedule && selectedPlan.structuredSchedule.length > 0) {
        selectedPlan.structuredSchedule.forEach((day) => {
          if (y > 250) {
            doc.addPage();
            y = 15;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${day.dayName || `Day ${day.dayNumber}`} - ${day.focus || ''}`, 14, y);
          y += 6;

          // Table Header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Exercise', 14, y);
          doc.text('Sets', 85, y);
          doc.text('Reps', 105, y);
          doc.text('Rest', 130, y);
          doc.text('Notes', 155, y);
          y += 3;
          doc.line(14, y, 195, y);
          y += 5;

          doc.setFont('helvetica', 'normal');
          (day.exercises || []).forEach((ex) => {
            if (y > 270) {
              doc.addPage();
              y = 15;
            }
            doc.text((ex.exerciseName || '').substring(0, 32), 14, y);
            doc.text(String(ex.sets || 3), 85, y);
            doc.text(String(ex.reps || '8-12'), 105, y);
            doc.text(`${ex.restSeconds || 90}s`, 130, y);
            doc.text((ex.notes || '-').substring(0, 22), 155, y);
            y += 5;
          });

          y += 5;
        });
      }

      // Guidelines & Safety
      if (y > 250) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Progressive Overload & Guidelines', 14, y);
      y += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('• Progressive Overload: When top rep target is met on all sets, add +2.5kg next workout session.', 14, y); y += 4;
      doc.text('• Deload Rule: If failing reps 2 workouts in a row, reduce set volume by 50% for 1 week.', 14, y); y += 4;
      doc.text('• Safety First: Stay hydrated, prioritize form over weight, and ensure 7-9 hours sleep.', 14, y);

      const filename = `${(selectedPlan.title || 'Workout_Plan').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      doc.save(filename);
      toast.success('Exported PDF successfully! 📄');
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#202938] pb-6">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5500] hover:text-[#E04B00] text-xs font-bold font-heading uppercase tracking-wider transition mb-2 block focus-visible:ring-2 focus-visible:ring-[#FF5500]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
              🧠 AI INTELLIGENT WORKOUT PLANNER
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Personalized mesocycle programming, progressive overload engine & active AI coaching
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#11161F] p-1.5 rounded-2xl border border-[#202938]">
            <button
              onClick={() => setActiveTab('ai_generator')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-heading uppercase transition ${
                activeTab === 'ai_generator' ? 'bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚡ AI Generator
            </button>
            <button
              onClick={() => setActiveTab('my_plans')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-heading uppercase transition ${
                activeTab === 'my_plans' ? 'bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              📑 My Saved Plans ({userPlans.length})
            </button>
          </div>
        </div>

        {/* TAB 1: AI GENERATOR FORM */}
        {activeTab === 'ai_generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Preferences Generator Form */}
            <div className="lg:col-span-3 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-6">
              <div>
                <h2 className="text-xl font-black text-white font-heading uppercase">🎯 Customize Your Training Parameters</h2>
                <p className="text-xs text-gray-400 mt-1">Our AI engine builds customized periodization blocks based on your input.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Goal */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Primary Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="hypertrophy">Muscle Hypertrophy (Build Muscle)</option>
                    <option value="strength">Raw Strength (Powerlifting)</option>
                    <option value="fatloss">Fat Loss & Conditioning</option>
                    <option value="recomp">Body Recomposition</option>
                    <option value="athleticism">Athletic Performance</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="beginner">Beginner (&lt; 1 Year)</option>
                    <option value="intermediate">Intermediate (1 - 3 Years)</option>
                    <option value="advanced">Advanced (3+ Years)</option>
                  </select>
                </div>

                {/* Days Per Week */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Days Per Week ({daysPerWeek} Days)</label>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full accent-[#FF5500]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>2 Days</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6 Days</span>
                  </div>
                </div>

                {/* Session Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Session Duration ({sessionDuration} mins)</label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="15"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full accent-[#FF5500]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                    <span>30m</span>
                    <span>45m</span>
                    <span>60m</span>
                    <span>90m</span>
                    <span>120m</span>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Available Equipment</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="full_gym">Full Commercial Gym</option>
                    <option value="dumbbells_only">Dumbbells & Bench Only</option>
                    <option value="barbell_rack">Barbell & Squat Rack</option>
                    <option value="bodyweight">Bodyweight / Calisthenics Only</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Training Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="gym">Commercial Gym</option>
                    <option value="home_gym">Home Gym</option>
                    <option value="outdoor">Outdoor Park</option>
                  </select>
                </div>
              </div>

              {/* Injuries & Limitations */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Injuries or Joint Pain (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Left shoulder impingement, Lower back stiffness"
                  value={injuriesInput}
                  onChange={(e) => setInjuriesInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs"
                />
              </div>

              {/* Focus Muscle Groups */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Weak Point / Focus Muscles (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Upper Chest, Side Delts, Hamstrings"
                  value={focusMusclesInput}
                  onChange={(e) => setFocusMusclesInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2.5 text-xs"
                />
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold font-heading uppercase text-xs py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(255,85,0,0.4)] disabled:opacity-50"
              >
                {isGenerating ? '🤖 Generating AI Program...' : '⚡ Generate AI Workout Plan'}
              </button>
            </div>

            {/* Generator Output / Pipeline Stream Progress */}
            <div className="lg:col-span-2 bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-white font-heading uppercase mb-4">🤖 AI Program Pipeline Status</h2>
                
                {isGenerating ? (
                  <div className="space-y-6 py-12 text-center">
                    <div className="inline-block p-4 bg-[#FF5500]/10 rounded-full border border-[#FF5500]/30 animate-pulse">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-heading uppercase tracking-wider">{streamProgressStep}</p>
                      <p className="text-xs text-gray-400 mt-1">Executing multi-stage AJV schema validation & safety rules...</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4">
                    <div className="text-5xl">🏋️‍♂️</div>
                    <h3 className="text-base font-bold text-white font-heading">Ready to Create Your AI Workout Program</h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Adjust your preferences on the left and click **Generate AI Workout Plan**. Our Groq AI engine will design a science-backed mesocycle program for you.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY SAVED PLANS & ACTIVE PLAN DETAILS */}
        {activeTab === 'my_plans' && (
          <div>
            {loadingPlan ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent animate-spin rounded-full mx-auto" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading complete workout plan details...</p>
              </div>
            ) : selectedPlan ? (
              <div className="space-y-6">
                
                {/* Active Plan Header & Controls */}
                <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        selectedPlan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {selectedPlan.status === 'active' ? '🟢 Active Program' : selectedPlan.status}
                      </span>
                      <span className="text-xs text-[#FF5500] font-bold font-mono">
                        Recovery Score: {selectedPlan.recoveryScore || 85}/100 🛡️
                      </span>
                      {selectedPlan.analytics?.weeklyVolumePerMuscle && (
                        <span className="text-[10px] bg-[#18202C] px-2 py-0.5 rounded text-gray-300 border border-[#202938]">
                          Chest: {selectedPlan.analytics.weeklyVolumePerMuscle['Chest'] || 12} sets/wk • Quads: {selectedPlan.analytics.weeklyVolumePerMuscle['Quads'] || 14} sets/wk
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-white font-heading">{selectedPlan.title}</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedPlan.durationWeeks} Weeks • {selectedPlan.daysPerWeek} Days/wk • {(selectedPlan.goal || 'HYPERTROPHY').toUpperCase()} • Version v{selectedPlan.currentVersion}
                    </p>
                  </div>

                  {/* Action Buttons & Version History Selector */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={selectedPlan.id || selectedPlan._id}
                      onChange={(e) => {
                        if (e.target.value) fetchPlanDetails(e.target.value);
                      }}
                      className="bg-[#0D1117] border border-[#202938] text-white rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      {userPlans.map(p => {
                        const pid = p.id || p._id;
                        return <option key={pid} value={pid}>{p.title} ({p.status})</option>;
                      })}
                    </select>

                    <button
                      onClick={() => setExplainModalOpen(true)}
                      className="px-3.5 py-2 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold rounded-xl border border-[#202938] transition"
                    >
                      ❓ Ask Explanation
                    </button>

                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold rounded-xl border border-[#FF5500]/50 transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,85,0,0.3)]"
                    >
                      📄 Export PDF
                    </button>
                  </div>
                </div>

                {/* Weekly Adaptive Check-In Banner */}
                <div className="bg-[#18202C] p-5 rounded-2xl border border-[#202938] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-heading">🗓️ Weekly Adaptive Check-In</h3>
                    <p className="text-xs text-gray-400 mt-0.5">How did your training week feel? AI Coach will adjust overload/volume accordingly.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleWeeklyCheckIn('easy')} className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#202938] text-xs font-bold rounded-xl border border-[#202938]">😊 Easy</button>
                    <button onClick={() => handleWeeklyCheckIn('good')} className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#202938] text-xs font-bold rounded-xl border border-[#202938]">😐 Good</button>
                    <button onClick={() => handleWeeklyCheckIn('difficult')} className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#202938] text-xs font-bold rounded-xl border border-[#202938]">😓 Difficult</button>
                    <button onClick={() => handleWeeklyCheckIn('too_hard')} className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#202938] text-xs font-bold rounded-xl border border-[#202938]">💀 Too Hard</button>
                  </div>
                </div>

                {/* Pending AI Suggestions Workflow (Accept / Reject) */}
                {selectedPlan.aiSuggestions && selectedPlan.aiSuggestions.filter(s => s.status === 'pending').length > 0 && (
                  <div className="bg-[#FF5500]/10 border border-[#FF5500]/30 p-5 rounded-2xl space-y-3">
                    <h3 className="text-sm font-black text-[#FF5500] font-heading uppercase tracking-wider">💡 Pending AI Coaching Suggestions</h3>
                    {selectedPlan.aiSuggestions.filter(s => s.status === 'pending').map(sug => (
                      <div key={sug.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0D1117] p-4 rounded-xl border border-[#202938]">
                        <div>
                          <h4 className="font-bold text-white text-xs">{sug.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{sug.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptSuggestion(sug.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            Accept ✓
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(sug.id)}
                            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition"
                          >
                            Reject ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Routine Days View */}
                {selectedPlan.structuredSchedule && selectedPlan.structuredSchedule.length > 0 ? (
                  <div className="space-y-6">
                    {selectedPlan.structuredSchedule.map((day) => (
                      <div key={day.dayNumber} className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] neu-raised space-y-4">
                        <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                          <div>
                            <h3 className="text-lg font-black text-white font-heading">{day.dayName}</h3>
                            <p className="text-xs text-gray-400">{day.focus}</p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[#202938] text-gray-400 uppercase font-heading text-[10px]">
                                <th className="pb-2">Exercise</th>
                                <th className="pb-2">Sets</th>
                                <th className="pb-2">Reps</th>
                                <th className="pb-2">Rest</th>
                                <th className="pb-2">Notes</th>
                                <th className="pb-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#202938]/50 text-gray-200">
                              {(day.exercises || []).map((ex, exIdx) => (
                                <tr key={exIdx} className="hover:bg-[#18202C]/40 transition">
                                  <td className="py-3 font-bold text-white">{ex.exerciseName}</td>
                                  <td className="py-3 font-mono">{ex.sets}</td>
                                  <td className="py-3 font-mono">{ex.reps}</td>
                                  <td className="py-3 font-mono">{ex.restSeconds || 90}s</td>
                                  <td className="py-3 text-gray-400 text-[11px]">{ex.notes || '-'}</td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => handleRegenerateExercise(day.dayNumber, exIdx)}
                                      className="text-[10px] text-[#FF5500] hover:underline font-bold"
                                    >
                                      Replace 🔄
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedPlan.content ? (
                  <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] text-sm text-gray-200 leading-relaxed space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {selectedPlan.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="bg-[#11161F] p-6 rounded-3xl border border-[#202938] text-center text-gray-400 text-sm">
                    No structured schedule data available for this plan.
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#11161F] p-12 rounded-3xl border border-[#202938] text-center space-y-3">
                <div className="text-4xl">📑</div>
                <h3 className="text-base font-bold text-white font-heading">No Saved Plans Found</h3>
                <p className="text-xs text-gray-400">Generate your first AI workout plan to view it here.</p>
                <button
                  onClick={() => setActiveTab('ai_generator')}
                  className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold rounded-xl transition"
                >
                  Generate Plan Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Explain Plan Modal */}
        {explainModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#11161F] max-w-lg w-full p-6 rounded-3xl border border-[#202938] space-y-4">
              <div className="flex justify-between items-center border-b border-[#202938] pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white font-heading">❓ Ask AI Coach to Explain Plan</h3>
                  {isDeterministicExplanation && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                      ⚡ Token Saved (Deterministic)
                    </span>
                  )}
                </div>
                <button onClick={() => setExplainModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="e.g. Why is Romanian Deadlift included? Why 5 reps?"
                  value={explainQuestion}
                  onChange={(e) => setExplainQuestion(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#202938] text-white rounded-xl px-4 py-3 text-xs"
                />
              </div>

              <button
                onClick={handleExplainSubmit}
                disabled={explaining || !explainQuestion.trim()}
                className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                {explaining ? 'Analyzing...' : 'Get Explanation'}
              </button>

              {explanationResult && (
                <div className="bg-[#0D1117] p-4 rounded-xl border border-[#202938] text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {explanationResult}
                  </ReactMarkdown>
                </div>
              )}
            </div>
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