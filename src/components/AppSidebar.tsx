import React, { useState } from 'react';
import {
  Home,
  Search,
  BookOpen,
  FileText,
  BookmarkCheck,
  Layers,
  Zap,
  Mic,
  Calculator,
  Compass,
  ChevronDown,
  Crown,
  Printer,
  Clock,
  FlaskConical,
  TrendingDown,
  ShieldAlert,
  Settings,
  LogOut,
  Columns,
  ListChecks,
  MessageSquare,
  X,
  Atom,
  Download,
  Smartphone,
  Headphones,
  Building2,
  BrainCircuit,
  TrendingUp,
  BookMarked,
  Scan,
  PanelLeftClose,
  PanelLeft,
  ChevronRight
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
import { ActiveTab } from './Navbar';
import { SimplyLogo } from './SimplyLogo';
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  const isSubscribed = Boolean(currentUser && hasActiveSubscription(currentUser));

  // Restrained, clean navigation groups
  const navSections = [
    ...(currentUser?.role === 'founder' || currentUser?.role === 'admin'
      ? [
          {
            title: 'Administration',
            items: [{ id: 'admin' as ActiveTab, label: 'Founder Console', icon: Crown }],
          },
        ]
      : []),
    {
      title: 'Workspace',
      items: [
        { id: 'home' as ActiveTab, label: 'Overview', icon: Home },
        { id: 'finder' as ActiveTab, label: 'Past Paper Vault', icon: Search },
        { id: 'classifieds' as ActiveTab, label: 'Topic Classifieds', icon: FileText },
        { id: 'split' as ActiveTab, label: 'Split-Screen QP/MS', icon: Columns },
        { id: 'mock' as ActiveTab, label: 'Timed Mocks', icon: Clock },
      ],
    },
    {
      title: 'Technique & Solvers',
      items: [
        { id: 'solver' as ActiveTab, label: 'Step-by-Step Solver', icon: Calculator },
        { id: 'chat' as ActiveTab, label: 'Examiner Co-Pilot', icon: MessageSquare },
        { id: 'atp' as ActiveTab, label: 'Paper 6 ATP Lab Master', icon: FlaskConical },
        { id: 'pitfalls' as ActiveTab, label: 'Examiner Pitfall Heatmap', icon: TrendingDown },
        { id: 'mistakes' as ActiveTab, label: 'Error Notebook', icon: BookMarked },
        { id: 'traps' as ActiveTab, label: 'Command Words Traps', icon: ShieldAlert },
      ],
    },
    {
      title: 'Syllabus & Recall',
      items: [
        { id: 'revision' as ActiveTab, label: 'Syllabus Notes', icon: BookOpen },
        { id: 'flashcards' as ActiveTab, label: 'Active Recall Decks', icon: Layers },
        { id: 'cheatsheets' as ActiveTab, label: 'Night Before Cheat Sheets', icon: FileText },
        { id: 'formulas' as ActiveTab, label: 'Formula Dictionary', icon: BookmarkCheck },
        { id: 'formula-quiz' as ActiveTab, label: 'Formula Recall Quizzer', icon: BrainCircuit },
        { id: 'boundaries' as ActiveTab, label: 'Grade Boundaries', icon: TrendingUp },
        { id: 'checklist' as ActiveTab, label: 'Syllabus Tracker', icon: ListChecks },
      ],
    },
    {
      title: 'Language & Extras',
      items: [
        { id: 'esl-speaking' as ActiveTab, label: 'ESL Speaking Oral', icon: Mic },
        { id: 'listening' as ActiveTab, label: 'Listening Practice', icon: Headphones },
        { id: 'tanzim' as ActiveTab, label: 'Tanzim Calculator', icon: Building2 },
        { id: 'predicted' as ActiveTab, label: '2026 Predicted Papers', icon: FileText },
        { id: 'worksheet' as ActiveTab, label: 'Worksheet Builder', icon: Printer },
      ],
    },
  ];

  const handleItemClick = (id: ActiveTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto no-scrollbar bg-[#111113] border-r border-white/[0.06] text-zinc-300 select-none">
      {/* 1. Header & Active Syllabus Selector */}
      <div className="p-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleItemClick('home')}
          >
            <SimplyLogo size="sm" showText={!isCollapsed} />
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Compact Syllabus Selector in Sidebar */}
        {!isCollapsed && (
          <div className="pt-1">
            <div className="relative">
              <select
                value={activeSubject.id}
                onChange={(e) => {
                  const found = subjects.find((s) => s.id === e.target.value);
                  if (found) onSelectSubject(found);
                }}
                className="w-full appearance-none rounded-lg border border-white/[0.08] bg-[#18181B] py-1.5 pl-2.5 pr-7 text-xs font-mono font-medium text-zinc-200 hover:border-white/[0.14] focus:border-[#FF5B37] focus:outline-none cursor-pointer truncate"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#18181B] text-zinc-200 font-sans">
                    {s.code} • {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Text-Based Navigation Rows */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {section.title}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-white/[0.07] text-white font-semibold border-l-2 border-[#FF5B37]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[#FF5B37]' : 'text-zinc-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}

        {/* Expandable Secondary Utilities Shelf (Quiet, uncrowded) */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setIsToolsExpanded(!isToolsExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition"
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider">Quick Utilities</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isToolsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isToolsExpanded && (
              <div className="mt-1 space-y-0.5 animate-fadeIn">
                {onOpenExamHud && (
                  <button
                    onClick={() => { onOpenExamHud(); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    <Atom className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Periodic Table & Formulas</span>
                  </button>
                )}
                {onOpenCalculator && (
                  <button
                    onClick={() => { onOpenCalculator(); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    <Calculator className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Scientific Calculator</span>
                  </button>
                )}
                {onOpenHandwritingScanner && (
                  <button
                    onClick={() => { onOpenHandwritingScanner(); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    <Scan className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Scan Handwriting</span>
                  </button>
                )}
                {onOpenRevisionKit && (
                  <button
                    onClick={() => { onOpenRevisionKit(); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    <Download className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Revision Booklet PDF</span>
                  </button>
                )}
                {onOpenPwaModal && (
                  <button
                    onClick={() => { onOpenPwaModal(); onCloseMobile(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Install Web App</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Clean Account & Footer Area */}
      <div className="p-3 border-t border-white/[0.06] bg-[#141417]">
        {currentUser ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 text-left min-w-0 flex-1 hover:opacity-90 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-lg bg-[#27272A] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">Target: {profile.targetGrade}</div>
                  </div>
                )}
              </button>

              {!isCollapsed && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={onOpenSettings}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/[0.06] transition"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Pro Upgrade link if not subscribed */}
            {!isSubscribed && onOpenPayment && !isCollapsed && (
              <button
                onClick={() => { onOpenPayment(); onCloseMobile(); }}
                className="w-full text-center py-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white text-xs font-semibold transition"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => {
                onOpenAuth('signin');
                onCloseMobile();
              }}
              className="w-full py-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white text-xs font-semibold transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Quiet platform brief */}
        {onOpenAbout && !isCollapsed && (
          <button
            onClick={() => { onOpenAbout(); onCloseMobile(); }}
            className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-300 pt-2 transition"
          >
            About Fahemny
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
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
