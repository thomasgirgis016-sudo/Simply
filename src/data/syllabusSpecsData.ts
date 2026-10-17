import { SyllabusChecklistItem } from '../types';

export const INITIAL_SYLLABUS_SPECS: SyllabusChecklistItem[] = [
  // Cambridge IGCSE Mathematics 0580
  {
    id: 'cie-math-spec-1',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 1',
    unitTitle: 'Number & Computation',
    specCode: 'C1.1',
    statement: 'Identify and use natural numbers, integers, prime numbers, square and cube numbers, common factors and common multiples.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-math-spec-2',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 1',
    unitTitle: 'Number & Computation',
    specCode: 'E1.3',
    statement: 'Calculate with powers, roots, standard form A × 10^n where 1 ≤ A < 10 and n is an integer, and fractional indices.',
    tier: 'Extended',
    confidence: 'green'
  },
  {
    id: 'cie-math-spec-3',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 2',
    unitTitle: 'Algebra & Graphs',
    specCode: 'E2.5',
    statement: 'Solve quadratic equations by factorisation, completing the square, and using the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-math-spec-4',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 2',
    unitTitle: 'Algebra & Graphs',
    specCode: 'E2.11',
    statement: 'Find the gradient of a straight line, equation of a line y = mx + c, midpoints, and equations of perpendicular lines (m1 × m2 = -1).',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-math-spec-5',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 3',
    unitTitle: 'Geometry & Trigonometry',
    specCode: 'E3.4',
    statement: 'Calculate lengths and angles using Pythagoras theorem, SOH CAH TOA, sine rule a/sinA = b/sinB, and cosine rule a² = b² + c² - 2bc cosA.',
    tier: 'Extended',
    confidence: 'green'
  },
  {
    id: 'cie-math-spec-6',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 3',
    unitTitle: 'Geometry & Trigonometry',
    specCode: 'E3.6',
    statement: 'State and apply circle theorems: angle at centre is twice angle at circumference, angles in same segment, alternate segment theorem.',
    tier: 'Extended',
    confidence: 'red'
  },
  {
    id: 'cie-math-spec-7',
    subjectId: 'cie-math-0580',
    unitNumber: 'Unit 4',
    unitTitle: 'Vectors & Transformations',
    specCode: 'E4.2',
    statement: 'Represent vectors as column vectors, calculate vector magnitudes, and use vectors to prove geometric properties and collinearity.',
    tier: 'Extended',
    confidence: 'red'
  },

  // Cambridge IGCSE Chemistry 0620
  {
    id: 'cie-chem-spec-1',
    subjectId: 'cie-chem-0620',
    unitNumber: 'Unit 1',
    unitTitle: 'States of Matter',
    specCode: 'C1.1',
    statement: 'Describe the states of matter and explain changes of state in terms of kinetic particle theory and energy changes.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-chem-spec-2',
    subjectId: 'cie-chem-0620',
    unitNumber: 'Unit 3',
    unitTitle: 'Stoichiometry & Moles',
    specCode: 'E3.2',
    statement: 'Calculate stoichiometric reacting masses, moles (n = m/Mr), gas volumes at r.t.p. (24 dm³/mol), and solution concentrations (c = n/V).',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-chem-spec-3',
    subjectId: 'cie-chem-0620',
    unitNumber: 'Unit 4',
    unitTitle: 'Electrochemistry',
    specCode: 'E4.1',
    statement: 'Predict the products of electrolysis for molten binary compounds and concentrated aqueous sodium chloride, including half-equations.',
    tier: 'Extended',
    confidence: 'red'
  },
  {
    id: 'cie-chem-spec-4',
    subjectId: 'cie-chem-0620',
    unitNumber: 'Unit 6',
    unitTitle: 'Chemical Reactions & Redox',
    specCode: 'E6.3',
    statement: 'Define oxidation and reduction in terms of oxygen transfer, electron transfer (OIL RIG), and changes in oxidation state.',
    tier: 'Extended',
    confidence: 'green'
  },
  {
    id: 'cie-chem-spec-5',
    subjectId: 'cie-chem-0620',
    unitNumber: 'Unit 7',
    unitTitle: 'Acids, Bases & Salts',
    specCode: 'E7.2',
    statement: 'Describe the preparation of soluble and insoluble salts by precipitation and titration, with ionic equations and state symbols.',
    tier: 'Extended',
    confidence: 'amber'
  },

  // Cambridge IGCSE Physics 0625
  {
    id: 'cie-phys-spec-1',
    subjectId: 'cie-phys-0625',
    unitNumber: 'Unit 1',
    unitTitle: 'Motion & Forces',
    specCode: 'P1.2',
    statement: 'Distinguish between speed and velocity, calculate acceleration from velocity-time graphs, and determine distance as area under v-t graph.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-phys-spec-2',
    subjectId: 'cie-phys-0625',
    unitNumber: 'Unit 1',
    unitTitle: 'Motion & Forces',
    specCode: 'P1.5',
    statement: 'Apply Newton laws of motion and the principle of conservation of momentum: m1u1 + m2u2 = m1v1 + m2v2 in closed systems.',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-phys-spec-3',
    subjectId: 'cie-phys-0625',
    unitNumber: 'Unit 2',
    unitTitle: 'Thermal Physics',
    specCode: 'P2.2',
    statement: 'Explain thermal energy transfer by conduction, convection, and radiation, and describe everyday applications and vacuum flasks.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-phys-spec-4',
    subjectId: 'cie-phys-0625',
    unitNumber: 'Unit 3',
    unitTitle: 'Waves & Optics',
    specCode: 'P3.2',
    statement: 'Recall and use Snell’s Law n = sin(i)/sin(r) and the critical angle equation sin(c) = 1/n, describing total internal reflection.',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-phys-spec-5',
    subjectId: 'cie-phys-0625',
    unitNumber: 'Unit 4',
    unitTitle: 'Electricity & Magnetism',
    specCode: 'P4.3',
    statement: 'Recall and use V = IR, P = IV, and power loss P = I²R in transmission cables with step-up and step-down transformers (Vp/Vs = Np/Ns).',
    tier: 'Extended',
    confidence: 'red'
  },

  // Cambridge IGCSE Biology 0610
  {
    id: 'cie-bio-spec-1',
    subjectId: 'cie-bio-0610',
    unitNumber: 'Unit 2',
    unitTitle: 'Cells & Transport',
    specCode: 'B2.2',
    statement: 'Explain diffusion, osmosis, and active transport against concentration gradients using protein carriers and energy from ATP.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-bio-spec-2',
    subjectId: 'cie-bio-0610',
    unitNumber: 'Unit 5',
    unitTitle: 'Enzymes',
    specCode: 'B5.1',
    statement: 'Describe enzyme action in terms of active site, lock and key model, and the effects of temperature and pH on denaturation.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-bio-spec-3',
    subjectId: 'cie-bio-0610',
    unitNumber: 'Unit 8',
    unitTitle: 'Transport in Plants',
    specCode: 'B8.2',
    statement: 'Describe the transpiration stream through xylem, mechanism of root hair absorption, and factors affecting rate (potometer).',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-bio-spec-4',
    subjectId: 'cie-bio-0610',
    unitNumber: 'Unit 16',
    unitTitle: 'Reproduction & Genetics',
    specCode: 'B16.3',
    statement: 'Distinguish between mitosis (diploid identical clones) and meiosis (haploid gamete variation) with chromosome numbers.',
    tier: 'Extended',
    confidence: 'red'
  },

  // English as a Second Language 0510 / 0511
  {
    id: 'cie-esl-spec-1',
    subjectId: 'cie-esl-0510',
    unitNumber: 'Exercise 4',
    unitTitle: 'Summary Writing',
    specCode: 'ESL-R4',
    statement: 'Select and synthesize relevant points from extended texts, writing a 100-120 word summary using cohesive connectives and own words.',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-esl-spec-2',
    subjectId: 'cie-esl-0510',
    unitNumber: 'Exercise 5',
    unitTitle: 'Informal Email Writing',
    specCode: 'ESL-W5',
    statement: 'Write an informal email or letter (120-160 words) maintaining an engaging register, natural friendly tone, and addressing all prompt points.',
    tier: 'Core',
    confidence: 'green'
  },
  {
    id: 'cie-esl-spec-3',
    subjectId: 'cie-esl-0510',
    unitNumber: 'Exercise 6',
    unitTitle: 'Formal Articles & Reports',
    specCode: 'ESL-W6',
    statement: 'Draft a formal school magazine article or review (120-160 words) with advanced vocabulary, paragraph structure, and clear recommendations.',
    tier: 'Extended',
    confidence: 'amber'
  },
  {
    id: 'cie-esl-spec-4',
    subjectId: 'cie-esl-0510',
    unitNumber: 'Component 5',
    unitTitle: 'Speaking & Oral Examination',
    specCode: 'ESL-S5',
    statement: 'Engage in a 10-15 minute structured conversation across 4 parts, demonstrating grammatical range, vocabulary precision, and fluency.',
    tier: 'Extended',
    confidence: 'red'
  }
];
