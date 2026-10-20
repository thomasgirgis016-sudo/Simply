import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Flame,
  Search,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileText,
  Sliders,
  Award,
  Layers,
  ChevronRight,
  Check,
  RotateCcw
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface ScienceAtpMasterProps {
  subject: Subject;
  profile: UserProfile;
}

interface ChemicalTest {
  id: string;
  name: string;
  type: 'cation' | 'anion' | 'gas' | 'flame' | 'bio_food';
  reagentsUsed: string;
  positiveObservation: string;
  negativeOrExcessObservation?: string;
  cambridgeTip: string;
}

const CHEMICAL_TESTS_DB: ChemicalTest[] = [
  // Cations (with NaOH and NH3)
  {
    id: 'cu2',
    name: 'Copper(II) (Cu²⁺)',
    type: 'cation',
    reagentsUsed: 'Aqueous Sodium Hydroxide (NaOH) & Aqueous Ammonia (NH₃)',
    positiveObservation: 'Light blue precipitate with NaOH (insoluble in excess). Light blue ppt with NH₃, dissolving in excess to form a deep royal blue solution.',
    cambridgeTip: 'Examiners award 1 mark for light blue ppt and 1 mark for deep blue solution in excess NH₃.'
  },
  {
    id: 'fe2',
    name: 'Iron(II) (Fe²⁺)',
    type: 'cation',
    reagentsUsed: 'Aqueous Sodium Hydroxide (NaOH)',
    positiveObservation: 'Green precipitate formed, insoluble in excess. Turns brown on surface standing in air (oxidizes to Fe³⁺).',
    cambridgeTip: 'Remember to mention that the green precipitate turns brown over time.'
  },
  {
    id: 'fe3',
    name: 'Iron(III) (Fe³⁺)',
    type: 'cation',
    reagentsUsed: 'Aqueous Sodium Hydroxide (NaOH) or Aqueous Ammonia (NH₃)',
    positiveObservation: 'Red-brown precipitate formed, completely insoluble in excess of either reagent.',
    cambridgeTip: 'Do not just write "brown" or "red". Cambridge mark scheme strictly requires "red-brown precipitate".'
  },
  {
    id: 'al3_zn2',
    name: 'Aluminum (Al³⁺) vs Zinc (Zn²⁺)',
    type: 'cation',
    reagentsUsed: 'Aqueous Ammonia (NH₃)',
    positiveObservation: 'Both give white ppt with NaOH dissolving in excess. With aqueous NH₃: Al³⁺ ppt is INSOLUBLE in excess, but Zn²⁺ ppt DISSOLVES in excess to form a colourless solution.',
    cambridgeTip: 'This is the #1 Cambridge trick question. Aqueous ammonia is required to distinguish Al³⁺ from Zn²⁺.'
  },
  {
    id: 'nh4',
    name: 'Ammonium (NH₄⁺)',
    type: 'cation',
    reagentsUsed: 'Aqueous NaOH and warm gently with Bunsen burner',
    positiveObservation: 'Pungent smelling ammonia gas produced which turns damp red litmus paper blue.',
    cambridgeTip: 'Litmus paper must be damp to dissolve the gas, otherwise 0 marks.'
  },

  // Anions
  {
    id: 'cl_br_i',
    name: 'Halides: Chloride (Cl⁻), Bromide (Br⁻), Iodide (I⁻)',
    type: 'anion',
    reagentsUsed: 'Acidify with dilute nitric acid (HNO₃), then add aqueous silver nitrate (AgNO₃)',
    positiveObservation: 'Chloride = White ppt (AgCl). Bromide = Cream ppt (AgBr). Iodide = Yellow ppt (AgI).',
    cambridgeTip: 'Must specify nitric acid (HNO₃). Using hydrochloric acid (HCl) introduces chloride ions and invalidates the test!'
  },
  {
    id: 'so4',
    name: 'Sulfate (SO₄²⁻)',
    type: 'anion',
    reagentsUsed: 'Acidify with dilute nitric acid (HNO₃), then add aqueous barium nitrate or barium chloride',
    positiveObservation: 'Dense white precipitate (BaSO₄) formed.',
    cambridgeTip: 'Acidification is mandatory to remove any carbonate ions that would give a false positive precipitate.'
  },
  {
    id: 'co3',
    name: 'Carbonate (CO₃²⁻)',
    type: 'anion',
    reagentsUsed: 'Add dilute hydrochloric acid and bubble gas through limewater (Ca(OH)₂)',
    positiveObservation: 'Effervescence / fizzing. Limewater turns milky / cloudy white.',
    cambridgeTip: 'Cambridge demands: "effervescence" and "limewater turns milky/cloudy".'
  },

  // Gases
  {
    id: 'gas_o2',
    name: 'Oxygen (O₂)',
    type: 'gas',
    reagentsUsed: 'Glowing wooden splint inserted into mouth of test tube',
    positiveObservation: 'Relights a glowing splint.',
    cambridgeTip: 'Splint must be GLOWING (not burning).'
  },
  {
    id: 'gas_h2',
    name: 'Hydrogen (H₂)',
    type: 'gas',
    reagentsUsed: 'Lighted wooden splint held at mouth of test tube',
    positiveObservation: 'Burns with a loud "squeaky pop" sound.',
    cambridgeTip: 'Always write "squeaky pop sound with a lighted splint".'
  },
  {
    id: 'gas_cl2',
    name: 'Chlorine (Cl₂)',
    type: 'gas',
    reagentsUsed: 'Damp blue litmus paper',
    positiveObservation: 'Bleaches damp blue litmus paper white (turns pink briefly then bleaches).',
    cambridgeTip: 'Must mention BLEACHES or turns white.'
  },

  // Flame Tests
  {
    id: 'flame_li',
    name: 'Lithium (Li⁺)',
    type: 'flame',
    reagentsUsed: 'Clean nichrome wire dipped in concentrated HCl into roaring Bunsen flame',
    positiveObservation: 'Crimson / Red flame.',
    cambridgeTip: 'Clean the wire in concentrated HCl between tests until no flame color is observed.'
  },
  {
    id: 'flame_na',
    name: 'Sodium (Na⁺)',
    type: 'flame',
    reagentsUsed: 'Clean nichrome wire in Bunsen flame',
    positiveObservation: 'Persistent bright yellow / orange flame.',
    cambridgeTip: 'Even trace contamination produces a yellow flame.'
  },
  {
    id: 'flame_k',
    name: 'Potassium (K⁺)',
    type: 'flame',
    reagentsUsed: 'Clean nichrome wire in Bunsen flame',
    positiveObservation: 'Lilac flame.',
    cambridgeTip: 'Cambridge examiners look for "lilac", not purple.'
  },
  {
    id: 'flame_cu',
    name: 'Copper(II) (Cu²⁺)',
    type: 'flame',
    reagentsUsed: 'Clean nichrome wire in Bunsen flame',
    positiveObservation: 'Blue-green flame.',
    cambridgeTip: 'Write blue-green, not just green.'
  },

  // Biology Food Tests
  {
    id: 'bio_starch',
    name: 'Starch Test (Iodine Solution)',
    type: 'bio_food',
    reagentsUsed: 'Few drops of iodine in potassium iodide solution',
    positiveObservation: 'Turns from brown/yellow-orange to Blue-Black.',
    cambridgeTip: 'Initial color is brown/orange; final color must be stated as blue-black.'
  },
  {
    id: 'bio_sugar',
    name: 'Reducing Sugar (Benedict’s Solution)',
    type: 'bio_food',
    reagentsUsed: 'Add Benedict’s reagent and HEAT in a water bath at 80°C for 5 minutes',
    positiveObservation: 'Turns from blue ➔ green ➔ yellow ➔ orange ➔ brick-red precipitate.',
    cambridgeTip: 'Mandatory mark: "heating in a water bath" is required.'
  },
  {
    id: 'bio_protein',
    name: 'Protein (Biuret Test)',
    type: 'bio_food',
    reagentsUsed: 'Biuret solution (dilute potassium hydroxide + copper sulfate)',
    positiveObservation: 'Color changes from pale blue to Violet / Purple.',
    cambridgeTip: 'Purple or violet are both accepted by Cambridge.'
  },
  {
    id: 'bio_lipid',
    name: 'Lipids (Ethanol Emulsion Test)',
    type: 'bio_food',
    reagentsUsed: 'Dissolve in ethanol, then pour into cold water',
    positiveObservation: 'A white cloudy emulsion forms.',
    cambridgeTip: 'Word "emulsion" is required for full credit.'
  }
];

export const ScienceAtpMaster: React.FC<ScienceAtpMasterProps> = ({
  subject,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'apparatus' | 'investigation'>('tests');
  const [testSearch, setTestSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cation' | 'anion' | 'gas' | 'flame' | 'bio_food'>('all');

  // 6-Mark Investigation Planner State
  const [investigationTopic, setInvestigationTopic] = useState('rate-temp');

  const filteredTests = useMemo(() => {
    return CHEMICAL_TESTS_DB.filter(t => {
      const matchSearch = !testSearch.trim() ||
        t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.positiveObservation.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.reagentsUsed.toLowerCase().includes(testSearch.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [testSearch, filterType]);

  // Burette measurement drill state
  const [buretteLevel, setBuretteLevel] = useState(24.35);
  const [studentBuretteGuess, setStudentBuretteGuess] = useState('');
  const [buretteFeedback, setBuretteFeedback] = useState<string | null>(null);

  const handleCheckBurette = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(studentBuretteGuess);
    if (isNaN(val)) return;

    if (Math.abs(val - buretteLevel) <= 0.05) {
      setBuretteFeedback(`✅ Correct! You read ${val.toFixed(2)} cm³ (True reading: ${buretteLevel.toFixed(2)} cm³). Within Cambridge ±0.05 cm³ tolerance.`);
    } else {
      setBuretteFeedback(`❌ Incorrect. Remember: burettes read from TOP to BOTTOM. The true bottom of the meniscus is at ${buretteLevel.toFixed(2)} cm³.`);
    }
  };

  const handleNewBuretteDrill = () => {
    // Generate new random burette reading between 12.00 and 38.00 ending in .05, .10, .15 etc.
    const steps = Math.floor(Math.random() * 520) + 240;
    const newLvl = Number((steps * 0.05).toFixed(2));
    setBuretteLevel(newLvl);
    setStudentBuretteGuess('');
    setBuretteFeedback(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-black text-cyan-300 border border-cyan-500/30">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Alternative to Practical (Paper 6) Master Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Science Paper 6 & Practical Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Master the 20% of your grade that students drop most marks on: chemical cation/anion tests, meniscus readings, and the 6-mark experimental investigation plan.
            </p>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>Chemical & Food Test Database</span>
          <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[10px] text-slate-300">
            {CHEMICAL_TESTS_DB.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apparatus')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'apparatus'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Apparatus & Meniscus Drills</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('investigation')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'investigation'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>6-Mark "Plan an Investigation" Blueprint</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CHEMICAL & FOOD TEST DATABASE                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Search test for Copper, Sulfate, Hydrogen, Iodine, or observation..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'cation', 'anion', 'gas', 'flame', 'bio_food'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer shrink-0 ${
                    filterType === t
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'bio_food' ? 'Food Tests' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white">{test.name}</span>
                    <p className="text-[11px] text-slate-400">Reagent: {test.reagentsUsed}</p>
                  </div>
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-cyan-300 border border-cyan-500/30 shrink-0">
                    {test.type}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs">
                  <div className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider">
                    Official Cambridge Observation:
                  </div>
                  <div className="text-slate-200 leading-relaxed font-sans">
                    {test.positiveObservation}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-[11px] text-amber-200/90 leading-snug">
                  <strong>Examiner Key Point:</strong> {test.cambridgeTip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. APPARATUS & MENISCUS READING DRILLS                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'apparatus' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Interactive Practice Drill
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Burette Meniscus Reading</h3>
                <p className="text-xs text-slate-400">
                  Read the liquid level at the bottom of the meniscus. Burettes measure from top to bottom (0.00 at top, 50.00 at bottom). Record to 2 decimal places.
                </p>
              </div>

              <button
                type="button"
                onClick={handleNewBuretteDrill}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Volume</span>
              </button>
            </div>

            {/* Visual SVG Burette Simulator */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="relative w-28 h-64 bg-slate-900 border-2 border-slate-600 rounded-lg flex items-center justify-center shadow-inner overflow-hidden">
                {/* Liquid simulation */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-cyan-500/30 border-t-4 border-cyan-400 transition-all duration-300"
                  style={{ height: `${100 - ((buretteLevel % 2) * 40 + 10)}%` }}
                />

                {/* Burette tick lines */}
                <div className="absolute inset-y-2 left-2 flex flex-col justify-between text-[9px] font-mono text-slate-400 select-none">
                  <div>— {Math.floor(buretteLevel)}</div>
                  <div>— .2</div>
                  <div>— .4</div>
                  <div>— .6</div>
                  <div>— .8</div>
                  <div>— {Math.floor(buretteLevel) + 1}</div>
                </div>

                <div className="text-center z-10 font-mono text-xs font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded">
                  Meniscus
                </div>
              </div>

              {/* Student Answer Input */}
              <div className="space-y-3 w-full sm:w-72">
                <form onSubmit={handleCheckBurette} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Enter Burette Reading (cm³):
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={studentBuretteGuess}
                      onChange={(e) => setStudentBuretteGuess(e.target.value)}
                      placeholder="e.g. 24.35"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 font-mono text-base font-bold text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-slate-950 shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    Check Measurement
                  </button>
                </form>

                {buretteFeedback && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold leading-relaxed animate-fadeIn">
                    {buretteFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. 6-MARK "PLAN AN INVESTIGATION" BLUEPRINT                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'investigation' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <div>
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                Guaranteed 6 Marks Template
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                The Cambridge 6-Mark Experimental Blueprint
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Every Paper 6 contains one 6-mark experimental design question. Follow this formula to guarantee all 6 marks regardless of the scenario.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-amber-400 font-bold uppercase text-[10px]">Mark 1: Apparatus & Setup</span>
                <p className="text-slate-300 leading-relaxed">
                  Name the exact container and measuring instrument with capacities (e.g. <em>"Use a 50 cm³ measuring cylinder and a digital stopwatch accurate to 0.01s"</em>).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Mark 2: Variables Controlled</span>
                <p className="text-slate-300 leading-relaxed">
                  Explicitly state 2 controlled variables (e.g. <em>"Keep concentration of acid at 1.0 mol/dm³ and volume constant at 25 cm³"</em>).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-cyan-400 font-bold uppercase text-[10px]">Mark 3: Range & Values</span>
                <p className="text-slate-300 leading-relaxed">
                  Specify at least 5 different values tested (e.g. <em>"Test temperatures of 20°C, 30°C, 40°C, 50°C, and 60°C"</em>).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-purple-400 font-bold uppercase text-[10px]">Mark 4: Step-by-Step Method</span>
                <p className="text-slate-300 leading-relaxed">
                  Clearly describe the trigger and endpoint (e.g. <em>"Start stopwatch immediately upon adding magnesium; stop when effervescence ceases"</em>).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-pink-400 font-bold uppercase text-[10px]">Mark 5: Reliability & Averages</span>
                <p className="text-slate-300 leading-relaxed">
                  Cambridge golden phrase: <em>"Repeat each temperature 3 times and calculate a mean, discarding any anomalous results."</em>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-indigo-400 font-bold uppercase text-[10px]">Mark 6: Data Table & Analysis</span>
                <p className="text-slate-300 leading-relaxed">
                  State: <em>"Draw a table with columns for temperature (°C) and time (s). Plot a line graph of rate against temperature."</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
