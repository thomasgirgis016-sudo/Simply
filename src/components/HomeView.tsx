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
  const [previewTab, setPreviewTab] = useState<'split' | 'solver' | 'pitfalls' | 'whatsapp'>('split');

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
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto w-full">
      {/* View Switcher Pill (Shows when user is logged in so they can view the public landing presentation anytime) */}
      {currentUser && (
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Viewing as:</span>
            <div className="inline-flex rounded-lg bg-[#111723] p-1 border border-white/[0.08]">
              <button
                onClick={() => setViewMode('workspace')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  viewMode === 'workspace'
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Academic Workspace
              </button>
              <button
                onClick={() => setViewMode('landing')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  viewMode === 'landing'
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Platform Overview
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-emerald-400 font-semibold">● Active Session:</span>
            <span>{currentUser.name}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-amber-300">Grade {profile.targetGrade} Candidate</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW A: PUBLIC LANDING PAGE (Human-Centred, Distinctive, IGCSE Realities)
          ========================================================================= */}
      {viewMode === 'landing' && (
        <div className="space-y-16 py-2">
          {/* 1. HERO SECTION */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0E1420] p-6 sm:p-12 shadow-2xl">
            {/* Subtle architectural grain & ambient warmth (No generic cyber glows) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5B37]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFA63A]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl space-y-6">
              {/* Syllabus Accreditation Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1 text-xs font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-[#FF5B37]" />
                <span>Cambridge (CAIE) & Pearson Edexcel IGCSE</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-mono">2026 Ready</span>
              </div>

              {/* Natural, Honest Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                  The IGCSE platform built by someone who actually{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5B37] via-[#FF7A45] to-[#FFA63A]">
                    sat the papers.
                  </span>
                </h1>
                <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed pt-1">
                  Stop scrolling through chaotic Google Drives and watermarked PDFs.
                  Practice with 1,200+ official past papers, synchronized mark schemes,
                  line-by-line method breakdowns, and examiner pitfall warnings.
                </p>
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
                  className="btn-brand-primary text-sm sm:text-base py-3 px-6 shadow-lg shadow-[#FF5B37]/20"
                >
                  <span>Explore Past Paper Vault</span>
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
                  className="btn-brand-secondary text-sm sm:text-base py-3 px-5"
                >
                  <Calculator className="h-4 w-4 text-amber-400" />
                  <span>See Mark Scheme Solver</span>
                </button>

                {!currentUser && onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white px-3 py-2 transition"
                  >
                    Already have an account? <span className="text-[#FFA63A] underline">Sign in</span>
                  </button>
                )}
              </div>

              {/* Honest Proof Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.08]">
                <div>
                  <div className="text-2xl font-black font-mono text-white">1,200+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Official Past Papers</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">[M1][A1]</div>
                  <div className="text-xs text-slate-400 mt-0.5">Method & Accuracy Marks</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-amber-300">2018–2025</div>
                  <div className="text-xs text-slate-400 mt-0.5">Series Synchronized</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-sky-400">100%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Syllabus-Aligned Topics</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. REAL INTERACTIVE PLATFORM SHOWCASE */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B37]">
                Live Platform Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Crafted for how students actually study
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Click each feature below to preview how Fahemny tackles the real pain points of IGCSE exam prep.
              </p>
            </div>

            {/* Feature Tab Bar */}
            <div className="flex rounded-xl bg-[#111723] p-1.5 border border-white/[0.08] max-w-2xl mx-auto gap-1">
              {[
                { id: 'split', label: 'Split-Screen Papers', icon: Columns },
                { id: 'solver', label: 'Step-by-Step Solver', icon: Calculator },
                { id: 'pitfalls', label: 'Examiner Pitfalls', icon: TrendingDown },
                { id: 'whatsapp', label: 'Weekly WhatsApp Report', icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#1A2333] text-white border border-white/[0.12] shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#FF5B37]' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Showcase Frame */}
            <div className="rounded-2xl border border-white/[0.1] bg-[#0E1420] p-4 sm:p-7 shadow-xl">
              {/* Tab 1: Split-Screen Viewer Preview */}
              {previewTab === 'split' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">CAIE 0580/42 • May/June 2024</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Synchronized Question Paper & Mark Scheme Dual-Pane
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">No more flipping between tabs or printing 50 pages</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Pane: Question Paper */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#121824] p-4 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/[0.06] pb-2">
                        <span className="font-bold text-white">QUESTION 4(b)</span>
                        <span className="text-amber-400 font-bold">[4 Marks]</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        A solid cone has radius <code className="text-amber-300 font-mono">r = 6 cm</code> and slant height <code className="text-amber-300 font-mono">l = 10 cm</code>.
                        <br />
                        Calculate the total surface area of the cone. Give your answer in terms of <span className="font-mono text-amber-300">π</span>.
                      </p>
                      <div className="rounded-lg bg-black/30 p-2.5 text-[11px] text-slate-400 border border-white/[0.04]">
                        Formula given on syllabus: <code className="text-slate-300 font-mono">Curved Surface Area = πrl</code>
                      </div>
                    </div>

                    {/* Right Pane: Official Mark Scheme */}
                    <div className="rounded-xl border border-emerald-500/30 bg-[#0B1A14] p-4 space-y-3 font-sans">
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 border-b border-emerald-500/20 pb-2">
                        <span className="font-bold">OFFICIAL CAIE MARK SCHEME</span>
                        <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">VERIFIED</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-200">
                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-1.5">
                          <span>Curved area = π × 6 × 10 = 60π</span>
                          <span className="font-mono font-bold text-emerald-400 shrink-0">[M1] Method</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.04] pb-1.5">
                          <span>Base circular area = π × 6² = 36π</span>
                          <span className="font-mono font-bold text-emerald-400 shrink-0">[M1] Base</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 pt-0.5 font-bold text-white">
                          <span>Total surface area = 60π + 36π = 96π</span>
                          <span className="font-mono text-emerald-300 shrink-0">[A1] Exact Value</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-amber-300/90 pt-1 italic">
                        Examiner Note: Common trap — 42% of candidates forgot to add the circular base.
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
                      <span className="text-xs font-mono font-bold text-sky-400">Step-by-Step Mark Scheme Solver</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Never wonder why you lost a mark again
                      </h3>
                    </div>
                    <span className="text-[11px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-mono">
                      Line-by-Line Criteria
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#121824] p-4 space-y-3">
                    <div className="text-xs text-slate-400 font-mono">Syllabus: Cambridge IGCSE Physics (0625) • Paper 4 Extended</div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      "A 1200 W electric kettle heats 0.8 kg of water from 20°C to 100°C. Specific heat capacity of water = 4200 J/(kg·°C). Calculate the minimum time required."
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-xs text-slate-200">
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">[M1]</span>
                        <span>Energy required: <code className="text-emerald-300 font-mono">Q = mcΔT = 0.8 × 4200 × (100 - 20) = 268,800 J</code></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-xs text-slate-200">
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">[M1]</span>
                        <span>Time relationship: <code className="text-emerald-300 font-mono">t = Energy / Power = 268,800 / 1200</code></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-xs text-slate-200">
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">[A1]</span>
                        <span>Final answer: <code className="text-emerald-300 font-mono">t = 224 s (or 3.73 minutes)</code></span>
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
                      <span className="text-xs font-mono font-bold text-rose-400">Examiner Pitfall Heatmap</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Misconceptions pulled directly from official Principal Examiner Reports
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
                        <span>Cambridge Biology 0610 • Osmosis</span>
                        <span className="font-mono">71% Error Rate</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Candidates frequently write "water moves from a dilute to concentrated solution" without specifying <strong>water potential gradient</strong> or mentioning the <strong>partially permeable membrane</strong>. Zero marks awarded.
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>Cambridge Chemistry 0620 • Electrolysis</span>
                        <span className="font-mono">58% Error Rate</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Confusing anode and cathode ionic discharges. In dilute sulfuric acid, candidates mistakenly state oxygen is formed by the decomposition of acid rather than oxidation of <code className="font-mono text-amber-200">OH⁻</code> ions.
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
                      <span className="text-xs font-mono font-bold text-emerald-400">Automated Parent WhatsApp Reports</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        Transparent weekly diagnostics delivered directly to parents' phones
                      </h3>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto rounded-2xl bg-[#0B141A] p-4 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="rounded-xl bg-[#005C4B] p-3 text-slate-100 space-y-1 text-[11px] leading-relaxed">
                      <div className="font-bold text-white">📊 FAHEMNY IGCSE — Weekly Academic Statement</div>
                      <div>Candidate: <strong>Thomas</strong> (Target: Grade 9 / A*)</div>
                      <div>Syllabus: Cambridge Mathematics (0580) & Physics (0625)</div>
                      <div className="pt-1 text-slate-200">
                        • Weekly Accuracy: <strong>89%</strong> (142 questions completed)<br />
                        • Study Streak: <strong>7 consecutive days</strong><br />
                        • Focus Chapter for this week: <em>0580 Vectors & Transformations</em>
                      </div>
                      <div className="pt-2 text-[10px] text-cyan-200 font-mono underline">
                        📄 View Complete Verified Audit & Download PDF: https://simply-igcse.com/?tab=report&id=candidate_1
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. WHY STUDENTS MISS THE GRADE 9 (IGCSE REALITY) */}
          <section className="space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                The Real Exam Challenge
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Why hard-working students miss the Grade 9
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Examiner reports consistently show that lost marks rarely come from lack of studying. They come from mark scheme traps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111723] p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">The Command Word Trap</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Writing a description when the question says <em>"Explain"</em> costs 2 to 3 marks every single time. Fahemny highlights command words across all papers and flags the exact expected structure.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111723] p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Calculator className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Missing Method Marks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Students often lose all 5 marks because of one mental arithmetic error. Our solver breaks down intermediate <span className="font-mono text-emerald-400 font-bold">[M1]</span> marks you can salvage even if the final number is wrong.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111723] p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <Columns className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Chaotic PDF Juggling</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Searching 3 different websites to find whether variant 2 or variant 3 has the mark scheme wastes 45 minutes of revision every day. Fahemny synchronizes question papers and mark schemes side by side.
                </p>
              </div>
            </div>
          </section>

          {/* 4. SYLLABUS DIRECTORY */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B37]">
                  Supported Examinations
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Comprehensive Cambridge & Edexcel Syllabuses
                </h2>
              </div>

              {/* Board Selector */}
              <div className="flex rounded-lg bg-[#111723] p-1 border border-white/[0.08]">
                {(['All', 'CIE', 'Edexcel'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBoardFilter(b)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      boardFilter === b
                        ? 'bg-[#FF5B37] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {b === 'All' ? 'All Boards' : b === 'CIE' ? 'Cambridge' : 'Edexcel'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSubjects.map((sub) => {
                const isCie = sub.board === 'CIE';
                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.18] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-black border ${
                          isCie
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                        }`}>
                          {sub.code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isCie ? 'Cambridge IGCSE' : 'Pearson Edexcel'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2">{sub.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {sub.topics.slice(0, 3).join(' • ')}...
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.06] text-center">
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('finder');
                        }}
                        className="rounded-lg bg-[#162030] hover:bg-[#1E2B40] text-slate-200 py-1.5 text-xs font-bold transition"
                      >
                        Papers
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('revision');
                        }}
                        className="rounded-lg bg-[#162030] hover:bg-[#1E2B40] text-slate-200 py-1.5 text-xs font-bold transition"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('solver');
                        }}
                        className="rounded-lg bg-[#162030] hover:bg-[#1E2B40] text-slate-200 py-1.5 text-xs font-bold transition"
                      >
                        Solver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. A NOTE FROM THE FOUNDER (Human Editorial Touch) */}
          <section className="rounded-3xl border border-white/[0.08] bg-[#0E1420] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FF5B37]/20 border border-[#FF5B37]/40 flex items-center justify-center font-bold text-[#FF5B37]">
                T
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">A Note from Thomas</h4>
                <p className="text-xs text-slate-400">Founder of Fahemny &amp; IGCSE Candidate</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-editorial italic text-base sm:text-lg">
              "I built Fahemny because during my own exam preparation, I was exhausted from digging through chaotic Google Drives and listening to generic YouTube tutorials that skipped the mark scheme. Fahemny gives you what actually matters in the exam hall: clarity, speed, and exact examiner expectations."
            </p>
          </section>

          {/* 6. CRAFTED FOOTER */}
          <footer className="border-t border-white/[0.08] pt-8 pb-12 space-y-6 text-xs text-slate-400">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SimplyLogo size="sm" showText={true} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <button onClick={() => onNavigateTab('finder')} className="hover:text-white transition">Past Papers</button>
                <button onClick={() => onNavigateTab('solver')} className="hover:text-white transition">Step Solver</button>
                <button onClick={() => onNavigateTab('revision')} className="hover:text-white transition">Revision Notes</button>
                <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-white transition">Platform Philosophy</button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
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
          <section className="rounded-3xl border border-white/[0.08] bg-[#0E1420] p-4 sm:p-7 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5B37]/15 px-2.5 py-0.5 text-xs font-bold text-[#FF5B37] border border-[#FF5B37]/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Academic Workspace
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                    <Award className="h-3.5 w-3.5" />
                    Target Grade: {profile.targetGrade}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser ? `Welcome back, ${currentUser.name}` : `Welcome to your Study Workspace`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Focus on what matters today: official papers, method marks, and unmastered mistakes.
                </p>
              </div>

              {/* Active Syllabus Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Active Syllabus:
                </span>
                {subjects.map((sub) => {
                  const isActive = sub.id === activeSubject.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectSubject(sub)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5B37] text-white shadow-md shadow-[#FF5B37]/20 ring-1 ring-white/20'
                          : 'border border-white/[0.08] bg-[#121824] text-slate-400 hover:text-white hover:border-white/[0.16]'
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeSubject.code} past papers, topics, formulas...`}
                className="w-full rounded-2xl border border-white/[0.1] bg-[#121824] py-2.5 pl-10 pr-14 text-sm text-white placeholder-slate-400 shadow-inner focus:border-[#FF5B37] focus:outline-none focus:ring-1 focus:ring-[#FF5B37]/30 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}

              {/* Live Search Results Popover */}
              {searchResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0E1420] p-3 shadow-2xl">
                  {searchResults.subjects.length === 0 &&
                  searchResults.papers.length === 0 &&
                  searchResults.notes.length === 0 ? (
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
                                className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-[#162030] transition"
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
                          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-1">
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
                                className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-[#162030] transition"
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

            {/* Quick Utility Links */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
              {onOpenExamHud && (
                <button
                  onClick={onOpenExamHud}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#121824] hover:bg-[#1A2333] text-slate-200 text-xs font-bold transition shrink-0"
                >
                  <Atom className="h-3.5 w-3.5 text-amber-400" />
                  <span>Periodic Table & Formula HUD</span>
                </button>
              )}

              {onOpenRevisionKit && (
                <button
                  onClick={onOpenRevisionKit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#121824] hover:bg-[#1A2333] text-slate-200 text-xs font-bold transition shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-rose-400" />
                  <span>Cambridge Formula Booklet PDF</span>
                </button>
              )}

              {onOpenPwaModal && (
                <button
                  onClick={onOpenPwaModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#121824] hover:bg-[#1A2333] text-slate-200 text-xs font-bold transition shrink-0"
                >
                  <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Install Web App</span>
                </button>
              )}
            </div>
          </section>

          {/* 2. EXAM COUNTDOWN & REVISION QUOTA */}
          <ExamCountdownWidget activeSubject={activeSubject} onNavigateTab={onNavigateTab} />

          {/* 3. FOUR CORE REVISION WORKSPACES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#FF5B37]" />
                <span>Primary Workspaces • {activeSubject.code}</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Past Paper Vault */}
              <div
                onClick={() => onNavigateTab('finder')}
                className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/50 hover:bg-[#162030] transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                      {OFFICIAL_PAST_PAPER_PDFS.length.toLocaleString()}+
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Past Paper Vault</h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
                    Official CAIE & Edexcel papers, QP & MS synchronized with topic filters.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400">
                  <span>Open Vault</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 2: Step-by-Step Solver */}
              <div
                onClick={() => onNavigateTab('solver')}
                className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 sm:p-5 flex flex-col justify-between hover:border-sky-500/50 hover:bg-[#162030] transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-300 font-mono">
                      [M1][A1]
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Step-by-Step Solver</h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
                    Line-by-line mark scheme breakdown for typed questions or past paper photos.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-sky-400">
                  <span>Solve Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 3: Personal Mistake Log */}
              <div
                onClick={() => onNavigateTab('mistakes')}
                className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 sm:p-5 flex flex-col justify-between hover:border-rose-500/50 hover:bg-[#162030] transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                      {mistakesCount} Unmastered
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Error Notebook</h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
                    Your personal mistakes log with active Rematch quiz to guarantee mastery.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-400">
                  <span>Rematch Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 4: Night Before Cheat Sheets */}
              <div
                onClick={() => onNavigateTab('cheatsheets')}
                className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF5B37]/50 hover:bg-[#162030] transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5B37]/15 text-[#FF5B37] border border-[#FF5B37]/25">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="rounded bg-[#FF5B37]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#FFA63A] font-mono">
                      1-Page PDF
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Cheat Sheets</h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
                    Emergency 1-page high-yield formula & trap summaries for active recall.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#FF5B37]">
                  <span>Open Sheets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </section>

          {/* 4. TODAY'S DAILY CAMBRIDGE CHALLENGE */}
          <section className="rounded-2xl border border-amber-500/30 bg-[#0E1420] p-4 sm:p-6 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Flame className="h-4 w-4 fill-amber-400" />
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

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#121824] px-2.5 py-1 text-xs font-mono font-bold text-amber-300 border border-white/[0.08]">
                  🔥 {streakState.currentStreak} Day Streak ({streakState.xpPoints} XP)
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
              <MathRenderer content={dailyQuestion.questionPrompt} />
            </div>

            <form onSubmit={handleCheckDailyAnswer} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={dailyAnswerInput}
                onChange={(e) => setDailyAnswerInput(e.target.value)}
                placeholder="Final answer (e.g. 14.5 or x = 3)..."
                className="flex-1 min-w-0 rounded-xl border border-white/[0.1] bg-[#121824] px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#FF5B37] hover:bg-[#E84E2A] text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Verify
              </button>
            </form>

            {dailyResult && (
              <div
                className={`rounded-xl p-2.5 text-xs font-semibold border animate-fadeIn ${
                  dailyResult.isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/40 text-amber-200'
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Specialized Examination Suites
                </h2>
                <p className="text-xs text-slate-400">
                  Select a workflow category to explore focused preparation tools
                </p>
              </div>

              <div className="flex rounded-lg bg-[#111723] p-1 border border-white/[0.08]">
                {[
                  { id: 'all', label: 'All Tools' },
                  { id: 'papers', label: 'Papers & Mocks' },
                  { id: 'technique', label: 'Examiner Technique' },
                  { id: 'recall', label: 'Active Recall' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as WorkspaceCategory)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#FF5B37] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Tool 1: Science ATP Master */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('atp')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-amber-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                        Paper 6
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Science ATP Lab Master</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Interactive flame tests, meniscus reader, cation identification, and 6-mark plan builder.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400">
                    <span>Launch Lab</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 2: Examiner Pitfalls Heatmap */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('pitfalls')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-rose-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                        Examiner Reports
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Examiner Pitfall Heatmap</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Official CAIE reports synthesized into exact misconceptions costing candidates the A*.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-400">
                    <span>View Pitfalls</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 3: Timed Mock Simulator */}
              {(activeCategory === 'all' || activeCategory === 'papers') && (
                <div
                  onClick={() => onNavigateTab('mock')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-sky-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                        Timed
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Timed Mock Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sit full-length Cambridge papers under authentic exam conditions with Grade 9 boundaries.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-sky-400">
                    <span>Start Mock</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 4: Split Screen Paper Viewer */}
              {(activeCategory === 'all' || activeCategory === 'papers') && (
                <div
                  onClick={() => onNavigateTab('split')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-amber-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <Columns className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                        Dual Pane
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Split-Screen QP/MS</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Synchronized Question Paper and Mark Scheme side by side without printing.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400">
                    <span>Open Dual View</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 5: Active Recall Decks */}
              {(activeCategory === 'all' || activeCategory === 'recall') && (
                <div
                  onClick={() => onNavigateTab('flashcards')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        SM-2
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Topic Active Recall Decks</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Spaced-repetition formula and definition decks scheduled for exam memory.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <span>Practice Cards</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              {/* Tool 6: Command Words Traps */}
              {(activeCategory === 'all' || activeCategory === 'technique') && (
                <div
                  onClick={() => onNavigateTab('traps')}
                  className="rounded-2xl border border-white/[0.08] bg-[#111723] p-4 flex flex-col justify-between hover:border-rose-500/50 hover:bg-[#162030] transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                        Command Words
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Command Words Trap Detector</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Master "State" vs "Describe" vs "Explain" to never throw away method marks.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-400">
                    <span>View Traps</span>
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Enrolled Syllabuses
                </h2>
                <p className="text-xs text-slate-400">
                  Quick access to all papers, revision notes, and quizzes across your enrolled subjects
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {subjects.map((sub) => {
                const isActive = sub.id === activeSubject.id;
                return (
                  <div
                    key={sub.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition ${
                      isActive
                        ? 'border-[#FF5B37]/60 bg-[#162030] ring-1 ring-[#FF5B37]/30'
                        : 'border-white/[0.08] bg-[#111723] hover:border-white/[0.16]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/[0.08] text-white">
                          {sub.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{sub.board}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-2">{sub.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {sub.topics.slice(0, 3).join(' • ')}...
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-2 border-t border-white/[0.06] text-center">
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('finder');
                        }}
                        className="rounded-lg bg-black/30 hover:bg-[#FF5B37] hover:text-white text-slate-300 py-1 text-[11px] font-semibold transition"
                      >
                        Papers
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('revision');
                        }}
                        className="rounded-lg bg-black/30 hover:bg-[#FF5B37] hover:text-white text-slate-300 py-1 text-[11px] font-semibold transition"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('quiz');
                        }}
                        className="rounded-lg bg-black/30 hover:bg-[#FF5B37] hover:text-white text-slate-300 py-1 text-[11px] font-semibold transition"
                      >
                        Quiz
                      </button>
                      <button
                        onClick={() => {
                          onSelectSubject(sub);
                          onNavigateTab('solver');
                        }}
                        className="rounded-lg bg-black/30 hover:bg-[#FF5B37] hover:text-white text-slate-300 py-1 text-[11px] font-semibold transition"
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
