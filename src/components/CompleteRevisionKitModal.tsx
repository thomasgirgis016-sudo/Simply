import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  FileText,
  Sparkles,
  BookMarked,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap
} from 'lucide-react';
import { Subject, UserProfile, MistakeItem, CheatSheetSection, CheatSheetItem } from '../types';
import { getCheatSheetForSubject } from '../data/cheatSheetsData';
import { getMistakeNotebook } from '../services/mistakeNotebook';
import { EXAMINER_PITFALLS_DATABASE, ExaminerPitfall } from './ExaminerPitfallsHeatmap';
import { CAMBRIDGE_EXAM_FORMULAS } from '../data/periodicTableData';
import { MathRenderer } from './MathRenderer';

interface CompleteRevisionKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject: Subject;
  subjects?: Subject[];
  profile: UserProfile;
}

export const CompleteRevisionKitModal: React.FC<CompleteRevisionKitModalProps> = ({
  isOpen,
  onClose,
  activeSubject,
  subjects = [],
  profile,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(activeSubject);
  const subjectList = subjects.length > 0 ? subjects : [activeSubject];

  React.useEffect(() => {
    setSelectedSubject(activeSubject);
  }, [activeSubject]);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1. Cheat Sheet Data
  const sheet = useMemo(() => {
    return getCheatSheetForSubject(selectedSubject.code);
  }, [selectedSubject]);

  // 2. Unmastered Mistakes
  const unmasteredMistakes = useMemo(() => {
    try {
      const all = getMistakeNotebook();
      return all.filter((m) => {
        const matchSub = m.subjectId === selectedSubject.id || m.subjectCode === selectedSubject.code;
        return matchSub && !m.isMastered;
      });
    } catch {
      return [];
    }
  }, [selectedSubject]);

  // 3. Examiner Pitfalls
  const subjectPitfalls = useMemo(() => {
    return EXAMINER_PITFALLS_DATABASE.filter(
      (p) => p.subjectCode === selectedSubject.code
    ).slice(0, 4);
  }, [selectedSubject]);

  // 4. Formulas
  const formulas = useMemo(() => {
    const found = CAMBRIDGE_EXAM_FORMULAS.find(
      (f) => f.subject === selectedSubject.code
    );
    return found ? found.items : [];
  }, [selectedSubject]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header (No print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                1-Click Complete Exam Survival Kit (PDF)
              </h2>
              <p className="text-[11px] text-slate-400">
                Combines 1-Page Cheat Sheet + Unmastered Errors + Top Examiner Traps + Formulas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Subject Selector */}
            <div className="relative">
              <select
                value={selectedSubject.id}
                onChange={(e) => {
                  const found = subjectList.find((s) => s.id === e.target.value);
                  if (found) setSelectedSubject(found);
                }}
                className="appearance-none rounded-xl border border-slate-700 bg-slate-900 py-1.5 pl-3 pr-8 text-xs font-bold text-white shadow-sm focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                {subjectList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.code} • {s.name.split(' ')[0]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4 PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Multi-Page Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950/50">
          {/* ================= PAGE 1: EMERGENCY 1-PAGE CHEAT SHEET ================= */}
          <div className="print-page bg-[#0d121f] print:bg-white text-slate-100 print:text-black rounded-3xl print:rounded-none border border-slate-800 print:border-none p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-indigo-500/40 pb-4">
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-400 print:text-indigo-700">
                  Simply IGCSE • Emergency Exam Revision Kit • Section 1
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight mt-1">
                  {sheet.subjectCode} — {sheet.subjectName}
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Target Candidate: {profile.name} • Target Grade: {profile.targetGrade} • Syllabus: {sheet.board} ({sheet.badge})
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-amber-500/20 print:bg-amber-100 px-2.5 py-1 text-xs font-mono font-black text-amber-300 print:text-amber-800 border border-amber-500/30">
                  Page 1 of 3
                </span>
                <div className="text-[10px] text-slate-400 print:text-slate-500 mt-1">1-Page High-Yield</div>
              </div>
            </div>

            {/* Golden Exam Directives */}
            <div className="rounded-2xl border border-amber-500/30 print:border-amber-400 bg-amber-950/20 print:bg-amber-50 p-4 space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-amber-300 print:text-amber-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 print:text-amber-700" />
                <span>Golden Cambridge Exam Directives</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 print:text-slate-800">
                {sheet.criticalRules.map((rule: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-400 print:text-amber-700 shrink-0">•</span>
                    <span className="leading-relaxed"><MathRenderer content={rule} /></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sheet.sections.map((section: CheatSheetSection, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 print:border-slate-300 bg-slate-900/60 print:bg-slate-50 p-4 space-y-2.5"
                >
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1.5">
                    {section.title}
                  </h4>
                  <div className="space-y-2.5">
                    {section.items.map((item: CheatSheetItem, iIdx: number) => (
                      <div key={iIdx} className="space-y-1 text-xs">
                        <div className="font-bold text-slate-200 print:text-slate-900">{item.label}</div>
                        {item.formula && (
                          <div className="font-mono text-indigo-300 print:text-indigo-900 bg-slate-950/70 print:bg-slate-100 p-2 rounded-xl text-center">
                            <MathRenderer content={item.formula} />
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 print:text-slate-700 leading-relaxed">
                          <MathRenderer content={item.notes} />
                        </div>
                        {item.warning && (
                          <div className="text-[10px] text-rose-400 print:text-rose-700 font-semibold flex items-start gap-1 bg-rose-950/20 print:bg-rose-50 p-1.5 rounded-lg border border-rose-500/20">
                            <span className="shrink-0">⚠️</span>
                            <span>{item.warning}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= PAGE 2: PERSONAL ERROR REMATCH NOTEBOOK ================= */}
          <div className="print-page bg-[#0d121f] print:bg-white text-slate-100 print:text-black rounded-3xl print:rounded-none border border-slate-800 print:border-none p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b-2 border-rose-500/40 pb-4">
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-rose-400 print:text-rose-700">
                  Simply IGCSE • Personal Diagnostic Error Log • Section 2
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight mt-1">
                  The Mistake Black Book — Unmastered Questions ({unmasteredMistakes.length})
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Targeted review of past paper slips before entering the exam room.
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-rose-500/20 print:bg-rose-100 px-2.5 py-1 text-xs font-mono font-black text-rose-300 print:text-rose-800 border border-rose-500/30">
                  Page 2 of 3
                </span>
              </div>
            </div>

            {unmasteredMistakes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 print:text-slate-600 border border-slate-800 rounded-2xl">
                ✓ No unmastered errors logged for {selectedSubject.code}! All past paper mistakes are mastered.
              </div>
            ) : (
              <div className="space-y-4">
                {unmasteredMistakes.map((mistake, idx) => (
                  <div
                    key={mistake.id}
                    className="rounded-2xl border border-slate-800 print:border-slate-300 bg-slate-900/60 print:bg-slate-50 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white print:text-black">
                        #{idx + 1}. {mistake.paperCode || selectedSubject.code} {mistake.questionNumber} • {mistake.topic}
                      </span>
                      <span className="rounded bg-rose-500/15 print:bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-300 print:text-rose-800 font-mono">
                        Lost {mistake.marksLost} / {mistake.totalMarks} Marks
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 print:text-slate-800 font-serif leading-relaxed">
                      <MathRenderer content={mistake.questionPrompt} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 print:border-slate-300">
                      <div className="rounded-xl bg-rose-950/30 print:bg-rose-50 p-2.5 border border-rose-500/20">
                        <span className="font-bold text-rose-400 print:text-rose-700 block text-[10px] uppercase">
                          My Previous Mistake:
                        </span>
                        <span className="text-slate-200 print:text-slate-800 text-[11px]">
                          {mistake.myMistakeAnswer}
                        </span>
                      </div>

                      <div className="rounded-xl bg-emerald-950/30 print:bg-emerald-50 p-2.5 border border-emerald-500/20">
                        <span className="font-bold text-emerald-400 print:text-emerald-700 block text-[10px] uppercase">
                          Mark Scheme Required Answer:
                        </span>
                        <span className="text-slate-200 print:text-slate-800 text-[11px]">
                          <MathRenderer content={mistake.markSchemeAnswer} />
                        </span>
                      </div>
                    </div>

                    {mistake.examinerTip && (
                      <div className="text-[11px] text-amber-300/90 print:text-amber-800 flex items-start gap-1">
                        <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-amber-400 print:text-amber-700" />
                        <span>{mistake.examinerTip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= PAGE 3: EXAMINER PITFALLS & FORMULAS ================= */}
          <div className="print-page bg-[#0d121f] print:bg-white text-slate-100 print:text-black rounded-3xl print:rounded-none border border-slate-800 print:border-none p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b-2 border-teal-500/40 pb-4">
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-teal-400 print:text-teal-700">
                  Simply IGCSE • Cambridge Examiner Synthesis • Section 3
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight mt-1">
                  Principal Examiner Pitfalls & Official Formulas ({selectedSubject.code})
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Synthesized from official CAIE / Pearson Examiner Reports.
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-lg bg-teal-500/20 print:bg-teal-100 px-2.5 py-1 text-xs font-mono font-black text-teal-300 print:text-teal-800 border border-teal-500/30">
                  Page 3 of 3
                </span>
              </div>
            </div>

            {/* Pitfalls List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
                Top Examiner Pitfalls & Misconceptions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjectPitfalls.map((pitfall) => (
                  <div
                    key={pitfall.id}
                    className="rounded-2xl border border-slate-800 print:border-slate-300 bg-slate-900/60 print:bg-slate-50 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white print:text-black">
                      <span>{pitfall.topic}</span>
                      <span className="text-[10px] font-mono text-rose-400 print:text-rose-700">
                        {pitfall.candidateFailureRate}
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-300 print:text-rose-800 leading-relaxed font-sans">
                      <strong>Common Slip:</strong> {pitfall.commonError}
                    </p>

                    <p className="text-[11px] text-emerald-300 print:text-emerald-800 leading-relaxed font-sans">
                      <strong>Required Method:</strong> {pitfall.correctMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulas List */}
            {formulas.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800 print:border-slate-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
                  Cambridge Formula Equations:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 print:border-slate-300 bg-slate-900/40 print:bg-slate-50 p-3 flex items-center justify-between gap-2"
                    >
                      <span className="font-bold text-slate-200 print:text-slate-800">{item.name}:</span>
                      <span className="font-serif text-indigo-300 print:text-indigo-800 font-bold">
                        <MathRenderer content={`$${item.formula}$`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
