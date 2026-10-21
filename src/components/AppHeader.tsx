import React from 'react';
import {
  Menu,
  Flame,
  Scan,
  Crown,
  Search,
  ChevronDown,
  UserCheck,
  Settings,
  ShieldCheck,
  Bell
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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle + Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white md:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-amber-400" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Platform</span>
            <span>/</span>
            <span className="text-indigo-400">{activeSubject.code}</span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
            {getPageTitle(activeTab)}
          </h2>
        </div>

        <div className="sm:hidden flex items-center gap-2">
          <SimplyLogo size="sm" showText={false} />
          <span className="text-xs font-black text-white truncate max-w-[140px]">
            {getPageTitle(activeTab)}
          </span>
        </div>
      </div>

      {/* Center: Mobile Subject Switcher Dropdown */}
      <div className="flex md:hidden items-center">
        <div className="relative">
          <select
            value={activeSubject.id}
            onChange={(e) => {
              const found = subjects.find((s) => s.id === e.target.value);
              if (found) onSelectSubject(found);
            }}
            className="appearance-none rounded-xl border border-indigo-500/30 bg-slate-900 py-1.5 pl-2.5 pr-7 text-xs font-bold text-white shadow-sm focus:border-indigo-500 focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.code}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
        </div>
      </div>

      {/* Right Actions: Streak, Scan Paper, Pro, Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Streak Pill */}
        <div
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-300 shadow-sm cursor-default"
          title={`${streak.currentStreak} Day Study Streak`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="hidden sm:inline">{streak.currentStreak}d Streak</span>
          <span className="sm:hidden">{streak.currentStreak}d</span>
        </div>

        {/* Scan Paper Camera Button */}
        {onOpenHandwritingScanner && (
          <button
            onClick={onOpenHandwritingScanner}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-1.5 text-xs font-bold text-sky-300 transition cursor-pointer"
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Scan Paper</span>
          </button>
        )}

        {/* Pro Upgrade Pill */}
        {onOpenPayment && (
          <button
            onClick={onOpenPayment}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition cursor-pointer ${
              currentUser?.isPro
                ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{currentUser?.isPro ? 'PRO ACTIVE' : 'Get Pro'}</span>
          </button>
        )}

        {/* Profile Avatar / Sign In */}
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white hover:brightness-110 transition cursor-pointer"
            title={`${currentUser.name} (${profile.targetGrade})`}
          >
            {currentUser.name.charAt(0)}
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('signin')}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
