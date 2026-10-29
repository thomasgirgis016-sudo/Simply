import { SolverResult } from '../types';

/**
 * Autonomous Cambridge & Edexcel ESL candidate answer evaluator.
 * Evaluates student typed working against official mark scheme criteria,
 * catching common examiner traps (e.g. coordinating "but" vs subordinate "although",
 * double-linking "although... but", "despite + clause", and register errors).
 */
export function evaluateEslStudentAnswer(
  studentAnswer: string,
  promptText: string,
  targetMarks: number = 1
): SolverResult | null {
  if (!studentAnswer || !studentAnswer.trim()) return null;

  const ans = studentAnswer.trim().toLowerCase();
  const q = (promptText || '').toLowerCase();

  // Check if this is a contrast / connective / linking question
  const isContrastPrompt =
    q.includes('contrast') ||
    q.includes('connective') ||
    q.includes('linking') ||
    q.includes('connectors') ||
    q.includes('connector') ||
    q.includes('although') ||
    q.includes('however') ||
    q.includes('despite') ||
    q.includes('whereas') ||
    ans === 'but' ||
    ans === 'although' ||
    ans === 'however';

  if (!isContrastPrompt) return null;

  // 1. Check for classic incorrect answers: "but", "and", "so", "because", or double-linking ("although... but")
  const isButCoordinatingTrap =
    ans === 'but' ||
    ans === 'and' ||
    ans === 'so' ||
    ans === 'because' ||
    /\b(although|whereas)\b.*\bbut\b/i.test(ans) ||
    /^(?:but|and|so)\b/i.test(ans);

  // 2. Check for "despite + full clause" trap (e.g. "despite it was raining")
  const isDespiteClauseTrap = /\b(?:despite|in spite of)\s+(?:it|he|she|they|we|there)\s+(?:is|was|were|are|had)\b/i.test(ans);

  // 3. Check for correct contrast conjunctions / transitions
  const hasValidContrastWord =
    /\b(although|even though|whereas|while|however|nevertheless|conversely|in contrast|on the other hand|despite|in spite of)\b/i.test(ans);

  // A standalone connective answer like "although" or "whereas" or "however"
  const isStandaloneCorrectWord =
    ans === 'although' ||
    ans === 'whereas' ||
    ans === 'however' ||
    ans === 'nevertheless' ||
    ans === 'despite' ||
    ans === 'in spite of' ||
    ans === 'even though';

  const isFullSentence = ans.split(/\s+/).length >= 4;

  let isCorrect = false;
  let marksEarned = 0;
  let exactReason = '';
  let exactCorrection = '';

  if (isButCoordinatingTrap) {
    isCorrect = false;
    marksEarned = 0;
    if (/\b(although|whereas)\b.*\bbut\b/i.test(ans)) {
      exactReason = 'Double-linking error: Never insert "but" after an introductory subordinate clause starting with "Although" or "Whereas". In Cambridge IGCSE, this is an ungrammatical double conjunction.';
      exactCorrection = `Write instead: "${studentAnswer.replace(/\bbut\s+/i, '')}" (remove the word "but").`;
    } else {
      exactReason = `"${studentAnswer}" is a coordinating conjunction, NOT a subordinate conjunction or adverbial linker. When examiners ask for a connective to show contrast, using "but" on its own fails to demonstrate complex sentence synthesis.`;
      exactCorrection = 'Use a formal subordinate conjunction or adverbial linker: "Although", "Whereas", "However", or "Despite".';
    }
  } else if (isDespiteClauseTrap) {
    isCorrect = false;
    marksEarned = 0;
    exactReason = '"Despite" and "In spite of" are prepositions and must be followed by a noun phrase or gerund (-ing verb), never a finite clause with a subject and verb (e.g. write "Despite the rain", not "Despite it rained").';
    exactCorrection = 'Follow "despite" with a noun phrase or use "Although": "Although it was raining..." or "Despite the rain..."';
  } else if (isStandaloneCorrectWord || (hasValidContrastWord && isFullSentence)) {
    isCorrect = true;
    marksEarned = targetMarks;
    exactReason = isStandaloneCorrectWord
      ? `✓ Correct! "${studentAnswer}" is a valid contrast connective that establishes subordination or adverbial contrast.`
      : `✓ Correct! Candidate successfully synthesized a contrast structure with appropriate syntactic subordination.`;
    exactCorrection = 'None required. Candidate working earns full marks.';
  } else {
    // Other submission that doesn't demonstrate contrast
    isCorrect = false;
    marksEarned = 0;
    exactReason = `Candidate response "${studentAnswer}" does not contain a recognized Cambridge IGCSE contrast connective (e.g. Although, Whereas, However, Despite).`;
    exactCorrection = 'Use "Although", "Whereas", or "However" to establish a clear contrast between two ideas.';
  }

  const percentageScore = Math.round((marksEarned / targetMarks) * 100);

  return {
    questionText: promptText || 'Write a sentence to show contrast between two ideas [1 mark]',
    subject: 'English as a Second Language (CIE 0510 / Edexcel 4ES1)',
    topic: 'Sentence Synthesis & Cohesive Contrast Connectors',
    totalMarks: targetMarks,
    coreConceptAndFormula: {
      concept: 'Forming complex contrast clauses using subordinate conjunctions (although, whereas) or adverbial linkers (however, conversely) with precise comma punctuation and formal register.',
      formula: '\\text{Subordinate Clause: } \\text{Although } [A], [B] \\quad \\text{or} \\quad [A]. \\text{ However, } [B].',
    },
    stepByStepSolution: [
      {
        stepNumber: 1,
        title: `Candidate Working Evaluation: "${studentAnswer}"`,
        explanation: `${exactReason}\n\n**Examiner Action:** ${isCorrect ? `Awarded [${marksEarned}/${targetMarks} Mark]` : `Withheld mark [0/${targetMarks} Marks]`}.\n${exactCorrection ? `**Correction Advice:** ${exactCorrection}` : ''}`,
        mathOrCode: `\\text{Candidate Answer: "${studentAnswer}"} \\implies ${isCorrect ? `\\text{Award: } ${marksEarned}/${targetMarks}` : '\\text{Award: } 0/' + targetMarks}`,
        markAwarded: isCorrect ? `[M1] Valid contrast connective (${marksEarned}/${targetMarks} Mark)` : `[M0] Incorrect connective (0/${targetMarks} Marks)`,
      },
      {
        stepNumber: 2,
        title: 'Cambridge Official Model Answer & Structure',
        explanation: 'Model contrast sentence: "Although modern electric vehicles significantly diminish urban greenhouse emissions, their widespread adoption remains constrained by high battery replacement expenses." Notice the comma separating the subordinate clause from the main clause, and the absence of "but".',
        mathOrCode: '\\text{"Although [Clause A], [Clause B]."}',
        markAwarded: '[A1] Model standard reference',
      }
    ],
    finalAnswer: isCorrect
      ? `✅ Candidate Score: ${marksEarned} / ${targetMarks} Marks (${percentageScore}%). ${exactReason}`
      : `❌ Candidate Score: ${marksEarned} / ${targetMarks} Marks (${percentageScore}%). ${exactReason} ${exactCorrection}`,
    examinerTraps: [
      'Double-linking error: Never write "Although" and "but" in the same sentence (e.g. writing "Although it was expensive, but they purchased it" forfeits accuracy marks).',
      'Using informal colloquialisms like "anyways" or "though" at the end of formal examination sentences.',
      'Omitting the comma after an introductory subordinate clause starting with "Although".'
    ],
    markSchemeBreakdown: [
      `[${targetMarks} Mark] Grammatically flawless sentence establishing a clear, effective contrast between two related ideas with accurate punctuation and formal register.`
    ],
    examinerTips: [
      'In Cambridge 0510 Reading & Writing, varied sentence structures (simple, compound, complex) directly boost your Language Band.',
      'When using "despite" or "in spite of", follow with a noun phrase or gerund: "Despite the high cost...", never "Despite it was expensive...".'
    ],
    commonMistakes: [
      'Writing "Although X, but Y." (combining two contrasting conjunctions).',
      'Forgetting the comma before "however" when used as an adverbial conjunct.'
    ],
    relatedTopic: 'Complex Sentences, Subordinate Clauses and Cohesion',
    studentWorkingEvaluation: {
      hasEvaluatedMath: false,
      totalLinesChecked: 1,
      marksEarned,
      marksPossible: targetMarks,
      percentageScore,
      overallVerdict: isCorrect
        ? `Candidate demonstrated correct command of contrast connectives: ${exactReason}`
        : `Candidate answer "${studentAnswer}" is incorrect: ${exactReason}`,
      correctStepByStep: [
        'Step 1: Identify two contrasting propositions or clauses',
        'Step 2: Join using a formal contrast connective (e.g. "Although", "Whereas", "However")',
        'Step 3: Ensure correct comma separation and do NOT pair "Although" with "but"'
      ],
      breakdownPointOfFailure: isCorrect ? undefined : exactReason,
      lineReviews: [
        {
          lineNumber: 1,
          rawText: studentAnswer,
          isMathEquation: false,
          isCorrect,
          marksEarned: isCorrect ? marksEarned : 0,
          markBadge: isCorrect ? `[M${marksEarned}]` : '[M0]',
          exactReason,
          exactCorrection: isCorrect ? undefined : exactCorrection,
        }
      ]
    }
  };
}
