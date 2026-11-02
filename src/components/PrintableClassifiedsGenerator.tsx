import React, { useState, useMemo, useRef } from 'react';
import {
  Printer,
  Sliders,
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Layers,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  Calendar,
  Eye,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { IGCSE_SUBJECTS } from '../data/subjects';
import {
  getTaxonomyForSubject,
  getChapterById,
  ChapterTaxonomy
} from '../lib/classifieds/taxonomy';
import {
  getClassifiedQuestions,
  ClassifiedQuestion,
  ClassifiedSubPart
} from '../lib/classifieds/questionPool';
import {
  ClassifiedsConfigPanel,
  ClassifiedsConfig,
  BookletMode,
  WorkingSpaceStyle
} from './ClassifiedsConfigPanel';
import { MathRenderer } from './MathRenderer';
import { SimplyLogo } from './SimplyLogo';

interface PrintableClassifiedsGeneratorProps {
  subject: Subject;
  profile?: UserProfile;
}

export const PrintableClassifiedsGenerator: React.FC<PrintableClassifiedsGeneratorProps> = ({
  subject,
  profile,
}) => {
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'worksheet' | 'mark-scheme'>('worksheet');

  // Initial Subject Chapters
  const chapters = useMemo(() => {
    return getTaxonomyForSubject(subject.code || subject.id);
  }, [subject]);

  // Master Configuration State
  const [config, setConfig] = useState<ClassifiedsConfig>(() => ({
    subject,
    selectedChapterId: chapters[0]?.id || '0580-01',
    selectedSubtopics: [],
    selectedYears: [2021, 2022, 2023, 2024, 2025],
    selectedSeasons: ['May/June', 'Oct/Nov'],
    tier: 'Extended',
    paperComponents: ['Paper 2 (Extended / MCQ)', 'Paper 4 (Extended Theory)'],
    bookletMode: 'Mode A: Student Exam Worksheet',
    workingSpaceStyle: 'dotted',
    questionQuantity: 0, // All
    includeSyllabusChecksheet: true,
    selectedQuestionIds: []
  }));

  // Update selectedChapterId when subject prop changes
  React.useEffect(() => {
    const newTax = getTaxonomyForSubject(subject.code || subject.id);
    setConfig(prev => ({
      ...prev,
      subject,
      selectedChapterId: newTax[0]?.id || '0580-01',
      selectedSubtopics: [],
      selectedQuestionIds: []
    }));
  }, [subject]);

  const activeChapter: ChapterTaxonomy = useMemo(() => {
    const currentTax = getTaxonomyForSubject(config.subject.code || config.subject.id);
    return currentTax.find(c => c.id === config.selectedChapterId) || currentTax[0] || chapters[0];
  }, [config.subject, config.selectedChapterId, chapters]);

  // Raw questions matching filter criteria
  const rawMatchingQuestions = useMemo(() => {
    return getClassifiedQuestions({
      subjectCodeOrId: config.subject.code || config.subject.id,
      chapterIds: [config.selectedChapterId],
      subtopics: config.selectedSubtopics.length > 0 ? config.selectedSubtopics : undefined,
      years: config.selectedYears,
      seasons: config.selectedSeasons,
      tier: config.tier,
      limit: config.questionQuantity > 0 ? config.questionQuantity : undefined
    });
  }, [config.subject, config.selectedChapterId, config.selectedSubtopics, config.selectedYears, config.selectedSeasons, config.tier, config.questionQuantity]);

  // Working set of ordered questions
  const [orderedQuestions, setOrderedQuestions] = useState<ClassifiedQuestion[]>(rawMatchingQuestions);

  // Sync orderedQuestions when rawMatchingQuestions change
  React.useEffect(() => {
    setOrderedQuestions(rawMatchingQuestions);
  }, [rawMatchingQuestions]);

  // Final filtered & included questions
  const finalQuestions = useMemo(() => {
    if (config.selectedQuestionIds.length === 0) {
      return orderedQuestions;
    }
    return orderedQuestions.filter(q => config.selectedQuestionIds.includes(q.id));
  }, [orderedQuestions, config.selectedQuestionIds]);

  // Metrics
  const totalMarks = useMemo(() => {
    return finalQuestions.reduce((sum, q) => sum + q.totalMarks, 0);
  }, [finalQuestions]);

  const estimatedDurationMinutes = useMemo(() => {
    return Math.ceil(totalMarks * (activeChapter.recommendedTimePerMarkMinutes || 1.25));
  }, [totalMarks, activeChapter]);

  const durationFormatted = useMemo(() => {
    const hours = Math.floor(estimatedDurationMinutes / 60);
    const mins = estimatedDurationMinutes % 60;
    if (hours === 0) return `${mins} minutes`;
    return `${hours} hr ${mins < 10 ? '0' : ''}${mins} min`;
  }, [estimatedDurationMinutes]);

  const handlePrint = () => {
    window.print();
  };

  // Render Working Lines engine
  const renderWorkingSpace = (marks: number, style: WorkingSpaceStyle) => {
    let lineCount = 2;
    if (marks === 2) lineCount = 4;
    else if (marks >= 3 && marks <= 4) lineCount = 8;
    else if (marks >= 5 && marks <= 8) lineCount = 12;
    else if (marks > 8) lineCount = 18;

    if (style === 'blank') {
      const heightPx = marks <= 2 ? '100px' : marks <= 4 ? '180px' : '280px';
      return (
        <div
          className="w-full my-3 border border-slate-300 rounded bg-white relative print:border-slate-400"
          style={{ height: heightPx }}
        >
          <span className="absolute bottom-2 right-2 text-[9pt] text-slate-400 select-none print:text-slate-500">
            [Working area]
          </span>
        </div>
      );
    }

    if (style === 'grid') {
      const heightPx = marks <= 2 ? '120px' : marks <= 4 ? '200px' : '320px';
      return (
        <div
          className="w-full my-3 border border-slate-300 rounded bg-white relative print:border-slate-400"
          style={{
            height: heightPx,
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          <span className="absolute bottom-2 right-2 text-[9pt] text-slate-400 select-none print:text-slate-500">
            [Graph grid working space]
          </span>
        </div>
      );
    }

    const borderClass = style === 'dotted'
      ? 'border-b border-dashed border-slate-300'
      : 'border-b border-solid border-slate-300';

    return (
      <div className="w-full my-3 space-y-4">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className={`w-full h-6 ${borderClass}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          1. WEB ACTION BAR & TOOLBAR (Hidden in Print)
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md no-print">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Title & Chapter badge */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm md:text-base">
                  {config.subject.code} • {activeChapter.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeChapter.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Authentic Cambridge Classified Questions • {config.bookletMode}
              </p>
            </div>
          </div>

          {/* Center: Live Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">Questions:</span>
              <span className="font-bold text-white">{finalQuestions.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">Total Marks:</span>
              <span className="font-bold text-amber-400">{totalMarks}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hidden md:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Time:</span>
              <span className="font-bold text-emerald-400">{durationFormatted}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer"
            >
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Configure Booklet</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Booklet (PDF)</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Mode Toggle & View Selector */}
        <div className="max-w-6xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden sm:inline">Mode:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              {(['Mode A: Student Exam Worksheet', 'Mode B: Inline Revision Guide', 'Mode C: Class Timed Test'] as BookletMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setConfig(prev => ({ ...prev, bookletMode: mode }))}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition ${
                    config.bookletMode === mode
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-[11px] hidden sm:flex items-center gap-1.5">
              <span>Lines:</span>
              <select
                value={config.workingSpaceStyle}
                onChange={(e) => setConfig(prev => ({ ...prev, workingSpaceStyle: e.target.value as any }))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
              >
                <option value="dotted">Dotted (Cambridge)</option>
                <option value="solid">Solid Lines</option>
                <option value="grid">Graph Grid</option>
                <option value="blank">Blank Box</option>
              </select>
            </label>

            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                onClick={() => setViewTab('worksheet')}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition ${
                  viewTab === 'worksheet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Worksheet View
              </button>
              <button
                onClick={() => setViewTab('mark-scheme')}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition ${
                  viewTab === 'mark-scheme' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mark Scheme View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. PRINT CONTAINER & MASTER DOCUMENT (A4 Portrait Geometry)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="classified-print-container bg-white text-slate-900 shadow-2xl rounded-xl p-8 sm:p-12 print:p-0 print:shadow-none print:rounded-none">
          
          {/* Running Print Header (Printed on every page via CSS @media print) */}
          <div className="print-running-header hidden print:flex">
            <span>CAMBRIDGE INTERNATIONAL EDUCATION • {config.subject.code} {config.subject.name.toUpperCase()}</span>
            <span>TOPIC BOOKLET: {activeChapter.title.toUpperCase()}</span>
            <span>Candidate Name: .................................................</span>
          </div>

          {/* Running Print Footer (Printed on every page via CSS @media print) */}
          <div className="print-running-footer hidden print:flex">
            <span>© Simply IGCSE Classified Series 2026</span>
            <span>[Turn over]</span>
          </div>

          {/* ─────────────────────────────────────────────────────────
              PAGE 1: AUTHENTIC CAMBRIDGE COVER PAGE (.cover-page)
          ───────────────────────────────────────────────────────── */}
          <div className="cover-page mb-12 print:mb-0 print:min-h-[297mm] flex flex-col justify-between border-b-2 border-dashed border-slate-300 pb-12 print:border-none print:pb-0">
            <div>
              {/* Official Banner Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                    CAMBRIDGE INTERNATIONAL EDUCATION • TOPIC CLASSIFIED SERIES
                  </h1>
                  <p className="text-[10pt] font-semibold text-slate-600 mt-0.5">
                    Authentic Examination Papers • Graded Topical Compilation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SimplyLogo size="sm" showText={false} />
                  <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">Simply IGCSE</span>
                </div>
              </div>

              {/* Main Subject & Topic Titles */}
              <div className="mt-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                  {config.subject.name}
                </h2>
                <div className="text-sm font-bold text-slate-700 mt-1">
                  Syllabus Code: <span className="font-mono text-slate-900">{config.subject.code}</span>
                </div>

                <div className="mt-6 inline-block bg-slate-100 border border-slate-300 px-6 py-3 rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    TOPIC BOOKLET: CHAPTER {activeChapter.chapterNumber}
                  </span>
                  <span className="text-xl font-extrabold text-slate-950 block mt-1">
                    {activeChapter.title}
                  </span>
                </div>

                <div className="mt-4 text-xs font-semibold text-slate-600">
                  Compiled from Series {config.selectedYears.join(', ')} • {config.tier} Tier
                </div>
              </div>

              {/* Student Candidate Information Grid */}
              <div className="mt-10 border-2 border-slate-900 rounded-lg p-5 bg-slate-50/50 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
                      CANDIDATE NAME:
                    </span>
                    <div className="border-b border-dotted border-slate-800 flex-1 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
                      CENTRE NUMBER:
                    </span>
                    <div className="border-b border-dotted border-slate-800 flex-1 h-5" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
                      CANDIDATE NUMBER:
                    </span>
                    <div className="border-b border-dotted border-slate-800 flex-1 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
                      CLASS / GROUP:
                    </span>
                    <div className="border-b border-dotted border-slate-800 flex-1 h-5" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
                      TARGET GRADE:
                    </span>
                    <div className="w-12 h-8 border-2 border-slate-900 rounded flex items-center justify-center font-bold text-sm bg-white">
                      {profile?.targetGrade?.charAt(0) || '9'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Instructions Box */}
              <div className="mt-6 border border-slate-300 rounded-lg p-5 bg-white text-xs text-slate-700 space-y-2">
                <p className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
                  INSTRUCTIONS & EXAMINATION RULES:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Time Allowed:</strong> Approximately <strong>{durationFormatted}</strong> (calibrated at 1.25 minutes per mark).
                  </li>
                  <li>
                    Answer <strong>all</strong> questions in the spaces provided on the question paper.
                  </li>
                  <li>
                    Use black or dark blue pen. You may use an HB pencil for any diagrams or graphs.
                  </li>
                  <li>
                    {activeChapter.calculatorAllowed ? (
                      <span><strong>Calculators:</strong> Electronic calculators may be used where appropriate.</span>
                    ) : (
                      <span><strong>Calculators:</strong> Electronic calculators are <strong>not permitted</strong> for this component.</span>
                    )}
                  </li>
                  <li>
                    Give non-exact numerical answers correct to <strong>3 significant figures</strong>, or 1 decimal place for angles in degrees, unless a different degree of accuracy is specified in the question.
                  </li>
                  {activeChapter.formulaNotes.length > 0 && (
                    <li>
                      <strong>Formula Reminder:</strong> {activeChapter.formulaNotes.slice(0, 2).join(' • ')}
                    </li>
                  )}
                </ul>
              </div>

              {/* Diagnostic Scorecard Table */}
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  DIAGNOSTIC SCORECARD & MARKS AUDIT
                </p>
                <table className="w-full border-collapse border border-slate-400 text-xs text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-400">
                      <th className="border border-slate-400 p-1.5">Q #</th>
                      <th className="border border-slate-400 p-1.5">Exam Source</th>
                      <th className="border border-slate-400 p-1.5">Subtopic</th>
                      <th className="border border-slate-400 p-1.5">Max Mark</th>
                      <th className="border border-slate-400 p-1.5">Student Score</th>
                      <th className="border border-slate-400 p-1.5">Examiner Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalQuestions.slice(0, 8).map((q, idx) => (
                      <tr key={q.id} className="border-b border-slate-300">
                        <td className="border border-slate-400 p-1 font-bold">{idx + 1}</td>
                        <td className="border border-slate-400 p-1 text-[11px]">{q.source}</td>
                        <td className="border border-slate-400 p-1 text-[11px] text-slate-700">{q.subtopic}</td>
                        <td className="border border-slate-400 p-1 font-bold">{q.totalMarks}</td>
                        <td className="border border-slate-400 p-1 w-20"></td>
                        <td className="border border-slate-400 p-1 text-left w-36"></td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={3} className="border border-slate-400 p-1.5 text-right uppercase">
                        TOTAL:
                      </td>
                      <td className="border border-slate-400 p-1.5 text-slate-900 font-extrabold">
                        {totalMarks}
                      </td>
                      <td className="border border-slate-400 p-1.5"></td>
                      <td className="border border-slate-400 p-1.5 text-slate-500 text-[10px]">
                        Percentage: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; % ]
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-200 pt-3">
              This document consists of printed question pages and an official Mark Scheme appendix.
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              PAGE 2: SYLLABUS OBJECTIVES DIAGNOSTIC CHECKLIST
          ───────────────────────────────────────────────────────── */}
          {config.includeSyllabusChecksheet && (
            <div className="cover-page mb-12 print:mb-0 print:min-h-[297mm] flex flex-col justify-between border-b-2 border-dashed border-slate-300 pb-12 print:border-none print:pb-0">
              <div>
                <div className="border-b-2 border-slate-900 pb-2 mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                      PAGE 2 • SYLLABUS LEARNING OBJECTIVES DIAGNOSTIC CHECKLIST
                    </h3>
                    <p className="text-sm font-extrabold text-slate-900">
                      Unit Mastery: {activeChapter.id} • {activeChapter.title}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">[Self-Assessment]</span>
                </div>

                <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                  Before or after completing this classified booklet, assess your confidence on each official Cambridge syllabus learning objective. Rate each objective: Confident (✓), Need Practice (~), or Help Needed (✗).
                </p>

                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-400">
                      <th className="border border-slate-400 p-2 w-12 text-center">Obj #</th>
                      <th className="border border-slate-400 p-2 text-left">Cambridge Syllabus Learning Objective</th>
                      <th className="border border-slate-400 p-2 w-28 text-center">Confidence</th>
                      <th className="border border-slate-400 p-2 w-36 text-left">Revision Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChapter.learningObjectives.map((obj, i) => (
                      <tr key={i} className="border-b border-slate-300">
                        <td className="border border-slate-400 p-2 text-center font-bold">{i + 1}</td>
                        <td className="border border-slate-400 p-2 text-slate-800 leading-snug">{obj}</td>
                        <td className="border border-slate-400 p-2 text-center">
                          <div className="flex justify-center gap-2">
                            <span className="inline-block w-4 h-4 border border-slate-600 rounded" title="Confident"></span>
                            <span className="inline-block w-4 h-4 border border-slate-600 rounded" title="Need Practice"></span>
                            <span className="inline-block w-4 h-4 border border-slate-600 rounded" title="Help Needed"></span>
                          </div>
                        </td>
                        <td className="border border-slate-400 p-2 text-slate-400"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {activeChapter.formulaNotes.length > 0 && (
                  <div className="mt-8 border border-slate-300 rounded-lg p-4 bg-slate-50">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                      Key Syllabus Formulas & Reference Values:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {activeChapter.formulaNotes.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-500 border-t border-slate-200 pt-3">
                Cambridge Assessment International Education • Syllabus Alignment Audit
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              3. EXAM QUESTION PAGES (.question-block)
          ───────────────────────────────────────────────────────── */}
          {(viewTab === 'worksheet' || config.bookletMode === 'Mode B: Inline Revision Guide') && (
            <div className="space-y-10">
              {finalQuestions.map((question, qIndex) => {
                const questionNum = qIndex + 1;
                return (
                  <div
                    key={question.id}
                    className="question-block border-b border-slate-200 pb-8 last:border-none print:border-none"
                  >
                    {/* Question Header */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-base text-slate-950 font-serif">
                          {questionNum}
                        </span>
                        <span className="text-[10pt] text-slate-500 font-mono">
                          [{question.source}]
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900">
                          [Total: {question.totalMarks}]
                        </span>
                      </div>
                    </div>

                    {/* Mode C Score Header Bar */}
                    {config.bookletMode === 'Mode C: Class Timed Test' && (
                      <div className="mb-3 px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs flex justify-between items-center text-slate-700">
                        <span>Candidate Marks: __________________ / {question.totalMarks}</span>
                        <span className="text-[10px] text-slate-500">Teacher Initials: [ &nbsp;&nbsp;&nbsp;&nbsp; ]</span>
                      </div>
                    )}

                    {/* Main Prompt */}
                    {question.prompt && (
                      <div className="text-[10.5pt] leading-relaxed text-slate-900 mb-4">
                        <MathRenderer content={question.prompt} />
                      </div>
                    )}

                    {/* Diagram or KaTeX Formula */}
                    {question.diagramOrMath && (
                      <div className="question-diagram my-4 p-3 border border-slate-200 rounded-lg bg-slate-50 text-center">
                        <MathRenderer content={`$$${question.diagramOrMath}$$`} />
                      </div>
                    )}

                    {/* Subparts */}
                    <div className="space-y-6 mt-4">
                      {question.subParts.map((sub, sIdx) => {
                        return (
                          <div key={sIdx} className="pl-4 border-l-2 border-slate-200">
                            {/* Subpart prompt & marks */}
                            <div className="flex items-baseline justify-between gap-4">
                              <div className="text-[10.5pt] text-slate-900 flex-1">
                                <span className="font-bold mr-2">{sub.part}</span>
                                <MathRenderer content={sub.prompt} />
                              </div>
                              <span className="font-bold text-[10.5pt] text-slate-900 shrink-0">
                                [{sub.marks}]
                              </span>
                            </div>

                            {/* Working Lines (Modes A & C) */}
                            {config.bookletMode !== 'Mode B: Inline Revision Guide' && (
                              <div className="mt-2">
                                {renderWorkingSpace(sub.marks, config.workingSpaceStyle)}
                                <div className="mt-2 flex items-baseline justify-end gap-2 text-xs text-slate-700">
                                  <span className="font-bold">Answer:</span>
                                  <div className="w-64 border-b border-dotted border-slate-800 h-4" />
                                </div>
                              </div>
                            )}

                            {/* Mode B: Inline Revision Guide Mark Scheme Box */}
                            {config.bookletMode === 'Mode B: Inline Revision Guide' && (
                              <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-300 rounded-lg text-xs text-slate-800 space-y-2">
                                <div className="flex items-center justify-between font-bold text-amber-900 border-b border-amber-200 pb-1">
                                  <span>Official Mark Scheme Criteria [{sub.part}]</span>
                                  <span>Answer: {sub.finalAnswer}</span>
                                </div>
                                <div className="space-y-1">
                                  {sub.markScheme.map((ms, msIdx) => (
                                    <div key={msIdx} className="flex items-start gap-2">
                                      <span className="font-mono font-bold text-amber-800 shrink-0">
                                        {ms.markType}
                                      </span>
                                      <span className="flex-1">
                                        <MathRenderer content={ms.requirement} />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {sub.markScheme.some(m => m.guidance) && (
                                  <div className="mt-1 pt-1 border-t border-amber-200/60 text-[11px] text-amber-800 italic">
                                    Examiner Note: {sub.markScheme.find(m => m.guidance)?.guidance}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              4. MARK SCHEME APPENDIX (.mark-scheme-section)
              Mode A: Printed at the back (page-break-before: always)
              Mode C: Teacher Answer Key
          ───────────────────────────────────────────────────────── */}
          {(viewTab === 'mark-scheme' || config.bookletMode === 'Mode A: Student Exam Worksheet' || config.bookletMode === 'Mode C: Class Timed Test') && (
            <div className="mark-scheme-section mt-12 pt-8 border-t-2 border-slate-900 print:mt-0 print:pt-0">
              <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                    CAMBRIDGE ASSESSMENT INTERNATIONAL EDUCATION
                  </h3>
                  <h4 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">
                    OFFICIAL EXAMINER MARK SCHEME & MARKING CRITERIA
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {config.subject.code} • {activeChapter.id} {activeChapter.title} • Series {config.selectedYears.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-900 text-white uppercase tracking-wider">
                    {config.bookletMode === 'Mode C: Class Timed Test' ? 'Teacher Master Key' : 'Candidate Appendix'}
                  </span>
                </div>
              </div>

              {/* Cambridge Mark Guidance Banner */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700 mb-6 space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  TYPES OF MARKS AWARDED:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <strong>M marks:</strong> Method marks, awarded for valid working even if calculation errors occur.
                  </div>
                  <div>
                    <strong>A marks:</strong> Accuracy marks, awarded for correct final answers (3 s.f. strictly enforced).
                  </div>
                  <div>
                    <strong>B marks:</strong> Independent marks, awarded for key terms, definitions, or correct units.
                  </div>
                </div>
              </div>

              {/* Mark Scheme Table */}
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-400">
                    <th className="border border-slate-400 p-2 w-16 text-center">Question</th>
                    <th className="border border-slate-400 p-2 text-left">Acceptable Answer & Scheme Criteria</th>
                    <th className="border border-slate-400 p-2 w-20 text-center">Marks</th>
                    <th className="border border-slate-400 p-2 w-48 text-left">Guidance & Examiner Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {finalQuestions.map((q, qIdx) => {
                    const qNum = qIdx + 1;
                    return q.subParts.map((sub, sIdx) => (
                      <tr key={`${q.id}-${sIdx}`} className="border-b border-slate-300">
                        <td className="border border-slate-400 p-2 text-center font-bold">
                          {qNum}{sub.part}
                        </td>
                        <td className="border border-slate-400 p-2 text-slate-800">
                          <div className="font-bold text-slate-950 mb-1">
                            Final Answer: <MathRenderer content={sub.finalAnswer} />
                          </div>
                          <div className="space-y-1">
                            {sub.markScheme.map((ms, mIdx) => (
                              <div key={mIdx} className="flex items-start gap-1.5 text-[11px]">
                                <span className="font-mono font-bold text-indigo-700 shrink-0">
                                  {ms.markType}
                                </span>
                                <span>
                                  <MathRenderer content={ms.requirement} />
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="border border-slate-400 p-2 text-center font-bold text-slate-900">
                          {sub.marks}
                        </td>
                        <td className="border border-slate-400 p-2 text-slate-600 text-[11px] leading-snug">
                          {sub.markScheme.find(m => m.guidance)?.guidance ||
                            q.examinerReportNotes[0] ||
                            'Award method marks for clear working steps.'}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>

              <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-200 pt-3">
                End of Mark Scheme • Confidential Examiner Resource
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. CONFIGURATION DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      <ClassifiedsConfigPanel
        config={config}
        onChangeConfig={setConfig}
        availableQuestions={orderedQuestions}
        onReorderQuestions={setOrderedQuestions}
        isOpen={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
        onTriggerPrint={handlePrint}
      />
    </div>
  );
};
