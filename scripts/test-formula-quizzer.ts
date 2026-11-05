import {
  FORMULA_QUIZ_QUESTIONS,
  checkFormulaAnswer,
  normalizeFormulaAnswer
} from '../src/data/formulaQuizData';

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
console.log('  INTERACTIVE FORMULA MEMORY QUIZZER AUDIT');
console.log('===========================================================\n');

// 1. Dataset Completeness
console.log('--- 1. Formula Dataset Geometry & Syllabus Coverage ---');
assert(FORMULA_QUIZ_QUESTIONS.length >= 20, `Should contain at least 20 formula questions, found ${FORMULA_QUIZ_QUESTIONS.length}`);

const mathsFormulas = FORMULA_QUIZ_QUESTIONS.filter(q => q.subjectId === 'cie-math-0580');
const physFormulas = FORMULA_QUIZ_QUESTIONS.filter(q => q.subjectId === 'cie-physics-0625');
const chemFormulas = FORMULA_QUIZ_QUESTIONS.filter(q => q.subjectId === 'cie-chem-0620');

assert(mathsFormulas.length >= 6, `Maths (0580) should have at least 6 formulas, found ${mathsFormulas.length}`);
assert(physFormulas.length >= 8, `Physics (0625) should have at least 8 formulas, found ${physFormulas.length}`);
assert(chemFormulas.length >= 6, `Chemistry (0620) should have at least 6 formulas, found ${chemFormulas.length}`);

// 2. Variable Definitions, SI Units & Options
console.log('\n--- 2. Variable Definitions, SI Units & Options Verification ---');
FORMULA_QUIZ_QUESTIONS.forEach(q => {
  assert(q.options.length === 4, `Question ${q.id} must have exactly 4 multiple choice options`);
  assert(q.variableDefinitions.length >= 2, `Question ${q.id} must define at least 2 variables`);
  assert(q.examToolNotice.length > 10, `Question ${q.id} must have an examiner condition notice`);
  assert(q.latexPromptWithBlank.includes('?'), `Question ${q.id} prompt LaTeX must contain a placeholder [ ? ]`);
});

// 3. Normalization & Answer Matching Engine
console.log('\n--- 3. Active Recall Answer Validation & Alias Robustness ---');

// Quadratic formula discriminant blank: "b^2"
const quadQ = FORMULA_QUIZ_QUESTIONS.find(q => q.name.includes('Quadratic'));
assert(quadQ !== undefined, 'Quadratic formula question should exist');
if (quadQ) {
  assert(checkFormulaAnswer('b^2', quadQ).isCorrect, 'Should accept "b^2"');
  assert(checkFormulaAnswer('b*b', quadQ).isCorrect, 'Should accept "b*b"');
  assert(checkFormulaAnswer('b2', quadQ).isCorrect, 'Should accept "b2"');
  assert(checkFormulaAnswer('B^2', quadQ).isCorrect, 'Should accept case-insensitive "B^2"');
  assert(!checkFormulaAnswer('2b', quadQ).isCorrect, 'Must reject incorrect "2b"');
  assert(!checkFormulaAnswer('a^2', quadQ).isCorrect, 'Must reject incorrect "a^2"');
}

// Kinetic Energy velocity blank: "v"
const keQ = FORMULA_QUIZ_QUESTIONS.find(q => q.name.includes('Kinetic'));
assert(keQ !== undefined, 'Kinetic energy question should exist');
if (keQ) {
  assert(checkFormulaAnswer('v', keQ).isCorrect, 'Should accept "v"');
  assert(checkFormulaAnswer('V', keQ).isCorrect, 'Should accept "V"');
  assert(checkFormulaAnswer('velocity', keQ).isCorrect, 'Should accept "velocity"');
  assert(!checkFormulaAnswer('a', keQ).isCorrect, 'Must reject "a"');
  assert(!checkFormulaAnswer('t', keQ).isCorrect, 'Must reject "t"');
}

// Chemistry Gas Volume at r.t.p. blank: "24"
const gasQ = FORMULA_QUIZ_QUESTIONS.find(q => q.name.includes('Gas Volume'));
assert(gasQ !== undefined, 'Gas volume question should exist');
if (gasQ) {
  assert(checkFormulaAnswer('24', gasQ).isCorrect, 'Should accept "24"');
  assert(checkFormulaAnswer('24.0', gasQ).isCorrect, 'Should accept "24.0"');
  assert(checkFormulaAnswer('24 dm3', gasQ).isCorrect, 'Should accept "24 dm3"');
  assert(!checkFormulaAnswer('22.4', gasQ).isCorrect, 'Must reject STP constant "22.4" when RTP is specified');
  assert(!checkFormulaAnswer('1000', gasQ).isCorrect, 'Must reject "1000"');
}

// Ohm's Law resistance blank: "R"
const ohmQ = FORMULA_QUIZ_QUESTIONS.find(q => q.name.includes("Ohm's Law"));
assert(ohmQ !== undefined, "Ohm's law question should exist");
if (ohmQ) {
  assert(checkFormulaAnswer('R', ohmQ).isCorrect, 'Should accept "R"');
  assert(checkFormulaAnswer('r', ohmQ).isCorrect, 'Should accept "r"');
  assert(checkFormulaAnswer('resistance', ohmQ).isCorrect, 'Should accept "resistance"');
  assert(!checkFormulaAnswer('P', ohmQ).isCorrect, 'Must reject "P"');
}

// Chemistry Moles from Mass blank: "M_r"
const molesQ = FORMULA_QUIZ_QUESTIONS.find(q => q.name.includes('Moles from Solid Mass'));
assert(molesQ !== undefined, 'Moles from solid mass question should exist');
if (molesQ) {
  assert(checkFormulaAnswer('M_r', molesQ).isCorrect, 'Should accept "M_r"');
  assert(checkFormulaAnswer('Mr', molesQ).isCorrect, 'Should accept "Mr"');
  assert(checkFormulaAnswer('molar mass', molesQ).isCorrect, 'Should accept "molar mass"');
  assert(!checkFormulaAnswer('24', molesQ).isCorrect, 'Must reject "24"');
}

console.log('\n===========================================================');
console.log(`  FORMULA MEMORY QUIZZER AUDIT: ${passed} PASSED, ${failed} FAILED`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
}
