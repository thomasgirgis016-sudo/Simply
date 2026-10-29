export interface SubjectPaperSpec {
  paperNumber: number | string;
  codeSuffix?: string;
  name: string;
  title: string;
  marks: number;
  duration: string;
  tier: 'Core' | 'Extended' | 'General';
  weightPercent?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  hasAudio?: boolean;
  description: string;
}

export interface SubjectCurriculumStructure {
  subjectCode: string;
  subjectName: string;
  board: 'CIE' | 'Edexcel' | 'OxfordAQA';
  totalPapersRequired: string; // e.g. "2 written papers + 1 speaking"
  papers: SubjectPaperSpec[];
}

export const SUBJECT_PAPER_SPECIFICATIONS: Record<string, SubjectCurriculumStructure> = {
  // ── ENGLISH AS A SECOND LANGUAGE (0510 / 0511) ───────────────
  '0510': {
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    board: 'CIE',
    totalPapersRequired: '2 written components (Paper 1 & Paper 2) + Component 3 Speaking',
    papers: [
      {
        paperNumber: 1,
        codeSuffix: '01',
        name: 'Reading & Writing',
        title: 'Paper 1: Reading & Writing',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 70,
        isListening: false,
        description: '60 marks • 2 hours • Assesses skimming, scanning, note-taking, summary writing (Exercise 4), and extended composition (Exercises 5 & 6).'
      },
      {
        paperNumber: 2,
        codeSuffix: '02',
        name: 'Listening',
        title: 'Paper 2: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 30,
        isListening: true,
        hasAudio: true,
        description: '40 marks • ~50 mins • 4 recorded audio exercises testing short dialogues, interviews, note completion, and speaker attitudes. Full official audio tracks included.'
      },
      {
        paperNumber: 'Component 3',
        codeSuffix: '03',
        name: 'Speaking Endorsement',
        title: 'Component 3: Speaking Endorsement',
        marks: 30,
        duration: '~15 minutes',
        tier: 'General',
        isSpeaking: true,
        description: '30 marks • ~15 mins • Part A warm-up, Part B topic card review, Part C assessed examiner discussion. Separately endorsed Grades 1–5.'
      }
    ]
  },
  '0511': {
    subjectCode: '0511',
    subjectName: 'English as a Second Language (Count-in Speaking)',
    board: 'CIE',
    totalPapersRequired: '3 components (Paper 1, Paper 2, Paper 3)',
    papers: [
      {
        paperNumber: 1,
        name: 'Reading & Writing',
        title: 'Paper 1: Reading & Writing',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 50,
        description: 'Reading comprehension, note-taking, summary writing and extended writing.'
      },
      {
        paperNumber: 2,
        name: 'Listening',
        title: 'Paper 2: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 25,
        isListening: true,
        hasAudio: true,
        description: 'Spoken monologue and dialogue comprehension with streamable audio.'
      },
      {
        paperNumber: 3,
        name: 'Speaking',
        title: 'Paper 3: Speaking (Count-in)',
        marks: 30,
        duration: '~15 minutes',
        tier: 'General',
        weightPercent: 25,
        isSpeaking: true,
        description: 'Oral examination counted directly into overall 0511 grade.'
      }
    ]
  },

  // ── FIRST LANGUAGE ENGLISH (0500) ───────────────────────────
  '0500': {
    subjectCode: '0500',
    subjectName: 'First Language English',
    board: 'CIE',
    totalPapersRequired: '2 written components (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Reading',
        title: 'Paper 1: Reading',
        marks: 80,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 50,
        description: '80 marks • 2 hours • Comprehension, text analysis, summary, and extended response to reading.'
      },
      {
        paperNumber: 2,
        name: 'Directed Writing & Composition',
        title: 'Paper 2: Directed Writing & Composition',
        marks: 80,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 50,
        description: '80 marks • 2 hours • Section A directed writing from stimulus texts; Section B narrative or descriptive composition.'
      }
    ]
  },

  // ── MATHEMATICS (0580) ──────────────────────────────────────
  '0580': {
    subjectCode: '0580',
    subjectName: 'Mathematics',
    board: 'CIE',
    totalPapersRequired: '2 papers (Paper 1 & 3 for Core, OR Paper 2 & 4 for Extended)',
    papers: [
      {
        paperNumber: 1,
        name: 'Core Non-Calculator',
        title: 'Paper 1: Core Non-Calculator',
        marks: 56,
        duration: '1 hour',
        tier: 'Core',
        weightPercent: 35,
        description: '56 marks • 1 hour • Short-answer questions targeting Core syllabus competencies without calculator.'
      },
      {
        paperNumber: 2,
        name: 'Extended Non-Calculator',
        title: 'Paper 2: Extended Non-Calculator',
        marks: 70,
        duration: '1 hour 30 mins',
        tier: 'Extended',
        weightPercent: 35,
        description: '70 marks • 1.5 hours • Short & structured questions covering algebra, geometry, trigonometry, and number.'
      },
      {
        paperNumber: 3,
        name: 'Core Calculator',
        title: 'Paper 3: Core Calculator',
        marks: 104,
        duration: '2 hours',
        tier: 'Core',
        weightPercent: 65,
        description: '104 marks • 2 hours • Structured multi-step Core problems with scientific calculator allowed.'
      },
      {
        paperNumber: 4,
        name: 'Extended Calculator',
        title: 'Paper 4: Extended Calculator',
        marks: 130,
        duration: '2 hours 30 mins',
        tier: 'Extended',
        weightPercent: 65,
        description: '130 marks • 2.5 hours • In-depth structured questions on vectors, functions, calculus, probability, and advanced geometry.'
      }
    ]
  },

  // ── PHYSICS (0625) ──────────────────────────────────────────
  '0625': {
    subjectCode: '0625',
    subjectName: 'Physics',
    board: 'CIE',
    totalPapersRequired: '3 papers: Paper 1 or 2 (MCQ) + Paper 3 or 4 (Theory) + Paper 5 or 6 (Practical)',
    papers: [
      {
        paperNumber: 1,
        name: 'Multiple Choice Core',
        title: 'Paper 1: Multiple Choice (Core)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Core',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 four-option multiple choice questions on Core syllabus.'
      },
      {
        paperNumber: 2,
        name: 'Multiple Choice Extended',
        title: 'Paper 2: Multiple Choice (Extended)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Extended',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 four-option multiple choice questions on Core and Extended syllabus.'
      },
      {
        paperNumber: 3,
        name: 'Theory Core',
        title: 'Paper 3: Theory (Core)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Core',
        weightPercent: 50,
        description: '80 marks • 1h 15m • Short-answer and structured questions on Core syllabus.'
      },
      {
        paperNumber: 4,
        name: 'Theory Extended',
        title: 'Paper 4: Theory (Extended)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        weightPercent: 50,
        description: '80 marks • 1h 15m • In-depth structured questions assessing physical mechanisms, calculation working, and reasoning.'
      },
      {
        paperNumber: 5,
        name: 'Practical Test',
        title: 'Paper 5: Practical Test (Laboratory)',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1h 15m • Laboratory-based experiment and data gathering assessment.'
      },
      {
        paperNumber: 6,
        name: 'Alternative to Practical',
        title: 'Paper 6: Alternative to Practical',
        marks: 40,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1 hour • Written paper assessing experimental techniques, graphs, apparatus, and sources of error.'
      }
    ]
  },

  // ── CHEMISTRY (0620) ────────────────────────────────────────
  '0620': {
    subjectCode: '0620',
    subjectName: 'Chemistry',
    board: 'CIE',
    totalPapersRequired: '3 papers: Paper 1 or 2 (MCQ) + Paper 3 or 4 (Theory) + Paper 5 or 6 (Practical)',
    papers: [
      {
        paperNumber: 1,
        name: 'Multiple Choice Core',
        title: 'Paper 1: Multiple Choice (Core)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Core',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 multiple choice questions on Core chemistry.'
      },
      {
        paperNumber: 2,
        name: 'Multiple Choice Extended',
        title: 'Paper 2: Multiple Choice (Extended)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Extended',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 multiple choice questions covering full Core & Extended chemistry.'
      },
      {
        paperNumber: 3,
        name: 'Theory Core',
        title: 'Paper 3: Theory (Core)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Core',
        weightPercent: 50,
        description: '80 marks • 1h 15m • Short-answer and structured questions on Core chemistry principles.'
      },
      {
        paperNumber: 4,
        name: 'Theory Extended',
        title: 'Paper 4: Theory (Extended)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        weightPercent: 50,
        description: '80 marks • 1h 15m • Stoichiometry, equilibrium, organic chemistry, electrolysis, and reaction energetics.'
      },
      {
        paperNumber: 5,
        name: 'Practical Test',
        title: 'Paper 5: Practical Test',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1h 15m • Hands-on titration, qualitative analysis, and rate experiments.'
      },
      {
        paperNumber: 6,
        name: 'Alternative to Practical',
        title: 'Paper 6: Alternative to Practical',
        marks: 40,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1 hour • Written assessment of gas testing, flame tests, apparatus, and experimental planning.'
      }
    ]
  },

  // ── BIOLOGY (0610) ──────────────────────────────────────────
  '0610': {
    subjectCode: '0610',
    subjectName: 'Biology',
    board: 'CIE',
    totalPapersRequired: '3 papers: Paper 1 or 2 (MCQ) + Paper 3 or 4 (Theory) + Paper 5 or 6 (Practical)',
    papers: [
      {
        paperNumber: 1,
        name: 'Multiple Choice Core',
        title: 'Paper 1: Multiple Choice (Core)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Core',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 MCQ questions testing fundamental biological principles.'
      },
      {
        paperNumber: 2,
        name: 'Multiple Choice Extended',
        title: 'Paper 2: Multiple Choice (Extended)',
        marks: 40,
        duration: '45 minutes',
        tier: 'Extended',
        weightPercent: 30,
        description: '40 marks • 45 mins • 40 MCQ questions testing Core and Extended biology concepts.'
      },
      {
        paperNumber: 3,
        name: 'Theory Core',
        title: 'Paper 3: Theory (Core)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Core',
        weightPercent: 50,
        description: '80 marks • 1h 15m • Structured questions on cell structure, classification, and human physiology.'
      },
      {
        paperNumber: 4,
        name: 'Theory Extended',
        title: 'Paper 4: Theory (Extended)',
        marks: 80,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        weightPercent: 50,
        description: '80 marks • 1h 15m • Cellular respiration, inheritance, biotechnology, ecology, and enzymes.'
      },
      {
        paperNumber: 5,
        name: 'Practical Test',
        title: 'Paper 5: Practical Test',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1h 15m • Laboratory microscope work, food tests, and enzyme rate experiments.'
      },
      {
        paperNumber: 6,
        name: 'Alternative to Practical',
        title: 'Paper 6: Alternative to Practical',
        marks: 40,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 20,
        description: '40 marks • 1 hour • Biological drawings, magnification calculations, food tests, and experimental controls.'
      }
    ]
  },

  // ── COMPUTER SCIENCE (0478) ─────────────────────────────────
  '0478': {
    subjectCode: '0478',
    subjectName: 'Computer Science',
    board: 'CIE',
    totalPapersRequired: '2 written papers (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Computer Systems',
        title: 'Paper 1: Computer Systems',
        marks: 75,
        duration: '1 hour 45 mins',
        tier: 'General',
        weightPercent: 50,
        description: '75 marks • 1h 45m • Data representation (binary, hex), CPU architecture, hardware, software, networks, and cyber security.'
      },
      {
        paperNumber: 2,
        name: 'Algorithms, Programming & Logic',
        title: 'Paper 2: Algorithms, Programming & Logic',
        marks: 75,
        duration: '1 hour 45 mins',
        tier: 'General',
        weightPercent: 50,
        description: '75 marks • 1h 45m • Flowcharts, pseudocode, trace tables, logic gates, databases (SQL), and Python/VB/Java program design.'
      }
    ]
  },

  // ── ECONOMICS (0455) ────────────────────────────────────────
  '0455': {
    subjectCode: '0455',
    subjectName: 'Economics',
    board: 'CIE',
    totalPapersRequired: '2 written papers (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Multiple Choice',
        title: 'Paper 1: Multiple Choice',
        marks: 30,
        duration: '45 minutes',
        tier: 'General',
        weightPercent: 30,
        description: '30 marks • 45 mins • 30 multiple choice questions testing microeconomics, macroeconomics, and global trade.'
      },
      {
        paperNumber: 2,
        name: 'Structured Questions',
        title: 'Paper 2: Structured Questions',
        marks: 90,
        duration: '2 hours 15 mins',
        tier: 'General',
        weightPercent: 70,
        description: '90 marks • 2h 15m • Section A compulsory data response (30 marks) + Section B answer 3 of 4 structured essay questions (60 marks).'
      }
    ]
  },

  // ── BUSINESS STUDIES (0450) ─────────────────────────────────
  '0450': {
    subjectCode: '0450',
    subjectName: 'Business Studies',
    board: 'CIE',
    totalPapersRequired: '2 written papers (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Short Answer & Data Response',
        title: 'Paper 1: Short Answer & Data Response',
        marks: 80,
        duration: '1 hour 30 mins',
        tier: 'General',
        weightPercent: 50,
        description: '80 marks • 1.5 hours • 4 multi-part questions testing marketing, operations, finance, and human resources with business context.'
      },
      {
        paperNumber: 2,
        name: 'Case Study',
        title: 'Paper 2: Case Study',
        marks: 80,
        duration: '1 hour 30 mins',
        tier: 'General',
        weightPercent: 50,
        description: '80 marks • 1.5 hours • 4 structured questions based on an unseen comprehensive business case study insert.'
      }
    ]
  },

  // ── ACCOUNTING (0452) ───────────────────────────────────────
  '0452': {
    subjectCode: '0452',
    subjectName: 'Accounting',
    board: 'CIE',
    totalPapersRequired: '2 written papers (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Multiple Choice',
        title: 'Paper 1: Multiple Choice',
        marks: 35,
        duration: '1 hour 15 mins',
        tier: 'General',
        weightPercent: 30,
        description: '35 marks • 1h 15m • 35 multiple choice questions testing ledger accounting, trial balance, and accounting ratios.'
      },
      {
        paperNumber: 2,
        name: 'Structured Written Paper',
        title: 'Paper 2: Structured Written Paper',
        marks: 100,
        duration: '1 hour 45 mins',
        tier: 'General',
        weightPercent: 70,
        description: '100 marks • 1h 45m • 5 structured questions preparing financial statements, bank reconciliations, and ratio evaluations.'
      }
    ]
  },

  // ── HISTORY (0470) ──────────────────────────────────────────
  '0470': {
    subjectCode: '0470',
    subjectName: 'History',
    board: 'CIE',
    totalPapersRequired: '3 papers: Paper 1, Paper 2, and Paper 4',
    papers: [
      {
        paperNumber: 1,
        name: 'Structured Questions',
        title: 'Paper 1: Structured Questions (Core)',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 40,
        description: '60 marks • 2 hours • Section A 19th or 20th century core content + Section B Depth Study structured essays.'
      },
      {
        paperNumber: 2,
        name: 'Document / Source Analysis',
        title: 'Paper 2: Source Analysis',
        marks: 50,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 33,
        description: '50 marks • 2 hours • 6 source-based questions analyzing contemporary historical documents, cartoons, and speeches.'
      },
      {
        paperNumber: 4,
        name: 'Depth Study (Alternative to Coursework)',
        title: 'Paper 4: Alternative to Coursework Depth Study',
        marks: 40,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 27,
        description: '40 marks • 1 hour • One extended essay from candidate chosen Depth Study (e.g. Germany 1918–45, Russia 1905–41, USA 1919–41).'
      }
    ]
  },

  // ── GEOGRAPHY (0460) ────────────────────────────────────────
  '0460': {
    subjectCode: '0460',
    subjectName: 'Geography',
    board: 'CIE',
    totalPapersRequired: '3 papers: Paper 1, Paper 2, and Paper 4',
    papers: [
      {
        paperNumber: 1,
        name: 'Geographical Themes',
        title: 'Paper 1: Geographical Themes',
        marks: 75,
        duration: '1 hour 45 mins',
        tier: 'General',
        weightPercent: 45,
        description: '75 marks • 1h 45m • Population & settlement, natural environment (rivers, coasts, volcanoes), and economic development.'
      },
      {
        paperNumber: 2,
        name: 'Geographical Skills',
        title: 'Paper 2: Geographical Skills',
        marks: 60,
        duration: '1 hour 30 mins',
        tier: 'General',
        weightPercent: 27.5,
        description: '60 marks • 1.5 hours • Ordnance survey map reading (1:25,000 or 1:50,000), cross-sections, graphs, and photographic analysis.'
      },
      {
        paperNumber: 4,
        name: 'Alternative to Coursework',
        title: 'Paper 4: Alternative to Coursework',
        marks: 60,
        duration: '1 hour 30 mins',
        tier: 'General',
        weightPercent: 27.5,
        description: '60 marks • 1.5 hours • Two fieldwork enquiry scenarios testing hypothesis testing, sampling methods, and data presentation.'
      }
    ]
  },

  // ── FOREIGN LANGUAGES (Listening Tracks Included) ───────────
  '0520': {
    subjectCode: '0520',
    subjectName: 'French (Foreign Language)',
    board: 'CIE',
    totalPapersRequired: '4 components (Paper 1, 2, 3, 4)',
    papers: [
      {
        paperNumber: 1,
        name: 'Listening',
        title: 'Paper 1: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 25,
        isListening: true,
        hasAudio: true,
        description: '40 marks • ~50 mins • Spoken French comprehension with streaming MP3 audio recordings.'
      },
      {
        paperNumber: 2,
        name: 'Reading',
        title: 'Paper 2: Reading',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Short and extended texts in French testing comprehension and vocabulary.'
      },
      {
        paperNumber: 3,
        name: 'Speaking',
        title: 'Paper 3: Speaking',
        marks: 40,
        duration: '~10 minutes',
        tier: 'General',
        weightPercent: 25,
        isSpeaking: true,
        description: '40 marks • ~10 mins • Warm-up, role plays, and conversation topics in spoken French.'
      },
      {
        paperNumber: 4,
        name: 'Writing',
        title: 'Paper 4: Writing',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Form completion, short article or email, and structured composition.'
      }
    ]
  },
  '0544': {
    subjectCode: '0544',
    subjectName: 'Arabic (Foreign Language)',
    board: 'CIE',
    totalPapersRequired: '4 components (Paper 1, 2, 3, 4)',
    papers: [
      {
        paperNumber: 1,
        name: 'Listening',
        title: 'Paper 1: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 25,
        isListening: true,
        hasAudio: true,
        description: '40 marks • ~50 mins • Spoken Modern Standard Arabic comprehension with official audio tracks.'
      },
      {
        paperNumber: 2,
        name: 'Reading',
        title: 'Paper 2: Reading',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Reading comprehension and vocabulary recognition.'
      },
      {
        paperNumber: 3,
        name: 'Speaking',
        title: 'Paper 3: Speaking',
        marks: 40,
        duration: '~10 minutes',
        tier: 'General',
        weightPercent: 25,
        isSpeaking: true,
        description: '40 marks • ~10 mins • Role play and topic discussion in Arabic.'
      },
      {
        paperNumber: 4,
        name: 'Writing',
        title: 'Paper 4: Writing',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Structured writing, notices, and extended compositions in Arabic.'
      }
    ]
  },
  '0530': {
    subjectCode: '0530',
    subjectName: 'Spanish (Foreign Language)',
    board: 'CIE',
    totalPapersRequired: '4 components (Paper 1, 2, 3, 4)',
    papers: [
      {
        paperNumber: 1,
        name: 'Listening',
        title: 'Paper 1: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 25,
        isListening: true,
        hasAudio: true,
        description: '40 marks • ~50 mins • Spoken Spanish comprehension with streaming audio.'
      },
      {
        paperNumber: 2,
        name: 'Reading',
        title: 'Paper 2: Reading',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Reading comprehension and vocabulary.'
      },
      {
        paperNumber: 3,
        name: 'Speaking',
        title: 'Paper 3: Speaking',
        marks: 40,
        duration: '~10 minutes',
        tier: 'General',
        weightPercent: 25,
        isSpeaking: true,
        description: '40 marks • ~10 mins • Oral communication in Spanish.'
      },
      {
        paperNumber: 4,
        name: 'Writing',
        title: 'Paper 4: Writing',
        marks: 45,
        duration: '1 hour',
        tier: 'General',
        weightPercent: 25,
        description: '45 marks • 1 hour • Structured writing in Spanish.'
      }
    ]
  },

  // ── EDEXCEL IGCSE SUBJECTS ──────────────────────────────────
  '4MA1': {
    subjectCode: '4MA1',
    subjectName: 'Mathematics A',
    board: 'Edexcel',
    totalPapersRequired: '2 calculator papers: Paper 1 (1H/1F) and Paper 2 (2H/2F)',
    papers: [
      {
        paperNumber: 1,
        name: 'Paper 1 (Higher / Foundation)',
        title: 'Paper 1: Paper 1H (Higher) / Paper 1F (Foundation)',
        marks: 100,
        duration: '2 hours',
        tier: 'Extended',
        weightPercent: 50,
        description: '100 marks • 2 hours • Calculator allowed for all questions. Covers number, algebra, geometry, and statistics.'
      },
      {
        paperNumber: 2,
        name: 'Paper 2 (Higher / Foundation)',
        title: 'Paper 2: Paper 2H (Higher) / Paper 2F (Foundation)',
        marks: 100,
        duration: '2 hours',
        tier: 'Extended',
        weightPercent: 50,
        description: '100 marks • 2 hours • Calculator allowed. Advanced algebraic problem-solving, calculus introduction, and vectors.'
      }
    ]
  },
  '4ES1': {
    subjectCode: '4ES1',
    subjectName: 'English as a Second Language',
    board: 'Edexcel',
    totalPapersRequired: '2 written components (Paper 1 & Paper 2) + Component 3 Speaking',
    papers: [
      {
        paperNumber: 1,
        name: 'Reading and Writing',
        title: 'Paper 1: Reading and Writing',
        marks: 100,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 66.7,
        description: '100 marks • 2 hours • Reading comprehension, summary writing, and extended formal writing.'
      },
      {
        paperNumber: 2,
        name: 'Listening',
        title: 'Paper 2: Listening (🎧 Official Audio Tracks)',
        marks: 30,
        duration: '~50 minutes',
        tier: 'General',
        weightPercent: 33.3,
        isListening: true,
        hasAudio: true,
        description: '30 marks • ~50 mins • Spoken monologue and dialogue listening with official audio tracks.'
      },
      {
        paperNumber: 'Component 3',
        name: 'Speaking Endorsement',
        title: 'Component 3: Speaking Endorsement',
        marks: 30,
        duration: '~12 minutes',
        tier: 'General',
        isSpeaking: true,
        description: 'Structured speaking discussion; separately endorsed.'
      }
    ]
  },

  // ── CAMBRIDGE AS & A LEVEL (9709, 9702, 9701, 9700, 9708) ───
  '9709': {
    subjectCode: '9709',
    subjectName: 'Mathematics (AS & A Level)',
    board: 'CIE',
    totalPapersRequired: 'AS Level: P1 + (M1 or S1) • A Level: P1 + P3 + (M1/S1/S2)',
    papers: [
      {
        paperNumber: 1,
        name: 'Pure Mathematics 1 (P1)',
        title: 'Paper 1: Pure Mathematics 1 (P1)',
        marks: 75,
        duration: '1 hour 50 mins',
        tier: 'Extended',
        description: '75 marks • Quadratics, functions, coordinate geometry, circular measure, trigonometry, series, differentiation & integration.'
      },
      {
        paperNumber: 2,
        name: 'Pure Mathematics 2 (P2)',
        title: 'Paper 2: Pure Mathematics 2 (P2)',
        marks: 50,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '50 marks • Algebra, logarithmic and exponential functions, trigonometry, differentiation, integration, numerical solution.'
      },
      {
        paperNumber: 3,
        name: 'Pure Mathematics 3 (P3)',
        title: 'Paper 3: Pure Mathematics 3 (P3)',
        marks: 75,
        duration: '1 hour 50 mins',
        tier: 'Extended',
        description: '75 marks • Advanced calculus, differential equations, vectors, complex numbers, partial fractions.'
      },
      {
        paperNumber: 4,
        name: 'Mechanics (M1)',
        title: 'Paper 4: Mechanics (M1)',
        marks: 50,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '50 marks • Forces and equilibrium, kinematics of motion in a straight line, Newton laws of motion, energy, work and power.'
      },
      {
        paperNumber: 5,
        name: 'Probability & Statistics 1 (S1)',
        title: 'Paper 5: Probability & Statistics 1 (S1)',
        marks: 50,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '50 marks • Representation of data, permutations and combinations, probability, discrete random variables, the normal distribution.'
      },
      {
        paperNumber: 6,
        name: 'Probability & Statistics 2 (S2)',
        title: 'Paper 6: Probability & Statistics 2 (S2)',
        marks: 50,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '50 marks • The Poisson distribution, linear combinations of random variables, continuous random variables, sampling and hypothesis tests.'
      }
    ]
  },
  '9702': {
    subjectCode: '9702',
    subjectName: 'Physics (AS & A Level)',
    board: 'CIE',
    totalPapersRequired: 'AS Level: Paper 1, 2, 3 • A Level: Paper 1, 2, 3, 4, 5',
    papers: [
      {
        paperNumber: 1,
        name: 'AS Level Multiple Choice',
        title: 'Paper 1: AS Level Multiple Choice',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '40 marks • 1h 15m • 40 multiple choice questions on AS Physics topics.'
      },
      {
        paperNumber: 2,
        name: 'AS Level Structured Questions',
        title: 'Paper 2: AS Level Structured Questions',
        marks: 60,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '60 marks • 1h 15m • Kinematics, dynamics, waves, superposition, electricity, and particle physics.'
      },
      {
        paperNumber: 3,
        name: 'Advanced Practical Skills',
        title: 'Paper 3: Advanced Practical Skills (Lab)',
        marks: 40,
        duration: '2 hours',
        tier: 'Extended',
        description: '40 marks • 2 hours • Laboratory experimental skills and analysis.'
      },
      {
        paperNumber: 4,
        name: 'A Level Structured Questions',
        title: 'Paper 4: A Level Structured Questions',
        marks: 100,
        duration: '2 hours',
        tier: 'Extended',
        description: '100 marks • 2 hours • Gravitational fields, thermodynamics, oscillations, electric fields, capacitance, magnetic fields, nuclear physics.'
      },
      {
        paperNumber: 5,
        name: 'Planning, Analysis & Evaluation',
        title: 'Paper 5: Planning, Analysis and Evaluation',
        marks: 30,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '30 marks • 1h 15m • Written experimental design, error analysis, and log-linear graph evaluation.'
      }
    ]
  },
  '9701': {
    subjectCode: '9701',
    subjectName: 'Chemistry (AS & A Level)',
    board: 'CIE',
    totalPapersRequired: 'AS Level: Paper 1, 2, 3 • A Level: Paper 1, 2, 3, 4, 5',
    papers: [
      {
        paperNumber: 1,
        name: 'AS Level Multiple Choice',
        title: 'Paper 1: AS Level Multiple Choice',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '40 marks • 1h 15m • 40 multiple choice questions on AS Chemistry topics.'
      },
      {
        paperNumber: 2,
        name: 'AS Level Structured Questions',
        title: 'Paper 2: AS Level Structured Questions',
        marks: 60,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '60 marks • 1h 15m • Atomic structure, bonding, states of matter, reaction kinetics, and AS organic mechanisms.'
      },
      {
        paperNumber: 3,
        name: 'Advanced Practical Skills',
        title: 'Paper 3: Advanced Practical Skills (Lab)',
        marks: 40,
        duration: '2 hours',
        tier: 'Extended',
        description: '40 marks • 2 hours • Quantitative volumetric titration, gravimetric analysis, and qualitative ion testing.'
      },
      {
        paperNumber: 4,
        name: 'A Level Structured Questions',
        title: 'Paper 4: A Level Structured Questions',
        marks: 100,
        duration: '2 hours',
        tier: 'Extended',
        description: '100 marks • 2 hours • Chemical energetics, electrochemistry, transition elements, Arenes, carbonyls, carboxylic acids, and NMR.'
      },
      {
        paperNumber: 5,
        name: 'Planning, Analysis & Evaluation',
        title: 'Paper 5: Planning, Analysis and Evaluation',
        marks: 30,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '30 marks • 1h 15m • Designing chemical experiments, risk assessments, calculating uncertainty, and concluding from raw data.'
      }
    ]
  },
  '9700': {
    subjectCode: '9700',
    subjectName: 'Biology (AS & A Level)',
    board: 'CIE',
    totalPapersRequired: 'AS Level: Paper 1, 2, 3 • A Level: Paper 1, 2, 3, 4, 5',
    papers: [
      {
        paperNumber: 1,
        name: 'AS Level Multiple Choice',
        title: 'Paper 1: AS Level Multiple Choice',
        marks: 40,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '40 marks • 1h 15m • 40 multiple choice questions on AS Biology topics.'
      },
      {
        paperNumber: 2,
        name: 'AS Level Structured Questions',
        title: 'Paper 2: AS Level Structured Questions',
        marks: 60,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '60 marks • 1h 15m • Cell structure, biological molecules, enzymes, cell membranes, mitotic cycle, and transport in plants/mammals.'
      },
      {
        paperNumber: 3,
        name: 'Advanced Practical Skills',
        title: 'Paper 3: Advanced Practical Skills (Lab)',
        marks: 40,
        duration: '2 hours',
        tier: 'Extended',
        description: '40 marks • 2 hours • Microscopy calibrated with eyepiece graticule, Serial dilutions, and enzyme kinetics assays.'
      },
      {
        paperNumber: 4,
        name: 'A Level Structured Questions',
        title: 'Paper 4: A Level Structured Questions',
        marks: 100,
        duration: '2 hours',
        tier: 'Extended',
        description: '100 marks • 2 hours • Energy and respiration, photosynthesis, homeostasis, control and coordination, inheritance, and gene technology.'
      },
      {
        paperNumber: 5,
        name: 'Planning, Analysis & Evaluation',
        title: 'Paper 5: Planning, Analysis and Evaluation',
        marks: 30,
        duration: '1 hour 15 mins',
        tier: 'Extended',
        description: '30 marks • 1h 15m • Planning experimental biological investigations, identifying variables, and calculating Chi-squared / t-tests.'
      }
    ]
  },
  '9708': {
    subjectCode: '9708',
    subjectName: 'Economics (AS & A Level)',
    board: 'CIE',
    totalPapersRequired: 'AS Level: Paper 1, 2 • A Level: Paper 1, 2, 3, 4',
    papers: [
      {
        paperNumber: 1,
        name: 'AS Multiple Choice',
        title: 'Paper 1: AS Level Multiple Choice',
        marks: 30,
        duration: '1 hour',
        tier: 'General',
        description: '30 marks • 1 hour • 30 multiple choice questions on AS microeconomics and macroeconomics.'
      },
      {
        paperNumber: 2,
        name: 'AS Data Response & Essays',
        title: 'Paper 2: AS Data Response & Essays',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        description: '60 marks • 2 hours • Section A compulsory data response (20 marks) + Section B and C structured essays.'
      },
      {
        paperNumber: 3,
        name: 'A Level Multiple Choice',
        title: 'Paper 3: A Level Multiple Choice',
        marks: 30,
        duration: '1 hour 15 mins',
        tier: 'General',
        description: '30 marks • 1h 15m • 30 multiple choice questions covering full A Level economic syllabus.'
      },
      {
        paperNumber: 4,
        name: 'A Level Data Response & Essays',
        title: 'Paper 4: A Level Data Response & Essays',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        description: '60 marks • 2 hours • Data response and advanced evaluative essays on market failure, labour markets, macroeconomic policies, and economic growth.'
      }
    ]
  },

  // ── OXFORDAQA INTERNATIONAL GCSE ENGLISH SUITE (9270, 9275, 9280) ───
  '9270': {
    subjectCode: '9270',
    subjectName: 'English Language',
    board: 'OxfordAQA',
    totalPapersRequired: '2 written components (Paper 1 & Paper 2) + Non-exam Speaking Endorsement',
    papers: [
      {
        paperNumber: 1,
        codeSuffix: '1',
        name: 'Literary Non-Fiction and Composition',
        title: 'Paper 1: Literary Non-Fiction and Composition',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 60,
        description: '60 marks • 2 hours • Section A: Reading literary non-fiction texts. Section B: Composition and creative/descriptive writing.'
      },
      {
        paperNumber: 2,
        codeSuffix: '2',
        name: 'Source-Based Reading & Directed Writing',
        title: 'Paper 2: Source-Based Reading & Directed Writing',
        marks: 60,
        duration: '2 hours',
        tier: 'General',
        weightPercent: 40,
        description: '60 marks • 2 hours • Section A: Reading source texts and analytical evaluation. Section B: Directed functional writing for specific audiences.'
      },
      {
        paperNumber: 'Component S',
        codeSuffix: 'S',
        name: 'Speaking and Listening Endorsement',
        title: 'Component S: Speaking & Listening Endorsement',
        marks: 30,
        duration: '~10 minutes',
        tier: 'General',
        isSpeaking: true,
        description: 'Non-exam assessment: presentation and discussion assessed by teacher and moderated by OxfordAQA. Reported separately Grades 1–5.'
      }
    ]
  },
  '9275': {
    subjectCode: '9275',
    subjectName: 'English Literature',
    board: 'OxfordAQA',
    totalPapersRequired: '2 written papers (Paper 1 & Paper 2)',
    papers: [
      {
        paperNumber: 1,
        codeSuffix: '1',
        name: 'Poetry and Shakespeare',
        title: 'Paper 1: Poetry and Shakespeare',
        marks: 60,
        duration: '1h 30m',
        tier: 'General',
        weightPercent: 50,
        description: '60 marks • 1h 30m • Section A: Shakespeare text analysis. Section B: OxfordAQA anthology poetry comparison.'
      },
      {
        paperNumber: 2,
        codeSuffix: '2',
        name: 'Modern Drama and Modern Prose',
        title: 'Paper 2: Modern Drama and Modern Prose',
        marks: 60,
        duration: '1h 30m',
        tier: 'General',
        weightPercent: 50,
        description: '60 marks • 1h 30m • Section A: Modern drama (e.g. An Inspector Calls). Section B: Modern prose novel study.'
      }
    ]
  },
  '9280': {
    subjectCode: '9280',
    subjectName: 'English as a Second Language (ESL)',
    board: 'OxfordAQA',
    totalPapersRequired: 'Paper 1 (Reading) + Paper 2 (Writing) + Paper 3 (Listening) + Speaking',
    papers: [
      {
        paperNumber: 1,
        codeSuffix: 'R',
        name: 'Reading',
        title: 'Paper 1: Reading',
        marks: 60,
        duration: '1h 15m',
        tier: 'General',
        weightPercent: 30,
        description: '60 marks • 1h 15m • Reading comprehension, skimming, scanning, factual extraction, and inference.'
      },
      {
        paperNumber: 2,
        codeSuffix: 'W',
        name: 'Writing',
        title: 'Paper 2: Writing',
        marks: 60,
        duration: '1h 15m',
        tier: 'General',
        weightPercent: 30,
        description: '60 marks • 1h 15m • Functional writing, note-taking, reports, and formal essays.'
      },
      {
        paperNumber: 3,
        codeSuffix: 'L',
        name: 'Listening',
        title: 'Paper 3: Listening (🎧 Official Audio Tracks)',
        marks: 40,
        duration: '~45 minutes',
        tier: 'General',
        weightPercent: 20,
        isListening: true,
        hasAudio: true,
        description: '40 marks • ~45 mins • Spoken monologues, dialogues, and interviews. Includes streamable and downloadable audio tracks.'
      },
      {
        paperNumber: 4,
        codeSuffix: 'S',
        name: 'Speaking',
        title: 'Paper 4: Speaking',
        marks: 40,
        duration: '~10 minutes',
        tier: 'General',
        weightPercent: 20,
        isSpeaking: true,
        description: '40 marks • ~10 mins • Warm-up discussion, candidate presentation, and examiner-led discussion.'
      }
    ]
  }
};

/**
 * Normalizes subject input into a standard key found in SUBJECT_PAPER_SPECIFICATIONS.
 */
export function normalizeSubjectCode(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (SUBJECT_PAPER_SPECIFICATIONS[trimmed]) return trimmed;

  // Extract known codes
  const match = trimmed.match(/\b(0510|0511|0500|0580|0625|0620|0610|0478|0455|0450|0452|0470|0460|0520|0544|0530|4MA1|4ES1|9709|9702|9701|9700|9708|9270|9275|9280)\b/i);
  if (match) {
    const code = match[1].toUpperCase();
    if (SUBJECT_PAPER_SPECIFICATIONS[code]) return code;
  }

  // Check substring matches
  for (const key of Object.keys(SUBJECT_PAPER_SPECIFICATIONS)) {
    if (trimmed.toUpperCase().includes(key)) return key;
  }

  return trimmed;
}

/**
 * Helper to get the paper specification for any subject code and paper number.
 */
export function getSubjectPaperSpec(subjectCode: string, paperNumber: number | string): SubjectPaperSpec | undefined {
  const normKey = normalizeSubjectCode(subjectCode);
  const structure = SUBJECT_PAPER_SPECIFICATIONS[normKey];
  if (!structure) return undefined;
  return structure.papers.find(
    p => p.paperNumber.toString() === paperNumber.toString() ||
         (p.codeSuffix && p.codeSuffix.toString().toLowerCase() === paperNumber.toString().toLowerCase()) ||
         (typeof paperNumber === 'string' && p.name.toLowerCase().includes(paperNumber.toLowerCase()))
  );
}

/**
 * Helper to get all paper options for a specific subject code.
 */
export function getPapersForSubject(subjectCode: string): SubjectPaperSpec[] {
  const normKey = normalizeSubjectCode(subjectCode);
  const structure = SUBJECT_PAPER_SPECIFICATIONS[normKey];
  if (structure) return structure.papers;

  // Fallback for subjects not explicitly configured: standard Papers 1, 2, 3, 4
  return [
    { paperNumber: 1, name: 'Paper 1', title: 'Paper 1', marks: 50, duration: '1 hour', tier: 'General', description: 'Component 1 written examination' },
    { paperNumber: 2, name: 'Paper 2', title: 'Paper 2', marks: 80, duration: '2 hours', tier: 'General', description: 'Component 2 structured examination' },
  ];
}

/**
 * Generates official audio track stream & download URLs for listening examination papers.
 */
export function getListeningAudioUrls(subjectCode: string, sessionCode: string, year: number, paperNumber: number | string, variant: number = 1): {
  streamUrl: string;
  backupStreamUrl: string;
  downloadUrl: string;
} {
  const normKey = normalizeSubjectCode(subjectCode);
  const yy = String(year).slice(-2);

  // OxfordAQA ESL (9280 Paper 3/L)
  if (normKey === '9280') {
    return {
      streamUrl: `https://pastpapers.papacambridge.com/?s=${encodeURIComponent(`OxfordAQA 9280 ${sessionCode} ${year} Audio`)}`,
      backupStreamUrl: `https://www.oxfordaqa.com/subjects/english/`,
      downloadUrl: `https://pastpapers.papacambridge.com/?s=${encodeURIComponent(`OxfordAQA 9280 ${year} Paper 3 Audio mp3`)}`
    };
  }

  // Pearson Edexcel ESL (4ES1 Paper 2)
  if (normKey === '4ES1') {
    return {
      streamUrl: `https://pastpapers.papacambridge.com/?s=${encodeURIComponent(`Edexcel 4ES1 ${sessionCode} ${year} Audio mp3`)}`,
      backupStreamUrl: `https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/english-as-a-second-language-2016.html`,
      downloadUrl: `https://pastpapers.papacambridge.com/?s=${encodeURIComponent(`Edexcel 4ES1 ${year} Paper 2 Audio`)}`
    };
  }

  // Cambridge IGCSE: 0510, 0511, 0520 (French), 0544 (Arabic), 0530 (Spanish), etc.
  const audioFilename = `${normKey}_${sessionCode}${yy}_audio.mp3`;
  const compCode = `${paperNumber}${variant}`;
  const compAudioFilename = `${normKey}_${sessionCode}${yy}_audio_${compCode}.mp3`;

  return {
    streamUrl: `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${audioFilename}`,
    backupStreamUrl: `https://papers.gceguide.cc/Cambridge%20IGCSE/${normKey}/${year}/${audioFilename}`,
    downloadUrl: `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${compAudioFilename}`
  };
}
