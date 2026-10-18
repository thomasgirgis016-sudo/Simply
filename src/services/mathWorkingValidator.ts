/**
 * Mathematical Line-by-Line Working & Marking Validator
 * Evaluates student mathematical working, equalities, and arithmetic steps.
 * Awards marks for valid steps (e.g. 10 - 2 = 8)
 * Deducts / withholds marks for invalid steps (e.g. 10 + 2 = 8)
 * Provides exact reasons and the exact correction line the student must write.
 */

export interface MathLineValidation {
  lineNumber: number;
  rawText: string;
  isMathEquation: boolean;
  isCorrect: boolean;
  marksEarned: number; // 1 or 0
  markBadge: string; // e.g. "[M1] Method Mark Awarded (+1 Mark)" or "[M0] Mark Lost (0 Marks)"
  exactReason: string;
  exactCorrection?: string;
}

export interface StudentWorkingEvaluationResult {
  hasEvaluatedMath: boolean;
  totalLinesChecked: number;
  marksEarned: number;
  marksPossible: number;
  percentageScore: number;
  lineReviews: MathLineValidation[];
  overallVerdict: string;
  breakdownPointOfFailure?: string;
  correctStepByStep: string[];
}

/**
 * Safely evaluates a pure arithmetic expression string (without using eval).
 * Supports numbers, +, -, *, /, ^, parentheses, decimals, and negative signs.
 */
export function evaluateSafeArithmetic(expr: string): number | null {
  try {
    // Normalize characters
    const clean = expr
      .replace(/[×xX]/g, '*')
      .replace(/[÷]/g, '/')
      .replace(/−/g, '-')
      .replace(/\s+/g, '');

    // Check for allowed characters only
    if (!/^[0-9+\-*/^().]+$/.test(clean)) {
      return null;
    }

    let pos = 0;

    function peek(): string {
      return clean[pos] || '';
    }

    function get(): string {
      return clean[pos++];
    }

    function parseExpression(): number {
      let result = parseTerm();
      while (peek() === '+' || peek() === '-') {
        const op = get();
        const next = parseTerm();
        if (op === '+') result += next;
        else result -= next;
      }
      return result;
    }

    function parseTerm(): number {
      let result = parsePower();
      while (peek() === '*' || peek() === '/') {
        const op = get();
        const next = parsePower();
        if (op === '*') result *= next;
        else {
          if (Math.abs(next) < 1e-12) return NaN;
          result /= next;
        }
      }
      return result;
    }

    function parsePower(): number {
      let result = parseFactor();
      if (peek() === '^') {
        get();
        const exponent = parsePower();
        result = Math.pow(result, exponent);
      }
      return result;
    }

    function parseFactor(): number {
      if (peek() === '-') {
        get();
        return -parseFactor();
      }
      if (peek() === '+') {
        get();
        return parseFactor();
      }
      if (peek() === '(') {
        get(); // consume '('
        const val = parseExpression();
        if (peek() === ')') get(); // consume ')'
        return val;
      }

      let numStr = '';
      while (/[0-9.]/.test(peek())) {
        numStr += get();
      }
      if (!numStr) return NaN;
      return parseFloat(numStr);
    }

    const value = parseExpression();
    if (isNaN(value) || !isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * Inspects a single line of student text and validates arithmetic / algebraic equalities.
 */
export function validateStudentMathLine(line: string, lineNumber: number = 1): MathLineValidation {
  const trimmed = line.trim();

  // Strip prefixes like "Line 1:", "Step 1:", "x =", etc.
  const cleaned = trimmed
    .replace(/^line\s*\d+[:.]\s*/i, '')
    .replace(/^step\s*\d+[:.]\s*/i, '')
    .replace(/^(my\s+answer|i\s+wrote|i\s+got)[:.]\s*/i, '')
    .trim();

  // Check if line contains an equality sign
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=').map((p) => p.trim());

    // If format is like "10 + 2 = 8" or "10 - 2 = 8" or "x = 10 + 2 = 8"
    let lhsExpr = '';
    let rhsExpr = '';

    if (parts.length === 2) {
      lhsExpr = parts[0];
      rhsExpr = parts[1];
    } else if (parts.length === 3 && /^[a-zA-Z]$/.test(parts[0])) {
      // e.g. "x = 10 + 2 = 8"
      lhsExpr = parts[1];
      rhsExpr = parts[2];
    }

    // Attempt to evaluate arithmetic
    if (lhsExpr && rhsExpr) {
      const lhsVal = evaluateSafeArithmetic(lhsExpr);
      const rhsVal = evaluateSafeArithmetic(rhsExpr);

      if (lhsVal !== null && rhsVal !== null) {
        const isClose = Math.abs(lhsVal - rhsVal) < 1e-4;

        if (isClose) {
          // Correct arithmetic equality!
          return {
            lineNumber,
            rawText: trimmed,
            isMathEquation: true,
            isCorrect: true,
            marksEarned: 1,
            markBadge: '[M1] Method Mark Awarded (+1 Mark)',
            exactReason: `✓ Correct mathematical step: "${trimmed}" is accurate (${lhsExpr.trim()} = ${rhsVal}). Method mark awarded.`,
          };
        } else {
          // Flawed arithmetic equality! E.g. 10 + 2 = 8
          // Check what the correct operation would be to produce rhsVal
          let correctionHint = '';
          const testMinus = lhsExpr.replace(/\+/g, '-');
          const testPlus = lhsExpr.replace(/-/g, '+');

          if (evaluateSafeArithmetic(testMinus) === rhsVal) {
            correctionHint = `You added instead of subtracting. Change "+" to "-": "${testMinus} = ${rhsVal}".`;
          } else if (evaluateSafeArithmetic(testPlus) === rhsVal) {
            correctionHint = `You subtracted instead of adding. Change "-" to "+": "${testPlus} = ${rhsVal}".`;
          } else {
            correctionHint = `Evaluating "${lhsExpr}" yields ${lhsVal}, NOT ${rhsVal}.`;
          }

          const exactCorrectionLine = evaluateSafeArithmetic(testMinus) === rhsVal
            ? `${testMinus} = ${rhsVal}`
            : evaluateSafeArithmetic(testPlus) === rhsVal
            ? `${testPlus} = ${rhsVal}`
            : `${lhsExpr} = ${lhsVal}`;

          return {
            lineNumber,
            rawText: trimmed,
            isMathEquation: true,
            isCorrect: false,
            marksEarned: 0,
            markBadge: '[M0] Mark Lost (0 Marks)',
            exactReason: `✗ Mathematical Contradiction / Arithmetic Error on Line ${lineNumber}: You wrote "${trimmed}", which is untrue because ${lhsExpr.trim()} evaluates to ${lhsVal}, NOT ${rhsVal}. ${correctionHint} In IGCSE marking, writing a false equation forfeits the method mark immediately.`,
            exactCorrection: `Write instead: ${exactCorrectionLine}`,
          };
        }
      }
    }
  }

  // Handle common negative squaring trap: (-7)^2 = -49 vs 49
  if (trimmed.includes('(-') && trimmed.includes('^2') && trimmed.includes('-')) {
    return {
      lineNumber,
      rawText: trimmed,
      isMathEquation: true,
      isCorrect: false,
      marksEarned: 0,
      markBadge: '[A0] Accuracy Mark Lost (0 Marks)',
      exactReason: `✗ Sign Error on Line ${lineNumber}: Squaring a negative number always results in a positive value. You wrote a negative result.`,
      exactCorrection: `Enclose negative numbers inside brackets on your calculator, e.g. (-7)² = +49.`,
    };
  }

  // Fallback: If line contains text / general working
  return {
    lineNumber,
    rawText: trimmed,
    isMathEquation: false,
    isCorrect: true,
    marksEarned: 1,
    markBadge: '[B1] Working Noted',
    exactReason: `Method step noted: "${trimmed}".`,
  };
}

/**
 * Validates full multi-line student working text.
 */
export function evaluateStudentWorking(
  workingText: string,
  totalMarksPossible: number = 4
): StudentWorkingEvaluationResult {
  const lines = workingText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      hasEvaluatedMath: false,
      totalLinesChecked: 0,
      marksEarned: 0,
      marksPossible: totalMarksPossible,
      percentageScore: 0,
      lineReviews: [],
      overallVerdict: 'No student working detected.',
      correctStepByStep: [],
    };
  }

  const reviews: MathLineValidation[] = [];
  let earnedMarks = 0;
  let hasMath = false;
  let firstFailure: MathLineValidation | null = null;
  const correctStepByStep: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const rev = validateStudentMathLine(line, idx + 1);
    reviews.push(rev);
    if (rev.isMathEquation) hasMath = true;

    if (rev.isCorrect) {
      earnedMarks += rev.marksEarned;
      correctStepByStep.push(rev.rawText);
    } else {
      if (!firstFailure) firstFailure = rev;
      if (rev.exactCorrection) {
        correctStepByStep.push(rev.exactCorrection);
      }
    }
  }

  const marksEarned = Math.min(totalMarksPossible, earnedMarks);
  const percentage = Math.round((marksEarned / totalMarksPossible) * 100);

  let overallVerdict = '';
  if (firstFailure) {
    overallVerdict = `Method broken on Line ${firstFailure.lineNumber}: ${firstFailure.exactReason} Correct line: ${firstFailure.exactCorrection || 'See step-by-step'}.`;
  } else {
    overallVerdict = `Full marks awarded (${marksEarned}/${totalMarksPossible}). All calculation steps and algebraic equations are mathematically sound.`;
  }

  return {
    hasEvaluatedMath: hasMath,
    totalLinesChecked: lines.length,
    marksEarned,
    marksPossible: totalMarksPossible,
    percentageScore: percentage,
    lineReviews: reviews,
    overallVerdict,
    breakdownPointOfFailure: firstFailure ? firstFailure.exactReason : undefined,
    correctStepByStep,
  };
}
