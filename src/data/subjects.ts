import { Subject, CommandWord } from '../types';

const BASE_SUBJECTS: Subject[] = [
  // Languages (including English as a Second Language!)
  {
    id: 'cie-esl-0510',
    name: 'English as a Second Language',
    code: 'CIE 0510 / 0511',
    board: 'CIE',
    category: 'Languages',
    icon: 'Languages',
    color: '#06b6d4', // cyan
    topics: [
      'Exercise 1: Reading Comprehension & Factual Scan',
      'Exercise 2: Multiple Matching (Opinions & Attitudes)',
      'Exercise 3: Note-Taking Skills & Subheadings',
      'Exercise 4: Summary Writing (100-120 words, Own Words & Linkers)',
      'Exercise 5: Informal Email / Letter Writing (Friendly Register)',
      'Exercise 6: Formal School Magazine Article Writing',
      'Exercise 6: Formal Report & Review Writing',
      'Listening Comprehension (Conversations, Interviews & Talks)',
      'Key Connectives, Transition Words & Advanced Vocabulary'
    ]
  },
  {
    id: 'edx-esl-4es1',
    name: 'English as a Second Language',
    code: 'Edexcel 4ES1',
    board: 'Edexcel',
    category: 'Languages',
    icon: 'Languages',
    color: '#0891b2',
    topics: [
      'Paper 1 Part 1: Factual Text Comprehension',
      'Paper 1 Part 2: Multiple Matching and Synthesis',
      'Paper 1 Part 3: Note-taking & Form Filling',
      'Paper 1 Part 4: Summary Writing with Paraphrasing',
      'Paper 1 Part 5: Extended Writing (Article, Report, Email)',
      'Paper 2: Listening Comprehension Skills'
    ]
  },
  {
    id: 'cie-eng-0500',
    name: 'English First Language',
    code: 'CIE 0500',
    board: 'CIE',
    category: 'Languages',
    icon: 'BookOpen',
    color: '#14b8a6', // teal
    topics: [
      'Paper 1 Reading: Comprehension & Summary Skills',
      'Paper 1 Reading: Writer’s Effect & Language Analysis',
      'Paper 1 Reading: Extended Response to Reading',
      'Paper 2 Directed Writing: Speech, Letter, Article',
      'Paper 2 Composition: Descriptive Writing Techniques',
      'Paper 2 Composition: Narrative Writing & Structure'
    ]
  },
  {
    id: 'oxf-eng-9270',
    name: 'English Language',
    code: 'OxfordAQA 9270',
    board: 'OxfordAQA',
    category: 'Languages',
    icon: 'BookOpen',
    color: '#8b5cf6', // purple
    topics: [
      'Paper 1 Section A: Literary Non-Fiction Reading Comprehension',
      'Paper 1 Section B: Composition & Creative Descriptive/Narrative Writing',
      'Paper 2 Section A: Source-based Reading Analysis & Comparative Synthesis',
      'Paper 2 Section B: Directed Writing (Articles, Speeches, Letters & Opinions)',
      'Spoken Language Endorsement: Speaking & Listening Presentation Skills'
    ]
  },
  {
    id: 'oxf-lit-9275',
    name: 'English Literature',
    code: 'OxfordAQA 9275',
    board: 'OxfordAQA',
    category: 'Languages',
    icon: 'Bookmark',
    color: '#7c3aed', // deep purple
    topics: [
      'Paper 1 Section A: Shakespeare Play Literary & Thematic Analysis',
      'Paper 1 Section B: 19th-Century Novel & Characterisation',
      'Paper 2 Section A: Modern Drama (Social Context, Themes & Dramatic Craft)',
      'Paper 2 Section B: Poetry Anthology (Thematic Comparison & Form)',
      'Paper 2 Section C: Unseen Poetry Critical Interpretation & Technique'
    ]
  },
  {
    id: 'oxf-esl-9280',
    name: 'English as a Second Language',
    code: 'OxfordAQA 9280',
    board: 'OxfordAQA',
    category: 'Languages',
    icon: 'Languages',
    color: '#a855f7', // violet
    topics: [
      'Paper 1: Reading for Factual Detail, Gist & Inference across Varied Texts',
      'Paper 2: Writing (Informative Reports, Formal Reviews & Persuasive Essays)',
      'Paper 3: Listening Comprehension (Dialogues, Monologues & News Broadcasts)',
      'Paper 4: Spoken Interaction (Structured Discussion, Pronunciation & Fluency)'
    ]
  },

  // Mathematics
  {
    id: 'cie-math-0580',
    name: 'Mathematics',
    code: 'CIE 0580',
    board: 'CIE',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#3b82f6', // blue
    topics: [
      'Number & Standard Form',
      'Algebra & Sequences',
      'Quadratics & Factoring',
      'Functions & Graphs',
      'Coordinate Geometry',
      'Trigonometry (SOHCAHTOA & Sine/Cosine Rule)',
      'Vectors & Transformations',
      'Circle Theorems',
      'Mensuration (Perimeter, Area & Volume)',
      'Probability & Venn Diagrams',
      'Statistics & Cumulative Frequency'
    ]
  },
  {
    id: 'edx-math-4ma1',
    name: 'Mathematics A',
    code: 'Edexcel 4MA1',
    board: 'Edexcel',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#2563eb',
    topics: [
      'Number and the Number System',
      'Equations, Formulae and Identities',
      'Sequences, Functions and Graphs',
      'Geometry and Trigonometry',
      'Vectors and Transformation Geometry',
      'Statistics and Probability',
      'Calculus (Differentiation basics)'
    ]
  },
  {
    id: 'edx-math-4mb1',
    name: 'Mathematics B',
    code: 'Edexcel 4MB1',
    board: 'Edexcel',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#1d4ed8',
    topics: [
      'Number and Sets',
      'Algebra, Equations & Inequalities',
      'Matrices and Determinants',
      'Geometry, Polygons & Circle Theorems',
      'Trigonometry and Bearings',
      'Vectors in 2 Dimensions',
      'Probability, Tree Diagrams and Venns',
      'Elementary Calculus & Rates of Change'
    ]
  },
  {
    id: 'cie-addmath-0606',
    name: 'Additional Mathematics',
    code: 'CIE 0606',
    board: 'CIE',
    category: 'Mathematics',
    icon: 'Binary',
    color: '#6366f1', // indigo
    topics: [
      'Functions & Quadratic Expressions',
      'Simultaneous Equations & Logarithms',
      'Straight Line Graphs & Coordinate Geometry',
      'Circular Measure (Radians)',
      'Trigonometry & Identities',
      'Permutations and Combinations',
      'Binomial Expansions',
      'Vectors in 2 Dimensions',
      'Differentiation & Rates of Change',
      'Integration & Kinematics'
    ]
  },

  // Sciences
  {
    id: 'cie-physics-0625',
    name: 'Physics',
    code: 'CIE 0625',
    board: 'CIE',
    category: 'Sciences',
    icon: 'Zap',
    color: '#eab308', // amber
    topics: [
      'Motion, Forces & Energy (Kinematics & Newton Laws)',
      'Thermal Physics (States of Matter & Heat Transfer)',
      'Waves (Light, Sound, Reflection & Refraction)',
      'Electricity & Magnetism (Circuits & Induction)',
      'Nuclear Physics (Radioactivity & Half-life)',
      'Space Physics (Planets, Stars & Redshift)'
    ]
  },
  {
    id: 'edx-physics-4ph1',
    name: 'Physics',
    code: 'Edexcel 4PH1',
    board: 'Edexcel',
    category: 'Sciences',
    icon: 'Zap',
    color: '#f59e0b',
    topics: [
      'Forces and Motion',
      'Electricity & Mains Power',
      'Waves & Electromagnetic Spectrum',
      'Energy Resources and Transfers',
      'Solids, Liquids and Gases (Density & Pressure)',
      'Magnetism and Electromagnetism',
      'Radioactivity and Particles',
      'Astrophysics'
    ]
  },
  {
    id: 'cie-chem-0620',
    name: 'Chemistry',
    code: 'CIE 0620',
    board: 'CIE',
    category: 'Sciences',
    icon: 'FlaskConical',
    color: '#0284c7', // light blue
    topics: [
      'States of Matter & Diffusion',
      'Atoms, Elements and Compounds (Bonding & Lattice)',
      'Stoichiometry & Mole Calculations',
      'Electrochemistry & Electrolysis',
      'Chemical Energetics & Exothermic/Endothermic',
      'Chemical Reactions (Rates & Reversible / Haber)',
      'Acids, Bases and Salts',
      'The Periodic Table & Trends',
      'Metals & Extraction',
      'Organic Chemistry (Alkanes, Alkenes, Polymers)'
    ]
  },
  {
    id: 'edx-chem-4ch1',
    name: 'Chemistry',
    code: 'Edexcel 4CH1',
    board: 'Edexcel',
    category: 'Sciences',
    icon: 'FlaskConical',
    color: '#0891b2',
    topics: [
      'Principles of Chemistry',
      'Inorganic Chemistry (Halogens & Noble gases)',
      'Physical Chemistry (Energetics, Rates, Equilibria)',
      'Organic Chemistry (Alcohols, Carboxylic Acids)'
    ]
  },
  {
    id: 'cie-bio-0610',
    name: 'Biology',
    code: 'CIE 0610',
    board: 'CIE',
    category: 'Sciences',
    icon: 'Dna',
    color: '#10b981', // emerald
    topics: [
      'Characteristics & Classification of Living Organisms',
      'Cell Structure, Diffusion, Osmosis & Active Transport',
      'Biological Molecules & Enzymes',
      'Plant Nutrition & Photosynthesis',
      'Human Nutrition & Digestion',
      'Transport in Plants (Xylem & Phloem)',
      'Transport in Animals (Circulation & Heart)',
      'Gas Exchange, Respiration & Homeostasis',
      'Coordination, Nervous System & Hormones',
      'Reproduction & Genetics (Inheritance & Mitosis/Meiosis)',
      'Ecology, Biotechnology & Genetic Modification'
    ]
  },
  {
    id: 'edx-bio-4bi1',
    name: 'Biology',
    code: 'Edexcel 4BI1',
    board: 'Edexcel',
    category: 'Sciences',
    icon: 'Dna',
    color: '#059669',
    topics: [
      'The Nature and Variety of Living Organisms',
      'Structures and Functions in Living Organisms',
      'Reproduction and Inheritance (Selective breeding & Genetic modification)',
      'Ecology and the Environment (Nutrient cycles, Global warming)',
      'Use of Biological Resources (Food production, Fermentation)'
    ]
  },
  {
    id: 'cie-combined-sci-0653',
    name: 'Combined Science',
    code: 'CIE 0653 / 0654',
    board: 'CIE',
    category: 'Sciences',
    icon: 'Atom',
    color: '#059669',
    topics: [
      'Biology: Cells, Nutrition, Circulation, Respiration',
      'Chemistry: Atoms, Stoichiometry, Acids, Organic',
      'Physics: Forces, Energy, Thermal, Waves, Electricity'
    ]
  },

  // Tech & CS
  {
    id: 'cie-cs-0478',
    name: 'Computer Science',
    code: 'CIE 0478',
    board: 'CIE',
    category: 'Tech',
    icon: 'Cpu',
    color: '#8b5cf6', // purple
    topics: [
      'Data Representation (Binary, Hexadecimal, Sound & Images)',
      'Data Transmission (Packets, Encryption, Error checking)',
      'Hardware & Architecture (CPU, Von Neumann, Fetch-Decode-Execute)',
      'Software (Operating Systems, Compilers & Interpreters)',
      'The Internet & Cyber Security',
      'Automated & Emerging Technologies (AI & Robotics)',
      'Algorithm Design & Pseudocode',
      'Programming Concepts (Variables, Arrays, Functions)',
      'Databases & SQL',
      'Boolean Logic (Logic Gates & Truth Tables)'
    ]
  },
  {
    id: 'edx-cs-4cp0',
    name: 'Computer Science',
    code: 'Edexcel 4CP0',
    board: 'Edexcel',
    category: 'Tech',
    icon: 'Cpu',
    color: '#7c3aed',
    topics: [
      'Topic 1: Computational Thinking & Algorithms',
      'Topic 2: Data Representation (Binary, Hex, Sound, Images)',
      'Topic 3: Computer Systems, Hardware & Software',
      'Topic 4: Networks, Topologies & Cyber Security',
      'Topic 5: Environmental and Ethical Issues of Emerging Tech',
      'Topic 6: Practical Python Programming & Syntax'
    ]
  },

  // Humanities & Social Sciences
  {
    id: 'cie-history-0470',
    name: 'History',
    code: 'CIE 0470',
    board: 'CIE',
    category: 'Humanities',
    icon: 'Landmark',
    color: '#b45309', // amber/brown
    topics: [
      'Were the peace treaties of 1919-23 fair? (Versailles)',
      'To what extent was the League of Nations a success?',
      'How far was Hitler’s foreign policy to blame for war in 1939?',
      'Who was to blame for the Cold War? (1945-1949)',
      'How effectively did the USA contain communism? (Korea, Cuba, Vietnam)',
      'Depth Study: Germany 1918-1945 (Weimar & Nazi Rule)',
      'Source Analysis & Historical Interpretation Skills'
    ]
  },
  {
    id: 'cie-geography-0460',
    name: 'Geography',
    code: 'CIE 0460',
    board: 'CIE',
    category: 'Humanities',
    icon: 'Globe',
    color: '#0d9488', // teal
    topics: [
      'Theme 1: Population Dynamics & Overpopulation',
      'Theme 1: Migration Patterns & Urban Settlement',
      'Theme 2: Earthquakes and Volcanoes (Plate Tectonics)',
      'Theme 2: Rivers (Erosion, Deposition & Flooding)',
      'Theme 2: Coasts (Waves, Landforms & Management)',
      'Theme 2: Weather & Climate (Tropical Rainforests & Deserts)',
      'Theme 3: Development Indicators & Global Tourism',
      'Paper 2 & 4: Geographical Skills & Fieldwork Analysis'
    ]
  },
  {
    id: 'cie-sociology-0495',
    name: 'Sociology',
    code: 'CIE 0495',
    board: 'CIE',
    category: 'Humanities',
    icon: 'Users',
    color: '#d97706',
    topics: [
      'Unit 1: Theory and Methods (Positivism vs Interpretivism)',
      'Unit 2: Culture, Identity and Socialisation',
      'Unit 3: Social Stratification and Inequality (Class, Gender, Ethnicity)',
      'Unit 4: Family and Household Diversity',
      'Unit 5: Education and Achievement',
      'Unit 6: Crime, Deviance and Social Control'
    ]
  },
  {
    id: 'cie-environ-0680',
    name: 'Environmental Management',
    code: 'CIE 0680',
    board: 'CIE',
    category: 'Humanities',
    icon: 'Trees',
    color: '#15803d',
    topics: [
      'Rocks, Minerals and Their Exploitation',
      'Energy Resources (Fossil Fuels, Renewables & Nuclear)',
      'Agriculture and the Environment (Soil erosion, Food supply)',
      'Water Management (Hydrological cycle, Pollution, Treatment)',
      'Oceans and Fisheries Management',
      'Managing Natural Hazards (Cyclones, Earthquakes, Drought)'
    ]
  },

  // Business & Commercial
  {
    id: 'cie-econ-0455',
    name: 'Economics',
    code: 'CIE 0455',
    board: 'CIE',
    category: 'Commercial',
    icon: 'TrendingUp',
    color: '#f97316', // orange
    topics: [
      'The Basic Economic Problem (Scarcity & Opportunity Cost)',
      'The Allocation of Resources (Supply, Demand, Elasticity)',
      'Microeconomic Decision Makers (Consumers, Workers, Trade Unions)',
      'Government and the Macroeconomy (Inflation, GDP, Employment)',
      'Economic Development & Living Standards',
      'International Trade and Globalisation'
    ]
  },
  {
    id: 'edx-econ-4ec1',
    name: 'Economics',
    code: 'Edexcel 4EC1',
    board: 'Edexcel',
    category: 'Commercial',
    icon: 'TrendingUp',
    color: '#ea580c',
    topics: [
      'The Market System (Demand, Supply, Equilibrium price)',
      'Business Economics (Costs, Revenue, Profit, Market structures)',
      'Government and the Economy (Macro objectives, Fiscal & Monetary policy)',
      'The Global Economy (Trade, Exchange rates, Globalization)'
    ]
  },
  {
    id: 'cie-business-0450',
    name: 'Business Studies',
    code: 'CIE 0450',
    board: 'CIE',
    category: 'Commercial',
    icon: 'Briefcase',
    color: '#ec4899', // pink
    topics: [
      'Understanding Business Activity',
      'People in Business (Motivation & Organization)',
      'Marketing (4Ps, Market Research & Segmentation)',
      'Operations Management (Production Methods, Quality)',
      'Financial Information and Decisions (Cash Flow, Income Statement)',
      'External Influences on Business Activity'
    ]
  },
  {
    id: 'edx-bus-4bs1',
    name: 'Business',
    code: 'Edexcel 4BS1',
    board: 'Edexcel',
    category: 'Commercial',
    icon: 'Briefcase',
    color: '#db2777',
    topics: [
      'Business Activity and Influences on Business',
      'People in Business (Recruitment, Training, Motivation)',
      'Business Finance (Sources of finance, Break-even analysis)',
      'Marketing (Marketing mix, Market analysis)',
      'Business Operations (Economies of scale, Quality control)'
    ]
  },
  {
    id: 'cie-accounting-0452',
    name: 'Accounting',
    code: 'CIE 0452',
    board: 'CIE',
    level: 'O Level / IGCSE',
    category: 'Commercial',
    icon: 'Receipt',
    color: '#84cc16', // lime
    topics: [
      'The Fundamentals of Accounting & Double Entry System',
      'Sources and Recording of Business Transactions (Journals & Ledgers)',
      'Verification of Accounting Records (Trial Balance & Error Correction)',
      'Accounting Procedures (Depreciation & Accruals/Prepayments)',
      'Financial Statements (Income Statement & Statement of Financial Position)',
      'Interpretation and Ratio Analysis (Liquidity, Profitability, ROE)'
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // CAMBRIDGE (CIE) AS LEVEL SUBJECTS
  // ═════════════════════════════════════════════════════════════
  {
    id: 'cie-as-math-9709',
    name: 'Mathematics (AS Level)',
    code: 'CIE 9709 AS',
    board: 'CIE',
    level: 'AS Level',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#2563eb',
    topics: [
      'Pure Mathematics 1 (P1): Quadratics & Functions',
      'Pure Mathematics 1 (P1): Coordinate Geometry & Circles',
      'Pure Mathematics 1 (P1): Circular Measure (Radians)',
      'Pure Mathematics 1 (P1): Trigonometry & Identities',
      'Pure Mathematics 1 (P1): Series & Binomial Theorem',
      'Pure Mathematics 1 (P1): Differentiation & Tangents/Normals',
      'Pure Mathematics 1 (P1): Integration & Area Under Curves',
      'Mechanics (P4): Kinematics of Constant Acceleration',
      'Mechanics (P4): Newton Laws of Motion & Friction',
      'Mechanics (P4): Energy, Work & Power',
      'Probability & Statistics 1 (P5): Representation of Data',
      'Probability & Statistics 1 (P5): Permutations & Combinations',
      'Probability & Statistics 1 (P5): Probability & Binomial Distribution',
      'Probability & Statistics 1 (P5): The Normal Distribution'
    ]
  },
  {
    id: 'cie-as-physics-9702',
    name: 'Physics (AS Level)',
    code: 'CIE 9702 AS',
    board: 'CIE',
    level: 'AS Level',
    category: 'Sciences',
    icon: 'Zap',
    color: '#f59e0b',
    topics: [
      'Physical Quantities and Units (SI Base & Vector Resolution)',
      'Kinematics (Equations of Motion & Projectile Motion)',
      'Dynamics (Linear Momentum, Collisions & Newton Laws)',
      'Forces, Density & Pressure (Turning Effects & Archimedes)',
      'Work, Energy & Power (Conservation & Efficiency)',
      'Deformation of Solids (Hooke Law & Stress/Strain)',
      'Waves (Transverse, Longitudinal & Doppler Effect)',
      'Superposition (Stationary Waves, Diffraction & Interference)',
      'Electricity (Current, Potential Difference & Kirchhoff Laws)',
      'Particle Physics (Quarks, Leptons, Radioactive Decay & β-emission)'
    ]
  },
  {
    id: 'cie-as-chem-9701',
    name: 'Chemistry (AS Level)',
    code: 'CIE 9701 AS',
    board: 'CIE',
    level: 'AS Level',
    category: 'Sciences',
    icon: 'FlaskConical',
    color: '#0284c7',
    topics: [
      'Atoms, Molecules & Stoichiometry (Mole, Empirical Formula)',
      'Atomic Structure (Subshells, Ionisation Energies & Trends)',
      'Chemical Bonding (Shapes of Molecules, Hybridisation & Intermolecular)',
      'States of Matter (Ideal Gas Equation & Kinetic Theory)',
      'Chemical Energetics (Hess Law & Enthalpy Cycles)',
      'Electrochemistry & Redox Numbers',
      'Equilibria (Kc, Kp & Le Chatelier Principle)',
      'Reaction Kinetics (Collision Theory & Activation Energy)',
      'The Periodic Table: Period 3 Trends & Group 2/17',
      'Organic Chemistry: Hydrocarbons (Alkanes, Alkenes & Free Radicals)',
      'Halogenoalkanes (Nucleophilic Substitution SN1/SN2)',
      'Alcohols, Carbonyl Compounds & Carboxylic Acids'
    ]
  },
  {
    id: 'cie-as-bio-9700',
    name: 'Biology (AS Level)',
    code: 'CIE 9700 AS',
    board: 'CIE',
    level: 'AS Level',
    category: 'Sciences',
    icon: 'Dna',
    color: '#10b981',
    topics: [
      'Cell Structure (Electron Microscopy & Organelles)',
      'Biological Molecules (Carbohydrates, Lipids & Proteins)',
      'Enzymes (Kinetics, Vmax & Enzyme Inhibitors)',
      'Cell Membranes & Transport (Fluid Mosaic & Water Potential)',
      'The Mitotic Cell Cycle & Chromosome Replication',
      'Nucleic Acids & Protein Synthesis (DNA Replication & Translation)',
      'Transport in Plants (Transpiration Stream & Phloem Translocation)',
      'Transport in Mammals (Cardiac Cycle & Oxygen Dissociation)',
      'Gas Exchange and Smoking (Alveoli & Pathologies)',
      'Infectious Diseases & Immunity (Antibodies, B & T Lymphocytes)'
    ]
  },
  {
    id: 'cie-as-econ-9708',
    name: 'Economics (AS Level)',
    code: 'CIE 9708 AS',
    board: 'CIE',
    level: 'AS Level',
    category: 'Commercial',
    icon: 'TrendingUp',
    color: '#ea580c',
    topics: [
      'Basic Economic Ideas (PPC, Opportunity Cost & Resource Allocation)',
      'The Price System & Microeconomy (PED, PES, YED & XED)',
      'Government Microeconomic Intervention (Maximum/Minimum Prices, Taxes)',
      'The Macroeconomy (Circular Flow, Aggregate Demand & Aggregate Supply)',
      'Government Macroeconomic Policy (Inflation, Balance of Payments, Exchange Rates)'
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // CAMBRIDGE (CIE) A LEVEL SUBJECTS
  // ═════════════════════════════════════════════════════════════
  {
    id: 'cie-a2-math-9709',
    name: 'Mathematics (A Level / A2)',
    code: 'CIE 9709 A2',
    board: 'CIE',
    level: 'A Level',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#1d4ed8',
    topics: [
      'Pure Mathematics 3 (P3): Polynomials, Modulus & Logarithmic Functions',
      'Pure Mathematics 3 (P3): Trigonometric Identities (Double Angle & R-addition)',
      'Pure Mathematics 3 (P3): Advanced Differentiation (Product, Quotient, Implicit & Parametric)',
      'Pure Mathematics 3 (P3): Integration by Parts & Partial Fractions',
      'Pure Mathematics 3 (P3): Differential Equations & Real-world Models',
      'Pure Mathematics 3 (P3): Vectors in 3D (Vector Equations of Lines & Angles)',
      'Pure Mathematics 3 (P3): Complex Numbers (Argand Diagrams, Modulus-Argument & Roots)',
      'Probability & Statistics 2 (P6): Poisson Distribution',
      'Probability & Statistics 2 (P6): Linear Combinations of Random Variables',
      'Probability & Statistics 2 (P6): Continuous Random Variables',
      'Probability & Statistics 2 (P6): Hypothesis Testing (Normal & Poisson)'
    ]
  },
  {
    id: 'cie-a2-physics-9702',
    name: 'Physics (A Level / A2)',
    code: 'CIE 9702 A2',
    board: 'CIE',
    level: 'A Level',
    category: 'Sciences',
    icon: 'Zap',
    color: '#d97706',
    topics: [
      'Motion in a Circle (Centripetal Force & Angular Velocity)',
      'Gravitational Fields (Gravitational Potential & Orbital Motion)',
      'Ideal Gases (Gas Laws & Molecular Kinetic Theory)',
      'Thermodynamics (First Law & Specific Heat Capacity)',
      'Oscillations (Simple Harmonic Motion, Damping & Resonance)',
      'Electric Fields (Coulomb Law & Electric Potential)',
      'Capacitance (Dielectrics & Exponential Discharge)',
      'Magnetic Fields & Electromagnetic Induction (Faraday & Lenz Laws)',
      'Alternating Currents (Transformers & Rectification)',
      'Quantum Physics (Photons, Photoelectric Effect & De Broglie)',
      'Nuclear Physics (Mass Defect, Binding Energy & Radioactive Decay)',
      'Medical Physics (X-rays, Ultrasound & PET Scans)',
      'Astronomy & Cosmology (Standard Candles, Hubble Law & Big Bang)'
    ]
  },
  {
    id: 'cie-a2-chem-9701',
    name: 'Chemistry (A Level / A2)',
    code: 'CIE 9701 A2',
    board: 'CIE',
    level: 'A Level',
    category: 'Sciences',
    icon: 'FlaskConical',
    color: '#0369a1',
    topics: [
      'Chemical Energetics (Born-Haber Cycles, Lattice Energy & Entropy ΔS)',
      'Electrochemistry (Electrode Potentials E°, Nernst Equation & Fuel Cells)',
      'Equilibria (Buffer Solutions, Ksp Solubility Product & Partition Coefficients)',
      'Reaction Kinetics (Rate Equations, Half-Life & Arrhenius Equation)',
      'Transition Elements (Complex Ions, Ligand Exchange & Colorimetry)',
      'Organic Chemistry: Arenes & Benzene Electrophilic Substitution',
      'Carboxylic Acids Derivatives (Acyl Chlorides & Esters)',
      'Nitrogen Compounds (Amines, Amides & Amino Acids)',
      'Polymerisation (Addition & Condensation Polymers)',
      'Analytical Chemistry (NMR Spectroscopy & Chromatography)'
    ]
  },
  {
    id: 'cie-a2-bio-9700',
    name: 'Biology (A Level / A2)',
    code: 'CIE 9700 A2',
    board: 'CIE',
    level: 'A Level',
    category: 'Sciences',
    icon: 'Dna',
    color: '#059669',
    topics: [
      'Energy and Respiration (Glycolysis, Krebs Cycle & Oxidative Phosphorylation)',
      'Photosynthesis (Light-Dependent & Light-Independent Calvin Cycle)',
      'Homeostasis (Thermoregulation, Osmoregulation & Blood Glucose Regulation)',
      'Control and Coordination (Action Potentials, Synapses & Muscle Contraction)',
      'Inheritance (Monohybrid, Dihybrid, Epistasis & Chi-Squared Test)',
      'Selection and Evolution (Hardy-Weinberg Principle & Speciation)',
      'Classification, Biodiversity and Conservation',
      'Genetic Technology (PCR, Gel Electrophoresis, Recombinant DNA & CRISPR)'
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // EDEXCEL INTERNATIONAL AS & A LEVEL (IAL)
  // ═════════════════════════════════════════════════════════════
  {
    id: 'edx-ial-math-wma',
    name: 'Mathematics (Edexcel IAL AS/A2)',
    code: 'Edexcel WMA11-14',
    board: 'Edexcel',
    level: 'A Level',
    category: 'Mathematics',
    icon: 'Calculator',
    color: '#2563eb',
    topics: [
      'Pure Mathematics P1 (WMA11): Algebra, Graphs, Calculus',
      'Pure Mathematics P2 (WMA12): Sequences, Exponentials, Trigonometry',
      'Pure Mathematics P3 (WMA13): Functions, Numerical Methods, Integration',
      'Pure Mathematics P4 (WMA14): Parametric Equations, Vectors, Differential Equations',
      'Mechanics M1 (WME01): Kinematics, Dynamics, Statics & Moments',
      'Statistics S1 (WST01): Data Representation, Probability, Normal Distribution'
    ]
  },
  {
    id: 'edx-ial-physics-wph',
    name: 'Physics (Edexcel IAL AS/A2)',
    code: 'Edexcel WPH11-15',
    board: 'Edexcel',
    level: 'A Level',
    category: 'Sciences',
    icon: 'Zap',
    color: '#ea580c',
    topics: [
      'Unit 1 (WPH11): Mechanics and Materials',
      'Unit 2 (WPH12): Waves and Electricity',
      'Unit 3 (WPH13): Practical Skills in Physics I',
      'Unit 4 (WPH14): Further Mechanics, Fields and Particles',
      'Unit 5 (WPH15): Thermodynamics, Radiation, Oscillations and Cosmology',
      'Unit 6 (WPH16): Practical Skills in Physics II'
    ]
  }
];

export const IGCSE_SUBJECTS: Subject[] = BASE_SUBJECTS.map((s) => ({
  ...s,
  level: s.level || 'O Level / IGCSE',
}));

export const IGCSE_COMMAND_WORDS: CommandWord[] = [
  {
    word: 'State / Give / Name',
    definition: 'Express in clear, concise terms without detailed explanation.',
    whatExaminersExpect: 'Usually 1 mark per point. Do NOT write long paragraphs. A short factual phrase or single word is all the mark scheme asks for.',
    example: 'State the unit of electrical resistance. -> Answer: Ohm (Ω).'
  },
  {
    word: 'Describe',
    definition: 'State the points of a topic or give characteristics and main features.',
    whatExaminersExpect: 'Say WHAT happens, step-by-step in logical chronological order. Do NOT waste time explaining WHY unless asked.',
    example: 'Describe the motion of gas particles. -> Answer: Particles move randomly, at high speed, in all directions, colliding with each other and container walls.'
  },
  {
    word: 'Explain',
    definition: 'Set out purposes or reasons, make the relationships between things clear, say why and/or how and support with relevant evidence.',
    whatExaminersExpect: 'Say WHY or HOW it happens. Use connecting words like "because", "therefore", "as a result of". Every mark requires a cause-and-effect link.',
    example: 'Explain why temperature remains constant during boiling. -> Answer: Thermal energy absorbed is used to overcome intermolecular forces of attraction between particles, rather than increasing their kinetic energy.'
  },
  {
    word: 'Calculate',
    definition: 'Work out from given facts, figures or information.',
    whatExaminersExpect: 'Always show [M1] Formula, [M1] Substitution with correct units, and [A1] Final Answer to correct significant figures (standard is 3 s.f. in IGCSE!).',
    example: 'Calculate the acceleration of a 1200kg car when a net force of 3600N acts on it. -> a = F/m = 3600/1200 = 3.0 m/s².'
  },
  {
    word: 'Suggest',
    definition: 'Apply knowledge to situations where there are a range of valid responses to make proposals or put forward considerations.',
    whatExaminersExpect: 'Used for unfamiliar context questions. The answer is not straight memory recall; you must apply syllabus principles creatively.',
    example: 'Suggest why a farmer might spread lime (calcium oxide) on their soil. -> Answer: Lime is basic, so it neutralizes acidic soil to optimize plant growth pH.'
  },
  {
    word: 'Compare',
    definition: 'Identify / comment on similarities and / or differences.',
    whatExaminersExpect: 'You must explicitly discuss BOTH items. Mention at least one similarity and one difference, using comparative words like "whereas", "while", "both".',
    example: 'Compare Mitosis and Meiosis. -> Answer: Mitosis produces 2 genetically identical diploid cells for growth, whereas Meiosis produces 4 genetically varied haploid gametes for reproduction.'
  },
  {
    word: 'Evaluate / Discuss',
    definition: 'Discuss advantages and disadvantages and reach a reasoned conclusion.',
    whatExaminersExpect: 'Essential in Economics and Business 6-8 mark questions. Give 2 balanced sides (pros and cons) + a justified final recommendation with evaluative criteria.',
    example: 'Evaluate whether a country should implement tariffs on imported steel. -> Answer: Tariffs protect domestic jobs and tax revenue, but increase costs for local car manufacturers and risk retaliatory tariffs.'
  },
  {
    word: 'Summarise (ESL)',
    definition: 'Express the relevant points from a text concisely in your own words within the word limit (100-120 words).',
    whatExaminersExpect: 'Include 6-8 distinct content points from the passage. Paraphrase vocabulary and change grammatical structures. Do NOT exceed the word limit!',
    example: 'Write a summary explaining the benefits and challenges of remote learning. -> Use linking words: "Firstly...", "Moreover...", "On the other hand...", "Consequently...".'
  }
];
