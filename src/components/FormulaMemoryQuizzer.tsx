import React, { useState, useEffect, useMemo, useRef } from 'react';
import katex from 'katex';
import {
  Zap,
  Flame,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Volume2,
  Layers,
  Calculator
} from 'lucide-react';
import {
  FORMULA_QUIZ_QUESTIONS,
  FormulaQuizQuestion,
  checkFormulaAnswer,
  normalizeFormulaAnswer
} from '../data/formulaQuizData';
import { Subject, UserProfile } from '../types';

interface FormulaMemoryQuizzerProps {
  subject?: Subject;
  profile?: UserProfile;
}

export const FormulaMemoryQuizzer: React.FC<FormulaMemoryQuizzerProps> = ({
  subject,
  profile
}) => {
  // 1. Quiz Settings
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'cie-math-0580' | 'cie-physics-0625' | 'cie-chem-0620'>(() => {
    if (subject?.code === '0580' || subject?.code === '4MA1') return 'cie-math-0580';
    if (subject?.code === '0625' || subject?.code === '4PH1') return 'cie-physics-0625';
    if (subject?.code === '0620' || subject?.code === '4CH1') return 'cie-chem-0620';
    return 'all';
  });

  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState<'sprint' | 'mastery'>('mastery');

  // 2. Active Deck State
  const filteredQuestions = useMemo(() => {
    return FORMULA_QUIZ_QUESTIONS.filter(q => {
      const matchSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
      const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      return matchSubject && matchTopic;
    });
  }, [selectedSubject, selectedTopic]);

  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    FORMULA_QUIZ_QUESTIONS.forEach(q => {
      if (selectedSubject === 'all' || q.subjectId === selectedSubject) {
        topics.add(q.topic);
      }
    });
    return Array.from(topics);
  }, [selectedSubject]);

  // Queue of questions
  const [questionDeck, setQuestionDeck] = useState<FormulaQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTypedAnswer, setUserTypedAnswer] = useState('');
  const [selectedPillOption, setSelectedPillOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);

  // Gamification & Stats
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [masteredQuestionIds, setMasteredQuestionIds] = useState<Set<string>>(new Set());

  // Sprint Mode Timers (60 seconds)
  const [sprintTimeRemaining, setSprintTimeRemaining] = useState(60);
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [isSprintFinished, setIsSprintFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or shuffle deck whenever filters change
  const initializeDeck = () => {
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    setQuestionDeck(shuffled);
    setCurrentIndex(0);
    setUserTypedAnswer('');
    setSelectedPillOption(null);
    setIsAnswerSubmitted(false);
    setIsLastAnswerCorrect(null);
  };

  useEffect(() => {
    initializeDeck();
  }, [filteredQuestions]);

  // Sprint Mode Timer
  useEffect(() => {
    if (practiceMode === 'sprint' && isSprintActive && sprintTimeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSprintTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsSprintActive(false);
            setIsSprintFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [practiceMode, isSprintActive, sprintTimeRemaining]);

  const currentQuestion = questionDeck[currentIndex] || filteredQuestions[0];

  // Helper to render KaTeX safely
  const renderMath = (latex: string, displayMode = true) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return latex;
    }
  };

  // Submit Answer
  const handleSubmitAnswer = (overrideAnswer?: string) => {
    if (!currentQuestion || isAnswerSubmitted) return;

    const answerToCheck = overrideAnswer !== undefined ? overrideAnswer : (selectedPillOption || userTypedAnswer);
    if (!answerToCheck || answerToCheck.trim() === '') return;

    const result = checkFormulaAnswer(answerToCheck, currentQuestion);
    setIsAnswerSubmitted(true);
    setIsLastAnswerCorrect(result.isCorrect);
    setTotalAttempted(prev => prev + 1);

    if (result.isCorrect) {
      setTotalCorrect(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });

      // In Mastery Mode: Mark as mastered
      setMasteredQuestionIds(prev => new Set([...prev, currentQuestion.id]));

      // Auto-advance quickly in Sprint Mode
      if (practiceMode === 'sprint' && isSprintActive) {
        setTimeout(() => {
          handleNextQuestion();
        }, 900);
      }
    } else {
      setStreak(0);
      // In Mastery Mode: Reshuffle this question into the end of deck
      if (practiceMode === 'mastery') {
        setQuestionDeck(prev => [...prev, currentQuestion]);
      }
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    setIsAnswerSubmitted(false);
    setIsLastAnswerCorrect(null);
    setUserTypedAnswer('');
    setSelectedPillOption(null);

    if (currentIndex + 1 < questionDeck.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop or re-shuffle remaining unmastered
      const unmastered = filteredQuestions.filter(q => !masteredQuestionIds.has(q.id));
      if (unmastered.length > 0) {
        setQuestionDeck(unmastered.sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
      } else {
        // All mastered!
        setQuestionDeck(filteredQuestions.sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
      }
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Start Sprint
  const handleStartSprint = () => {
    initializeDeck();
    setSprintTimeRemaining(60);
    setIsSprintFinished(false);
    setIsSprintActive(true);
    setTotalAttempted(0);
    setTotalCorrect(0);
    setStreak(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Reset Everything
  const handleReset = () => {
    setIsSprintActive(false);
    setIsSprintFinished(false);
    setSprintTimeRemaining(60);
    setStreak(0);
    setTotalAttempted(0);
    setTotalCorrect(0);
    setMasteredQuestionIds(new Set());
    initializeDeck();
  };

  // Render Prompt LaTeX with styled blank chip
  const promptLatexHtml = useMemo(() => {
    if (!currentQuestion) return '';
    return renderMath(currentQuestion.latexPromptWithBlank, true);
  }, [currentQuestion]);

  // Render Full LaTeX
  const fullLatexHtml = useMemo(() => {
    if (!currentQuestion) return '';
    return renderMath(currentQuestion.latexDisplay, true);
  }, [currentQuestion]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 px-3 sm:px-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#FF5B37]/20 bg-[#FF5B37]/10 px-3 py-1 text-xs font-semibold text-[#FF5B37]">
              <BrainCircuit className="h-4 w-4" />
              <span>Active Recall Memory Trainer • 0580, 0625 & 0620</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Formula Memory Quizzer
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Drill high-yield equations through fill-in-the-blank active recall. Master powers, variables, and constants before exam day.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#141416] p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => {
                setPracticeMode('mastery');
                setIsSprintActive(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                practiceMode === 'mastery'
                  ? 'bg-[#FF5B37] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Mastery Mode</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('sprint');
                if (!isSprintActive) handleStartSprint();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                practiceMode === 'sprint'
                  ? 'bg-[#FF5B37] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>60s Sprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl border border-white/[0.08] bg-[#18181b]">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'cie-math-0580', label: 'Maths 0580' },
            { id: 'cie-physics-0625', label: 'Physics 0625' },
            { id: 'cie-chem-0620', label: 'Chemistry 0620' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedSubject(tab.id as any);
                setSelectedTopic('all');
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition cursor-pointer ${
                selectedSubject === tab.id
                  ? 'border-[#FF5B37] bg-[#FF5B37]/10 text-[#FF5B37]'
                  : 'border-white/[0.08] bg-[#141416] text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Topic Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-[#141416] px-3 py-1 text-xs font-medium text-slate-200 focus:border-[#FF5B37] focus:outline-none cursor-pointer"
          >
            <option value="all">All Topics ({availableTopics.length})</option>
            {availableTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Live Gamified Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Streak Flame */}
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-semibold font-mono text-[#FF5B37]">{streak}</span>
              <span className="text-xs text-slate-400 font-medium">in a row</span>
            </div>
          </div>
          <Flame className={`h-5 w-5 ${streak > 2 ? 'text-[#FF5B37]' : 'text-slate-600'}`} />
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Accuracy</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-semibold font-mono text-emerald-400">
                {totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 100}%
              </span>
              <span className="text-xs text-slate-400 font-mono">({totalCorrect}/{totalAttempted})</span>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
        </div>

        {/* Mastered Deck Count */}
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Formulas Mastered</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-semibold font-mono text-slate-100">
                {masteredQuestionIds.size}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {filteredQuestions.length}</span>
            </div>
          </div>
          <Award className="h-5 w-5 text-slate-400" />
        </div>

        {/* Sprint Timer / Progress */}
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#18181b] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {practiceMode === 'sprint' ? 'Time Remaining' : 'Active Deck'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-semibold font-mono ${practiceMode === 'sprint' && sprintTimeRemaining <= 10 ? 'text-rose-400 animate-ping' : 'text-white'}`}>
                {practiceMode === 'sprint' ? `${sprintTimeRemaining}s` : `Card ${currentIndex + 1}/${questionDeck.length || 1}`}
              </span>
            </div>
          </div>
          <Clock className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* 4. Sprint Mode Completion Modal / Overlay */}
      {practiceMode === 'sprint' && isSprintFinished && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-xl bg-[#FF5B37]/10 text-[#FF5B37] border border-[#FF5B37]/20">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold text-white">60-Second Sprint Complete</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              You completed {totalAttempted} formula recalls with a highest streak of {highestStreak}!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2">
            <div className="p-3.5 rounded-xl bg-[#141416] border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-medium">Total Correct</span>
              <span className="text-xl font-semibold font-mono text-emerald-400">{totalCorrect}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141416] border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
              <span className="text-xl font-semibold font-mono text-[#FF5B37]">
                {totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141416] border border-white/[0.08]">
              <span className="text-xs text-slate-400 block font-medium">Max Streak</span>
              <span className="text-xl font-semibold font-mono text-slate-100">{highestStreak}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleStartSprint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#e04f2e] text-white font-semibold text-xs transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Sprint</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('mastery');
                setIsSprintFinished(false);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] bg-[#222225] text-white font-semibold text-xs hover:bg-white/[0.08] transition cursor-pointer"
            >
              <span>Back to Mastery Deck</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Active Recall Formula Card */}
      {(!isSprintFinished || practiceMode === 'mastery') && currentQuestion && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-xl overflow-hidden">
          {/* Card Top Meta */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#141416]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md border border-[#FF5B37]/20 bg-[#FF5B37]/10 text-[#FF5B37]">
                {currentQuestion.subjectName}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-md border border-white/[0.08] bg-white/[0.04] text-slate-300">
                {currentQuestion.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">
                Target: <span className="text-[#FF5B37] font-semibold">{currentQuestion.blankPositionName}</span>
              </span>
            </div>
          </div>

          {/* Big Formula Display Area */}
          <div className="p-6 sm:p-8 text-center space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {currentQuestion.name}
            </h2>

            {/* LaTeX Equation Container with clean nocturnal border */}
            <div className="relative inline-block mx-auto max-w-full overflow-x-auto py-5 px-6 rounded-xl border border-white/[0.08] bg-[#141416]">
              <div
                className="text-lg sm:text-2xl text-slate-100 font-serif leading-loose"
                dangerouslySetInnerHTML={{ __html: promptLatexHtml }}
              />
            </div>

            <p className="text-xs text-slate-400">
              Type the missing variable, power, or constant below, or select from the multiple-choice options.
            </p>

            {/* Dual Input Area */}
            {!isAnswerSubmitted ? (
              <div className="max-w-md mx-auto space-y-4">
                {/* 1. Direct Text / Variable Input Chip */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userTypedAnswer}
                      onChange={(e) => {
                        setUserTypedAnswer(e.target.value);
                        setSelectedPillOption(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitAnswer();
                        }
                      }}
                      placeholder={`Fill blank [ ? ] (e.g. ${currentQuestion.options[0]})`}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#141416] px-3.5 py-2.5 text-xs font-mono font-semibold text-white placeholder-slate-500 focus:border-[#FF5B37] focus:outline-none transition"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitAnswer()}
                    disabled={!userTypedAnswer.trim() && !selectedPillOption}
                    className="px-4 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#e04f2e] text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Check
                  </button>
                </div>

                {/* 2. Multiple-Choice Variable Pills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Or select quick variable pill:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedPillOption(opt);
                          setUserTypedAnswer(opt);
                          handleSubmitAnswer(opt);
                        }}
                        className="py-2 px-3 rounded-lg border border-white/[0.08] bg-[#141416] text-xs font-mono font-medium text-slate-200 hover:border-[#FF5B37] hover:text-[#FF5B37] hover:bg-[#222225] transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span dangerouslySetInnerHTML={{ __html: renderMath(opt, false) }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Submission Result & Examiner Explanation Panel */
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    isLastAnswerCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isLastAnswerCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    )}
                    <div className="text-left">
                      <div className="text-xs font-semibold">
                        {isLastAnswerCorrect ? 'Exact Match! Formula Mastered' : 'Incorrect Recall'}
                      </div>
                      <div className="text-xs opacity-90">
                        {isLastAnswerCorrect
                          ? `Accepted: "${currentQuestion.correctAnswer}"`
                          : `Correct answer was: "${currentQuestion.correctAnswer}"`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#e04f2e] text-white font-semibold text-xs transition cursor-pointer shrink-0"
                  >
                    <span>Next Formula</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Completed Formula Equation */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#141416] space-y-1.5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Full Completed Equation
                  </span>
                  <div
                    className="text-base sm:text-xl text-white font-serif py-1"
                    dangerouslySetInnerHTML={{ __html: fullLatexHtml }}
                  />
                </div>

                {/* Variable Definitions with SI Units */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#141416] text-left space-y-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Official Variable Breakdown & SI Units
                  </span>
                  <div className="space-y-1.5">
                    {currentQuestion.variableDefinitions.map((v, idx) => (
                      <div key={idx} className="flex items-baseline justify-between gap-4 text-xs border-b border-white/[0.04] pb-1.5 last:border-b-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-mono font-semibold text-[#FF5B37]"
                            dangerouslySetInnerHTML={{ __html: renderMath(v.symbol, false) }}
                          />
                          <span className="text-slate-300">{v.meaning}</span>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] shrink-0">
                          {v.siUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examiner Exam Tool & Formula Sheet Notice */}
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] text-left flex items-start gap-3">
                  <Calculator className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">Cambridge & Edexcel Exam Condition Notice:</strong>
                    {currentQuestion.examToolNotice}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
