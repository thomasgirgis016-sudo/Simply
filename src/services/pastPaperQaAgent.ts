import { PastPaperItem, OfficialPaperPdf, PastPaperQaSummaryReport, PastPaperQaItemIssue } from '../types';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../data/pastPapersData';

/**
 * Validates basic KaTeX / LaTeX math syntax:
 * Checks for mismatched curly braces, unclosed math environments, or invalid command sequences.
 */
export function validateKatexSyntax(mathText?: string): { isValid: boolean; error?: string } {
  if (!mathText) return { isValid: true };

  // Check matching curly braces { }
  let braceCount = 0;
  for (let i = 0; i < mathText.length; i++) {
    if (mathText[i] === '{' && (i === 0 || mathText[i - 1] !== '\\')) {
      braceCount++;
    } else if (mathText[i] === '}' && (i === 0 || mathText[i - 1] !== '\\')) {
      braceCount--;
      if (braceCount < 0) {
        return { isValid: false, error: 'Unmatched closing brace "}" in KaTeX string.' };
      }
    }
  }

  if (braceCount !== 0) {
    return { isValid: false, error: `Unclosed curly brace: ${braceCount} opening brace(s) remaining.` };
  }

  // Check matching dollar signs for inline math ($...$)
  const dollarMatches = mathText.match(/(?<!\\)\$/g);
  if (dollarMatches && dollarMatches.length % 2 !== 0) {
    return { isValid: false, error: 'Unclosed dollar sign ($) in inline math expression.' };
  }

  return { isValid: true };
}

/**
 * Runs the comprehensive Past Paper QA Verification Agent
 * Inspects every question and official PDF in the database.
 */
export function runPastPaperQaAgent(
  papers: PastPaperItem[] = PAST_PAPERS_DATABASE,
  pdfs: OfficialPaperPdf[] = OFFICIAL_PAST_PAPER_PDFS
): PastPaperQaSummaryReport {
  const issues: PastPaperQaItemIssue[] = [];
  let katexSyntaxErrors = 0;
  let missingMarkSchemes = 0;
  let formatMismatches = 0;

  // 1. Iterate through every past paper question
  for (const paper of papers) {
    // Check KaTeX in prompt and math fields
    const promptCheck = validateKatexSyntax(paper.questionPrompt);
    if (!promptCheck.isValid) {
      katexSyntaxErrors++;
      issues.push({
        paperId: paper.id,
        paperCode: paper.paperCode,
        questionNumber: paper.questionNumber,
        issueType: 'invalid_katex',
        details: `Question prompt KaTeX error: ${promptCheck.error}`,
        snippet: paper.questionPrompt.substring(0, 60)
      });
    }

    if (paper.diagramOrMath) {
      const diagramCheck = validateKatexSyntax(paper.diagramOrMath);
      if (!diagramCheck.isValid) {
        katexSyntaxErrors++;
        issues.push({
          paperId: paper.id,
          paperCode: paper.paperCode,
          questionNumber: paper.questionNumber,
          issueType: 'invalid_katex',
          details: `diagramOrMath KaTeX error: ${diagramCheck.error}`,
          snippet: paper.diagramOrMath.substring(0, 60)
        });
      }
    }

    // Check mark schemes
    if (!paper.markScheme || paper.markScheme.length === 0) {
      missingMarkSchemes++;
      issues.push({
        paperId: paper.id,
        paperCode: paper.paperCode,
        questionNumber: paper.questionNumber,
        issueType: 'missing_markscheme',
        details: 'Question has empty mark scheme array.',
      });
    } else {
      for (const ms of paper.markScheme) {
        const msCheck = validateKatexSyntax(ms.requirement);
        if (!msCheck.isValid) {
          katexSyntaxErrors++;
          issues.push({
            paperId: paper.id,
            paperCode: paper.paperCode,
            questionNumber: paper.questionNumber,
            issueType: 'invalid_katex',
            details: `Mark scheme requirement KaTeX error: ${msCheck.error}`,
            snippet: ms.requirement.substring(0, 60)
          });
        }
      }
    }

    // Check zero marks
    if (!paper.marks || paper.marks <= 0) {
      formatMismatches++;
      issues.push({
        paperId: paper.id,
        paperCode: paper.paperCode,
        questionNumber: paper.questionNumber,
        issueType: 'zero_marks',
        details: `Question has invalid allocated mark value (${paper.marks}).`,
      });
    }

    // Check final answer
    if (!paper.finalAnswer || paper.finalAnswer.trim() === '') {
      formatMismatches++;
      issues.push({
        paperId: paper.id,
        paperCode: paper.paperCode,
        questionNumber: paper.questionNumber,
        issueType: 'missing_markscheme',
        details: 'Question missing published final answer.',
      });
    }

    // Check sub-parts if present
    if (paper.subParts && paper.subParts.length > 0) {
      let subPartSum = 0;
      for (const sp of paper.subParts) {
        subPartSum += sp.marks;
        const spCheck = validateKatexSyntax(sp.prompt);
        if (!spCheck.isValid) {
          katexSyntaxErrors++;
          issues.push({
            paperId: paper.id,
            paperCode: paper.paperCode,
            questionNumber: `${paper.questionNumber} Part ${sp.part}`,
            issueType: 'invalid_katex',
            details: `Sub-part KaTeX error: ${spCheck.error}`,
            snippet: sp.prompt.substring(0, 60)
          });
        }
      }

      if (subPartSum !== paper.marks) {
        formatMismatches++;
        issues.push({
          paperId: paper.id,
          paperCode: paper.paperCode,
          questionNumber: paper.questionNumber,
          issueType: 'count_mismatch',
          details: `Sub-parts mark sum (${subPartSum}) does not equal total question marks (${paper.marks}).`
        });
      }
    }
  }

  // 2. Iterate through official PDFs
  for (const pdf of pdfs) {
    if (!pdf.qpPdfUrl || !pdf.qpPdfUrl.startsWith('http')) {
      issues.push({
        paperId: pdf.id,
        paperCode: pdf.paperCode,
        questionNumber: 'Full Paper PDF',
        issueType: 'broken_link',
        details: `Invalid or missing Question Paper PDF link: ${pdf.qpPdfUrl}`
      });
    }
  }

  const totalScanned = papers.length;
  const failedCount = issues.length;
  const passedCount = Math.max(0, totalScanned - failedCount);
  const healthScore = totalScanned > 0 ? Math.round(((totalScanned - failedCount) / totalScanned) * 100) : 100;

  return {
    scannedAt: new Date().toISOString(),
    totalQuestionsScanned: totalScanned,
    totalPdfsScanned: pdfs.length,
    passedCount,
    failedCount,
    katexSyntaxErrors,
    missingMarkSchemes,
    formatMismatches,
    issues,
    healthScorePercent: Math.max(0, healthScore)
  };
}
