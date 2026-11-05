export interface TanzimGradeOption {
  code: string;
  label: string;
  percentage: number;
  system: 'numerical' | 'letter';
}

export const O_LEVEL_GRADES: TanzimGradeOption[] = [
  { code: '9', label: 'Grade 9 (100%)', percentage: 100.0, system: 'numerical' },
  { code: 'A*', label: 'Grade A* (100%)', percentage: 100.0, system: 'letter' },
  { code: '8', label: 'Grade 8 (95%)', percentage: 95.0, system: 'numerical' },
  { code: 'A', label: 'Grade A (95%)', percentage: 95.0, system: 'letter' },
  { code: '7', label: 'Grade 7 (90%)', percentage: 90.0, system: 'numerical' },
  { code: '6', label: 'Grade 6 (85%)', percentage: 85.0, system: 'numerical' },
  { code: 'B', label: 'Grade B (85%)', percentage: 85.0, system: 'letter' },
  { code: '5', label: 'Grade 5 (77.5%)', percentage: 77.5, system: 'numerical' },
  { code: '4', label: 'Grade 4 (70%)', percentage: 70.0, system: 'numerical' },
  { code: 'C', label: 'Grade C (70%)', percentage: 70.0, system: 'letter' },
  { code: '3', label: 'Grade 3 (Ineligible - 0%)', percentage: 0.0, system: 'numerical' },
  { code: 'D', label: 'Grade D (Ineligible - 0%)', percentage: 0.0, system: 'letter' },
];

export const AS_LEVEL_GRADES: TanzimGradeOption[] = [
  { code: 'A', label: 'AS Grade A (95%)', percentage: 95.0, system: 'letter' },
  { code: 'B', label: 'AS Grade B (85%)', percentage: 85.0, system: 'letter' },
  { code: 'C', label: 'AS Grade C (75%)', percentage: 75.0, system: 'letter' },
  { code: 'D', label: 'AS Grade D (Ineligible)', percentage: 0.0, system: 'letter' },
];

export const A_LEVEL_GRADES: TanzimGradeOption[] = [
  { code: 'A*', label: 'A-Level Grade A* (100%)', percentage: 100.0, system: 'letter' },
  { code: 'A', label: 'A-Level Grade A (95%)', percentage: 95.0, system: 'letter' },
  { code: 'B', label: 'A-Level Grade B (85%)', percentage: 85.0, system: 'letter' },
  { code: 'C', label: 'A-Level Grade C (Ineligible)', percentage: 0.0, system: 'letter' },
];

export interface TanzimSubjectDef {
  id: string;
  name: string;
  category: 'Sciences' | 'Mathematics' | 'Languages' | 'Humanities' | 'Commercial' | 'General';
}

export const TANZIM_POPULAR_SUBJECTS: TanzimSubjectDef[] = [
  { id: 'english', name: 'English (First / Second Language)', category: 'Languages' },
  { id: 'maths', name: 'Mathematics (0580 / 4MA1)', category: 'Mathematics' },
  { id: 'biology', name: 'Biology (0610 / 4BI1)', category: 'Sciences' },
  { id: 'chemistry', name: 'Chemistry (0620 / 4CH1)', category: 'Sciences' },
  { id: 'physics', name: 'Physics (0625 / 4PH1)', category: 'Sciences' },
  { id: 'cs', name: 'Computer Science (0478 / 4CP0)', category: 'Sciences' },
  { id: 'ict', name: 'ICT (0417 / 4IT1)', category: 'Sciences' },
  { id: 'arabic', name: 'Arabic (First / Second Language)', category: 'Languages' },
  { id: 'french', name: 'French (0520 / 4FR1)', category: 'Languages' },
  { id: 'business', name: 'Business Studies (0450 / 4BS1)', category: 'Commercial' },
  { id: 'economics', name: 'Economics (0455 / 4EC1)', category: 'Commercial' },
  { id: 'accounting', name: 'Accounting (0452 / 4AC1)', category: 'Commercial' },
  { id: 'geography', name: 'Geography (0460 / 4GE1)', category: 'Humanities' },
  { id: 'history', name: 'History (0470 / 4HI1)', category: 'Humanities' },
  { id: 'environmental', name: 'Environmental Management (0680)', category: 'Sciences' },
  { id: 'art', name: 'Art & Design (0400)', category: 'General' },
];

export interface StudentOLevelEntry {
  id: string;
  subjectName: string;
  gradeCode: string;
}

export interface StudentAdvancedEntry {
  id: string;
  level: 'AS' | 'AL';
  subjectName: string;
  gradeCode: string;
}

export interface FacultyRequirementStatus {
  id: 'medical' | 'engineering' | 'business';
  title: string;
  description: string;
  isEligible: boolean;
  missingRequirements: string[];
}

export interface UniversityBenchmark {
  university: string;
  faculty: string;
  type: 'Public' | 'National' | 'Private';
  minHistoricalPercentage: number;
  description: string;
  location: string;
}

export const UNIVERSITY_BENCHMARKS: UniversityBenchmark[] = [
  {
    university: 'Cairo / Ain Shams / Alex Univ',
    faculty: 'Faculty of Medicine (طب بشري)',
    type: 'Public',
    minHistoricalPercentage: 98.7,
    description: 'Requires 8 OLs + 1 AL (or 2 AS) in Biology. Highest competitive threshold in public Tanzim.',
    location: 'Giza / Cairo / Alexandria'
  },
  {
    university: 'Cairo / Ain Shams Univ',
    faculty: 'Faculty of Dentistry (طب أسنان)',
    type: 'Public',
    minHistoricalPercentage: 98.2,
    description: 'Requires 8 OLs with Chemistry & Biology + AL Biology.',
    location: 'Cairo'
  },
  {
    university: 'Cairo / Ain Shams Univ',
    faculty: 'Faculty of Pharmacy (صيدلة)',
    type: 'Public',
    minHistoricalPercentage: 97.4,
    description: 'Requires 8 OLs + AL Biology or Chemistry.',
    location: 'Cairo'
  },
  {
    university: 'Cairo / Ain Shams Univ',
    faculty: 'Faculty of Engineering (هندسة)',
    type: 'Public',
    minHistoricalPercentage: 96.8,
    description: 'Requires 8 OLs including Physics & Chemistry + AS/AL Mathematics.',
    location: 'Cairo'
  },
  {
    university: 'Cairo / Ain Shams Univ',
    faculty: 'Computer Science & AI (حاسبات ومعلومات)',
    type: 'Public',
    minHistoricalPercentage: 95.5,
    description: 'Requires 8 OLs + AS/AL Mathematics. High demand tech track.',
    location: 'Cairo'
  },
  {
    university: 'German University in Cairo (GUC)',
    faculty: 'Pharmacy & Biotechnology',
    type: 'Private',
    minHistoricalPercentage: 85.0,
    description: 'Accredited German curriculum. Requires English, Chemistry, Biology + Maths.',
    location: 'New Cairo'
  },
  {
    university: 'German University in Cairo (GUC)',
    faculty: 'Engineering & Informatics (CS)',
    type: 'Private',
    minHistoricalPercentage: 88.0,
    description: 'Rigorous engineering programs with compulsory German language courses.',
    location: 'New Cairo'
  },
  {
    university: 'American University in Cairo (AUC)',
    faculty: 'School of Sciences & Engineering',
    type: 'Private',
    minHistoricalPercentage: 92.0,
    description: 'US-accredited liberal arts and engineering. English proficiency (IELTS/TOEFL) required.',
    location: 'New Cairo'
  },
  {
    university: 'American University in Cairo (AUC)',
    faculty: 'School of Business & Economics',
    type: 'Private',
    minHistoricalPercentage: 89.0,
    description: 'Triple-crown accredited business school. Requires English and Maths.',
    location: 'New Cairo'
  },
  {
    university: 'British University in Egypt (BUE)',
    faculty: 'Faculty of Dentistry & Pharmacy',
    type: 'Private',
    minHistoricalPercentage: 84.0,
    description: 'Dual UK/Egyptian degree program validated by London South Bank University.',
    location: 'El Sherouk City'
  },
  {
    university: 'British University in Egypt (BUE)',
    faculty: 'Faculty of Engineering & Computer Science',
    type: 'Private',
    minHistoricalPercentage: 76.0,
    description: 'UK-validated engineering faculties with modern laboratories.',
    location: 'El Sherouk City'
  },
  {
    university: 'Galala / New Alamein University',
    faculty: 'Medicine & Health Sciences',
    type: 'National',
    minHistoricalPercentage: 82.0,
    description: 'Modern 4th generation national universities (الجامعات الأهلية) with government subsidised fees.',
    location: 'Galala / New Alamein'
  },
  {
    university: 'Galala / New Alamein University',
    faculty: 'Computer Science & Artificial Intelligence',
    type: 'National',
    minHistoricalPercentage: 68.0,
    description: 'Modern AI & Robotics degree programs partnered with Arizona State University (ASU).',
    location: 'Galala / New Alamein'
  }
];

export function getOLevelGradePercentage(gradeCode: string): number {
  const match = O_LEVEL_GRADES.find(g => g.code.toUpperCase() === gradeCode.trim().toUpperCase());
  return match ? match.percentage : 0;
}

export function getAdvancedGradePercentage(level: 'AS' | 'AL', gradeCode: string): number {
  const list = level === 'AS' ? AS_LEVEL_GRADES : A_LEVEL_GRADES;
  const match = list.find(g => g.code.toUpperCase() === gradeCode.trim().toUpperCase());
  return match ? match.percentage : 0;
}

export interface TanzimCalculationResult {
  pureOLevelPercentage: number;
  totalOLevelPoints: number;
  activeOLevelCount: number;
  compositePercentage: number;
  totalCompositePoints: number;
  maxCompositePoints: number;
  hasAdvanced: boolean;
  honorBand: string;
}

export function calculateTanzimScore(
  oLevels: StudentOLevelEntry[],
  advanced: StudentAdvancedEntry[]
): TanzimCalculationResult {
  // Sort O-Levels by percentage descending to guarantee "Best 8"
  const sortedOL = [...oLevels]
    .map(entry => ({
      ...entry,
      percentage: getOLevelGradePercentage(entry.gradeCode)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const best8 = sortedOL.slice(0, 8);
  const totalOLevelPoints = best8.reduce((sum, item) => sum + item.percentage, 0);
  const activeOLevelCount = best8.length;
  const pureOLevelPercentage = activeOLevelCount > 0 ? totalOLevelPoints / 8 : 0;

  // Process Advanced Supplements
  const validAdvanced = advanced.filter(adv => adv.subjectName && adv.gradeCode);
  const hasAdvanced = validAdvanced.length > 0;

  let totalAdvancedPoints = 0;
  let maxAdvancedPoints = 0;

  for (const adv of validAdvanced) {
    const pts = getAdvancedGradePercentage(adv.level, adv.gradeCode);
    totalAdvancedPoints += pts;
    maxAdvancedPoints += 100; // Each AS or AL adds 100 to maximum score denominator
  }

  const totalCompositePoints = totalOLevelPoints + totalAdvancedPoints;
  const maxCompositePoints = 800 + maxAdvancedPoints;
  const compositePercentage = maxCompositePoints > 0 ? (totalCompositePoints / maxCompositePoints) * 100 : 0;

  let honorBand = 'Below Threshold';
  const effectivePct = hasAdvanced ? compositePercentage : pureOLevelPercentage;
  if (effectivePct >= 98.0) honorBand = 'Top Tier (Public Medicine & Dentistry)';
  else if (effectivePct >= 95.0) honorBand = 'High Honor (Public Engineering / CS / AUC)';
  else if (effectivePct >= 90.0) honorBand = 'Very High (Top Tier Private Medicine / Engineering)';
  else if (effectivePct >= 80.0) honorBand = 'High (National & Private Universities)';
  else if (effectivePct >= 70.0) honorBand = 'Eligible (General Private University Admission)';

  return {
    pureOLevelPercentage: Number(pureOLevelPercentage.toFixed(2)),
    totalOLevelPoints: Number(totalOLevelPoints.toFixed(2)),
    activeOLevelCount,
    compositePercentage: Number(compositePercentage.toFixed(2)),
    totalCompositePoints: Number(totalCompositePoints.toFixed(2)),
    maxCompositePoints,
    hasAdvanced,
    honorBand
  };
}

export function checkFacultyEligibility(
  oLevels: StudentOLevelEntry[],
  advanced: StudentAdvancedEntry[]
): FacultyRequirementStatus[] {
  const norm = (s: string) => s.toLowerCase();

  const olNames = oLevels.map(o => norm(o.subjectName));
  const advNames = advanced.map(a => norm(a.subjectName));
  const allMaths = olNames.some(s => s.includes('math')) || advNames.some(s => s.includes('math'));
  const allEnglish = olNames.some(s => s.includes('english'));
  const allBio = olNames.some(s => s.includes('bio')) || advNames.some(s => s.includes('bio'));
  const allChem = olNames.some(s => s.includes('chem')) || advNames.some(s => s.includes('chem'));
  const allPhys = olNames.some(s => s.includes('phys')) || advNames.some(s => s.includes('phys'));
  
  // Check AS/AL Maths
  const hasAdvancedMaths = advanced.some(
    a => (a.level === 'AS' || a.level === 'AL') && norm(a.subjectName).includes('math') && getAdvancedGradePercentage(a.level, a.gradeCode) >= 70
  );

  // Medical Track Check
  const medMissing: string[] = [];
  if (!allEnglish) medMissing.push('English (OL)');
  if (!allBio) medMissing.push('Biology (OL)');
  if (!allChem) medMissing.push('Chemistry (OL)');
  if (!allPhys) medMissing.push('Physics (OL)');
  if (!allMaths) medMissing.push('Mathematics (OL)');

  // Engineering Track Check
  const engMissing: string[] = [];
  if (!allEnglish) engMissing.push('English (OL)');
  if (!allMaths) engMissing.push('Mathematics (OL)');
  if (!allPhys) engMissing.push('Physics (OL)');
  if (!allChem) engMissing.push('Chemistry (OL)');
  if (!hasAdvancedMaths) engMissing.push('AS / AL Mathematics');

  // Business Track Check
  const bizMissing: string[] = [];
  if (!allEnglish) bizMissing.push('English (OL)');
  if (!allMaths) bizMissing.push('Mathematics (OL)');

  return [
    {
      id: 'medical',
      title: 'Medical & Dental Track',
      description: 'Medicine, Dentistry, Pharmacy, Physical Therapy & Biotechnology',
      isEligible: medMissing.length === 0,
      missingRequirements: medMissing
    },
    {
      id: 'engineering',
      title: 'Engineering & Computing Track',
      description: 'Engineering, Architecture, Computer Science, AI & Informatics',
      isEligible: engMissing.length === 0,
      missingRequirements: engMissing
    },
    {
      id: 'business',
      title: 'Business, Economics & Arts Track',
      description: 'Business Administration, Economics, Mass Comm, Arts & Humanities',
      isEligible: bizMissing.length === 0,
      missingRequirements: bizMissing
    }
  ];
}
