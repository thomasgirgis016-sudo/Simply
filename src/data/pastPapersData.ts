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

export const OFFICIAL_PAST_PAPER_PDFS: OfficialPaperPdf[] = [
  // ==========================================================
  // CAMBRIDGE IGCSE MATHEMATICS (0580)
  // ==========================================================
  {
    id: 'pdf-0580-s24-41',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    subjectCode: '0580',
    board: 'CIE',
    year: 2024,
    session: 'May/June 2024',
    paperComponent: 'Paper 41 (Extended Theory Calculator)',
    paperCode: '0580/41',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0580_s24_qp_41.pdf',
    msPdfUrl: '/past-papers/0580_s24_ms_41.pdf',
    examinerReportUrl: '/past-papers/0580_s24_er.pdf',
    fileSizeBytes: '1.24 MB'
  },
  {
    id: 'pdf-0580-s24-21',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    subjectCode: '0580',
    board: 'CIE',
    year: 2024,
    session: 'May/June 2024',
    paperComponent: 'Paper 21 (Extended Short-Answer)',
    paperCode: '0580/21',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0580_s24_qp_21.pdf',
    msPdfUrl: '/past-papers/0580_s24_ms_21.pdf',
    fileSizeBytes: '1.18 MB'
  },
  {
    id: 'pdf-0580-sp25-4',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics',
    subjectCode: '0580',
    board: 'CIE',
    year: 2025,
    session: '2025 Specimen Series',
    paperComponent: 'Paper 4 (Extended Calculator)',
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
    paperComponent: 'Paper 2 (Extended Non-Calculator)',
    paperCode: '0580/02',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0580_sp25_qp_2.pdf',
    msPdfUrl: '/past-papers/0580_sp25_ms_2.pdf',
    fileSizeBytes: '1.65 MB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE PHYSICS (0625)
  // ==========================================================
  {
    id: 'pdf-0625-sp23-4',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics',
    subjectCode: '0625',
    board: 'CIE',
    year: 2023,
    session: '2023-2025 Specimen Series',
    paperComponent: 'Paper 4 (Theory Extended)',
    paperCode: '0625/04',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0625_sp23_qp_4.pdf',
    msPdfUrl: '/past-papers/0625_sp23_ms_4.pdf',
    fileSizeBytes: '1.39 MB'
  },
  {
    id: 'pdf-0625-sp23-2',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics',
    subjectCode: '0625',
    board: 'CIE',
    year: 2023,
    session: '2023-2025 Specimen Series',
    paperComponent: 'Paper 2 (Multiple Choice Extended)',
    paperCode: '0625/02',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0625_sp23_qp_2.pdf',
    fileSizeBytes: '1.53 MB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE CHEMISTRY (0620)
  // ==========================================================
  {
    id: 'pdf-0620-sp23-4',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry',
    subjectCode: '0620',
    board: 'CIE',
    year: 2023,
    session: '2023-2025 Specimen Series',
    paperComponent: 'Paper 4 (Theory Extended)',
    paperCode: '0620/04',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0620_sp23_qp_4.pdf',
    msPdfUrl: '/past-papers/0620_sp23_ms_4.pdf',
    fileSizeBytes: '1.21 MB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE BIOLOGY (0610)
  // ==========================================================
  {
    id: 'pdf-0610-sp23-4',
    subjectId: 'cie-bio-0610',
    subjectName: 'Biology',
    subjectCode: '0610',
    board: 'CIE',
    year: 2023,
    session: '2023-2025 Specimen Series',
    paperComponent: 'Paper 4 (Theory Extended)',
    paperCode: '0610/04',
    tier: 'Extended',
    qpPdfUrl: '/past-papers/0610_sp23_qp_4.pdf',
    msPdfUrl: '/past-papers/0610_sp23_ms_4.pdf',
    fileSizeBytes: '3.57 MB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE COMPUTER SCIENCE (0478)
  // ==========================================================
  {
    id: 'pdf-0478-sp23-1',
    subjectId: 'cie-cs-0478',
    subjectName: 'Computer Science',
    subjectCode: '0478',
    board: 'CIE',
    year: 2023,
    session: '2023-2025 Specimen Series',
    paperComponent: 'Paper 1 (Computer Systems)',
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
    paperComponent: 'Paper 2 (Algorithms, Programming & Logic)',
    paperCode: '0478/02',
    tier: 'General',
    qpPdfUrl: '/past-papers/0478_sp23_qp_2.pdf',
    fileSizeBytes: '1.23 MB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE ECONOMICS (0455)
  // ==========================================================
  {
    id: 'pdf-0455-sp27-1',
    subjectId: 'cie-econ-0455',
    subjectName: 'Economics',
    subjectCode: '0455',
    board: 'CIE',
    year: 2027,
    session: 'Specimen Assessment Series',
    paperComponent: 'Paper 1 (Multiple Choice)',
    paperCode: '0455/01',
    tier: 'General',
    qpPdfUrl: '/past-papers/0455_sp27_qp_1.pdf',
    msPdfUrl: '/past-papers/0455_sp27_ms_1.pdf',
    fileSizeBytes: '520 KB'
  },
  {
    id: 'pdf-0455-sp27-2',
    subjectId: 'cie-econ-0455',
    subjectName: 'Economics',
    subjectCode: '0455',
    board: 'CIE',
    year: 2027,
    session: 'Specimen Assessment Series',
    paperComponent: 'Paper 2 (Structured Questions)',
    paperCode: '0455/02',
    tier: 'General',
    qpPdfUrl: '/past-papers/0455_sp27_qp_2.pdf',
    fileSizeBytes: '520 KB'
  },

  // ==========================================================
  // CAMBRIDGE IGCSE ENGLISH AS A SECOND LANGUAGE (0510)
  // ==========================================================
  {
    id: 'pdf-0510-sp24-1',
    subjectId: 'cie-esl-0510',
    subjectName: 'English as a Second Language',
    subjectCode: '0510',
    board: 'CIE',
    year: 2024,
    session: '2024-2026 Specimen Series',
    paperComponent: 'Paper 1 (Reading & Writing)',
    paperCode: '0510/01',
    tier: 'General',
    qpPdfUrl: '/past-papers/0510_sp24_qp_1.pdf',
    msPdfUrl: '/past-papers/0510_sp24_ms_1.pdf',
    fileSizeBytes: '520 KB'
  },
  {
    id: 'pdf-0510-sp24-2',
    subjectId: 'cie-esl-0510',
    subjectName: 'English as a Second Language',
    subjectCode: '0510',
    board: 'CIE',
    year: 2024,
    session: '2024-2026 Specimen Series',
    paperComponent: 'Paper 2 (Listening Comprehension)',
    paperCode: '0510/02',
    tier: 'General',
    qpPdfUrl: '/past-papers/0510_sp24_qp_2.pdf',
    fileSizeBytes: '520 KB'
  },

  // ==========================================================
  // PEARSON EDEXCEL INTERNATIONAL GCSES
  // ==========================================================
  {
    id: 'pdf-edx-math-4ma1',
    subjectId: 'edx-math-4ma1',
    subjectName: 'Mathematics A',
    subjectCode: '4MA1',
    board: 'Edexcel',
    year: 2024,
    session: 'Exam Series Archive',
    paperComponent: 'Paper 1H & 2H Specimen Assessment Materials',
    paperCode: '4MA1/1H',
    tier: 'Extended',
    qpPdfUrl: 'https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Mathematics%20A/2016/Specification%20and%20sample%20assessments/International%20GCSE_Mathematics_%20Specification_A-4MA1.pdf',
    fileSizeBytes: '2.4 MB'
  },
  {
    id: 'pdf-edx-phys-4ph1',
    subjectId: 'edx-physics-4ph1',
    subjectName: 'Physics',
    subjectCode: '4PH1',
    board: 'Edexcel',
    year: 2024,
    session: 'Exam Series Archive',
    paperComponent: 'Paper 1P & 2P Specimen Assessment Materials',
    paperCode: '4PH1/1P',
    tier: 'Extended',
    qpPdfUrl: 'https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/Specification%20and%20sample%20assessments/International_GCSE_Physics_4PH1_Spec.pdf',
    fileSizeBytes: '1.9 MB'
  },
  {
    id: 'pdf-edx-chem-4ch1',
    subjectId: 'edx-chem-4ch1',
    subjectName: 'Chemistry',
    subjectCode: '4CH1',
    board: 'Edexcel',
    year: 2024,
    session: 'Exam Series Archive',
    paperComponent: 'Paper 1C & 2C Specimen Assessment Materials',
    paperCode: '4CH1/1C',
    tier: 'Extended',
    qpPdfUrl: 'https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Chemistry/2017/Specification%20and%20sample%20assessments/International_GCSE_Chemistry_4CH1_Spec.pdf',
    fileSizeBytes: '1.8 MB'
  }
];

// Generate official Cambridge/Edexcel paper archive download URL or local static fallback
export function getPaperDownloadUrl(paper: PastPaperItem, type: 'qp' | 'ms'): string {
  if (type === 'qp' && paper.pdfUrl) return paper.pdfUrl;
  if (type === 'ms' && paper.markSchemePdfUrl) return paper.markSchemePdfUrl;

  // Check if we have an official static PDF file for this subject
  const match = OFFICIAL_PAST_PAPER_PDFS.find(
    (p) => p.subjectId === paper.subjectId
  );
  if (match) {
    if (type === 'qp' && match.qpPdfUrl) return match.qpPdfUrl;
    if (type === 'ms' && match.msPdfUrl) return match.msPdfUrl;
  }

  const rawCode = paper.paperCode.replace(/[^0-9a-zA-Z]/g, '');
  const syllabusMatch = paper.paperCode.match(/(\d{4}|\w{4})/);
  const syllabus = syllabusMatch ? syllabusMatch[1] : '0580';
  const year = paper.year || 2023;
  const isMayJune = paper.session.toLowerCase().includes('may') || paper.session.toLowerCase().includes('june');
  const isOctNov = paper.session.toLowerCase().includes('oct') || paper.session.toLowerCase().includes('nov');
  const seasonCode = isMayJune ? `s${String(year).slice(-2)}` : isOctNov ? `w${String(year).slice(-2)}` : `m${String(year).slice(-2)}`;
  const paperComponent = rawCode.replace(syllabus, '') || '42';

  if (paper.board === 'CIE') {
    return `https://www.cambridgeinternational.org/programmes-and-qualifications/`;
  }
  return `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?q=${encodeURIComponent(paper.paperCode)}`;
}
