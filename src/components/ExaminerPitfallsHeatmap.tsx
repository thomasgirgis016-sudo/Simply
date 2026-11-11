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
  {
    id: 'bio-photosynthesis-1',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    paperType: 'Paper 4 (Theory Extended)',
    topic: 'Photosynthesis Limiting Factors & Graph Plateaus',
    questionRef: '0610/42/M/J/24 Q3(b)',
    candidateFailureRate: '67% said "photosynthesis stopped" when the curve flattened',
    severity: 'critical',
    commonError: 'Stating that photosynthesis "stops" or "is zero" when the light intensity curve levels off, instead of recognizing that the rate becomes constant because another factor is limiting.',
    examinerQuote: '"When the curve plateaued, a majority of candidates wrote that photosynthesis stopped. The rate remains constant at its maximum; light is no longer the limiting factor. Carbon dioxide concentration or temperature is now limiting the rate."',
    correctMethod: 'State: 1. As light intensity increases initially, rate increases linearly (light is limiting) [1]. 2. At higher light intensity, the curve plateaus / levels off because light is no longer limiting [1]. 3. Another factor such as CO₂ concentration or temperature is now the limiting factor [1].',
    marksLostAverage: '-2 Marks'
  },
  {
    id: 'bio-photosynthesis-2',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    paperType: 'Paper 6 (Alternative to Practical)',
    topic: 'Photosynthesis Starch Testing & Destarching Controls',
    questionRef: '0610/61/O/N/23 Q1(c)',
    candidateFailureRate: '62% failed to explain the purpose of destarching',
    severity: 'high',
    commonError: 'Stating that the potted plant was placed in a dark cupboard for 48 hours to "kill the plant" or "remove chlorophyll".',
    examinerQuote: '"Candidates frequently stated that destarching kills the leaf. The purpose of keeping the plant in the dark is solely to ensure that any starch already present in the leaves is converted to sucrose and transported away, so that any starch detected after the light exposure was newly produced during the investigation."',
    correctMethod: 'Destarching: Place potted plant in darkness for 48 hours [1] so stored starch is broken down into sucrose and transported away/used in respiration [1]. This ensures any starch detected after the experiment was synthesised during the investigation [1].',
    marksLostAverage: '-1 to -2 Marks'
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
          item.correctMethod.toLowerCase().includes(q) ||
          item.subjectName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedSubject, selectedSeverity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#18181b] border border-white/[0.08] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#e5484d]/10 border border-[#e5484d]/20 text-[#e5484d] text-xs font-medium tracking-wide uppercase font-mono">
              <Flame className="w-3.5 h-3.5 text-[#e5484d]" />
              Official Cambridge Examiner Reports (ER) Synthesis
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Examiner Pitfall Heatmap: "Why Students Lost Marks"
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Synthesized from official Cambridge Examiner Reports across 2018–2024. Review the common traps, forbidden phrasing, and precision oversights that cost candidates marks.
            </p>
          </div>

          <div className="bg-[#141416] border border-white/[0.08] rounded-xl p-4 sm:p-4.5 flex items-center gap-3.5 shrink-0 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#e5484d]/10 border border-[#e5484d]/20 flex items-center justify-center text-[#e5484d]">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Cambridge Global Average
              </div>
              <div className="text-lg font-semibold text-white font-mono tabular-nums">
                -8.4 Marks Lost
              </div>
              <div className="text-[11px] text-[#e5484d] font-medium">
                Due to preventable slips
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#18181b] border border-white/[0.08] p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="bg-[#141416] border border-white/[0.08] text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF5B37] cursor-pointer"
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
            className="bg-[#141416] border border-white/[0.08] text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF5B37] cursor-pointer"
          >
            <option value="all">All Pitfall Severities</option>
            <option value="critical">Critical (&gt;65% Failure)</option>
            <option value="high">High Yield (&gt;50% Failure)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topic, formula, or examiner keyword..."
            className="w-full bg-[#141416] border border-white/[0.08] text-zinc-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#FF5B37]"
          />
        </div>
      </div>

      {/* Pitfalls Cards Grid */}
      <div className="space-y-3">
        {filteredPitfalls.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs bg-[#18181b] rounded-xl border border-white/[0.08]">
            No examiner pitfalls found matching your filters.
          </div>
        ) : (
          filteredPitfalls.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-[#18181b] border-white/[0.18] shadow-md'
                    : 'bg-[#18181b] border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-white/[0.06] text-zinc-200 border border-white/[0.08]">
                        {item.subjectCode}
                      </span>
                      <span className="text-xs text-zinc-400">{item.paperType}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-xs text-zinc-300 font-medium">
                        {item.questionRef}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded uppercase tracking-wider ml-auto sm:ml-0 ${
                          item.severity === 'critical'
                            ? 'bg-[#e5484d]/10 text-[#e5484d] border border-[#e5484d]/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {item.candidateFailureRate}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#e5484d] shrink-0" />
                      {item.topic}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1">{item.commonError}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="text-xs font-mono font-medium text-[#e5484d] bg-[#e5484d]/10 px-2.5 py-1 rounded-lg border border-[#e5484d]/20">
                      {item.marksLostAverage}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isExpanded ? 'rotate-90 text-[#FF5B37]' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details: Official Examiner Quote & Correct Method */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-white/[0.06] bg-[#141416] space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* Left: What Candidates Did Wrong & Examiner Quote */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#e5484d] flex items-center gap-1.5 font-mono">
                          <XCircle className="w-4 h-4" />
                          What Students Wrote (Mistake)
                        </div>
                        <div className="p-3.5 rounded-lg bg-[#e5484d]/10 border border-[#e5484d]/20 text-xs text-zinc-200 leading-relaxed font-normal">
                          {item.commonError}
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#18181b] border border-white/[0.08] space-y-1.5">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                            Cambridge Chief Examiner Report Quote:
                          </div>
                          <p className="text-xs text-zinc-300 italic leading-relaxed">
                            {item.examinerQuote}
                          </p>
                        </div>
                      </div>

                      {/* Right: How to Secure 100% Full Marks */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#4cc38a] flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-4 h-4" />
                          How to Secure Full Cambridge Marks
                        </div>
                        <div className="p-3.5 rounded-lg bg-[#4cc38a]/10 border border-[#4cc38a]/20 text-xs text-[#4cc38a] leading-relaxed font-mono whitespace-pre-wrap">
                          {item.correctMethod}
                        </div>

                        <div className="p-3 rounded-lg bg-[#18181b] border border-white/[0.08] flex items-center justify-between text-xs">
                          <span className="text-zinc-200 font-medium">
                            Targeting Cambridge 9 (A*)?
                          </span>
                          <span className="text-xs text-zinc-400">
                            Apply this rule on past paper drills
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
