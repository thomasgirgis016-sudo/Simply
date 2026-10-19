// Exam Code Parser utility for Mode A (Single Input Search Bar)
// Handles codes like: "0580/42/M/J/23 Q4(b)", "0625/21/O/N/22 Q12", "0620/41/M/J/21 Q3(a)(i)"

export interface ParsedExamCode {
  rawCode: string;
  subjectCode?: string;
  paperNumber?: number;
  variant?: number;
  paperCode?: string; // e.g. "0580/42"
  sessionName?: string; // e.g. "May/June"
  seasonCode?: 'M/J' | 'O/N' | 'F/M' | 'SP';
  year?: number;
  questionNumber?: string; // e.g. "Q4(b)", "Q12"
  baseQuestionNum?: number; // e.g. 4
  subPart?: string; // e.g. "(b)", "(a)(i)"
  isMultipleChoice?: boolean; // Paper 1 or 2 (40 discrete items)
  confidence: number;
}

export function parseExamCodeString(input: string): ParsedExamCode | null {
  if (!input || typeof input !== 'string') return null;

  const clean = input.trim();
  if (clean.length < 3) return null;

  let subjectCode: string | undefined;
  let paperNumber: number | undefined;
  let variant: number | undefined;
  let paperCode: string | undefined;
  let sessionName: string | undefined;
  let seasonCode: 'M/J' | 'O/N' | 'F/M' | 'SP' | undefined;
  let year: number | undefined;
  let questionNumber: string | undefined;
  let baseQuestionNum: number | undefined;
  let subPart: string | undefined;

  // 1. Detect Subject Code (4 digits like 0580, 0625, or 4MA1)
  const subMatch = clean.match(/\b([0-9]{4}|4[A-Z]{2}[0-9])\b/i);
  if (subMatch) {
    subjectCode = subMatch[1].toUpperCase();
  }

  // 2. Detect Paper & Variant: "0580/42", "Paper 42", "/42/", "P42", "42"
  const paperCodeMatch = clean.match(/(?:[0-9]{4}\/|\/|paper\s*|p)([1-6])([1-3])/i);
  if (paperCodeMatch) {
    paperNumber = parseInt(paperCodeMatch[1], 10);
    variant = parseInt(paperCodeMatch[2], 10);
    if (subjectCode) {
      paperCode = `${subjectCode}/${paperNumber}${variant}`;
    } else {
      paperCode = `${paperNumber}${variant}`;
    }
  } else {
    // Single digit paper e.g. "Paper 4"
    const singlePaperMatch = clean.match(/(?:paper\s*|p)([1-6])\b/i);
    if (singlePaperMatch) {
      paperNumber = parseInt(singlePaperMatch[1], 10);
    }
  }

  // 3. Detect Series / Season / Month: M/J, O/N, F/M, May/June, Oct/Nov, Feb/March
  if (/m[\/_]?j|may[\/_]?june|s/i.test(clean)) {
    sessionName = 'May/June';
    seasonCode = 'M/J';
  } else if (/o[\/_]?n|oct[\/_]?nov|w/i.test(clean)) {
    sessionName = 'Oct/Nov';
    seasonCode = 'O/N';
  } else if (/f[\/_]?m|feb[\/_]?march|m/i.test(clean)) {
    sessionName = 'Feb/March';
    seasonCode = 'F/M';
  } else if (/specimen|sp/i.test(clean)) {
    sessionName = 'Specimen';
    seasonCode = 'SP';
  }

  // 4. Detect Year: 2018 to 2026, or 2-digit years /18 to /26
  const fullYearMatch = clean.match(/\b(20[1-2][0-9])\b/);
  if (fullYearMatch) {
    year = parseInt(fullYearMatch[1], 10);
  } else {
    const shortYearMatch = clean.match(/(?:[\/_'\s])([1-2][0-9])\b/);
    if (shortYearMatch) {
      const yr = parseInt(shortYearMatch[1], 10);
      if (yr >= 15 && yr <= 30) {
        year = 2000 + yr;
      }
    }
  }

  // 5. Detect Question Number & Subpart: e.g. "Q4(b)", "Q12", "4(b)", "Question 3(a)(i)"
  const qMatch = clean.match(/(?:q(?:uestion)?\s*|\bq)([0-9]{1,2})(?:\s*(\([a-z0-9\(\)]+\)|[a-z]))?/i);
  if (qMatch) {
    baseQuestionNum = parseInt(qMatch[1], 10);
    const sub = qMatch[2] ? qMatch[2].trim() : '';
    subPart = sub ? (sub.startsWith('(') ? sub : `(${sub})`) : undefined;
    questionNumber = `Q${baseQuestionNum}${subPart || ''}`;
  } else {
    // Look for isolated "4(b)"
    const altQMatch = clean.match(/\b([0-9]{1,2})(\([a-z0-9\(\)]+\))/i);
    if (altQMatch) {
      baseQuestionNum = parseInt(altQMatch[1], 10);
      subPart = altQMatch[2].trim();
      questionNumber = `Q${baseQuestionNum}${subPart}`;
    }
  }

  // MCQ papers have 40 discrete items (Paper 1 & Paper 2)
  const isMultipleChoice = paperNumber === 1 || paperNumber === 2;

  // Calculate parser confidence
  let confidence = 0.3;
  if (subjectCode) confidence += 0.25;
  if (paperNumber) confidence += 0.2;
  if (seasonCode) confidence += 0.15;
  if (year) confidence += 0.15;
  if (questionNumber) confidence += 0.25;

  return {
    rawCode: clean,
    subjectCode,
    paperNumber,
    variant,
    paperCode,
    sessionName,
    seasonCode,
    year,
    questionNumber,
    baseQuestionNum,
    subPart,
    isMultipleChoice,
    confidence: Math.min(1.0, confidence)
  };
}
