import React, { useState } from 'react';
import {
  Calculator,
  Award,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface GradeBoundaryThreshold {
  grade9: number; // or A*
  grade8: number;
  grade7: number; // A
  grade6: number; // B
  grade5: number; // C
  grade4: number; // D
  grade3: number; // E
  totalMax: number;
}

const HISTORIC_BOUNDARIES: Record<string, GradeBoundaryThreshold> = {
  // Cambridge IGCSE Extended (Paper 2 + Paper 4 + Paper 6 / Total 200 marks)
  'cie-math-0580': {
    totalMax: 200,
    grade9: 172,
    grade8: 154,
    grade7: 136,
    grade6: 114,
    grade5: 92,
    grade4: 70,
    grade3: 48,
  },
  'edx-math-4ma1': {
    totalMax: 200,
    grade9: 168,
    grade8: 148,
    grade7: 128,
    grade6: 106,
    grade5: 84,
    grade4: 62,
    grade3: 40,
  },
  'cie-physics-0625': {
    totalMax: 200,
    grade9: 152,
    grade8: 135,
    grade7: 118,
    grade6: 101,
    grade5: 84,
    grade4: 67,
    grade3: 50,
  },
  'edx-physics-4ph1': {
    totalMax: 180,
    grade9: 141,
    grade8: 124,
    grade7: 107,
    grade6: 91,
    grade5: 75,
    grade4: 59,
    grade3: 43,
  },
  'cie-chem-0620': {
    totalMax: 200,
    grade9: 158,
    grade8: 140,
    grade7: 122,
    grade6: 104,
    grade5: 86,
    grade4: 68,
    grade3: 50,
  },
  'edx-chem-4ch1': {
    totalMax: 180,
    grade9: 144,
    grade8: 126,
    grade7: 108,
    grade6: 92,
    grade5: 76,
    grade4: 60,
    grade3: 44,
  },
  'cie-bio-0610': {
    totalMax: 200,
    grade9: 161,
    grade8: 144,
    grade7: 127,
    grade6: 110,
    grade5: 93,
    grade4: 76,
    grade3: 59,
  },
  'cie-esl-0510': {
    totalMax: 150,
    grade9: 128,
    grade8: 116,
    grade7: 104,
    grade6: 91,
    grade5: 78,
    grade4: 65,
    grade3: 52,
  },
  'cie-econ-0455': {
    totalMax: 150,
    grade9: 122,
    grade8: 110,
    grade7: 98,
    grade6: 86,
    grade5: 74,
    grade4: 62,
    grade3: 50,
  },
  'cie-cs-0478': {
    totalMax: 150,
    grade9: 118,
    grade8: 104,
    grade7: 90,
    grade6: 76,
    grade5: 62,
    grade4: 48,
    grade3: 34,
  },
  'cie-history-0470': {
    totalMax: 140,
    grade9: 108,
    grade8: 97,
    grade7: 86,
    grade6: 74,
    grade5: 62,
    grade4: 50,
    grade3: 38,
  },
};

const DEFAULT_THRESHOLD: GradeBoundaryThreshold = {
  totalMax: 200,
  grade9: 165,
  grade8: 145,
  grade7: 125,
  grade6: 105,
  grade5: 85,
  grade4: 65,
  grade3: 45,
};

interface GradeBoundariesCalculatorProps {
  activeSubject: Subject;
  profile: UserProfile;
}

export const GradeBoundariesCalculator: React.FC<GradeBoundariesCalculatorProps> = ({
  activeSubject,
  profile,
}) => {
  const [paper2Mark, setPaper2Mark] = useState<number>(58);
  const [paper4Mark, setPaper4Mark] = useState<number>(104);
  const [paper6Mark, setPaper6Mark] = useState<number>(32);
  const [selectedSeries, setSelectedSeries] = useState<string>('June 2024 Exam Series');

  const boundary = HISTORIC_BOUNDARIES[activeSubject.id] || DEFAULT_THRESHOLD;
  const isScienceOrMaths = boundary.totalMax === 200;

  const totalRaw = isScienceOrMaths
    ? Math.min(200, (Number(paper2Mark) || 0) + (Number(paper4Mark) || 0) + (Number(paper6Mark) || 0))
    : Math.min(boundary.totalMax, (Number(paper2Mark) || 0) + (Number(paper4Mark) || 0));

  const percentage = Math.round((totalRaw / boundary.totalMax) * 100);

  // Compute Grade
  let calculatedGrade = 'Ungraded (U)';
  let gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  let nextGradeMsg = '';

  if (totalRaw >= boundary.grade9) {
    calculatedGrade = 'Grade 9 (Highest Distinction / A**)';
    gradeColor = 'text-amber-300 bg-amber-500/15 border-amber-500/30';
    nextGradeMsg = `🎉 Outstanding! You are ${totalRaw - boundary.grade9} marks above the Grade 9 threshold!`;
  } else if (totalRaw >= boundary.grade8) {
    calculatedGrade = 'Grade 8 (High A*)';
    gradeColor = 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
    nextGradeMsg = `Only ${boundary.grade9 - totalRaw} marks needed to reach Grade 9!`;
  } else if (totalRaw >= boundary.grade7) {
    calculatedGrade = 'Grade 7 (Grade A)';
    gradeColor = 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';
    nextGradeMsg = `${boundary.grade8 - totalRaw} marks needed to reach Grade 8.`;
  } else if (totalRaw >= boundary.grade6) {
    calculatedGrade = 'Grade 6 (High Grade B)';
    gradeColor = 'text-blue-300 bg-blue-500/15 border-blue-500/30';
    nextGradeMsg = `${boundary.grade7 - totalRaw} marks needed to reach Grade 7 (Grade A).`;
  } else if (totalRaw >= boundary.grade5) {
    calculatedGrade = 'Grade 5 (Strong Pass / Grade C)';
    gradeColor = 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30';
    nextGradeMsg = `${boundary.grade6 - totalRaw} marks needed to reach Grade 6.`;
  } else if (totalRaw >= boundary.grade4) {
    calculatedGrade = 'Grade 4 (Standard Pass / Grade D)';
    gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    nextGradeMsg = `${boundary.grade5 - totalRaw} marks needed to reach Grade 5.`;
  } else if (totalRaw >= boundary.grade3) {
    calculatedGrade = 'Grade 3 (Grade E)';
    gradeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    nextGradeMsg = `${boundary.grade4 - totalRaw} marks needed to reach Grade 4.`;
  } else {
    calculatedGrade = 'Ungraded / Below Threshold';
    gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    nextGradeMsg = `${boundary.grade4 - totalRaw} marks needed to reach Pass boundary (Grade 4).`;
  }

  const handleReset = () => {
    setPaper2Mark(50);
    setPaper4Mark(95);
    setPaper6Mark(28);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20 mb-2">
              <Calculator className="h-3.5 w-3.5" />
              <span>Official Threshold Modeling</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              IGCSE Grade Boundaries Calculator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Calculate your estimated overall IGCSE grade for <span className="font-bold text-amber-300">{activeSubject.name} ({activeSubject.code})</span> based on official Cambridge (CIE) & Pearson Edexcel published thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="June 2024 Exam Series">June 2024 Series (Latest)</option>
              <option value="November 2023 Exam Series">November 2023 Series</option>
              <option value="June 2023 Exam Series">June 2023 Series</option>
            </select>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white transition"
              title="Reset raw marks"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mark Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Input Your Raw Component Marks</span>
              <span className="text-xs font-normal text-slate-400">Total Scale: {boundary.totalMax} Marks</span>
            </h3>

            {/* Paper 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">
                  Paper 2 (Multiple Choice / Core Theory)
                </label>
                <span className="font-mono font-bold text-indigo-400">{paper2Mark} / 40 or 70</span>
              </div>
              <input
                type="range"
                min="0"
                max={isScienceOrMaths ? "70" : "60"}
                value={paper2Mark}
                onChange={(e) => setPaper2Mark(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 marks</span>
                <span>Enter exact raw score</span>
                <span>Max {isScienceOrMaths ? '70' : '60'}</span>
              </div>
            </div>

            {/* Paper 4 */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">
                  Paper 4 (Extended Theory / Long-Answer Structured)
                </label>
                <span className="font-mono font-bold text-purple-400">{paper4Mark} / {isScienceOrMaths ? '130' : '90'}</span>
              </div>
              <input
                type="range"
                min="0"
                max={isScienceOrMaths ? "130" : "90"}
                value={paper4Mark}
                onChange={(e) => setPaper4Mark(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 marks</span>
                <span>Structured working marks</span>
                <span>Max {isScienceOrMaths ? '130' : '90'}</span>
              </div>
            </div>

            {/* Paper 6 (Sciences / Alternative to Practical) */}
            {isScienceOrMaths && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">
                    Paper 6 (Alternative to Practical / Coursework)
                  </label>
                  <span className="font-mono font-bold text-cyan-400">{paper6Mark} / 40</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={paper6Mark}
                  onChange={(e) => setPaper6Mark(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 marks</span>
                  <span>Practical methods & graphs</span>
                  <span>Max 40</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Combined Raw Score:</span>
              <span className="text-sm font-bold text-white font-mono">{totalRaw} / {boundary.totalMax} ({percentage}%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Estimated Grade & Threshold Gauge */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-lg backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calculated Examination Result
              </span>
              <span className="text-xs text-slate-500">{selectedSeries}</span>
            </div>

            {/* Main Result Card */}
            <div className={`rounded-2xl border p-5 text-center shadow-lg transition-all ${gradeColor}`}>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/40 px-3 py-1 text-xs font-semibold mb-2">
                <Award className="h-4 w-4" />
                <span>Estimated IGCSE Grade</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{calculatedGrade}</h2>
              <p className="text-xs font-medium mt-2 leading-relaxed opacity-95">{nextGradeMsg}</p>
            </div>

            {/* Threshold Cutoff Reference Table */}
            <div className="border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                Published Threshold Cutoffs ({activeSubject.code}):
              </h4>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center text-xs">
                {[
                  { grade: 'Grade 9', mark: boundary.grade9, pct: Math.round((boundary.grade9 / boundary.totalMax) * 100) },
                  { grade: 'Grade 8', mark: boundary.grade8, pct: Math.round((boundary.grade8 / boundary.totalMax) * 100) },
                  { grade: 'Grade 7', mark: boundary.grade7, pct: Math.round((boundary.grade7 / boundary.totalMax) * 100) },
                  { grade: 'Grade 6', mark: boundary.grade6, pct: Math.round((boundary.grade6 / boundary.totalMax) * 100) },
                  { grade: 'Grade 5', mark: boundary.grade5, pct: Math.round((boundary.grade5 / boundary.totalMax) * 100) },
                  { grade: 'Grade 4', mark: boundary.grade4, pct: Math.round((boundary.grade4 / boundary.totalMax) * 100) },
                  { grade: 'Grade 3', mark: boundary.grade3, pct: Math.round((boundary.grade3 / boundary.totalMax) * 100) },
                ].map((item, idx) => {
                  const isCurrent = totalRaw >= item.mark && (idx === 0 || totalRaw < [boundary.grade9, boundary.grade8, boundary.grade7, boundary.grade6, boundary.grade5, boundary.grade4, boundary.grade3][idx - 1]);
                  return (
                    <div
                      key={item.grade}
                      className={`rounded-xl p-2 border transition ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-500/20 text-white font-bold ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] font-bold">{item.grade}</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">{item.mark}</div>
                      <div className="text-[9px] text-slate-500">{item.pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-300">Examiner Note:</span> Official Cambridge and Edexcel grade thresholds vary slightly between exam variants (e.g. Variant 1, 2, or 3) depending on national cohort difficulty. Always aim 5 to 8 marks above the boundary to guarantee your target grade.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
