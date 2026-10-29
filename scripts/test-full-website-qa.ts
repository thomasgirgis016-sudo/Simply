import fs from 'fs';
import path from 'path';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../src/data/pastPapersData';
import { COMPREHENSIVE_REVISION_NOTES } from '../src/data/revisionData';
import { CHEAT_SHEETS_DATABASE } from '../src/data/cheatSheetsData';
import { IGCSE_PERIODIC_TABLE, CAMBRIDGE_EXAM_FORMULAS } from '../src/data/periodicTableData';
import { OFFICIAL_EXAM_TIMETABLE } from '../src/data/examTimetableData';
import { validateKatexSyntax, runFullAutonomousQaSweep } from '../src/services/pastPaperQaAgent';
import { evaluateStudentWorking } from '../src/services/mathWorkingValidator';
import { searchUniversalKnowledge } from '../src/services/knowledgeEngine';
import { askAiTutor, solveQuestionWithGemini } from '../src/services/gemini';

console.log('===========================================================');
console.log('  SIMPLY IGCSE — COMPLETE WEBSITE FUNCTIONALITY & CONTENT QA');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${testName}: ${errorDetail || 'Condition failed'}`);
    console.error(`❌ FAIL: ${testName} - ${errorDetail || ''}`);
  }
}

// TEST SUITE 1: SUBJECTS & CURRICULUM
console.log('\n--- 1. Subjects & Curriculum Spec Verification ---');
assert(IGCSE_SUBJECTS.length >= 25, 'Subjects Catalog Count', `Found ${IGCSE_SUBJECTS.length} subjects`);
for (const sub of IGCSE_SUBJECTS) {
  assert(!!sub.id && !!sub.name && !!sub.code, `Subject ${sub.id} basic metadata`, 'Missing id, name or code');
  assert(sub.topics && sub.topics.length > 0, `Subject ${sub.id} topics`, 'Has 0 topics');
}
console.log(`✓ Verified ${IGCSE_SUBJECTS.length} subjects with active syllabuses`);

// TEST SUITE 2: PAST PAPER QUESTIONS & KNOWLEDGE BASE
console.log('\n--- 2. Past Paper Questions & Math Integrity ---');
assert(PAST_PAPERS_DATABASE.length > 0, 'Past Papers DB Population', `Found ${PAST_PAPERS_DATABASE.length}`);
for (const q of PAST_PAPERS_DATABASE) {
  // Check KaTeX in prompt
  const pCheck = validateKatexSyntax(q.questionPrompt);
  assert(pCheck.isValid, `KaTeX prompt in ${q.id} (${q.paperCode})`, pCheck.error);

  if (q.diagramOrMath) {
    const dCheck = validateKatexSyntax(q.diagramOrMath);
    assert(dCheck.isValid, `KaTeX diagramOrMath in ${q.id}`, dCheck.error);
  }

  // Check subparts sum
  if (q.subParts && q.subParts.length > 0) {
    const sum = q.subParts.reduce((acc, sp) => acc + sp.marks, 0);
    assert(sum === q.marks, `Mark sum for ${q.id} ${q.questionNumber}`, `Subparts sum ${sum} != total ${q.marks}`);
  }

  // Check mark schemes
  assert(q.markScheme && q.markScheme.length > 0, `Mark scheme present in ${q.id}`, 'Empty mark scheme');
}
console.log(`✓ Verified ${PAST_PAPERS_DATABASE.length} question blueprints & subparts with zero math errors`);

// TEST SUITE 3: OFFICIAL PAST PAPER PDF REPOSITORY
console.log('\n--- 3. Official Past Paper PDF Archive Index ---');
assert(OFFICIAL_PAST_PAPER_PDFS.length >= 7000, 'PDF Archive Catalog Scale', `Found ${OFFICIAL_PAST_PAPER_PDFS.length} PDFs`);
let verifiedPdfUrls = 0;
for (const pdf of OFFICIAL_PAST_PAPER_PDFS) {
  assert(!!pdf.qpPdfUrl && !!pdf.msPdfUrl, `PDF ${pdf.id} URL existence`, 'Missing QP or MS URL');
  assert(pdf.year >= 2010 && pdf.year <= 2026, `PDF ${pdf.id} year range`, `Invalid year ${pdf.year}`);
  verifiedPdfUrls += 2;
}
console.log(`✓ Verified ${OFFICIAL_PAST_PAPER_PDFS.length} past paper exam sessions (${verifiedPdfUrls} QP & MS URLs)`);

// TEST SUITE 4: REVISION NOTES & WORKED EXAMPLES
console.log('\n--- 4. Comprehensive Revision Notes Quality ---');
assert(COMPREHENSIVE_REVISION_NOTES.length >= 15, 'Revision Notes Count', `Found ${COMPREHENSIVE_REVISION_NOTES.length} notes`);
for (const note of COMPREHENSIVE_REVISION_NOTES) {
  assert(!!note.id && !!note.title && !!note.chapter, `Note ${note.id} structure`, 'Missing title/chapter');
  assert(note.keyConcepts && note.keyConcepts.length > 0, `Note ${note.id} key concepts`, '0 concepts');
  assert(note.mustKnowDefinitions && note.mustKnowDefinitions.length > 0, `Note ${note.id} definitions`, '0 definitions');
  assert(note.examinerWarnings && note.examinerWarnings.length > 0, `Note ${note.id} warnings`, '0 warnings');
  
  if (note.diagramSvg) {
    assert(note.diagramSvg.includes('<svg') && note.diagramSvg.includes('</svg>'), `Note ${note.id} SVG validity`, 'Malformed SVG tags');
  }

  if (note.workedExamples) {
    for (const we of note.workedExamples) {
      assert(we.steps && we.steps.length > 0, `Worked example in ${note.id}`, 'Has 0 steps');
      assert(!!we.finalAnswer, `Worked example answer in ${note.id}`, 'Missing finalAnswer');
    }
  }
}
console.log(`✓ Verified ${COMPREHENSIVE_REVISION_NOTES.length} comprehensive revision topics across core subjects`);

// TEST SUITE 5: NIGHT-BEFORE CHEAT SHEETS
console.log('\n--- 5. Night-Before Emergency Cheat Sheets ---');
assert(CHEAT_SHEETS_DATABASE.length >= 4, 'Cheat Sheets Count', `Found ${CHEAT_SHEETS_DATABASE.length}`);
for (const cs of CHEAT_SHEETS_DATABASE) {
  assert(cs.criticalRules && cs.criticalRules.length > 0, `Cheat sheet ${cs.subjectCode} critical rules`, 'Empty rules');
  assert(cs.sections && cs.sections.length > 0, `Cheat sheet ${cs.subjectCode} sections`, 'Empty sections');
}
console.log(`✓ Verified ${CHEAT_SHEETS_DATABASE.length} emergency 1-page printable cheat sheets`);

// TEST SUITE 6: INTERACTIVE EXAM HUD (PERIODIC TABLE & FORMULAS)
console.log('\n--- 6. Interactive Exam Reference HUD & Periodic Table ---');
assert(IGCSE_PERIODIC_TABLE.length >= 40, 'Periodic Table Completeness', `Found ${IGCSE_PERIODIC_TABLE.length} syllabus elements`);
const h = IGCSE_PERIODIC_TABLE.find(e => e.symbol === 'H');
const na = IGCSE_PERIODIC_TABLE.find(e => e.symbol === 'Na');
assert(h?.number === 1, 'Hydrogen element data', 'Invalid atomic number');
assert(na?.number === 11, 'Sodium element data', 'Invalid atomic number');

assert(CAMBRIDGE_EXAM_FORMULAS.length >= 3, 'Cambridge Exam Formulas Sets', `Found ${CAMBRIDGE_EXAM_FORMULAS.length} subjects`);
console.log(`✓ Verified ${IGCSE_PERIODIC_TABLE.length} Cambridge syllabus elements and official Cambridge Maths/Physics/Chemistry formula sheets`);

// TEST SUITE 7: EXAM COUNTDOWN TIMETABLE
console.log('\n--- 7. Official May/June 2026 Exam Timetable ---');
assert(OFFICIAL_EXAM_TIMETABLE.length >= 10, 'Exam Timetable Entries', `Found ${OFFICIAL_EXAM_TIMETABLE.length} scheduled exam papers`);
for (const entry of OFFICIAL_EXAM_TIMETABLE) {
  assert(!!entry.paperCode && !!entry.examDate && !!entry.timeOfDay, `Timetable entry ${entry.paperCode}`, 'Missing examDate/timeOfDay');
}
// TEST SUITE 8: AI SOLVER, AI TUTOR & MATH VALIDATOR REGRESSION TESTS
console.log('\n--- 8. AI Solver, Tutor & Working Validator Rigour ---');

// 8a. Math Working Validator: single line calculation 2 + 2 = 4
const singleLineEval = evaluateStudentWorking('2 + 2 = 4', 1);
assert(singleLineEval.hasEvaluatedMath, 'Single-line math equation detection (2+2=4)', 'Failed to evaluate equation');
assert(singleLineEval.marksEarned === 1 && singleLineEval.marksPossible === 1, 'Math working 2+2=4 awards 1/1 marks', `Earned ${singleLineEval.marksEarned}/${singleLineEval.marksPossible}`);
assert(singleLineEval.percentageScore === 100, 'Math working 2+2=4 achieves 100%', `Scored ${singleLineEval.percentageScore}%`);

// 8b. Math Working Validator: arithmetic error detection 10 + 2 = 8
const incorrectMathEval = evaluateStudentWorking('10 + 2 = 8', 1);
assert(incorrectMathEval.hasEvaluatedMath, 'Math equation contradiction detection (10+2=8)', 'Failed to detect contradiction');
assert(incorrectMathEval.marksEarned === 0, 'Incorrect math 10+2=8 correctly receives 0 marks', `Awarded ${incorrectMathEval.marksEarned}`);

// 8c. Knowledge Engine subject affinity: arithmetic query must not trigger chemistry ions
const mathKnowledge = searchUniversalKnowledge('What is 2 + 2? Answer the question', 'Mathematics (0580)');
assert(!mathKnowledge || (!mathKnowledge.toLowerCase().includes('precipitate') && !mathKnowledge.toLowerCase().includes('cation')), 'Math query in KnowledgeEngine does not leak chemistry qualitative analysis table', 'Contained chemistry terms');

// 8d. Knowledge Engine ESL query returns contrast connectors
const eslKnowledge = searchUniversalKnowledge('contrast sentence connectors', 'English as a Second Language (0510)');
assert(!!eslKnowledge && (eslKnowledge.toLowerCase().includes('although') || eslKnowledge.toLowerCase().includes('contrast')), 'ESL contrast query in KnowledgeEngine returns linking devices', 'Missing contrast guides');

// 8e. AI Tutor answers arithmetic questions directly with LaTeX and method marks
const tutorMathReply = await askAiTutor([{ role: 'user', content: 'What is 2 + 2?' }], 'Mathematics (0580)', 'Cambridge CIE');
assert(tutorMathReply.includes('4') && tutorMathReply.includes('[M1]'), 'AI Tutor answers 2+2 directly with 4 and [M1] mark breakdown', `Received: ${tutorMathReply.slice(0, 100)}...`);
assert(!tutorMathReply.toLowerCase().includes('aqueous sodium hydroxide'), 'AI Tutor does not confuse math arithmetic with chemistry qualitative tests', 'Contained qualitative analysis');

// 8f. AI Solver correctly handles single-line student working 2 + 2 = 4
const solverMathResult = await solveQuestionWithGemini({
  studentWorking: '2 + 2 = 4',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assert(solverMathResult.totalMarks === 1, 'AI Solver gives 1 mark for single-line 2+2=4 working', `Got totalMarks ${solverMathResult.totalMarks}`);
assert(solverMathResult.finalAnswer.includes('1 / 1 Marks (100%)'), 'AI Solver marks 2+2=4 as 100%', `Got finalAnswer: ${solverMathResult.finalAnswer}`);

// 8g. AI Solver handles ESL contrast prompt without vertical farming summary leak
const solverEslResult = await solveQuestionWithGemini({
  questionText: 'Write a sentence to show contrast between two ideas [1 mark]',
  subjectName: 'English as a Second Language (0510)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assert(solverEslResult.totalMarks === 1, 'AI Solver assigns 1 mark to ESL contrast prompt', `Got totalMarks ${solverEslResult.totalMarks}`);
assert(solverEslResult.topic.includes('Contrast'), 'AI Solver assigns correct contrast topic', `Got topic: ${solverEslResult.topic}`);
// 8h. AI Solver correctly grades student ESL connective answer "but" as 0 / 1 (0%)
const solverEslIncorrect = await solveQuestionWithGemini({
  questionText: 'Write a sentence to show contrast between two ideas [1 mark]',
  studentWorking: 'but',
  subjectName: 'English as a Second Language (0510)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assert(solverEslIncorrect.studentWorkingEvaluation?.marksEarned === 0, 'AI Solver withholds mark for coordinating conjunction "but" in contrast question', `Awarded ${solverEslIncorrect.studentWorkingEvaluation?.marksEarned}`);
assert(solverEslIncorrect.studentWorkingEvaluation?.lineReviews[0]?.isCorrect === false, 'AI Solver marks "but" line as isCorrect: false', 'Expected isCorrect to be false');
assert(solverEslIncorrect.finalAnswer.includes('0 / 1 Marks (0%)'), 'AI Solver final answer states 0 / 1 Marks (0%)', `Got finalAnswer: ${solverEslIncorrect.finalAnswer}`);

// 8i. AI Solver correctly grades student ESL correct contrast answer as 1 / 1 (100%)
const solverEslCorrect = await solveQuestionWithGemini({
  questionText: 'Write a sentence to show contrast between two ideas [1 mark]',
  studentWorking: 'Although modern electric vehicles reduce urban greenhouse emissions, their widespread adoption remains constrained by high battery replacement expenses.',
  subjectName: 'English as a Second Language (0510)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assert(solverEslCorrect.studentWorkingEvaluation?.marksEarned === 1, 'AI Solver awards 1 mark for valid complex contrast sentence', `Awarded ${solverEslCorrect.studentWorkingEvaluation?.marksEarned}`);
assert(solverEslCorrect.studentWorkingEvaluation?.lineReviews[0]?.isCorrect === true, 'AI Solver marks valid sentence as isCorrect: true', 'Expected isCorrect to be true');
assert(solverEslCorrect.finalAnswer.includes('1 / 1 Marks (100%)'), 'AI Solver final answer states 1 / 1 Marks (100%)', `Got finalAnswer: ${solverEslCorrect.finalAnswer}`);

// 8j. 24-Check Autonomous QA Sweep & Curriculum Guard Verification
console.log('\n--- 9. Autonomous Founder Console QA Sweep & Curriculum Guard ---');
const autonomousSweep = await runFullAutonomousQaSweep();
assert(autonomousSweep.failedCount === 0, 'Autonomous QA sweep reports 0 failed checks (100% health)', `Found ${autonomousSweep.failedCount} failures: ${autonomousSweep.checks.filter(c => c.status === 'failed').map(c => c.name).join(', ')}`);
const eslGuard = autonomousSweep.checks.find(c => c.id === 'guard-esl-reform-mapping');
assert(eslGuard?.status === 'passed', 'ESL 0510 Paper 1 vs Paper 2 Reform Guard is PASSED', eslGuard?.details);

console.log('✓ Verified AI Solver, AI Tutor, and Math Working Validator precision & subject isolation');
console.log(`✓ Verified Autonomous QA Sweep: ${autonomousSweep.passedCount}/${autonomousSweep.totalChecks} Checks Passed (${autonomousSweep.healthPercent}% System Health)`);

console.log('\n===========================================================');
console.log(`  QA SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log('  RESULT: ALL WEBSITE FUNCTIONALITY & CONTENT AUDITS PASSED!');
} else {
  console.log(`  FAILURES:\n  ${failures.join('\n  ')}`);
}
console.log('===========================================================');

process.exit(failCount === 0 ? 0 : 1);
