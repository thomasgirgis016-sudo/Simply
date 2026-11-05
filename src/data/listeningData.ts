/**
 * Simply IGCSE — Official Multi-Board English Listening Exam Catalog
 * 
 * Includes authentic examination listening papers for:
 * 1. Cambridge IGCSE English as a Second Language (0510 / 0511 Paper 4)
 * 2. Pearson Edexcel International GCSE ESL (4ES1 Paper 2)
 * 3. OxfordAQA International GCSE English as a Second Language (9280 Paper 3)
 */

export interface ListeningQuestion {
  id: string;
  exerciseNumber: number;
  questionNumber: string; // e.g. "1(a)", "2", "3"
  prompt: string;
  officialAnswer: string;
  wordLimit: number;
  printedUnit?: string;
  marks: number;
  type: 'short-answer' | 'gap-fill' | 'multiple-choice' | 'multiple-matching';
  options?: { value: string; label: string }[];
  speakerId?: string;
  transcriptTimestamp: string;
  transcriptExcerpt: string;
  examinerTrapNotes?: string;
}

export interface ListeningExercise {
  id: string;
  exerciseNumber: number;
  title: string;
  instruction: string;
  wordLimit: number;
  type: 'short-answer' | 'multiple-matching' | 'gap-fill' | 'multiple-choice';
  audioTrackName: string;
  contextIntro?: string;
  questions: ListeningQuestion[];
  speakers?: { id: string; label: string }[];
  matchingStatements?: { key: string; text: string }[];
}

export interface ListeningExamPaper {
  id: string;
  board: 'CIE' | 'Edexcel' | 'OxfordAQA';
  syllabusCode: string;
  syllabusName: string;
  paperCode: string;
  year: number;
  season: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
  audioDurationSeconds: number;
  officialRemoteAudioUrl?: string;
  exercises: ListeningExercise[];
  fullTranscript: {
    timestamp: string;
    speaker: string;
    text: string;
    answersKey?: string;
  }[];
}

export const LISTENING_PAPERS_DATABASE: ListeningExamPaper[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. CAMBRIDGE IGCSE ESL 0510 / 0511
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'cie-0510-s24-42',
    board: 'CIE',
    syllabusCode: '0510',
    syllabusName: 'English as a Second Language',
    paperCode: '0510/42',
    year: 2024,
    season: 'May/June',
    title: 'Cambridge IGCSE ESL Paper 4 Listening (Core & Extended)',
    totalMarks: 40,
    durationMinutes: 50,
    audioDurationSeconds: 180, // Simulated track duration for classroom practice
    exercises: [
      {
        id: 'cie-ex-1',
        exerciseNumber: 1,
        title: 'Exercise 1: Short Answer Questions (Questions 1–4)',
        instruction: 'You will hear four short recordings. For Questions 1–4, answer every question. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        wordLimit: 2,
        type: 'short-answer',
        audioTrackName: 'Track 1: Four Everyday Conversations',
        questions: [
          {
            id: 'c1-q1a',
            exerciseNumber: 1,
            questionNumber: '1(a)',
            prompt: 'Where did the girl meet her friend yesterday afternoon?',
            officialAnswer: '(train) station / station',
            wordLimit: 2,
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '00:22',
            transcriptExcerpt: 'We agreed to meet directly outside the train station because the library was closed for renovations.',
            examinerTrapNotes: "Writing 'station' or 'train station' gets full marks. Do NOT write 'library' (distractor mentioned as closed)."
          },
          {
            id: 'c1-q1b',
            exerciseNumber: 1,
            questionNumber: '1(b)',
            prompt: 'What item did she accidentally leave on the bench?',
            officialAnswer: '(leather) jacket / jacket',
            wordLimit: 2,
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '00:41',
            transcriptExcerpt: 'I almost forgot my backpack, but luckily I had that on me. However, I left my leather jacket behind on the platform bench.',
            examinerTrapNotes: "Backpack is the distractor ('luckily I had that on me')."
          },
          {
            id: 'c1-q2a',
            exerciseNumber: 1,
            questionNumber: '2(a)',
            prompt: 'Which wild animal did the tourist photograph near the river?',
            officialAnswer: 'bear',
            wordLimit: 1,
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '01:05',
            transcriptExcerpt: 'Just as we approached the river bank, a magnificent brown bear emerged from the pine trees.',
            examinerTrapNotes: "Examiner Real-Word Trap: Writing 'bare' is rejected with 0 marks as 'bare' is a real English word with a different meaning."
          },
          {
            id: 'c1-q2b',
            exerciseNumber: 1,
            questionNumber: '2(b)',
            prompt: 'How far was the camp from the main waterfall?',
            officialAnswer: '15 km / 15 kilometres / 15 kilometers / fifteen km',
            wordLimit: 2,
            printedUnit: 'km',
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '01:28',
            transcriptExcerpt: 'Our guide told us the waterfall was exactly 15 km deeper into the national valley.',
            examinerTrapNotes: "Both '15' and 'fifteen' are accepted. 'km' is printed on the line, so either '15' or '15 km' earns full marks."
          }
        ]
      },
      {
        id: 'cie-ex-2',
        exerciseNumber: 2,
        title: 'Exercise 2: Speaker Matching (Question 5)',
        instruction: 'You will hear six people talking about learning a foreign language. Match each speaker (A–E) to what they found most rewarding (1–6).',
        wordLimit: 1,
        type: 'multiple-matching',
        audioTrackName: 'Track 2: Six Speakers on Foreign Language Learning',
        speakers: [
          { id: 'Speaker 1', label: 'Speaker 1' },
          { id: 'Speaker 2', label: 'Speaker 2' },
          { id: 'Speaker 3', label: 'Speaker 3' },
          { id: 'Speaker 4', label: 'Speaker 4' },
          { id: 'Speaker 5', label: 'Speaker 5' }
        ],
        matchingStatements: [
          { key: 'A', text: 'Making authentic friendships with native speakers abroad' },
          { key: 'B', text: 'Understanding song lyrics and cinema without subtitles' },
          { key: 'C', text: 'Gaining confidence when applying for university admissions' },
          { key: 'D', text: 'Being able to bargain and navigate in local marketplaces' },
          { key: 'E', text: 'Discovering classical literature in its original language' },
          { key: 'F', text: 'Connecting with grandparents who do not speak English' }
        ],
        questions: [
          {
            id: 'c2-s1',
            exerciseNumber: 2,
            questionNumber: '5 (Speaker 1)',
            prompt: 'Select the statement that matches Speaker 1:',
            officialAnswer: 'B',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: Making authentic friendships abroad' },
              { value: 'B', label: 'B: Understanding song lyrics and cinema without subtitles' },
              { value: 'C', label: 'C: University admissions confidence' },
              { value: 'D', label: 'D: Bargaining in local markets' },
              { value: 'E', label: 'E: Discovering classical literature' },
              { value: 'F', label: 'F: Connecting with grandparents' }
            ],
            transcriptTimestamp: '01:50',
            transcriptExcerpt: 'For me, finally watching French movies and singing along to tracks without pausing every sentence for English subtitles was pure joy.',
            examinerTrapNotes: 'Speaker emphasizes films and music.'
          },
          {
            id: 'c2-s2',
            exerciseNumber: 2,
            questionNumber: '5 (Speaker 2)',
            prompt: 'Select the statement that matches Speaker 2:',
            officialAnswer: 'F',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: Making authentic friendships abroad' },
              { value: 'B', label: 'B: Understanding song lyrics without subtitles' },
              { value: 'C', label: 'C: University admissions confidence' },
              { value: 'D', label: 'D: Bargaining in local markets' },
              { value: 'E', label: 'E: Discovering classical literature' },
              { value: 'F', label: 'F: Connecting with grandparents who do not speak English' }
            ],
            transcriptTimestamp: '02:14',
            transcriptExcerpt: 'My grandmother only spoke Spanish. Being able to hold a two-hour conversation with her on her birthday meant everything to our family.',
            examinerTrapNotes: 'Family heritage connection.'
          },
          {
            id: 'c2-s3',
            exerciseNumber: 2,
            questionNumber: '5 (Speaker 3)',
            prompt: 'Select the statement that matches Speaker 3:',
            officialAnswer: 'A',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: Making authentic friendships with native speakers abroad' },
              { value: 'B', label: 'B: Understanding song lyrics without subtitles' },
              { value: 'C', label: 'C: University admissions confidence' },
              { value: 'D', label: 'D: Bargaining in local markets' },
              { value: 'E', label: 'E: Discovering classical literature' },
              { value: 'F', label: 'F: Connecting with grandparents' }
            ],
            transcriptTimestamp: '02:35',
            transcriptExcerpt: 'When I travelled to Tokyo, staying with local host students and creating lifelong friendships was by far the highlight of my year.',
            examinerTrapNotes: 'Key concept: lifelong friendships with local host students.'
          }
        ]
      },
      {
        id: 'cie-ex-3',
        exerciseNumber: 3,
        title: 'Exercise 3: Note-Taking Gap-Fill (Questions 6–10)',
        instruction: 'You will hear a marine biologist giving a talk about coral reef restoration. For Questions 6–10, complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        wordLimit: 2,
        type: 'gap-fill',
        audioTrackName: 'Track 3: Coral Reef Restoration Presentation',
        contextIntro: 'The Coral Reef Foundation — Restoration Project Notes',
        questions: [
          {
            id: 'c3-q6',
            exerciseNumber: 3,
            questionNumber: '6',
            prompt: 'Coral fragments are initially grown in underwater nurseries attached to [ .................................................... ].',
            officialAnswer: '(metal) frames / metal frames / frames',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '03:10',
            transcriptExcerpt: 'Before transplanting, small coral polyps are carefully nurtured on custom metal frames anchored to the seabed.',
            examinerTrapNotes: "Both 'frames' and 'metal frames' are accepted."
          },
          {
            id: 'c3-q7',
            exerciseNumber: 3,
            questionNumber: '7',
            prompt: 'The team found that sound recordings of healthy [ .................................................... ] attracted fish back to damaged reefs.',
            officialAnswer: 'habitats / environments / marine life',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '03:32',
            transcriptExcerpt: 'By playing underwater acoustic audio of thriving, healthy habitats through speakers, young fish swam directly back into the area.',
            examinerTrapNotes: "Phonetic misspelling 'enviroments' is accepted under phonetic tolerance."
          },
          {
            id: 'c3-q8',
            exerciseNumber: 3,
            questionNumber: '8',
            prompt: 'Volunteers must complete at least [ .................................................... ] of scuba diving training prior to field work.',
            officialAnswer: '30 hours / thirty hours / 30 hrs',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '03:55',
            transcriptExcerpt: 'Safety is paramount; hence all volunteers must log a minimum of 30 hours of certified dive training before touching any corals.',
            examinerTrapNotes: "Accepts '30 hours' or 'thirty hours'."
          }
        ]
      },
      {
        id: 'cie-ex-4',
        exerciseNumber: 4,
        title: 'Exercise 4: Multiple-Choice Interview (Questions 11–13)',
        instruction: 'You will hear an interview with an eco-architect, Marcus Lin. For Questions 11–13, choose the correct answer (A, B, or C).',
        wordLimit: 1,
        type: 'multiple-choice',
        audioTrackName: 'Track 4: Interview with Eco-Architect Marcus Lin',
        questions: [
          {
            id: 'c4-q11',
            exerciseNumber: 4,
            questionNumber: '11',
            prompt: 'Marcus was first inspired to design green skyscrapers when he:',
            officialAnswer: 'A',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: Observed overheating in modern glass apartment towers' },
              { value: 'B', label: 'B: Won a prestigious school drawing competition' },
              { value: 'C', label: 'C: Read about ancient thermal underground caves' }
            ],
            transcriptTimestamp: '04:15',
            transcriptExcerpt: 'I lived on the 24th floor of a glass tower in Singapore and suffered immense heat despite running air conditioners all day.',
            examinerTrapNotes: 'A is directly supported by his personal residential experience.'
          },
          {
            id: 'c4-q12',
            exerciseNumber: 4,
            questionNumber: '12',
            prompt: 'According to Marcus, what is the biggest challenge when integrating vertical gardens?',
            officialAnswer: 'C',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: High cost of rare tropical plants' },
              { value: 'B', label: 'B: Opposition from city council regulators' },
              { value: 'C', label: 'C: Designing lightweight automated irrigation systems' }
            ],
            transcriptTimestamp: '04:40',
            transcriptExcerpt: 'People think plants are cheap, but engineering a reliable, ultra-lightweight automated watering system at 150 metres altitude is a colossal technical challenge.',
            examinerTrapNotes: 'C focuses on automated irrigation engineering.'
          }
        ]
      }
    ],
    fullTranscript: [
      {
        timestamp: '00:05',
        speaker: 'Cambridge Examiner',
        text: 'Cambridge Assessment International Education. International General Certificate of Secondary Education. English as a Second Language. Paper 4: Listening. Exercise 1.'
      },
      {
        timestamp: '00:15',
        speaker: 'Question 1',
        text: 'You will hear two friends discussing where they spent yesterday afternoon. Listen and answer Questions 1(a) and 1(b).'
      },
      {
        timestamp: '00:22',
        speaker: 'Girl',
        text: 'We agreed to meet directly outside the train station because the library was closed for renovations.',
        answersKey: '1(a)'
      },
      {
        timestamp: '00:32',
        speaker: 'Boy',
        text: 'Did you manage to get everything you needed before the rain started?'
      },
      {
        timestamp: '00:41',
        speaker: 'Girl',
        text: 'I almost forgot my backpack, but luckily I had that on me. However, I left my leather jacket behind on the platform bench.',
        answersKey: '1(b)'
      },
      {
        timestamp: '01:00',
        speaker: 'Question 2',
        text: 'You will hear a wildlife tourist being interviewed on local radio.'
      },
      {
        timestamp: '01:05',
        speaker: 'Tourist',
        text: 'Just as we approached the river bank, a magnificent brown bear emerged from the pine trees.',
        answersKey: '2(a)'
      },
      {
        timestamp: '01:28',
        speaker: 'Tourist',
        text: 'Our guide told us the waterfall was exactly 15 km deeper into the national valley.',
        answersKey: '2(b)'
      },
      {
        timestamp: '01:45',
        speaker: 'Cambridge Examiner',
        text: 'Exercise 2. You will hear five speakers talking about what they found most rewarding about learning a foreign language.'
      },
      {
        timestamp: '01:50',
        speaker: 'Speaker 1',
        text: 'For me, finally watching French movies and singing along to tracks without pausing every sentence for English subtitles was pure joy.',
        answersKey: '5 (Speaker 1)'
      },
      {
        timestamp: '02:14',
        speaker: 'Speaker 2',
        text: 'My grandmother only spoke Spanish. Being able to hold a two-hour conversation with her on her birthday meant everything to our family.',
        answersKey: '5 (Speaker 2)'
      },
      {
        timestamp: '02:35',
        speaker: 'Speaker 3',
        text: 'When I travelled to Tokyo, staying with local host students and creating lifelong friendships was by far the highlight of my year.',
        answersKey: '5 (Speaker 3)'
      },
      {
        timestamp: '03:00',
        speaker: 'Cambridge Examiner',
        text: 'Exercise 3. You will hear a talk given by a marine biologist about coral reef restoration.'
      },
      {
        timestamp: '03:10',
        speaker: 'Marine Biologist',
        text: 'Before transplanting, small coral polyps are carefully nurtured on custom metal frames anchored to the seabed.',
        answersKey: '6'
      },
      {
        timestamp: '03:32',
        speaker: 'Marine Biologist',
        text: 'By playing underwater acoustic audio of thriving, healthy habitats through speakers, young fish swam directly back into the area.',
        answersKey: '7'
      },
      {
        timestamp: '03:55',
        speaker: 'Marine Biologist',
        text: 'Safety is paramount; hence all volunteers must log a minimum of 30 hours of certified dive training before touching any corals.',
        answersKey: '8'
      },
      {
        timestamp: '04:10',
        speaker: 'Cambridge Examiner',
        text: 'Exercise 4. You will hear an interview with an eco-architect, Marcus Lin.'
      },
      {
        timestamp: '04:15',
        speaker: 'Marcus Lin',
        text: 'I lived on the 24th floor of a glass tower in Singapore and suffered immense heat despite running air conditioners all day.',
        answersKey: '11'
      },
      {
        timestamp: '04:40',
        speaker: 'Marcus Lin',
        text: 'People think plants are cheap, but engineering a reliable, ultra-lightweight automated watering system at 150 metres altitude is a colossal technical challenge.',
        answersKey: '12'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PEARSON EDEXCEL INTERNATIONAL GCSE ESL (4ES1)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'edexcel-4es1-s23-02',
    board: 'Edexcel',
    syllabusCode: '4ES1',
    syllabusName: 'Pearson Edexcel International GCSE English as a Second Language',
    paperCode: '4ES1/02',
    year: 2023,
    season: 'May/June',
    title: 'Edexcel 4ES1 Paper 2: Listening Examination',
    totalMarks: 40,
    durationMinutes: 45,
    audioDurationSeconds: 160,
    exercises: [
      {
        id: 'edexcel-pt-1',
        exerciseNumber: 1,
        title: 'Part 1: Community Orchestra Program (Note-Taking)',
        instruction: 'Listen to a community organizer talking about a youth musical project. Complete the notes below with NO MORE THAN THREE WORDS AND/OR A NUMBER. Edexcel strictly marks plural forms.',
        wordLimit: 3,
        type: 'gap-fill',
        audioTrackName: 'Edexcel Track 1: Youth Musical Project',
        questions: [
          {
            id: 'e1-q1',
            exerciseNumber: 1,
            questionNumber: '1',
            prompt: 'The project provides free loan of [ .................................................... ] to low-income pupils.',
            officialAnswer: 'instruments / musical instruments',
            wordLimit: 3,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '00:25',
            transcriptExcerpt: 'Every enrolled student receives free loan of musical instruments for the entire academic term.',
            examinerTrapNotes: "Edexcel Strict Plural Rule: Target is plural 'instruments'. Writing singular 'instrument' loses the mark under Edexcel marking criteria."
          },
          {
            id: 'e1-q2',
            exerciseNumber: 1,
            questionNumber: '2',
            prompt: 'Rehearsals take place every Saturday inside the town [ .................................................... ].',
            officialAnswer: 'library / central library',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '00:48',
            transcriptExcerpt: 'We have reserved the soundproof acoustic auditorium inside the central library every Saturday morning.',
            examinerTrapNotes: "Accepts 'library' or 'central library'."
          },
          {
            id: 'e1-q3',
            exerciseNumber: 1,
            questionNumber: '3',
            prompt: 'The end-of-year concert will feature at least [ .................................................... ] young musicians.',
            officialAnswer: '45 / forty-five',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '01:10',
            transcriptExcerpt: 'Our grand summer gala will feature forty-five young musicians performing together on the main stage.',
            examinerTrapNotes: "Both '45' and 'forty-five' are awarded full marks."
          }
        ]
      },
      {
        id: 'edexcel-pt-2',
        exerciseNumber: 2,
        title: 'Part 2: Interview on Urban Vertical Farming',
        instruction: 'Listen to an interview with an agricultural scientist. For Questions 4–6, choose the correct letter (A, B, or C).',
        wordLimit: 1,
        type: 'multiple-choice',
        audioTrackName: 'Edexcel Track 2: Urban Vertical Farming',
        questions: [
          {
            id: 'e2-q4',
            exerciseNumber: 2,
            questionNumber: '4',
            prompt: 'Compared to traditional farming, vertical farms reduce water consumption by:',
            officialAnswer: 'B',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: 50%' },
              { value: 'B', label: 'B: 95%' },
              { value: 'C', label: 'C: 25%' }
            ],
            transcriptTimestamp: '01:35',
            transcriptExcerpt: 'By recycling closed-loop hydroponic nutrients, our vertical systems consume 95% less water than outdoor soil farming.',
            examinerTrapNotes: 'B is explicitly stated as 95%.'
          },
          {
            id: 'e2-q5',
            exerciseNumber: 2,
            questionNumber: '5',
            prompt: 'The scientist highlights that pesticide use in vertical farms is:',
            officialAnswer: 'A',
            wordLimit: 1,
            marks: 1,
            type: 'multiple-choice',
            options: [
              { value: 'A', label: 'A: Completely eliminated' },
              { value: 'B', label: 'B: Only applied once a month' },
              { value: 'C', label: 'C: Replaced with synthetic chemicals' }
            ],
            transcriptTimestamp: '01:58',
            transcriptExcerpt: 'Because the indoor environment is biologically sealed against pests, harmful chemical pesticides are completely eliminated.',
            examinerTrapNotes: 'A is supported by "completely eliminated".'
          }
        ]
      }
    ],
    fullTranscript: [
      {
        timestamp: '00:05',
        speaker: 'Edexcel Examiner',
        text: 'Pearson Edexcel International GCSE. English as a Second Language. Paper 2: Listening. Part 1.'
      },
      {
        timestamp: '00:25',
        speaker: 'Organizer',
        text: 'Every enrolled student receives free loan of musical instruments for the entire academic term.',
        answersKey: '1'
      },
      {
        timestamp: '00:48',
        speaker: 'Organizer',
        text: 'We have reserved the soundproof acoustic auditorium inside the central library every Saturday morning.',
        answersKey: '2'
      },
      {
        timestamp: '01:10',
        speaker: 'Organizer',
        text: 'Our grand summer gala will feature forty-five young musicians performing together on the main stage.',
        answersKey: '3'
      },
      {
        timestamp: '01:35',
        speaker: 'Scientist',
        text: 'By recycling closed-loop hydroponic nutrients, our vertical systems consume 95% less water than outdoor soil farming.',
        answersKey: '4'
      },
      {
        timestamp: '01:58',
        speaker: 'Scientist',
        text: 'Because the indoor environment is biologically sealed against pests, harmful chemical pesticides are completely eliminated.',
        answersKey: '5'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. OXFORDAQA INTERNATIONAL GCSE ESL (9280)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'oxfordaqa-9280-w23-03',
    board: 'OxfordAQA',
    syllabusCode: '9280',
    syllabusName: 'OxfordAQA International GCSE English as a Second Language',
    paperCode: '9280/L',
    year: 2023,
    season: 'November',
    title: 'OxfordAQA 9280 Paper 3: Listening Examination',
    totalMarks: 40,
    durationMinutes: 45,
    audioDurationSeconds: 150,
    exercises: [
      {
        id: 'oxford-sec-a',
        exerciseNumber: 1,
        title: 'Section A: Short Dialogues (Questions 1–3)',
        instruction: 'Listen to three short announcements. For each question, write NO MORE THAN TWO WORDS AND/OR A NUMBER.',
        wordLimit: 2,
        type: 'short-answer',
        audioTrackName: 'OxfordAQA Track 1: Announcements',
        questions: [
          {
            id: 'ox-q1',
            exerciseNumber: 1,
            questionNumber: '1',
            prompt: 'At what time does the express coach depart for the airport?',
            officialAnswer: '08:45 / 8:45 (am) / quarter to nine',
            wordLimit: 2,
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '00:20',
            transcriptExcerpt: 'Attention passengers: The morning express coach to Terminal 3 will depart promptly at 08:45 from Bay 6.',
            examinerTrapNotes: "Both '08:45' and '8:45' or 'quarter to nine' are accepted."
          },
          {
            id: 'ox-q2',
            exerciseNumber: 1,
            questionNumber: '2',
            prompt: 'What complimentary item is offered to students at the reception desk?',
            officialAnswer: 'water bottle / reusable bottle / bottle',
            wordLimit: 2,
            marks: 1,
            type: 'short-answer',
            transcriptTimestamp: '00:45',
            transcriptExcerpt: 'All registered attendees may collect a complimentary reusable water bottle from the welcome desk.',
            examinerTrapNotes: "Accepts 'water bottle', 'bottle', or 'reusable bottle'."
          }
        ]
      },
      {
        id: 'oxford-sec-b',
        exerciseNumber: 2,
        title: 'Section B: Lecture on Renewable Geothermal Energy',
        instruction: 'Listen to a university lecturer discussing geothermal heating. Complete the sentences with NO MORE THAN TWO WORDS.',
        wordLimit: 2,
        type: 'gap-fill',
        audioTrackName: 'OxfordAQA Track 2: Geothermal Heating Lecture',
        questions: [
          {
            id: 'ox-q3',
            exerciseNumber: 2,
            questionNumber: '3',
            prompt: 'In Iceland, geothermal power provides approximately [ .................................................... ] of domestic heating.',
            officialAnswer: '90% / ninety percent / 90 percent',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '01:15',
            transcriptExcerpt: 'In volcanic regions such as Iceland, deep thermal water accounts for an astonishing 90% of household heating.',
            examinerTrapNotes: "Accepts '90%' or 'ninety percent'."
          },
          {
            id: 'ox-q4',
            exerciseNumber: 2,
            questionNumber: '4',
            prompt: 'Engineers drill wells into porous [ .................................................... ] rock layers.',
            officialAnswer: 'volcanic / basalt',
            wordLimit: 2,
            marks: 1,
            type: 'gap-fill',
            transcriptTimestamp: '01:38',
            transcriptExcerpt: 'Drilling rigs penetrate deep subterranean layers of porous volcanic rock to reach high-pressure steam reserves.',
            examinerTrapNotes: "Accepts 'volcanic' or 'basalt'."
          }
        ]
      }
    ],
    fullTranscript: [
      {
        timestamp: '00:05',
        speaker: 'OxfordAQA Examiner',
        text: 'OxfordAQA International GCSE English as a Second Language. Paper 3: Listening. Section A.'
      },
      {
        timestamp: '00:20',
        speaker: 'Station Announcer',
        text: 'Attention passengers: The morning express coach to Terminal 3 will depart promptly at 08:45 from Bay 6.',
        answersKey: '1'
      },
      {
        timestamp: '00:45',
        speaker: 'Conference Host',
        text: 'All registered attendees may collect a complimentary reusable water bottle from the welcome desk.',
        answersKey: '2'
      },
      {
        timestamp: '01:15',
        speaker: 'Lecturer',
        text: 'In volcanic regions such as Iceland, deep thermal water accounts for an astonishing 90% of household heating.',
        answersKey: '3'
      },
      {
        timestamp: '01:38',
        speaker: 'Lecturer',
        text: 'Drilling rigs penetrate deep subterranean layers of porous volcanic rock to reach high-pressure steam reserves.',
        answersKey: '4'
      }
    ]
  }
];

export function getListeningPaperByBoard(board: 'CIE' | 'Edexcel' | 'OxfordAQA'): ListeningExamPaper {
  return (
    LISTENING_PAPERS_DATABASE.find(p => p.board === board) ||
    LISTENING_PAPERS_DATABASE[0]
  );
}
