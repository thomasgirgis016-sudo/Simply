export type ExamBoard = 'CIE' | 'Edexcel' | 'Both';

export type GradeLevel = 'Year 9 / Grade 8' | 'Year 10 / Grade 9 (IGCSE Yr 1)' | 'Year 11 / Grade 10 (IGCSE Exam Yr)' | 'Year 12 / Grade 11 (AS Level)' | 'Year 13 / Grade 12 (A Level)';

export type TargetGrade = '9 / A*' | '8 / A*' | '7 / A' | '6 / B' | '5 / C';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type UserRole = 'student' | 'admin' | 'founder' | 'teacher';

export interface StaffAccessCode {
  code: string;
  name: string;
  role: 'founder' | 'admin' | 'teacher';
  email: string;
  title: string;
  createdAt: string;
}

export type SubjectLevel = 'O Level / IGCSE' | 'AS Level' | 'A Level';
export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'class' | 'school';
export type BillingCycle = 'monthly' | 'annual';

export const MAX_STUDENT_SUBJECTS = 5;

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored securely in account store
  grade: GradeLevel;
  board: ExamBoard;
  targetGrade: TargetGrade;
  selectedSubjectIds: string[]; // max 5 subjects
  role?: UserRole;
  title?: string;
  status?: AccountStatus;
  plan?: SubscriptionPlan;
  billingCycle?: BillingCycle;
  isPro?: boolean;
  proExpiresAt?: string;
  classCohortIds?: string[];
  schoolCode?: string;
  classCode?: string;
  isEnrolledViaSchool?: boolean;
  schoolName?: string;
  isTeacher?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  currentSessionToken?: string; // Enforces strictly 1 active device/session per account
  lastActiveAt?: string;
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
  code: string; // e.g. "0580", "9709", "4ES1"
  board: 'CIE' | 'Edexcel' | 'Both';
  level?: SubjectLevel; // 'O Level / IGCSE' | 'AS Level' | 'A Level'
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
  selectedSubjectIds: string[]; // max 5 subjects
  role?: UserRole;
  status?: AccountStatus;
  plan?: SubscriptionPlan;
  billingCycle?: BillingCycle;
  isPro?: boolean;
  proExpiresAt?: string;
  classCohortIds?: string[];
  schoolCode?: string;
  classCode?: string;
  isEnrolledViaSchool?: boolean;
  schoolName?: string;
  isTeacher?: boolean;
  geminiApiKey?: string; // Optional admin override
  selectedModel: string;
}

export interface BookmarkItem {
  id: string;
  type: 'past-paper' | 'revision-topic' | 'formula' | 'checklist';
  title: string;
  subtitle: string;
  subjectId: string;
  subjectCode: string;
  tab: string;
  savedAt: string;
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
  intervalDays?: number; // 1, 3, 7
  nextReviewDate?: string; // ISO date
  reviewCount?: number;
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

export interface RevisionWorkedExample {
  title: string;
  examQuestion: string;
  totalMarks: number;
  steps: Array<{
    stepNumber: number;
    title: string;
    working: string;
    markAwarded: string; // e.g. "[M1] Method Mark", "[A1] Accuracy Mark"
    explanation: string;
  }>;
  finalAnswer: string;
  examinerCommentary: string;
}

export interface RevisionTopic {
  id: string;
  subjectId: string;
  title: string;
  chapter: string;
  learningObjectives?: string[];
  keyConcepts: {
    heading: string;
    points: string[];
    formula?: string;
    diagramDescription?: string;
    diagramTitle?: string;
    diagramSvg?: string;
  }[];
  mustKnowDefinitions: {
    term: string;
    definition: string;
  }[];
  coreEquationsOrPathways?: string[];
  examinerWarnings: string[];
  diagramTitle?: string;
  diagramSvg?: string;
  workedExamples?: RevisionWorkedExample[];
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
  studentWorkingEvaluation?: {
    hasEvaluatedMath: boolean;
    totalLinesChecked: number;
    marksEarned: number;
    marksPossible: number;
    percentageScore: number;
    lineReviews: Array<{
      lineNumber: number;
      rawText: string;
      isMathEquation: boolean;
      isCorrect: boolean;
      marksEarned: number;
      markBadge: string;
      exactReason: string;
      exactCorrection?: string;
    }>;
    overallVerdict: string;
    breakdownPointOfFailure?: string;
    correctStepByStep: string[];
  };
  examinerVerification?: {
    isVerified: boolean;
    accuracyScorePercent: number;
    examinerSeal?: string;
    details?: string;
  };
}

export interface FlaggedQuestionIssue {
  id: string;
  date: string;
  questionText: string;
  subject: string;
  issueType: string;
  details?: string;
}

// 1. Handwritten Student Work Grader Types
export interface HandwrittenLineReview {
  lineNumber: number;
  studentLineText: string;
  isCorrect: boolean;
  markAwarded?: string; // e.g. "[M1] Method Mark", "[A0] Accuracy Lost", "[B1]"
  examinerAnnotation: string; // margin note
  exactCorrection?: string; // exact replacement line candidate must write
}

export interface HandwrittenReviewResult {
  questionSummary: string;
  totalMarksPossible: number;
  marksEarned: number;
  percentageScore: number;
  breakdownPointOfFailure?: string; // exact step where method broke down
  lineByLineReview: HandwrittenLineReview[];
  correctWorkingStepByStep: string[];
  examinerFinalVerdict: string;
  examinerTipsToRegainMarks: string[];
}

export interface PastPaperSubPart {
  part: string; // e.g. "(a)", "(b)(i)", "(b)(ii)", "(c)"
  marks: number;
  prompt: string;
  diagramOrMath?: string;
  markScheme: {
    markType: string; // e.g. "[M1]", "[A1]", "[B1]"
    requirement: string;
  }[];
  finalAnswer?: string;
  examinerTip?: string;
}

// 2. Past Paper Finder & Topic Classification Types
export interface PastPaperItem {
  id: string;
  subjectId: string;
  subjectCode?: string;
  subjectName: string;
  board: ExamBoard;
  session: string; // e.g. "May/June 2023 Paper 42"
  paperCode: string; // e.g. "0580/42"
  year: number;
  questionNumber: string; // e.g. "Q4(b)", "Q12"
  topic: string;
  difficultyTier: 'Core' | 'Standard Extended' | 'Grade 9 Challenge';
  snippetQuery: string; // memorable keywords e.g. "two cyclists bearing 040"
  questionPrompt: string;
  questionText?: string;
  diagramSnippet?: string;
  diagramOrMath?: string;
  marks: number;
  componentType?: 'MCQ' | 'Theory' | 'Alternative to Practical' | 'Coursework';
  subParts?: PastPaperSubPart[];
  markScheme: {
    markType: string;
    requirement: string;
  }[];
  finalAnswer: string;
  examinerReportSnippet?: string;
  pdfUrl?: string;
  markSchemePdfUrl?: string;
  isExactCodeMatch?: boolean;
}

export interface OfficialPaperPdf {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  board: ExamBoard;
  year: number;
  session: string; // e.g. "May/June 2024", "Oct/Nov 2023", "Feb/March 2022"
  seasonCode?: 's' | 'w' | 'm' | 'sp';
  paperNumber?: number; // 1, 2, 3, 4, 5, 6
  variant?: number; // 1, 2, 3
  paperComponent: string; // e.g. "Paper 4 (Extended Theory Calculator)"
  paperCode: string; // e.g. "0580/42"
  tier: 'Core' | 'Extended' | 'General';
  qpPdfUrl: string;
  msPdfUrl?: string;
  examinerReportUrl?: string;
  gradeThresholdsUrl?: string;
  backupQpUrl?: string;
  backupMsUrl?: string;
  fileSizeBytes?: string; // e.g. "1.2 MB"
}

// 3. Syllabus Interactive Specification Checklist Types
export interface SyllabusChecklistItem {
  id: string;
  subjectId: string;
  unitNumber: string; // e.g. "Topic 1"
  unitTitle: string;
  specCode: string; // e.g. "1.1.2", "C3.4"
  statement: string; // verbatim learning objective
  tier: 'Core' | 'Extended';
  confidence: 'green' | 'amber' | 'red' | 'unrated';
  notes?: string;
}

// 4. ESL Speaking Oral Exam Simulator Types
export interface EslSpeakingPrompt {
  id: string;
  title: string;
  part: 1 | 2 | 3;
  examinerPrompt: string;
  topicCardBulletPoints?: string[]; // prompts A to E on official card
  suggestedPhrases: string[];
  sampleBand9Response: string;
}

export interface GrammarCorrection {
  youSaid: string;
  better: string;
  ruleExplanation: string;
}

export interface VocabularyUpgrade {
  original: string;
  upgraded: string;
  context?: string;
}

export interface EslSpeakingEvaluation {
  totalScore?: number; // 0 to 30
  maxScore?: number; // 30
  estimatedGrade?: string; // e.g. "Grade 9 / A*"
  overallBand: number; // 1 to 10
  // Cambridge Component 5 Three Official Criteria (10 Marks Each):
  grammaticalAccuracyAndVariety?: {
    score: number;
    feedback: string;
    quotedPhrases?: string[];
    grammarCorrections?: GrammarCorrection[];
  };
  vocabulary?: {
    score: number;
    feedback: string;
    band9Upgrades?: VocabularyUpgrade[];
  };
  developmentAndFluency?: {
    score: number;
    feedback: string;
    discourseMarkersUsed?: string[];
    pacingWpm?: number;
    fillerWordsCount?: number;
    fillerWordsDetected?: string[];
  };
  // Backwards compatibility fields:
  structureAndGrammar?: { score: number; feedback: string };
  vocabularyRange?: { score: number; feedback: string };
  fluencyAndCohesion?: { score: number; feedback: string };
  pronunciationAndIntonation?: { score: number; feedback: string };
  keyStrengths?: string[];
  areasForImprovement?: string[];
  suggestedUpgradedPhrases?: { original: string; upgraded: string }[];
  followUpQuestion?: string;
  examinerRecommendations?: string[];
}

// ─────────────────────────────────────────────────────────────
// Module 1: Two-Way Payment Automation (BDC SMS + InstaPay)
// ─────────────────────────────────────────────────────────────

export interface BankTransaction {
  id: string;
  txNumber: string; // official BDC reference / رقم العملية (unique)
  amount: number; // in EGP
  source: 'BDC';
  status: 'unclaimed' | 'claimed' | 'flagged';
  receivedAt: string; // ISO date
  rawSmsText?: string;
  senderPhone?: string;
  claimedBy?: string; // studentId or studentEmail
  claimedAt?: string;
  studentReceiptId?: string;
}

export interface InstaPayReceiptExtraction {
  rawText?: string;
  txNumber: string; // Transaction reference number (رقم العملية)
  amount: number;
  recipient: string;
  sender?: string;
  date: string;
  confidenceScore: number;
  isConfirmedInstapay: boolean;
  notes?: string;
  flaggedAmbiguity?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  txNumber?: string;
  amount?: number;
  plan?: SubscriptionPlan;
  billingCycle?: BillingCycle;
  status: 'verified' | 'pending_bank_feed' | 'already_claimed' | 'amount_mismatch' | 'invalid_receipt';
  proGrantedUntil?: string;
  bankTx?: BankTransaction;
  errorDetails?: string;
}

// ─────────────────────────────────────────────────────────────
// Module 2: School & Teacher Analytics ("Google Classroom" for IGCSE)
// ─────────────────────────────────────────────────────────────

export interface ClassroomCohort {
  id: string;
  name: string; // e.g. "Year 11 Biology Set 1"
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  inviteCode: string; // e.g. "BIO-Y11-S1"
  schoolDomain?: string; // e.g. "cairoschool.edu.eg"
  studentIds: string[];
  createdAt: string;
}

export interface ClassAssignment {
  id: string;
  classId: string;
  title: string;
  type: 'quiz' | 'past-paper' | 'syllabus-topic' | 'remedial-drill';
  topic: string;
  targetPaperOrQuizId?: string;
  dueDate: string;
  assignedAt: string;
  totalSubmissions: number;
  averageScore: number;
}

export interface DiagnosticErrorItem {
  id: string;
  questionRef: string; // e.g. "0580/42 May/June 2023 Q4(b)"
  topic: string;
  chapter: string;
  failureRatePercent: number; // e.g. 74
  totalAttempts: number;
  errorPatternSummary: string; // e.g. "74% of students missed Question 4(b) on Vector Bearings due to angle calculation slips"
  scientificKeywordOmissions?: string[]; // e.g. ["active site denatures", "loss of electrons"]
  remedialRecommendation: string;
  tier: 'Core' | 'Extended' | 'Grade 9 Challenge';
}

export interface ClassRemedialDrill {
  id: string;
  classId: string;
  className: string;
  generatedAt: string;
  focusTopics: string[];
  targetedQuestions: PastPaperItem[];
  instructions: string;
}

// ─────────────────────────────────────────────────────────────
// Module 4: Past Paper QA Verification Agent Types
// ─────────────────────────────────────────────────────────────

export interface PastPaperQaItemIssue {
  paperId: string;
  paperCode: string;
  questionNumber: string;
  issueType: 'missing_diagram' | 'invalid_katex' | 'missing_markscheme' | 'zero_marks' | 'count_mismatch' | 'broken_link';
  details: string;
  snippet?: string;
}

export interface PastPaperQaSummaryReport {
  scannedAt: string;
  totalQuestionsScanned: number;
  totalPdfsScanned: number;
  passedCount: number;
  failedCount: number;
  katexSyntaxErrors: number;
  missingMarkSchemes: number;
  formatMismatches: number;
  issues: PastPaperQaItemIssue[];
  healthScorePercent: number;
}

