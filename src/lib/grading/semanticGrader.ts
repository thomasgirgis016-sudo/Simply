/**
 * Simply IGCSE — Semantic Mark Scheme & Paper-Specific Grading Engine
 * 
 * Enforces Cambridge Examiner Conventions:
 * 1. Paper 2 (MCQ): Strictly multiple-choice (A, B, C, D), never typable.
 * 2. Paper 4 (Extended Theory / Structured): Evaluates "same meaning" (owtte - Or Words To That Effect),
 *    bracketed optional terms, slash alternatives, scientific synonyms, unit/rounding tolerance,
 *    and multi-root permutations.
 */

export interface McqOption {
  letter: 'A' | 'B' | 'C' | 'D';
  label: string;
}

/**
 * Detects whether a question is from Paper 2 (Multiple Choice / P2)
 */
export function isPaper2Question(question: {
  paperComponent?: string;
  source?: string;
  paperCode?: string;
  isMCQ?: boolean;
}): boolean {
  if (question.isMCQ) return true;
  const comp = (question.paperComponent || '').toLowerCase();
  if (comp.includes('paper 4') || comp.includes('paper 6') || comp.includes('paper 3') || comp.includes('paper 1')) {
    return false;
  }
  if (comp.includes('paper 2') || comp.includes('p2') || comp.includes('multiple choice') || comp.includes('mcq')) {
    return true;
  }

  const src = (question.source || '').toLowerCase();
  const code = (question.paperCode || '').toLowerCase();

  // Pattern matching syllabus/variant like 0580/22 or 0625/21, avoiding year like /23
  const p2Pattern = /\/(?:0?2|2[1-3])(?:\/|\s|$)/i;
  return p2Pattern.test(code) || p2Pattern.test(src);
}

/**
 * Detects whether a question is from Paper 4 (Extended Theory / P4)
 */
export function isPaper4Question(question: {
  paperComponent?: string;
  source?: string;
  paperCode?: string;
}): boolean {
  const comp = (question.paperComponent || '').toLowerCase();
  if (comp.includes('paper 2') || comp.includes('paper 6') || comp.includes('paper 1')) {
    return false;
  }
  if (comp.includes('paper 4') || comp.includes('p4') || comp.includes('theory') || comp.includes('structured')) {
    return true;
  }

  const src = (question.source || '').toLowerCase();
  const code = (question.paperCode || '').toLowerCase();

  const p4Pattern = /\/(?:0?4|4[1-3])(?:\/|\s|$)/i;
  return p4Pattern.test(code) || p4Pattern.test(src);
}

/**
 * Common scientific and examiner synonym clusters (owtte)
 */
const SYNONYM_CLUSTERS: string[][] = [
  // Trends & Directions
  ['increase', 'increases', 'increasing', 'increased', 'goes up', 'rise', 'rises', 'rising', 'higher', 'greater', 'larger', 'grows', 'more'],
  ['decrease', 'decreases', 'decreasing', 'decreased', 'goes down', 'falls', 'falling', 'drops', 'dropping', 'lower', 'smaller', 'reduces', 'reduced', 'less', 'slows down', 'decelerates'],
  ['constant', 'stays constant', 'remains constant', 'stays the same', 'remains the same', 'unchanged', 'steady', 'uniform', 'fixed'],
  ['faster', 'speeds up', 'accelerates', 'quicker', 'higher speed', 'greater velocity'],
  ['slower', 'slows down', 'decelerates', 'lower speed', 'smaller velocity'],
  ['directly proportional', 'proportional', 'linear relationship', 'straight line through origin'],
  ['inversely proportional', 'indirectly proportional'],

  // Physics Terminology
  ['kinetic energy', 'kinetic', 'ke', 'k.e.'],
  ['gravitational potential energy', 'gravitational potential', 'gravitational energy', 'gpe', 'g.p.e.', 'potential energy', 'pe'],
  ['thermal energy', 'heat energy', 'heat', 'thermal'],
  ['electrical energy', 'electricity', 'electrical'],
  ['direct current', 'dc', 'd.c.'],
  ['alternating current', 'ac', 'a.c.'],
  ['light', 'light ray', 'electromagnetic wave', 'em wave'],
  ['sound', 'sound wave', 'longitudinal wave'],
  ['amplitude', 'maximum displacement'],
  ['frequency', 'waves per second', 'cycles per second', 'hertz', 'hz'],

  // Biology Terminology
  ['cell membrane', 'plasma membrane', 'membrane'],
  ['cell wall', 'cellulose wall', 'wall'],
  ['chloroplast', 'chloroplasts', 'chlorophyll'],
  ['mitochondria', 'mitochondrion'],
  ['ribosome', 'ribosomes', 'site of protein synthesis'],
  ['red blood cell', 'red blood cells', 'erythrocyte', 'erythrocytes', 'rbc', 'rbcs'],
  ['white blood cell', 'white blood cells', 'leukocyte', 'leukocytes', 'phagocyte', 'lymphocyte', 'wbc', 'wbcs'],
  ['diffusion', 'net movement of particles from high to low concentration', 'movement down concentration gradient'],
  ['osmosis', 'diffusion of water', 'water movement down water potential gradient', 'movement through partially permeable membrane'],
  ['active transport', 'movement against concentration gradient', 'movement from low to high concentration using energy'],

  // Chemistry Terminology
  ['exothermic', 'releases heat', 'gives out heat', 'gives off heat', 'energy released', 'temperature increases', 'gets warmer'],
  ['endothermic', 'absorbs heat', 'takes in heat', 'energy taken in', 'temperature decreases', 'gets colder'],
  ['catalyst', 'speeds up reaction', 'lowers activation energy', 'provides alternative pathway without being consumed'],
  ['acid', 'proton donor', 'releases h+ ions', 'ph less than 7'],
  ['base', 'alkali', 'proton acceptor', 'releases oh- ions', 'ph greater than 7'],
  ['oxidation', 'loss of electrons', 'gain of oxygen'],
  ['reduction', 'gain of electrons', 'loss of oxygen'],
  ['ionic', 'ionic bonding', 'transfer of electrons', 'electrostatic attraction between oppositely charged ions'],
  ['covalent', 'covalent bonding', 'sharing of electron pairs', 'shared pair of electrons'],
];

/**
 * Normalizes text for comparison: lowercase, remove LaTeX wrappers, clean punctuation
 */
export function normalizeCleanText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/[\$%]/g, '')
    .replace(/[{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips common units for pure numerical comparison
 */
export function stripPhysicalUnits(str: string): string {
  return str
    .replace(/\b(cm|cm²|cm³|cm2|cm3|m|m²|m³|m2|m3|dm³|dm3|kg|g|mg|s|sec|seconds?|min|minutes?|h|hours?|km\/h|m\/s|m\/s²|m\/s2|j|kj|n|kn|w|kw|mw|v|mv|a|ma|pa|kpa|mpa|°c|c|k|degrees?|mol|mol\/dm³|mol\/dm3|g\/cm³|g\/cm3|n\/m²|n\/m2)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Expands bracketed optional words in Cambridge mark schemes
 * E.g., "(plastic) bottle" -> ["plastic bottle", "bottle"]
 * E.g., "(cell) membrane" -> ["cell membrane", "membrane"]
 */
export function expandBracketedMarkSchemeVariants(officialText: string): string[] {
  const variants = new Set<string>();
  const clean = normalizeCleanText(officialText);
  variants.add(clean);

  // If contains brackets e.g. (plastic) bottle
  if (clean.includes('(') && clean.includes(')')) {
    // Variant without brackets (including optional word)
    const withWord = clean.replace(/[\(\)]/g, '').replace(/\s+/g, ' ').trim();
    variants.add(withWord);

    // Variant removing text inside brackets completely
    const withoutWord = clean.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    variants.add(withoutWord);
  }

  return Array.from(variants).filter(Boolean);
}

/**
 * Splits slash or 'OR' separated alternatives in Cambridge mark schemes
 * E.g. "increases / goes up / rises" -> ["increases", "goes up", "rises"]
 */
export function splitMarkSchemeAlternatives(officialText: string): string[] {
  const normalized = normalizeCleanText(officialText);
  // Split on slashes or " or " or ";"
  const tokens = normalized.split(/\s*(?:\/|;|\bor\b)\s*/i);
  const result: string[] = [];

  for (const t of tokens) {
    const trimmed = t.trim();
    if (trimmed) {
      const bracketVariants = expandBracketedMarkSchemeVariants(trimmed);
      result.push(...bracketVariants);
    }
  }

  return Array.from(new Set(result));
}

/**
 * Checks numerical equivalence including rounding, decimals vs fractions, and ±% tolerance
 */
export function areNumbersSemanticallyEquivalent(val1Str: string, val2Str: string): boolean {
  const clean1 = stripPhysicalUnits(normalizeCleanText(val1Str));
  const clean2 = stripPhysicalUnits(normalizeCleanText(val2Str));

  if (clean1 === clean2) return true;

  // Fraction support e.g. "1/2" -> 0.5
  const parseVal = (s: string): number => {
    if (s.includes('/')) {
      const [num, den] = s.split('/').map(Number);
      if (den && !isNaN(num) && !isNaN(den)) return num / den;
    }
    return parseFloat(s);
  };

  const v1 = parseVal(clean1);
  const v2 = parseVal(clean2);

  if (!isNaN(v1) && !isNaN(v2)) {
    // Exact or near-exact float match
    if (Math.abs(v1 - v2) < 0.001) return true;
    // Standard 3 significant figures tolerance (within 2%)
    if (v2 !== 0 && Math.abs((v1 - v2) / v2) <= 0.025) return true;
  }

  // Multi-root check (e.g. "3, -3" vs "-3, 3" or "x = 3, -3" or "3 or -3")
  const nums1 = (val1Str.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).sort((a, b) => a - b).join(',');
  const nums2 = (val2Str.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).sort((a, b) => a - b).join(',');
  if (nums1 && nums1.length > 0 && nums1 === nums2) return true;

  const roots1 = clean1.split(/[,;\s]+/).filter(Boolean).sort().join(',');
  const roots2 = clean2.split(/[,;\s]+/).filter(Boolean).sort().join(',');
  if (roots1 && roots1 === roots2) return true;

  return false;
}

/**
 * Checks if two phrases match via scientific synonym clusters (owtte)
 */
export function arePhrasesSynonyms(phrase1: string, phrase2: string): boolean {
  const p1 = normalizeCleanText(phrase1);
  const p2 = normalizeCleanText(phrase2);

  if (p1 === p2) return true;

  for (const cluster of SYNONYM_CLUSTERS) {
    const hasP1 = cluster.some(word => p1.includes(word));
    const hasP2 = cluster.some(word => p2.includes(word));
    if (hasP1 && hasP2) return true;
  }

  return false;
}

/**
 * The Master Semantic Evaluator:
 * Determines if a student's answer has the same meaning as the official mark scheme,
 * adhering to Cambridge IGCSE Examiner Mark Scheme principles (owtte).
 */
export function isSameMeaningAnswer(
  studentAnswer: string,
  officialAnswer: string,
  markSchemeRequirements?: Array<{ requirement: string }>,
  isP4 = false
): { isMatch: boolean; reason: string } {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { isMatch: false, reason: 'Empty student response.' };
  }

  const sNorm = normalizeCleanText(studentAnswer);
  const oNorm = normalizeCleanText(officialAnswer);

  // 1. Direct normalized equality
  if (sNorm === oNorm) {
    return { isMatch: true, reason: 'Exact match with official mark scheme.' };
  }

  // 2. Expand all slash & bracketed alternatives in official answer
  const alternatives = splitMarkSchemeAlternatives(officialAnswer);

  for (const alt of alternatives) {
    const altClean = normalizeCleanText(alt);
    if (!altClean) continue;

    // Direct match against alternative
    if (sNorm === altClean) {
      return { isMatch: true, reason: `Matches accepted alternative: "${alt}"` };
    }

    // Numerical equivalence with unit stripping
    if (areNumbersSemanticallyEquivalent(sNorm, altClean)) {
      return { isMatch: true, reason: `Numerical value is mathematically equivalent to "${alt}".` };
    }

    // Synonym cluster matching (owtte)
    if (arePhrasesSynonyms(sNorm, altClean)) {
      return { isMatch: true, reason: `Scientifically equivalent concept (owtte) matching "${alt}".` };
    }

    // Substring containment for descriptive/qualitative answers (e.g. student wrote full sentence)
    if (altClean.length >= 4 && sNorm.length >= 4) {
      if (sNorm.includes(altClean) || altClean.includes(sNorm)) {
        return { isMatch: true, reason: `Key syllabus phrasing identified in student response: "${alt}".` };
      }
    }
  }

  // 3. Check mark scheme requirements items (if provided)
  if (markSchemeRequirements && markSchemeRequirements.length > 0) {
    for (const req of markSchemeRequirements) {
      const reqAlts = splitMarkSchemeAlternatives(req.requirement);
      for (const rAlt of reqAlts) {
        if (arePhrasesSynonyms(sNorm, rAlt) || areNumbersSemanticallyEquivalent(sNorm, rAlt)) {
          return { isMatch: true, reason: `Satisfies mark scheme requirement: "${req.requirement}".` };
        }
        if (rAlt.length >= 5 && sNorm.includes(rAlt)) {
          return { isMatch: true, reason: `Contains required examiner concept: "${rAlt}".` };
        }
      }
    }
  }

  // 4. Extended Paper 4 Semantic Relaxations
  if (isP4) {
    // If student wrote a multi-word explanation that contains key root concepts
    const officialTokens = oNorm.split(/[\s,;]+/).filter(w => w.length > 3);
    const studentTokens = sNorm.split(/[\s,;]+/).filter(w => w.length > 3);

    if (officialTokens.length > 0) {
      const matchedTokens = officialTokens.filter(t => studentTokens.some(st => st.includes(t) || arePhrasesSynonyms(st, t)));
      if (matchedTokens.length >= Math.ceil(officialTokens.length * 0.6)) {
        return {
          isMatch: true,
          reason: `Paper 4 Examiner Acceptance: Expresses same scientific meaning with matching key concepts (${matchedTokens.join(', ')}).`
        };
      }
    }
  }

  return { isMatch: false, reason: 'Does not match official mark scheme requirements or accepted alternatives.' };
}

/**
 * Extracts or generates 4 authentic Cambridge Paper 2 MCQ options (A, B, C, D)
 */
export function getP2McqOptions(
  question: {
    paperComponent?: string;
    prompt?: string;
    questionPrompt?: string;
    paperCode?: string;
    source?: string;
  },
  subPart: {
    finalAnswer: string;
    prompt?: string;
    questionPrompt?: string;
  }
): McqOption[] {
  const ansClean = subPart.finalAnswer.trim();

  // If the answer is already a single letter A, B, C, or D:
  if (/^[A-D]$/i.test(ansClean)) {
    const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    return letters.map(letter => ({
      letter,
      label: `Option ${letter}`
    }));
  }

  // If prompt has options formatted like "A 1200 N \n B 2400 N \n C 3600 N \n D 4800 N"
  const prompt = `${question.prompt || question.questionPrompt || ''} ${subPart.prompt || subPart.questionPrompt || ''}`;
  const mcqMatch = prompt.match(/\bA[:\.\s]+([^\n\r]+)[\s\S]*?\bB[:\.\s]+([^\n\r]+)[\s\S]*?\bC[:\.\s]+([^\n\r]+)[\s\S]*?\bD[:\.\s]+([^\n\r]+)/i);

  if (mcqMatch) {
    return [
      { letter: 'A', label: mcqMatch[1].trim() },
      { letter: 'B', label: mcqMatch[2].trim() },
      { letter: 'C', label: mcqMatch[3].trim() },
      { letter: 'D', label: mcqMatch[4].trim() },
    ];
  }

  // Authentic distractor synthesis around the correct finalAnswer
  // Determine if numerical or textual
  const numMatch = ansClean.match(/-?\d+(?:\.\d+)?/);
  if (numMatch) {
    const baseVal = parseFloat(numMatch[0]);
    const unit = ansClean.replace(numMatch[0], '').trim();
    const isInt = Number.isInteger(baseVal);

    const distractorVals = [
      baseVal,
      isInt ? baseVal * 2 : Number((baseVal * 1.5).toFixed(2)),
      isInt ? Math.max(1, Math.round(baseVal / 2)) : Number((baseVal / 2).toFixed(2)),
      isInt ? baseVal + 10 : Number((baseVal * 10).toFixed(2)),
    ];

    // Guarantee the correct answer is assigned to letter B or A consistently
    return [
      { letter: 'A', label: `${distractorVals[1]} ${unit}`.trim() },
      { letter: 'B', label: `${distractorVals[0]} ${unit}`.trim() }, // Correct
      { letter: 'C', label: `${distractorVals[2]} ${unit}`.trim() },
      { letter: 'D', label: `${distractorVals[3]} ${unit}`.trim() },
    ];
  }

  // Qualitative options
  return [
    { letter: 'A', label: ansClean.includes('increase') ? 'Decreases uniformly' : 'Option A' },
    { letter: 'B', label: ansClean }, // Correct answer text
    { letter: 'C', label: ansClean.includes('increase') ? 'Remains constant' : 'Option C' },
    { letter: 'D', label: 'Increases then decreases' },
  ];
}
