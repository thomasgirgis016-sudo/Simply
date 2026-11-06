import React, { useState } from 'react';
import {
  Home,
  Search,
  BookOpen,
  GraduationCap,
  Camera,
  FileText,
  TrendingUp,
  BookmarkCheck,
  Layers,
  Zap,
  Mic,
  Calculator,
  Compass,
  Award,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  BookMarked,
  Clock,
  Crown,
  Printer,
  Activity,
  Flame,
  FlaskConical,
  Calendar,
  ShieldAlert,
  Swords,
  TrendingDown,
  Scan,
  Info,
  Target,
  Settings,
  LogOut,
  LogIn,
  UserCheck,
  PanelLeftClose,
  PanelLeft,
  Columns,
  ListChecks,
  MessageSquare,
  Users,
  X,
  Atom,
  Download,
  Smartphone,
  Headphones,
  Building2,
  BrainCircuit
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
import { handleLiquidMouseMove } from '../utils/liquidGlare';
import { hasActiveSubscription } from '../services/auth';

interface AppSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  profile: UserProfile;
  currentUser?: UserAccount | null;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenCalculator?: () => void;
  onOpenPayment?: () => void;
  onOpenHandwritingScanner?: () => void;
  onOpenAbout?: () => void;
  onOpenExamHud?: () => void;
  onOpenRevisionKit?: () => void;
  onOpenPwaModal?: () => void;
  onOpenParentReport?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  designTheme?: 'liquid' | 'executive';
  onToggleDesignTheme?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onSelectTab,
  subjects,
  activeSubject,
  onSelectSubject,
  profile,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  onOpenCalculator,
  onOpenPayment,
  onOpenHandwritingScanner,
  onOpenAbout,
  onOpenExamHud,
  onOpenRevisionKit,
  onOpenPwaModal,
  onOpenParentReport,
  isMobileOpen,
  onCloseMobile,
  designTheme = 'liquid',
  onToggleDesignTheme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isWeeklyReportDue = React.useMemo(() => {
    if (!profile.lastWeeklyReportSentAt) return true;
    try {
      const sentTime = new Date(profile.lastWeeklyReportSentAt).getTime();
      return Date.now() - sentTime >= 7 * 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }, [profile.lastWeeklyReportSentAt]);

  const navGroups = [
    ...(currentUser?.role === 'founder' || currentUser?.role === 'admin' ? [{
      group: 'Founder & Platform',
      items: [
        { id: 'admin', label: 'Founder Console (Live)', icon: Crown, color: 'text-amber-400' },
      ]
    }] : []),
    {
      group: 'Overview',
      items: [
        { id: 'home', label: 'Home Dashboard', icon: Home, color: 'text-indigo-400' },
      ]
    },
    {
      group: 'Past Papers & Exams',
      items: [
        { id: 'finder', label: 'Past Paper Vault', icon: Search, color: 'text-blue-400' },
        { id: 'classifieds', label: 'Topic Classifieds', icon: FileText, color: 'text-emerald-400' },
        { id: 'split', label: 'Split-Screen Papers', icon: Columns, color: 'text-sky-400' },
        { id: 'mock', label: 'Timed Mock Simulator', icon: Clock, color: 'text-amber-400' },
        { id: 'predicted', label: '2026 Predicted Papers', icon: FileText, color: 'text-blue-400' },
        { id: 'worksheet', label: 'Worksheet Builder', icon: Printer, color: 'text-slate-300' },
      ]
    },
    {
      group: 'Examiner Guidance & Step Solvers',
      items: [
        { id: 'solver', label: 'Mark Scheme Step-by-Step Solver', icon: Calculator, color: 'text-blue-400' },
        { id: 'chat', label: 'Examiner Walkthrough Co-Pilot', icon: MessageSquare, color: 'text-sky-400' },
        { id: 'esl-speaking', label: 'ESL Speaking Oral', icon: Mic, color: 'text-teal-400' },
        { id: 'listening', label: 'Listening Practice & Exam', icon: Headphones, color: 'text-indigo-400' },
      ]
    },
    {
      group: 'Cambridge Masteries & Traps',
      items: [
        { id: 'atp', label: 'Paper 6 ATP Lab Master', icon: FlaskConical, color: 'text-amber-400' },
        { id: 'pitfalls', label: 'Examiner Pitfall Heatmap', icon: TrendingDown, color: 'text-rose-400' },
        { id: 'mistakes', label: 'Personal Error & Mistake Log', icon: BookMarked, color: 'text-rose-400' },
        { id: 'traps', label: 'Command Words Traps', icon: ShieldAlert, color: 'text-rose-400' },
      ]
    },
    {
      group: 'Revision & Syllabus Summaries',
      items: [
        { id: 'blitz', label: 'Topic Classified Drills', icon: Zap, color: 'text-amber-400' },
        { id: 'revision', label: 'High-Yield Syllabus Summaries', icon: BookOpen, color: 'text-sky-400' },
        { id: 'flashcards', label: 'Topic Active Recall Decks', icon: Layers, color: 'text-blue-400' },
        { id: 'cheatsheets', label: 'Night Before Cheat Sheets', icon: FileText, color: 'text-amber-400' },
        { id: 'formulas', label: 'Formulas & Definitions', icon: BookmarkCheck, color: 'text-amber-400' },
        { id: 'formula-quiz', label: 'Formula Recall Quizzer', icon: BrainCircuit, color: 'text-amber-400' },
        { id: 'checklist', label: 'Syllabus Tracker', icon: ListChecks, color: 'text-emerald-400' },
        { id: 'boundaries', label: 'Grade Boundaries', icon: TrendingUp, color: 'text-teal-400' },
      ]
    },
    {
      group: 'University Admissions & Equivalence',
      items: [
        { id: 'tanzim', label: 'Egyptian Tanzim Calculator', icon: Building2, color: 'text-indigo-400' },
      ]
    }
  ];

  const handleItemClick = (id: ActiveTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const isSubscribed = Boolean(currentUser && hasActiveSubscription(currentUser));

  const sidebarContent = (
    <div
      onMouseMove={designTheme === 'liquid' ? handleLiquidMouseMove : undefined}
      className={`flex h-full flex-col justify-between overflow-y-auto no-scrollbar relative transition-all duration-300 ${
        designTheme === 'liquid'
          ? 'liquid-sidebar bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 text-slate-200 shadow-2xl'
          : 'bg-slate-950 border-r border-slate-800/90 text-slate-300'
      }`}
    >
      {designTheme === 'liquid' && <div className="liquid-glare" />}
      {/* 1. Top Section: Logo, Subject Picker, Collapse Toggle */}
      <div className="space-y-4 p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleItemClick('home')}>
            <SimplyLogo size="sm" showText={!isCollapsed} />
          </div>

          {/* Desktop Collapse / Mobile Close */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <button
            onClick={onCloseMobile}
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active Subject Selector Pill */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Syllabus
            </span>
            <div className="relative">
              <select
                value={activeSubject.id}
                onChange={(e) => {
                  const found = subjects.find((s) => s.id === e.target.value);
                  if (found) onSelectSubject(found);
                }}
                className="w-full appearance-none rounded-xl border border-indigo-500/30 bg-slate-900/90 py-2 pl-3 pr-8 text-xs font-bold text-white shadow-sm focus:border-indigo-500 focus:outline-none cursor-pointer truncate"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.code} • {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
        )}

        {/* Quick Scan Handwriting Button */}
        {onOpenHandwritingScanner && !isCollapsed && (
          <button
            onClick={() => {
              onOpenHandwritingScanner();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 py-2 px-3 text-xs font-bold text-sky-300 transition cursor-pointer"
          >
            <Scan className="h-4 w-4" />
            <span>Scan Hand Written Paper</span>
          </button>
        )}
      </div>

      {/* 2. Middle Navigation Sections */}
      <div className="flex-1 space-y-6 px-3 py-4 overflow-y-auto no-scrollbar">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id as ActiveTab)}
                  onMouseMove={designTheme === 'liquid' ? handleLiquidMouseMove : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer overflow-hidden ${
                    designTheme === 'liquid' ? 'liquid-item' : ''
                  } ${
                    isActive
                      ? 'bg-indigo-600/25 text-white border border-indigo-400/40 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                  title={item.label}
                >
                  {designTheme === 'liquid' && <div className="liquid-glare" />}
                  <Icon className={`h-4 w-4 shrink-0 relative z-10 ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!isCollapsed && (
                    <span className="truncate relative z-10">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400 relative z-10" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Admin / Founder Option (if applicable) */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'founder') && (
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            {!isCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                Authority Console
              </div>
            )}
            <button
              onClick={() => handleItemClick('admin')}
              onMouseMove={designTheme === 'liquid' ? handleLiquidMouseMove : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer overflow-hidden ${
                designTheme === 'liquid' ? 'liquid-item' : ''
              } ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/80 hover:bg-slate-900 hover:text-amber-300'
              }`}
            >
              {designTheme === 'liquid' && <div className="liquid-glare" />}
              <Crown className="h-4 w-4 shrink-0 text-amber-400 fill-amber-400 relative z-10" />
              {!isCollapsed && (
                <span className="relative z-10">{currentUser.role === 'founder' ? 'Founder Console' : 'Admin Console'}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Profile & System Footer */}
      <div className="space-y-2 p-3 border-t border-slate-800/80 bg-slate-950/90">
        {/* Quick Exam Utilities - STRICTLY restricted to active subscribers & admins */}
        {isSubscribed ? (
          <div className="space-y-1">
            {onOpenExamHud && (
              <button
                onClick={() => {
                  onOpenExamHud();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition cursor-pointer"
                title="Open Periodic Table & Formula Reference HUD"
              >
                <Atom className="h-4 w-4 text-indigo-400 shrink-0" />
                {!isCollapsed && <span>Reference HUD (Formulas)</span>}
              </button>
            )}

            {onOpenRevisionKit && (
              <button
                onClick={() => {
                  onOpenRevisionKit();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition cursor-pointer"
                title="1-Click Complete Revision Kit PDF Booklet"
              >
                <Download className="h-4 w-4 text-rose-400 shrink-0" />
                {!isCollapsed && <span>1-Click Revision Kit (PDF)</span>}
              </button>
            )}

            {onOpenPwaModal && (
              <button
                onClick={() => {
                  onOpenPwaModal();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition cursor-pointer"
                title="Install Simply IGCSE App"
              >
                <Smartphone className="h-4 w-4 text-emerald-400 shrink-0" />
                {!isCollapsed && <span>Install Mobile App</span>}
              </button>
            )}

            {/* Scientific Calculator Quick Action */}
            {onOpenCalculator && (
              <button
                onClick={() => {
                  onOpenCalculator();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition cursor-pointer"
              >
                <Calculator className="h-4 w-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span>Scientific Calculator</span>}
              </button>
            )}

            {/* Parent Weekly WhatsApp Report Button */}
            {onOpenParentReport && (
              <button
                onClick={() => {
                  onOpenParentReport();
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isWeeklyReportDue
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 shadow-sm'
                    : 'border-slate-800 bg-slate-900/70 hover:bg-slate-900 text-slate-300'
                }`}
                title="Send Weekly Progress Report to Parent via WhatsApp"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-emerald-400 shrink-0 text-sm">📱</span>
                  {!isCollapsed && <span className="truncate">Parent WhatsApp Report</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    isWeeklyReportDue ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isWeeklyReportDue ? 'Due' : 'Sent'}
                  </span>
                )}
              </button>
            )}

            {/* Liquid vs Classic Solid Fallback Switcher */}
            {onToggleDesignTheme && (
              <button
                onClick={onToggleDesignTheme}
                onMouseMove={designTheme === 'liquid' ? handleLiquidMouseMove : undefined}
                className={`group relative w-full flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer overflow-hidden ${
                  designTheme === 'liquid'
                    ? 'border-cyan-400/40 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/50'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={
                  designTheme === 'liquid'
                    ? 'Currently in Liquid Glass UI. Click here to revert back to Classic Solid UI anytime.'
                    : 'Currently in Classic Solid UI. Click here to switch to Liquid Glass UI.'
                }
              >
                {designTheme === 'liquid' && <div className="liquid-glare" />}
                <span className="flex items-center gap-2 relative z-10">
                  <span className="text-sm shrink-0">{designTheme === 'liquid' ? '✨' : '🛡️'}</span>
                  {!isCollapsed && (
                    <span className="text-[11px] truncate">
                      {designTheme === 'liquid' ? 'Liquid Glass UI' : 'Classic Solid UI'}
                    </span>
                  )}
                </span>
                {!isCollapsed && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-wider relative z-10">
                    {designTheme === 'liquid' ? 'Active' : 'Revert'}
                  </span>
                )}
              </button>
            )}
          </div>
        ) : (
          currentUser && onOpenPayment && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenPayment();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2 px-3 text-xs font-black text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer"
                title="Subscribe to Simply IGCSE Pro to unlock full platform"
              >
                <Crown className="h-3.5 w-3.5 text-slate-950 fill-slate-950" />
                {!isCollapsed && <span>Subscribe to Unlock</span>}
              </button>
            </div>
          )
        )}

        {/* User Card */}
        {currentUser ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex items-center justify-between gap-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 text-left min-w-0 flex-1 hover:opacity-90 cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold truncate">Target: {profile.targetGrade}</div>
                </div>
              )}
            </button>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenSettings}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onOpenAuth('signin');
                onCloseMobile();
              }}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2 text-xs font-black text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Platform Briefing Quick Link */}
        {onOpenAbout && !isCollapsed && (
          <button
            onClick={() => {
              onOpenAbout();
              onCloseMobile();
            }}
            className="w-full text-center text-[10px] font-semibold text-slate-500 hover:text-indigo-300 transition cursor-pointer"
          >
            About Simply IGCSE (Executive Brief)
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-300 z-30 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
