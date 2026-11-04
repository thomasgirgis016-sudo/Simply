import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS, LOCAL_VERIFIED_PDFS } from '../src/data/pastPapersData';
import { COMPREHENSIVE_REVISION_NOTES } from '../src/data/revisionData';
import { CHEAT_SHEETS_DATABASE } from '../src/data/cheatSheetsData';
import { IGCSE_PERIODIC_TABLE, CAMBRIDGE_EXAM_FORMULAS } from '../src/data/periodicTableData';
import { OFFICIAL_EXAM_TIMETABLE } from '../src/data/examTimetableData';
import { validateKatexSyntax, runFullAutonomousQaSweep } from '../src/services/pastPaperQaAgent';
import { evaluateStudentWorking } from '../src/services/mathWorkingValidator';
import { searchUniversalKnowledge } from '../src/services/knowledgeEngine';
import { askAiTutor, solveQuestionWithGemini } from '../src/services/gemini';
import { verifyAndAuditSolverResult } from '../src/services/examinerVerificationAgent';
import { createValidMp3Buffer } from '../api/pdf-proxy';
import solveHandler from '../api/solve';
import { AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS } from '../src/lib/classifieds/questionPool';
import { generate40McqQuestions } from '../src/services/questionKnowledgeBase';

console.log('===========================================================');
console.log('  SIMPLY IGCSE — COMPLETE WEBSITE FUNCTIONALITY & CONTENT QA');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;
let transportPassCount = 0;
let transportFailCount = 0;
let contentPassCount = 0;
let contentFailCount = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, errorDetail?: string) {
  assertContent(condition, testName, errorDetail);
}

function assertContent(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    passCount++;
    contentPassCount++;
  } else {
    failCount++;
    contentFailCount++;
    failures.push(`[CONTENT] ${testName}: ${errorDetail || 'Condition failed'}`);
    console.error(`❌ FAIL [CONTENT]: ${testName} - ${errorDetail || ''}`);
  }
}

function assertTransport(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    passCount++;
    transportPassCount++;
  } else {
    failCount++;
    transportFailCount++;
    failures.push(`[TRANSPORT] ${testName}: ${errorDetail || 'Condition failed'}`);
    console.error(`❌ FAIL [TRANSPORT]: ${testName} - ${errorDetail || ''}`);
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
  if (!pdf.isUnavailable) {
    if (pdf.qpUnavailableReason) {
      assert(!!pdf.msPdfUrl, `PDF ${pdf.id} URL existence (QP not published, MS must exist)`, 'Missing MS URL');
      verifiedPdfUrls += 1;
    } else if (pdf.msUnavailableReason) {
      assert(!!pdf.qpPdfUrl, `PDF ${pdf.id} URL existence (MS not published, QP must exist)`, 'Missing QP URL');
      verifiedPdfUrls += 1;
    } else {
      assert(!!pdf.qpPdfUrl && !!pdf.msPdfUrl, `PDF ${pdf.id} URL existence`, 'Missing QP or MS URL');
      verifiedPdfUrls += 2;
    }
  }
  assert(pdf.year >= 2010 && pdf.year <= 2026, `PDF ${pdf.id} year range`, `Invalid year ${pdf.year}`);
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

// 8k. AI Solver specificity: Solve 2 + 2. [1 mark] with student working "4"
console.log('\n--- 8k-8o. AI Solver & AI Tutor Specificity Regressions ---');
const solverArithmeticResult = await solveQuestionWithGemini({
  questionText: 'Solve 2 + 2. [1 mark]',
  studentWorking: '4',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverArithmeticResult.totalMarks === 1, 'Solver awards 1 total mark for "Solve 2 + 2. [1 mark]"', `Got ${solverArithmeticResult.totalMarks}`);
assertContent(solverArithmeticResult.studentWorkingEvaluation?.marksEarned === 1, 'Solver awards 1 mark earned for answer "4"', `Got ${solverArithmeticResult.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverArithmeticResult.studentWorkingEvaluation?.percentageScore === 100, 'Solver gives 100% accuracy for 2+2=4', `Got ${solverArithmeticResult.studentWorkingEvaluation?.percentageScore}%`);
assertContent(!JSON.stringify(solverArithmeticResult).includes('y = mx + c'), 'Solver does NOT leak generic "y = mx + c" into arithmetic response');
assertContent(!solverArithmeticResult.finalAnswer.includes('2 / 4'), 'Solver does NOT award generic fallback 2/4 marks for 1-mark arithmetic question', `Got ${solverArithmeticResult.finalAnswer}`);
assertContent(solverArithmeticResult.topic.includes('Arithmetic'), 'Solver classifies topic as Basic Arithmetic & Number Operations', `Got ${solverArithmeticResult.topic}`);

// 8l. AI Solver specificity: Linear equation 2x + 3 = 11 with student working "x = 4"
const solverLinearResult = await solveQuestionWithGemini({
  questionText: '2x + 3 = 11',
  studentWorking: 'x = 4',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverLinearResult.topic.includes('Linear Equations'), 'Solver classifies 2x+3=11 under Linear Equations', `Got ${solverLinearResult.topic}`);
assertContent(solverLinearResult.finalAnswer.includes('x = 4'), 'Solver derives correct root x = 4', `Got ${solverLinearResult.finalAnswer}`);
assertContent(!JSON.stringify(solverLinearResult).includes('y = mx + c'), 'Solver does NOT fall back to y = mx + c for linear equation');
assertContent(solverLinearResult.studentWorkingEvaluation?.marksEarned === solverLinearResult.totalMarks, 'Solver awards full marks for correct linear equation working');

// 8l-2. Exact QA reproducer: "Solve 2x + 3 = 11. Show the algebraic steps. [3 marks]" with multi-line working
const solverLinear3Mark = await solveQuestionWithGemini({
  questionText: 'Solve 2x + 3 = 11. Show the algebraic steps. [3 marks]',
  studentWorking: '2x = 8\nx = 4',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverLinear3Mark.totalMarks === 3, 'Solver resolves 3 total marks from prompt spec', `Got ${solverLinear3Mark.totalMarks}`);
assertContent(solverLinear3Mark.studentWorkingEvaluation?.marksEarned === 3, 'Solver awards 3 / 3 marks for multi-line working (2x = 8, x = 4)', `Got ${solverLinear3Mark.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverLinear3Mark.studentWorkingEvaluation?.percentageScore === 100, 'Solver awards 100% confidence for correct steps');
assertContent(!JSON.stringify(solverLinear3Mark).includes('y = mx + c'), 'Solver does NOT leak y = mx + c into linear equation');

// 8m. Photo / Synthetic Image Math Solver: does not return y = mx + c
const solverPhotoResult = await solveQuestionWithGemini({
  imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=',
  questionText: '2 + 2 = 4',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverPhotoResult.totalMarks === 1, 'Photo Solver resolves 1 mark for 2+2=4 image text', `Got ${solverPhotoResult.totalMarks}`);
assertContent(!JSON.stringify(solverPhotoResult).includes('y = mx + c'), 'Photo Solver does NOT fall back to y = mx + c for arithmetic image');
assertContent(solverPhotoResult.topic.includes('Arithmetic'), 'Photo Solver classifies arithmetic image topic accurately', `Got ${solverPhotoResult.topic}`);

// 8n. AI Tutor Direct Arithmetic Grounding: "Solve 2 + 2. [1 mark]"
const tutorArithmeticReply = await askAiTutor([{ role: 'user', content: 'Solve 2 + 2. [1 mark]' }], 'Mathematics (0580)', 'Cambridge CIE');
assertContent(tutorArithmeticReply.includes('4'), 'AI Tutor provides direct answer 4 for arithmetic prompt', `Got: ${tutorArithmeticReply.slice(0, 100)}...`);
assertContent(tutorArithmeticReply.includes('[M1]') || tutorArithmeticReply.includes('1 mark'), 'AI Tutor provides exam mark breakdown for arithmetic prompt');
assertContent(!tutorArithmeticReply.toLowerCase().includes('reagent') && !tutorArithmeticReply.toLowerCase().includes('precipitate') && !tutorArithmeticReply.toLowerCase().includes('photosynthesis'), 'AI Tutor does not mix science syllabus into mathematics arithmetic prompt');

// 8n-2. AI Tutor Short Sentence Arithmetic Grounding: "Explain why 2 + 2 = 4 in one short sentence."
const tutorShortSentence = await askAiTutor([{ role: 'user', content: 'Explain why 2 + 2 = 4 in one short sentence.' }], 'Mathematics (0580)', 'Cambridge CIE');
assertContent(tutorShortSentence.includes('Adding two discrete units to another two discrete units yields a total quantity of four (2 + 2 = 4).'), 'AI Tutor answers short sentence arithmetic query without science advice', `Got: ${tutorShortSentence}`);
assertContent(!tutorShortSentence.toLowerCase().includes('m/s') && !tutorShortSentence.toLowerCase().includes('independent variable') && !tutorShortSentence.toLowerCase().includes('reaction'), 'AI Tutor does not leak physics/chemistry terms into 2+2=4');

// 8n-3. Serverless API Endpoint (/api/solve) handler regressions
async function invokeSolveHandler(reqBody: any) {
  let jsonRes: any = null;
  let textRes: any = null;
  const mockRes = {
    status(code: number) {
      return {
        json(data: any) { jsonRes = data; return data; },
        send(data: any) { textRes = data; return data; }
      };
    }
  };
  const mockReq = { method: 'POST', body: reqBody };
  const result = await solveHandler(mockReq, mockRes);
  if (result instanceof Response) {
    const raw = await result.text();
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return jsonRes || textRes;
}

const apiArithRes = await invokeSolveHandler({
  action: 'solve_question',
  questionText: 'Solve 2 + 2. [1 mark]',
  studentWorking: '4',
  subjectName: 'Mathematics',
  examBoard: 'CIE'
});
assertContent(apiArithRes?.totalMarks === 1, 'api/solve returns totalMarks: 1 for 1-mark arithmetic question', `Got ${apiArithRes?.totalMarks}`);
assertContent(apiArithRes?.studentWorkingEvaluation?.marksEarned === 1, 'api/solve awards 1/1 mark for answer "4"', `Got ${apiArithRes?.studentWorkingEvaluation?.marksEarned}`);
assertContent(!JSON.stringify(apiArithRes).includes('y = mx + c'), 'api/solve does NOT return y = mx + c for arithmetic question');

const apiLinearRes = await invokeSolveHandler({
  action: 'solve_question',
  questionText: 'Solve 2x + 3 = 11. Show the algebraic steps. [3 marks]',
  studentWorking: '2x = 8\nx = 4',
  subjectName: 'Mathematics',
  examBoard: 'CIE'
});
assertContent(apiLinearRes?.totalMarks === 3, 'api/solve returns totalMarks: 3 for 3-mark linear question', `Got ${apiLinearRes?.totalMarks}`);
assertContent(apiLinearRes?.studentWorkingEvaluation?.marksEarned === 3, 'api/solve awards 3/3 marks for multi-line steps 2x=8, x=4', `Got ${apiLinearRes?.studentWorkingEvaluation?.marksEarned}`);
assertContent(!JSON.stringify(apiLinearRes).includes('y = mx + c'), 'api/solve does NOT return y = mx + c for linear equation');

const apiTutorRes = await invokeSolveHandler({
  action: 'ai_tutor',
  messages: [{ role: 'user', content: 'Explain why 2 + 2 = 4 in one short sentence.' }],
  subjectName: 'Mathematics',
  examBoard: 'CIE'
});
assertContent(typeof apiTutorRes === 'string' && apiTutorRes.includes('Adding two discrete units to another two discrete units yields a total quantity of four (2 + 2 = 4).'), 'api/solve returns exact arithmetic sentence for AI Tutor');
assertContent(typeof apiTutorRes === 'string' && !apiTutorRes.toLowerCase().includes('m/s') && !apiTutorRes.toLowerCase().includes('independent variable'), 'api/solve does not inject physics terms into arithmetic AI Tutor reply');

// 8o. Senior Examiner Verification Agent: rejects generic y = mx + c template for arithmetic
const fakeArithmeticResult: any = {
  id: 'fake-test',
  questionText: 'Solve 2 + 2. [1 mark]',
  subject: 'Mathematics (0580)',
  topic: 'Key Syllabus Concepts & Problem Solving',
  formulaUsed: 'y = mx + c',
  steps: [{ stepNumber: 1, explanation: 'Apply formula y = mx + c', mathExpression: 'y = mx + c' }],
  finalAnswer: '2 / 4 Marks',
  totalMarks: 4,
  accuracyScorePercent: 100
};
const examinerReport = verifyAndAuditSolverResult(fakeArithmeticResult);
assertContent(!examinerReport.isVerified, 'Examiner Agent rejects generic template on arithmetic prompt', `isVerified was ${examinerReport.isVerified}`);
assertContent(examinerReport.accuracyScorePercent <= 50, 'Examiner Agent docks accuracy score for generic template mismatch', `Score was ${examinerReport.accuracyScorePercent}%`);
assertContent(examinerReport.examinerSeal === 'NEEDS_EXAMINER_REVIEW', 'Examiner Agent marks template mismatch as NEEDS_EXAMINER_REVIEW', `Seal was ${examinerReport.examinerSeal}`);

// 8p. AI Tutor Relevancy: ESL "since" vs "for"
console.log('\n--- 8p-8x. AI Tutor & Solver Subject Relevancy & Mark Rigour ---');
const tutorEslSinceFor = await askAiTutor([{ role: 'user', content: 'What is the difference between "since" and "for"?' }], 'English as a Second Language (0510)', 'Cambridge CIE');
assertContent(tutorEslSinceFor.toLowerCase().includes('point in time') && tutorEslSinceFor.toLowerCase().includes('duration'), 'AI Tutor explains "since" (point in time) vs "for" (duration)', `Got: ${tutorEslSinceFor.slice(0, 100)}...`);
assertContent(!tutorEslSinceFor.includes('m/s') && !tutorEslSinceFor.includes('SI units') && !tutorEslSinceFor.toLowerCase().includes('cause/effect rubric'), 'AI Tutor does NOT return science rubrics or SI units for ESL grammar');
assertContent(!tutorEslSinceFor.includes('10 + 2 = 8'), 'AI Tutor does NOT contain false equation 10 + 2 = 8');

// 8q. AI Tutor Relevancy: Maths roots of x^2 = 9
const tutorMathRoots = await askAiTutor([{ role: 'user', content: 'What are the roots of x^2 = 9?' }], 'Mathematics (0580)', 'Cambridge CIE');
assertContent(tutorMathRoots.includes('+3') && tutorMathRoots.includes('-3'), 'AI Tutor states both roots (+3 and -3 or ±3) for x^2 = 9', `Got: ${tutorMathRoots.slice(0, 100)}...`);
assertContent(tutorMathRoots.toLowerCase().includes('trap') || tutorMathRoots.toLowerCase().includes('incomplete'), 'AI Tutor warns that stating only x = 3 is incomplete and forfeits accuracy mark');

const tutorMathRootsExplain = await askAiTutor([{ role: 'user', content: 'Solve x^2 = 9 and explain its two roots' }], 'Mathematics (0580)', 'Cambridge CIE');
assertContent(tutorMathRootsExplain.includes('+3') && tutorMathRootsExplain.includes('-3'), 'AI Tutor provides both roots (+3 and -3) when asked to solve and explain', `Got: ${tutorMathRootsExplain.slice(0, 100)}...`);
assertContent(!tutorMathRootsExplain.includes('SI units') && !tutorMathRootsExplain.includes('y = mx + c'), 'AI Tutor does NOT return generic SI units or y=mx+c for quadratic explanation');

// 8r. AI Tutor Relevancy: Biology Heart Chambers & Blood Flow
const tutorBioChambers = await askAiTutor([{ role: 'user', content: 'What are the chambers of the heart and how does blood flow through them?' }], 'Biology (0610)', 'Cambridge CIE');
assertContent(tutorBioChambers.includes('Right Atrium') && tutorBioChambers.includes('Left Atrium') && tutorBioChambers.includes('Right Ventricle') && tutorBioChambers.includes('Left Ventricle'), 'AI Tutor names all 4 heart chambers', `Got: ${tutorBioChambers.slice(0, 120)}...`);
assertContent(tutorBioChambers.includes('vena cava') && tutorBioChambers.includes('aorta'), 'AI Tutor names vena cava and aorta in blood flow path');
assertContent(!tutorBioChambers.includes('m/s') && !tutorBioChambers.includes('y = mx + c'), 'AI Tutor does NOT leak physics/math formulas into biology response');

// 8s. Solver Mark Scoring: Incomplete quadratic answer x = 3 on x^2 = 9 [2 marks] awards partial credit 1/2 marks
const solverQuadIncomplete = await solveQuestionWithGemini({
  questionText: 'Solve x^2 = 9. [2 marks]',
  studentWorking: 'x = 3',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverQuadIncomplete.totalMarks === 2, 'Quadratic solver resolves 2 total marks from prompt spec', `Got ${solverQuadIncomplete.totalMarks}`);
assertContent(solverQuadIncomplete.studentWorkingEvaluation?.marksEarned === 1, 'Incomplete quadratic answer x = 3 receives partial credit 1 / 2 marks (M1 awarded, A0 withheld)', `Got ${solverQuadIncomplete.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverQuadIncomplete.studentWorkingEvaluation?.percentageScore === 50, 'Incomplete quadratic answer receives 50% score', `Got ${solverQuadIncomplete.studentWorkingEvaluation?.percentageScore}%`);
assertContent(!JSON.stringify(solverQuadIncomplete).includes('1(3)=3') && !JSON.stringify(solverQuadIncomplete).includes('y = mx + c'), 'Quadratic solver does NOT invent false linear check 1(3)=3 or leak y=mx+c');

// 8t. Solver Mark Scoring: Full quadratic answer x = 3, x = -3 on x^2 = 9 [2 marks] awards full credit 2/2 marks
const solverQuadComplete = await solveQuestionWithGemini({
  questionText: 'Solve x^2 = 9. [2 marks]',
  studentWorking: 'x = 3, x = -3',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverQuadComplete.studentWorkingEvaluation?.marksEarned === 2, 'Complete quadratic answer x = 3, x = -3 receives full credit 2 / 2 marks', `Got ${solverQuadComplete.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverQuadComplete.studentWorkingEvaluation?.percentageScore === 100, 'Complete quadratic answer receives 100% score');

// 8u. Solver Mark Scoring: Correct Physics working F = ma = 1200 x 2 = 2400 N awards 2/2 marks
const solverPhysicsForce = await solveQuestionWithGemini({
  questionText: 'Calculate the resultant force acting on a 1200 kg vehicle accelerating at 2 m/s^2. [2 marks]',
  studentWorking: 'F = ma = 1200 x 2 = 2400 N',
  subjectName: 'Physics (0625)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverPhysicsForce.studentWorkingEvaluation?.marksEarned === 2, 'Physics F = ma calculation receives 2 / 2 marks', `Got ${solverPhysicsForce.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverPhysicsForce.studentWorkingEvaluation?.percentageScore === 100, 'Physics working receives 100%');
assertContent(solverPhysicsForce.topic.toLowerCase().includes('mechanic') || solverPhysicsForce.topic.toLowerCase().includes('force'), 'Physics working correctly classified under Mechanics/Force', `Got ${solverPhysicsForce.topic}`);

// 8v. Solver Mark Scoring: Correct Chemistry working Mr(H2O) = 18 awards 2/2 marks without ESL criteria
const solverChemMr = await solveQuestionWithGemini({
  questionText: 'Calculate the relative formula mass of H2O. [2 marks]',
  studentWorking: 'Mr(H2O) = 18',
  subjectName: 'Chemistry (0620)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverChemMr.studentWorkingEvaluation?.marksEarned === 2, 'Chemistry Mr(H2O) = 18 receives 2 / 2 marks', `Got ${solverChemMr.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverChemMr.studentWorkingEvaluation?.percentageScore === 100, 'Chemistry Mr calculation receives 100%');
assertContent(solverChemMr.subject.toLowerCase().includes('chemistry'), 'Chemistry question remains categorized as Chemistry', `Got ${solverChemMr.subject}`);
assertContent(!JSON.stringify(solverChemMr).includes('subordinating conjunction') && !JSON.stringify(solverChemMr).includes('cohesive devices'), 'Chemistry question does NOT leak ESL language criteria');

// 8w. Photo / Image Solving: Rectangle 5 cm x 3 cm [1 mark] computes area 15 cm^2
const solverRectImage = await solveQuestionWithGemini({
  questionText: 'Find the area of a rectangle with length 5 cm and width 3 cm. [1 mark]',
  studentWorking: '15 cm^2',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverRectImage.totalMarks === 1, 'Rectangle question resolves 1 total mark', `Got ${solverRectImage.totalMarks}`);
assertContent(solverRectImage.studentWorkingEvaluation?.marksEarned === 1, 'Rectangle answer 15 cm^2 receives 1 / 1 mark', `Got ${solverRectImage.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverRectImage.finalAnswer.includes('15') && solverRectImage.finalAnswer.includes('cm'), 'Rectangle solution final answer contains 15 cm²', `Got ${solverRectImage.finalAnswer}`);

// 8x. Safe OCR / Binary Leak Elimination: Binary PNG image does NOT leak IHDR/IDAT or invent O=2
const solverBinarySafe = await solveQuestionWithGemini({
  imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  questionText: 'Find the area of the rectangle. Dimensions 5 cm x 3 cm. [1 mark]',
  studentWorking: '15',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(!solverBinarySafe.questionText.includes('IHDR') && !solverBinarySafe.questionText.includes('IDAT'), 'Solver does NOT leak raw binary PNG chunks (IHDR/IDAT) into questionText');
assertContent(!JSON.stringify(solverBinarySafe).includes('O=2') && !JSON.stringify(solverBinarySafe).includes('O = 2'), 'Solver does NOT invent false equation O=2 from binary noise');
assertContent(solverBinarySafe.studentWorkingEvaluation?.marksEarned === 1, 'Binary image with 5 cm x 3 cm prompt correctly marks student answer 15 as 1/1');

// 8y. Image Solver: Unparsed image guard returns 0 marks with clear failure notice
const solverUnparsedImage = await solveQuestionWithGemini({
  imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  studentWorking: 'x = 3',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverUnparsedImage.totalMarks === 0, 'Unparsed image without readable question awards 0 total marks', `Got ${solverUnparsedImage.totalMarks}`);
assertContent(solverUnparsedImage.studentWorkingEvaluation?.marksEarned === 0, 'Unparsed image awards 0 marks earned', `Got ${solverUnparsedImage.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverUnparsedImage.questionText.toLowerCase().includes('parsing incomplete') || (solverUnparsedImage.fullStepByStepSolution?.toLowerCase() || '').includes('clearer photo'), 'Unparsed image alerts student to provide clearer photo or type question manually');

// 8z. Image Solver: SVG rectangle image without typed prompt resolves 15 cm^2
const svgRectangle = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><text>Rectangle 5 cm by 3 cm. Calculate area. [1 mark]</text></svg>').toString('base64');
const solverSvgRect = await solveQuestionWithGemini({
  imageBase64: svgRectangle,
  studentWorking: '15 cm^2',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverSvgRect.totalMarks === 1, 'SVG rectangle question resolves 1 total mark from image text', `Got ${solverSvgRect.totalMarks}`);
assertContent(solverSvgRect.studentWorkingEvaluation?.marksEarned === 1, 'SVG rectangle image awards 1 mark for 15 cm^2', `Got ${solverSvgRect.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverSvgRect.finalAnswer.includes('15') && solverSvgRect.finalAnswer.includes('cm'), 'SVG rectangle image final answer contains 15 cm²', `Got ${solverSvgRect.finalAnswer}`);

// 8aa. Solver Mark Scoring: Multi-part Quadratic Vertex Form
const vertexPrompt = 'Write y = 2x^2 - 12x + 23 in the form a(x + p)^2 + q. [3 marks] Hence state the coordinates of the turning point and whether it is a maximum or minimum. [2 marks]';

// Case 1: Full 5/5 marks
const solverVertexFull = await solveQuestionWithGemini({
  questionText: vertexPrompt,
  studentWorking: '2(x - 3)^2 + 5\nTurning point is (3, 5), which is a minimum',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverVertexFull.totalMarks === 5, 'Vertex form question resolves 5 total marks ([3] + [2])', `Got ${solverVertexFull.totalMarks}`);
assertContent(solverVertexFull.studentWorkingEvaluation?.marksEarned === 5, 'Vertex form: both vertex form and turning point award 5 / 5 marks', `Got ${solverVertexFull.studentWorkingEvaluation?.marksEarned}`);
assertContent(solverVertexFull.studentWorkingEvaluation?.percentageScore === 100, 'Vertex form: full credit awards 100%');

// Case 2: Vertex form only -> 3/5 marks
const solverVertexOnly = await solveQuestionWithGemini({
  questionText: vertexPrompt,
  studentWorking: '2(x - 3)^2 + 5',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverVertexOnly.studentWorkingEvaluation?.marksEarned === 3, 'Vertex form: form only awards 3 / 5 marks', `Got ${solverVertexOnly.studentWorkingEvaluation?.marksEarned}`);

// Case 3: Turning point only -> 2/5 marks
const solverTpOnly = await solveQuestionWithGemini({
  questionText: vertexPrompt,
  studentWorking: 'Turning point: (3, 5), minimum',
  subjectName: 'Mathematics (0580)',
  examBoard: 'Cambridge CIE',
  gradeLevel: 'IGCSE'
});
assertContent(solverTpOnly.studentWorkingEvaluation?.marksEarned === 2, 'Vertex form: turning point only awards 2 / 5 marks', `Got ${solverTpOnly.studentWorkingEvaluation?.marksEarned}`);

// 8ab. AI Tutor Relevancy: Biology Alveoli & Gas Exchange Adaptations
const tutorBioAlveoli = await askAiTutor([{ role: 'user', content: 'What are the adaptations of alveoli for gas exchange in human lungs?' }], 'Biology (0610)', 'Cambridge CIE');
assertContent(tutorBioAlveoli.toLowerCase().includes('surface area') && tutorBioAlveoli.toLowerCase().includes('capillar') && (tutorBioAlveoli.toLowerCase().includes('one-cell') || tutorBioAlveoli.toLowerCase().includes('thin')), 'AI Tutor explains alveoli adaptations (large surface area, dense capillaries, 1-cell thick barrier)', `Got: ${tutorBioAlveoli.slice(0, 150)}...`);
assertContent(!tutorBioAlveoli.toLowerCase().includes('hydrochloric acid') && !tutorBioAlveoli.toLowerCase().includes('activation energy') && !tutorBioAlveoli.toLowerCase().includes('catalyst'), 'AI Tutor does not leak Chemistry Rates of Reaction concepts into Biology alveoli gas exchange');

// 8ac. AI Tutor Placeholder Guard: Reject [type your answer here]
const tutorPlaceholderCheck = await askAiTutor([{ role: 'user', content: 'For 0580/42 Q6, my answer is: [type your answer here]' }], 'Mathematics (0580)', 'Cambridge CIE');
assertContent(tutorPlaceholderCheck.includes('Please enter your working steps or final numerical answer'), 'AI Tutor rejects [type your answer here] and prompts for actual working instead of marking 0/7');

// 8ad. WorksheetBuilder & Blueprint Mark Scheme 1:1 Match
const mathPapers = PAST_PAPERS_DATABASE.filter(p => p.subjectCode === '0580');
for (const p of mathPapers) {
  if (p.markScheme) {
    assertContent(p.markScheme.length === p.marks, `Paper ${p.id} (${p.questionNumber}) markScheme length equals marks (${p.markScheme.length} === ${p.marks})`, `Expected ${p.marks}, got ${p.markScheme.length}`);
  }
}

// 8ae. MCQ Blueprint Deduplication
const chemPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.subjectCode === '0620')!;
const chemMcqs = generate40McqQuestions(chemPdf);
const chemPrompts1to10 = new Set(chemMcqs.slice(0, 10).map(m => m.questionPrompt));
assertContent(chemPrompts1to10.size === 10, 'Chemistry MCQs 1 to 10 have 10 distinct non-repeating prompts', `Got ${chemPrompts1to10.size} unique prompts`);

const physPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.subjectCode === '0625')!;
const physMcqs = generate40McqQuestions(physPdf);
const physPrompts1to10 = new Set(physMcqs.slice(0, 10).map(m => m.questionPrompt));
assertContent(physPrompts1to10.size === 10, 'Physics MCQs 1 to 10 have 10 distinct non-repeating prompts', `Got ${physPrompts1to10.size} unique prompts`);

const bioPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.subjectCode === '0610')!;
const bioMcqs = generate40McqQuestions(bioPdf);
const bioPrompts1to10 = new Set(bioMcqs.slice(0, 10).map(m => m.questionPrompt));
assertContent(bioPrompts1to10.size === 10, 'Biology MCQs 1 to 10 have 10 distinct non-repeating prompts', `Got ${bioPrompts1to10.size} unique prompts`);

// 8af. Classifieds Question Pool Provenance & Amphibian Wording
const azoresQ = AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS.find(q => q.id === 'pp-0510-01-q1')!;
assertContent(azoresQ.source.includes('Model Assessment'), 'Azores ESL question clarifies source as Model Assessment to avoid conflict with authentic past paper PDF archives');

const amphQ = AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS.find(q => q.id === 'pp-0610-01-q1')!;
const amphScheme = JSON.stringify(amphQ.subParts?.[0].markScheme || []);
assertContent(!amphScheme.includes('webbed feet'), 'Amphibian mark scheme does not state webbed feet as a universal requirement');
assertContent(amphScheme.includes('Moist permeable skin without scales'), 'Amphibian mark scheme requires moist permeable skin without scales');

const audioSp26 = createValidMp3Buffer(120, '0510_sp26_audio_22');
const audioS17 = createValidMp3Buffer(120, '0510_s17_audio_42');
const audioW10 = createValidMp3Buffer(120, '0510_w10_audio_41');

// Transport health assertions
assertTransport(audioSp26.subarray(0, 3).toString('ascii') === 'ID3', '0510 sp26 audio buffer has valid ID3v2 header');
assertTransport(audioS17.subarray(0, 3).toString('ascii') === 'ID3', '0510 s17 audio buffer has valid ID3v2 header');
assertTransport(audioW10.subarray(0, 3).toString('ascii') === 'ID3', '0510 w10 audio buffer has valid ID3v2 header');
assertTransport(audioSp26.length > 1000 && audioS17.length > 1000 && audioW10.length > 1000, 'Audio buffers have valid non-zero transport lengths');

// Content correctness assertions
const hashSp26 = crypto.createHash('sha256').update(audioSp26).digest('hex');
const hashS17 = crypto.createHash('sha256').update(audioS17).digest('hex');
const hashW10 = crypto.createHash('sha256').update(audioW10).digest('hex');
const oldStaticHash = '13676888803580ed2a9a5a31ecdcdf48e114dc754b86a9e0444f231d898bb89b';

assertContent(hashSp26 !== hashS17, 'Audio track 0510_sp26_audio_22 hash differs from 0510_s17_audio_42');
assertContent(hashS17 !== hashW10, 'Audio track 0510_s17_audio_42 hash differs from 0510_w10_audio_41');
assertContent(hashSp26 !== hashW10, 'Audio track 0510_sp26_audio_22 hash differs from 0510_w10_audio_41');
assertContent(hashSp26 !== oldStaticHash && hashS17 !== oldStaticHash && hashW10 !== oldStaticHash, 'Audio tracks do not match the old static 1.25MB byte-identical hash');
assertContent(audioSp26.includes('0510_sp26_audio_22'), 'Audio buffer contains embedded metadata title matching track code');

// TEST SUITE 11: ESL PAPER IDENTITY MAPPINGS & CROSS-VARIANT PURITY
console.log('\n--- 11. ESL Paper Identity Mappings & Cross-Variant Purity ---');
// Verify fake cross-variant aliases are eliminated from LOCAL_VERIFIED_PDFS
assertContent(!('0510_s16_qp_12.pdf' in LOCAL_VERIFIED_PDFS), 'LOCAL_VERIFIED_PDFS does not contain fake alias for 0510_s16_qp_12.pdf');
assertContent(!('0510_w10_ms_42.pdf' in LOCAL_VERIFIED_PDFS), 'LOCAL_VERIFIED_PDFS does not contain fake alias for 0510_w10_ms_42.pdf');
assertContent(!('0510_s10_ms_13.pdf' in LOCAL_VERIFIED_PDFS), 'LOCAL_VERIFIED_PDFS does not contain fake alias for 0510_s10_ms_13.pdf');
assertContent(!('0510_s10_ms_33.pdf' in LOCAL_VERIFIED_PDFS), 'LOCAL_VERIFIED_PDFS does not contain fake alias for 0510_s10_ms_33.pdf');

// Verify authentic partially published papers are accurately catalogued with genuine PDFs and non-published notices
const nonAdministeredS16 = OFFICIAL_PAST_PAPER_PDFS.find(p => p.paperCode === '0510/12' && p.year === 2016 && p.session.includes('May/June'));
assertContent(nonAdministeredS16 !== undefined, 'Restored paper 0510/12 May/June 2016 exists in past paper archive');
assertContent(nonAdministeredS16?.isUnavailable === false, '0510/12 May/June 2016 is not marked totally unavailable since MS exists');
assertContent(nonAdministeredS16?.msPdfUrl?.includes('0510_s16_ms_12.pdf') === true, '0510/12 May/June 2016 points to authentic Mark Scheme 12');
assertContent(nonAdministeredS16?.qpPdfUrl === '', '0510/12 May/June 2016 does not link unadministered QP');
assertContent(nonAdministeredS16?.qpUnavailableReason?.includes('not published') === true, '0510/12 May/June 2016 specifies QP was not published');

const nonAdministeredW10 = OFFICIAL_PAST_PAPER_PDFS.find(p => p.paperCode === '0510/42' && p.year === 2010 && p.session.includes('Oct/Nov'));
assertContent(nonAdministeredW10 !== undefined, 'Restored paper 0510/42 Oct/Nov 2010 exists in past paper archive');
assertContent(nonAdministeredW10?.isUnavailable === false, '0510/42 Oct/Nov 2010 is not marked totally unavailable since QP exists');
assertContent(nonAdministeredW10?.qpPdfUrl?.includes('0510_w10_qp_42.pdf') === true, '0510/42 Oct/Nov 2010 points to authentic Question Paper 42');
assertContent(nonAdministeredW10?.msPdfUrl === '', '0510/42 Oct/Nov 2010 does not link unadministered MS');
assertContent(nonAdministeredW10?.msUnavailableReason?.includes('not published') === true, '0510/42 Oct/Nov 2010 specifies MS was not published');

// TEST SUITE 12: PAPER NUMBER FILTER ACCURACY & MULTI-COMPONENT ISOLATION
console.log('\n--- 12. Paper Number Filter Accuracy & Multi-Component Isolation ---');

// Simulate the exact PastPaperFinder filter logic
function filterPapers(papers: typeof OFFICIAL_PAST_PAPER_PDFS, opts: {
  subjectId?: string;
  year?: number;
  session?: string;
  paperNumber?: string;
  variant?: string;
}) {
  return papers.filter(pdf => {
    if (opts.subjectId && opts.subjectId !== 'all') {
      const matchesSub = pdf.subjectId === opts.subjectId || pdf.subjectCode.toLowerCase() === opts.subjectId.toLowerCase();
      if (!matchesSub) return false;
    }
    if (opts.year && pdf.year !== opts.year) return false;
    if (opts.session && opts.session !== 'All') {
      const targetSess = opts.session.toLowerCase();
      const pdfSess = pdf.session.toLowerCase();
      const isMayJuneTarget = targetSess.includes('may') || targetSess.includes('june') || targetSess === 's';
      const isMayJunePdf = pdfSess.includes('may') || pdfSess.includes('june') || pdfSess.includes('summer') || pdfSess.includes('s');
      if (isMayJuneTarget && isMayJunePdf) {
        // match cross-board May/June
      } else if (!pdfSess.includes(targetSess)) {
        return false;
      }
    }
    if (opts.paperNumber && opts.paperNumber !== 'All') {
      const cleanTarget = opts.paperNumber.replace(/^paper\s*/i, '').trim();
      if (pdf.paperNumber !== undefined && pdf.paperNumber !== null) {
        if (pdf.paperNumber.toString() !== cleanTarget) return false;
      } else {
        const matchCode = new RegExp('[/_]0?' + cleanTarget + '[0-9]?($|[^0-9])').test(pdf.paperCode);
        const matchComponent = new RegExp('\\bpaper\\s*0?' + cleanTarget + '\\b', 'i').test(pdf.paperComponent || '');
        if (!matchCode && !matchComponent) return false;
      }
    }
    if (opts.variant && opts.variant !== 'All' && pdf.variant !== undefined) {
      if (pdf.variant.toString() !== opts.variant) return false;
    }
    return true;
  });
}

// 12a. CIE ESL Archive Paper Number filter: 2025 / May-June / Paper 2 / Variant 2
const eslP2V2 = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'cie-esl-0510',
  year: 2025,
  session: 'May/June',
  paperNumber: '2',
  variant: '2'
});
assertContent(eslP2V2.length > 0, 'ESL 2025 May/June Paper 2 Variant 2 returns matching papers', `Found ${eslP2V2.length}`);
assertContent(eslP2V2.some(p => p.paperCode === '0510/22'), 'ESL filter results include 0510/22');
assertContent(eslP2V2.every(p => p.paperCode !== '0510/12'), 'ESL filter results contain ZERO instances of 0510/12 Paper 1 (no variant bleed)');

// 12b. Multi-component regression: Physics (0625) 2023 / May-June / Paper 2 / Variant 2
const physicsP2V2 = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'cie-physics-0625',
  year: 2023,
  session: 'May/June',
  paperNumber: '2',
  variant: '2'
});
assertContent(physicsP2V2.length > 0, 'Physics 2023 May/June Paper 2 Variant 2 returns matching papers', `Found ${physicsP2V2.length}`);
assertContent(physicsP2V2.some(p => p.paperCode === '0625/22'), 'Physics filter results include 0625/22 Paper 2');
assertContent(physicsP2V2.every(p => p.paperCode !== '0625/12' && p.paperCode !== '0625/42' && p.paperCode !== '0625/62'), 'Physics filter results contain ZERO instances of Paper 1, Paper 4, or Paper 6');

// 12c. Edexcel 2026 June Series Filter: 4ES1 and 4MA1
const edexcel4es1June = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'edx-esl-4es1',
  year: 2026,
  session: 'May/June'
});
assertContent(edexcel4es1June.length === 4, 'Edexcel 4ES1 2026 May/June filter returns all 4 June 2026 papers', `Found ${edexcel4es1June.length}`);
assertContent(edexcel4es1June.every(p => p.session.toLowerCase().includes('june')), 'All returned 4ES1 papers belong to June series');

const edexcel4es1StrictJune = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'edx-esl-4es1',
  year: 2026,
  session: 'June'
});
assertContent(edexcel4es1StrictJune.length === 4, 'Edexcel 4ES1 2026 June filter returns all 4 June 2026 papers', `Found ${edexcel4es1StrictJune.length}`);

const edexcel4es1All = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'edx-esl-4es1',
  year: 2026,
  session: 'All'
});
assertContent(edexcel4es1All.length === 8, 'Edexcel 4ES1 2026 All filter returns all 8 papers (4 June + 4 Jan)', `Found ${edexcel4es1All.length}`);

const edexcel4ma1June = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'edx-math-4ma1',
  year: 2026,
  session: 'May/June'
});
assertContent(edexcel4ma1June.length === 8, 'Edexcel 4MA1 2026 May/June filter returns all 8 June 2026 papers', `Found ${edexcel4ma1June.length}`);
assertContent(edexcel4ma1June.every(p => p.session.toLowerCase().includes('june')), 'All returned 4MA1 papers belong to June series');

const edexcel4ma1StrictJune = filterPapers(OFFICIAL_PAST_PAPER_PDFS, {
  subjectId: 'edx-math-4ma1',
  year: 2026,
  session: 'June'
});
assertContent(edexcel4ma1StrictJune.length === 8, 'Edexcel 4MA1 2026 June filter returns all 8 June 2026 papers', `Found ${edexcel4ma1StrictJune.length}`);

// TEST SUITE 13: DIRECT RESOURCE AVAILABILITY & DISCLOSURE
console.log('\n--- 13. Direct Resource Availability & Board Hub Disclosure ---');

// 13a. ESL 2026 Specimen papers must expose direct Cambridge PDF links, not board hubs
const sp26Paper1 = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === 'pdf-0510-sp26-1');
assertTransport(!!sp26Paper1?.qpPdfUrl && !!sp26Paper1?.msPdfUrl, 'Specimen Paper 1 has defined QP & MS URLs');
assertContent(sp26Paper1?.isPortal === false, 'Specimen Paper 1 is flagged as direct resource (isPortal: false)');
assertContent(sp26Paper1?.qpPdfUrl.includes('637263-2024-specimen-paper-1.pdf') === true, 'Specimen Paper 1 QP points to direct Cambridge PDF');
assertContent(sp26Paper1?.msPdfUrl.includes('637270-2024-specimen-paper-1-mark-scheme.pdf') === true, 'Specimen Paper 1 MS points to direct Cambridge PDF');

const sp26Paper2 = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === 'pdf-0510-sp26-2');
assertTransport(!!sp26Paper2?.qpPdfUrl && !!sp26Paper2?.msPdfUrl, 'Specimen Paper 2 has defined QP & MS URLs');
assertContent(sp26Paper2?.isPortal === false, 'Specimen Paper 2 is flagged as direct resource (isPortal: false)');
assertContent(sp26Paper2?.qpPdfUrl.includes('638100-2024-specimen-paper-2.pdf') === true, 'Specimen Paper 2 QP points to direct Cambridge PDF');
assertContent(sp26Paper2?.msPdfUrl.includes('638098-2024-specimen-paper-2-markscheme.pdf') === true, 'Specimen Paper 2 MS points to direct Cambridge PDF');

// 13b. Cross-board archive inventory audit: Edexcel & OxfordAQA must be flagged isPortal: true
const edexcelRows = OFFICIAL_PAST_PAPER_PDFS.filter(p => p.board === 'Edexcel');
const oxfordRows = OFFICIAL_PAST_PAPER_PDFS.filter(p => p.board === 'OxfordAQA');
const cieRows = OFFICIAL_PAST_PAPER_PDFS.filter(p => p.board === 'CIE');

assertContent(edexcelRows.length === 1666, 'Catalog inventory contains all 1,666 Edexcel rows', `Found ${edexcelRows.length}`);
assertContent(oxfordRows.length === 231, 'Catalog inventory contains all 231 OxfordAQA rows', `Found ${oxfordRows.length}`);
assertContent(cieRows.length === 7375, 'Catalog inventory contains all 7,375 CIE rows (including restored unavailable s16/w10 variants)', `Found ${cieRows.length}`);
assertContent(OFFICIAL_PAST_PAPER_PDFS.length === 9272, 'Catalog total inventory equals exactly 9,272 items', `Found ${OFFICIAL_PAST_PAPER_PDFS.length}`);

// Every Edexcel and OxfordAQA row must disclose isPortal: true so students are not served fake PDFs
assertContent(edexcelRows.every(p => p.isPortal === true), 'All 1,666 Edexcel rows explicitly set isPortal: true');
assertContent(oxfordRows.every(p => p.isPortal === true), 'All 231 OxfordAQA rows explicitly set isPortal: true');

// CIE 2026 coverage check: verify regular CIE series are through 2025 and 2026 contains specimen placeholders only
const cie2026Rows = cieRows.filter(p => p.year === 2026);
assertContent(cie2026Rows.length === 5, 'CIE 2026 rows consist exclusively of the 5 authentic specimen placeholders (0580, 0510, 0500)', `Found ${cie2026Rows.length}`);
assertContent(cie2026Rows.every(p => p.session.toLowerCase().includes('specimen')), 'All CIE 2026 rows are specimen sessions, avoiding unadministered regular series falsification');

// TEST SUITE 14: NAVIGATION & PAPER COUNT RECONCILIATION
console.log('\n--- 14. Navigation Label & Archive Count Reconciliation ---');
assertContent(OFFICIAL_PAST_PAPER_PDFS.length >= 9200, 'Past paper archive count matches high catalog depth (>= 9,200)', `Found ${OFFICIAL_PAST_PAPER_PDFS.length}`);

// TEST SUITE 15: AUTONOMOUS FOUNDER CONSOLE QA SWEEP
console.log('\n--- 15. Autonomous Founder Console QA Sweep & Curriculum Guard ---');
const autonomousSweep = await runFullAutonomousQaSweep();
assertContent(autonomousSweep.failedCount === 0, 'Autonomous QA sweep reports 0 failed checks (100% health)', `Found ${autonomousSweep.failedCount} failures: ${autonomousSweep.checks.filter(c => c.status === 'failed').map(c => c.name).join(', ')}`);
const eslGuard = autonomousSweep.checks.find(c => c.id === 'guard-esl-reform-mapping');
assertContent(eslGuard?.status === 'passed', 'ESL 0510 Paper 1 vs Paper 2 Reform Guard is PASSED', eslGuard?.details);

console.log('✓ Verified AI Solver, AI Tutor, and Math Working Validator precision & subject isolation');
console.log(`✓ Verified Audio Asset Non-Colliding Distinct Content & ID3 Metadata`);
console.log(`✓ Verified ESL Paper Identity, Filter Boundaries, and Direct Specimen Endpoints`);
console.log(`✓ Verified Autonomous QA Sweep: ${autonomousSweep.passedCount}/${autonomousSweep.totalChecks} Checks Passed (${autonomousSweep.healthPercent}% System Health)`);

console.log('\n===========================================================');
console.log('  QA ACCEPTANCE REPORT: TRANSPORT HEALTH VS CONTENT CORRECTNESS');
console.log('===========================================================');
console.log(`  [TRANSPORT HEALTH]    : ${transportPassCount} Passed, ${transportFailCount} Failed`);
console.log(`  [CONTENT CORRECTNESS] : ${contentPassCount} Passed, ${contentFailCount} Failed`);
console.log(`  [OVERALL TOTAL]       : ${passCount} Passed, ${failCount} Failed`);

if (failCount === 0) {
  console.log('\n  RESULT: ALL WEBSITE FUNCTIONALITY, CONTENT & TRANSPORT AUDITS PASSED!');
} else {
  console.log(`\n  FAILURES (${failCount}):\n  ${failures.join('\n  ')}`);
}
console.log('===========================================================');

process.exit(failCount === 0 ? 0 : 1);

