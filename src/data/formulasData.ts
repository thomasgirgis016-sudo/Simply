import { FormulaItem } from '../types';

export const COMPREHENSIVE_FORMULAS: FormulaItem[] = [
  // ==========================================================
  // MATHEMATICS (CIE 0580 & EDEXCEL 4MA1)
  // ==========================================================
  {
    id: 'f-m-1',
    subjectId: 'cie-math-0580',
    topic: 'Quadratics & Factoring',
    name: 'Quadratic Formula',
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    whereVariables: 'a, b, c from standard quadratic equation ax² + bx + c = 0',
    units: 'Dimensionless / variable units',
    examTip: 'Watch out when b is negative! E.g. If b = -7, then -b becomes +7, and b² is (-7)² = 49 (never negative!).'
  },
  {
    id: 'f-m-2',
    subjectId: 'cie-math-0580',
    topic: 'Coordinate Geometry',
    name: 'Gradient, Midpoint & Length of a Line Segment',
    formula: 'm = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right), \\quad d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    whereVariables: '(x₁, y₁) and (x₂, y₂) are endpoints of the segment',
    units: 'Units of length (cm, m)',
    examTip: 'Perpendicular lines have gradients where m₁ × m₂ = -1 (negative reciprocal, e.g. 2/3 becomes -3/2).'
  },
  {
    id: 'f-m-3',
    subjectId: 'cie-math-0580',
    topic: 'Trigonometry (SOHCAHTOA & Sine/Cosine Rule)',
    name: 'Sine Rule & Cosine Rule',
    formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}, \\quad a^2 = b^2 + c^2 - 2bc\\cos(A)',
    whereVariables: 'a, b, c are side lengths; A, B, C are angles opposite to their respective sides',
    units: 'Sides in cm/m, Angles in degrees (°)',
    examTip: 'To find an unknown angle using Cosine rule: cos(A) = (b² + c² - a²) / (2bc). Use brackets on your calculator!'
  },
  {
    id: 'f-m-4',
    subjectId: 'cie-math-0580',
    topic: 'Trigonometry (SOHCAHTOA & Sine/Cosine Rule)',
    name: 'Area of Any Triangle',
    formula: '\\text{Area} = \\frac{1}{2}ab\\sin(C)',
    whereVariables: 'a and b are two known sides; C is the included angle between them',
    units: 'cm² or m²',
    examTip: 'Angle C MUST be the angle trapped directly between sides a and b (the included angle).'
  },
  {
    id: 'f-m-5',
    subjectId: 'cie-math-0580',
    topic: 'Mensuration (Perimeter, Area & Volume)',
    name: 'Arc Length & Area of a Sector',
    formula: '\\text{Arc Length} = \\frac{\\theta}{360} \\times 2\\pi r, \\quad \\text{Sector Area} = \\frac{\\theta}{360} \\times \\pi r^2',
    whereVariables: 'θ = angle at centre in degrees, r = radius',
    units: 'Length in cm, Area in cm²',
    examTip: 'If asked for the PERIMETER of a sector, remember to add the two radii: Perimeter = Arc Length + 2r!'
  },
  {
    id: 'f-m-6',
    subjectId: 'cie-math-0580',
    topic: 'Mensuration (Perimeter, Area & Volume)',
    name: 'Volume & Surface Area of a Sphere',
    formula: 'V = \\frac{4}{3}\\pi r^3, \\quad A = 4\\pi r^2',
    whereVariables: 'r = radius of sphere',
    units: 'Volume in cm³, Area in cm²',
    examTip: 'For a solid HEMISPHERE, Total Surface Area = Curved Area (2πr²) + Flat Base (πr²) = 3πr².'
  },
  {
    id: 'f-m-7',
    subjectId: 'cie-math-0580',
    topic: 'Mensuration (Perimeter, Area & Volume)',
    name: 'Volume & Curved Surface Area of a Cone',
    formula: 'V = \\frac{1}{3}\\pi r^2 h, \\quad A_{\\text{curved}} = \\pi r l',
    whereVariables: 'r = base radius, h = perpendicular vertical height, l = slant height (where l² = r² + h²)',
    units: 'Volume in cm³, Area in cm²',
    examTip: 'Do not confuse vertical height h with slant height l! Use Pythagoras l = √(r² + h²).'
  },
  {
    id: 'f-m-8',
    subjectId: 'cie-math-0580',
    topic: 'Algebra & Sequences',
    name: 'Arithmetic (Linear) & Geometric nth Term',
    formula: 'T_n = a + (n - 1)d, \\quad T_n = a \\times r^{n-1}',
    whereVariables: 'a = first term, d = common difference, r = common ratio, n = term position',
    units: 'Dimensionless',
    examTip: 'For quadratic sequences an² + bn + c: 2a = 2nd difference; 3a + b = T₂ - T₁; a + b + c = T₁.'
  },
  {
    id: 'f-m-9',
    subjectId: 'cie-math-0580',
    topic: 'Statistics & Cumulative Frequency',
    name: 'Mean from Grouped Frequency Table',
    formula: '\\bar{x} = \\frac{\\sum (f \\times x)}{\\sum f}',
    whereVariables: 'f = frequency of each group, x = midpoint of each group interval',
    units: 'Units of the measured variable',
    examTip: 'Always calculate midpoints accurately: midpoint = (lower bound + upper bound) / 2.'
  },
  {
    id: 'f-m-10',
    subjectId: 'cie-math-0580',
    topic: 'Vectors & Transformations',
    name: 'Vector Magnitude & Column Vectors',
    formula: '|\\vec{v}| = \\sqrt{x^2 + y^2}, \\quad \\vec{AB} = \\vec{OB} - \\vec{OA}',
    whereVariables: 'x = horizontal displacement, y = vertical displacement',
    units: 'Length units (cm/m)',
    examTip: 'Vector AB is always position vector of B minus position vector of A.'
  },

  // ==========================================================
  // PHYSICS (CIE 0625 & EDEXCEL 4PH1)
  // ==========================================================
  {
    id: 'f-p-1',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    name: 'Speed, Acceleration & Average Velocity',
    formula: 'v = \\frac{s}{t}, \\quad a = \\frac{v - u}{t}, \\quad s = \\frac{u + v}{2}t',
    whereVariables: 's = distance (m), t = time (s), u = initial velocity (m/s), v = final velocity (m/s), a = acceleration (m/s²)',
    units: 'Velocity in m/s, Acceleration in m/s²',
    examTip: 'In a Velocity-Time graph: Gradient = Acceleration; Total Area under graph = Distance travelled.'
  },
  {
    id: 'f-p-2',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    name: 'Newton\'s Second Law, Weight & Hooke\'s Law',
    formula: 'F = m \\times a, \\quad W = m \\times g, \\quad F = k \\times x',
    whereVariables: 'm = mass (kg), g = 9.8 N/kg, k = spring constant (N/m), x = extension (m)',
    units: 'Force in Newtons (N)',
    examTip: 'Mass is the amount of matter (constant everywhere); Weight is a gravitational force that changes with g.'
  },
  {
    id: 'f-p-3',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    name: 'Momentum, Impulse & Conservation',
    formula: 'p = m \\times v, \\quad \\text{Impulse} = F\\Delta t = \\Delta p = m(v - u)',
    whereVariables: 'p = momentum (kg m/s), F = impact force (N), Δt = collision time (s)',
    units: 'Momentum in kg·m/s or N·s',
    examTip: 'Crumple zones and airbags increase collision time Δt, thereby reducing resultant impact force F on passengers.'
  },
  {
    id: 'f-p-4',
    subjectId: 'cie-physics-0625',
    topic: 'Motion, Forces & Energy (Kinematics & Newton Laws)',
    name: 'Work Done, Kinetic & Potential Energy, Power',
    formula: 'W = F \\times d, \\quad E_k = \\frac{1}{2}mv^2, \\quad \\Delta E_p = mg\\Delta h, \\quad P = \\frac{W}{t} = \\frac{\\Delta E}{t}',
    whereVariables: 'W, E in Joules (J); d, h in metres (m); P in Watts (W = J/s)',
    units: 'Energy in Joules (J), Power in Watts (W)',
    examTip: 'Efficiency = (Useful Energy Output / Total Energy Input) × 100%. Efficiency is never over 100%!'
  },
  {
    id: 'f-p-5',
    subjectId: 'cie-physics-0625',
    topic: 'Thermal Physics (States of Matter & Heat Transfer)',
    name: 'Density & Pressure in Fluids',
    formula: '\\rho = \\frac{m}{V}, \\quad p = \\frac{F}{A}, \\quad \\Delta p = \\rho g \\Delta h',
    whereVariables: 'ρ = density (kg/m³), p = pressure (Pa or N/m²), h = liquid depth (m)',
    units: 'Density in kg/m³, Pressure in Pascals (Pa)',
    examTip: 'Pressure increases with depth in liquids and acts equally in all directions.'
  },
  {
    id: 'f-p-6',
    subjectId: 'cie-physics-0625',
    topic: 'Thermal Physics (States of Matter & Heat Transfer)',
    name: 'Specific Heat Capacity & Latent Heat',
    formula: 'Q = m \\times c \\times \\Delta T, \\quad Q = m \\times L',
    whereVariables: 'Q = thermal energy (J), c = specific heat capacity (J/(kg °C)), L = specific latent heat (J/kg)',
    units: 'Thermal energy in Joules (J)',
    examTip: 'During a change of state (melting/boiling), temperature remains constant because energy is used to break intermolecular bonds.'
  },
  {
    id: 'f-p-7',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    name: 'Wave Speed, Frequency & Period',
    formula: 'v = f \\times \\lambda, \\quad T = \\frac{1}{f}',
    whereVariables: 'v = wave speed (m/s), f = frequency (Hz), λ = wavelength (m), T = time period (s)',
    units: 'Frequency in Hertz (Hz), Wavelength in metres (m)',
    examTip: 'When light enters glass from air: frequency remains constant, wave speed decreases, so wavelength decreases.'
  },
  {
    id: 'f-p-8',
    subjectId: 'cie-physics-0625',
    topic: 'Waves (Light, Sound, Reflection & Refraction)',
    name: 'Snell\'s Law & Critical Angle (Total Internal Reflection)',
    formula: 'n = \\frac{\\sin(i)}{\\sin(r)} = \\frac{c}{v} = \\frac{1}{\\sin(c)}',
    whereVariables: 'n = refractive index, i = angle in air, r = angle in glass/water, c = critical angle',
    units: 'n is dimensionless',
    examTip: 'TIR occurs ONLY when: 1) Light travels from denser to less dense medium; 2) Angle of incidence i > critical angle c.'
  },
  {
    id: 'f-p-9',
    subjectId: 'cie-physics-0625',
    topic: 'Electricity & Magnetism (Circuits & Induction)',
    name: 'Ohm\'s Law, Electrical Power & Energy',
    formula: 'V = I \\times R, \\quad P = I \\times V = I^2 R = \\frac{V^2}{R}, \\quad E = P \\times t = I \\times V \\times t',
    whereVariables: 'V = voltage (V), I = current (A), R = resistance (Ω), P = power (W), t = time (s)',
    units: 'Volts (V), Amperes (A), Ohms (Ω), Watts (W)',
    examTip: 'In series: R_total = R₁ + R₂. In parallel: 1/R_total = 1/R₁ + 1/R₂. Total parallel resistance is always less than smallest branch.'
  },
  {
    id: 'f-p-10',
    subjectId: 'cie-physics-0625',
    topic: 'Electricity & Magnetism (Circuits & Induction)',
    name: 'Transformers & Power Transmission Efficiency',
    formula: '\\frac{V_p}{V_s} = \\frac{N_p}{N_s} = \\frac{I_s}{I_p}, \\quad P_{\\text{loss}} = I^2 R',
    whereVariables: 'V = voltage, N = number of turns, I = current, p = primary, s = secondary',
    units: 'Volts (V), Amperes (A)',
    examTip: 'Step-up transformers increase voltage, which reduces current, drastically minimizing I²R heating losses in transmission cables.'
  },

  // ==========================================================
  // CHEMISTRY (CIE 0620 & EDEXCEL 4CH1)
  // ==========================================================
  {
    id: 'f-c-1',
    subjectId: 'cie-chem-0620',
    topic: 'Stoichiometry & Mole Calculations',
    name: 'Solid, Gas & Solution Mole Equations',
    formula: 'n = \\frac{m}{M_r}, \\quad n = \\frac{V}{24\\text{ dm}^3}, \\quad n = C \\times V',
    whereVariables: 'n = moles (mol), m = mass (g), Mr = molar mass (g/mol), V = volume, C = concentration (mol/dm³)',
    units: 'Moles (mol), Concentration (mol/dm³ or g/dm³)',
    examTip: 'Always convert cm³ to dm³ by dividing by 1000 before plugging into n = C × V!'
  },
  {
    id: 'f-c-2',
    subjectId: 'cie-chem-0620',
    topic: 'Stoichiometry & Mole Calculations',
    name: 'Percentage Yield & Atom Economy',
    formula: '\\%\\text{ Yield} = \\frac{\\text{Actual Mass}}{\\text{Theoretical Mass}} \\times 100\\%, \\quad \\%\\text{ Atom Economy} = \\frac{M_r\\text{ of desired product}}{\\sum M_r\\text{ of all reactants}} \\times 100\\%',
    whereVariables: 'Theoretical mass calculated from balanced stoichiometric equation',
    units: 'Percentages (%)',
    examTip: 'Theoretical yield assumes 100% conversion. Actual yield is lower due to reversible steps, incomplete reaction, or filtration loss.'
  },
  {
    id: 'f-c-3',
    subjectId: 'cie-chem-0620',
    topic: 'Chemical Energetics & Exothermic/Endothermic',
    name: 'Bond Energy & Enthalpy Change Calculation',
    formula: '\\Delta H = \\sum (\\text{Bonds Broken}) - \\sum (\\text{Bonds Formed})',
    whereVariables: 'Bonds broken = Endothermic (positive +); Bonds formed = Exothermic (negative -)',
    units: 'kJ/mol',
    examTip: 'If ΔH is negative (ΔH < 0), reaction is EXOTHERMIC (temperature rises). If positive, ENDOTHERMIC.'
  },
  {
    id: 'f-c-4',
    subjectId: 'cie-chem-0620',
    topic: 'Chemical Reactions (Rates & Reversible / Haber)',
    name: 'Rate of Reaction Equations',
    formula: '\\text{Rate} = \\frac{\\text{Volume of gas produced (cm}^3\\text{)}}{\\text{Time (s)}}, \\quad \\text{Rate} = \\frac{\\text{Mass of reactant lost (g)}}{\\text{Time (s)}}',
    whereVariables: 'Measured from slope (gradient) of volume-time or mass-time graphs',
    units: 'cm³/s or g/s',
    examTip: 'Initial rate is highest at t = 0 (steepest gradient) because reactant concentration is highest $\\rightarrow$ maximum collision frequency.'
  },

  // ==========================================================
  // COMPUTER SCIENCE & COMMERCE
  // ==========================================================
  {
    id: 'f-cs-1',
    subjectId: 'cie-cs-0478',
    topic: 'Data Representation (Binary, Hexadecimal, Sound & Images)',
    name: 'Sound & Image File Size Calculation',
    formula: '\\text{Image Size (bits)} = W \\times H \\times D, \\quad \\text{Audio Size (bits)} = S \\times R \\times C \\times t',
    whereVariables: 'W = width, H = height (pixels), D = colour depth (bpp); S = sample rate (Hz), R = resolution (bits), C = channels (1 for mono, 2 for stereo), t = duration (s)',
    units: 'Bits (divide by 8 for Bytes; divide by 1024 or 1000 for KiB/KB)',
    examTip: 'Always check if question asks for Bytes, Kilobytes, or Megabytes! 1 Byte = 8 bits.'
  },
  {
    id: 'f-econ-1',
    subjectId: 'cie-econ-0455',
    topic: 'The Allocation of Resources (Supply, Demand, Elasticity)',
    name: 'Price Elasticity of Demand (PED) & Supply (PES)',
    formula: '\\text{PED} = \\frac{\\% \\Delta \\text{ Quantity Demanded}}{\\% \\Delta \\text{ Price}}, \\quad \\text{PES} = \\frac{\\% \\Delta \\text{ Quantity Supplied}}{\\% \\Delta \\text{ Price}}',
    whereVariables: '%Δ = [(New - Original) / Original] × 100%',
    units: 'Dimensionless ratio',
    examTip: 'PED is always negative (law of demand), but economists often state absolute value. |PED| > 1 = Elastic; |PED| < 1 = Inelastic.'
  },
  {
    id: 'f-acc-1',
    subjectId: 'cie-accounting-0452',
    topic: 'Interpretation and Ratio Analysis (Liquidity, Profitability, ROE)',
    name: 'Profitability & Liquidity Accounting Ratios',
    formula: '\\text{Gross Margin} = \\frac{\\text{Gross Profit}}{\\text{Revenue}} \\times 100\\%, \\quad \\text{Current Ratio} = \\frac{\\text{Current Assets}}{\\text{Current Liabilities}}',
    whereVariables: 'Quick / Acid Test Ratio = (Current Assets - Inventory) / Current Liabilities',
    units: 'Margin in %, Liquidity as ratio (e.g. 1.8 : 1)',
    examTip: 'Standard ideal Current Ratio is 1.5:1 to 2:1. Standard ideal Quick Ratio is 1:1.'
  },
  {
    id: 'f-m-11',
    subjectId: 'cie-math-0580',
    topic: 'Number & Standard Form',
    name: 'Compound Interest & Exponential Growth / Decay',
    formula: 'A = P \\left(1 + \\frac{r}{100}\\right)^n, \\quad A = P \\left(1 - \\frac{r}{100}\\right)^n',
    whereVariables: 'A = final amount, P = principal initial amount, r = interest rate per period (%), n = number of periods',
    units: 'Currency / quantity units',
    examTip: 'For depreciation, remember to SUBTRACT: (1 - r/100). Do not use simple interest I = Prt unless specifically stated!'
  },
  {
    id: 'f-m-12',
    subjectId: 'cie-math-0580',
    topic: 'Algebra & Sequences',
    name: 'Direct & Inverse Proportion',
    formula: 'y = k x^n \\quad (\\text{Direct}), \\quad y = \\frac{k}{x^n} \\quad (\\text{Inverse})',
    whereVariables: 'k = constant of proportionality, n = power (e.g. n=1 for x, n=2 for x², n=3 for x³)',
    units: 'Variable units',
    examTip: 'Always find the numerical value of k first using the given pair of values before calculating the target variable.'
  },
  {
    id: 'f-m-13',
    subjectId: 'cie-math-0580',
    topic: 'Probability & Venn Diagrams',
    name: 'Addition & Multiplication Probability Rules',
    formula: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B), \\quad P(A \\cap B) = P(A) \\times P(B|A)',
    whereVariables: 'P(A ∪ B) = P(A or B), P(A ∩ B) = P(A and B); for mutually exclusive events P(A ∩ B) = 0',
    units: 'Probability between 0 and 1 (fractions or decimals)',
    examTip: 'In tree diagrams: multiply along branches (AND rule), add down column of branches (OR rule).'
  },
  {
    id: 'f-p-11',
    subjectId: 'cie-physics-0625',
    topic: 'Thermal Physics (States of Matter & Heat Transfer)',
    name: 'Boyle\'s Law (Gas Pressure and Volume)',
    formula: 'P_1 V_1 = P_2 V_2 \\quad (\\text{at constant temperature})',
    whereVariables: 'P₁, P₂ = pressure in Pa or N/m²; V₁, V₂ = volume in cm³ or m³',
    units: 'Pa, m³',
    examTip: 'Temperature must remain constant. Pressure is inversely proportional to volume: if volume halves, pressure doubles.'
  },
  {
    id: 'f-p-12',
    subjectId: 'cie-physics-0625',
    topic: 'Nuclear Physics (Radioactivity & Half-life)',
    name: 'Half-Life & Radioactive Decay Law',
    formula: 'N(t) = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{t_{1/2}}}, \\quad \\text{Count Rate} = \\frac{\\text{Initial Count}}{2^n}',
    whereVariables: 'N₀ = initial activity/count, t = elapsed time, t_{1/2} = half-life duration, n = number of half-lives',
    units: 'Becquerels (Bq) or counts per minute (cpm)',
    examTip: 'Always subtract background radiation from the measured detector reading BEFORE calculating half-life!'
  },
  {
    id: 'f-p-13',
    subjectId: 'cie-physics-0625',
    topic: 'Space Physics (Planets, Stars & Redshift)',
    name: 'Orbital Speed & Redshift (Hubble\'s Law)',
    formula: 'v = \\frac{2\\pi r}{T}, \\quad \\frac{\\Delta \\lambda}{\\lambda_0} = \\frac{v}{c}, \\quad v = H_0 d',
    whereVariables: 'v = orbital speed or galaxy recession velocity, r = orbital radius, T = orbital period, H₀ = Hubble constant, d = distance',
    units: 'm/s, km/s, light years or Mpc',
    examTip: 'Redshift shows that distant galaxies are moving away from Earth, proving cosmic expansion originated from the Big Bang.'
  },
  {
    id: 'f-c-5',
    subjectId: 'cie-chem-0620',
    topic: 'Stoichiometry & Mole Calculations',
    name: 'Titration Neutralisation & Concentration Conversion',
    formula: 'C (\\text{g/dm}^3) = C (\\text{mol/dm}^3) \\times M_r, \\quad \\frac{C_a V_a}{n_a} = \\frac{C_b V_b}{n_b}',
    whereVariables: 'Ca, Va = acid conc & volume; Cb, Vb = base conc & volume; na, nb = stoichiometric coefficients from balanced equation',
    units: 'g/dm³, mol/dm³',
    examTip: 'In titration calculations, convert cm³ to dm³ by dividing by 1000, and ensure concordant titres are within 0.10 cm³.'
  },
  {
    id: 'f-c-6',
    subjectId: 'cie-chem-0620',
    topic: 'Atoms, Elements and Compounds (Bonding & Lattice)',
    name: 'Relative Atomic Mass (Ar) from Isotope Abundances',
    formula: 'A_r = \\frac{\\sum (\\text{Isotopic Mass} \\times \\% \\text{ Abundance})}{100}',
    whereVariables: 'E.g. for Chlorine: Ar = (35 × 75 + 37 × 25) / 100 = 35.5',
    units: 'Dimensionless relative scale',
    examTip: 'Do NOT round chlorine to 35 or 36! Its syllabus relative atomic mass is strictly 35.5.'
  },
  {
    id: 'f-cs-2',
    subjectId: 'cie-cs-0478',
    topic: 'Data Transmission (Packets, Encryption, Error checking)',
    name: 'Data Transmission Time & Two\'s Complement Range',
    formula: '\\text{Download Time (s)} = \\frac{\\text{File Size (bits)}}{\\text{Bandwidth (bits per second)}}, \\quad \\text{Range} = [-2^{n-1}, +2^{n-1} - 1]',
    whereVariables: 'n = number of bits (for 8-bit byte: range is -128 to +127)',
    units: 'Seconds (s)',
    examTip: 'Always convert MegaBYTES to bits before calculating transfer time: multiply by 8, then by 1,000,000 (or 1024²).'
  },
  {
    id: 'f-econ-2',
    subjectId: 'cie-econ-0455',
    topic: 'Macroeconomic Policies & Global Economy',
    name: 'Consumer Price Index (Inflation) & Real GDP',
    formula: '\\text{Inflation Rate (\\%)} = \\frac{\\text{CPI}_2 - \\text{CPI}_1}{\\text{CPI}_1} \\times 100\\%, \\quad \\text{Real GDP} = \\frac{\\text{Nominal GDP}}{\\text{CPI}} \\times 100',
    whereVariables: 'CPI = Consumer Price Index weighted basket of consumer goods and services',
    units: 'Percentage (%)',
    examTip: 'Real GDP strips out inflation effects, revealing genuine changes in physical economic output.'
  },
  {
    id: 'f-acc-2',
    subjectId: 'cie-accounting-0452',
    topic: 'Interpretation and Ratio Analysis (Liquidity, Profitability, ROE)',
    name: 'Return on Capital Employed (ROCE) & Working Capital',
    formula: '\\text{ROCE} = \\frac{\\text{Operating Profit}}{\\text{Capital Employed}} \\times 100\\%, \\quad \\text{Working Capital} = \\text{Current Assets} - \\text{Current Liabilities}',
    whereVariables: 'Capital Employed = Non-Current Liabilities + Owner\'s Equity (or Total Assets - Current Liabilities)',
    units: 'ROCE in %, Working Capital in currency',
    examTip: 'A higher ROCE indicates more efficient generation of profit from the financial capital invested in the business.'
  },

  // ==========================================================
  // BIOLOGY (CIE 0610 & EDEXCEL 4BI1)
  // ==========================================================
  {
    id: 'f-b-1',
    subjectId: 'cie-bio-0610',
    topic: 'Cell Structure & Organisation',
    name: 'Magnification Equation (M = I / A)',
    formula: 'M = \\frac{I}{A}, \\quad A = \\frac{I}{M}, \\quad I = M \\times A',
    whereVariables: 'M = Magnification (dimensionless ratio), I = Image size (measured with ruler), A = Actual size of specimen',
    units: 'Convert image and actual size to identical units! 1 mm = 1000 µm, 1 cm = 10 mm = 10,000 µm',
    examTip: 'Examiner trap: Measure image with a millimetre ruler, multiply by 1000 to convert to micrometres (µm), THEN divide by actual size.'
  },
  {
    id: 'f-b-2',
    subjectId: 'cie-bio-0610',
    topic: 'Plant Nutrition & Photosynthesis',
    name: 'Balanced Photosynthesis Chemical Equation',
    formula: '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow[\\text{chlorophyll}]{\\text{light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    whereVariables: 'Carbon dioxide + water yields glucose + oxygen in chloroplasts containing chlorophyll',
    units: 'Equimolar gas conversion (6 mol CO₂ produce 6 mol O₂)',
    examTip: 'Examiners award zero marks for unbalanced chemical symbols! You must write 6CO₂ and 6O₂ with light & chlorophyll written over/under arrow.'
  },
  {
    id: 'f-b-3',
    subjectId: 'cie-bio-0610',
    topic: 'Respiration & Gas Exchange',
    name: 'Aerobic & Anaerobic Respiration Equations',
    formula: '\\text{Aerobic: } \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\quad | \\quad \\text{Anaerobic (Muscle): } \\text{C}_6\\text{H}_{12}\\text{O}_6 \\rightarrow 2\\text{C}_3\\text{H}_6\\text{O}_3 \\text{ (Lactic Acid)}',
    whereVariables: 'Anaerobic in Yeast (Fermentation): C₆H₁₂O₆ → 2C₂H₅OH (Ethanol) + 2CO₂',
    units: 'Energy released per mole glucose: ~2830 kJ (aerobic) vs ~150 kJ (anaerobic)',
    examTip: 'Anaerobic respiration in human muscle produces ONLY lactic acid (no carbon dioxide!). Carbon dioxide is only produced in yeast anaerobic respiration.'
  },
  {
    id: 'f-b-4',
    subjectId: 'cie-bio-0610',
    topic: 'Transport in Animals (Circulation)',
    name: 'Cardiac Output & Heart Rate',
    formula: '\\text{Cardiac Output } (\\text{cm}^3/\\text{min}) = \\text{Stroke Volume } (\\text{cm}^3) \\times \\text{Heart Rate } (\\text{beats/min})',
    whereVariables: 'Stroke Volume = volume of blood pumped per ventricle contraction; Heart Rate = beats per minute',
    units: 'cm³/min or dm³/min (1 dm³ = 1000 cm³)',
    examTip: 'During intense aerobic exercise, both stroke volume and heart rate increase simultaneously to supply oxygenated blood to contracting muscles.'
  },
  {
    id: 'f-b-5',
    subjectId: 'cie-bio-0610',
    topic: 'Human Nutrition & Diet',
    name: 'Body Mass Index (BMI)',
    formula: '\\text{BMI} = \\frac{\\text{Mass in kilograms}}{(\\text{Height in metres})^2} = \\frac{m}{h^2}',
    whereVariables: 'm = mass in kg, h = vertical stature height in metres',
    units: 'kg/m²',
    examTip: 'Remember to square height FIRST before dividing into mass. E.g. 70 kg / (1.75 m)² = 70 / 3.0625 = 22.9 kg/m².'
  },
  {
    id: 'f-b-6',
    subjectId: 'cie-bio-0610',
    topic: 'Experimental Biology & Ecology',
    name: 'Percentage Change & Surface Area to Volume Ratio',
    formula: '\\%\\text{ Change} = \\frac{\\text{Final} - \\text{Initial}}{\\text{Initial}} \\times 100\\%, \\quad \\text{SA:V Ratio} = \\frac{\\text{Total Surface Area}}{\\text{Volume}}',
    whereVariables: 'Used in osmosis experiments (chip mass/length change) and heat retention in organisms',
    units: 'Percentage (%) or ratio unitless (e.g. 6 : 1)',
    examTip: 'If potato chip loses mass, percentage change MUST have a negative sign (e.g. -12.5%)!'
  },

  // ==========================================================
  // CHEMISTRY QUALITATIVE ANALYSIS & DATA (CIE 0620 & 4CH1)
  // ==========================================================
  {
    id: 'f-c-7',
    subjectId: 'cie-chem-0620',
    topic: 'Qualitative Analysis (Ion Tests)',
    name: 'Aqueous Cation Tests (NaOH & NH₃ Precipitation)',
    formula: '\\text{Cu}^{2+} \\rightarrow \\text{Light blue ppt} \\quad | \\quad \\text{Fe}^{2+} \\rightarrow \\text{Green ppt} \\quad | \\quad \\text{Fe}^{3+} \\rightarrow \\text{Red-brown ppt}',
    whereVariables: 'Al³⁺: White ppt soluble in excess NaOH (colourless), insoluble in NH₃ | Zn²⁺: White ppt soluble in excess NaOH & excess NH₃ | Ca²⁺: White ppt insoluble in excess NaOH, no ppt with NH₃',
    units: 'Precipitate observations & colour shifts',
    examTip: 'To distinguish Al³⁺ from Zn²⁺: add excess aqueous ammonia (NH₃). Zn²⁺ precipitate dissolves to give colourless solution, whereas Al³⁺ precipitate remains insoluble.'
  },
  {
    id: 'f-c-8',
    subjectId: 'cie-chem-0620',
    topic: 'Qualitative Analysis (Ion Tests)',
    name: 'Anion Tests (Carbonate, Halides, Sulfate, Nitrate)',
    formula: '\\text{Cl}^- \\rightarrow \\text{White ppt (AgCl)}, \\quad \\text{Br}^- \\rightarrow \\text{Cream ppt (AgBr)}, \\quad \\text{I}^- \\rightarrow \\text{Yellow ppt (AgI)}',
    whereVariables: 'Halides: Acidify with dilute HNO₃ + aqueous AgNO₃ | Sulfate (SO₄²⁻): Acidify with dilute HNO₃ + Ba(NO₃)₂ → White ppt (BaSO₄) | Carbonate: Add dilute HCl → Effervescence of CO₂',
    units: 'Qualitative precipitate & gas evolution',
    examTip: 'Always acidify with dilute nitric acid (HNO₃) first! Never acidify halide tests with hydrochloric acid (HCl), because HCl contains chloride ions and produces a false positive white precipitate.'
  },
  {
    id: 'f-c-9',
    subjectId: 'cie-chem-0620',
    topic: 'Qualitative Analysis (Gases & Flame Tests)',
    name: 'Gas Identification & Flame Tests',
    formula: '\\text{Gases: } \\text{H}_2 \\text{ (pop with lighted splint)}, \\; \\text{O}_2 \\text{ (relights glowing splint)}, \\; \\text{CO}_2 \\text{ (milky limewater)}, \\; \\text{Cl}_2 \\text{ (bleaches litmus)}',
    whereVariables: 'Flame tests: Li⁺ (Crimson red), Na⁺ (Persistent yellow), K⁺ (Lilac), Ca²⁺ (Orange-red), Cu²⁺ (Blue-green), Ba²⁺ (Apple green)',
    units: 'Flame emission colors & gas chemical reactions',
    examTip: 'Ammonia (NH₃) is the ONLY syllabus alkaline gas: it turns damp red litmus paper blue and produces dense white smoke of NH₄Cl with concentrated HCl fumes.'
  },
  {
    id: 'f-c-10',
    subjectId: 'cie-chem-0620',
    topic: 'Acids, Bases and Salts',
    name: 'Solubility Rules for Common Inorganic Salts',
    formula: '\\text{All Nitrates & Group 1 Salts Soluble} \\quad | \\quad \\text{All Carbonates Insoluble (except Gp 1 & NH}_4^+)',
    whereVariables: 'Chlorides: All soluble EXCEPT AgCl & PbCl₂ | Sulfates: All soluble EXCEPT BaSO₄, PbSO₄ & CaSO₄ (sparingly) | Hydroxides: Insoluble EXCEPT Group 1, NH₄⁺ and Ca(OH)₂ (slightly)',
    units: 'Solubility rules (sol. / insol.)',
    examTip: 'To prepare an insoluble salt (like BaSO₄ or PbI₂), use precipitation: mix two soluble salt solutions, filter the precipitate, wash with distilled water, and dry.'
  }
];
