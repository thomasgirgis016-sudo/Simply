/**
 * Test Suite for Multi-Board Listening Automated Marking Engine
 */

import {
  gradeListeningAnswer,
  levenshteinDistance,
  soundex,
  isPluralPair,
  expandOfficialVariants,
  HOMOPHONE_TRAP_PAIRS
} from '../src/lib/grading/listeningGrader';

console.log('===========================================================');
console.log('  LISTENING MARKING ENGINE — EXAMINER RULES AUDIT');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
  }
}

// ── 1. WORD LIMIT ENFORCER ──────────────────────────────────────────────
console.log('\n--- 1. Word Limit Enforcer ---');
const resLimitFail = gradeListeningAnswer('the blue plastic bottle', 'plastic bottle', 'CIE', 2);
assert(resLimitFail.score === 0, 'Exceeding word limit awards 0 marks');
assert(resLimitFail.feedback.includes('Exceeded word limit'), 'Feedback explains word limit exceeded');
assert(resLimitFail.feedbackType === 'word_limit_exceeded', 'Feedback type is word_limit_exceeded');

const resLimitPass = gradeListeningAnswer('plastic bottle', 'plastic bottle', 'CIE', 2);
assert(resLimitPass.score === 1, 'Within word limit is eligible for full marks');

// ── 2. THE FATAL HOMOPHONE / REAL-WORD TRAP ─────────────────────────────
console.log('\n--- 2. Fatal Homophone / Real-Word Trap ---');
const resBareTrap = gradeListeningAnswer('bare', 'bear', 'CIE', 2);
assert(resBareTrap.score === 0, "Student writing 'bare' for 'bear' receives 0 marks");
assert(resBareTrap.feedback.includes('Examiner Trap'), 'Feedback warns student of real-word trap');
assert(resBareTrap.feedback.includes('real English word with a different meaning'), 'Feedback explains different meaning');

const resHoleTrap = gradeListeningAnswer('hole', 'whole', 'Edexcel', 2);
assert(resHoleTrap.score === 0, "Student writing 'hole' for 'whole' receives 0 marks");

const resPeaceTrap = gradeListeningAnswer('peace', 'piece', 'CIE', 2);
assert(resPeaceTrap.score === 0, "Student writing 'peace' for 'piece' receives 0 marks");

const resSunTrap = gradeListeningAnswer('sun', 'son', 'OxfordAQA', 2);
assert(resSunTrap.score === 0, "Student writing 'sun' for 'son' receives 0 marks");

// ── 3. PHONETIC SPELLING TOLERANCE ──────────────────────────────────────
console.log('\n--- 3. Phonetic Spelling Tolerance ---');
const resRestarant = gradeListeningAnswer('restarant', 'restaurant', 'CIE', 2);
assert(resRestarant.score === 1, "Non-real-word misspelling 'restarant' accepted for 'restaurant'");
assert(resRestarant.status === 'warning', "Phonetic acceptance flagged as 'warning'");
assert(resRestarant.feedbackType === 'phonetic_accepted', 'Feedback type is phonetic_accepted');

const resEnviroment = gradeListeningAnswer('enviroment', 'environment', 'Edexcel', 2);
assert(resEnviroment.score === 1, "Phonetic spelling 'enviroment' accepted for 'environment'");

const resDefinately = gradeListeningAnswer('definately', 'definitely', 'OxfordAQA', 2);
assert(resDefinately.score === 1, "Phonetic spelling 'definately' accepted for 'definitely'");

// ── 4. PLURAL VS. SINGULAR PRECISION (BOARD-SPECIFIC) ───────────────────
console.log('\n--- 4. Plural vs Singular Precision (Board-Specific) ---');
// Edexcel (4ES1): STRICT
const resEdexcelSingular = gradeListeningAnswer('instrument', 'instruments', 'Edexcel', 2);
assert(resEdexcelSingular.score === 0, 'Edexcel strictly penalizes missing plural ending');
assert(resEdexcelSingular.feedback.includes('Edexcel strictly penalizes missing plural endings'), 'Edexcel plural warning note present');
assert(resEdexcelSingular.feedbackType === 'missing_plural', 'Feedback type is missing_plural');

// Cambridge (0510/0511): TOLERANT
const resCieSingular = gradeListeningAnswer('instrument', 'instruments', 'CIE', 2);
assert(resCieSingular.score === 1, 'Cambridge tolerates minor plural slip');
assert(resCieSingular.status === 'warning', 'Cambridge plural slip marked with warning status');

// OxfordAQA (9280): TOLERANT
const resOxfordSingular = gradeListeningAnswer('instrument', 'instruments', 'OxfordAQA', 2);
assert(resOxfordSingular.score === 1, 'OxfordAQA tolerates minor plural slip');

// ── 5. NUMBERS & UNITS PARSER ───────────────────────────────────────────
console.log('\n--- 5. Numbers & Units Parser ---');
const resDigitsWord = gradeListeningAnswer('fifteen', '15', 'CIE', 2);
assert(resDigitsWord.score === 1, "Word 'fifteen' accepted for digit '15'");

const resWordDigits = gradeListeningAnswer('15', 'fifteen', 'CIE', 2);
assert(resWordDigits.score === 1, "Digit '15' accepted for word 'fifteen'");

// Unit printed tolerance
const resPrintedUnit = gradeListeningAnswer('15', '15 km', 'CIE', 2, 'km');
assert(resPrintedUnit.score === 1, "Omitting printed unit 'km' is accepted");

const resPrintedUnitIncluded = gradeListeningAnswer('15 km', '15 km', 'CIE', 2, 'km');
assert(resPrintedUnitIncluded.score === 1, "Including printed unit 'km' is also accepted");

// ── 6. BRACKETED OPTIONAL WORDS & ALTERNATIVES ──────────────────────────
console.log('\n--- 6. Bracketed Optional Words & Alternatives ---');
const variants = expandOfficialVariants('(plastic) bottle / container');
assert(variants.includes('plastic bottle'), 'Expands with bracketed word: plastic bottle');
assert(variants.includes('bottle'), 'Expands without bracketed word: bottle');
assert(variants.includes('container'), 'Expands slash alternative: container');

const resWithBracket = gradeListeningAnswer('plastic bottle', '(plastic) bottle', 'CIE', 2);
assert(resWithBracket.score === 1, "Accepted 'plastic bottle'");

const resWithoutBracket = gradeListeningAnswer('bottle', '(plastic) bottle', 'CIE', 2);
assert(resWithoutBracket.score === 1, "Accepted 'bottle'");

const resSlash = gradeListeningAnswer('container', 'bottle / container', 'CIE', 2);
assert(resSlash.score === 1, "Accepted slash alternative 'container'");

// ── 7. CONTRADICTION RULE ───────────────────────────────────────────────
console.log('\n--- 7. Contradiction Rule ---');
const resContradiction = gradeListeningAnswer('blue and red', 'blue', 'CIE', 3);
assert(resContradiction.score === 0, 'Contradictory options on single line award 0 marks');
assert(resContradiction.feedbackType === 'contradiction', 'Feedback type is contradiction');

console.log('\n===========================================================');
console.log(`  LISTENING MARKING ENGINE AUDIT: ${passCount} PASSED, ${failCount} FAILED`);
console.log('===========================================================');

process.exit(failCount === 0 ? 0 : 1);
