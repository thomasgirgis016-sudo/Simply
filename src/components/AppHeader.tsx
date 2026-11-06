import React from 'react';
import {
  Menu,
  Flame,
  Scan,
  Crown,
  Search,
  ChevronDown,
  UserCheck,
  Calculator,
  ShieldCheck,
  Atom,
  Download
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { getDailyStreak } from '../services/dailyStreak';
import { handleLiquidMouseMove } from '../utils/liquidGlare';
import { hasActiveSubscription } from '../services/auth';

interface AppHeaderProps {
  activeTab: ActiveTab;
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  profile: UserProfile;
  currentUser?: UserAccount | null;
  onOpenMobileSidebar: () => void;
  onOpenProfile: () => void;
  onOpenPayment?: () => void;
  onOpenHandwritingScanner?: () => void;
  onOpenCalculator?: () => void;
  onOpenExamHud?: () => void;
  onOpenRevisionKit?: () => void;
  onOpenPwaModal?: () => void;
  onOpenParentReport?: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  designTheme?: 'liquid' | 'executive';
  onToggleDesignTheme?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  subjects,
  activeSubject,
  onSelectSubject,
  profile,
  currentUser,
  onOpenMobileSidebar,
  onOpenProfile,
  onOpenPayment,
  onOpenHandwritingScanner,
  onOpenCalculator,
  onOpenExamHud,
  onOpenRevisionKit,
  onOpenPwaModal,
  onOpenParentReport,
  onOpenAuth,
  designTheme = 'liquid',
  onToggleDesignTheme,
}) => {
  const streak = getDailyStreak();
  const isSubscribed = Boolean(currentUser && hasActiveSubscription(currentUser));

  const isWeeklyReportDue = React.useMemo(() => {
    if (!profile.lastWeeklyReportSentAt) return true;
    try {
      const sentTime = new Date(profile.lastWeeklyReportSentAt).getTime();
      return Date.now() - sentTime >= 7 * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }, [profile.lastWeeklyReportSentAt]);

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'home': return 'Academic Overview';
      case 'finder': return 'Past Paper Vault';
      case 'split': return 'Split-Screen QP/MS';
      case 'mock': return 'Timed Mock Simulator';
      case 'predicted': return '2026 Predicted Papers';
      case 'worksheet': return 'Worksheet Builder';
      case 'classifieds': return 'Topic Classifieds';
      case 'solver': return 'Mark Scheme Step-by-Step Solver';
      case 'chat': return 'Examiner Walkthrough Co-Pilot';
      case 'esl-speaking': return 'ESL Speaking Simulator';
      case 'listening': return 'Multi-Board Listening Simulator';
      case 'atp': return 'Paper 6 ATP Lab Master';
      case 'pitfalls': return 'Examiner Pitfall Heatmap';
      case 'mistakes': return 'Personal Error & Mistake Log';
      case 'traps': return 'Command Words Traps';
      case 'blitz': return 'Topic Classified Drills';
      case 'revision': return 'High-Yield Syllabus Summaries';
      case 'flashcards': return 'Topic Active Recall Decks';
      case 'cheatsheets': return 'Night Before Cheat Sheets';
      case 'formulas': return 'Formulas Dictionary';
      case 'formula-quiz': return 'Formula Recall Memory Quizzer';
      case 'tanzim': return 'Egyptian University Tanzim Calculator';
      case 'checklist': return 'Syllabus Tracker';
      case 'boundaries': return 'Grade Boundaries';
      case 'admin': return currentUser?.role === 'founder' ? 'Founder Console' : 'Admin Console';
      case 'analytics': return 'Teacher Classroom';
      default: return 'Simply IGCSE';
    }
  };

  return (
    <header
      onMouseMove={designTheme === 'liquid' ? handleLiquidMouseMove : undefined}
      className={`sticky top-0 z-30 w-full border-b transition-all duration-300 relative overflow-hidden ${
        designTheme === 'liquid'
          ? 'liquid-nav bg-slate-950/75 backdrop-blur-2xl border-white/10 shadow-2xl'
          : 'border-slate-800/80 bg-slate-950/95 backdrop-blur-xl'
      }`}
    >
      {designTheme === 'liquid' && <div className="liquid-glare" />}
      {/* Single Clean Header Row: Brand, Active Subject & Essential Status */}
      <div className="flex h-13 sm:h-16 w-full items-center justify-between px-2.5 sm:px-6 relative z-10 gap-1.5 sm:gap-2">
        {/* 1. Brand Logo & Desktop Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <SimplyLogo size="sm" showText={true} />

          {/* Desktop Breadcrumbs & Page Title */}
          <div className="hidden md:flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap truncate">
              <span>Platform</span>
              <span className="text-slate-600">/</span>
              <span className="text-indigo-400 font-mono font-bold shrink-0">{activeSubject.code}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 truncate max-w-[200px]">{activeSubject.name}</span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate whitespace-nowrap">
              {getPageTitle(activeTab)}
            </h1>
          </div>
        </div>

        {/* 2. Center/Right Controls: Subject Selector, Streak, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
          {/* Active Subject Selector Pill (Compact on Mobile, Full on Desktop) */}
          <div className="relative">
            <select
              value={activeSubject.id}
              onChange={(e) => {
                const found = subjects.find((s) => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="appearance-none rounded-xl border border-indigo-500/35 bg-slate-900/90 py-1 sm:py-1.5 pl-2 sm:pl-2.5 pr-5 sm:pr-8 text-[11px] sm:text-xs font-mono font-bold text-indigo-200 shadow-sm hover:border-indigo-400 focus:outline-none cursor-pointer max-w-[85px] sm:max-w-[260px] truncate"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white font-sans">
                  {s.code} • {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400" />
          </div>

          {/* Daily Streak Flame Pill */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black text-amber-300 shadow-sm cursor-default shrink-0"
            title={`${streak.currentStreak} Day Study Streak`}
          >
            <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs">{streak.currentStreak}d</span>
          </div>

          {/* Desktop-Only: Parent Weekly WhatsApp Report Button */}
          {onOpenParentReport && (
            <button
              onClick={onOpenParentReport}
              className={`hidden md:flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition cursor-pointer shrink-0 ${
                isWeeklyReportDue
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={
                isWeeklyReportDue
                  ? 'Weekly Parent WhatsApp Report is ready to send!'
                  : 'Send Weekly Progress Report to Parent via WhatsApp'
              }
            >
              <span className="text-xs">📱</span>
              <span className="font-bold">
                {isWeeklyReportDue ? 'Parent Report Due' : 'Parent Report'}
              </span>
            </button>
          )}

          {/* Desktop-Only: Pro Upgrade / Status Pill */}
          {onOpenPayment && (
            <button
              onClick={onOpenPayment}
              className={`hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer shrink-0 ${
                currentUser?.isPro
                  ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>{currentUser?.isPro ? 'PRO' : 'Get Pro'}</span>
            </button>
          )}

          {/* Desktop-Only: Compact UI Theme Switcher */}
          {isSubscribed && onToggleDesignTheme && (
            <button
              onClick={onToggleDesignTheme}
              className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer text-sm shrink-0 ${
                designTheme === 'liquid'
                  ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 shadow-sm shadow-cyan-500/10'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={
                designTheme === 'liquid'
                  ? 'Currently in Liquid Glass UI. Click to switch to Classic Solid UI.'
                  : 'Currently in Classic Solid UI. Click to switch to Liquid Glass UI.'
              }
            >
              {designTheme === 'liquid' ? '✨' : '🛡️'}
            </button>
          )}

          {/* Profile Avatar / Sign In */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs font-black text-white shadow-sm transition cursor-pointer shrink-0"
              title={`${currentUser.name} (${profile.targetGrade})`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
