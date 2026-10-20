import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface UnitDrill {
  id: string;
  prompt: string;
  correctAnswer: string;
  acceptableAnswers: string[];
  unit: string;
  ruleExplanation: string;
  syllabus: string;
}

const UNIT_DRILLS_POOL: UnitDrill[] = [
  {
    id: 'u-1',
    prompt: 'Convert 250 cm³ to dm³',
    correctAnswer: '0.25',
    acceptableAnswers: ['0.25', '1/4', '.25'],
    unit: 'dm³',
    ruleExplanation: '1 dm³ = 1000 cm³. Divide by 1000: 250 ÷ 1000 = 0.25 dm³.',
    syllabus: '0620 Chemistry Titration'
  },
  {
    id: 'u-2',
    prompt: 'Convert 4.5 kJ to J',
    correctAnswer: '4500',
    acceptableAnswers: ['4500', '4,500'],
    unit: 'J',
    ruleExplanation: '1 kJ = 1000 J. Multiply by 1000: 4.5 × 1000 = 4500 J.',
    syllabus: '0625 Physics Energy'
  },
  {
    id: 'u-3',
    prompt: 'Convert 2.5 hours to seconds',
    correctAnswer: '9000',
    acceptableAnswers: ['9000', '9,000'],
    unit: 's',
    ruleExplanation: '1 hour = 3600 seconds. 2.5 × 3600 = 9000 s.',
    syllabus: '0625 Physics Kinematics'
  },
  {
    id: 'u-4',
    prompt: 'Convert 150 kPa to Pa',
    correctAnswer: '150000',
    acceptableAnswers: ['150000', '150,000', '1.5x10^5'],
    unit: 'Pa',
    ruleExplanation: '1 kPa = 1000 Pa. Multiply by 1000: 150 × 1000 = 150,000 Pa.',
    syllabus: '0625 Physics Pressure'
  },
  {
    id: 'u-5',
    prompt: 'Convert 45 mm to m',
    correctAnswer: '0.045',
    acceptableAnswers: ['0.045', '.045'],
    unit: 'm',
    ruleExplanation: '1 m = 1000 mm. Divide by 1000: 45 ÷ 1000 = 0.045 m.',
    syllabus: '0580 Maths & Physics'
  },
  {
    id: 'u-6',
    prompt: 'Convert 350 mA to A',
    correctAnswer: '0.35',
    acceptableAnswers: ['0.35', '.35'],
    unit: 'A',
    ruleExplanation: '1 A = 1000 mA. Divide by 1000: 350 ÷ 1000 = 0.35 A.',
    syllabus: '0625 Electricity'
  },
  {
    id: 'u-7',
    prompt: 'Convert 1.2 g/cm³ to kg/m³',
    correctAnswer: '1200',
    acceptableAnswers: ['1200', '1,200'],
    unit: 'kg/m³',
    ruleExplanation: 'Multiply g/cm³ by 1000 to get kg/m³: 1.2 × 1000 = 1200 kg/m³.',
    syllabus: '0625 Density'
  },
  {
    id: 'u-8',
    prompt: 'Convert 0.05 mol/dm³ in 250 cm³ to moles',
    correctAnswer: '0.0125',
    acceptableAnswers: ['0.0125', '1/80', '.0125'],
    unit: 'mol',
    ruleExplanation: 'Moles = Conc × (Vol ÷ 1000) = 0.05 × (250 ÷ 1000) = 0.0125 mol.',
    syllabus: '0620 Mole Calculations'
  }
];

export const UnitConversionBlitz: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('simply_blitz_best');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [feedback, setFeedback] = useState<{ isCorrect: boolean; rule: string } | null>(null);

  const currentDrill = UNIT_DRILLS_POOL[currentIndex % UNIT_DRILLS_POOL.length];

  // Timer Countdown
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStart = () => {
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
  };

  const handleGameOver = () => {
    setGameState('ended');
    if (score > bestScore) {
      setBestScore(score);
      try {
        localStorage.setItem('simply_blitz_best', score.toString());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const cleanInput = userInput.trim().toLowerCase().replace(/,/g, '');
    const isRight = currentDrill.acceptableAnswers.some(ans =>
      cleanInput === ans.toLowerCase().replace(/,/g, '')
    );

    if (isRight) {
      const addedScore = 10 + streak * 2;
      setScore(prev => prev + addedScore);
      setStreak(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        rule: `Correct! ${currentDrill.ruleExplanation}`
      });
    } else {
      setStreak(0);
      setFeedback({
        isCorrect: false,
        rule: `Slip! Correct: ${currentDrill.correctAnswer} ${currentDrill.unit}. ${currentDrill.ruleExplanation}`
      });
    }

    setUserInput('');
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              60-Second Cambridge Speed Blitz
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Unit Conversion & Formula Traps Blitz
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Don't let metric conversion slips cost you an A*! Train under 60-second pressure on the exact unit conversions that appear on Cambridge Science & Math papers.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Personal Best
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {bestScore} Pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Blitz Arena Card */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
        {gameState === 'idle' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Zap className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Ready for the 60-Second Cambridge Blitz?
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Rapidly convert cm³ to dm³, kJ to J, and hours to seconds. Build your combo streak and eliminate careless unit errors forever.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform active:scale-95"
            >
              Start 60-Second Blitz
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Top Bar: Clocks & Score */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
                {streak > 1 && (
                  <div className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1 animate-bounce">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{streak}x Streak!</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Score
                </div>
                <div className="text-2xl font-black text-white font-mono">{score}</div>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                {currentDrill.syllabus}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {currentDrill.prompt}
              </div>
            </div>

            {/* Answer Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Enter numerical answer..."
                  className="w-full bg-slate-950 border-2 border-slate-750 focus:border-amber-500 rounded-xl px-4 py-3 text-base font-mono text-white text-center focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currentDrill.unit}
                </span>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md shrink-0"
              >
                Submit
              </button>
            </form>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium animate-fadeIn ${
                  feedback.isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.rule}
              </div>
            )}
          </div>
        )}

        {gameState === 'ended' && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Blitz Complete!</h3>
              <p className="text-xs text-slate-400">
                You scored <strong className="text-amber-400 font-mono">{score} points</strong> under 60-second Cambridge exam pressure.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
