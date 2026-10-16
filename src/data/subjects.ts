import { Subject, CommandWord } from '../types';

export const IGCSE_SUBJECTS: Subject[] = [
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
    color: '#eab308', // amber/yellow
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
    color: '#06b6d4', // cyan
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

  // Humanities & Business
  {
    id: 'cie-econ-0455',
    name: 'Economics',
    code: 'CIE 0455',
    board: 'CIE',
    category: 'Humanities',
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
    id: 'cie-business-0450',
    name: 'Business Studies',
    code: 'CIE 0450',
    board: 'CIE',
    category: 'Humanities',
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
  }
];

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
  }
];
