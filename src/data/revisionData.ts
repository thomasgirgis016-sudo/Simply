import { RevisionTopic } from '../types';

export const COMPREHENSIVE_REVISION_NOTES: RevisionTopic[] = [
  // ==========================================================
  // CHEMISTRY (CIE 0620 & EDEXCEL 4CH1)
  // ==========================================================
  {
    id: 'rev-chem-bonding',
    subjectId: 'cie-chem-0620',
    chapter: 'Atoms, Elements and Compounds',
    title: 'Chemical Bonding, Giant Lattices & Molecular Structures',
    keyConcepts: [
      {
        heading: 'Ionic vs Covalent vs Metallic Structures',
        points: [
          'Ionic: Transfer of electrons from metal to non-metal. Giant 3D lattice of alternating positive and negative ions held by strong electrostatic attractions. High melting/boiling points. Conducts electricity ONLY when molten or aqueous because ions become mobile.',
          'Simple Covalent: Non-metal atoms sharing pairs of electrons. Strong covalent bonds within molecules, but WEAK intermolecular forces between molecules. Low melting/boiling points (little energy needed to overcome weak intermolecular forces). Non-conductors.',
          'Giant Covalent (Macromolecules): Diamond (each C bonded to 4 carbons in 3D tetrahedral, very hard, insulator); Graphite (each C bonded to 3 carbons in layers with 1 delocalised electron per carbon, conducts electricity, soft/slippery); Silicon(IV) oxide SiO₂ (each Si to 4 O, each O to 2 Si).',
          'Metallic: Lattice of positive metal cations in a sea of delocalised electrons. High melting point, malleable (layers of ions slide over each other), good conductors of heat and electricity.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Ionic Bond',
        definition: 'The strong electrostatic attraction between oppositely charged ions formed by the transfer of one or more electrons.'
      },
      {
        term: 'Covalent Bond',
        definition: 'A chemical bond formed when a pair of electrons is shared between two non-metal atoms.'
      }
    ],
    examinerWarnings: [
      'When explaining why simple molecular substances have low boiling points, NEVER say "covalent bonds are weak"! Covalent bonds are very strong; it is the weak INTERMOLECULAR FORCES between molecules that require little energy to break.',
      'Ionic compounds conduct electricity with mobile IONS, never electrons!'
    ]
  },
  {
    id: 'rev-chem-electrolysis',
    subjectId: 'cie-chem-0620',
    chapter: 'Electrochemistry',
    title: 'Electrolysis of Molten & Aqueous Solutions',
    keyConcepts: [
      {
        heading: 'Predicting Products at Electrodes',
        points: [
          'Cathode (-) attracts cations: In aqueous solution, H⁺ is discharged as H₂(g) UNLESS a less reactive metal is present (Cu, Ag, Au).',
          'Anode (+) attracts anions: In concentrated solution, halide ions (Cl⁻, Br⁻, I⁻) are discharged as halogen gas. If dilute or sulfate/nitrate, OH⁻ is discharged as O₂(g) (4OH⁻ -> O₂ + 2H₂O + 4e⁻).',
          'Molten Lead(II) Bromide: Cathode forms molten lead drops (Pb²⁺ + 2e⁻ -> Pb); Anode forms brown bromine fumes (2Br⁻ -> Br₂ + 2e⁻).',
          'Brine (concentrated NaCl(aq)): Cathode forms H₂ gas; Anode forms Cl₂ gas; solution becomes strongly alkaline NaOH(aq).'
        ],
        formula: '\\text{PANIC: Positive Anode, Negative Is Cathode}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Electrolysis',
        definition: 'The chemical decomposition of an ionic compound, either in molten state or in aqueous solution, by the passage of an electric current.'
      },
      {
        term: 'Electrolyte',
        definition: 'A molten ionic compound or an aqueous solution containing mobile ions that conducts electricity.'
      }
    ],
    examinerWarnings: [
      'Sodium metal is NEVER produced in the electrolysis of aqueous sodium chloride because hydrogen ions (H⁺) are more easily discharged than sodium ions.',
      'Always balance electrons in half-equations: remember diatomic gases (H₂, Cl₂, O₂, Br₂).'
    ]
  },
  {
    id: 'rev-chem-rates',
    subjectId: 'cie-chem-0620',
    chapter: 'Physical Chemistry',
    title: 'Reaction Rates, Collision Theory & Equilibrium',
    keyConcepts: [
      {
        heading: 'The 5 Factors Affecting Reaction Rate',
        points: [
          '1. Temperature: Increases kinetic energy so particles move faster, increasing collision frequency. Crucially, a much higher proportion of particles possess energy ≥ activation energy (Ea).',
          '2. Concentration / Pressure: More particles per unit volume, crowded closer together -> higher frequency of successful collisions.',
          '3. Surface Area: Smaller solid particles expose more reactant particles to collisions -> higher collision frequency.',
          '4. Catalyst: Provides an alternative reaction pathway with a lower activation energy (Ea) without being used up chemically.'
        ],
        formula: '\\text{Rate} = \\frac{\\Delta \\text{Amount}}{\\Delta t}'
      },
      {
        heading: 'Reversible Reactions & Le Chatelier\'s Principle',
        points: [
          'Dynamic Equilibrium: Rate of forward reaction equals rate of reverse reaction, and concentrations of reactants and products remain constant in a closed system.',
          'Temperature: Increasing temperature shifts equilibrium in the endothermic direction (+ΔH).',
          'Pressure: Increasing pressure shifts equilibrium towards the side with fewer gas moles.',
          'Haber Process: N₂ + 3H₂ ⇌ 2NH₃ (ΔH = -92 kJ/mol). Industrial conditions: 450°C, 200 atm, Iron catalyst.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Activation Energy (Ea)',
        definition: 'The minimum amount of energy colliding particles must possess in order for a chemical reaction to take place.'
      },
      {
        term: 'Dynamic Equilibrium',
        definition: 'A state in a closed system where the rates of the forward and reverse reactions are equal, and reactant/product concentrations stay constant.'
      }
    ],
    examinerWarnings: [
      'Never write "there are more collisions". You must write "higher frequency of collisions" or "more collisions per unit time / per second".',
      'A catalyst does NOT change equilibrium yield; it only speeds up reaching equilibrium.'
    ]
  },

  // ==========================================================
  // PHYSICS (CIE 0625 & EDEXCEL 4PH1)
  // ==========================================================
  {
    id: 'rev-phys-forces',
    subjectId: 'cie-physics-0625',
    chapter: 'General Physics',
    title: 'Forces, Motion, Momentum & Terminal Velocity',
    keyConcepts: [
      {
        heading: 'Kinematics & Newton\'s Laws',
        points: [
          'Velocity-Time Graphs: Slope (gradient) = Acceleration. Total Area under graph = Distance travelled.',
          'Newton\'s 1st Law: An object continues at constant velocity unless acted upon by a resultant force.',
          'Newton\'s 2nd Law: F = m × a. Resultant force causes acceleration in the direction of the force.',
          'Momentum: p = m × v. Total momentum is conserved in collisions in an isolated system.',
          'Terminal Velocity: Falling body accelerates until upward air resistance equals downward weight. Resultant force = 0 -> acceleration = 0 -> constant terminal velocity.'
        ],
        formula: 'F = ma, \\quad p = mv, \\quad \\text{Impulse} = F\\Delta t = \\Delta p'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Acceleration',
        definition: 'The rate of change of velocity per unit time: a = (v - u) / t (measured in m/s²).'
      },
      {
        term: 'Terminal Velocity',
        definition: 'The constant maximum velocity reached by a falling object when the upward resistive force equals the downward gravitational force (zero resultant force).'
      }
    ],
    examinerWarnings: [
      'Distinguish mass (scalar quantity of matter, kg) from weight (gravitational force, W = mg, Newtons). Mass never changes on other planets!',
      'When calculating distance from a velocity-time graph, divide the area into rectangles and triangles.'
    ]
  },
  {
    id: 'rev-phys-circuits',
    subjectId: 'cie-physics-0625',
    chapter: 'Electricity and Magnetism',
    title: 'Circuits, Ohm\'s Law, Potential Dividers & Transformers',
    keyConcepts: [
      {
        heading: 'Circuit Rules & Components',
        points: [
          'Current (I = Q/t, Amps): Series current is identical everywhere. Parallel current divides across branches.',
          'Voltage (V = W/Q, Volts): Series voltage is shared across components. Parallel voltage across each branch equals source voltage.',
          'Resistance: Series R_total = R₁ + R₂. Parallel 1/R_total = 1/R₁ + 1/R₂.',
          'Sensors: LDR resistance decreases in light. Thermistor resistance decreases when temperature increases (TURD rule).',
          'Transformers: Vp / Vs = Np / Ns = Is / Ip. Power transmission at high voltage minimizes I²R heat losses.'
        ],
        formula: 'V = IR, \\quad P = IV = I^2R, \\quad \\frac{V_p}{V_s} = \\frac{N_p}{N_s}'
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
      'Ammeters are connected in SERIES (low resistance); voltmeters are connected in PARALLEL (high resistance).',
      'In transformer questions, convert kV to Volts (×10³) and MW to Watts (×10⁶) before calculating.'
    ]
  },

  // ==========================================================
  // BIOLOGY (CIE 0610 & EDEXCEL 4BI1)
  // ==========================================================
  {
    id: 'rev-bio-cells',
    subjectId: 'cie-bio-0610',
    chapter: 'Cell Biology & Movement',
    title: 'Cell Structure, Diffusion, Osmosis & Active Transport',
    keyConcepts: [
      {
        heading: 'Transport Mechanisms',
        points: [
          'Diffusion: Passive net movement of particles from high to low concentration down a concentration gradient.',
          'Osmosis: Passive net movement of water molecules from high water potential (dilute) to low water potential (concentrated) through a partially permeable membrane.',
          'Active Transport: Movement of particles across a cell membrane against a concentration gradient using energy from respiration and carrier proteins.',
          'Plant Cell in pure water: Becomes turgid (cell wall prevents bursting). In concentrated solution: Becomes flaccid / plasmolysed.',
          'Animal Cell in pure water: Swells and bursts (lysis) due to absence of cell wall.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Osmosis',
        definition: 'The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.'
      },
      {
        term: 'Active Transport',
        definition: 'The movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration using energy from respiration.'
      }
    ],
    examinerWarnings: [
      'Do not say "water moves from low concentration of water to high concentration". Always use "higher water potential to lower water potential".',
      'Enzymes are protein molecules that denature at high temperatures; they never "die".'
    ]
  },

  // ==========================================================
  // ENGLISH AS A SECOND LANGUAGE (CIE 0510 / EDEXCEL 4ES1)
  // ==========================================================
  {
    id: 'rev-esl-all',
    subjectId: 'cie-esl-0510',
    chapter: 'Reading and Writing Paper (Exercises 1-6)',
    title: 'Complete Exam Guide: Summary, Informal Email & Formal Article',
    keyConcepts: [
      {
        heading: 'Exercise 4: Summary Writing (100-120 words)',
        points: [
          'Underline the two demanded aspects (e.g. positive impacts AND challenges).',
          'Find 4 distinct points for Aspect 1 and 4 points for Aspect 2 in the reading text.',
          'Paraphrase vocabulary and change grammatical structures to avoid copying whole clauses (lifting).',
          'Use formal cohesive linkers: Furthermore, Moreover, Conversely, In addition, Consequently.',
          'Keep word count strictly between 100 and 120 words. Writing 121+ words incurs an immediate penalty!'
        ]
      },
      {
        heading: 'Exercise 5: Informal Email to a Friend (120-160 words)',
        points: [
          'Friendly opening greeting ("Dear Mark,", "Hi Sarah!").',
          'Apology for not writing sooner + casual idiom ("I\'ve been swamped with revision!").',
          'Cover all three bullet points from the prompt in balanced detail.',
          'Use contractions ("I\'m", "didn\'t", "you\'ll") to demonstrate authentic informal register.',
          'Warm sign-off ("Can\'t wait to catch up! Best wishes,").'
        ]
      },
      {
        heading: 'Exercise 6: Formal School Magazine Article or Report (120-160 words)',
        points: [
          'Catchy, creative title/headline.',
          'Engaging introduction using a rhetorical question ("Have you ever wondered...?").',
          'Formal tone: NO slang, NO abbreviations, NO contractions (write "do not", not "don\'t").',
          'Advanced vocabulary: paramount, detrimental, indispensable, substantial.',
          'Assertive conclusion with recommendations.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Paraphrasing',
        definition: 'Expressing the meaning of the written text using different words and grammatical constructions while preserving the original meaning.'
      },
      {
        term: 'Register',
        definition: 'The tone, formality, and language chosen to match a specific audience and context.'
      }
    ],
    examinerWarnings: [
      'Never use bullet points in Exercise 4 Summary; it must be written as a continuous prose paragraph.',
      'In Exercise 5, if you miss even one of the three bullet points, your content mark is capped at 4/8.'
    ]
  },

  // ==========================================================
  // MATHEMATICS (CIE 0580 & EDEXCEL 4MA1)
  // ==========================================================
  {
    id: 'rev-math-geometry',
    subjectId: 'cie-math-0580',
    chapter: 'Geometry, Measure & Trigonometry',
    title: 'Circle Theorems, Trigonometry & Mensuration Guide',
    keyConcepts: [
      {
        heading: 'The 7 Circle Theorems & Exact Reasons',
        points: [
          '1. Angle in a semicircle is a right angle (90°).',
          '2. Angle at centre is TWICE angle at circumference subtended by the same arc.',
          '3. Angles in the same segment subtended by the same arc are equal ("bow-tie rule").',
          '4. Opposite angles of a cyclic quadrilateral add up to 180°.',
          '5. Angle between a radius and a tangent is 90°.',
          '6. Tangents from an external point to a circle are equal in length.',
          '7. Alternate Segment Theorem: Angle between tangent and chord equals the angle in the alternate segment.'
        ]
      },
      {
        heading: 'Trigonometry & Non-Right-Angled Triangles',
        points: [
          'Right-angled: SOH CAH TOA (sin θ = Opp/Hyp, cos θ = Adj/Hyp, tan θ = Opp/Adj).',
          'Sine Rule: a / sin(A) = b / sin(B) = c / sin(C). Used when an opposite pair is known.',
          'Cosine Rule: a² = b² + c² - 2bc cos(A). Used for SAS (two sides and included angle) or SSS (finding an angle).',
          'Triangle Area: Area = 1/2 ab sin(C).'
        ],
        formula: 'a^2 = b^2 + c^2 - 2bc\\cos(A)'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Cyclic Quadrilateral',
        definition: 'A four-sided polygon where all four vertices lie on the circumference of the same circle.'
      },
      {
        term: 'Alternate Segment Theorem',
        definition: 'The theorem stating that the angle between a tangent and a chord through the point of contact equals the angle subtended by the chord in the alternate segment.'
      }
    ],
    examinerWarnings: [
      'You must state the theorem reason in words to earn the B1 mark (e.g. "angle at centre is twice angle at circumference").',
      'Make sure your scientific calculator is set to DEGREES (DEG), not RADIANS (RAD).'
    ]
  },

  // ==========================================================
  // MORE CHEMISTRY REVISION GUIDES
  // ==========================================================
  {
    id: 'rev-chem-acids-salts',
    subjectId: 'cie-chem-0620',
    chapter: 'Acids, Bases and Salts & Qualitative Analysis',
    title: 'Acids, Bases, Salt Preparation & Cation/Anion Tests',
    keyConcepts: [
      {
        heading: 'Salts Solubility Rules & Preparation Methods',
        points: [
          'Solubility: All nitrates and group 1 salts are SOLUBLE. All chlorides are soluble EXCEPT Silver (AgCl) and Lead (PbCl₂). All sulfates are soluble EXCEPT Barium (BaSO₄), Lead (PbSO₄), and Calcium (CaSO₄). All carbonates and hydroxides are INSOLUBLE except Group 1 and ammonium.',
          'Method 1: Acid + Insoluble Base/Carbonate/Metal (e.g. preparing CuSO₄ from CuO and H₂SO₄): Add excess insoluble base, warm gently, filter out excess unreacted solid, heat filtrate to point of crystallisation, cool to form crystals, filter and pat dry with filter paper.',
          'Method 2: Acid + Soluble Alkali Titration (e.g. preparing NaCl from NaOH and HCl): Use indicator (phenolphthalein or methyl orange) to determine exact volume required. Repeat without indicator using identical volumes, evaporate to crystallisation.',
          'Method 3: Precipitation (for insoluble salts like BaSO₄ or AgCl): Mix two soluble salt solutions, filter the precipitate, wash residue with distilled water, dry in oven.'
        ]
      },
      {
        heading: 'Compulsory Ion Tests (Qualitative Analysis)',
        points: [
          'Cations (Aqueous NaOH and Aqueous NH₃): Cu²⁺ gives light blue precipitate (soluble in excess NH₃ giving dark royal blue solution); Fe²⁺ gives dirty green precipitate (insoluble in excess); Fe³⁺ gives red-brown precipitate (insoluble in excess); Zn²⁺ gives white precipitate soluble in excess of both NaOH and NH₃ (amphoteric); Al³⁺ gives white precipitate soluble in excess NaOH but INSOLUBLE in excess NH₃; Ca²⁺ gives white precipitate insoluble in excess NaOH and no precipitate with NH₃.',
          'Anions: Carbonate (CO₃²⁻): Add dilute acid -> effervescence of CO₂ (turns limewater milky); Chloride (Cl⁻): Add dilute HNO₃ then AgNO₃ -> white precipitate; Iodide (I⁻): Add dilute HNO₃ then AgNO₃ -> yellow precipitate; Sulfate (SO₄²⁻): Add dilute HNO₃ then Ba(NO₃)₂ -> white precipitate; Nitrate (NO₃⁻): Add aqueous NaOH and aluminium foil, warm gently -> pungent ammonia gas (turns red litmus blue).'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Acid',
        definition: 'A proton (H⁺ ion) donor that dissociates in aqueous solution to produce H⁺(aq) ions.'
      },
      {
        term: 'Base',
        definition: 'A proton (H⁺ ion) acceptor that reacts with an acid to form a salt and water only.'
      }
    ],
    examinerWarnings: [
      'Always specify "dilute nitric acid before silver nitrate" in halide tests. Adding hydrochloric acid would introduce chloride ions, giving a false positive!',
      'When testing gases with litmus, the litmus paper MUST be damp.'
    ]
  },
  {
    id: 'rev-chem-organic',
    subjectId: 'cie-chem-0620',
    chapter: 'Organic Chemistry & Polymers',
    title: 'Hydrocarbons, Alkenes, Addition Reactions & Polymerisation',
    keyConcepts: [
      {
        heading: 'Alkanes vs Alkenes & Catalytic Cracking',
        points: [
          'Alkanes (CnH2n+2): Saturated hydrocarbons with C-C single bonds only. Generally unreactive except for combustion and photochemical substitution with chlorine (UV light required to break Cl-Cl bond via free radicals).',
          'Alkenes (CnH2n): Unsaturated hydrocarbons containing a C=C double bond. Readily undergo addition reactions:',
          '1. Bromine water test: Decolourises from orange/brown to colourless immediately (test for unsaturation / C=C double bond).',
          '2. Hydration: Alkene + steam (300°C, 60 atm, H₃PO₄ catalyst) -> Alcohol.',
          '3. Hydrogenation: Alkene + H₂ (nickel catalyst, 150°C) -> Alkane (used to make margarine).',
          'Cracking: Long-chain alkanes broken down into shorter, more useful alkanes and alkenes using high temperature (550°C-600°C) and aluminium oxide (Al₂O₃) / silica catalyst.'
        ]
      },
      {
        heading: 'Addition vs Condensation Polymerisation',
        points: [
          'Addition Polymerisation: High pressure and catalyst open the C=C double bond of alkene monomers (e.g. ethene -> poly(ethene)). Only ONE product is formed; polymer repeating unit has the same empirical formula as monomer.',
          'Condensation Polymerisation: Monomers with two functional groups react to form a polymer chain while eliminating a small molecule (usually H₂O). E.g. Nylon (polyamide from diamine + dicarboxylic acid) and Terylene (polyester from diol + dicarboxylic acid).'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Homologous Series',
        definition: 'A family of organic compounds with the same functional group, same general formula, similar chemical properties, and a trend in physical properties differing by -CH₂-.'
      },
      {
        term: 'Hydrocarbon',
        definition: 'A compound containing carbon and hydrogen atoms ONLY.'
      }
    ],
    examinerWarnings: [
      'Never say "bromine water turns clear"! "Clear" means transparent. You must say "orange to colourless".',
      'When drawing repeating units of polymers, remember open bonds at both ends extending through the brackets and do NOT draw double bonds inside the bracket.'
    ]
  },

  // ==========================================================
  // MORE PHYSICS REVISION GUIDES
  // ==========================================================
  {
    id: 'rev-phys-waves',
    subjectId: 'cie-physics-0625',
    chapter: 'Waves, Light & Sound',
    title: 'Transverse & Longitudinal Waves, Snell\'s Law & EM Spectrum',
    keyConcepts: [
      {
        heading: 'Wave Nature & Snell\'s Law',
        points: [
          'Transverse Waves: Oscillations are perpendicular (90°) to the direction of energy transfer (e.g. light, water waves, all electromagnetic waves).',
          'Longitudinal Waves: Oscillations are parallel to the direction of energy transfer, consisting of compressions (high pressure/density) and rarefactions (e.g. sound waves).',
          'Snell\'s Law of Refraction: n = sin(i) / sin(r) = c / v. Refractive index is constant for a given boundary. When moving from optically less dense (air) to denser (glass), the ray bends TOWARDS the normal.',
          'Total Internal Reflection (TIR): Occurs ONLY when light travels from an optically denser medium towards a less dense medium AND the angle of incidence is greater than the critical angle: sin(c) = 1 / n.'
        ],
        formula: 'v = f \\lambda, \\quad n = \\frac{\\sin(i)}{\\sin(r)} = \\frac{1}{\\sin(c)}'
      },
      {
        heading: 'The Electromagnetic (EM) Spectrum',
        points: [
          'Order from Longest Wavelength / Lowest Frequency to Shortest Wavelength / Highest Frequency: Radio waves -> Microwaves -> Infrared -> Visible Light -> Ultraviolet -> X-rays -> Gamma rays.',
          'All EM waves travel at the speed of light in a vacuum: c = 3.0 × 10⁸ m/s.',
          'Harmful ionizing effects: UV damages skin cells and causes cataracts; X-rays and Gamma rays cause DNA gene mutations leading to cancer.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Critical Angle',
        definition: 'The angle of incidence in the optically denser medium for which the angle of refraction in the less dense medium is 90°.'
      },
      {
        term: 'Refraction',
        definition: 'The change in direction of a wave due to a change in its speed as it passes from one medium to another.'
      }
    ],
    examinerWarnings: [
      'Angles of incidence and refraction are ALWAYS measured between the ray and the NORMAL (the 90° dotted line), never to the surface!',
      'When a wave enters a denser medium and slows down, its frequency (f) remains unchanged; its wavelength (λ) decreases.'
    ]
  },

  // ==========================================================
  // MORE BIOLOGY REVISION GUIDES
  // ==========================================================
  {
    id: 'rev-bio-nutrition',
    subjectId: 'cie-bio-0610',
    chapter: 'Plant & Human Nutrition',
    title: 'Photosynthesis, Leaf Structure & Enzyme Kinetics',
    keyConcepts: [
      {
        heading: 'Photosynthesis & Leaf Adaptations',
        points: [
          'Balanced Equation: 6CO₂ + 6H₂O -> C₆H₁₂O₆ + 6O₂ (using chlorophyll and light energy).',
          'Cuticle: Waxy waterproof layer preventing excessive water evaporation.',
          'Upper Epidermis: Transparent thin cells allowing light to reach chloroplasts below.',
          'Palisade Mesophyll: Packed with numerous chloroplasts, oriented vertically near the top surface to maximize sunlight absorption.',
          'Spongy Mesophyll: Loose arrangement with large air spaces providing high surface area for rapid gas exchange (CO₂ in, O₂ out).',
          'Stomata & Guard Cells: Guard cells swell (turgid) in light to open stomatal pores for CO₂ diffusion, and close (flaccid) in darkness/drought to prevent dehydration.'
        ],
        formula: '6CO_2 + 6H_2O \\xrightarrow{\\text{light, chlorophyll}} C_6H_{12}O_6 + 6O_2'
      },
      {
        heading: 'Enzymes & Lock-and-Key Mechanism',
        points: [
          'Enzymes are biological catalysts (globular proteins) that speed up metabolic reactions without being consumed.',
          'Active site is complementary in shape to its specific substrate.',
          'Effect of Temperature: Below optimum, low kinetic energy leads to low collision frequency. Above optimum, thermal agitation breaks hydrogen and ionic bonds, distorting the active site permanently (denaturation).',
          'Effect of pH: Extreme pH alters ionic charges on amino acid residues in the active site, disrupting binding and causing denaturation.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Enzyme',
        definition: 'A biological catalyst that increases the rate of a chemical reaction without being changed or used up in the process.'
      },
      {
        term: 'Denaturation',
        definition: 'The permanent loss of an enzyme\'s 3D tertiary protein structure and active site shape, preventing substrate binding.'
      }
    ],
    examinerWarnings: [
      'Enzymes are molecules, not living organisms! They NEVER "die" or get "killed"; they become denatured.',
      'Always refer to the substrate being "complementary" in shape to the active site, not "identical".'
    ]
  },

  // ==========================================================
  // COMPUTER SCIENCE REVISION GUIDE
  // ==========================================================
  {
    id: 'rev-cs-architecture',
    subjectId: 'cie-cs-0478',
    chapter: 'Computer Systems & Architecture',
    title: 'Von Neumann Architecture, Fetch-Decode-Execute & Logic Gates',
    keyConcepts: [
      {
        heading: 'Von Neumann Architecture & Register Actions',
        points: [
          'Key principle: Data and instructions are stored together in the same memory address space (RAM).',
          'Fetch: Program Counter (PC) contains the address of the next instruction. Address copied to MAR via address bus. Instruction at that RAM address copied to MDR via data bus. PC increments by 1. Instruction copied from MDR to CIR.',
          'Decode: Control Unit (CU) splits and interprets the instruction into opcode and operand.',
          'Execute: ALU carries out arithmetic or logical operations, results written to Accumulator (ACC) or RAM.',
          'Buses: Address bus (unidirectional), Data bus (bidirectional), Control bus (carries timing and control signals).'
        ]
      },
      {
        heading: 'Logic Gates & Truth Tables',
        points: [
          'NOT gate: Inverts input (A -> NOT A).',
          'AND gate: Output 1 only if BOTH inputs are 1 (A AND B).',
          'OR gate: Output 1 if AT LEAST ONE input is 1 (A OR B).',
          'NAND gate: Inverse of AND (NOT (A AND B)). Output 0 only if both inputs are 1.',
          'NOR gate: Inverse of OR (NOT (A OR B)). Output 1 only if both inputs are 0.',
          'XOR gate: Output 1 if inputs are DIFFERENT (0,1 or 1,0).'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Von Neumann Architecture',
        definition: 'A theoretical computer design architecture where program instructions and data share the same read-write memory unit and buses.'
      },
      {
        term: 'Register',
        definition: 'A high-speed, temporary internal storage location situated directly inside the central processing unit (CPU).'
      }
    ],
    examinerWarnings: [
      'Address bus is strictly unidirectional; drawing double-ended arrows on CPU memory diagrams is an immediate mark deduction.',
      'Do not confuse MAR and MDR: MAR holds the ADDRESS (location), MDR holds the DATA/INSTRUCTION (contents).'
    ]
  },

  // ==========================================================
  // ECONOMICS REVISION GUIDE
  // ==========================================================
  {
    id: 'rev-econ-markets',
    subjectId: 'cie-econ-0455',
    chapter: 'Microeconomics & Price Mechanism',
    title: 'Demand, Supply, Price Elasticity & Market Equilibrium',
    keyConcepts: [
      {
        heading: 'The Price Mechanism & Elasticity Analysis',
        points: [
          'Law of Demand: Inverse relationship between price and quantity demanded. Shift factors: disposable income, advertising, consumer tastes, price of complements/substitutes.',
          'Law of Supply: Direct relationship between price and quantity supplied. Shift factors: cost of production, technology, government subsidies, indirect taxes, weather (agriculture).',
          'Market Equilibrium: Point where demand intersects supply (clearing price). Excess demand (shortage) puts upward pressure on prices; excess supply (surplus) causes downward price pressure.',
          'Price Elasticity of Demand (PED): %ΔQD / %ΔP. Inelastic (|PED| < 1): necessity, few substitutes, low % of income; Elastic (|PED| > 1): luxuries, many substitutes available.'
        ],
        formula: '\\text{PED} = \\frac{\\% \\Delta \\text{ Quantity Demanded}}{\\% \\Delta \\text{ Price}}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Opportunity Cost',
        definition: 'The next best alternative forgone when making an economic decision.'
      },
      {
        term: 'Market Failure',
        definition: 'A situation where the free market mechanism allocates scarce resources inefficiently, leading to a net loss of economic welfare.'
      }
    ],
    examinerWarnings: [
      'Distinguish clearly between a "movement along" a demand curve (caused strictly by change in price) and a "shift" of the curve (caused by non-price factors).',
      'Always label equilibrium price (P₁) and equilibrium quantity (Q₁) with dashed lines to both axes.'
    ]
  }
];
