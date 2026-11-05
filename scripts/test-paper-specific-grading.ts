import {
  isPaper2Question,
  isPaper4Question,
  isSameMeaningAnswer,
  getP2McqOptions,
  expandBracketedMarkSchemeVariants,
  splitMarkSchemeAlternatives,
  areNumbersSemanticallyEquivalent,
  arePhrasesSynonyms
} from '../src/lib/grading/semanticGrader';

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
console.log('  PAPER 2 (MCQ) & PAPER 4 (SAME MEANING) GRADING AUDIT');
console.log('===========================================================\n');

// 1. Paper 2 Detection & MCQ Options Verification
console.log('--- 1. Paper 2 (MCQ) Detection & Options (Non-Typable) ---');
const p2Question1 = {
  paperComponent: 'Paper 2 (Multiple Choice Extended)',
  source: '0625/22/M/J/23 Q14',
  paperCode: '0625/22'
};
assert(isPaper2Question(p2Question1) === true, 'Should detect Paper 2 Multiple Choice from component');

const p2Question2 = {
  paperComponent: 'Paper 2 (Extended)',
  source: '0620/21/O/N/22 Q3',
  paperCode: '0620/21'
};
assert(isPaper2Question(p2Question2) === true, 'Should detect Paper 2 from source and code');

const p4Question1 = {
  paperComponent: 'Paper 4 (Extended Theory)',
  source: '0625/42/M/J/23 Q4',
  paperCode: '0625/42'
};
assert(isPaper2Question(p4Question1) === false, 'Paper 4 must NOT be detected as Paper 2');
assert(isPaper4Question(p4Question1) === true, 'Should detect Paper 4 from component and code');

// Test MCQ options generation (A, B, C, D)
const mcqOpts = getP2McqOptions(p2Question1, { finalAnswer: 'B' });
assert(mcqOpts.length === 4, 'MCQ options must have exactly 4 choices (A, B, C, D)');
assert(mcqOpts[0].letter === 'A' && mcqOpts[1].letter === 'B' && mcqOpts[2].letter === 'C' && mcqOpts[3].letter === 'D', 'Must have letters A, B, C, D');

// 2. Bracketed Optional Words & Slash Alternatives
console.log('\n--- 2. Bracketed Optional Words & Slash Alternatives ---');
const bracketVariants = expandBracketedMarkSchemeVariants('(plastic) bottle');
assert(bracketVariants.includes('plastic bottle'), 'Should contain "plastic bottle"');
assert(bracketVariants.includes('bottle'), 'Should contain "bottle"');

const slashAlts = splitMarkSchemeAlternatives('increases / goes up / rises');
assert(slashAlts.includes('increases'), 'Should contain "increases"');
assert(slashAlts.includes('goes up'), 'Should contain "goes up"');
assert(slashAlts.includes('rises'), 'Should contain "rises"');

// 3. Paper 4 Same-Meaning Evaluation (owtte)
console.log('\n--- 3. Paper 4 Same-Meaning Evaluation (owtte) ---');

// Case A: Synonyms & Directional Trends
const trendTarget = 'increases / goes up / rises';
assert(isSameMeaningAnswer('increases', trendTarget, undefined, true).isMatch === true, 'Accepts exact "increases"');
assert(isSameMeaningAnswer('goes up', trendTarget, undefined, true).isMatch === true, 'Accepts "goes up"');
assert(isSameMeaningAnswer('rises', trendTarget, undefined, true).isMatch === true, 'Accepts "rises"');
assert(isSameMeaningAnswer('gets higher', trendTarget, undefined, true).isMatch === true, 'Accepts synonym "gets higher"');
assert(isSameMeaningAnswer('greater', trendTarget, undefined, true).isMatch === true, 'Accepts synonym "greater"');
assert(isSameMeaningAnswer('decreases', trendTarget, undefined, true).isMatch === false, 'Rejects opposite "decreases"');

// Case B: Physics Terminology (KE, Thermal, GPE)
const keTarget = 'kinetic energy / KE';
assert(isSameMeaningAnswer('kinetic energy', keTarget, undefined, true).isMatch === true, 'Accepts "kinetic energy"');
assert(isSameMeaningAnswer('KE', keTarget, undefined, true).isMatch === true, 'Accepts abbreviation "KE"');
assert(isSameMeaningAnswer('kinetic', keTarget, undefined, true).isMatch === true, 'Accepts "kinetic"');
assert(isSameMeaningAnswer('thermal energy', keTarget, undefined, true).isMatch === false, 'Rejects "thermal energy"');

// Case C: Biology Terminology (Cell Membrane / Chloroplasts)
const bioTarget = '(cell) membrane';
assert(isSameMeaningAnswer('cell membrane', bioTarget, undefined, true).isMatch === true, 'Accepts "cell membrane"');
assert(isSameMeaningAnswer('membrane', bioTarget, undefined, true).isMatch === true, 'Accepts optional single word "membrane"');
assert(isSameMeaningAnswer('plasma membrane', bioTarget, undefined, true).isMatch === true, 'Accepts synonym "plasma membrane"');
assert(isSameMeaningAnswer('cell wall', bioTarget, undefined, true).isMatch === false, 'Rejects "cell wall" for membrane');

// Case D: Chemistry Terminology (Exothermic / Endothermic)
const chemTarget = 'exothermic / heat released / temperature rises';
assert(isSameMeaningAnswer('exothermic', chemTarget, undefined, true).isMatch === true, 'Accepts "exothermic"');
assert(isSameMeaningAnswer('gives out heat', chemTarget, undefined, true).isMatch === true, 'Accepts "gives out heat"');
assert(isSameMeaningAnswer('temperature increases', chemTarget, undefined, true).isMatch === true, 'Accepts "temperature increases"');
assert(isSameMeaningAnswer('endothermic', chemTarget, undefined, true).isMatch === false, 'Rejects "endothermic"');

// Case E: Numerical & Rounding Equivalence
const numTarget = '2400 N / 2.4 kN';
assert(isSameMeaningAnswer('2400 N', numTarget, undefined, true).isMatch === true, 'Accepts "2400 N"');
assert(isSameMeaningAnswer('2400', numTarget, undefined, true).isMatch === true, 'Accepts "2400" without unit');
assert(isSameMeaningAnswer('2395 N', numTarget, undefined, true).isMatch === true, 'Accepts within 2% rounding tolerance');
assert(isSameMeaningAnswer('4800 N', numTarget, undefined, true).isMatch === false, 'Rejects wrong number "4800 N"');

// Case F: Multi-root Permutations
const rootTarget = 'x = 3, -3';
assert(isSameMeaningAnswer('3, -3', rootTarget, undefined, true).isMatch === true, 'Accepts "3, -3"');
assert(isSameMeaningAnswer('-3, 3', rootTarget, undefined, true).isMatch === true, 'Accepts "-3, 3" inverted order');

console.log('\n===========================================================');
console.log(`  P2 MCQ & P4 SAME-MEANING AUDIT: ${passed} PASSED, ${failed} FAILED`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
}
