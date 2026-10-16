import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  RefreshCw,
  X,
  Target,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Subject, UserProfile, SolverResult } from '../types';
import { SAMPLE_SOLVER_QUESTIONS } from '../data/initialData';
import { solveQuestionWithGemini } from '../services/gemini';
import { MathRenderer } from './MathRenderer';

interface QuestionSolverProps {
  subject: Subject;
  profile: UserProfile;
  onOpenChatWithQuestion?: (question: string) => void;
}

export const QuestionSolver: React.FC<QuestionSolverProps> = ({
  subject,
  profile,
  onOpenChatWithQuestion,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSolve = async () => {
    if (!questionText.trim() && !selectedImage) return;

    setLoading(true);
    try {
      const res = await solveQuestionWithGemini({
        apiKey: profile.geminiApiKey,
        model: profile.selectedModel,
        questionText: questionText.trim() || undefined,
        imageBase64: selectedImage || undefined,
        imageMimeType,
        subjectName: subject.name,
        examBoard: profile.board === 'Both' ? subject.board : profile.board,
        gradeLevel: profile.grade,
      });
      setResult(res);
    } catch (err) {
      console.error('Solve error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuestion = (sample: typeof SAMPLE_SOLVER_QUESTIONS[0]) => {
    setQuestionText(sample.text);
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multimodal Vision & Mark Scheme Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            IGCSE AI Question & Photo Solver
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Snap a picture of any textbook problem, past paper question, or diagram. The AI gives you
            a step-by-step breakdown using official Cambridge & Edexcel mark scheme criteria ([M], [A], [B] marks) and examiner report warnings.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5 text-indigo-400" />
            Try an IGCSE Past Paper Question:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SOLVER_QUESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSampleQuestion(s)}
                className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:border-indigo-500 hover:bg-indigo-950/40 hover:text-white transition"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subject Context:
              </span>
              <span className="inline-flex items-center rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                {subject.code} • {subject.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hidden file & camera inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Camera className="h-4 w-4 text-emerald-400" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Upload className="h-4 w-4 text-cyan-400" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Image Preview if selected */}
          {selectedImage && (
            <div className="relative inline-block rounded-xl border border-indigo-500/40 bg-slate-950 p-2 shadow-inner">
              <img
                src={selectedImage}
                alt="Selected past paper problem"
                className="max-h-56 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-3 top-3 rounded-full bg-slate-900/90 p-1.5 text-slate-300 hover:bg-rose-600 hover:text-white transition shadow-md"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Text Area */}
          <div>
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type or paste the question text here (e.g. 'Solve 3x² - 5x + 1 = 0 giving your answer to 2 decimal places [3 marks]', or paste a physics problem)..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 p-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-400">
              {!profile.geminiApiKey && (
                <span className="text-amber-400 font-medium">
                  ✦ Running in Demo Mode (Try sample questions above or add API key in settings for custom photos)
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={handleSolve}
              disabled={loading || (!questionText.trim() && !selectedImage)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing with IGCSE Mark Scheme...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Solve & Reveal Mark Scheme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  {result.subject} • {result.topic}
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">Verified Mark Scheme Solution</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-extrabold text-emerald-400">
                  {result.totalMarks} Total Marks Available
                </span>
              </div>
            </div>

            {/* Transcribed Question */}
            <div className="mt-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Question Analyzed:
              </p>
              <MathRenderer content={result.questionText} className="text-sm text-slate-200" />
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              Step-by-Step Mark Awarding
            </h4>

            {result.stepByStepSolution.map((step, sIdx) => (
              <div
                key={sIdx}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                      {step.stepNumber}
                    </span>
                    <h5 className="font-bold text-white text-sm">{step.title}</h5>
                  </div>
                  {step.markAwarded && (
                    <span className="shrink-0 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-extrabold text-emerald-400 border border-emerald-500/20">
                      {step.markAwarded}
                    </span>
                  )}
                </div>

                <div className="mt-3 pl-10">
                  <MathRenderer content={step.explanation} className="text-sm text-slate-300" />
                  {step.mathOrCode && (
                    <div className="mt-3 rounded-lg bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                      <MathRenderer content={`$$${step.mathOrCode}$$`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final Answer Banner */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-900 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Official Final Answer & Exact Units
                </p>
                <MathRenderer
                  content={result.finalAnswer}
                  className="mt-1 text-base font-bold text-white"
                />
              </div>
            </div>
          </div>

          {/* Examiner Report & Pitfalls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Examiner Tips */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
              <div className="flex items-center gap-2 mb-3 text-amber-300">
                <Lightbulb className="h-5 w-5" />
                <h5 className="font-bold text-sm">Examiner Secrets & Tips</h5>
              </div>
              <ul className="space-y-2 text-xs text-amber-200/90">
                {result.examinerTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Traps / Mistakes */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
              <div className="flex items-center gap-2 mb-3 text-rose-300">
                <AlertTriangle className="h-5 w-5" />
                <h5 className="font-bold text-sm">Common Pitfalls to Avoid</h5>
              </div>
              <ul className="space-y-2 text-xs text-rose-200/90">
                {result.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick AI Tutor follow-up */}
          {onOpenChatWithQuestion && (
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-white">Still confused about this problem?</p>
                  <p className="text-[11px] text-slate-400">Ask the AI Examiner to give you a similar practice question or break down any step.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChatWithQuestion(result.questionText)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600/80 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                <span>Ask AI Tutor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
