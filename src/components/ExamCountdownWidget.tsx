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
        return 'bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'medium':
        return 'bg-[#FF5B37]/10 text-[#FF5B37] border-[#FF5B37]/20';
      default:
        return 'bg-[#4cc38a]/10 text-[#4cc38a] border-[#4cc38a]/20';
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Paper info and countdown ticker */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-white/[0.08]">
              <Calendar className="h-3 w-3 text-zinc-400" />
              <span>May/June 2026 series</span>
            </span>

            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${getUrgencyBadge()}`}>
              <Clock className="h-3 w-3" />
              <span>{daysRemaining}d to Exam</span>
            </span>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{targetPaper.paperCode} • {targetPaper.paperTitle}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Exam: <strong className="text-zinc-200 font-medium">{targetPaper.examDate}</strong> ({targetPaper.timeOfDay} Session)
            </p>
          </div>
        </div>

        {/* Right: Countdown Digits Box */}
        <div className="flex items-center gap-1 sm:gap-1.5 self-start sm:self-auto">
          <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-[#141416] px-2.5 py-1.5 min-w-[46px] sm:min-w-[54px]">
            <span className="text-base sm:text-xl font-semibold font-mono tabular-nums text-white leading-none">
              {daysRemaining}
            </span>
            <span className="text-[9px] uppercase font-mono text-zinc-500 mt-0.5">Days</span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-zinc-600">:</span>

          <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-[#141416] px-2.5 py-1.5 min-w-[46px] sm:min-w-[54px]">
            <span className="text-base sm:text-xl font-semibold font-mono tabular-nums text-zinc-200 leading-none">
              {hoursRemaining}
            </span>
            <span className="text-[9px] uppercase font-mono text-zinc-500 mt-0.5">Hours</span>
          </div>

          <span className="text-xs sm:text-sm font-mono text-zinc-600">:</span>

          <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-[#141416] px-2.5 py-1.5 min-w-[46px] sm:min-w-[54px]">
            <span className="text-base sm:text-xl font-semibold font-mono tabular-nums text-[#FF5B37] leading-none">
              {minutesRemaining}
            </span>
            <span className="text-[9px] uppercase font-mono text-zinc-500 mt-0.5">Mins</span>
          </div>
        </div>
      </div>

      {/* Daily Study Quota Checklist */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#4cc38a]" />
            <span>Daily Revision Quota</span>
          </div>
          <span className="hidden sm:inline text-xs text-zinc-400">
            Daily target for syllabus mastery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Goal 1: Past Paper */}
          <button
            onClick={() => toggleGoal('paper')}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-left ${
              completedGoals.paper
                ? 'border-[#4cc38a]/30 bg-[#4cc38a]/10 text-[#4cc38a]'
                : 'border-white/[0.08] bg-[#141416] text-zinc-300 hover:border-white/[0.14]'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.paper ? (
                <CheckCircle2 className="h-4 w-4 text-[#4cc38a] shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-500 shrink-0" />
              )}
              <span className="text-xs font-medium">
                Solve {recommendedDailyPapers} {activeSubject.code} Paper
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-zinc-400">+50 XP</span>
          </button>

          {/* Goal 2: Mistakes Cleared */}
          <button
            onClick={() => toggleGoal('mistakes')}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-left ${
              completedGoals.mistakes
                ? 'border-[#4cc38a]/30 bg-[#4cc38a]/10 text-[#4cc38a]'
                : 'border-white/[0.08] bg-[#141416] text-zinc-300 hover:border-white/[0.14]'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.mistakes ? (
                <CheckCircle2 className="h-4 w-4 text-[#4cc38a] shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-500 shrink-0" />
              )}
              <span className="text-xs font-medium">
                Clear {recommendedDailyMistakeClears} Logged Errors
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#e5484d]">+25 XP</span>
          </button>

          {/* Goal 3: Cheat Sheet Review */}
          <button
            onClick={() => toggleGoal('cheatsheet')}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-left ${
              completedGoals.cheatsheet
                ? 'border-[#4cc38a]/30 bg-[#4cc38a]/10 text-[#4cc38a]'
                : 'border-white/[0.08] bg-[#141416] text-zinc-300 hover:border-white/[0.14]'
            }`}
          >
            <div className="flex items-center gap-2">
              {completedGoals.cheatsheet ? (
                <CheckCircle2 className="h-4 w-4 text-[#4cc38a] shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-500 shrink-0" />
              )}
              <span className="text-xs font-medium">
                Review 1-Page Cheat Sheet
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-amber-400">+15 XP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
