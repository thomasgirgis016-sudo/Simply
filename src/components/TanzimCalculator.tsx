import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  Building2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  FileText,
  Compass,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  O_LEVEL_GRADES,
  AS_LEVEL_GRADES,
  A_LEVEL_GRADES,
  TANZIM_POPULAR_SUBJECTS,
  StudentOLevelEntry,
  StudentAdvancedEntry,
  calculateTanzimScore,
  checkFacultyEligibility,
  UNIVERSITY_BENCHMARKS,
  getOLevelGradePercentage,
  getAdvancedGradePercentage
} from '../data/tanzimData';
import { UserProfile } from '../types';

interface TanzimCalculatorProps {
  profile?: UserProfile;
}

const DEFAULT_O_LEVELS: StudentOLevelEntry[] = [
  { id: 'ol-1', subjectName: 'English (First / Second Language)', gradeCode: '9' },
  { id: 'ol-2', subjectName: 'Mathematics (0580 / 4MA1)', gradeCode: '9' },
  { id: 'ol-3', subjectName: 'Biology (0610 / 4BI1)', gradeCode: '9' },
  { id: 'ol-4', subjectName: 'Chemistry (0620 / 4CH1)', gradeCode: '8' },
  { id: 'ol-5', subjectName: 'Physics (0625 / 4PH1)', gradeCode: '8' },
  { id: 'ol-6', subjectName: 'Computer Science (0478 / 4CP0)', gradeCode: '8' },
  { id: 'ol-7', subjectName: 'Arabic (First / Second Language)', gradeCode: '7' },
  { id: 'ol-8', subjectName: 'French (0520 / 4FR1)', gradeCode: '8' },
];

export const TanzimCalculator: React.FC<TanzimCalculatorProps> = ({ profile }) => {
  const [oLevels, setOLevels] = useState<StudentOLevelEntry[]>(DEFAULT_O_LEVELS);
  const [advancedLevels, setAdvancedLevels] = useState<StudentAdvancedEntry[]>([
    { id: 'adv-1', level: 'AS', subjectName: 'Mathematics (0580 / 4MA1)', gradeCode: 'A' },
  ]);
  const [activeTab, setActiveTab] = useState<'calculator' | 'benchmarks' | 'rules'>('calculator');
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Calculation results
  const calculation = useMemo(() => {
    return calculateTanzimScore(oLevels, advancedLevels);
  }, [oLevels, advancedLevels]);

  // Faculty eligibility check
  const facultyStatus = useMemo(() => {
    return checkFacultyEligibility(oLevels, advancedLevels);
  }, [oLevels, advancedLevels]);

  // Subject update handlers
  const handleUpdateOLevel = (id: string, field: 'subjectName' | 'gradeCode', value: string) => {
    setOLevels(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddOLevel = () => {
    if (oLevels.length >= 10) return;
    const newId = `ol-${Date.now()}`;
    setOLevels(prev => [
      ...prev,
      { id: newId, subjectName: 'Business Studies (0450 / 4BS1)', gradeCode: '8' }
    ]);
  };

  const handleRemoveOLevel = (id: string) => {
    if (oLevels.length <= 8) return; // Keep minimum 8
    setOLevels(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAdvanced = (level: 'AS' | 'AL') => {
    if (advancedLevels.length >= 3) return;
    const newId = `adv-${Date.now()}`;
    setAdvancedLevels(prev => [
      ...prev,
      { id: newId, level, subjectName: level === 'AS' ? 'Biology (0610 / 4BI1)' : 'Mathematics (0580 / 4MA1)', gradeCode: 'A' }
    ]);
  };

  const handleUpdateAdvanced = (id: string, field: 'level' | 'subjectName' | 'gradeCode', value: any) => {
    setAdvancedLevels(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveAdvanced = (id: string) => {
    setAdvancedLevels(prev => prev.filter(item => item.id !== id));
  };

  const handleQuickLoadPreset = (preset: 'all-9' | 'medical' | 'engineering') => {
    if (preset === 'all-9') {
      setOLevels(prev => prev.map(item => ({ ...item, gradeCode: '9' })));
      setAdvancedLevels([{ id: 'adv-1', level: 'AL', subjectName: 'Biology (0610 / 4BI1)', gradeCode: 'A*' }]);
    } else if (preset === 'medical') {
      setOLevels([
        { id: 'ol-1', subjectName: 'English (First / Second Language)', gradeCode: '9' },
        { id: 'ol-2', subjectName: 'Mathematics (0580 / 4MA1)', gradeCode: '9' },
        { id: 'ol-3', subjectName: 'Biology (0610 / 4BI1)', gradeCode: '9' },
        { id: 'ol-4', subjectName: 'Chemistry (0620 / 4CH1)', gradeCode: '9' },
        { id: 'ol-5', subjectName: 'Physics (0625 / 4PH1)', gradeCode: '9' },
        { id: 'ol-6', subjectName: 'Arabic (First / Second Language)', gradeCode: '8' },
        { id: 'ol-7', subjectName: 'Computer Science (0478 / 4CP0)', gradeCode: '8' },
        { id: 'ol-8', subjectName: 'French (0520 / 4FR1)', gradeCode: '8' },
      ]);
      setAdvancedLevels([
        { id: 'adv-1', level: 'AL', subjectName: 'Biology (0610 / 4BI1)', gradeCode: 'A*' }
      ]);
    } else if (preset === 'engineering') {
      setOLevels([
        { id: 'ol-1', subjectName: 'English (First / Second Language)', gradeCode: '9' },
        { id: 'ol-2', subjectName: 'Mathematics (0580 / 4MA1)', gradeCode: '9' },
        { id: 'ol-3', subjectName: 'Physics (0625 / 4PH1)', gradeCode: '9' },
        { id: 'ol-4', subjectName: 'Chemistry (0620 / 4CH1)', gradeCode: '8' },
        { id: 'ol-5', subjectName: 'Computer Science (0478 / 4CP0)', gradeCode: '9' },
        { id: 'ol-6', subjectName: 'Arabic (First / Second Language)', gradeCode: '8' },
        { id: 'ol-7', subjectName: 'French (0520 / 4FR1)', gradeCode: '7' },
        { id: 'ol-8', subjectName: 'Economics (0455 / 4EC1)', gradeCode: '8' },
      ]);
      setAdvancedLevels([
        { id: 'adv-1', level: 'AL', subjectName: 'Mathematics (0580 / 4MA1)', gradeCode: 'A' },
      ]);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16 px-3 sm:px-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300">
              <GraduationCap className="h-4 w-4 text-[#FF5B37]" />
              <span>مكتب التنسيق • Egyptian Ministry of Higher Education</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
              Egyptian University Tanzim Calculator
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Calculate your official equivalence percentage for Egyptian Public, National (الأهلية), and Private universities (AUC, GUC, BUE) under the latest Tanzim decrees.
            </p>
          </div>

          {/* Quick Preset Buttons & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickLoadPreset('medical')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Medical Track
            </button>
            <button
              onClick={() => handleQuickLoadPreset('engineering')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Engineering Track
            </button>
            <button
              onClick={() => handleQuickLoadPreset('all-9')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              All 9s / A*s
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#FF5B37] text-white hover:bg-[#ff704d] transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Official Percentage */}
        <div className="rounded-xl border border-[#FF5B37]/30 bg-[#18181b] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tanzim Percentage</span>
            <Award className="h-4 w-4 text-[#FF5B37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight text-[#FF5B37]">
              {calculation.hasAdvanced ? calculation.compositePercentage : calculation.pureOLevelPercentage}%
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {calculation.hasAdvanced ? 'Composite (OL+AL)' : 'Best 8 OL'}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {calculation.honorBand}
          </p>
        </div>

        {/* Card 2: Pure 8 O-Levels Score */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Best 8 O-Levels Average</span>
            <BookOpen className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono text-zinc-100">{calculation.pureOLevelPercentage}%</span>
            <span className="text-xs text-zinc-500 font-mono">({calculation.totalOLevelPoints} / 800)</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Standard baseline for Egyptian faculties
          </p>
        </div>

        {/* Card 3: Advanced Level Points */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Advanced Supplements</span>
            <Building2 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono text-zinc-100">
              {advancedLevels.length} {advancedLevels.length === 1 ? 'Subject' : 'Subjects'}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {calculation.hasAdvanced ? `${calculation.maxCompositePoints} pts base` : 'No AL/AS'}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Mandatory for Public Medicine & Engineering
          </p>
        </div>

        {/* Card 4: Top Track Eligibility */}
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Faculty Pathways</span>
            <Compass className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {facultyStatus.map(status => (
              <span
                key={status.id}
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                  status.isEligible
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}
              >
                {status.id === 'medical' ? 'Medical' : status.id === 'engineering' ? 'Engineering' : 'Business'}: {status.isEligible ? 'OK' : 'Missing'}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Prerequisite validation
          </p>
        </div>
      </div>

      {/* 3. Main Split View: Input Form & Real-Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Subject Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Header */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#FF5B37]" />
                  <span>O-Level / IGCSE Subjects (Best 8 Counted)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official Tanzim scales: 9/A* = 100%, 8/A = 95%, 7 = 90%, 6/B = 85%, 5 = 77.5%, 4/C = 70%.
                </p>
              </div>

              {oLevels.length < 10 && (
                <button
                  onClick={handleAddOLevel}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#FF5B37]" />
                  <span>Add Subject</span>
                </button>
              )}
            </div>

            {/* Subject Rows */}
            <div className="space-y-2">
              {oLevels.map((entry, index) => {
                const gradePct = getOLevelGradePercentage(entry.gradeCode);
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 rounded-lg border border-white/[0.08] bg-[#141416] hover:border-white/[0.14] transition-colors"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-[11px] font-mono text-zinc-400">
                        {index + 1}
                      </span>
                    </div>

                    {/* Subject Selector */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={entry.subjectName}
                        onChange={(e) => handleUpdateOLevel(entry.id, 'subjectName', e.target.value)}
                        className="w-full rounded-md border border-white/[0.08] bg-[#18181b] px-3 py-1.5 text-xs text-zinc-200 focus:border-[#FF5B37]/60 focus:outline-none cursor-pointer"
                      >
                        {TANZIM_POPULAR_SUBJECTS.map(subj => (
                          <option key={subj.id} value={subj.name}>
                            [{subj.category}] {subj.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grade Selector */}
                    <div className="w-full sm:w-44 shrink-0">
                      <select
                        value={entry.gradeCode}
                        onChange={(e) => handleUpdateOLevel(entry.id, 'gradeCode', e.target.value)}
                        className="w-full rounded-md border border-white/[0.08] bg-[#18181b] px-3 py-1.5 text-xs font-mono font-medium text-zinc-200 focus:border-[#FF5B37]/60 focus:outline-none cursor-pointer"
                      >
                        {O_LEVEL_GRADES.map(grade => (
                          <option key={grade.code} value={grade.code}>
                            {grade.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Calculated Percentage Badge */}
                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {gradePct}%
                      </span>

                      {oLevels.length > 8 && (
                        <button
                          onClick={() => handleRemoveOLevel(entry.id)}
                          className="p-1 text-zinc-500 hover:text-[#e5484d] transition-colors cursor-pointer"
                          title="Remove subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Level Supplements (AS / A-Level) */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#FF5B37]" />
                  <span>Advanced Level Supplements (AS / A2)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Required for Public University Medical and Engineering tracks (AS A=95%, B=85%, C=75% | AL A*=100%, A=95%, B=85%).
                </p>
              </div>

              {advancedLevels.length < 3 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddAdvanced('AS')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-[#FF5B37]" />
                    <span>Add AS</span>
                  </button>
                  <button
                    onClick={() => handleAddAdvanced('AL')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-[#FF5B37]" />
                    <span>Add A-Level</span>
                  </button>
                </div>
              )}
            </div>

            {advancedLevels.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-lg border border-dashed border-white/[0.08] bg-[#141416] text-zinc-500 text-xs">
                No AS or A-Level subjects added. Student will be evaluated on the 8 O-Levels track (out of 100%).
              </div>
            ) : (
              <div className="space-y-2">
                {advancedLevels.map((adv) => {
                  const gradePct = getAdvancedGradePercentage(adv.level, adv.gradeCode);
                  return (
                    <div
                      key={adv.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 rounded-lg border border-white/[0.08] bg-[#141416] hover:border-white/[0.14] transition-colors"
                    >
                      {/* Level Selector */}
                      <div className="w-24 shrink-0">
                        <select
                          value={adv.level}
                          onChange={(e) => handleUpdateAdvanced(adv.id, 'level', e.target.value)}
                          className="w-full rounded-md border border-white/[0.08] bg-[#18181b] px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300 focus:outline-none cursor-pointer"
                        >
                          <option value="AS">AS-Level</option>
                          <option value="AL">A-Level (A2)</option>
                        </select>
                      </div>

                      {/* Subject Name */}
                      <div className="flex-1 min-w-0">
                        <select
                          value={adv.subjectName}
                          onChange={(e) => handleUpdateAdvanced(adv.id, 'subjectName', e.target.value)}
                          className="w-full rounded-md border border-white/[0.08] bg-[#18181b] px-3 py-1.5 text-xs text-zinc-200 focus:border-[#FF5B37]/60 focus:outline-none cursor-pointer"
                        >
                          <option value="Biology (0610 / 4BI1)">Biology (AS / AL)</option>
                          <option value="Mathematics (0580 / 4MA1)">Mathematics (AS / AL)</option>
                          <option value="Chemistry (0620 / 4CH1)">Chemistry (AS / AL)</option>
                          <option value="Physics (0625 / 4PH1)">Physics (AS / AL)</option>
                          <option value="Computer Science (0478 / 4CP0)">Computer Science (AS / AL)</option>
                          <option value="Business Studies (0450 / 4BS1)">Business Studies (AS / AL)</option>
                          <option value="Economics (0455 / 4EC1)">Economics (AS / AL)</option>
                          <option value="Arabic (First / Second Language)">Arabic (AS / AL)</option>
                        </select>
                      </div>

                      {/* Grade Selector */}
                      <div className="w-full sm:w-44 shrink-0">
                        <select
                          value={adv.gradeCode}
                          onChange={(e) => handleUpdateAdvanced(adv.id, 'gradeCode', e.target.value)}
                          className="w-full rounded-md border border-white/[0.08] bg-[#18181b] px-3 py-1.5 text-xs font-mono font-medium text-zinc-200 focus:border-[#FF5B37]/60 focus:outline-none cursor-pointer"
                        >
                          {(adv.level === 'AS' ? AS_LEVEL_GRADES : A_LEVEL_GRADES).map(grade => (
                            <option key={grade.code} value={grade.code}>
                              {grade.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Grade Percentage Badge & Delete */}
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2">
                        <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {gradePct}%
                        </span>

                        <button
                          onClick={() => handleRemoveAdvanced(adv.id)}
                          className="p-1 text-zinc-500 hover:text-[#e5484d] transition-colors cursor-pointer"
                          title="Remove advanced subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Real-time Dashboard & Faculty Checkers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Faculty Track Prerequisite Auditor */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Official Faculty Track Eligibility</span>
            </h3>

            <div className="space-y-2.5">
              {facultyStatus.map((track) => (
                <div
                  key={track.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    track.isEligible
                      ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                      : 'border-white/[0.08] bg-[#141416]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-xs sm:text-sm text-zinc-200">{track.title}</div>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                        track.isEligible
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {track.isEligible ? 'Eligible' : 'Prerequisites Missing'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">{track.description}</p>

                  {!track.isEligible && track.missingRequirements.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-rose-400 flex items-center gap-1.5 flex-wrap">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Missing subjects:</span>
                      {track.missingRequirements.map((req, i) => (
                        <span key={i} className="font-semibold underline">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* University Benchmark Matcher */}
          <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF5B37]" />
                <span>University Admission Benchmarks</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Tanzim Thresholds</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {UNIVERSITY_BENCHMARKS.map((bench, idx) => {
                const currentScore = calculation.hasAdvanced
                  ? calculation.compositePercentage
                  : calculation.pureOLevelPercentage;
                const isLikely = currentScore >= bench.minHistoricalPercentage;
                const isCompetitive = currentScore >= bench.minHistoricalPercentage - 2.5 && !isLikely;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-white/[0.08] bg-[#141416] hover:border-white/[0.14] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{bench.university}</div>
                        <div className="text-[11px] text-zinc-400">{bench.faculty}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-semibold text-zinc-200 block">
                          {bench.minHistoricalPercentage}%
                        </span>
                        <span
                          className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                            isLikely
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isCompetitive
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                          }`}
                        >
                          {isLikely ? 'Likely Match' : isCompetitive ? 'Competitive' : 'Below Cutoff'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500 line-clamp-2">
                      {bench.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Official Tanzim Regulations & FAQ */}
      <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-5 space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#FF5B37]" />
          <span>Official Egyptian Tanseeq (مكتب التنسيق) Examination Rules</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-zinc-300">
          <div className="p-3.5 rounded-lg border border-white/[0.08] bg-[#141416] space-y-1">
            <span className="font-semibold text-zinc-200 block">1. 8 O-Level Rule</span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Every candidate must submit a minimum of 8 O-Level subjects with a passing grade of Grade C / Grade 4 (70%) or above. Grade D / Grade 3 and below are strictly rejected.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-white/[0.08] bg-[#141416] space-y-1">
            <span className="font-semibold text-zinc-200 block">2. Advanced Level Supplements</span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              For Public Medicine and Engineering, candidates must supplement their 8 OLs with 1 Full A-Level or 2 AS-Levels in Biology or Mathematics with at least Grade C (75%) for AS or Grade B (85%) for AL.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-white/[0.08] bg-[#141416] space-y-1">
            <span className="font-semibold text-zinc-200 block">3. 5-Year Examination Window</span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Certificates submitted to Tanzim must have been obtained within a maximum timeframe of five consecutive academic examination sessions.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Hidden Printable Report (Triggered via window.print) */}
      <div id="tanzim-print-report" className="hidden print:block p-8 bg-white text-black space-y-6">
        <div className="border-b-2 border-black pb-4 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Egyptian Ministry of Higher Education & Tanzim</h1>
          <h2 className="text-lg font-bold">Official IGCSE Equivalence & University Evaluation Report</h2>
          <p className="text-xs text-gray-600 mt-1">Generated by Fahemny IGCSE Academic Platform • {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border border-gray-300 p-4 rounded">
          <div>
            <p><strong>Candidate Name:</strong> {profile?.name || 'IGCSE Candidate'}</p>
            <p><strong>Academic Program:</strong> Cambridge / Edexcel IGCSE</p>
            <p><strong>Honor Classification:</strong> {calculation.honorBand}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-black">
              Official Tanzim Score: {calculation.hasAdvanced ? calculation.compositePercentage : calculation.pureOLevelPercentage}%
            </p>
            <p>Best 8 OL Points: {calculation.totalOLevelPoints} / 800</p>
            {calculation.hasAdvanced && (
              <p>Composite Points: {calculation.totalCompositePoints} / {calculation.maxCompositePoints}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2 border-b border-gray-400 pb-1">Best 8 O-Level Subjects Breakdown</h3>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-1">#</th>
                <th className="py-1">Subject</th>
                <th className="py-1">Grade</th>
                <th className="py-1 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {oLevels.slice(0, 8).map((ol, idx) => (
                <tr key={ol.id} className="border-b border-gray-200">
                  <td className="py-1">{idx + 1}</td>
                  <td className="py-1">{ol.subjectName}</td>
                  <td className="py-1 font-bold">{ol.gradeCode}</td>
                  <td className="py-1 text-right">{getOLevelGradePercentage(ol.gradeCode)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {advancedLevels.length > 0 && (
          <div>
            <h3 className="font-bold text-sm mb-2 border-b border-gray-400 pb-1">Advanced Level Supplements (AS / A2)</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-1">Level</th>
                  <th className="py-1">Subject</th>
                  <th className="py-1">Grade</th>
                  <th className="py-1 text-right">Tanzim Conversion</th>
                </tr>
              </thead>
              <tbody>
                {advancedLevels.map((adv) => (
                  <tr key={adv.id} className="border-b border-gray-200">
                    <td className="py-1">{adv.level}</td>
                    <td className="py-1">{adv.subjectName}</td>
                    <td className="py-1 font-bold">{adv.gradeCode}</td>
                    <td className="py-1 text-right">{getAdvancedGradePercentage(adv.level, adv.gradeCode)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <h3 className="font-bold text-sm mb-2 border-b border-gray-400 pb-1">Faculty Track Prerequisites Status</h3>
          <ul className="text-xs space-y-1">
            {facultyStatus.map(f => (
              <li key={f.id} className="flex justify-between">
                <span>{f.title}:</span>
                <span className="font-bold">{f.isEligible ? 'ELIGIBLE' : `MISSING: ${f.missingRequirements.join(', ')}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
