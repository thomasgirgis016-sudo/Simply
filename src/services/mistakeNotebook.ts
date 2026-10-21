import { MistakeItem, MistakeReason } from '../types';

const STORAGE_KEY = 'simply_mistake_notebook';

export const INITIAL_MISTAKES: MistakeItem[] = [
  {
    id: 'mstk-1',
    subjectId: 'sub-math-0580',
    subjectCode: '0580',
    topic: 'Trigonometry & Bearings',
    paperCode: '0580/42/M/J/23',
    questionNumber: 'Q5(c)',
    questionPrompt: 'Calculate the bearing of ship A from lighthouse B given that the angle between North and the line AB is $42^\\circ$ measured clockwise from North to B.',
    myMistakeAnswer: '42° (Forgot that bearing must be 3 digits and measured from B, not from A).',
    markSchemeAnswer: '222° (Opposite bearing is $42^\\circ + 180^\\circ = 222^\\circ$). Must always be given as a 3-digit number.',
    examinerTip: 'Examiner Report: Over 50% of candidates gave the bearing of B from A rather than A from B, or omitted the 3-digit format.',
    reason: 'misread_command',
    marksLost: 2,
    totalMarks: 3,
    addedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    isMastered: false,
    rematchAttempts: 1,
  },
  {
    id: 'mstk-2',
    subjectId: 'sub-chem-0620',
    subjectCode: '0620',
    topic: 'Stoichiometry & Gas Volumes',
    paperCode: '0620/41/O/N/23',
    questionNumber: 'Q3(b)',
    questionPrompt: 'Calculate the volume of carbon dioxide gas produced at r.t.p. when $4.0\\text{ g}$ of calcium carbonate reacts completely with excess hydrochloric acid.',
    myMistakeAnswer: '0.96 cm³ (Did not convert moles $\\times 24\\text{ dm}^3$ properly, confused cm³ and dm³).',
    markSchemeAnswer: '0.96 dm³ or 960 cm³. (Moles of $CaCO_3 = 4.0 / 100 = 0.04\\text{ mol}$. Vol = $0.04 \\times 24 = 0.96\\text{ dm}^3$).',
    examinerTip: 'Examiner Report: Candidates frequently lost the final accuracy mark due to missing or contradictory units (e.g. writing $0.96\\text{ cm}^3$ instead of $\\text{dm}^3$).',
    reason: 'unit_confusion',
    marksLost: 1,
    totalMarks: 3,
    addedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    isMastered: false,
    rematchAttempts: 0,
  },
  {
    id: 'mstk-3',
    subjectId: 'sub-phys-0625',
    subjectCode: '0625',
    topic: 'Thermal Physics & Specific Heat Capacity',
    paperCode: '0625/42/M/J/22',
    questionNumber: 'Q4(a)',
    questionPrompt: 'An electric immersion heater of power $500\\text{ W}$ heats $0.80\\text{ kg}$ of water for 3.0 minutes. Calculate the rise in temperature. ($c = 4200\\text{ J}/(\\text{kg}\\cdot^\\circ\\text{C})$).',
    myMistakeAnswer: '0.45°C (Substituted 3 minutes directly into $E = P \\times t$ instead of converting to $3 \\times 60 = 180\\text{ s}$).',
    markSchemeAnswer: '26.8°C (or 27°C). Energy = $500 \\times 180 = 90,000\\text{ J}$. $\\Delta T = 90,000 / (0.80 \\times 4200) = 26.8^\\circ\\text{C}$.',
    examinerTip: 'Examiner Report: Time in physics equations must always be in seconds. Multiplying by minutes is an automatic method mark forfeiture.',
    reason: 'formula_forgotten',
    marksLost: 2,
    totalMarks: 4,
    addedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    isMastered: true,
    masteredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    rematchAttempts: 2,
  },
  {
    id: 'mstk-4',
    subjectId: 'sub-bio-0610',
    subjectCode: '0610',
    topic: 'Enzymes & Temperature',
    paperCode: '0610/43/M/J/23',
    questionNumber: 'Q2(c)',
    questionPrompt: 'Explain why the rate of an enzyme-controlled reaction decreases sharply above 60°C.',
    myMistakeAnswer: 'The enzyme dies and stops working because it is too hot.',
    markSchemeAnswer: 'High temperature causes active site to change shape / denature so substrate can no longer fit / form enzyme-substrate complexes.',
    examinerTip: 'Examiner Report: Enzymes are proteins, NOT living organisms; writing "the enzyme dies" awards zero marks. You must state "the active site denatures".',
    reason: 'concept_gap',
    marksLost: 3,
    totalMarks: 3,
    addedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    isMastered: false,
    rematchAttempts: 1,
  },
  {
    id: 'mstk-5',
    subjectId: 'sub-math-0580',
    subjectCode: '0580',
    topic: 'Algebra & Quadratic Equations',
    paperCode: '0580/22/O/N/22',
    questionNumber: 'Q11',
    questionPrompt: 'Solve $(2x - 3)^2 = 25$. Give both possible solutions.',
    myMistakeAnswer: 'x = 4 (Only took the positive square root $\\sqrt{25} = 5$ and forgot $-5$).',
    markSchemeAnswer: 'x = 4 or x = -1. ($2x - 3 = \\pm 5 \\implies 2x = 8 \\text{ or } 2x = -2$).',
    examinerTip: 'Examiner Report: A classic trap. Taking only the principal square root loses the second accuracy mark.',
    reason: 'careless_math',
    marksLost: 1,
    totalMarks: 3,
    addedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    isMastered: false,
    rematchAttempts: 0,
  }
];

export const getMistakeNotebook = (): MistakeItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MISTAKES));
      return INITIAL_MISTAKES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading mistake notebook:', err);
    return INITIAL_MISTAKES;
  }
};

export const saveMistakeNotebook = (items: MistakeItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('simply_mistakes_updated', { detail: items }));
  } catch (err) {
    console.error('Error saving mistake notebook:', err);
  }
};

export const addMistakeItem = (item: Omit<MistakeItem, 'id' | 'addedAt' | 'isMastered' | 'rematchAttempts'>): MistakeItem => {
  const current = getMistakeNotebook();
  const newItem: MistakeItem = {
    ...item,
    id: `mstk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    addedAt: new Date().toISOString(),
    isMastered: false,
    rematchAttempts: 0,
  };
  const updated = [newItem, ...current];
  saveMistakeNotebook(updated);
  return newItem;
};

export const markMistakeMastered = (id: string, isMastered: boolean): void => {
  const current = getMistakeNotebook();
  const updated = current.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        isMastered,
        masteredAt: isMastered ? new Date().toISOString() : undefined,
        rematchAttempts: m.rematchAttempts + 1,
      };
    }
    return m;
  });
  saveMistakeNotebook(updated);
};

export const deleteMistakeItem = (id: string): void => {
  const current = getMistakeNotebook();
  const updated = current.filter((m) => m.id !== id);
  saveMistakeNotebook(updated);
};

export const getReasonMetadata = (reason: MistakeReason): { label: string; color: string; iconText: string; advice: string } => {
  switch (reason) {
    case 'careless_math':
      return {
        label: 'Careless Arithmetic / Sign Slip',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        iconText: '±',
        advice: 'Always bracket negative numbers and re-punch calculations twice into the calculator.'
      };
    case 'misread_command':
      return {
        label: 'Misread Question / Command Trap',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        iconText: '⚠️',
        advice: 'Underline key words ("from", "bearing", "in terms of", "exact", "describe vs explain").'
      };
    case 'formula_forgotten':
      return {
        label: 'Formula / Theorem Slip',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        iconText: '📐',
        advice: 'Add this formula to your daily SM-2 spaced repetition cards right away.'
      };
    case 'unit_confusion':
      return {
        label: 'Unit Conversion Trap',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        iconText: '📏',
        advice: 'Check whether the answer line demands cm³, dm³, m³, kJ, or J. Run the 60s Unit Blitz!'
      };
    case 'concept_gap':
      return {
        label: 'Syllabus Concept Gap',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        iconText: '🧠',
        advice: 'Re-read the revision notes for this chapter and consult Cambridge mark scheme phrasing.'
      };
    case 'time_pressure':
      return {
        label: 'Time Pressure / Rushed',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        iconText: '⏱️',
        advice: 'Budget 1 minute per mark. Skip and return if stuck for more than 90 seconds.'
      };
    default:
      return {
        label: 'General Mistake',
        color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
        iconText: '•',
        advice: 'Review the mark scheme solution carefully.'
      };
  }
};
