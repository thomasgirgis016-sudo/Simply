import {
  O_LEVEL_GRADES,
  AS_LEVEL_GRADES,
  A_LEVEL_GRADES,
  getOLevelGradePercentage,
  getAdvancedGradePercentage,
  calculateTanzimScore,
  checkFacultyEligibility,
  UNIVERSITY_BENCHMARKS,
  StudentOLevelEntry,
  StudentAdvancedEntry
} from '../src/data/tanzimData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ FAILED: ${msg}`);
  }
}

console.log('===========================================================');
console.log('  EGYPTIAN UNIVERSITY TANZIM CALCULATOR AUDIT');
console.log('===========================================================\n');

// 1. Grade Conversion Verification
console.log('--- 1. Grade Conversion & Scale Verification ---');
assert(getOLevelGradePercentage('9') === 100.0, 'Grade 9 should equal 100%');
assert(getOLevelGradePercentage('A*') === 100.0, 'Grade A* should equal 100%');
assert(getOLevelGradePercentage('8') === 95.0, 'Grade 8 should equal 95%');
assert(getOLevelGradePercentage('A') === 95.0, 'Grade A should equal 95%');
assert(getOLevelGradePercentage('7') === 90.0, 'Grade 7 should equal 90%');
assert(getOLevelGradePercentage('6') === 85.0, 'Grade 6 should equal 85%');
assert(getOLevelGradePercentage('B') === 85.0, 'Grade B should equal 85%');
assert(getOLevelGradePercentage('5') === 77.5, 'Grade 5 should equal 77.5%');
assert(getOLevelGradePercentage('4') === 70.0, 'Grade 4 should equal 70%');
assert(getOLevelGradePercentage('C') === 70.0, 'Grade C should equal 70%');
assert(getOLevelGradePercentage('3') === 0.0, 'Grade 3 should equal 0% (Ineligible under Tanzim)');
assert(getOLevelGradePercentage('D') === 0.0, 'Grade D should equal 0% (Ineligible under Tanzim)');

assert(getAdvancedGradePercentage('AS', 'A') === 95.0, 'AS Grade A should equal 95%');
assert(getAdvancedGradePercentage('AS', 'B') === 85.0, 'AS Grade B should equal 85%');
assert(getAdvancedGradePercentage('AS', 'C') === 75.0, 'AS Grade C should equal 75%');
assert(getAdvancedGradePercentage('AS', 'D') === 0.0, 'AS Grade D should equal 0% (Ineligible)');

assert(getAdvancedGradePercentage('AL', 'A*') === 100.0, 'AL Grade A* should equal 100%');
assert(getAdvancedGradePercentage('AL', 'A') === 95.0, 'AL Grade A should equal 95%');
assert(getAdvancedGradePercentage('AL', 'B') === 85.0, 'AL Grade B should equal 85%');

// 2. Best 8 O-Level Calculation Logic
console.log('\n--- 2. Best 8 O-Level Calculation Logic ---');
// Straight 9s
const all9s: StudentOLevelEntry[] = Array(8).fill(null).map((_, i) => ({
  id: `ol-${i}`,
  subjectName: `Subject ${i}`,
  gradeCode: '9'
}));
const resAll9s = calculateTanzimScore(all9s, []);
assert(resAll9s.pureOLevelPercentage === 100.0, '8 Grade 9s should equal 100% pure score');
assert(resAll9s.totalOLevelPoints === 800.0, '8 Grade 9s should equal 800 points');
assert(resAll9s.activeOLevelCount === 8, 'Active OL count should be 8');

// Mixed Grades
const mixedOL: StudentOLevelEntry[] = [
  { id: '1', subjectName: 'Eng', gradeCode: '9' },   // 100
  { id: '2', subjectName: 'Math', gradeCode: '8' },  // 95
  { id: '3', subjectName: 'Bio', gradeCode: '8' },   // 95
  { id: '4', subjectName: 'Chem', gradeCode: '7' },  // 90
  { id: '5', subjectName: 'Phys', gradeCode: '6' },  // 85
  { id: '6', subjectName: 'CS', gradeCode: '5' },    // 77.5
  { id: '7', subjectName: 'Arab', gradeCode: '4' },  // 70
  { id: '8', subjectName: 'French', gradeCode: '9' },// 100
];
// Total = 100 + 95 + 95 + 90 + 85 + 77.5 + 70 + 100 = 712.5. Avg = 712.5 / 8 = 89.0625 -> 89.06%
const resMixed = calculateTanzimScore(mixedOL, []);
assert(resMixed.pureOLevelPercentage === 89.06, `Mixed score expected 89.06%, got ${resMixed.pureOLevelPercentage}%`);
assert(resMixed.totalOLevelPoints === 712.5, `Mixed points expected 712.5, got ${resMixed.totalOLevelPoints}`);

// Best 8 selection when 9 subjects provided (dropping lowest)
const nineOL: StudentOLevelEntry[] = [
  ...all9s.slice(0, 7), // 7 x 100 = 700
  { id: '8', subjectName: 'Good', gradeCode: '8' },  // 95
  { id: '9', subjectName: 'Bad', gradeCode: '4' },   // 70 (should be excluded)
];
const resNine = calculateTanzimScore(nineOL, []);
// Best 8: 7x100 + 95 = 795 / 8 = 99.375 -> 99.38%
assert(resNine.pureOLevelPercentage === 99.38, `Best 8 auto-selection expected 99.38%, got ${resNine.pureOLevelPercentage}%`);
assert(resNine.totalOLevelPoints === 795.0, `Best 8 points expected 795, got ${resNine.totalOLevelPoints}`);

// 3. Composite Calculation with AS and AL
console.log('\n--- 3. Advanced Level Supplements Composite ---');
// 8 Grade 9s (800) + 1 AL Grade A (95) -> 895 / 900 = 99.444 -> 99.44%
const advAL: StudentAdvancedEntry[] = [
  { id: 'al-1', level: 'AL', subjectName: 'Mathematics', gradeCode: 'A' }
];
const resAL = calculateTanzimScore(all9s, advAL);
assert(resAL.hasAdvanced === true, 'Should detect advanced level presence');
assert(resAL.maxCompositePoints === 900, 'Max composite points for 8 OL + 1 AL should be 900');
assert(resAL.totalCompositePoints === 895.0, 'Total composite points should be 895');
assert(resAL.compositePercentage === 99.44, `Composite percentage expected 99.44%, got ${resAL.compositePercentage}%`);

// 4. Faculty Requirements Audit
console.log('\n--- 4. Faculty Requirements Audit ---');
// Medical track requires English, Biology, Chemistry, Physics, Maths
const medSubjects: StudentOLevelEntry[] = [
  { id: '1', subjectName: 'English (First Language)', gradeCode: '9' },
  { id: '2', subjectName: 'Mathematics (0580)', gradeCode: '9' },
  { id: '3', subjectName: 'Biology (0610)', gradeCode: '9' },
  { id: '4', subjectName: 'Chemistry (0620)', gradeCode: '9' },
  { id: '5', subjectName: 'Physics (0625)', gradeCode: '9' },
  { id: '6', subjectName: 'Arabic', gradeCode: '8' },
  { id: '7', subjectName: 'French', gradeCode: '8' },
  { id: '8', subjectName: 'Economics', gradeCode: '8' },
];
const medStatus = checkFacultyEligibility(medSubjects, []);
const medCheck = medStatus.find(s => s.id === 'medical');
assert(medCheck?.isEligible === true, 'Medical track should be eligible with all 5 core subjects');

// Missing Chemistry in medical
const missingChem: StudentOLevelEntry[] = medSubjects.filter(s => !s.subjectName.includes('Chemistry'));
const missingChemStatus = checkFacultyEligibility(missingChem, []);
const missingChemCheck = missingChemStatus.find(s => s.id === 'medical');
assert(missingChemCheck?.isEligible === false, 'Medical track must be ineligible without Chemistry');
assert(missingChemCheck?.missingRequirements.includes('Chemistry (OL)') === true, 'Should flag Chemistry (OL) as missing');

// Engineering track requires English, Maths, Physics, Chemistry + AS/AL Maths
const engStatusWithoutAS = checkFacultyEligibility(medSubjects, []);
const engCheck1 = engStatusWithoutAS.find(s => s.id === 'engineering');
assert(engCheck1?.isEligible === false, 'Engineering track must be ineligible without AS/AL Maths');

const engStatusWithAS = checkFacultyEligibility(medSubjects, [
  { id: 'as-m', level: 'AS', subjectName: 'Mathematics', gradeCode: 'A' }
]);
const engCheck2 = engStatusWithAS.find(s => s.id === 'engineering');
assert(engCheck2?.isEligible === true, 'Engineering track must be eligible with AS Maths');

// 5. University Benchmarks Verification
console.log('\n--- 5. University Admission Benchmarks Verification ---');
assert(UNIVERSITY_BENCHMARKS.length >= 10, 'Should catalog at least 10 university benchmarks');
const pubMed = UNIVERSITY_BENCHMARKS.find(b => b.faculty.includes('Medicine') && b.type === 'Public');
assert(pubMed !== undefined && pubMed.minHistoricalPercentage >= 98.0, 'Public Medicine benchmark must be >= 98%');
const aucEng = UNIVERSITY_BENCHMARKS.find(b => b.university.includes('AUC') && b.faculty.includes('Engineering'));
assert(aucEng !== undefined && aucEng.minHistoricalPercentage >= 90.0, 'AUC Engineering benchmark must be >= 90%');
const gucPharm = UNIVERSITY_BENCHMARKS.find(b => b.university.includes('GUC'));
assert(gucPharm !== undefined && gucPharm.minHistoricalPercentage >= 80.0, 'GUC benchmark must be >= 80%');

console.log('\n===========================================================');
console.log(`  TANZIM CALCULATOR AUDIT: ${passed} PASSED, ${failed} FAILED`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
}
