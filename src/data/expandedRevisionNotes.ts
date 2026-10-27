import { RevisionTopic } from '../types';

export const EXPANDED_REVISION_NOTES: RevisionTopic[] = [
  // ==========================================================
  // 1. MATHEMATICS (CIE 0580) — EXPANDED
  // ==========================================================
  {
    id: 'rev-math-algebra-quadratics',
    subjectId: 'cie-math-0580',
    chapter: 'Algebra & Graphs',
    title: 'Quadratics: Factorisation, Quadratic Formula & Completing the Square',
    learningObjectives: [
      'Factorise quadratic expressions of the form ax² + bx + c including difference of two squares.',
      'Solve quadratic equations using the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).',
      'Complete the square in the form a(x + p)² + q and deduce the coordinates of the turning point (vertex).',
      'Solve linear and quadratic simultaneous equations algebraically and graphically.'
    ],
    diagramTitle: 'Parabola Turning Point & Completing the Square Coordinates',
    diagramSvg: `<svg viewBox="0 0 700 260" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="260" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  <g transform="translate(40, 20)">
    <!-- Axes -->
    <line x1="40" y1="210" x2="360" y2="210" stroke="#94a3b8" stroke-width="2"/>
    <line x1="200" y1="230" x2="200" y2="30" stroke="#94a3b8" stroke-width="2"/>
    <text x="365" y="214" fill="#94a3b8" font-size="10" font-weight="bold">x</text>
    <text x="195" y="25" fill="#94a3b8" font-size="10" font-weight="bold">y</text>
    <!-- Parabola y = (x - 3)^2 + 2 -->
    <path d="M 80 50 Q 200 270 320 50" stroke="#38bdf8" stroke-width="3" fill="none"/>
    <!-- Turning point -->
    <circle cx="200" cy="160" r="5" fill="#f59e0b"/>
    <line x1="200" y1="160" x2="200" y2="210" stroke="#f59e0b" stroke-dasharray="3 3"/>
    <text x="210" y="165" fill="#f59e0b" font-size="11" font-weight="bold">Vertex (-p, q)</text>
    <text x="210" y="180" fill="#cbd5e1" font-size="9">Line of symmetry: x = -p</text>
  </g>
  <g transform="translate(420, 25)">
    <rect width="250" height="210" rx="10" fill="#0f172a" stroke="#334155"/>
    <text x="125" y="25" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Completing the Square Identity</text>
    <text x="125" y="60" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">x² + bx + c = (x + b/2)² - (b/2)² + c</text>
    <line x1="20" y1="80" x2="230" y2="80" stroke="#334155"/>
    <text x="25" y="105" fill="#a7f3d0" font-size="10" font-weight="bold">• Minimum when a &gt; 0</text>
    <text x="25" y="125" fill="#fca5a5" font-size="10" font-weight="bold">• Maximum when a &lt; 0</text>
    <text x="25" y="150" fill="#94a3b8" font-size="9">Roots given by Quadratic Formula:</text>
    <text x="125" y="180" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">x = (-b ± √(b² - 4ac)) / (2a)</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Three Core Methods to Solve Quadratics',
        points: [
          'Factorisation: Look for common factors first. For ax² + bx + c, find two numbers that multiply to ac and add to b. Difference of two squares: a² - b² = (a - b)(a + b).',
          'Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a). Write down a, b, c with signs before substitution. If b is negative (e.g. b = -5), then -b = +5 and (-5)² = +25.',
          'Completing the Square: x² + bx + c = (x + b/2)² - (b/2)² + c. Turning point is (-b/2, c - (b/2)²). Line of symmetry is x = -b/2.'
        ],
        formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad y = a(x + p)^2 + q'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Discriminant',
        definition: 'The expression b² - 4ac beneath the square root. If b² - 4ac > 0, there are 2 real distinct roots; if = 0, 1 repeated root; if < 0, no real roots.'
      },
      {
        term: 'Turning Point (Vertex)',
        definition: 'The maximum or minimum point of a quadratic curve, occurring at the axis of symmetry x = -b / (2a).'
      }
    ],
    examinerWarnings: [
      'Calculator sign trap: entering -4² into a calculator gives -16 instead of +16! Always wrap negative numbers in brackets: (-4)²',
      'When completing the square for 2x² - 12x + 7, factor out 2 from the first two terms first: 2[x² - 6x] + 7.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0580 Paper 4: Completing the Square & Turning Point',
        examQuestion: 'Write 3x² - 18x + 19 in the form a(x + b)² + c where a, b, and c are integers. Hence, state the coordinates of the turning point of the curve y = 3x² - 18x + 19. [4 marks]',
        totalMarks: 4,
        steps: [
          {
            stepNumber: 1,
            title: 'Factorise coefficient of x²',
            working: '3(x^2 - 6x) + 19',
            markAwarded: '[B1] Accuracy Mark',
            explanation: 'Factor out 3 from the variable terms.'
          },
          {
            stepNumber: 2,
            title: 'Complete the square inside the bracket',
            working: 'x^2 - 6x = (x - 3)^2 - 3^2 = (x - 3)^2 - 9',
            markAwarded: '[M1] Method Mark',
            explanation: 'Halve the coefficient of x (-6 / 2 = -3) and subtract 3².'
          },
          {
            stepNumber: 3,
            title: 'Expand and collect constant terms',
            working: '3[(x - 3)^2 - 9] + 19 = 3(x - 3)^2 - 27 + 19 = 3(x - 3)^2 - 8',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Accurate expression in form a(x + b)² + c with a = 3, b = -3, c = -8.'
          },
          {
            stepNumber: 4,
            title: 'Deduce Turning Point Coordinates',
            working: '\\text{Minimum occurs when } (x - 3) = 0 \\implies x = 3, \\quad y = -8. \\quad \\text{Turning Point} = (3, -8)',
            markAwarded: '[B1] Accuracy Mark',
            explanation: 'Sign change on x coordinate (-b), keep same sign for y.'
          }
        ],
        finalAnswer: '3(x - 3)² - 8; Turning point = (3, -8)',
        examinerCommentary: 'Candidates frequently multiply 3 by (x-3)² but forget to multiply 3 by -9, resulting in -9 + 19 = +10 instead of -8.'
      }
    ]
  },
  {
    id: 'rev-math-vectors',
    subjectId: 'cie-math-0580',
    chapter: 'Vectors & Transformations',
    title: 'Vectors, Column Notation & Collinearity Geometric Proofs',
    learningObjectives: [
      'Describe translations using column vectors (x, y)ᵀ and calculate vector magnitudes √(x² + y²).',
      'Perform vector addition, subtraction, and scalar multiplication.',
      'Express paths along geometric figures in terms of base vectors a and b.',
      'Prove that three points are collinear (lie on a straight line) using parallel scalar multiples.'
    ],
    diagramTitle: 'Triangle Vector Paths & Collinear Point Proof Diagram',
    diagramSvg: `<svg viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="240" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  <g transform="translate(50, 20)">
    <!-- Vector Triangle OAB -->
    <path d="M 50 180 L 180 50 L 320 180 Z" stroke="#475569" stroke-width="2" fill="none"/>
    <!-- Origin O -->
    <circle cx="50" cy="180" r="5" fill="#ef4444"/><text x="35" y="195" fill="#ef4444" font-weight="bold">O</text>
    <!-- Vector OA = a -->
    <path d="M 50 180 L 180 50" stroke="#38bdf8" stroke-width="3"/>
    <text x="100" y="105" fill="#38bdf8" font-size="12" font-weight="bold">a</text>
    <circle cx="180" cy="50" r="5" fill="#38bdf8"/><text x="180" y="40" fill="#38bdf8" font-weight="bold">A</text>
    <!-- Vector OB = b -->
    <path d="M 50 180 L 320 180" stroke="#10b981" stroke-width="3"/>
    <text x="180" y="200" fill="#10b981" font-size="12" font-weight="bold">b</text>
    <circle cx="320" cy="180" r="5" fill="#10b981"/><text x="330" y="195" fill="#10b981" font-weight="bold">B</text>
    <!-- Vector AB = b - a -->
    <path d="M 180 50 L 320 180" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 4"/>
    <text x="265" y="110" fill="#f59e0b" font-size="11" font-weight="bold">b - a</text>
  </g>
  <g transform="translate(420, 25)">
    <rect width="250" height="190" rx="10" fill="#0f172a" stroke="#334155"/>
    <text x="125" y="25" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Collinearity Proof Rule</text>
    <text x="25" y="55" fill="#38bdf8" font-size="10" font-weight="bold">To prove P, Q, R lie on a line:</text>
    <text x="25" y="80" fill="#cbd5e1" font-size="9">1. Find vector PQ in terms of a and b.</text>
    <text x="25" y="105" fill="#cbd5e1" font-size="9">2. Find vector QR in terms of a and b.</text>
    <text x="25" y="130" fill="#a7f3d0" font-size="9" font-weight="bold">3. Show PQ = k(QR) (parallel).</text>
    <text x="25" y="155" fill="#f59e0b" font-size="9" font-weight="bold">4. State: They share common point Q,</text>
    <text x="25" y="170" fill="#f59e0b" font-size="9" font-weight="bold">   therefore P, Q, R are collinear.</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Vector Addition & Ratio Division',
        points: [
          'Vector Path Rule: To travel from A to B via O: AB = AO + OB = -OA + OB = -a + b = b - a.',
          'Ratio Division: If M divides line AB in ratio 1 : 2, then AM = (1/3)AB and MB = (2/3)AB.',
          'Magnitude: For column vector v = (x, y)ᵀ, magnitude |v| = √(x² + y²).'
        ],
        formula: '\\vec{AB} = \\mathbf{b} - \\mathbf{a}, \\quad |\\mathbf{v}| = \\sqrt{x^2 + y^2}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Collinear Points',
        definition: 'Points that lie on the same single straight line. Vectors between the points must be scalar multiples of each other and share a common point.'
      }
    ],
    examinerWarnings: [
      'If the question asks to "Prove that P, Q, and R lie on a straight line", you will LOSE the final mark if you only show the vectors are parallel without explicitly stating "and they share common point Q"!'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0580 Paper 4: Ratio Division & Vector Collinearity Proof',
        examQuestion: 'In triangle OAB, OA = a and OB = b. Point M lies on AB such that AM : MB = 1 : 3. Point N lies on OB such that ON = (1/4)b. Show that OM = (3/4)a + (1/4)b and prove that M, N and point P where OP = 3a lie on a straight line. [6 marks]',
        totalMarks: 6,
        steps: [
          {
            stepNumber: 1,
            title: 'Find vector AB',
            working: '\\vec{AB} = \\vec{AO} + \\vec{OB} = -\\mathbf{a} + \\mathbf{b} = \\mathbf{b} - \\mathbf{a}',
            markAwarded: '[B1] Method Mark',
            explanation: 'Express path from A to B.'
          },
          {
            stepNumber: 2,
            title: 'Express vector OM',
            working: '\\vec{OM} = \\vec{OA} + \\frac{1}{4}\\vec{AB} = \\mathbf{a} + \\frac{1}{4}(\\mathbf{b} - \\mathbf{a}) = \\frac{3}{4}\\mathbf{a} + \\frac{1}{4}\\mathbf{b}',
            markAwarded: '[M1] Method Mark',
            explanation: 'AM is 1 part out of 4 total parts (1 + 3 = 4).'
          },
          {
            stepNumber: 3,
            title: 'Find vector NM',
            working: '\\vec{NM} = \\vec{OM} - \\vec{ON} = \\left(\\frac{3}{4}\\mathbf{a} + \\frac{1}{4}\\mathbf{b}\\right) - \\frac{1}{4}\\mathbf{b} = \\frac{3}{4}\\mathbf{a}',
            markAwarded: '[M1] Accuracy Mark',
            explanation: 'Subtract ON to obtain vector between N and M.'
          },
          {
            stepNumber: 4,
            title: 'Find vector NP',
            working: '\\vec{NP} = \\vec{OP} - \\vec{ON} = 3\\mathbf{a} - \\frac{1}{4}\\mathbf{b} \\quad \\text{or evaluate } \\vec{MP} = \\vec{OP} - \\vec{OM} = 3\\mathbf{a} - \\left(\\frac{3}{4}\\mathbf{a} + \\frac{1}{4}\\mathbf{b}\\right) = \\frac{9}{4}\\mathbf{a} - \\frac{1}{4}\\mathbf{b}',
            markAwarded: '[M1] Method Mark',
            explanation: 'Calculate remaining vector component.'
          },
          {
            stepNumber: 5,
            title: 'Conclude with Collinearity Statement',
            working: '\\text{Vector } \\vec{MP} = 3\\vec{NM}. \\text{ Since } \\vec{MP} \\text{ is a scalar multiple of } \\vec{NM} \\text{ and both share point } M, \\text{ points } M, N, P \\text{ are collinear.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Explicit statement of parallel vectors + common shared point.'
          }
        ],
        finalAnswer: 'Proof completed: MP = 3 NM, vectors are parallel and share point M, so M, N, P lie on a straight line.',
        examinerCommentary: 'Many candidates make algebra errors with fractions like 1 - 1/4 = 3/4. Double check fraction additions.'
      }
    ]
  },

  // ==========================================================
  // 2. PHYSICS (CIE 0625) — EXPANDED
  // ==========================================================
  {
    id: 'rev-phys-thermal',
    subjectId: 'cie-physics-0625',
    chapter: 'Thermal Physics',
    title: 'Kinetic Model of Matter, Specific Heat Capacity & Thermal Processes',
    learningObjectives: [
      'Describe the molecular structure of solids, liquids, and gases in terms of particle arrangement, motion, and forces.',
      'Explain gas pressure in terms of molecular collisions with container surfaces (P = F/A).',
      'Apply the specific heat capacity formula ΔE = mcΔT and specific latent heat formula ΔE = mL.',
      'Explain conduction, convection, and thermal radiation (infrared emission/absorption).'
    ],
    diagramTitle: 'Heating Curve: Temperature Plateaus & Latent Heat Absorption',
    diagramSvg: `<svg viewBox="0 0 700 250" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="250" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  <g transform="translate(40, 20)">
    <!-- Axes -->
    <line x1="50" y1="200" x2="380" y2="200" stroke="#94a3b8" stroke-width="2"/>
    <line x1="50" y1="200" x2="50" y2="30" stroke="#94a3b8" stroke-width="2"/>
    <text x="385" y="205" fill="#94a3b8" font-size="10">Time / Energy Input</text>
    <text x="35" y="25" fill="#94a3b8" font-size="10">Temp (°C)</text>
    <!-- Heating Curve Path -->
    <!-- Solid warming -->
    <line x1="50" y1="180" x2="110" y2="130" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Melting plateau -->
    <line x1="110" y1="130" x2="190" y2="130" stroke="#f59e0b" stroke-width="3"/>
    <text x="150" y="120" fill="#f59e0b" font-size="9" text-anchor="middle">Melting (Lf)</text>
    <!-- Liquid warming -->
    <line x1="190" y1="130" x2="260" y2="60" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Boiling plateau -->
    <line x1="260" y1="60" x2="340" y2="60" stroke="#ef4444" stroke-width="3"/>
    <text x="300" y="50" fill="#ef4444" font-size="9" text-anchor="middle">Boiling (Lv)</text>
    <!-- Gas warming -->
    <line x1="340" y1="60" x2="370" y2="35" stroke="#38bdf8" stroke-width="2.5"/>
  </g>
  <g transform="translate(430, 25)">
    <rect width="240" height="200" rx="10" fill="#0f172a" stroke="#334155"/>
    <text x="120" y="25" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Key Heat Equations</text>
    <text x="20" y="55" fill="#38bdf8" font-size="11" font-weight="bold">ΔE = m c ΔT</text>
    <text x="20" y="75" fill="#94a3b8" font-size="9">c = specific heat capacity (J/(kg·°C))</text>
    <line x1="15" y1="90" x2="225" y2="90" stroke="#334155"/>
    <text x="20" y="115" fill="#ef4444" font-size="11" font-weight="bold">ΔE = m L</text>
    <text x="20" y="135" fill="#94a3b8" font-size="9">L = specific latent heat (J/kg)</text>
    <text x="20" y="160" fill="#f59e0b" font-size="9" font-weight="bold">Plateaus:</text>
    <text x="20" y="175" fill="#cbd5e1" font-size="9">Temp is CONSTANT during state change</text>
    <text x="20" y="190" fill="#cbd5e1" font-size="9">(energy breaks intermolecular bonds)</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Temperature vs Latent Heat',
        points: [
          'Kinetic energy is directly proportional to absolute temperature in Kelvin (T in K = θ in °C + 273).',
          'During phase changes (melting/boiling), temperature remains constant because thermal energy is used to overcome attractive intermolecular bonds, not to increase kinetic energy.',
          'Thermal radiation: Matte black surfaces are the best emitters and absorbers of infrared radiation; shiny silver surfaces are the worst emitters and best reflectors.'
        ],
        formula: '\\Delta E = mc\\Delta T, \\quad \\Delta E = mL'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Specific Heat Capacity',
        definition: 'The energy required to raise the temperature of 1 kg of a substance by 1 °C without a change in state.'
      },
      {
        term: 'Specific Latent Heat',
        definition: 'The energy required to change the state of 1 kg of a substance without any change in temperature.'
      }
    ],
    examinerWarnings: [
      'In specific heat capacity calculations with an electric heater: Electrical energy E = P × t = V × I × t. Always convert minutes to SECONDS!',
      'When explaining gas pressure, always mention: particles collide with the walls of the container, exerting a force over an area (P = F/A).'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0625 Paper 4: Electrical Calorimetry & Heat Capacity',
        examQuestion: 'An electric immersion heater rated at 48 W is used to heat 0.50 kg of an unknown liquid in an insulated container. The heater is switched on for 5.0 minutes and the temperature of the liquid rises from 20 °C to 38 °C. Calculate the specific heat capacity of the liquid. [4 marks]',
        totalMarks: 4,
        steps: [
          {
            stepNumber: 1,
            title: 'Convert time to seconds & calculate energy',
            working: 't = 5.0 \\times 60 = 300 \\text{ s}, \\quad E = P \\times t = 48 \\times 300 = 14,400 \\text{ J}',
            markAwarded: '[M1] Method Mark',
            explanation: 'Multiply power by time in seconds.'
          },
          {
            stepNumber: 2,
            title: 'Determine temperature change',
            working: '\\Delta T = 38 - 20 = 18 \\text{ °C}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Calculate temperature increase.'
          },
          {
            stepNumber: 3,
            title: 'Rearrange specific heat capacity formula',
            working: 'c = \\frac{\\Delta E}{m \\Delta T} = \\frac{14,400}{0.50 \\times 18}',
            markAwarded: '[M1] Method Mark',
            explanation: 'Substitute mass and temperature change.'
          },
          {
            stepNumber: 4,
            title: 'Calculate final value with correct unit',
            working: 'c = \\frac{14,400}{9.0} = 1600 \\text{ J}/(\\text{kg}\\cdot\\text{°C})',
            markAwarded: '[A1] Accuracy Mark',
            explanation: '1600 with unit J/(kg·°C) or J/(kg·K).'
          }
        ],
        finalAnswer: '1600 J/(kg·°C)',
        examinerCommentary: 'The most common error is forgetting to convert 5 minutes to 300 seconds, giving a value 60 times too small.'
      }
    ]
  },
  {
    id: 'rev-phys-space',
    subjectId: 'cie-physics-0625',
    chapter: 'Space Physics',
    title: 'The Solar System, Stellar Evolution & Cosmic Redshift',
    learningObjectives: [
      'Describe the Solar System, planets, and orbital speed equation v = 2πr / T.',
      'Explain the life cycle of stars: nebula, protostar, main sequence, red giant/supergiant, white dwarf/supernova/neutron star/black hole.',
      'Explain redshift in terms of increasing wavelength from receding galaxies and evidence for the expanding Universe.',
      'State Hubble\'s law v = H₀ d and describe cosmic microwave background radiation (CMBR).'
    ],
    diagramTitle: 'Life Cycle of Low-Mass vs High-Mass Stars',
    diagramSvg: `<svg viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="240" rx="14" fill="#080c18" stroke="#1e293b" stroke-width="2"/>
  <!-- Stellar Evolution Pathways -->
  <g transform="translate(30, 20)">
    <text x="320" y="20" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Stellar Evolution (Cambridge 0625 Syllabus 2023-2025)</text>
    <!-- Protostar -->
    <rect x="20" y="90" width="80" height="40" rx="8" fill="#1e293b" stroke="#f59e0b"/>
    <text x="60" y="115" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Protostar</text>
    <!-- Main Sequence -->
    <rect x="140" y="90" width="90" height="40" rx="8" fill="#1e293b" stroke="#38bdf8"/>
    <text x="185" y="115" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">Main Sequence</text>
    <!-- Branch 1: Sun-sized -->
    <path d="M 230 100 L 280 60 L 320 60" stroke="#f59e0b" stroke-width="2"/>
    <rect x="320" y="40" width="90" height="40" rx="8" fill="#1e293b" stroke="#f59e0b"/>
    <text x="365" y="65" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Red Giant</text>
    <path d="M 410 60 L 460 60" stroke="#f59e0b" stroke-width="2"/>
    <rect x="460" y="40" width="90" height="40" rx="8" fill="#1e293b" stroke="#cbd5e1"/>
    <text x="505" y="65" fill="#cbd5e1" font-size="10" font-weight="bold" text-anchor="middle">White Dwarf</text>
    <!-- Branch 2: Massive Star -->
    <path d="M 230 120 L 280 160 L 320 160" stroke="#ef4444" stroke-width="2"/>
    <rect x="320" y="140" width="100" height="40" rx="8" fill="#1e293b" stroke="#ef4444"/>
    <text x="370" y="165" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">Red Supergiant</text>
    <path d="M 420 160 L 460 160" stroke="#ef4444" stroke-width="2"/>
    <rect x="460" y="140" width="90" height="40" rx="8" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444"/>
    <text x="505" y="165" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">Supernova</text>
    <path d="M 550 160 L 580 160" stroke="#ef4444" stroke-width="2"/>
    <rect x="580" y="140" width="100" height="40" rx="8" fill="#1e293b" stroke="#a855f7"/>
    <text x="630" y="165" fill="#a855f7" font-size="9" font-weight="bold" text-anchor="middle">Neutron / Black Hole</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Orbital Speed & Redshift Evidence',
        points: [
          'Orbital Speed: For circular orbit of radius r and period T: v = 2πr / T.',
          'Redshift: Light observed from distant galaxies has an increased wavelength (shifted towards red end of spectrum). This demonstrates galaxies are moving away from us.',
          'The further away a galaxy is, the faster it is moving away, indicating space itself is expanding from an initial single point (The Big Bang).'
        ],
        formula: 'v = \\frac{2\\pi r}{T}, \\quad v = H_0 d'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Redshift',
        definition: 'An increase in the observed wavelength of electromagnetic radiation emitted from receding stars and distant galaxies due to the expansion of space.'
      },
      {
        term: 'Hubble Constant (H₀)',
        definition: 'The ratio of the speed at which a distant galaxy is moving away from Earth to its distance from Earth: H₀ ≈ 2.2 × 10⁻¹⁸ s⁻¹.'
      }
    ],
    examinerWarnings: [
      'Do not say "galaxies are red"! Redshift means the absorption lines are shifted towards longer wavelengths; the galaxies themselves are not necessarily red in colour.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0625 Paper 4: Satellite Orbital Speed & Period',
        examQuestion: 'A communication satellite travels in a circular orbit at a height of 36,000 km above the Earth\'s surface. The radius of the Earth is 6,400 km. The orbital period of the satellite is 24 hours. Calculate the orbital speed of the satellite in km/s. [3 marks]',
        totalMarks: 3,
        steps: [
          {
            stepNumber: 1,
            title: 'Calculate total orbital radius',
            working: 'r = R_{\\text{Earth}} + h = 6,400 + 36,000 = 42,400 \\text{ km}',
            markAwarded: '[B1] Method Mark',
            explanation: 'Must add Earth radius to altitude.'
          },
          {
            stepNumber: 2,
            title: 'Convert period to seconds',
            working: 'T = 24 \\times 3600 = 86,400 \\text{ s}',
            markAwarded: '[M1] Method Mark',
            explanation: '24 hours in seconds.'
          },
          {
            stepNumber: 3,
            title: 'Calculate orbital speed',
            working: 'v = \\frac{2\\pi r}{T} = \\frac{2\\pi \\times 42,400}{86,400} = 3.08 \\text{ km/s}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: '3.08 km/s or 3080 m/s.'
          }
        ],
        finalAnswer: '3.08 km/s (or 3100 m/s)',
        examinerCommentary: 'Candidates often use 36,000 km alone without adding the radius of the Earth, losing the initial mark.'
      }
    ]
  },

  // ==========================================================
  // 3. CHEMISTRY (CIE 0620) — EXPANDED
  // ==========================================================
  {
    id: 'rev-chem-moles',
    subjectId: 'cie-chem-0620',
    chapter: 'Stoichiometry & Mole Calculations',
    title: 'The Mole Concept, Gas Volumes (24 dm³) & Solution Titrations',
    learningObjectives: [
      'Calculate relative formula mass Mr and percentage composition by mass.',
      'Apply mole relations: n = m / Mr, n = V / 24 dm³ (gases at r.t.p.), and n = c × V (solutions).',
      'Deduce empirical formula from reacting masses or percentages.',
      'Calculate percentage yield and percentage purity from experimental data.'
    ],
    diagramTitle: 'The Mole Gateway: Mass, Gas Volume & Solution Moles',
    diagramSvg: `<svg viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="240" rx="14" fill="#0a0f1d" stroke="#1e293b" stroke-width="2"/>
  <!-- Central Mole Hub -->
  <g transform="translate(270, 70)">
    <circle cx="80" cy="50" r="45" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/>
    <text x="80" y="47" fill="#38bdf8" font-size="13" font-weight="black" text-anchor="middle">MOLES</text>
    <text x="80" y="63" fill="#cbd5e1" font-size="10" text-anchor="middle">(n)</text>
  </g>
  <!-- Left: Mass (g) -->
  <g transform="translate(40, 70)">
    <rect width="140" height="100" rx="10" fill="#0f172a" stroke="#ec4899" stroke-width="1.5"/>
    <text x="70" y="30" fill="#ec4899" font-size="11" font-weight="bold" text-anchor="middle">MASS (g)</text>
    <text x="70" y="55" fill="#f8fafc" font-size="10" text-anchor="middle">n = mass / Mr</text>
    <text x="70" y="75" fill="#94a3b8" font-size="9" text-anchor="middle">mass = n × Mr</text>
  </g>
  <line x1="180" y1="120" x2="270" y2="120" stroke="#ec4899" stroke-width="2"/>
  <!-- Right: Gas Volume (dm³) -->
  <g transform="translate(500, 20)">
    <rect width="160" height="90" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
    <text x="80" y="25" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">GAS VOLUME (dm³)</text>
    <text x="80" y="50" fill="#f8fafc" font-size="9" text-anchor="middle">V = n × 24 dm³</text>
    <text x="80" y="70" fill="#94a3b8" font-size="8" text-anchor="middle">(at room temp &amp; pressure)</text>
  </g>
  <!-- Bottom: Solutions (mol/dm³) -->
  <g transform="translate(500, 130)">
    <rect width="160" height="90" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="80" y="25" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">SOLUTION (c = n/V)</text>
    <text x="80" y="50" fill="#f8fafc" font-size="9" text-anchor="middle">n = c × (V in cm³ / 1000)</text>
    <text x="80" y="70" fill="#94a3b8" font-size="8" text-anchor="middle">1 dm³ = 1000 cm³</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'The Three Master Mole Equations',
        points: [
          'Solid Mass: Moles = Mass (g) / Molar Mass Mr.',
          'Gas Volume: Moles = Volume (dm³) / 24 dm³ (or Volume in cm³ / 24,000 cm³).',
          'Solutions: Moles = Concentration (mol/dm³) × Volume (dm³). Note: Convert cm³ to dm³ by dividing by 1000.'
        ],
        formula: 'n = \\frac{m}{M_r}, \\quad n = \\frac{V}{24}, \\quad n = c \\times V'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Empirical Formula',
        definition: 'The simplest whole number ratio of atoms of each element present in a compound.'
      },
      {
        term: 'Limiting Reactant',
        definition: 'The reactant that is completely consumed first in a chemical reaction, thereby determining and limiting the maximum amount of product formed.'
      }
    ],
    examinerWarnings: [
      'Always divide volume in cm³ by 1000 when calculating moles from concentration: 25.0 cm³ = 0.025 dm³.',
      'In reacting mass questions, check stoichiometric balancing numbers! 2HCl means 2 moles of HCl are required for 1 mole of carbonate.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0620 Paper 4: Limestone Neutralisation & Gas Volume',
        examQuestion: '5.00 g of impure calcium carbonate (CaCO₃) reacts with excess hydrochloric acid:\nCaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)\n1.08 dm³ of carbon dioxide gas is collected at r.t.p. (Ar: Ca=40, C=12, O=16. Molar gas volume = 24.0 dm³/mol).\n(a) Calculate the moles of CO₂ gas collected. [1 mark]\n(b) Calculate the mass of pure CaCO₃ that reacted. [2 marks]\n(c) Calculate the percentage purity of the limestone sample. [2 marks]',
        totalMarks: 5,
        steps: [
          {
            stepNumber: 1,
            title: 'Moles of gas formed',
            working: 'n(\\text{CO}_2) = \\frac{V}{24.0} = \\frac{1.08}{24.0} = 0.0450 \\text{ mol}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Divide volume by 24.'
          },
          {
            stepNumber: 2,
            title: 'Stoichiometric mole ratio and mass of CaCO₃',
            working: 'M_r(\\text{CaCO}_3) = 40 + 12 + 3(16) = 100\\n\\text{Ratio CaCO}_3 : \\text{CO}_2 = 1 : 1 \\implies n(\\text{CaCO}_3) = 0.0450 \\text{ mol}\\n\\text{Mass} = n \\times M_r = 0.0450 \\times 100 = 4.50 \\text{ g}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Multiply moles by 100.'
          },
          {
            stepNumber: 3,
            title: 'Percentage Purity Calculation',
            working: '\\% \\text{ Purity} = \\frac{\\text{Mass of pure substance}}{\\text{Total mass of sample}} \\times 100 = \\frac{4.50}{5.00} \\times 100 = 90.0\\%',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Divide pure by impure mass and multiply by 100.'
          }
        ],
        finalAnswer: '(a) 0.0450 mol. (b) 4.50 g. (c) 90.0% purity.',
        examinerCommentary: 'Full marks awarded for 90.0%. Candidates who inverted the fraction (5.00 / 4.50) scoring > 100% should realize immediately that purity cannot exceed 100%.'
      }
    ]
  },

  // ==========================================================
  // 4. BIOLOGY (CIE 0610) — EXPANDED
  // ==========================================================
  {
    id: 'rev-bio-circulation',
    subjectId: 'cie-bio-0610',
    chapter: 'Transport in Animals',
    title: 'Double Circulation, Heart Anatomy & Coronary Heart Disease',
    learningObjectives: [
      'Describe the double circulation system and explain its advantages (pulmonary and systemic circuits).',
      'Identify and label chambers, valves, and principal blood vessels of the human heart (atria, ventricles, bicuspid, tricuspid, aorta, pulmonary vein, vena cava).',
      'Explain structural adaptations of arteries, veins, and capillaries.',
      'Explain causes and prevention of coronary heart disease (CHD).'
    ],
    diagramTitle: 'Heart Cross-Section: Four Chambers, Valves & Vessel Direction',
    diagramSvg: `<svg viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="240" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  <g transform="translate(40, 20)">
    <text x="320" y="20" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Human Heart Structure (Remember: Anatomical Left/Right Reversed)</text>
    <!-- Right side (Deoxygenated - Blue) -->
    <rect x="180" y="50" width="120" height="150" rx="12" fill="#0284c7" fill-opacity="0.3" stroke="#0284c7" stroke-width="2"/>
    <text x="240" y="80" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Right Atrium</text>
    <text x="240" y="150" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Right Ventricle</text>
    <!-- Left side (Oxygenated - Red - Thicker Wall) -->
    <rect x="310" y="50" width="130" height="150" rx="12" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="3"/>
    <text x="375" y="80" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">Left Atrium</text>
    <text x="375" y="150" fill="#fca5a5" font-size="11" font-weight="bold" text-anchor="middle">Left Ventricle</text>
    <text x="375" y="180" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">THICKEST MUSCLE WALL</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Heart Chambers & Vessel Blood Flows',
        points: [
          'Left ventricle has the thickest muscular wall because it must pump blood at high pressure throughout the entire body (systemic circuit), whereas the right ventricle only pumps blood a short distance to the lungs.',
          'Valves (atrioventricular and semilunar) prevent the backflow of blood.',
          'Arteries carry blood away from the heart under high pressure (thick muscular elastic wall, narrow lumen). Veins carry blood towards the heart under low pressure (thin wall, wide lumen, valves). Capillaries are 1-cell thick to facilitate rapid diffusion.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Double Circulation',
        definition: 'A circulatory system where blood passes through the heart twice for every complete circuit of the body (pulmonary circuit to lungs and systemic circuit to body tissues).'
      }
    ],
    examinerWarnings: [
      'In diagrams of the heart, the LEFT side of the person is on your RIGHT! Label carefully.',
      'Coronary arteries supply oxygen and glucose to heart muscle cells. Never confuse coronary arteries with the aorta or pulmonary artery.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0610 Paper 4: Ventricular Wall Thickness & Valve Function',
        examQuestion: 'Explain why the wall of the left ventricle is significantly thicker than the wall of the right ventricle. [3 marks]',
        totalMarks: 3,
        steps: [
          {
            stepNumber: 1,
            title: 'Identify distance and destination',
            working: '\\text{Left ventricle pumps blood around the entire body, whereas right ventricle only pumps blood to lungs.}',
            markAwarded: '[B1] Knowledge Mark',
            explanation: 'Contrast whole body vs lungs.'
          },
          {
            stepNumber: 2,
            title: 'Contrast pressure requirements',
            working: '\\text{Blood must be pumped under much higher pressure to overcome greater resistance of systemic circulation.}',
            markAwarded: '[A1] Explanation Mark',
            explanation: 'Must mention higher pressure.'
          },
          {
            stepNumber: 3,
            title: 'Link to muscular wall thickness',
            working: '\\text{More muscle tissue is required to generate stronger contraction force.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'More cardiac muscle generates higher pressure.'
          }
        ],
        finalAnswer: 'Left ventricle has more muscular tissue to generate higher pressure needed to pump blood around the entire body against greater resistance, whereas the right ventricle only pumps blood to adjacent lungs.',
        examinerCommentary: 'Stating "it does more work" is too vague. Candidates must explicitly mention higher pressure and whole body vs lungs.'
      }
    ]
  },

  // ==========================================================
  // 5. BUSINESS STUDIES (CIE 0450)
  // ==========================================================
  {
    id: 'rev-bus-finance',
    subjectId: 'cie-business-0450',
    chapter: 'Financial Information and Decisions',
    title: 'Break-Even Analysis, Cash Flow Forecasts & Profitability Ratios',
    learningObjectives: [
      'Construct and interpret break-even charts (fixed costs, variable costs, total revenue, margin of safety).',
      'Calculate break-even point using the formula: Fixed Costs / Contribution per Unit.',
      'Differentiate between cash and profit and evaluate cash flow forecasts.',
      'Calculate profitability ratios: Gross Profit Margin, Net Profit Margin, and Return on Capital Employed (ROCE).'
    ],
    diagramTitle: 'Break-Even Chart: Total Cost, Revenue & Margin of Safety',
    diagramSvg: `<svg viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="240" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  <g transform="translate(40, 20)">
    <!-- Axes -->
    <line x1="50" y1="190" x2="380" y2="190" stroke="#94a3b8" stroke-width="2"/>
    <line x1="50" y1="190" x2="50" y2="30" stroke="#94a3b8" stroke-width="2"/>
    <text x="385" y="195" fill="#94a3b8" font-size="10">Output (units)</text>
    <text x="40" y="25" fill="#94a3b8" font-size="10">Revenue / Costs ($)</text>
    <!-- Fixed Costs (Horizontal) -->
    <line x1="50" y1="140" x2="360" y2="140" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="365" y="144" fill="#94a3b8" font-size="9">Fixed Costs</text>
    <!-- Total Cost Line -->
    <line x1="50" y1="140" x2="350" y2="50" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="355" y="54" fill="#f43f5e" font-size="10" font-weight="bold">Total Costs</text>
    <!-- Total Revenue Line -->
    <line x1="50" y1="190" x2="330" y2="40" stroke="#10b981" stroke-width="3"/>
    <text x="335" y="44" fill="#10b981" font-size="10" font-weight="bold">Total Revenue</text>
    <!-- Break Even Intersection -->
    <circle cx="215" cy="90" r="5" fill="#f59e0b"/>
    <line x1="215" y1="90" x2="215" y2="190" stroke="#f59e0b" stroke-dasharray="3 3"/>
    <text x="215" y="205" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Break-Even (Q_BE)</text>
  </g>
  <g transform="translate(440, 25)">
    <rect width="230" height="190" rx="10" fill="#0f172a" stroke="#334155"/>
    <text x="115" y="25" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Key Financial Formulas</text>
    <text x="15" y="55" fill="#f59e0b" font-size="10" font-weight="bold">Contribution = Price - Var. Cost</text>
    <text x="15" y="85" fill="#38bdf8" font-size="10" font-weight="bold">Break-Even = Fixed Costs / Contrib.</text>
    <text x="15" y="115" fill="#a7f3d0" font-size="10" font-weight="bold">Margin of Safety = Actual - BE</text>
    <line x1="15" y1="130" x2="215" y2="130" stroke="#334155"/>
    <text x="15" y="150" fill="#cbd5e1" font-size="9">Gross Margin = (Gross Profit / Rev) × 100</text>
    <text x="15" y="170" fill="#cbd5e1" font-size="9">ROCE = (Operating Profit / Cap. Emp.) × 100</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Cash vs Profit & Break-Even Evaluation',
        points: [
          'Cash Flow vs Profit: A profitable business can still go bankrupt if it runs out of cash to pay immediate suppliers or wages (insolvency). Cash is money in the bank today; profit is revenue minus total costs recorded over a period.',
          'Margin of Safety: The amount by which sales can fall before the business starts making a loss (Current Output - Break-even Output).',
          'Break-even limitations: Assumes all units produced are sold, cost curves are linear, and external factors like price discounts do not occur.'
        ],
        formula: '\\text{Break-Even} = \\frac{\\text{Fixed Costs}}{\\text{Selling Price} - \\text{Variable Cost per Unit}}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Margin of Safety',
        definition: 'The difference between the actual or budgeted output level and the break-even output level.'
      },
      {
        term: 'Liquidity',
        definition: 'The ability of a business to convert assets into cash quickly without losing value in order to meet short-term financial obligations.'
      }
    ],
    examinerWarnings: [
      'Break-even point is ALWAYS an output quantity (number of units), NOT a dollar amount!',
      'When calculating margin of safety, subtract the break-even units from actual sales units.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0450 Paper 2: Break-Even Calculation & Margin of Safety',
        examQuestion: 'A small bakery produces artisan cakes. Fixed costs are $12,000 per month. The variable cost per cake is $8 and the selling price is $20. Current monthly sales are 1,400 cakes.\n(a) Calculate the contribution per unit. [1 mark]\n(b) Calculate the monthly break-even output. [2 marks]\n(c) Calculate the margin of safety. [1 mark]',
        totalMarks: 4,
        steps: [
          {
            stepNumber: 1,
            title: 'Contribution per cake',
            working: '\\text{Contribution} = \\text{Price} - \\text{Variable Cost} = \\$20 - \\$8 = \\$12',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Selling price minus variable cost per unit.'
          },
          {
            stepNumber: 2,
            title: 'Break-even output calculation',
            working: '\\text{Break-Even} = \\frac{\\text{Fixed Costs}}{\\text{Contribution per Unit}} = \\frac{\\$12,000}{\\$12} = 1,000 \\text{ cakes}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Divide fixed costs by contribution.'
          },
          {
            stepNumber: 3,
            title: 'Margin of Safety',
            working: '\\text{Margin of Safety} = \\text{Actual Output} - \\text{Break-Even} = 1,400 - 1,000 = 400 \\text{ cakes}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Actual sales minus break-even quantity.'
          }
        ],
        finalAnswer: '(a) Contribution = $12. (b) Break-even = 1,000 cakes. (c) Margin of safety = 400 cakes.',
        examinerCommentary: 'Ensure units (cakes) are clearly written rather than dollar signs in parts (b) and (c).'
      }
    ]
  }
];
