import { registerStudent, loginStudent, updateUserAccount, EXTRA_SUBJECT_PRICE_GBP } from '../src/services/auth';
import { addMistakeItem, getMistakeNotebook, INITIAL_MISTAKES } from '../src/services/mistakeNotebook';

console.log('===========================================================');
console.log('  TESTING PARENT WHATSAPP, WEEKLY REPORT & MISTAKE LOGGING');
console.log('===========================================================');

// Mock localStorage for Node test environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  key: (i: number) => Object.keys(mockStorage)[i] || null,
  length: 0
} as any;

global.window = {
  dispatchEvent: () => true
} as any;

// 1. Signup with Parent WhatsApp
console.log('\n--- 1. Signup with Parent WhatsApp Number ---');
async function runTests() {
  const regResult = await registerStudent({
    name: 'Tarek',
    email: 'tarek@test.com',
    password: 'Pass1234!',
    grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
    board: 'CIE',
    targetGrade: '9 / A*',
    selectedSubjectIds: ['cie-math-0580', 'cie-physics-0625', 'cie-chem-0620', 'cie-bio-0610', 'cie-esl-0510'],
    parentWhatsapp: '+20 100 123 4567'
  });

if (!regResult.success || !regResult.user) {
  console.error('❌ Registration failed:', regResult.error);
  process.exit(1);
}

if (regResult.user.parentWhatsapp !== '+20 100 123 4567') {
  console.error(`❌ Expected parentWhatsapp "+20 100 123 4567", got "${regResult.user.parentWhatsapp}"`);
  process.exit(1);
}
console.log(`  ✓ Registered student with Parent WhatsApp: ${regResult.user.parentWhatsapp}`);

// 2. 7-Day Weekly Report Schedule Logic
console.log('\n--- 2. 7-Day Weekly Report Schedule Check ---');
const checkReportDue = (lastSent?: string) => {
  if (!lastSent) return true;
  const sentTime = new Date(lastSent).getTime();
  return Date.now() - sentTime >= 7 * 24 * 60 * 60 * 1000;
};

// Case A: Never sent
const neverSentDue = checkReportDue(regResult.user.lastWeeklyReportSentAt);
console.log(`  ✓ Never sent: Report due? ${neverSentDue} (Expected true)`);
if (!neverSentDue) throw new Error('Expected neverSentDue to be true');

// Case B: Sent 3 days ago (not due)
const sent3DaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const sent3DaysDue = checkReportDue(sent3DaysAgo);
console.log(`  ✓ Sent 3 days ago: Report due? ${sent3DaysDue} (Expected false)`);
if (sent3DaysDue) throw new Error('Expected sent3DaysDue to be false');

// Case C: Sent 8 days ago (due)
const sent8DaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
const sent8DaysDue = checkReportDue(sent8DaysAgo);
console.log(`  ✓ Sent 8 days ago: Report due? ${sent8DaysDue} (Expected true)`);
if (!sent8DaysDue) throw new Error('Expected sent8DaysDue to be true');

// 3. Update User with Dispatched Weekly Report Timestamp
console.log('\n--- 3. Updating User with Dispatched Report Timestamp ---');
const updated = updateUserAccount(regResult.user.id, {
  lastWeeklyReportSentAt: new Date().toISOString()
});
console.log(`  ✓ Updated lastWeeklyReportSentAt: ${updated?.lastWeeklyReportSentAt}`);
if (!updated?.lastWeeklyReportSentAt) throw new Error('Failed to update timestamp');

// 4. Mistake Notebook Auto-Logging
console.log('\n--- 4. Mistake Notebook Auto-Logging ---');
const initialCount = getMistakeNotebook().length;
const loggedMistake = addMistakeItem({
  subjectId: 'cie-math-0580',
  subjectCode: '0580',
  topic: 'Trigonometry',
  paperCode: '0580 Classifieds (P4)',
  questionNumber: 'Q3(a)',
  questionPrompt: 'Calculate the angle of elevation...',
  myMistakeAnswer: '32.5',
  markSchemeAnswer: '32.8',
  examinerTip: 'Accuracy mark lost due to rounding premature intermediate values.',
  reason: 'careless_math',
  marksLost: 1,
  totalMarks: 3
});

const currentNotebook = getMistakeNotebook();
console.log(`  ✓ Added mistake item: ${loggedMistake.id}`);
console.log(`  ✓ Total mistakes in notebook: ${currentNotebook.length} (was ${initialCount})`);
if (currentNotebook.length !== initialCount + 1) throw new Error('Mistake was not added');

console.log('\n===========================================================');
console.log('  ALL PARENT WHATSAPP & MISTAKE LOGGING TESTS PASSED (100%)!');
console.log('===========================================================');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
