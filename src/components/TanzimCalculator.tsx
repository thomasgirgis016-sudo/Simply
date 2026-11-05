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
    <div className="mx-auto max-w-7xl space-y-8 pb-16 px-3 sm:px-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
              <GraduationCap className="h-4 w-4" />
              <span>مكتب التنسيق • Egyptian Ministry of Higher Education</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Egyptian University Tanzim Calculator
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Calculate your official equivalence percentage for Egyptian Public, National (الأهلية), and Private universities (AUC, GUC, BUE) under the latest Tanzim decrees.
            </p>
          </div>

          {/* Quick Preset Buttons & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleQuickLoadPreset('medical')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              Medical Preset
            </button>
            <button
              onClick={() => handleQuickLoadPreset('engineering')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
            >
              Engineering Preset
            </button>
            <button
              onClick={() => handleQuickLoadPreset('all-9')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
            >
              All 9s / A*s
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Official Percentage */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tanzim Percentage</span>
            <Award className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {calculation.hasAdvanced ? calculation.compositePercentage : calculation.pureOLevelPercentage}%
            </span>
            <span className="text-xs font-medium text-indigo-400">
              {calculation.hasAdvanced ? 'Composite (OL+AL)' : 'Best 8 OL'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {calculation.honorBand}
          </p>
        </div>

        {/* Card 2: Pure 8 O-Levels Score */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best 8 O-Levels Average</span>
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{calculation.pureOLevelPercentage}%</span>
            <span className="text-xs text-slate-400 font-mono">({calculation.totalOLevelPoints} / 800)</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Standard baseline required for all Egyptian faculties
          </p>
        </div>

        {/* Card 3: Advanced Level Points */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Advanced Supplements</span>
            <Building2 className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {advancedLevels.length} {advancedLevels.length === 1 ? 'Subject' : 'Subjects'}
            </span>
            <span className="text-xs text-slate-400">
              {calculation.hasAdvanced ? `Total ${calculation.maxCompositePoints} pts base` : 'No AL/AS added'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Mandatory for Public Medicine & Engineering
          </p>
        </div>

        {/* Card 4: Top Track Eligibility */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Pathways</span>
            <Compass className="h-5 w-5 text-purple-400" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {facultyStatus.map(status => (
              <span
                key={status.id}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  status.isEligible
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {status.id === 'medical' ? 'Medical' : status.id === 'engineering' ? 'Engineering' : 'Business'}: {status.isEligible ? 'OK' : 'Missing'}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Automatic syllabus prerequisite verification
          </p>
        </div>
      </div>

      {/* 3. Main Split View: Input Form & Real-Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): Subject Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  <span>O-Level / IGCSE Subjects (Best 8 Counted)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select your subjects and official grades. Grades are converted using official Tanzim scales (9/A* = 100%, 8/A = 95%, 7 = 90%, 6/B = 85%, 5 = 77.5%, 4/C = 70%).
                </p>
              </div>

              {oLevels.length < 10 && (
                <button
                  onClick={handleAddOLevel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Subject</span>
                </button>
              )}
            </div>

            {/* Subject Rows */}
            <div className="space-y-2.5">
              {oLevels.map((entry, index) => {
                const gradePct = getOLevelGradePercentage(entry.gradeCode);
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-[11px] font-bold text-slate-300">
                        {index + 1}
                      </span>
                    </div>

                    {/* Subject Selector */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={entry.subjectName}
                        onChange={(e) => handleUpdateOLevel(entry.id, 'subjectName', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-amber-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {gradePct}%
                      </span>

                      {oLevels.length > 8 && (
                        <button
                          onClick={() => handleRemoveOLevel(entry.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span>Advanced Level Supplements (AS / A2)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Required for Public University Medical and Engineering tracks (AS A=95%, B=85%, C=75% | AL A*=100%, A=95%, B=85%).
                </p>
              </div>

              {advancedLevels.length < 3 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddAdvanced('AS')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add AS</span>
                  </button>
                  <button
                    onClick={() => handleAddAdvanced('AL')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add A-Level</span>
                  </button>
                </div>
              )}
            </div>

            {advancedLevels.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                No AS or A-Level subjects added. Student will be evaluated on the 8 O-Levels track (out of 100%).
              </div>
            ) : (
              <div className="space-y-2.5">
                {advancedLevels.map((adv) => {
                  const gradePct = getAdvancedGradePercentage(adv.level, adv.gradeCode);
                  return (
                    <div
                      key={adv.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition"
                    >
                      {/* Level Selector */}
                      <div className="w-24 shrink-0">
                        <select
                          value={adv.level}
                          onChange={(e) => handleUpdateAdvanced(adv.id, 'level', e.target.value)}
                          className="w-full rounded-lg border border-amber-500/40 bg-slate-900 px-2.5 py-2 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
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
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-purple-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {gradePct}%
                        </span>

                        <button
                          onClick={() => handleRemoveAdvanced(adv.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Official Faculty Track Eligibility</span>
            </h3>

            <div className="space-y-3">
              {facultyStatus.map((track) => (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-xl border transition ${
                    track.isEligible
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-white">{track.title}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        track.isEligible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {track.isEligible ? 'Eligible' : 'Prerequisites Missing'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{track.description}</p>

                  {!track.isEligible && track.missingRequirements.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-rose-300 flex items-center gap-1.5 flex-wrap">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Missing subjects:</span>
                      {track.missingRequirements.map((req, i) => (
                        <span key={i} className="font-bold underline">
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <span>University Admission Benchmarks</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Tanzim Thresholds</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {UNIVERSITY_BENCHMARKS.map((bench, idx) => {
                const currentScore = calculation.hasAdvanced
                  ? calculation.compositePercentage
                  : calculation.pureOLevelPercentage;
                const isLikely = currentScore >= bench.minHistoricalPercentage;
                const isCompetitive = currentScore >= bench.minHistoricalPercentage - 2.5 && !isLikely;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{bench.university}</div>
                        <div className="text-[11px] font-medium text-indigo-300">{bench.faculty}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black font-mono text-white block">
                          {bench.minHistoricalPercentage}%
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                            isLikely
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isCompetitive
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isLikely ? 'Likely Match' : isCompetitive ? 'Competitive' : 'Below Cutoff'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 line-clamp-2">
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-indigo-400" />
          <span>Official Egyptian Tanseeq (مكتب التنسيق) Examination Rules</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 space-y-1.5">
            <span className="font-bold text-white block">1. 8 O-Level Rule</span>
            <p className="text-slate-400 leading-relaxed">
              Every candidate must submit a minimum of 8 O-Level subjects with a passing grade of Grade C / Grade 4 (70%) or above. Grade D / Grade 3 and below are strictly rejected.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 space-y-1.5">
            <span className="font-bold text-white block">2. Advanced Level Supplements</span>
            <p className="text-slate-400 leading-relaxed">
              For Public Medicine and Engineering, candidates must supplement their 8 OLs with 1 Full A-Level or 2 AS-Levels in Biology or Mathematics with at least Grade C (75%) for AS or Grade B (85%) for AL.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 space-y-1.5">
            <span className="font-bold text-white block">3. 5-Year Examination Window</span>
            <p className="text-slate-400 leading-relaxed">
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
          <p className="text-xs text-gray-600 mt-1">Generated by Simply IGCSE Academic Platform • {new Date().toLocaleDateString()}</p>
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
