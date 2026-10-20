import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { Subject } from '../types';

interface CommandWord {
  id: string;
  word: string;
  cambridgeDefinition: string;
  trapWarning: string;
  studentMistake: string;
  fullMarkKey: string;
  exampleQuestion: string;
  sampleAnswerWrong: string;
  sampleAnswerCorrect: string;
  marks: string;
}

const CAMBRIDGE_COMMAND_WORDS: CommandWord[] = [
  {
    id: 'describe-vs-explain',
    word: 'Describe vs. Explain',
    cambridgeDefinition: 'DESCRIBE requires you to state WHAT happens (e.g. trends, observations, steps). EXPLAIN requires you to state WHY or HOW it happens (mechanism, cause, reason).',
    trapWarning: 'The #1 mark loss in Cambridge sciences! Students write full paragraphs explaining WHY for a "Describe" question (wasting time), or describe what the graph shows for an "Explain" question (earning 0 marks).',
    studentMistake: 'Writing "The rate of reaction increases because particles have more kinetic energy" when asked to "Describe the effect of temperature on the rate" (only needed "Rate increases"). OR describing the curve when asked to "Explain".',
    fullMarkKey: 'Always check the first word: If "Describe", write WHAT. If "Explain", write BECAUSE / DUE TO / COLLISION MECHANISM.',
    exampleQuestion: '0620 Chemistry Paper 4: Explain why increasing the temperature increases the rate of reaction. [3 marks]',
    sampleAnswerWrong: 'As temperature goes up from 20°C to 60°C, the volume of gas collected per minute increases and the graph gets steeper. [0 / 3 marks - this is a Description, not an Explanation!]',
    sampleAnswerCorrect: 'Particles have greater kinetic energy [1], move faster so collide more frequently [1], and a greater proportion of particles have energy equal to or exceeding the activation energy (successful collisions) [1].',
    marks: '[3 Marks]'
  },
  {
    id: 'state',
    word: 'State / Name',
    cambridgeDefinition: 'Give a specific name, value or brief statement without detailed explanation or calculation.',
    trapWarning: 'Do not write essays or hedge your bets with multiple contradicting guesses. Cambridge rule: If you give two conflicting answers, the examiner marks the first or applies a penalty.',
    studentMistake: 'Writing "It could be copper or magnesium" when asked to name the metal, or writing a long paragraph justifying why.',
    fullMarkKey: 'Keep it to 1–3 words. Concise, unambiguous, exact chemical/mathematical name.',
    exampleQuestion: '0625 Physics Paper 4: State the type of electromagnetic wave used in thermal imaging cameras. [1 mark]',
    sampleAnswerWrong: 'Thermal rays or infrared heat radiation waves that come from hot objects. [Risks losing mark if "thermal rays" is rejected]',
    sampleAnswerCorrect: 'Infra-red (IR) [1].',
    marks: '[1 Mark]'
  },
  {
    id: 'suggest',
    word: 'Suggest',
    cambridgeDefinition: 'Apply scientific/mathematical knowledge to situations where there are a range of valid responses or unfamiliar contexts.',
    trapWarning: 'Students panic because they think "this wasn\'t in the textbook!". That is intentional. Cambridge is testing scientific reasoning, not textbook rote memory.',
    studentMistake: 'Leaving the question blank or complaining it is out of syllabus.',
    fullMarkKey: 'Connect the unfamiliar scenario to a core principle you know (e.g. surface area, energy transfer, cost, safety, enzyme denaturation).',
    exampleQuestion: '0610 Biology Paper 4: Suggest why large aquatic plants cannot grow at depths greater than 200 metres in the ocean. [2 marks]',
    sampleAnswerWrong: 'It is too cold and fish eat them all. [Vague, non-scientific]',
    sampleAnswerCorrect: 'Sunlight cannot penetrate to depths below 200m [1]; therefore plants cannot absorb light for photosynthesis [1].',
    marks: '[2 Marks]'
  },
  {
    id: 'calculate',
    word: 'Calculate / Determine',
    cambridgeDefinition: 'Work out from given facts, figures or information with full mathematical working shown.',
    trapWarning: 'Writing only the final numerical answer. If your final number is wrong due to a rounding slip or typo, you score 0/3 if no working is shown.',
    studentMistake: 'Writing "x = 4.2" without writing the formula or intermediate rearrangement.',
    fullMarkKey: 'Formula -> Substitution -> Intermediate step -> Final value with units (M1, M1, A1 marks).',
    exampleQuestion: '0580 Mathematics Paper 4: Calculate the volume of a cylinder with radius 4.5 cm and height 12 cm. Give your answer to 3 significant figures. [3 marks]',
    sampleAnswerWrong: '763 [Truncated wrong rounding without unit or working]',
    sampleAnswerCorrect: 'V = π × r² × h = π × (4.5)² × 12 [M1] = 763.407... [M1] = 763 cm³ (to 3 s.f.) [A1].',
    marks: '[3 Marks]'
  },
  {
    id: 'evaluate',
    word: 'Evaluate / Discuss',
    cambridgeDefinition: 'Consider the arguments, evidence or points for both sides and provide a balanced judgment or conclusion.',
    trapWarning: 'Only giving one-sided arguments (e.g. only advantages of wind turbines, ignoring disadvantages). Cambridge rubric strictly limits marks to 50% without both sides.',
    studentMistake: 'Only writing praise for one option without citing drawbacks or limitations.',
    fullMarkKey: 'Structure as: Points FOR (with evidence) + Points AGAINST (with evidence) + Justified final recommendation.',
    exampleQuestion: '0478 Computer Science / 0455 Economics: Evaluate the use of cloud storage compared to local solid-state drives. [4 marks]',
    sampleAnswerWrong: 'Cloud storage is great because you can access files anywhere from your phone. [1 / 4 marks]',
    sampleAnswerCorrect: 'Advantage: Accessible from any internet-connected device with automated backup [1]. Disadvantage: Requires high-speed connection and has recurring subscription costs / latency risks [1]. Comparison: Local SSD has zero latency and works offline [1]. Conclusion: Cloud is superior for team collaboration, SSD for sensitive offline editing [1].',
    marks: '[4 Marks]'
  }
];

interface TrapQuizQuestion {
  id: string;
  commandWord: string;
  questionText: string;
  studentAnswer: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const TRAP_QUIZ: TrapQuizQuestion[] = [
  {
    id: 'q1',
    commandWord: 'Explain',
    questionText: 'Cambridge Question: "Explain why the rate of diffusion increases when temperature rises." [2 Marks]',
    studentAnswer: 'Student wrote: "As temperature goes from 20°C to 50°C, the dye spreads across the agar gel much faster."',
    options: [
      {
        text: 'Award 2 / 2 Marks: The student clearly shows that rate increases with temperature.',
        isCorrect: false,
        explanation: 'Incorrect! The student only DESCRIBED what happens ("spreads faster"). "Explain" requires the scientific mechanism: higher kinetic energy and faster particle movement.'
      },
      {
        text: 'Award 0 / 2 Marks: The student described the trend instead of explaining the kinetic mechanism.',
        isCorrect: true,
        explanation: 'Correct! Cambridge examiners award 0 marks here because the question asked to EXPLAIN. Describing the observation earns no marks without mentioning kinetic energy or particle movement.'
      },
      {
        text: 'Award 1 / 2 Marks: For mentioning temperature numbers.',
        isCorrect: false,
        explanation: 'Incorrect. Cambridge mark schemes do not award marks for restating prompt numbers without scientific reasoning.'
      }
    ]
  },
  {
    id: 'q2',
    commandWord: 'State',
    questionText: 'Cambridge Question: "State the law of conservation of momentum." [1 Mark]',
    studentAnswer: 'Student wrote: "Total momentum before collision equals total momentum after collision, provided no external resultant forces act."',
    options: [
      {
        text: 'Award 1 / 1 Mark: The answer is complete and includes the essential condition.',
        isCorrect: true,
        explanation: 'Correct! The student gave the exact Cambridge mark scheme criteria including the crucial caveat "provided no external resultant force acts".'
      },
      {
        text: 'Award 0 / 1 Mark: Too long for a "State" question.',
        isCorrect: false,
        explanation: 'Incorrect. While "State" seeks brevity, including the full condition ensures full marks.'
      }
    ]
  },
  {
    id: 'q3',
    commandWord: 'Calculate',
    questionText: 'Cambridge Question: "Calculate the speed of the runner. Distance = 100m, time = 12.5s. [2 Marks]"',
    studentAnswer: 'Student wrote: "8 m/s"',
    options: [
      {
        text: 'Award 1 / 2 Marks: Lost 1 mark for lack of working despite the correct answer.',
        isCorrect: false,
        explanation: 'In this simple 2-mark case, Cambridge allows "8 m/s" for 2 marks (B2), BUT if they wrote "8.5" without working they would get 0/2. Showing speed = d/t protects from zero.'
      },
      {
        text: 'Award 2 / 2 Marks: Correct numerical value with correct unit (B2).',
        isCorrect: true,
        explanation: 'Correct! For a standard 2-mark recall calculation, the correct value with unit earns full marks. However, examiners strongly recommend writing "v = 100 / 12.5" to secure the method mark if a calculation error occurs.'
      }
    ]
  }
];

export const CommandWordsTrapDetector: React.FC = () => {
  const [activeWordId, setActiveWordId] = useState<string>(CAMBRIDGE_COMMAND_WORDS[0].id);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const selectedWord = CAMBRIDGE_COMMAND_WORDS.find(w => w.id === activeWordId) || CAMBRIDGE_COMMAND_WORDS[0];
  const currentQuiz = TRAP_QUIZ[quizIndex];

  const handleSelectQuizOption = (index: number) => {
    if (showQuizResult) return;
    setSelectedAnswerIndex(index);
    setShowQuizResult(true);
    if (currentQuiz.options[index].isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < TRAP_QUIZ.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setShowQuizResult(false);
    } else {
      // Reset
      setQuizIndex(0);
      setSelectedAnswerIndex(null);
      setShowQuizResult(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold tracking-wide uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Cambridge Examiner Mark Scheme Secrets
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cambridge Command Words "Trap Detector"
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Over 42% of marks lost by high-achieving students are NOT due to lack of knowledge, but due to misreading command words like <em>Describe</em> vs. <em>Explain</em>. Master the examiner marking rubric below.
          </p>
        </div>
      </div>

      {/* Main Grid: Command Word Selector & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Word Selector Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Cambridge Command Words
          </div>
          <div className="space-y-2">
            {CAMBRIDGE_COMMAND_WORDS.map(item => {
              const isSelected = item.id === activeWordId;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWordId(item.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
                      <span className={isSelected ? 'text-rose-400 font-extrabold' : 'text-slate-400'}>
                        {item.word}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {item.cambridgeDefinition}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-rose-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Interactive Examiner Trap Quiz Mini Widget */}
          <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Examiner Trap Quiz ({quizIndex + 1}/{TRAP_QUIZ.length})
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Score: {quizScore}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-200">{currentQuiz.questionText}</div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 italic">
                {currentQuiz.studentAnswer}
              </div>
            </div>

            {/* Quiz options */}
            <div className="space-y-2">
              {currentQuiz.options.map((opt, idx) => {
                const isChosen = selectedAnswerIndex === idx;
                let btnStyle = 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700';

                if (showQuizResult) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200';
                  } else if (isChosen && !opt.isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500/40 text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showQuizResult}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${btnStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {showQuizResult && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-2 animate-fadeIn">
                <p>{currentQuiz.options[selectedAnswerIndex!].explanation}</p>
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{quizIndex < TRAP_QUIZ.length - 1 ? 'Next Question' : 'Restart Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Command Word Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
            {/* Title & Cambridge Definition */}
            <div className="space-y-3 border-b border-slate-800 pb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-rose-400" />
                  {selectedWord.word}
                </h2>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  Cambridge Benchmark
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Official Cambridge Definition:</strong>
                {selectedWord.cambridgeDefinition}
              </div>
            </div>

            {/* Danger Zone: The Trap */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                The Cambridge Examiner Trap
              </div>
              <p className="text-xs text-rose-200 leading-relaxed font-medium">
                {selectedWord.trapWarning}
              </p>
            </div>

            {/* Past Paper Real Case Study */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Past Paper Demonstration
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs text-indigo-400 font-mono font-bold">
                  {selectedWord.marks}
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedWord.exampleQuestion}
                </div>
              </div>

              {/* Side by side comparison: Wrong Answer vs Cambridge Full Mark Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 0 Mark Response */}
                <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <XCircle className="w-4 h-4" />
                    How Students Lose Marks
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-rose-950">
                    "{selectedWord.sampleAnswerWrong}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Mistake:</strong> {selectedWord.studentMistake}
                  </p>
                </div>

                {/* Full Marks Response */}
                <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Cambridge Model Response
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-emerald-950">
                    "{selectedWord.sampleAnswerCorrect}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Examiner Key:</strong> {selectedWord.fullMarkKey}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
