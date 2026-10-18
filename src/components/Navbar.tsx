import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Layers,
  GraduationCap,
  BookOpen,
  BookmarkCheck,
  MessageSquare,
  Settings,
  UserCheck,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Target,
  Menu,
  X,
  TrendingUp,
  Columns,
  Calculator,
  Search,
  ListChecks,
  Mic,
  Home,
  Crown,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, Subject, UserAccount } from '../types';
import { SimplyLogo } from './SimplyLogo';

export type ActiveTab =
  | 'home'
  | 'finder'
  | 'revision'
  | 'quiz'
  | 'solver'
  | 'checklist'
  | 'esl-speaking'
  | 'flashcards'
  | 'formulas'
  | 'chat'
  | 'boundaries'
  | 'split'
  | 'admin';

interface NavbarProps {
  profile: UserProfile;
  currentUser: UserAccount | null;
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenCalculator?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentUser,
  subjects,
  activeSubject,
  onSelectSubject,
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  onOpenCalculator,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const baseTabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-indigo-400' },
    { id: 'finder', label: 'Past Papers', icon: Search, color: 'text-amber-400' },
    { id: 'revision', label: 'Revision Notes', icon: BookOpen, color: 'text-cyan-400' },
    { id: 'quiz', label: 'Past Paper Quizzes', icon: GraduationCap, color: 'text-emerald-400' },
    { id: 'solver', label: 'AI Solver & Grading', icon: Camera, color: 'text-pink-400' },
    { id: 'checklist', label: 'Syllabus Tracker', icon: ListChecks, color: 'text-emerald-400' },
    { id: 'esl-speaking', label: 'ESL Speaking Oral', icon: Mic, color: 'text-violet-400' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-indigo-400' },
    { id: 'formulas', label: 'Formulas & Commands', icon: BookmarkCheck, color: 'text-amber-400' },
    { id: 'chat', label: 'AI Examiner Chat', icon: MessageSquare, color: 'text-purple-400' },
    { id: 'boundaries', label: 'Grade Boundaries', icon: TrendingUp, color: 'text-teal-400' },
    { id: 'split', label: 'Split-Screen Papers', icon: Columns, color: 'text-sky-400' },
  ];

  const navTabs = baseTabs;

  const handleMobileTabClick = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
          {/* Brand / Logo */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center text-left cursor-pointer group focus:outline-none transition hover:opacity-95"
            title="Go to Homepage"
          >
            <SimplyLogo size="md" />
          </button>

          {/* Center: Subject Switcher & Grade Badge (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {/* Active Subject Selector */}
            <div className="relative">
              <select
                value={activeSubject.id}
                onChange={(e) => {
                  const found = subjects.find(s => s.id === e.target.value);
                  if (found) onSelectSubject(found);
                }}
                className="appearance-none rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-3.5 pr-8 text-xs font-semibold text-white shadow-sm hover:border-slate-600 focus:border-indigo-500 focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Student Profile Pill */}
            <button
              onClick={onOpenProfile}
              className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
              title="Edit student profile & subjects"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-white">{profile.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{profile.grade.split('(')[0]}</span>
              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                Target: {profile.targetGrade}
              </span>
            </button>
          </div>

          {/* Right side actions: Desktop Auth & Settings */}
          <div className="hidden sm:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">

                {currentUser.status === 'pending' && (
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300 animate-pulse">
                    Pending Approval
                  </span>
                )}

                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/50 transition cursor-pointer"
                  title="Account Settings"
                >
                  <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span>{currentUser.name}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-500 transition cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Theme Toggle (Light / Dark) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              </button>
            )}

            {/* Subtle admin/system settings gear */}
            <button
              onClick={onOpenSettings}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="AI Model & Accessibility Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Right: Clean Hamburger Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-5 w-5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Mobile-Only Dedicated Subject Bar (Room to breathe!) */}
        <div className="sm:hidden border-t border-slate-800/80 bg-slate-900/60 px-3 py-2 flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0">
            <select
              value={activeSubject.id}
              onChange={(e) => {
                const found = subjects.find(s => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="w-full appearance-none rounded-xl border border-indigo-500/30 bg-slate-950/90 py-1.5 pl-3 pr-7 text-xs font-bold text-white shadow-sm focus:border-indigo-500 focus:outline-none cursor-pointer truncate"
            >
              {subjects.map(s => (
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
            <Target className="h-3 w-3 text-amber-400" />
            <span>{profile.targetGrade}</span>
          </button>
        </div>

        {/* Navigation tabs bar (Desktop, Tablet & Mobile Horizontal Scroll with Gradient Fade Mask) */}
        <div
          className="flex mx-auto max-w-7xl items-center gap-1 overflow-x-auto px-3.5 pb-2 pt-1 sm:px-6 no-scrollbar scroll-smooth"
          style={{
            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          }}
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as ActiveTab)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm sm:hidden animate-fadeIn">
          <div className="relative w-4/5 max-w-xs h-full bg-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <SimplyLogo size="sm" />
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Student Profile Card */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">{profile.name}</span>
                  </div>
                  <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/25">
                    Goal: {profile.targetGrade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{profile.grade}</p>
                <button
                  onClick={() => {
                    onOpenProfile();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-center text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                >
                  Edit Profile & Subjects
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <div className="mt-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1">
                  Revision & Practice Modules
                </p>
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleMobileTabClick(tab.id as ActiveTab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${tab.color}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {onOpenCalculator && (
                  <button
                    onClick={() => {
                      onOpenCalculator();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-slate-900 transition"
                  >
                    <Calculator className="h-4 w-4 text-amber-400" />
                    <span>Scientific Calculator</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Bottom Actions: Auth & Settings */}
            <div className="border-t border-slate-800/80 pt-4 mt-6 space-y-2">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="text-xs text-emerald-400 font-semibold px-1">
                    Signed in as {currentUser.email}
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth('signin');
                      setIsMobileDrawerOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('signup');
                      setIsMobileDrawerOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              {onToggleTheme && (
                <button
                  onClick={() => {
                    onToggleTheme();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                  <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsMobileDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>AI Model & Font Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
