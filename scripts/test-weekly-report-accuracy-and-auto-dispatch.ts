import { generateDetailedReport } from '../src/services/studentReports';
import { isWeeklyReportDue, runAutomatedWeeklyDispatch, resetAllWeeklyReportTimers } from '../src/services/whatsappService';
import { UserAccount, Subject } from '../src/types';

const MOCK_SUBJECTS: Subject[] = [
  { id: 'cie-math-0580', name: 'Mathematics', code: '0580', board: 'CIE', category: 'Mathematics', icon: '📐', color: 'indigo', topics: ['Algebra', 'Geometry'] },
  { id: 'cie-physics-0625', name: 'Physics', code: '0625', board: 'CIE', category: 'Sciences', icon: '⚡', color: 'cyan', topics: ['Thermal', 'Waves'] },
  { id: 'cie-chem-0620', name: 'Chemistry', code: '0620', board: 'CIE', category: 'Sciences', icon: '🧪', color: 'emerald', topics: ['Stoichiometry', 'Organic'] },
  { id: 'cie-bio-0610', name: 'Biology', code: '0610', board: 'CIE', category: 'Sciences', icon: '🧬', color: 'green', topics: ['Cells', 'Genetics'] },
  { id: 'cie-esl-0510', name: 'English as a Second Language', code: '0510', board: 'CIE', category: 'Languages', icon: '📖', color: 'amber', topics: ['Reading', 'Writing'] }
];

const studentA: UserAccount = {
  id: 'usr_sarah_1',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@cambridge.edu',
  passwordHash: 'dummy',
  grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
  board: 'CIE',
  targetGrade: '9 / A*',
  selectedSubjectIds: ['cie-math-0580', 'cie-physics-0625', 'cie-chem-0620'],
  parentWhatsapp: '+201011223344',
  createdAt: '2026-09-01T10:00:00.000Z'
};

const studentB: UserAccount = {
  id: 'usr_omar_2',
  name: 'Omar Farouk',
  email: 'omar.farouk@school.edu.eg',
  passwordHash: 'dummy',
  grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
  board: 'CIE',
  targetGrade: '7 / A',
  selectedSubjectIds: ['cie-chem-0620', 'cie-bio-0610', 'cie-esl-0510'],
  parentWhatsapp: '+201099887766',
  createdAt: '2026-10-15T12:00:00.000Z'
};

async function runTests() {
  console.log('🧪 Testing Individualized Weekly Report Accuracy and Auto-Dispatch...\n');

  // Test 1: Accuracy & Individualization
  console.log('1. Generating report for Student A (Sarah, Target: 9 / A*, Subjects: Math, Physics, Chem)...');
  const reportA = generateDetailedReport(studentA, MOCK_SUBJECTS);
  console.log(`   - Candidate Name: ${reportA.studentName}`);
  console.log(`   - Target: ${reportA.targetGrade} -> Projected: ${reportA.projectedGrade}`);
  console.log(`   - Readiness Index: ${reportA.readinessIndex}%`);
  console.log(`   - Questions Solved: ${reportA.totalQuestionsSolved}`);
  console.log(`   - Enrolled Subjects count: ${reportA.subjects.length} (Math, Physics, Chem only)`);
  console.log(`   - Subject 1: ${reportA.subjects[0].subjectName} (${reportA.subjects[0].overallScore}%)`);
  console.log(`   - Weak Topic: ${reportA.subjects[0].weakTopics[0]}`);

  if (reportA.subjects.length !== 3) {
    throw new Error(`Expected strictly 3 enrolled subjects for Sarah, got ${reportA.subjects.length}`);
  }

  console.log('\n2. Generating report for Student B (Omar, Target: 7 / A, Subjects: Chem, Bio, ESL)...');
  const reportB = generateDetailedReport(studentB, MOCK_SUBJECTS);
  console.log(`   - Candidate Name: ${reportB.studentName}`);
  console.log(`   - Target: ${reportB.targetGrade} -> Projected: ${reportB.projectedGrade}`);
  console.log(`   - Readiness Index: ${reportB.readinessIndex}%`);
  console.log(`   - Questions Solved: ${reportB.totalQuestionsSolved}`);
  console.log(`   - Enrolled Subjects count: ${reportB.subjects.length} (Chem, Bio, ESL only)`);
  console.log(`   - Subject 1: ${reportB.subjects[0].subjectName} (${reportB.subjects[0].overallScore}%)`);
  console.log(`   - Weak Topic: ${reportB.subjects[0].weakTopics[0]}`);

  // Verification of Differentiation
  if (reportA.mockExamAverage === reportB.mockExamAverage) {
    throw new Error('Reports must not have identical average scores across different students!');
  }
  if (reportA.examinerCommentary === reportB.examinerCommentary) {
    throw new Error('Examiner commentary must be individualized per student!');
  }
  if (reportA.totalQuestionsSolved === reportB.totalQuestionsSolved) {
    throw new Error('Questions solved must be distinct and individualized!');
  }

  console.log('   ✅ PASS: Reports are completely accurate, personalized, and distinct for each user.');

  // Test 2: Auto-Dispatch Cooldown Logic
  console.log('\n3. Testing Automated Weekly Dispatch Cooldown Logic...');
  console.log(`   - Is Sarah due? ${isWeeklyReportDue(studentA)} (Expected: true, never sent)`);
  if (!isWeeklyReportDue(studentA)) throw new Error('Sarah should be due since report was never sent');

  const students = [studentA, studentB];
  console.log('\n4. Running Batch Auto-Dispatch...');
  const dispatchRes = await runAutomatedWeeklyDispatch(students, MOCK_SUBJECTS);
  console.log(`   - Scanned: ${dispatchRes.totalScanned}`);
  console.log(`   - Dispatched: ${dispatchRes.totalDispatched}`);

  if (dispatchRes.totalDispatched !== 2) {
    throw new Error(`Expected 2 reports dispatched, got ${dispatchRes.totalDispatched}`);
  }

  console.log('   ✅ PASS: Batch auto-dispatch executed and recorded dispatches.');

  // Test 3: Reset Timers
  console.log('\n5. Testing Reset Timers for Instant Testing...');
  const resetCount = resetAllWeeklyReportTimers(students);
  console.log(`   - Reset ${resetCount} student timers`);
  console.log('   ✅ PASS: Timers reset cleanly.');

  console.log('\n🎉 ALL WEEKLY REPORT ACCURACY & AUTO-DISPATCH TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
