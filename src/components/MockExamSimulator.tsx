import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  ChevronLeft,
  Flag,
  FileText,
  Calculator,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Subject, UserProfile, PastPaperItem } from '../types';
import { getAllPastPapers } from '../data/pastPapersData';
import { MathRenderer } from './MathRenderer';
import { evaluateStudentAnswerAgainstMarkScheme, ExamGradingResult } from '../services/examQuestionEngine';
import { completeDailyChallenge } from '../services/dailyStreak';

interface MockExamSimulatorProps {
  subject: Subject;
  profile: UserProfile;
  onOpenCalculator?: () => void;
  onSelectPaperItem?: (item: PastPaperItem) => void;
}

interface QuestionAnswerState {
  questionId: string;
  studentAnswer: string;
  studentWorking: string;
  isFlagged: boolean;
  gradingResult?: ExamGradingResult;
}

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  subject,
  profile,
  onOpenCalculator,
}) => {
  const [examStatus, setExamStatus] = useState<'setup' | 'active' | 'submitted'>('setup');
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);

  // Filter available papers for active subject
  const subjectPapers = useMemo(() => {
    const all = getAllPastPapers();
    const matched = all.filter(p => p.subjectId === subject.id || p.subjectId.includes(subject.code));
    return matched.length > 0 ? matched : all.slice(0, 8);
  }, [subject]);

  // Selected paper questions for the mock exam (typically 5 to 8 questions totalling ~40-60 marks)
  const examQuestions = useMemo(() => {
    return subjectPapers.slice(0, Math.min(subjectPapers.length, 6));
  }, [subjectPapers]);

  // Student answer state per question
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});

  useEffect(() => {
    const initial: Record<string, QuestionAnswerState> = {};
    examQuestions.forEach(q => {
      initial[q.id] = {
        questionId: q.id,
        studentAnswer: '',
        studentWorking: '',
        isFlagged: false
      };
    });
    setAnswers(initial);
  }, [examQuestions]);

  // Countdown Timer
  useEffect(() => {
    if (examStatus !== 'active' || isTimerPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStatus, isTimerPaused]);

  const handleStartExam = () => {
    setSecondsRemaining(selectedDurationMins * 60);
    setExamStatus('active');
    setIsTimerPaused(false);
    setCurrentQuestionIndex(0);
  };

  const handleUpdateAnswer = (val: string) => {
    const q = examQuestions[currentQuestionIndex];
    if (!q) return;
    setAnswers(prev => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        studentAnswer: val
      }
    }));
  };

  const handleUpdateWorking = (val: string) => {
    const q = examQuestions[currentQuestionIndex];
    if (!q) return;
    setAnswers(prev => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        studentWorking: val
      }
    }));
  };

  const handleToggleFlag = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isFlagged: !prev[id]?.isFlagged
      }
    }));
  };

  const handleSubmitExam = () => {
    // Grade each question against official mark scheme criteria
    const gradedAnswers: Record<string, QuestionAnswerState> = { ...answers };
    let totalMarksAwarded = 0;

    examQuestions.forEach(q => {
      const studentSubmission = (answers[q.id]?.studentAnswer || '') + ' ' + (answers[q.id]?.studentWorking || '');
      const evalRes = evaluateStudentAnswerAgainstMarkScheme(q, studentSubmission);
      gradedAnswers[q.id] = {
        ...gradedAnswers[q.id],
        gradingResult: evalRes
      };
      totalMarksAwarded += evalRes.marksEarned;
    });

    setAnswers(gradedAnswers);
    setExamStatus('submitted');

    // Update daily study streak
    if (totalMarksAwarded > 0) {
      completeDailyChallenge({
        questionId: examQuestions[0]?.id || 'mock_exam',
        paperCode: examQuestions[0]?.paperCode || subject.code,
        marksEarned: totalMarksAwarded,
        subjectId: subject.id
      });
    }
  };

  // Grade computation
  const totalMaxMarks = useMemo(() => {
    return examQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
  }, [examQuestions]);

  const totalEarnedMarks = useMemo(() => {
    if (examStatus !== 'submitted') return 0;
    return Object.values(answers).reduce((sum, a) => sum + (a.gradingResult?.marksEarned || 0), 0);
  }, [answers, examStatus]);

  const scorePercentage = Math.round((totalEarnedMarks / (totalMaxMarks || 1)) * 100);

  const awardedGrade = useMemo(() => {
    if (scorePercentage >= 85) return { grade: '9', letter: 'A*', color: 'text-amber-400', border: 'border-amber-500/50', badge: 'bg-amber-500/20' };
    if (scorePercentage >= 75) return { grade: '8', letter: 'A*', color: 'text-amber-300', border: 'border-amber-400/40', badge: 'bg-amber-400/20' };
    if (scorePercentage >= 65) return { grade: '7', letter: 'A', color: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20' };
    if (scorePercentage >= 55) return { grade: '6', letter: 'B', color: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-cyan-500/20' };
    if (scorePercentage >= 45) return { grade: '5', letter: 'C', color: 'text-blue-400', border: 'border-blue-500/40', badge: 'bg-blue-500/20' };
    if (scorePercentage >= 35) return { grade: '4', letter: 'D', color: 'text-indigo-400', border: 'border-indigo-500/40', badge: 'bg-indigo-500/20' };
    return { grade: 'U', letter: 'U', color: 'text-rose-400', border: 'border-rose-500/40', badge: 'bg-rose-500/20' };
  }, [scorePercentage]);

  // Format Timer
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining <= 300; // < 5 mins

  // Current active question
  const currentQ = examQuestions[currentQuestionIndex];
  const currentAns = currentQ ? answers[currentQ.id] : null;

  const isLanguageSubject = subject.category === 'Languages' ||
    subject.id.includes('esl') ||
    subject.id.includes('eng') ||
    subject.code.includes('0510') ||
    subject.code.includes('0500') ||
    subject.code.includes('4ES1') ||
    subject.code.includes('9270');

  return (
    <div className={`mx-auto max-w-5xl space-y-6 animate-fadeIn pb-12 ${isFullscreen ? 'p-4 bg-slate-950 min-h-screen' : ''}`}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SETUP / COVER PAGE                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {examStatus === 'setup' && (
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Official Cambridge Style Exam Cover Header */}
          <div className="border-b-2 border-slate-700/80 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  <Award className="h-3.5 w-3.5" />
                  <span>Cambridge Assessment International Education Simulator</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Cambridge IGCSE™ Mock Examination
                </h1>
                <p className="text-sm font-semibold text-slate-300">
                  {subject.name} ({subject.code}) • {isLanguageSubject ? 'Reading & Writing Mock Paper' : 'Extended Theory Paper'}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div>CENTER: <span className="text-white font-bold">EG998 / SIMPLY</span></div>
                <div>CANDIDATE: <span className="text-amber-300 font-bold">{profile.name}</span></div>
                <div>TARGET: <span className="text-emerald-400 font-bold">{profile.targetGrade}</span></div>
              </div>
            </div>
          </div>

          {/* Exam Rules & Instructions Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Official Examination Instructions</span>
            </h3>
            {isLanguageSubject ? (
              <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                <li>Read each text carefully and answer all questions in the spaces provided.</li>
                <li>For reading comprehension, write concisely and adhere to line limits; avoid lifting whole sentences where your own words are required.</li>
                <li>For summary writing, observe the strict <strong className="text-white">100–120 word count limit</strong>. Points beyond 120 words are not credited.</li>
                <li>Pay careful attention to spelling, punctuation, formal register, and discourse connectives.</li>
                <li>Dictionaries and electronic translation aids are <strong className="text-white">not permitted</strong>.</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                <li>Answer all questions in the spaces provided. Working must be shown for all calculation steps.</li>
                <li>Omission of essential working will result in loss of <strong className="text-white">Method Marks [M1]</strong>.</li>
                <li>Electronic non-programmable calculators may be used where appropriate.</li>
                <li>Give non-exact numerical answers correct to <strong className="text-white">3 significant figures</strong>, or 1 decimal place for angles in degrees.</li>
                <li>Upon completion, your raw score will be benchmarked against official Cambridge Grade Thresholds.</li>
              </ul>
            )}
          </div>

          {/* Exam Configuration Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Duration</span>
              <div className="flex gap-2">
                {[45, 60, 90].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDurationMins(mins)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      selectedDurationMins === mins
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions</span>
              <div className="text-xl font-black text-white font-mono">{examQuestions.length} Questions</div>
              <span className="text-[11px] text-slate-500">Selected across 2021-2024 series</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Marks</span>
              <div className="text-xl font-black text-white font-mono">{totalMaxMarks} Marks</div>
              <span className="text-[11px] text-slate-500">Method & Accuracy allocations</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Timer starts immediately upon clicking Start.</span>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>Start Timed Examination</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. ACTIVE EXAM VIEW                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {examStatus === 'active' && currentQ && (
        <div className="space-y-4">
          {/* Top Live Status Bar */}
          <div className="sticky top-16 z-30 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white hidden sm:inline">{subject.code}</span>
              </div>

              {/* Live Timer */}
              <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1 font-mono text-sm font-black border ${
                isLowTime
                  ? 'border-rose-500/50 bg-rose-950/60 text-rose-300 animate-pulse'
                  : 'border-slate-700 bg-slate-950 text-amber-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                title={isTimerPaused ? "Resume Exam" : "Pause Timer"}
              >
                {isTimerPaused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Quick Tools & Submit Button */}
            <div className="flex items-center gap-2">
              {onOpenCalculator && (
                <button
                  type="button"
                  onClick={onOpenCalculator}
                  className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
                  title="Open Scientific Calculator"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  <span>Calculator</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold border transition cursor-pointer ${
                  currentAns?.isFlagged
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Flag</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you ready to submit your exam for Cambridge Mark Scheme grading?')) {
                    handleSubmitExam();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 transition cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>

          {/* Question Navigator Palette */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {examQuestions.map((q, idx) => {
              const ansState = answers[q.id];
              const isAnswered = Boolean(ansState?.studentAnswer?.trim() || ansState?.studentWorking?.trim());
              const isFlagged = Boolean(ansState?.isFlagged);
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isFlagged
                      ? 'border border-amber-500/50 bg-amber-950/40 text-amber-300'
                      : isAnswered
                      ? 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {isFlagged && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Question Work Area Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {examQuestions.length} • {currentQ.topic}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">
                  Reference: {currentQ.paperCode} ({currentQ.session}) • {currentQ.questionNumber}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-black text-amber-300 border border-slate-800">
                [{currentQ.marks || 4} Marks]
              </div>
            </div>

            {/* Question Text & Math */}
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              <MathRenderer content={currentQ.questionPrompt} />
            </div>

            {currentQ.diagramOrMath && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <MathRenderer content={currentQ.diagramOrMath} />
              </div>
            )}

            {/* Student Working Pad */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Show Step-by-Step Working [Method Marks M1/M2]:</span>
                  <span className="text-[10px] text-slate-500">LaTeX math supported (e.g. \frac, \sqrt)</span>
                </label>
                <textarea
                  rows={4}
                  value={currentAns?.studentWorking || ''}
                  onChange={(e) => handleUpdateWorking(e.target.value)}
                  placeholder="Show all formulas used, algebraic substitutions, and steps leading to your answer..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Final Numerical or Stated Answer [Accuracy Mark A1]:
                </label>
                <input
                  type="text"
                  value={currentAns?.studentAnswer || ''}
                  onChange={(e) => handleUpdateAnswer(e.target.value)}
                  placeholder="e.g. 24.5 cm² or x = 4, x = -2..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm font-mono text-amber-300 font-bold placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === examQuestions.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                className="flex items-center gap-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SUBMITTED / OFFICIAL GRADE BOUNDARY REPORT                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {examStatus === 'submitted' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Performance Hero Card */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Exam Completed & Evaluated Against Cambridge Mark Scheme</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Official Grade Boundary Result
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {subject.name} ({subject.code}) • Simulated Cambridge Extended Benchmark
                </p>
              </div>

              {/* Awarded Grade Badge */}
              <div className={`rounded-3xl border-2 ${awardedGrade.border} ${awardedGrade.badge} p-5 text-center min-w-[140px] shadow-2xl`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Awarded Grade</div>
                <div className={`text-4xl sm:text-5xl font-black font-mono ${awardedGrade.color} my-1`}>
                  {awardedGrade.grade}
                </div>
                <div className="text-xs font-bold text-slate-200">{scorePercentage}% ({totalEarnedMarks}/{totalMaxMarks} Marks)</div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Question-by-Question Cambridge Mark Scheme Breakdown</span>
            </h3>

            <button
              type="button"
              onClick={() => {
                setExamStatus('setup');
                setCurrentQuestionIndex(0);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Sit Another Mock Exam</span>
            </button>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            {examQuestions.map((q, idx) => {
              const res = answers[q.id]?.gradingResult;
              const isFullMarks = res && res.marksEarned === res.totalMarks;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">Q{idx + 1}. {q.topic}</span>
                        <span className="text-xs text-slate-400 font-mono">({q.paperCode} • {q.questionNumber})</span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans">
                        <MathRenderer content={q.questionPrompt} />
                      </div>
                    </div>

                    <div className={`rounded-xl px-3 py-1 text-xs font-black shrink-0 ${
                      isFullMarks
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {res?.marksEarned || 0} / {q.marks || 4} Marks
                    </div>
                  </div>

                  {/* Student Submission vs Mark Scheme */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                      <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Your Answer & Working</div>
                      <div className="font-mono text-white text-xs whitespace-pre-wrap">
                        {answers[q.id]?.studentAnswer || answers[q.id]?.studentWorking || <span className="text-slate-600">No answer provided</span>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                      <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Official Cambridge Mark Scheme</div>
                      <div className="font-mono text-emerald-300 text-xs font-bold">
                        {q.finalAnswer}
                      </div>
                      {q.markScheme?.[0] && (
                        <div className="text-slate-400 text-[11px] mt-1">
                          {q.markScheme[0].markType}: {q.markScheme[0].requirement}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Examiner Commentary */}
                  {res?.examinerTips && (
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-xs text-indigo-200">
                      <strong>Examiner Remark:</strong> {res.examinerTips}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
