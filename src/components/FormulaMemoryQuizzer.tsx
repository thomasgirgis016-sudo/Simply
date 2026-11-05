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
    <div className="mx-auto max-w-5xl space-y-8 pb-16 px-3 sm:px-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <BrainCircuit className="h-4 w-4" />
              <span>Active Recall Memory Trainer • 0580, 0625 & 0620</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Interactive Formula Memory Quizzer
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Drill high-yield equations through fill-in-the-blank active recall. Master powers, variables, and constants before exam day.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setPracticeMode('mastery');
                setIsSprintActive(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                practiceMode === 'mastery'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Mastery Mode</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('sprint');
                if (!isSprintActive) handleStartSprint();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                practiceMode === 'sprint'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>60s Sprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
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
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                selectedSubject === tab.id
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Topic Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
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
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Streak Multiplier</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-amber-400">{streak}</span>
              <span className="text-xs text-slate-400 font-semibold">in a row</span>
            </div>
          </div>
          <Flame className={`h-6 w-6 ${streak > 2 ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Accuracy</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-emerald-400">
                {totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 100}%
              </span>
              <span className="text-xs text-slate-400 font-mono">({totalCorrect}/{totalAttempted})</span>
            </div>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-500/60" />
        </div>

        {/* Mastered Deck Count */}
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Formulas Mastered</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-indigo-400">
                {masteredQuestionIds.size}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {filteredQuestions.length}</span>
            </div>
          </div>
          <Award className="h-6 w-6 text-indigo-400" />
        </div>

        {/* Sprint Timer / Progress */}
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {practiceMode === 'sprint' ? 'Time Remaining' : 'Active Deck'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-black font-mono ${practiceMode === 'sprint' && sprintTimeRemaining <= 10 ? 'text-rose-500 animate-ping' : 'text-white'}`}>
                {practiceMode === 'sprint' ? `${sprintTimeRemaining}s` : `Card ${currentIndex + 1}/${questionDeck.length || 1}`}
              </span>
            </div>
          </div>
          <Clock className="h-6 w-6 text-slate-400" />
        </div>
      </div>

      {/* 4. Sprint Mode Completion Modal / Overlay */}
      {practiceMode === 'sprint' && isSprintFinished && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Award className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">60-Second Sprint Complete!</h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Outstanding recall speed. You completed {totalAttempted} formula recalls with a highest streak of {highestStreak}!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block font-bold">Total Correct</span>
              <span className="text-2xl font-black text-emerald-400">{totalCorrect}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block font-bold">Accuracy</span>
              <span className="text-2xl font-black text-amber-400">
                {totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block font-bold">Max Streak</span>
              <span className="text-2xl font-black text-indigo-400">{highestStreak}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleStartSprint}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Sprint</span>
            </button>
            <button
              onClick={() => {
                setPracticeMode('mastery');
                setIsSprintFinished(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition cursor-pointer"
            >
              <span>Back to Mastery Deck</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Active Recall Formula Card */}
      {(!isSprintFinished || practiceMode === 'mastery') && currentQuestion && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden">
          {/* Card Top Meta */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                {currentQuestion.subjectName}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
                {currentQuestion.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                Target: <span className="text-amber-400 font-semibold">{currentQuestion.blankPositionName}</span>
              </span>
            </div>
          </div>

          {/* Big Formula Display Area */}
          <div className="p-6 sm:p-10 text-center space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentQuestion.name}
            </h2>

            {/* LaTeX Equation Container with glowing blank */}
            <div className="relative inline-block mx-auto max-w-full overflow-x-auto py-6 px-8 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-950 to-slate-900 shadow-inner">
              <div
                className="text-xl sm:text-3xl text-amber-200 font-serif leading-loose"
                dangerouslySetInnerHTML={{ __html: promptLatexHtml }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
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
                      className="w-full rounded-2xl border-2 border-slate-700 bg-slate-950 px-4 py-3 text-sm font-mono font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitAnswer()}
                    disabled={!userTypedAnswer.trim() && !selectedPillOption}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Check
                  </button>
                </div>

                {/* 2. Multiple-Choice Variable Pills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Or select quick variable pill:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedPillOption(opt);
                          setUserTypedAnswer(opt);
                          handleSubmitAnswer(opt);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-950/80 text-xs sm:text-sm font-mono font-bold text-slate-200 hover:border-amber-400 hover:text-amber-300 hover:bg-slate-900 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
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
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isLastAnswerCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isLastAnswerCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-bold">
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition cursor-pointer shrink-0"
                  >
                    <span>Next Formula</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Completed Formula Equation */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Full Completed Equation
                  </span>
                  <div
                    className="text-lg sm:text-2xl text-white font-serif py-1"
                    dangerouslySetInnerHTML={{ __html: fullLatexHtml }}
                  />
                </div>

                {/* Variable Definitions with SI Units */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Official Variable Breakdown & SI Units
                  </span>
                  <div className="space-y-2">
                    {currentQuestion.variableDefinitions.map((v, idx) => (
                      <div key={idx} className="flex items-baseline justify-between gap-4 text-xs border-b border-slate-900 pb-1.5 last:border-b-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-mono font-bold text-amber-300"
                            dangerouslySetInnerHTML={{ __html: renderMath(v.symbol, false) }}
                          />
                          <span className="text-slate-300">{v.meaning}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                          {v.siUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examiner Exam Tool & Formula Sheet Notice */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-left flex items-start gap-3">
                  <Calculator className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
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
