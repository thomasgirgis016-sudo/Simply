import assert from 'assert';
import { isSameMeaningAnswer, getP2McqOptions } from '../src/lib/grading/semanticGrader';
import { getClassifiedQuestions } from '../src/lib/classifieds/questionPool';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { EXTRA_SUBJECT_PRICE_GBP } from '../src/types';

console.log('===========================================================');
console.log('  TESTING CLASSIFIED MARKING, OPTION LABELS & SUBJECT GATING');
console.log('===========================================================');

// ── TEST 1: P2 Multiple Choice Option Label Parsing ──
console.log('\n--- 1. P2 MCQ Option Label Parsing ---');

const bioQuestion = {
  paperCode: '0610/22',
  prompt: 'Which process describes the net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane?\n\n[A] Active transport\n[B] Osmosis\n[C] Diffusion\n[D] Transpiration',
  questionPrompt: 'Which process describes the net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane?\n\n[A] Active transport\n[B] Osmosis\n[C] Diffusion\n[D] Transpiration',
};

const bioSubpart = {
  finalAnswer: 'Option B',
  prompt: 'Which process describes the net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane?',
  markScheme: [{ requirement: 'Correct Answer: Option [B] - Osmosis is specifically the movement of water down a water potential gradient across a partially permeable membrane.' }]
};

const parsedOptions = getP2McqOptions(bioQuestion, bioSubpart);
console.log('Extracted options:', parsedOptions);

assert.strictEqual(parsedOptions.length, 4, 'Must return exactly 4 options');
assert.strictEqual(parsedOptions[0].letter, 'A');
assert.strictEqual(parsedOptions[0].label, 'Active transport', 'Option A label must be Active transport');
assert.strictEqual(parsedOptions[1].letter, 'B');
assert.strictEqual(parsedOptions[1].label, 'Osmosis', 'Option B label must be Osmosis');
assert.strictEqual(parsedOptions[2].letter, 'C');
assert.strictEqual(parsedOptions[2].label, 'Diffusion', 'Option C label must be Diffusion');
assert.strictEqual(parsedOptions[3].letter, 'D');
assert.strictEqual(parsedOptions[3].label, 'Transpiration', 'Option D label must be Transpiration');
console.log('  ✓ Successfully parsed option names [A: Active transport, B: Osmosis, C: Diffusion, D: Transpiration]');

// ── TEST 2: P2 MCQ Option Marking & Examiner Accuracy ──
console.log('\n--- 2. P2 MCQ Option Marking Accuracy ---');

// Clicking "B" against "Option B"
const matchB = isSameMeaningAnswer('B', bioSubpart.finalAnswer, bioSubpart.markScheme, false);
assert.strictEqual(matchB.isMatch, true, 'Clicking B against Option B must be marked correct');
console.log('  ✓ "B" vs "Option B":', matchB.reason);

// Clicking "Option B" against "Option B"
const matchOptionB = isSameMeaningAnswer('Option B', bioSubpart.finalAnswer, bioSubpart.markScheme, false);
assert.strictEqual(matchOptionB.isMatch, true, 'Clicking Option B against Option B must be marked correct');
console.log('  ✓ "Option B" vs "Option B":', matchOptionB.reason);

// Clicking "A" (wrong option) against "Option B"
const matchWrongA = isSameMeaningAnswer('A', bioSubpart.finalAnswer, bioSubpart.markScheme, false);
assert.strictEqual(matchWrongA.isMatch, false, 'Clicking A against Option B must be marked incorrect');
console.log('  ✓ "A" vs "Option B":', matchWrongA.reason);

// ── TEST 3: Multi-Topic Selection in Classifieds ──
console.log('\n--- 3. Multi-Topic Selection in Classifieds ---');

const multiChapterQuestions = getClassifiedQuestions({
  subjectCodeOrId: '0580',
  chapterIds: ['0580-01', '0580-02'],
  years: [2023],
  limit: 10
});

assert(multiChapterQuestions.length > 0, 'Should find questions matching multiple chapters');
console.log(`  ✓ Found ${multiChapterQuestions.length} questions matching chapters 0580-01 & 0580-02`);

// ── TEST 4: Student Subject Gating & Extra Subjects at £28/mo ──
console.log('\n--- 4. Student Subject Gating & Extra Subjects at £28/mo ---');

assert.strictEqual(EXTRA_SUBJECT_PRICE_GBP, 28, 'Extra subject price must be £28/month');
console.log(`  ✓ EXTRA_SUBJECT_PRICE_GBP is £${EXTRA_SUBJECT_PRICE_GBP}/month`);

console.log('\n===========================================================');
console.log('  ALL TESTS PASSED WITH 100% SUCCESS!');
console.log('===========================================================');
