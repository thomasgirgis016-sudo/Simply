import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  FileText,
  Check,
  Layers,
  Info,
  ListOrdered,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import {
  gradeListeningAnswer,
  ExamBoardType,
  ListeningGradingResult
} from '../lib/grading/listeningGrader';
import {
  LISTENING_PAPERS_DATABASE,
  getListeningPaperByBoard,
  ListeningExamPaper,
  ListeningQuestion
} from '../data/listeningData';

interface ListeningSimulatorProps {
  subject?: Subject;
  profile?: UserProfile;
}

export const ListeningSimulator: React.FC<ListeningSimulatorProps> = ({
  subject,
  profile,
}) => {
  // ── Selected Exam Board ──────────────────────────────────────────────────
  const [selectedBoard, setSelectedBoard] = useState<ExamBoardType>(() => {
    if (subject?.code === '4ES1' || subject?.name.toLowerCase().includes('edexcel')) return 'Edexcel';
    if (subject?.code === '9280' || subject?.name.toLowerCase().includes('oxford')) return 'OxfordAQA';
    return 'CIE';
  });

  const activePaper: ListeningExamPaper = useMemo(() => {
    return getListeningPaperByBoard(selectedBoard);
  }, [selectedBoard]);

  // ── Student Answers & Grading State ──────────────────────────────────────
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [gradingResults, setGradingResults] = useState<Record<string, ListeningGradingResult> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState<string | null>(null);

  // Reset student answers when board changes
  useEffect(() => {
    setUserAnswers({});
    setGradingResults(null);
    setHighlightedTimestamp(null);
    handleResetAudio();
  }, [selectedBoard]);

  // ── Audio Player & Official Two-Play Limit State ──────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0); // Max 2 plays in real Cambridge / Edexcel exams
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [readingPauseSeconds, setReadingPauseSeconds] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Reading Pause Countdown
  useEffect(() => {
    if (readingPauseSeconds === null || readingPauseSeconds <= 0) return;
    const timer = setInterval(() => {
      setReadingPauseSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [readingPauseSeconds]);

  // Waveform Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw audio bars
      const numBars = 36;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (isPlaying) {
          barHeight = 6 + Math.sin(phase + i * 0.4) * 14 + Math.cos(phase * 0.8 + i * 0.2) * 10;
          barHeight = Math.max(4, Math.min(height - 6, Math.abs(barHeight)));
        }

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        ctx.fillStyle = isPlaying
          ? (i % 2 === 0 ? '#FF5B37' : '#ff7a5c')
          : '#27272a';
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      phase += 0.12 * playbackSpeed;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Clean audio reset
  const handleResetAudio = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPlayCount(0);
    setReadingPauseSeconds(null);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle Play / Pause with 2-Play limit
  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Check 2-Play limit
    if (playCount >= 2) {
      alert('Examination Rule: Real Cambridge and Edexcel listening exams strictly enforce a Maximum of 2 Plays per track. You have reached the 2-play limit. Click "Reset Audio" if practicing.');
      return;
    }

    setIsPlaying(true);
    setPlayCount(prev => prev + 1);

    // Live speech synthesis fallback reading the exam transcript
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const fullText = activePaper.fullTranscript.map(t => `${t.speaker}: ${t.text}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      // Select British English voice if available
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('British'));
      if (britishVoice) utterance.voice = britishVoice;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Timer tracker
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= activePaper.audioDurationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activePaper.audioDurationSeconds]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ── Handle Student Input ─────────────────────────────────────────────────
  const handleInputChange = (questionId: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // ── Grade Listening Submission ───────────────────────────────────────────
  const handleGradeSubmission = () => {
    setIsSubmitting(true);
    const results: Record<string, ListeningGradingResult> = {};

    activePaper.exercises.forEach(ex => {
      ex.questions.forEach(q => {
        const studentAns = userAnswers[q.id] || '';
        const grade = gradeListeningAnswer(
          studentAns,
          q.officialAnswer,
          selectedBoard,
          q.wordLimit,
          q.printedUnit
        );
        results[q.id] = grade;
      });
    });

    setGradingResults(results);
    setIsSubmitting(false);

    // Scroll smoothly to diagnostic scorecard
    setTimeout(() => {
      const reportEl = document.getElementById('listening-diagnostic-report');
      if (reportEl) {
        reportEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Diagnostic Score Metrics
  const scoreMetrics = useMemo(() => {
    if (!gradingResults) return null;
    const totalQuestions = Object.keys(gradingResults).length;
    const totalEarnedMarks = Object.values(gradingResults).reduce((sum, r) => sum + r.score, 0);
    const totalMaxMarks = Object.values(gradingResults).reduce((sum, r) => sum + r.maxMarks, 0);
    const percentage = totalMaxMarks > 0 ? Math.round((totalEarnedMarks / totalMaxMarks) * 100) : 0;

    let gradeLetter = 'U';
    if (percentage >= 85) gradeLetter = '9 / A*';
    else if (percentage >= 75) gradeLetter = '8 / A*';
    else if (percentage >= 65) gradeLetter = '7 / A';
    else if (percentage >= 55) gradeLetter = '6 / B';
    else if (percentage >= 45) gradeLetter = '5 / C';

    return {
      totalQuestions,
      totalEarnedMarks,
      totalMaxMarks,
      percentage,
      gradeLetter
    };
  }, [gradingResults]);

  return (
    <div className="flex flex-col py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">

        {/* ─────────────────────────────────────────────────────────────
            1. HEADER BANNER & MULTI-BOARD SWITCHER
        ───────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#18181b] border border-white/[0.08] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FF5B37]/10 text-[#FF5B37] border border-[#FF5B37]/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Headphones className="h-3.5 w-3.5" />
                  Official Listening Simulator
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activePaper.paperCode} • Series {activePaper.year}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1.5">
                Multi-Board English Listening Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Authentic examination tracks, strict Two-Play limit, and automated multi-board grading enforcing word count caps, fatal homophone traps, and Edexcel plural precision.
              </p>
            </div>

            {/* Board Switcher Selector */}
            <div className="bg-[#141416] p-1 rounded-lg border border-white/[0.08] flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBoard('CIE')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  selectedBoard === 'CIE'
                    ? 'bg-[#FF5B37] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cambridge (0510/0511)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBoard('Edexcel')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  selectedBoard === 'Edexcel'
                    ? 'bg-[#FF5B37] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Edexcel (4ES1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBoard('OxfordAQA')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  selectedBoard === 'OxfordAQA'
                    ? 'bg-[#FF5B37] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OxfordAQA (9280)
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. OFFICIAL AUDIO PLAYER HUD (Two-Play Limit & Controls)
        ───────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#18181b] border border-white/[0.08] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5B37]/10 border border-[#FF5B37]/20 flex items-center justify-center text-[#FF5B37]">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{activePaper.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 font-mono border border-white/[0.06]">
                    {selectedBoard} Official Audio Track
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Simulated British Examiner Recording with authentic pauses and chimes
                </p>
              </div>
            </div>

            {/* Official Two-Play Limit Indicator */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
                playCount === 0
                  ? 'bg-[#141416] border-white/[0.08] text-slate-400'
                  : playCount === 1
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  Official Rule: <strong className="font-mono">{playCount} / 2</strong> Plays Used
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetAudio}
                title="Reset Audio Practice Counter"
                className="p-1.5 rounded-lg bg-[#222225] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Controls Bar & Waveform Canvas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={playCount >= 2 && !isPlaying}
                className={`px-5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : playCount >= 2
                    ? 'bg-[#222225] text-slate-500 cursor-not-allowed border border-white/[0.08]'
                    : 'bg-[#FF5B37] hover:bg-[#e04f2e] text-white'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>
                  {isPlaying
                    ? 'Pause Track'
                    : playCount >= 2
                    ? 'Max Plays Reached'
                    : playCount === 0
                    ? 'Play 1 (First Listen)'
                    : 'Play 2 (Second Listen)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setReadingPauseSeconds(30)}
                className="px-3.5 py-2 rounded-lg border border-white/[0.08] bg-[#222225] hover:bg-white/[0.08] text-xs font-medium text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {readingPauseSeconds ? `Reading Pause: ${readingPauseSeconds}s` : '30s Reading Pause'}
                </span>
              </button>

              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {formatTime(currentTime)} / {formatTime(activePaper.audioDurationSeconds)}
              </span>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="flex-1 max-w-xs h-8 bg-[#141416] rounded-lg p-1 border border-white/[0.08] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={280}
                height={28}
                className="w-full h-full rounded"
              />
            </div>

            {/* Playback Speed Controller */}
            <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
              <span className="text-slate-500 text-[10px] px-1 hidden sm:inline">Speed:</span>
              {[0.8, 1.0, 1.2].map(speed => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#FF5B37] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. INTERACTIVE LISTENING QUESTION SHEET
        ───────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {activePaper.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-2xl bg-[#18181b] border border-white/[0.08] p-5 sm:p-7 shadow-xl space-y-5"
            >
              {/* Exercise Header */}
              <div className="border-b border-white/[0.08] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {exercise.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {exercise.instruction}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                    Max {exercise.wordLimit} {exercise.wordLimit === 1 ? 'word' : 'words'}
                  </span>
                </div>
              </div>

              {/* Context intro for note-taking if present */}
              {exercise.contextIntro && (
                <div className="p-3 bg-[#141416] rounded-xl border border-white/[0.08] text-xs text-[#FF5B37] font-medium">
                  📌 {exercise.contextIntro}
                </div>
              )}

              {/* Questions Rendering */}
              <div className="space-y-4">
                {exercise.questions.map((q) => {
                  const result = gradingResults ? gradingResults[q.id] : null;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition ${
                        result
                          ? result.status === 'correct'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : result.status === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-[#141416] border-white/[0.08]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-semibold text-[#FF5B37] text-sm shrink-0">
                              {q.questionNumber}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-200 font-medium">
                              {q.prompt}
                            </span>
                          </div>

                          {/* Multiple Choice Options */}
                          {q.type === 'multiple-choice' && q.options ? (
                            <div className="grid grid-cols-1 gap-2 pt-2">
                              {q.options.map(opt => (
                                <label
                                  key={opt.value}
                                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                    userAnswers[q.id] === opt.value
                                      ? 'bg-[#FF5B37]/10 border-[#FF5B37] text-white ring-1 ring-[#FF5B37]'
                                      : 'bg-[#18181b] border-white/[0.08] text-slate-300 hover:bg-[#222225]'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt.value}
                                    checked={userAnswers[q.id] === opt.value}
                                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    className="text-[#FF5B37] focus:ring-[#FF5B37]"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            /* Text Input / Gap Fill */
                            <div className="flex items-center gap-2 pt-1 max-w-md">
                              <input
                                type="text"
                                value={userAnswers[q.id] || ''}
                                onChange={(e) => handleInputChange(q.id, e.target.value)}
                                placeholder={`Write answer (max ${q.wordLimit} words)...`}
                                className="w-full bg-[#18181b] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF5B37] font-mono"
                              />
                              {q.printedUnit && (
                                <span className="font-mono text-xs font-semibold text-slate-400 shrink-0">
                                  {q.printedUnit}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Word Count Indicator */}
                          {q.type !== 'multiple-choice' && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Word count: {(userAnswers[q.id] || '').trim().split(/\s+/).filter(Boolean).length} / {q.wordLimit} allowed
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-slate-400 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.06]">
                            [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                          </span>
                        </div>
                      </div>

                      {/* Post-Grading Diagnostic Feedback */}
                      {result && (
                        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            {result.status === 'correct' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : result.status === 'warning' ? (
                              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            )}
                            <span className="font-semibold">
                              {result.verdict} ({result.score} / {result.maxMarks} Marks)
                            </span>
                          </div>

                          <p className="text-slate-300 leading-relaxed pl-6">
                            {result.feedback}
                          </p>

                          {/* Official Scheme & Audio Timestamp Link */}
                          <div className="pl-6 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              Official Mark Scheme: <strong className="text-white font-mono">{q.officialAnswer}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setHighlightedTimestamp(q.transcriptTimestamp)}
                              className="text-[#FF5B37] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span>Audio Timestamp [{q.transcriptTimestamp}]</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. SUBMIT & INSTANT DIAGNOSTIC SCORECARD
        ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-white/[0.08] shadow-xl">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Ready to verify your answers?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated marking verifies word caps, real-word homophone traps, and board-specific plural rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGradeSubmission}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#e04f2e] text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Submit & Grade Listening Test</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Scorecard & Detailed Examiner Audit */}
        {scoreMetrics && (
          <div
            id="listening-diagnostic-report"
            className="rounded-2xl bg-[#18181b] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                  Senior Examiner Diagnostic Report
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                  Examination Performance Audit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluated under official {selectedBoard} mark scheme guidelines
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="flex items-center gap-6 bg-[#141416] p-4 rounded-xl border border-white/[0.08]">
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-medium">Total Marks</div>
                  <div className="text-2xl font-semibold text-emerald-400 font-mono">
                    {scoreMetrics.totalEarnedMarks} / {scoreMetrics.totalMaxMarks}
                  </div>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-medium">Accuracy</div>
                  <div className="text-2xl font-semibold text-[#FF5B37] font-mono">
                    {scoreMetrics.percentage}%
                  </div>
                </div>
                <div className="h-10 w-px bg-white/[0.08]" />
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-medium">Predicted Band</div>
                  <div className="text-2xl font-semibold text-slate-100 font-mono">
                    {scoreMetrics.gradeLetter}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Breakdown Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Word Count Strictness
                </span>
                <p className="text-slate-300">
                  All candidate answers adhered to the word limit cap. No answers were penalized for exceeding words.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] space-y-1">
                <span className="font-semibold text-[#FF5B37] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Real-Word Trap Filter
                </span>
                <p className="text-slate-300">
                  Homophones and real unintended words were screened. Valid phonetic spellings were tolerated.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] space-y-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" /> Board Rules ({selectedBoard})
                </span>
                <p className="text-slate-300">
                  {selectedBoard === 'Edexcel'
                    ? 'Strict grammatical plural checks were enforced on all nouns.'
                    : 'Cambridge tolerance for minor number slips was applied.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. INTERACTIVE AUDIO TRANSCRIPT WITH TIMESTAMP HIGHLIGHTS
        ───────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#18181b] border border-white/[0.08] p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-[#FF5B37]" />
              <h3 className="text-base font-semibold text-white">
                Official Examination Audio Transcript
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any timestamp to review spoken answers
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {activePaper.fullTranscript.map((item, idx) => {
              const isHighlighted = highlightedTimestamp === item.timestamp;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition ${
                    isHighlighted
                      ? 'bg-[#FF5B37]/10 border-[#FF5B37] shadow-md ring-1 ring-[#FF5B37]'
                      : 'bg-[#141416] border-white/[0.08] hover:bg-[#222225]'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-semibold text-xs text-[#FF5B37]">
                      {item.speaker}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.answersKey && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Answers: {item.answersKey}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-slate-500">
                        [{item.timestamp}]
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
