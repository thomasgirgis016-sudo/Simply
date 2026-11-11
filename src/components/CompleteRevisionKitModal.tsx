import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  FileText,
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
      const subCodeNum = selectedSubject.code.match(/\d{4}/)?.[0] || selectedSubject.code;
      const subjectMistakes = all.filter((m) => {
        const matchSub =
          m.subjectId === selectedSubject.id ||
          m.subjectCode === selectedSubject.code ||
          m.subjectCode === subCodeNum ||
          selectedSubject.code.includes(m.subjectCode) ||
          selectedSubject.id.includes(m.subjectCode);
        return matchSub && !m.isMastered;
      });
      return subjectMistakes.length > 0 ? subjectMistakes : all.filter(m => !m.isMastered).slice(0, 3);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-5xl h-[94vh] rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl overflow-hidden">
        {/* Header (No print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5B37]/10 text-[#FF5B37] border border-[#FF5B37]/20">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                Official Formula & Data Booklet (PDF)
              </h2>
              <p className="text-[11px] text-white/50">
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
                className="appearance-none rounded-lg border border-white/[0.08] bg-[#18181b] py-1.5 pl-3 pr-8 text-xs font-medium text-white shadow-sm focus:border-[#FF5B37] focus:outline-none cursor-pointer"
              >
                {subjectList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#18181b] text-white">
                    {s.code} • {s.name.split(' ')[0]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4 PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-[#18181b] text-white/50 hover:text-white hover:bg-[#222225] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Multi-Page Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#111113]">
          {/* ================= PAGE 1: EMERGENCY 1-PAGE CHEAT SHEET ================= */}
          <div className="print-page bg-[#18181b] print:bg-white text-white/90 print:text-black rounded-xl print:rounded-none border border-white/[0.08] print:border-none p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#FF5B37] print:text-indigo-700">
                  Fahemny IGCSE • Emergency Exam Revision Kit • Section 1
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white print:text-black tracking-tight mt-1">
                  {sheet.subjectCode} — {sheet.subjectName}
                </h1>
                <p className="text-xs text-white/50 print:text-slate-600">
                  Target Candidate: {profile.name} • Target Grade: {profile.targetGrade} • Syllabus: {sheet.board} ({sheet.badge})
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-md bg-[#222225] print:bg-amber-100 px-2.5 py-1 text-xs font-mono font-medium text-white/80 print:text-amber-800 border border-white/[0.08]">
                  Page 1 of 3
                </span>
                <div className="text-[10px] text-white/40 print:text-slate-500 mt-1 font-mono">1-Page High-Yield</div>
              </div>
            </div>

            {/* Golden Exam Directives */}
            <div className="rounded-xl border border-amber-500/20 print:border-amber-400 bg-amber-500/[0.03] print:bg-amber-50 p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 print:text-amber-900 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-amber-400 print:text-amber-700" />
                <span>Golden Cambridge Exam Directives</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-200/90 print:text-slate-800">
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
                  className="rounded-xl border border-white/[0.06] print:border-slate-300 bg-[#141416] print:bg-slate-50 p-4 space-y-2.5"
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FF5B37] print:text-indigo-800 border-b border-white/[0.06] print:border-slate-300 pb-1.5">
                    {section.title}
                  </h4>
                  <div className="space-y-2.5">
                    {section.items.map((item: CheatSheetItem, iIdx: number) => (
                      <div key={iIdx} className="space-y-1 text-xs">
                        <div className="font-medium text-white/90 print:text-slate-900">{item.label}</div>
                        {item.formula && (
                          <div className="font-mono text-white/90 print:text-indigo-900 bg-[#18181b] print:bg-slate-100 p-2 rounded-lg text-center border border-white/[0.06]">
                            <MathRenderer content={item.formula} />
                          </div>
                        )}
                        <div className="text-[11px] text-white/60 print:text-slate-700 leading-relaxed font-sans">
                          <MathRenderer content={item.notes} />
                        </div>
                        {item.warning && (
                          <div className="text-[10px] text-[#e5484d] print:text-rose-700 font-medium flex items-start gap-1 bg-[#e5484d]/[0.04] print:bg-rose-50 p-1.5 rounded-md border border-[#e5484d]/20">
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
          <div className="print-page bg-[#18181b] print:bg-white text-white/90 print:text-black rounded-xl print:rounded-none border border-white/[0.08] print:border-none p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[#e5484d] print:text-rose-700">
                  Fahemny IGCSE • Personal Diagnostic Error Log • Section 2
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white print:text-black tracking-tight mt-1">
                  Personal Error & Mistake Log — Unmastered Questions ({unmasteredMistakes.length})
                </h2>
                <p className="text-xs text-white/50 print:text-slate-600">
                  Targeted review of past paper slips before entering the exam room.
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-md bg-[#e5484d]/10 print:bg-rose-100 px-2.5 py-1 text-xs font-mono font-medium text-[#e5484d] print:text-rose-800 border border-[#e5484d]/20">
                  Page 2 of 3
                </span>
              </div>
            </div>

            {unmasteredMistakes.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/50 print:text-slate-600 border border-white/[0.06] rounded-xl font-mono">
                ✓ No unmastered errors logged for {selectedSubject.code}! All past paper mistakes are mastered.
              </div>
            ) : (
              <div className="space-y-4">
                {unmasteredMistakes.map((mistake, idx) => (
                  <div
                    key={mistake.id}
                    className="rounded-xl border border-white/[0.06] print:border-slate-300 bg-[#141416] print:bg-slate-50 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white print:text-black">
                        #{idx + 1}. {mistake.paperCode || selectedSubject.code} {mistake.questionNumber} • {mistake.topic}
                      </span>
                      <span className="rounded bg-[#e5484d]/15 print:bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-[#e5484d] print:text-rose-800 font-mono tabular-nums">
                        Lost {mistake.marksLost} / {mistake.totalMarks} Marks
                      </span>
                    </div>

                    <div className="text-xs text-white/80 print:text-slate-800 leading-relaxed font-sans">
                      <MathRenderer content={mistake.questionPrompt} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.06] print:border-slate-300">
                      <div className="rounded-lg bg-[#e5484d]/[0.04] print:bg-rose-50 p-2.5 border border-[#e5484d]/20">
                        <span className="font-semibold text-[#e5484d] print:text-rose-700 block text-[10px] uppercase font-mono">
                          My Previous Mistake:
                        </span>
                        <span className="text-white/80 print:text-slate-800 text-[11px] font-sans">
                          {mistake.myMistakeAnswer}
                        </span>
                      </div>

                      <div className="rounded-lg bg-[#4cc38a]/[0.05] print:bg-emerald-50 p-2.5 border border-[#4cc38a]/20">
                        <span className="font-semibold text-[#4cc38a] print:text-emerald-700 block text-[10px] uppercase font-mono">
                          Mark Scheme Required Answer:
                        </span>
                        <span className="text-white/80 print:text-slate-800 text-[11px] font-sans">
                          <MathRenderer content={mistake.markSchemeAnswer} />
                        </span>
                      </div>
                    </div>

                    {mistake.examinerTip && (
                      <div className="text-[11px] text-amber-200/90 print:text-amber-800 flex items-start gap-1 font-sans">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400 print:text-amber-700" />
                        <span>{mistake.examinerTip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= PAGE 3: EXAMINER PITFALLS & FORMULAS ================= */}
          <div className="print-page bg-[#18181b] print:bg-white text-white/90 print:text-black rounded-xl print:rounded-none border border-white/[0.08] print:border-none p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-white/60 print:text-teal-700">
                  Fahemny IGCSE • Cambridge Examiner Synthesis • Section 3
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white print:text-black tracking-tight mt-1">
                  Principal Examiner Pitfalls & Official Formulas ({selectedSubject.code})
                </h2>
                <p className="text-xs text-white/50 print:text-slate-600">
                  Synthesized from official CAIE / Pearson Examiner Reports.
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-md bg-[#222225] print:bg-teal-100 px-2.5 py-1 text-xs font-mono font-medium text-white/80 print:text-teal-800 border border-white/[0.08]">
                  Page 3 of 3
                </span>
              </div>
            </div>

            {/* Pitfalls List */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 print:text-slate-700 font-mono">
                Top Examiner Pitfalls & Misconceptions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjectPitfalls.map((pitfall) => (
                  <div
                    key={pitfall.id}
                    className="rounded-xl border border-white/[0.06] print:border-slate-300 bg-[#141416] print:bg-slate-50 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-white print:text-black">
                      <span>{pitfall.topic}</span>
                      <span className="text-[10px] font-mono text-[#e5484d] print:text-rose-700">
                        {pitfall.candidateFailureRate}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#e5484d] print:text-rose-800 leading-relaxed font-sans">
                      <strong>Common Slip:</strong> {pitfall.commonError}
                    </p>

                    <p className="text-[11px] text-[#4cc38a] print:text-emerald-800 leading-relaxed font-sans">
                      <strong>Required Method:</strong> {pitfall.correctMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulas List */}
            {formulas.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/[0.06] print:border-slate-300">
                <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 print:text-slate-700 font-mono">
                  Cambridge Formula Equations:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/[0.06] print:border-slate-300 bg-[#141416] print:bg-slate-50 p-3 flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-white/90 print:text-slate-800">{item.name}:</span>
                      <span className="font-mono text-white print:text-indigo-800 font-semibold">
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
