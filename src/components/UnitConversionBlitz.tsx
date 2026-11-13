import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#18181b] border border-white/[0.08] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FF5B37]/10 border border-[#FF5B37]/20 text-[#FF5B37] text-xs font-mono font-medium tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-[#FF5B37]" />
              Cambridge Precision Drills
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Unit Conversion &amp; Metric Traps
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Eliminate careless metric conversion mark losses. Drill under 60-second timed exam conditions on units frequently tested in Cambridge Science and Maths papers.
            </p>
          </div>

          <div className="bg-[#141416] border border-white/[0.08] rounded-xl p-4 sm:p-4.5 flex items-center gap-3.5 shrink-0 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#FF5B37]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Personal Best
              </div>
              <div className="text-lg font-semibold text-white font-mono tabular-nums">
                {bestScore} Pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Blitz Arena Card */}
      <div className="bg-[#18181b] rounded-2xl border border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
        {gameState === 'idle' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#FF5B37] mx-auto flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Ready for Timed Unit Drills?
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Rapidly convert cm³ to dm³, kJ to J, and hours to seconds. Build your combo streak and ensure you never lose method marks over unit slips.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              Start 60s Drill Sprint
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-5">
            {/* Top Bar: Clocks & Score */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#141416] border border-white/[0.08] text-zinc-200 font-mono font-semibold text-xs flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="tabular-nums">{timeLeft}s remaining</span>
                </div>
                {streak > 1 && (
                  <div className="px-2.5 py-1 rounded-lg bg-[#FF5B37]/15 border border-[#FF5B37]/30 text-[#FF5B37] font-mono font-semibold text-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{streak}x Combo</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Score
                </div>
                <div className="text-xl font-semibold text-white font-mono tabular-nums">{score}</div>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 rounded-xl bg-[#141416] border border-white/[0.08] text-center space-y-2">
              <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#FF5B37]">
                {currentDrill.syllabus}
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-white">
                {currentDrill.prompt}
              </div>
            </div>

            {/* Answer Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2.5 max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Enter numerical answer..."
                  className="w-full bg-[#141416] border border-white/[0.08] focus:border-[#FF5B37] rounded-lg px-3.5 py-2.5 text-sm font-mono text-white text-center focus:outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-zinc-400">
                  {currentDrill.unit}
                </span>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white font-semibold text-xs transition cursor-pointer shrink-0"
              >
                Submit
              </button>
            </form>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-mono animate-fadeIn ${
                  feedback.isCorrect
                    ? 'bg-[#4cc38a]/10 border-[#4cc38a]/20 text-[#4cc38a]'
                    : 'bg-[#e5484d]/10 border-[#e5484d]/20 text-[#e5484d]'
                }`}
              >
                {feedback.rule}
              </div>
            )}
          </div>
        )}

        {gameState === 'ended' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#4cc38a] mx-auto flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-white">Drill Sprint Complete</h3>
              <p className="text-xs text-zinc-400">
                You scored <strong className="text-white font-mono tabular-nums">{score} points</strong> under 60-second exam pressure.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
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
