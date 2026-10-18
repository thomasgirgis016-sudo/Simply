import { PastPaperItem, OfficialPaperPdf } from '../types';

export const PAST_PAPERS_DATABASE: PastPaperItem[] = [
  {
    id: 'pp-math-1',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    board: 'CIE',
    session: 'May/June 2023 Paper 42',
    paperCode: '0580/42',
    year: 2023,
    questionNumber: 'Q6(b)',
    topic: 'Trigonometry & Bearings',
    difficultyTier: 'Grade 9 Challenge',
    snippetQuery: 'two cyclists bearing 040 cosine rule triangle bearings distance',
    questionPrompt: 'Cyclist A leaves town P and travels on a bearing of 040° at a constant speed of 18 km/h.\nAt the same time, Cyclist B leaves P and travels on a bearing of 115° at a constant speed of 24 km/h.\nCalculate the distance between the two cyclists after 1.5 hours.',
    diagramOrMath: 'c^2 = a^2 + b^2 - 2ab\\cos(C)',
    marks: 5,
    markScheme: [
      { markType: '[B1]', requirement: 'Distance for A = 18 × 1.5 = 27 km; Distance for B = 24 × 1.5 = 36 km' },
      { markType: '[B1]', requirement: 'Angle between courses = 115° - 040° = 75°' },
      { markType: '[M1]', requirement: 'Correct application of cosine rule: $d^2 = 27^2 + 36^2 - 2(27)(36)\\cos(75°)$' },
      { markType: '[M1]', requirement: 'Evaluation of expression: $d^2 = 729 + 1296 - 1944(0.2588) = 1521.85$' },
      { markType: '[A1]', requirement: 'Distance $d = 39.0$ km (accept 39 or 39.01)' }
    ],
    finalAnswer: '$39.0\\text{ km}$',
    examinerReportSnippet: 'Common error: Candidates subtracted the bearing angles incorrectly or forgot to convert speeds to distances before applying the cosine rule.'
  },
  {
    id: 'pp-math-2',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    board: 'CIE',
    session: 'Oct/Nov 2022 Paper 42',
    paperCode: '0580/42',
    year: 2022,
    questionNumber: 'Q7(c)',
    topic: 'Algebra & Sequences',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'quadratic sequence nth term 2a 3a+b differences second difference',
    questionPrompt: 'Find the $n$th term of the quadratic sequence:\n$4, \\quad 11, \\quad 22, \\quad 37, \\quad 56, \\dots$',
    diagramOrMath: 'an^2 + bn + c',
    marks: 4,
    markScheme: [
      { markType: '[M1]', requirement: 'Finding first differences (7, 11, 15, 19) and constant second difference = 4' },
      { markType: '[M1]', requirement: '$2a = 4 \\implies a = 2$, identifying $2n^2$ component' },
      { markType: '[M1]', requirement: 'Subtracting $2n^2$ from terms (4 - 2 = 2, 11 - 8 = 3, 22 - 18 = 4) gives linear sequence $n + 1$' },
      { markType: '[A1]', requirement: 'Final $n$th term = $2n^2 + n + 1$' }
    ],
    finalAnswer: '$2n^2 + n + 1$',
    examinerReportSnippet: 'Candidates often found $a = 2$ correctly but struggled to solve the linear system for $b$ and $c$, frequently writing $2n^2 + 2$.'
  },
  {
    id: 'pp-math-3',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    board: 'CIE',
    session: 'May/June 2022 Paper 42',
    paperCode: '0580/42',
    year: 2022,
    questionNumber: 'Q9(b)',
    topic: 'Vectors & Proof',
    difficultyTier: 'Grade 9 Challenge',
    snippetQuery: 'vector proof parallel straight line collinear scalar multiple vector OA OB',
    questionPrompt: 'In triangle $OAB$, $\\vec{OA} = \\mathbf{a}$ and $\\vec{OB} = \\mathbf{b}$. Point $M$ lies on $AB$ such that $AM : MB = 1 : 2$.\nPoint $N$ lies on $OB$ such that $ON = \\frac{1}{3}\\mathbf{b}$.\nShow that $\\vec{OM} = \\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b}$ and prove that $M, N$ and the point $P(2\\mathbf{a})$ lie on a straight line.',
    diagramOrMath: '\\vec{OM} = \\mathbf{a} + \\frac{1}{3}(\\mathbf{b} - \\mathbf{a})',
    marks: 6,
    markScheme: [
      { markType: '[B1]', requirement: '$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$' },
      { markType: '[M1]', requirement: '$\\vec{OM} = \\vec{OA} + \\frac{1}{3}\\vec{AB} = \\mathbf{a} + \\frac{1}{3}(\\mathbf{b} - \\mathbf{a}) = \\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b}$' },
      { markType: '[M1]', requirement: 'Find vector $\\vec{NM} = \\vec{OM} - \\vec{ON} = \\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b} - \\frac{1}{3}\\mathbf{b} = \\frac{2}{3}\\mathbf{a}$' },
      { markType: '[M1]', requirement: 'Find vector $\\vec{NP} = \\vec{OP} - \\vec{ON} = 2\\mathbf{a} - \\frac{1}{3}\\mathbf{b}$ or vector $\\vec{MP}$' },
      { markType: '[A1]', requirement: 'Demonstrating collinearity via parallel scalar multiple and common point' }
    ],
    finalAnswer: 'Proof shown: $\\vec{NM}$ is a scalar multiple of $\\vec{a}$ and points share common origin',
    examinerReportSnippet: 'Vector proofs are regularly among the lowest-scoring questions on Paper 4. Candidates fail to explicitly state that the vectors share a common point.'
  },
  {
    id: 'pp-chem-1',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry',
    board: 'CIE',
    session: 'Oct/Nov 2022 Paper 42',
    paperCode: '0620/42',
    year: 2022,
    questionNumber: 'Q5(b)',
    topic: 'Metals & Extraction',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'iron extraction blast furnace reactions hematite limestone coke carbon monoxide slag',
    questionPrompt: 'Iron is extracted from its ore, hematite ($Fe_2O_3$), in the blast furnace.\n(i) State the chemical equation for the reduction of hematite by carbon monoxide.\n(ii) Explain the role of limestone ($CaCO_3$) in removing acidic impurities, including both relevant chemical equations.',
    diagramOrMath: 'Fe_2O_3 + 3CO \\rightarrow 2Fe + 3CO_2',
    marks: 5,
    markScheme: [
      { markType: '[M1]', requirement: 'Balanced reduction equation: $Fe_2O_3 + 3CO \\rightarrow 2Fe + 3CO_2$' },
      { markType: '[B1]', requirement: 'Thermal decomposition of limestone: $CaCO_3 \\rightarrow CaO + CO_2$' },
      { markType: '[B1]', requirement: 'Acid-base neutralization with sand/silica ($SiO_2$): $CaO + SiO_2 \\rightarrow CaSiO_3$' },
      { markType: '[A1]', requirement: 'Identify product $CaSiO_3$ as molten slag, which floats on molten iron and is tapped off' }
    ],
    finalAnswer: '$Fe_2O_3 + 3CO \\rightarrow 2Fe + 3CO_2$; $CaO + SiO_2 \\rightarrow CaSiO_3$ (molten slag)',
    examinerReportSnippet: 'Many candidates wrote that carbon itself directly reduces hematite in modern blast furnaces, missing the main reducing agent which is carbon monoxide ($CO$).'
  },
  {
    id: 'pp-chem-2',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry',
    board: 'CIE',
    session: 'May/June 2023 Paper 41',
    paperCode: '0620/41',
    year: 2023,
    questionNumber: 'Q4(c)',
    topic: 'Electrochemistry & Electrolysis',
    difficultyTier: 'Grade 9 Challenge',
    snippetQuery: 'electrolysis brine concentrated aqueous sodium chloride chlorine hydrogen naoh',
    questionPrompt: 'Concentrated aqueous sodium chloride (brine) is electrolysed using inert carbon electrodes.\n(i) Name the gas discharged at the positive electrode (anode).\n(ii) Write the half-equation for the cathode reaction.\n(iii) Explain why the solution turns alkaline as the electrolysis proceeds.',
    diagramOrMath: '2H^+ + 2e^- \\rightarrow H_2 \\quad \\text{and} \\quad 2Cl^- \\rightarrow Cl_2 + 2e^-',
    marks: 4,
    markScheme: [
      { markType: '[B1]', requirement: 'Anode gas: Chlorine ($Cl_2$)' },
      { markType: '[M1]', requirement: 'Cathode half-equation: $2H^+ + 2e^- \\rightarrow H_2$ (or $2H_2O + 2e^- \\rightarrow H_2 + 2OH^-$)' },
      { markType: '[B1]', requirement: '$H^+$ ions and $Cl^-$ ions are discharged, leaving $Na^+$ and $OH^-$ in solution' },
      { markType: '[A1]', requirement: 'The excess $OH^-$ ions form sodium hydroxide ($NaOH$) which is strongly alkaline' }
    ],
    finalAnswer: '(i) Chlorine; (ii) $2H^+ + 2e^- \\rightarrow H_2$; (iii) Excess $OH^-$ ions produce $NaOH$',
    examinerReportSnippet: 'Common error: Writing that sodium metal forms at the cathode. Candidates must know that hydrogen is below sodium in the reactivity series.'
  },
  {
    id: 'pp-phys-1',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics',
    board: 'CIE',
    session: 'Oct/Nov 2023 Paper 42',
    paperCode: '0625/42',
    year: 2023,
    questionNumber: 'Q1(a)',
    topic: 'Motion, Forces & Energy',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'parachutist terminal velocity air resistance weight forces acceleration zero',
    questionPrompt: 'A skydiver jumps from an aeroplane.\n(i) In terms of the forces acting, explain why the skydiver reaches a terminal velocity before opening their parachute.\n(ii) Describe and explain what happens to the motion of the skydiver immediately after opening the parachute.',
    diagramOrMath: 'F_{\\text{net}} = W - D = 0',
    marks: 5,
    markScheme: [
      { markType: '[B1]', requirement: 'Initially downward force (weight) is greater than upward force (air resistance/drag)' },
      { markType: '[M1]', requirement: 'As speed increases, air resistance increases until upward drag equals downward weight' },
      { markType: '[A1]', requirement: 'Resultant force becomes zero, so acceleration is zero (terminal velocity reached)' },
      { markType: '[B1]', requirement: 'When parachute opens, surface area massively increases, causing large upward drag greater than weight' },
      { markType: '[A1]', requirement: 'Resultant force is upward, causing rapid deceleration to a lower terminal velocity' }
    ],
    finalAnswer: 'Terminal velocity: Drag = Weight, $F_{\\text{net}} = 0$. Opening parachute: Drag > Weight, upward deceleration.',
    examinerReportSnippet: 'A significant number of students wrote "gravity decreases" as the skydiver falls, which is completely incorrect. Gravitational pull remains constant.'
  },
  {
    id: 'pp-phys-2',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics',
    board: 'CIE',
    session: 'May/June 2023 Paper 41',
    paperCode: '0625/41',
    year: 2023,
    questionNumber: 'Q4(b)',
    topic: 'Waves & Light',
    difficultyTier: 'Core',
    snippetQuery: 'snell law refractive index critical angle total internal reflection sin i sin r',
    questionPrompt: 'A ray of light in air enters a transparent plastic block at an angle of incidence $i = 48°$.\nThe angle of refraction inside the plastic is $r = 29°$.\n(i) Calculate the refractive index $n$ of the plastic.\n(ii) Calculate the critical angle $c$ for this plastic-air boundary.',
    diagramOrMath: 'n = \\frac{\\sin(i)}{\\sin(r)} \\quad \\text{and} \\quad \\sin(c) = \\frac{1}{n}',
    marks: 4,
    markScheme: [
      { markType: '[M1]', requirement: 'Apply Snell’s law: $n = \\frac{\\sin(48°)}{\\sin(29°)}$' },
      { markType: '[A1]', requirement: '$n = \\frac{0.7431}{0.4848} = 1.53$' },
      { markType: '[M1]', requirement: 'Critical angle formula: $\\sin(c) = \\frac{1}{n} = \\frac{1}{1.53} = 0.6524$' },
      { markType: '[A1]', requirement: 'Critical angle $c = 40.7°$ (or $41°$)' }
    ],
    finalAnswer: '$n = 1.53$; Critical angle $c = 40.7°$',
    examinerReportSnippet: 'Candidates frequently inverted Snell’s formula or left the critical angle as $\\sin(c) = 0.65$ without performing the inverse sine $\\sin^{-1}$.'
  },
  {
    id: 'pp-bio-1',
    subjectId: 'cie-bio-0610',
    subjectName: 'Biology',
    board: 'CIE',
    session: 'May/June 2023 Paper 41',
    paperCode: '0610/41',
    year: 2023,
    questionNumber: 'Q3(a)',
    topic: 'Transport in Plants',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'transpiration bubble potometer capillary tube water uptake rate evaporation xylem',
    questionPrompt: 'A student uses a bubble potometer to investigate the rate of transpiration in a leafy shoot under different environmental conditions.\n(i) Name two environmental factors that would cause the air bubble to move faster along the capillary tube.\n(ii) Explain why the rate of water uptake measured by the potometer is not exactly equal to the rate of transpiration.',
    diagramOrMath: '\\text{Rate} = \\frac{\\text{Distance}}{\\text{Time}}',
    marks: 4,
    markScheme: [
      { markType: '[B1]', requirement: 'Higher temperature / increased light intensity / increased wind speed / lower humidity (any two)' },
      { markType: '[B1]', requirement: 'Second valid environmental condition' },
      { markType: '[M1]', requirement: 'Some water taken up by the plant is used in photosynthesis' },
      { markType: '[A1]', requirement: 'Some water is retained in cells for turgidity / cell expansion' }
    ],
    finalAnswer: '(i) Higher temperature and wind speed; (ii) Water is also utilized for photosynthesis and cell turgor.',
    examinerReportSnippet: 'Examiners noted that many candidates stated potometers measure "photosynthesis" rather than transpiration/water uptake.'
  },
  {
    id: 'pp-cs-1',
    subjectId: 'cie-cs-0478',
    subjectName: 'Computer Science',
    board: 'CIE',
    session: 'Oct/Nov 2023 Paper 12',
    paperCode: '0478/12',
    year: 2023,
    questionNumber: 'Q2(c)',
    topic: 'Data Representation',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'two complement 8 bit overflow binary negative sign bit addition',
    questionPrompt: '(i) Convert the denary number -42 into an 8-bit Two\'s Complement binary integer.\n(ii) Add the Two\'s Complement numbers 01101000 (+104) and 00110110 (+54). Explain what error occurs and why.',
    diagramOrMath: '-42 \\implies 11010110_2',
    marks: 4,
    markScheme: [
      { markType: '[M1]', requirement: '+42 in binary: 00101010. Invert bits: 11010101. Add 1: 11010110' },
      { markType: '[A1]', requirement: 'Correct Two\'s Complement = 11010110' },
      { markType: '[M1]', requirement: 'Sum: 01101000 + 00110110 = 10011110 (158 in unsigned)' },
      { markType: '[A1]', requirement: 'Overflow error: Adding two positive numbers resulted in a negative sign bit (1 in MSB), exceeding maximum 8-bit signed range (+127)' }
    ],
    finalAnswer: '(i) 11010110; (ii) Overflow error because sum (+158) exceeds +127 limit of 8-bit signed integer.',
    examinerReportSnippet: 'Candidates often identified that the result did not fit, but failed to mention the flip in the most significant bit (MSB) indicating an overflow error.'
  },
  {
    id: 'pp-esl-1',
    subjectId: 'cie-esl-0510',
    subjectName: 'English as a Second Language',
    board: 'CIE',
    session: 'May/June 2023 Paper 22',
    paperCode: '0510/22',
    year: 2023,
    questionNumber: 'Exercise 4',
    topic: 'Summary Writing',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'summary 120 words sea turtles nesting threats conservation linkers own words',
    questionPrompt: 'Read the article about sea turtle conservation. Write a summary explaining:\n1. The natural and human threats facing nesting sea turtles\n2. The conservation measures communities are taking to protect them.\nWrite between 100 and 120 words. Use your own words where possible.',
    diagramOrMath: '100 - 120 \\text{ words} \\implies 10 \\text{ Content} + 6 \\text{ Language}',
    marks: 16,
    markScheme: [
      { markType: '[Content 1-10]', requirement: 'Award up to 10 marks for distinct bullet points identified: coastal development, artificial beach lighting, plastic ingestion, poaching, predator predation; protected hatcheries, community patrols, turtle-friendly fishing gear.' },
      { markType: '[Language 1-6]', requirement: 'Band 5-6 (5-6 marks): Well-organized, concise, coherent with fluent connectors and high accuracy in punctuation and own words.' }
    ],
    finalAnswer: 'Concise 110-word summary with 8-10 content points and strong connectives.',
    examinerReportSnippet: 'Exceeding the 120-word limit resulted in examiners stopping reading after line 120, costing candidates valuable content marks.'
  },
  {
    id: 'pp-econ-1',
    subjectId: 'cie-econ-0455',
    subjectName: 'Economics',
    board: 'CIE',
    session: 'May/June 2023 Paper 22',
    paperCode: '0455/22',
    year: 2023,
    questionNumber: 'Q2(c)',
    topic: 'The Allocation of Resources',
    difficultyTier: 'Standard Extended',
    snippetQuery: 'price elasticity of demand PED cross elasticity revenue price increase inelastic',
    questionPrompt: 'A cinema increases ticket prices from $10 to $12. As a result, weekly attendance falls from 2,000 to 1,800 patrons.\n(i) Calculate the price elasticity of demand (PED) for cinema tickets.\n(ii) Explain the effect of this price change on the cinema\'s total revenue.',
    diagramOrMath: '\\text{PED} = \\frac{\\% \\Delta Q_d}{\\% \\Delta P}',
    marks: 4,
    markScheme: [
      { markType: '[M1]', requirement: '% Change in Q = (1800 - 2000)/2000 = -10%; % Change in P = (12 - 10)/10 = +20%' },
      { markType: '[A1]', requirement: 'PED = -10% / +20% = -0.5 (or 0.5)' },
      { markType: '[B1]', requirement: 'Demand is price inelastic (|PED| < 1)' },
      { markType: '[A1]', requirement: 'Initial revenue = $20,000; New revenue = 1,800 × $12 = $21,600. Total revenue increases.' }
    ],
    finalAnswer: 'PED = -0.5; Demand is inelastic, so total revenue increases by $1,600.',
    examinerReportSnippet: 'Many students calculated PED without percentage changes (using raw differences instead), leading to inaccurate values.'
  },
  {
    id: 'pp-edx-math-1',
    subjectId: 'edx-math-4ma1',
    subjectName: 'Mathematics A',
    board: 'Edexcel',
    session: 'Jan 2024 Paper 1H',
    paperCode: '4MA1/1H',
    year: 2024,
    questionNumber: 'Q18',
    topic: 'Calculus',
    difficultyTier: 'Grade 9 Challenge',
    snippetQuery: 'edexcel calculus turning points dy dx stationary point gradient differentiation',
    questionPrompt: 'A curve has equation $y = 2x^3 - 9x^2 + 12x + 5$.\n(i) Find $\\frac{dy}{dx}$.\n(ii) Find the coordinates of the two turning points on the curve.\n(iii) Determine the nature (maximum or minimum) of each turning point.',
    diagramOrMath: '\\frac{dy}{dx} = 6x^2 - 18x + 12 = 0',
    marks: 6,
    markScheme: [
      { markType: '[M1]', requirement: 'Differentiate: $\\frac{dy}{dx} = 6x^2 - 18x + 12$' },
      { markType: '[M1]', requirement: 'Set to zero for turning points: $6(x^2 - 3x + 2) = 0 \\implies (x - 1)(x - 2) = 0$' },
      { markType: '[A1]', requirement: '$x = 1 \\implies y = 10$; $x = 2 \\implies y = 9$. Points are $(1, 10)$ and $(2, 9)$' },
      { markType: '[M1]', requirement: 'Second derivative: $\\frac{d^2y}{dx^2} = 12x - 18$' },
      { markType: '[A1]', requirement: 'At $x=1$, $d^2y/dx^2 = -6 < 0$ (Maximum). At $x=2$, $d^2y/dx^2 = +6 > 0$ (Minimum).' }
    ],
    finalAnswer: '$(1, 10)$ is a local maximum; $(2, 9)$ is a local minimum.',
    examinerReportSnippet: 'Students frequently found the x-coordinates but forgot to substitute back into original equation to find the corresponding y-coordinates.'
  }
];

export function getCustomPastPapers(): PastPaperItem[] {
  try {
    const raw = localStorage.getItem('simply_igcse_custom_past_papers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPastPapers(papers: PastPaperItem[]) {
  try {
    localStorage.setItem('simply_igcse_custom_past_papers', JSON.stringify(papers));
  } catch (e) {
    console.error('Failed to save custom past papers:', e);
  }
}

export function getAllPastPapers(): PastPaperItem[] {
  return [...getCustomPastPapers(), ...PAST_PAPERS_DATABASE];
}

// ==========================================================
// LOCAL VERIFIED OFFLINE PAST PAPERS
// ==========================================================
export const LOCAL_VERIFIED_PDFS: Record<string, string> = {
  '0580_s24_qp_41.pdf': '/past-papers/0580_s24_qp_41.pdf',
  '0580_s24_ms_41.pdf': '/past-papers/0580_s24_ms_41.pdf',
  '0580_s24_qp_21.pdf': '/past-papers/0580_s24_qp_21.pdf',
  '0580_s24_ms_21.pdf': '/past-papers/0580_s24_ms_21.pdf',
  '0580_s24_er.pdf': '/past-papers/0580_s24_er.pdf',
  '0580_sp25_qp_4.pdf': '/past-papers/0580_sp25_qp_4.pdf',
  '0580_sp25_ms_4.pdf': '/past-papers/0580_sp25_ms_4.pdf',
  '0580_sp25_qp_2.pdf': '/past-papers/0580_sp25_qp_2.pdf',
  '0580_sp25_ms_2.pdf': '/past-papers/0580_sp25_ms_2.pdf',
  '0625_sp23_qp_4.pdf': '/past-papers/0625_sp23_qp_4.pdf',
  '0625_sp23_ms_4.pdf': '/past-papers/0625_sp23_ms_4.pdf',
  '0625_sp23_qp_2.pdf': '/past-papers/0625_sp23_qp_2.pdf',
  '0620_sp23_qp_4.pdf': '/past-papers/0620_sp23_qp_4.pdf',
  '0620_sp23_ms_4.pdf': '/past-papers/0620_sp23_ms_4.pdf',
  '0610_sp23_qp_4.pdf': '/past-papers/0610_sp23_qp_4.pdf',
  '0610_sp23_ms_4.pdf': '/past-papers/0610_sp23_ms_4.pdf',
  '0478_sp23_qp_1.pdf': '/past-papers/0478_sp23_qp_1.pdf',
  '0478_sp23_qp_2.pdf': '/past-papers/0478_sp23_qp_2.pdf',
};

interface SubjectConfig {
  id: string;
  name: string;
  code: string;
  slug: string;
  board: 'CIE';
  papers: {
    paperNumber: number;
    title: string;
    tier: 'Core' | 'Extended' | 'General';
    variants: number[];
  }[];
}

const CAMBRIDGE_SUBJECT_CONFIGS: SubjectConfig[] = [
  {
    id: 'cie-math-0580',
    name: 'Mathematics',
    code: '0580',
    slug: 'mathematics-0580',
    board: 'CIE',
    papers: [
      { paperNumber: 2, title: 'Paper 2 (Extended Short-Answer)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 4, title: 'Paper 4 (Extended Structured Calculator)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 1, title: 'Paper 1 (Core Short-Answer)', tier: 'Core', variants: [1, 2, 3] },
      { paperNumber: 3, title: 'Paper 3 (Core Structured)', tier: 'Core', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-physics-0625',
    name: 'Physics',
    code: '0625',
    slug: 'physics-0625',
    board: 'CIE',
    papers: [
      { paperNumber: 2, title: 'Paper 2 (Multiple Choice Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 4, title: 'Paper 4 (Theory Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 6, title: 'Paper 6 (Alternative to Practical)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 1, title: 'Paper 1 (Multiple Choice Core)', tier: 'Core', variants: [1, 2, 3] },
      { paperNumber: 3, title: 'Paper 3 (Theory Core)', tier: 'Core', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-chem-0620',
    name: 'Chemistry',
    code: '0620',
    slug: 'chemistry-0620',
    board: 'CIE',
    papers: [
      { paperNumber: 2, title: 'Paper 2 (Multiple Choice Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 4, title: 'Paper 4 (Theory Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 6, title: 'Paper 6 (Alternative to Practical)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 1, title: 'Paper 1 (Multiple Choice Core)', tier: 'Core', variants: [1, 2, 3] },
      { paperNumber: 3, title: 'Paper 3 (Theory Core)', tier: 'Core', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-bio-0610',
    name: 'Biology',
    code: '0610',
    slug: 'biology-0610',
    board: 'CIE',
    papers: [
      { paperNumber: 2, title: 'Paper 2 (Multiple Choice Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 4, title: 'Paper 4 (Theory Extended)', tier: 'Extended', variants: [1, 2, 3] },
      { paperNumber: 6, title: 'Paper 6 (Alternative to Practical)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 1, title: 'Paper 1 (Multiple Choice Core)', tier: 'Core', variants: [1, 2, 3] },
      { paperNumber: 3, title: 'Paper 3 (Theory Core)', tier: 'Core', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-cs-0478',
    name: 'Computer Science',
    code: '0478',
    slug: 'computer-science-0478',
    board: 'CIE',
    papers: [
      { paperNumber: 1, title: 'Paper 1 (Theory of Computer Systems)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 2, title: 'Paper 2 (Algorithms, Programming & Logic)', tier: 'General', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-econ-0455',
    name: 'Economics',
    code: '0455',
    slug: 'economics-0455',
    board: 'CIE',
    papers: [
      { paperNumber: 1, title: 'Paper 1 (Multiple Choice)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 2, title: 'Paper 2 (Structured Questions)', tier: 'General', variants: [1, 2, 3] }
    ]
  },
  {
    id: 'cie-esl-0510',
    name: 'English as a Second Language',
    code: '0510',
    slug: 'english-second-language-0510',
    board: 'CIE',
    papers: [
      { paperNumber: 1, title: 'Paper 1 (Reading & Writing)', tier: 'General', variants: [1, 2, 3] },
      { paperNumber: 2, title: 'Paper 2 (Listening Comprehension)', tier: 'General', variants: [1, 2, 3] }
    ]
  }
];

function generateOfficialPastPapers(): OfficialPaperPdf[] {
  const result: OfficialPaperPdf[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

  const seriesList: { code: 's' | 'w' | 'm'; name: string }[] = [
    { code: 's', name: 'May/June' },
    { code: 'w', name: 'Oct/Nov' },
    { code: 'm', name: 'Feb/March' }
  ];

  // 1. Cambridge IGCSE 2018 - 2024 Full Variants & Papers
  for (const sub of CAMBRIDGE_SUBJECT_CONFIGS) {
    for (const yr of years) {
      const yy = String(yr).slice(-2);

      for (const series of seriesList) {
        // Feb/March series only runs in India with variant 2
        const variantsForSeries = series.code === 'm' ? [2] : [1, 2, 3];

        for (const p of sub.papers) {
          for (const v of p.variants) {
            if (!variantsForSeries.includes(v)) continue;

            const compCode = `${p.paperNumber}${v}`;
            const paperCode = `${sub.code}/${compCode}`;
            const qpFilename = `${sub.code}_${series.code}${yy}_qp_${compCode}.pdf`;
            const msFilename = `${sub.code}_${series.code}${yy}_ms_${compCode}.pdf`;
            const erFilename = `${sub.code}_${series.code}${yy}_er.pdf`;
            const gtFilename = `${sub.code}_${series.code}${yy}_gt.pdf`;

            const qpUrl = LOCAL_VERIFIED_PDFS[qpFilename] ||
              `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${qpFilename}`;
            const backupQp = `https://bestexamhelp.com/exam/cambridge-igcse/${sub.slug}/${yr}/${qpFilename}`;

            const msUrl = LOCAL_VERIFIED_PDFS[msFilename] ||
              `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${msFilename}`;
            const backupMs = `https://bestexamhelp.com/exam/cambridge-igcse/${sub.slug}/${yr}/${msFilename}`;

            const erUrl = LOCAL_VERIFIED_PDFS[erFilename] ||
              `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${erFilename}`;
            const gtUrl = `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${gtFilename}`;

            result.push({
              id: `pdf-${sub.code}-${series.code}${yy}-${compCode}`,
              subjectId: sub.id,
              subjectName: sub.name,
              subjectCode: sub.code,
              board: sub.board,
              year: yr,
              session: `${series.name} ${yr}`,
              seasonCode: series.code,
              paperNumber: p.paperNumber,
              variant: v,
              paperComponent: `${p.title} (Variant ${v})`,
              paperCode,
              tier: p.tier,
              qpPdfUrl: qpUrl,
              backupQpUrl: backupQp,
              msPdfUrl: msUrl,
              backupMsUrl: backupMs,
              examinerReportUrl: erUrl,
              gradeThresholdsUrl: gtUrl,
              fileSizeBytes: 'Official PDF'
            });
          }
        }
      }
    }
  }

  // 2. Specimen 2025 Assessment Papers
  result.unshift(
    {
      id: 'pdf-0580-sp25-4',
      subjectId: 'cie-math-0580',
      subjectName: 'Mathematics',
      subjectCode: '0580',
      board: 'CIE',
      year: 2025,
      session: '2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 4,
      variant: 2,
      paperComponent: 'Paper 4 (Extended Calculator Specimen)',
      paperCode: '0580/04',
      tier: 'Extended',
      qpPdfUrl: '/past-papers/0580_sp25_qp_4.pdf',
      msPdfUrl: '/past-papers/0580_sp25_ms_4.pdf',
      fileSizeBytes: '1.64 MB'
    },
    {
      id: 'pdf-0580-sp25-2',
      subjectId: 'cie-math-0580',
      subjectName: 'Mathematics',
      subjectCode: '0580',
      board: 'CIE',
      year: 2025,
      session: '2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 2,
      variant: 2,
      paperComponent: 'Paper 2 (Extended Non-Calculator Specimen)',
      paperCode: '0580/02',
      tier: 'Extended',
      qpPdfUrl: '/past-papers/0580_sp25_qp_2.pdf',
      msPdfUrl: '/past-papers/0580_sp25_ms_2.pdf',
      fileSizeBytes: '1.65 MB'
    },
    {
      id: 'pdf-0625-sp23-4',
      subjectId: 'cie-physics-0625',
      subjectName: 'Physics',
      subjectCode: '0625',
      board: 'CIE',
      year: 2023,
      session: '2023-2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 4,
      variant: 2,
      paperComponent: 'Paper 4 (Theory Extended Specimen)',
      paperCode: '0625/04',
      tier: 'Extended',
      qpPdfUrl: '/past-papers/0625_sp23_qp_4.pdf',
      msPdfUrl: '/past-papers/0625_sp23_ms_4.pdf',
      fileSizeBytes: '1.39 MB'
    },
    {
      id: 'pdf-0620-sp23-4',
      subjectId: 'cie-chem-0620',
      subjectName: 'Chemistry',
      subjectCode: '0620',
      board: 'CIE',
      year: 2023,
      session: '2023-2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 4,
      variant: 2,
      paperComponent: 'Paper 4 (Theory Extended Specimen)',
      paperCode: '0620/04',
      tier: 'Extended',
      qpPdfUrl: '/past-papers/0620_sp23_qp_4.pdf',
      msPdfUrl: '/past-papers/0620_sp23_ms_4.pdf',
      fileSizeBytes: '1.21 MB'
    },
    {
      id: 'pdf-0610-sp23-4',
      subjectId: 'cie-bio-0610',
      subjectName: 'Biology',
      subjectCode: '0610',
      board: 'CIE',
      year: 2023,
      session: '2023-2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 4,
      variant: 2,
      paperComponent: 'Paper 4 (Theory Extended Specimen)',
      paperCode: '0610/04',
      tier: 'Extended',
      qpPdfUrl: '/past-papers/0610_sp23_qp_4.pdf',
      msPdfUrl: '/past-papers/0610_sp23_ms_4.pdf',
      fileSizeBytes: '3.57 MB'
    },
    {
      id: 'pdf-0478-sp23-1',
      subjectId: 'cie-cs-0478',
      subjectName: 'Computer Science',
      subjectCode: '0478',
      board: 'CIE',
      year: 2023,
      session: '2023-2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 1,
      variant: 1,
      paperComponent: 'Paper 1 (Computer Systems Specimen)',
      paperCode: '0478/01',
      tier: 'General',
      qpPdfUrl: '/past-papers/0478_sp23_qp_1.pdf',
      fileSizeBytes: '1.01 MB'
    },
    {
      id: 'pdf-0478-sp23-2',
      subjectId: 'cie-cs-0478',
      subjectName: 'Computer Science',
      subjectCode: '0478',
      board: 'CIE',
      year: 2023,
      session: '2023-2025 Specimen Series',
      seasonCode: 'sp',
      paperNumber: 2,
      variant: 2,
      paperComponent: 'Paper 2 (Algorithms & Logic Specimen)',
      paperCode: '0478/02',
      tier: 'General',
      qpPdfUrl: '/past-papers/0478_sp23_qp_2.pdf',
      fileSizeBytes: '1.23 MB'
    }
  );

  // 3. Pearson Edexcel International GCSEs (2018 - 2024 Archive)
  const edexcelSubjects = [
    { id: 'edx-math-4ma1', name: 'Mathematics A', code: '4MA1', specUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/international-gcse-mathematics-a-2016.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExam-materials' },
    { id: 'edx-physics-4ph1', name: 'Physics', code: '4PH1', specUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/international-gcse-physics-2017.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExam-materials' },
    { id: 'edx-chem-4ch1', name: 'Chemistry', code: '4CH1', specUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/international-gcse-chemistry-2017.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExam-materials' },
    { id: 'edx-bio-4bi1', name: 'Biology', code: '4BI1', specUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/international-gcse-biology-2017.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExam-materials' },
    { id: 'edx-econ-4ec1', name: 'Economics', code: '4EC1', specUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/international-gcse-economics-2017.coursematerials.html#%2FfilterQuery=category:Pearson-UK:Category%2FExam-materials' },
  ];

  for (const edx of edexcelSubjects) {
    for (const yr of [2024, 2023, 2022, 2021, 2020, 2019, 2018]) {
      for (const sess of ['June', 'January']) {
        for (const pNum of [1, 2]) {
          const tierSuffix = edx.code === '4MA1' ? 'H' : (pNum === 1 ? '1P' : '2P');
          const paperCode = `${edx.code}/${pNum}${tierSuffix}`;
          const qpUrl = `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?q=${encodeURIComponent(edx.code + ' ' + yr + ' ' + sess + ' Paper ' + pNum)}`;
          const msUrl = `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?q=${encodeURIComponent(edx.code + ' ' + yr + ' ' + sess + ' Mark Scheme')}`;

          result.push({
            id: `pdf-edx-${edx.code}-${yr}-${sess.toLowerCase()}-${pNum}`,
            subjectId: edx.id,
            subjectName: edx.name,
            subjectCode: edx.code,
            board: 'Edexcel',
            year: yr,
            session: `${sess} ${yr}`,
            seasonCode: sess === 'June' ? 's' : 'm',
            paperNumber: pNum,
            variant: 1,
            paperComponent: `Paper ${pNum}${tierSuffix} (Higher Tier Assessment)`,
            paperCode,
            tier: 'Extended',
            qpPdfUrl: qpUrl,
            backupQpUrl: edx.specUrl,
            msPdfUrl: msUrl,
            fileSizeBytes: 'Official Exam Pack'
          });
        }
      }
    }
  }

  return result;
}

export const OFFICIAL_PAST_PAPER_PDFS: OfficialPaperPdf[] = generateOfficialPastPapers();

// Generate official Cambridge/Edexcel paper archive download URL or local static fallback
export function getPaperDownloadUrl(paper: PastPaperItem, type: 'qp' | 'ms'): string {
  if (type === 'qp' && paper.pdfUrl) return paper.pdfUrl;
  if (type === 'ms' && paper.markSchemePdfUrl) return paper.markSchemePdfUrl;

  const rawCode = paper.paperCode.replace(/[^0-9a-zA-Z]/g, '');
  const syllabusMatch = paper.paperCode.match(/(\d{4}|\w{4})/);
  const syllabus = syllabusMatch ? syllabusMatch[1] : '0580';
  const year = paper.year || 2023;
  const isMayJune = paper.session.toLowerCase().includes('may') || paper.session.toLowerCase().includes('june');
  const isOctNov = paper.session.toLowerCase().includes('oct') || paper.session.toLowerCase().includes('nov');
  const seasonCode = isMayJune ? 's' : isOctNov ? 'w' : 'm';
  const yy = String(year).slice(-2);
  const compMatch = paper.paperCode.match(/\/(\d{2})/);
  const comp = compMatch ? compMatch[1] : '42';
  const filename = `${syllabus}_${seasonCode}${yy}_${type}_${comp}.pdf`;

  if (LOCAL_VERIFIED_PDFS[filename]) {
    return LOCAL_VERIFIED_PDFS[filename];
  }

  return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
}
