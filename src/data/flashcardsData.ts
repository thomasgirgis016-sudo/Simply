import { Flashcard } from '../types';

export const COMPREHENSIVE_FLASHCARDS: Flashcard[] = [
  // ==========================================================
  // CHEMISTRY (CIE 0620 & EDEXCEL 4CH1)
  // ==========================================================
  {
    id: 'fc-ch-1',
    subjectId: 'cie-chem-0620',
    topic: 'Atoms, Elements and Compounds (Bonding & Lattice)',
    question: 'Describe the structure and bonding in a giant ionic lattice and explain why ionic compounds conduct electricity only when molten or aqueous.',
    answer: 'Structure: A regular 3D giant ionic lattice of alternating positive and negative ions held by strong electrostatic attractions in all directions.\nConduction: In solid state, ions are locked in fixed positions in the lattice and cannot move. When molten or dissolved in water (aqueous), the lattice breaks down and ions are free to move and carry charge.',
    keyFormula: '\\text{Electrostatic attraction between } M^+ \\text{ and } X^-',
    examinerTip: 'Never say "electrons move to conduct electricity in ionic compounds"! It is free ions that move. Electrons only conduct in metals and graphite.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ch-2',
    subjectId: 'cie-chem-0620',
    topic: 'Atoms, Elements and Compounds (Bonding & Lattice)',
    question: 'Compare Diamond and Graphite in terms of structure, hardness, and electrical conductivity.',
    answer: '• Diamond: Each carbon atom forms 4 strong covalent bonds in a rigid 3D tetrahedral giant covalent structure. All valence electrons are tied up in bonds (no free electrons $\\rightarrow$ electrical insulator). Extremely hard (used in drill tips).\n• Graphite: Each carbon forms 3 covalent bonds in flat hexagonal layers. 1 delocalised electron per carbon is free to move along layers (conducts electricity). Layers held by weak intermolecular forces and slide easily (soft/slippery, used as lubricant & electrodes).',
    examinerTip: 'Always mention that in diamond each carbon forms 4 bonds, whereas in graphite each carbon forms 3 bonds with 1 delocalised electron.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ch-3',
    subjectId: 'cie-chem-0620',
    topic: 'Electrochemistry & Electrolysis',
    question: 'In the electrolysis of concentrated aqueous NaCl (brine), what products are formed at the cathode, anode, and in the solution?',
    answer: '• Cathode (-): Hydrogen gas ($2H^+ + 2e^- \\rightarrow H_2$)\n• Anode (+): Chlorine gas ($2Cl^- \\rightarrow Cl_2 + 2e^-$)\n• In Solution: Sodium ($Na^+$) and hydroxide ($OH^-$) ions remain, forming aqueous Sodium Hydroxide ($NaOH$, strongly alkaline pH 14).',
    examinerTip: 'Remember: $H^+$ is discharged at cathode because hydrogen is less reactive than sodium. Sodium metal is NEVER formed in aqueous solution!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ch-4',
    subjectId: 'cie-chem-0620',
    topic: 'Chemical Reactions (Rates & Reversible / Haber)',
    question: 'State the optimum industrial conditions for the Haber Process and explain why 450°C is an economic compromise.',
    answer: 'Conditions: $450^\\circ\\text{C}$, $200\\text{ atm}$, finely divided Iron catalyst.\nCompromise: Forward reaction is exothermic ($N_2 + 3H_2 \\rightleftharpoons 2NH_3, \\Delta H = -92\\text{ kJ/mol}$). A lower temperature gives a higher equilibrium yield by Le Chatelier\'s principle, but causes a very slow reaction rate. $450^\\circ\\text{C}$ gives a reasonable yield at a commercially fast rate.',
    keyFormula: 'N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g) \\quad (\\Delta H = -92\\text{ kJ/mol})',
    examinerTip: 'Iron catalyst does NOT change the position of equilibrium or yield; it only speeds up the forward and backward reactions equally to reach equilibrium faster.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ch-5',
    subjectId: 'cie-chem-0620',
    topic: 'Acids, Bases and Salts',
    question: 'Describe how to prepare pure, dry crystals of hydrated Copper(II) Sulfate ($CuSO_4$) starting from dilute sulfuric acid and insoluble copper(II) oxide.',
    answer: '1. Warm dilute sulfuric acid in a beaker.\n2. Add copper(II) oxide powder in excess with stirring until no more dissolves (ensures all acid is neutralised).\n3. Filter the mixture to remove the excess unreacted copper(II) oxide solid.\n4. Heat the blue filtrate to the point of crystallisation (saturation).\n5. Leave to cool and crystallise; filter crystals and dry between sheets of filter paper.',
    examinerTip: 'Do NOT boil to dryness! You must heat to the "point of crystallisation" (tested by dipping a glass rod to see small crystals forming).',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-ch-6',
    subjectId: 'cie-chem-0620',
    topic: 'The Periodic Table & Trends',
    question: 'Explain why the reactivity of Group 1 alkali metals increases down the group from Lithium to Francium.',
    answer: '1. Going down Group 1, atoms have more electron shells $\\rightarrow$ atomic radius increases.\n2. The single valence electron is further from the positive nucleus with more electron shielding.\n3. Electrostatic attraction between the nucleus and the outer electron is weaker.\n4. Therefore, the outer electron is lost more readily down the group.',
    examinerTip: 'Always structure in 3 steps: 1) Larger radius / more shells, 2) More shielding / weaker attraction, 3) Electron lost more easily.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ch-7',
    subjectId: 'cie-chem-0620',
    topic: 'Organic Chemistry (Alkanes, Alkenes, Polymers)',
    question: 'How do you distinguish experimentally between an alkane and an alkene, and what reaction occurs?',
    answer: 'Add orange-brown aqueous Bromine Water ($Br_2(aq)$) to both samples and shake:\n• Alkane (saturated): Stays orange-brown (no reaction in dark).\n• Alkene (unsaturated): Decolourises rapidly from orange-brown to colourless via an addition reaction across the $C=C$ double bond (forming a dibromoalkane).',
    keyFormula: 'C_2H_4 + Br_2 \\rightarrow C_2H_4Br_2',
    examinerTip: 'Never say "the solution turns clear"! Say "decolourises" or "turns colourless". Water is clear and orange juice is clear; "clear" is not a colour!',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-ch-8',
    subjectId: 'cie-chem-0620',
    topic: 'Metals & Extraction',
    question: 'What is the role of Cryolite ($Na_3AlF_6$) in the extraction of Aluminium from Bauxite?',
    answer: 'Pure aluminium oxide ($Al_2O_3$) has an extremely high melting point ($>2000^\\circ\\text{C}$). Dissolving it in molten cryolite lowers the operating melting point to around $950^\\circ\\text{C}$, drastically saving electrical energy costs and improving electrical conductivity.',
    examinerTip: 'Also remember why carbon anodes must be replaced periodically: at 950°C, oxygen formed reacts with carbon to form $CO_2$ gas ($C + O_2 \\rightarrow CO_2$), burning away the anodes.',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // PHYSICS (CIE 0625 & EDEXCEL 4PH1)
  // ==========================================================
  {
    id: 'fc-ph-1',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    question: 'Explain the 4 stages of reaching Terminal Velocity for a falling skydiver.',
    answer: '1. At jump: Only Weight acts downwards $\\rightarrow$ large resultant force downwards $\\rightarrow$ accelerates at $g = 9.8\\text{ m/s}^2$.\n2. As speed increases, upward Air Resistance increases.\n3. Resultant force downwards decreases $\\rightarrow$ acceleration decreases.\n4. Air Resistance equals Weight $\\rightarrow$ Resultant Force is ZERO $\\rightarrow$ Acceleration is ZERO $\\rightarrow$ Constant Terminal Velocity reached.',
    examinerTip: 'Do not confuse "acceleration decreasing" with "slowing down". When acceleration decreases, the skydiver is still speeding up, just at a slower rate!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ph-2',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    question: 'State the two conditions required for Total Internal Reflection (TIR) to occur.',
    answer: '1. Light must be travelling from an optically denser medium to an optically less dense medium (e.g. glass to air, or water to air).\n2. The angle of incidence ($i$) inside the denser medium must be greater than the Critical Angle ($c$).',
    keyFormula: '\\sin(c) = \\frac{1}{n}',
    examinerTip: 'Angles are always measured to the NORMAL line (the 90° dotted perpendicular line), never to the boundary surface!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-ph-3',
    subjectId: 'cie-physics-0625',
    topic: 'Electricity & Magnetism (Circuits & Induction)',
    question: 'How do Current and Potential Difference behave in Series vs Parallel circuits?',
    answer: '• Series Circuit:\n  - Current ($I$) is identical at all points.\n  - Total Voltage is shared across components ($V_{total} = V_1 + V_2$).\n  - Total Resistance: $R_{total} = R_1 + R_2$.\n• Parallel Circuit:\n  - Voltage ($V$) is the same across each parallel branch.\n  - Current splits across branches ($I_{total} = I_1 + I_2$).\n  - Total Resistance: $1/R_{total} = 1/R_1 + 1/R_2$.',
    keyFormula: 'V = IR, \\quad P = IV = I^2R',
    examinerTip: 'Adding resistors in parallel ALWAYS decreases total resistance to less than the smallest branch resistor.',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-ph-4',
    subjectId: 'cie-physics-0625',
    topic: 'Nuclear Physics (Radioactivity & Half-life)',
    question: 'Compare Alpha (α), Beta (β), and Gamma (γ) radiation in terms of nature, charge, ionising power, and penetrating power.',
    answer: '• Alpha (α): Helium nucleus ($2p + 2n$, charge +2). Highly ionising. Stopped by paper or a few cm of air.\n• Beta (β): Fast-moving electron ($e^-$, charge -1). Moderately ionising. Stopped by a few mm of aluminium.\n• Gamma (γ): High-frequency electromagnetic wave (no mass, 0 charge). Weakly ionising. Stopped only by thick lead or metres of concrete.',
    examinerTip: 'In magnetic/electric fields: Alpha is deflected towards negative plate; Beta is deflected more strongly towards positive plate (lighter mass); Gamma passes straight through undeflected.',
    difficulty: 'Core',
    mastered: false,
  },

  // ==========================================================
  // BIOLOGY (CIE 0610 & EDEXCEL 4BI1)
  // ==========================================================
  {
    id: 'fc-bio-1',
    subjectId: 'cie-bio-0610',
    topic: 'Cell Structure, Diffusion, Osmosis & Active Transport',
    question: 'What happens to an animal red blood cell vs a plant cell when placed in pure distilled water?',
    answer: '• Animal RBC: Water enters by osmosis down water potential gradient. Has no cell wall $\\rightarrow$ swells and bursts (lysis).\n• Plant Cell: Water enters vacuole by osmosis. Protoplasm swells and pushes against the rigid cellulose cell wall. The wall resists expansion with turgor pressure $\\rightarrow$ cell becomes turgid (does not burst).',
    examinerTip: 'Always mention that the cellulose cell wall prevents the plant cell from bursting.',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-bio-2',
    subjectId: 'cie-bio-0610',
    topic: 'Plant Nutrition & Photosynthesis',
    question: 'State the word and balanced chemical equation for Photosynthesis and describe 3 limiting factors.',
    answer: 'Equation: $$6CO_2 + 6H_2O \\xrightarrow{\\text{Light & Chlorophyll}} C_6H_{12}O_6 + 6O_2$$\nLimiting Factors:\n1. Light Intensity (rate increases proportionally then plateaus).\n2. $CO_2$ Concentration (rate increases then plateaus).\n3. Temperature (rate increases up to optimum ~35-40°C, then drops sharply as enzymes denature).',
    examinerTip: 'Never say enzymes "die" at high temperature! Enzymes are protein molecules; they are "denatured" because the active site shape changes permanently.',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-bio-3',
    subjectId: 'cie-bio-0610',
    topic: 'Transport in Plants (Xylem & Phloem)',
    question: 'Compare Xylem and Phloem vessels in structure, substances transported, and direction of flow.',
    answer: '• Xylem: Dead hollow cells with lignified walls. Transports Water and Mineral Ions unidirectionally from roots upwards to leaves via the Transpiration stream.\n• Phloem: Living sieve tube elements with companion cells. Transports Sucrose and Amino Acids bidirectionally from source to sink via Translocation.',
    examinerTip: 'Plants transport carbohydrates as SUCROSE in phloem (soluble and unreactive), not glucose or starch!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-bio-4',
    subjectId: 'cie-bio-0610',
    topic: 'Reproduction & Genetics (Inheritance & Mitosis/Meiosis)',
    question: 'Compare Mitosis and Meiosis in terms of location, number of divisions, daughter cells produced, and genetic variation.',
    answer: '• Mitosis: Occurs in body (somatic) cells for growth, tissue repair, and asexual reproduction. 1 nuclear division $\\rightarrow$ produces 2 genetically identical diploid daughter cells (46 chromosomes in humans).\n• Meiosis: Occurs in gonads (testes/ovaries) to produce gametes (sperm/egg). 2 nuclear divisions $\\rightarrow$ produces 4 genetically varied haploid daughter cells (23 chromosomes).',
    examinerTip: 'Remember: Mitosis creates "identical twins" (2 diploid); Meiosis creates "mini eggs/sperm" (4 haploid with variation).',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // ENGLISH AS A SECOND LANGUAGE (CIE 0510 / EDEXCEL 4ES1)
  // ==========================================================
  {
    id: 'fc-esl-10',
    subjectId: 'cie-esl-0510',
    topic: 'Exercise 4: Summary Writing (100-120 words, Own Words & Linkers)',
    question: 'How do you score Band 5-6 (Full marks) for Language in IGCSE ESL Exercise 4 Summary Writing?',
    answer: '1. Paraphrase vocabulary: replace words from the passage with accurate synonyms.\n2. Transform sentence structures (e.g. change active voice to passive voice, combine sentences using relative clauses).\n3. Use smooth formal cohesive linkers (Furthermore, Conversely, Consequently, In addition).\n4. Word count: strictly 100 to 120 words.',
    examinerTip: 'Direct copying of 5 or more consecutive words from the passage is flagged as lifting and caps your language mark!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-esl-11',
    subjectId: 'cie-esl-0510',
    topic: 'Exercise 5: Informal Email / Letter Writing (Friendly Register)',
    question: 'What are 5 essential informal conventions required in IGCSE ESL Exercise 5 Email to a Friend?',
    answer: '1. Friendly opening apology ("Sorry for not writing sooner, but I\'ve been swamped with revision!").\n2. Contracted forms ("I\'m", "didn\'t", "you\'ll", "can\'t").\n3. Conversational idioms ("over the moon", "to be honest", "a breath of fresh air").\n4. Direct questions to friend ("How are your exams going?").\n5. Warm sign-off ("Can\'t wait to catch up!", "Best wishes,", your first name).',
    examinerTip: 'Cover ALL three prompt bullet points in equal detail. If you omit one bullet point, content is capped at 4/8 marks!',
    difficulty: 'Core',
    mastered: false,
  },
  {
    id: 'fc-esl-12',
    subjectId: 'cie-esl-0510',
    topic: 'Exercise 6: Formal School Magazine Article Writing',
    question: 'What structure and tone must you use in IGCSE ESL Exercise 6 School Magazine Article?',
    answer: '1. Catchy headline/title.\n2. Engaging opening with a rhetorical question ("Have you ever stopped to consider...?").\n3. Balanced body paragraphs with topic sentences and formal register (NO slang or contractions: write "do not", not "don\'t").\n4. Advanced vocabulary (e.g. paramount, detrimental, indispensable).\n5. Concluding paragraph with a strong recommendation.',
    examinerTip: 'Ensure your register matches the audience: a school magazine article needs a lively yet formal and authoritative tone.',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // MATHEMATICS (CIE 0580)
  // ==========================================================
  {
    id: 'fc-math-1',
    subjectId: 'cie-math-0580',
    topic: 'Circle Theorems',
    question: 'State the Alternate Segment Theorem and give an exam tip.',
    answer: 'The angle between a tangent to a circle and a chord drawn through the point of contact is equal to the angle subtended by that chord in the alternate segment.\nExample: If the angle between tangent and chord AB is 62°, the angle on the opposite circumference ∠ACB is also 62°.',
    examinerTip: 'Always write the exact phrase "Alternate segment theorem" to earn the B1 reason mark in Cambridge papers.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-math-2',
    subjectId: 'cie-math-0580',
    topic: 'Trigonometry (SOHCAHTOA & Sine/Cosine Rule)',
    question: 'When should you use the Sine Rule vs the Cosine Rule in non-right-angled triangles?',
    answer: '• Use Sine Rule when you know an angle and its OPPOSITE side (an "opposite pair"), plus one other side or angle.\n• Use Cosine Rule when you know:\n  1. Two sides and the INCLUDED angle (SAS) to find third side.\n  2. All three sides (SSS) to find any angle.',
    keyFormula: 'a^2 = b^2 + c^2 - 2bc\\cos(A), \\quad \\frac{a}{\\sin A} = \\frac{b}{\\sin B}',
    examinerTip: 'Make sure your scientific calculator is in DEG mode, not RAD!',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-math-3',
    subjectId: 'cie-math-0580',
    topic: 'Quadratics & Factoring',
    question: 'How do you find the turning point of a quadratic curve from completed square form y = a(x + b)² + c?',
    answer: 'The turning point has coordinates (-b, c).\n• If a > 0: The parabola opens upwards $\\rightarrow$ turning point is a MINIMUM.\n• If a < 0: The parabola opens downwards $\\rightarrow$ turning point is a MAXIMUM.',
    examinerTip: 'Remember to flip the sign inside the bracket: if y = 3(x - 4)² + 7, the turning point is (+4, 7).',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-math-4',
    subjectId: 'cie-math-0580',
    topic: 'Vectors & Transformations',
    question: 'How do you describe fully a single transformation that maps object A onto image B when it is an Enlargement?',
    answer: 'You must state three things:\n1. The word "Enlargement"\n2. Scale factor (e.g. k = 2 or k = -1/2)\n3. Centre of enlargement coordinates (e.g. (0, 0) or (1, -2)).',
    examinerTip: 'Never give two transformations (e.g. "rotate and shift") when the question specifies a SINGLE transformation! Giving two scores 0 marks.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-math-5',
    subjectId: 'cie-math-0580',
    topic: 'Probability & Venn Diagrams',
    question: 'What is the difference between mutually exclusive and independent events in probability?',
    answer: '• Mutually Exclusive: Events CANNOT happen at the same time (P(A ∩ B) = 0, e.g. rolling a 3 and a 4 on a single die). P(A or B) = P(A) + P(B).\n• Independent: The occurrence of event A has NO effect on the probability of event B (e.g. flipping heads on coin 1 and rolling a 6 on die 2). P(A and B) = P(A) × P(B).',
    examinerTip: 'If sampling "without replacement", the second event is DEPENDENT because the denominator decreases by 1!',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // COMPUTER SCIENCE (CIE 0478 & EDEXCEL 4CP0)
  // ==========================================================
  {
    id: 'fc-cs-2',
    subjectId: 'cie-cs-0478',
    topic: 'Hardware & Architecture (CPU, Von Neumann, Fetch-Decode-Execute)',
    question: 'What are the roles of the MAR, MDR, PC, and ALU in the Von Neumann CPU architecture?',
    answer: '• PC (Program Counter): Stores address of the next instruction to be fetched.\n• MAR (Memory Address Register): Holds the memory location currently being read or written.\n• MDR (Memory Data Register): Holds data or instruction fetched from RAM or waiting to be written.\n• ALU (Arithmetic Logic Unit): Performs arithmetic calculations and logical decisions (AND, OR, NOT).',
    examinerTip: 'State clearly that the address bus is unidirectional (CPU to RAM), whereas the data bus is bidirectional.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-cs-3',
    subjectId: 'cie-cs-0478',
    topic: 'Data Representation (Binary, Hexadecimal, Sound & Images)',
    question: 'How do you convert the negative denary number -42 into 8-bit Two\'s Complement binary?',
    answer: 'Step 1: Write positive 42 in 8-bit binary: 00101010.\nStep 2: Invert all bits (One\'s Complement): 11010101.\nStep 3: Add 1: 11010101 + 1 = 11010110.\nFinal 8-bit Two\'s complement: 11010110.',
    examinerTip: 'Check your answer: Most Significant Bit (MSB) has weight -128. Here: -128 + 64 + 16 + 4 + 2 = -42.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-cs-4',
    subjectId: 'cie-cs-0478',
    topic: 'Boolean Logic (Logic Gates & Truth Tables)',
    question: 'State the truth table logic for an XOR (Exclusive OR) gate.',
    answer: 'XOR outputs 1 (True) IF AND ONLY IF the two inputs are different:\n• Inputs (0, 0) -> Output 0\n• Inputs (0, 1) -> Output 1\n• Inputs (1, 0) -> Output 1\n• Inputs (1, 1) -> Output 0',
    keyFormula: 'A \\oplus B = (A \\text{ AND NOT } B) \\text{ OR } (\\text{NOT } A \\text{ AND } B)',
    examinerTip: 'Draw XOR gates carefully with the distinct curved line behind the input curve.',
    difficulty: 'Core',
    mastered: false,
  },

  // ==========================================================
  // ECONOMICS (CIE 0455 & EDEXCEL 4EC1)
  // ==========================================================
  {
    id: 'fc-econ-1',
    subjectId: 'cie-econ-0455',
    topic: 'The Allocation of Resources (Supply, Demand, Elasticity)',
    question: 'What is Price Elasticity of Demand (PED) and what does PED > 1 mean for total revenue when price increases?',
    answer: 'PED measures the responsiveness of quantity demanded to a change in price (%ΔQD / %ΔP).\nWhen demand is Price ELASTIC (|PED| > 1), an increase in price causes a proportionally larger drop in quantity demanded $\\rightarrow$ TOTAL REVENUE FALLS.',
    examinerTip: 'Remember: Inelastic demand (|PED| < 1) means consumers have few substitutes (e.g. medicines), so firms raise total revenue by raising prices.',
    difficulty: 'Extended',
    mastered: false,
  },
  {
    id: 'fc-econ-2',
    subjectId: 'cie-econ-0455',
    topic: 'Macroeconomic Policies & Global Economy',
    question: 'Distinguish between Fiscal Policy and Monetary Policy with specific policy tools.',
    answer: '• Fiscal Policy: Government manipulation of taxation (T) and government spending (G) to manage aggregate demand. (Expansionary: Cut taxes, increase public spending).\n• Monetary Policy: Central bank policy manipulating interest rates, money supply, and exchange rates. (Contractionary: Raise interest rates to cool inflation).',
    examinerTip: 'Never say the "government sets interest rates"! In modern economies, the central bank (e.g. Bank of England) sets interest rates.',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // ACCOUNTING (CIE 0452)
  // ==========================================================
  {
    id: 'fc-acc-1',
    subjectId: 'cie-accounting-0452',
    topic: 'Interpretation and Ratio Analysis (Liquidity, Profitability, ROE)',
    question: 'Explain the difference between the Straight-Line Method and the Reducing Balance Method of depreciation.',
    answer: '• Straight-Line: Equal depreciation charge each year: (Cost - Residual value) / Useful life. Suitable for assets providing consistent economic benefits (e.g. office furniture).\n• Reducing Balance: A fixed percentage applied to the opening Net Book Value (Cost - Accumulated Depreciation) each year. Depreciation charge decreases each year. Suitable for assets that lose value rapidly in early years (e.g. motor vehicles, computer servers).',
    examinerTip: 'Remember: In the reducing balance method, scrap residual value is NOT subtracted from cost in year 1 calculation!',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // HISTORY (CIE 0470)
  // ==========================================================
  {
    id: 'fc-hist-1',
    subjectId: 'cie-history-0470',
    topic: 'Were the peace treaties of 1919-23 fair? (Versailles)',
    question: 'What were the main military and territorial terms imposed on Germany by the Treaty of Versailles (1919)?',
    answer: '• Military: Army capped at 100,000 men (all volunteers, no conscription); Navy capped at 6 battleships; NO submarines, NO military aircraft; Rhineland demilitarised permanently.\n• Territorial: Alsace-Lorraine returned to France; Polish Corridor given to Poland (cutting off East Prussia); Saar coalfields placed under League control for 15 years; all overseas colonies confiscated; Anschluss with Austria forbidden.',
    examinerTip: 'Remember Article 231 (War Guilt Clause) which forced Germany to accept total blame for the outbreak of WWI, justifying the £6.6 billion reparations.',
    difficulty: 'Extended',
    mastered: false,
  },

  // ==========================================================
  // GEOGRAPHY (CIE 0460)
  // ==========================================================
  {
    id: 'fc-geo-1',
    subjectId: 'cie-geography-0460',
    topic: 'Theme 2: Earthquakes and Volcanoes (Plate Tectonics)',
    question: 'Describe what occurs at a Destructive (Convergent) plate boundary.',
    answer: 'An oceanic plate collides with a continental plate. Because the oceanic plate is denser, it is subducted beneath the continental plate into the mantle, creating a deep ocean trench. Friction causes intense deep earthquakes. As the plate melts in the subduction zone, magma rises to form violent composite volcanoes and fold mountains.',
    examinerTip: 'Case study recall: E.g., Nazca plate subducting under the South American plate (Andes Mountains).',
    difficulty: 'Extended',
    mastered: false,
  }
];
