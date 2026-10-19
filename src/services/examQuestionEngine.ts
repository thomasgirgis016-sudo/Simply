import { PastPaperItem } from '../types';
import { getAllPastPapers } from '../data/pastPapersData';
import { evaluateStudentWorking } from './mathWorkingValidator';

export interface ExamGradingResult {
  paper: PastPaperItem;
  marksEarned: number;
  totalMarks: number;
  percentage: number;
  verdict: 'Full Marks (Grade 9 / A*)' | 'Strong Performance (Grade 7-8)' | 'Partial Credit (Grade 5-6)' | 'Revision Needed';
  marksBreakdown: {
    markType: string;
    requirement: string;
    awarded: boolean;
    feedback: string;
  }[];
  missingMarksExplained: {
    markType: string;
    whatWasMissing: string;
    whatToWriteToGetMark: string;
  }[];
  finalAnswerComparison: {
    officialAnswer: string;
    studentAnswer: string;
    isExactMatch: boolean;
  };
  examinerTips: string;
  formattedMarkdown: string;
}

/**
 * Normalizes an exam string (e.g. "0580/42", "0580 42", "0580-42", "q4b", "q4(b)")
 */
function normalizeStr(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Searches the official question database by exam code and question number.
 * Supports patterns like:
 * - "0580/42 May/June 2023 Q6(b)"
 * - "0580/42 Q6"
 * - "0580 Q6"
 * - "0620/42 Q7"
 * - "0625/41 Q2"
 * - "4MA1 Q12"
 */
export function findPastPaperQuestionByReference(query: string, subjectIdOrCode?: string): PastPaperItem | null {
  if (!query || !query.trim()) return null;

  const raw = query.trim();
  const qLower = raw.toLowerCase();
  let allPapers = getAllPastPapers();

  // If subject is provided, filter candidate papers strictly
  if (subjectIdOrCode) {
    const subClean = subjectIdOrCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const filtered = allPapers.filter((p) => {
      const pSub = p.subjectId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pCode = (p.subjectCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pName = (p.subjectName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return pSub.includes(subClean) || subClean.includes(pSub) ||
             pCode.includes(subClean) || subClean.includes(pCode) ||
             pName.includes(subClean) || subClean.includes(pName);
    });
    if (filtered.length > 0) {
      allPapers = filtered;
    }
  }

  // 1. Direct ID match
  const byId = allPapers.find((p) => p.id.toLowerCase() === qLower);
  if (byId) return byId;

  // 2. Extract potential syllabus code (e.g. 0580, 0620, 0625, 0610, 0478, 4MA1, 0455, 0510, etc.)
  const codeMatch = raw.match(/\b(0\d{3}|[0-9][a-zA-Z]{2}[0-9]|[0-9][a-zA-Z]{3})\b/i);
  const detectedCode = codeMatch ? codeMatch[1].toUpperCase() : null;

  // 3. Extract question number (e.g. Q6(b), Q6, 6b, Q14, Q7(c), etc.)
  const qNumMatch = raw.match(/(?:q(?:uestion)?\.?\s*)?(\d{1,2}(?:\([a-z0-9]+\)|[a-z])?)/i);
  const detectedQNum = qNumMatch ? qNumMatch[1].toLowerCase().replace(/[\(\)]/g, '') : null;

  // 4. Exact Paper Code + Question Number
  for (const paper of allPapers) {
    const paperCodeNorm = normalizeStr(paper.paperCode);
    const qNumNorm = normalizeStr(paper.questionNumber);

    // If query has paper code like "058042" and question like "q6b"
    if (detectedCode && paper.paperCode.toUpperCase().includes(detectedCode)) {
      if (detectedQNum && qNumNorm.includes(detectedQNum)) {
        return paper;
      }
    }

    const fullRef = `${paper.paperCode} ${paper.session} ${paper.questionNumber}`.toLowerCase();
    if (fullRef.includes(qLower) || (qLower.includes(paper.paperCode.toLowerCase()) && qLower.includes(paper.questionNumber.toLowerCase()))) {
      return paper;
    }
  }

  // 5. Check if query matches paperCode exactly
  const byPaperCode = allPapers.find((p) => qLower.includes(p.paperCode.toLowerCase()));
  if (byPaperCode && detectedQNum) {
    const matchedQ = allPapers.find(
      (p) => p.paperCode.toLowerCase() === byPaperCode.paperCode.toLowerCase() && normalizeStr(p.questionNumber).includes(detectedQNum)
    );
    if (matchedQ) return matchedQ;
  }

  // 6. Substantial question prompt match (minimum 30 characters of exact text to avoid false positives)
  if (qLower.length >= 30) {
    const bySubstantialPrompt = allPapers.find((p) => {
      const promptLower = p.questionPrompt.toLowerCase();
      return promptLower.includes(qLower) || (qLower.length >= 40 && promptLower.slice(0, 50).includes(qLower.slice(0, 40)));
    });
    if (bySubstantialPrompt) return bySubstantialPrompt;
  }

  return null;
}

/**
 * Searches for multiple candidate past paper questions matching an exam query.
 */
export function searchPastPaperQuestions(query: string, maxResults = 8): PastPaperItem[] {
  if (!query || !query.trim()) return [];

  const raw = query.trim().toLowerCase();
  const allPapers = getAllPastPapers();

  const exact = findPastPaperQuestionByReference(raw);
  const results: PastPaperItem[] = exact ? [exact] : [];

  const terms = raw.split(/\s+/).filter((t) => t.length > 1);

  for (const paper of allPapers) {
    if (results.some((r) => r.id === paper.id)) continue;

    const searchable = `${paper.paperCode} ${paper.subjectName} ${paper.session} ${paper.questionNumber} ${paper.topic} ${paper.snippetQuery} ${paper.questionPrompt}`.toLowerCase();

    const matchesCount = terms.filter((term) => searchable.includes(term)).length;
    if (matchesCount > 0) {
      results.push(paper);
    }
    if (results.length >= maxResults) break;
  }

  return results;
}

/**
 * Returns a list of all distinct exam codes and available questions in the database
 */
export function getAvailableExamDirectory(): {
  paperCode: string;
  subjectName: string;
  session: string;
  questions: { id: string; questionNumber: string; topic: string; marks: number }[];
}[] {
  const allPapers = getAllPastPapers();
  const map = new Map<string, {
    paperCode: string;
    subjectName: string;
    session: string;
    questions: { id: string; questionNumber: string; topic: string; marks: number }[];
  }>();

  for (const p of allPapers) {
    const key = `${p.paperCode} • ${p.session}`;
    if (!map.has(key)) {
      map.set(key, {
        paperCode: p.paperCode,
        subjectName: p.subjectName,
        session: p.session,
        questions: [],
      });
    }
    map.get(key)!.questions.push({
      id: p.id,
      questionNumber: p.questionNumber,
      topic: p.topic,
      marks: p.marks,
    });
  }

  return Array.from(map.values());
}

/**
 * Evaluates a student's answer against the official mark scheme of a specific PastPaperItem.
 * Returns exact marks earned, breakdown of awarded marks, missing marks, and what to write.
 */
export function evaluateStudentAnswerAgainstMarkScheme(
  paper: PastPaperItem,
  studentAnswer: string
): ExamGradingResult {
  const sAns = studentAnswer.trim();
  const sAnsLower = sAns.toLowerCase();
  const totalMarks = paper.marks;

  // Run rigorous mathematical line-by-line verification
  const mathValidation = evaluateStudentWorking(sAns, totalMarks);
  const mathFailure = mathValidation.lineReviews.find((r) => !r.isCorrect);
  const mathSuccess = mathValidation.lineReviews.find((r) => r.isMathEquation && r.isCorrect);

  const marksBreakdown: ExamGradingResult['marksBreakdown'] = [];
  const missingMarksExplained: ExamGradingResult['missingMarksExplained'] = [];

  let marksEarned = 0;

  // Clean numbers for matching
  const numbersInStudentAnswer: string[] = sAns.match(/-?\d+(?:\.\d+)?/g) || [];
  const officialFinalNumbers: string[] = paper.finalAnswer.match(/-?\d+(?:\.\d+)?/g) || [];

  // 1. Check line-by-line mark scheme requirements
  paper.markScheme.forEach((item) => {
    const reqText = item.requirement.toLowerCase();
    const reqNumbers: string[] = item.requirement.match(/-?\d+(?:\.\d+)?/g) || [];

    // Extract keywords from requirement
    const keywords: string[] = reqText
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'were', 'using', 'accept'].includes(w));

    let isAwarded = false;
    let feedback = '';

    // Check method mark [M]
    if (item.markType.includes('M')) {
      // If student wrote a mathematically false equation (e.g. 10 + 2 = 8), REJECT method mark immediately!
      if (mathFailure) {
        isAwarded = false;
        feedback = `✗ Method Mark Lost [M0]: ${mathFailure.exactReason}`;
      } else {
        const hasKeywords = keywords.some((k: string) => sAnsLower.includes(k));
        const hasNumbers = reqNumbers.some((n: string) => numbersInStudentAnswer.includes(n));
        const hasFormulaWorking = sAns.includes('=') || sAns.includes('+') || sAns.includes('-') || sAns.includes('*') || sAns.includes('/') || sAns.includes('^');

        if (mathSuccess) {
          isAwarded = true;
          feedback = `✓ Method Mark Awarded [M1]: Valid mathematical calculation step "${mathSuccess.rawText}".`;
        } else if (hasKeywords || (hasNumbers && hasFormulaWorking)) {
          isAwarded = true;
          feedback = '✓ Method Mark: Correct working step, algebraic formula, or substitution identified.';
        } else {
          isAwarded = false;
          feedback = '✗ Method Mark Lost: Step or valid algebraic method was not shown.';
        }
      }
    }
    // Check accuracy mark [A]
    else if (item.markType.includes('A')) {
      // Cannot award accuracy mark if an earlier arithmetic calculation was false
      if (mathFailure) {
        isAwarded = false;
        feedback = `✗ Accuracy Mark Lost [A0]: Accuracy forfeited due to arithmetic error in working: ${mathFailure.exactReason}`;
      } else {
        const hasFinalNumber = officialFinalNumbers.some((n) => {
          const floatOfficial = parseFloat(n);
          return numbersInStudentAnswer.some((sn) => {
            const floatStudent = parseFloat(sn);
            return Math.abs(floatOfficial - floatStudent) < 0.05 || floatStudent.toFixed(1) === floatOfficial.toFixed(1);
          });
        });

        const hasExactPhrase = keywords.filter((k) => sAnsLower.includes(k)).length >= Math.min(2, keywords.length);

        if (hasFinalNumber || hasExactPhrase) {
          isAwarded = true;
          feedback = '✓ Accuracy Mark: Accurate numerical answer or required precision demonstrated.';
        } else {
          isAwarded = false;
          feedback = '✗ Accuracy Mark Lost: Final value incorrect or required precision (3 s.f.) missing.';
        }
      }
    }
    // Check independent mark [B] / Content mark
    else {
      const matchedKeywords = keywords.filter((k: string) => sAnsLower.includes(k));
      const hasNumbers = reqNumbers.some((n: string) => numbersInStudentAnswer.includes(n));

      if (matchedKeywords.length >= 1 || hasNumbers) {
        isAwarded = true;
        feedback = '✓ Independent Mark: Essential syllabus concept or reason stated.';
      } else {
        isAwarded = false;
        feedback = '✗ Independent Mark Lost: Compulsory syllabus key phrase or condition not stated.';
      }
    }

    if (isAwarded) {
      marksEarned += 1;
    } else {
      missingMarksExplained.push({
        markType: item.markType,
        whatWasMissing: mathFailure
          ? mathFailure.exactReason
          : `Candidate omitted the required condition or calculation for ${item.markType}: "${item.requirement}".`,
        whatToWriteToGetMark: mathFailure && mathFailure.exactCorrection
          ? mathFailure.exactCorrection
          : `To secure this mark, write: "${item.requirement}".`,
      });
    }

    marksBreakdown.push({
      markType: item.markType,
      requirement: item.requirement,
      awarded: isAwarded,
      feedback,
    });
  });

  // Cap marks between 0 and totalMarks
  marksEarned = Math.min(totalMarks, Math.max(0, marksEarned));
  const percentage = Math.round((marksEarned / totalMarks) * 100);

  let verdict: ExamGradingResult['verdict'] = 'Revision Needed';
  if (percentage === 100) verdict = 'Full Marks (Grade 9 / A*)';
  else if (percentage >= 75) verdict = 'Strong Performance (Grade 7-8)';
  else if (percentage >= 50) verdict = 'Partial Credit (Grade 5-6)';

  const cleanOfficial = paper.finalAnswer.replace(/\$/g, '').trim().toLowerCase();
  const cleanStudent = sAns.replace(/\$/g, '').trim().toLowerCase();
  const isExactMatch = cleanStudent.includes(cleanOfficial) || cleanOfficial.includes(cleanStudent);

  // Generate clean markdown report
  const formattedMarkdown = `### 📋 Official Cambridge Examiner Assessment: ${paper.paperCode} ${paper.questionNumber}
**Subject:** ${paper.subjectName} (${paper.paperCode}) • **Session:** ${paper.session}  
**Topic:** ${paper.topic} • **Difficulty:** ${paper.difficultyTier}

---

#### 🎯 Your Result: **${marksEarned} / ${totalMarks} Marks (${percentage}%)**
**Examiner Verdict:** ${verdict === 'Full Marks (Grade 9 / A*)' ? '🏆 ' + verdict : '⭐ ' + verdict}

---

#### 🔍 Step-by-Step Marks Awarded Breakdown:
${marksBreakdown
  .map(
    (m) =>
      `- **${m.markType}** ${m.awarded ? '✅ **[AWARDED]**' : '❌ **[LOST]**'}: ${m.requirement}\n  *${m.feedback}*`
  )
  .join('\n\n')}

---

${
  missingMarksExplained.length > 0
    ? `#### ⚠️ What You Missed & Exact Phrasing Needed for Full Marks:
${missingMarksExplained
  .map(
    (miss, i) => `**Missing Mark #${i + 1} (${miss.markType}):**
- **Why you lost it:** ${miss.whatWasMissing}
- **What you must write:** ${miss.whatToWriteToGetMark}`
  )
  .join('\n\n')}

---`
    : '🎉 **Outstanding! All marking points and examiner criteria were fully met.**\n\n---'
}

#### 🏁 Official Mark Scheme Final Answer:
$$${paper.finalAnswer}$$
*(Your answer: "${sAns}")*

${
  paper.examinerReportSnippet
    ? `> 💡 **Principal Examiner Report Warning:**  
> "${paper.examinerReportSnippet}"`
    : ''
}
`;

  return {
    paper,
    marksEarned,
    totalMarks,
    percentage,
    verdict,
    marksBreakdown,
    missingMarksExplained,
    finalAnswerComparison: {
      officialAnswer: paper.finalAnswer,
      studentAnswer: sAns,
      isExactMatch,
    },
    examinerTips: paper.examinerReportSnippet || 'Always show every step of working to safeguard method marks.',
    formattedMarkdown,
  };
}
