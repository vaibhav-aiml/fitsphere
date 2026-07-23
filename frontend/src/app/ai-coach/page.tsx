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
    "How can I recover faster?",
    "I'm losing motivation, help me!",
    "What should I eat for better performance?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-400 transition mb-2 block"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🤖 AI Coach</h1>
            <p className="text-gray-400 mt-1">Your personal fitness assistant powered by AI</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFormFeedback}
              disabled={loading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              📝 Form Feedback
            </button>
            <button
              onClick={handlePlateauDetection}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🔍 Detect Plateau
            </button>
          </div>
        </div>

        {/* Exercise Selector */}
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <label className="text-gray-300">Select Exercise:</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 flex-1"
            >
              <option value="">-- Select an exercise --</option>
              {exercises.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
            <button
              onClick={handleWeightRecommendation}
              disabled={loading || !selectedExercise}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              ⚡ Get Weight Recommendation
            </button>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 mb-6">
          <p className="text-gray-400 text-sm mb-3">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-4 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about fitness, form, nutrition, or plateaus..."
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-700">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-white font-semibold">Plateau Detection</p>
            <p className="text-gray-400 text-sm">Identify when you're stuck</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-700">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-white font-semibold">Form Feedback</p>
            <p className="text-gray-400 text-sm">Get tips from your notes</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 p-4 rounded-xl border border-yellow-700">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-white font-semibold">Weight Recs</p>
            <p className="text-gray-400 text-sm">Smart progression</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-700">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-white font-semibold">24/7 Coach</p>
            <p className="text-gray-400 text-sm">Always here to help</p>
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