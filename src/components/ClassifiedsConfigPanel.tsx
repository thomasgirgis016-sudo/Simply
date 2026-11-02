import React, { useState, useMemo } from 'react';
import {
  Sliders,
  BookOpen,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Settings2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  X,
  Printer,
  HelpCircle,
  Clock,
  Eye
} from 'lucide-react';
import { Subject } from '../types';
import { IGCSE_SUBJECTS } from '../data/subjects';
import { getTaxonomyForSubject, ChapterTaxonomy } from '../lib/classifieds/taxonomy';
import { ClassifiedQuestion } from '../lib/classifieds/questionPool';

export type BookletMode = 'Mode A: Student Exam Worksheet' | 'Mode B: Inline Revision Guide' | 'Mode C: Class Timed Test';
export type WorkingSpaceStyle = 'dotted' | 'solid' | 'grid' | 'blank';

export interface ClassifiedsConfig {
  subject: Subject;
  selectedChapterId: string;
  selectedSubtopics: string[];
  selectedYears: number[];
  selectedSeasons: ('May/June' | 'Oct/Nov' | 'Feb/March')[];
  tier: 'Core' | 'Extended' | 'Both';
  paperComponents: string[];
  bookletMode: BookletMode;
  workingSpaceStyle: WorkingSpaceStyle;
  questionQuantity: number; // 0 means All Available
  includeSyllabusChecksheet: boolean;
  selectedQuestionIds: string[];
}

interface ClassifiedsConfigPanelProps {
  config: ClassifiedsConfig;
  onChangeConfig: (updater: (prev: ClassifiedsConfig) => ClassifiedsConfig) => void;
  availableQuestions: ClassifiedQuestion[];
  onReorderQuestions?: (newQuestions: ClassifiedQuestion[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onTriggerPrint: () => void;
}

export const ClassifiedsConfigPanel: React.FC<ClassifiedsConfigPanelProps> = ({
  config,
  onChangeConfig,
  availableQuestions,
  onReorderQuestions,
  isOpen,
  onClose,
  onTriggerPrint,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  const chapters: ChapterTaxonomy[] = useMemo(() => {
    return getTaxonomyForSubject(config.subject.code || config.subject.id);
  }, [config.subject]);

  const activeChapter: ChapterTaxonomy = useMemo(() => {
    return chapters.find(c => c.id === config.selectedChapterId) || chapters[0] || {
      id: '0580-01',
      chapterNumber: 1,
      title: 'Number',
      subjectCode: '0580',
      subjectName: 'Mathematics',
      subtopics: [],
      learningObjectives: [],
      calculatorAllowed: true,
      formulaNotes: [],
      tier: 'Both',
      recommendedTimePerMarkMinutes: 1.25
    };
  }, [chapters, config.selectedChapterId]);

  // Step 2 Available Years
  const ALL_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const ALL_SEASONS: ('May/June' | 'Oct/Nov' | 'Feb/March')[] = ['May/June', 'Oct/Nov', 'Feb/March'];
  const ALL_COMPONENTS = ['Paper 1 (Core)', 'Paper 2 (Extended / MCQ)', 'Paper 4 (Extended Theory)', 'Paper 6 (ATP / Practical)'];

  const toggleYear = (yr: number) => {
    onChangeConfig(prev => {
      const exists = prev.selectedYears.includes(yr);
      const next = exists ? prev.selectedYears.filter(y => y !== yr) : [...prev.selectedYears, yr];
      return { ...prev, selectedYears: next.length > 0 ? next : [2023] };
    });
  };

  const toggleSeason = (season: 'May/June' | 'Oct/Nov' | 'Feb/March') => {
    onChangeConfig(prev => {
      const exists = prev.selectedSeasons.includes(season);
      const next = exists ? prev.selectedSeasons.filter(s => s !== season) : [...prev.selectedSeasons, season];
      return { ...prev, selectedSeasons: next.length > 0 ? next : ['May/June'] };
    });
  };

  const toggleSubtopic = (subtopic: string) => {
    onChangeConfig(prev => {
      const exists = prev.selectedSubtopics.includes(subtopic);
      const next = exists ? prev.selectedSubtopics.filter(s => s !== subtopic) : [...prev.selectedSubtopics, subtopic];
      return { ...prev, selectedSubtopics: next };
    });
  };

  const toggleQuestionSelection = (qId: string) => {
    onChangeConfig(prev => {
      const exists = prev.selectedQuestionIds.includes(qId);
      const next = exists ? prev.selectedQuestionIds.filter(id => id !== qId) : [...prev.selectedQuestionIds, qId];
      return { ...prev, selectedQuestionIds: next };
    });
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (!onReorderQuestions) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= availableQuestions.length) return;
    const copy = [...availableQuestions];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onReorderQuestions(copy);
  };

  const sortQuestions = (order: 'easy' | 'hard' | 'year') => {
    if (!onReorderQuestions) return;
    const copy = [...availableQuestions];
    if (order === 'easy') {
      copy.sort((a, b) => a.totalMarks - b.totalMarks);
    } else if (order === 'hard') {
      copy.sort((a, b) => b.totalMarks - a.totalMarks);
    } else {
      copy.sort((a, b) => b.year - a.year);
    }
    onReorderQuestions(copy);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm transition-opacity no-print">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Topic Classifieds Builder
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    CAIE Print Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Configure layout, exam series, marking scheme & typography</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Navigation Bar */}
          <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs">
            {[
              { num: 1, label: 'Scope' },
              { num: 2, label: 'Series & Tier' },
              { num: 3, label: 'Layout & Mode' },
              { num: 4, label: 'Questions' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num as any)}
                className={`py-3 px-2 text-center font-semibold transition border-b-2 flex flex-col items-center gap-1 ${
                  activeStep === step.num
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                  activeStep === step.num ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.num}
                </span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 1: SCOPE & TARGET */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    1. Cambridge IGCSE Syllabus Subject
                  </label>
                  <select
                    value={config.subject.id}
                    onChange={(e) => {
                      const found = IGCSE_SUBJECTS.find(s => s.id === e.target.value);
                      if (found) {
                        const newTax = getTaxonomyForSubject(found.code || found.id);
                        onChangeConfig(prev => ({
                          ...prev,
                          subject: found,
                          selectedChapterId: newTax[0]?.id || '0580-01',
                          selectedSubtopics: []
                        }));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    {IGCSE_SUBJECTS.filter(s => ['0580', '0620', '0625', '0610', '0510', '0511'].some(c => s.code.includes(c))).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} • {s.name} ({s.board})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    2. Syllabus Chapter ({chapters.length} Official Units)
                  </label>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {chapters.map((ch) => {
                      const isSelected = ch.id === config.selectedChapterId;
                      return (
                        <div
                          key={ch.id}
                          onClick={() => {
                            onChangeConfig(prev => ({
                              ...prev,
                              selectedChapterId: ch.id,
                              selectedSubtopics: []
                            }));
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ch.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{ch.title}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {ch.subtopics.slice(0, 3).join(', ')}...
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeChapter.subtopics.length > 0 && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      3. Sub-Topic Refinement (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeChapter.subtopics.map(sub => {
                        const isSubActive = config.selectedSubtopics.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubtopic(sub)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                              isSubActive
                                ? 'bg-indigo-500 border-indigo-400 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PAPER SERIES & DIFFICULTY */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    1. Examination Year Range (2019 – 2025)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_YEARS.map(yr => {
                      const isSel = config.selectedYears.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleYear(yr)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    2. Exam Seasons
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_SEASONS.map(season => {
                      const isSel = config.selectedSeasons.includes(season);
                      return (
                        <button
                          key={season}
                          type="button"
                          onClick={() => toggleSeason(season)}
                          className={`p-3 rounded-xl text-xs font-bold border text-center transition ${
                            isSel
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {season}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    3. Candidate Target Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Extended', 'Core', 'Both'] as const).map(tier => {
                      const isSel = config.tier === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => onChangeConfig(prev => ({ ...prev, tier }))}
                          className={`p-3 rounded-xl text-xs font-bold border text-center transition ${
                            isSel
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tier === 'Extended' ? 'Extended (A* - E)' : tier === 'Core' ? 'Core (C - G)' : 'All Tiers'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    4. Paper Component Selection
                  </label>
                  <div className="space-y-2">
                    {ALL_COMPONENTS.map(comp => {
                      const isChecked = config.paperComponents.includes(comp);
                      return (
                        <label
                          key={comp}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              onChangeConfig(prev => {
                                const exists = prev.paperComponents.includes(comp);
                                const next = exists
                                  ? prev.paperComponents.filter(c => c !== comp)
                                  : [...prev.paperComponents, comp];
                                return { ...prev, paperComponents: next };
                              });
                            }}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{comp}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OUTPUT MODE & LAYOUT */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    1. Booklet Output Mode (3 Choices)
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        mode: 'Mode A: Student Exam Worksheet' as BookletMode,
                        title: 'Mode A: Student Exam Worksheet',
                        desc: 'Official Cambridge layout with blank working lines. Complete Mark Scheme compiled in the back appendix.',
                        tag: 'Most Popular for Exam Practice'
                      },
                      {
                        mode: 'Mode B: Inline Revision Guide' as BookletMode,
                        title: 'Mode B: Inline Revision Guide',
                        desc: 'Each question is immediately followed by its official Examiner Mark Scheme and Pitfall alerts in an answer box.',
                        tag: 'Self-Study & Revision'
                      },
                      {
                        mode: 'Mode C: Class Timed Test' as BookletMode,
                        title: 'Mode C: Class Timed Test',
                        desc: 'Clean exam question sheets with student score header box. Mark Scheme generated as a separate teacher answer key.',
                        tag: 'Classroom & Homework Tests'
                      }
                    ].map(item => {
                      const isSel = config.bookletMode === item.mode;
                      return (
                        <div
                          key={item.mode}
                          onClick={() => onChangeConfig(prev => ({ ...prev, bookletMode: item.mode }))}
                          className={`p-4 rounded-xl border cursor-pointer transition text-left ${
                            isSel
                              ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white">{item.title}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    2. Working Space Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'dotted' as WorkingSpaceStyle, label: 'Dotted Ruled Lines', desc: 'Authentic Cambridge style with light dots' },
                      { id: 'solid' as WorkingSpaceStyle, label: 'Solid Ruled Lines', desc: 'Standard notebook style lines' },
                      { id: 'grid' as WorkingSpaceStyle, label: 'Graph Grid', desc: 'Grid lines for maths & graph plots' },
                      { id: 'blank' as WorkingSpaceStyle, label: 'Clean Blank Box', desc: 'Minimalist framed box for calculations' },
                    ].map(style => {
                      const isSel = config.workingSpaceStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => onChangeConfig(prev => ({ ...prev, workingSpaceStyle: style.id }))}
                          className={`p-3 rounded-xl border text-left transition ${
                            isSel
                              ? 'bg-indigo-600/15 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block text-white">{style.label}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{style.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      3. Question Quantity Limit
                    </label>
                    <span className="text-xs font-bold text-indigo-400">
                      {config.questionQuantity === 0 ? 'All Available' : `${config.questionQuantity} Questions`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[10, 20, 30, 0].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => onChangeConfig(prev => ({ ...prev, questionQuantity: qty }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          config.questionQuantity === qty
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {qty === 0 ? 'All' : qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Syllabus Learning Objectives Checksheet</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Include a 1-page self-assessment diagnostic checklist on Page 2
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig(prev => ({ ...prev, includeSyllabusChecksheet: !prev.includeSyllabusChecksheet }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                      config.includeSyllabusChecksheet ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: LIVE GENERATION & QUESTION REORDERING */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Matched Questions ({availableQuestions.length} Total)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Uncheck questions you have practiced, or sort by difficulty
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => sortQuestions('easy')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
                      title="Sort Easy to Hard"
                    >
                      Marks ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => sortQuestions('hard')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
                      title="Sort Hard to Easy"
                    >
                      Marks ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => sortQuestions('year')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
                      title="Sort Newest to Oldest"
                    >
                      Newest
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {availableQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
                      <p className="text-sm font-semibold">No questions match the current filter selection.</p>
                      <p className="text-xs mt-1">Try expanding the year range or tier in Steps 1 & 2.</p>
                    </div>
                  ) : (
                    availableQuestions.map((q, idx) => {
                      const isIncluded = config.selectedQuestionIds.length === 0 || config.selectedQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                            isIncluded
                              ? 'bg-slate-950 border-slate-800 text-slate-200'
                              : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => toggleQuestionSelection(q.id)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">Q{idx + 1}.</span>
                                <span className="text-xs font-semibold text-indigo-400 truncate">{q.source}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  [{q.totalMarks} Marks]
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {q.prompt}
                              </p>
                            </div>
                          </label>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveQuestion(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move up"
                            >
                              <MoveUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveQuestion(idx, 'down')}
                              disabled={idx === availableQuestions.length - 1}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move down"
                            >
                              <MoveDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTriggerPrint();
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Printer className="h-4 w-4" />
                  Print / Export PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
