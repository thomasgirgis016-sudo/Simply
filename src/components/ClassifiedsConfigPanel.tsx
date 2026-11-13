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
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { Subject, UserAccount, UserProfile } from '../types';
import { IGCSE_SUBJECTS } from '../data/subjects';
import { getTaxonomyForSubject, ChapterTaxonomy } from '../lib/classifieds/taxonomy';
import { ClassifiedQuestion } from '../lib/classifieds/questionPool';

export type BookletMode = 'Mode A: Student Exam Worksheet' | 'Mode B: Inline Revision Guide' | 'Mode C: Class Timed Test';
export type WorkingSpaceStyle = 'dotted' | 'solid' | 'grid' | 'blank';

export interface ClassifiedsConfig {
  subject: Subject;
  selectedChapterId: string;
  selectedChapterIds: string[]; // Supports selecting multiple topics/chapters
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
  currentUser?: UserAccount | null;
  profile?: UserProfile;
}

export const ClassifiedsConfigPanel: React.FC<ClassifiedsConfigPanelProps> = ({
  config,
  onChangeConfig,
  availableQuestions,
  onReorderQuestions,
  isOpen,
  onClose,
  onTriggerPrint,
  currentUser,
  profile,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Check if current user has administrator / founder privileges
  const isAdmin = Boolean(
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'founder' ||
      currentUser.title?.toLowerCase().includes('founder') ||
      currentUser.title?.toLowerCase().includes('admin') ||
      currentUser.email === 'admin@simplyigcse.com')
  );

  // Determine student's enrolled subject IDs (base 5 subjects + any extra purchased ones)
  const studentEnrolledSubjectIds = useMemo(() => {
    const list = currentUser?.selectedSubjectIds || profile?.selectedSubjectIds || [];
    const extras = currentUser?.extraSubjectIds || profile?.extraSubjectIds || [];
    return Array.from(new Set([...list, ...extras]));
  }, [currentUser, profile]);

  // Strictly filter subjects: Admin accounts get all 39 subjects, students only get their chosen enrolled subjects
  const selectableSubjects = useMemo(() => {
    if (isAdmin) {
      return IGCSE_SUBJECTS;
    }
    if (studentEnrolledSubjectIds.length > 0) {
      const filtered = IGCSE_SUBJECTS.filter(s => studentEnrolledSubjectIds.includes(s.id));
      if (filtered.length > 0) return filtered;
    }
    // Fallback: If no enrolled subjects yet, include current subject and up to 5 subjects
    const fallback = IGCSE_SUBJECTS.filter(s => s.id === config.subject.id);
    const others = IGCSE_SUBJECTS.filter(s => s.id !== config.subject.id).slice(0, 4);
    return [...fallback, ...others];
  }, [isAdmin, studentEnrolledSubjectIds, config.subject]);

  const chapters: ChapterTaxonomy[] = useMemo(() => {
    return getTaxonomyForSubject(config.subject.code || config.subject.id);
  }, [config.subject]);

  const activeSelectedChapterIds = useMemo(() => {
    if (config.selectedChapterIds && config.selectedChapterIds.length > 0) {
      return config.selectedChapterIds;
    }
    return [config.selectedChapterId || chapters[0]?.id || '0580-01'];
  }, [config.selectedChapterIds, config.selectedChapterId, chapters]);

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
  const ALL_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm transition-opacity no-print">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-[#141416] border-l border-white/[0.08] text-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#111113]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF5B37]/10 border border-[#FF5B37]/25 text-[#FF5B37]">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Topic Classifieds Builder
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF5B37]/15 text-[#FF5B37] border border-[#FF5B37]/30 uppercase font-mono">
                    CAIE Print Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Configure layout, exam series, marking scheme & typography</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
              title="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Navigation Bar */}
          <div className="grid grid-cols-4 border-b border-white/[0.08] bg-[#111113] text-xs">
            {[
              { num: 1, label: 'Scope' },
              { num: 2, label: 'Series & Tier' },
              { num: 3, label: 'Layout & Mode' },
              { num: 4, label: 'Questions' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num as any)}
                className={`py-3 px-2 text-center font-medium transition border-b-2 flex flex-col items-center gap-1 cursor-pointer ${
                  activeStep === step.num
                    ? 'border-[#FF5B37] text-white bg-[#FF5B37]/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono ${
                  activeStep === step.num ? 'bg-[#FF5B37] text-white font-bold' : 'bg-[#222225] text-slate-400'
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      1. Syllabus Subject
                    </label>
                    {isAdmin ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Admin: All 39 Syllabuses
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FF5B37]/15 text-[#FF5B37] border border-[#FF5B37]/30">
                        {selectableSubjects.length} Enrolled Subjects
                      </span>
                    )}
                  </div>
                  <select
                    value={config.subject.id}
                    onChange={(e) => {
                      const found = selectableSubjects.find(s => s.id === e.target.value) || IGCSE_SUBJECTS.find(s => s.id === e.target.value);
                      if (found) {
                        const newTax = getTaxonomyForSubject(found.code || found.id);
                        const firstChId = newTax[0]?.id || '0580-01';
                        onChangeConfig(prev => ({
                          ...prev,
                          subject: found,
                          selectedChapterId: firstChId,
                          selectedChapterIds: [firstChId],
                          selectedSubtopics: []
                        }));
                      }
                    }}
                    className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-[#FF5B37]"
                  >
                    {selectableSubjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} • {s.name} ({s.board})
                      </option>
                    ))}
                  </select>
                  {!isAdmin && (
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Showing your chosen subjects. Additional subjects can be enrolled from Profile for +£28/mo.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      2. Syllabus Topics ({activeSelectedChapterIds.length} of {chapters.length} Selected)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = chapters.map(c => c.id);
                          onChangeConfig(prev => ({
                            ...prev,
                            selectedChapterIds: allIds,
                            selectedChapterId: allIds[0] || prev.selectedChapterId,
                            selectedSubtopics: []
                          }));
                        }}
                        className="text-[11px] font-semibold text-[#FF5B37] hover:text-[#e04f2e] transition cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const firstId = chapters[0]?.id || '0580-01';
                          onChangeConfig(prev => ({
                            ...prev,
                            selectedChapterIds: [firstId],
                            selectedChapterId: firstId,
                            selectedSubtopics: []
                          }));
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-300 transition cursor-pointer"
                      >
                        Reset to 1
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2">
                    Select one or more topics to compile into your classified past paper revision booklet:
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {chapters.map((ch) => {
                      const isSelected = activeSelectedChapterIds.includes(ch.id);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => {
                            onChangeConfig(prev => {
                              const curr = prev.selectedChapterIds && prev.selectedChapterIds.length > 0
                                ? prev.selectedChapterIds
                                : [prev.selectedChapterId];
                              const exists = curr.includes(ch.id);
                              let next: string[];
                              if (exists) {
                                if (curr.length === 1) return prev; // Keep at least one
                                next = curr.filter(id => id !== ch.id);
                              } else {
                                next = [...curr, ch.id];
                              }
                              return {
                                ...prev,
                                selectedChapterIds: next,
                                selectedChapterId: next[0] || ch.id,
                                selectedSubtopics: []
                              };
                            });
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 select-none ${
                            isSelected
                              ? 'bg-[#FF5B37]/10 border-[#FF5B37]/50 text-white ring-1 ring-[#FF5B37]/30'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-300 hover:border-white/[0.15]'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5 text-[#FF5B37]">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-[#FF5B37]" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-600" />
                            )}
                          </div>
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-[#FF5B37] text-white' : 'bg-[#222225] text-slate-400'
                          }`}>
                            {ch.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{ch.title}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {ch.subtopics.slice(0, 3).join(', ')}...
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {chapters.some(c => activeSelectedChapterIds.includes(c.id) && c.subtopics.length > 0) && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      3. Sub-Topic Refinement (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(
                        chapters
                          .filter(c => activeSelectedChapterIds.includes(c.id))
                          .flatMap(c => c.subtopics)
                      )).map(sub => {
                        const isSubActive = config.selectedSubtopics.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubtopic(sub)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                              isSubActive
                                ? 'bg-[#FF5B37] border-[#FF5B37] text-white shadow-sm'
                                : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    1. Examination Year Range (2016 – 2026)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_YEARS.map(yr => {
                      const isSel = config.selectedYears.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleYear(yr)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition cursor-pointer ${
                            isSel
                              ? 'bg-[#FF5B37]/15 border-[#FF5B37] text-[#FF5B37]'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
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
                          className={`p-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                            isSel
                              ? 'bg-[#FF5B37]/15 border-[#FF5B37] text-[#FF5B37]'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          {season}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
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
                          className={`p-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                            isSel
                              ? 'bg-[#FF5B37] border-[#FF5B37] text-white'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          {tier === 'Extended' ? 'Extended (A* - E)' : tier === 'Core' ? 'Core (C - G)' : 'All Tiers'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    4. Paper Component Selection
                  </label>
                  <div className="space-y-2">
                    {ALL_COMPONENTS.map(comp => {
                      const isChecked = config.paperComponents.includes(comp);
                      return (
                        <label
                          key={comp}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[#18181b] border border-white/[0.08] hover:border-white/[0.15] cursor-pointer text-xs font-medium"
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
                            className="rounded border-slate-700 text-[#FF5B37] focus:ring-[#FF5B37]"
                          />
                          <span className="text-slate-200">{comp}</span>
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    1. Booklet Output Mode (3 Choices)
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        mode: 'Mode A: Student Exam Worksheet' as BookletMode,
                        title: 'Mode A: Student Exam Worksheet',
                        desc: 'Official Cambridge layout with blank working lines. Complete Mark Scheme compiled in the back appendix.',
                        tag: 'Most Popular'
                      },
                      {
                        mode: 'Mode B: Inline Revision Guide' as BookletMode,
                        title: 'Mode B: Inline Revision Guide',
                        desc: 'Each question is immediately followed by its official Examiner Mark Scheme and Pitfall alerts in an answer box.',
                        tag: 'Self-Study'
                      },
                      {
                        mode: 'Mode C: Class Timed Test' as BookletMode,
                        title: 'Mode C: Class Timed Test',
                        desc: 'Clean exam question sheets with student score header box. Mark Scheme generated as a separate teacher answer key.',
                        tag: 'Timed Tests'
                      }
                    ].map(item => {
                      const isSel = config.bookletMode === item.mode;
                      return (
                        <div
                          key={item.mode}
                          onClick={() => onChangeConfig(prev => ({ ...prev, bookletMode: item.mode }))}
                          className={`p-4 rounded-xl border cursor-pointer transition text-left ${
                            isSel
                              ? 'bg-[#FF5B37]/10 border-[#FF5B37] text-white ring-1 ring-[#FF5B37]/30'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-300 hover:border-white/[0.15]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#222225] text-slate-300">
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
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
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            isSel
                              ? 'bg-[#FF5B37]/10 border-[#FF5B37] text-white'
                              : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-semibold block text-white">{style.label}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{style.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      3. Question Quantity Limit
                    </label>
                    <span className="text-xs font-mono font-semibold text-[#FF5B37]">
                      {config.questionQuantity === 0 ? 'All Available' : `${config.questionQuantity} Questions`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[10, 20, 30, 0].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => onChangeConfig(prev => ({ ...prev, questionQuantity: qty }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          config.questionQuantity === qty
                            ? 'bg-[#FF5B37] border-[#FF5B37] text-white'
                            : 'bg-[#18181b] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        {qty === 0 ? 'All' : qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Syllabus Learning Objectives Checksheet</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Include a 1-page self-assessment diagnostic checklist on Page 2
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeConfig(prev => ({ ...prev, includeSyllabusChecksheet: !prev.includeSyllabusChecksheet }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                      config.includeSyllabusChecksheet ? 'bg-[#FF5B37] justify-end' : 'bg-[#222225] justify-start'
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
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
                      className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-white/[0.08] text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      title="Sort Easy to Hard"
                    >
                      Marks ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => sortQuestions('hard')}
                      className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-white/[0.08] text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      title="Sort Hard to Easy"
                    >
                      Marks ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => sortQuestions('year')}
                      className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-white/[0.08] text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                      title="Sort Newest to Oldest"
                    >
                      Newest
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {availableQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-[#18181b] rounded-xl border border-white/[0.08] text-slate-400">
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
                              ? 'bg-[#18181b] border-white/[0.08] text-slate-200'
                              : 'bg-[#141416]/50 border-white/[0.04] text-slate-600 opacity-60'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => toggleQuestionSelection(q.id)}
                              className="rounded border-slate-700 text-[#FF5B37] focus:ring-[#FF5B37]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-white">Q{idx + 1}.</span>
                                <span className="text-xs font-mono font-semibold text-slate-200 truncate">{q.source}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#222225] text-slate-300">
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
                              className="p-1 rounded bg-[#222225] border border-white/[0.08] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move up"
                            >
                              <MoveUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveQuestion(idx, 'down')}
                              disabled={idx === availableQuestions.length - 1}
                              className="p-1 rounded bg-[#222225] border border-white/[0.08] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
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
          <div className="p-4 border-t border-white/[0.08] bg-[#111113] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#18181b] text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-[#FF5B37] text-xs font-semibold text-white hover:bg-[#e04f2e] flex items-center gap-1.5 transition cursor-pointer"
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
                  className="px-5 py-2 rounded-xl bg-[#FF5B37] text-xs font-semibold text-white hover:bg-[#e04f2e] flex items-center gap-2 transition cursor-pointer"
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
