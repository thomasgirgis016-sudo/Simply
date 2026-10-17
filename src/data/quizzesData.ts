import { QuizQuestion } from '../types';

export const COMPREHENSIVE_QUIZZES: QuizQuestion[] = [
  // ==========================================================
  // CHEMISTRY (CIE 0620 & EDEXCEL 4CH1)
  // ==========================================================
  {
    id: 'qc-1',
    subjectId: 'cie-chem-0620',
    topic: 'Electrochemistry & Electrolysis',
    paperReference: 'CIE 0620/21 May/June 2023',
    questionText: 'Concentrated aqueous sodium chloride (brine) is electrolysed using inert carbon electrodes. Which row correctly identifies the products formed at the cathode and anode?',
    options: [
      { id: 'opt-a', text: 'Cathode: Sodium metal; Anode: Chlorine gas' },
      { id: 'opt-b', text: 'Cathode: Hydrogen gas; Anode: Chlorine gas' },
      { id: 'opt-c', text: 'Cathode: Hydrogen gas; Anode: Oxygen gas' },
      { id: 'opt-d', text: 'Cathode: Chlorine gas; Anode: Hydrogen gas' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Hydrogen ions (H⁺) discharged at cathode because H is less reactive than Na',
      '[B1] Chloride ions (Cl⁻) discharged at anode due to high concentration'
    ],
    markSchemeExplanation: 'At the cathode, H⁺ is less reactive than Na⁺, so it is discharged: 2H⁺ + 2e⁻ -> H₂. At the anode, Cl⁻ is in high concentration, forming Cl₂: 2Cl⁻ -> Cl₂ + 2e⁻. Sodium hydroxide remains in solution.'
  },
  {
    id: 'qc-2',
    subjectId: 'cie-chem-0620',
    topic: 'Chemical Reactions (Rates & Reversible / Haber)',
    paperReference: 'CIE 0620/41 May/June 2023',
    questionText: 'In the Haber process: N2(g) + 3H2(g) ⇌ 2NH3(g) (ΔH = -92 kJ/mol). Which change will increase the equilibrium yield of ammonia (NH3)?',
    options: [
      { id: 'opt-a', text: 'Increasing the temperature' },
      { id: 'opt-b', text: 'Decreasing the pressure' },
      { id: 'opt-c', text: 'Increasing the pressure' },
      { id: 'opt-d', text: 'Adding an iron catalyst' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Count gas moles: 4 moles on LHS vs 2 moles on RHS',
      '[B1] Increasing pressure favours the side with fewer gas molecules (RHS).'
    ],
    markSchemeExplanation: 'The LHS has 4 moles of gas while the RHS has 2 moles. By Le Chatelier\'s principle, increasing pressure shifts equilibrium towards the side with fewer gas molecules (towards NH3), increasing yield. A catalyst speeds up rate but does not change equilibrium yield.'
  },
  {
    id: 'qc-3',
    subjectId: 'cie-chem-0620',
    topic: 'Atoms, Elements and Compounds (Bonding & Lattice)',
    paperReference: 'CIE 0620/22 Oct/Nov 2023',
    questionText: 'Why does solid magnesium chloride not conduct electricity, whereas molten magnesium chloride conducts electricity well?',
    options: [
      { id: 'opt-a', text: 'In the solid, electrons cannot move; in the liquid, electrons are free to move.' },
      { id: 'opt-b', text: 'In the solid, ions are fixed in a lattice; in the liquid, ions are free to move.' },
      { id: 'opt-c', text: 'In the solid, molecules are held by weak forces; in the liquid, bonds break.' },
      { id: 'opt-d', text: 'In the solid, magnesium atoms are uncharged; in the liquid, they become charged ions.' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Solid: ions held tightly in fixed lattice positions by strong electrostatic forces',
      '[B1] Liquid: lattice breaks down, ions are free to move and carry electric charge'
    ],
    markSchemeExplanation: 'Ionic compounds do NOT conduct using electrons. In solid state, ions cannot move. When melted or dissolved, the ionic lattice breaks down, allowing ions to move freely and carry electrical current.'
  },
  {
    id: 'qc-4',
    subjectId: 'cie-chem-0620',
    topic: 'Acids, Bases and Salts',
    paperReference: 'CIE 0620/21 May/June 2022',
    questionText: 'Which method should be used to prepare pure dry crystals of insoluble lead(II) sulfate from aqueous solutions?',
    options: [
      { id: 'opt-a', text: 'Titration of an acid and alkali followed by evaporation' },
      { id: 'opt-b', text: 'Reacting excess metal with dilute acid followed by filtration' },
      { id: 'opt-c', text: 'Precipitation by mixing two soluble salts, filtering, washing with distilled water, and drying' },
      { id: 'opt-d', text: 'Fractional distillation of the reaction mixture' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Identification of precipitation method for insoluble salts',
      '[B1] Washing the precipitate with distilled water to remove soluble impurities'
    ],
    markSchemeExplanation: 'Lead(II) sulfate is an insoluble salt. Insoluble salts are always prepared by precipitation: mix two soluble solutions (e.g. aqueous lead(II) nitrate and sodium sulfate), filter the solid precipitate, wash with distilled water, and dry.'
  },
  {
    id: 'qc-5',
    subjectId: 'cie-chem-0620',
    topic: 'Organic Chemistry (Alkanes, Alkenes, Polymers)',
    paperReference: 'CIE 0620/42 May/June 2022',
    questionText: 'Ethene reacts with steam at 300°C and 60 atm in the presence of a phosphoric acid catalyst. What type of reaction is this and what is the product?',
    options: [
      { id: 'opt-a', text: 'Substitution reaction producing Ethanoic acid' },
      { id: 'opt-b', text: 'Addition reaction producing Ethanol' },
      { id: 'opt-c', text: 'Fermentation reaction producing Carbon dioxide and Ethanol' },
      { id: 'opt-d', text: 'Cracking reaction producing Polyethene' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Type of reaction: Addition (hydration of alkene)',
      '[B1] Product: Ethanol (C₂H₅OH)'
    ],
    markSchemeExplanation: 'Alkenes undergo addition reactions across their C=C double bond. Hydration of ethene with steam produces ethanol: C₂H₄ + H₂O -> C₂H₅OH. Phosphoric acid (H₃PO₄) is the industrial catalyst.'
  },

  // ==========================================================
  // PHYSICS (CIE 0625 & EDEXCEL 4PH1)
  // ==========================================================
  {
    id: 'qp-1',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    paperReference: 'CIE 0625/22 Oct/Nov 2023',
    questionText: 'An astronaut has a mass of 80 kg on Earth, where g = 9.8 N/kg. The Moon has a gravitational field strength g = 1.6 N/kg. What is the astronaut\'s mass and weight on the Moon?',
    options: [
      { id: 'opt-a', text: 'Mass = 13.1 kg, Weight = 128 N' },
      { id: 'opt-b', text: 'Mass = 80 kg, Weight = 784 N' },
      { id: 'opt-c', text: 'Mass = 80 kg, Weight = 128 N' },
      { id: 'opt-d', text: 'Mass = 128 kg, Weight = 80 N' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Mass is the amount of matter and remains constant (80 kg)',
      '[B1] Weight on Moon = m × g_moon = 80 × 1.6 = 128 N'
    ],
    markSchemeExplanation: 'Mass does not depend on gravitational field strength (remains 80 kg). Weight is the downward gravitational force: W = m × g = 80 kg × 1.6 N/kg = 128 N.'
  },
  {
    id: 'qp-2',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    paperReference: 'CIE 0625/42 May/June 2023',
    questionText: 'A ray of light in air strikes a glass block of refractive index n = 1.50 at an angle of incidence of 30°. What is the angle of refraction in the glass?',
    options: [
      { id: 'opt-a', text: '19.5°' },
      { id: 'opt-b', text: '48.6°' },
      { id: 'opt-c', text: '20.0°' },
      { id: 'opt-d', text: '45.0°' }
    ],
    correctOptionId: 'opt-a',
    marks: 2,
    markingBreakdown: [
      '[M1] Snell\'s Law: n = sin(i) / sin(r) => sin(r) = sin(30°) / 1.50 = 0.50 / 1.50 = 0.333',
      '[A1] r = sin⁻¹(0.333) = 19.5°'
    ],
    markSchemeExplanation: 'Apply Snell\'s Law: sin(r) = sin(30°) / 1.50 = 0.50 / 1.50 = 0.333. Taking the inverse sine gives r = 19.5°.'
  },
  {
    id: 'qp-3',
    subjectId: 'cie-physics-0625',
    topic: 'Electricity & Magnetism (Circuits & Induction)',
    paperReference: 'CIE 0625/21 May/June 2022',
    questionText: 'Two resistors of 6 Ω and 12 Ω are connected in parallel across a 12 V power supply. What is the total circuit current leaving the power supply?',
    options: [
      { id: 'opt-a', text: '0.67 A' },
      { id: 'opt-b', text: '2.0 A' },
      { id: 'opt-c', text: '3.0 A' },
      { id: 'opt-d', text: '1.5 A' }
    ],
    correctOptionId: 'opt-c',
    marks: 3,
    markingBreakdown: [
      '[M1] 1/R_p = 1/6 + 1/12 = 3/12 => R_p = 4 Ω',
      '[M1] I = V / R_p = 12 V / 4 Ω',
      '[A1] I = 3.0 A'
    ],
    markSchemeExplanation: 'Total parallel resistance: R_p = (6 × 12) / (6 + 12) = 72 / 18 = 4 Ω. Current leaving battery: I = V / R = 12 V / 4 Ω = 3.0 A.'
  },

  // ==========================================================
  // BIOLOGY (CIE 0610 & EDEXCEL 4BI1)
  // ==========================================================
  {
    id: 'qb-1',
    subjectId: 'cie-bio-0610',
    topic: 'Cell Structure, Diffusion, Osmosis & Active Transport',
    paperReference: 'CIE 0610/22 Oct/Nov 2023',
    questionText: 'Plant tissue is immersed in a concentrated sucrose solution with a lower water potential than the plant cells. What will happen to the plant cells?',
    options: [
      { id: 'opt-a', text: 'Water enters cells by osmosis, causing cells to become turgid.' },
      { id: 'opt-b', text: 'Water enters cells by active transport, causing cells to burst.' },
      { id: 'opt-c', text: 'Water leaves cells by osmosis, causing the cytoplasm to pull away from the cell wall (plasmolysis).' },
      { id: 'opt-d', text: 'Sucrose molecules enter the vacuole by diffusion.' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Net movement of water out of cells down the water potential gradient by osmosis',
      '[B1] Vacuole shrinks, cytoplasm detaches from cell wall: cells are plasmolysed'
    ],
    markSchemeExplanation: 'Because the solution has a lower water potential than the cell interior, water moves out of the cell by osmosis. The vacuole shrinks and the cell membrane pulls away from the cell wall (plasmolysis).'
  },
  {
    id: 'qb-2',
    subjectId: 'cie-bio-0610',
    topic: 'Biological Molecules & Enzymes',
    paperReference: 'CIE 0610/21 May/June 2023',
    questionText: 'Why does an enzyme-catalysed reaction stop when heated above 60°C?',
    options: [
      { id: 'opt-a', text: 'Enzymes run out of activation energy.' },
      { id: 'opt-b', text: 'Enzymes are killed by excessive heat.' },
      { id: 'opt-c', text: 'High thermal vibration breaks bonds, permanently altering the active site shape so the substrate no longer fits.' },
      { id: 'opt-d', text: 'Substrate molecules denature and stop colliding.' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Breaking of hydrogen/ionic bonds holding protein 3D structure',
      '[B1] Permanent change in active site shape: enzyme is denatured'
    ],
    markSchemeExplanation: 'Enzymes are protein molecules (they do not "die"). At high temperatures, thermal vibrations break internal bonds, causing the active site to change shape permanently (denaturation). The substrate can no longer bind.'
  },

  // ==========================================================
  // MATHEMATICS (CIE 0580 & EDEXCEL 4MA1)
  // ==========================================================
  {
    id: 'qm-1',
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
    id: 'qm-2',
    subjectId: 'cie-math-0580',
    topic: 'Quadratics & Factoring',
    paperReference: 'CIE 0580/22 May/June 2023',
    questionText: 'Find the coordinates of the turning point of the curve y = 2(x - 3)² + 5 and determine its nature.',
    options: [
      { id: 'opt-a', text: '(-3, 5), Maximum' },
      { id: 'opt-b', text: '(3, 5), Minimum' },
      { id: 'opt-c', text: '(3, -5), Minimum' },
      { id: 'opt-d', text: '(6, 5), Maximum' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Turning point coordinates (3, 5)',
      '[B1] Minimum because leading coefficient a = +2 > 0'
    ],
    markSchemeExplanation: 'In completed square form y = a(x + b)² + c, the turning point occurs when (x - 3) = 0, so x = 3 and y = 5. Since a = +2 > 0, the parabola opens upwards, making it a Minimum.'
  },

  // ==========================================================
  // ENGLISH AS A SECOND LANGUAGE (CIE 0510 / EDEXCEL 4ES1)
  // ==========================================================
  {
    id: 'qesl-1',
    subjectId: 'cie-esl-0510',
    topic: 'Exercise 4: Summary Writing (100-120 words, Own Words & Linkers)',
    paperReference: 'CIE 0510/21 May/June 2023',
    questionText: 'In IGCSE ESL Exercise 4 (Summary Writing), what is the penalty if a student writes 135 words (exceeding the 120-word limit)?',
    options: [
      { id: 'opt-a', text: 'No penalty as long as content is accurate' },
      { id: 'opt-b', text: 'Examiners draw a line at 120 words, ignore all subsequent points, and cap language marks' },
      { id: 'opt-c', text: 'Automatic grade U (Ungraded)' },
      { id: 'opt-d', text: '1 mark deducted for every 10 words' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Knowledge of strict word count boundaries (100-120 words)',
      '[B1] Loss of content and language marks for text beyond 120 words'
    ],
    markSchemeExplanation: 'CIE mark schemes strictly state that examiners stop reading after the 120-word limit. Any content points written after word 120 earn zero marks, and language criteria bands are capped.'
  },
  {
    id: 'qesl-2',
    subjectId: 'cie-esl-0510',
    topic: 'Exercise 5: Informal Email / Letter Writing (Friendly Register)',
    paperReference: 'CIE 0510/22 Oct/Nov 2023',
    questionText: 'Which phrase is most appropriate for the opening paragraph of an informal email to a friend in IGCSE ESL?',
    options: [
      { id: 'opt-a', text: '"I am writing this communication to bring to your urgent attention my recent excursion."' },
      { id: 'opt-b', text: '"Hi Alex! So sorry I haven\'t been in touch lately, but you won\'t believe what happened at school last week!"' },
      { id: 'opt-c', text: '"To whom it may concern: with reference to our mutual association, I hereby notify you."' },
      { id: 'opt-d', text: '"Dear Sir or Madam, I have the honour to inform you of the following."' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Identification of appropriate informal register and tone',
      '[B1] Use of natural conversational idiom and contractions'
    ],
    markSchemeExplanation: 'Exercise 5 demands an informal register with a conversational tone, contractions (haven\'t, won\'t), and direct friendly engagement. Options A, C, and D are inappropriately formal or business-like.'
  },

  // ==========================================================
  // MORE PHYSICS QUESTIONS
  // ==========================================================
  {
    id: 'qp-4',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    paperReference: 'CIE 0625/41 May/June 2023',
    questionText: 'A ray of light in air enters a glass block of refractive index n = 1.50 at an angle of incidence i = 30.0°. What is the angle of refraction r in the glass?',
    options: [
      { id: 'opt-a', text: '19.5°' },
      { id: 'opt-b', text: '45.0°' },
      { id: 'opt-c', text: '22.0°' },
      { id: 'opt-d', text: '60.0°' }
    ],
    correctOptionId: 'opt-a',
    marks: 2,
    markingBreakdown: [
      '[M1] Snell\'s law: sin(r) = sin(i) / n = sin(30°) / 1.50 = 0.500 / 1.50 = 0.3333',
      '[A1] r = arcsin(0.3333) = 19.47° -> 19.5° (to 1 d.p.)'
    ],
    markSchemeExplanation: 'By Snell\'s Law, n = sin(i) / sin(r). Rearranging gives sin(r) = sin(30°) / 1.50 = 0.5 / 1.5 = 0.3333. Taking the inverse sine gives r = 19.5°.'
  },
  {
    id: 'qp-5',
    subjectId: 'cie-physics-0625',
    topic: 'Nuclear Physics (Radioactivity & Half-life)',
    paperReference: 'CIE 0625/22 Oct/Nov 2022',
    questionText: 'A radioactive isotope has a half-life of 6 hours. If the initial activity measured is 640 Bq, what is the activity remaining after 24 hours?',
    options: [
      { id: 'opt-a', text: '160 Bq' },
      { id: 'opt-b', text: '80 Bq' },
      { id: 'opt-c', text: '40 Bq' },
      { id: 'opt-d', text: '20 Bq' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[M1] Number of half-lives = 24 hours / 6 hours = 4 half-lives',
      '[A1] Final count = 640 / (2^4) = 640 / 16 = 40 Bq'
    ],
    markSchemeExplanation: '24 hours corresponds to 4 half-lives: 640 -> 320 (6h) -> 160 (12h) -> 80 (18h) -> 40 Bq (24h).'
  },

  // ==========================================================
  // MORE BIOLOGY QUESTIONS
  // ==========================================================
  {
    id: 'qb-3',
    subjectId: 'cie-bio-0610',
    topic: 'Reproduction & Genetics (Inheritance & Mitosis/Meiosis)',
    paperReference: 'CIE 0610/21 May/June 2023',
    questionText: 'Which statement correctly compares mitosis and meiosis in human cells?',
    options: [
      { id: 'opt-a', text: 'Mitosis produces 4 genetically identical diploid cells; meiosis produces 2 haploid gametes' },
      { id: 'opt-b', text: 'Mitosis produces 2 genetically identical diploid cells; meiosis produces 4 genetically diverse haploid gametes' },
      { id: 'opt-c', text: 'Both mitosis and meiosis produce identical diploid daughter cells' },
      { id: 'opt-d', text: 'Meiosis occurs only in skin and liver cells for tissue repair' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Mitosis produces 2 identical diploid cells for growth and repair',
      '[B1] Meiosis produces 4 genetically varied haploid gametes for sexual reproduction'
    ],
    markSchemeExplanation: 'Mitosis produces 2 diploid cells (46 chromosomes) identical to the parent. Meiosis involves two divisions, generating 4 genetically varied haploid gametes (23 chromosomes) via crossing over and independent assortment.'
  },
  {
    id: 'qb-4',
    subjectId: 'cie-bio-0610',
    topic: 'Plant Nutrition & Photosynthesis',
    paperReference: 'CIE 0610/42 Oct/Nov 2023',
    questionText: 'A plant is exposed to increasing light intensity at constant low carbon dioxide concentration (0.04%) and optimum temperature (25°C). The rate of photosynthesis increases initially and then plateaus. What is the limiting factor at the plateau?',
    options: [
      { id: 'opt-a', text: 'Light intensity' },
      { id: 'opt-b', text: 'Carbon dioxide concentration' },
      { id: 'opt-c', text: 'Oxygen availability' },
      { id: 'opt-d', text: 'Glucose storage' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[B1] Identification of plateau indicating factor on x-axis is no longer limiting',
      '[B1] Low CO₂ concentration is restricting the rate of the light-independent stage'
    ],
    markSchemeExplanation: 'Once the photosynthesis curve levels off despite further increases in light intensity, light is no longer the limiting factor. The process is now restricted by another factor present in lowest supply—here, carbon dioxide concentration.'
  },

  // ==========================================================
  // MORE MATHS QUESTIONS
  // ==========================================================
  {
    id: 'qm-3',
    subjectId: 'cie-math-0580',
    topic: 'Probability & Venn Diagrams',
    paperReference: 'CIE 0580/41 Oct/Nov 2022',
    questionText: 'A bag contains 5 red balls and 3 blue balls. Two balls are taken from the bag at random without replacement. What is the probability that both balls are red?',
    options: [
      { id: 'opt-a', text: '25 / 64' },
      { id: 'opt-b', text: '5 / 14' },
      { id: 'opt-c', text: '10 / 56' },
      { id: 'opt-d', text: '15 / 56' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[M1] P(1st Red) = 5/8; P(2nd Red | 1st Red) = 4/7',
      '[A1] P(Both Red) = (5/8) × (4/7) = 20/56 = 5/14'
    ],
    markSchemeExplanation: 'Without replacement, the total number of balls decreases to 7 and the number of red balls decreases to 4: P(Red and Red) = 5/8 × 4/7 = 20/56, which simplifies by dividing numerator and denominator by 4 to give 5/14.'
  },

  // ==========================================================
  // COMPUTER SCIENCE QUESTIONS
  // ==========================================================
  {
    id: 'qcs-1',
    subjectId: 'cie-cs-0478',
    topic: 'Hardware & Architecture (CPU, Von Neumann, Fetch-Decode-Execute)',
    paperReference: 'CIE 0478/12 May/June 2023',
    questionText: 'During the Fetch stage of the Fetch-Decode-Execute cycle, which register holds the address of the next instruction to be fetched from RAM?',
    options: [
      { id: 'opt-a', text: 'Memory Data Register (MDR)' },
      { id: 'opt-b', text: 'Current Instruction Register (CIR)' },
      { id: 'opt-c', text: 'Program Counter (PC)' },
      { id: 'opt-d', text: 'Accumulator (ACC)' }
    ],
    correctOptionId: 'opt-c',
    marks: 2,
    markingBreakdown: [
      '[B1] Identification of Program Counter as holding the address of the next instruction',
      '[B1] Understanding that PC increments after address is copied to MAR'
    ],
    markSchemeExplanation: 'The Program Counter (PC) stores the memory address of the next instruction. This address is placed onto the address bus and copied to the MAR, then the PC is incremented.'
  },
  {
    id: 'qcs-2',
    subjectId: 'cie-cs-0478',
    topic: 'Data Representation (Binary, Hexadecimal, Sound & Images)',
    paperReference: 'CIE 0478/11 Oct/Nov 2022',
    questionText: 'What is the denary value of the 8-bit two\'s complement binary integer 11110100?',
    options: [
      { id: 'opt-a', text: '-12' },
      { id: 'opt-b', text: '-116' },
      { id: 'opt-c', text: '+244' },
      { id: 'opt-d', text: '-20' }
    ],
    correctOptionId: 'opt-a',
    marks: 2,
    markingBreakdown: [
      '[M1] MSB weight = -128. Sum: -128 + 64 + 32 + 16 + 4 = -12',
      '[A1] Correct denary value -12'
    ],
    markSchemeExplanation: 'In 8-bit two\'s complement, bit 7 has weight -128: -128 + 64 + 32 + 16 + 4 = -12. Alternatively, invert bits (00001011 = 11) and add 1 -> 12, so -12.'
  },

  // ==========================================================
  // ECONOMICS & ACCOUNTING QUESTIONS
  // ==========================================================
  {
    id: 'qecon-1',
    subjectId: 'cie-econ-0455',
    topic: 'The Allocation of Resources (Supply, Demand, Elasticity)',
    paperReference: 'CIE 0455/21 May/June 2023',
    questionText: 'When the price of a product rises by 10%, the quantity demanded falls by 25%. What is the Price Elasticity of Demand (PED) and how is demand classified?',
    options: [
      { id: 'opt-a', text: 'PED = -0.40, Inelastic' },
      { id: 'opt-b', text: 'PED = -2.50, Elastic' },
      { id: 'opt-c', text: 'PED = +2.50, Unitary' },
      { id: 'opt-d', text: 'PED = -0.25, Perfectly Inelastic' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[M1] PED = %ΔQD / %ΔP = -25% / +10% = -2.5',
      '[A1] |PED| > 1 so demand is Price Elastic'
    ],
    markSchemeExplanation: 'PED = (% change in quantity demanded) / (% change in price) = -25% / +10% = -2.5. Since the absolute value is greater than 1, consumers are highly responsive to price, indicating price elastic demand.'
  },
  {
    id: 'qacc-1',
    subjectId: 'cie-accounting-0452',
    topic: 'Interpretation and Ratio Analysis (Liquidity, Profitability, ROE)',
    paperReference: 'CIE 0452/12 May/June 2023',
    questionText: 'A business has current assets of $50,000, inventory of $18,000, and current liabilities of $20,000. What is its Quick (Acid Test) Ratio?',
    options: [
      { id: 'opt-a', text: '2.5 : 1' },
      { id: 'opt-b', text: '1.6 : 1' },
      { id: 'opt-c', text: '0.9 : 1' },
      { id: 'opt-d', text: '3.4 : 1' }
    ],
    correctOptionId: 'opt-b',
    marks: 2,
    markingBreakdown: [
      '[M1] Liquid Assets = Current Assets - Inventory = $50,000 - $18,000 = $32,000',
      '[A1] Quick Ratio = $32,000 / $20,000 = 1.6 : 1'
    ],
    markSchemeExplanation: 'The Quick Ratio excludes inventory because it cannot be converted into cash immediately: Quick Ratio = (Current Assets - Inventory) / Current Liabilities = ($50,000 - $18,000) / $20,000 = $32,000 / $20,000 = 1.6 : 1.'
  }
];
