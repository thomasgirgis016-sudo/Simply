import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Lightbulb,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { askAiTutor } from '../services/gemini';
import { getAllPastPapers } from '../data/pastPapersData';
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
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ **Connection Notice**: The Examiner AI encountered a temporary network delay. Please retry your question or check your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
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

  const getSubjectQuickPrompts = (): string[] => {
    // 1. Exact subject ID match
    const promptMap: Record<string, string[]> = {
      'cie-math-0580': [
        'How do I solve quadratic equations using the formula and avoid negative sign slips?',
        'Explain the circle theorems and exact geometric reasons required by Cambridge mark schemes.',
        'How do I find the equation of a perpendicular bisector and midpoints in coordinate geometry?',
        `Give me a challenging 5-mark Paper 4 question on ${subject.topics[5] || 'vectors and transformations'}.`
      ],
      'edx-math-4ma1': [
        'How do I find turning points and gradients using differentiation (dy/dx)?',
        'Explain sine rule, cosine rule, and 3D trigonometry with method marks.',
        'How to calculate cumulative frequency, median, and interquartile range correctly?',
        'Walk through a high-mark problem on algebraic fractions and proofs.'
      ],
      'cie-addmath-0606': [
        'Explain circular measure: arc length and sector area in radians ($s = r\\theta, A = \\frac{1}{2}r^2\\theta$).',
        'How do I evaluate permutations vs combinations in exam scenarios?',
        'Integration: finding the equation of a curve given dy/dx and a point.',
        'Logarithmic and exponential laws with mark scheme steps.'
      ],
      'cie-physics-0625': [
        'Explain conservation of momentum ($m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2$) with mark breakdown.',
        'How do I calculate refractive index and critical angle using total internal reflection?',
        'Explain the transformer equation ($V_p/V_s = N_p/N_s$) and electrical power transmission loss ($P = I^2R$).',
        'Break down half-life calculations and radioactive decay curve interpretation.'
      ],
      'edx-physics-4ph1': [
        'Explain terminal velocity for a falling parachutist with forces and mark points.',
        'How do I calculate Doppler effect and frequency shift for moving sound or light?',
        'Mains electricity: Earth wire, fuse ratings, and double insulation explained.',
        'Astrophysics: Redshift, Hubble\'s Law, and Big Bang evidence.'
      ],
      'cie-chem-0620': [
        'Explain Redox reactions (OIL RIG, oxidation states & identifying agents).',
        'How to write full ionic equations and identify spectator ions for precipitation.',
        'Explain electrolysis of molten lead(II) bromide vs concentrated aqueous NaCl (brine).',
        'Le Chatelier\'s principle: predicting equilibrium yield with temperature and pressure changes.'
      ],
      'edx-chem-4ch1': [
        'Explain fractional distillation of crude oil and uses of each hydrocarbon fraction.',
        'How to calculate empirical formula and molecular formula from combustion masses.',
        'Reactivity series: displacement reactions and blast furnace iron extraction.',
        'Energetics: bond energy calculation (bonds broken minus bonds formed).'
      ],
      'cie-bio-0610': [
        'Explain enzyme action, the lock-and-key hypothesis, and thermal denaturation.',
        'Mitosis vs Meiosis: chromosome number, daughter cells, and biological purpose.',
        'Explain the transpiration stream: water uptake via root hair cells and stomatal control.',
        'How do alveoli adapt to maximize the rate of gas diffusion in human lungs?'
      ],
      'edx-bio-4bi1': [
        'Explain selective breeding vs genetic engineering with restriction enzymes and ligase.',
        'How does ADH control water balance and osmoregulation in the nephron?',
        'Photosynthesis limiting factors: light intensity, CO2 concentration, and temperature.',
        'Explain ecological food webs, energy loss between trophic levels, and pyramids of biomass.'
      ],
      'cie-esl-0510': [
        'How do I structure an informal email (Exercise 5) to score maximum marks in Style and Content?',
        'Summary Writing (Exercise 4): Technique to extract 10 key points within 120 words.',
        'Top transition words and complex sentence connectors for school magazine articles.',
        'What are the key differences between a review and a formal report for Exercise 6?'
      ],
      'edx-esl-4es1': [
        'Paper 1 Part 4: How to paraphrase effectively in summary writing to earn language marks.',
        'Structure and formal register for Edexcel 4ES1 extended writing tasks.',
        'Tips to avoid common grammatical pitfalls in reading comprehension matching exercises.',
        'How to manage timing across Paper 1 reading and writing sections.'
      ],
      'cie-cs-0478': [
        'Explain Two\'s Complement representation for negative numbers and overflow error.',
        'Trace table technique: How to trace while loops and 1D arrays without making mistakes.',
        'How does the Von Neumann CPU architecture work (Fetch-Decode-Execute cycle)?',
        'Explain symmetric vs asymmetric encryption and digital certificates.'
      ],
      'cie-econ-0455': [
        'Explain Price Elasticity of Demand (PED) formula, elastic vs inelastic, and total revenue.',
        'Fiscal Policy vs Monetary Policy: government instruments, diagrams, and evaluation.',
        'How do negative externalities in production lead to market failure and social cost?',
        'Explain comparative advantage and the pros and cons of protectionist trade tariffs.'
      ],
      'cie-history-0470': [
        'How to structure a 10-mark source utility question using provenance, tone, and context.',
        'Who was to blame for the Cold War (1945–1949): Yalta, Potsdam, and Marshall Plan.',
        'What were the primary weaknesses of the League of Nations in Manchuria and Abyssinia?',
        'Germany 1918–1945: How did Hitler consolidate power between 1933 and 1934?'
      ]
    };

    if (promptMap[subject.id]) {
      return promptMap[subject.id];
    }

    // 2. Fallback based on category
    if (subject.category === 'Mathematics') {
      return [
        `How do I solve key equations in ${subject.name} without losing method marks?`,
        `What formulas are NOT given on the formula sheet for ${subject.code}?`,
        `Walk me through an exam question on ${subject.topics[0] || 'core algebra'}.`,
        `What are the most common arithmetic errors candidates make in ${subject.name}?`
      ];
    }
    if (subject.category === 'Sciences') {
      return [
        `What are the compulsory keywords for ${subject.topics[0] || 'core concepts'}?`,
        `Explain the experimental procedures and precautions for Paper 6 / Practical.`,
        `How do examiners allocate [M], [A], and [B] marks in ${subject.name}?`,
        `Give me a challenging question on ${subject.topics[1] || 'advanced principles'}.`
      ];
    }

    return [
      `How do I get an A* / Grade 9 in ${subject.name}?`,
      `What are the most common mistakes candidates make in ${subject.code}?`,
      `Give me a challenging past paper question on ${subject.topics[0] || 'core concepts'}.`,
      `Explain the top command words and mark scheme criteria for ${subject.name}.`
    ];
  };

  const quickQuestions = getSubjectQuickPrompts();

  const examQuestionsForSubject = useMemo(() => {
    const all = getAllPastPapers();
    return all.filter((p) => {
      if (p.subjectId === subject.id || (p.subjectCode && subject.code && p.subjectCode.toLowerCase() === subject.code.toLowerCase())) {
        return true;
      }
      return false;
    });
  }, [subject.id, subject.code]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-135px)] sm:h-[calc(100vh-180px)] max-w-4xl flex-col rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
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
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Examiner Guidance</span>
                  </div>
                )}
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

      {/* Exam Code & Question Quick Selector */}
      {examQuestionsForSubject.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 shrink-0 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Exam Qs & Mark Schemes:
          </span>
          {examQuestionsForSubject.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSend(`Show me ${p.paperCode} ${p.session} ${p.questionNumber} question and mark scheme`)}
              className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-950/50 px-2.5 py-1 text-[11px] text-sky-200 hover:border-sky-400 hover:bg-sky-900/60 transition cursor-pointer flex items-center gap-1"
              title={`Ask AI for ${p.paperCode} ${p.questionNumber}: ${p.topic}`}
            >
              <span className="font-mono text-[10px] text-sky-300">{p.paperCode}</span>
              <span className="font-bold">{p.questionNumber}</span>
              <span className="text-[10px] text-slate-400 font-normal">({p.topic})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSend(`For ${examQuestionsForSubject[0].paperCode} ${examQuestionsForSubject[0].questionNumber}, here is my answer: [type your answer here]. Grade my answer and tell me my marks.`)}
            className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            <span>Test & Grade My Answer</span>
          </button>
        </div>
      )}

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
      <div className="border-t border-slate-800 bg-slate-950 p-2.5 sm:p-4">
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
            placeholder={`Ask a question or enter exam code & Q# (e.g. 0580/42 Q6 or "Grade my answer: ...")...`}
            className="flex-1 rounded-xl sm:rounded-2xl border border-slate-700 bg-slate-900 px-3.5 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
