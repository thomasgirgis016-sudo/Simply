export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  period: number;
  group: number;
  category:
    | 'alkali-metal'
    | 'alkaline-earth'
    | 'transition-metal'
    | 'post-transition'
    | 'metalloid'
    | 'reactive-nonmetal'
    | 'noble-gas'
    | 'lanthanide'
    | 'actinide';
  stateAtRtp: 'solid' | 'liquid' | 'gas';
  electrons: string;
  valency: string;
  igcseExamNotes?: string;
}

export const IGCSE_PERIODIC_TABLE: ElementData[] = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1, period: 1, group: 1, category: 'reactive-nonmetal', stateAtRtp: 'gas', electrons: '1', valency: '1', igcseExamNotes: 'Diatomic gas H₂. Test: pops with lighted splint. Flammable.' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4, period: 1, group: 18, category: 'noble-gas', stateAtRtp: 'gas', electrons: '2', valency: '0', igcseExamNotes: 'Full outer shell of 2 electrons (duplet). Inert gas used in balloons (low density, non-flammable).' },

  // Period 2
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 7, period: 2, group: 1, category: 'alkali-metal', stateAtRtp: 'solid', electrons: '2,1', valency: '1', igcseExamNotes: 'Group I. Flame test: Red. Reacts with water: fizzes steadily, produces LiOH + H₂.' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9, period: 2, group: 2, category: 'alkaline-earth', stateAtRtp: 'solid', electrons: '2,2', valency: '2' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 11, period: 2, group: 13, category: 'metalloid', stateAtRtp: 'solid', electrons: '2,3', valency: '3' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12, period: 2, group: 14, category: 'reactive-nonmetal', stateAtRtp: 'solid', electrons: '2,4', valency: '4', igcseExamNotes: 'Allotropes: Diamond (giant covalent, tetrahedral, hard, electrical insulator) & Graphite (hexagonal layers with delocalized electrons, conducts electricity, lubricant).' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14, period: 2, group: 15, category: 'reactive-nonmetal', stateAtRtp: 'gas', electrons: '2,5', valency: '3', igcseExamNotes: '78% of clean dry air. Triple covalent bond N≡N makes it unreactive. Used in Haber process for ammonia.' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 16, period: 2, group: 16, category: 'reactive-nonmetal', stateAtRtp: 'gas', electrons: '2,6', valency: '2', igcseExamNotes: '21% of clean dry air. Test: relights a glowing splint.' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 19, period: 2, group: 17, category: 'reactive-nonmetal', stateAtRtp: 'gas', electrons: '2,7', valency: '1', igcseExamNotes: 'Halogen Group VII. Pale yellow gas. Most reactive halogen; reactivity decreases down Group VII.' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20, period: 2, group: 18, category: 'noble-gas', stateAtRtp: 'gas', electrons: '2,8', valency: '0', igcseExamNotes: 'Stable octet. Used in advertising signs; unreactive.' },

  // Period 3
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 23, period: 3, group: 1, category: 'alkali-metal', stateAtRtp: 'solid', electrons: '2,8,1', valency: '1', igcseExamNotes: 'Group I. Flame test: Yellow. Melts into a silvery ball on water, moves rapidly on surface.' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24, period: 3, group: 2, category: 'alkaline-earth', stateAtRtp: 'solid', electrons: '2,8,2', valency: '2', igcseExamNotes: 'Burns with brilliant white flame in oxygen to form white powder MgO.' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: 27, period: 3, group: 13, category: 'post-transition', stateAtRtp: 'solid', electrons: '2,8,3', valency: '3', igcseExamNotes: 'Extracted by electrolysis of molten bauxite in cryolite (Hall-Héroult). Oxide layer makes it corrosion-resistant. Amphoteric oxide.' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28, period: 3, group: 14, category: 'metalloid', stateAtRtp: 'solid', electrons: '2,8,4', valency: '4', igcseExamNotes: 'SiO₂ (silicon(IV) oxide / quartz): Giant covalent structure similar to diamond. High melting point.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 31, period: 3, group: 15, category: 'reactive-nonmetal', stateAtRtp: 'solid', electrons: '2,8,5', valency: '3, 5' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32, period: 3, group: 16, category: 'reactive-nonmetal', stateAtRtp: 'solid', electrons: '2,8,6', valency: '2', igcseExamNotes: 'Yellow non-metal solid. Used in Contact process for sulfuric acid (catalyst: V₂O₅, 450°C, 1-2 atm).' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.5, period: 3, group: 17, category: 'reactive-nonmetal', stateAtRtp: 'gas', electrons: '2,8,7', valency: '1', igcseExamNotes: 'Halogen. Pale green-yellow gas. Test: bleaches damp litmus paper white.' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 40, period: 3, group: 18, category: 'noble-gas', stateAtRtp: 'gas', electrons: '2,8,8', valency: '0', igcseExamNotes: '0.9% of air. Used in filament bulbs to prevent tungsten oxidation.' },

  // Period 4
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39, period: 4, group: 1, category: 'alkali-metal', stateAtRtp: 'solid', electrons: '2,8,8,1', valency: '1', igcseExamNotes: 'Group I. Flame test: Lilac. Reacts violently with water; catches fire with lilac flame.' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40, period: 4, group: 2, category: 'alkaline-earth', stateAtRtp: 'solid', electrons: '2,8,8,2', valency: '2', igcseExamNotes: 'Flame test: Orange-red. Limestone: CaCO₃. Slaked lime: Ca(OH)₂ (neutralizes acidic soil).' },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: 45, period: 4, group: 3, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,9,2', valency: '3' },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: 48, period: 4, group: 4, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,10,2', valency: '4' },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: 51, period: 4, group: 5, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,11,2', valency: '5', igcseExamNotes: 'Vanadium(V) oxide V₂O₅ is the industrial catalyst in the Contact Process.' },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: 52, period: 4, group: 6, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,13,1', valency: '3, 6', igcseExamNotes: 'Forms green Cr³⁺ and orange Cr₂O₇²⁻ compounds.' },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: 55, period: 4, group: 7, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,13,2', valency: '2, 4, 7', igcseExamNotes: 'MnO₂ is catalyst for H₂O₂ decomposition. Acidified KMnO₄ is a purple oxidizing agent (turns colorless).' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 56, period: 4, group: 8, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,14,2', valency: '2, 3', igcseExamNotes: 'Extracted in Blast Furnace from haematite (Fe₂O₃). Catalyst in Haber process. Fe²⁺ gives pale green precipitate with NaOH; Fe³⁺ gives red-brown.' },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: 59, period: 4, group: 9, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,15,2', valency: '2, 3', igcseExamNotes: 'Cobalt(II) chloride paper: chemical test for water. Blue anhydrous turns pink hydrated.' },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: 59, period: 4, group: 10, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,16,2', valency: '2', igcseExamNotes: 'Catalyst in margarine manufacture (hydrogenation of alkenes at 150-200°C).' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 64, period: 4, group: 11, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,18,1', valency: '1, 2', igcseExamNotes: 'Reddish-brown metal. Flame test: Blue-green. Cu²⁺ with NaOH gives light blue ppt. Anhydrous CuSO₄ tests water: white turns blue.' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65, period: 4, group: 12, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,18,2', valency: '2', igcseExamNotes: 'Used to galvanize steel (sacrificial protection). Zn²⁺ with NaOH gives white ppt soluble in excess to form colorless solution. Amphoteric oxide.' },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 70, period: 4, group: 13, category: 'post-transition', stateAtRtp: 'solid', electrons: '2,8,18,3', valency: '3' },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: 73, period: 4, group: 14, category: 'metalloid', stateAtRtp: 'solid', electrons: '2,8,18,4', valency: '4' },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: 75, period: 4, group: 15, category: 'metalloid', stateAtRtp: 'solid', electrons: '2,8,18,5', valency: '3, 5' },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: 79, period: 4, group: 16, category: 'reactive-nonmetal', stateAtRtp: 'solid', electrons: '2,8,18,6', valency: '2' },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 80, period: 4, group: 17, category: 'reactive-nonmetal', stateAtRtp: 'liquid', electrons: '2,8,18,7', valency: '1', igcseExamNotes: 'Halogen Group VII. Red-brown volatile liquid. Aqueous bromine water (orange) tests alkenes: decolourizes in presence of C=C double bonds.' },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: 84, period: 4, group: 18, category: 'noble-gas', stateAtRtp: 'gas', electrons: '2,8,18,8', valency: '0' },

  // Key heavy elements for IGCSE
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 108, period: 5, group: 11, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,18,18,1', valency: '1', igcseExamNotes: 'AgNO₃ tests halides: Cl⁻ gives white ppt AgCl; Br⁻ gives cream ppt AgBr; I⁻ gives yellow ppt AgI.' },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: 119, period: 5, group: 14, category: 'post-transition', stateAtRtp: 'solid', electrons: '2,8,18,18,4', valency: '2, 4' },
  { number: 53, symbol: 'I', name: 'Iodine', mass: 127, period: 5, group: 17, category: 'reactive-nonmetal', stateAtRtp: 'solid', electrons: '2,8,18,18,7', valency: '1', igcseExamNotes: 'Halogen. Grey-black crystalline solid. Sublimes to purple vapor on heating. Tests starch: brown solution turns blue-black.' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131, period: 5, group: 18, category: 'noble-gas', stateAtRtp: 'gas', electrons: '2,8,18,18,8', valency: '0' },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: 137, period: 6, group: 2, category: 'alkaline-earth', stateAtRtp: 'solid', electrons: '2,8,18,18,8,2', valency: '2', igcseExamNotes: 'Flame test: Pale green. Ba(NO₃)₂ or BaCl₂ tests sulfate ions SO₄²⁻: forms thick white precipitate BaSO₄.' },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195, period: 6, group: 10, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,18,32,17,1', valency: '2, 4', igcseExamNotes: 'Inert electrode in electrolysis & catalyst in catalytic converters.' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 197, period: 6, group: 11, category: 'transition-metal', stateAtRtp: 'solid', electrons: '2,8,18,32,18,1', valency: '1, 3', igcseExamNotes: 'Native unreactive metal at the bottom of the reactivity series.' },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: 201, period: 6, group: 12, category: 'transition-metal', stateAtRtp: 'liquid', electrons: '2,8,18,32,18,2', valency: '1, 2', igcseExamNotes: 'Only liquid metal at room temperature.' },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207, period: 6, group: 14, category: 'post-transition', stateAtRtp: 'solid', electrons: '2,8,18,32,18,4', valency: '2, 4', igcseExamNotes: 'Extracted from galena PbS. Pb²⁺ with iodide I⁻ forms bright yellow precipitate PbI₂.' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238, period: 7, group: 3, category: 'actinide', stateAtRtp: 'solid', electrons: '2,8,18,32,21,9,2', valency: '3, 4, 5, 6', igcseExamNotes: 'U-235 isotope used in nuclear reactors for fission to produce electricity.' }
];

export interface FormulaCategory {
  subject: '0580' | '0620' | '0625';
  title: string;
  items: {
    name: string;
    formula: string;
    variables: string;
    examTip: string;
  }[];
}

export const CAMBRIDGE_EXAM_FORMULAS: FormulaCategory[] = [
  {
    subject: '0580',
    title: 'Mathematics (0580) Core & Extended Formulas',
    items: [
      {
        name: 'Quadratic Formula',
        formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        variables: 'For equation ax² + bx + c = 0',
        examTip: 'Watch the sign of -b and (-b)². Give final answers to 2 decimal places unless asked otherwise.'
      },
      {
        name: 'The Sine Rule',
        formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
        variables: 'Sides a, b, c opposite angles A, B, C',
        examTip: 'Use for non-right triangles when you know an angle and its opposite side.'
      },
      {
        name: 'The Cosine Rule (Find Side)',
        formula: 'a^2 = b^2 + c^2 - 2bc \\cos A',
        variables: 'Side a opposite known angle A between sides b and c',
        examTip: 'SAS triangle configuration. Put brackets around (2bc cos A) in calculator.'
      },
      {
        name: 'The Cosine Rule (Find Angle)',
        formula: '\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}',
        variables: 'Known sides a, b, c',
        examTip: 'SSS configuration. Angle A is opposite side a.'
      },
      {
        name: 'Area of Triangle (Trig)',
        formula: '\\text{Area} = \\frac{1}{2}ab \\sin C',
        variables: 'Sides a and b with included angle C',
        examTip: 'Included angle must be sandwiched between sides a and b.'
      },
      {
        name: 'Volume & Surface Area of Sphere',
        formula: 'V = \\frac{4}{3}\\pi r^3, \\quad A = 4\\pi r^2',
        variables: 'Radius r',
        examTip: 'Given on front of Paper 4, but memorize anyway to save scanning time.'
      },
      {
        name: 'Volume & Surface Area of Cone',
        formula: 'V = \\frac{1}{3}\\pi r^2 h, \\quad A = \\pi r l',
        variables: 'Radius r, vertical height h, slant height l = √(r² + h²)',
        examTip: 'Do not confuse vertical height h with slant height l.'
      }
    ]
  },
  {
    subject: '0625',
    title: 'Physics (0625) Essential Equations',
    items: [
      {
        name: 'Kinematics Equations',
        formula: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as',
        variables: 'u=initial speed, v=final speed, a=accel (m/s²), t=time (s), s=distance (m)',
        examTip: 'Always convert minutes to seconds before substituting!'
      },
      {
        name: 'Newton’s Second Law',
        formula: 'F = ma, \\quad W = mg',
        variables: 'F=Resultant Force (N), m=mass (kg), a=accel (m/s²), g=9.8 m/s²',
        examTip: 'Cambridge CAIE updated g to 9.8 m/s² (do not use 10 unless specified).'
      },
      {
        name: 'Density & Pressure',
        formula: '\\rho = \\frac{m}{V}, \\quad p = \\frac{F}{A}, \\quad \\Delta p = \\rho g \\Delta h',
        variables: 'ρ=density (kg/m³), p=pressure (Pa or N/m²), h=depth (m)',
        examTip: 'Convert cm³ to m³ by dividing by 1,000,000 (10⁶).'
      },
      {
        name: 'Work, Energy & Power',
        formula: 'W = Fd, \\quad E_k = \\frac{1}{2}mv^2, \\quad \\Delta E_p = mg\\Delta h, \\quad P = \\frac{W}{t} = \\frac{E}{t}',
        variables: 'W, E in Joules (J); Power in Watts (W); t in seconds',
        examTip: 'Efficiency = (Useful Energy Output / Total Energy Input) × 100%'
      },
      {
        name: 'Wave Speed & Refractive Index',
        formula: 'v = f\\lambda, \\quad n = \\frac{\\sin i}{\\sin r} = \\frac{c}{v} = \\frac{1}{\\sin c}',
        variables: 'v=speed (m/s), f=freq (Hz), λ=wavelength (m), c=critical angle',
        examTip: 'Angle i and r are measured to the normal, NEVER to the glass boundary.'
      },
      {
        name: 'Electricity & Circuits',
        formula: 'I = \\frac{Q}{t}, \\quad V = IR, \\quad P = IV = I^2R = \\frac{V^2}{R}, \\quad E = IVt',
        variables: 'I=Current (A), Q=Charge (C), V=Voltage (V), R=Resistance (Ω)',
        examTip: 'In series: R_total = R1 + R2. In parallel: 1/R_total = 1/R1 + 1/R2.'
      }
    ]
  },
  {
    subject: '0620',
    title: 'Chemistry (0620) Quantitative Calculations',
    items: [
      {
        name: 'Moles & Mass',
        formula: 'n = \\frac{m}{M_r}',
        variables: 'n=moles (mol), m=mass in grams (g), Mr=relative formula mass',
        examTip: 'Check Mr carefully using periodic table Ar values. Watch diatomic gases (O₂=32, Cl₂=71).'
      },
      {
        name: 'Moles of Gas at r.t.p.',
        formula: 'V = n \\times 24\\text{ dm}^3 \\quad (\\text{or } n \\times 24,000\\text{ cm}^3)',
        variables: 'V=Gas volume at room temperature and pressure',
        examTip: '1 dm³ = 1000 cm³. Remember to state correct units in final answer.'
      },
      {
        name: 'Solution Concentration',
        formula: 'c = \\frac{n}{V} \\quad (\\text{mol/dm}^3) \\quad \\text{or } c = \\frac{m}{V} \\quad (\\text{g/dm}^3)',
        variables: 'c=concentration, V in dm³ (divide cm³ by 1000)',
        examTip: 'To convert mol/dm³ to g/dm³, multiply by Mr: c(g/dm³) = c(mol/dm³) × Mr.'
      },
      {
        name: 'Percentage Yield & Purity',
        formula: '\\% \\text{ Yield} = \\frac{\\text{Actual Mass}}{\\text{Theoretical Mass}} \\times 100\\%',
        variables: 'Actual mass obtained from experiment vs calculated theoretical mass',
        examTip: 'Yield is rarely 100% due to reversible reactions, side reactions, or loss during filtration.'
      }
    ]
  }
];
