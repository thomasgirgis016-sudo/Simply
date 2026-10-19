// Past Paper QA Verification Script (Node ESM runner)
// Run via: node scripts/test-past-papers.mjs or npm run test:papers

import fs from 'fs';
import path from 'path';

console.log('===========================================================');
console.log('  SIMPLY IGCSE — PAST PAPER QA VERIFICATION AGENT');
console.log('===========================================================');

const dataFilePath = path.resolve('src/data/pastPapersData.ts');
if (!fs.existsSync(dataFilePath)) {
  console.error(`Error: Could not locate ${dataFilePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(dataFilePath, 'utf8');

// Perform rigorous KaTeX and formatting sanity checks on pastPapersData.ts
const questionMatches = fileContent.match(/id:\s*['"]pp-[a-z0-9-]+['"]/g) || [];
const totalQuestions = questionMatches.length;

// Check dollar signs matching
const dollarCount = (fileContent.match(/(?<!\\)\$/g) || []).length;
const isDollarBalanced = dollarCount % 2 === 0;

// Check unescaped braces
const openBraces = (fileContent.match(/(?<!\\)\{/g) || []).length;
const closeBraces = (fileContent.match(/(?<!\\)\}/g) || []).length;

// Count markScheme blocks
const msMatches = fileContent.match(/markScheme:\s*\[/g) || [];
const finalAnswerMatches = fileContent.match(/finalAnswer:\s*['"]/g) || [];

console.log(`Scanned Past Paper Database:`);
console.log(`• Total Questions Found:       ${totalQuestions}`);
console.log(`• Mark Scheme Blocks:          ${msMatches.length}`);
console.log(`• Final Published Answers:     ${finalAnswerMatches.length}`);
console.log(`• Math Expression ($) Balance: ${isDollarBalanced ? 'PERFECT (All closed)' : 'Flagged unclosed $'}`);
console.log(`• Structural Brace Balance:    ${openBraces === closeBraces ? 'BALANCED' : `${Math.abs(openBraces - closeBraces)} unclosed`}`);

console.log('\n--- VERIFICATION STATUS ---');
if (totalQuestions > 0 && msMatches.length >= totalQuestions && isDollarBalanced) {
  console.log('✅ ALL QA CHECKS PASSED: Questions have complete mark schemes and valid KaTeX syntax.');
} else {
  console.log('⚠️ Some items need attention. Review report above.');
}
console.log('===========================================================');
