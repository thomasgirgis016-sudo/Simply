/**
 * Simply IGCSE — Multi-Board Listening Automated Marking Engine
 * 
 * Implements strict examination principles across:
 * - Cambridge IGCSE English as a Second Language (0510 / 0511)
 * - Pearson Edexcel International GCSE ESL (4ES1)
 * - OxfordAQA International GCSE English (9280)
 * 
 * Marking Rules:
 * 1. Word Limit Enforcer (Automatic 0 marks if word count exceeds limit)
 * 2. Phonetic Tolerance vs. Fatal Real-Word / Homophone Trap
 * 3. Plural vs Singular Precision (Strict for Edexcel 4ES1, tolerant for Cambridge/OxfordAQA)
 * 4. Numbers & Units Parser (Equivalence between digits & words, printed unit tolerance)
 * 5. Bracketed Optional Words & Alternative Slashes Parser
 */

export type ExamBoardType = 'CIE' | 'Edexcel' | 'OxfordAQA';

export interface ListeningGradingResult {
  score: number;
  maxMarks: number;
  status: 'correct' | 'warning' | 'incorrect';
  verdict: string;
  feedback: string;
  feedbackType?:
    | 'exact_match'
    | 'word_limit_exceeded'
    | 'real_word_trap'
    | 'missing_plural'
    | 'phonetic_accepted'
    | 'number_matched'
    | 'unit_mismatch'
    | 'contradiction'
    | 'incorrect_content';
  normalizedUserAnswer: string;
  matchedOfficialAnswer: string;
  isPhoneticMatch?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FATAL REAL-WORD & HOMOPHONE TRAP REGISTRY
// Cambridge & Edexcel reject misspellings that form real unintended words.
// ─────────────────────────────────────────────────────────────────────────────
export const HOMOPHONE_TRAP_PAIRS: Record<string, { partner: string; explanation: string }> = {
  bare: { partner: 'bear', explanation: "'bare' means unclothed or uncovered, while 'bear' is the animal or to carry/endure." },
  bear: { partner: 'bare', explanation: "'bear' is an animal, while 'bare' means uncovered." },
  hole: { partner: 'whole', explanation: "'hole' is an opening or cavity, while 'whole' means complete or entire." },
  whole: { partner: 'hole', explanation: "'whole' means entire, while 'hole' is an opening." },
  peace: { partner: 'piece', explanation: "'peace' means tranquility/no war, while 'piece' is a portion or fragment." },
  piece: { partner: 'peace', explanation: "'piece' is a portion, while 'peace' means tranquility." },
  son: { partner: 'sun', explanation: "'son' is a male child, while 'sun' is the star in the sky." },
  sun: { partner: 'son', explanation: "'sun' is the celestial body, while 'son' is a male child." },
  sea: { partner: 'see', explanation: "'sea' is the ocean, while 'see' is visual perception." },
  see: { partner: 'sea', explanation: "'see' is vision, while 'sea' is the ocean." },
  wood: { partner: 'would', explanation: "'wood' is timber from trees, while 'would' is a modal auxiliary verb." },
  would: { partner: 'wood', explanation: "'would' is a modal verb, while 'wood' is timber." },
  steel: { partner: 'steal', explanation: "'steel' is an iron alloy, while 'steal' means to take without permission." },
  steal: { partner: 'steel', explanation: "'steal' means to rob/theft, while 'steel' is the metal alloy." },
  weather: { partner: 'whether', explanation: "'weather' is atmospheric conditions, while 'whether' expresses doubt/choice between alternatives." },
  whether: { partner: 'weather', explanation: "'whether' expresses alternatives, while 'weather' is atmospheric conditions." },
  tail: { partner: 'tale', explanation: "'tail' is the hind part of an animal, while 'tale' is a narrative story." },
  tale: { partner: 'tail', explanation: "'tale' is a story, while 'tail' is an animal's appendage." },
  hair: { partner: 'hare', explanation: "'hair' grows on skin/head, while 'hare' is a rabbit-like animal." },
  hare: { partner: 'hair', explanation: "'hare' is an animal, while 'hair' grows on the head." },
  fair: { partner: 'fare', explanation: "'fair' means just/equitable or a carnival, while 'fare' is the ticket price for travel." },
  fare: { partner: 'fair', explanation: "'fare' is transport cost, while 'fair' means just or equitable." },
  break: { partner: 'brake', explanation: "'break' means to shatter/fracture, while 'brake' is a device for slowing a vehicle." },
  brake: { partner: 'break', explanation: "'brake' slows a vehicle, while 'break' means to fracture or take a pause." },
  flour: { partner: 'flower', explanation: "'flour' is grain powder for baking, while 'flower' is the seed-bearing blossom of a plant." },
  flower: { partner: 'flour', explanation: "'flower' is a blossom, while 'flour' is baking powder." },
  deer: { partner: 'dear', explanation: "'deer' is a forest animal, while 'dear' means beloved or expensive." },
  dear: { partner: 'deer', explanation: "'dear' means beloved, while 'deer' is an animal." },
  plane: { partner: 'plain', explanation: "'plane' is an aircraft, while 'plain' means simple or flat grassland." },
  plain: { partner: 'plane', explanation: "'plain' means simple/grassland, while 'plane' is an aircraft." },
  suite: { partner: 'sweet', explanation: "'suite' is a set of rooms or furniture, while 'sweet' means sugary taste." },
  sweet: { partner: 'suite', explanation: "'sweet' means sugary, while 'suite' is a set of rooms." },
  mail: { partner: 'male', explanation: "'mail' is letters/packages, while 'male' refers to masculine gender." },
  male: { partner: 'mail', explanation: "'male' is gender, while 'mail' is postal delivery." },
  wait: { partner: 'weight', explanation: "'wait' means to delay/stay, while 'weight' is heaviness/mass." },
  weight: { partner: 'wait', explanation: "'weight' is mass, while 'wait' means to stay/delay." },
  sight: { partner: 'site', explanation: "'sight' is faculty of vision, while 'site' is a location or website." },
  site: { partner: 'sight', explanation: "'site' is a location, while 'sight' is vision." },
  weak: { partner: 'week', explanation: "'weak' means lacking strength, while 'week' is a period of 7 days." },
  week: { partner: 'weak', explanation: "'week' is 7 days, while 'weak' means lacking strength." },
  right: { partner: 'write', explanation: "'right' means correct or direction, while 'write' means to mark words." },
  write: { partner: 'right', explanation: "'write' means composing text, while 'right' means correct." },
  hear: { partner: 'here', explanation: "'hear' is auditory perception, while 'here' indicates this place." },
  here: { partner: 'hear', explanation: "'here' indicates location, while 'hear' is listening." },
  bored: { partner: 'board', explanation: "'bored' means weary and uninterested, while 'board' is a plank of wood or committee." },
  board: { partner: 'bored', explanation: "'board' is a plank or committee, while 'bored' means uninterested." },
  aloud: { partner: 'allowed', explanation: "'aloud' means audible/out loud, while 'allowed' means permitted." },
  allowed: { partner: 'aloud', explanation: "'allowed' means permitted, while 'aloud' means spoken audibly." },
  cereal: { partner: 'serial', explanation: "'cereal' is breakfast grain food, while 'serial' means in sequential parts." },
  serial: { partner: 'cereal', explanation: "'serial' is sequential, while 'cereal' is breakfast food." },
  principal: { partner: 'principle', explanation: "'principal' is head of a school or capital sum, while 'principle' is a fundamental truth or moral rule." },
  principle: { partner: 'principal', explanation: "'principle' is a rule/truth, while 'principal' is school head or main." },
  stationery: { partner: 'stationary', explanation: "'stationery' with 'e' means writing paper/pens, while 'stationary' with 'a' means not moving." },
  stationary: { partner: 'stationery', explanation: "'stationary' means unmoving, while 'stationery' is office/writing supplies." },
  dessert: { partner: 'desert', explanation: "'dessert' is a sweet post-meal course, while 'desert' is arid sandy land." },
  desert: { partner: 'dessert', explanation: "'desert' is arid land, while 'dessert' is sweet food." },
  threw: { partner: 'through', explanation: "'threw' is past tense of throw, while 'through' means in at one end and out the other." },
  through: { partner: 'threw', explanation: "'through' is preposition of passage, while 'threw' is past of throw." },
  knight: { partner: 'night', explanation: "'knight' is an armored warrior, while 'night' is the dark period of the day." },
  night: { partner: 'knight', explanation: "'night' is dark period, while 'knight' is a medieval warrior." },
  road: { partner: 'rode', explanation: "'road' is a paved path for vehicles, while 'rode' is past tense of ride." },
  rode: { partner: 'road', explanation: "'rode' is past of ride, while 'road' is a thoroughfare." },
  meat: { partner: 'meet', explanation: "'meat' is animal flesh used as food, while 'meet' means to encounter." },
  meet: { partner: 'meat', explanation: "'meet' is encountering, while 'meat' is food." },
  stare: { partner: 'stair', explanation: "'stare' means fixed gaze, while 'stair' is a step in a flight." },
  stair: { partner: 'stare', explanation: "'stair' is a step, while 'stare' is looking intently." }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. NUMBER WORD PARSER & EQUIVALENCE
// ─────────────────────────────────────────────────────────────────────────────
export const NUMBER_WORD_MAP: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5
};

export function convertWordsToDigits(str: string): string {
  let res = str.toLowerCase();
  for (const [word, val] of Object.entries(NUMBER_WORD_MAP)) {
    const reg = new RegExp(`\\b${word}\\b`, 'g');
    res = res.replace(reg, String(val));
  }
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LEVENSHTEIN & SOUNDEX ALGORITHMS
// ─────────────────────────────────────────────────────────────────────────────
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function soundex(str: string): string {
  if (!str) return '';
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  const mapping: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  const firstLetter = s[0];
  let res = firstLetter;
  let prevCode = mapping[firstLetter] || '';

  for (let i = 1; i < s.length && res.length < 4; i++) {
    const char = s[i];
    const code = mapping[char];
    if (code) {
      if (code !== prevCode) {
        res += code;
        prevCode = code;
      }
    } else {
      prevCode = '';
    }
  }

  return res.padEnd(4, '0').slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLURAL PAIR DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
export function isPluralPair(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase().trim();
  const w2 = word2.toLowerCase().trim();
  if (w1 === w2) return false;

  // Standard s / es
  if (w1 + 's' === w2 || w2 + 's' === w1) return true;
  if (w1 + 'es' === w2 || w2 + 'es' === w1) return true;

  // ies (e.g. library / libraries, city / cities)
  if (w1.endsWith('y') && w1.slice(0, -1) + 'ies' === w2) return true;
  if (w2.endsWith('y') && w2.slice(0, -1) + 'ies' === w1) return true;

  // Irregular plurals
  const irregulars: [string, string][] = [
    ['child', 'children'],
    ['person', 'people'],
    ['man', 'men'],
    ['woman', 'women'],
    ['foot', 'feet'],
    ['tooth', 'teeth'],
    ['mouse', 'mice']
  ];
  for (const [sing, plur] of irregulars) {
    if ((w1 === sing && w2 === plur) || (w1 === plur && w2 === sing)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. OFFICIAL MARK SCHEME BRACKET & SLASH EXPANDER
// e.g. "(plastic) bottle / container" -> ['plastic bottle', 'bottle', 'container']
// ─────────────────────────────────────────────────────────────────────────────
export function expandOfficialVariants(officialAnswer: string): string[] {
  if (!officialAnswer) return [];

  // Split by slashes or semicolons
  const parts = officialAnswer.split(/[/;]/).map(p => p.trim()).filter(Boolean);
  const variants = new Set<string>();

  for (const part of parts) {
    // If has bracketed words e.g. "(plastic) bottle"
    if (part.includes('(') && part.includes(')')) {
      const withBracket = part.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
      const withoutBracket = part.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      variants.add(withBracket.toLowerCase());
      if (withoutBracket.length > 0) {
        variants.add(withoutBracket.toLowerCase());
      }
    } else {
      variants.add(part.replace(/\s+/g, ' ').trim().toLowerCase());
    }
  }

  return Array.from(variants);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MASTER LISTENING ANSWER GRADER
// ─────────────────────────────────────────────────────────────────────────────
export function gradeListeningAnswer(
  userAnswer: string,
  officialAnswer: string,
  board: ExamBoardType = 'CIE',
  wordLimit: number = 2,
  printedUnit?: string
): ListeningGradingResult {
  const trimmedUser = (userAnswer || '').trim();

  // Empty answer
  if (!trimmedUser) {
    return {
      score: 0,
      maxMarks: 1,
      status: 'incorrect',
      verdict: 'No Answer Provided',
      feedback: 'No response was given for this question.',
      feedbackType: 'incorrect_content',
      normalizedUserAnswer: '',
      matchedOfficialAnswer: officialAnswer
    };
  }

  // Count user words (hyphenated counts as 1 compound word)
  const userWords = trimmedUser.split(/\s+/).filter(Boolean);

  // ── RULE 1: WORD LIMIT ENFORCER ──────────────────────────────────────────
  if (wordLimit > 0 && userWords.length > wordLimit) {
    return {
      score: 0,
      maxMarks: 1,
      status: 'incorrect',
      verdict: 'Zero Marks (Exceeded Word Limit)',
      feedback: `Exceeded word limit (wrote ${userWords.length} words, max allowed is ${wordLimit}). Even with the correct word, examiners award 0 marks.`,
      feedbackType: 'word_limit_exceeded',
      normalizedUserAnswer: trimmedUser,
      matchedOfficialAnswer: officialAnswer
    };
  }

  // ── Normalize User & Parse Official Variants ─────────────────────────────
  const normUser = trimmedUser.toLowerCase().replace(/[.,!?'"]/g, '').replace(/\s+/g, ' ').trim();
  const officialVariants = expandOfficialVariants(officialAnswer);

  // Strip printed unit if already supplied on the dotted line
  const cleanUserForUnits = (str: string) => {
    let s = str;
    if (printedUnit) {
      const uReg = new RegExp(`\\b${printedUnit.toLowerCase()}\\b`, 'gi');
      s = s.replace(uReg, '').trim();
    }
    return s.replace(/\s+/g, ' ').trim();
  };

  const processedUser = cleanUserForUnits(normUser);

  // ── Check Each Official Variant ──────────────────────────────────────────
  let bestPhoneticMatch: { variant: string; feedback: string } | null = null;
  let homophoneTrapDetected: { trapWord: string; targetWord: string; explanation: string } | null = null;
  let pluralMismatchDetected: { userWord: string; targetWord: string; isMissingPlural: boolean } | null = null;

  for (const variant of officialVariants) {
    const normVariant = variant.toLowerCase().replace(/[.,!?'"]/g, '').replace(/\s+/g, ' ').trim();
    const processedVariant = cleanUserForUnits(normVariant);

    // Exact Match
    if (normUser === normVariant || processedUser === processedVariant) {
      return {
        score: 1,
        maxMarks: 1,
        status: 'correct',
        verdict: 'Full Marks Awarded',
        feedback: 'Accurate answer matching the official Cambridge/Edexcel mark scheme.',
        feedbackType: 'exact_match',
        normalizedUserAnswer: normUser,
        matchedOfficialAnswer: normVariant
      };
    }

    // Number conversion match (e.g. "15" vs "fifteen" or "15 km" vs "fifteen kilometres")
    const digitsUser = convertWordsToDigits(processedUser);
    const digitsVariant = convertWordsToDigits(processedVariant);
    if (digitsUser === digitsVariant && digitsUser.length > 0) {
      return {
        score: 1,
        maxMarks: 1,
        status: 'correct',
        verdict: 'Full Marks Awarded (Number Equivalence)',
        feedback: `Correct numerical answer (accepted '${trimmedUser}' for '${normVariant}').`,
        feedbackType: 'number_matched',
        normalizedUserAnswer: normUser,
        matchedOfficialAnswer: normVariant
      };
    }

    // Contradiction Rule: writing two conflicting items when 1 requested
    if (normUser.includes(' and ') || normUser.includes(' or ')) {
      const subParts = normUser.split(/\b(and|or)\b/).map(s => s.trim());
      if (subParts.some(p => p === normVariant) && subParts.length > 1) {
        return {
          score: 0,
          maxMarks: 1,
          status: 'incorrect',
          verdict: 'Zero Marks (Contradiction Rule)',
          feedback: 'Cambridge Contradiction Rule: Writing two conflicting alternatives on a single-point question invalidates the answer.',
          feedbackType: 'contradiction',
          normalizedUserAnswer: normUser,
          matchedOfficialAnswer: normVariant
        };
      }
    }

    // ── RULE 2: THE FATAL HOMOPHONE / REAL-WORD TRAP ───────────────────────
    // If student word is a homophone pair in our dictionary with the target
    if (HOMOPHONE_TRAP_PAIRS[normUser] && HOMOPHONE_TRAP_PAIRS[normUser].partner === normVariant) {
      homophoneTrapDetected = {
        trapWord: normUser,
        targetWord: normVariant,
        explanation: HOMOPHONE_TRAP_PAIRS[normUser].explanation
      };
      break;
    }

    // Check individual words in compound phrases (e.g. "brown bare" vs "brown bear")
    const uWordList = normUser.split(' ');
    const vWordList = normVariant.split(' ');
    if (uWordList.length === vWordList.length) {
      for (let i = 0; i < uWordList.length; i++) {
        const uW = uWordList[i];
        const vW = vWordList[i];
        if (HOMOPHONE_TRAP_PAIRS[uW] && HOMOPHONE_TRAP_PAIRS[uW].partner === vW) {
          homophoneTrapDetected = {
            trapWord: uW,
            targetWord: vW,
            explanation: HOMOPHONE_TRAP_PAIRS[uW].explanation
          };
          break;
        }
      }
    }
    if (homophoneTrapDetected) break;

    // ── RULE 3: PLURAL VS. SINGULAR PRECISION ──────────────────────────────
    if (isPluralPair(processedUser, processedVariant)) {
      const isTargetPlural =
        processedVariant.endsWith('s') ||
        processedVariant.endsWith('ies') ||
        ['children', 'people', 'men', 'women'].includes(processedVariant);

      pluralMismatchDetected = {
        userWord: processedUser,
        targetWord: processedVariant,
        isMissingPlural: isTargetPlural
      };
      // Keep checking other variants in case of exact match elsewhere
    }

    // ── RULE 4: PHONETIC TOLERANCE ─────────────────────────────────────────
    // Only applies if the word is NOT an unintended real English word
    const lev = levenshteinDistance(processedUser, processedVariant);
    const soundexMatch = soundex(processedUser) === soundex(processedVariant);

    if (
      (lev <= 1 && processedVariant.length >= 4) ||
      (lev <= 2 && processedVariant.length >= 7 && soundexMatch) ||
      (soundexMatch && lev <= 2 && Math.abs(processedUser.length - processedVariant.length) <= 1)
    ) {
      bestPhoneticMatch = {
        variant: normVariant,
        feedback: `Accepted (phonetic spelling tolerance for '${trimmedUser}' $\\rightarrow$ '${normVariant}'). Ensure handwriting is clear to prevent examiner confusion.`
      };
    }
  }

  // 1. If Fatal Homophone Trap was triggered: STRICT 0 MARKS
  if (homophoneTrapDetected) {
    return {
      score: 0,
      maxMarks: 1,
      status: 'incorrect',
      verdict: `Zero Marks (Examiner Real-Word Trap)`,
      feedback: `Examiner Trap: '${homophoneTrapDetected.trapWord}' is a real English word with a different meaning (${homophoneTrapDetected.explanation}). Cambridge and Edexcel reject misspellings that form real unintended words.`,
      feedbackType: 'real_word_trap',
      normalizedUserAnswer: normUser,
      matchedOfficialAnswer: homophoneTrapDetected.targetWord
    };
  }

  // 2. If Plural Mismatch was triggered:
  if (pluralMismatchDetected) {
    if (board === 'Edexcel') {
      // Edexcel strictly checks grammatical number
      return {
        score: 0,
        maxMarks: 1,
        status: 'incorrect',
        verdict: 'Zero Marks (Plural Error - Edexcel Strictness)',
        feedback: pluralMismatchDetected.isMissingPlural
          ? `Edexcel strictly penalizes missing plural endings when specified in audio (target was plural '${pluralMismatchDetected.targetWord}', but you wrote singular '${pluralMismatchDetected.userWord}').`
          : `Edexcel strictly penalizes adding an unnecessary plural ending (target was singular '${pluralMismatchDetected.targetWord}', but you wrote plural '${pluralMismatchDetected.userWord}').`,
        feedbackType: 'missing_plural',
        normalizedUserAnswer: normUser,
        matchedOfficialAnswer: pluralMismatchDetected.targetWord
      };
    } else {
      // Cambridge (0510/0511) & OxfordAQA (9280): tolerate minor number slips
      return {
        score: 1,
        maxMarks: 1,
        status: 'warning',
        verdict: 'Accepted with Examiner Warning (Number Slip)',
        feedback: `Accepted under ${board} tolerance (audio specified '${pluralMismatchDetected.targetWord}'). Note: In Pearson Edexcel 4ES1, missing or adding plural endings loses the mark.`,
        feedbackType: 'phonetic_accepted',
        normalizedUserAnswer: normUser,
        matchedOfficialAnswer: pluralMismatchDetected.targetWord
      };
    }
  }

  // 3. If Phonetic Tolerance matched: Award 1 mark with warning
  if (bestPhoneticMatch) {
    return {
      score: 1,
      maxMarks: 1,
      status: 'warning',
      verdict: 'Accepted (Phonetic Tolerance)',
      feedback: bestPhoneticMatch.feedback,
      feedbackType: 'phonetic_accepted',
      normalizedUserAnswer: normUser,
      matchedOfficialAnswer: bestPhoneticMatch.variant,
      isPhoneticMatch: true
    };
  }

  // 4. Default: Content does not match mark scheme
  return {
    score: 0,
    maxMarks: 1,
    status: 'incorrect',
    verdict: 'Incorrect Answer',
    feedback: `Mark scheme does not accept '${trimmedUser}'. Acceptable answers: ${officialVariants.map(v => `'${v}'`).join(' or ')}.`,
    feedbackType: 'incorrect_content',
    normalizedUserAnswer: normUser,
    matchedOfficialAnswer: officialVariants[0] || officialAnswer
  };
}
