'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AICoach() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your FitSphere AI Coach. Ask me anything about workout programming, progressive overload, recovery, or form tips!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [plateauData, setPlateauData] = useState<any>(null);
  const [showPlateauAnalysis, setShowPlateauAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchExercises();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExercises = async () => {
    try {
      const response = await api.get('/workout-logs?limit=100');
      const uniqueExercises = Array.from(new Set((response.data.logs || []).map((log: any) => log.exerciseName))) as string[];
      setExercises(uniqueExercises);
      if (uniqueExercises.length > 0) {
        setSelectedExercise(uniqueExercises[0] || '');
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    requireAuth(async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const response = await api.post('/ai/advice', { question: input });

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        toast.error('Failed to get AI response');
      } finally {
        setLoading(false);
      }
    }, {
      title: 'AI Coaching Requires Account',
      description: 'Sign in or create an account to chat with the AI Coach and get personalized recommendations.',
      nextUrl: '/ai-coach'
    });
  };

  const handleFormFeedback = async () => {
    const notes = prompt("Enter your notes about the exercise (e.g., 'lower back felt tight', 'knee pain'):");
    
    if (!notes) return;

    setLoading(true);
    try {
      const response = await api.post('/ai/form-feedback', { notes, exerciseName: selectedExercise || 'your workout' });

      const feedbackMessage: Message = {
        id: Date.now().toString(),
        text: `📝 Form Feedback for ${selectedExercise || 'exercise'}:\n\n${response.data.feedback}\n\n💡 Tips:\n${response.data.tips.map((t: string) => `• ${t}`).join('\n')}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, feedbackMessage]);
    } catch (error) {
      toast.error('Failed to get form feedback');
    } finally {
      setLoading(false);
    }
  };

  const handlePlateauDetection = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/detect-plateau${selectedExercise ? `?exerciseName=${selectedExercise}` : ''}`);

      setPlateauData(response.data);
      setShowPlateauAnalysis(true);

      const plateauMessage: Message = {
        id: Date.now().toString(),
        text: response.data.message + '\n\n💡 Suggestions:\n' + response.data.suggestions.map((s: string) => `• ${s}`).join('\n'),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, plateauMessage]);
    } catch (error) {
      toast.error('Failed to detect plateau');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightRecommendation = async () => {
    if (!selectedExercise) {
      toast.error('Please select an exercise first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/ai/weight-recommendation?exerciseName=${selectedExercise}`);

      const recommendationMessage: Message = {
        id: Date.now().toString(),
        text: `⚡ Weight Recommendation for ${selectedExercise}:\n\nLast Workout: ${response.data.lastWorkout?.weight || 'N/A'}kg x ${response.data.lastWorkout?.reps || 'N/A'} reps\n\n📈 Recommended Weight: ${response.data.recommendedWeight || 'Start light'}kg\n\n💡 ${response.data.adjustmentReason}\n\n🎯 ${response.data.tip || 'Focus on progressive overload!'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, recommendationMessage]);
    } catch (error) {
      toast.error('Failed to get weight recommendation');
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "I think I hit a plateau, what should I do?",
    "Give me form tips for better results",
    "How much weight should I add next session?",
    "How can I recover faster?"
  ];

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F9FAFB] p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
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
              🤖 FITSPHERE AI ATHLETIC COACH
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Personalized training guidance, plateau analysis, and progressive overload calculations
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFormFeedback}
              disabled={loading}
              className="px-4 py-2.5 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition"
            >
              📝 Form Advice
            </button>
            <button
              onClick={handlePlateauDetection}
              disabled={loading}
              className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)]"
            >
              🔍 Detect Plateau
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="bg-[#11161F] p-4 rounded-2xl border border-[#202938] neu-raised">
          <p className="text-gray-400 text-xs font-black uppercase font-heading tracking-wider mb-2">Quick Coaching Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="text-xs bg-[#0D1117] hover:bg-[#18202C] text-gray-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-[#202938] neu-inset transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Viewport */}
        <div className="bg-[#11161F] rounded-3xl border border-[#202938] neu-raised overflow-hidden">
          <div className="h-[460px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-[#FF5500] text-white font-semibold shadow-[0_0_15px_rgba(255,85,0,0.25)]'
                      : 'bg-[#0D1117] text-gray-200 border border-[#202938] neu-inset'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  <p className="text-[10px] opacity-60 mt-2 font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0D1117] p-4 rounded-2xl border border-[#202938]">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#FF5500] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#FF5500] rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-[#FF5500] rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Controls */}
          <div className="border-t border-[#202938] p-4 bg-[#090C10]">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your AI Coach about training, sets, reps, or nutrition..."
                className="flex-1 px-4 py-3 bg-[#0D1117] text-white rounded-xl border border-[#202938] neu-inset focus-visible:ring-2 focus-visible:ring-[#FF5500] text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold font-heading uppercase text-xs px-6 py-3 rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] disabled:opacity-50"
              >
                Send
              </button>
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