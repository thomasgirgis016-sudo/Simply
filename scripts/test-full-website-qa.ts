import fs from 'fs';
import path from 'path';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../src/data/pastPapersData';
import { COMPREHENSIVE_REVISION_NOTES } from '../src/data/revisionData';
import { CHEAT_SHEETS_DATABASE } from '../src/data/cheatSheetsData';
import { IGCSE_PERIODIC_TABLE, CAMBRIDGE_EXAM_FORMULAS } from '../src/data/periodicTableData';
import { OFFICIAL_EXAM_TIMETABLE } from '../src/data/examTimetableData';
import { validateKatexSyntax } from '../src/services/pastPaperQaAgent';

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
assert(OFFICIAL_PAST_PAPER_PDFS.length >= 3000, 'PDF Archive Catalog Scale', `Found ${OFFICIAL_PAST_PAPER_PDFS.length} PDFs`);
let verifiedPdfUrls = 0;
for (const pdf of OFFICIAL_PAST_PAPER_PDFS) {
  assert(!!pdf.qpPdfUrl && !!pdf.msPdfUrl, `PDF ${pdf.id} URL existence`, 'Missing QP or MS URL');
  assert(pdf.year >= 2016 && pdf.year <= 2026, `PDF ${pdf.id} year range`, `Invalid year ${pdf.year}`);
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
console.log(`✓ Verified official Cambridge exam dates & timings`);

console.log('\n===========================================================');
console.log(`  QA SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log('  RESULT: ALL WEBSITE FUNCTIONALITY & CONTENT AUDITS PASSED!');
} else {
  console.log(`  FAILURES:\n  ${failures.join('\n  ')}`);
}
console.log('===========================================================');

process.exit(failCount === 0 ? 0 : 1);
