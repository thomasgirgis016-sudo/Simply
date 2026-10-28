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
  CheckCircle2,
  Layers,
  Zap,
  Mic,
  Calculator,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  BookMarked,
  Clock,
  Crown,
  Check,
  Printer,
  Flame,
  FlaskConical,
  Calendar,
  ShieldAlert,
  TrendingDown,
  Scan,
  Info,
  Target,
  Columns,
  ListChecks,
  MessageSquare,
  Atom,
  Download,
  Smartphone
} from 'lucide-react';
import { Subject, UserProfile, BookmarkItem, UserAccount } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';
import { getDailyStreak, getDailyChallengeQuestion, completeDailyChallenge, DailyStreakState } from '../services/dailyStreak';
import { getMistakeNotebook } from '../services/mistakeNotebook';
import { MathRenderer } from './MathRenderer';
import { AboutSimplyModal } from './AboutSimplyModal';
import { ExamCountdownWidget } from './ExamCountdownWidget';

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
  onOpenExamHud?: () => void;
  onOpenRevisionKit?: () => void;
  onOpenPwaModal?: () => void;
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
  onOpenExamHud,
  onOpenRevisionKit,
  onOpenPwaModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeHub, setActiveHub] = useState<CategoryHub>('featured');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Daily Cambridge Challenge & Study Streak State
  const [streakState, setStreakState] = useState<DailyStreakState>(() => getDailyStreak());
  const [dailyQuestion, setDailyQuestion] = useState(() => getDailyChallengeQuestion(activeSubject));
  const [dailyAnswerInput, setDailyAnswerInput] = useState('');
  const [dailyResult, setDailyResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Mistakes Count
  const mistakesCount = useMemo(() => {
    try {
      const list = getMistakeNotebook();
      return list.filter((m) => !m.isMastered).length;
    } catch {
      return 0;
    }
  }, []);

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

  // Filter subjects by board
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesBoard = boardFilter === 'All' || s.board === boardFilter || s.board === 'Both';
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      return matchesBoard && matchesCategory;
    });
  }, [subjects, boardFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [subjects]);

  // Real-time live search across subjects, past papers, notes, formulas
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.topics.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedPapers = PAST_PAPERS_DATABASE.filter(
      (p) =>
        p.topic.toLowerCase().includes(q) ||
        p.paperCode.toLowerCase().includes(q) ||
        p.questionPrompt.toLowerCase().includes(q) ||
        p.session.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedNotes = INITIAL_REVISION_NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.chapter.toLowerCase().includes(q) ||
        n.keyConcepts.some((c) => c.heading.toLowerCase().includes(q))
    ).slice(0, 3);

    const matchedFormulas = INITIAL_FORMULAS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      subjects: matchedSubjects,
      papers: matchedPapers,
      notes: matchedNotes,
      formulas: matchedFormulas,
    };
  }, [searchQuery, subjects]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto w-full">
      {/* 1. Academic Header & Greeting Card */}
      <section className="rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/30 p-4 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                Cambridge & Edexcel OS
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                Target: {profile.targetGrade}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {currentUser ? `Welcome back, ${currentUser.name}` : `Welcome to Simply IGCSE`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official past paper vault, line-by-line AI examiner grading, and personal mistake tracking engineered for Grade 9 candidates.
            </p>
          </div>

          {/* Quick Enrolled Subject Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full self-start md:self-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Syllabus:
            </span>
            {subjects.map((sub) => {
              const isActive = sub.id === activeSubject.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubject(sub)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400'
                      : 'border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={`${sub.code} - ${sub.name}`}
                >
                  {sub.code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Omnisearch Bar */}
        <div className="relative mt-4 sm:mt-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSubject.code} past papers, topics, formulas...`}
              className="w-full rounded-xl sm:rounded-2xl border border-slate-700/80 bg-slate-950/90 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-14 text-base sm:text-sm text-white placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Live Search Results Popover */}
          {searchResults && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
              {searchResults.subjects.length === 0 &&
              searchResults.papers.length === 0 &&
              searchResults.notes.length === 0 &&
              searchResults.formulas.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No results found for "{searchQuery}". Try a code like "{activeSubject.code}" or topic like "Algebra".
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.papers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-1">
                        Past Papers ({searchResults.papers.length})
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
                            <span className="shrink-0 text-[10px] font-bold text-amber-400 ml-2 font-mono">
                              {paper.marks}M
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                              onNavigateTab('revision');
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-slate-200">{note.title}</span>
                            <span className="text-[10px] text-slate-400">{note.chapter}</span>
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

        {/* Quick Launch Action Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60">
          {onOpenExamHud && (
            <button
              onClick={onOpenExamHud}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              title="Open Periodic Table & Cambridge Formula Reference HUD"
            >
              <Atom className="h-3.5 w-3.5 text-indigo-400" />
              <span>Reference HUD & Periodic Table</span>
            </button>
          )}

          {onOpenRevisionKit && (
            <button
              onClick={onOpenRevisionKit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              title="Generate 1-Click Cambridge Revision Survival Kit PDF"
            >
              <Download className="h-3.5 w-3.5 text-rose-400" />
              <span>1-Click Survival Kit (PDF)</span>
            </button>
          )}

          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              title="Install Simply IGCSE to your home screen"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </section>

      {/* Official Exam Countdown & Daily Revision Quota */}
      <ExamCountdownWidget
        activeSubject={activeSubject}
        onNavigateTab={onNavigateTab}
      />

      {/* 2. Four Core Workspaces (The Big Pillars) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5 uppercase tracking-wider">
            <Compass className="h-4 w-4 text-indigo-400" />
            Core Academic Workspaces
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Tailored to {activeSubject.code}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. Past Paper Vault */}
          <div
            onClick={() => onNavigateTab('finder')}
            className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900/90 transition active:scale-95 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 group-hover:scale-105 transition">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 font-mono">
                  9,280+
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                Past Papers
              </h3>
              <p className="hidden sm:block text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Official CAIE & Edexcel papers, QP & MS synchronized with topic filters.
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Open</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>

          {/* 2. AI Solver & Vision OCR */}
          <div
            onClick={() => onNavigateTab('solver')}
            className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-5 shadow-lg hover:border-pink-500/50 hover:bg-slate-900/90 transition active:scale-95 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 group-hover:scale-105 transition">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="rounded bg-pink-500/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-pink-300 font-mono">
                  Vision OCR
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-pink-300 transition line-clamp-1">
                AI Solver
              </h3>
              <p className="hidden sm:block text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Snap handwriting for line-by-line mark scheme checks ([M1], [A1], [B1]).
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-pink-400 group-hover:translate-x-1 transition">
              <span>Grade</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>

          {/* 3. The Mistake Black Book */}
          <div
            onClick={() => onNavigateTab('mistakes')}
            className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900/90 transition active:scale-95 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 group-hover:scale-105 transition">
                  <BookMarked className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-rose-300 font-mono">
                  {mistakesCount} Unmastered
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-rose-300 transition line-clamp-1">
                Black Book
              </h3>
              <p className="hidden sm:block text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Personal error notebook with reason tags & active Rematch Quiz Engine.
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
              <span>Rematch</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>

          {/* 4. Night Before Cheat Sheets */}
          <div
            onClick={() => onNavigateTab('cheatsheets')}
            className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3 sm:p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900/90 transition active:scale-95 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 group-hover:scale-105 transition">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-indigo-300 font-mono">
                  1-Page PDF
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                Cheat Sheets
              </h3>
              <p className="hidden sm:block text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Emergency 1-page high-yield formula & trap summaries with 1-click A4 PDF export.
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
              <span>Sheets</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Cambridge Challenge & Streak */}
      <section className="rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-950 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="h-4 w-4 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Daily Cambridge Challenge • {activeSubject.code}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {dailyQuestion.paperCode} • {dailyQuestion.questionNumber} ({dailyQuestion.topic})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="rounded-md bg-slate-950 px-2.5 py-1 text-xs font-mono font-bold text-amber-300 border border-slate-800">
              🔥 {streakState.currentStreak} Day Streak ({streakState.xpPoints} XP)
            </span>
          </div>
        </div>

        <div className="pt-3 space-y-3">
          <div className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
            <MathRenderer content={dailyQuestion.questionPrompt} />
          </div>

          <form onSubmit={handleCheckDailyAnswer} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={dailyAnswerInput}
              onChange={(e) => setDailyAnswerInput(e.target.value)}
              placeholder="Final answer (e.g. 14.5 or x = 3)..."
              className="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base sm:text-sm font-mono text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 sm:px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 shrink-0 transition cursor-pointer"
            >
              Check
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

      {/* 4. Categorized Study Tools (Clean Hub with Filter Pills) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase tracking-wider">
              Specialized Examination Tools
            </h2>
            <p className="text-xs text-slate-400">
              Select a category to filter the full academic suite
            </p>
          </div>

          {/* Hub Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'featured', label: '🌟 Top 6' },
              { id: 'papers', label: '📝 Papers & Mocks' },
              { id: 'ai', label: '🤖 AI & Grading' },
              { id: 'mastery', label: '🎯 Cambridge Mastery' },
              { id: 'drills', label: '⚡ Drills & Notes' },
              { id: 'all', label: '📚 All 20+' }
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

        {/* Dynamic Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Science Paper 6 ATP */}
          {(activeHub === 'featured' || activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('atp')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <FlaskConical className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                    Paper 6
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                  Science ATP Lab Master
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interactive meniscus reader, flame tests, ion analysis, and 6-mark plan template.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Launch Lab</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Examiner Pitfalls Heatmap */}
          {(activeHub === 'featured' || activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('pitfalls')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                    <TrendingDown className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                    Reports
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-300 transition">
                  Examiner Pitfall Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Synthesizes official CAIE reports detailing exact misconceptions costing candidates an A*.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
                <span>View Pitfalls</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Timed Mock Simulator */}
          {(activeHub === 'featured' || activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('mock')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                    Timed
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition">
                  Timed Mock Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sit full-length timed Cambridge past papers with live countdowns and Grade 9 boundaries.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
                <span>Start Mock</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Split-Screen Papers */}
          {(activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('split')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-sky-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                    <Columns className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-300 font-mono">
                    Dual Pane
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition">
                  Split-Screen QP/MS Viewer
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  View Question Papers alongside mark schemes synchronously without printing.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
                <span>Open Split Screen</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* 2025 Predicted Papers */}
          {(activeHub === 'papers' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('predicted')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                    Predictions
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition">
                  2025 Predicted Papers
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Exam predictions calculated from Cambridge topic recurrence cycles for upcoming series.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                <span>View Predictions</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* 60s Unit Conversion Blitz */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('blitz')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                    Speed Drill
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                  Unit Conversion Blitz
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Rapid-fire conversions (cm³ ↔ dm³, kJ ↔ J, kPa ↔ Pa) to eliminate careless errors.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Start Blitz</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Flashcards SM-2 */}
          {(activeHub === 'drills' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('flashcards')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-indigo-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                    SM-2
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition">
                  Spaced Repetition Flashcards
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Scientifically scheduled recall cards for formulas, definitions, and chemical tests.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition">
                <span>Practice Cards</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* AI Examiner Chat */}
          {(activeHub === 'ai' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('chat')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-purple-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 font-mono">
                    Tutor
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition">
                  AI Examiner Tutor Chat
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ask any syllabus question and receive strict mark-scheme breakdown instructions.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                <span>Start Chat</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Command Words Traps */}
          {(activeHub === 'mastery' || activeHub === 'all') && (
            <div
              onClick={() => onNavigateTab('traps')}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 sm:p-5 shadow-lg hover:border-rose-500/50 hover:bg-slate-900/90 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                  <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                    Traps
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-300 transition">
                  Command Words Traps
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Master "State" vs "Describe" vs "Explain" to stop losing easy method marks.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition">
                <span>View Traps</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Curriculum & Subject Directory (Clean Grid) */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase tracking-wider">
              Curriculum & Subject Directory
            </h2>
            <p className="text-xs text-slate-400">
              Select a subject to instantly access its past papers, notes, or AI solver
            </p>
          </div>

          {/* Board Selector Tabs: All vs Cambridge vs Edexcel */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 self-start sm:self-auto">
            {(['All', 'CIE', 'Edexcel'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBoardFilter(b)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
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

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredSubjects.map((sub) => {
            const isCurrentlyActive = sub.id === activeSubject.id;
            const isCambridge = sub.board === 'CIE';

            return (
              <div
                key={sub.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition shadow-md ${
                  isCurrentlyActive
                    ? 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/20 to-slate-900/80 ring-1 ring-indigo-500/30'
                    : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-xs font-black font-mono border ${
                        isCambridge
                          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {sub.code}
                    </span>

                    <span className="text-[10px] font-bold text-slate-400">
                      {isCambridge ? 'Cambridge IGCSE' : 'Pearson Edexcel'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mt-1">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {sub.topics.slice(0, 3).join(' • ')}...
                  </p>
                </div>

                {/* Resource Direct Links */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <button
                      onClick={() => { onSelectSubject(sub); onNavigateTab('finder'); }}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1 px-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      Papers
                    </button>
                    <button
                      onClick={() => { onSelectSubject(sub); onNavigateTab('revision'); }}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1 px-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => { onSelectSubject(sub); onNavigateTab('quiz'); }}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1 px-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      Quizzes
                    </button>
                    <button
                      onClick={() => { onSelectSubject(sub); onNavigateTab('solver'); }}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1 px-1 text-[11px] font-semibold text-pink-300 hover:bg-pink-500/20 transition cursor-pointer"
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

      {/* 6. Executive Platform Briefing Footer Banner */}
      <section className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              What is Simply IGCSE?
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Read our mission, platform architecture, and Cambridge mark scheme fidelity philosophy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAboutModalOpen(true)}
          className="shrink-0 rounded-xl border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 px-3.5 py-1.5 text-xs font-bold text-indigo-200 transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Read Platform Brief</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
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
