import React from 'react';
import {
  Menu,
  Flame,
  Crown,
  ChevronDown,
  User,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { getDailyStreak } from '../services/dailyStreak';
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
  onNavigateTab?: (tab: ActiveTab) => void;
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
  onOpenParentReport,
  onOpenAuth,
  onNavigateTab,
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
      case 'solver': return 'Step-by-Step Solver';
      case 'chat': return 'Examiner Co-Pilot';
      case 'esl-speaking': return 'ESL Speaking Simulator';
      case 'listening': return 'Listening Simulator';
      case 'atp': return 'Paper 6 ATP Lab Master';
      case 'pitfalls': return 'Examiner Pitfall Heatmap';
      case 'mistakes': return 'Error Notebook';
      case 'traps': return 'Command Words Traps';
      case 'blitz': return 'Topic Drills';
      case 'revision': return 'Syllabus Notes';
      case 'flashcards': return 'Active Recall Decks';
      case 'cheatsheets': return 'Cheat Sheets';
      case 'formulas': return 'Formula Dictionary';
      case 'formula-quiz': return 'Formula Quizzer';
      case 'tanzim': return 'Tanzim Calculator';
      case 'checklist': return 'Syllabus Tracker';
      case 'boundaries': return 'Grade Boundaries';
      case 'admin': return currentUser?.role === 'founder' ? 'Founder Console' : 'Admin Console';
      case 'analytics': return 'Teacher Classroom';
      default: return 'Simply IGCSE';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#111113]/95 backdrop-blur-md transition-colors">
      <div className="flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-6 gap-2">
        {/* 1. Left: Hamburger (mobile only) + Logo + Desktop Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 shrink-0">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition active:scale-95 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo & Simply Brand Name */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className="flex items-center cursor-pointer select-none"
          >
            <SimplyLogo size="sm" showText={true} />
          </div>

          {/* Desktop Breadcrumbs (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 pl-2 border-l border-white/[0.08]">
            <span className="font-mono text-zinc-300 font-semibold">{activeSubject.code}</span>
            <span>/</span>
            <span className="text-zinc-200 font-medium truncate max-w-[220px]">{getPageTitle(activeTab)}</span>
          </div>
        </div>

        {/* 2. Center/Right: Compact Syllabus Selector & Desktop Secondary Actions */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Compact Syllabus Selector */}
          <div className="relative shrink-0">
            <select
              value={activeSubject.id}
              onChange={(e) => {
                const found = subjects.find((s) => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="appearance-none rounded-lg border border-white/[0.08] bg-[#18181B] py-1.5 pl-2.5 pr-7 text-xs font-mono font-medium text-zinc-200 hover:border-white/[0.16] hover:bg-[#202024] focus:border-[#FF5B37] focus:outline-none transition cursor-pointer max-w-[130px] sm:max-w-[240px] truncate"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#18181B] text-zinc-200 font-sans">
                  {s.code} • {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          </div>

          {/* Desktop-Only Secondary Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Daily Streak Flame */}
            <div
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-white/[0.06] px-2.5 py-1 text-xs text-zinc-300 cursor-default"
              title={`${streak.currentStreak} Day Study Streak`}
            >
              <Flame className="h-3.5 w-3.5 text-[#FF5B37] fill-[#FF5B37]" />
              <span className="font-mono font-semibold">{streak.currentStreak}d</span>
            </div>

            {/* Parent WhatsApp Report Button */}
            {onOpenParentReport && (
              <button
                onClick={onOpenParentReport}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition cursor-pointer ${
                  isWeeklyReportDue
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-white/[0.06] bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/[0.12]'
                }`}
                title="Send Weekly Progress Report to Parent via WhatsApp"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>{isWeeklyReportDue ? 'Report Due' : 'Report'}</span>
              </button>
            )}

            {/* Pro Upgrade Pill */}
            {onOpenPayment && (
              <button
                onClick={onOpenPayment}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  currentUser?.isPro
                    ? 'border border-amber-500/30 bg-amber-950/20 text-amber-300'
                    : 'bg-[#FF5B37] text-white hover:bg-[#F97316]'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>{currentUser?.isPro ? 'Pro' : 'Get Pro'}</span>
              </button>
            )}

            {/* Founder / Admin Pill */}
            {(currentUser?.role === 'founder' || currentUser?.role === 'admin') && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('admin')}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                    : 'border-white/[0.08] bg-zinc-900 text-amber-400/90 hover:text-amber-300'
                }`}
              >
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Console</span>
              </button>
            )}
          </div>

          {/* Profile Avatar / Sign In */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="h-8 w-8 rounded-lg bg-[#27272A] hover:bg-[#323236] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white transition cursor-pointer shrink-0"
              title={`${currentUser.name} (${profile.targetGrade})`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
