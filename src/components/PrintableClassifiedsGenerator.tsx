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
  ChevronUp,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  Calendar,
  Eye,
  Settings2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Play,
  Calculator,
  Compass,
  PenTool
} from 'lucide-react';
import { Subject, UserProfile, UserAccount } from '../types';
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
import {
  isPaper2Question,
  isPaper4Question,
  isSameMeaningAnswer,
  getP2McqOptions
} from '../lib/grading/semanticGrader';
import { addMistakeItem } from '../services/mistakeNotebook';

interface PrintableClassifiedsGeneratorProps {
  subject: Subject;
  profile?: UserProfile;
  currentUser?: UserAccount | null;
}

interface SubPartSolution {
  working: string;
  userAnswer: string;
  scoreAwarded?: number;
  isRevealed: boolean;
  isChecked: boolean;
  isCorrect?: boolean;
  matchReason?: string;
}

/**
 * Checks if the subject is an English or Language subject.
 * English & Languages NEVER use "show your working" or mathematical symbols.
 */
export function isLanguageSubject(subject?: Subject | { code?: string; category?: string; name?: string }): boolean {
  if (!subject) return false;
  const code = (subject.code || '').toLowerCase();
  const cat = (subject.category || '').toLowerCase();
  const name = (subject.name || '').toLowerCase();

  if (cat === 'languages') return true;
  if (['0510', '0511', '0500', '4es1', '4ea1', '0520', '0544', '0547', '0530', '1123'].includes(code)) return true;
  if (
    name.includes('english') ||
    name.includes('french') ||
    name.includes('spanish') ||
    name.includes('arabic') ||
    name.includes('german') ||
    name.includes('literature')
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if the subject is Mathematics.
 */
export function isMathSubject(subject?: Subject | { code?: string; category?: string; name?: string }): boolean {
  if (!subject) return false;
  const code = (subject.code || '').toLowerCase();
  const cat = (subject.category || '').toLowerCase();
  const name = (subject.name || '').toLowerCase();

  if (cat === 'mathematics') return true;
  if (['0580', '0606', '4ma1', '4mb1', '9709', 'wma11', 'wma12', 'wma13', 'wma14'].includes(code)) return true;
  if (name.includes('math') || name.includes('calculus') || name.includes('algebra')) return true;
  return false;
}

/**
 * Determines whether a specific question/subpart requires mathematical calculation working steps.
 * Qualitative questions (definitions, explanations, descriptions, notes, essays) do NOT require working steps.
 */
export function requiresCalculationWorking(
  subject: Subject,
  question: ClassifiedQuestion,
  sub: ClassifiedSubPart
): boolean {
  // English and language subjects NEVER require calculation working
  if (isLanguageSubject(subject)) return false;

  // Mathematics subjects require calculation working
  if (isMathSubject(subject)) return true;

  // Check mark schemes for method marks [M1], [M2], etc.
  const hasMethodMark = sub.markScheme.some(m => m.markType.toUpperCase().includes('M'));
  if (hasMethodMark) return true;

  // Check if diagramOrMath contains an equation or formula
  if (sub.diagramOrMath || question.diagramOrMath) return true;

  // Check if prompt asks for mathematical / numerical calculation
  const combinedText = `${question.prompt} ${sub.prompt} ${sub.finalAnswer}`.toLowerCase();
  const calculationPattern = /\b(calculate|determine the value|find the value|evaluate|solve|work out|how many moles|mass of pure|orbital speed|percentage purity|resultant force|specific heat|half-life|concentration|resistance|current|voltage|acceleration|velocity)\b/;
  if (calculationPattern.test(combinedText)) return true;

  // Check if final answer has numerical calculation format and prompt contains calculate/work out
  if (/\d+/.test(sub.finalAnswer) && /\b(calculate|work out|find|determine)\b/i.test(combinedText)) {
    return true;
  }

  return false;
}

/**
 * Determines whether the mathematical quick-symbol toolbar should appear.
 * English and non-math qualitative questions NEVER show math symbols.
 */
export function requiresMathSymbols(
  subject: Subject,
  question: ClassifiedQuestion,
  sub: ClassifiedSubPart
): boolean {
  // English and language subjects NEVER need mathematical symbols
  if (isLanguageSubject(subject)) return false;

  if (isMathSubject(subject)) return true;
  if (requiresCalculationWorking(subject, question, sub)) return true;

  const combinedText = `${question.prompt} ${sub.prompt}`;
  if (/[\\$_\^]/.test(combinedText) || sub.diagramOrMath || question.diagramOrMath) return true;

  return false;
}

function isAnswerEquivalent(userAns: string, officialAns: string): boolean {
  if (!userAns || !officialAns) return false;
  const cleanU = userAns.trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanO = officialAns.trim().toLowerCase().replace(/\s+/g, ' ');
  if (cleanU === cleanO) return true;

  // Textual overlap match (e.g. for qualitative explanations / English notes)
  if (cleanU.length >= 4 && cleanO.length >= 4) {
    if (cleanU.includes(cleanO) || cleanO.includes(cleanU)) return true;
  }

  // Strip common units, markdown, or punctuation
  const stripUnits = (s: string) => s
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/[\$%]/g, '')
    .replace(/\b(cm|cm²|cm³|m|m²|m³|kg|g|s|km\/h|m\/s|m\/s²|j|kj|n|w|kw|v|a|°c|degrees?|mol|mol\/dm³)\b/gi, '')
    .trim();

  const numU = stripUnits(cleanU);
  const numO = stripUnits(cleanO);
  if (numU === numO) return true;

  // Number comparison with floating point tolerance
  const valU = parseFloat(numU);
  const valO = parseFloat(numO);
  if (!isNaN(valU) && !isNaN(valO)) {
    if (Math.abs(valU - valO) < 0.01) return true;
    if (valO !== 0 && Math.abs((valU - valO) / valO) < 0.02) return true; // within 2%
  }

  // Comma-separated roots e.g. "3, -3" vs "-3, 3"
  const partsU = numU.split(/[,;\s]+/).filter(Boolean).sort().join(',');
  const partsO = numO.split(/[,;\s]+/).filter(Boolean).sort().join(',');
  if (partsU === partsO && partsU.length > 0) return true;

  return false;
}

/**
 * Strips raw embedded [A] ... [D] options from the question stem if it's Paper 2,
 * ensuring option names are cleanly placed solely in the interactive buttons.
 */
function cleanStemPrompt(prompt: string, isP2: boolean): string {
  if (!isP2 || !prompt) return prompt;
  return prompt
    .replace(/\n\s*\[A\]\s*[\s\S]*?\[D\][^\n\r]*/gi, '')
    .replace(/\n\s*\(A\)\s*[\s\S]*?\(D\)[^\n\r]*/gi, '')
    .replace(/(?:\r?\n){2,}\s*A[:\.\)\-][\s\S]*?D[:\.\)\-][^\n\r]*/gi, '')
    .trim();
}

export const PrintableClassifiedsGenerator: React.FC<PrintableClassifiedsGeneratorProps> = ({
  subject,
  profile,
  currentUser,
}) => {
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'worksheet' | 'online-solver' | 'mark-scheme'>('worksheet');
  const [showCoverPageOnScreen, setShowCoverPageOnScreen] = useState(false);

  const isCurrentLanguageSubject = useMemo(() => isLanguageSubject(subject), [subject]);

  // Initial Subject Chapters
  const chapters = useMemo(() => {
    return getTaxonomyForSubject(subject.code || subject.id);
  }, [subject]);

  // Master Configuration State
  const [config, setConfig] = useState<ClassifiedsConfig>(() => ({
    subject,
    selectedChapterId: chapters[0]?.id || '0580-01',
    selectedChapterIds: [chapters[0]?.id || '0580-01'],
    selectedSubtopics: [],
    selectedYears: [2021, 2022, 2023, 2024, 2025, 2026],
    selectedSeasons: ['May/June', 'Oct/Nov'],
    tier: 'Extended',
    paperComponents: ['Paper 2 (Extended / MCQ)', 'Paper 4 (Extended Theory)'],
    bookletMode: 'Mode A: Student Exam Worksheet',
    workingSpaceStyle: 'dotted',
    questionQuantity: 0, // All
    includeSyllabusChecksheet: true,
    selectedQuestionIds: []
  }));

  // Update selectedChapterId & selectedChapterIds when subject prop changes
  React.useEffect(() => {
    const newTax = getTaxonomyForSubject(subject.code || subject.id);
    const initialId = newTax[0]?.id || '0580-01';
    setConfig(prev => ({
      ...prev,
      subject,
      selectedChapterId: initialId,
      selectedChapterIds: [initialId],
      selectedSubtopics: [],
      selectedQuestionIds: []
    }));
  }, [subject]);

  const activeChapter: ChapterTaxonomy = useMemo(() => {
    const currentTax = getTaxonomyForSubject(config.subject.code || config.subject.id);
    return currentTax.find(c => c.id === config.selectedChapterId) || currentTax[0] || chapters[0];
  }, [config.subject, config.selectedChapterId, chapters]);

  // Raw questions matching filter criteria (supporting multi-topic compilation)
  const rawMatchingQuestions = useMemo(() => {
    const targetChapterIds = config.selectedChapterIds && config.selectedChapterIds.length > 0
      ? config.selectedChapterIds
      : [config.selectedChapterId];

    return getClassifiedQuestions({
      subjectCodeOrId: config.subject.code || config.subject.id,
      chapterIds: targetChapterIds,
      subtopics: config.selectedSubtopics.length > 0 ? config.selectedSubtopics : undefined,
      years: config.selectedYears,
      seasons: config.selectedSeasons,
      tier: config.tier,
      limit: config.questionQuantity > 0 ? config.questionQuantity : undefined
    });
  }, [config.subject, config.selectedChapterId, config.selectedChapterIds, config.selectedSubtopics, config.selectedYears, config.selectedSeasons, config.tier, config.questionQuantity]);

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

  // Interactive Online Solving State
  const [solutions, setSolutions] = useState<Record<string, SubPartSolution>>({});

  const handleUpdateWorking = (key: string, working: string) => {
    setSolutions(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { userAnswer: '', isRevealed: false, isChecked: false }),
        working
      }
    }));
  };

  const handleUpdateUserAnswer = (key: string, userAnswer: string) => {
    setSolutions(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { working: '', isRevealed: false, isChecked: false }),
        userAnswer
      }
    }));
  };

  const handleCheckAnswer = (
    key: string,
    finalAnswer: string,
    maxMarks: number,
    markScheme?: Array<{ requirement: string }>,
    isP4 = false,
    explicitAnswer?: string
  ) => {
    setSolutions(prev => {
      const current = prev[key] || { working: '', userAnswer: '', isRevealed: false, isChecked: false };
      const candidate = explicitAnswer !== undefined ? explicitAnswer : (current.userAnswer?.trim() || current.working?.trim() || '');
      const match = isSameMeaningAnswer(candidate, finalAnswer, markScheme, isP4);
      const isCorrect = match.isMatch;

      // Auto-log to Mistake Notebook if answered incorrectly with an actual attempt
      if (!isCorrect && candidate.trim() !== '') {
        try {
          const [qId, sIdxStr] = key.split('-');
          const sIdx = parseInt(sIdxStr, 10);
          const question = finalQuestions.find(q => q.id === qId);
          if (question) {
            const subPart = question.subParts[sIdx] || question.subParts[0];
            addMistakeItem({
              subjectId: config.subject.id,
              subjectCode: config.subject.code,
              topic: activeChapter.title,
              paperCode: question.source || `${config.subject.code} Classifieds (${question.season} ${question.year})`,
              questionNumber: `Q${question.questionNumber}${subPart?.part ? ` ${subPart.part}` : ''}`,
              questionPrompt: (subPart?.prompt || question.prompt || 'Classified Question').slice(0, 300),
              myMistakeAnswer: candidate,
              markSchemeAnswer: finalAnswer,
              examinerTip: match.reason || 'Check mark scheme keywords and command word precision.',
              reason: isP4 ? 'misread_command' : 'concept_gap',
              marksLost: maxMarks,
              totalMarks: maxMarks
            });
          }
        } catch (e) {
          console.warn('Failed to auto-log mistake:', e);
        }
      }

      return {
        ...prev,
        [key]: {
          ...current,
          userAnswer: explicitAnswer !== undefined ? explicitAnswer : current.userAnswer,
          isChecked: true,
          isCorrect,
          isRevealed: true,
          matchReason: match.reason,
          scoreAwarded: isCorrect ? maxMarks : 0
        }
      };
    });
  };

  const handleToggleReveal = (key: string) => {
    setSolutions(prev => {
      const current = prev[key] || { working: '', userAnswer: '', isRevealed: false, isChecked: false };
      return {
        ...prev,
        [key]: {
          ...current,
          isRevealed: !current.isRevealed
        }
      };
    });
  };

  const handleSetScore = (key: string, score: number) => {
    setSolutions(prev => {
      const current = prev[key] || { working: '', userAnswer: '', isRevealed: false, isChecked: false };
      return {
        ...prev,
        [key]: {
          ...current,
          scoreAwarded: score
        }
      };
    });
  };

  const handleInsertSymbol = (key: string, symbol: string) => {
    const current = solutions[key] || { working: '', userAnswer: '', isRevealed: false, isChecked: false };
    // If user has a working box active, append to working; otherwise append to userAnswer
    if (current.working !== undefined && current.working.length > 0) {
      setSolutions(prev => ({
        ...prev,
        [key]: {
          ...current,
          working: current.working + symbol
        }
      }));
    } else {
      setSolutions(prev => ({
        ...prev,
        [key]: {
          ...current,
          userAnswer: (current.userAnswer || '') + symbol
        }
      }));
    }
  };

  const handleResetAllSolutions = () => {
    if (window.confirm('Reset all your typed answers and marks for this chapter?')) {
      setSolutions({});
    }
  };

  const handleRevealAllAnswers = () => {
    const updated: Record<string, SubPartSolution> = { ...solutions };
    finalQuestions.forEach(q => {
      q.subParts.forEach((_, sIdx) => {
        const key = `${q.id}-${sIdx}`;
        updated[key] = {
          ...(updated[key] || { working: '', userAnswer: '', isChecked: false }),
          isRevealed: true
        };
      });
    });
    setSolutions(updated);
  };

  // Metrics
  const totalMarks = useMemo(() => {
    return finalQuestions.reduce((sum, q) => sum + q.totalMarks, 0);
  }, [finalQuestions]);

  const totalSubpartsCount = useMemo(() => {
    return finalQuestions.reduce((sum, q) => sum + q.subParts.length, 0);
  }, [finalQuestions]);

  const attemptedSubpartsCount = useMemo(() => {
    return Object.values(solutions).filter(s => (s.working?.trim() || s.userAnswer?.trim() || s.scoreAwarded !== undefined)).length;
  }, [solutions]);

  const totalEarnedMarks = useMemo(() => {
    return Object.values(solutions).reduce((sum, s) => sum + (s.scoreAwarded || 0), 0);
  }, [solutions]);

  const scorePercentage = useMemo(() => {
    if (totalMarks === 0) return 0;
    return Math.round((totalEarnedMarks / totalMarks) * 100);
  }, [totalEarnedMarks, totalMarks]);

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
  const renderWorkingSpace = (
    marks: number,
    style: WorkingSpaceStyle,
    isLang: boolean = false,
    isCalc: boolean = true
  ) => {
    let lineCount = 2;
    if (isLang) {
      if (marks === 1) lineCount = 2;
      else if (marks === 2) lineCount = 3;
      else if (marks >= 3 && marks <= 4) lineCount = 5;
      else if (marks >= 5 && marks <= 8) lineCount = 8;
      else if (marks > 8) lineCount = 16;
    } else {
      if (marks === 2) lineCount = 4;
      else if (marks >= 3 && marks <= 4) lineCount = 6;
      else if (marks >= 5 && marks <= 8) lineCount = 10;
      else if (marks > 8) lineCount = 14;
    }

    if (style === 'blank') {
      const heightPx = marks <= 2 ? '90px' : marks <= 4 ? '160px' : '240px';
      return (
        <div
          className="w-full my-3 border border-slate-300 rounded bg-white relative print:border-slate-400"
          style={{ height: heightPx }}
        >
          <span className="absolute bottom-2 right-2 text-[9pt] text-slate-400 select-none print:text-slate-500 font-serif">
            {isLang ? '[Answer space]' : isCalc ? '[Working space]' : '[Response space]'}
          </span>
        </div>
      );
    }

    if (style === 'grid' && isCalc) {
      const heightPx = marks <= 2 ? '100px' : marks <= 4 ? '180px' : '260px';
      return (
        <div
          className="w-full my-3 border border-slate-300 rounded bg-white relative print:border-slate-400"
          style={{
            height: heightPx,
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          <span className="absolute bottom-2 right-2 text-[9pt] text-slate-400 select-none print:text-slate-500 font-serif">
            [Graph grid working space]
          </span>
        </div>
      );
    }

    const borderClass = style === 'dotted'
      ? 'border-b border-dotted border-slate-400'
      : 'border-b border-solid border-slate-300';

    return (
      <div className="w-full my-3 space-y-4">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className={`w-full h-5 ${borderClass}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          1. WEB ACTION BAR & TOOLBAR (Hidden in Print)
      ───────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          1. WEB ACTION BAR & TOOLBAR (Hidden in Print)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative sm:sticky sm:top-14 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-3 shadow-md no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Title & Chapter badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-base truncate">
                  {config.subject.code} • {activeChapter.title}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {activeChapter.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Topical Past Paper Compilation • Series {config.selectedYears.join(', ')} • {config.tier} Tier
              </p>
            </div>
          </div>

          {/* Center: Live Metrics (Desktop only to prevent mobile crowding) */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">Questions:</span>
              <span className="font-bold text-white">{finalQuestions.length}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">Total Marks:</span>
              <span className="font-bold text-amber-400">{totalMarks}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hidden md:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Time:</span>
              <span className="font-bold text-emerald-400">{durationFormatted}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Configure</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print Booklet (PDF)</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: 3 View Modes (Worksheet / Solve Online / Mark Scheme) */}
        <div className="max-w-6xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          {/* Main Primary View Switcher */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setViewTab('worksheet')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                viewTab === 'worksheet'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Booklet</span>
              <span className="hidden sm:inline"> (Print / PDF)</span>
            </button>

            <button
              onClick={() => setViewTab('online-solver')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                viewTab === 'online-solver'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Solve Online</span>
              {attemptedSubpartsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px]">
                  {attemptedSubpartsCount}/{totalSubpartsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewTab('mark-scheme')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                viewTab === 'mark-scheme'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Mark Scheme</span>
            </button>
          </div>

          {/* Sub-controls depending on active tab */}
          <div className="flex items-center gap-3">
            {viewTab === 'worksheet' && (
              <>
                <label className="text-slate-400 text-[11px] hidden sm:flex items-center gap-1.5">
                  <span>Lines:</span>
                  <select
                    value={config.workingSpaceStyle}
                    onChange={(e) => setConfig(prev => ({ ...prev, workingSpaceStyle: e.target.value as any }))}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="dotted">Dotted (Cambridge)</option>
                    <option value="solid">Solid Lines</option>
                    {!isCurrentLanguageSubject && <option value="grid">Graph Grid</option>}
                    <option value="blank">Blank Box</option>
                  </select>
                </label>

                <button
                  onClick={() => setShowCoverPageOnScreen(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition"
                >
                  <Eye className="h-3 w-3 text-indigo-400" />
                  <span>{showCoverPageOnScreen ? 'Hide Cover Preview' : 'Show Cover Preview'}</span>
                </button>
              </>
            )}

            {viewTab === 'online-solver' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRevealAllAnswers}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <Eye className="h-3 w-3 text-amber-400" />
                  <span>Reveal All Schemes</span>
                </button>
                <button
                  onClick={handleResetAllSolutions}
                  className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Answers</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW A: INTERACTIVE ONLINE SOLVER MODE
      ───────────────────────────────────────────────────────────── */}
      {viewTab === 'online-solver' && (
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 no-print">
          {/* Top Session Progress & Self-Scoring Summary Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    Interactive Online Practice
                  </span>
                  <span className="text-xs text-slate-400">
                    {config.subject.name} • Chapter {activeChapter.chapterNumber}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {activeChapter.title}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isCurrentLanguageSubject
                    ? 'Write your responses, check acceptable examiner answers, and mark your work according to official Cambridge criteria.'
                    : 'Show your working, calculate your answers, and check them against official Cambridge mark schemes.'}
                </p>
              </div>

              {/* Live Scorecard Box */}
              <div className="flex items-center gap-4 bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400 font-medium">Attempted</div>
                  <div className="text-lg font-black text-white font-mono">
                    {attemptedSubpartsCount} <span className="text-xs text-slate-500">/ {totalSubpartsCount}</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400 font-medium">Your Score</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {totalEarnedMarks} <span className="text-xs text-slate-500">/ {totalMarks}</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400 font-medium">Accuracy</div>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {scorePercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Chapter Completion</span>
                <span>{attemptedSubpartsCount} of {totalSubpartsCount} subparts attempted ({Math.round((attemptedSubpartsCount / (totalSubpartsCount || 1)) * 100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((attemptedSubpartsCount / (totalSubpartsCount || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Question Cards */}
          <div className="space-y-6">
            {finalQuestions.map((q, qIdx) => {
              const qNum = qIdx + 1;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-lg space-y-5"
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                        {qNum}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {q.source}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {q.subtopic}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {q.paperComponent} • Series {q.year}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                        {q.totalMarks} Marks Total
                      </span>
                    </div>
                  </div>

                  {/* Main Question Stem */}
                  {q.prompt && (
                    <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                      <MathRenderer content={cleanStemPrompt(q.prompt, isPaper2Question(q))} />
                    </div>
                  )}

                  {/* Equation or Diagram */}
                  {q.diagramOrMath && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-100 overflow-x-auto">
                      <MathRenderer content={`$$${q.diagramOrMath}$$`} />
                    </div>
                  )}

                  {/* Question Subparts */}
                  <div className="space-y-6 pt-2">
                    {q.subParts.map((sub, sIdx) => {
                      const key = `${q.id}-${sIdx}`;
                      const state = solutions[key] || {
                        working: '',
                        userAnswer: '',
                        isRevealed: false,
                        isChecked: false
                      };

                      const isLang = isLanguageSubject(config.subject);
                      const isP2 = isPaper2Question(q);
                      const isP4 = isPaper4Question(q);
                      const isCalc = !isP2 && requiresCalculationWorking(config.subject, q, sub);
                      const hasMath = !isP2 && requiresMathSymbols(config.subject, q, sub);
                      const isExtendedWriting = isLang && (sub.marks >= 6 || /\b(write|summary|email|article|review|report|letter|essay)\b/i.test(`${sub.prompt} ${q.prompt}`));
                      const wordCount = state.userAnswer ? state.userAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

                      return (
                        <div
                          key={key}
                          className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 sm:p-5 space-y-4"
                        >
                          {/* Subpart Prompt & Mark Badge */}
                          <div className="flex items-baseline justify-between gap-4">
                            <div className="flex items-baseline gap-2.5 text-sm sm:text-base text-white">
                              <span className="font-bold text-indigo-400 font-mono shrink-0">
                                {sub.part}
                              </span>
                              <div className="font-medium">
                                <MathRenderer content={sub.prompt} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isP2 && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                                  P2 Multiple Choice
                                </span>
                              )}
                              {isP4 && (
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                                  P4 Theory
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                                [{sub.marks} {sub.marks === 1 ? 'mark' : 'marks'}]
                              </span>
                            </div>
                          </div>

                          {/* ──────────────────────────────────────────────────
                              CASE 0: PAPER 2 MULTIPLE CHOICE QUESTIONS (MCQ)
                              (Strictly NOT typable! Select options A, B, C, D)
                          ────────────────────────────────────────────────── */}
                          {isP2 ? (
                            <div className="space-y-3 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                  <span>Paper 2 Multiple Choice (Select A, B, C, or D):</span>
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">Click an option below to answer</span>
                              </div>

                              {/* MCQ Option Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {getP2McqOptions(q, sub).map(opt => {
                                  const cleanAns = (state.userAnswer || '').trim().toUpperCase();
                                  const isSelected = cleanAns === opt.letter || cleanAns === opt.label.toUpperCase();
                                  const isCorrectOpt = state.isChecked && (
                                    isSameMeaningAnswer(opt.letter, sub.finalAnswer, sub.markScheme, false).isMatch ||
                                    isSameMeaningAnswer(opt.label, sub.finalAnswer, sub.markScheme, false).isMatch
                                  );
                                  const isWrongOpt = state.isChecked && isSelected && !isCorrectOpt;

                                  return (
                                    <button
                                      key={opt.letter}
                                      type="button"
                                      onClick={() => {
                                        handleCheckAnswer(key, sub.finalAnswer, sub.marks, sub.markScheme, isP4, opt.letter);
                                      }}
                                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                                        isCorrectOpt
                                          ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md'
                                          : isWrongOpt
                                          ? 'border-rose-500 bg-rose-500/20 text-white'
                                          : isSelected
                                          ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-400'
                                          : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                                      }`}
                                    >
                                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold font-mono text-xs shrink-0 ${
                                        isCorrectOpt
                                          ? 'bg-emerald-500 text-slate-950 font-black'
                                          : isWrongOpt
                                          ? 'bg-rose-500 text-white font-bold'
                                          : isSelected
                                          ? 'bg-indigo-500 text-white font-bold'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}>
                                        {opt.letter}
                                      </span>
                                      <span className="text-xs sm:text-sm font-medium flex-1">
                                        <MathRenderer content={opt.label} />
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* MCQ Action Bar */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="text-[11px] text-slate-400">
                                  {state.isChecked && (
                                    state.isCorrect ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct! [{sub.marks}/{sub.marks} marks]
                                      </span>
                                    ) : (
                                      <span className="text-rose-400 font-bold flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" /> Incorrect. Correct Option was: {sub.finalAnswer}
                                      </span>
                                    )
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleReveal(key)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{state.isRevealed ? 'Hide Scheme' : 'Mark Scheme'}</span>
                                </button>
                              </div>
                            </div>
                          ) : isCalc ? (
                            /* ──────────────────────────────────────────────────
                               CASE 1: CALCULATION / MATH WORKING REQUIRED
                            ────────────────────────────────────────────────── */
                            <>
                              {/* Calculation Working Steps Box */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <PenTool className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>Show Your Working Steps:</span>
                                  </label>

                                  {/* Quick Math Symbols (ONLY for subjects/questions that need math!) */}
                                  {hasMath && (
                                    <div className="flex items-center gap-1 flex-wrap text-xs">
                                      <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Symbols:</span>
                                      {['×', '÷', '²', '³', '√', 'π', 'θ', '°', 'Δ', '±'].map(sym => (
                                        <button
                                          key={sym}
                                          type="button"
                                          onClick={() => handleInsertSymbol(key, sym)}
                                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer"
                                        >
                                          {sym}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <textarea
                                  rows={3}
                                  value={state.working}
                                  onChange={(e) => handleUpdateWorking(key, e.target.value)}
                                  placeholder="Show your step-by-step working here (e.g. F = ma = 1200 × 2 = 2400 N)..."
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono leading-relaxed"
                                />
                              </div>

                              {/* Final Answer Input & Actions */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-xs font-bold text-slate-300 shrink-0">Answer:</span>
                                  <input
                                    type="text"
                                    value={state.userAnswer}
                                    onChange={(e) => handleUpdateUserAnswer(key, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCheckAnswer(key, sub.finalAnswer, sub.marks, sub.markScheme, isP4);
                                      }
                                    }}
                                    placeholder="e.g. 2400 N or x = 3, -3"
                                    className="flex-1 max-w-md bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCheckAnswer(key, sub.finalAnswer, sub.marks, sub.markScheme, isP4)}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Check Answer</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleReveal(key)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                  >
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                                    <span>{state.isRevealed ? 'Hide Scheme' : 'Mark Scheme'}</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : isLang ? (
                            /* ──────────────────────────────────────────────────
                               CASE 2: ENGLISH & LANGUAGE SUBJECTS
                               (NO working box, NO math symbols, pure language response)
                            ────────────────────────────────────────────────── */
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <PenTool className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>{isExtendedWriting ? 'Your Written Response / Essay:' : 'Your Answer / Notes:'}</span>
                                  </label>
                                  {isExtendedWriting && (
                                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                      Word count: <strong className="text-indigo-300">{wordCount}</strong> words
                                    </span>
                                  )}
                                </div>

                                <textarea
                                  rows={isExtendedWriting ? 8 : 3}
                                  value={state.userAnswer}
                                  onChange={(e) => handleUpdateUserAnswer(key, e.target.value)}
                                  placeholder={
                                    isExtendedWriting
                                      ? 'Write your response here using standard paragraphs, clear structure, and appropriate vocabulary...'
                                      : 'Type your answer or notes here...'
                                  }
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed font-sans"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleCheckAnswer(key, sub.finalAnswer, sub.marks, sub.markScheme, isP4)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>{isExtendedWriting ? 'Check Response' : 'Check Answer'}</span>
                                </button>

                                <button
                                  onClick={() => handleToggleReveal(key)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{state.isRevealed ? 'Hide Scheme' : 'Mark Scheme'}</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            /* ──────────────────────────────────────────────────
                               CASE 3: QUALITATIVE / EXPLANATION QUESTIONS IN SCIENCES
                               (NO working box, direct answer/explanation)
                            ────────────────────────────────────────────────── */
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <PenTool className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>Your Answer / Scientific Explanation:</span>
                                  </label>

                                  {hasMath && (
                                    <div className="flex items-center gap-1 flex-wrap text-xs">
                                      <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Symbols:</span>
                                      {['×', '÷', '²', '³', '√', 'π', 'θ', '°', 'Δ', '±'].map(sym => (
                                        <button
                                          key={sym}
                                          type="button"
                                          onClick={() => handleInsertSymbol(key, sym)}
                                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer"
                                        >
                                          {sym}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <textarea
                                  rows={3}
                                  value={state.userAnswer}
                                  onChange={(e) => handleUpdateUserAnswer(key, e.target.value)}
                                  placeholder="Write your explanation or answer here..."
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed font-sans"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleCheckAnswer(key, sub.finalAnswer, sub.marks, sub.markScheme, isP4)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Check Answer</span>
                                </button>

                                <button
                                  onClick={() => handleToggleReveal(key)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                                  <span>{state.isRevealed ? 'Hide Scheme' : 'Mark Scheme'}</span>
                                </button>
                              </div>
                            </>
                          )}

                          {/* Auto-Check Feedback Banner */}
                          {state.isChecked && (
                            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                              state.isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                            }`}>
                              {state.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 space-y-0.5">
                                <div>
                                  <span className="font-bold">
                                    {state.isCorrect ? 'Correct / Acceptable Answer!' : 'Review Against Cambridge Criteria:'}
                                  </span>
                                  <span className="ml-1.5">
                                    Official CAIE Mark Scheme: <strong className="font-mono text-white">{sub.finalAnswer}</strong>
                                  </span>
                                </div>
                                {state.matchReason && (
                                  <div className="text-[11px] text-slate-300 font-sans">
                                    ℹ️ {state.matchReason}
                                  </div>
                                )}
                                {!state.isCorrect && (
                                  <div className="pt-1">
                                    <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      🔖 Auto-logged to Mistake Notebook (?tab=mistakes)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Mark Scheme & Examiner Criteria Breakdown */}
                          {state.isRevealed && (
                            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="font-bold uppercase tracking-wider text-indigo-300 text-[11px] flex items-center gap-1.5">
                                  <Award className="h-3.5 w-3.5 text-indigo-400" />
                                  Official Cambridge Mark Scheme Criteria
                                </span>
                                <span className="font-mono font-bold text-slate-200">
                                  Final: {sub.finalAnswer}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {sub.markScheme.map((ms, mIdx) => (
                                  <div key={mIdx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                    <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-500/20 text-indigo-300 shrink-0">
                                      {ms.markType}
                                    </span>
                                    <div className="flex-1 text-slate-300">
                                      <MathRenderer content={ms.requirement} />
                                      {ms.guidance && (
                                        <div className="text-[10px] text-amber-300/80 italic mt-0.5">
                                          Note: {ms.guidance}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Self-Scoring Mark Selector */}
                              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-slate-400 font-medium text-[11px]">
                                  Award marks for this subpart:
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {Array.from({ length: sub.marks + 1 }).map((_, markVal) => {
                                    const isSelected = state.scoreAwarded === markVal;
                                    return (
                                      <button
                                        key={markVal}
                                        type="button"
                                        onClick={() => handleSetScore(key, markVal)}
                                        className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition cursor-pointer ${
                                          isSelected
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 ring-2 ring-emerald-400'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                      >
                                        {markVal}
                                      </button>
                                    );
                                  })}
                                  <span className="text-slate-400 text-xs ml-1 font-mono">
                                    / {sub.marks}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Examiner Report Guidance Footer */}
                  {q.examinerReportNotes.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                      <GraduationCap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">Senior Examiner Report Guidance:</span>
                        <p className="mt-0.5 leading-relaxed text-slate-300">
                          {q.examinerReportNotes[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW B: AUTHENTIC CAMBRIDGE PRINT CONTAINER & MASTER DOCUMENT
          (A4 Portrait Geometry, used in 'worksheet' and in Print)
      ───────────────────────────────────────────────────────────── */}
      {(viewTab === 'worksheet' || viewTab === 'mark-scheme') && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
          
          {/* Quick Screen Banner to Toggle Cover Page on screen */}
          <div className="mb-4 no-print flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>
                <strong>Printable Exam Geometry:</strong> Formatted for standard A4 paper with authentic Cambridge response lines.
              </span>
            </div>
            <button
              onClick={() => setShowCoverPageOnScreen(prev => !prev)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>{showCoverPageOnScreen ? 'Hide Cover & Objectives' : 'Show Cover & Objectives'}</span>
              {showCoverPageOnScreen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

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
                (Always printed; conditionally expanded on screen)
            ───────────────────────────────────────────────────────── */}
            <div className={`cover-page mb-10 print:mb-0 print:min-h-[297mm] flex flex-col justify-between border-b-2 border-dashed border-slate-300 pb-10 print:border-none print:pb-0 ${
              showCoverPageOnScreen ? 'block' : 'hidden print:flex'
            }`}>
              <div>
                {/* Official Banner Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <h1 className="text-xs font-bold tracking-widest text-slate-700 uppercase font-sans">
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
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase font-serif">
                    {config.subject.name}
                  </h2>
                  <div className="text-sm font-bold text-slate-700 mt-1">
                    Syllabus Code: <span className="font-mono text-slate-900">{config.subject.code}</span>
                  </div>

                  <div className="mt-6 inline-block bg-slate-100 border border-slate-300 px-6 py-3 rounded-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      TOPIC BOOKLET: CHAPTER {activeChapter.chapterNumber}
                    </span>
                    <span className="text-xl font-extrabold text-slate-950 block mt-1 font-serif">
                      {activeChapter.title}
                    </span>
                  </div>

                  <div className="mt-4 text-xs font-semibold text-slate-600">
                    Compiled from Series {config.selectedYears.join(', ')} • {config.tier} Tier
                  </div>
                </div>

                {/* Student Candidate Information Grid */}
                <div className="mt-8 border-2 border-slate-900 rounded-lg p-5 bg-slate-50/50 space-y-4">
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
                    {!isCurrentLanguageSubject && (
                      <li>
                        Give non-exact numerical answers correct to <strong>3 significant figures</strong>, or 1 decimal place for angles in degrees, unless a different degree of accuracy is specified in the question.
                      </li>
                    )}
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
              <div className={`cover-page mb-10 print:mb-0 print:min-h-[297mm] flex flex-col justify-between border-b-2 border-dashed border-slate-300 pb-10 print:border-none print:pb-0 ${
                showCoverPageOnScreen ? 'block' : 'hidden print:flex'
              }`}>
                <div>
                  <div className="border-b-2 border-slate-900 pb-2 mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                        PAGE 2 • SYLLABUS LEARNING OBJECTIVES DIAGNOSTIC CHECKLIST
                      </h3>
                      <p className="text-sm font-extrabold text-slate-900 font-serif">
                        Unit Mastery: {activeChapter.id} • {activeChapter.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">[Self-Assessment]</span>
                  </div>

                  <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                    Assess your confidence on each official Cambridge syllabus learning objective. Rate each objective: Confident (✓), Need Practice (~), or Help Needed (✗).
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
                PAGE 3+: EXAM QUESTION PAGES (.question-block)
            ───────────────────────────────────────────────────────── */}
            {(viewTab === 'worksheet' || config.bookletMode === 'Mode B: Inline Revision Guide') && (
              <div className="space-y-12">
                {finalQuestions.map((question, qIndex) => {
                  const questionNum = qIndex + 1;
                  return (
                    <div
                      key={question.id}
                      className="question-block border-b-2 border-slate-200 pb-10 last:border-none print:border-b print:border-slate-300 print:pb-8"
                    >
                      {/* Question Header */}
                      <div className="flex items-baseline justify-between mb-3 border-b border-slate-100 pb-2">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-bold text-lg text-slate-950 font-serif">
                            {questionNum}
                          </span>
                          <span className="text-[10pt] text-slate-500 font-mono">
                            [{question.source}]
                          </span>
                          <span className="text-[9pt] text-slate-500 hidden sm:inline">
                            • {question.subtopic}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-slate-900 font-mono">
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
                        <div className="text-[11pt] leading-relaxed text-slate-900 mb-4 font-serif">
                          <MathRenderer content={question.prompt} />
                        </div>
                      )}

                      {/* Diagram or KaTeX Formula */}
                      {question.diagramOrMath && (
                        <div className="question-diagram my-4 p-4 border border-slate-300 rounded-lg bg-slate-50 text-center">
                          <MathRenderer content={`$$${question.diagramOrMath}$$`} />
                        </div>
                      )}

                      {/* Subparts */}
                      <div className="space-y-6 mt-4">
                        {question.subParts.map((sub, sIdx) => {
                          const isLang = isLanguageSubject(config.subject);
                          const isCalc = requiresCalculationWorking(config.subject, question, sub);

                          return (
                            <div key={sIdx} className="pl-6 sm:pl-8 border-l-2 border-slate-200">
                              {/* Subpart prompt & marks */}
                              <div className="flex items-baseline justify-between gap-4">
                                <div className="text-[10.5pt] text-slate-900 flex-1 font-serif">
                                  <span className="font-bold mr-2 text-slate-950">{sub.part}</span>
                                  <MathRenderer content={sub.prompt} />
                                </div>
                                <span className="font-bold text-[10.5pt] text-slate-950 shrink-0 font-serif">
                                  [{sub.marks}]
                                </span>
                              </div>

                              {/* Working Lines (Modes A & C) */}
                              {config.bookletMode !== 'Mode B: Inline Revision Guide' && (
                                <div className="mt-2">
                                  {renderWorkingSpace(sub.marks, config.workingSpaceStyle, isLang, isCalc)}
                                  
                                  {/* ONLY calculation questions have the separate right-aligned Cambridge Answer line */}
                                  {isCalc ? (
                                    <div className="mt-2 flex items-baseline justify-end gap-2 text-xs text-slate-800">
                                      <span className="font-serif font-bold">Answer:</span>
                                      <div className="w-56 sm:w-72 border-b border-dotted border-slate-800 h-4" />
                                      <span className="font-serif font-bold">[{sub.marks}]</span>
                                    </div>
                                  ) : null}
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

                      {/* Right-aligned Question End Rule */}
                      <div className="mt-4 pt-2 flex justify-end">
                        <span className="text-[10pt] font-bold text-slate-900 font-serif">
                          [Total: {question.totalMarks}]
                        </span>
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
                    <h4 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight font-serif">
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. CONFIGURATION DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      <ClassifiedsConfigPanel
        config={config}
        onChangeConfig={setConfig}
        availableQuestions={orderedQuestions}
        onReorderQuestions={setOrderedQuestions}
        isOpen={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
        onTriggerPrint={handlePrint}
        currentUser={currentUser}
        profile={profile}
      />
    </div>
  );
};
