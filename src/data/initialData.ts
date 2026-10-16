import { Flashcard, QuizQuestion, RevisionTopic, FormulaItem } from '../types';

export const SAMPLE_SOLVER_QUESTIONS = [
  {
    title: 'CIE 0580 Maths: Quadratic & Vertex Form',
    subjectId: 'cie-math-0580',
    text: 'A curve has equation y = 2x² - 12x + 23.\n(a) Write the expression 2x² - 12x + 23 in the form a(x + b)² + c where a, b, and c are integers. [3 marks]\n(b) Hence, state the coordinates of the turning point of the curve and determine if it is a minimum or maximum. [2 marks]',
  },
  {
    title: 'CIE 0625 Physics: Transformer & Power Transmission',
    subjectId: 'cie-physics-0625',
    text: 'A step-up transformer at a power station steps up voltage from 25 kV to 400 kV.\n(a) Calculate the ratio of the number of turns on the primary coil to the secondary coil. [2 marks]\n(b) The power transmitted is 600 MW. Calculate the current in the transmission cables. [2 marks]\n(c) Explain why electricity is transmitted at such high voltages over long distances. [3 marks]',
  },
  {
    title: 'CIE 0620 Chemistry: Stoichiometry & Gas Volume',
    subjectId: 'cie-chem-0620',
    text: '5.6 g of iron reacts completely with excess dilute hydrochloric acid:\nFe(s) + 2HCl(aq) -> FeCl2(aq) + H2(g)\n(a) Calculate the moles of iron used (Ar of Fe = 56). [1 mark]\n(b) Calculate the volume of hydrogen gas produced at room temperature and pressure (rtp). (Molar gas volume at rtp = 24.0 dm³/mol). [2 marks]\n(c) State the observation when aqueous sodium hydroxide is added dropwise to the resulting iron(II) chloride solution. [2 marks]',
  },
  {
    title: 'CIE 0610 Biology: Enzymes & pH Denaturation',
    subjectId: 'cie-bio-0610',
    text: 'An experiment investigated the rate of an enzyme-controlled reaction at varying pH levels between pH 2 and pH 10.\n(a) State what is meant by an enzyme. [2 marks]\n(b) Explain why the rate of reaction drops sharply to zero when pH increases beyond pH 9. [3 marks]',
  },
  {
    title: 'CIE 0478 CS: Two\'s Complement & Logic Gates',
    subjectId: 'cie-cs-0478',
    text: '(a) Convert the denary number -38 into an 8-bit two\'s complement binary integer. [3 marks]\n(b) Draw or write the Boolean expression for an XOR gate using inputs A and B, and write its truth table. [3 marks]',
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // Mathematics
  {
    id: 'fc-m-1',
    subjectId: 'cie-math-0580',
    topic: 'Quadratics & Factoring',
    question: 'What is the Quadratic Formula and when must you use it in IGCSE?',
    answer: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\nUse it whenever a question asks to "give your answers to 2 decimal places or 3 significant figures", which signals that the quadratic cannot be factorized simply.',
    keyFormula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    examinerTip: 'Watch out when b is negative! E.g. If b = -5, then -b becomes -(-5) = +5.',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-m-2',
    subjectId: 'cie-math-0580',
    topic: 'Circle Theorems',
    question: 'What is the relationship between the angle at the centre and the angle at the circumference subtended by the same arc?',
    answer: 'The angle subtended at the centre of a circle is TWICE the angle subtended at the circumference by the same arc (Angle at centre = 2 × Angle at circumference).',
    keyFormula: 'θ_{centre} = 2 \\times θ_{circumference}',
    examinerTip: 'Always write the exact quote in your reasoning: "angle at centre is twice angle at circumference" to gain the B1 reason mark!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-m-3',
    subjectId: 'cie-math-0580',
    topic: 'Trigonometry (SOHCAHTOA & Sine/Cosine Rule)',
    question: 'State the Cosine Rule to find an unknown side $a$ between two known sides $b$ and $c$ with angle $A$.',
    answer: '$$a^2 = b^2 + c^2 - 2bc \\cos(A)$$\nTake the square root to find $a$: $$a = \\sqrt{b^2 + c^2 - 2bc \\cos(A)}$$',
    keyFormula: 'a² = b² + c² - 2bc cos(A)',
    examinerTip: 'Ensure your scientific calculator is set to DEG (degrees) mode, not RAD or GRAD!',
    difficulty: 'Extended',
    mastered: false,
  },

  // Physics
  {
    id: 'fc-p-1',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    question: 'How do you find (1) Acceleration and (2) Distance travelled from a Velocity-Time graph?',
    answer: '1. Acceleration = Gradient (slope) of the line ($$\\Delta v / \\Delta t$$)\n2. Distance travelled = Total Area under the velocity-time graph (divide into rectangles and triangles).',
    keyFormula: 'a = \\frac{v - u}{t}, \\quad \\text{Distance} = \\text{Area under curve}',
    examinerTip: 'Double check units! If time is in minutes, convert to seconds before multiplying for area.',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-p-2',
    subjectId: 'cie-physics-0625',
    topic: 'Electricity & Magnetism (Circuits & Induction)',
    question: 'State Ohm\'s Law and how resistance behaves in series vs parallel circuits.',
    answer: '$$V = I \\times R$$\n- Series: Total resistance $$R_{total} = R_1 + R_2$$\n- Parallel: $$\\frac{1}{R_{total}} = \\frac{1}{R_1} + \\frac{1}{R_2}$$ (Total resistance is always LESS than the smallest individual resistor).',
    keyFormula: 'V = IR, \\quad R_p = \\frac{R_1 R_2}{R_1 + R_2}',
    examinerTip: 'In parallel circuits, current splits across branches, but voltage across each parallel branch is EQUAL to the source voltage.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-p-3',
    subjectId: 'cie-physics-0625',
    topic: 'Nuclear Physics (Radioactivity & Half-life)',
    question: 'Define the Half-Life of a radioactive isotope.',
    answer: 'The time taken for half the radioactive nuclei in a sample to decay (or the time taken for the activity/count rate to halve from its original value).',
    examinerTip: 'Must mention "half of the nuclei to decay" or "activity to halve". Never say "half the mass disappears"!',
    difficulty: 'Core',
    mastered: false,
  },

  // Chemistry
  {
    id: 'fc-c-1',
    subjectId: 'cie-chem-0620',
    topic: 'Stoichiometry & Mole Calculations',
    question: 'What are the 3 fundamental Mole calculation formulas in IGCSE Chemistry?',
    answer: '1. For solids: $$\\text{Moles} = \\frac{\\text{Mass (g)}}{M_r}$$\n2. For gases at rtp: $$\\text{Moles} = \\frac{\\text{Volume (dm}^3\\text{)}}{24}$$\n3. For solutions: $$\\text{Moles} = \\text{Concentration (mol/dm}^3\\text{)} \\times \\text{Volume (dm}^3\\text{)}$$',
    keyFormula: 'n = m/M_r, \\quad n = V/24, \\quad n = C \\times V',
    examinerTip: 'Always convert volume in cm³ to dm³ by dividing by 1000 before plugging into C × V!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-c-2',
    subjectId: 'cie-chem-0620',
    topic: 'Electrochemistry & Electrolysis',
    question: 'In the electrolysis of aqueous Copper(II) Sulfate ($CuSO_4$) with inert carbon electrodes, what is formed at the anode and cathode?',
    answer: '- Cathode (-): Pink copper metal deposits ($$Cu^{2+} + 2e^- \\rightarrow Cu$$\n- Anode (+): Oxygen gas bubbles form ($$4OH^- \\rightarrow O_2 + 2H_2O + 4e^-$$\nBlue solution gradually fades to colourless as $Cu^{2+}$ ions are removed.',
    examinerTip: 'Remember PANIC: Positive Anode, Negative Is Cathode!',
    difficulty: 'Extended',
    mastered: false,
  },

  // Biology
  {
    id: 'fc-b-1',
    subjectId: 'cie-bio-0610',
    topic: 'Cell Structure, Diffusion, Osmosis & Active Transport',
    question: 'Define Osmosis using exact IGCSE syllabus mark scheme keywords.',
    answer: 'The net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution), through a partially permeable membrane.',
    examinerTip: 'Must include: "water molecules", "higher to lower water potential", and "partially permeable membrane". Don\'t use concentration of solute!',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-b-2',
    subjectId: 'cie-bio-0610',
    topic: 'Biological Molecules & Enzymes',
    question: 'Describe the effect of temperature above the optimum on enzyme activity.',
    answer: 'High temperatures cause excessive kinetic vibration, breaking the hydrogen and ionic bonds maintaining the active site shape. The active site changes shape permanently; the enzyme is denatured. The substrate no longer fits ("lock and key"), so no enzyme-substrate complexes can form.',
    examinerTip: 'Never say the enzyme "dies" or is "killed". Enzymes are protein molecules, not living cells! Use "denatured".',
    difficulty: 'Extended',
    mastered: false,
  },

  // Computer Science
  {
    id: 'fc-cs-1',
    subjectId: 'cie-cs-0478',
    topic: 'Hardware & Architecture (CPU, Von Neumann, Fetch-Decode-Execute)',
    question: 'Describe what happens during the Fetch stage of the Fetch-Decode-Execute (FDE) cycle.',
    answer: '1. The Program Counter (PC) holds the address of the next instruction.\n2. The address in PC is copied to the Memory Address Register (MAR) via the address bus.\n3. The instruction at that address in RAM is fetched and copied to the Memory Data Register (MDR) via the data bus.\n4. PC is incremented by 1.\n5. The instruction in MDR is copied to the Current Instruction Register (CIR).',
    examinerTip: 'CIE 0478 mark schemes award 1 mark per register mentioned correctly (PC, MAR, MDR, CIR).',
    difficulty: 'Extended',
    mastered: false,
  }
];

export const INITIAL_QUIZZES: QuizQuestion[] = [
  {
    id: 'q-1',
    subjectId: 'cie-math-0580',
    topic: 'Circle Theorems',
    paperReference: 'CIE 0580/42 May/June 2022',
    questionText: 'Points A, B, C and D lie on the circumference of a circle. ABCD forms a cyclic quadrilateral. Angle ABC = 74°. Calculate the size of opposite angle ADC.',
    options: [
      { id: 'opt-a', text: '74°' },
      { id: 'opt-b', text: '106°' },
      { id: 'opt-c', text: '148°' },
      { id: 'opt-d', text: '16°' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[M1] For recognizing opposite angles in a cyclic quadrilateral sum to 180°: 180° - 74°',
      '[A1] For correct answer 106°'
    ],
    markSchemeExplanation: 'Opposite angles of a cyclic quadrilateral always add up to 180°. Therefore, Angle ADC = 180° - 74° = 106°.'
  },
  {
    id: 'q-2',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    paperReference: 'CIE 0625/22 Oct/Nov 2023',
    questionText: 'An astronaut has a mass of 80 kg on Earth, where gravitational field strength g = 9.8 N/kg. The Moon has a gravitational field strength of 1.6 N/kg. What is the astronaut\'s mass and weight on the Moon?',
    options: [
      { id: 'opt-a', text: 'Mass = 13.1 kg, Weight = 128 N' },
      { id: 'opt-b', text: 'Mass = 80 kg, Weight = 784 N' },
      { id: 'opt-c', text: 'Mass = 80 kg, Weight = 128 N' },
      { id: 'opt-d', text: 'Mass = 128 kg, Weight = 80 N' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Mass is independent of location: mass remains 80 kg',
      '[B1] Weight on Moon = m × g_moon = 80 × 1.6 = 128 N'
    ],
    markSchemeExplanation: 'Mass is the amount of matter and does NOT change when moving to another planet (stays 80 kg). Weight is a force: W = m × g = 80 kg × 1.6 N/kg = 128 N.'
  },
  {
    id: 'q-3',
    subjectId: 'cie-chem-0620',
    topic: 'Chemical Reactions (Rates & Reversible / Haber)',
    paperReference: 'CIE 0620/41 May/June 2023',
    questionText: 'In the Haber process: N2(g) + 3H2(g) ⇌ 2NH3(g) (ΔH = -92 kJ/mol). Which change will increase the equilibrium yield of ammonia (NH3)?',
    options: [
      { id: 'opt-a', text: 'Increasing the temperature' },
      { id: 'opt-b', text: 'Decreasing the pressure' },
      { id: 'opt-c', text: 'Increasing the pressure' },
      { id: 'opt-d', text: 'Adding an iron catalyst' },
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Count gas moles: 4 moles on LHS vs 2 moles on RHS',
      '[B1] According to Le Chatelier\'s principle, increasing pressure favours the side with fewer gas molecules (RHS).'
    ],
    markSchemeExplanation: 'The forward reaction produces 2 moles of gas from 4 moles of reactants. By Le Chatelier\'s Principle, increasing pressure shifts equilibrium towards the side with fewer gas molecules (towards NH3), increasing yield. A catalyst speeds up rate but does NOT change equilibrium yield.'
  },
  {
    id: 'q-4',
    subjectId: 'cie-bio-0610',
    topic: 'Gas Exchange, Respiration & Homeostasis',
    paperReference: 'CIE 0610/21 May/June 2023',
    questionText: 'Which row correctly identifies features that provide an efficient gas exchange surface in human alveoli?',
    options: [
      { id: 'opt-a', text: 'Thick walls, dry surface, small total surface area' },
      { id: 'opt-b', text: 'One-cell thick walls, moist lining, large surface area, dense capillary network' },
      { id: 'opt-c', text: 'Ciliated epithelium, thick capillary walls, anaerobic environment' },
      { id: 'opt-d', text: 'Cartilage rings, dry lining, low blood flow' },
    ],
    correctOptionId: 'opt-b',
    marks: 1,
    markingBreakdown: [
      '[B1] High surface area to volume ratio, thin walls (short diffusion pathway), moist surface (for gases to dissolve), rich blood supply (maintain concentration gradient).'
    ],
    markSchemeExplanation: 'Alveoli have thin walls (one cell thick) giving a short diffusion distance, large total surface area, moist surface for gases to dissolve, and extensive capillaries to maintain steep concentration gradients.'
  },
  {
    id: 'q-5',
    subjectId: 'cie-cs-0478',
    topic: 'Data Representation (Binary, Hexadecimal, Sound & Images)',
    paperReference: 'CIE 0478/12 Oct/Nov 2023',
    questionText: 'What is the hexadecimal representation of the 8-bit binary number 10111100₂?',
    options: [
      { id: 'opt-a', text: 'BC₁₆' },
      { id: 'opt-b', text: 'B12₁₆' },
      { id: 'opt-c', text: 'AB₁₆' },
      { id: 'opt-d', text: 'CB₁₆' }
    ],
    correctOptionId: 'opt-a',
    marks: 2,
    markingBreakdown: [
      '[M1] Split into two nibbles: 1011 and 1100',
      '[A1] 1011 = 11 = B; 1100 = 12 = C -> Result is BC'
    ],
    markSchemeExplanation: 'Split 10111100 into 4-bit nibbles: First nibble 1011 = 8+2+1 = 11, which is "B" in hex. Second nibble 1100 = 8+4 = 12, which is "C" in hex. Combining gives BC.'
  }
];

export const INITIAL_FORMULAS: FormulaItem[] = [
  {
    id: 'f-1',
    subjectId: 'cie-math-0580',
    topic: 'Mensuration (Perimeter, Area & Volume)',
    name: 'Volume & Surface Area of a Sphere',
    formula: 'V = \\frac{4}{3}\\pi r^3, \\quad A = 4\\pi r^2',
    whereVariables: 'r = radius of sphere',
    units: 'Volume in cm³ / m³, Area in cm² / m²',
    examTip: 'Remember for a HEMISPHERE, volume is 2/3 π r³, but total surface area includes the circular flat base: 2πr² + πr² = 3πr²!'
  },
  {
    id: 'f-2',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    name: 'Kinetic & Gravitational Potential Energy',
    formula: 'E_k = \\frac{1}{2}mv^2, \\quad \\Delta E_p = mg\\Delta h',
    whereVariables: 'm = mass (kg), v = velocity (m/s), g = 9.8 N/kg, h = height (m)',
    units: 'Energy in Joules (J)',
    examTip: 'For conservation of energy without friction: loss of GPE = gain of KE (mgh = 1/2 mv²). Notice mass m cancels out!'
  },
  {
    id: 'f-3',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    name: 'Snell\'s Law (Refractive Index)',
    formula: 'n = \\frac{\\sin(i)}{\\sin(r)} = \\frac{c}{v} = \\frac{1}{\\sin(c)}',
    whereVariables: 'i = angle of incidence in air, r = angle of refraction in medium, c = critical angle',
    units: 'Refractive index n is a dimensionless ratio (no units)',
    examTip: 'Angle of incidence and refraction are ALWAYS measured to the NORMAL line (the 90° dotted line), never to the surface!'
  },
  {
    id: 'f-4',
    subjectId: 'cie-chem-0620',
    topic: 'Stoichiometry & Mole Calculations',
    name: 'Percentage Yield & Percentage Purity',
    formula: '\\%\\text{ Yield} = \\frac{\\text{Actual Mass}}{\\text{Theoretical Mass}} \\times 100\\%',
    whereVariables: 'Actual mass from experimental data, Theoretical mass calculated from balanced equation',
    units: 'Percentage (%)',
    examTip: 'Theoretical yield is the maximum possible. Actual yield is usually lower due to incomplete reaction, reversible steps, or loss during filtering.'
  },
  {
    id: 'f-5',
    subjectId: 'cie-cs-0478',
    topic: 'Data Representation (Binary, Hexadecimal, Sound & Images)',
    name: 'Image & Sound File Size Calculation',
    formula: '\\text{Image Size (bits)} = \\text{Width} \\times \\text{Height} \\times \\text{Colour Depth}',
    whereVariables: 'Width, height in pixels; Colour depth in bits per pixel',
    units: 'Bits (divide by 8 for Bytes, divide by 1024 or 1000 for KB)',
    examTip: 'Always check if the question asks for the answer in Bytes, Kilobytes (KiB or KB), or Megabytes (MB)!'
  }
];

export const INITIAL_REVISION_NOTES: RevisionTopic[] = [
  {
    id: 'rev-math-circle',
    subjectId: 'cie-math-0580',
    chapter: 'Geometry & Measure',
    title: 'Circle Theorems Master Guide',
    keyConcepts: [
      {
        heading: 'The 7 Essential Circle Theorems',
        points: [
          '1. Angle in a semicircle is a right angle (90°).',
          '2. Angle at centre is TWICE the angle at circumference subtended by the same arc.',
          '3. Angles in the same segment subtended by the same arc are equal ("butterfly / bow-tie rule").',
          '4. Opposite angles of a cyclic quadrilateral add up to 180°.',
          '5. Angle between tangent and radius is 90°.',
          '6. Tangents from an external point to a circle are equal in length.',
          '7. Alternate Segment Theorem: Angle between tangent and chord equals the angle subtended by chord in the alternate segment.'
        ],
        diagramDescription: 'Look for chords forming triangles inside the circle or radii reaching tangents.'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Cyclic Quadrilateral',
        definition: 'A four-sided polygon where all four vertices touch the circumference of the same circle.'
      },
      {
        term: 'Tangent',
        definition: 'A straight line that touches the circle at exactly one point without crossing the interior.'
      }
    ],
    examinerWarnings: [
      'Do NOT just write the numerical answer! You must state the full theorem reason in words to earn the B1 mark.',
      'Always state angles with 3-letter vertex notation, e.g., ∠ABC = 64°.'
    ]
  },
  {
    id: 'rev-phys-circuits',
    subjectId: 'cie-physics-0625',
    chapter: 'Electricity & Magnetism',
    title: 'Electric Circuits, Potential Dividers & Resistance',
    keyConcepts: [
      {
        heading: 'Current, Voltage & Resistance Rules',
        points: [
          'Current (I) is the rate of flow of electrical charge: I = Q / t (measured in Amperes). An ammeter is connected in SERIES.',
          'Voltage (V) or potential difference is the energy transferred per unit charge: V = W / Q (measured in Volts). A voltmeter is connected in PARALLEL.',
          'Resistance (R): Ratio of voltage to current: R = V / I.',
          'Potential Divider rule: V_out / V_in = R_2 / (R_1 + R_2). LDR resistance drops in light; Thermistor resistance drops when heated (TURD: Temperature Up, Resistance Down).'
        ],
        formula: 'I = \\frac{Q}{t}, \\quad V = I \\times R, \\quad P = I \\times V = I^2 R = \\frac{V^2}{R}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Electromotive Force (e.m.f.)',
        definition: 'The electrical energy transferred by a power source per unit charge in driving charge round a complete circuit.'
      },
      {
        term: 'Potential Difference (p.d.)',
        definition: 'The energy transferred per unit charge when charge passes through an electrical component.'
      }
    ],
    examinerWarnings: [
      'Examiners penalize confusing e.m.f. and p.d. E.m.f. is supplied by source; p.d. is consumed by components.',
      'Check whether a component is Ohmic: Ohmic resistors produce a straight line through the origin on an I-V graph.'
    ]
  },
  {
    id: 'rev-chem-moles',
    subjectId: 'cie-chem-0620',
    chapter: 'Quantitative Chemistry',
    title: 'Mole Concept, Empirical Formula & Reacting Masses',
    keyConcepts: [
      {
        heading: 'Empirical vs Molecular Formula calculation steps',
        points: [
          'Step 1: Write element symbols and their given masses or percentages.',
          'Step 2: Divide each mass by its relative atomic mass (Ar) to calculate moles.',
          'Step 3: Divide all mole values by the smallest mole value to obtain the simplest integer ratio.',
          'Step 4: If you obtain a decimal ending in .5, multiply all by 2 (e.g. 1 : 1.5 -> 2 : 3).',
          'Molecular formula = n × Empirical Formula, where n = (Relative formula mass Mr) / (Empirical formula mass).'
        ],
        formula: '\\text{Moles} = \\frac{\\text{Mass}}{\\text{Molar Mass}}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Mole',
        definition: 'The amount of substance that contains 6.02 × 10²³ particles (atoms, molecules, or ions) - Avogadro constant.'
      },
      {
        term: 'Limiting Reactant',
        definition: 'The reactant that is completely consumed first in a chemical reaction, thereby limiting the maximum amount of product formed.'
      }
    ],
    examinerWarnings: [
      'In reacting mass questions, always write the molar ratio from the balanced equation before calculating final mass.',
      'Do not round intermediate decimal numbers on your calculator; round only at the final step to 3 significant figures.'
    ]
  }
];
