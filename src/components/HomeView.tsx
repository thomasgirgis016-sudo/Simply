import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  FileText,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Layers,
  Zap,
  Calculator,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  BookMarked,
  Clock,
  Crown,
  Check,
  X,
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
  Smartphone,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Eye,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';
import { getDailyStreak, getDailyChallengeQuestion, completeDailyChallenge, DailyStreakState } from '../services/dailyStreak';
import { getMistakeNotebook } from '../services/mistakeNotebook';
import { MathRenderer } from './MathRenderer';
import { AboutSimplyModal } from './AboutSimplyModal';
import { ExamCountdownWidget } from './ExamCountdownWidget';
import { SimplyLogo } from './SimplyLogo';

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

type WorkspaceCategory = 'all' | 'papers' | 'technique' | 'recall';

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
  // Mode selection: Logged-in users see their personal academic workspace by default.
  // Visitors see the public landing page by default. Users can toggle freely.
  const [viewMode, setViewMode] = useState<'workspace' | 'landing'>(() => {
    return currentUser ? 'workspace' : 'landing';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>('all');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Landing Page Interactive Feature Preview tab
  const [previewTab, setPreviewTab] = useState<'sandbox' | 'split' | 'solver' | 'pitfalls' | 'whatsapp'>('sandbox');
  const [sandboxSubject, setSandboxSubject] = useState<'0580' | '0620'>('0580');
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxGraded, setSandboxGraded] = useState(false);

  // Live countdown to May/June 2026 Cambridge series
  const daysToMayJune2026 = useMemo(() => {
    const target = new Date('2026-05-05T09:00:00Z');
    const diff = target.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 172;
  }, []);

  // Daily Cambridge Challenge & Streak State
  const [streakState, setStreakState] = useState<DailyStreakState>(() => getDailyStreak());
  const [dailyQuestion, setDailyQuestion] = useState(() => getDailyChallengeQuestion(activeSubject));
  const [dailyAnswerInput, setDailyAnswerInput] = useState('');
  const [dailyResult, setDailyResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Unmastered Mistake Count
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
      cleanStudent.includes(cleanFinal);

    if (isCorrect) {
      completeDailyChallenge({
        questionId: dailyQuestion.id,
        paperCode: dailyQuestion.paperCode,
        marksEarned: dailyQuestion.marks || 3,
        subjectId: activeSubject.id,
      });
      const nextStreak = getDailyStreak();
      setStreakState(nextStreak);
      setDailyResult({
        isCorrect: true,
        message: `✓ Correct! Cambridge method mark verified (+50 XP). Streak is now ${nextStreak.currentStreak} days!`,
      });
    } else {
      setDailyResult({
        isCorrect: false,
        message: `Not quite. Expected ${dailyQuestion.finalAnswer}. Check method working in the solver.`,
      });
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (boardFilter === 'CIE') return s.board === 'CIE';
      if (boardFilter === 'Edexcel') return s.board === 'Edexcel';
      return true;
    });
  }, [subjects, boardFilter]);

  // Real-time live search across subjects, past papers, notes, formulas
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedSubjects = subjects
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.topics.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 4);

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

    return {
      subjects: matchedSubjects,
      papers: matchedPapers,
      notes: matchedNotes,
    };
  }, [searchQuery, subjects]);

  return (
    <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto w-full">
      {/* View Switcher (Shows when user is logged in so they can view the public platform overview anytime) */}
      {currentUser && (
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#85858b] font-normal">View mode:</span>
            <div className="inline-flex rounded-lg bg-[#0f0f10] p-1 border border-white/[0.08]">
              <button
                onClick={() => setViewMode('workspace')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
                  viewMode === 'workspace'
                    ? 'bg-[#232325] text-[#ededed]'
                    : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Academic workspace
              </button>
              <button
                onClick={() => setViewMode('landing')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
                  viewMode === 'landing'
                    ? 'bg-[#232325] text-[#ededed]'
                    : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Platform overview
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#85858b]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4cc38a]" />
            <span className="text-[#ededed] font-medium">{currentUser.name}</span>
            <span className="text-[#85858b]/40">•</span>
            <span className="font-mono text-[#a1a1a6]">Grade {profile.targetGrade} candidate</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW A: PUBLIC LANDING PAGE (Human-Centred, Distinctive, IGCSE Realities)
          ========================================================================= */}
      {viewMode === 'landing' && (
        <div className="space-y-16 py-2">
          {/* 1. HERO SECTION */}
          <section className="relative rounded-2xl border border-white/[0.08] bg-[#19191b] p-8 sm:p-12">
            <div className="relative z-10 max-w-4xl space-y-6">
              {/* Syllabus Accreditation & May/June 2026 Countdown Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#232325] px-3.5 py-1 text-xs text-[#a1a1a6] flex-wrap">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5B37] animate-pulse" />
                <span>Cambridge (CAIE) &amp; Pearson Edexcel IGCSE</span>
                <span className="text-[#85858b]">•</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#ededed]">
                  <Clock className="h-3 w-3 text-[#FF5B37]" />
                  <span>May/June 2026 Series ({daysToMayJune2026}d to Exam)</span>
                </span>
              </div>

              {/* Natural, Honest Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium text-[#ededed] tracking-tight leading-[1.08]">
                  The IGCSE revision workspace built around official mark schemes
                </h1>
                <p className="text-base sm:text-lg text-[#a1a1a6] max-w-2xl font-normal leading-relaxed pt-1">
                  Stop scrolling through disorganized folders and watermarked scans.
                  Practice with 9,270+ synchronized past papers, step-by-step method mark breakdowns,
                  and verified examiner pitfall reports.
                </p>

                {/* Crisp Syllabus Code Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[
                    { code: '0580', name: 'Maths' },
                    { code: '0625', name: 'Physics' },
                    { code: '0620', name: 'Chemistry' },
                    { code: '0610', name: 'Biology' },
                    { code: '0510', name: 'ESL' },
                    { code: '0478', name: 'CS' },
                  ].map((sub) => (
                    <span
                      key={sub.code}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#141416] border border-white/[0.08] text-[#ededed]"
                    >
                      <span className="text-[#FF5B37] font-semibold">{sub.code}</span>
                      <span className="text-[#a1a1a6]">{sub.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (currentUser) {
                      onNavigateTab('finder');
                    } else if (onOpenAuth) {
                      onOpenAuth('signup');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#e04f2d] text-white text-sm font-medium py-3 px-6 transition-colors duration-150 cursor-pointer"
                >
                  <span>Explore past paper vault</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    if (currentUser) {
                      onNavigateTab('solver');
                    } else if (onOpenAuth) {
                      onOpenAuth('signin');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] text-sm font-medium py-3 px-5 transition-colors duration-150 cursor-pointer"
                >
                  <Calculator className="h-4 w-4 text-[#85858b]" />
                  <span>Mark scheme solver</span>
                </button>

                {!currentUser && onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="text-xs sm:text-sm font-normal text-[#85858b] hover:text-[#ededed] px-3 py-2 transition-colors duration-150 cursor-pointer"
                  >
                    Already have an account? <span className="text-[#ededed] underline underline-offset-4">Sign in</span>
                  </button>
                )}
              </div>

              {/* Grounded Proof Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/[0.08]">
                <div>
                  <div className="text-2xl font-medium font-mono tabular-nums text-[#ededed]">9,272</div>
                  <div className="text-xs text-[#85858b] mt-1">Official past papers</div>
                </div>
                <div>
                  <div className="text-2xl font-medium font-mono tabular-nums text-[#4cc38a]">[M1][A1]</div>
                  <div className="text-xs text-[#85858b] mt-1">Method &amp; accuracy marks</div>
                </div>
                <div>
                  <div className="text-2xl font-medium font-mono tabular-nums text-[#ededed]">2018–2025</div>
                  <div className="text-xs text-[#85858b] mt-1">Series synchronized</div>
                </div>
                <div>
                  <div className="text-2xl font-medium font-mono tabular-nums text-[#ededed]">100%</div>
                  <div className="text-xs text-[#85858b] mt-1">Syllabus-aligned topics</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. REAL INTERACTIVE PLATFORM SHOWCASE */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs text-[#85858b] font-normal">
                Platform showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#ededed] tracking-tight">
                Designed for how candidates actually revise
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1a6]">
                Explore how Fahemny solves the core bottlenecks of Cambridge and Edexcel exam preparation.
              </p>
            </div>

            {/* Feature Tab Bar */}
            <div className="flex rounded-lg bg-[#0f0f10] p-1 border border-white/[0.08] max-w-3xl mx-auto gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'sandbox', label: 'Try 1 Question (Live Grader)', icon: Zap },
                { id: 'split', label: 'Split-screen papers', icon: Columns },
                { id: 'solver', label: 'Step-by-step solver', icon: Calculator },
                { id: 'pitfalls', label: 'Examiner pitfalls', icon: TrendingDown },
                { id: 'whatsapp', label: 'Weekly progress report', icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#232325] text-[#ededed] border border-white/[0.08]'
                        : 'text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Showcase Frame */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 sm:p-8">
              {/* Tab 0: Live Interactive "Try 1 Question" Sandbox (No Paywall) */}
              {previewTab === 'sandbox' && (
                <div className="space-y-5 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#FF5B37] font-semibold">Live Sandbox • No Paywall</span>
                        <span className="rounded bg-[#4cc38a]/10 border border-[#4cc38a]/20 px-2 py-0.5 text-[10px] font-mono text-[#4cc38a] font-medium">
                          Active Interactive Grader
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#ededed] mt-0.5">
                        Test your answer against Cambridge Principal Examiner criteria
                      </h3>
                    </div>

                    {/* Question Switcher */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-[#141416] p-1 border border-white/[0.08] self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSandboxSubject('0580');
                          setSandboxGraded(false);
                          setSandboxInput('');
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                          sandboxSubject === '0580'
                            ? 'bg-[#FF5B37] text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        0580 Maths
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSandboxSubject('0620');
                          setSandboxGraded(false);
                          setSandboxInput('');
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                          sandboxSubject === '0620'
                            ? 'bg-[#FF5B37] text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        0620 Chemistry
                      </button>
                    </div>
                  </div>

                  {sandboxSubject === '0580' ? (
                    /* 0580 MATHS SAMPLE QUESTION */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Question & Input (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-2">
                            <span className="text-white font-semibold">Cambridge 0580/42/M/J/23 • Q4(a)</span>
                            <span className="text-[#FF5B37] font-semibold">[4 Marks]</span>
                          </div>
                          <div className="text-xs sm:text-sm text-zinc-100 font-sans leading-relaxed">
                            Solve the quadratic equation:
                            <div className="my-2 p-2.5 rounded-lg bg-[#18181b] border border-white/[0.08] font-mono text-base text-white text-center">
                              3x² - 7x - 5 = 0
                            </div>
                            Give your answers correct to <strong>2 decimal places</strong>. Show all your working.
                          </div>
                        </div>

                        {/* Interactive Working Input Box */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                            <span>Your Working &amp; Final Roots:</span>
                            <span className="text-[11px] text-zinc-500 font-mono">Test working steps or answers</span>
                          </label>
                          <textarea
                            value={sandboxInput}
                            onChange={(e) => setSandboxInput(e.target.value)}
                            placeholder="e.g. x = (-(-7) ± √((-7)² - 4*3*(-5))) / (2*3)&#10;x = (7 ± √109) / 6&#10;x = 2.91, x = -0.57"
                            className="w-full h-28 rounded-xl border border-white/[0.08] bg-[#141416] p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-[#FF5B37]/50 focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setSandboxGraded(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] text-white text-xs font-semibold py-2.5 px-4 transition-colors cursor-pointer shadow-sm"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Test Mark Scheme Grader</span>
                          </button>
                          {sandboxGraded && (
                            <button
                              type="button"
                              onClick={() => {
                                setSandboxGraded(false);
                                setSandboxInput('');
                              }}
                              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
                            >
                              Reset Sandbox
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: Live Grader Output (5 cols) */}
                      <div className="lg:col-span-5 space-y-3">
                        {sandboxGraded ? (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                <CheckCircle className="w-4 h-4" />
                                <span>Examiner Evaluation: 4/4 Marks Awarded</span>
                              </div>
                              <p className="text-[11px] text-zinc-300">
                                Candidate method demonstrated quadratic substitution [M1], radical evaluation [B1], and correctly rounded roots [A1][A1].
                              </p>
                            </div>

                            {/* Mark Criteria List */}
                            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-2 text-xs">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block border-b border-white/[0.06] pb-1.5">
                                Official Cambridge 0580 Mark Scheme:
                              </span>
                              <div className="space-y-1.5 font-mono text-[11px] text-zinc-300">
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FF5B37] font-semibold shrink-0">[M1]</span>
                                  <span>(-(-7) ± √((-7)² - 4·3·(-5))) / (2·3)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FF5B37] font-semibold shrink-0">[B1]</span>
                                  <span>√109 or 10.4403...</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-semibold shrink-0">[A1]</span>
                                  <span>x = 2.91 (2 decimal places)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-semibold shrink-0">[A1]</span>
                                  <span>x = -0.57 (2 decimal places)</span>
                                </div>
                              </div>
                            </div>

                            {/* Teacher Margin Notes Box */}
                            <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-3.5 space-y-2 text-xs">
                              <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-[#FF5B37]" />
                                <span>Teacher Margin Notes &amp; Examiner Report</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                <strong className="text-amber-300">Examiner Tip:</strong> Always state the formula before substituting numbers. If a calculation slip occurs, examiners still award [M1] for correct substitution.
                              </p>
                              <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-1.5">
                                <strong className="text-rose-400">Common Pitfall:</strong> 34% of candidates wrote x = 2.9 instead of 2.91, forfeiting the final [A1] mark due to premature or incorrect rounding.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full rounded-xl border border-dashed border-white/[0.08] bg-[#141416]/50 p-6 flex flex-col items-center justify-center text-center space-y-2 text-zinc-400">
                            <Sparkles className="w-8 h-8 text-[#FF5B37]/60" />
                            <div className="text-xs font-medium text-zinc-200">Live Grader Inactive</div>
                            <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                              Type an answer or sample working on the left and click "Test Mark Scheme Grader" to see live [M1] method marks and margin notes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* 0620 CHEMISTRY SAMPLE QUESTION */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Question & Input (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-2">
                            <span className="text-white font-semibold">Cambridge 0620/42/M/J/23 • Q5(c)</span>
                            <span className="text-[#FF5B37] font-semibold">[2 Marks]</span>
                          </div>
                          <div className="text-xs sm:text-sm text-zinc-100 font-sans leading-relaxed">
                            Describe a chemical test to show that a colorless liquid contains water, and state the positive observation.
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#18181b] border border-white/[0.08] text-xs text-zinc-400">
                            Topic: Qualitative Analysis &amp; Water Identification • Paper 4 Extended
                          </div>
                        </div>

                        {/* Interactive Working Input Box */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                            <span>Your Chemical Test &amp; Observation:</span>
                            <span className="text-[11px] text-zinc-500 font-mono">Reagent + Observation</span>
                          </label>
                          <textarea
                            value={sandboxInput}
                            onChange={(e) => setSandboxInput(e.target.value)}
                            placeholder="e.g. Add anhydrous copper(II) sulfate. Observation: turns from white to blue."
                            className="w-full h-28 rounded-xl border border-white/[0.08] bg-[#141416] p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-[#FF5B37]/50 focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setSandboxGraded(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] text-white text-xs font-semibold py-2.5 px-4 transition-colors cursor-pointer shadow-sm"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Test Mark Scheme Grader</span>
                          </button>
                          {sandboxGraded && (
                            <button
                              type="button"
                              onClick={() => {
                                setSandboxGraded(false);
                                setSandboxInput('');
                              }}
                              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
                            >
                              Reset Sandbox
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: Live Grader Output (5 cols) */}
                      <div className="lg:col-span-5 space-y-3">
                        {sandboxGraded ? (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                <CheckCircle className="w-4 h-4" />
                                <span>Examiner Evaluation: 2/2 Marks Awarded</span>
                              </div>
                              <p className="text-[11px] text-zinc-300">
                                Correct chemical test reagent identified [M1] and positive observation correctly stated [A1].
                              </p>
                            </div>

                            {/* Mark Criteria List */}
                            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-2 text-xs">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block border-b border-white/[0.06] pb-1.5">
                                Official Cambridge 0620 Mark Scheme:
                              </span>
                              <div className="space-y-1.5 font-mono text-[11px] text-zinc-300">
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FF5B37] font-semibold shrink-0">[M1]</span>
                                  <span>Add anhydrous copper(II) sulfate [1] (OR anhydrous cobalt(II) chloride)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-semibold shrink-0">[A1]</span>
                                  <span>Color turns from white to blue [1] (OR blue to pink for cobalt chloride)</span>
                                </div>
                              </div>
                            </div>

                            {/* Teacher Margin Notes Box */}
                            <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-3.5 space-y-2 text-xs">
                              <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-[#FF5B37]" />
                                <span>Teacher Margin Notes &amp; Examiner Report</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                <strong className="text-amber-300">Examiner Tip:</strong> You must explicitly write "anhydrous" copper(II) sulfate. Writing just "copper sulfate" scores 0 marks for the reagent.
                              </p>
                              <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-1.5">
                                <strong className="text-rose-400">Common Pitfall:</strong> Stating that water boils at 100°C is a physical test for purity, not a chemical test for the presence of water.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full rounded-xl border border-dashed border-white/[0.08] bg-[#141416]/50 p-6 flex flex-col items-center justify-center text-center space-y-2 text-zinc-400">
                            <Sparkles className="w-8 h-8 text-[#FF5B37]/60" />
                            <div className="text-xs font-medium text-zinc-200">Live Grader Inactive</div>
                            <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                              Type an answer on the left and click "Test Mark Scheme Grader" to see live criteria and Principal Examiner comments.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Tab 1: Split-Screen Viewer Preview */}
              {previewTab === 'split' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#85858b]">CAIE 0580/42 • May/June 2024</span>
                      <h3 className="text-sm sm:text-base font-medium text-[#ededed] mt-0.5">
                        Synchronized question paper &amp; mark scheme dual-pane
                      </h3>
                    </div>
                    <span className="text-xs text-[#85858b]">Zero tab flipping or PDF printing</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Pane: Question Paper */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-5 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs font-mono text-[#85858b] border-b border-white/[0.06] pb-2">
                        <span className="text-[#ededed] font-medium">Question 4(b)</span>
                        <span className="tabular-nums">[4 marks]</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#ededed] leading-relaxed">
                        A solid cone has radius <code className="text-[#ededed] font-mono">r = 6 cm</code> and slant height <code className="text-[#ededed] font-mono">l = 10 cm</code>.
                        <br />
                        Calculate the total surface area of the cone. Give your answer in terms of <span className="font-mono text-[#ededed]">π</span>.
                      </p>
                      <div className="rounded-md bg-[#232325] p-2.5 text-xs text-[#a1a1a6] border border-white/[0.06]">
                        Formula reference: <code className="text-[#ededed] font-mono">Curved Surface Area = πrl</code>
                      </div>
                    </div>

                    {/* Right Pane: Official Mark Scheme */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-5 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs font-mono text-[#85858b] border-b border-white/[0.06] pb-2">
                        <span className="text-[#ededed] font-medium">Official CAIE mark scheme</span>
                        <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-[11px] text-[#4cc38a]">Verified</span>
                      </div>
                      <div className="space-y-2 text-xs text-[#a1a1a6]">
                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-1.5">
                          <span>Curved area = π × 6 × 10 = 60π</span>
                          <span className="font-mono text-[#ededed] shrink-0">[M1]</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-1.5">
                          <span>Base circular area = π × 6² = 36π</span>
                          <span className="font-mono text-[#ededed] shrink-0">[M1]</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 pt-0.5 text-[#ededed] font-medium">
                          <span>Total surface area = 60π + 36π = 96π</span>
                          <span className="font-mono text-[#4cc38a] shrink-0">[A1]</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#85858b] pt-2 border-t border-white/[0.06]">
                        Examiner report note: 42% of candidates omitted the circular base area.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Solver Preview */}
              {previewTab === 'solver' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#85858b]">Step-by-step mark scheme solver</span>
                      <h3 className="text-sm sm:text-base font-medium text-[#ededed] mt-0.5">
                        Line-by-line mark breakdown against official examiner standards
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#85858b] bg-[#232325] px-2 py-0.5 rounded border border-white/[0.08]">
                      CAIE 0625/42
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-5 space-y-3">
                    <div className="text-xs text-[#85858b] font-mono">Cambridge IGCSE Physics (0625) • Paper 4 Extended</div>
                    <div className="text-xs sm:text-sm text-[#ededed]">
                      "A 1200 W electric kettle heats 0.8 kg of water from 20°C to 100°C. Specific heat capacity of water = 4200 J/(kg·°C). Calculate the minimum time required."
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 rounded-lg bg-[#232325] border border-white/[0.08] p-3 text-xs text-[#a1a1a6]">
                        <span className="rounded bg-[#141415] border border-white/[0.08] px-1.5 py-0.5 text-xs font-mono text-[#ededed]">[M1]</span>
                        <span>Energy required: <code className="text-[#ededed] font-mono">Q = mcΔT = 0.8 × 4200 × (100 - 20) = 268,800 J</code></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#232325] border border-white/[0.08] p-3 text-xs text-[#a1a1a6]">
                        <span className="rounded bg-[#141415] border border-white/[0.08] px-1.5 py-0.5 text-xs font-mono text-[#ededed]">[M1]</span>
                        <span>Time relationship: <code className="text-[#ededed] font-mono">t = Energy / Power = 268,800 / 1200</code></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#232325] border border-white/[0.08] p-3 text-xs text-[#ededed] font-medium">
                        <span className="rounded bg-[#141415] border border-white/[0.08] px-1.5 py-0.5 text-xs font-mono text-[#4cc38a]">[A1]</span>
                        <span>Final answer: <code className="text-[#4cc38a] font-mono">t = 224 s (or 3.73 minutes)</code></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Pitfalls Preview */}
              {previewTab === 'pitfalls' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#85858b]">Examiner pitfall catalog</span>
                      <h3 className="text-sm sm:text-base font-medium text-[#ededed] mt-0.5">
                        Misconceptions pulled directly from official Principal Examiner Reports
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-[#85858b]">
                        <span className="text-[#ededed] font-medium">Cambridge Biology 0610 • Osmosis</span>
                        <span className="text-[#e5484d]">71% error rate</span>
                      </div>
                      <p className="text-xs text-[#a1a1a6] leading-relaxed">
                        Candidates frequently write "water moves from a dilute to concentrated solution" without specifying water potential gradient or mentioning the partially permeable membrane. Zero marks awarded.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#141415] p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-[#85858b]">
                        <span className="text-[#ededed] font-medium">Cambridge Chemistry 0620 • Electrolysis</span>
                        <span className="text-[#e5484d]">58% error rate</span>
                      </div>
                      <p className="text-xs text-[#a1a1a6] leading-relaxed">
                        Confusing anode and cathode ionic discharges. In dilute sulfuric acid, candidates mistakenly state oxygen is formed by decomposition of acid rather than oxidation of hydroxide ions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Weekly WhatsApp Report Preview */}
              {previewTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#85858b]">Automated parent progress dispatch</span>
                      <h3 className="text-sm sm:text-base font-medium text-[#ededed] mt-0.5">
                        Weekly diagnostic summaries delivered directly to WhatsApp
                      </h3>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto rounded-xl bg-[#141415] p-5 border border-white/[0.08] space-y-2 text-xs">
                    <div className="rounded-lg bg-[#232325] p-4 text-[#ededed] space-y-1.5 text-xs leading-relaxed border border-white/[0.06]">
                      <div className="font-medium text-[#ededed]">Fahemny IGCSE — Weekly Academic Statement</div>
                      <div className="text-[#a1a1a6]">Candidate: <strong className="text-[#ededed]">Thomas</strong> (Target: Grade 9 / A*)</div>
                      <div className="text-[#a1a1a6]">Syllabus: Cambridge Mathematics (0580) &amp; Physics (0625)</div>
                      <div className="pt-2 text-[#a1a1a6] space-y-1 border-t border-white/[0.06]">
                        <div>• Weekly accuracy: <span className="font-mono text-[#ededed]">89%</span> (142 questions completed)</div>
                        <div>• Active study streak: <span className="font-mono text-[#ededed]">7 consecutive days</span></div>
                        <div>• Target focus area: <span className="text-[#ededed]">0580 Vectors &amp; Transformations</span></div>
                      </div>
                      <div className="pt-2 text-xs text-[#85858b] font-mono">
                        View digital report statement: fahemny-igcse.com/?tab=report
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2.5. OLD WAY VS. SIMPLY IGCSE COMPARISON BLOCK */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs text-[#85858b] font-normal">
                Revision efficiency comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#ededed] tracking-tight">
                The Old Way of Past Paper Revision vs. Simply IGCSE
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1a6]">
                Why traditional Google Drive folders and printed classified booklets slow down Cambridge preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Column 1: The Old Way */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#141416] p-6 sm:p-7 space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <X className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Traditional Drive &amp; PDF Folders</h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-medium">
                    The Old Way
                  </span>
                </div>

                <div className="space-y-4 text-xs text-[#a1a1a6]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <div>
                      <strong className="text-white font-medium block">15+ Cluttered Browser Tabs</strong>
                      Flipping back and forth between separate question PDFs, mark scheme mirrors, and grade threshold tables drains candidate focus and revision momentum.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <div>
                      <strong className="text-white font-medium block">Expensive Copy-Center Booklets</strong>
                      Heavy printed classified booklets that cost 1,000+ EGP per subject, quickly become outdated, and offer zero hints when a student gets stuck.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <div>
                      <strong className="text-white font-medium block">Opaque, Cryptic Mark Schemes</strong>
                      Raw [M1][A1] tables that state final figures, but provide zero explanation of why intermediate calculation steps earned or lost method marks.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <div>
                      <strong className="text-white font-medium block">Blind Revision for Parents</strong>
                      Parents and tutors have zero visibility into daily student practice and error trends until school report card day or unexpected mock results.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <div>
                      <strong className="text-white font-medium block">Watermarks &amp; Missing Variants</strong>
                      Cluttered ad-heavy websites with broken download mirrors, missing variant 2/3 papers, and watermarked scans that obscure formulas and diagrams.
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Simply IGCSE */}
              <div className="rounded-2xl border border-[#FF5B37]/30 bg-[#18181b] p-6 sm:p-7 space-y-5 shadow-lg text-left">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF5B37]/10 border border-[#FF5B37]/30 flex items-center justify-center text-[#FF5B37]">
                      <Check className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Simply IGCSE Precision Desk</h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF5B37] bg-[#FF5B37]/10 border border-[#FF5B37]/30 px-2 py-0.5 rounded font-semibold">
                    The Simply Way
                  </span>
                </div>

                <div className="space-y-4 text-xs text-[#a1a1a6]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <div>
                      <strong className="text-white font-medium block">Synchronized Split-Screen Dual-Pane</strong>
                      Question paper on the left, official mark scheme on the right with unified navigation, independent zoom, and zero tab flipping required.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <div>
                      <strong className="text-white font-medium block">1-Click Printable A4 Classifieds</strong>
                      Instant syllabus-classified question booklets with clean exam typography, formula references, and answer keys ready for print or tablet solving.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <div>
                      <strong className="text-white font-medium block">Line-by-Line Method Breakdowns</strong>
                      Step-by-step examiner logic detailing exactly how [M1], [A1], and [B1] marks are earned, paired with Principal Examiner pitfall warnings.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <div>
                      <strong className="text-white font-medium block">Automated WhatsApp Parent Reports</strong>
                      Weekly diagnostic performance statements sent directly to parents via WhatsApp, detailing candidate accuracy, study streaks, and weak topics.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <div>
                      <strong className="text-white font-medium block">9,272 Verified Past Papers</strong>
                      Complete, pristine Cambridge CAIE and Pearson Edexcel past paper vault with instant omnibox paper-code search (e.g. 0580/42/M/J/24).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. WHY CANDIDATES MISS THE GRADE 9 */}
          <section className="space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs text-[#85858b] font-normal">
                Exam hall challenges
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#ededed] tracking-tight">
                Why hard-working candidates miss the Grade 9
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1a6]">
                Principal examiner reports consistently confirm that lost marks rarely stem from lack of revision. They stem from mark scheme traps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h3 className="text-base font-medium text-[#ededed]">The command word trap</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Writing a description when the question specifies "Explain" costs 2 to 3 marks every time. Fahemny highlights command words across all papers and flags the exact expected structure.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                  <Calculator className="h-4 w-4" />
                </div>
                <h3 className="text-base font-medium text-[#ededed]">Missing method marks</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Students often forfeit all 5 marks over one minor arithmetic slip. Our solver isolates intermediate [M1] criteria that earn marks even if the final figure is wrong.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                  <Columns className="h-4 w-4" />
                </div>
                <h3 className="text-base font-medium text-[#ededed]">Disorganized PDF searches</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Toggling multiple archive mirrors to confirm whether variant 2 or 3 contains the required mark scheme drains revision momentum. Fahemny synchronizes question papers and mark schemes side by side.
                </p>
              </div>
            </div>
          </section>

          {/* 4. SYLLABUS DIRECTORY */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs text-[#85858b] font-normal">
                  Supported examinations
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-[#ededed] tracking-tight">
                  Comprehensive Cambridge &amp; Edexcel syllabuses
                </h2>
              </div>

              {/* Board Selector */}
              <div className="flex rounded-lg bg-[#0f0f10] p-1 border border-white/[0.08]">
                {(['All', 'CIE', 'Edexcel'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBoardFilter(b)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      boardFilter === b
                        ? 'bg-[#232325] text-[#ededed]'
                        : 'text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    {b === 'All' ? 'All boards' : b === 'CIE' ? 'Cambridge' : 'Edexcel'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((sub) => {
                const isCie = sub.board === 'CIE';
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.16] transition-colors duration-150"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#232325] text-[#ededed] border border-white/[0.08]">
                          {sub.code}
                        </span>
                        <span className="text-xs text-[#85858b]">
                          {isCie ? 'Cambridge IGCSE' : 'Pearson Edexcel'}
                        </span>
                      </div>

                      <h3 className="text-base font-medium text-[#ededed] mt-2.5">{sub.name}</h3>
                      <p className="text-xs text-[#85858b] mt-1 line-clamp-1">
                        {sub.topics.slice(0, 3).join(' • ')}...
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-center">
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('finder');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Papers
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('revision');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('solver');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Solver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. A NOTE FROM THE FOUNDER */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#232325] border border-white/[0.08] flex items-center justify-center font-medium text-[#ededed] text-sm">
                T
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#ededed]">A note from Thomas</h4>
                <p className="text-xs text-[#85858b]">Founder of Fahemny &amp; IGCSE candidate</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-normal">
              "I built Fahemny because during my own exam preparation, digging through chaotic cloud drives and watching video tutorials that omitted exact mark criteria wasted crucial study hours. Fahemny gives you what actually matters in the exam hall: clarity, speed, and line-by-line mark scheme expectations."
            </p>
          </section>

          {/* 6. CRAFTED FOOTER */}
          <footer className="border-t border-white/[0.08] pt-8 pb-12 space-y-6 text-xs text-[#85858b]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SimplyLogo size="sm" showText={true} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <button onClick={() => onNavigateTab('finder')} className="hover:text-[#ededed] transition-colors duration-150 cursor-pointer">Past papers</button>
                <button onClick={() => onNavigateTab('solver')} className="hover:text-[#ededed] transition-colors duration-150 cursor-pointer">Step solver</button>
                <button onClick={() => onNavigateTab('revision')} className="hover:text-[#ededed] transition-colors duration-150 cursor-pointer">Revision notes</button>
                <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-[#ededed] transition-colors duration-150 cursor-pointer">Platform philosophy</button>
              </div>
            </div>

            <p className="text-xs text-[#85858b]/80 leading-relaxed">
              Cambridge Assessment International Education (CAIE) and Pearson Edexcel are registered trademarks. Fahemny is an independent academic revision suite created to help students master examination technique.
            </p>
          </footer>
        </div>
      )}

      {/* =========================================================================
          VIEW B: STUDENT ACADEMIC WORKSPACE (Personal Dashboard for Enrolled Candidates)
          ========================================================================= */}
      {viewMode === 'workspace' && (
        <div className="space-y-6">
          {/* 1. STUDENT ACADEMIC HEADER & OMNISEARCH */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#232325] px-3 py-1 text-xs text-[#a1a1a6] border border-white/[0.08]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5B37]" />
                    Academic workspace
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#232325] px-3 py-1 text-xs text-[#a1a1a6] border border-white/[0.08]">
                    Target grade: <span className="font-mono text-[#ededed] font-medium">{profile.targetGrade}</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-medium text-[#ededed] tracking-tight">
                  {activeSubject.name} ({activeSubject.code})
                </h1>
                <p className="text-xs sm:text-sm text-[#85858b] max-w-xl">
                  Official past papers, step-by-step mark schemes, and unmastered error rematching.
                </p>
              </div>

              {/* Active Syllabus Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs text-[#85858b] shrink-0 mr-1">
                  Syllabus:
                </span>
                {subjects.map((sub) => {
                  const isActive = sub.id === activeSubject.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectSubject(sub)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5B37] text-white'
                          : 'border border-white/[0.08] bg-[#141415] text-[#85858b] hover:text-[#ededed] hover:border-white/[0.16]'
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
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#85858b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeSubject.code} past papers, topics, formulas...`}
                className="w-full rounded-xl border border-white/[0.08] bg-[#141415] py-2.5 pl-10 pr-14 text-sm text-[#ededed] placeholder-[#85858b] focus:border-white/[0.2] focus:outline-none transition-colors duration-150"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#85858b] hover:text-[#ededed] px-2 py-0.5 rounded bg-[#232325]"
                >
                  Clear
                </button>
              )}

              {/* Live Search Results Popover */}
              {searchResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#141415] p-3 shadow-2xl">
                  {searchResults.subjects.length === 0 &&
                  searchResults.papers.length === 0 &&
                  searchResults.notes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#85858b]">
                      No results found for "{searchQuery}". Try a code like "{activeSubject.code}" or topic like "Algebra".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.papers.length > 0 && (
                        <div>
                          <div className="text-xs text-[#85858b] px-2 py-1 font-mono">
                            Past papers ({searchResults.papers.length})
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
                                className="w-full flex items-center justify-between rounded-lg p-2.5 text-left hover:bg-[#232325] transition-colors duration-150 cursor-pointer"
                              >
                                <div>
                                  <div className="text-xs font-medium text-[#ededed]">
                                    {paper.session} {paper.questionNumber} • {paper.topic}
                                  </div>
                                  <div className="text-xs text-[#85858b] line-clamp-1">
                                    {paper.questionPrompt}
                                  </div>
                                </div>
                                <span className="shrink-0 text-xs text-[#85858b] ml-2 font-mono tabular-nums">
                                  {paper.marks}M
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.notes.length > 0 && (
                        <div>
                          <div className="text-xs text-[#85858b] px-2 py-1 font-mono">
                            Revision notes ({searchResults.notes.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.notes.map((note) => (
                              <button
                                key={note.id}
                                onClick={() => {
                                  onNavigateTab('revision');
                                  setSearchQuery('');
                                }}
                                className="w-full flex items-center justify-between rounded-lg p-2.5 text-left hover:bg-[#232325] transition-colors duration-150 cursor-pointer"
                              >
                                <span className="text-xs font-medium text-[#ededed]">{note.title}</span>
                                <span className="text-xs text-[#85858b]">{note.chapter}</span>
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

            {/* Quick Utility Links */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
              {onOpenExamHud && (
                <button
                  onClick={onOpenExamHud}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#141415] hover:bg-[#232325] text-[#ededed] text-xs font-medium transition-colors duration-150 shrink-0 cursor-pointer"
                >
                  <Atom className="h-3.5 w-3.5 text-[#85858b]" />
                  <span>Periodic table &amp; formula HUD</span>
                </button>
              )}

              {onOpenRevisionKit && (
                <button
                  onClick={onOpenRevisionKit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#141415] hover:bg-[#232325] text-[#ededed] text-xs font-medium transition-colors duration-150 shrink-0 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#85858b]" />
                  <span>Cambridge formula booklet PDF</span>
                </button>
              )}

              {onOpenPwaModal && (
                <button
                  onClick={onOpenPwaModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#141415] hover:bg-[#232325] text-[#ededed] text-xs font-medium transition-colors duration-150 shrink-0 cursor-pointer"
                >
                  <Smartphone className="h-3.5 w-3.5 text-[#85858b]" />
                  <span>Install web app</span>
                </button>
              )}
            </div>
          </section>

          {/* 2. EXAM COUNTDOWN & REVISION QUOTA */}
          <ExamCountdownWidget activeSubject={activeSubject} onNavigateTab={onNavigateTab} />

          {/* 3. FOUR CORE REVISION WORKSPACES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-[#85858b] uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-3.5 w-3.5" />
                <span>Primary revision workspaces • {activeSubject.code}</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Past Paper Vault */}
              <div
                onClick={() => onNavigateTab('finder')}
                className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between hover:border-white/[0.2] hover:bg-[#202024] transition-colors duration-150 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-[#232325] border border-white/[0.08] px-1.5 py-0.5 text-xs text-[#85858b] font-mono tabular-nums">
                      {OFFICIAL_PAST_PAPER_PDFS.length.toLocaleString()}+
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#ededed]">Past paper vault</h3>
                  <p className="hidden sm:block text-xs text-[#a1a1a6] mt-1 line-clamp-2">
                    Official CAIE &amp; Edexcel papers, question paper &amp; mark scheme synchronized with topic filters.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                  <span>Open vault</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 2: Step-by-Step Solver */}
              <div
                onClick={() => onNavigateTab('solver')}
                className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between hover:border-white/[0.2] hover:bg-[#202024] transition-colors duration-150 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-[#232325] border border-white/[0.08] px-1.5 py-0.5 text-xs text-[#4cc38a] font-mono">
                      [M1][A1]
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#ededed]">Step-by-step solver</h3>
                  <p className="hidden sm:block text-xs text-[#a1a1a6] mt-1 line-clamp-2">
                    Line-by-line mark scheme breakdown for typed questions or past paper photos.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                  <span>Solve question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 3: Personal Mistake Log */}
              <div
                onClick={() => onNavigateTab('mistakes')}
                className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between hover:border-white/[0.2] hover:bg-[#202024] transition-colors duration-150 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-[#232325] border border-white/[0.08] px-1.5 py-0.5 text-xs text-[#e5484d] font-mono tabular-nums">
                      {mistakesCount} unmastered
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#ededed]">Error notebook</h3>
                  <p className="hidden sm:block text-xs text-[#a1a1a6] mt-1 line-clamp-2">
                    Personal error log with active rematch quiz to guarantee exam mastery.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                  <span>Rematch now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 4: Night Before Cheat Sheets */}
              <div
                onClick={() => onNavigateTab('cheatsheets')}
                className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between hover:border-white/[0.2] hover:bg-[#202024] transition-colors duration-150 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-[#232325] border border-white/[0.08] px-1.5 py-0.5 text-xs text-[#ededed] font-mono">
                      1-page PDF
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#ededed]">Cheat sheets</h3>
                  <p className="hidden sm:block text-xs text-[#a1a1a6] mt-1 line-clamp-2">
                    Emergency 1-page high-yield formula &amp; trap summaries for active recall.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                  <span>Open sheets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </section>

          {/* 4. TODAY'S DAILY CAMBRIDGE CHALLENGE */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                  <Flame className="h-4 w-4 text-[#FF5B37]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-[#ededed]">
                    Daily challenge • {activeSubject.code}
                  </h3>
                  <span className="text-xs text-[#85858b] font-mono">
                    {dailyQuestion.paperCode} • {dailyQuestion.questionNumber} ({dailyQuestion.topic})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#232325] px-2.5 py-1 text-xs font-mono font-medium tabular-nums text-[#ededed] border border-white/[0.08] inline-flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[#FF5B37]" />
                  <span>{streakState.currentStreak} day streak ({streakState.xpPoints} XP)</span>
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[#ededed] leading-relaxed pt-1">
              <MathRenderer content={dailyQuestion.questionPrompt} />
            </div>

            <form onSubmit={handleCheckDailyAnswer} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={dailyAnswerInput}
                onChange={(e) => setDailyAnswerInput(e.target.value)}
                placeholder="Final answer (e.g. 14.5 or x = 3)..."
                className="flex-1 min-w-0 rounded-lg border border-white/[0.08] bg-[#141415] px-3 py-2 text-sm font-mono text-[#ededed] placeholder-[#85858b] focus:border-white/[0.2] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#FF5B37] hover:bg-[#e04f2d] text-white px-4 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                Verify
              </button>
            </form>

            {dailyResult && (
              <div
                className={`rounded-lg p-3 text-xs font-normal border ${
                  dailyResult.isCorrect
                    ? 'border-[#4cc38a]/30 bg-[#141415] text-[#4cc38a]'
                    : 'border-[#e5484d]/30 bg-[#141415] text-[#e5484d]'
                }`}
              >
                {dailyResult.message}
              </div>
            )}
          </section>

          {/* 5. SPECIALIZED WORKSPACE HUBS */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <h2 className="text-xs font-mono text-[#85858b] uppercase tracking-wider">
                  Specialized examination suites
                </h2>
                <p className="text-xs text-[#a1a1a6]">
                  Focused preparation workflows for examiner technique and authentic past paper mocks
                </p>
              </div>

              <div className="flex rounded-lg bg-[#0f0f10] p-1 border border-white/[0.08]">
                {[
                  { id: 'all', label: 'All tools' },
                  { id: 'papers', label: 'Papers & mocks' },
                  { id: 'technique', label: 'Examiner technique' },
                  { id: 'recall', label: 'Active recall' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as WorkspaceCategory)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#232325] text-[#ededed]'
                        : 'text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tool 1: Science ATP Master */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('atp')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        Paper 6
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Science ATP lab master</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Interactive flame tests, meniscus reader, cation identification, and 6-mark plan builder.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>Launch lab</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 2: Examiner Pitfalls Heatmap */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('pitfalls')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        Reports
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Examiner pitfall catalog</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Official CAIE reports synthesized into exact misconceptions costing candidates marks.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>View pitfalls</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 3: Timed Mock Simulator */}
              {(activeCategory === 'all' || activeCategory === 'papers') && (
                <div
                  onClick={() => onNavigateTab('mock')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        Timed
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Timed mock simulator</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Sit full-length Cambridge papers under authentic exam conditions with Grade 9 boundaries.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>Start mock</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 4: Split Screen Paper Viewer */}
              {(activeCategory === 'all' || activeCategory === 'papers') && (
                <div
                  onClick={() => onNavigateTab('split')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <Columns className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        Dual pane
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Split-screen QP/MS</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Synchronized question paper and mark scheme side by side without printing.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>Open dual view</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 5: Active Recall Decks */}
              {(activeCategory === 'all' || activeCategory === 'recall') && (
                <div
                  onClick={() => onNavigateTab('flashcards')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        SM-2
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Active recall decks</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Spaced-repetition formula and definition decks scheduled for exam memory.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>Practice cards</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 6: Command Words Traps */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('traps')}
                  className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between space-y-3 hover:border-white/[0.18] transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232325] text-[#ededed] border border-white/[0.08]">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-[#232325] border border-white/[0.08] px-2 py-0.5 text-xs font-mono text-[#85858b]">
                        Traps
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#ededed]">Command words detector</h3>
                    <p className="text-xs text-[#a1a1a6] mt-1">
                      Master "State" vs "Describe" vs "Explain" to never throw away method marks.
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ededed]">
                    <span>View traps</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 6. CURRICULUM DIRECTORY */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h2 className="text-xs font-mono text-[#85858b] uppercase tracking-wider">
                  Enrolled syllabuses
                </h2>
                <p className="text-xs text-[#a1a1a6]">
                  Past papers, revision notes, and quizzes across your enrolled subjects
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => {
                const isActive = sub.id === activeSubject.id;
                return (
                  <div
                    key={sub.id}
                    className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition-colors duration-150 ${
                      isActive
                        ? 'border-white/[0.2] bg-[#19191b]'
                        : 'border-white/[0.08] bg-[#19191b] hover:border-white/[0.16]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#232325] text-[#ededed] border border-white/[0.08]">
                          {sub.code}
                        </span>
                        <span className="text-xs text-[#85858b]">{sub.board}</span>
                      </div>
                      <h3 className="text-base font-medium text-[#ededed] mt-2.5">{sub.name}</h3>
                      <p className="text-xs text-[#85858b] mt-1 line-clamp-1">
                        {sub.topics.slice(0, 3).join(' • ')}...
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/[0.06] text-center">
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('finder');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Papers
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('revision');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('quiz');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Quiz
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('solver');
                        }}
                        className="rounded-md bg-[#232325] hover:bg-[#2c2c30] text-[#ededed] py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Solver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Platform Briefing Modal */}
      <AboutSimplyModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
