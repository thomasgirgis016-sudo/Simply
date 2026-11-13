import React from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileText,
  Camera,
  Award,
  FlaskConical,
  Flame,
  ShieldCheck,
  TrendingUp,
  Target,
  ArrowRight,
  School,
  UserCheck,
  Layers
} from 'lucide-react';
import { SimplyLogo } from './SimplyLogo';

interface AboutSimplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AboutSimplyModal: React.FC<AboutSimplyModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl p-6 sm:p-7 text-zinc-300 no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header / Brand Badge */}
        <div className="flex items-center gap-3 mb-5">
          <SimplyLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                Official Platform Executive Brief
              </span>
              <span className="rounded border border-[#FF5B37]/30 bg-[#FF5B37]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#FF5B37]">
                Grade 9 / A* Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight mt-1">
              About Fahemny IGCSE: What It Is &amp; What It Does
            </h2>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 sm:p-6 mb-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#FF5B37] mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#FF5B37]" />
            Executive Summary
          </h3>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            <strong className="text-white font-medium">Fahemny IGCSE</strong> is the definitive IGCSE Examination &amp; Revision Workspace engineered specifically for Cambridge Assessment International Education (<strong className="text-zinc-100 font-medium">CAIE</strong>) and Pearson <strong className="text-zinc-100 font-medium">Edexcel</strong> IGCSE candidates, tutors, and schools worldwide.
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-2.5">
            Founded by <span className="text-[#FF5B37] font-medium">Thomas</span>, the platform bridges the gap between chaotic PDF past paper folders and generic chatbots by enforcing strict, line-by-line mark scheme verification, official examiner report feedback, and structured diagnostics designed to maximize student examination performance.
          </p>
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-col gap-1 text-xs">
            <p className="text-zinc-300 font-normal flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Curated by experienced IGCSE educators, head of departments, and past examiners across Cairo, Alexandria, and the UK.</span>
            </p>
            <p className="text-zinc-500 text-[11px]">
              Strictly aligned with Cambridge Assessment International Education (CAIE) 2024–2026 specifications.
            </p>
          </div>
        </div>

        {/* 3 Core Pillars: What Simply IGCSE Does */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#FF5B37]" />
            Core Architecture & Capabilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Capability 1 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">9,280+ Past Papers & Split Viewer</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real examination questions from 2010 through 2026 across all series (May/June, Oct/Nov, Feb/March) and variants. Practice in synchronized dual-pane mode alongside official mark schemes with method (<strong className="text-zinc-300">M</strong>), accuracy (<strong className="text-zinc-300">A</strong>), and independent (<strong className="text-zinc-300">B</strong>) mark breakdowns.
                </p>
              </div>
            </div>

            {/* Capability 2 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <Camera className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">Senior Examiner Marking & Script Scanner</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Snap a smartphone photo of handwritten student workings. Our optical script parser evaluates student handwriting line-by-line against CAIE criteria, awarding [M1], [A1], or [A0] with red-ink annotations and immediate mark recovery guidance.
                </p>
              </div>
            </div>

            {/* Capability 3 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <Flame className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">Examiner Report Pitfall Heatmap</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Synthesizes thousands of official Cambridge Principal Examiner Reports. Highlights the exact reason why 40%–70% of candidates lost marks on critical topics, distinguishing <em className="text-zinc-300">"Describe"</em> from <em className="text-zinc-300">"Explain"</em> traps.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Capability 4 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">Science Paper 6 ATP Lab Master</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Alternative to Practical suite with interactive meniscus burette simulators, flame & precipitate tests for cation/anion analysis, and the guaranteed 6-mark experimental planning template.
                </p>
              </div>
            </div>

            {/* Capability 5 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <Award className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">SM-2 Spaced Repetition & Topic Drills</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Scientific SuperMemo (SM-2) algorithm calculates daily due review cards for definitions and formulas. Accompanied by rapid-fire topic classified drills to eliminate careless calculation errors.
                </p>
              </div>
            </div>

            {/* Capability 6 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <School className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">Printable Tests & Parent Reports</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tutors can generate 1-click printable PDF homework tests with teacher mark schemes. Parents receive executive progress letters detailing mock trajectories.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Capability 7 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <Flame className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">Personal Error & Mistake Log</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dedicated revision notebook where candidates save every question they lost marks on, diagnose the root cause (arithmetic slip, misread command, formula trap), and run active recall Rematch Quizzes until 100% mastered.
                </p>
              </div>
            </div>

            {/* Capability 8 */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col justify-between hover:border-white/[0.14] transition-colors">
              <div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08] mb-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">"Night Before the Exam" 1-Page Cheat Sheets</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ultra-dense single-page emergency summaries for Maths 0580, Chemistry 0620, Physics 0625, Biology 0610, and ESL 0510. Formatted with non-negotiable Cambridge instructions for 1-click clean A4 PDF printing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Simply IGCSE Serves */}
        <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 mb-6 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            Who We Serve
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#18181b] border border-white/[0.08]">
              <span className="font-semibold text-zinc-200 block mb-1">For Students & Candidates</span>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Aiming for Grade 8/9 or A*. Turn revision from aimless memorization into deliberate mark-scheme mastery under timed conditions.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#18181b] border border-white/[0.08]">
              <span className="font-semibold text-zinc-200 block mb-1">For Tutors & Teachers</span>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Save hours preparing weekly homework, customized topic tests, and student mock diagnostic reports.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#18181b] border border-white/[0.08]">
              <span className="font-semibold text-zinc-200 block mb-1">For Parents & Schools</span>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Track real study consistency, daily streaks, and authentic grade boundary forecasts with zero ambiguity.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Guarantee & Navigation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Strict Mark Scheme Compliance • Zero Speculation • Free Core Access & Optional Pro</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigateTab?.('finder');
              }}
              className="flex-1 sm:flex-initial rounded-lg bg-[#FF5B37] hover:bg-[#ff704d] px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Explore Past Paper Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
