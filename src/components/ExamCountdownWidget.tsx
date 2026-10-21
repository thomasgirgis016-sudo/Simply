import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  BookMarked,
  Sparkles,
  FileText
} from 'lucide-react';
import { getNextScheduledPaper, CountdownState } from '../services/examCountdownService';
import { Subject } from '../types';
import { ActiveTab } from './Navbar';

interface ExamCountdownWidgetProps {
  activeSubject: Subject;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  activeSubject,
  onNavigateTab,
}) => {
  const [countdown, setCountdown] = useState<CountdownState | null>(() =>
    getNextScheduledPaper(activeSubject.code)
  );

  // Checkbox state for today's quota goals
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`simply_quota_${today}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleGoal = (key: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...completedGoals, [key]: !completedGoals[key] };
    setCompletedGoals(updated);
    try {
      localStorage.setItem(`simply_quota_${today}`, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Refresh countdown every 30 seconds or when active subject changes
  useEffect(() => {
    setCountdown(getNextScheduledPaper(activeSubject.code));
    const interval = setInterval(() => {
      setCountdown(getNextScheduledPaper(activeSubject.code));
    }, 30000);
    return () => clearInterval(interval);
  }, [activeSubject.code]);

  if (!countdown) return null;

  const { targetPaper, daysRemaining, hoursRemaining, minutesRemaining, recommendedDailyPapers, recommendedDailyMistakeClears, urgencyLevel } = countdown;

  const getUrgencyBadge = () => {
    switch (urgencyLevel) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/20 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Paper info and countdown ticker */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300 border border-slate-700">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>May/June 2026 Series</span>
            </span>

            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${getUrgencyBadge()}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{daysRemaining} Days Until Exam</span>
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{targetPaper.paperCode} • {targetPaper.paperTitle}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Exam Date: <strong className="text-slate-200">{targetPaper.examDate}</strong> ({targetPaper.timeOfDay} Session • {targetPaper.durationMinutes} mins)
            </p>
          </div>
        </div>

        {/* Center: Countdown Digits Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start lg:self-center">
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[50px] sm:min-w-[58px]">
            <span className="text-lg sm:text-2xl font-black font-mono text-white leading-none">
              {daysRemaining}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">Days</span>
          </div>

          <span className="text-base font-mono text-slate-600">:</span>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[50px] sm:min-w-[58px]">
            <span className="text-lg sm:text-2xl font-black font-mono text-indigo-300 leading-none">
              {hoursRemaining}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">Hours</span>
          </div>

          <span className="text-base font-mono text-slate-600">:</span>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[50px] sm:min-w-[58px]">
            <span className="text-lg sm:text-2xl font-black font-mono text-amber-300 leading-none">
              {minutesRemaining}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">Mins</span>
          </div>
        </div>
      </div>

      {/* Daily Study Quota Checklist */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Today's Grade 9 Daily Revision Quota:</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Check off daily to guarantee syllabus readiness
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Goal 1: Past Paper */}
          <button
            onClick={() => toggleGoal('paper')}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-left ${
              completedGoals.paper
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.paper ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-500 shrink-0" />
              )}
              <span className="text-xs font-semibold">
                Solve {recommendedDailyPapers} {activeSubject.code} Paper
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-400">+50 XP</span>
          </button>

          {/* Goal 2: Mistakes Cleared */}
          <button
            onClick={() => toggleGoal('mistakes')}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-left ${
              completedGoals.mistakes
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.mistakes ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-500 shrink-0" />
              )}
              <span className="text-xs font-semibold">
                Clear {recommendedDailyMistakeClears} Black Book Errors
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400">+25 XP</span>
          </button>

          {/* Goal 3: Cheat Sheet Review */}
          <button
            onClick={() => toggleGoal('cheatsheet')}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-left ${
              completedGoals.cheatsheet
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.cheatsheet ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-500 shrink-0" />
              )}
              <span className="text-xs font-semibold">
                Review 1-Page Cheat Sheet
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">+15 XP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
