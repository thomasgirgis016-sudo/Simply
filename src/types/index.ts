export type ExamBoard = 'CIE' | 'Edexcel' | 'Both';

export type GradeLevel = 'Year 9 / Grade 8' | 'Year 10 / Grade 9 (IGCSE Yr 1)' | 'Year 11 / Grade 10 (IGCSE Exam Yr)';

export type TargetGrade = '9 / A*' | '8 / A*' | '7 / A' | '6 / B' | '5 / C';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored securely in account store
  grade: GradeLevel;
  board: ExamBoard;
  targetGrade: TargetGrade;
  selectedSubjectIds: string[];
  createdAt: string;
}

export interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. "0580", "0510", "4ES1"
  board: 'CIE' | 'Edexcel' | 'Both';
  category: 'Sciences' | 'Mathematics' | 'Humanities' | 'Languages' | 'Tech' | 'Commercial';
  icon: string;
  color: string;
  topics: string[];
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  grade: GradeLevel;
  board: ExamBoard;
  targetGrade: TargetGrade;
  selectedSubjectIds: string[];
  geminiApiKey?: string; // Optional admin override
  selectedModel: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  answer: string;
  keyFormula?: string;
  examinerTip?: string;
  difficulty: 'Core' | 'Extended' | 'Hard';
  mastered?: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  subjectId: string;
  topic: string;
  paperReference?: string; // e.g. "CIE 0580/42 May/June 2023", "CIE 0510/22"
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  markSchemeExplanation: string;
  marks: number;
  markingBreakdown: string[]; // e.g. ["[M1] For applying formula", "[A1] For accurate value"]
  tier?: 'Core' | 'Extended';
}

export interface QuizHistoryEntry {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  score: number;
  totalQuestions: number;
  marksEarned: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
}

export interface RevisionTopic {
  id: string;
  subjectId: string;
  title: string;
  chapter: string;
  keyConcepts: {
    heading: string;
    points: string[];
    formula?: string;
    diagramDescription?: string;
  }[];
  mustKnowDefinitions: {
    term: string;
    definition: string;
  }[];
  examinerWarnings: string[];
}

export interface FormulaItem {
  id: string;
  subjectId: string;
  topic: string;
  name: string;
  formula: string;
  whereVariables: string;
  units: string;
  examTip: string;
}

export interface CommandWord {
  word: string;
  definition: string;
  whatExaminersExpect: string;
  example: string;
}

export interface SolverResult {
  questionText: string;
  subject: string;
  topic: string;
  totalMarks: number;
  coreConceptAndFormula?: {
    concept: string;
    formula?: string;
  };
  stepByStepSolution: {
    stepNumber: number;
    title: string;
    explanation: string;
    mathOrCode?: string;
    markAwarded?: string; // e.g. "[M1] Method Mark"
  }[];
  finalAnswer: string;
  examinerTraps?: string[];
  markSchemeBreakdown?: string[];
  examinerTips?: string[];
  commonMistakes?: string[];
  relatedTopic?: string;
}

export interface FlaggedQuestionIssue {
  id: string;
  date: string;
  questionText: string;
  subject: string;
  issueType: string;
  details?: string;
}
