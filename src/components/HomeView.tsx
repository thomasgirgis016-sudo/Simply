import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Layers,
  Zap,
  Mic,
  Calculator,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  Star,
  BookMarked,
  Clock,
  Crown,
  KeyRound,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Subject, UserProfile, BookmarkItem, UserAccount } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';

interface HomeViewProps {
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onNavigateTab,
  profile,
  currentUser,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 1-Click Guest Sandbox State
  const [sandboxTab, setSandboxTab] = useState<'flashcards' | 'quiz' | 'photo'>('flashcards');
  const [sandboxCardIdx, setSandboxCardIdx] = useState(0);
  const [sandboxCardFlipped, setSandboxCardFlipped] = useState(false);
  const [sandboxQuizSelected, setSandboxQuizSelected] = useState<number | null>(null);

  const sampleFlashcards = [
    {
      subject: 'CIE 0580 Mathematics',
      topic: 'Algebra & Quadratics',
      question: 'What is the Quadratic Formula and what does the discriminant b² - 4ac indicate?',
      answer: 'Formula: x = (-b ± √(b² - 4ac)) / (2a).\n• If b² - 4ac > 0: Two distinct real roots.\n• If b² - 4ac = 0: One repeated real root.\n• If b² - 4ac < 0: No real roots.',
      formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      tip: 'The division is over 2a for the entire numerator, not just the square root!'
    },
    {
      subject: 'CIE 0625 Physics',
      topic: 'Waves & Light Refraction',
      question: 'State Snell’s Law for refraction and the condition for Total Internal Reflection (TIR).',
      answer: 'Snell’s Law: n = sin(i) / sin(r).\nCritical Angle (c): sin(c) = 1/n.\nTIR occurs when light travels from a denser to a less dense medium and the angle of incidence i exceeds the critical angle c.',
      formula: 'n = \\frac{\\sin i}{\\sin r} = \\frac{1}{\\sin c}',
      tip: 'Remember that the refractive index n is always > 1 when entering from air or vacuum.'
    },
    {
      subject: 'CIE 0620 Chemistry',
      topic: 'Redox & Electrochemistry',
      question: 'Define oxidation and reduction in terms of electron transfer and state the OIL RIG rule.',
      answer: 'OIL RIG:\n• Oxidation Is Loss of electrons (increase in oxidation number).\n• Reduction Is Gain of electrons (decrease in oxidation number).\nAn oxidizing agent takes electrons and is itself reduced.',
      formula: '\\text{Zn} + \\text{Cu}^{2+} \\rightarrow \\text{Zn}^{2+} + \\text{Cu}',
      tip: 'Identify oxidation numbers on both sides of the equation to pinpoint electron movement.'
    }
  ];

  const sampleQuiz = {
    subject: 'Cambridge IGCSE Physics (0625/42)',
    topic: 'Kinematics & Speed-Time Calculation',
    question: 'A train accelerates uniformly from rest at 2.0 m/s² for 10 seconds. Calculate the total distance traveled during this acceleration.',
    options: [
      { text: '20 m', correct: false },
      { text: '100 m', correct: true },
      { text: '200 m', correct: false },
      { text: '50 m', correct: false }
    ],
    explanation: 'Using kinematic equation s = ut + ½at²:\nSince starting from rest, u = 0.\ns = (0)(10) + ½(2.0)(10)² = ½(2.0)(100) = 100 m.\n[M1] for correctly selecting and applying s = ½at²\n[A1] for 100 m with correct units.'
  };

  // Unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [subjects]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesBoard =
        boardFilter === 'All' ||
        subject.board === boardFilter ||
        subject.board === 'Both';
      const matchesCategory =
        categoryFilter === 'All' || subject.category === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesBoard && matchesCategory && matchesSearch;
    });
  }, [subjects, boardFilter, categoryFilter, searchQuery]);

  // Live Omnisearch Matches (Subjects, Past Papers, Revision Topics, Formulas)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return null;
    const q = searchQuery.toLowerCase();

    const matchedSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.topics.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedPapers = PAST_PAPERS_DATABASE.filter(
      (p) =>
        p.snippetQuery.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.paperCode.toLowerCase().includes(q) ||
        p.session.toLowerCase().includes(q) ||
        p.questionPrompt.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedNotes = INITIAL_REVISION_NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.chapter.toLowerCase().includes(q) ||
        n.keyConcepts.some((c) => c.heading.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedFormulas = INITIAL_FORMULAS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      subjects: matchedSubjects,
      papers: matchedPapers,
      notes: matchedNotes,
      formulas: matchedFormulas,
    };
  }, [searchQuery, subjects]);

  const handleSelectSubjectAndTab = (subject: Subject, tab: ActiveTab) => {
    onSelectSubject(subject);
    onNavigateTab(tab);
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('simply_igcse_bookmarks', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-24 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Cambridge (CIE) & Pearson Edexcel Syllabuses
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              Target Grade 9 / A* Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Complete IGCSE Revision & Exam Co-Pilot
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Authentic classified past papers, mark schemes with method mark breakdowns ($M1, A1, B1$), syllabus revision notes with Cambridge examiner report traps, and multimodal AI grading.
          </p>

          {/* Prominent Universal Search Bar */}
          <div className="relative mt-7 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any subject, topic (e.g. 0580, Redox, Bearings), or past paper question..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 py-3.5 pl-12 pr-10 text-sm text-white placeholder-slate-400 shadow-xl backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Maths 0580', 'Chemistry 0620', 'Physics 0625', 'ESL 0510', 'Edexcel 4MA1', 'Circle Theorems'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Live Search Dropdown */}
            {searchResults && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
                {searchResults.subjects.length === 0 &&
                searchResults.papers.length === 0 &&
                searchResults.notes.length === 0 &&
                searchResults.formulas.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No results found for "{searchQuery}". Try a syllabus code like "0580" or topic like "Algebra".
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Subjects */}
                    {searchResults.subjects.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-1">
                          Subjects ({searchResults.subjects.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.subjects.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectSubject(sub);
                                onNavigateTab('revision');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 font-mono">
                                  {sub.code}
                                </span>
                                <span className="text-xs font-semibold text-white">{sub.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{sub.board}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Papers */}
                    {searchResults.papers.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-1">
                          Past Paper Questions ({searchResults.papers.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.papers.map((paper) => (
                            <button
                              key={paper.id}
                              onClick={() => {
                                const targetSub = subjects.find((s) => s.id === paper.subjectId);
                                if (targetSub) onSelectSubject(targetSub);
                                onNavigateTab('finder');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-200">
                                  {paper.session} {paper.questionNumber} • {paper.topic}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">
                                  {paper.questionPrompt}
                                </div>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold text-amber-400 ml-2">
                                {paper.marks} Marks
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Revision Notes */}
                    {searchResults.notes.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-1">
                          Revision Notes ({searchResults.notes.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.notes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => {
                                const targetSub = subjects.find((s) => s.id === note.subjectId);
                                if (targetSub) onSelectSubject(targetSub);
                                onNavigateTab('revision');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-200">{note.title}</span>
                                <span className="text-[10px] text-slate-400 ml-2">({note.chapter})</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account Status / Auth Callout Banner */}
      {!currentUser ? (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/25 to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              <KeyRound className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Student Account Required for Tool Access</h3>
              <p className="text-xs text-slate-300">Sign in or register a new student account to unlock the AI Question Solver, Past Papers, and Quizzes.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onOpenAuth && (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-400 hover:to-purple-500 transition cursor-pointer"
                >
                  Register Account
                </button>
              </>
            )}
          </div>
        </div>
      ) : currentUser.status === 'pending' ? (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Account is Awaiting Admin Approval</h3>
              <p className="text-xs text-amber-200/80">An administrator is reviewing your registration ({currentUser.email}). You will gain full access as soon as it is accepted.</p>
            </div>
          </div>
        </div>
      ) : currentUser.role === 'admin' ? (
        <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Administrator Mode Active</h3>
              <p className="text-xs text-purple-200/80">You can review and accept new student accounts in the Admin Console.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('admin')}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition cursor-pointer shrink-0"
          >
            Open Admin Console
          </button>
        </div>
      ) : null}

      {/* 1-Click Guest Sandbox (Try Before Registering) */}
      <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>1-Click Guest Sandbox · Instant Test Drive</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Test Simply IGCSE Tools in 1 Click
            </h2>
            <p className="text-xs text-slate-300">
              Try sample interactive study tools below before creating your free account. Instant student activation upon sign-up!
            </p>
          </div>

          {/* Sandbox Feature Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                setSandboxTab('flashcards');
                setSandboxCardFlipped(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                sandboxTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>3 Flashcards</span>
            </button>

            <button
              onClick={() => {
                setSandboxTab('quiz');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                sandboxTab === 'quiz'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>1 Real Quiz</span>
            </button>

            <button
              onClick={() => {
                setSandboxTab('photo');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                sandboxTab === 'photo'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>1 AI Photo Solve</span>
            </button>
          </div>
        </div>

        {/* Sandbox Content Area */}
        {sandboxTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-indigo-300">
                Card {sandboxCardIdx + 1} of {sampleFlashcards.length} · {sampleFlashcards[sandboxCardIdx].subject}
              </span>
              <span className="text-[11px] text-slate-500">
                Click card or press flip to reveal Cambridge mark scheme answer
              </span>
            </div>

            {/* Interactive Flippable Card */}
            <div
              onClick={() => setSandboxCardFlipped(!sandboxCardFlipped)}
              className="relative min-h-[220px] rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl cursor-pointer hover:border-indigo-500/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300">
                    {sampleFlashcards[sandboxCardIdx].topic}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <RotateCcw className="h-3 w-3" />
                    <span>{sandboxCardFlipped ? 'Answer View' : 'Question View'} (Click to flip)</span>
                  </span>
                </div>

                {!sandboxCardFlipped ? (
                  <div className="space-y-3">
                    <p className="text-base sm:text-lg font-bold text-white leading-snug">
                      {sampleFlashcards[sandboxCardIdx].question}
                    </p>
                    <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-xs text-slate-400">
                      💡 Tip: Formulate your answer first, then flip to check against examiner criteria.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-sm text-emerald-300 whitespace-pre-line font-medium leading-relaxed">
                      {sampleFlashcards[sandboxCardIdx].answer}
                    </div>

                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-xs">
                      <span className="text-slate-400 font-semibold block mb-0.5">Key Equation / Formula:</span>
                      <code className="text-indigo-300 font-mono text-xs">{sampleFlashcards[sandboxCardIdx].formula}</code>
                    </div>

                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5">
                      ⚠️ Examiner Tip: {sampleFlashcards[sandboxCardIdx].tip}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSandboxCardIdx((prev) => (prev > 0 ? prev - 1 : sampleFlashcards.length - 1));
                    setSandboxCardFlipped(false);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  ← Previous Card
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSandboxCardFlipped(!sandboxCardFlipped);
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 cursor-pointer"
                >
                  {sandboxCardFlipped ? 'Show Question' : 'Reveal Answer'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSandboxCardIdx((prev) => (prev + 1) % sampleFlashcards.length);
                    setSandboxCardFlipped(false);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Next Card →
                </button>
              </div>
            </div>
          </div>
        )}

        {sandboxTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-purple-300">
                {sampleQuiz.subject} · {sampleQuiz.topic}
              </span>
              <span className="text-[11px] text-slate-500">
                Select an option for instant mark scheme analysis
              </span>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {sampleQuiz.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleQuiz.options.map((opt, i) => {
                  const isSelected = sandboxQuizSelected === i;
                  const isAnswered = sandboxQuizSelected !== null;
                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => setSandboxQuizSelected(i)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-xs font-semibold transition cursor-pointer ${
                        !isAnswered
                          ? 'border-slate-800 bg-slate-900 text-slate-200 hover:border-purple-500 hover:bg-slate-800'
                          : opt.correct
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                          : isSelected
                          ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                          : 'border-slate-800 bg-slate-900/50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isAnswered && opt.correct && (
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {sandboxQuizSelected !== null && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    {sampleQuiz.options[sandboxQuizSelected].correct ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <Check className="h-4 w-4" /> Correct Answer! (+2 Marks)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400">
                        <AlertTriangle className="h-4 w-4" /> Incorrect Selection
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {sampleQuiz.explanation}
                  </div>
                  <button
                    onClick={() => setSandboxQuizSelected(null)}
                    className="mt-2 text-xs text-purple-400 hover:underline font-semibold cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {sandboxTab === 'photo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-emerald-300">
                Cambridge IGCSE Mathematics (0580/42) · Bearings & Sine Rule [4 Marks]
              </span>
              <span className="text-[11px] text-slate-500">
                AI Senior Examiner 4-Part Structured Breakdown
              </span>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl space-y-4">
              {/* Question Simulated Capture */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[10px] font-bold font-mono">
                    Sample Exam Question
                  </span>
                  <p className="text-xs font-semibold text-white">
                    "In triangle ABC, AB = 8.5 km, angle BAC = 42°, and angle ABC = 68°. Calculate length BC."
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 shrink-0">
                  Total: 4 Marks
                </div>
              </div>

              {/* 4-Part Examiner Solution Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Core Concept */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                  <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <span>1. Core Concept & Formula</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Triangle with two known angles and an opposite side: Apply the <strong>Sine Rule</strong>:
                  </p>
                  <code className="text-indigo-300 font-mono text-[11px] block mt-1">
                    BC / sin(42°) = AB / sin(ACB)
                  </code>
                </div>

                {/* 2. Step-by-Step Working */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <span>2. Step-by-Step Working [M1, M2]</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    • Angle ACB = 180° - (42° + 68°) = 70° [M1]<br />
                    • BC = (8.5 × sin 42°) / sin 70° [M1]<br />
                    • BC = 5.687 / 0.9397 = 6.052 km
                  </p>
                </div>

                {/* 3. Final Answer */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>3. Final Answer & Units [A1]</span>
                  </div>
                  <p className="text-emerald-200 font-bold text-sm">
                    BC = 6.05 km (3 significant figures)
                  </p>
                  <p className="text-[11px] text-emerald-300/70">
                    Cambridge mark schemes require 3 s.f. for non-exact values unless specified.
                  </p>
                </div>

                {/* 4. Examiner Trap */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>4. Examiner Trap & Pitfall</span>
                  </div>
                  <p className="text-amber-200 leading-relaxed text-[11px]">
                    Candidates who incorrectly use angle ABC (68°) directly opposite BC lose the M1 method mark and write 8.16 km. Always calculate third angle first!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Sandbox Call to Action */}
        {!currentUser && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 p-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-200">
                Instant Student Activation is active. Register free now to unlock unlimited AI solves, 1,500+ past papers, and personal progress tracking.
              </p>
            </div>
            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs px-5 py-2.5 shadow-lg transition cursor-pointer"
              >
                Register Free Account →
              </button>
            )}
          </div>
        )}
      </section>

      {/* 2. Main 4 Core Action Pillars (Instant Access) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Primary Revision Tools
            </h2>
            <p className="text-xs text-slate-400">
              Everything you need to master your syllabus and ace exam day
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Select any module to start
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Past Papers & Mark Schemes */}
          <div
            onClick={() => onNavigateTab('finder')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-4 group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                Real Past Papers
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                Past Paper Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Filter by subject, year, session, and tier. View question papers alongside authentic mark schemes with $M1, A1, B1$ points.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Open Past Papers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 2: Revision Notes & Examiner Traps */}
          <div
            onClick={() => onNavigateTab('revision')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 mb-4 group-hover:scale-105 transition">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
                High-Yield Summaries
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-cyan-300 transition">
                Revision Notes
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Concise, syllabus-aligned chapter notes with Cambridge Chief Examiner Report warnings, definitions, and 1-click printable PDF summaries.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition">
              <span>Browse Revision Notes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 3: Practice Quizzes & Flashcards */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 mb-4 group-hover:scale-105 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                Active Recall & Timed
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition">
                Mock Quizzes & Cards
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Test yourself under realistic exam timing (1 min/mark) with spaced repetition flashcards and instant mark scheme feedback.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Start Practice Quiz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 4: AI Examiner & Photo Solver */}
          <div
            onClick={() => onNavigateTab('solver')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-pink-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 mb-4 group-hover:scale-105 transition">
                <Camera className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-300 font-mono">
                Multimodal AI Vision
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-pink-300 transition">
                AI Solver & Grader
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Grade your handwritten student working with red-ink annotations ($M1, A1, B1$) or snap a picture of any tricky textbook problem.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-pink-400 group-hover:translate-x-1 transition">
              <span>Grade My Working</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Secondary Utility Modules Bar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Interactive Exam Utilities</h3>
          </div>
          <span className="text-xs text-slate-400">Official tools tailored for Year 10 & 11 candidates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('checklist')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-emerald-500/40 hover:bg-slate-900 transition"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Syllabus Tracker</div>
              <div className="text-[10px] text-slate-400">RAG confidence list</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('esl-speaking')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-purple-500/40 hover:bg-slate-900 transition"
          >
            <Mic className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">ESL Speaking Oral</div>
              <div className="text-[10px] text-slate-400">Voice examiner & timer</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('boundaries')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-teal-500/40 hover:bg-slate-900 transition"
          >
            <TrendingUp className="h-5 w-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Grade Boundaries</div>
              <div className="text-[10px] text-slate-400">Historical thresholds</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('split')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-sky-500/40 hover:bg-slate-900 transition"
          >
            <Layers className="h-5 w-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Split-Screen QP/MS</div>
              <div className="text-[10px] text-slate-400">Dual-pane paper exam</div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Bookmarks & Saved Resources (if any exist) */}
      {bookmarks.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>Your Saved & Bookmarked Items ({bookmarks.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Stored in browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  const targetSub = subjects.find((s) => s.id === b.subjectId);
                  if (targetSub) onSelectSubject(targetSub);
                  onNavigateTab(b.tab as ActiveTab);
                }}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-3 hover:border-amber-500/40 transition cursor-pointer"
              >
                <div>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">
                    {b.subjectCode}
                  </span>
                  <div className="text-xs font-bold text-white mt-1">{b.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{b.subtitle}</div>
                </div>
                <button
                  onClick={(e) => handleRemoveBookmark(b.id, e)}
                  className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove bookmark"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Subject Catalog & Resource Navigation Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Curriculum & Subject Directory
            </h2>
            <p className="text-xs text-slate-400">
              Select a subject to instantly jump into Past Papers, Revision Notes, Formulas, or Quizzes
            </p>
          </div>

          {/* Board Selector Tabs: All vs Cambridge vs Edexcel */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 self-start sm:self-auto">
            {(['All', 'CIE', 'Edexcel'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBoardFilter(b)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  boardFilter === b
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b === 'All' ? 'All Boards' : b === 'CIE' ? 'Cambridge (CIE)' : 'Pearson Edexcel'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-xl px-3 py-1 font-semibold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const isCurrentlyActive = sub.id === activeSubject.id;
            const isCambridge = sub.board === 'CIE';

            return (
              <div
                key={sub.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition shadow-md ${
                  isCurrentlyActive
                    ? 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/30 to-slate-900 ring-1 ring-indigo-500/30'
                    : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  {/* Top Bar: Syllabus Code & Board Distinction */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-black font-mono border ${
                        isCambridge
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {sub.code}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isCambridge
                          ? 'bg-blue-900/40 text-blue-200'
                          : 'bg-cyan-900/40 text-cyan-200'
                      }`}
                    >
                      {isCambridge ? 'Cambridge IGCSE' : 'Pearson Edexcel'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mt-1">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {sub.topics.slice(0, 3).join(' • ')}...
                  </p>
                </div>

                {/* Resource Direct Links for this Subject */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Direct Subject Resources:
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'finder')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 transition"
                      title="Open Past Papers"
                    >
                      Papers
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'revision')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition"
                      title="Open Revision Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'quiz')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition"
                      title="Open Past Paper Quizzes"
                    >
                      Quizzes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'solver')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/40 transition"
                      title="Open AI Solver"
                    >
                      AI Solver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
