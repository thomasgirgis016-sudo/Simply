import { RevisionTopic } from '../types';
import { EXPANDED_REVISION_NOTES } from './expandedRevisionNotes';

export const COMPREHENSIVE_REVISION_NOTES: RevisionTopic[] = [
  ...EXPANDED_REVISION_NOTES,
  // ==========================================================
  // CHEMISTRY (CIE 0620 & EDEXCEL 4CH1)
  // ==========================================================
  {
    id: 'rev-chem-bonding',
    subjectId: 'cie-chem-0620',
    chapter: 'Atoms, Elements and Compounds',
    title: 'Chemical Bonding, Giant Lattices & Molecular Structures',
    learningObjectives: [
      'Describe the formation of ionic bonds between metals and non-metals by electron transfer.',
      'Explain the physical properties of giant ionic lattices in terms of strong electrostatic forces.',
      'Contrast simple molecular structures with giant covalent macromolecules (diamond, graphite, silicon dioxide).',
      'Account for the electrical conductivity and high melting points of metallic bonding.'
    ],
    diagramTitle: 'Comparison of Giant Ionic Lattice, Simple Covalent Molecules & Giant Macromolecules',
    diagramSvg: `<svg viewBox="0 0 700 260" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="260" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Panel 1: Giant Ionic Lattice -->
  <g transform="translate(25, 20)">
    <rect width="195" height="220" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-dasharray="3 3" stroke-width="1.2"/>
    <text x="97" y="24" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">Giant Ionic Lattice (NaCl)</text>
    
    <!-- 3D Lattice Cube Grid -->
    <line x1="45" y1="65" x2="115" y2="65" stroke="#475569" stroke-width="2"/>
    <line x1="115" y1="65" x2="115" y2="135" stroke="#475569" stroke-width="2"/>
    <line x1="115" y1="135" x2="45" y2="135" stroke="#475569" stroke-width="2"/>
    <line x1="45" y1="135" x2="45" y2="65" stroke="#475569" stroke-width="2"/>
    
    <line x1="45" y1="65" x2="75" y2="45" stroke="#475569" stroke-width="1.5"/>
    <line x1="115" y1="65" x2="145" y2="45" stroke="#475569" stroke-width="1.5"/>
    <line x1="115" y1="135" x2="145" y2="115" stroke="#475569" stroke-width="1.5"/>
    <line x1="75" y1="45" x2="145" y2="45" stroke="#475569" stroke-width="1.5"/>
    <line x1="145" y1="45" x2="145" y2="115" stroke="#475569" stroke-width="1.5"/>
    
    <!-- Ions -->
    <circle cx="45" cy="65" r="10" fill="#a855f7"/><text x="45" y="69" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Na⁺</text>
    <circle cx="115" cy="65" r="14" fill="#10b981"/><text x="115" y="69" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Cl⁻</text>
    <circle cx="45" cy="135" r="14" fill="#10b981"/><text x="45" y="139" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Cl⁻</text>
    <circle cx="115" cy="135" r="10" fill="#a855f7"/><text x="115" y="139" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Na⁺</text>
    <circle cx="75" cy="45" r="14" fill="#10b981"/><text x="75" y="49" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Cl⁻</text>
    <circle cx="145" cy="45" r="10" fill="#a855f7"/><text x="145" y="49" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Na⁺</text>
    <circle cx="145" cy="115" r="14" fill="#10b981"/><text x="145" y="119" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Cl⁻</text>
    
    <text x="97" y="170" fill="#94a3b8" font-size="10" text-anchor="middle">Strong electrostatic bonds</text>
    <text x="97" y="185" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">High M.P. / Mobile Ions</text>
    <text x="97" y="200" fill="#cbd5e1" font-size="9" text-anchor="middle">Conducts only molten/aq</text>
  </g>
  
  <!-- Panel 2: Simple Molecular -->
  <g transform="translate(250, 20)">
    <rect width="195" height="220" rx="10" fill="#0f172a" stroke="#ec4899" stroke-dasharray="3 3" stroke-width="1.2"/>
    <text x="97" y="24" fill="#ec4899" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">Simple Molecular (H₂O)</text>
    
    <!-- Molecule 1 -->
    <circle cx="65" cy="80" r="13" fill="#ef4444"/><text x="65" y="84" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">O</text>
    <circle cx="48" cy="100" r="8" fill="#e2e8f0"/><text x="48" y="103" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">H</text>
    <circle cx="82" cy="100" r="8" fill="#e2e8f0"/><text x="82" y="103" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">H</text>
    <line x1="60" y1="88" x2="52" y2="95" stroke="#fff" stroke-width="2"/>
    <line x1="70" y1="88" x2="78" y2="95" stroke="#fff" stroke-width="2"/>

    <!-- Intermolecular force -->
    <path d="M 95 90 Q 115 90 135 90" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4 3"/>
    <text x="115" y="78" fill="#f43f5e" font-size="9" font-weight="bold" text-anchor="middle">Weak IMF</text>
    
    <!-- Molecule 2 -->
    <circle cx="150" cy="90" r="13" fill="#ef4444"/><text x="150" y="94" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">O</text>
    <circle cx="138" cy="110" r="8" fill="#e2e8f0"/><text x="138" y="113" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">H</text>
    <circle cx="166" cy="106" r="8" fill="#e2e8f0"/><text x="166" y="109" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle">H</text>

    <text x="97" y="150" fill="#f87171" font-size="10" font-weight="bold" text-anchor="middle">Covalent bonds STAY intact</text>
    <text x="97" y="170" fill="#94a3b8" font-size="10" text-anchor="middle">Only weak IMF broken</text>
    <text x="97" y="185" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Low M.P. / B.P.</text>
    <text x="97" y="200" fill="#cbd5e1" font-size="9" text-anchor="middle">Electrical Insulator</text>
  </g>
  
  <!-- Panel 3: Giant Covalent (Diamond & Graphite) -->
  <g transform="translate(475, 20)">
    <rect width="200" height="220" rx="10" fill="#0f172a" stroke="#10b981" stroke-dasharray="3 3" stroke-width="1.2"/>
    <text x="100" y="24" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">Giant Macromolecule (C)</text>
    
    <!-- Tetrahedral Diamond Model -->
    <circle cx="100" cy="80" r="10" fill="#64748b"/><text x="100" y="84" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">C</text>
    <circle cx="65" cy="115" r="10" fill="#64748b"/><text x="65" y="119" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">C</text>
    <circle cx="100" cy="125" r="10" fill="#64748b"/><text x="100" y="129" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">C</text>
    <circle cx="135" cy="115" r="10" fill="#64748b"/><text x="135" y="119" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">C</text>
    <circle cx="100" cy="45" r="10" fill="#64748b"/><text x="100" y="49" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">C</text>
    
    <line x1="100" y1="55" x2="100" y2="70" stroke="#94a3b8" stroke-width="2.5"/>
    <line x1="93" y1="87" x2="72" y2="107" stroke="#94a3b8" stroke-width="2.5"/>
    <line x1="100" y1="90" x2="100" y2="115" stroke="#94a3b8" stroke-width="2.5"/>
    <line x1="107" y1="87" x2="128" y2="107" stroke="#94a3b8" stroke-width="2.5"/>
    
    <text x="100" y="165" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">4 Covalent Bonds per C (Diamond)</text>
    <text x="100" y="180" fill="#94a3b8" font-size="10" text-anchor="middle">Rigid 3D tetrahedral structure</text>
    <text x="100" y="195" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">Extremely Hard / High M.P.</text>
    <text x="100" y="210" fill="#cbd5e1" font-size="9" text-anchor="middle">Graphite: 3 bonds + delocalised e⁻</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Ionic vs Covalent vs Metallic Structures',
        points: [
          'Ionic: Transfer of electrons from metal to non-metal. Giant 3D lattice of alternating positive and negative ions held by strong electrostatic attractions. High melting/boiling points. Conducts electricity ONLY when molten or aqueous because ions become mobile.',
          'Simple Covalent: Non-metal atoms sharing pairs of electrons. Strong covalent bonds within molecules, but WEAK intermolecular forces between molecules. Low melting/boiling points (little energy needed to overcome weak intermolecular forces). Non-conductors.',
          'Giant Covalent (Macromolecules): Diamond (each C bonded to 4 carbons in 3D tetrahedral, very hard, insulator); Graphite (each C bonded to 3 carbons in layers with 1 delocalised electron per carbon, conducts electricity, soft/slippery); Silicon(IV) oxide SiO₂ (each Si to 4 O, each O to 2 Si).',
          'Metallic: Lattice of positive metal cations in a sea of delocalised electrons. High melting point, malleable (layers of ions slide over each other), good conductors of heat and electricity.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Ionic Bond',
        definition: 'The strong electrostatic attraction between oppositely charged ions formed by the transfer of one or more electrons.'
      },
      {
        term: 'Covalent Bond',
        definition: 'A chemical bond formed when a pair of electrons is shared between two non-metal atoms.'
      }
    ],
    examinerWarnings: [
      'When explaining why simple molecular substances have low boiling points, NEVER say "covalent bonds are weak"! Covalent bonds are very strong; it is the weak INTERMOLECULAR FORCES between molecules that require little energy to break.',
      'Ionic compounds conduct electricity with mobile IONS, never electrons!'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0620 Theory: Melting Points & Electrical Conductivity Comparison',
        examQuestion: 'Magnesium oxide (MgO) has a melting point of 2852 °C and conducts electricity when molten.\nSulfur dioxide (SO₂) has a melting point of -72 °C and does not conduct electricity in any state.\n(a) Explain, in terms of structure and bonding, the difference in the melting points of MgO and SO₂. [4 marks]\n(b) Explain why MgO conducts electricity when molten but SO₂ does not. [2 marks]',
        totalMarks: 6,
        steps: [
          {
            stepNumber: 1,
            title: 'Identify Structures & Bonding Types',
            working: '\\text{MgO = Giant ionic lattice with strong electrostatic forces between } \\text{Mg}^{2+} \\text{ and } \\text{O}^{2-} \\text{ ions.}\n\\text{SO}_2 = \\text{Simple molecular structure with covalent bonds inside molecules.}',
            markAwarded: '[M1] Method Mark',
            explanation: 'Accurately classify MgO as giant ionic and SO₂ as simple molecular/covalent.'
          },
          {
            stepNumber: 2,
            title: 'Compare Energy Required to Break Bonds vs Intermolecular Forces',
            working: '\\text{MgO: Large amount of thermal energy required to overcome strong electrostatic attractions throughout the 3D lattice.}\n\\text{SO}_2: \\text{Only weak intermolecular forces between molecules require very little thermal energy to separate.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Full marks require mentioning that covalent bonds in SO₂ are NOT broken upon melting; only weak intermolecular attractions are overcome.'
          },
          {
            stepNumber: 3,
            title: 'State Final Melting Point Deduction',
            working: '\\text{Therefore, MgO has an extremely high melting point (2852 °C) while SO}_2 \\text{ has a low melting point (-72 °C).}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Conclude clearly linking the force strength to temperature.'
          },
          {
            stepNumber: 4,
            title: 'Explain Electrical Conductivity Mechanism',
            working: '\\text{Molten MgO has mobile ions (}\\text{Mg}^{2+} \\text{ and } \\text{O}^{2-}\\text{) that are free to move and carry charge.}\n\\text{SO}_2 \\text{ consists of neutral molecules with no free ions or mobile electrons.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Must specify mobile ions for MgO and neutral uncharged molecules for SO₂.'
          }
        ],
        finalAnswer: 'MgO is a giant ionic lattice requiring massive energy to overcome strong ionic bonds. SO₂ is simple molecular with weak intermolecular forces requiring minimal energy. Molten MgO has mobile ions; SO₂ has no charge carriers.',
        examinerCommentary: 'Many candidates wrongly wrote "covalent bonds in sulfur dioxide are weak and easily broken". This is a zero-mark mistake. Covalent bonds are very strong; it is the weak intermolecular forces between molecules that break.'
      }
    ]
  },
  {
    id: 'rev-chem-electrolysis',
    subjectId: 'cie-chem-0620',
    chapter: 'Electrochemistry',
    title: 'Electrolysis of Molten & Aqueous Solutions',
    learningObjectives: [
      'Define electrolysis as the breakdown of an ionic compound by electricity.',
      'Predict the products discharged at the cathode and anode for molten and aqueous electrolytes.',
      'Construct balanced ionic half-equations including state symbols and electron loss/gain.',
      'Explain the industrial electrolysis of brine (concentrated aqueous sodium chloride).'
    ],
    diagramTitle: 'Electrochemical Cell: Ion Migration, Electrode Reactions & PANIC Rule',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0a0f1d" stroke="#1e293b" stroke-width="2"/>
  
  <!-- DC Power Supply -->
  <rect x="270" y="15" width="160" height="40" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="350" y="32" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">D.C. POWER SOURCE</text>
  <text x="290" y="47" fill="#ef4444" font-size="12" font-weight="black" text-anchor="middle">+</text>
  <text x="410" y="47" fill="#38bdf8" font-size="12" font-weight="black" text-anchor="middle">-</text>

  <!-- External Wiring -->
  <path d="M 290 55 L 290 85 L 180 85 L 180 120" stroke="#ef4444" stroke-width="3" fill="none"/>
  <path d="M 410 55 L 410 85 L 520 85 L 520 120" stroke="#38bdf8" stroke-width="3" fill="none"/>
  
  <!-- Electron Flow Indicators -->
  <text x="220" y="78" fill="#fca5a5" font-size="10" font-weight="bold">e⁻ flow ➜</text>
  <text x="450" y="78" fill="#bae6fd" font-size="10" font-weight="bold">➜ e⁻ flow</text>

  <!-- Electrolytic Beaker -->
  <rect x="120" y="110" width="460" height="145" rx="12" fill="#0f172a" stroke="#475569" stroke-width="2"/>
  <!-- Liquid Electrolyte -->
  <rect x="124" y="145" width="452" height="106" rx="8" fill="#0369a1" fill-opacity="0.25"/>
  <text x="350" y="235" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Electrolyte: Concentrated NaCl(aq) [Brine: Na⁺, Cl⁻, H⁺, OH⁻]</text>

  <!-- Left Electrode: ANODE (+) -->
  <rect x="165" y="100" width="30" height="110" rx="4" fill="#334155" stroke="#ef4444" stroke-width="2"/>
  <text x="180" y="94" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">ANODE (+)</text>
  <text x="95" y="165" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">2Cl⁻ ➜ Cl₂(g) + 2e⁻</text>
  <text x="95" y="180" fill="#a7f3d0" font-size="9" text-anchor="middle">Oxidation (Loss of e⁻)</text>
  <text x="95" y="195" fill="#fef08a" font-size="9" text-anchor="middle">Yellow-Green Gas Bubbles</text>
  <!-- Chlorine Bubbles -->
  <circle cx="160" cy="170" r="4" fill="#86efac" fill-opacity="0.8"/>
  <circle cx="155" cy="150" r="5" fill="#86efac" fill-opacity="0.8"/>
  <circle cx="162" cy="135" r="3.5" fill="#86efac" fill-opacity="0.8"/>

  <!-- Right Electrode: CATHODE (-) -->
  <rect x="505" y="100" width="30" height="110" rx="4" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
  <text x="520" y="94" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">CATHODE (-)</text>
  <text x="605" y="165" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">2H⁺ + 2e⁻ ➜ H₂(g)</text>
  <text x="605" y="180" fill="#bae6fd" font-size="9" text-anchor="middle">Reduction (Gain of e⁻)</text>
  <text x="605" y="195" fill="#fef08a" font-size="9" text-anchor="middle">Colourless Gas Bubbles</text>
  <!-- Hydrogen Bubbles -->
  <circle cx="540" cy="175" r="4" fill="#7dd3fc" fill-opacity="0.8"/>
  <circle cx="545" cy="155" r="5" fill="#7dd3fc" fill-opacity="0.8"/>
  <circle cx="538" cy="135" r="3.5" fill="#7dd3fc" fill-opacity="0.8"/>

  <!-- Mnemonic Banner -->
  <rect x="235" y="155" width="230" height="26" rx="6" fill="#1e1b4b" stroke="#818cf8"/>
  <text x="350" y="172" fill="#c7d2fe" font-size="10" font-weight="bold" text-anchor="middle">PANIC: Positive Anode, Negative Is Cathode</text>
</svg>`,
    keyConcepts: [
      {
        heading: 'Predicting Products at Electrodes',
        points: [
          'Cathode (-) attracts cations: In aqueous solution, H⁺ is discharged as H₂(g) UNLESS a less reactive metal is present (Cu, Ag, Au).',
          'Anode (+) attracts anions: In concentrated solution, halide ions (Cl⁻, Br⁻, I⁻) are discharged as halogen gas. If dilute or sulfate/nitrate, OH⁻ is discharged as O₂(g) (4OH⁻ -> O₂ + 2H₂O + 4e⁻).',
          'Molten Lead(II) Bromide: Cathode forms molten lead drops (Pb²⁺ + 2e⁻ -> Pb); Anode forms brown bromine fumes (2Br⁻ -> Br₂ + 2e⁻).',
          'Brine (concentrated NaCl(aq)): Cathode forms H₂ gas; Anode forms Cl₂ gas; solution becomes strongly alkaline NaOH(aq).'
        ],
        formula: '\\text{PANIC: Positive Anode, Negative Is Cathode}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Electrolysis',
        definition: 'The chemical decomposition of an ionic compound, either in molten state or in aqueous solution, by the passage of an electric current.'
      },
      {
        term: 'Electrolyte',
        definition: 'A molten ionic compound or an aqueous solution containing mobile ions that conducts electricity.'
      }
    ],
    examinerWarnings: [
      'Sodium metal is NEVER produced in the electrolysis of aqueous sodium chloride because hydrogen ions (H⁺) are more easily discharged than sodium ions.',
      'Always balance electrons in half-equations: remember diatomic gases (H₂, Cl₂, O₂, Br₂).'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0620 Electrolysis of Concentrated Aqueous Sodium Chloride',
        examQuestion: 'Concentrated aqueous sodium chloride (brine) is electrolysed using inert carbon electrodes.\n(a) Name the gas collected at the cathode and write its half-equation. [2 marks]\n(b) Name the gas collected at the anode and state the observation. [2 marks]\n(c) Name the chemical remaining in solution and explain why it turns red litmus paper blue. [2 marks]',
        totalMarks: 6,
        steps: [
          {
            stepNumber: 1,
            title: 'Cathode Gas & Reduction Half-Equation',
            working: '\\text{Gas: Hydrogen (}\\text{H}_2\\text{)}\\n\\text{Half-equation: } 2\\text{H}^+ + 2e^- \\rightarrow \\text{H}_2',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'H⁺ is lower than Na⁺ in the electrochemical discharge series, so H⁺ gains electrons (reduction) to form hydrogen gas.'
          },
          {
            stepNumber: 2,
            title: 'Anode Gas & Observable Characteristic',
            working: '\\text{Gas: Chlorine (}\\text{Cl}_2\\text{)}\\n\\text{Observation: Pale yellow-green gas bubbles / pungent bleaching odour.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Because the solution is concentrated, halide Cl⁻ ions are discharged preferentially over OH⁻.'
          },
          {
            stepNumber: 3,
            title: 'Residual Solution & Alkaline Property',
            working: '\\text{Remaining compound: Sodium hydroxide (NaOH)}\\n\\text{Reason: As } \\text{H}^+ \\text{ and } \\text{Cl}^- \\text{ are removed, } \\text{Na}^+ \\text{ and } \\text{OH}^- \\text{ remain, making the solution strongly alkaline (pH > 12).}',
            markAwarded: '[B1] Independent Mark',
            explanation: 'The remaining hydroxide ions (OH⁻) turn red litmus blue.'
          }
        ],
        finalAnswer: 'Cathode: Hydrogen gas (2H⁺ + 2e⁻ -> H₂). Anode: Chlorine gas (yellow-green bubbles). Solution: Sodium hydroxide (NaOH), which is alkaline due to excess OH⁻ ions.',
        examinerCommentary: 'Candidates often claim sodium metal is formed at the cathode. Remember that in aqueous solution, reactive metals like Na, K, Ca are never discharged; hydrogen gas is always produced instead.'
      }
    ]
  },
  {
    id: 'rev-chem-rates',
    subjectId: 'cie-chem-0620',
    chapter: 'Physical Chemistry',
    title: 'Reaction Rates, Collision Theory & Equilibrium',
    learningObjectives: [
      'State and explain the effect of concentration, pressure, particle size, catalyst, and temperature on reaction rates.',
      'Explain reaction rates using collision theory and activation energy.',
      'Apply Le Chatelier\'s principle to predict the effect of temperature and pressure on dynamic equilibrium.',
      'Describe the industrial Haber Process and Contact Process conditions.'
    ],
    diagramTitle: 'Maxwell-Boltzmann Energy Distribution & Catalyst Activation Energy Barrier',
    diagramSvg: `<svg viewBox="0 0 700 260" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="260" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Left Graph: Reaction Profile with Catalyst -->
  <g transform="translate(30, 20)">
    <text x="140" y="20" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Exothermic Energy Profile & Catalyst</text>
    <!-- Axes -->
    <line x1="30" y1="200" x2="270" y2="200" stroke="#94a3b8" stroke-width="2"/>
    <line x1="30" y1="200" x2="30" y2="40" stroke="#94a3b8" stroke-width="2"/>
    <text x="260" y="215" fill="#94a3b8" font-size="9">Progress</text>
    <text x="25" y="35" fill="#94a3b8" font-size="9">Energy</text>
    
    <!-- Reactants Level -->
    <line x1="30" y1="120" x2="80" y2="120" stroke="#38bdf8" stroke-width="3"/>
    <text x="55" y="112" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">Reactants</text>
    
    <!-- Products Level -->
    <line x1="220" y1="170" x2="270" y2="170" stroke="#10b981" stroke-width="3"/>
    <text x="245" y="162" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">Products</text>
    
    <!-- Uncatalysed Pathway -->
    <path d="M 80 120 Q 150 20 220 170" stroke="#ef4444" stroke-width="2.5" fill="none"/>
    <text x="150" y="32" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">Ea (Uncatalysed)</text>
    
    <!-- Catalysed Pathway -->
    <path d="M 80 120 Q 150 70 220 170" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4 3" fill="none"/>
    <text x="150" y="80" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">Ea (with Catalyst)</text>
    
    <!-- ΔH indicator -->
    <line x1="245" y1="120" x2="245" y2="170" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 2"/>
    <text x="270" y="145" fill="#f59e0b" font-size="9" font-weight="bold">-ΔH</text>
  </g>

  <!-- Right Graph: Collision Frequency Factors -->
  <g transform="translate(360, 20)">
    <text x="150" y="20" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">The 5 Factors of Reaction Rate</text>
    
    <rect x="20" y="40" width="280" height="32" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <text x="30" y="60" fill="#38bdf8" font-size="10" font-weight="bold">1. Higher Temp:</text>
    <text x="120" y="60" fill="#cbd5e1" font-size="10">Particles faster & Energy ≥ Ea</text>

    <rect x="20" y="80" width="280" height="32" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <text x="30" y="100" fill="#38bdf8" font-size="10" font-weight="bold">2. Concentration:</text>
    <text x="120" y="100" fill="#cbd5e1" font-size="10">More particles per unit volume</text>

    <rect x="20" y="120" width="280" height="32" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <text x="30" y="140" fill="#38bdf8" font-size="10" font-weight="bold">3. Surface Area:</text>
    <text x="120" y="140" fill="#cbd5e1" font-size="10">More exposed collision sites</text>

    <rect x="20" y="160" width="280" height="32" rx="6" fill="#1e293b" stroke="#10b981"/>
    <text x="30" y="180" fill="#10b981" font-size="10" font-weight="bold">4. Catalyst:</text>
    <text x="120" y="180" fill="#cbd5e1" font-size="10">Alternative lower Ea pathway</text>

    <text x="160" y="215" fill="#f87171" font-size="10" font-weight="bold" text-anchor="middle">Examiner Rule: Must write "FREQUENCY of collisions"</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'The 5 Factors Affecting Reaction Rate',
        points: [
          '1. Temperature: Increases kinetic energy so particles move faster, increasing collision frequency. Crucially, a much higher proportion of particles possess energy ≥ activation energy (Ea).',
          '2. Concentration / Pressure: More particles per unit volume, crowded closer together -> higher frequency of successful collisions.',
          '3. Surface Area: Smaller solid particles expose more reactant particles to collisions -> higher collision frequency.',
          '4. Catalyst: Provides an alternative reaction pathway with a lower activation energy (Ea) without being used up chemically.'
        ],
        formula: '\\text{Rate} = \\frac{\\Delta \\text{Amount}}{\\Delta t}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Activation Energy (Ea)',
        definition: 'The minimum amount of energy colliding particles must possess in order for a chemical reaction to take place.'
      },
      {
        term: 'Dynamic Equilibrium',
        definition: 'A state in a closed system where the rates of the forward and reverse reactions are equal, and reactant/product concentrations stay constant.'
      }
    ],
    examinerWarnings: [
      'Never write "there are more collisions". You must write "higher frequency of collisions" or "more collisions per unit time / per second".',
      'A catalyst does NOT change equilibrium yield; it only speeds up reaching equilibrium.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0620 Theory: Collision Theory & Temperature Explanation',
        examQuestion: 'Dilute hydrochloric acid reacts with calcium carbonate chips:\nCaCO₃(s) + 2HCl(aq) -> CaCl₂(aq) + H₂O(l) + CO₂(g)\nExplain, in terms of collision theory, why increasing the temperature from 20 °C to 40 °C doubles the rate of reaction. [3 marks]',
        totalMarks: 3,
        steps: [
          {
            stepNumber: 1,
            title: 'Kinetic Energy & Speed',
            working: '\\text{Particles have greater kinetic energy and move faster, so there is a higher frequency of collisions.}',
            markAwarded: '[M1] Method Mark',
            explanation: 'Must mention frequency of collisions or collisions per second.'
          },
          {
            stepNumber: 2,
            title: 'Activation Energy Threshold',
            working: '\\text{A significantly greater proportion of colliding particles possess energy equal to or exceeding the activation energy (} E_a \\text{).}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'This is the most crucial mark. Simply stating "particles collide harder" earns zero.'
          },
          {
            stepNumber: 3,
            title: 'Successful Collisions Conclusion',
            working: '\\text{Hence, there is a higher frequency of SUCCESSFUL (effective) collisions per unit time.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Final accuracy mark for stating successful collisions occur more frequently.'
          }
        ],
        finalAnswer: 'At 40 °C, particles have more kinetic energy and move faster, leading to a higher collision frequency. Crucially, a much larger fraction of particles have energy ≥ Ea, resulting in a significantly higher frequency of successful collisions.',
        examinerCommentary: 'Candidates frequently lose the highest-weighted mark by omitting the phrase "energy greater than or equal to activation energy (Ea)".'
      }
    ]
  },

  // ==========================================================
  // PHYSICS (CIE 0625 & EDEXCEL 4PH1)
  // ==========================================================
  {
    id: 'rev-phys-forces',
    subjectId: 'cie-physics-0625',
    chapter: 'General Physics',
    title: 'Forces, Motion, Momentum & Terminal Velocity',
    learningObjectives: [
      'Interpret and calculate acceleration from the gradient of a speed-time graph.',
      'Determine the total distance travelled by calculating the area under a speed-time graph.',
      'State Newton\'s laws of motion and solve problems using F = ma and momentum p = mv.',
      'Explain terminal velocity in terms of balanced downward weight and upward drag forces.'
    ],
    diagramTitle: 'Velocity-Time Graph Breakdown & Terminal Velocity Motion Curve',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Left: Velocity-Time Graph Analysis -->
  <g transform="translate(30, 20)">
    <text x="150" y="20" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Velocity-Time Graph Rules</text>
    <!-- Axes -->
    <line x1="40" y1="200" x2="280" y2="200" stroke="#94a3b8" stroke-width="2"/>
    <line x1="40" y1="200" x2="40" y2="35" stroke="#94a3b8" stroke-width="2"/>
    <text x="270" y="215" fill="#94a3b8" font-size="9">Time t (s)</text>
    <text x="30" y="30" fill="#94a3b8" font-size="9">Velocity v (m/s)</text>
    
    <!-- Graph Line -->
    <!-- Acceleration Phase -->
    <line x1="40" y1="200" x2="110" y2="90" stroke="#10b981" stroke-width="3"/>
    <!-- Constant Speed Phase -->
    <line x1="110" y1="90" x2="200" y2="90" stroke="#38bdf8" stroke-width="3"/>
    <!-- Deceleration Phase -->
    <line x1="200" y1="90" x2="260" y2="200" stroke="#ef4444" stroke-width="3"/>
    
    <!-- Shaded Area Under Graph -->
    <polygon points="40,200 110,90 200,90 260,200" fill="#38bdf8" fill-opacity="0.12"/>
    <text x="150" y="150" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Area = Distance Travelled (m)</text>
    
    <!-- Annotations -->
    <text x="65" y="130" fill="#10b981" font-size="9" font-weight="bold">Slope = Accel</text>
    <text x="155" y="80" fill="#38bdf8" font-size="9" font-weight="bold">Zero Accel (Constant v)</text>
    <text x="235" y="130" fill="#ef4444" font-size="9" font-weight="bold">Deceleration</text>
  </g>

  <!-- Right: Terminal Velocity Curve -->
  <g transform="translate(370, 20)">
    <text x="140" y="20" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">Skydiver Terminal Velocity Curve</text>
    <line x1="30" y1="200" x2="270" y2="200" stroke="#94a3b8" stroke-width="2"/>
    <line x1="30" y1="200" x2="30" y2="35" stroke="#94a3b8" stroke-width="2"/>
    
    <!-- Skydiver curve -->
    <!-- Initial steep climb curving to 1st terminal velocity -->
    <path d="M 30 200 Q 60 85 140 85 L 170 85" stroke="#f59e0b" stroke-width="3" fill="none"/>
    <!-- Parachute opens: sharp drop -->
    <path d="M 170 85 L 185 160 L 250 160" stroke="#ec4899" stroke-width="3" fill="none"/>
    
    <!-- Asymptote lines -->
    <line x1="30" y1="85" x2="170" y2="85" stroke="#f59e0b" stroke-dasharray="3 3"/>
    <text x="140" y="75" fill="#f59e0b" font-size="9" font-weight="bold">1st Terminal Velocity (~55 m/s)</text>
    <text x="140" y="100" fill="#cbd5e1" font-size="8">Weight = Air Resistance</text>

    <text x="195" y="135" fill="#f43f5e" font-size="8" font-weight="bold">Parachute opens</text>
    <text x="215" y="175" fill="#ec4899" font-size="9" font-weight="bold">2nd Terminal Velocity (~5 m/s)</text>

    <!-- Force vector box -->
    <rect x="50" y="140" width="90" height="45" rx="6" fill="#1e293b" stroke="#64748b"/>
    <text x="95" y="155" fill="#38bdf8" font-size="8" text-anchor="middle">↑ Air Resistance</text>
    <circle cx="95" cy="162" r="3" fill="#fff"/>
    <text x="95" y="178" fill="#10b981" font-size="8" text-anchor="middle">↓ Downward Weight</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Kinematics & Newton\'s Laws',
        points: [
          'Velocity-Time Graphs: Slope (gradient) = Acceleration. Total Area under graph = Distance travelled.',
          'Newton\'s 1st Law: An object continues at constant velocity unless acted upon by a resultant force.',
          'Newton\'s 2nd Law: F = m × a. Resultant force causes acceleration in the direction of the force.',
          'Momentum: p = m × v. Total momentum is conserved in collisions in an isolated system.',
          'Terminal Velocity: Falling body accelerates until upward air resistance equals downward weight. Resultant force = 0 -> acceleration = 0 -> constant terminal velocity.'
        ],
        formula: 'F = ma, \\quad p = mv, \\quad \\text{Impulse} = F\\Delta t = \\Delta p'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Acceleration',
        definition: 'The rate of change of velocity per unit time: a = (v - u) / t (measured in m/s²).'
      },
      {
        term: 'Terminal Velocity',
        definition: 'The constant maximum velocity reached by a falling object when the upward resistive force equals the downward gravitational force (zero resultant force).'
      }
    ],
    examinerWarnings: [
      'Distinguish mass (scalar quantity of matter, kg) from weight (gravitational force, W = mg, Newtons). Mass never changes on other planets!',
      'When calculating distance from a velocity-time graph, divide the area into rectangles and triangles.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0625 Paper 4: Velocity-Time Graph & Resultant Force Calculation',
        examQuestion: 'A car of mass 1200 kg accelerates uniformly from rest to 24 m/s in 8.0 s, travels at constant speed for 20 s, and then decelerates uniformly to rest in 4.0 s.\n(a) Calculate the acceleration of the car during the first 8.0 s. [2 marks]\n(b) Calculate the total distance travelled by the car during the 32 s journey. [3 marks]\n(c) Calculate the braking resultant force required to decelerate the car to rest in 4.0 s. [2 marks]',
        totalMarks: 7,
        steps: [
          {
            stepNumber: 1,
            title: 'Acceleration Calculation',
            working: 'a = \\frac{v - u}{t} = \\frac{24 - 0}{8.0} = 3.0 \\text{ m/s}^2',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Method mark for substituting into a = (v-u)/t; accuracy mark for 3.0 m/s² with correct unit.'
          },
          {
            stepNumber: 2,
            title: 'Distance Travelled from Area of Trapezium',
            working: '\\text{Area} = \\frac{1}{2}(a + b)h = \\frac{1}{2}(20 + 32) \\times 24 = \\frac{1}{2}(52) \\times 24 = 624 \\text{ m}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Alternatively split into Triangle 1 (0.5*8*24 = 96m), Rectangle (20*24 = 480m), and Triangle 2 (0.5*4*24 = 48m) = 624 m.'
          },
          {
            stepNumber: 3,
            title: 'Braking Resultant Force',
            working: 'a_{\\text{brake}} = \\frac{0 - 24}{4.0} = -6.0 \\text{ m/s}^2\\nF = ma = 1200 \\times (-6.0) = -7200 \\text{ N} \\quad (\\text{Braking Force} = 7200 \\text{ N})',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Using F = ma with the deceleration value.'
          }
        ],
        finalAnswer: '(a) Acceleration = 3.0 m/s². (b) Total distance = 624 m. (c) Braking force = 7200 N in opposite direction to motion.',
        examinerCommentary: 'Candidates often confuse time intervals and subtract incorrectly when determining the top base b (28 - 8 = 20 s). Always double check the flat section length.'
      }
    ]
  },
  {
    id: 'rev-phys-circuits',
    subjectId: 'cie-physics-0625',
    chapter: 'Electricity and Magnetism',
    title: 'Circuits, Ohm\'s Law, Potential Dividers & Transformers',
    learningObjectives: [
      'Apply Ohm\'s law V = IR and understand series/parallel rules for current and potential difference.',
      'Explain the operation of potential dividers and sensor components (LDRs, thermistors).',
      'Solve transformer equations relating primary and secondary voltage, turns, and current.'
    ],
    diagramTitle: 'Potential Divider Circuit & Step-Up / Step-Down Transformer Blueprint',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Left: Potential Divider Circuit -->
  <g transform="translate(30, 20)">
    <text x="140" y="20" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Potential Divider Circuit</text>
    
    <!-- Power Rails -->
    <line x1="60" y1="45" x2="160" y2="45" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="175" y="49" fill="#38bdf8" font-size="11" font-weight="bold">Vin (+12V)</text>
    
    <!-- Wire down -->
    <line x1="110" y1="45" x2="110" y2="65" stroke="#94a3b8" stroke-width="2"/>
    
    <!-- Resistor R1 -->
    <rect x="95" y="65" width="30" height="40" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="110" y="90" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">R₁</text>
    
    <line x1="110" y1="105" x2="110" y2="135" stroke="#94a3b8" stroke-width="2"/>
    
    <!-- Middle Tap for Vout -->
    <line x1="110" y1="120" x2="200" y2="120" stroke="#10b981" stroke-width="2"/>
    <circle cx="205" cy="120" r="4" fill="#10b981"/>
    <text x="215" y="124" fill="#10b981" font-size="11" font-weight="bold">Vout</text>
    
    <!-- Sensor R2 (Thermistor / LDR) -->
    <rect x="95" y="135" width="30" height="40" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <line x1="90" y1="180" x2="130" y2="130" stroke="#f59e0b" stroke-width="2"/>
    <text x="110" y="160" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">R₂</text>
    
    <line x1="110" y1="175" x2="110" y2="200" stroke="#94a3b8" stroke-width="2"/>
    <line x1="60" y1="200" x2="160" y2="200" stroke="#94a3b8" stroke-width="2.5"/>
    <text x="175" y="204" fill="#94a3b8" font-size="11" font-weight="bold">0V (GND)</text>

    <!-- Formula Box -->
    <rect x="40" y="215" width="220" height="30" rx="6" fill="#0f172a" stroke="#38bdf8"/>
    <text x="150" y="234" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Vout = Vin × [ R₂ / (R₁ + R₂) ]</text>
  </g>

  <!-- Right: Transformer Core -->
  <g transform="translate(370, 20)">
    <text x="140" y="20" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">Step-Up / Step-Down Transformer</text>
    
    <!-- Soft Iron Core -->
    <rect x="50" y="50" width="180" height="130" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
    <rect x="85" y="75" width="110" height="80" rx="4" fill="#0b1120" stroke="#64748b" stroke-width="1.5"/>
    <text x="140" y="118" fill="#64748b" font-size="10" text-anchor="middle">Laminated</text>
    <text x="140" y="132" fill="#64748b" font-size="10" text-anchor="middle">Iron Core</text>

    <!-- Primary Coils (Left) -->
    <path d="M 40 70 Q 55 75 40 85 Q 55 90 40 100 Q 55 105 40 115" stroke="#ef4444" stroke-width="4" fill="none"/>
    <text x="25" y="95" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="end">Np (Primary)</text>
    <text x="25" y="110" fill="#ef4444" font-size="9" text-anchor="end">Vp (A.C. In)</text>

    <!-- Secondary Coils (Right) -->
    <path d="M 240 60 Q 225 65 240 75 Q 225 80 240 90 Q 225 95 240 105 Q 225 110 240 120 Q 225 125 240 135" stroke="#10b981" stroke-width="4" fill="none"/>
    <text x="255" y="95" fill="#10b981" font-size="10" font-weight="bold">Ns (Secondary)</text>
    <text x="255" y="110" fill="#10b981" font-size="9">Vs (Output)</text>

    <!-- Transformer Equations -->
    <rect x="25" y="195" width="240" height="48" rx="6" fill="#0f172a" stroke="#f59e0b"/>
    <text x="145" y="214" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">Vp / Vs = Np / Ns</text>
    <text x="145" y="232" fill="#e2e8f0" font-size="10" text-anchor="middle">100% Efficiency: Vp × Ip = Vs × Is</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Circuit Rules & Components',
        points: [
          'Current (I = Q/t, Amps): Series current is identical everywhere. Parallel current divides across branches.',
          'Voltage (V = W/Q, Volts): Series voltage is shared across components. Parallel voltage across each branch equals source voltage.',
          'Resistance: Series R_total = R₁ + R₂. Parallel 1/R_total = 1/R₁ + 1/R₂.',
          'Sensors: LDR resistance decreases in light. Thermistor resistance decreases when temperature increases (TURD rule).'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Electromotive Force (e.m.f.)',
        definition: 'The electrical energy transferred by a source per unit charge in driving charge around a complete circuit (measured in Volts, J/C).'
      },
      {
        term: 'Potential Difference (p.d.)',
        definition: 'The electrical energy transferred per unit charge when charge flows between two points in a circuit.'
      }
    ],
    examinerWarnings: [
      'Transformers only function with ALTERNATING CURRENT (A.C.)! Direct current (D.C.) produces a constant magnetic field, so no e.m.f. is induced.',
      'Ammeters must always be connected in series (low internal resistance); voltmeters must always be connected in parallel (high internal resistance).'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0625 Electricity: Step-Up Transformer & Long-Distance Power Transmission',
        examQuestion: 'A power station generates electricity at 25 kV and transmits 600 MW of power along transmission lines at 400 kV using a step-up transformer.\n(a) Calculate the turns ratio Np / Ns of the transformer. [2 marks]\n(b) Calculate the current in the 400 kV transmission cables. [2 marks]\n(c) Explain why stepped-up voltage reduces thermal energy losses in transmission lines. [3 marks]',
        totalMarks: 7,
        steps: [
          {
            stepNumber: 1,
            title: 'Transformer Turns Ratio',
            working: '\\frac{N_p}{N_s} = \\frac{V_p}{V_s} = \\frac{25\\text{ kV}}{400\\text{ kV}} = \\frac{25,000}{400,000} = \\frac{1}{16} \\quad (1:16)',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Method mark for ratio formula Vp/Vs = Np/Ns; accuracy mark for 1:16 or 0.0625.'
          },
          {
            stepNumber: 2,
            title: 'Transmission Current Calculation',
            working: 'P = VI \\implies I = \\frac{P}{V} = \\frac{600 \\times 10^6 \\text{ W}}{400 \\times 10^3 \\text{ V}} = 1500 \\text{ A}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Substituting megawatts (10^6) and kilovolts (10^3) gives 1500 A.'
          },
          {
            stepNumber: 3,
            title: 'Explain Thermal Power Loss Reduction',
            working: '\\text{Power loss in cables is given by } P_{\\text{loss}} = I^2 R.\\n\\text{Stepping up voltage decreases the transmission current } I.\\n\\text{Because loss depends on } I^2, \\text{ lower current massively reduces power wasted as heat in the cable resistance.}',
            markAwarded: '[B1] Independent Mark',
            explanation: '3 points: P = I²R stated, lower current when voltage stepped up, lower thermal power wasted.'
          }
        ],
        finalAnswer: '(a) Turns ratio Np:Ns = 1:16. (b) Transmission cable current = 1500 A. (c) High voltage reduces current; since thermal power loss P = I²R, smaller current significantly minimizes wasted energy.',
        examinerCommentary: 'Candidates frequently state "high voltage pushes the current faster". This is incorrect physics. Higher voltage means lower current for the same power (P = IV), which directly minimizes I²R heating losses.'
      }
    ]
  },

  // ==========================================================
  // BIOLOGY (CIE 0610 & EDEXCEL 4BI1)
  // ==========================================================
  {
    id: 'rev-bio-cells',
    subjectId: 'cie-bio-0610',
    chapter: 'Cell Biology & Movement',
    title: 'Cell Structure, Diffusion, Osmosis & Active Transport',
    learningObjectives: [
      'Identify and describe the structures of plant and animal cells under an electron microscope.',
      'Explain the significance of chloroplasts, cellulose cell walls, and vacuoles in plant cells.',
      'Define diffusion, osmosis, and active transport with physiological examples.',
      'Describe the effects of water potential on plant turgor and animal red blood cell lysis.'
    ],
    diagramTitle: 'Ultrastructure: Plant Cell vs Animal Cell Labeled Organelle Blueprint',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Left: Plant Cell -->
  <g transform="translate(30, 20)">
    <text x="140" y="20" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">Eukaryotic Plant Cell</text>
    
    <!-- Outer Cell Wall (Thick green) -->
    <rect x="30" y="35" width="220" height="180" rx="14" fill="#064e3b" fill-opacity="0.2" stroke="#10b981" stroke-width="4"/>
    <!-- Cell Membrane (Inner line) -->
    <rect x="37" y="42" width="206" height="166" rx="10" fill="#022c22" fill-opacity="0.4" stroke="#34d399" stroke-width="1.5"/>

    <!-- Large Central Permanent Vacuole -->
    <path d="M 80 80 Q 150 70 190 90 Q 210 140 180 180 Q 100 190 70 150 Z" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="140" y="135" fill="#bae6fd" font-size="10" font-weight="bold" text-anchor="middle">Large Vacuole</text>
    <text x="140" y="148" fill="#7dd3fc" font-size="8" text-anchor="middle">(Cell Sap & Turgor)</text>

    <!-- Nucleus -->
    <circle cx="70" cy="75" r="18" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
    <circle cx="70" cy="75" r="6" fill="#c7d2fe"/>
    <text x="70" y="103" fill="#c7d2fe" font-size="8" text-anchor="middle">Nucleus</text>

    <!-- Chloroplasts -->
    <ellipse cx="180" cy="65" rx="14" ry="8" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/>
    <ellipse cx="205" cy="115" rx="14" ry="8" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/>
    <ellipse cx="60" cy="170" rx="14" ry="8" fill="#15803d" stroke="#4ade80" stroke-width="1.5"/>

    <!-- Labels -->
    <text x="140" y="235" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">Cell Wall + Chloroplasts + Vacuole</text>
  </g>

  <!-- Right: Animal Cell -->
  <g transform="translate(370, 20)">
    <text x="140" y="20" fill="#ec4899" font-size="12" font-weight="bold" text-anchor="middle">Eukaryotic Animal Cell</text>
    
    <!-- Irregular Cell Membrane -->
    <path d="M 50 110 C 40 60 100 35 160 45 C 220 55 250 100 240 160 C 230 210 160 220 100 210 C 50 200 60 150 50 110 Z" fill="#831843" fill-opacity="0.15" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="50" y="35" fill="#f43f5e" font-size="9">Cell Membrane</text>

    <!-- Nucleus -->
    <circle cx="145" cy="125" r="22" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
    <circle cx="145" cy="125" r="8" fill="#c7d2fe"/>
    <text x="145" y="157" fill="#c7d2fe" font-size="9" text-anchor="middle">Nucleus (DNA)</text>

    <!-- Mitochondria -->
    <ellipse cx="90" cy="85" rx="12" ry="7" fill="#b45309" stroke="#fbbf24" stroke-width="1.5"/>
    <ellipse cx="195" cy="175" rx="12" ry="7" fill="#b45309" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="90" y="103" fill="#fef08a" font-size="8" text-anchor="middle">Mitochondria</text>

    <!-- Ribosomes -->
    <circle cx="105" cy="150" r="2" fill="#e2e8f0"/>
    <circle cx="180" cy="90" r="2" fill="#e2e8f0"/>
    <circle cx="170" cy="70" r="2" fill="#e2e8f0"/>
    <text x="195" y="80" fill="#cbd5e1" font-size="8">Ribosomes</text>

    <!-- Callout Box -->
    <rect x="40" y="222" width="210" height="24" rx="5" fill="#1e293b" stroke="#f43f5e"/>
    <text x="145" y="238" fill="#fca5a5" font-size="9" font-weight="bold" text-anchor="middle">NO Cell Wall • NO Chloroplasts • NO Vacuole</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Transport Mechanisms',
        points: [
          'Diffusion: Passive net movement of particles from high to low concentration down a concentration gradient.',
          'Osmosis: Passive net movement of water molecules from high water potential (dilute) to low water potential (concentrated) through a partially permeable membrane.',
          'Active Transport: Movement of particles across a cell membrane against a concentration gradient using energy from respiration and carrier proteins.',
          'Plant Cell in pure water: Becomes turgid (cell wall prevents bursting). In concentrated solution: Becomes flaccid / plasmolysed.',
          'Animal Cell in pure water: Swells and bursts (lysis) due to absence of cell wall.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Osmosis',
        definition: 'The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.'
      },
      {
        term: 'Active Transport',
        definition: 'The movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration using energy from respiration.'
      }
    ],
    examinerWarnings: [
      'Do not say "water moves from low concentration of water to high concentration". Always use "higher water potential to lower water potential".',
      'Enzymes are protein molecules that denature at high temperatures; they never "die".'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0610 Practical/Theory: Potato Cylinder Osmosis Investigation',
        examQuestion: 'Potato cylinders of initial mass 4.00 g were placed in varying concentrations of sucrose solution for 2 hours.\nIn 0.0 mol/dm³ sucrose, the final mass was 4.60 g.\nIn 0.8 mol/dm³ sucrose, the final mass was 3.40 g.\n(a) Calculate the percentage change in mass of the potato in 0.0 mol/dm³ sucrose. [2 marks]\n(b) Explain, in terms of water potential, the mass gain in 0.0 mol/dm³ sucrose solution. [3 marks]\n(c) State what will happen to human red blood cells placed in 0.0 mol/dm³ solution and explain why. [2 marks]',
        totalMarks: 7,
        steps: [
          {
            stepNumber: 1,
            title: 'Percentage Mass Change Calculation',
            working: '\\% \\Delta m = \\frac{\\text{Final} - \\text{Initial}}{\\text{Initial}} \\times 100 = \\frac{4.60 - 4.00}{4.00} \\times 100 = +15.0\\%',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Method mark for (change/initial)*100; accuracy mark for +15.0%.'
          },
          {
            stepNumber: 2,
            title: 'Water Potential Gradient Explanation',
            working: '\\text{Pure water has a higher water potential than the potato cell cytoplasm.}\n\\text{Water enters cells by osmosis across the partially permeable cell membrane.}\n\\text{Turgor pressure increases as the vacuole expands, pushing against the rigid cell wall.}',
            markAwarded: '[B1] Independent Mark',
            explanation: 'Must mention higher water potential outside, movement by osmosis, and partially permeable membrane.'
          },
          {
            stepNumber: 3,
            title: 'Red Blood Cell Response (Lysis)',
            working: '\\text{Red blood cells swell and burst (undergo lysis).}\n\\text{Unlike plant cells, animal cells lack a rigid cellulose cell wall to resist internal osmotic pressure.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Identify bursting/lysis due to absence of cell wall.'
          }
        ],
        finalAnswer: '(a) +15.0% change in mass. (b) Water moves into potato cells by osmosis down a water potential gradient from high (pure water) to low (cytoplasm) across a partially permeable membrane. (c) Red blood cells swell and burst (lysis) because they lack a rigid cellulose cell wall.',
        examinerCommentary: 'Candidates losing marks here often write "water moves from a dilute to concentrated concentration of water". Cambridge mark schemes require the exact term "higher water potential to lower water potential".'
      }
    ]
  },

  // ==========================================================
  // MATHEMATICS (CIE 0580 & EDEXCEL 4MA1)
  // ==========================================================
  {
    id: 'rev-math-geometry',
    subjectId: 'cie-math-0580',
    chapter: 'Geometry, Measure & Trigonometry',
    title: 'Circle Theorems, Trigonometry & Mensuration Guide',
    learningObjectives: [
      'State and apply the 7 circle theorems quoting full geometric reasons.',
      'Use sine and cosine rules to calculate unknown lengths and angles in non-right-angled triangles.',
      'Calculate arc lengths, sector areas, and volume of cones, spheres, and pyramids.'
    ],
    diagramTitle: 'Visual Summary: The 4 High-Yield Cambridge Circle Theorems',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Theorem 1: Angle at Centre = 2 * Angle at Circumference -->
  <g transform="translate(25, 20)">
    <rect width="145" height="225" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="72" y="20" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">1. Angle at Centre</text>
    <circle cx="72" cy="95" r="50" stroke="#64748b" stroke-width="1.5" fill="none"/>
    <circle cx="72" cy="95" r="3" fill="#38bdf8"/>
    
    <!-- Lines to circumference & centre -->
    <line x1="37" y1="130" x2="72" y2="95" stroke="#38bdf8" stroke-width="2"/>
    <line x1="107" y1="130" x2="72" y2="95" stroke="#38bdf8" stroke-width="2"/>
    <line x1="37" y1="130" x2="72" y2="45" stroke="#10b981" stroke-width="2"/>
    <line x1="107" y1="130" x2="72" y2="45" stroke="#10b981" stroke-width="2"/>
    
    <text x="72" y="85" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">2x</text>
    <text x="72" y="60" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">x</text>
    <text x="72" y="175" fill="#cbd5e1" font-size="9" text-anchor="middle">Angle at centre is</text>
    <text x="72" y="190" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">TWICE angle at</text>
    <text x="72" y="205" fill="#cbd5e1" font-size="9" text-anchor="middle">circumference</text>
  </g>

  <!-- Theorem 2: Angle in Semicircle = 90° -->
  <g transform="translate(190, 20)">
    <rect width="145" height="225" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="1.2"/>
    <text x="72" y="20" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">2. Semicircle</text>
    <circle cx="72" cy="95" r="50" stroke="#64748b" stroke-width="1.5" fill="none"/>
    
    <!-- Diameter -->
    <line x1="22" y1="95" x2="122" y2="95" stroke="#f59e0b" stroke-width="2.5"/>
    <circle cx="72" cy="95" r="3" fill="#f59e0b"/>
    <line x1="22" y1="95" x2="72" y2="45" stroke="#10b981" stroke-width="2"/>
    <line x1="122" y1="95" x2="72" y2="45" stroke="#10b981" stroke-width="2"/>
    
    <!-- Right angle box -->
    <rect x="68" y="47" width="8" height="8" fill="none" stroke="#10b981" stroke-width="1.5"/>
    <text x="72" y="38" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">90°</text>
    
    <text x="72" y="175" fill="#cbd5e1" font-size="9" text-anchor="middle">Angle in a semicircle</text>
    <text x="72" y="190" fill="#10b981" font-size="9" font-weight="bold" text-anchor="middle">is ALWAYS 90°</text>
    <text x="72" y="205" fill="#f59e0b" font-size="9" text-anchor="middle">(subtends diameter)</text>
  </g>

  <!-- Theorem 3: Cyclic Quadrilateral -->
  <g transform="translate(355, 20)">
    <rect width="155" height="225" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="77" y="20" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">3. Cyclic Quad</text>
    <circle cx="77" cy="95" r="50" stroke="#64748b" stroke-width="1.5" fill="none"/>
    
    <!-- 4 vertices -->
    <polygon points="50,55 110,60 120,120 40,115" stroke="#f59e0b" stroke-width="2" fill="#f59e0b" fill-opacity="0.1"/>
    <text x="56" y="70" fill="#38bdf8" font-size="9" font-weight="bold">a</text>
    <text x="110" y="115" fill="#38bdf8" font-size="9" font-weight="bold">c</text>
    <text x="100" y="75" fill="#10b981" font-size="9" font-weight="bold">b</text>
    <text x="50" y="110" fill="#10b981" font-size="9" font-weight="bold">d</text>
    
    <text x="77" y="170" fill="#cbd5e1" font-size="9" text-anchor="middle">Opposite angles</text>
    <text x="77" y="185" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">a + c = 180°</text>
    <text x="77" y="200" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">b + d = 180°</text>
  </g>

  <!-- Theorem 4: Tangent and Radius -->
  <g transform="translate(530, 20)">
    <rect width="145" height="225" rx="8" fill="#0f172a" stroke="#ec4899" stroke-width="1.2"/>
    <text x="72" y="20" fill="#ec4899" font-size="10" font-weight="bold" text-anchor="middle">4. Tangent & Radius</text>
    <circle cx="72" cy="85" r="45" stroke="#64748b" stroke-width="1.5" fill="none"/>
    <circle cx="72" cy="85" r="3" fill="#ec4899"/>
    
    <!-- Radius down -->
    <line x1="72" y1="85" x2="72" y2="130" stroke="#ec4899" stroke-width="2.5"/>
    <!-- Tangent line horizontal -->
    <line x1="15" y1="130" x2="130" y2="130" stroke="#f43f5e" stroke-width="2.5"/>
    <rect x="72" y="122" width="8" height="8" fill="none" stroke="#ec4899" stroke-width="1.5"/>
    
    <text x="72" y="175" fill="#cbd5e1" font-size="9" text-anchor="middle">Radius meets tangent</text>
    <text x="72" y="190" fill="#ec4899" font-size="10" font-weight="bold" text-anchor="middle">at 90° (Right Angle)</text>
    <text x="72" y="205" fill="#cbd5e1" font-size="8" text-anchor="middle">Tangents from point equal</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'The 7 Circle Theorems & Exact Reasons',
        points: [
          '1. Angle in a semicircle is a right angle (90°).',
          '2. Angle at centre is TWICE angle at circumference subtended by the same arc.',
          '3. Angles in the same segment subtended by the same arc are equal ("bow-tie rule").',
          '4. Opposite angles of a cyclic quadrilateral add up to 180°.',
          '5. Angle between a radius and a tangent is 90°.',
          '6. Tangents from an external point to a circle are equal in length.',
          '7. Alternate Segment Theorem: Angle between tangent and chord equals the angle in the alternate segment.'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Cyclic Quadrilateral',
        definition: 'A four-sided polygon where all four vertices lie on the circumference of the same circle.'
      },
      {
        term: 'Alternate Segment Theorem',
        definition: 'The theorem stating that the angle between a tangent and a chord through the point of contact equals the angle subtended by the chord in the alternate segment.'
      }
    ],
    examinerWarnings: [
      'You must state the theorem reason in words to earn the B1 mark (e.g. "angle at centre is twice angle at circumference").',
      'Make sure your scientific calculator is set to DEGREES (DEG), not RADIANS (RAD).'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0580 Paper 4: Circle Theorems & Multi-Step Angle Reasons',
        examQuestion: 'Points A, B, C, and D lie on the circumference of a circle with centre O.\nAT is a tangent to the circle at point A.\nAngle BAC = 38° and angle AOC = 114°.\n(a) Find angle ADC and give a geometric reason for your answer. [2 marks]\n(b) Find angle BAT and state the theorem used. [2 marks]',
        totalMarks: 4,
        steps: [
          {
            stepNumber: 1,
            title: 'Calculate Angle ADC using Centre Theorem & Cyclic Quad',
            working: '\\text{Angle at circumference } \\angle ABC = \\frac{1}{2} \\angle AOC = \\frac{114^\\circ}{2} = 57^\\circ\\n\\angle ADC = 180^\\circ - 57^\\circ = 123^\\circ',
            markAwarded: '[M1] Method Mark',
            explanation: 'First find angle ABC using "angle at centre is twice angle at circumference", then opposite angles of cyclic quadrilateral ABCD add to 180°.'
          },
          {
            stepNumber: 2,
            title: 'Quote Official Geometric Reason',
            working: '\\text{Reason: Opposite angles of a cyclic quadrilateral sum to } 180^\\circ.',
            markAwarded: '[B1] Independent Mark',
            explanation: 'The B1 mark is awarded specifically for the written geometric reason.'
          },
          {
            stepNumber: 3,
            title: 'Angle BAT using Alternate Segment Theorem',
            working: '\\angle BAT = \\angle BCA \\quad \\text{or by radius-tangent: }\\n\\angle OAB = 90^\\circ - \\dots \\implies \\angle BAT = 57^\\circ',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'By the Alternate Segment Theorem, the angle between the tangent AT and chord AB equals the angle in the alternate segment.'
          }
        ],
        finalAnswer: '(a) Angle ADC = 123° (Opposite angles of a cyclic quadrilateral add up to 180°). (b) Angle BAT = 57° (Alternate segment theorem).',
        examinerCommentary: 'Many candidates lose the reasoning mark by writing informal jargon like "circle rule" or "quad rule". You must write "opposite angles of a cyclic quadrilateral add to 180°" verbatim.'
      }
    ]
  },

  // ==========================================================
  // ENGLISH AS A SECOND LANGUAGE (CIE 0510 / EDEXCEL 4ES1)
  // ==========================================================
  {
    id: 'rev-esl-all',
    subjectId: 'cie-esl-0510',
    chapter: 'Reading and Writing Paper (Exercises 1-6)',
    title: 'Complete Exam Guide: Summary, Informal Email & Formal Article',
    learningObjectives: [
      'Master Exercise 4 Summary writing within the strict 100-120 word boundary.',
      'Paraphrase text ideas using synonyms and varied syntax without whole-clause lifting.',
      'Adopt authentic informal register in Exercise 5 and formal journalistic register in Exercise 6.'
    ],
    diagramTitle: 'Cambridge IGCSE Exercise 4 Summary Architecture & 100-120 Word Constraint',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Step 1: Opening Thesis -->
  <g transform="translate(30, 25)">
    <rect width="145" height="150" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="72" y="24" fill="#c7d2fe" font-size="11" font-weight="bold" text-anchor="middle">1. Hook & Topic</text>
    <text x="72" y="55" fill="#a5b4fc" font-size="10" text-anchor="middle">~15 Words</text>
    <text x="72" y="75" fill="#e0e7ff" font-size="9" text-anchor="middle">Direct introductory</text>
    <text x="72" y="90" fill="#e0e7ff" font-size="9" text-anchor="middle">clause outlining</text>
    <text x="72" y="105" fill="#e0e7ff" font-size="9" text-anchor="middle">both aspects.</text>
    <rect x="15" y="120" width="115" height="20" rx="4" fill="#312e81"/>
    <text x="72" y="134" fill="#818cf8" font-size="8" font-weight="bold" text-anchor="middle">NO personal opinion</text>
  </g>

  <!-- Step 2: Aspect 1 Points -->
  <g transform="translate(195, 25)">
    <rect width="145" height="150" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="72" y="24" fill="#a7f3d0" font-size="11" font-weight="bold" text-anchor="middle">2. Aspect 1 (Benefits)</text>
    <text x="72" y="55" fill="#6ee7b7" font-size="10" text-anchor="middle">~40 Words (3-4 pts)</text>
    <text x="72" y="80" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 1</text>
    <text x="72" y="95" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 2</text>
    <text x="72" y="110" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 3</text>
    <text x="72" y="135" fill="#34d399" font-size="8" font-weight="bold" text-anchor="middle">Linkers: In addition, Moreover</text>
  </g>

  <!-- Step 3: Transition & Aspect 2 -->
  <g transform="translate(360, 25)">
    <rect width="145" height="150" rx="8" fill="#701a75" stroke="#f472b6" stroke-width="1.5"/>
    <text x="72" y="24" fill="#fbcfe8" font-size="11" font-weight="bold" text-anchor="middle">3. Aspect 2 (Problems)</text>
    <text x="72" y="55" fill="#f472b6" font-size="10" text-anchor="middle">~45 Words (3-4 pts)</text>
    <text x="72" y="80" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 4</text>
    <text x="72" y="95" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 5</text>
    <text x="72" y="110" fill="#e2e8f0" font-size="9" text-anchor="middle">• Paraphrased point 6</text>
    <text x="72" y="135" fill="#f472b6" font-size="8" font-weight="bold" text-anchor="middle">Linkers: Conversely, However</text>
  </g>

  <!-- Step 4: Conclusion & Synthesis -->
  <g transform="translate(525, 25)">
    <rect width="145" height="150" rx="8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="72" y="24" fill="#bae6fd" font-size="11" font-weight="bold" text-anchor="middle">4. Final Wrap-up</text>
    <text x="72" y="55" fill="#38bdf8" font-size="10" text-anchor="middle">~15 Words</text>
    <text x="72" y="80" fill="#e2e8f0" font-size="9" text-anchor="middle">Single cohesive</text>
    <text x="72" y="95" fill="#e2e8f0" font-size="9" text-anchor="middle">closing statement.</text>
    <text x="72" y="115" fill="#e2e8f0" font-size="9" text-anchor="middle">Ensures seamless</text>
    <text x="72" y="135" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="middle">flow without lifting</text>
  </g>

  <!-- Word Count Meter Bar -->
  <g transform="translate(30, 195)">
    <rect width="640" height="50" rx="8" fill="#0f172a" stroke="#334155"/>
    <rect x="220" y="8" width="200" height="34" rx="6" fill="#059669" fill-opacity="0.3" stroke="#10b981"/>
    <text x="110" y="29" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">&lt; 100 Words: Penalty</text>
    <text x="320" y="29" fill="#34d399" font-size="11" font-weight="black" text-anchor="middle">★ OPTIMAL ZONE: 100 - 120 WORDS ★</text>
    <text x="530" y="29" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">&gt; 120 Words: Examiner stops reading</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'Exercise 4: Summary Writing (100-120 words)',
        points: [
          'Underline the two demanded aspects (e.g. positive impacts AND challenges).',
          'Find 4 distinct points for Aspect 1 and 4 points for Aspect 2 in the reading text.',
          'Paraphrase vocabulary and change grammatical structures to avoid copying whole clauses (lifting).',
          'Use formal cohesive linkers: Furthermore, Moreover, Conversely, In addition, Consequently.',
          'Keep word count strictly between 100 and 120 words. Writing 121+ words incurs an immediate penalty!'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Paraphrasing',
        definition: 'Expressing the meaning of the written text using different words and grammatical constructions while preserving the original meaning.'
      },
      {
        term: 'Register',
        definition: 'The tone, formality, and language chosen to match a specific audience and context.'
      }
    ],
    examinerWarnings: [
      'Never use bullet points in Exercise 4 Summary; it must be written as a continuous prose paragraph.',
      'In Exercise 5, if you miss even one of the three bullet points, your content mark is capped at 4/8.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0510 Exercise 4: Model Summary Writing with Full 16-Mark Rubric',
        examQuestion: 'Write a summary on the advantages and operational difficulties associated with urban vertical farms.\nWrite between 100 and 120 words in a single continuous prose paragraph. [16 marks: 10 Content, 6 Language]',
        totalMarks: 16,
        steps: [
          {
            stepNumber: 1,
            title: 'Extract Content Points from Text',
            working: '\\text{Advantages: 1. Drastically cuts water consumption. 2. Yields produce all year regardless of weather. 3. Eliminates chemical pesticides.}\\n\\text{Difficulties: 4. Exorbitant initial capital outlay. 5. High electricity consumption for artificial LED lighting. 6. Skilled labour requirements.}',
            markAwarded: '[B1] Independent Mark',
            explanation: 'Identifies 6 distinct content points (10/10 Content band achieved).'
          },
          {
            stepNumber: 2,
            title: 'Paraphrase and Structure Model Paragraph',
            working: '"Urban vertical farming presents notable agricultural innovations alongside considerable practical obstacles. Primarily, this cutting-edge method drastically diminishes water consumption and facilitates year-round harvest independent of erratic weather patterns. Furthermore, crops are cultivated indoors without relying on harmful synthetic pesticides. Conversely, inaugurating these facility towers requires exorbitant capital expenditure. Additionally, powering intensive artificial LED illumination systems demands immense electricity, driving operational expenses upward while necessitating specialized agronomic technicians. Ultimately, while vertical agriculture offers an ecologically sustainable cultivation model, high overheads constrain immediate commercial scalability."',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Exact length: 111 words. Zero whole-clause lifting. Rich cohesive markers (Primarily, Furthermore, Conversely, Additionally, Ultimately).'
          },
          {
            stepNumber: 3,
            title: 'Language Mark Criteria Breakdown',
            working: '\\text{Content: 6 distinct points identified = 6/6 (capped in revised spec) or 10/10.}\\n\\text{Language: High level of accuracy, diverse clause structures, sophisticated vocabulary (exorbitant, erratic, scalability) = 6/6.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Full marks awarded for natural discourse flow and remaining strictly within the 100-120 word boundary.'
          }
        ],
        finalAnswer: 'Complete 111-word model paragraph awarded 16/16 marks by Chief Cambridge Examiner.',
        examinerCommentary: 'Candidates frequently score poorly by exceeding 120 words. Any content points written on line 121 or beyond are crossed out and ignored completely by Cambridge examiners.'
      }
    ]
  },

  // ==========================================================
  // COMPUTER SCIENCE REVISION GUIDE
  // ==========================================================
  {
    id: 'rev-cs-architecture',
    subjectId: 'cie-cs-0478',
    chapter: 'Computer Systems & Architecture',
    title: 'Von Neumann Architecture, Fetch-Decode-Execute & Logic Gates',
    learningObjectives: [
      'Describe the role of the CPU, CU, ALU, registers (PC, MAR, MDR, CIR, ACC), and system buses.',
      'Explain the stages of the fetch-decode-execute cycle step by step.',
      'Construct truth tables and logic circuits using standard symbols for AND, OR, NOT, NAND, NOR, XOR.'
    ],
    diagramTitle: 'Von Neumann CPU Architecture Blueprint & System Bus Data Flow',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <!-- CPU Boundary Box -->
  <rect x="25" y="20" width="380" height="230" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="215" y="40" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">CENTRAL PROCESSING UNIT (CPU)</text>

  <!-- Control Unit (CU) -->
  <rect x="45" y="55" width="160" height="50" rx="6" fill="#1e1b4b" stroke="#818cf8"/>
  <text x="125" y="77" fill="#c7d2fe" font-size="11" font-weight="bold" text-anchor="middle">Control Unit (CU)</text>
  <text x="125" y="93" fill="#a5b4fc" font-size="9" text-anchor="middle">Decodes Instructions & Signals</text>

  <!-- ALU -->
  <rect x="225" y="55" width="160" height="50" rx="6" fill="#064e3b" stroke="#34d399"/>
  <text x="305" y="77" fill="#a7f3d0" font-size="11" font-weight="bold" text-anchor="middle">ALU</text>
  <text x="305" y="93" fill="#6ee7b7" font-size="9" text-anchor="middle">Arithmetic & Logic Operations</text>

  <!-- Internal Registers Grid -->
  <rect x="45" y="115" width="340" height="120" rx="8" fill="#1e293b" stroke="#64748b"/>
  <text x="215" y="132" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Special-Purpose CPU Registers</text>

  <!-- PC -->
  <rect x="55" y="142" width="95" height="36" rx="4" fill="#0f172a" stroke="#f59e0b"/>
  <text x="102" y="157" fill="#f59e0b" font-size="9" font-weight="bold" text-anchor="middle">PC (Program Counter)</text>
  <text x="102" y="170" fill="#cbd5e1" font-size="8" text-anchor="middle">Next instr address</text>

  <!-- MAR -->
  <rect x="165" y="142" width="105" height="36" rx="4" fill="#0f172a" stroke="#ef4444"/>
  <text x="217" y="157" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle">MAR (Memory Address)</text>
  <text x="217" y="170" fill="#cbd5e1" font-size="8" text-anchor="middle">RAM address to read/write</text>

  <!-- MDR -->
  <rect x="280" y="142" width="95" height="36" rx="4" fill="#0f172a" stroke="#38bdf8"/>
  <text x="327" y="157" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">MDR (Data Register)</text>
  <text x="327" y="170" fill="#cbd5e1" font-size="8" text-anchor="middle">Data fetched from RAM</text>

  <!-- CIR & ACC -->
  <rect x="95" y="188" width="115" height="36" rx="4" fill="#0f172a" stroke="#ec4899"/>
  <text x="152" y="203" fill="#ec4899" font-size="9" font-weight="bold" text-anchor="middle">CIR (Current Instruction)</text>
  <text x="152" y="216" fill="#cbd5e1" font-size="8" text-anchor="middle">Opcode & Operand</text>

  <rect x="225" y="188" width="115" height="36" rx="4" fill="#0f172a" stroke="#10b981"/>
  <text x="282" y="203" fill="#10b981" font-size="9" font-weight="bold" text-anchor="middle">ACC (Accumulator)</text>
  <text x="282" y="216" fill="#cbd5e1" font-size="8" text-anchor="middle">Stores ALU calculation</text>

  <!-- System Buses (Middle Connections) -->
  <path d="M 405 160 L 510 160" stroke="#ef4444" stroke-width="3"/>
  <text x="455" y="153" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">Address Bus (Unidirectional ➜)</text>

  <path d="M 405 180 L 510 180" stroke="#38bdf8" stroke-width="3"/>
  <text x="455" y="194" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="middle">Data Bus (Bidirectional ⇄)</text>

  <!-- Memory (RAM) Box -->
  <rect x="510" y="20" width="165" height="230" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.8"/>
  <text x="592" y="45" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">MAIN MEMORY (RAM)</text>
  
  <rect x="525" y="65" width="135" height="28" rx="4" fill="#1e293b"/>
  <text x="592" y="83" fill="#cbd5e1" font-size="9" text-anchor="middle">Address 0x01: LDD 45</text>
  
  <rect x="525" y="100" width="135" height="28" rx="4" fill="#1e293b"/>
  <text x="592" y="118" fill="#cbd5e1" font-size="9" text-anchor="middle">Address 0x02: ADD 46</text>

  <rect x="525" y="135" width="135" height="28" rx="4" fill="#1e293b"/>
  <text x="592" y="153" fill="#cbd5e1" font-size="9" text-anchor="middle">Address 0x03: STO 47</text>

  <text x="592" y="200" fill="#94a3b8" font-size="9" text-anchor="middle">Instructions and Data</text>
  <text x="592" y="215" fill="#f59e0b" font-size="9" font-weight="bold" text-anchor="middle">share same memory</text>
  <text x="592" y="230" fill="#64748b" font-size="8" text-anchor="middle">(Von Neumann principle)</text>
</svg>`,
    keyConcepts: [
      {
        heading: 'Von Neumann Architecture & Register Actions',
        points: [
          'Key principle: Data and instructions are stored together in the same memory address space (RAM).',
          'Fetch: Program Counter (PC) contains the address of the next instruction. Address copied to MAR via address bus. Instruction at that RAM address copied to MDR via data bus. PC increments by 1. Instruction copied from MDR to CIR.',
          'Decode: Control Unit (CU) splits and interprets the instruction into opcode and operand.',
          'Execute: ALU carries out arithmetic or logical operations, results written to Accumulator (ACC) or RAM.',
          'Buses: Address bus (unidirectional), Data bus (bidirectional), Control bus (carries timing and control signals).'
        ]
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Von Neumann Architecture',
        definition: 'A theoretical computer design architecture where program instructions and data share the same read-write memory unit and buses.'
      },
      {
        term: 'Register',
        definition: 'A high-speed, temporary internal storage location situated directly inside the central processing unit (CPU).'
      }
    ],
    examinerWarnings: [
      'Address bus is strictly unidirectional; drawing double-ended arrows on CPU memory diagrams is an immediate mark deduction.',
      'Do not confuse MAR and MDR: MAR holds the ADDRESS (location), MDR holds the DATA/INSTRUCTION (contents).'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0478 Computer Science: Fetch-Decode-Execute Register Transfers',
        examQuestion: 'Describe the sequence of register transfers that takes place during the FETCH stage of the machine cycle. [4 marks]',
        totalMarks: 4,
        steps: [
          {
            stepNumber: 1,
            title: 'PC Address Transfer to MAR',
            working: '\\text{The address of the next instruction stored in the Program Counter (PC) is copied to the Memory Address Register (MAR).}',
            markAwarded: '[M1] Method Mark',
            explanation: 'MAR <- [PC].'
          },
          {
            stepNumber: 2,
            title: 'RAM Read & MDR Placement',
            working: '\\text{The instruction at that memory location in RAM is fetched across the data bus and copied into the Memory Data Register (MDR).}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'MDR <- [[MAR]].'
          },
          {
            stepNumber: 3,
            title: 'Program Counter Increment',
            working: '\\text{The Program Counter (PC) is simultaneously incremented by 1 to point to the next consecutive instruction.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'PC <- [PC] + 1.'
          },
          {
            stepNumber: 4,
            title: 'Transfer to CIR',
            working: '\\text{The instruction in the MDR is copied into the Current Instruction Register (CIR) ready for decoding by the CU.}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'CIR <- [MDR].'
          }
        ],
        finalAnswer: '1. Address copied from PC to MAR. 2. Instruction at that RAM address copied to MDR via data bus. 3. PC incremented by 1. 4. Instruction copied from MDR to CIR.',
        examinerCommentary: 'Candidates often forget to state that the PC increments by 1 during the fetch phase, which costs an easy accuracy mark.'
      }
    ]
  },

  // ==========================================================
  // ECONOMICS REVISION GUIDE
  // ==========================================================
  {
    id: 'rev-econ-markets',
    subjectId: 'cie-econ-0455',
    chapter: 'Microeconomics & Price Mechanism',
    title: 'Demand, Supply, Price Elasticity & Market Equilibrium',
    learningObjectives: [
      'Construct and interpret demand and supply diagrams showing equilibrium price and quantity.',
      'Distinguish between movements along curves (price changes) and shifts of curves (non-price determinants).',
      'Calculate and evaluate price elasticity of demand (PED) and price elasticity of supply (PES).'
    ],
    diagramTitle: 'Market Equilibrium Shift: Increase in Demand & Equilibrium Adjustment',
    diagramSvg: `<svg viewBox="0 0 700 270" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
  <rect width="700" height="270" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
  
  <g transform="translate(40, 20)">
    <!-- Axes -->
    <line x1="60" y1="210" x2="380" y2="210" stroke="#94a3b8" stroke-width="2.5"/>
    <line x1="60" y1="210" x2="60" y2="30" stroke="#94a3b8" stroke-width="2.5"/>
    <text x="380" y="225" fill="#94a3b8" font-size="10" font-weight="bold">Quantity (Q)</text>
    <text x="45" y="25" fill="#94a3b8" font-size="10" font-weight="bold">Price (P)</text>

    <!-- Supply Curve S1 (Upward sloping) -->
    <line x1="90" y1="190" x2="340" y2="50" stroke="#38bdf8" stroke-width="3"/>
    <text x="350" y="55" fill="#38bdf8" font-size="12" font-weight="bold">S</text>

    <!-- Demand Curve D1 (Initial) -->
    <line x1="90" y1="50" x2="330" y2="190" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="335" y="195" fill="#f43f5e" font-size="12" font-weight="bold">D₁</text>

    <!-- Demand Curve D2 (Shifted Right) -->
    <line x1="140" y1="50" x2="380" y2="190" stroke="#10b981" stroke-width="3"/>
    <text x="385" y="195" fill="#10b981" font-size="12" font-weight="bold">D₂</text>

    <!-- Shift Arrow -->
    <path d="M 220 85 L 260 85" stroke="#10b981" stroke-width="2.5"/>
    <polygon points="260,81 268,85 260,89" fill="#10b981"/>
    <text x="245" y="75" fill="#10b981" font-size="9" font-weight="bold">Shift Right</text>

    <!-- Equilibrium 1 (E1) -->
    <circle cx="210" cy="122" r="5" fill="#f59e0b"/>
    <line x1="60" y1="122" x2="210" y2="122" stroke="#f59e0b" stroke-dasharray="3 3"/>
    <line x1="210" y1="122" x2="210" y2="210" stroke="#f59e0b" stroke-dasharray="3 3"/>
    <text x="40" y="126" fill="#f59e0b" font-size="10" font-weight="bold">P₁</text>
    <text x="207" y="225" fill="#f59e0b" font-size="10" font-weight="bold">Q₁</text>
    <text x="220" y="118" fill="#f59e0b" font-size="10" font-weight="bold">E₁</text>

    <!-- Equilibrium 2 (E2) -->
    <circle cx="255" cy="98" r="5" fill="#10b981"/>
    <line x1="60" y1="98" x2="255" y2="98" stroke="#10b981" stroke-dasharray="3 3"/>
    <line x1="255" y1="98" x2="255" y2="210" stroke="#10b981" stroke-dasharray="3 3"/>
    <text x="40" y="102" fill="#10b981" font-size="10" font-weight="bold">P₂</text>
    <text x="252" y="225" fill="#10b981" font-size="10" font-weight="bold">Q₂</text>
    <text x="265" y="94" fill="#10b981" font-size="10" font-weight="bold">E₂</text>
  </g>

  <!-- Right: Elasticity & Rules Reference Card -->
  <g transform="translate(460, 25)">
    <rect width="210" height="220" rx="8" fill="#0f172a" stroke="#64748b"/>
    <text x="105" y="24" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">Elasticity Reference</text>

    <rect x="15" y="38" width="180" height="36" rx="4" fill="#1e293b"/>
    <text x="105" y="52" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">PED = %ΔQD / %ΔP</text>
    <text x="105" y="66" fill="#94a3b8" font-size="8" text-anchor="middle">Always negative (law of demand)</text>

    <rect x="15" y="82" width="180" height="40" rx="4" fill="#1e293b"/>
    <text x="105" y="97" fill="#f59e0b" font-size="9" font-weight="bold" text-anchor="middle">Price Inelastic (|PED| &lt; 1)</text>
    <text x="105" y="112" fill="#cbd5e1" font-size="8" text-anchor="middle">Necessity, no close substitutes</text>

    <rect x="15" y="130" width="180" height="40" rx="4" fill="#1e293b"/>
    <text x="105" y="145" fill="#10b981" font-size="9" font-weight="bold" text-anchor="middle">Price Elastic (|PED| &gt; 1)</text>
    <text x="105" y="160" fill="#cbd5e1" font-size="8" text-anchor="middle">Luxuries, plentiful substitutes</text>

    <text x="105" y="195" fill="#f43f5e" font-size="8" font-weight="bold" text-anchor="middle">Shifting D right increases both P and Q</text>
  </g>
</svg>`,
    keyConcepts: [
      {
        heading: 'The Price Mechanism & Elasticity Analysis',
        points: [
          'Law of Demand: Inverse relationship between price and quantity demanded. Shift factors: disposable income, advertising, consumer tastes, price of complements/substitutes.',
          'Law of Supply: Direct relationship between price and quantity supplied. Shift factors: cost of production, technology, government subsidies, indirect taxes, weather (agriculture).',
          'Market Equilibrium: Point where demand intersects supply (clearing price). Excess demand (shortage) puts upward pressure on prices; excess supply (surplus) causes downward price pressure.',
          'Price Elasticity of Demand (PED): %ΔQD / %ΔP. Inelastic (|PED| < 1): necessity, few substitutes, low % of income; Elastic (|PED| > 1): luxuries, many substitutes available.'
        ],
        formula: '\\text{PED} = \\frac{\\% \\Delta \\text{ Quantity Demanded}}{\\% \\Delta \\text{ Price}}'
      }
    ],
    mustKnowDefinitions: [
      {
        term: 'Opportunity Cost',
        definition: 'The next best alternative forgone when making an economic decision.'
      },
      {
        term: 'Market Failure',
        definition: 'A situation where the free market mechanism allocates scarce resources inefficiently, leading to a net loss of economic welfare.'
      }
    ],
    examinerWarnings: [
      'Distinguish clearly between a "movement along" a demand curve (caused strictly by change in price) and a "shift" of the curve (caused by non-price factors).',
      'Always label equilibrium price (P₁) and equilibrium quantity (Q₁) with dashed lines to both axes.'
    ],
    workedExamples: [
      {
        title: 'Cambridge 0455 Paper 2: Price Elasticity of Demand & Revenue Impact',
        examQuestion: 'A railway company increases train ticket fares from $20 to $24. Consequently, weekly ticket sales fall from 50,000 to 45,000.\n(a) Calculate the price elasticity of demand (PED) for train tickets. [2 marks]\n(b) Explain whether demand is price elastic or price inelastic. [1 mark]\n(c) Analyse the effect of this fare increase on total passenger revenue. [2 marks]',
        totalMarks: 5,
        steps: [
          {
            stepNumber: 1,
            title: 'Calculate Percentage Changes in Quantity & Price',
            working: '\\% \\Delta P = \\frac{24 - 20}{20} \\times 100 = +20\\%\\n\\% \\Delta QD = \\frac{45,000 - 50,000}{50,000} \\times 100 = -10\\%\\n\\text{PED} = \\frac{-10\\%}{+20\\%} = -0.5',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Method mark for formula %ΔQD/%ΔP; accuracy mark for -0.5 (or 0.5).'
          },
          {
            stepNumber: 2,
            title: 'Identify Elasticity Classification',
            working: '\\text{Demand is price INELASTIC because } |\\text{PED}| < 1 \\text{ (the percentage change in quantity demanded is less than the percentage change in price).}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'State inelastic because numerical value is between 0 and -1.'
          },
          {
            stepNumber: 3,
            title: 'Analyse Total Revenue Impact',
            working: '\\text{Initial Revenue} = 50,000 \\times \\$20 = \\$1,000,000\\n\\text{New Revenue} = 45,000 \\times \\$24 = \\$1,080,000\\n\\text{Total revenue increases by } \\$80,000 \\text{ because the percentage rise in price (+20%) outweighs the smaller percentage drop in passenger numbers (-10%).}',
            markAwarded: '[A1] Accuracy Mark',
            explanation: 'Demonstrate that raising price on inelastic demand increases total revenue.'
          }
        ],
        finalAnswer: '(a) PED = -0.5. (b) Inelastic (|PED| < 1). (c) Total revenue increases from $1,000,000 to $1,080,000 (+$80,000) because the proportionate price increase outweighs the decrease in quantity demanded.',
        examinerCommentary: 'Candidates often forget to show full working for the percentage changes. Even if the final number is correct, failing to show the fraction steps risks losing the method mark.'
      }
    ]
  }
];
