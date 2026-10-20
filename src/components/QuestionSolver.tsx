import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  BookOpen,
  Flag,
  Check,
  PenTool,
  Award,
  Edit3,
  Search,
  ShieldCheck
} from 'lucide-react';
import { Subject, UserProfile, SolverResult, FlaggedQuestionIssue, HandwrittenReviewResult, PastPaperItem } from '../types';
import { SAMPLE_SOLVER_QUESTIONS } from '../data/initialData';
import { getAllPastPapers } from '../data/pastPapersData';
import { findPastPaperQuestionByReference, evaluateStudentAnswerAgainstMarkScheme, ExamGradingResult } from '../services/examQuestionEngine';
import { solveQuestionWithGemini, gradeHandwrittenWorkWithGemini } from '../services/gemini';
import { isSubjectMatch } from '../utils/subjectMatcher';
import { MathRenderer } from './MathRenderer';

interface QuestionSolverProps {
  subject: Subject;
  subjects?: Subject[];
  onSelectSubject?: (subject: Subject) => void;
  profile: UserProfile;
  onOpenChatWithQuestion?: (question: string) => void;
}

export const QuestionSolver: React.FC<QuestionSolverProps> = ({
  subject,
  subjects,
  onSelectSubject,
  profile,
  onOpenChatWithQuestion,
}) => {
  const [solverMode, setSolverMode] = useState<'solve' | 'exam-lookup' | 'handwritten'>('solve');
  const [questionText, setQuestionText] = useState('');
  const [studentTypedWorking, setStudentTypedWorking] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [handwrittenResult, setHandwrittenResult] = useState<HandwrittenReviewResult | null>(null);

  // Exam Question Lookup & Mark Scheme Grader State
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [selectedExamPaper, setSelectedExamPaper] = useState<PastPaperItem | null>(null);
  const [studentExamAnswer, setStudentExamAnswer] = useState('');
  const [examGradingResult, setExamGradingResult] = useState<ExamGradingResult | null>(null);
  const [showOfficialMarkScheme, setShowOfficialMarkScheme] = useState(false);

  const availableExamPapers = useMemo(() => {
    const all = getAllPastPapers();
    return all.filter((p) => {
      if (profile.board !== 'Both' && p.board !== profile.board) return false;
      return isSubjectMatch(p.subjectId, subject);
    });
  }, [profile.board, subject]);

  const filteredSampleQuestions = useMemo(() => {
    const list = SAMPLE_SOLVER_QUESTIONS.filter((s) => isSubjectMatch(s.subjectId, subject));
    return list.length > 0 ? list : SAMPLE_SOLVER_QUESTIONS.slice(0, 2);
  }, [subject]);

  const handleGradeExamAnswer = () => {
    if (!selectedExamPaper) return;
    if (!studentExamAnswer.trim()) {
      setErrorMessage('Please enter your answer or working steps first.');
      return;
    }
    setErrorMessage(null);
    const evalRes = evaluateStudentAnswerAgainstMarkScheme(selectedExamPaper, studentExamAnswer);
    setExamGradingResult(evalRes);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Flag / Report Issue state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('Arithmetic or calculation slip');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingFlagsStr = localStorage.getItem('simply_igcse_flagged_questions');
      const existingFlags: FlaggedQuestionIssue[] = existingFlagsStr ? JSON.parse(existingFlagsStr) : [];
      const newFlag: FlaggedQuestionIssue = {
        id: `flag-${Date.now()}`,
        date: new Date().toISOString(),
        questionText: result?.questionText || questionText,
        subject: result?.subject || subject.name,
        issueType: reportIssueType,
        details: reportDetails.trim() || undefined,
      };
      existingFlags.push(newFlag);
      localStorage.setItem('simply_igcse_flagged_questions', JSON.stringify(existingFlags));
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 1800);
    } catch (err) {
      console.error('Failed to save issue report:', err);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReportModalOpen) {
        setIsReportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isReportModalOpen]);

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
    if (!questionText.trim() && !studentTypedWorking.trim() && !selectedImage) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await solveQuestionWithGemini({
        apiKey: profile.geminiApiKey,
        model: profile.selectedModel,
        questionText: questionText.trim() || undefined,
        studentWorking: studentTypedWorking.trim() || undefined,
        imageBase64: selectedImage || undefined,
        imageMimeType,
        subjectName: subject.name,
        examBoard: profile.board === 'Both' ? subject.board : profile.board,
        gradeLevel: profile.grade,
      });
      setResult(res);
    } catch (err: any) {
      console.error('Solve error:', err);
      setErrorMessage(
        err?.message?.includes('network') || err?.message?.includes('fetch')
          ? 'Network connectivity interruption. Please verify your connection and tap Retry.'
          : err?.message || 'AI service busy or rate limit reached. Tap "Retry Solution" to re-attempt.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGradeHandwritten = async () => {
    if (!questionText.trim() && !studentTypedWorking.trim() && !selectedImage) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await gradeHandwrittenWorkWithGemini({
        apiKey: profile.geminiApiKey,
        model: profile.selectedModel,
        questionText: questionText.trim() || undefined,
        handwrittenImageBase64: selectedImage || undefined,
        handwrittenMimeType: imageMimeType,
        studentTypedWorking: studentTypedWorking.trim() || undefined,
        subjectName: subject.name,
        examBoard: profile.board === 'Both' ? subject.board : profile.board,
        gradeLevel: profile.grade,
      });
      setHandwrittenResult(res);
    } catch (err: any) {
      console.error('Handwritten grade error:', err);
      setErrorMessage(
        err?.message?.includes('network') || err?.message?.includes('fetch')
          ? 'Network connectivity interruption. Please verify your connection and tap Retry.'
          : err?.message || 'Could not complete handwritten grading. Please tap retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuestion = (sample: typeof SAMPLE_SOLVER_QUESTIONS[0]) => {
    setQuestionText(sample.text);
    setSelectedImage(null);
    setResult(null);
    setHandwrittenResult(null);
    setErrorMessage(null);

    // Auto-sync active global subject
    if (onSelectSubject && subjects) {
      const matched = subjects.find(
        (s) =>
          s.id.toLowerCase() === sample.subjectId.toLowerCase() ||
          sample.title.toLowerCase().includes(s.code.toLowerCase()) ||
          (s.code && sample.subjectId.toLowerCase().includes(s.code.toLowerCase()))
      );
      if (matched) {
        onSelectSubject(matched);
      }
    }
  };

  const loadSampleHandwrittenWork = (type: 'quadratic' | 'momentum') => {
    if (type === 'quadratic') {
      setQuestionText('Solve 3x^2 - 7x - 5 = 0 using the quadratic formula. Give solutions to 2 d.p.');
      setStudentTypedWorking(`Line 1: x = (-(-7) ± √((-7)^2 - 4(3)(-5))) / (2 * 3)
Line 2: x = (7 ± √(-49 + 60)) / 6   [Note: Student forgot brackets around -7]
Line 3: x = (7 ± √11) / 6
Line 4: x = 1.72 and x = 0.61`);
    } else {
      setQuestionText('A trolley of mass 0.8 kg at 2.5 m/s collides with a stationary trolley of 1.2 kg. Calculate combined velocity.');
      setStudentTypedWorking(`Line 1: Total momentum before = 0.8 * 2.5 = 2.0
Line 2: Total mass = 0.8 + 1.2 = 2.0 kg
Line 3: Final velocity v = 2.0 / 2.0 = 1.0  [Note: Student omitted units m/s]`);
    }
    setResult(null);
    setHandwrittenResult(null);
    setErrorMessage(null);
  };

  const getMarkBadge = (mark: string) => {
    const upper = mark.toUpperCase();
    if (upper.includes('[M') || upper.includes('M1') || upper.includes('M2')) {
      return {
        label: mark,
        type: 'Method Mark',
        badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      };
    }
    if (upper.includes('[A') || upper.includes('A1') || upper.includes('A2')) {
      return {
        label: mark,
        type: 'Accuracy Mark',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    }
    if (upper.includes('[B') || upper.includes('B1') || upper.includes('B2')) {
      return {
        label: mark,
        type: 'Independent Mark',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }
    return {
      label: mark,
      type: 'Mark Scheme',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    };
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
            <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filteredSampleQuestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSampleQuestion(s)}
                  className="shrink-0 rounded-lg border border-slate-700/70 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-200 hover:border-indigo-500 hover:bg-indigo-950/40 hover:text-white transition cursor-pointer"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setSolverMode('solve');
              setErrorMessage(null);
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition cursor-pointer ${
              solverMode === 'solve'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Solve Question / Photo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSolverMode('exam-lookup');
              setErrorMessage(null);
            }}
            className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition cursor-pointer ${
              solverMode === 'exam-lookup'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Search by Exam Code & Q#</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSolverMode('handwritten');
              setErrorMessage(null);
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition cursor-pointer ${
              solverMode === 'handwritten'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Grade Handwritten ($M1, A1$)</span>
          </button>
        </div>

        {/* Free Student AI Pass Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-white">Chief Examiner AI Engine Active</span>
                <span className="inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/25">
                  Cambridge & Edexcel Official Mark Scheme Rubrics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Full step-by-step method [M], accuracy [A], and syllabus keyword evaluation for {subject.name} ({subject.code}).
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
            {/* Image Upload Guidelines Helper */}
            <div className="flex items-center gap-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/25 px-3.5 py-2.5 text-xs text-indigo-200">
              <Camera className="h-4 w-4 text-indigo-400 shrink-0" />
              <p className="leading-snug">
                <span className="font-bold text-indigo-300">Tip:</span> Crop tightly around the diagram, keep text upright, and ensure the mark allocation (e.g. [3]) in the margin is visible.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subject Context:
                </span>
                <span className="inline-flex items-center rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                  {subject.code} • {subject.name}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
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
                  className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-emerald-400" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
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
                  className="max-h-56 rounded-lg object-contain w-full"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-3 top-3 rounded-full bg-slate-900/90 p-2 text-slate-300 hover:bg-rose-600 hover:text-white transition shadow-md cursor-pointer"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Text Areas based on mode */}
            {solverMode === 'exam-lookup' ? (
              <div className="space-y-4">
                {/* Search Exam Code & Q# Bar */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1.5 flex items-center justify-between">
                    <span>1. Search Exam Paper Code & Question Number:</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. 0580/42 Q6, 0620/42 Q7, 4MA1 Q12</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={examSearchQuery}
                      onChange={(e) => {
                        setExamSearchQuery(e.target.value);
                        const matched = findPastPaperQuestionByReference(e.target.value);
                        if (matched) {
                          setSelectedExamPaper(matched);
                          setStudentExamAnswer('');
                          setExamGradingResult(null);
                          setShowOfficialMarkScheme(false);
                        }
                      }}
                      placeholder="Type exam code & question (e.g. '0580/42 Q6' or '0620/42 Q7')..."
                      className="w-full rounded-xl border border-sky-500/40 bg-slate-950/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                    {examSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setExamSearchQuery('');
                          setSelectedExamPaper(null);
                          setExamGradingResult(null);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Exam Question Shortcuts */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Or select an authentic exam question from the archive:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableExamPapers.map((p) => {
                      const isSelected = selectedExamPaper?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedExamPaper(p);
                            setStudentExamAnswer('');
                            setExamGradingResult(null);
                            setShowOfficialMarkScheme(false);
                            setExamSearchQuery(`${p.paperCode} ${p.questionNumber}`);
                            if (onSelectSubject && subjects) {
                              const matchedSub = subjects.find(
                                (s) => s.id === p.subjectId || s.code === p.subjectCode
                              );
                              if (matchedSub) onSelectSubject(matchedSub);
                            }
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                          }`}
                        >
                          <span className="font-mono text-[11px] text-sky-300">{p.paperCode}</span>
                          <span className="font-bold">{p.questionNumber}</span>
                          <span className="text-[10px] text-slate-400">({p.marks}m)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Question Display Card */}
                {selectedExamPaper ? (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/20 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-200 border border-sky-500/30 font-mono">
                          {selectedExamPaper.paperCode} • {selectedExamPaper.session}
                        </span>
                        <span className="font-extrabold text-white text-sm">
                          {selectedExamPaper.questionNumber} ({selectedExamPaper.marks} Marks)
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-300 font-semibold">{selectedExamPaper.topic}</span>
                        <span className="text-xs text-sky-400 font-medium">({selectedExamPaper.difficultyTier})</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowOfficialMarkScheme(!showOfficialMarkScheme)}
                        className="rounded-xl border border-sky-500/40 bg-sky-900/40 px-3 py-1.5 text-xs font-bold text-sky-200 hover:bg-sky-800/60 transition cursor-pointer"
                      >
                        {showOfficialMarkScheme ? 'Hide Mark Scheme' : 'Reveal Mark Scheme Directly'}
                      </button>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Official Question Paper Statement:
                      </span>
                      <MathRenderer
                        content={selectedExamPaper.questionPrompt}
                        className="text-sm text-slate-100 font-medium leading-relaxed"
                      />
                      {selectedExamPaper.diagramOrMath && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center overflow-x-auto">
                          <MathRenderer content={`$$${selectedExamPaper.diagramOrMath}$$`} className="text-sm font-bold text-sky-300" />
                        </div>
                      )}
                    </div>

                    {/* Direct Mark Scheme Reveal (if requested) */}
                    {showOfficialMarkScheme && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4" />
                            Official Mark Scheme Steps:
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            Final Answer: {selectedExamPaper.finalAnswer}
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {selectedExamPaper.markScheme.map((m, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="font-mono font-bold text-indigo-400 shrink-0">{m.markType}</span>
                              <MathRenderer content={m.requirement} />
                            </div>
                          ))}
                        </div>
                        {selectedExamPaper.examinerReportSnippet && (
                          <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-950/30 p-2.5 text-xs text-amber-200">
                            <strong>Principal Examiner Report Advice:</strong> {selectedExamPaper.examinerReportSnippet}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Student Answer Input Box */}
                    <div className="pt-2 border-t border-sky-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5" />
                          Test Yourself: Enter Your Working or Final Answer to be Graded:
                        </label>
                        <span className="text-[10px] text-slate-400">Total Available: [{selectedExamPaper.marks} Marks]</span>
                      </div>
                      <textarea
                        rows={3}
                        value={studentExamAnswer}
                        onChange={(e) => setStudentExamAnswer(e.target.value)}
                        placeholder="Type your answer, numerical value, or working steps here (e.g. 'Distance = 39.0 km' or show your calculations)..."
                        className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleGradeExamAnswer}
                          disabled={!studentExamAnswer.trim()}
                          className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-indigo-500 transition cursor-pointer disabled:opacity-50"
                        >
                          Grade My Answer Against Official Mark Scheme
                        </button>
                      </div>
                    </div>

                    {/* Grading Assessment Report Card */}
                    {examGradingResult && (
                      <div className="rounded-2xl border border-indigo-500/40 bg-slate-950 p-5 space-y-4 shadow-xl animate-fadeIn">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-amber-400" />
                            <div>
                              <h4 className="text-sm font-bold text-white">Cambridge Examiner Assessment</h4>
                              <p className="text-[11px] text-slate-400">Graded against official {selectedExamPaper.paperCode} mark scheme</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-sm font-extrabold text-indigo-300">
                              Score: {examGradingResult.marksEarned} / {examGradingResult.totalMarks} Marks ({examGradingResult.percentage}%)
                            </span>
                            <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                              {examGradingResult.verdict}
                            </span>
                          </div>
                        </div>

                        {/* Marks Breakdown Table */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Marks Awarded Breakdown:
                          </span>
                          <div className="space-y-1.5">
                            {examGradingResult.marksBreakdown.map((m, idx) => (
                              <div
                                key={idx}
                                className={`rounded-xl border p-3 text-xs flex items-start justify-between gap-3 ${
                                  m.awarded
                                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                                    : 'border-rose-500/30 bg-rose-950/20 text-rose-200'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                    <span className="font-mono">{m.markType}</span>
                                    <span>{m.awarded ? '✅ [AWARDED]' : '❌ [LOST]'}</span>
                                  </div>
                                  <p className="text-slate-300">{m.requirement}</p>
                                  <p className="text-[11px] text-slate-400 mt-1 italic">{m.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Missing Marks Guidance */}
                        {examGradingResult.missingMarksExplained.length > 0 && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4" />
                              What Was Missing & Exact Phrasing Needed for Full Marks:
                            </span>
                            <div className="space-y-2 pt-1 text-xs text-amber-100">
                              {examGradingResult.missingMarksExplained.map((miss, idx) => (
                                <div key={idx} className="rounded-lg bg-amber-950/40 p-2.5 border border-amber-500/20 space-y-1">
                                  <p><strong>Missing {miss.markType}:</strong> {miss.whatWasMissing}</p>
                                  <p className="text-emerald-300 font-semibold">👉 {miss.whatToWriteToGetMark}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Official Final Answer Comparison */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Official Final Answer: </span>
                            <span className="font-mono font-bold text-white">${selectedExamPaper.finalAnswer}$</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Your Answer: </span>
                            <span className="font-mono font-bold text-slate-200">"{studentExamAnswer}"</span>
                          </div>
                        </div>

                        {selectedExamPaper.examinerReportSnippet && (
                          <div className="text-xs text-slate-400 italic">
                            💡 <strong>Examiner Report Advice:</strong> {selectedExamPaper.examinerReportSnippet}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center text-slate-400">
                    <BookOpen className="mx-auto h-8 w-8 text-sky-400 mb-2 opacity-80" />
                    <p className="text-sm font-bold text-slate-300">Select an exam question above or search by code.</p>
                    <p className="text-xs text-slate-500 mt-1">Try typing "0580/42 Q6", "0620/42 Q7", or "0625/41 Q2".</p>
                  </div>
                )}
              </div>
            ) : solverMode === 'solve' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    1. Question Statement or Problem:
                  </label>
                  <textarea
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type or paste the question text here (e.g. 'Solve 10 - x = 2' or '10 - 2 = 8' or upload a photo above)..."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 p-3.5 sm:p-4 text-base sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                      2. Test Your Working Line / Calculation (Optional):
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      e.g. write "10 - 2 = 8" or "10 + 2 = 8" to see marks awarded or exact error reasons
                    </span>
                  </label>
                  <input
                    type="text"
                    value={studentTypedWorking}
                    onChange={(e) => setStudentTypedWorking(e.target.value)}
                    placeholder="Type your working step here (e.g. '10 - 2 = 8' or '10 + 2 = 8')..."
                    className="w-full rounded-xl border border-indigo-500/30 bg-slate-950/80 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-indigo-200 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Handwritten Quick Samples */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  <span className="text-[11px] font-semibold text-slate-400">Try Student Work Sample:</span>
                  <button
                    type="button"
                    onClick={() => loadSampleHandwrittenWork('quadratic')}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    Maths: Quadratic (-7)² = -49 Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleHandwrittenWork('momentum')}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    Physics: Momentum Unit Omission
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    1. Question Statement:
                  </label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. Solve 3x² - 7x - 5 = 0 using the quadratic formula [3 marks]"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    2. Student's Handwritten Working (Type or Upload Photo above):
                  </label>
                  <textarea
                    rows={4}
                    value={studentTypedWorking}
                    onChange={(e) => setStudentTypedWorking(e.target.value)}
                    placeholder="Line 1: x = (-(-7) ± √((-7)² - 4*3*(-5))) / (2*3)&#10;Line 2: x = (7 ± √(-49 + 60)) / 6&#10;Line 3: ..."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 p-3.5 text-xs sm:text-sm font-mono text-amber-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] sm:text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">
                  ✦ Senior Cambridge Examiner System Active
                </span>
              </p>

              {solverMode === 'solve' ? (
                <button
                  type="button"
                  onClick={handleSolve}
                  disabled={loading || (!questionText.trim() && !studentTypedWorking.trim() && !selectedImage)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-3 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-pink-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Evaluating with Cambridge Examiner Criteria...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Solve & Reveal Mark Scheme</span>
                    </>
                  )}
                </button>
              ) : solverMode === 'handwritten' ? (
                <button
                  type="button"
                  onClick={handleGradeHandwritten}
                  disabled={loading || (!questionText.trim() && !studentTypedWorking.trim() && !selectedImage)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Grading Handwritten Method & Marks...</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="h-4 w-4" />
                      <span>Grade Handwritten Work ($M1, A1, B1$)</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {/* Popup Blocker Fallback Tip */}
            <p className="text-[11px] text-slate-400 text-center pt-1">
              💡 <span className="font-semibold text-slate-300">Tip:</span> If nothing happens when clicking Solve, please check your browser's popup blocker or add a free Gemini API key in ⚙ Settings.
            </p>

          {/* Error Message & Retry Fallback */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-300">Analysis Notice</p>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSolve}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition active:scale-95 shrink-0 shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Solution</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results View - 4 Distinct Examiner Sections */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  {result.subject} • {result.topic}
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">Cambridge & Edexcel Examiner Solution</h3>
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

          {/* Dedicated Student Working & Calculation Mark Evaluation Card */}
          {result.studentWorkingEvaluation && result.studentWorkingEvaluation.hasEvaluatedMath && (
            <div className={`rounded-2xl border p-5 shadow-xl space-y-4 animate-fadeIn ${
              result.studentWorkingEvaluation.lineReviews.every((l) => l.isCorrect)
                ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900'
                : 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className={`h-6 w-6 ${
                    result.studentWorkingEvaluation.lineReviews.every((l) => l.isCorrect)
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Cambridge Examiner Working & Calculation Evaluation
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Line-by-line mark scheme verification of your calculations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-xl px-3 py-1 text-sm font-black font-mono border ${
                    result.studentWorkingEvaluation.lineReviews.every((l) => l.isCorrect)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {result.studentWorkingEvaluation.marksEarned} / {result.studentWorkingEvaluation.marksPossible} Marks ({result.studentWorkingEvaluation.percentageScore}%)
                  </span>
                </div>
              </div>

              {/* Line by line review */}
              <div className="space-y-3">
                {result.studentWorkingEvaluation.lineReviews.map((line) => (
                  <div
                    key={line.lineNumber}
                    className={`rounded-xl border p-4 space-y-2 ${
                      line.isCorrect
                        ? 'border-emerald-500/30 bg-emerald-950/20'
                        : 'border-rose-500/30 bg-rose-950/25'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 font-bold">Line {line.lineNumber}:</span>
                      <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold font-mono border ${
                        line.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {line.markBadge}
                      </span>
                    </div>

                    <div className="font-mono text-xs sm:text-sm text-white bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {line.rawText}
                    </div>

                    <div className={`text-xs font-medium leading-relaxed ${
                      line.isCorrect ? 'text-emerald-300' : 'text-rose-200'
                    }`}>
                      {line.exactReason}
                    </div>

                    {line.exactCorrection && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-2.5 text-xs text-amber-200 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300">Exact Working Required: </strong>
                          <span className="font-mono font-bold text-white">{line.exactCorrection}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Senior Cambridge Examiner Autonomous AI Agent Verification Shield */}
          {result.examinerVerification && (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-inner">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Senior Cambridge Examiner AI Agent
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/40">
                      0-Mistake Audit Passed ✅
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {result.examinerVerification.details || 'Step-by-step arithmetic equality, SI units, 3 significant figures, and mark scheme criteria strictly validated.'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                  Accuracy Confidence: {result.examinerVerification.accuracyScorePercent}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Official CAIE & Edexcel Protocol
                </span>
              </div>
            </div>
          )}

          {/* Section 1: Core Concept & Formula */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/25 via-slate-900 to-indigo-950/20 p-5 shadow-md">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-black text-sky-400 border border-sky-500/30">
                1
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-300">
                Section 1: Core Concept & Required Equation
              </h4>
            </div>
            <div className="pl-0 sm:pl-8 space-y-2">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-bold text-white">Syllabus Topic & Principle: </span>
                {result.coreConceptAndFormula?.concept || result.topic}
              </p>
              {result.coreConceptAndFormula?.formula && (
                <div className="mt-2 rounded-xl bg-slate-950/80 p-3 border border-sky-500/20 font-mono text-xs sm:text-sm text-sky-200 overflow-x-auto max-w-full">
                  <MathRenderer content={`$$${result.coreConceptAndFormula.formula}$$`} />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Step-by-Step Working */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-black text-indigo-400 border border-indigo-500/30">
                  2
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                  Section 2: Step-by-Step Working & Method Mark Allocations
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Method ($M$)
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 ml-1" /> Accuracy ($A$)
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400 ml-1" /> Independent ($B$)
              </div>
            </div>

            <div className="space-y-3 pl-0 sm:pl-2">
              {result.stepByStepSolution.map((step, sIdx) => {
                const badge = step.markAwarded ? getMarkBadge(step.markAwarded) : null;
                return (
                  <div
                    key={sIdx}
                    className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-md hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/30 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                          {step.stepNumber}
                        </span>
                        <h5 className="font-bold text-white text-xs sm:text-sm">{step.title}</h5>
                      </div>
                      {badge && (
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-extrabold border ${badge.badgeClass}`}
                          title={badge.type}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pl-0 sm:pl-10">
                      <MathRenderer content={step.explanation} className="text-xs sm:text-sm text-slate-300 leading-relaxed" />
                      {step.mathOrCode && (
                        <div className="mt-3 rounded-xl bg-slate-950 p-3 border border-slate-800/80 font-mono text-xs text-indigo-300 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-700">
                          <MathRenderer content={`$$${step.mathOrCode}$$`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Final Answer & Units */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/20 p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-black text-emerald-400 border border-emerald-500/30">
                3
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-400">
                Section 3: Final Answer & Units (3 Significant Figures Rule)
              </h4>
            </div>
            <div className="pl-0 sm:pl-8 flex items-start gap-3">
              <CheckCircle className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
              <div className="w-full">
                <MathRenderer
                  content={result.finalAnswer}
                  className="text-sm sm:text-base font-bold text-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Examiner Trap */}
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-amber-950/20 p-5 shadow-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-xs font-black text-rose-400 border border-rose-500/30">
                4
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-300">
                Section 4: Examiner Trap & High-Frequency Errors
              </h4>
            </div>

            <div className="pl-0 sm:pl-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Examiner Traps */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4">
                <div className="flex items-center gap-2 mb-2.5 text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">Examiner Traps on this Question</h5>
                </div>
                <ul className="space-y-2 text-xs text-rose-200/90">
                  {((result.examinerTraps && result.examinerTraps.length > 0)
                    ? result.examinerTraps
                    : (result.commonMistakes || [])
                  ).map((trap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examiner Full-Mark Tips */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-4">
                <div className="flex items-center gap-2 mb-2.5 text-amber-300">
                  <Lightbulb className="h-4 w-4" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">Examiner Full-Mark Advice</h5>
                </div>
                <ul className="space-y-2 text-xs text-amber-200/90">
                  {(result.examinerTips || []).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Visible Accuracy Disclaimer & Flag / Report Issue Action */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Accuracy Notice: </span>
                AI models can make mistakes. Always cross-check final working with your teacher and official published mark schemes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsReportModalOpen(true);
                setReportSuccess(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-rose-500 hover:bg-rose-950/30 hover:text-rose-300 transition shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <Flag className="h-3.5 w-3.5 text-rose-400" />
              <span>Flag / Report Issue</span>
            </button>
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

      {/* Handwritten Work Examiner Review View */}
      {handwrittenResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-block rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                  Annotated Handwritten Examination
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">Cambridge Senior Examiner Graded Solution</h3>
              </div>

              {/* Marks Earned Pill */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Marks Awarded
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {handwrittenResult.marksEarned} / {handwrittenResult.totalMarksPossible} Marks
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {handwrittenResult.percentageScore}% Method Score
                </div>
              </div>
            </div>

            {/* Question Summary */}
            <div className="mt-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Question Graded:
              </p>
              <MathRenderer content={handwrittenResult.questionSummary} className="text-sm text-slate-200" />
            </div>
          </div>

          {/* Point of Failure Alert */}
          {handwrittenResult.breakdownPointOfFailure && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <span>Exact Step Where Method Broke Down:</span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed pl-7">
                {handwrittenResult.breakdownPointOfFailure}
              </p>
            </div>
          )}

          {/* Line-by-Line Red-Ink Examiner Annotations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-amber-400" />
              Line-by-Line Examiner Margin Annotations:
            </h4>

            <div className="space-y-3">
              {handwrittenResult.lineByLineReview.map((line) => (
                <div
                  key={line.lineNumber}
                  className={`rounded-xl border p-3.5 space-y-1.5 transition ${
                    line.isCorrect
                      ? 'border-emerald-500/25 bg-slate-950/70'
                      : 'border-rose-500/30 bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-bold">Line {line.lineNumber}:</span>
                    {line.markAwarded && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono border ${
                          line.isCorrect
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {line.markAwarded}
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-xs text-white bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <MathRenderer content={line.studentLineText} />
                  </div>

                  <div className={`text-xs font-medium flex items-start gap-1.5 pt-0.5 ${
                    line.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    <span className="font-bold shrink-0">{line.isCorrect ? '✓' : '✗'}</span>
                    <span>{line.examinerAnnotation}</span>
                  </div>

                  {line.exactCorrection && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-2 text-xs text-amber-200 flex items-start gap-1.5 mt-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">Exact Working Required: </strong>
                        <span className="font-mono font-bold text-white">{line.exactCorrection}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct Step-by-Step Model Working */}
          {handwrittenResult.correctWorkingStepByStep && handwrittenResult.correctWorkingStepByStep.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Correct Method to Secure Full Marks:
              </h4>

              <div className="space-y-2 text-xs">
                {handwrittenResult.correctWorkingStepByStep.map((step, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200">
                    <MathRenderer content={step} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examiner Final Verdict & Recovery Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Senior Examiner Verdict:
              </div>
              <p className="text-slate-200 leading-relaxed">{handwrittenResult.examinerFinalVerdict}</p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4" />
                How to Avoid Repeating This Slip:
              </div>
              <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                {handwrittenResult.examinerTipsToRegainMarks?.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Flag / Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Flag className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Report Issue with Solution</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Report Recorded</h4>
                <p className="text-xs text-slate-400">
                  Thank you! Your feedback has been logged to help calibrate examiner criteria and improve accuracy.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Did you spot an arithmetic slip or a missed mark scheme requirement? Select the issue category:
                </p>

                <div className="space-y-2">
                  {[
                    'Arithmetic or calculation slip',
                    'Missed mark scheme step (e.g. missing M1 or A1)',
                    'Incorrect syllabus terminology or keywords',
                    'Unclear explanation or wrong units',
                    'Other syllabus discrepancy'
                  ].map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        reportIssueType === type
                          ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        value={type}
                        checked={reportIssueType === type}
                        onChange={(e) => setReportIssueType(e.target.value)}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="e.g. In step 2, the division should be 12 / 3 = 4, not 3..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-base sm:text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-xs font-bold text-white hover:from-rose-500 hover:to-pink-500 transition shadow-md cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
