import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Swords,
  Copy,
  Check,
  Play,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface StudyDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  subjects: Subject[];
}

interface DuelQuestion {
  id: string;
  subjectCode: string;
  paperInfo: string;
  questionText: string;
  marks: number;
  markSchemePoints: string[];
  sampleStudentScore?: number;
}

const SAMPLE_DUEL_QUESTIONS: DuelQuestion[] = [
  {
    id: 'dq-1',
    subjectCode: '0580',
    paperInfo: 'Cambridge 0580/42/M/J/23 - Q4(a)',
    questionText: 'Solve the equation: 3x² - 7x - 5 = 0. Give your answers correct to 2 decimal places. Show all your working.',
    marks: 4,
    markSchemePoints: [
      'Substitution into quadratic formula: (-(-7) ± √((-7)² - 4(3)(-5))) / (2×3) [M1]',
      'Evaluation under square root: √(49 + 60) = √109 [B1]',
      'First root: x = 2.91 [A1]',
      'Second root: x = -0.57 [A1]'
    ]
  },
  {
    id: 'dq-2',
    subjectCode: '0625',
    paperInfo: 'Cambridge 0625/41/O/N/23 - Q2(b)',
    questionText: 'A car of mass 1200 kg accelerates uniformly from 15 m/s to 25 m/s in 5.0 s. Calculate the resultant force acting on the car.',
    marks: 3,
    markSchemePoints: [
      'Acceleration calculation: a = (v - u) / t = (25 - 15) / 5.0 = 2.0 m/s² [M1]',
      'Force formula: F = m × a = 1200 × 2.0 [M1]',
      'Final answer with unit: 2400 N [A1]'
    ]
  },
  {
    id: 'dq-3',
    subjectCode: '0620',
    paperInfo: 'Cambridge 0620/42/M/J/23 - Q5(c)',
    questionText: 'Describe a test to show that a colorless liquid contains water, and state the positive observation.',
    marks: 2,
    markSchemePoints: [
      'Add anhydrous copper(II) sulfate [1]',
      'Turns from white to blue (OR anhydrous cobalt(II) chloride turns from blue to pink) [1]'
    ]
  }
];

export const StudyDuelModal: React.FC<StudyDuelModalProps> = ({
  isOpen,
  onClose,
  profile,
  subjects
}) => {
  const [roomCode, setRoomCode] = useState<string>('SIMP-7824');
  const [copied, setCopied] = useState<boolean>(false);
  const [duelState, setDuelState] = useState<'lobby' | 'active' | 'review' | 'winner'>('lobby');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('0580');

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes per question
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Scores
  const [userScore, setUserScore] = useState<number>(0);
  const [peerScore, setPeerScore] = useState<number>(0);
  const [peerStatus, setPeerStatus] = useState<string>('Solving Question 1...');

  if (!isOpen) return null;

  const currentQ = SAMPLE_DUEL_QUESTIONS[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Peer simulator to give real-time multiplayer feel
  useEffect(() => {
    if (duelState === 'active') {
      const peerTimer = setTimeout(() => {
        setPeerStatus('Submitted answer! Awaiting mark scheme...');
      }, 35000);
      return () => clearTimeout(peerTimer);
    }
  }, [duelState, currentQuestionIndex]);

  const handleStartDuel = () => {
    setDuelState('active');
    setTimeLeft(180);
    setTimerRunning(true);
    setUserScore(0);
    setPeerScore(0);
    setCurrentQuestionIndex(0);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTimeUp = () => {
    setTimerRunning(false);
    setDuelState('review');
  };

  const handleSubmitAnswer = () => {
    setTimerRunning(false);
    setDuelState('review');
  };

  const handleSelfGrade = (marksEarned: number) => {
    setUserScore(prev => prev + marksEarned);
    // Peer randomly earns between marks-1 and marks
    const simulatedPeer = Math.max(0, currentQ.marks - (Math.random() > 0.6 ? 1 : 0));
    setPeerScore(prev => prev + simulatedPeer);

    if (currentQuestionIndex < SAMPLE_DUEL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setTimeLeft(180);
      setTimerRunning(true);
      setDuelState('active');
    } else {
      setDuelState('winner');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Study With a Friend • Past Paper Duel
              </div>
              <div className="text-[11px] text-slate-400">
                Synchronized Cambridge challenge with live mark scheme comparison
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on duelState */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* LOBBY VIEW */}
          {duelState === 'lobby' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Swords className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  Challenge a Classmate to a Cambridge Sprint
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Compete on identical official past paper questions under timed exam conditions. Compare answers directly against Cambridge mark scheme points.
                </p>
              </div>

              {/* Room Code Share Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Share Your Duel Room Code
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-indigo-400 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {copied ? 'Copied to clipboard!' : 'Send this code or link to your study partner'}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="max-w-sm mx-auto text-left space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Exam Subject</label>
                <select
                  value={selectedSubjectCode}
                  onChange={e => setSelectedSubjectCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                >
                  <option value="0580">0580 - Cambridge IGCSE Mathematics</option>
                  <option value="0625">0625 - Cambridge IGCSE Physics</option>
                  <option value="0620">0620 - Cambridge IGCSE Chemistry</option>
                </select>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartDuel}
                className="w-full max-w-sm mx-auto py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Past Paper Duel
              </button>
            </div>
          )}

          {/* ACTIVE QUESTION DUEL VIEW */}
          {duelState === 'active' && (
            <div className="space-y-6">
              {/* Header with Clocks & Dual Progress */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    {currentQ.paperInfo}
                  </div>
                  <div className="text-sm font-bold text-white">
                    Question {currentQuestionIndex + 1} of {SAMPLE_DUEL_QUESTIONS.length} • {currentQ.marks} Marks
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Peer status ticker */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Opponent: <strong>Study Buddy</strong>
                </span>
                <span className="text-amber-400 text-[11px]">{peerStatus}</span>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed font-medium">
                {currentQ.questionText}
              </div>

              {/* Student Working Text Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">
                  Write Your Working & Final Answer:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Type your working steps, formulas, and final answers here..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Submit & Reveal Mark Scheme</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* MARK SCHEME REVIEW VIEW */}
          {duelState === 'review' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Cambridge Mark Scheme Reveal
                </div>
                <h3 className="text-lg font-bold text-white">
                  Compare Your Answer & Self-Grade
                </h3>
              </div>

              {/* Mark Scheme Points Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="text-xs font-bold text-emerald-300">Official Cambridge Mark Criteria:</div>
                <ul className="space-y-1.5 text-xs text-slate-200 font-mono">
                  {currentQ.markSchemePoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Answer Comparison */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Your Submitted Answer:</div>
                <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  {userAnswer || '(No written answer submitted)'}
                </div>
              </div>

              {/* Self-Grade Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  How many marks did you earn for this question? (Out of {currentQ.marks})
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: currentQ.marks + 1 }).map((_, m) => (
                    <button
                      key={m}
                      onClick={() => handleSelfGrade(m)}
                      className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-indigo-600 text-white transition-colors"
                    >
                      {m} / {currentQ.marks}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FINAL WINNER / CELEBRATION VIEW */}
          {duelState === 'winner' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">
                  {userScore >= peerScore ? '🏆 Victory! Duel Complete' : '🤝 Great Effort! Duel Complete'}
                </h3>
                <p className="text-xs text-slate-300">
                  Both candidates completed all Cambridge sprint past paper questions.
                </p>
              </div>

              {/* Dual Scoreboard */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40">
                  <div className="text-xs text-indigo-400 font-bold uppercase">{profile.name || 'You'}</div>
                  <div className="text-3xl font-black text-white font-mono mt-1">{userScore} Marks</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase">Study Buddy</div>
                  <div className="text-3xl font-black text-slate-300 font-mono mt-1">{peerScore} Marks</div>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleStartDuel}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rematch Another Paper
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Close Duel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
