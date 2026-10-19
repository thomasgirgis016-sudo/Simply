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
    // Validate Question Paper URL
    if (!pdf.qpPdfUrl || !pdf.qpPdfUrl.startsWith('http')) {
      issues.push({
        paperId: pdf.id,
        paperCode: pdf.paperCode,
        questionNumber: 'Question Paper PDF',
        issueType: 'broken_link',
        details: pdf.qpPdfUrl?.startsWith('/')
          ? `Local relative path detected (${pdf.qpPdfUrl}). Must use verified remote https:// URL.`
          : `Invalid or missing Question Paper PDF link: ${pdf.qpPdfUrl}`
      });
    }

    // Validate Mark Scheme URL if present
    if (pdf.msPdfUrl && !pdf.msPdfUrl.startsWith('http')) {
      issues.push({
        paperId: pdf.id,
        paperCode: pdf.paperCode,
        questionNumber: 'Mark Scheme PDF',
        issueType: 'broken_link',
        details: pdf.msPdfUrl.startsWith('/')
          ? `Local relative path detected in MS (${pdf.msPdfUrl}). Must use verified remote https:// URL.`
          : `Invalid Mark Scheme PDF link: ${pdf.msPdfUrl}`
      });
    }

    // Validate Examiner Report URL if present
    if (pdf.examinerReportUrl && !pdf.examinerReportUrl.startsWith('http')) {
      issues.push({
        paperId: pdf.id,
        paperCode: pdf.paperCode,
        questionNumber: 'Examiner Report PDF',
        issueType: 'broken_link',
        details: `Invalid Examiner Report PDF link: ${pdf.examinerReportUrl}`
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

/**
 * Validates a live PDF link via the server-side /api/pdf-proxy endpoint.
 * Returns whether the target or its mirrors resolved to a valid application/pdf.
 */
export async function verifyPdfLiveViaProxy(
  url: string,
  fallback?: string
): Promise<{ ok: boolean; status: number; contentType?: string; error?: string }> {
  try {
    const params = new URLSearchParams({ url, checkOnly: 'true' });
    if (fallback) params.set('fallback', fallback);
    const res = await fetch(`/api/pdf-proxy?${params.toString()}`);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, status: res.status, contentType: data.contentType || 'application/pdf' };
    }
    const errData = await res.json().catch(() => ({}));
    return {
      ok: false,
      status: res.status,
      error: errData.error || `Proxy responded with status ${res.status}`
    };
  } catch (err: any) {
    return { ok: false, status: 0, error: err?.message || 'Network request failed' };
  }
}

/**
 * Scans a sample of official PDFs through the live proxy to verify content types.
 */
export async function runLivePdfQaScan(
  pdfs: OfficialPaperPdf[] = OFFICIAL_PAST_PAPER_PDFS,
  sampleLimit: number = 10
): Promise<{ checked: number; passed: number; failed: number; failures: { id: string; url: string; error: string }[] }> {
  const sample = pdfs.slice(0, sampleLimit);
  let passed = 0;
  let failed = 0;
  const failures: { id: string; url: string; error: string }[] = [];

  for (const pdf of sample) {
    if (!pdf.qpPdfUrl) continue;
    const res = await verifyPdfLiveViaProxy(pdf.qpPdfUrl, pdf.backupQpUrl);
    if (res.ok) {
      passed++;
    } else {
      failed++;
      failures.push({
        id: pdf.id,
        url: pdf.qpPdfUrl,
        error: res.error || 'Failed proxy validation'
      });
    }
  }

  return { checked: sample.length, passed, failed, failures };
}

