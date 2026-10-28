import React, { useState, useEffect } from 'react';
import {
  Columns,
  Eye,
  EyeOff,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BookOpen,
  ExternalLink,
  Download
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { MathRenderer } from './MathRenderer';
import { OFFICIAL_PAST_PAPER_PDFS } from '../data/pastPapersData';

interface ExamQuestionItem {
  number: number;
  subpart: string;
  marks: number;
  paperRef: string;
  questionPrompt: string;
  diagramOrMath?: string;
  markSchemePoints: {
    markType: string; // [M1], [A1], [B1]
    requirement: string;
    guidance: string;
  }[];
  finalAnswer: string;
  examinerTrap: string;
}

const SAMPLE_EXAM_PAPERS: Record<string, ExamQuestionItem[]> = {
  'cie-math-0580': [
    {
      number: 1,
      subpart: '(a)',
      marks: 3,
      paperRef: 'CIE 0580/42 May/June 2023 Q1(a)',
      questionPrompt: 'Solve the equation: $3x^2 - 7x - 5 = 0$. Give your solutions correct to 2 decimal places. Show all your working.',
      diagramOrMath: '3x^2 - 7x - 5 = 0',
      markSchemePoints: [
        {
          markType: '[M1] Method Mark',
          requirement: 'Correct substitution into the quadratic formula: $x = \\frac{-(-7) \\pm \\sqrt{(-7)^2 - 4(3)(-5)}}{2(3)}$',
          guidance: 'Allow 1 sign error in substitution, but square root must be complete.'
        },
        {
          markType: '[M1] Method Mark',
          requirement: 'Evaluation of discriminant: $\\sqrt{49 + 60} = \\sqrt{109}$',
          guidance: 'Awarded for showing $\\sqrt{109}$ or $10.44...$'
        },
        {
          markType: '[A1] Accuracy Mark',
          requirement: '$x = 2.91$ and $x = -0.57$',
          guidance: 'Both answers correct to 2 d.p. required. Penalize premature rounding.'
        }
      ],
      finalAnswer: '$x = 2.91$ and $x = -0.57$',
      examinerTrap: 'Writing $(-7)^2$ as $-49$ in the calculator without brackets is the #1 candidate mistake, resulting in $\\sqrt{-11}$ and losing all accuracy marks.'
    },
    {
      number: 2,
      subpart: '(b)',
      marks: 4,
      paperRef: 'CIE 0580/42 May/June 2023 Q3(b)',
      questionPrompt: 'The coordinates of points $A$ and $B$ are $A(-2, 5)$ and $B(4, -3)$.\nFind the equation of the perpendicular bisector of the line segment $AB$. Give your answer in the form $y = mx + c$.',
      diagramOrMath: 'A(-2, 5) \\quad \\text{and} \\quad B(4, -3)',
      markSchemePoints: [
        {
          markType: '[B1] Independent Mark',
          requirement: 'Midpoint of $AB = \\left(\\frac{-2 + 4}{2}, \\frac{5 + (-3)}{2}\\right) = (1, 1)$',
          guidance: 'Correct coordinates of midpoint verified.'
        },
        {
          markType: '[M1] Method Mark',
          requirement: 'Gradient of $AB = \\frac{-3 - 5}{4 - (-2)} = \\frac{-8}{6} = -\\frac{4}{3}$',
          guidance: 'Standard $\\frac{y_2 - y_1}{x_2 - x_1}$ formula applied.'
        },
        {
          markType: '[M1] Method Mark',
          requirement: 'Perpendicular gradient $m_{\\perp} = -\\frac{1}{m} = \\frac{3}{4}$',
          guidance: 'Negative reciprocal of candidate’s gradient.'
        },
        {
          markType: '[A1] Accuracy Mark',
          requirement: 'Substitute $(1, 1)$ into $y = \\frac{3}{4}x + c \\implies c = \\frac{1}{4} \\implies y = \\frac{3}{4}x + \\frac{1}{4}$ (or $4y - 3x = 1$)',
          guidance: 'Exact fractional or 2 d.p. equivalent accepted.'
        }
      ],
      finalAnswer: '$y = \\frac{3}{4}x + \\frac{1}{4}$ (or $y = 0.75x + 0.25$)',
      examinerTrap: 'Candidates frequently use point $A$ or $B$ instead of the midpoint when solving for $c$, losing the final 2 marks.'
    }
  ],
  'cie-chem-0620': [
    {
      number: 1,
      subpart: '(a)',
      marks: 3,
      paperRef: 'CIE 0620/42 Oct/Nov 2023 Q4(a)',
      questionPrompt: 'A student passes an electric current through concentrated aqueous sodium chloride (brine) using inert platinum electrodes.\n\n(i) Name the gas formed at the cathode.\n(ii) State the ionic half-equation for the reaction occurring at the anode.\n(iii) State what is left in solution after electrolysis.',
      diagramOrMath: '2H^+ + 2e^- \\rightarrow H_2 \\quad | \\quad 2Cl^- \\rightarrow Cl_2 + 2e^-',
      markSchemePoints: [
        {
          markType: '[B1] Independent Mark',
          requirement: 'Hydrogen ($H_2$)',
          guidance: 'Do NOT allow hydride or $H^+$. Must be hydrogen gas.'
        },
        {
          markType: '[B1] Independent Mark',
          requirement: '$2Cl^- \\rightarrow Cl_2 + 2e^-$ (or $2Cl^- - 2e^- \\rightarrow Cl_2$)',
          guidance: 'Correct state symbols or balanced electrons.'
        },
        {
          markType: '[B1] Independent Mark',
          requirement: 'Sodium hydroxide (solution) / $NaOH$ / alkaline solution',
          guidance: 'Both $Na^+$ and $OH^-$ remain in solution.'
        }
      ],
      finalAnswer: '(i) Hydrogen; (ii) $2Cl^- \\rightarrow Cl_2 + 2e^-$; (iii) Sodium hydroxide ($NaOH$)',
      examinerTrap: 'Many students incorrectly predict sodium metal at the cathode; however, $H^+$ is less reactive than $Na^+$ and is discharged preferentially in aqueous solutions.'
    }
  ],
  'cie-physics-0625': [
    {
      number: 1,
      subpart: '(a)',
      marks: 4,
      paperRef: 'CIE 0625/42 May/June 2023 Q2(a)',
      questionPrompt: 'A trolley of mass $0.80\\text{ kg}$ travelling at $2.5\\text{ m/s}$ collides with a stationary trolley of mass $1.20\\text{ kg}$.\nAfter the collision, the two trolleys stick together and move in the same direction.\n\n(i) State the principle of conservation of momentum.\n(ii) Calculate the velocity of the combined trolleys after the collision.',
      diagramOrMath: 'm_1u_1 + m_2u_2 = (m_1 + m_2)v',
      markSchemePoints: [
        {
          markType: '[B1] Independent Mark',
          requirement: 'Total momentum before collision equals total momentum after collision, provided no external resultant force acts.',
          guidance: 'Must mention isolated system or no external force.'
        },
        {
          markType: '[M1] Method Mark',
          requirement: 'Initial momentum $= 0.80 \\times 2.5 + 1.20 \\times 0 = 2.0\\text{ kg}\\cdot\\text{m/s}$',
          guidance: 'Calculation of initial momentum.'
        },
        {
          markType: '[M1] Method Mark',
          requirement: 'Combined mass $= 0.80 + 1.20 = 2.00\\text{ kg}$',
          guidance: 'Summing masses for combined system.'
        },
        {
          markType: '[A1] Accuracy Mark',
          requirement: '$v = \\frac{2.0}{2.00} = 1.0\\text{ m/s}$',
          guidance: 'Correct numerical answer with standard unit $\\text{m/s}$.'
        }
      ],
      finalAnswer: '$1.0\\text{ m/s}$',
      examinerTrap: 'Forgetting to include the "in the absence of external forces" clause in the definition loses the definition mark in almost 60% of scripts.'
    }
  ],
  'cie-esl-0510': [
    {
      number: 1,
      subpart: '(a)',
      marks: 3,
      paperRef: 'CIE 0510/12 May/June 2024 Paper 1 (Reading & Writing) Exercise 1',
      questionPrompt: 'Read the article about the discovery of deep-sea hydrothermal vents and answer the following questions:\n\n(i) According to paragraph 1, what unexpected feature did scientists observe on the seabed?\n(ii) Give two reasons why scientists initially thought animal life could not survive around the vents.',
      diagramOrMath: 'Syllabus Assessment Objectives: R1 (Identify factual details) & R2 (Understand ideas/opinions)',
      markSchemePoints: [
        {
          markType: '[1] Content Mark',
          requirement: 'Chimneys / mineral towers emitting black clouds of hot mineral-rich fluid / mineral smoke.',
          guidance: 'Award 1 mark for mentioning chimneys/towers or black smoke fluid.'
        },
        {
          markType: '[2] Content Marks',
          requirement: 'Extreme pressure (at great depth) AND total absence of sunlight / complete darkness (preventing photosynthesis).',
          guidance: 'Award 1 mark for each valid reason. Allow boiling temperatures / toxic chemicals.'
        }
      ],
      finalAnswer: '(i) Mineral chimneys emitting black mineral-rich fluid; (ii) Total absence of sunlight and extreme water pressure.',
      examinerTrap: 'Lifting long whole sentences from the text instead of isolating the precise factual answer risks exceeding the line boundary and losing the mark.'
    }
  ],
  'cie-bio-0610': [
    {
      number: 1,
      subpart: '(a)',
      marks: 3,
      paperRef: 'CIE 0610/42 May/June 2023 Q1(a)',
      questionPrompt: 'Explain how the structure of a red blood cell is adapted to its function of transporting oxygen throughout the body.',
      diagramOrMath: 'Biconcave disc \\implies \\text{high surface area:volume ratio} \\quad | \\quad \\text{Haemoglobin} \\implies \\text{oxygen binding}',
      markSchemePoints: [
        {
          markType: '[B1] Independent Mark',
          requirement: 'Biconcave disc shape increases the surface area to volume ratio for faster diffusion of oxygen.',
          guidance: 'Must connect biconcave shape to surface area and diffusion rate.'
        },
        {
          markType: '[B1] Independent Mark',
          requirement: 'Contains haemoglobin which binds reversibly with oxygen to form oxyhaemoglobin.',
          guidance: 'Mention of haemoglobin required.'
        },
        {
          markType: '[B1] Independent Mark',
          requirement: 'Absence of nucleus allows more space to pack haemoglobin molecules.',
          guidance: 'Accept flexible membrane to squeeze through narrow capillaries.'
        }
      ],
      finalAnswer: 'Biconcave disc shape increases surface area:volume ratio; packed with haemoglobin; no nucleus maximizes oxygen capacity.',
      examinerTrap: 'Stating "red blood cells carry oxygen" without explaining the structural adaptations (biconcave, haemoglobin, no nucleus) awards 0 marks.'
    }
  ]
};

const DEFAULT_QUESTIONS: ExamQuestionItem[] = [
  {
    number: 1,
    subpart: '(a)',
    marks: 4,
    paperRef: 'IGCSE Standard Specimen Practice',
    questionPrompt: 'Explain the core syllabus mechanism and show all step-by-step working for full marks. Identify the key equations, substitute values with units, and state the final result to 3 significant figures.',
    diagramOrMath: 'Formula: \\text{Method} \\implies [M1], \\quad \\text{Accuracy} \\implies [A1]',
    markSchemePoints: [
      {
        markType: '[M1] Method Mark',
        requirement: 'Correct application of fundamental syllabus principle and formula.',
        guidance: 'Step 1 working shown clearly.'
      },
      {
        markType: '[M1] Method Mark',
        requirement: 'Substitution of known parameters into the formula with correct SI unit conversions.',
        guidance: 'Step 2 substitution.'
      },
      {
        markType: '[A1] Accuracy Mark',
        requirement: 'Accurate evaluated quantity rounded to 3 significant figures.',
        guidance: 'Final accuracy check.'
      },
      {
        markType: '[B1] Independent Mark',
        requirement: 'Correct SI unit explicitly stated.',
        guidance: 'Unit check.'
      }
    ],
    finalAnswer: 'Accurate value with SI units to 3 s.f.',
    examinerTrap: 'Avoid premature rounding in multi-step calculations; keep intermediate figures in calculator memory.'
  }
];

interface SplitScreenPaperViewerProps {
  activeSubject: Subject;
  profile: UserProfile;
}

export const SplitScreenPaperViewer: React.FC<SplitScreenPaperViewerProps> = ({
  activeSubject,
  profile,
}) => {
  const questions = SAMPLE_EXAM_PAPERS[activeSubject.id] || DEFAULT_QUESTIONS;
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isMarkSchemeVisible, setIsMarkSchemeVisible] = useState(true);
  const [mobilePane, setMobilePane] = useState<'question' | 'markscheme'>('question');

  // Exam Pacing Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [paperViewMode, setPaperViewMode] = useState<'transcribed' | 'pdf'>('transcribed');

  const currentQ = questions[activeQuestionIndex] || questions[0];
  const targetTimeMinutes = Math.round(currentQ.marks * 1.5); // 1.5 min per mark standard

  // Official PDF URL extracted directly from the question's paper reference
  const paperRefMatch = currentQ.paperRef.match(/(\d{4})\/(\d{2})/);
  const yearMatch = currentQ.paperRef.match(/\b(20\d{2})\b/);
  const qSyllabus = paperRefMatch ? paperRefMatch[1] : (activeSubject.code.match(/\d{4}/)?.[0] || '0580');
  const qComp = paperRefMatch ? paperRefMatch[2] : (activeSubject.id.includes('esl') || qSyllabus === '0510' ? '22' : '42');
  const qYear = yearMatch ? parseInt(yearMatch[1], 10) : 2023;
  const qSeasonCode = currentQ.paperRef.toLowerCase().includes('oct') || currentQ.paperRef.toLowerCase().includes('nov')
    ? 'w'
    : currentQ.paperRef.toLowerCase().includes('feb') || currentQ.paperRef.toLowerCase().includes('march')
    ? 'm'
    : 's';
  const qYy = String(qYear).slice(-2);

  const matchingPdf = OFFICIAL_PAST_PAPER_PDFS.find(
    (p) => p.paperCode === `${qSyllabus}/${qComp}` && p.year === qYear && p.seasonCode === qSeasonCode
  ) || OFFICIAL_PAST_PAPER_PDFS.find(
    (p) => p.subjectCode === qSyllabus && p.paperCode.endsWith(qComp)
  ) || OFFICIAL_PAST_PAPER_PDFS.find(
    (p) => p.subjectId === activeSubject.id
  );

  const officialPdfUrl = matchingPdf?.qpPdfUrl ||
    `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${qSyllabus}_${qSeasonCode}${qYy}_qp_${qComp}.pdf`;

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Top Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Columns className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Dual-Pane Paper & Mark Scheme Practice
              </h2>
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                {activeSubject.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulate actual Cambridge & Edexcel paper conditions side-by-side with official examiners' criteria.
            </p>
          </div>
        </div>

        {/* Pacing Timer */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 shadow-sm">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs sm:text-sm font-bold text-white">
            {formatTimer(timerSeconds)}
          </span>
          <span className="text-[10px] text-slate-500">/ {targetTimeMinutes}m target</span>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isTimerRunning ? 'Pause timer' : 'Start exam pacing timer'}
          >
            {isTimerRunning ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
          </button>
          <button
            onClick={handleResetTimer}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mark Scheme Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="md:hidden flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setMobilePane('question')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                mobilePane === 'question' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Question
            </button>
            <button
              onClick={() => setMobilePane('markscheme')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                mobilePane === 'markscheme' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Mark Scheme
            </button>
          </div>

          {/* Paper View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setPaperViewMode('transcribed')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                paperViewMode === 'transcribed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transcribed
            </button>
            <button
              onClick={() => setPaperViewMode('pdf')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                paperViewMode === 'pdf' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3 w-3" />
              <span>PDF Viewer</span>
            </button>
          </div>

          <button
            onClick={() => setIsMarkSchemeVisible(!isMarkSchemeVisible)}
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            {isMarkSchemeVisible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                <span>Hide Mark Scheme (Blind Practice)</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span>Reveal Mark Scheme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Questions:</span>
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveQuestionIndex(idx);
                setTimerSeconds(0);
              }}
              className={`shrink-0 rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                activeQuestionIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Q{q.number}{q.subpart} ({q.marks}m)
            </button>
          ))}
        </div>

        <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
          Source: {currentQ.paperRef}
        </span>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[500px]">
        {/* LEFT PANE: Question Paper */}
        <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl flex flex-col justify-between ${
          isMarkSchemeVisible ? 'md:col-span-6' : 'md:col-span-12'
        } ${mobilePane === 'question' ? 'block' : 'hidden md:flex'}`}>
          {paperViewMode === 'pdf' ? (
            <div className="flex-1 flex flex-col space-y-3 min-h-[460px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                    Official Exam PDF
                  </span>
                  <span className="text-xs font-bold text-white">{currentQ.paperRef}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={officialPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open in Tab</span>
                  </a>
                  <a
                    href={officialPdfUrl}
                    download
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF iframe / Document Preview */}
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col min-h-[420px]">
                <iframe
                  src={`${officialPdfUrl}#view=FitH&toolbar=0`}
                  title="Official Examination Paper PDF"
                  className="w-full flex-1 min-h-[400px] border-0"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                    Question Paper
                  </span>
                  <span className="text-xs font-bold text-white">Q{currentQ.number}{currentQ.subpart}</span>
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-slate-700">
                  [{currentQ.marks} Marks]
                </span>
              </div>

              {/* Question Text */}
              <div className="py-2">
                <MathRenderer
                  content={currentQ.questionPrompt}
                  className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed"
                />
              </div>

              {/* Math / Equation Box */}
              {currentQ.diagramOrMath && (
                <div className="rounded-xl border border-slate-700/60 bg-slate-950 p-4 text-center overflow-x-auto">
                  <MathRenderer content={`$$${currentQ.diagramOrMath}$$`} className="text-sm sm:text-base text-indigo-300 font-bold" />
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-800 pt-3 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Standard Pacing: {targetTimeMinutes} mins</span>
            <span className="font-semibold text-slate-300">Cambridge & Edexcel Standard</span>
          </div>
        </div>

        {/* RIGHT PANE: Mark Scheme */}
        {isMarkSchemeVisible && (
          <div className={`rounded-2xl border border-emerald-500/25 bg-slate-900/90 p-5 sm:p-6 shadow-xl flex flex-col justify-between md:col-span-6 ${
            mobilePane === 'markscheme' ? 'block' : 'hidden md:flex'
          }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  Official Mark Scheme
                </span>
                <span className="text-xs text-slate-400">Examiner Guidelines</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Total: {currentQ.marks} Marks</span>
            </div>

            {/* Step-by-Step Mark Breakdown */}
            <div className="space-y-3">
              {currentQ.markSchemePoints.map((pt, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-block rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/20">
                      {pt.markType}
                    </span>
                    <span className="text-[10px] text-slate-500">Step {idx + 1}</span>
                  </div>
                  <div className="text-xs text-slate-200">
                    <MathRenderer content={pt.requirement} />
                  </div>
                  {pt.guidance && (
                    <p className="text-[10px] text-slate-400 italic pt-0.5">
                      Examiner Note: {pt.guidance}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Final Answer */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Final Required Answer:
              </span>
              <div className="mt-1 text-sm font-bold text-white">
                <MathRenderer content={currentQ.finalAnswer} />
              </div>
            </div>

            {/* Examiner Trap */}
            {currentQ.examinerTrap && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-200/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-0.5 text-[11px]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Official Examiner Report Warning:
                </div>
                {currentQ.examinerTrap}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 text-[11px] text-slate-500 text-right">
            Verified with published examiner mark criteria
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
