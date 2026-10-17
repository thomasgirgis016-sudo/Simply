import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ArrowRight,
  Target,
  FileText,
  Clock,
  Timer,
  History,
  X,
  Copy,
  Check
} from 'lucide-react';
import { Subject, QuizQuestion, UserProfile, QuizHistoryEntry } from '../types';
import { MathRenderer } from './MathRenderer';
import { generateQuizWithGemini } from '../services/gemini';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface QuizViewProps {
  subject: Subject;
  profile: UserProfile;
  quizzes: QuizQuestion[];
  onAddQuizzes: (newQuizzes: QuizQuestion[]) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  subject,
  profile,
  quizzes,
  onAddQuizzes,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Core' | 'Extended'>('All');
  const [selectedPaper, setSelectedPaper] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [totalMarksEarned, setTotalMarksEarned] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Timed simulation state (1.5 min per mark standard IGCSE pacing)
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [quizStartTime] = useState<number>(Date.now());
  const [copiedRef, setCopiedRef] = useState(false);

  // AI Quiz Generator modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // History modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_quiz_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Filter quizzes by subject, topic, tier, and paper component
  const subjectQuizzes = quizzes.filter(q => isSubjectMatch(q.subjectId, subject));
  const filteredQuizzes = subjectQuizzes.filter((q) => {
    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesTier =
      selectedTier === 'All' ||
      (q.tier ? q.tier === selectedTier : selectedTier === 'Extended' ? q.marks >= 2 : q.marks <= 2);
    const matchesPaper =
      selectedPaper === 'All' ||
      (q.paperReference ? q.paperReference.toLowerCase().includes(selectedPaper.toLowerCase()) : true);
    return matchesTopic && matchesTier && matchesPaper;
  });

  const currentQuestion = filteredQuizzes[currentIdx];

  // Timer effect per question (Standard IGCSE pacing: 1.5 minutes = 90s per mark)
  useEffect(() => {
    if (!isTimerEnabled || isAnswerSubmitted || isQuizFinished || !currentQuestion) return;

    const totalSeconds = (currentQuestion.marks || 2) * 90;
    setSecondsRemaining(totalSeconds);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isTimerEnabled, isAnswerSubmitted, isQuizFinished, currentQuestion]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const totalPossibleMarks = filteredQuizzes.reduce((sum, q) => sum + q.marks, 0);
  const percentage = totalPossibleMarks > 0
    ? Math.round((totalMarksEarned / totalPossibleMarks) * 100)
    : 0;

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQuestion) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    if (isCorrect) {
      setUserScore(prev => prev + 1);
      setTotalMarksEarned(prev => prev + currentQuestion.marks);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < filteredQuizzes.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save to localStorage history log
      const timeSpent = Math.max(10, Math.floor((Date.now() - quizStartTime) / 1000));
      const newEntry: QuizHistoryEntry = {
        id: `hist-${Date.now()}`,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        subjectId: subject.id,
        subjectName: subject.name,
        topic: selectedTopic,
        score: userScore,
        totalQuestions: filteredQuizzes.length,
        marksEarned: totalMarksEarned,
        totalMarks: totalPossibleMarks,
        percentage: percentage,
        timeSpentSeconds: timeSpent,
      };

      try {
        const updated = [newEntry, ...quizHistory].slice(0, 30);
        localStorage.setItem('simply_igcse_quiz_history', JSON.stringify(updated));
        setQuizHistory(updated);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setUserScore(0);
    setTotalMarksEarned(0);
    setIsQuizFinished(false);
  };

  const handleGenerateAiQuiz = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateQuizWithGemini(
        subject.name,
        aiTopic.trim(),
        profile.geminiApiKey,
        profile.selectedModel
      );
      onAddQuizzes(generated);
      setIsAiModalOpen(false);
      setAiTopic('');
      setSelectedTopic('All');
      handleRestart();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPaperRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const estimateGrade = (pct: number) => {
    if (pct >= 85) return { grade: 'Grade 9 / A*', color: 'text-emerald-400' };
    if (pct >= 75) return { grade: 'Grade 8 / A*', color: 'text-cyan-400' };
    if (pct >= 65) return { grade: 'Grade 7 / A', color: 'text-blue-400' };
    if (pct >= 55) return { grade: 'Grade 6 / B', color: 'text-amber-400' };
    return { grade: 'Grade 5 / C (Pass)', color: 'text-rose-400' };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                {subject.code} • Past Paper Mock Quizzes
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 border border-slate-700">
                {subject.board} Official Syllabus
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">IGCSE Exam Practice & Mark Schemes</h2>
            <p className="text-xs text-slate-400">Authentic past paper questions with [M], [A], [B] mark scheme breakdowns</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pacing Timer Toggle */}
            <button
              onClick={() => setIsTimerEnabled(!isTimerEnabled)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                isTimerEnabled
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Toggle timed exam simulation (1.5 min per mark standard pacing)"
            >
              <Timer className="h-4 w-4 text-amber-400" />
              <span>{isTimerEnabled ? 'Exam Timer: ON' : 'Pacing Timer'}</span>
            </button>

            {/* Score History */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="View past quiz attempts & score history"
            >
              <History className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Score History</span>
            </button>

            {/* AI Generate Questions */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Generate More</span>
            </button>
          </div>
        </div>

        {/* Tier & Paper Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Core vs Extended */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier:</span>
              {(['All', 'Core', 'Extended'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => { setSelectedTier(tier); handleRestart(); }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Paper Component Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paper:</span>
              {(['All', 'Paper 2', 'Paper 4'] as const).map((paper) => (
                <button
                  key={paper}
                  onClick={() => { setSelectedPaper(paper === 'All' ? 'All' : paper); handleRestart(); }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    (selectedPaper === 'All' && paper === 'All') || selectedPaper === paper
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {paper}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-400">
            {filteredQuizzes.length} questions available
          </span>
        </div>

        {/* Topic filter bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => { setSelectedTopic('All'); handleRestart(); }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${
              selectedTopic === 'All'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Topics ({subjectQuizzes.length})
          </button>
          {subject.topics.map((t) => {
            const count = subjectQuizzes.filter(q => q.topic === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => { setSelectedTopic(t); handleRestart(); }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedTopic === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Finished Summary Screen */}
      {isQuizFinished ? (
        <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-indigo-950/40 p-8 text-center shadow-2xl animate-fadeIn">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-4">
            <Award className="h-10 w-10" />
          </div>

          <h3 className="text-2xl font-extrabold text-white">Mock Quiz Completed!</h3>
          <p className="mt-1 text-sm text-slate-300">
            You scored <span className="font-bold text-emerald-400">{totalMarksEarned} / {totalPossibleMarks} marks</span> ({percentage}%)
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimated IGCSE Grade Boundary
            </p>
            <p className={`mt-1 text-2xl font-black ${estimateGrade(percentage).color}`}>
              {estimateGrade(percentage).grade}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Target Goal: <span className="font-bold text-amber-400">{profile.targetGrade}</span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <History className="h-4 w-4 text-cyan-400" />
              <span>Review Past Attempts</span>
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate New AI Questions</span>
            </button>
          </div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No mock questions for these filter criteria</h3>
          <p className="mt-1 text-xs text-slate-500">
            Try switching Tier or Paper filters, or generate past-paper style questions on demand!
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Generate with IGCSE AI
          </button>
        </div>
      ) : (
        /* Question Card */
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 md:p-8 shadow-xl">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  {currentQuestion?.topic}
                </span>

                {/* Past Paper Session Badge */}
                {currentQuestion?.paperReference && (
                  <button
                    onClick={() => copyPaperRef(currentQuestion.paperReference!)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition cursor-pointer"
                    title="Click to copy paper session reference for past paper search"
                  >
                    <FileText className="h-3 w-3 text-cyan-400" />
                    <span>{currentQuestion.paperReference}</span>
                    {copiedRef ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-500" />}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Real-time exam countdown timer if enabled */}
                {isTimerEnabled && (
                  <div
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold border transition ${
                      secondsRemaining < 20
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : secondsRemaining < 45
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-emerald-400 border-slate-700'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {Math.floor(secondsRemaining / 60)}:
                      {(secondsRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}

                <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/20">
                  [{currentQuestion?.marks} Marks]
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Question {currentIdx + 1} of {filteredQuizzes.length}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="my-6">
              <MathRenderer
                content={currentQuestion?.questionText || ''}
                className="text-base md:text-lg font-semibold text-white leading-relaxed"
              />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion?.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.id === currentQuestion.correctOptionId;

                let optClass = 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500';
                  } else {
                    optClass = 'border-slate-800/40 bg-slate-950/30 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  optClass = 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition select-none ${optClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-300">
                        {opt.id.replace('opt-', '').toUpperCase()}
                      </div>
                      <MathRenderer content={opt.text} className="text-sm font-medium" />
                    </div>

                    {isAnswerSubmitted && (
                      <div>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission / Navigation Bar */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
              <div className="text-xs text-slate-400">
                Score: <span className="font-bold text-emerald-400">{userScore} correct</span>
              </div>

              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-400 hover:to-teal-400 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Target className="h-4 w-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-400 hover:to-purple-500 transition active:scale-95 cursor-pointer"
                >
                  <span>{currentIdx + 1 === filteredQuizzes.length ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mark Scheme Breakdown & Explanation */}
          {isAnswerSubmitted && currentQuestion && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Official Mark Scheme Criteria & Notes</h4>
              </div>

              {/* Marking Points Breakdown */}
              {currentQuestion.markingBreakdown && currentQuestion.markingBreakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mark Allocation:</p>
                  <div className="space-y-1.5">
                    {currentQuestion.markingBreakdown.map((pt, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300"
                      >
                        <span className="font-mono font-bold text-emerald-400 shrink-0">
                          {pt.slice(0, 4)}
                        </span>
                        <MathRenderer content={pt.slice(4)} className="leading-relaxed" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step by step explanation */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Examiner Explanation:
                </p>
                <MathRenderer
                  content={currentQuestion.markSchemeExplanation}
                  className="text-xs text-slate-300 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>AI Mock Quiz Generator</span>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter any syllabus topic in <strong className="text-white">{subject.name}</strong> to generate realistic exam questions with step-by-step mark schemes.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Syllabus Topic:</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Chemical Bonding, Electrolysis, Trigonometry, Summary Writing..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiQuiz}
                disabled={isGenerating || !aiTopic.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History & Past Attempts Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <History className="h-5 w-5 text-cyan-400" />
                <span>Mock Quiz Attempts & Performance History</span>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Saved locally on your device across sessions.
            </p>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {quizHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No previous mock attempts recorded yet. Complete a quiz to track your scores!
                </div>
              ) : (
                quizHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.subjectName}</span>
                        <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {item.topic}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.date} • {Math.round(item.timeSpentSeconds / 60)}m pacing
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${item.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.marksEarned} / {item.totalMarks} ({item.percentage}%)
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {estimateGrade(item.percentage).grade}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              {quizHistory.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('simply_igcse_quiz_history');
                    setQuizHistory([]);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear History
                </button>
              )}
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="ml-auto rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
