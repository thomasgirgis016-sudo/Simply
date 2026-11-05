export interface FormulaQuizQuestion {
  id: string;
  subjectId: 'cie-math-0580' | 'cie-physics-0625' | 'cie-chem-0620';
  subjectName: string;
  topic: string;
  name: string;
  latexDisplay: string;        // Full completed LaTeX formula
  latexPromptWithBlank: string;// LaTeX with placeholder e.g. [ ? ]
  blankPositionName: string;   // Label of what's missing, e.g. "Missing Velocity Component"
  correctAnswer: string;       // Primary answer (e.g. "v^2" or "v")
  acceptedAliases: string[];   // All acceptable normalized variants (e.g. ["v^2", "v*v", "v2", "v squared"])
  options: string[];           // 4 multiple choice pill choices for quick selection
  variableDefinitions: { symbol: string; meaning: string; siUnit: string }[];
  examToolNotice: string;      // Note on formula sheet availability and calculator permissions
  difficulty: 'Foundation' | 'Core' | 'Extended';
}

export const FORMULA_QUIZ_QUESTIONS: FormulaQuizQuestion[] = [
  // =========================================================================
  // PHYSICS (0625)
  // =========================================================================
  {
    id: 'phys-fq-1',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Forces & Energy',
    name: 'Kinetic Energy Formula',
    latexDisplay: 'E_k = \\frac{1}{2} m v^2',
    latexPromptWithBlank: 'E_k = \\frac{1}{2} \\cdot m \\cdot [ \\; ? \\; ]^2',
    blankPositionName: 'Velocity Term',
    correctAnswer: 'v',
    acceptedAliases: ['v', 'velocity', 'V'],
    options: ['v', 'a', 't', 'h'],
    variableDefinitions: [
      { symbol: 'E_k', meaning: 'Kinetic energy', siUnit: 'Joules (J)' },
      { symbol: 'm', meaning: 'Mass of the object', siUnit: 'Kilograms (kg)' },
      { symbol: 'v', meaning: 'Speed / velocity', siUnit: 'Metres per second (m/s)' },
    ],
    examToolNotice: 'Cambridge IGCSE Physics Paper 2, 4 & 6: NO formula sheet is provided. You MUST memorize this formula. Scientific calculator is allowed.',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-2',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Forces & Energy',
    name: 'Gravitational Potential Energy',
    latexDisplay: '\\Delta E_p = m g \\Delta h',
    latexPromptWithBlank: '\\Delta E_p = m \\cdot [ \\; ? \\; ] \\cdot \\Delta h',
    blankPositionName: 'Acceleration due to Gravity',
    correctAnswer: 'g',
    acceptedAliases: ['g', 'gravity', 'G'],
    options: ['g', 'a', 'v', 'p'],
    variableDefinitions: [
      { symbol: '\\Delta E_p', meaning: 'Change in gravitational potential energy', siUnit: 'Joules (J)' },
      { symbol: 'm', meaning: 'Mass of the object', siUnit: 'Kilograms (kg)' },
      { symbol: 'g', meaning: 'Gravitational field strength (9.8 N/kg or 10 N/kg on Earth)', siUnit: 'N/kg or m/s²' },
      { symbol: '\\Delta h', meaning: 'Vertical height gained or lost', siUnit: 'Metres (m)' },
    ],
    examToolNotice: 'Use g = 9.8 N/kg for 2023–2026 syllabus exams unless stated otherwise on the front cover.',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-3',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Waves & Sound',
    name: 'The Wave Equation',
    latexDisplay: 'v = f \\lambda',
    latexPromptWithBlank: 'v = f \\times [ \\; ? \\; ]',
    blankPositionName: 'Wavelength Symbol',
    correctAnswer: 'lambda',
    acceptedAliases: ['lambda', '\\lambda', 'w', 'wavelength', 'L'],
    options: ['\\lambda', 'T', 'c', 'A'],
    variableDefinitions: [
      { symbol: 'v', meaning: 'Wave speed', siUnit: 'Metres per second (m/s)' },
      { symbol: 'f', meaning: 'Frequency (waves passing per second)', siUnit: 'Hertz (Hz)' },
      { symbol: '\\lambda', meaning: 'Wavelength (distance between adjacent crests)', siUnit: 'Metres (m)' },
    ],
    examToolNotice: 'Applies to both mechanical waves (sound, water) and electromagnetic radiation (light, radio).',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-4',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Electricity & Magnetism',
    name: "Ohm's Law / Resistance Equation",
    latexDisplay: 'V = I R',
    latexPromptWithBlank: 'V = I \\times [ \\; ? \\; ]',
    blankPositionName: 'Resistance Symbol',
    correctAnswer: 'R',
    acceptedAliases: ['R', 'r', 'resistance'],
    options: ['R', 'P', 'Q', 't'],
    variableDefinitions: [
      { symbol: 'V', meaning: 'Potential difference (Voltage)', siUnit: 'Volts (V)' },
      { symbol: 'I', meaning: 'Electric current', siUnit: 'Amperes (A)' },
      { symbol: 'R', meaning: 'Electrical resistance', siUnit: 'Ohms (\\Omega)' },
    ],
    examToolNotice: 'Remember: 1 Volt = 1 Joule per Coulomb. Current must be in Amperes (watch out for mA = × 10⁻³ A).',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-5',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Electricity & Magnetism',
    name: 'Electrical Power in Resistors',
    latexDisplay: 'P = I^2 R',
    latexPromptWithBlank: 'P = [ \\; ? \\; ]^2 \\times R',
    blankPositionName: 'Current Variable',
    correctAnswer: 'I',
    acceptedAliases: ['I', 'i', 'current'],
    options: ['I', 'V', 't', 'Q'],
    variableDefinitions: [
      { symbol: 'P', meaning: 'Electrical power dissipated as heat', siUnit: 'Watts (W)' },
      { symbol: 'I', meaning: 'Current flowing through component', siUnit: 'Amperes (A)' },
      { symbol: 'R', meaning: 'Resistance', siUnit: 'Ohms (\\Omega)' },
    ],
    examToolNotice: 'Alternatively expressed as P = V × I or P = V² / R. High-voltage transmission lines minimize I to reduce I²R loss!',
    difficulty: 'Extended'
  },
  {
    id: 'phys-fq-6',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Thermal Physics',
    name: 'Specific Heat Capacity Equation',
    latexDisplay: '\\Delta E = m c \\Delta T',
    latexPromptWithBlank: '\\Delta E = m \\cdot [ \\; ? \\; ] \\cdot \\Delta T',
    blankPositionName: 'Specific Heat Capacity Constant',
    correctAnswer: 'c',
    acceptedAliases: ['c', 'C', 'shc', 'specific heat'],
    options: ['c', 'L', 'k', 'p'],
    variableDefinitions: [
      { symbol: '\\Delta E', meaning: 'Thermal energy transferred', siUnit: 'Joules (J)' },
      { symbol: 'm', meaning: 'Mass of the substance', siUnit: 'Kilograms (kg)' },
      { symbol: 'c', meaning: 'Specific heat capacity of material', siUnit: 'J / (kg \\cdot ^\\circ\\text{C})' },
      { symbol: '\\Delta T', meaning: 'Temperature change', siUnit: 'Degrees Celsius (^\\circ\\text{C}) or Kelvin (K)' },
    ],
    examToolNotice: 'Do not confuse specific heat capacity (c) with specific latent heat (L), which occurs at constant temperature!',
    difficulty: 'Extended'
  },
  {
    id: 'phys-fq-7',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'General Physics',
    name: 'Density Formula',
    latexDisplay: '\\rho = \\frac{m}{V}',
    latexPromptWithBlank: '\\rho = \\frac{m}{[ \\; ? \\; ]}',
    blankPositionName: 'Volume Denominator',
    correctAnswer: 'V',
    acceptedAliases: ['V', 'v', 'volume'],
    options: ['V', 'A', 'h', 'd'],
    variableDefinitions: [
      { symbol: '\\rho', meaning: 'Density', siUnit: 'kg/m³ or g/cm³' },
      { symbol: 'm', meaning: 'Mass', siUnit: 'Kilograms (kg) or grams (g)' },
      { symbol: 'V', meaning: 'Volume', siUnit: 'm³ or cm³' },
    ],
    examToolNotice: 'Conversion trap: 1 g/cm³ = 1000 kg/m³. Water has a density of 1.0 g/cm³ or 1000 kg/m³.',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-8',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'General Physics',
    name: 'Pressure Formula',
    latexDisplay: 'p = \\frac{F}{A}',
    latexPromptWithBlank: 'p = \\frac{F}{[ \\; ? \\; ]}',
    blankPositionName: 'Surface Area Denominator',
    correctAnswer: 'A',
    acceptedAliases: ['A', 'a', 'area'],
    options: ['A', 'V', 'h', 'd'],
    variableDefinitions: [
      { symbol: 'p', meaning: 'Pressure', siUnit: 'Pascals (Pa) or N/m²' },
      { symbol: 'F', meaning: 'Normal force acting on surface', siUnit: 'Newtons (N)' },
      { symbol: 'A', meaning: 'Cross-sectional contact area', siUnit: 'm²' },
    ],
    examToolNotice: '1 Pa = 1 N/m². If area is given in cm², divide by 10,000 (10⁴) to convert to m².',
    difficulty: 'Core'
  },
  {
    id: 'phys-fq-9',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'General Physics',
    name: 'Fluid Column Pressure',
    latexDisplay: '\\Delta p = \\rho g \\Delta h',
    latexPromptWithBlank: '\\Delta p = [ \\; ? \\; ] \\cdot g \\cdot \\Delta h',
    blankPositionName: 'Fluid Density Symbol',
    correctAnswer: 'rho',
    acceptedAliases: ['rho', '\\rho', 'd', 'density'],
    options: ['\\rho', 'm', 'V', 'P'],
    variableDefinitions: [
      { symbol: '\\Delta p', meaning: 'Pressure difference due to fluid column', siUnit: 'Pascals (Pa)' },
      { symbol: '\\rho', meaning: 'Fluid density', siUnit: 'kg/m³' },
      { symbol: 'g', meaning: 'Gravitational field strength (9.8 N/kg)', siUnit: 'N/kg' },
      { symbol: '\\Delta h', meaning: 'Depth of the liquid column', siUnit: 'Metres (m)' },
    ],
    examToolNotice: 'For total absolute pressure at a depth h, add atmospheric pressure (p_total = p_atm + \\rho g h).',
    difficulty: 'Extended'
  },
  {
    id: 'phys-fq-10',
    subjectId: 'cie-physics-0625',
    subjectName: 'Physics (0625)',
    topic: 'Electricity & Magnetism',
    name: 'Transformer Voltage & Turns Ratio',
    latexDisplay: '\\frac{V_p}{V_s} = \\frac{N_p}{N_s}',
    latexPromptWithBlank: '\\frac{V_p}{V_s} = \\frac{[ \\; ? \\; ]}{N_s}',
    blankPositionName: 'Primary Coil Turns',
    correctAnswer: 'N_p',
    acceptedAliases: ['N_p', 'Np', 'n_p', 'np', 'N1'],
    options: ['N_p', 'I_p', 'V_o', 'R_p'],
    variableDefinitions: [
      { symbol: 'V_p, V_s', meaning: 'Primary & secondary voltage', siUnit: 'Volts (V)' },
      { symbol: 'N_p, N_s', meaning: 'Number of turns on primary & secondary coils', siUnit: 'Pure count (Dimensionless)' },
    ],
    examToolNotice: 'For 100% efficient transformers: V_p × I_p = V_s × I_s, so V_p / V_s = I_s / I_p (current is inverted!).',
    difficulty: 'Core'
  },

  // =========================================================================
  // MATHEMATICS (0580)
  // =========================================================================
  {
    id: 'math-fq-1',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Algebra & Quadratics',
    name: 'The Quadratic Formula',
    latexDisplay: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    latexPromptWithBlank: 'x = \\frac{-b \\pm \\sqrt{[ \\; ? \\; ] - 4ac}}{2a}',
    blankPositionName: 'Discriminant Squared Term',
    correctAnswer: 'b^2',
    acceptedAliases: ['b^2', 'b*b', 'b2', 'b^{2}'],
    options: ['b^2', '2b', '4b', 'a^2'],
    variableDefinitions: [
      { symbol: 'a, b, c', meaning: 'Coefficients from standard quadratic ax² + bx + c = 0', siUnit: 'Dimensionless constants' },
      { symbol: 'b^2 - 4ac', meaning: 'The discriminant (determines number of real roots)', siUnit: 'Dimensionless' },
    ],
    examToolNotice: 'Cambridge 0580: NO formula sheet is provided for Extended or Core papers. Brackets around negative b on calculators are essential!',
    difficulty: 'Extended'
  },
  {
    id: 'math-fq-2',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Trigonometry',
    name: 'Area of Any Triangle',
    latexDisplay: '\\text{Area} = \\frac{1}{2} a b \\sin C',
    latexPromptWithBlank: '\\text{Area} = \\frac{1}{2} a b \\cdot [ \\; ? \\; ]',
    blankPositionName: 'Trig Angle Factor',
    correctAnswer: 'sin C',
    acceptedAliases: ['sin C', 'sin(C)', '\\sin C', '\\sin(C)', 'sinc'],
    options: ['\\sin C', '\\cos C', '\\tan C', 'C'],
    variableDefinitions: [
      { symbol: 'a, b', meaning: 'Two known side lengths', siUnit: 'cm or m' },
      { symbol: 'C', meaning: 'The included angle trapped directly between sides a and b', siUnit: 'Degrees (^\\circ)' },
    ],
    examToolNotice: 'Always ensure your calculator mode is in DEGREES (D), not Radians (R) or Gradians (G).',
    difficulty: 'Core'
  },
  {
    id: 'math-fq-3',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Trigonometry',
    name: 'The Sine Rule',
    latexDisplay: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
    latexPromptWithBlank: '\\frac{a}{\\sin A} = \\frac{b}{[ \\; ? \\; ]}',
    blankPositionName: 'Sine Rule Denominator',
    correctAnswer: 'sin B',
    acceptedAliases: ['sin B', 'sin(B)', '\\sin B', '\\sin(B)', 'sinb'],
    options: ['\\sin B', '\\cos B', 'B', '\\sin C'],
    variableDefinitions: [
      { symbol: 'a, b, c', meaning: 'Side lengths of triangle', siUnit: 'cm or m' },
      { symbol: 'A, B, C', meaning: 'Opposite angles', siUnit: 'Degrees (^\\circ)' },
    ],
    examToolNotice: 'Use when you have an angle and its opposite side pair (an "angle-side combo").',
    difficulty: 'Extended'
  },
  {
    id: 'math-fq-4',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Trigonometry',
    name: 'The Cosine Rule for Sides',
    latexDisplay: 'a^2 = b^2 + c^2 - 2bc \\cos A',
    latexPromptWithBlank: 'a^2 = b^2 + c^2 - 2bc \\cdot [ \\; ? \\; ]',
    blankPositionName: 'Cosine Factor',
    correctAnswer: 'cos A',
    acceptedAliases: ['cos A', 'cos(A)', '\\cos A', '\\cos(A)', 'cosa'],
    options: ['\\cos A', '\\sin A', '\\tan A', 'A'],
    variableDefinitions: [
      { symbol: 'a', meaning: 'Unknown side opposite angle A', siUnit: 'cm or m' },
      { symbol: 'b, c', meaning: 'Two adjacent sides flanking angle A', siUnit: 'cm or m' },
      { symbol: 'A', meaning: 'Included angle opposite side a', siUnit: 'Degrees (^\\circ)' },
    ],
    examToolNotice: 'Rearranged for unknown angle: cos(A) = (b² + c² - a²) / (2bc).',
    difficulty: 'Extended'
  },
  {
    id: 'math-fq-5',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Mensuration',
    name: 'Arc Length of a Sector',
    latexDisplay: 's = \\frac{\\theta}{360} \\times 2\\pi r',
    latexPromptWithBlank: 's = \\frac{\\theta}{360} \\times [ \\; ? \\; ]',
    blankPositionName: 'Circumference Formula',
    correctAnswer: '2*pi*r',
    acceptedAliases: ['2*pi*r', '2pi r', '2\\pi r', '2pir', '\\pi d', 'pi*d'],
    options: ['2\\pi r', '\\pi r^2', '\\frac{4}{3}\\pi r', '2r'],
    variableDefinitions: [
      { symbol: 's', meaning: 'Curved arc length', siUnit: 'cm or m' },
      { symbol: '\\theta', meaning: 'Central sector angle', siUnit: 'Degrees (^\\circ)' },
      { symbol: 'r', meaning: 'Radius of circular sector', siUnit: 'cm or m' },
    ],
    examToolNotice: 'Examiner trap: If asked for the total PERIMETER of a sector, remember to add 2r: Perimeter = s + 2r.',
    difficulty: 'Core'
  },
  {
    id: 'math-fq-6',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Mensuration',
    name: 'Volume of a Sphere',
    latexDisplay: 'V = \\frac{4}{3} \\pi r^3',
    latexPromptWithBlank: 'V = \\frac{4}{3} \\pi \\cdot [ \\; ? \\; ]^3',
    blankPositionName: 'Radius Variable',
    correctAnswer: 'r',
    acceptedAliases: ['r', 'radius', 'R'],
    options: ['r', 'd', 'h', 'A'],
    variableDefinitions: [
      { symbol: 'V', meaning: 'Volume of sphere', siUnit: 'cm³ or m³' },
      { symbol: 'r', meaning: 'Radius of sphere (half of diameter)', siUnit: 'cm or m' },
    ],
    examToolNotice: 'Watch out if diameter is given: always divide by 2 first to get the radius r!',
    difficulty: 'Core'
  },
  {
    id: 'math-fq-7',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Coordinate Geometry',
    name: 'Gradient of a Straight Line',
    latexDisplay: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
    latexPromptWithBlank: 'm = \\frac{y_2 - y_1}{[ \\; ? \\; ]}',
    blankPositionName: 'Horizontal Change (Run)',
    correctAnswer: 'x_2 - x_1',
    acceptedAliases: ['x_2 - x_1', 'x2 - x1', 'x2-x1', 'dx', '\\Delta x'],
    options: ['x_2 - x_1', 'x_1 - x_2', 'x_1 + x_2', '2x'],
    variableDefinitions: [
      { symbol: 'm', meaning: 'Gradient / slope of line', siUnit: 'Rise over run' },
      { symbol: '(x_1, y_1), (x_2, y_2)', meaning: 'Two coordinate points on the line', siUnit: 'Coordinate plane units' },
    ],
    examToolNotice: 'For perpendicular lines, m₁ × m₂ = -1 (negative reciprocal, e.g. 3/4 becomes -4/3).',
    difficulty: 'Core'
  },
  {
    id: 'math-fq-8',
    subjectId: 'cie-math-0580',
    subjectName: 'Mathematics (0580)',
    topic: 'Number & Percentages',
    name: 'Compound Interest Formula',
    latexDisplay: 'A = P \\left(1 + \\frac{r}{100}\\right)^n',
    latexPromptWithBlank: 'A = P \\left(1 + \\frac{r}{100}\\right)^{[ \\; ? \\; ]}',
    blankPositionName: 'Time / Compounding Periods Power',
    correctAnswer: 'n',
    acceptedAliases: ['n', 't', 'time', 'years'],
    options: ['n', 'r', '100', 'P'],
    variableDefinitions: [
      { symbol: 'A', meaning: 'Total accrued balance at maturity', siUnit: 'Currency units ($, £, EGP)' },
      { symbol: 'P', meaning: 'Principal investment or initial loan', siUnit: 'Currency units' },
      { symbol: 'r', meaning: 'Annual interest rate percentage', siUnit: '% per annum' },
      { symbol: 'n', meaning: 'Number of compounding periods / years', siUnit: 'Years / periods' },
    ],
    examToolNotice: 'If asked for the INTEREST earned, subtract the principal: Interest = A - P.',
    difficulty: 'Core'
  },

  // =========================================================================
  // CHEMISTRY (0620)
  // =========================================================================
  {
    id: 'chem-fq-1',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Stoichiometry & Moles',
    name: 'Moles from Solid Mass',
    latexDisplay: '\\text{Moles} = \\frac{\\text{Mass (g)}}{M_r}',
    latexPromptWithBlank: '\\text{Moles} = \\frac{\\text{Mass (g)}}{[ \\; ? \\; ]}',
    blankPositionName: 'Relative Molecular Mass Denominator',
    correctAnswer: 'M_r',
    acceptedAliases: ['M_r', 'Mr', 'mr', 'molar mass', 'A_r', 'Ar'],
    options: ['M_r', '24', '1000', 'V'],
    variableDefinitions: [
      { symbol: '\\text{Moles}', meaning: 'Amount of substance (6.02 × 10²³ particles)', siUnit: 'moles (mol)' },
      { symbol: '\\text{Mass}', meaning: 'Sample mass weighed on balance', siUnit: 'Grams (g)' },
      { symbol: 'M_r', meaning: 'Relative molecular or formula mass', siUnit: 'g/mol' },
    ],
    examToolNotice: 'Periodic Table is provided at the back of all Cambridge Chemistry papers (Papers 2, 4 & 6) to calculate Mr.',
    difficulty: 'Core'
  },
  {
    id: 'chem-fq-2',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Stoichiometry & Moles',
    name: 'Gas Volume at Room Temperature & Pressure',
    latexDisplay: '\\text{Volume (dm}^3) = \\text{Moles} \\times 24',
    latexPromptWithBlank: '\\text{Volume (dm}^3) = \\text{Moles} \\times [ \\; ? \\; ]',
    blankPositionName: 'Molar Gas Volume Constant',
    correctAnswer: '24',
    acceptedAliases: ['24', '24.0', '24 dm3', '24dm3'],
    options: ['24', '22.4', '1000', '100'],
    variableDefinitions: [
      { symbol: '\\text{Volume}', meaning: 'Volume occupied by any gas at r.t.p.', siUnit: 'Cubic decimetres (dm³)' },
      { symbol: '\\text{Moles}', meaning: 'Amount of gas molecules', siUnit: 'moles (mol)' },
      { symbol: '24', meaning: 'Molar gas volume at 20°C and 1 atm', siUnit: 'dm³/mol' },
    ],
    examToolNotice: 'If gas volume is required in cm³, multiply moles by 24,000 cm³/mol instead of 24!',
    difficulty: 'Core'
  },
  {
    id: 'chem-fq-3',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Stoichiometry & Moles',
    name: 'Solution Concentration',
    latexDisplay: '\\text{Concentration} = \\frac{\\text{Moles}}{\\text{Volume (dm}^3)}',
    latexPromptWithBlank: '\\text{Concentration} = \\frac{\\text{Moles}}{[ \\; ? \\; ]}',
    blankPositionName: 'Volume in dm³',
    correctAnswer: 'Volume',
    acceptedAliases: ['Volume', 'volume', 'V', 'dm3', 'volume (dm3)'],
    options: ['\\text{Volume (dm}^3)', '24', 'M_r', '1000'],
    variableDefinitions: [
      { symbol: '\\text{Concentration}', meaning: 'Molar concentration', siUnit: 'mol/dm³' },
      { symbol: '\\text{Moles}', meaning: 'Moles of dissolved solute', siUnit: 'moles (mol)' },
      { symbol: '\\text{Volume}', meaning: 'Solution volume', siUnit: 'dm³' },
    ],
    examToolNotice: 'Converting cm³ to dm³: divide by 1000 (e.g. 250 cm³ = 0.250 dm³).',
    difficulty: 'Core'
  },
  {
    id: 'chem-fq-4',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Stoichiometry & Moles',
    name: 'Percentage Yield Formula',
    latexDisplay: '\\% \\text{ Yield} = \\frac{\\text{Actual Yield}}{\\text{Theoretical Yield}} \\times 100\\%',
    latexPromptWithBlank: '\\% \\text{ Yield} = \\frac{\\text{Actual Yield}}{[ \\; ? \\; ]} \\times 100\\%',
    blankPositionName: 'Theoretical Maximum Yield',
    correctAnswer: 'Theoretical Yield',
    acceptedAliases: ['Theoretical Yield', 'theoretical yield', 'Theoretical', 'calculated yield', 'Max Yield'],
    options: ['\\text{Theoretical Yield}', '\\text{Total Mass}', '100', 'M_r'],
    variableDefinitions: [
      { symbol: '\\text{Actual Yield}', meaning: 'Mass of purified product obtained in lab', siUnit: 'Grams (g)' },
      { symbol: '\\text{Theoretical Yield}', meaning: 'Maximum calculated mass from balanced equation', siUnit: 'Grams (g)' },
    ],
    examToolNotice: 'Yield is rarely 100% due to incomplete reactions, side reactions, or product lost during filtration/transfer.',
    difficulty: 'Extended'
  },
  {
    id: 'chem-fq-5',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Chemical Energetics',
    name: 'Bond Energy Enthalpy Change',
    latexDisplay: '\\Delta H = \\Sigma(\\text{Bonds Broken}) - \\Sigma(\\text{Bonds Formed})',
    latexPromptWithBlank: '\\Delta H = \\Sigma(\\text{Bonds Broken}) - \\Sigma([ \\; ? \\; ])',
    blankPositionName: 'Bonds Formed Energy',
    correctAnswer: 'Bonds Formed',
    acceptedAliases: ['Bonds Formed', 'bonds formed', 'Bonds made', 'bonds made'],
    options: ['\\text{Bonds Formed}', '\\text{Products}', '\\text{Reactants}', '\\text{Activation Energy}'],
    variableDefinitions: [
      { symbol: '\\Delta H', meaning: 'Enthalpy change of reaction', siUnit: 'kJ/mol' },
      { symbol: '\\text{Bonds Broken}', meaning: 'Endothermic energy required to break reactant bonds', siUnit: 'kJ' },
      { symbol: '\\text{Bonds Formed}', meaning: 'Exothermic energy released when forming product bonds', siUnit: 'kJ' },
    ],
    examToolNotice: 'Remember BENDO-MEXO: Breaking is ENDOthermic (+), Making is EXOthermic (-). If \\Delta H is negative, reaction is exothermic!',
    difficulty: 'Extended'
  },
  {
    id: 'chem-fq-6',
    subjectId: 'cie-chem-0620',
    subjectName: 'Chemistry (0620)',
    topic: 'Acids, Bases & Salts',
    name: 'Moles in Titration Volume (cm³)',
    latexDisplay: '\\text{Moles} = \\frac{C \\times V}{1000}',
    latexPromptWithBlank: '\\text{Moles} = \\frac{C \\times V}{[ \\; ? \\; ]}',
    blankPositionName: 'Unit Conversion Factor',
    correctAnswer: '1000',
    acceptedAliases: ['1000', '1,000', '10^3'],
    options: ['1000', '100', '24', '10'],
    variableDefinitions: [
      { symbol: 'C', meaning: 'Concentration of solution', siUnit: 'mol/dm³' },
      { symbol: 'V', meaning: 'Volume delivered from burette or pipette', siUnit: 'cm³' },
      { symbol: '1000', meaning: 'Cubic centimetres in one cubic decimetre', siUnit: 'cm³/dm³' },
    ],
    examToolNotice: 'In Paper 6 ATP titrations, concordance is achieved when two titre volumes agree within ±0.1 cm³.',
    difficulty: 'Core'
  }
];

export function normalizeFormulaAnswer(ans: string): string {
  return ans
    .toLowerCase()
    .replace(/\\/g, '')
    .replace(/\s+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\^2/g, '2')
    .replace(/\*+/g, '')
    .trim();
}

export function checkFormulaAnswer(
  userAnswer: string,
  question: FormulaQuizQuestion
): { isCorrect: boolean; matchedAlias?: string } {
  const normUser = normalizeFormulaAnswer(userAnswer);
  if (!normUser) return { isCorrect: false };

  const normCorrect = normalizeFormulaAnswer(question.correctAnswer);
  if (normUser === normCorrect) {
    return { isCorrect: true, matchedAlias: question.correctAnswer };
  }

  for (const alias of question.acceptedAliases) {
    if (normUser === normalizeFormulaAnswer(alias)) {
      return { isCorrect: true, matchedAlias: alias };
    }
  }

  return { isCorrect: false };
}
