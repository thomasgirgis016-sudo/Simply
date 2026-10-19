import { ClassroomCohort, ClassAssignment, DiagnosticErrorItem, ClassRemedialDrill, PastPaperItem } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';

const STORAGE_KEY_COHORTS = 'simply_igcse_cohorts';
const STORAGE_KEY_ASSIGNMENTS = 'simply_igcse_class_assignments';

export const INITIAL_COHORTS: ClassroomCohort[] = [
  {
    id: 'cohort-bio-1',
    name: 'Year 11 Biology Set 1 (Extended)',
    subjectId: 'cie-bio-0610',
    subjectCode: '0610',
    subjectName: 'Biology',
    teacherId: 'teacher-101',
    teacherName: 'Dr. Sarah Mansour',
    teacherEmail: 's.mansour@cairoschool.edu.eg',
    inviteCode: 'BIO-Y11-S1',
    schoolDomain: 'cairoschool.edu.eg',
    studentIds: ['std-1', 'std-2', 'std-3', 'std-4', 'std-5'],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cohort-math-1',
    name: '0580 Mathematics Extended A* Cohort',
    subjectId: 'cie-math-0580',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    teacherId: 'teacher-102',
    teacherName: 'Mr. Mark Williams',
    teacherEmail: 'm.williams@cairoschool.edu.eg',
    inviteCode: 'MTH-0580-X',
    schoolDomain: 'cairoschool.edu.eg',
    studentIds: ['std-1', 'std-3', 'std-6', 'std-7'],
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cohort-chem-1',
    name: 'Year 10 Chemistry Core & Extended',
    subjectId: 'cie-chem-0620',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    teacherId: 'teacher-103',
    teacherName: 'Eng. Ahmed Tarek',
    teacherEmail: 'a.tarek@cairoschool.edu.eg',
    inviteCode: 'CHM-0620-Y10',
    schoolDomain: 'cairoschool.edu.eg',
    studentIds: ['std-2', 'std-4', 'std-8'],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  }
];

export const DIAGNOSTIC_ERROR_DATABASE: Record<string, DiagnosticErrorItem[]> = {
  'cohort-bio-1': [
    {
      id: 'err-bio-1',
      questionRef: 'CIE 0610/42 May/June 2023 Q3(a)(ii)',
      topic: 'Enzymes & Protein Denaturation',
      chapter: 'Chapter 5: Enzymes',
      failureRatePercent: 78,
      totalAttempts: 28,
      errorPatternSummary: '78% of students lost marks by writing "the enzyme dies or is killed" instead of describing active site denaturation.',
      scientificKeywordOmissions: [
        'active site denatures',
        'substrate can no longer fit / no enzyme-substrate complexes form',
        'loss of complementary 3D tertiary structure'
      ],
      remedialRecommendation: 'Emphasize that enzymes are proteins, not living organisms, so they denature rather than die.',
      tier: 'Extended'
    },
    {
      id: 'err-bio-2',
      questionRef: 'CIE 0610/41 Oct/Nov 2022 Q5(b)',
      topic: 'Photosynthesis & Limiting Factors',
      chapter: 'Chapter 6: Plant Nutrition',
      failureRatePercent: 64,
      totalAttempts: 28,
      errorPatternSummary: '64% of students misidentified the limiting factor plateau on light intensity vs rate of photosynthesis graphs.',
      scientificKeywordOmissions: [
        'light intensity is no longer limiting',
        'carbon dioxide concentration or temperature becomes the limiting factor'
      ],
      remedialRecommendation: 'Practice interpreting dual-curve plateau graphs with varying CO2 and temperature.',
      tier: 'Grade 9 Challenge'
    },
    {
      id: 'err-bio-3',
      questionRef: 'CIE 0610/42 May/June 2024 Q2(c)',
      topic: 'Osmosis & Water Potential',
      chapter: 'Chapter 3: Movement in and Out of Cells',
      failureRatePercent: 52,
      totalAttempts: 28,
      errorPatternSummary: 'Students omitted "partially permeable membrane" when defining osmosis, losing the compulsory B1 definition mark.',
      scientificKeywordOmissions: [
        'partially permeable membrane',
        'down a water potential gradient / from high to low water potential'
      ],
      remedialRecommendation: 'Mandatory memorization drill of Cambridge verbatim osmosis rubric.',
      tier: 'Core'
    }
  ],
  'cohort-math-1': [
    {
      id: 'err-math-1',
      questionRef: 'CIE 0580/42 May/June 2023 Q6(b)',
      topic: 'Trigonometry & Bearings',
      chapter: 'Chapter 14: Trigonometry',
      failureRatePercent: 74,
      totalAttempts: 32,
      errorPatternSummary: '74% of students missed Question 6(b) on Vector Bearings due to angle calculation slips (subtracted 040° from 115° incorrectly) and forgot to convert speed to distance.',
      scientificKeywordOmissions: [
        'd = s × t distance conversion',
        'cosine rule angle C = 75°',
        '3 significant figures rounding rule'
      ],
      remedialRecommendation: 'Step-by-step bearings sketch drills and cosine rule non-right angled triangles.',
      tier: 'Grade 9 Challenge'
    },
    {
      id: 'err-math-2',
      questionRef: 'CIE 0580/42 May/June 2022 Q9(b)',
      topic: 'Vectors & Collinearity Proof',
      chapter: 'Chapter 18: Vectors & Transformations',
      failureRatePercent: 69,
      totalAttempts: 32,
      errorPatternSummary: 'Students proved vectors were parallel scalar multiples but failed to explicitly write "vectors share a common point M, therefore points are collinear".',
      scientificKeywordOmissions: [
        'scalar multiple proof: NM = k(NP)',
        'common point statement required for collinearity'
      ],
      remedialRecommendation: 'Rigorous vector proof template writing.',
      tier: 'Grade 9 Challenge'
    },
    {
      id: 'err-math-3',
      questionRef: 'CIE 0580/41 May/June 2024 Q5(a)',
      topic: 'Mensuration: Cones & Frustums',
      chapter: 'Chapter 12: Mensuration',
      failureRatePercent: 58,
      totalAttempts: 32,
      errorPatternSummary: 'Calculated whole cone volume but subtracted hemisphere instead of smaller cut cone.',
      scientificKeywordOmissions: [
        'similar triangles radius ratio 10/30 = 1/3',
        'frustum = large cone - small cone'
      ],
      remedialRecommendation: '3D geometry frustum decomposition exercises.',
      tier: 'Extended'
    }
  ],
  'cohort-chem-1': [
    {
      id: 'err-chem-1',
      questionRef: 'CIE 0620/41 May/June 2023 Q4(c)',
      topic: 'Electrolysis & Selective Discharge',
      chapter: 'Chapter 5: Electricity & Chemistry',
      failureRatePercent: 71,
      totalAttempts: 24,
      errorPatternSummary: 'Students failed to identify that OH- discharges preferentially over sulfate ions at the anode in dilute solutions.',
      scientificKeywordOmissions: [
        'hydroxide ions discharge producing oxygen and water',
        '4OH- -> O2 + 2H2O + 4e-',
        'loss of electrons (oxidation) at anode'
      ],
      remedialRecommendation: 'Aqueous electrolysis discharge order flowcharts.',
      tier: 'Grade 9 Challenge'
    },
    {
      id: 'err-chem-2',
      questionRef: 'CIE 0620/42 Oct/Nov 2022 Q2(d)',
      topic: 'Redox & Oxidation States',
      chapter: 'Chapter 7: Chemical Reactions',
      failureRatePercent: 59,
      totalAttempts: 24,
      errorPatternSummary: 'Students explained redox in terms of oxygen gain/loss when the question explicitly demanded electron transfer terms (OIL RIG).',
      scientificKeywordOmissions: [
        'Oxidation is loss of electrons',
        'Reduction is gain of electrons',
        'Oxidation state change calculation'
      ],
      remedialRecommendation: 'Enforce electron-only definitions when asked in Paper 4.',
      tier: 'Extended'
    }
  ]
};

export function getCohorts(): ClassroomCohort[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COHORTS);
    if (raw) {
      const parsed: ClassroomCohort[] = JSON.parse(raw);
      const existingIds = new Set(parsed.map(c => c.id));
      const missing = INITIAL_COHORTS.filter(c => !existingIds.has(c.id));
      return [...parsed, ...missing];
    }
  } catch (e) {
    console.error('Error loading cohorts:', e);
  }
  return INITIAL_COHORTS;
}

export function saveCohorts(cohorts: ClassroomCohort[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COHORTS, JSON.stringify(cohorts));
  } catch (e) {
    console.error('Error saving cohorts:', e);
  }
}

export function createCohort(params: {
  name: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  teacherEmail: string;
  schoolDomain?: string;
}): ClassroomCohort {
  const current = getCohorts();
  const initials = params.subjectCode.toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const inviteCode = `${initials}-${randomSuffix}`;

  const newCohort: ClassroomCohort = {
    id: `cohort-${Date.now()}`,
    name: params.name,
    subjectId: params.subjectId,
    subjectCode: params.subjectCode,
    subjectName: params.subjectName,
    teacherId: `teacher-${Date.now()}`,
    teacherName: params.teacherName,
    teacherEmail: params.teacherEmail,
    inviteCode,
    schoolDomain: params.schoolDomain || 'school.edu.eg',
    studentIds: [],
    createdAt: new Date().toISOString()
  };

  const updated = [newCohort, ...current];
  saveCohorts(updated);
  return newCohort;
}

export function getDiagnosticErrorsForCohort(cohortId: string): DiagnosticErrorItem[] {
  return DIAGNOSTIC_ERROR_DATABASE[cohortId] || DIAGNOSTIC_ERROR_DATABASE['cohort-bio-1'] || [];
}

export function generateClassRemedialDrill(cohort: ClassroomCohort): ClassRemedialDrill {
  const errors = getDiagnosticErrorsForCohort(cohort.id);
  const weakTopics = errors.map(e => e.topic);

  // Find relevant past paper questions that match these weak topics
  const matchingQuestions: PastPaperItem[] = PAST_PAPERS_DATABASE.filter(p =>
    p.subjectId === cohort.subjectId ||
    weakTopics.some(t => p.topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(p.topic.toLowerCase()))
  ).slice(0, 4);

  // If none matched exact subject, fallback to top questions
  const finalQuestions = matchingQuestions.length > 0 ? matchingQuestions : PAST_PAPERS_DATABASE.slice(0, 4);

  return {
    id: `drill-${Date.now()}`,
    classId: cohort.id,
    className: cohort.name,
    generatedAt: new Date().toISOString(),
    focusTopics: weakTopics,
    targetedQuestions: finalQuestions,
    instructions: `Targeted Class Remedial Drill generated for ${cohort.name}. Addresses the top ${weakTopics.length} syllabus misconception chapters where over 50% of students dropped method marks.`
  };
}
