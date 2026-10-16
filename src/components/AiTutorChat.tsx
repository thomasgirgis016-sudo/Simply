import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Lightbulb,
  Award
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { askAiTutor } from '../services/gemini';
import { MathRenderer } from './MathRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiTutorChatProps {
  subject: Subject;
  profile: UserProfile;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export const AiTutorChat: React.FC<AiTutorChatProps> = ({
  subject,
  profile,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${profile.name}! 👋 I am your **${profile.board === 'Both' ? 'Cambridge & Edexcel' : profile.board} IGCSE Examiner & Co-Pilot** for **${subject.name} (${subject.code})**.\n\nWhether you need help understanding a past paper question, mastering difficult definitions, or breaking down high-mark calculation problems, I'm here to ensure you reach your goal of **${profile.targetGrade}**!\n\nWhat topic would you like to review today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion) {
      handleSend(initialQuestion);
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const reply = await askAiTutor(
        history,
        subject.name,
        profile.board === 'Both' ? subject.board : profile.board,
        profile.geminiApiKey,
        profile.selectedModel
      );

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared! What shall we tackle in **${subject.name}** next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickQuestions = [
    `How do I get an A* / Grade 9 in ${subject.name}?`,
    `Give me a challenging IGCSE question on ${subject.topics[0] || 'core concepts'}`,
    `What are the most common mistakes candidates make in this exam?`,
    `Explain the marking difference between [M1], [A1], and [B1] marks`
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-180px)] min-h-[600px] max-w-4xl flex-col rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">IGCSE Chief Examiner AI</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized for {subject.code} • Target Goal: {profile.targetGrade}
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title="Clear Conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                    : 'border border-slate-800 bg-slate-950/70 text-slate-200'
                }`}
              >
                <MathRenderer content={m.content} className="text-xs sm:text-sm leading-relaxed" />
                <p className={`mt-2 text-[10px] text-right ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {m.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-400" />
              Examiner AI is evaluating mark scheme criteria...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="shrink-0 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1 text-[11px] text-slate-300 hover:border-purple-500 hover:text-white transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about ${subject.name} past papers, formulas or mark schemes...`}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
