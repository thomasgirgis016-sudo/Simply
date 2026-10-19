// Past Paper QA Verification Script
// Path: scripts/test-past-papers.ts
// Run via: npx tsx scripts/test-past-papers.ts

import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../src/data/pastPapersData';
import { runPastPaperQaAgent } from '../src/services/pastPaperQaAgent';

console.log('===========================================================');
console.log('  SIMPLY IGCSE — PAST PAPER QA VERIFICATION AGENT');
console.log('===========================================================');
console.log(`Scanning ${PAST_PAPERS_DATABASE.length} questions and ${OFFICIAL_PAST_PAPER_PDFS.length} official PDF archives...\n`);

const report = runPastPaperQaAgent(PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS);

console.log('--- QA AUDIT SUMMARY REPORT ---');
console.log(`Scan Date:              ${new Date(report.scannedAt).toLocaleString()}`);
console.log(`Total Questions:        ${report.totalQuestionsScanned}`);
console.log(`Total PDFs Indexed:     ${report.totalPdfsScanned}`);
console.log(`Integrity Health Score: ${report.healthScorePercent}%\n`);

console.log(`Passed Checks:          ${report.passedCount}`);
console.log(`Flagged Issues:         ${report.failedCount}`);
console.log(`KaTeX Syntax Errors:    ${report.katexSyntaxErrors}`);
console.log(`Missing Mark Schemes:   ${report.missingMarkSchemes}`);
console.log(`Format Mismatches:      ${report.formatMismatches}\n`);

if (report.issues.length === 0) {
  console.log('✅ ALL CHECKS PASSED: All question KaTeX equations, sub-part mark schemes, and PDF URLs are valid!');
} else {
  console.log('⚠️  ISSUES FLAGGED:');
  report.issues.forEach((issue, idx) => {
    console.log(`  [${idx + 1}] ${issue.paperCode} ${issue.questionNumber} (${issue.issueType})`);
    console.log(`      ${issue.details}`);
    if (issue.snippet) console.log(`      Snippet: "${issue.snippet}"`);
  });
}
console.log('===========================================================');
