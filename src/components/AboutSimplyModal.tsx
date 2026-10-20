import React from 'react';
import {
  X,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl p-6 sm:p-8 text-slate-200 no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header / Brand Badge */}
        <div className="flex items-center gap-3 mb-5">
          <SimplyLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300 font-mono border border-indigo-500/30">
                Official Platform Executive Brief
              </span>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                Grade 9 / A* Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              About Simply IGCSE: What It Is & What It Does
            </h2>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/30 p-5 sm:p-6 mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Executive Summary
          </h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            <strong className="text-white font-bold">Simply IGCSE</strong> is the definitive academic operating system engineered specifically for Cambridge Assessment International Education (<strong className="text-indigo-300">CAIE</strong>) and Pearson <strong className="text-indigo-300">Edexcel</strong> IGCSE candidates, tutors, and schools worldwide.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2.5">
            Founded by <span className="text-amber-400 font-semibold">Thomas</span>, the platform bridges the gap between chaotic PDF past paper folders and generic AI tools by enforcing strict, line-by-line mark scheme verification, official examiner report feedback, and automated diagnostics designed to guarantee top-tier examination results.
          </p>
        </div>

        {/* 3 Core Pillars: What Simply IGCSE Does */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            Core Architecture & Capabilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Capability 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 mb-3">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">3,500+ Past Papers & Split Viewer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real examination questions from 2016 through 2025 across all series (May/June, Oct/Nov) and variants. Practice in synchronized dual-pane mode alongside official mark schemes with method (<strong className="text-slate-300">M</strong>), accuracy (<strong className="text-slate-300">A</strong>), and independent (<strong className="text-slate-300">B</strong>) mark breakdowns.
                </p>
              </div>
            </div>

            {/* Capability 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Camera className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">AI Chief Examiner & Photo OCR</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Snap a smartphone photo of handwritten student workings. Our vision AI maps your handwriting line-by-line against CAIE criteria, awarding [M1], [A1], or [A0] with red-ink annotations and immediate mark recovery guidance.
                </p>
              </div>
            </div>

            {/* Capability 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 mb-3">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Examiner Report Pitfall Heatmap</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesizes thousands of official Cambridge Principal Examiner Reports. Highlights the exact reason why 40%–70% of candidates lost marks on critical topics, distinguishing <em className="text-slate-300">"Describe"</em> from <em className="text-slate-300">"Explain"</em> traps.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Capability 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20 mb-3">
                  <FlaskConical className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Science Paper 6 ATP Lab Master</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Alternative to Practical suite with interactive meniscus burette simulators, flame & precipitate tests for cation/anion analysis, and the guaranteed 6-mark experimental planning template.
                </p>
              </div>
            </div>

            {/* Capability 5 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 mb-3">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">SM-2 Spaced Repetition & Unit Blitz</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scientific SuperMemo (SM-2) algorithm calculates daily due review cards for definitions and formulas. Accompanied by a 60-second rapid-fire metric unit blitz to eliminate careless unit conversion errors.
                </p>
              </div>
            </div>

            {/* Capability 6 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-3">
                  <School className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Printable Tests & Parent Report Cards</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tutors can generate 1-click printable PDF homework tests with teacher mark schemes. Parents receive executive progress letters detailing mock exam trajectories and syllabus readiness.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Simply IGCSE Serves */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 mb-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            Who We Serve
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-indigo-300 block mb-1">For Students & Candidates</span>
              <p className="text-slate-400 leading-relaxed">
                Aiming for Grade 8/9 or A*. Turn revision from aimless memorization into deliberate mark-scheme mastery under timed conditions.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-300 block mb-1">For Tutors & Teachers</span>
              <p className="text-slate-400 leading-relaxed">
                Save hours preparing weekly homework, customized topic tests, and student mock diagnostic reports.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-1">For Parents & Schools</span>
              <p className="text-slate-400 leading-relaxed">
                Track real study consistency, daily streaks, and authentic grade boundary forecasts with zero ambiguity.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Guarantee & Navigation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Strict Mark Scheme Compliance • Zero AI Speculation • 100% Free Access</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigateTab?.('finder');
              }}
              className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore Past Paper Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
