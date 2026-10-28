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
  Sparkles,
  Atom,
  Download
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
  onOpenExamHud?: () => void;
  onOpenRevisionKit?: () => void;
  onOpenPwaModal?: () => void;
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
  onOpenExamHud,
  onOpenRevisionKit,
  onOpenPwaModal,
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
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
      {/* Top Row: Brand & Main Navigation Controls */}
      <div className="flex h-14 sm:h-16 w-full items-center justify-between px-3.5 sm:px-6">
        {/* 1. Mobile Left: Brand Logo / Desktop Left: Breadcrumb Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile: Brand Logo (Always visible, clean, non-colliding) */}
          <div className="md:hidden flex items-center shrink-0">
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

        {/* 2. Desktop Center: Active Subject Selector */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative">
            <select
              value={activeSubject.id}
              onChange={(e) => {
                const found = subjects.find((s) => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="appearance-none rounded-full border border-indigo-500/35 bg-slate-900/90 py-1 pl-3.5 pr-8 text-xs font-mono font-bold text-indigo-200 shadow-sm hover:border-indigo-400 focus:outline-none cursor-pointer max-w-[260px] truncate"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white font-sans">
                  {s.code} • {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
          </div>
        </div>

        {/* 3. Right Controls: Streak, Tools, Profile & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Exam Reference HUD Button (Periodic Table & Formulas) */}
        {onOpenExamHud && (
          <button
            onClick={onOpenExamHud}
            className="hidden sm:flex h-9 items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 text-xs font-semibold text-indigo-300 transition cursor-pointer"
            title="Open Interactive Periodic Table & Cambridge Formulas Reference HUD"
          >
            <Atom className="h-4 w-4 text-indigo-400" />
            <span className="hidden xl:inline text-[11px]">Reference HUD</span>
          </button>
        )}

        {/* 1-Click Revision Kit Button */}
        {onOpenRevisionKit && (
          <button
            onClick={onOpenRevisionKit}
            className="hidden md:flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 text-xs font-semibold text-amber-300 transition cursor-pointer"
            title="Export 1-Click Complete Revision Kit (PDF)"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span className="hidden xl:inline text-[11px]">Survival Kit</span>
          </button>
        )}

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

        {/* Mobile Sidebar Hamburger Toggle */}
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-4 w-4 text-amber-400" />
          </button>
        )}
      </div>
    </div>

    {/* Dedicated Mobile-Only Syllabus Bar (Zero brand overlap on 360px-430px) */}
    <div className="md:hidden border-t border-slate-800/80 bg-slate-900/60 px-3.5 py-1.5 flex items-center justify-between gap-2">
      <div className="relative flex-1 min-w-0">
        <select
          value={activeSubject.id}
          onChange={(e) => {
            const found = subjects.find((s) => s.id === e.target.value);
            if (found) onSelectSubject(found);
          }}
          className="w-full appearance-none rounded-xl border border-indigo-500/30 bg-slate-950/90 py-1.5 pl-3 pr-7 text-xs font-bold text-white shadow-sm focus:border-indigo-500 focus:outline-none cursor-pointer truncate"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-white">
              {s.code} • {s.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
      </div>

      <button
        onClick={onOpenProfile}
        className="shrink-0 flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] font-bold text-amber-300 active:scale-95 transition"
        title="Curriculum & Target Grade"
      >
        <span className="font-mono">{profile.targetGrade}</span>
      </button>
    </div>
  </header>
  );
};
