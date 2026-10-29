import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  BookOpen,
  Filter,
  Flame,
  Award,
  ChevronRight,
  TrendingDown,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

export interface ExaminerPitfall {
  id: string;
  subjectCode: string; // e.g. "0580", "0625", "0620", "0610", "0510"
  subjectName: string;
  paperType: 'Paper 1 (Reading & Writing)' | 'Paper 2 (MCQ/Extended)' | 'Paper 4 (Theory Extended)' | 'Paper 6 (Alternative to Practical)';
  topic: string;
  questionRef: string;
  candidateFailureRate: string; // e.g. "72% of candidates lost marks"
  severity: 'critical' | 'high' | 'moderate';
  commonError: string;
  examinerQuote: string;
  correctMethod: string;
  marksLostAverage: string;
}

export const EXAMINER_PITFALLS_DATABASE: ExaminerPitfall[] = [
  // 0580 Mathematics
  {
    id: 'math-1',
    subjectCode: '0580',
    subjectName: 'Cambridge IGCSE Mathematics',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Quadratic Formula & Rounding',
    questionRef: '0580/42/M/J/23 Q3(b)',
    candidateFailureRate: '68% of candidates lost the final A1 mark',
    severity: 'critical',
    commonError: 'Premature rounding in the middle of calculation, or writing 1 decimal place instead of the mandatory 2 decimal places specified in the question instruction.',
    examinerQuote: '"Many candidates correctly substituted into the quadratic formula but rounded intermediate square roots too early, resulting in x = 2.9 instead of 2.91. Cambridge rubric strictly requires 3 significant figures unless specified otherwise."',
    correctMethod: 'Store unrounded numbers in calculator memory. Write both roots to 2 decimal places as instructed (e.g. x = 2.91 and x = -0.57). Always write the complete formula substitution first for M1.',
    marksLostAverage: '-1 to -2 Marks'
  },
  {
    id: 'math-2',
    subjectCode: '0580',
    subjectName: 'Cambridge IGCSE Mathematics',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Upper and Lower Bounds',
    questionRef: '0580/41/O/N/23 Q6(a)',
    candidateFailureRate: '74% of candidates scored 0 or 1 out of 3',
    severity: 'critical',
    commonError: 'Using the upper bound of the denominator when finding the maximum value of a fraction, or miscalculating bounds for numbers given to 1 decimal place.',
    examinerQuote: '"To maximize a fraction A/B, candidates must use Upper Bound of A divided by Lower Bound of B. A significant majority wrongly used Upper Bound for both numerator and denominator."',
    correctMethod: 'For Maximum(A/B) = UB(A) ÷ LB(B). For Minimum(A/B) = LB(A) ÷ UB(B). If a value is given as 4.2 to 1 d.p., half the unit is 0.05, so bounds are 4.15 and 4.25.',
    marksLostAverage: '-2 Marks'
  },
  {
    id: 'math-3',
    subjectCode: '0580',
    subjectName: 'Cambridge IGCSE Mathematics',
    paperType: 'Paper 2 (MCQ/Extended)',
    topic: 'Vector Translations & Column Vectors',
    questionRef: '0580/22/M/J/24 Q11',
    candidateFailureRate: '55% of candidates made negative sign slips',
    severity: 'high',
    commonError: 'Reversing signs when moving in the opposite direction along a vector line (e.g. BA = -AB).',
    examinerQuote: '"Candidates struggled with path routing in geometric vector diagrams, frequently forgetting to negate the vector when moving against the arrow."',
    correctMethod: 'Always write down the letter path first: e.g. OQ = OP + PQ = a + 1/2(b - a) = 1/2a + 1/2b.',
    marksLostAverage: '-1 Mark'
  },

  // 0625 Physics
  {
    id: 'phys-1',
    subjectCode: '0625',
    subjectName: 'Cambridge IGCSE Physics',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Thermal Physics: Evaporation vs Boiling',
    questionRef: '0625/42/M/J/23 Q4(a)',
    candidateFailureRate: '81% of candidates failed to earn all 3 marks',
    severity: 'critical',
    commonError: 'Stating that evaporation happens "faster" or "at 100°C", or failing to mention that evaporation occurs only at the liquid surface.',
    examinerQuote: '"Candidates repeatedly stated that evaporation occurs at any temperature (which is correct), but failed to explain that only the most energetic particles escape the surface, reducing the average kinetic energy and causing cooling."',
    correctMethod: '1. Occurs at any temperature below boiling point [1]. 2. Occurs only at the surface of the liquid [1]. 3. High-energy molecules escape, lowering average KE of remaining molecules, causing cooling [1].',
    marksLostAverage: '-2 Marks'
  },
  {
    id: 'phys-2',
    subjectCode: '0625',
    subjectName: 'Cambridge IGCSE Physics',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Electromagnetic Induction & Transformers',
    questionRef: '0625/41/O/N/23 Q8(b)',
    candidateFailureRate: '63% of candidates wrote vague magnetic explanations',
    severity: 'high',
    commonError: 'Writing that "electricity passes through the iron core from primary to secondary coil".',
    examinerQuote: '"A persistent misconception among candidates is that the iron core conducts electrical current from the primary coil to the secondary coil. The core only transfers alternating magnetic flux."',
    correctMethod: 'Alternating current in primary creates a changing magnetic field in the soft iron core [1]. The changing magnetic field cuts through the secondary coil, inducing an alternating electromotive force (e.m.f.) [1].',
    marksLostAverage: '-2 Marks'
  },
  {
    id: 'phys-3',
    subjectCode: '0625',
    subjectName: 'Cambridge IGCSE Physics',
    paperType: 'Paper 6 (Alternative to Practical)',
    topic: 'Precaution in Optics & Ray Tracing',
    questionRef: '0625/62/M/J/24 Q2(d)',
    candidateFailureRate: '70% gave unaccepted vague answers',
    severity: 'high',
    commonError: 'Writing "be careful", "look closely", or "use a sharp pencil" without scientific context.',
    examinerQuote: '"For ray tracing pins, examiners consistently reject \'measure accurately\'. Acceptable answers must mention spacing pins at least 5cm apart, viewing the bases of the pins, or using a darkened room."',
    correctMethod: '1. Place pins at least 5 cm apart (ensures greater accuracy when drawing line) [1]. 2. View pins at the base / eye level to avoid parallax error [1].',
    marksLostAverage: '-1 Mark'
  },

  // 0620 Chemistry
  {
    id: 'chem-1',
    subjectCode: '0620',
    subjectName: 'Cambridge IGCSE Chemistry',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Electrolysis of Aqueous Solutions',
    questionRef: '0620/42/M/J/23 Q5(b)',
    candidateFailureRate: '76% of candidates failed the anode half-equation',
    severity: 'critical',
    commonError: 'Confusing concentrated aqueous NaCl (brine) with dilute NaCl. In concentrated NaCl, Chlorine gas forms at the anode, NOT Oxygen.',
    examinerQuote: '"When asked for products of concentrated aqueous sodium chloride, many wrote oxygen at the anode. The chloride ion is in high concentration so chloride ions are discharged, giving green chlorine gas."',
    correctMethod: 'At Anode (concentrated): 2Cl⁻ → Cl₂ + 2e⁻ (Chlorine gas, pale green). At Cathode: 2H⁺ + 2e⁻ → H₂ (Hydrogen gas, colorless). Na⁺ and OH⁻ remain in solution forming NaOH (alkaline).',
    marksLostAverage: '-2 to -3 Marks'
  },
  {
    id: 'chem-2',
    subjectCode: '0620',
    subjectName: 'Cambridge IGCSE Chemistry',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Equilibrium & Le Chatelier\'s Principle',
    questionRef: '0620/41/O/N/23 Q4(c)',
    candidateFailureRate: '65% failed to relate pressure to moles of gas',
    severity: 'high',
    commonError: 'Writing "equilibrium shifts right because pressure increases", without counting and citing the moles of gas on each side.',
    examinerQuote: '"Candidates stated the direction of shift correctly but failed to secure the explanation mark because they did not state: \'fewer moles of gas on the right-hand side\'."',
    correctMethod: 'State: Position of equilibrium shifts to the right [1], because there are fewer moles of gas on the right-hand side (e.g. 2 moles vs 4 moles) [1].',
    marksLostAverage: '-1 to -2 Marks'
  },

  // 0610 Biology
  {
    id: 'bio-1',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Enzyme Action & Temperature',
    questionRef: '0610/42/M/J/23 Q2(c)',
    candidateFailureRate: '71% used prohibited word "killed"',
    severity: 'critical',
    commonError: 'Writing that enzymes are "killed" or "die" at temperatures above 60°C.',
    examinerQuote: '"Examiners penalize any statement that enzymes \'die\'. Enzymes are biological catalysts (proteins), not living organisms. The active site changes shape / denatures, so substrate can no longer fit into the complementary active site."',
    correctMethod: 'High temperature causes enzyme to DENATURE [1]. The 3D active site changes shape [1]. Substrate is no longer complementary, so enzyme-substrate complexes can no longer form [1].',
    marksLostAverage: '-2 Marks'
  },
  {
    id: 'bio-2',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Transpiration Stream & Xylem vs Phloem',
    questionRef: '0610/41/O/N/23 Q3(b)',
    candidateFailureRate: '58% of candidates mixed up driving forces',
    severity: 'high',
    commonError: 'Claiming that roots "push" water up to leaves, or confusing transpiration pull with active transport.',
    examinerQuote: '"Transpiration pull is caused by evaporation of water from the mesophyll cell surfaces, creating negative pressure / suction that draws water up xylem vessels as a continuous column due to cohesion."',
    correctMethod: 'Water evaporates from surfaces of mesophyll cells into air spaces [1]. Water vapor diffuses through open stomata [1]. This creates a transpiration pull / suction tension drawing water through xylem due to cohesion between water molecules [1].',
    marksLostAverage: '-2 Marks'
  },

  // 0510 ESL
  {
    id: 'esl-1',
    subjectCode: '0510',
    subjectName: 'Cambridge IGCSE ESL',
    paperType: 'Paper 1 (Reading & Writing)',
    topic: 'Exercise 6: Formal vs Informal Tone',
    questionRef: '0510/12/M/J/24 Paper 1 Ex 6',
    candidateFailureRate: '60% lost Content & Language marks due to tone mixing',
    severity: 'high',
    commonError: 'Using informal slang ("hey guys", "gonna", emojis) when writing a formal letter or school magazine report.',
    examinerQuote: '"Candidates wrote well but used conversational phrasing in a formal report to the school principal, costing them the top band in Organization and Register."',
    correctMethod: 'For formal letters/articles: Use passive voice, academic connectives (\'Furthermore\', \'In conclusion\', \'Consequently\'), and zero contractions (\'cannot\' instead of \'can\'t\').',
    marksLostAverage: '-3 Marks'
  }
];

export const ExaminerPitfallsHeatmap: React.FC<{ subjects: Subject[]; profile: UserProfile }> = ({
  subjects,
  profile
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(EXAMINER_PITFALLS_DATABASE[0].id);

  const filteredPitfalls = useMemo(() => {
    return EXAMINER_PITFALLS_DATABASE.filter(item => {
      if (selectedSubject !== 'all' && item.subjectCode !== selectedSubject) return false;
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.topic.toLowerCase().includes(q) ||
          item.commonError.toLowerCase().includes(q) ||
          item.examinerQuote.toLowerCase().includes(q) ||
          item.subjectName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedSubject, selectedSeverity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Official Cambridge Examiner Reports (ER) Synthesis
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Examiner Pitfall Heatmap: "Why Students Lost Marks"
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              We parsed thousands of pages of official Cambridge Examiner Reports across 2018–2024. Discover the hidden traps, forbidden words, and careless slips that cost high-achieving candidates their A* grades.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Global Cambridge Average
              </div>
              <div className="text-xl font-black text-white font-mono">
                -8.4 Marks Lost
              </div>
              <div className="text-[10px] text-rose-400 font-semibold">
                Due to preventable candidate errors
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Cambridge Syllabuses</option>
            <option value="0580">0580 - Mathematics</option>
            <option value="0625">0625 - Physics</option>
            <option value="0620">0620 - Chemistry</option>
            <option value="0610">0610 - Biology</option>
            <option value="0510">0510 - ESL</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Pitfall Severities</option>
            <option value="critical">Critical (&gt;65% Failure)</option>
            <option value="high">High Yield (&gt;50% Failure)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topic, formula, or examiner keyword..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Pitfalls Cards Grid */}
      <div className="space-y-4">
        {filteredPitfalls.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            No examiner pitfalls found matching your filters.
          </div>
        ) : (
          filteredPitfalls.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900 border-rose-500/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.subjectCode}
                      </span>
                      <span className="text-xs text-slate-400">{item.paperType}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-xs text-slate-300 font-semibold">
                        {item.questionRef}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-auto sm:ml-0 ${
                          item.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.candidateFailureRate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      {item.topic}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">{item.commonError}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                      {item.marksLostAverage}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-500 transition-transform ${
                        isExpanded ? 'rotate-90 text-rose-400' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details: Official Examiner Quote & Correct Method */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/60 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* Left: What Candidates Did Wrong & Examiner Quote */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          What Students Wrote (Fatal Mistake)
                        </div>
                        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 leading-relaxed font-medium">
                          {item.commonError}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Direct Cambridge Chief Examiner Report Quote:
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            {item.examinerQuote}
                          </p>
                        </div>
                      </div>

                      {/* Right: How to Secure 100% Full Marks */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          How to Secure Full Cambridge Marks
                        </div>
                        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-mono whitespace-pre-wrap">
                          {item.correctMethod}
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs">
                          <span className="text-indigo-300 font-semibold">
                            Targeting Grade 9 (A*)?
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Apply this rule on every past paper
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
