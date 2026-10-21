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
  CheckCircle2,
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
  AlertTriangle,
  Printer,
  Activity,
  Flame,
  Play,
  FlaskConical,
  Calendar,
  ShieldAlert,
  Swords,
  TrendingDown,
  Scan,
  Info,
  Target,
  School,
  UserCheck,
  Columns,
  ListChecks,
  MessageSquare
} from 'lucide-react';
import { Subject, UserProfile, BookmarkItem, UserAccount } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { getDailyStreak, getDailyChallengeQuestion, completeDailyChallenge, DailyStreakState } from '../services/dailyStreak';
import { MathRenderer } from './MathRenderer';
import { AboutSimplyModal } from './AboutSimplyModal';

interface HomeViewProps {
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onOpenParentReport?: () => void;
  onOpenStudyDuel?: () => void;
  onOpenHandwritingScanner?: () => void;
  onOpenAbout?: () => void;
}

type CategoryHub = 'featured' | 'papers' | 'ai' | 'mastery' | 'drills' | 'all';

export const HomeView: React.FC<HomeViewProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onNavigateTab,
  profile,
  currentUser,
  onOpenAuth,
  onOpenParentReport,
  onOpenStudyDuel,
  onOpenHandwritingScanner,
  onOpenAbout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeHub, setActiveHub] = useState<CategoryHub>('featured');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Cambridge Challenge & Study Streak State
  const [streakState, setStreakState] = useState<DailyStreakState>(() => getDailyStreak());
  const [dailyQuestion, setDailyQuestion] = useState(() => getDailyChallengeQuestion(activeSubject));
  const [dailyAnswerInput, setDailyAnswerInput] = useState('');
  const [dailyResult, setDailyResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  React.useEffect(() => {
    setDailyQuestion(getDailyChallengeQuestion(activeSubject));
    setDailyAnswerInput('');
    setDailyResult(null);
  }, [activeSubject]);

  const handleCheckDailyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyAnswerInput.trim()) return;
    const cleanStudent = dailyAnswerInput.trim().toLowerCase();
    const cleanFinal = dailyQuestion.finalAnswer.trim().toLowerCase();

    const isCorrect =
      cleanFinal.includes(cleanStudent) ||
      cleanStudent.includes(cleanFinal) ||
      cleanStudent.split(' ')[0] === cleanFinal.split(' ')[0];

    if (isCorrect) {
      const res = completeDailyChallenge({
        questionId: dailyQuestion.id,
        paperCode: dailyQuestion.paperCode,
        marksEarned: dailyQuestion.marks || 4,
        subjectId: activeSubject.id
      });
      setStreakState(getDailyStreak());
      setDailyResult({
        isCorrect: true,
        message: `Outstanding! Correct answer. You earned +${res.earnedXp} XP and extended your streak to 🔥 ${res.newStreak} days!`
      });
    } else {
      setDailyResult({
        isCorrect: false,
        message: `Not quite. Mark scheme answer: "${dailyQuestion.finalAnswer}". Method tip: ${dailyQuestion.markScheme?.[0]?.requirement || 'Review working steps'}.`
      });
    }
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

  // Live Omnisearch Matches
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
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. Sleek Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-24 h-56 w-56 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          {/* Brand Logo & Trust Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SimplyLogo size="md" />

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                CAIE & Edexcel
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                Grade 9 / A* Standard
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Cambridge & Pearson Edexcel Academic Operating System
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official past paper vault, AI Chief Examiner handwriting OCR, Paper 6 ATP lab simulators, and diagnostic error log designed to secure top examination boundaries.
            </p>
          </div>

          {/* Omnisearch Bar */}
          <div className="relative max-w-2xl pt-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any subject, past paper (e.g. 0580, Redox, Bearings), or topic..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 py-3 pl-11 pr-16 text-xs sm:text-sm text-white placeholder-slate-400 shadow-xl backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Maths 0580', 'Chemistry 0620', 'Physics 0625', 'Biology 0610', 'ESL 0510', 'Circle Theorems', 'Paper 6 ATP'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition cursor-pointer"
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
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition cursor-pointer"
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
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition cursor-pointer"
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Responsive 2-Column: Daily Challenge & Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Cambridge Challenge Widget */}
        <section className="lg:col-span-2 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/25 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-500/40">
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Daily Cambridge Challenge • {activeSubject.code}</span>
              </span>

              <span className="rounded-md bg-slate-950/80 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-300 border border-slate-800">
                🔥 {streakState.currentStreak} Day Streak ({streakState.xpPoints} XP)
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {dailyQuestion.topic} ({dailyQuestion.paperCode} • {dailyQuestion.questionNumber})
              </div>
              <div className="text-xs sm:text-sm text-slate-100 font-sans mt-1 leading-relaxed">
                <MathRenderer content={dailyQuestion.questionPrompt} />
              </div>
            </div>

            <form onSubmit={handleCheckDailyAnswer} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={dailyAnswerInput}
                onChange={(e) => setDailyAnswerInput(e.target.value)}
                placeholder="Enter final answer (e.g. 14.5 or x = 3)..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                Check Answer
              </button>
            </form>

            {dailyResult && (
              <div className={`rounded-xl p-2.5 text-xs font-semibold border animate-fadeIn ${
                dailyResult.isCorrect
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border-amber-500/40 bg-amber-950/40 text-amber-200'
              }`}>
                {dailyResult.message}
              </div>
            )}
          </div>
        </section>

        {/* Executive Platform Briefing Card */}
        <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Platform Executive Brief</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              What is Simply IGCSE?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              The next-generation academic OS engineered for Cambridge (CAIE) & Pearson Edexcel candidates. Built to eliminate unverified AI guesses and scattered PDF drives.
            </p>
            <div className="pt-1 space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="h-3 w-3" /> 100% Mark Scheme Fidelity ($M1, A1, B1$)
              </div>
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Check className="h-3 w-3" /> Real Examiner Report Synthesis
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Check className="h-3 w-3" /> Pen & Paper Handwritten Camera OCR
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="mt-4 w-full rounded-xl border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 py-2 px-3 text-xs font-bold text-indigo-200 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Info className="h-3.5 w-3.5 text-indigo-400" />
            <span>Read Full Executive Brief</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      {/* 3. The Categorized Command Center (No Endless Scrolling!) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              Interactive Revision Command Center
            </h2>
            <p className="text-xs text-slate-400">
              Switch categories below to jump directly into your target study modules
            </p>
          </div>

          {/* Quick Hub Filter Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'featured', label: '🌟 Curated Top 6' },
              { id: 'papers', label: '📝 Past Papers' },
              { id: 'ai', label: '🤖 AI & Grading' },
              { id: 'mastery', label: '🎯 Cambridge Masteries' },
              { id: 'drills', label: '⚡ Fast Drills & Notes' },
              { id: 'all', label: '📚 All 20+ Modules' }
            ].map((hub) => (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub.id as CategoryHub)}
                className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer shrink-0 ${
                  activeHub === hub.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Categorized Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Past Paper Hub (Visible in featured, papers, all) */}
          {(activeHub === 'featured' || activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('finder')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-3 group-hover:scale-105 transition">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                  3,500+ Official Papers
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                  Past Paper Vault & Search
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Search Cambridge & Edexcel papers by year, session, variant, and topic with authentic mark schemes.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Open Past Papers</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: AI Solver & Handwriting OCR (Visible in featured, ai, all) */}
          {(activeHub === 'featured' || activeHub === 'ai' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('solver')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-pink-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 mb-3 group-hover:scale-105 transition">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-300 font-mono">
                  Vision AI Grader
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-pink-300 transition">
                  AI Solver & Handwriting OCR
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Snap pen-and-paper working for instant line-by-line red-ink marking ([M1], [A1], [B1]) strictly against CAIE mark schemes.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-pink-400 group-hover:translate-x-1 transition">
                <span>Grade My Working</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: The Mistake Black Book (Visible in featured, mastery, all) */}
          {(activeHub === 'featured' || activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('mistakes')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-3 group-hover:scale-105 transition">
                  <BookMarked className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                  Error Rematch Engine
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition">
                  The Mistake Black Book
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Log questions you lost marks on, diagnose arithmetic vs command errors, and run active Rematch Quizzes until 100% mastered.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
                <span>Open Black Book</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Science Paper 6 ATP Master (Visible in featured, mastery, all) */}
          {(activeHub === 'featured' || activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('atp')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-3 group-hover:scale-105 transition">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                  Paper 6 Alternative to Practical
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                  Science ATP Master Lab
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interactive burette meniscus simulator, chemical flame & precipitate cation/anion tests, and 6-mark plan blueprint.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Launch ATP Suite</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Examiner Report Pitfalls Heatmap (Visible in featured, mastery, all) */}
          {(activeHub === 'featured' || activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('pitfalls')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-3 group-hover:scale-105 transition">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                  CAIE Examiner Reports
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition">
                  Examiner Pitfall Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  "Why students lost marks": Synthesizes official CAIE reports detailing misconceptions that cost candidates an A*.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
                <span>Explore Pitfalls</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Timed Mock Simulator (Visible in featured, papers, all) */}
          {(activeHub === 'featured' || activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('mock')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-3 group-hover:scale-105 transition">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                  Official Exam Conditions
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                  Timed Mock Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sit full-length timed Cambridge past papers with live countdowns, official instructions, and real Grade 9 boundary grading.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Start Mock Exam</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Split-Screen QP/MS (Visible in papers, all) */}
          {(activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('split')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-sky-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 mb-3">
                  <Columns className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300 font-mono">
                  Dual-Pane Exam
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-sky-300 transition">
                  Split-Screen QP/MS Viewer
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View Question Papers alongside official mark schemes synchronously without printing or switching tabs.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
                <span>Open Split Viewer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: 2025 Predicted Papers (Visible in papers, all) */}
          {(activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('predicted')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                  Cycle Intelligence
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-purple-300 transition">
                  2025 Predicted Papers
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Exam predictions calculated from Cambridge topic recurrence cycles for May/June and Oct/Nov series.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                <span>View Predictions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Night Before Cheat Sheets (Visible in drills, all) */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('cheatsheets')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                  1-Page Emergency PDF
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                  Night Before Cheat Sheets
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ultra-dense formulas, chemical tests, and examiner trap summaries formatted for 1-click A4 print.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>View Cheat Sheets</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: 60s Unit Conversion Blitz (Visible in drills, all) */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('blitz')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                  60s Speed Drill
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                  Unit Conversion Blitz
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Rapid-fire metric conversions ($cm^3 \leftrightarrow dm^3$, $kJ \leftrightarrow J$, $kPa \leftrightarrow Pa$) to stop careless mark loss.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Start Blitz</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Spaced Repetition Flashcards (Visible in drills, all) */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('flashcards')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-3">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                  SuperMemo SM-2 Engine
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition">
                  Spaced Repetition Flashcards
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Scientifically scheduled formula cards with daily due counter and active recall ratings (1 to 5).
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
                <span>Practice Due Cards</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Camera OCR Handwriting (Visible in ai, all) */}
          {(activeHub === 'ai' || activeHub === 'all') && (
            <div
              onClick={() => onOpenHandwritingScanner?.()}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-sky-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 mb-3">
                  <Scan className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300 font-mono">
                  Pen & Paper Camera OCR
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-sky-300 transition">
                  Snap Handwritten Paper
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Upload or take a photo of your handwritten paper for immediate line-by-line mark scheme breakdown.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
                <span>Scan Paper</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: AI Examiner Chat (Visible in ai, all) */}
          {(activeHub === 'ai' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('chat')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 mb-3">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                  Interactive AI Tutor
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-purple-300 transition">
                  AI Examiner Tutor Chat
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ask any question, get step-by-step mark scheme breakdowns, or request customized practice problems.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                <span>Start Tutoring Session</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Command Words Traps (Visible in mastery, all) */}
          {(activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('traps')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-3">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                  Command Words
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition">
                  Command Words Trap Detector
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Learn why candidates lose marks on Describe vs Explain and test yourself on Cambridge mark schemes.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
                <span>Check Traps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {/* Card: Revision Notes (Visible in drills, all) */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('revision')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 mb-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
                  High-Yield Summaries
                </span>
                <h3 className="text-base font-bold text-white mt-2 group-hover:text-cyan-300 transition">
                  Syllabus Revision Notes
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Concise chapter notes with Chief Examiner warnings, definitions, and 1-click printable summaries.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition">
                <span>Browse Notes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Curriculum & Subject Directory (Clean, spacious, no-clutter) */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Curriculum & Subject Directory
            </h2>
            <p className="text-xs text-slate-400">
              Select a subject to instantly access its Past Papers, Revision Notes, Formulas, or Quizzes
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
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 transition cursor-pointer"
                      title="Open Past Papers"
                    >
                      Papers
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'revision')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition cursor-pointer"
                      title="Open Revision Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'quiz')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition cursor-pointer"
                      title="Open Past Paper Quizzes"
                    >
                      Quizzes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'solver')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/40 transition cursor-pointer"
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

      {/* Platform Briefing Modal */}
      <AboutSimplyModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
