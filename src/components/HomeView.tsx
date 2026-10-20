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
  Scan
} from 'lucide-react';
import { Subject, UserProfile, BookmarkItem, UserAccount } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { getDailyStreak, getDailyChallengeQuestion, completeDailyChallenge, DailyStreakState } from '../services/dailyStreak';
import { MathRenderer } from './MathRenderer';

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
}

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

    const isCorrect = cleanFinal.includes(cleanStudent) || cleanStudent.includes(cleanFinal) || cleanStudent.split(' ')[0] === cleanFinal.split(' ')[0];

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
          {/* Brand Logo Header */}
          <div className="mb-4">
            <SimplyLogo size="lg" />
          </div>

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
      ) : currentUser.role === 'founder' ? (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Crown className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Founder Console</h3>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30">Thomas</span>
              </div>
              <p className="text-xs text-amber-200/80">Full administrative, syllabus control, and platform authority unlocked.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('admin')}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 transition cursor-pointer shrink-0"
          >
            Open Founder Console
          </button>
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

      {/* Daily Cambridge Challenge & Streak Hero Card */}
      <section className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-500/40">
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Daily Cambridge Challenge • {activeSubject.code}</span>
              </span>

              <span className="rounded-md bg-slate-950/80 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-300 border border-slate-800">
                🔥 {streakState.currentStreak} Day Streak ({streakState.xpPoints} XP)
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question of the Day: {dailyQuestion.topic} ({dailyQuestion.paperCode} • {dailyQuestion.questionNumber})
              </div>
              <div className="text-sm sm:text-base text-slate-100 font-sans mt-1">
                <MathRenderer content={dailyQuestion.questionPrompt} />
              </div>
            </div>

            {/* Answer Input Field */}
            <form onSubmit={handleCheckDailyAnswer} className="flex flex-col sm:flex-row gap-2 max-w-xl pt-1">
              <input
                type="text"
                value={dailyAnswerInput}
                onChange={(e) => setDailyAnswerInput(e.target.value)}
                placeholder="Enter your final answer (e.g. 14.5 or x = 3)..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                Check Answer
              </button>
            </form>

            {dailyResult && (
              <div className={`rounded-xl p-3 text-xs font-semibold border animate-fadeIn ${
                dailyResult.isCorrect
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border-amber-500/40 bg-amber-950/40 text-amber-200'
              }`}>
                {dailyResult.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shrink-0 text-center space-y-1 min-w-[140px] hidden sm:block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Solved</span>
            <div className="text-2xl font-black font-mono text-white">{streakState.totalQuestionsSolved}</div>
            <span className="text-[10px] text-amber-400 font-bold block">🔥 Keep Streak Alive!</span>
          </div>
        </div>
      </section>

      {/* Advanced Exam Intelligence Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Advanced Exam Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Exam simulators, automated test builders, and diagnostic syllabus masteries
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> High-yield tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Timed Mock Simulator */}
          <div
            onClick={() => onNavigateTab('mock')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-4 group-hover:scale-105 transition">
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

          {/* Module 2: Worksheet Builder */}
          <div
            onClick={() => onNavigateTab('worksheet')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-4 group-hover:scale-105 transition">
                <Printer className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                Printable Homework Tests
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition">
                Worksheet Builder
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generate 1-click printable student test papers and teacher mark schemes for unit homework, revision packs, and quizzes.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
              <span>Create Worksheet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Module 3: Weak-Spot Radar */}
          <div
            onClick={() => onNavigateTab('radar')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 mb-4 group-hover:scale-105 transition">
                <Activity className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                Syllabus Diagnostic
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition">
                Grade 9 Weak-Spot Radar
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Track topic masteries across every chapter and pinpoint the top 3 bottlenecks holding your grade back from an A*.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>View Diagnostics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Module 4: 2025 Predicted Papers */}
          <div
            onClick={() => onNavigateTab('predicted')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 mb-4 group-hover:scale-105 transition">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                Cycle Intelligence
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-purple-300 transition">
                2025 Predicted Papers
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Exam predictions based on Cambridge rotation cycles and historical question appearances for May/June and Oct/Nov.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
              <span>View Predictions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Cambridge Specialized Master Suites */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-400" />
              Cambridge Master Suites & High-Yield Strategy
            </h2>
            <p className="text-xs text-slate-400">
              Interactive practical drills, countdown roadmaps, examiner command traps, and collaborative duels
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Cambridge Exclusive
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Science Paper 6 ATP Master */}
          <div
            onClick={() => onNavigateTab('atp')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-4 group-hover:scale-105 transition">
                <FlaskConical className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                Paper 6 Alternative to Practical
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                Science ATP Master
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Chemical cation/anion tests, interactive burette meniscus simulator, and 6-mark plan blueprint.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Open ATP Suite</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 2: AI Exam Countdown & Daily Study Roadmap */}
          <div
            onClick={() => onNavigateTab('roadmap')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 mb-4 group-hover:scale-105 transition">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                Personalized Countdown
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition">
                Daily Study Roadmap
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Live days remaining until official exam with adaptive day-by-day past paper task checklists.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
              <span>View Roadmap</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 3: Cambridge Command Words Trap Detector */}
          <div
            onClick={() => onNavigateTab('traps')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-4 group-hover:scale-105 transition">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                Examiner Secrets
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition">
                Command Words Traps
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Spot why students lose marks on Describe vs Explain and take the Cambridge mark scheme quiz.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
              <span>Check Traps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 4: 1-Click Parent Progress Report */}
          <div
            onClick={() => onOpenParentReport?.()}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 mb-4 group-hover:scale-105 transition">
                <Award className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                Print / Export PDF
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition">
                Parent Report Card
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generate an executive Cambridge performance letter with mock averages, streak, and WhatsApp share.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Generate Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 5: Collaborative Study Duel */}
          <div
            onClick={() => onOpenStudyDuel?.()}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 mb-4 group-hover:scale-105 transition">
                <Swords className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                Multiplayer Challenge
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-purple-300 transition">
                Past Paper Duels
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                6-digit room code with synchronized timer and side-by-side Cambridge mark scheme comparison.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
              <span>Enter Arena</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 6: Examiner Pitfalls Heatmap */}
          <div
            onClick={() => onNavigateTab('pitfalls')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-4 group-hover:scale-105 transition">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                Official ER Synthesis
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition">
                Examiner Pitfalls Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                "Why candidates lost marks" parsed from thousands of Cambridge Examiner Reports.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
              <span>Explore Pitfalls</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 7: Snap Handwritten Working */}
          <div
            onClick={() => onOpenHandwritingScanner?.()}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-sky-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 mb-4 group-hover:scale-105 transition">
                <Scan className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300 font-mono">
                Camera OCR AI
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-sky-300 transition">
                Snap Handwritten Paper
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Take a photo of your pen-and-paper working for instant line-by-line Cambridge marking.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
              <span>Scan Working</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 8: 60s Unit Conversion Blitz */}
          <div
            onClick={() => onNavigateTab('blitz')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-4 group-hover:scale-105 transition">
                <Zap className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                Speed Drill
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                Unit Conversion Blitz
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                60-second rapid-fire metric conversions: cm³ to dm³, kJ to J, hours to seconds.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Start Blitz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
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
