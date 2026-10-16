import React from 'react';
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
  ChevronDown
} from 'lucide-react';
import { UserProfile, Subject } from '../types';

export type ActiveTab = 'solver' | 'flashcards' | 'quiz' | 'revision' | 'formulas' | 'chat';

interface NavbarProps {
  profile: UserProfile;
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (sub: Subject) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  subjects,
  activeSubject,
  onSelectSubject,
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                SIMPLY <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">IGCSE</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                AI Co-Pilot
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Cambridge & Edexcel Exam Prep System
            </p>
          </div>
        </div>

        {/* Center: Subject Switcher & Grade Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Subject Selector */}
          <div className="relative">
            <select
              value={activeSubject.id}
              onChange={(e) => {
                const found = subjects.find(s => s.id === e.target.value);
                if (found) onSelectSubject(found);
              }}
              className="appearance-none rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-3.5 pr-8 text-xs font-semibold text-white shadow-sm hover:border-slate-600 focus:border-indigo-500 focus:outline-none cursor-pointer"
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
            className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
            title="Edit student profile"
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

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="lg:hidden rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-300 hover:text-white hover:border-slate-700"
            title="Edit Grade & Subjects"
          >
            <GraduationCap className="h-4 w-4 text-emerald-400" />
          </button>

          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
              profile.geminiApiKey
                ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 animate-pulse'
            }`}
            title="Configure Gemini AI Key"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">
              {profile.geminiApiKey ? 'AI Active' : 'API Key'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation tabs bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 pt-1 sm:px-6 no-scrollbar">
        {[
          { id: 'solver', label: 'AI Question & Photo Solver', icon: Camera, color: 'text-pink-400' },
          { id: 'flashcards', label: 'Smart Flashcards', icon: Layers, color: 'text-indigo-400' },
          { id: 'quiz', label: 'Past Paper Quizzes', icon: GraduationCap, color: 'text-emerald-400' },
          { id: 'revision', label: 'Revision Notes', icon: BookOpen, color: 'text-cyan-400' },
          { id: 'formulas', label: 'Formulas & Command Words', icon: BookmarkCheck, color: 'text-amber-400' },
          { id: 'chat', label: 'AI Examiner Chat', icon: MessageSquare, color: 'text-purple-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as ActiveTab)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
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
  );
};
