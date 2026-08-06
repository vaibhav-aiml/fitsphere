'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import useRequireAuth from '@/hooks/useRequireAuth';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function AICoach() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 Hi! I'm your FitSphere AI Coach powered by Groq AI. Ask me anything about workout programming, progressive overload, recovery, form, or nutrition!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [plateauData, setPlateauData] = useState<any>(null);
  const [showPlateauAnalysis, setShowPlateauAnalysis] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const { requireAuth, modalOpen, closeModal, authConfig } = useRequireAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchExercises();
      fetchChatHistory();
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

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/ai/chat-history');
      if (response.data.success && response.data.messages && response.data.messages.length > 0) {
        const restored: Message[] = response.data.messages.map((m: any) => ({
          id: m.id,
          text: m.text,
          isUser: m.isUser,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(restored);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your AI Coach chat history?')) return;
    try {
      await api.delete('/ai/chat-history');
      setMessages([
        {
          id: 'welcome',
          text: "👋 Chat history cleared. How can I help you with your fitness goals today?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear chat history');
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsStreaming(false);
    setLoading(false);
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
    toast('Generation stopped', { icon: '🛑' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || isStreaming) return;

    requireAuth(async () => {
      const questionText = input.trim();
      const userMessageId = Date.now().toString();
      const aiMessageId = (Date.now() + 1).toString();

      const userMessage: Message = {
        id: userMessageId,
        text: questionText,
        isUser: true,
        timestamp: new Date()
      };

      const initialAiMessage: Message = {
        id: aiMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, userMessage, initialAiMessage]);
      setInput('');
      setLoading(true);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 60-second request timeout
      timeoutIdRef.current = setTimeout(() => {
        if (controller) {
          controller.abort();
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMessageId
                ? { ...m, text: m.text || '⚠️ The request timed out. Please try again.', isStreaming: false }
                : m
            )
          );
          setLoading(false);
          setIsStreaming(false);
          toast.error('Request timed out after 60 seconds');
        }
      }, 60000);

      try {
        const token = localStorage.getItem('token');
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;

        const response = await fetch(`${baseUrl}/ai/advice/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ question: questionText }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body received');
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
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const event = JSON.parse(trimmed);
              if (event.type === 'token') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMessageId
                      ? { ...m, text: m.text + event.content }
                      : m
                  )
                );
              } else if (event.type === 'error') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMessageId
                      ? { ...m, text: event.content || '⚠️ The AI Coach is temporarily unavailable.', isStreaming: false }
                      : m
                  )
                );
              } else if (event.type === 'done') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMessageId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch (e) {
              console.error('Failed to parse NDJSON line:', line, e);
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Streaming error:', error);
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMessageId
                ? { ...m, text: m.text || '⚠️ The AI Coach is temporarily unavailable. Please try again in a moment.', isStreaming: false }
                : m
            )
          );
          toast.error('Failed to get AI response');
        }
      } finally {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        abortControllerRef.current = null;
        setLoading(false);
        setIsStreaming(false);
        setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
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
        text: `📝 **Form Feedback for ${selectedExercise || 'exercise'}**:\n\n${response.data.feedback}\n\n💡 **Tips**:\n${response.data.tips.map((t: string) => `* ${t}`).join('\n')}`,
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
        text: `${response.data.message}\n\n💡 **Suggestions**:\n${response.data.suggestions.map((s: string) => `* ${s}`).join('\n')}`,
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
              Real AI training guidance powered by Groq LLM with ChatGPT-style streaming
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClearHistory}
              disabled={loading || isStreaming}
              className="px-3 py-2 bg-[#18202C] hover:bg-[#202938] text-gray-300 hover:text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition"
            >
              🗑️ Clear Chat
            </button>
            <button
              onClick={handleFormFeedback}
              disabled={loading || isStreaming}
              className="px-4 py-2 bg-[#18202C] hover:bg-[#202938] text-white text-xs font-bold font-heading uppercase rounded-xl border border-[#202938] neu-raised transition"
            >
              📝 Form Advice
            </button>
            <button
              onClick={handlePlateauDetection}
              disabled={loading || isStreaming}
              className="px-4 py-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-extrabold font-heading uppercase rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)]"
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
                disabled={loading || isStreaming}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="text-xs bg-[#0D1117] hover:bg-[#18202C] text-gray-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-[#202938] neu-inset transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Viewport */}
        <div className="bg-[#11161F] rounded-3xl border border-[#202938] neu-raised overflow-hidden">
          <div className="h-[480px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-[#FF5500] text-white font-semibold shadow-[0_0_15px_rgba(255,85,0,0.25)]'
                      : 'bg-[#0D1117] text-gray-200 border border-[#202938] neu-inset'
                  }`}
                >
                  {message.isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                      >
                        {message.text}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#FF5500] animate-pulse align-middle" />
                      )}
                    </div>
                  )}
                  <p className="text-[10px] opacity-60 mt-2 font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
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
                disabled={loading || isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={handleStopGenerating}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold font-heading uppercase text-xs px-6 py-3 rounded-xl transition"
                >
                  Stop 🛑
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold font-heading uppercase text-xs px-6 py-3 rounded-xl transition shadow-[0_0_15px_rgba(255,85,0,0.3)] disabled:opacity-50"
                >
                  Send
                </button>
              )}
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