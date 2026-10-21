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
  Sparkles
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { getDailyStreak } from '../services/dailyStreak';

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
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
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
  onOpenAuth,
}) => {
  const streak = getDailyStreak();

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'home': return 'Academic Overview';
      case 'finder': return 'Past Paper Vault';
      case 'split': return 'Split-Screen QP/MS';
      case 'mock': return 'Timed Mock Simulator';
      case 'predicted': return '2025 Predicted Papers';
      case 'worksheet': return 'Worksheet Builder';
      case 'solver': return 'AI Solver & Grader';
      case 'chat': return 'AI Examiner Tutor Chat';
      case 'esl-speaking': return 'ESL Speaking Simulator';
      case 'atp': return 'Paper 6 ATP Lab Master';
      case 'pitfalls': return 'Examiner Pitfall Heatmap';
      case 'mistakes': return 'The Mistake Black Book';
      case 'traps': return 'Command Words Traps';
      case 'blitz': return '60s Unit Conversion Blitz';
      case 'revision': return 'Syllabus Revision Notes';
      case 'flashcards': return 'Spaced Repetition Flashcards';
      case 'cheatsheets': return 'Night Before Cheat Sheets';
      case 'formulas': return 'Formulas Dictionary';
      case 'checklist': return 'Syllabus Tracker';
      case 'boundaries': return 'Grade Boundaries';
      case 'admin': return currentUser?.role === 'founder' ? 'Founder Console' : 'Admin Console';
      case 'analytics': return 'Teacher Classroom';
      default: return 'Simply IGCSE';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/95 px-3.5 sm:px-6 backdrop-blur-xl">
      {/* 1. Mobile Left: Brand Logo / Desktop Left: Breadcrumb Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile: Brand Logo (Always visible, clean and non-colliding) */}
        <div className="md:hidden flex items-center">
          <SimplyLogo size="sm" showText={true} />
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Platform</span>
            <span>/</span>
            <span className="text-indigo-400 font-mono">{activeSubject.code}</span>
            <span>/</span>
            <span className="text-slate-400">{activeSubject.name}</span>
          </div>
          <h2 className="text-base font-black text-white tracking-tight">
            {getPageTitle(activeTab)}
          </h2>
        </div>
      </div>

      {/* 2. Mobile Center: Sleek Subject Selector Pill */}
      <div className="md:hidden flex items-center justify-center">
        <div className="relative">
          <select
            value={activeSubject.id}
            onChange={(e) => {
              const found = subjects.find((s) => s.id === e.target.value);
              if (found) onSelectSubject(found);
            }}
            className="appearance-none rounded-full border border-indigo-500/35 bg-slate-900/90 py-1 pl-3 pr-6 text-xs font-mono font-bold text-indigo-200 shadow-sm focus:outline-none cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white font-sans">
                {s.code} • {s.name.split(' ')[0]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-indigo-400" />
        </div>
      </div>

      {/* 3. Right Controls: Streak, Tools, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Calculator Button (Desktop / Tablet) */}
        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="hidden sm:flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 text-xs font-semibold text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition cursor-pointer"
            title="IGCSE Scientific Calculator"
          >
            <Calculator className="h-4 w-4 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">Calculator</span>
          </button>
        )}

        {/* Daily Streak Flame Pill (Mobile & Desktop) */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 rounded-full sm:rounded-xl border border-amber-500/30 bg-amber-500/10 px-2 sm:px-2.5 py-1 text-xs font-black text-amber-300 shadow-sm cursor-default"
          title={`${streak.currentStreak} Day Study Streak`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] sm:text-xs">{streak.currentStreak}d</span>
        </div>

        {/* Scan Paper Camera Button (Desktop / Tablet) */}
        {onOpenHandwritingScanner && (
          <button
            onClick={onOpenHandwritingScanner}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-300 transition cursor-pointer"
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Scan Paper</span>
          </button>
        )}

        {/* Pro Upgrade Pill (Desktop) */}
        {onOpenPayment && (
          <button
            onClick={onOpenPayment}
            className={`hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition cursor-pointer ${
              currentUser?.isPro
                ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>{currentUser?.isPro ? 'PRO' : 'Get Pro'}</span>
          </button>
        )}

        {/* Profile Avatar / Sign In */}
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs font-black text-white shadow-sm transition cursor-pointer"
            title={`${currentUser.name} (${profile.targetGrade})`}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('signin')}
            className="rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
