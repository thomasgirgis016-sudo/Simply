/**
 * Simply IGCSE — Syllabus Chapter Taxonomy & Learning Objectives
 * 
 * Strict, comprehensive syllabus chapter mapping for Cambridge IGCSE:
 * 1. CIE 0580 Mathematics (11 Chapters)
 * 2. CIE 0620 Chemistry (12 Chapters)
 * 3. CIE 0625 Physics (7 Chapters)
 * 4. CIE 0610 Biology (21 Chapters)
 * 5. CIE 0510 / 0511 ESL (6 Exercises)
 */

export interface ChapterTaxonomy {
  id: string;                    // e.g. "0580-01"
  chapterNumber: number;         // 1
  title: string;                 // "Number"
  subjectCode: string;           // "0580"
  subjectName: string;           // "Mathematics"
  subtopics: string[];           // ["Percentages", "Bounds", ...]
  learningObjectives: string[];  // 4-6 specific syllabus learning objectives for diagnostic checklist
  calculatorAllowed: boolean;    // true for Math P2/P4, Chem, Phys; false for non-calc
  formulaNotes: string[];        // Key reference formulas/rules
  tier: 'Core' | 'Extended' | 'Both';
  recommendedTimePerMarkMinutes: number; // typically 1.25
}

export interface SubjectTaxonomy {
  subjectCode: string;
  subjectName: string;
  board: 'CIE' | 'Edexcel' | 'OxfordAQA';
  chapters: ChapterTaxonomy[];
  defaultCalculatorRule: string;
  defaultFormulaNotes: string[];
}

export const MATHEMATICS_0580_TAXONOMY: ChapterTaxonomy[] = [
  {
    id: '0580-01',
    chapterNumber: 1,
    title: 'Number',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Percentages & Reverse Percentages',
      'Upper and Lower Bounds',
      'Standard Form & Scientific Notation',
      'Ratios & Proportions',
      'Speed, Distance and Time',
      'Prime Factors, HCF and LCM'
    ],
    learningObjectives: [
      'Calculate reverse percentages and percentage increase/decrease in real-world contexts',
      'Calculate upper and lower bounds for calculations involving rounded values',
      'Express numbers in standard form A × 10^n where 1 ≤ A < 10 and n is an integer',
      'Solve compound proportion, inverse proportion, and unit conversion problems',
      'Apply speed, distance, time and average speed formulas across multi-stage journeys'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Percentage change = (Difference / Original) × 100%',
      'Original value = New value / (1 ± percentage rate)',
      'Upper bound of A/B = UB(A) / LB(B)',
      'Average Speed = Total Distance / Total Time'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-02',
    chapterNumber: 2,
    title: 'Algebra 1',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Algebraic Expressions & Expansion',
      'Factorization (Common, Grouping, Difference of Squares)',
      'Linear Equations with Fractions',
      'Simultaneous Linear Equations',
      'Rearranging Formulae (Changing the Subject)'
    ],
    learningObjectives: [
      'Expand products of algebraic expressions including binomials and trinomials',
      'Factorize expressions using common factors, difference of two squares, and quadratic forms',
      'Solve linear equations with algebraic denominators and parentheses',
      'Solve pairs of simultaneous linear equations by substitution and elimination',
      'Change the subject of complex formulas including roots and powers'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'a^2 - b^2 = (a - b)(a + b)',
      '(a + b)^2 = a^2 + 2ab + b^2',
      'Simultaneous: eliminate one variable by equating coefficients'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-03',
    chapterNumber: 3,
    title: 'Algebra 2',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Quadratic Equations (Factorization & Formula)',
      'Linear and Quadratic Inequalities',
      'Linear, Quadratic and Geometric Sequences (nth Term)',
      'Functions, Composite Functions & Inverse Functions',
      'Algebraic Fractions (Simplification & Operations)'
    ],
    learningObjectives: [
      'Solve quadratic equations by factoring, completing the square, and using the quadratic formula',
      'Solve linear and quadratic inequalities and represent solutions on number lines',
      'Determine the nth term of linear, quadratic (an^2 + bn + c) and geometric sequences',
      'Evaluate composite functions fg(x) and determine inverse functions f^-1(x)',
      'Add, subtract, multiply, and divide algebraic fractions with quadratic denominators'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Quadratic Formula: x = (-b ± √(b^2 - 4ac)) / (2a)',
      'Quadratic Sequence 2nd difference = 2a',
      'Inverse function: set y = f(x), swap x and y, and solve for y'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-04',
    chapterNumber: 4,
    title: 'Coordinate Geometry',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Gradients of Straight Lines',
      'Midpoints & Length of Line Segments',
      'Equations of Lines (y = mx + c)',
      'Parallel and Perpendicular Lines'
    ],
    learningObjectives: [
      'Calculate the gradient of a straight line connecting two points (x1, y1) and (x2, y2)',
      'Calculate the midpoint and length (distance formula) between two points',
      'Determine the equation of a straight line given two points or gradient and a point',
      'Identify parallel lines (m1 = m2) and perpendicular lines (m1 × m2 = -1)',
      'Find the equation of the perpendicular bisector of a line segment'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Gradient m = (y2 - y1) / (x2 - x1)',
      'Midpoint = ((x1 + x2)/2, (y1 + y2)/2)',
      'Distance d = √((x2 - x1)^2 + (y2 - y1)^2)',
      'Perpendicular gradient: m_perp = -1 / m'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-05',
    chapterNumber: 5,
    title: 'Geometry',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Angle Rules (Parallel Lines & Intersecting)',
      'Interior & Exterior Angles of Polygons',
      'Circle Theorems (7 Fundamental Rules)',
      'Similarity & Congruence (Lengths, Areas, Volumes)'
    ],
    learningObjectives: [
      'Calculate angles in parallel lines, triangles, and intersecting lines giving geometric reasons',
      'Calculate interior and exterior angles of regular and irregular n-sided polygons',
      'Apply circle theorems including angle at centre, subtended in same segment, cyclic quadrilaterals, and alternate segment',
      'Solve problems involving similar figures using linear ratio k, area ratio k^2, and volume ratio k^3'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Sum of interior angles of n-gon = (n - 2) × 180°',
      'Exterior angle of regular n-gon = 360° / n',
      'Angle at centre = 2 × angle at circumference',
      'Opposite angles of cyclic quadrilateral sum to 180°',
      'Area ratio = k^2, Volume ratio = k^3'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-06',
    chapterNumber: 6,
    title: 'Mensuration',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Perimeter & Area of Compound Shapes',
      'Arc Length and Sector Area',
      'Surface Area and Volume of Prisms & Cylinders',
      'Pyramids, Cones and Spheres',
      'Frustums of Cones and Pyramids'
    ],
    learningObjectives: [
      'Calculate perimeters and areas of 2D shapes including trapeziums, kites, and composite figures',
      'Calculate arc lengths and sector areas using angle fractions (θ / 360°)',
      'Calculate total surface area and volume of cylinders, cuboids, and triangular prisms',
      'Calculate curved surface area and volume of cones and spheres',
      'Solve problems involving frustums by subtraction of similar solid cones/pyramids'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Arc Length = (θ / 360) × 2πr',
      'Sector Area = (θ / 360) × πr^2',
      'Volume of Cone = (1/3)πr^2h; Curved SA = πrl',
      'Volume of Sphere = (4/3)πr^3; Surface Area = 4πr^2'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-07',
    chapterNumber: 7,
    title: 'Trigonometry',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Right-Angled Trig (SOHCAHTOA & Pythagoras)',
      'Sine Rule for Triangles',
      'Cosine Rule for Sides and Angles',
      'Area of a Triangle (1/2 ab sin C)',
      '3D Trigonometry & Angles of Elevation/Depression',
      'Bearings & Navigation'
    ],
    learningObjectives: [
      'Apply sin, cos, tan ratios and Pythagoras theorem to solve right-angled triangle problems',
      'Use the Sine Rule a/sin(A) = b/sin(B) = c/sin(C) including the ambiguous case',
      'Use the Cosine Rule a^2 = b^2 + c^2 - 2bc cos(A) to find unknown sides and angles',
      'Calculate area of general triangles using Area = 0.5 × a × b × sin(C)',
      'Solve 3D trigonometry problems involving projections onto planes and angles between lines and planes',
      'Apply three-figure bearings to navigation and multi-stage journeys'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Sine Rule: a / sin(A) = b / sin(B) = c / sin(C)',
      'Cosine Rule (side): a^2 = b^2 + c^2 - 2bc cos(A)',
      'Cosine Rule (angle): cos(A) = (b^2 + c^2 - a^2) / (2bc)',
      'Triangle Area = 1/2 a b sin(C)'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-08',
    chapterNumber: 8,
    title: 'Vectors & Transformations',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Column Vectors (Addition, Subtraction, Scalar Multiplication)',
      'Magnitude of a Vector',
      'Geometric Vector Proofs (Collinear points & Ratios)',
      'Four Transformations (Translation, Reflection, Rotation, Enlargement)'
    ],
    learningObjectives: [
      'Perform arithmetic with column vectors and calculate vector magnitudes |v| = √(x^2 + y^2)',
      'Express vectors in terms of given base vectors (a and b) in 2D geometry figures',
      'Prove points are collinear or lines are parallel using scalar multiples of vectors',
      'Describe fully and perform translations (column vector), reflections (mirror line), rotations (angle, direction, centre), and enlargements (scale factor, centre)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Magnitude |(x, y)^T| = √(x^2 + y^2)',
      'Parallel vectors: u = k v for non-zero scalar k',
      'Collinear points: AB = k BC sharing common point B'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-09',
    chapterNumber: 9,
    title: 'Probability',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Basic Probability Rules & Mutually Exclusive Events',
      'Tree Diagrams (With and Without Replacement)',
      'Venn Diagrams & Set Notation (Union, Intersection, Complement)',
      'Conditional Probability'
    ],
    learningObjectives: [
      'Calculate probabilities of single and combined mutually exclusive and independent events',
      'Construct and interpret tree diagrams for sequential events with and without replacement',
      'Use Venn diagrams and set notation (∪, ∩, ξ, A\') to calculate probabilities',
      'Calculate conditional probabilities from two-way tables and Venn diagrams'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'P(A\') = 1 - P(A)',
      'Independent events: P(A ∩ B) = P(A) × P(B)',
      'Mutually exclusive: P(A ∪ B) = P(A) + P(B)',
      'Conditional: P(A | B) = P(A ∩ B) / P(B)'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-10',
    chapterNumber: 10,
    title: 'Statistics',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Mean, Median, Mode and Range for Discrete & Grouped Data',
      'Histograms with Unequal Class Widths (Frequency Density)',
      'Cumulative Frequency Curves & Percentiles',
      'Box-and-Whisker Plots & Interquartile Range (IQR)',
      'Scatter Graphs & Correlation'
    ],
    learningObjectives: [
      'Calculate estimated mean and identify modal class from grouped frequency distributions',
      'Construct and interpret histograms where frequency density = frequency / class width',
      'Draw cumulative frequency curves and estimate median, quartiles, and IQR',
      'Construct box-and-whisker plots and compare distributions using median and spread',
      'Identify positive, negative, or zero correlation and draw lines of best fit'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Frequency Density = Frequency / Class Width',
      'Interquartile Range (IQR) = Upper Quartile (Q3) - Lower Quartile (Q1)',
      'Estimated Mean = Σ(fx) / Σf where x is class midpoint'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0580-11',
    chapterNumber: 11,
    title: 'Differentiation',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    subtopics: [
      'Derivatives of Polynomials (d/dx(ax^n) = nax^(n-1))',
      'Gradients of Curves at Specific Points',
      'Stationary Points & Turning Points (dy/dx = 0)',
      'Equations of Tangents and Normals',
      'Kinematics (Displacement, Velocity, Acceleration)'
    ],
    learningObjectives: [
      'Differentiate powers of x including negative and fractional indices',
      'Find the gradient of a curve at a specified point by evaluating dy/dx',
      'Locate stationary points by solving dy/dx = 0 and determine their nature (maximum or minimum)',
      'Determine the equation of the tangent and normal to a curve at a given point',
      'Apply differentiation and integration to kinematics problems (v = ds/dt, a = dv/dt)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'd/dx (a x^n) = a n x^(n-1)',
      'Stationary point: set dy/dx = 0',
      'Normal gradient m_norm = -1 / (dy/dx)',
      'Velocity v = ds/dt, Acceleration a = dv/dt'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  }
];

export const CHEMISTRY_0620_TAXONOMY: ChapterTaxonomy[] = [
  {
    id: '0620-01',
    chapterNumber: 1,
    title: 'States of Matter & Experimental Techniques',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Particulate Nature of Matter & Diffusion',
      'Heating and Cooling Curves',
      'Measurement of Mass, Time, Temperature and Volume',
      'Chromatography & Rf Values',
      'Purification Methods (Filtration, Crystallization, Simple & Fractional Distillation)'
    ],
    learningObjectives: [
      'Describe states of matter and phase changes in terms of particle energy and arrangement',
      'Explain diffusion and effect of molecular mass on rate of diffusion',
      'Select suitable apparatus for measuring mass, volume, time and temperature',
      'Calculate and interpret Rf values from paper chromatograms',
      'Describe separation techniques based on differences in solubility and boiling points'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Rf = distance moved by substance / distance moved by solvent front',
      'Rate of diffusion is inversely proportional to molecular mass (lighter gases diffuse faster)'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-02',
    chapterNumber: 2,
    title: 'Atomic Structure & Bonding',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Protons, Neutrons, Electrons & Isotopes',
      'Electronic Configuration (First 20 Elements)',
      'Ionic Bonding & Dot-and-Cross Diagrams',
      'Covalent Bonding (Single, Double, Triple)',
      'Giant Covalent Structures (Diamond, Graphite, Silicon Dioxide)',
      'Metallic Bonding & Physical Properties'
    ],
    learningObjectives: [
      'Deduce proton, neutron and electron numbers from isotopic symbols',
      'Draw dot-and-cross diagrams for ionic compounds between metals and non-metals',
      'Draw dot-and-cross diagrams for simple covalent molecules (H2, Cl2, H2O, CH4, NH3, CO2, O2, N2)',
      'Relate structures of diamond, graphite and SiO2 to their physical properties',
      'Explain metallic bonding in terms of a lattice of positive ions in a sea of delocalized electrons'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Relative atomic mass Ar = Σ(mass × abundance) / 100',
      'Charge balance in ionic compounds: net charge = 0'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-03',
    chapterNumber: 3,
    title: 'Stoichiometry & The Mole Concept',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Chemical Formulas & Balancing Equations',
      'Relative Molecular Mass (Mr)',
      'The Mole & Avogadro Constant (6.02 × 10^23)',
      'Molar Gas Volume (24 dm^3 at r.t.p.)',
      'Solution Concentrations (mol/dm^3 & g/dm^3)',
      'Empirical & Molecular Formulas',
      'Percentage Yield & Percentage Purity',
      'Titration Calculations'
    ],
    learningObjectives: [
      'Balance chemical equations and state symbols (s, l, g, aq)',
      'Calculate moles from mass using n = m / Mr',
      'Calculate gas volume at r.t.p. using Volume = moles × 24 dm^3',
      'Calculate concentration of solutions (c = n / V in dm^3)',
      'Determine empirical formula from percentage composition by mass',
      'Calculate percentage yield and percentage purity in chemical processes',
      'Perform quantitative stoichiometric titration calculations'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Moles n = mass / Mr',
      'Gas volume = moles × 24 dm^3 (at r.t.p.)',
      'Concentration c = moles / volume(dm^3)',
      '% Yield = (Actual Yield / Theoretical Yield) × 100%',
      '% Purity = (Mass of pure product / Total mass of sample) × 100%'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-04',
    chapterNumber: 4,
    title: 'Electrochemistry',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Electrolysis of Molten Salts (Lead(II) Bromide)',
      'Electrolysis of Aqueous Solutions (Concentrated NaCl, Dilute H2SO4, Aqueous CuSO4)',
      'Electrolysis with Inert vs Reactive Electrodes (Copper Refining)',
      'Electroplating & Applications',
      'Hydrogen-Oxygen Fuel Cells'
    ],
    learningObjectives: [
      'Predict products at anode (positive) and cathode (negative) in molten electrolysis',
      'Apply preferential discharge rules for aqueous electrolysis',
      'Write ionic half-equations at the cathode (reduction) and anode (oxidation)',
      'Describe the purification of copper using copper electrodes in CuSO4(aq)',
      'Describe advantages and disadvantages of hydrogen fuel cells vs combustion engines'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Cathode (negative): Reduction (gain of electrons) e.g. Cu2+ + 2e- -> Cu',
      'Anode (positive): Oxidation (loss of electrons) e.g. 2Cl- -> Cl2 + 2e-',
      'Fuel cell overall reaction: 2H2 + O2 -> 2H2O'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-05',
    chapterNumber: 5,
    title: 'Chemical Energetics',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Exothermic and Endothermic Reactions',
      'Energy Profile Diagrams & Activation Energy (Ea)',
      'Enthalpy Change (ΔH)',
      'Bond Energy Calculations'
    ],
    learningObjectives: [
      'Identify exothermic and endothermic reactions by temperature change and ΔH sign',
      'Draw and label reaction pathway diagrams showing reactants, products, activation energy (Ea) and ΔH',
      'Explain that bond breaking is endothermic and bond making is exothermic',
      'Calculate enthalpy change ΔH using average bond energies: ΔH = Σ(bonds broken) - Σ(bonds formed)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'ΔH = Energy of bonds broken (reactants) - Energy of bonds formed (products)',
      'Negative ΔH = Exothermic (heat released)',
      'Positive ΔH = Endothermic (heat absorbed)'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-06',
    chapterNumber: 6,
    title: 'Chemical Reactions',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Collision Theory & Factors Affecting Reaction Rates',
      'Measuring Rate of Reaction (Gas Syringe, Mass Loss, Turbidity)',
      'Catalysts & Enzymes',
      'Reversible Reactions & Dynamic Equilibrium',
      'Le Chatelier\'s Principle (Haber & Contact Processes)',
      'Redox Reactions (Oxidation Numbers, Electron Transfer, Oxidizing/Reducing Agents)'
    ],
    learningObjectives: [
      'Explain effects of concentration, pressure, surface area, and temperature on reaction rate using collision theory',
      'Interpret rate graphs and calculate gradient to find instantaneous rate',
      'Define dynamic equilibrium in closed systems',
      'Predict shifts in equilibrium position due to changes in temperature, pressure, and concentration',
      'Identify oxidation and reduction in terms of oxygen gain/loss, hydrogen, electrons (OIL RIG), and oxidation number changes'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Rate = change in volume or mass / time',
      'OIL RIG: Oxidation Is Loss, Reduction Is Gain of electrons',
      'Haber: N2 + 3H2 ⇌ 2NH3 (450°C, 200 atm, Iron catalyst)',
      'Contact: 2SO2 + O2 ⇌ 2SO3 (450°C, 1-2 atm, V2O5 catalyst)'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-07',
    chapterNumber: 7,
    title: 'Acids, Bases & Salts',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'The pH Scale & Indicators (Universal, Litmus, Methyl Orange, Thymolphthalein)',
      'Acids, Bases, Alkalis & Neutralization Reactions',
      'Proton Donors and Acceptors',
      'Oxides (Acidic, Basic, Amphoteric, Neutral)',
      'Preparation of Soluble and Insoluble Salts',
      'Acid-Base Titrations'
    ],
    learningObjectives: [
      'Describe characteristic properties of acids and bases with metals, carbonates, and hydroxides',
      'Define acids as proton (H+) donors and bases as proton acceptors',
      'Classify oxides as acidic (SO2, CO2), basic (CuO, CaO), amphoteric (Al2O3, ZnO), or neutral (CO, NO)',
      'Describe preparation of salts: insoluble salts by precipitation; soluble salts by excess solid or titration'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Acid + Metal -> Salt + Hydrogen',
      'Acid + Base -> Salt + Water',
      'Acid + Carbonate -> Salt + Water + Carbon Dioxide',
      'Precipitation: AB(aq) + CD(aq) -> AD(s) + CB(aq)'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-08',
    chapterNumber: 8,
    title: 'The Periodic Table & Group Trends',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Arrangement of the Periodic Table (Periods & Groups)',
      'Group I: Alkali Metals (Trends in Reactivity, Density, Melting Point)',
      'Group VII: Halogens (Trends, Physical State, Displacement Reactions)',
      'Group VIII: Noble Gases & Inert Nature',
      'Transition Elements (Variable Oxidation States, Colored Compounds, Catalytic Uses)'
    ],
    learningObjectives: [
      'Relate group number to valence electrons and period number to electron shells',
      'Describe reactions of Group I metals with water and oxygen and trend in reactivity down the group',
      'Describe halogen physical states and displacement reactions based on reactivity trend',
      'Explain inert nature of noble gases due to full outer electron shell',
      'Describe distinctive properties of transition elements compared to main group metals'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Halogen displacement: Cl2 + 2KBr -> 2KCl + Br2 (chlorine oxidizes bromide)',
      'Group I reactivity increases down group; Group VII reactivity decreases down group'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-09',
    chapterNumber: 9,
    title: 'Metals & Extraction',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Properties of Metals & Alloys',
      'Reactivity Series (K, Na, Ca, Mg, Al, C, Zn, Fe, H, Cu, Ag, Au)',
      'Extraction of Iron in the Blast Furnace',
      'Extraction of Aluminium by Hall-Héroult Electrolysis (Cryolite)',
      'Rusting of Iron & Prevention Methods (Barrier, Galvanizing, Sacrificial)'
    ],
    learningObjectives: [
      'Explain properties of alloys compared to pure metals in terms of disrupted crystal lattices',
      'Deduce the order of reactivity of metals using displacement and reduction experiments',
      'Describe blast furnace reactions for iron extraction including redox and slag formation',
      'Explain aluminium extraction from bauxite using molten cryolite to lower melting point',
      'Describe conditions for rusting (water and oxygen) and sacrificial protection methods'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Blast Furnace: C + O2 -> CO2; CO2 + C -> 2CO; Fe2O3 + 3CO -> 2Fe + 3CO2',
      'Slag formation: CaCO3 -> CaO + CO2; CaO + SiO2 -> CaSiO3',
      'Al extraction cathode: Al3+ + 3e- -> Al; Anode: 2O2- -> O2 + 4e- (anodes burn away to CO2)'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-10',
    chapterNumber: 10,
    title: 'Chemistry of the Environment',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Chemical Tests for Water (Cobalt(II) Chloride & Copper(II) Sulfate)',
      'Water Treatment (Filtration, Carbon, Chlorination)',
      'Composition of Clean Air (78% N2, 21% O2, 0.9% Ar, 0.04% CO2)',
      'Air Pollutants (CO, SO2, NOx, Lead, Particulates)',
      'Greenhouse Effect, Global Warming & Ocean Acidification'
    ],
    learningObjectives: [
      'Describe chemical tests for water using anhydrous cobalt(II) chloride and copper(II) sulfate',
      'Outline steps in water treatment for domestic supply',
      'State composition of unpolluted air',
      'State sources, adverse effects, and abatement of common air pollutants (catalytic converters, flue-gas desulfurization)',
      'Explain the greenhouse effect and consequences of carbon dioxide and methane emissions'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Anhydrous CuSO4 (white) + 5H2O -> CuSO4·5H2O (blue)',
      'Anhydrous CoCl2 (blue) + 6H2O -> CoCl2·6H2O (pink)',
      'Catalytic converter: 2CO + 2NO -> 2CO2 + N2'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-11',
    chapterNumber: 11,
    title: 'Organic Chemistry',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Naming and Drawing Organic Compounds (Alkanes, Alkenes, Alcohols, Carboxylic Acids)',
      'Homologous Series & Structural Isomers',
      'Fractional Distillation of Petroleum (Crude Oil)',
      'Alkanes & Combustion; Free-Radical Halogenation',
      'Alkenes, Cracking & Addition Reactions (Bromine test, Hydrogenation, Hydration)',
      'Alcohols & Fermentation vs Hydration of Ethene',
      'Carboxylic Acids & Esterification',
      'Polymers (Addition Polymers & Condensation Polymers: Polyesters, Polyamides)'
    ],
    learningObjectives: [
      'Draw structural and displayed formulas for organic compounds up to C4',
      'Describe fractional distillation of crude oil and uses of each fraction',
      'Describe substitution reaction of alkanes with chlorine in UV light',
      'Describe addition reactions of alkenes with bromine water (decolorization test), steam, and hydrogen',
      'Compare fermentation and catalytic hydration of ethene for ethanol production',
      'Describe formation of esters and naming (e.g. ethyl ethanoate)',
      'Deduce repeat units of addition polymers and condensation polymers (nylon, terylene)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Alkane: C_n H_(2n+2); Alkene: C_n H_(2n); Alcohol: C_n H_(2n+1)OH; Acid: C_n H_(2n+1)COOH',
      'Esterification: Acid + Alcohol ⇌ Ester + Water (conc. H2SO4 catalyst)',
      'Fermentation: C6H12O6 -> 2C2H5OH + 2CO2 (30-35°C, yeast, anaerobic)'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0620-12',
    chapterNumber: 12,
    title: 'Experimental Analysis & Identification of Ions/Gases',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    subtopics: [
      'Flame Tests for Metal Cations (Li, Na, K, Ca, Cu, Ba)',
      'Aqueous Cation Tests with NaOH(aq) and NH3(aq) (Al, NH4, Ca, Cr, Cu, Fe(II), Fe(III), Zn)',
      'Anion Tests (Carbonate, Halides: Cl, Br, I, Nitrate, Sulfate, Sulfite)',
      'Gas Identification Tests (Ammonia, CO2, Chlorine, Hydrogen, Oxygen, SO2)'
    ],
    learningObjectives: [
      'Identify metal cations by flame test colors (Li+ red, Na+ yellow, K+ lilac, Ca2+ orange-red, Cu2+ blue-green)',
      'Distinguish aqueous metal cations using aqueous sodium hydroxide and aqueous ammonia precipitates',
      'Identify anions using dilute acid, silver nitrate/nitric acid, and barium nitrate/nitric acid',
      'Identify gases: NH3 (damp red litmus turns blue), CO2 (limewater turns cloudy), Cl2 (bleaches damp litmus), H2 (pop test), O2 (relights glowing splint), SO2 (turns acidified aqueous potassium manganate(VII) colorless)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Halides with AgNO3 + HNO3: Cl- white ppt (soluble in NH3), Br- cream ppt, I- yellow ppt',
      'Sulfate with Ba(NO3)2 + HNO3: white ppt of BaSO4',
      'Ammonium salt + NaOH heated -> NH3 gas evolves'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  }
];

export const PHYSICS_0625_TAXONOMY: ChapterTaxonomy[] = [
  {
    id: '0625-01',
    chapterNumber: 1,
    title: 'Motion, Forces & Energy',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Physical Quantities, Scalars & Vectors',
      'Speed, Velocity, Acceleration & Velocity-Time Graphs',
      'Mass, Weight & Gravitational Field Strength (W = mg)',
      'Density (ρ = m/V)',
      'Newton\'s Laws of Motion & Resultant Force (F = ma)',
      'Hooke\'s Law & Spring Extension (F = kx)',
      'Moments & Conditions for Equilibrium',
      'Work, Energy & Power (Ek = 0.5mv^2, Ep = mgh, P = W/t)',
      'Pressure in Solids and Liquids (p = F/A, Δp = ρgΔh)'
    ],
    learningObjectives: [
      'Interpret distance-time and velocity-time graphs; calculate gradient (acceleration) and area under graph (distance)',
      'Apply F = ma to calculate acceleration from unbalanced resultant forces',
      'Plot and interpret load-extension graphs; identify limit of proportionality and calculate spring constant k',
      'Calculate moments (Force × perpendicular distance) and apply principle of moments to balance problems',
      'Calculate kinetic energy, gravitational potential energy, mechanical work done, and power output',
      'Calculate pressure in solids and hydrostatic pressure in liquids'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'v = d/t, a = (v - u)/t',
      'F = ma, W = mg, ρ = m/V',
      'Hooke\'s law: F = kx',
      'Moment = Force × perpendicular distance',
      'Ek = 1/2 m v^2, Ep = mgh, Work = F d, Power = W/t',
      'Pressure p = F/A, Fluid pressure p = ρgh'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-02',
    chapterNumber: 2,
    title: 'Thermal Physics',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Kinetic Molecular Model of Matter & Brownian Motion',
      'Pressure and Temperature of a Gas (Boyle\'s Law: p1V1 = p2V2)',
      'Thermal Expansion of Solids, Liquids and Gases',
      'Specific Heat Capacity (ΔE = mcΔθ)',
      'Melting, Boiling & Evaporation (Cooling Effect)',
      'Thermal Conduction, Convection and Radiation',
      'Emission and Absorption of Infrared Radiation'
    ],
    learningObjectives: [
      'Relate temperature of a gas to average kinetic energy of molecules',
      'Explain gas pressure in terms of molecular collisions with container walls',
      'Apply Boyle\'s law p1V1 = p2V2 at constant temperature',
      'Calculate thermal energy transfers using ΔE = mcΔθ',
      'Distinguish between boiling and evaporation at molecular level',
      'Explain heat transfer by conduction (free electrons in metals), convection (density currents), and radiation (electromagnetic waves)'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Boyle\'s Law: p1 V1 = p2 V2 (constant temperature)',
      'Thermal energy ΔE = m c Δθ',
      'Specific heat capacity c = ΔE / (m Δθ)',
      'Black/matte surfaces: best emitters and absorbers of IR radiation; White/shiny surfaces: best reflectors'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-03',
    chapterNumber: 3,
    title: 'Waves',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Wave Properties: Transverse vs Longitudinal Waves',
      'Wave Equation: v = f λ',
      'Wavefronts, Reflection, Refraction and Diffraction',
      'Light Reflection & Laws of Reflection',
      'Light Refraction, Snell\'s Law & Refractive Index (n = sin i / sin r = c/v)',
      'Critical Angle & Total Internal Reflection (TIR: sin c = 1/n)',
      'Thin Converging & Diverging Lenses (Ray Diagrams, Magnification)',
      'Electromagnetic Spectrum (Order, Uses & Hazards)',
      'Sound Waves, Speed, Pitch, Loudness and Echo Calculations'
    ],
    learningObjectives: [
      'Distinguish transverse and longitudinal waves and calculate speed using v = f λ',
      'Describe wave behaviour: reflection (angle i = r), refraction, and diffraction through gaps',
      'Apply Snell\'s law and calculate refractive index and critical angle for optical fibers',
      'Draw ray diagrams for converging lenses forming real and virtual images',
      'List EM spectrum components in order of frequency/wavelength and state uses and dangers',
      'Calculate distance from echoes using speed = 2d / t'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'v = f λ',
      'Snell\'s law: n = sin(i) / sin(r)',
      'Critical angle: sin(c) = 1 / n',
      'Echo distance: d = (v × t) / 2',
      'Speed of light in vacuum c = 3.0 × 10^8 m/s'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-04',
    chapterNumber: 4,
    title: 'Electricity & Magnetism',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Electric Charge & Electrostatic Charging by Friction',
      'Electric Fields & Field Lines',
      'Electric Current (I = Q/t) & Conventional vs Electron Flow',
      'Electromotive Force (e.m.f.) and Potential Difference (V = W/Q)',
      'Resistance & Ohm\'s Law (V = IR)',
      'Resistivity & Factors Affecting Resistance (Length, Area)',
      'Series and Parallel Circuit Rules',
      'Potential Dividers, LDRs and Thermistors',
      'Electrical Energy and Power (P = IV = I^2 R = V^2/R; E = Pt = IVt)',
      'Electrical Safety: Fuses, Circuit Breakers, Earthing'
    ],
    learningObjectives: [
      'Describe charge transfer by friction and electric fields around point charges and parallel plates',
      'Calculate current, charge, and potential difference using I = Q/t and V = W/Q',
      'Calculate equivalent resistance in series (R = R1 + R2) and parallel (1/R = 1/R1 + 1/R2)',
      'Analyze potential divider circuits incorporating thermistors (temperature sensor) and LDRs (light sensor)',
      'Calculate electrical power and energy consumption and determine appropriate fuse ratings'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'I = Q / t, V = W / Q, V = I R',
      'Series: R_total = R1 + R2 + ...',
      'Parallel: 1/R_total = 1/R1 + 1/R2',
      'Potential Divider: V_out = V_in × (R2 / (R1 + R2))',
      'Power: P = I V = I^2 R = V^2 / R',
      'Energy: E = P t = I V t'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-05',
    chapterNumber: 5,
    title: 'Electromagnetic Effects',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Magnetic Fields of Permanent Magnets and Solenoids',
      'Electromagnetic Induction (Faraday\'s Law & Lenz\'s Law)',
      'AC Generator & Slip Rings',
      'Transformers & Turn Ratios (Vp/Vs = Np/Ns)',
      'Transformer Efficiency & Power Transmission (Ip Vp = Is Vs)',
      'The Motor Effect & Fleming\'s Left-Hand Rule',
      'DC Electric Motor & Split-Ring Commutator'
    ],
    learningObjectives: [
      'Describe magnetic field patterns of bar magnets and solenoids using right-hand grip rule',
      'Explain electromagnetic induction when a wire cuts magnetic flux or field changes',
      'State factors affecting induced e.m.f. and explain action of slip rings in AC generators',
      'Calculate voltage and current ratios in step-up and step-down transformers',
      'Explain why high voltage is used in national power transmission to minimize I^2R heating losses',
      'Apply Fleming\'s Left-Hand Rule to determine direction of force on a current-carrying conductor'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Transformer equation: Vp / Vs = Np / Ns',
      'Ideal transformer power: Vp Ip = Vs Is',
      'Transmission power loss: P_loss = I^2 R_cable',
      'Fleming\'s LHR: Thumb = Force/Motion, First finger = Field, seCond finger = Current'
    ],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-06',
    chapterNumber: 6,
    title: 'Nuclear Physics',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'The Nuclear Model of the Atom (Rutherford Alpha Scattering)',
      'Proton Number (Z) and Nucleon Number (A)',
      'Isotopes & Radioactive Decay',
      'Alpha, Beta and Gamma Radiation (Nature, Ionization & Penetration)',
      'Nuclear Decay Equations',
      'Half-Life Calculations & Decay Curves',
      'Applications of Radioisotopes (Tracers, Smoke Detectors, Radiotherapy)',
      'Nuclear Fission (Chain Reaction) and Nuclear Fusion'
    ],
    learningObjectives: [
      'Describe the Rutherford alpha-particle scattering experiment and evidence for dense positive nucleus',
      'Compare alpha (helium nucleus), beta (high-speed electron), and gamma (EM ray) by ionising power and penetration',
      'Complete and balance nuclear equations for alpha and beta decay',
      'Determine half-life from decay curves and background-radiation-corrected counts',
      'Distinguish nuclear fission (splitting heavy nucleus) from fusion (combining light nuclei) as energy sources'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Alpha decay: A decreases by 4, Z decreases by 2',
      'Beta decay: A unchanged, Z increases by 1',
      'Count after n half-lives = Initial count / (2^n)'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0625-07',
    chapterNumber: 7,
    title: 'Space Physics',
    subjectCode: '0625',
    subjectName: 'Physics',
    subtopics: [
      'Earth, Sun, Moon System & Seasons, Day/Night, Moon Phases',
      'The Solar System & Planetary Orbits (Elliptical, Gravitational Attraction)',
      'Orbital Speed Equation (v = 2πr / T)',
      'Stars & The Lifecycle of Stars (Protostar, Main Sequence, Red Giant/Supergiant, Supernova, Neutron Star, Black Hole)',
      'The Sun as a Star & Nuclear Fusion (Hydrogen to Helium)',
      'Galaxies, The Universe & Astronomical Distances (Light-Year)',
      'Redshift of Distant Galaxies, Hubble Constant & Big Bang Evidence'
    ],
    learningObjectives: [
      'Explain planetary motion and calculate orbital speed using v = 2πr / T',
      'Describe star lifecycles for stars of solar mass vs much larger mass',
      'Explain that nuclear fusion of hydrogen into helium powers the Sun in thermal/gravitational equilibrium',
      'Describe the redshift of light from distant galaxies as evidence that the universe is expanding',
      'Define Hubble constant H0 = v / d and its relation to the age of the Universe'
    ],
    calculatorAllowed: true,
    formulaNotes: [
      'Orbital speed v = (2 × π × r) / T',
      'Hubble Constant H0 = v / d',
      'Age of Universe ≈ 1 / H0',
      '1 light-year ≈ 9.5 × 10^15 m'
    ],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  }
];

export const BIOLOGY_0610_TAXONOMY: ChapterTaxonomy[] = [
  {
    id: '0610-01',
    chapterNumber: 1,
    title: 'Characteristics & Classification of Living Organisms',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['7 Life Processes (MRS GREN)', 'Binomial Naming System', 'Dichotomous Keys', 'Five Kingdoms', 'Vertebrate & Arthropod Classes'],
    learningObjectives: ['Define the 7 characteristics of living organisms (Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition)', 'Construct and use dichotomous keys to identify unknown specimens', 'Describe defining features of vertebrates (mammals, birds, reptiles, amphibians, fish) and arthropods'],
    calculatorAllowed: true,
    formulaNotes: ['MRS GREN acronym', 'Binomial nomenclature: Genus (capitalized) species (lowercase)'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-02',
    chapterNumber: 2,
    title: 'Organization of the Organism & Cell Structure',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Plant vs Animal Cells', 'Specialized Cells (Ciliated, Red blood, Root hair, Xylem)', 'Levels of Organization (Cells, Tissues, Organs, Systems)', 'Magnification Formula (I = AM)'],
    learningObjectives: ['Identify cell structures (nucleus, cytoplasm, cell membrane, cell wall, chloroplasts, vacuole, mitochondria, ribosomes)', 'Calculate actual size and magnification using formula Image = Actual × Magnification', 'Describe adaptations of specialized cells to their physiological functions'],
    calculatorAllowed: true,
    formulaNotes: ['Magnification M = Image size (I) / Actual size (A)', 'Convert 1 mm = 1000 µm'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-03',
    chapterNumber: 3,
    title: 'Movement into and out of Cells',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Diffusion & Factors Affecting Rate', 'Osmosis & Water Potential', 'Turgor Pressure, Plasmolysis, Lysis', 'Active Transport & Carrier Proteins'],
    learningObjectives: ['Define diffusion as net movement of particles down a concentration gradient', 'Define osmosis as net movement of water molecules from higher to lower water potential through partially permeable membrane', 'Explain turgidity in plant cells and crenation/lysis in animal cells', 'Define active transport as movement against concentration gradient requiring ATP'],
    calculatorAllowed: true,
    formulaNotes: ['Rate of diffusion increases with higher temperature, steeper gradient, smaller distance, and greater surface area'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-04',
    chapterNumber: 4,
    title: 'Biological Molecules & Food Tests',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Carbohydrates, Lipids, Proteins & DNA', 'Benedict\'s Test for Reducing Sugars', 'Iodine Test for Starch', 'Biuret Test for Protein', 'Ethanol Emulsion Test for Lipids', 'DCPIP Test for Vitamin C'],
    learningObjectives: ['State chemical elements in carbohydrates (C, H, O), lipids (C, H, O), and proteins (C, H, O, N)', 'Describe food test procedures and positive color changes', 'Explain double-helix structure of DNA and base pairing rules (A-T, C-G)'],
    calculatorAllowed: true,
    formulaNotes: ['Benedict\'s: Blue -> Green -> Orange -> Brick-Red (heat needed)', 'Iodine: Brown -> Blue-black', 'Biuret: Blue -> Purple/Violet', 'Ethanol: Clear -> Milky white emulsion'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-05',
    chapterNumber: 5,
    title: 'Enzymes',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Enzyme Structure & Active Site', 'Lock-and-Key Hypothesis', 'Effect of Temperature & Denaturation', 'Effect of pH on Enzyme Activity'],
    learningObjectives: ['Define enzymes as biological catalysts that increase reaction rates without being consumed', 'Explain enzyme action using lock-and-key model with complementary substrate binding', 'Explain loss of enzyme activity at high temperatures and extreme pH due to denaturation'],
    calculatorAllowed: true,
    formulaNotes: ['Optimum temperature in humans ≈ 37°C', 'Denaturation involves irreversible change in tertiary protein shape of active site'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-06',
    chapterNumber: 6,
    title: 'Plant Nutrition',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Photosynthesis Word & Balanced Equations', 'Leaf Internal Anatomy & Adaptations', 'Chlorophyll & Light Absorption', 'Limiting Factors (Light, CO2, Temperature)'],
    learningObjectives: ['State photosynthesis equation: 6CO2 + 6H2O -> C6H12O6 + 6O2', 'Relate palisade mesophyll, spongy mesophyll, stomata, and xylem/phloem to leaf functions', 'Identify limiting factors on photosynthesis rate graphs'],
    calculatorAllowed: true,
    formulaNotes: ['Photosynthesis: 6CO2 + 6H2O -> C6H12O6 + 6O2 in the presence of light and chlorophyll'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-07',
    chapterNumber: 7,
    title: 'Human Nutrition',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Balanced Diet & Dietary Deficiencies (Scurvy, Rickets, Anemia, Kwashiorkor)', 'Digestive System Organs', 'Mechanical vs Chemical Digestion', 'Digestive Enzymes (Amylase, Maltase, Protease/Pepsin/Trypsin, Lipase)', 'Bile Functions', 'Villi Adaptations & Absorption'],
    learningObjectives: ['Describe components of a balanced diet and nutritional deficiency diseases', 'Distinguish mechanical digestion (teeth, peristalsis) from chemical digestion (enzymes)', 'State sites of production and action of digestive enzymes', 'Explain bile role in neutralizing stomach acid and emulsifying fats', 'Explain villi adaptations for rapid absorption (microvilli, lacteal, capillary network)'],
    calculatorAllowed: true,
    formulaNotes: ['Starch --(amylase)--> Maltose --(maltase)--> Glucose', 'Protein --(protease)--> Amino acids', 'Lipid --(lipase)--> Fatty acids + Glycerol'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-08',
    chapterNumber: 8,
    title: 'Transport in Plants',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Xylem Structure & Water Transport', 'Phloem Structure & Translocation of Sucrose/Amino Acids', 'Root Hair Cells & Water Uptake', 'Transpiration Stream & Transpiration Pull', 'Factors Affecting Transpiration Rate (Humidity, Wind, Temperature, Light)'],
    learningObjectives: ['Relate xylem lignified walls to water/ion transport and structural support', 'Describe translocation of sugars and amino acids in phloem from source to sink', 'Explain transpiration pull via cohesive water columns in xylem vessels', 'Analyze potometer experiments measuring rate of water uptake'],
    calculatorAllowed: true,
    formulaNotes: ['Transpiration rate increases with: higher temp, faster wind speed, brighter light, lower humidity'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-09',
    chapterNumber: 9,
    title: 'Transport in Animals',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Transport in Animals & Double Circulation', 'Heart Anatomy & Valves', 'Blood Vessels (Arteries, Veins, Capillaries Structure & Function)', 'Coronary Heart Disease (CHD) Risk Factors', 'Blood Components (Erythrocytes, Leucocytes, Platelets, Plasma)'],
    learningObjectives: ['Describe double circulation and advantages over single circulation', 'Trace blood flow through right and left atria and ventricles, aorta, vena cava, pulmonary artery/vein', 'Compare wall thickness, lumen diameter, and presence of valves in blood vessels', 'Describe role of platelets in clotting and white blood cells in phagocytosis and antibody production'],
    calculatorAllowed: true,
    formulaNotes: ['Left ventricle wall is thicker than right ventricle wall to pump blood at high pressure throughout body'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-10',
    chapterNumber: 10,
    title: 'Diseases & Immunity',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Pathogens (Bacteria, Viruses, Fungi, Protozoa)', 'Body Defenses (Mechanical, Chemical, Cellular)', 'Antibodies & Antigens', 'Active vs Passive Immunity', 'Vaccination & Herd Immunity'],
    learningObjectives: ['Define pathogen and describe transmission routes of infectious diseases', 'Explain phagocyte action (engulfing) and lymphocyte action (antibody synthesis)', 'Distinguish active immunity (memory cells formed) from passive immunity (temporary protection, no memory cells)', 'Explain role of vaccination in establishing herd immunity against epidemics'],
    calculatorAllowed: true,
    formulaNotes: ['Active immunity: memory cells produced; Passive immunity: ready-made antibodies introduced'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-11',
    chapterNumber: 11,
    title: 'Gas Exchange in Humans',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Lungs, Trachea, Bronchi, Bronchioles, Alveoli', 'Alveoli Adaptations for Gas Exchange', 'Ventilation Mechanics (Intercostal Muscles & Diaphragm)', 'Inspired vs Expired Air Composition', 'Effects of Exercise & Tobacco Smoke'],
    learningObjectives: ['Describe adaptations of alveoli (thin walls, large surface area, moist lining, dense capillaries)', 'Explain mechanism of inhalation and exhalation involving diaphragm and intercostal muscles', 'Compare inspired air (21% O2, 0.04% CO2) and expired air (16% O2, 4% CO2)', 'Describe effects of tar, nicotine, and carbon monoxide on respiratory health'],
    calculatorAllowed: true,
    formulaNotes: ['Inhalation: Diaphragm contracts/flattens, external intercostals contract, thorax volume increases, pressure decreases'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-12',
    chapterNumber: 12,
    title: 'Respiration',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Aerobic Respiration Equation', 'Anaerobic Respiration in Muscles (Lactic Acid)', 'Anaerobic Respiration in Yeast (Alcoholic Fermentation)', 'Oxygen Debt & Recovery Period'],
    learningObjectives: ['State balanced chemical equation for aerobic respiration: C6H12O6 + 6O2 -> 6CO2 + 6H2O', 'Compare energy yield of aerobic vs anaerobic respiration', 'Explain production of lactic acid during vigorous exercise and how oxygen debt is repaid during recovery'],
    calculatorAllowed: true,
    formulaNotes: ['Aerobic: C6H12O6 + 6O2 -> 6CO2 + 6H2O + Energy (36 ATP)', 'Anaerobic in muscles: Glucose -> Lactic acid', 'Anaerobic in yeast: Glucose -> Ethanol + Carbon dioxide'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-13',
    chapterNumber: 13,
    title: 'Excretion in Humans',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Excretory Products (Urea, CO2, Excess Salts/Water)', 'Deamination in Liver', 'Kidney Anatomy & Nephron Structure', 'Ultrafiltration & Selective Reabsorption', 'Kidney Dialysis & Kidney Transplants'],
    learningObjectives: ['Define excretion as removal of toxic waste products of metabolism from body', 'Explain deamination of excess amino acids into urea in the liver', 'Describe nephron function: ultrafiltration in Bowman\'s capsule and selective reabsorption of glucose in tubules', 'Compare kidney dialysis machines with kidney organ transplantation'],
    calculatorAllowed: true,
    formulaNotes: ['Ultrafiltration occurs under high pressure; all glucose is reabsorbed by active transport in proximal convoluted tubule'],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-14',
    chapterNumber: 14,
    title: 'Coordination & Response',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Central Nervous System (Brain & Spinal Cord)', 'Reflex Arc (Sensory, Relay, Motor Neurons, Synapses)', 'Eye Structure & Pupil Reflex & Accommodation', 'Endocrine System & Hormones (Adrenaline, Insulin, Glucagon)', 'Homeostasis & Negative Feedback (Thermoregulation & Blood Glucose)', 'Plant Tropic Responses (Phototropism, Gravitropism & Auxins)'],
    learningObjectives: ['Describe reflex arc pathway: Stimulus -> Receptor -> Sensory -> Relay -> Motor -> Effector -> Response', 'Explain eye accommodation for near and distant vision (ciliary muscles, suspensory ligaments, lens curvature)', 'Explain blood glucose regulation by insulin and glucagon via negative feedback', 'Explain auxins distribution causing shoot phototropism and root gravitropism'],
    calculatorAllowed: true,
    formulaNotes: ['Near object: Ciliary muscles contract, suspensory ligaments loosen, lens thickens', 'High glucose: Pancreas releases insulin, liver stores glycogen'],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-15',
    chapterNumber: 15,
    title: 'Drugs & Antibiotics',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Medicinal vs Misused Drugs', 'Antibiotics & Bacterial Cell Wall Disruption', 'Antibiotic Resistance & Superbugs (MRSA)', 'Effects of Alcohol & Heroin on Nervous System'],
    learningObjectives: ['Define drug as any substance taken into the body that modifies chemical reactions', 'Explain why antibiotics kill bacteria but are ineffective against viruses', 'Explain evolution of antibiotic resistance by natural selection of random mutations', 'Describe social and physiological impacts of alcohol abuse on the liver and brain'],
    calculatorAllowed: true,
    formulaNotes: ['Viruses lack cell walls and metabolic machinery, making them immune to antibiotics'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-16',
    chapterNumber: 16,
    title: 'Reproduction',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Asexual vs Sexual Reproduction', 'Flower Structure & Insect vs Wind Pollination', 'Fertilization and Seed Dispersal in Plants', 'Male & Female Human Reproductive Systems', 'Menstrual Cycle & Hormones (FSH, LH, Estrogen, Progesterone)', 'Fertilization, Pregnancy, Placenta Functions & STI Prevention'],
    learningObjectives: ['Compare advantages and disadvantages of asexual and sexual reproduction', 'Distinguish insect-pollinated flowers from wind-pollinated flowers by structural adaptations', 'Explain roles of FSH, LH, estrogen, and progesterone in regulating the menstrual cycle', 'Describe the exchange functions of the placenta between maternal and fetal blood supplies'],
    calculatorAllowed: true,
    formulaNotes: ['Estrogen repairs uterine lining; Progesterone maintains lining; LH triggers ovulation'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-17',
    chapterNumber: 17,
    title: 'Inheritance',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Chromosomes, Genes & Alleles', 'DNA Replication & Protein Synthesis', 'Mitosis vs Meiosis', 'Monohybrid Inheritance & Punnett Squares', 'Codominance & ABO Blood Groups', 'Sex-Linked Inheritance (Color Blindness)'],
    learningObjectives: ['Define genotype, phenotype, homozygous, heterozygous, dominant, and recessive', 'Compare mitosis (2 genetically identical diploid daughter cells) and meiosis (4 genetically diverse haploid gametes)', 'Construct genetic diagrams and Punnett squares to predict phenotypic ratios (e.g. 3:1, 1:1)', 'Explain codominance in ABO blood group system (IA, IB, Io) and sex linkage on X chromosomes'],
    calculatorAllowed: true,
    formulaNotes: ['Monohybrid heterozygous cross (Aa × Aa) -> 3:1 phenotypic ratio', 'Dihybrid heterozygous cross -> 9:3:3:1 ratio'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-18',
    chapterNumber: 18,
    title: 'Variation & Selection',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Continuous vs Discontinuous Variation', 'Mutation as Source of New Alleles', 'Natural Selection & Adaptations (Antibiotic Resistance, Peppered Moth)', 'Selective Breeding (Artificial Selection)'],
    learningObjectives: ['Distinguish continuous variation (bell-curve, multiple genes + environment) from discontinuous variation (discrete categories, single gene)', 'Describe mutation as spontaneous change in gene or chromosome structure', 'Explain natural selection by overproduction, variation, survival of the fittest, and inheritance of favorable alleles', 'Compare selective breeding by humans with natural selection in nature'],
    calculatorAllowed: true,
    formulaNotes: ['Discontinuous: blood groups; Continuous: height, body mass'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-19',
    chapterNumber: 19,
    title: 'Organisms & Their Environment',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Energy Flow & Sunlight as Energy Source', 'Food Chains, Food Webs & Trophic Levels', 'Pyramids of Numbers, Biomass & Energy', 'The Carbon Cycle & Photosynthesis/Respiration/Combustion', 'The Nitrogen Cycle (Nitrogen-Fixing, Nitrifying, Denitrifying Bacteria)', 'Population Growth Curves (Lag, Log, Stationary, Death Phase)'],
    learningObjectives: ['Explain why only about 10% of energy is transferred between consecutive trophic levels', 'Construct and interpret pyramids of numbers, biomass, and energy', 'Trace carbon atoms through photosynthesis, respiration, feeding, and combustion in carbon cycle', 'Explain roles of microorganisms in nitrogen cycle (Rhizobium, Nitrosomonas, Pseudomonas)'],
    calculatorAllowed: true,
    formulaNotes: ['Efficiency of energy transfer = (Energy in higher trophic level / Energy in lower level) × 100% ≈ 10%'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-20',
    chapterNumber: 20,
    title: 'Human Influences on Ecosystems',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Deforestation & Loss of Biodiversity', 'Pollution of Land, Water & Air', 'Eutrophication (Fertilizer Runoff, Algal Blooms, Anoxia)', 'Non-Biodegradable Plastics', 'Conservation of Species & Sustainable Resources'],
    learningObjectives: ['Explain causes and consequences of deforestation on carbon cycle and soil erosion', 'Detail the steps of eutrophication: fertilizer leach -> algal bloom -> light blocked -> plants die -> bacteria decompose -> oxygen depleted -> aquatic animals suffocate', 'Describe reasons for conserving endangered species and methods used (seed banks, captive breeding, nature reserves)'],
    calculatorAllowed: true,
    formulaNotes: ['Eutrophication: High nitrates -> Algal bloom -> Bacterial respiration -> Deoxygenation'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0610-21',
    chapterNumber: 21,
    title: 'Biotechnology & Genetic Modification',
    subjectCode: '0610',
    subjectName: 'Biology',
    subtopics: ['Use of Bacteria & Yeast in Biotechnology', 'Industrial Fermenters (Stirring, Aeration, Temperature/pH Control)', 'Recombinant DNA Technology & Plasmids', 'Restriction Enzymes & DNA Ligase', 'Genetically Modified Organisms (Insulin Production, Golden Rice, Herbicide Resistance)'],
    learningObjectives: ['Explain why bacteria are useful in biotechnology (rapid reproduction, presence of plasmids, shared genetic code)', 'Describe control of conditions in an industrial fermenter (water jacket, sparger, probes)', 'Outline steps in human insulin production using plasmids, restriction enzymes, and DNA ligase', 'Discuss advantages and risks of genetically modified crops'],
    calculatorAllowed: true,
    formulaNotes: ['Restriction enzyme cuts DNA at specific palindromic sequences leaving sticky ends; DNA ligase joins fragments'],
    tier: 'Extended',
    recommendedTimePerMarkMinutes: 1.25
  }
];

export const ESL_0510_TAXONOMY: ChapterTaxonomy[] = [
  {
    id: '0510-01',
    chapterNumber: 1,
    title: 'Exercise 1 — Short-Answer Information Transfer',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Skimming & Scanning Techniques', 'Locating Factual Details', 'Dates, Times, Quantities & Numbers', 'Avoiding Extraneous Information'],
    learningObjectives: ['Locate specific factual details in non-fiction informational texts', 'Transfer precise numbers, statistics, and proper nouns accurately', 'Formulate concise short answers that avoid unnecessary repetition'],
    calculatorAllowed: false,
    formulaNotes: ['Answers should be succinct; grammar errors not penalised if meaning is clear'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0510-02',
    chapterNumber: 2,
    title: 'Exercise 2 — Multiple Matching (Texts A–D)',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Matching Prompts to Source Paragraphs', 'Identifying Synonyms & Paraphrasing', 'Distinguishing Subtle Opinions & Distractors'],
    learningObjectives: ['Identify matching information across four related texts or sections (A, B, C, D)', 'Recognize paraphrased ideas and semantic synonyms', 'Detect distractors that repeat prompt keywords without fulfilling the question'],
    calculatorAllowed: false,
    formulaNotes: ['Cross off eliminated sections; confirm with exact semantic match in text'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0510-03',
    chapterNumber: 3,
    title: 'Exercise 3 — Note-Taking',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Categorizing Notes Under Headings', 'Bullet-Point Note Formulation', 'Selecting Key Points vs Minor Details'],
    learningObjectives: ['Extract key points from an extended article and categorize under specified headings', 'Write clear note-form bullet points that preserve factual meaning', 'Ensure all required mark points are distinct without overlapping'],
    calculatorAllowed: false,
    formulaNotes: ['Use clear note-form phrases; one distinct point per line'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0510-04',
    chapterNumber: 4,
    title: 'Exercise 4 — Summary Writing (100–120 Words)',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Content Point Selection (Up to 6 Marks)', 'Synthesis & Paraphrasing in Own Words', 'Cohesive Devices & Discourse Markers', 'Word Count Adherence (100–120 Words)'],
    learningObjectives: ['Identify 6 relevant content points addressing the dual-focus summary prompt', 'Rephrase source text points into candidate\'s own words with accurate grammar', 'Use sophisticated cohesive linking words (Furthermore, Consequently, In addition) to write a unified 100–120 word paragraph'],
    calculatorAllowed: false,
    formulaNotes: ['Max marks: 6 Content + 6 Language = 12 Marks', 'Keep strictly within 100-120 words'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0510-05',
    chapterNumber: 5,
    title: 'Exercise 5 — Informal Writing (Email to a Friend)',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Informal Register & Friendly Tone', 'Addressing All 3 Bullet Prompts', 'Narrative Variety & Descriptive Language', 'Organizing into 3–4 Structured Paragraphs'],
    learningObjectives: ['Adopt appropriate informal, lively register suitable for an email to a friend', 'Thoroughly address and develop all 3 required bullet points from the prompt', 'Demonstrate wide vocabulary range and varied sentence structures'],
    calculatorAllowed: false,
    formulaNotes: ['Word count: 120-160 words', 'Include friendly opening and sign-off'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  },
  {
    id: '0510-06',
    chapterNumber: 6,
    title: 'Exercise 6 — Extended Formal Writing (Article, Review, or Report)',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    subtopics: ['Formal / Semi-Formal Register', 'Incorporating Given Opinion Prompts Balanced with Original Ideas', 'Persuasive Rhetorical Devices & Structuring', 'Conclusion & Recommendations'],
    learningObjectives: ['Produce formal/semi-formal article, review, or report addressing the topic', 'Synthesize provided quotes and express balanced arguments and counter-arguments', 'Conclude with reasoned recommendation or forward-looking perspective'],
    calculatorAllowed: false,
    formulaNotes: ['Word count: 150-200 words', 'Ensure formal vocabulary, passive voice, and balanced paragraphs'],
    tier: 'Both',
    recommendedTimePerMarkMinutes: 1.25
  }
];

import { IGCSE_SUBJECTS } from '../../data/subjects';

export const ALL_TAXONOMIES: Record<string, ChapterTaxonomy[]> = {
  '0580': MATHEMATICS_0580_TAXONOMY,
  'cie-math-0580': MATHEMATICS_0580_TAXONOMY,
  '0620': CHEMISTRY_0620_TAXONOMY,
  'cie-chem-0620': CHEMISTRY_0620_TAXONOMY,
  '0625': PHYSICS_0625_TAXONOMY,
  'cie-physics-0625': PHYSICS_0625_TAXONOMY,
  '0610': BIOLOGY_0610_TAXONOMY,
  'cie-bio-0610': BIOLOGY_0610_TAXONOMY,
  '0510': ESL_0510_TAXONOMY,
  '0511': ESL_0510_TAXONOMY,
  'cie-esl-0510': ESL_0510_TAXONOMY,
};

const dynamicSubjectTaxonomies = new Map<string, ChapterTaxonomy[]>();

/**
 * Retrieve the chapter taxonomy for any subject code or ID (all 39 subjects supported)
 */
export function getTaxonomyForSubject(subjectCodeOrId: string): ChapterTaxonomy[] {
  if (!subjectCodeOrId) return MATHEMATICS_0580_TAXONOMY;
  const raw = subjectCodeOrId.trim();
  const normalized = raw.toLowerCase();

  // 1. Direct core subject matches
  if (normalized === '0580' || normalized === 'cie-math-0580' || normalized === 'cie 0580') {
    return MATHEMATICS_0580_TAXONOMY;
  }
  if (normalized === '0620' || normalized === 'cie-chem-0620' || normalized === 'cie 0620') {
    return CHEMISTRY_0620_TAXONOMY;
  }
  if (normalized === '0625' || normalized === 'cie-physics-0625' || normalized === 'cie 0625') {
    return PHYSICS_0625_TAXONOMY;
  }
  if (normalized === '0610' || normalized === 'cie-bio-0610' || normalized === 'cie 0610') {
    return BIOLOGY_0610_TAXONOMY;
  }
  if (normalized === '0510' || normalized === '0511' || normalized === 'cie-esl-0510' || normalized === 'cie 0510' || normalized === 'cie 0511') {
    return ESL_0510_TAXONOMY;
  }

  // 2. Exact match in pre-registered ALL_TAXONOMIES
  if (ALL_TAXONOMIES[raw] || ALL_TAXONOMIES[normalized]) {
    return ALL_TAXONOMIES[raw] || ALL_TAXONOMIES[normalized];
  }

  // 3. Dynamic subject cache check
  if (dynamicSubjectTaxonomies.has(normalized)) {
    return dynamicSubjectTaxonomies.get(normalized)!;
  }

  // 4. Resolve against official IGCSE_SUBJECTS database
  const foundSubject = IGCSE_SUBJECTS.find(s =>
    s.id.toLowerCase() === normalized ||
    s.code.toLowerCase() === normalized ||
    s.code.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized.replace(/[^a-z0-9]/g, '') ||
    s.code.toLowerCase().includes(normalized) ||
    s.id.toLowerCase().includes(normalized) ||
    s.name.toLowerCase() === normalized ||
    s.name.toLowerCase().includes(normalized) ||
    normalized.includes(s.id.toLowerCase())
  );

  if (foundSubject && foundSubject.topics && foundSubject.topics.length > 0) {
    const codeMatch = foundSubject.code.match(/([0-9]{4}|[0-9][A-Z0-9]{3})/i);
    const cleanCode = codeMatch ? codeMatch[1].toUpperCase() : foundSubject.code.replace(/[^a-zA-Z0-9]/g, '');
    const isLang = foundSubject.category === 'Languages';
    const isMath = foundSubject.category === 'Mathematics';
    const chapters: ChapterTaxonomy[] = foundSubject.topics.map((t, idx) => {
      const cleanTitle = t.replace(/^Paper\s*\d+\s*(Part\s*\d+)?:\s*/i, '').replace(/^Exercise\s*\d+:\s*/i, '').trim();
      return {
        id: `${cleanCode}-${String(idx + 1).padStart(2, '0')}`,
        chapterNumber: idx + 1,
        title: cleanTitle,
        subjectCode: foundSubject.code,
        subjectName: foundSubject.name,
        subtopics: [t, cleanTitle],
        learningObjectives: [
          `Master fundamental syllabus criteria for ${cleanTitle}`,
          `Apply command words and exam mark scheme conventions to ${cleanTitle}`,
          `Solve structured examination questions and avoid typical candidate pitfalls in ${cleanTitle}`
        ],
        calculatorAllowed: !isLang && (!isMath || idx > 0),
        formulaNotes: [],
        tier: 'Both',
        recommendedTimePerMarkMinutes: 1.25
      };
    });

    dynamicSubjectTaxonomies.set(normalized, chapters);
    dynamicSubjectTaxonomies.set(foundSubject.id.toLowerCase(), chapters);
    dynamicSubjectTaxonomies.set(foundSubject.code.toLowerCase(), chapters);
    return chapters;
  }

  // 5. Fallback heuristics for partial matches
  if (normalized.includes('0580') || (normalized.includes('math') && !normalized.includes('4ma1') && !normalized.includes('4mb1') && !normalized.includes('0606'))) {
    return MATHEMATICS_0580_TAXONOMY;
  }
  if (normalized.includes('0620') || (normalized.includes('chem') && !normalized.includes('4ch1'))) {
    return CHEMISTRY_0620_TAXONOMY;
  }
  if (normalized.includes('0625') || (normalized.includes('phys') && !normalized.includes('4ph1'))) {
    return PHYSICS_0625_TAXONOMY;
  }
  if (normalized.includes('0610') || (normalized.includes('bio') && !normalized.includes('4bi1'))) {
    return BIOLOGY_0610_TAXONOMY;
  }
  if (normalized.includes('0510') || normalized.includes('0511') || (normalized.includes('esl') && !normalized.includes('4es1') && !normalized.includes('9280'))) {
    return ESL_0510_TAXONOMY;
  }

  return MATHEMATICS_0580_TAXONOMY;
}

/**
 * Retrieve a specific chapter by its unique taxonomy ID (e.g. "0580-01", "0620-04", "4MA1-02")
 */
export function getChapterById(chapterId: string): ChapterTaxonomy | undefined {
  if (!chapterId) return undefined;
  for (const list of Object.values(ALL_TAXONOMIES)) {
    const found = list.find(c => c.id === chapterId);
    if (found) return found;
  }
  for (const list of dynamicSubjectTaxonomies.values()) {
    const found = list.find(c => c.id === chapterId);
    if (found) return found;
  }
  return undefined;
}
