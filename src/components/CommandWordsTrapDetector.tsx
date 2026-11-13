import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
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
        text: 'Award 0 / 2 Marks: The student only described what happens ("spreads faster") rather than explaining the kinetic mechanism.',
        isCorrect: true,
        explanation: 'Correct! Under official Cambridge marking rubrics, an "Explain" question requires the scientific mechanism (particles gain kinetic energy and move faster). Describing the visible result earns 0 / 2 marks.'
      },
      {
        text: 'Award 1 / 2 Marks: 1 mark for describing the observation and 0 marks for the missing mechanism.',
        isCorrect: false,
        explanation: 'Incorrect. Cambridge science mark schemes do not award partial credit for describing the observation when the command word is "Explain". Full zero is awarded if the kinetic mechanism is absent.'
      },
      {
        text: 'Award 2 / 2 Marks: Full marks because the student demonstrated that higher temperature speeds up diffusion.',
        isCorrect: false,
        explanation: 'Incorrect! This conflates "Describe" with "Explain". Simply restating that diffusion speeds up fails to explain WHY (particles possess more kinetic energy).'
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#18181b] border border-white/[0.08] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#e5484d]/10 border border-[#e5484d]/20 text-[#e5484d] text-xs font-mono font-medium tracking-wide uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-[#e5484d]" />
            Cambridge Examiner Mark Scheme Rubrics
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Cambridge Command Words "Trap Detector"
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Over 40% of marks dropped on extended theory papers occur when students confuse command words like <em>Describe</em> and <em>Explain</em>. Review the official Cambridge examiner benchmarks below.
          </p>
        </div>
      </div>

      {/* Main Grid: Command Word Selector & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Word Selector Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1 font-mono">
            Cambridge Command Words
          </div>
          <div className="space-y-2">
            {CAMBRIDGE_COMMAND_WORDS.map(item => {
              const isSelected = item.id === activeWordId;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWordId(item.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] border-[#FF5B37] text-white shadow-sm'
                      : 'bg-[#18181b] border-white/[0.08] text-zinc-400 hover:border-white/[0.16] hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-white flex items-center gap-2">
                      <span className={isSelected ? 'text-[#FF5B37] font-semibold' : 'text-zinc-300'}>
                        {item.word}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 line-clamp-1 font-sans">
                      {item.cambridgeDefinition}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#FF5B37] translate-x-1' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Interactive Examiner Trap Quiz Mini Widget */}
          <div className="mt-6 bg-[#18181b] border border-white/[0.08] rounded-xl p-4.5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Examiner Trap Quiz ({quizIndex + 1}/{TRAP_QUIZ.length})
              </div>
              <span className="text-xs font-mono text-[#4cc38a] font-semibold tabular-nums">
                Score: {quizScore}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-medium text-zinc-200">{currentQuiz.questionText}</div>
              <div className="p-3 rounded-lg bg-[#141416] border border-white/[0.08] text-zinc-300 italic font-sans">
                {currentQuiz.studentAnswer}
              </div>
            </div>

            {/* Quiz options */}
            <div className="space-y-2">
              {currentQuiz.options.map((opt, idx) => {
                const isChosen = selectedAnswerIndex === idx;
                let btnStyle = 'bg-[#141416] border-white/[0.08] text-zinc-300 hover:border-white/[0.14]';

                if (showQuizResult) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-[#4cc38a]/15 border-[#4cc38a]/30 text-[#4cc38a]';
                  } else if (isChosen && !opt.isCorrect) {
                    btnStyle = 'bg-[#e5484d]/15 border-[#e5484d]/30 text-[#e5484d]';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showQuizResult}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition cursor-pointer ${btnStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {showQuizResult && (
              <div className="p-3 rounded-lg bg-[#141416] border border-white/[0.08] text-xs text-zinc-300 space-y-2 animate-fadeIn">
                <p className="leading-relaxed">{currentQuiz.options[selectedAnswerIndex!].explanation}</p>
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white font-medium transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>{quizIndex < TRAP_QUIZ.length - 1 ? 'Next Question' : 'Restart Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Command Word Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#18181b] rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
            {/* Title & Cambridge Definition */}
            <div className="space-y-3 border-b border-white/[0.08] pb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#FF5B37]" />
                  {selectedWord.word}
                </h2>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-xs font-mono font-medium uppercase tracking-wider">
                  Cambridge Rubric
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#141416] border border-white/[0.08] text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <strong className="text-zinc-100 font-medium block mb-1">Official Cambridge Definition:</strong>
                {selectedWord.cambridgeDefinition}
              </div>
            </div>

            {/* Danger Zone: The Trap */}
            <div className="p-4 rounded-xl bg-[#e5484d]/10 border border-[#e5484d]/20 space-y-1.5">
              <div className="flex items-center gap-2 text-[#e5484d] text-xs font-mono font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#e5484d]" />
                The Cambridge Examiner Trap
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                {selectedWord.trapWarning}
              </p>
            </div>

            {/* Past Paper Real Case Study */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                Official Past Paper Demonstration
              </div>

              <div className="p-3.5 rounded-xl bg-[#141416] border border-white/[0.08] space-y-1.5">
                <div className="text-xs text-[#FF5B37] font-mono font-semibold">
                  {selectedWord.marks}
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedWord.exampleQuestion}
                </div>
              </div>

              {/* Side by side comparison: Wrong Answer vs Cambridge Full Mark Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 0 Mark Response */}
                <div className="p-4 rounded-xl bg-[#141416] border border-[#e5484d]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#e5484d] text-xs font-mono font-semibold uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-[#e5484d]" />
                    How Students Lose Marks
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic bg-[#18181b] p-3 rounded-lg border border-white/[0.06]">
                    "{selectedWord.sampleAnswerWrong}"
                  </p>
                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-200 font-medium">Mistake:</strong> {selectedWord.studentMistake}
                  </p>
                </div>

                {/* Full Marks Response */}
                <div className="p-4 rounded-xl bg-[#141416] border border-[#4cc38a]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#4cc38a] text-xs font-mono font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" />
                    Cambridge Model Response
                  </div>
                  <p className="text-xs text-[#4cc38a] leading-relaxed bg-[#18181b] p-3 rounded-lg border border-white/[0.06] font-mono whitespace-pre-wrap">
                    "{selectedWord.sampleAnswerCorrect}"
                  </p>
                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-200 font-medium">Examiner Key:</strong> {selectedWord.fullMarkKey}
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
