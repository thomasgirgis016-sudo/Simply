import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { Subject, QuizQuestion, UserProfile } from '../types';
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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [totalMarksEarned, setTotalMarksEarned] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // AI Quiz Generator modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const subjectQuizzes = quizzes.filter(q => isSubjectMatch(q.subjectId, subject));
  const filteredQuizzes = selectedTopic === 'All'
    ? subjectQuizzes
    : subjectQuizzes.filter(q => q.topic === selectedTopic);

  const currentQuestion = filteredQuizzes[currentIdx];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

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

  const totalPossibleMarks = filteredQuizzes.reduce((sum, q) => sum + q.marks, 0);
  const percentage = totalPossibleMarks > 0
    ? Math.round((totalMarksEarned / totalPossibleMarks) * 100)
    : 0;

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
            <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              {subject.code} • Past Paper Mock Quizzes
            </span>
            <h2 className="text-xl font-bold text-white mt-1">IGCSE Exam Practice & Mark Schemes</h2>
            <p className="text-xs text-slate-400">Past paper questions with official mark scheme criteria</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Mock Quiz</span>
            </button>
          </div>
        </div>

        {/* Topic filter bar */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => { setSelectedTopic('All'); handleRestart(); }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 ${
              selectedTopic === 'All'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Questions ({subjectQuizzes.length})
          </button>
          {subject.topics.map((t) => {
            const count = subjectQuizzes.filter(q => q.topic === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => { setSelectedTopic(t); handleRestart(); }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 ${
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

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate New AI Mock Quiz</span>
            </button>
          </div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No mock questions for this topic yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Generate past-paper style questions on demand with Gemini AI!
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
          >
            <Sparkles className="h-4 w-4" />
            Generate with Gemini
          </button>
        </div>
      ) : (
        /* Question Card */
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 md:p-8 shadow-xl">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  {currentQuestion?.topic}
                </span>
                {currentQuestion?.paperReference && (
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                    {currentQuestion.paperReference}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
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

            {/* Submit / Next Button */}
            <div className="mt-6 flex items-center justify-end">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer & Check Mark Scheme
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 transition"
                >
                  <span>{currentIdx + 1 === filteredQuizzes.length ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Answer Explanation & Mark Breakdown */}
            {isAnswerSubmitted && (
              <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5 animate-fadeIn">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
                  <Target className="h-4 w-4" />
                  Mark Scheme & Official Reason
                </div>

                <div className="space-y-3">
                  <MathRenderer
                    content={currentQuestion.markSchemeExplanation}
                    className="text-xs text-indigo-100 leading-relaxed"
                  />

                  {currentQuestion.markingBreakdown?.length > 0 && (
                    <div className="border-t border-indigo-900/50 pt-2.5">
                      <p className="text-[11px] font-bold uppercase text-indigo-400 mb-1.5">
                        Mark Allocation:
                      </p>
                      <ul className="space-y-1 text-xs text-indigo-200">
                        {currentQuestion.markingBreakdown.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Generate Quiz Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Generate Past Paper Mock Quiz</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Choose or type any topic from {subject.name} to generate 3 targeted exam-style questions with full mark scheme breakdown.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Syllabus Topic
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Waves & Sound, Le Chatelier principle, Circle theorems"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {subject.topics.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiTopic(t)}
                    className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-emerald-500 hover:text-white"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiQuiz}
                disabled={isGenerating || !aiTopic.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Creating Mock Questions...</span>
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
    </div>
  );
};
