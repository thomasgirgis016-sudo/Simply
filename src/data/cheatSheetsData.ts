import { SubjectCheatSheet } from '../types';

export const CHEAT_SHEETS_DATABASE: SubjectCheatSheet[] = [
  {
    subjectId: 'sub-math-0580',
    subjectCode: '0580',
    subjectName: 'Cambridge IGCSE Mathematics',
    board: 'CIE',
    badge: 'Extended 0580 / 0980',
    lastUpdated: '2025/2026 Examination Series',
    estimatedReadTime: '8 Minutes Read',
    criticalRules: [
      'Give non-exact numerical answers correct to 3 significant figures (or 1 d.p. for angles in degrees) unless a different degree of accuracy is specified.',
      'Always use the calculator value of π, NOT 3.14 or 22/7.',
      'Never round intermediate values on your calculator; keep raw values stored in memory to avoid rounding penalty [A0].',
      'Bearings must ALWAYS be written as 3 digits (e.g. 045°, not 45°).',
      'Bounds: For value $x = 14$ rounded to the nearest integer, lower bound is $13.5$ and upper bound is $14.5$.'
    ],
    sections: [
      {
        title: '1. Crucial Algebra & Quadratics',
        color: 'amber',
        items: [
          {
            label: 'Quadratic Formula',
            formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
            notes: 'When solving $ax^2 + bx + c = 0$. Write down values of $a, b, c$ before substituting. Watch negative $b$ values.',
            warning: 'Trap: If $b = -5$, $-b = +5$ and $(-5)^2 = +25$. Entering $-5^2$ in a calculator gives $-25$!'
          },
          {
            label: 'Completing the Square',
            formula: 'x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c',
            notes: 'The turning point / minimum value of the parabola is $\\left(-\\frac{b}{2}, c - \\frac{b^2}{4}\\right)$.'
          },
          {
            label: 'Fractional & Negative Indices',
            formula: 'a^{-n} = \\frac{1}{a^n}, \\quad a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m',
            notes: 'Example: $8^{-\\frac{2}{3}} = \\frac{1}{8^{2/3}} = \\frac{1}{(\\sqrt[3]{8})^2} = \\frac{1}{4}$.'
          }
        ]
      },
      {
        title: '2. Trigonometry & Non-Right-Angled Triangles',
        color: 'indigo',
        items: [
          {
            label: 'The Sine Rule',
            formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
            notes: 'Use when you know an angle and its opposite side, plus one other piece of information.',
            warning: 'Ambiguous case: $\\sin \\theta = \\sin(180^\\circ - \\theta)$. Check if the angle looks obtuse in the diagram!'
          },
          {
            label: 'The Cosine Rule (Side & Angle)',
            formula: 'a^2 = b^2 + c^2 - 2bc \\cos A \\iff \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}',
            notes: 'Use when you have SAS (two sides and included angle) or SSS (all three sides).'
          },
          {
            label: 'Area of Any Triangle',
            formula: '\\text{Area} = \\frac{1}{2}ab \\sin C',
            notes: 'Angle $C$ must be the INCLUDED angle between sides $a$ and $b$.'
          }
        ]
      },
      {
        title: '3. Circle Theorems (8 Guaranteed Traps)',
        color: 'rose',
        items: [
          {
            label: 'Angle at Center & Circumference',
            formula: '\\text{Angle at center} = 2 \\times \\text{Angle at circumference}',
            notes: 'Subtended by the exact same arc. Look for arrowhead / delta shape.'
          },
          {
            label: 'Angle in a Semicircle',
            formula: '\\angle = 90^\\circ \\text{ subtended by diameter}',
            notes: 'If a triangle side is the circle diameter, the opposite angle is strictly a right angle.'
          },
          {
            label: 'Cyclic Quadrilateral',
            formula: '\\text{Opposite angles sum to } 180^\\circ',
            notes: 'All 4 vertices MUST touch the circumference of the circle.'
          },
          {
            label: 'Alternate Segment Theorem',
            formula: '\\text{Angle between tangent and chord} = \\text{Angle in alternate segment}',
            notes: 'Commonly tested in Paper 4 for 3 marks. Identify the chord that touches the tangent.'
          }
        ]
      },
      {
        title: '4. Mensuration, Vectors & Statistics',
        color: 'teal',
        items: [
          {
            label: 'Arc Length & Sector Area',
            formula: '\\text{Arc} = \\frac{\\theta}{360} \\times 2\\pi r, \\quad \\text{Area} = \\frac{\\theta}{360} \\times \\pi r^2',
            notes: 'Perimeter of sector $= \\text{Arc} + 2r$ (candidates frequently forget to add the two radii!).'
          },
          {
            label: 'Histogram Frequency Density',
            formula: '\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}}',
            notes: 'Area of bar represents frequency, NOT the height! Width $= \\text{upper limit} - \\text{lower limit}$.'
          },
          {
            label: 'Vector Magnitude & Column Form',
            formula: '|\\vec{v}| = \\sqrt{x^2 + y^2}',
            notes: 'If $\\vec{AB} = \\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$, magnitude $= \\sqrt{3^2 + (-4)^2} = 5$.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'sub-chem-0620',
    subjectCode: '0620',
    subjectName: 'Cambridge IGCSE Chemistry',
    board: 'CIE',
    badge: 'Extended 0620 / 0971',
    lastUpdated: '2025/2026 Examination Series',
    estimatedReadTime: '7 Minutes Read',
    criticalRules: [
      'In cation tests, always specify the color AND whether the precipitate is soluble or insoluble in excess reagent.',
      'A gas test must include the test AND the result (e.g. "relights a glowing splint", not just "glowing splint").',
      'Stoichiometry: 1 mole of any gas occupies strictly 24 dm³ (or 24,000 cm³) at r.t.p.',
      'Endothermic: ΔH is positive (+), energy taken in, temperature of surroundings decreases.',
      'Exothermic: ΔH is negative (-), energy given out, temperature of surroundings increases.'
    ],
    sections: [
      {
        title: '1. Flame Test Colors (Must Memorize)',
        color: 'amber',
        items: [
          {
            label: 'Lithium (Li⁺)',
            formula: '\\text{Red (Crimson)}',
            notes: 'Clean nichrome wire dipped in concentrated HCl and placed into roaring blue Bunsen flame.'
          },
          {
            label: 'Sodium (Na⁺) & Potassium (K⁺)',
            formula: 'Na^+ = \\text{Yellow}, \\quad K^+ = \\text{Lilac}',
            notes: 'Lilac color is masked if sodium impurity is present.'
          },
          {
            label: 'Copper(II) (Cu²⁺) & Calcium (Ca²⁺)',
            formula: 'Cu^{2+} = \\text{Blue-Green}, \\quad Ca^{2+} = \\text{Orange-Red}',
            notes: 'Barium ($Ba^{2+}$) is apple-green.'
          }
        ]
      },
      {
        title: '2. Cation Precipitate Table (NaOH & NH₃)',
        color: 'indigo',
        items: [
          {
            label: 'Zinc (Zn²⁺) vs Aluminium (Al³⁺)',
            formula: 'Zn^{2+} \\text{ vs } Al^{3+}',
            notes: 'Both give white ppt with NaOH that dissolves in excess. Distinction: With aqueous NH₃, Zn²⁺ dissolves in excess to give a colorless solution; Al³⁺ remains insoluble.'
          },
          {
            label: 'Copper(II) (Cu²⁺)',
            formula: 'Cu^{2+} + 2OH^- \\to Cu(OH)_2 \\text{ (s)}',
            notes: 'Light blue ppt with NaOH insoluble in excess. With NH₃, light blue ppt dissolves in excess to form a deep royal blue solution.'
          },
          {
            label: 'Iron(II) (Fe²⁺) vs Iron(III) (Fe³⁺)',
            formula: 'Fe^{2+} = \\text{Green ppt}, \\quad Fe^{3+} = \\text{Red-brown ppt}',
            notes: 'Both insoluble in excess NaOH and excess NH₃. Green ppt turns red-brown on standing (oxidation by air).'
          }
        ]
      },
      {
        title: '3. Gas Tests & Anions',
        color: 'emerald',
        items: [
          {
            label: 'Oxygen (O₂) vs Hydrogen (H₂)',
            formula: 'O_2 \\text{ vs } H_2',
            notes: 'O₂: Relights a glowing splint. H₂: Ignited with a lighted splint, produces a squeaky pop.'
          },
          {
            label: 'Carbon Dioxide (CO₂) & Chlorine (Cl₂)',
            formula: 'CO_2 \\text{ vs } Cl_2',
            notes: 'CO₂: Bubbled through limewater, turns milky/cloudy. Cl₂: Bleaches damp blue or red litmus paper white.'
          },
          {
            label: 'Halide Anions (Cl⁻, Br⁻, I⁻)',
            formula: '\\text{Add dilute } HNO_3 \\text{ then aqueous } AgNO_3',
            notes: 'Chloride ($Cl^-$) = White ppt ($AgCl$). Bromide ($Br^-$) = Cream ppt ($AgBr$). Iodide ($I^-$) = Yellow ppt ($AgI$).'
          }
        ]
      },
      {
        title: '4. Stoichiometry & Organic Reactions',
        color: 'purple',
        items: [
          {
            label: 'The 3 Golden Moles Equations',
            formula: 'n = \\frac{m}{M_r}, \\quad n = \\frac{V}{24\\text{ dm}^3}, \\quad n = C \\times V(\\text{dm}^3)',
            notes: 'To convert cm³ to dm³, divide strictly by 1000.'
          },
          {
            label: 'Alkenes vs Alkanes Test',
            formula: '\\text{Add orange aqueous bromine}',
            notes: 'Alkene (unsaturated C=C): Decolorizes bromine water from orange to colorless. Alkane (saturated): Remains orange (only reacts under UV light).'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'sub-phys-0625',
    subjectCode: '0625',
    subjectName: 'Cambridge IGCSE Physics',
    board: 'CIE',
    badge: 'Extended 0625 / 0972',
    lastUpdated: '2025/2026 Examination Series',
    estimatedReadTime: '7 Minutes Read',
    criticalRules: [
      'Time in physics calculations MUST always be converted into seconds (e.g. 5 minutes = 300 s).',
      'Vectors have magnitude AND direction (displacement, velocity, acceleration, force, momentum). Scalars only have magnitude (distance, speed, mass, time, energy).',
      'Weight ($W = mg$) is in Newtons; Mass ($m$) is in kilograms. Never write weight in kg!',
      'In refractive index $n = \\sin i / \\sin r$, the angle $i$ is ALWAYS in the less dense medium (air/vacuum).',
      'Frequency never changes when a wave enters a new medium (speed and wavelength change).'
    ],
    sections: [
      {
        title: '1. Forces, Motion & Pressure',
        color: 'amber',
        items: [
          {
            label: 'Speed, Velocity & Acceleration',
            formula: 'v = \\frac{s}{t}, \\quad a = \\frac{v - u}{t}',
            notes: 'Speed-Time Graph: Gradient represents acceleration. Area under graph represents total distance traveled.'
          },
          {
            label: "Newton's Second Law & Weight",
            formula: 'F = ma, \\quad W = mg',
            notes: 'Take $g = 9.8\\text{ m/s}^2$ (or $10\\text{ m/s}^2$ as specified on the paper front cover).'
          },
          {
            label: 'Density & Pressure',
            formula: '\\rho = \\frac{m}{V}, \\quad P = \\frac{F}{A}, \\quad \\Delta P = \\rho g \\Delta h',
            notes: 'Liquid pressure depends only on density, gravity, and depth (independent of surface shape).'
          }
        ]
      },
      {
        title: '2. Thermal Physics & Waves',
        color: 'cyan',
        items: [
          {
            label: 'Specific Heat Capacity',
            formula: '\\Delta E = mc \\Delta T',
            notes: '$c$ in $\\text{J}/(\\text{kg}\\cdot^\\circ\\text{C})$. Energy $E = P \\times t$ (power in Watts $\\times$ time in seconds).'
          },
          {
            label: 'Wave Speed Equation',
            formula: 'v = f \\lambda',
            notes: '$v$ in m/s, $f$ in Hertz (Hz), $\\lambda$ in meters. All electromagnetic waves travel at $3.0 \\times 10^8\\text{ m/s}$ in vacuum.'
          },
          {
            label: 'Refraction & Critical Angle',
            formula: 'n = \\frac{\\sin i}{\\sin r} = \\frac{1}{\\sin c}',
            notes: 'Total Internal Reflection occurs ONLY when light travels from dense to less dense medium and angle of incidence $i > c$.'
          }
        ]
      },
      {
        title: '3. Electricity, Magnetism & Nuclear',
        color: 'indigo',
        items: [
          {
            label: "Ohm's Law & Electrical Power",
            formula: 'V = IR, \\quad P = IV = I^2R = \\frac{V^2}{R}',
            notes: 'In series, current is identical everywhere. In parallel, voltage is identical across all branches.'
          },
          {
            label: 'Resistors in Parallel',
            formula: '\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} \\implies R_p = \\frac{R_1 R_2}{R_1 + R_2}',
            notes: 'The combined resistance of resistors in parallel is ALWAYS less than the smallest individual resistor.'
          },
          {
            label: 'Ideal Transformer Equation',
            formula: '\\frac{V_p}{V_s} = \\frac{N_p}{N_s}, \\quad I_p V_p = I_s V_s',
            notes: 'High voltage transmission reduces current ($I$), which dramatically reduces power lost as heat ($P_{\\text{loss}} = I^2 R$).'
          },
          {
            label: 'Nuclear Radiation Properties',
            formula: '\\alpha = ^4_2\\text{He}, \\quad \\beta = ^0_{-1}\\text{e}, \\quad \\gamma = \\text{EM wave}',
            notes: 'Alpha: High ionising, stopped by paper. Beta: Medium ionising, stopped by few mm aluminium. Gamma: Low ionising, reduced by thick lead.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'sub-bio-0610',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    board: 'CIE',
    badge: 'Extended 0610 / 0970',
    lastUpdated: '2025/2026 Examination Series',
    estimatedReadTime: '6 Minutes Read',
    criticalRules: [
      'Enzymes do NOT "die"; they "denature" (active site changes shape so substrate no longer fits).',
      'Osmosis definition must include: "movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane".',
      'Magnification formula: Image = Actual × Magnification ($I = AM$). Always measure in mm and convert to $\\mu m$ by multiplying by 1000.',
      'Photosynthesis equation: $6CO_2 + 6H_2O \\to C_6H_{12}O_6 + 6O_2$. Must balance!'
    ],
    sections: [
      {
        title: '1. Food Tests (Guaranteed Paper 6 & Paper 4)',
        color: 'emerald',
        items: [
          {
            label: 'Reducing Sugars (Glucose)',
            formula: '\\text{Benedict\'s Solution + Heat in water bath}',
            notes: 'Color change: Blue → Green → Yellow → Brick-Red precipitate.'
          },
          {
            label: 'Starch (Carbohydrate)',
            formula: '\\text{Iodine Solution}',
            notes: 'Color change: Yellow-brown → Blue-black.'
          },
          {
            label: 'Proteins (Amino Acids)',
            formula: '\\text{Biuret Reagent (NaOH + dilute CuSO}_4)',
            notes: 'Color change: Light blue → Purple / Violet / Lilac.'
          },
          {
            label: 'Fats / Lipids',
            formula: '\\text{Ethanol Emulsion Test (Add ethanol, shake, add to water)}',
            notes: 'Result: Colorless → Cloudy white emulsion.'
          }
        ]
      },
      {
        title: '2. Human Systems & Transport',
        color: 'rose',
        items: [
          {
            label: 'Heart & Circulatory System',
            formula: '\\text{Left Ventricle has thickest muscular wall}',
            notes: 'Pumps oxygenated blood to the entire body at high pressure through the Aorta. Right ventricle only pumps to lungs via pulmonary artery.'
          },
          {
            label: 'Xylem vs Phloem',
            formula: '\\text{Xylem (Water/Minerals) vs Phloem (Sucrose/Amino acids)}',
            notes: 'Xylem: Dead hollow vessels, one-way upward flow driven by transpiration pull. Phloem: Living sieve tubes, two-way translocation.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'sub-esl-0510',
    subjectCode: '0510',
    subjectName: 'Cambridge IGCSE English as a Second Language',
    board: 'CIE',
    badge: 'Extended 0510 / 0511',
    lastUpdated: '2025/2026 Examination Series',
    estimatedReadTime: '5 Minutes Read',
    criticalRules: [
      'Exercise 5 (Informal Email): 120-160 words. Address all 3 bullet points, use contractions (e.g. I\'m, can\'t), lively conversational tone.',
      'Exercise 6 (Article / Report / Review): 120-160 words. Strict formal tone, NO slang, NO contractions, balanced paragraphs.',
      'Always proofread for subject-verb agreement (e.g. "every student has", not "have").',
      'Do NOT write bullet points in writing exercises; use full sentences and cohesive linkers.'
    ],
    sections: [
      {
        title: '1. Band 9 Formal Connectors & Vocabulary',
        color: 'indigo',
        items: [
          {
            label: 'Adding Ideas',
            formula: '\\text{"Furthermore", "In addition to this", "Moreover", "Not only... but also"}',
            notes: 'Avoid repeatedly starting sentences with "And" or "Also".'
          },
          {
            label: 'Contrasting Arguments',
            formula: '\\text{"Conversely", "On the other hand", "In stark contrast", "Nonetheless"}',
            notes: 'Essential for balanced Exercise 6 reports and articles.'
          },
          {
            label: 'Executive Recommendations',
            formula: '\\text{"It is strongly recommended that...", "Taking everything into consideration..."}',
            notes: 'Perfect final paragraph punch for reports and reviews.'
          }
        ]
      }
    ]
  }
];

export const getCheatSheetForSubject = (subjectCode: string): SubjectCheatSheet => {
  const match = CHEAT_SHEETS_DATABASE.find((c) => c.subjectCode === subjectCode);
  return match || CHEAT_SHEETS_DATABASE[0];
};
