// Universal IGCSE Knowledge Engine
// Provides syllabus-accurate, mark-scheme aligned tutorials for ANY topic across IGCSE subjects
// Guaranteed zero-key instant explanations with LaTeX math, chemical equations, and examiner tips.

export interface TopicExplanation {
  title: string;
  subject: string;
  markdown: string;
}

export function searchUniversalKnowledge(query: string, activeSubjectName: string, examBoard: string): string | null {
  const q = query.toLowerCase().trim();
  const sub = (activeSubjectName || '').toLowerCase();

  const isMathSubject = sub.includes('math') || sub.includes('0580') || sub.includes('4ma1');
  const isChemSubject = sub.includes('chem') || sub.includes('0620') || sub.includes('4ch1');
  const isPhysSubject = sub.includes('phys') || sub.includes('0625') || sub.includes('4ph1');
  const isBioSubject = sub.includes('bio') || sub.includes('0610') || sub.includes('4bi1');
  const isEslSubject = sub.includes('english') || sub.includes('esl') || sub.includes('0510') || sub.includes('4es1');
  const isScienceSubject = isChemSubject || isPhysSubject || isBioSubject || sub.includes('science');

  // -------------------------------------------------------------
  // CHEMISTRY TOPICS (Only accessible if in Chemistry/Science or explicit chemistry query)
  // -------------------------------------------------------------
  if (!isMathSubject && !isEslSubject) {
    // 1. Electrolysis
    if (q.includes('electrolysis') || q.includes('electrolyte') || q.includes('cathode') || q.includes('anode') || q.includes('brine') || q.includes('electroplat')) {
    return `### ⚡ Electrolysis: IGCSE Chemistry Master Guide (${examBoard})

**Electrolysis** is the decomposition of an ionic compound (molten or aqueous) by the passage of an electric current.

---

#### 1. Fundamental Rules (PANIC & OIL RIG)
- **PANIC**: **P**ositive **A**node, **N**egative **I**s **C**athode.
- **Cathode (-)**: Attracts positive cations $\\rightarrow$ **Reduction** occurs (cations gain electrons: $X^+ + e^- \\rightarrow X$).
- **Anode (+)**: Attracts negative anions $\\rightarrow$ **Oxidation** occurs (anions lose electrons: $2Y^- \\rightarrow Y_2 + 2e^-$).

---

#### 2. Key IGCSE Electrolysis Scenarios

##### A. Molten Lead(II) Bromide ($PbBr_2$)
- **Cathode (-)**: Lead metal forms $\\rightarrow$ $$Pb^{2+} + 2e^- \\rightarrow Pb(l)$$ *(Silvery liquid metal drops)*
- **Anode (+)**: Bromine gas forms $\\rightarrow$ $$2Br^- \\rightarrow Br_2(g) + 2e^-$$ *(Brown, pungent fumes)*

##### B. Concentrated Aqueous Sodium Chloride (Brine)
Ions present: $Na^+$, $H^+$, $Cl^-$, $OH^-$:
- **Cathode (-)**: Hydrogen is discharged because $H^+$ is less reactive than $Na^+$:
  $$2H^+ + 2e^- \\rightarrow H_2(g)$$ *(Effervescence of colourless gas)*
- **Anode (+)**: Chlorine is discharged because halide ions ($Cl^-$) are in high concentration:
  $$2Cl^- \\rightarrow Cl_2(g) + 2e^-$$ *(Pale green choking gas)*
- **Remaining in solution**: $Na^+$ and $OH^-$ remain $\\rightarrow$ **Sodium Hydroxide ($NaOH$)**, making the solution strongly alkaline (turns universal indicator purple).

##### C. Aqueous Copper(II) Sulfate ($CuSO_4$)
- **With Inert Carbon Electrodes**:
  - Cathode (-): Pink copper deposits: $$Cu^{2+} + 2e^- \\rightarrow Cu(s)$$
  - Anode (+): Oxygen gas bubbles: $$4OH^- \\rightarrow O_2 + 2H_2O + 4e^-$$
  - Blue solution gradually fades to colourless as $Cu^{2+}$ ions are removed.
- **With Pure Copper Electrodes (Refining Copper)**:
  - Impure copper anode dissolves: $$Cu(s) \\rightarrow Cu^{2+} + 2e^-$$
  - Pure copper deposits on cathode: $$Cu^{2+} + 2e^- \\rightarrow Cu(s)$$
  - Concentration of $Cu^{2+}$ stays constant $\\rightarrow$ blue colour does not fade.

---

#### 3. Rules for Electroplating
1. **Object to be plated** is ALWAYS connected to the **Cathode (-)**.
2. **Plating metal** is connected to the **Anode (+)**.
3. **Electrolyte** must be a soluble salt containing ions of the plating metal (e.g. $AgNO_3$ for silver plating).

---

#### 🎯 Examiner Pitfalls:
- Never say *"sodium is formed at the cathode in aqueous solution"*! $Na$ is far too reactive; $H^+$ is preferentially discharged as $H_2$.
- When writing half-equations, always balance electrons: $4OH^- \\rightarrow O_2 + 2H_2O + 4e^-$.`;
  }

  // 2. Haber Process & Dynamic Equilibrium / Le Chatelier
  if (q.includes('haber') || q.includes('ammonia') || q.includes('le chatelier') || q.includes('equilibrium') || q.includes('reversible')) {
    return `### ⚖️ The Haber Process & Dynamic Equilibrium (${examBoard})

The Haber Process synthesises ammonia ($NH_3$) from nitrogen and hydrogen gases:
$$N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g) \\quad (\\Delta H = -92\\text{ kJ/mol})$$

---

#### 1. Standard Conditions & Industrial Compromise
- **Temperature**: **$450^\\circ\\text{C}$**
- **Pressure**: **$200\\text{ atmospheres (atm)}$**
- **Catalyst**: **Finely divided Iron ($Fe$)**

---

#### 2. Le Chatelier's Principle & Compromise Explained

##### Effect of Temperature:
- The forward reaction is **exothermic** ($\\Delta H = -92\\text{ kJ/mol}$).
- According to Le Chatelier's Principle, a **lower temperature** shifts equilibrium to the right, **increasing the equilibrium yield of $NH_3$**.
- **The Compromise**: At low temperatures, reactant particles have low kinetic energy, meaning few collisions exceed activation energy $\\rightarrow$ the reaction is **too slow to be commercially viable**.
- Therefore, **$450^\\circ\\text{C}$** is chosen as an optimum compromise between a reasonable yield and a fast rate.

##### Effect of Pressure:
- LHS: $1 + 3 = 4\\text{ moles of gas}$.
- RHS: $2\\text{ moles of gas}$.
- Increasing pressure shifts equilibrium towards the side with **fewer gas molecules** (the RHS), **increasing $NH_3$ yield** and increasing reaction rate.
- **The Compromise**: Higher pressure than 200 atm requires extremely thick, expensive steel reaction vessels and high compressor electricity costs (safety risk). **200 atm** is the economic balance.

##### Role of the Iron Catalyst:
- The iron catalyst **speeds up both forward and backward reactions equally** by providing an alternative pathway with lower activation energy.
- **Examiner Note**: A catalyst **does NOT alter equilibrium yield**; it only reduces the time taken to reach equilibrium.

---

#### 3. Sourcing Raw Materials:
- **Nitrogen ($N_2$)**: Obtained by fractional distillation of liquid air.
- **Hydrogen ($H_2$)**: Obtained by reacting methane (natural gas) with steam ($CH_4 + H_2O \\rightarrow CO + 3H_2$) or cracking hydrocarbons.`;
  }

  // 3. Acids, Bases, Salts & Preparation
  if (q.includes('acid') || q.includes('base') || q.includes('salt') || q.includes('neutralis') || q.includes('titrat') || q.includes('precipitation')) {
    return `### 🧪 Acids, Bases & Salt Preparation: IGCSE Chemistry

---

#### 1. Definitions
- **Acid**: A proton ($H^+$) donor. Produces $H^+(aq)$ ions in aqueous solution.
- **Base**: A proton ($H^+$) acceptor. Reacts with an acid to form a salt and water only.
- **Alkali**: A soluble base that produces $OH^-(aq)$ ions in solution.
- **Strong vs Weak**:
  - *Strong acid* ($HCl, H_2SO_4, HNO_3$): **Completely ionises/dissociates** in water.
  - *Weak acid* (ethanoic acid $CH_3COOH$): **Partially ionises** in water.

---

#### 2. Three Classic Acid Reactions
1. **Acid + Metal**:
   $$\\text{Acid} + \\text{Metal} \\rightarrow \\text{Salt} + \\text{Hydrogen} \\, (H_2)$$
2. **Acid + Base / Alkali**:
   $$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water} \\, (H_2O)$$
   Ionic equation for neutralisation: $$H^+(aq) + OH^-(aq) \\rightarrow H_2O(l)$$
3. **Acid + Metal Carbonate**:
   $$\\text{Acid} + \\text{Carbonate} \\rightarrow \\text{Salt} + \\text{Water} + \\text{Carbon Dioxide} \\, (CO_2)$$

---

#### 3. How to Choose a Salt Preparation Method (Exam Question!)

| Target Salt Type | Starting Materials | Method | Key Exam Steps |
| :--- | :--- | :--- | :--- |
| **Soluble Salt** (not Group 1 or $NH_4^+$) | Acid + Insoluble base/metal/carbonate (e.g. $CuO + H_2SO_4 \\rightarrow CuSO_4$) | **Excess Insoluble Base Method** | 1. Warm acid.<br>2. Add excess insoluble base until no more dissolves (ensures all acid is reacted).<br>3. **Filter** to remove excess solid.<br>4. Heat filtrate to point of crystallisation, leave to cool, filter crystals, dry between filter paper. |
| **Soluble Salt** (Sodium, Potassium, Ammonium) | Acid + Soluble Alkali ($NaOH$, $KOH$, $NH_3$) | **Titration Method** | 1. Use pipette & burette with indicator to find exact neutralisation volume.<br>2. Repeat **without indicator** using exact volumes.<br>3. Evaporate to point of crystallisation. |
| **Insoluble Salt** (e.g. $BaSO_4$, $PbSO_4$, $AgCl$) | Two soluble salts mixed together | **Precipitation** | 1. Mix two aqueous solutions.<br>2. **Filter** the precipitate.<br>3. Wash precipitate with **distilled water** to remove soluble impurities.<br>4. Dry in a warm oven or between filter paper. |`;
  }

  // 4. Rates of Reaction & Collision Theory
  if (q.includes('rate') || q.includes('collision theory') || q.includes('catalyst') || q.includes('surface area') || q.includes('activation energy')) {
    return `### ⏱️ Rates of Reaction & Collision Theory (${examBoard})

The **Rate of Reaction** is the change in concentration of a reactant or product per unit time:
$$\\text{Rate} = \\frac{\\text{Volume of gas produced / Mass lost}}{\\text{Time elapsed}}$$

---

#### 1. Collision Theory Core Principles
For particles to react, they must:
1. **Collide** with each other.
2. Possess kinetic energy **equal to or greater than the Activation Energy ($E_a$)**.
3. Collide with the **correct orientation**.

---

#### 2. The 5 Factors & How Examiners Award Marks

##### A. Increasing Temperature (Most Important!)
- Particles gain **kinetic energy** and move faster $\\rightarrow$ frequency of collisions increases slightly.
- **Crucial Mark [M1]**: A **significantly higher fraction/proportion of particles** have energy **greater than or equal to the activation energy ($E \\ge E_a$)**.
- Result: Greatly increased frequency of **successful collisions**.

##### B. Increasing Concentration (Solutions) / Pressure (Gases)
- More reactant particles per unit volume.
- Particles are crowded closer together $\\rightarrow$ **higher frequency of collisions**.
- Increases rate of successful collisions.

##### C. Increasing Surface Area (Solids, e.g. powder vs chips)
- More particles exposed at the surface to colliding reactant particles.
- **Higher frequency of collisions** $\\rightarrow$ faster rate.

##### D. Adding a Catalyst
- A catalyst speeds up the reaction without being consumed chemically.
- **Mechanism**: Provides an **alternative reaction pathway with a LOWER activation energy ($E_a$)**.
- More colliding particles possess $E \\ge E_a$, leading to a higher frequency of successful collisions.

---

#### 🎯 Examiner Trap:
Never say *"there are more collisions"*! Examiners demand **"higher frequency of collisions"** or **"more collisions per unit time / per second"**.`;
  }

  // 5. Periodic Table: Group 1, Group 7, Group 0
  if (q.includes('periodic table') || q.includes('group 1') || q.includes('group 7') || q.includes('halogen') || q.includes('alkali metal') || q.includes('noble gas')) {
    return `### 🗺️ Periodic Table Trends: Groups 1, 7 & 0

---

#### 1. Group 1: The Alkali Metals ($Li, Na, K, Rb, Cs$)
- **Properties**: Soft (can be cut with a knife), low density (float on water), low melting points.
- **Trend in Reactivity**: Reactivity **INCREASES down the group** ($K > Na > Li$).
- **Explanation (3-Mark Exam Answer)**:
  1. Down the group, atoms have **more electron shells** (larger atomic radius).
  2. The single outer shell electron is **further from the nucleus** with **increased shielding**.
  3. Electrostatic attraction between positive nucleus and valence electron is **weaker**, so the electron is **lost more easily**.
- **Reaction with Water**:
  $$2Na(s) + 2H_2O(l) \\rightarrow 2NaOH(aq) + H_2(g)$$
  Observations: Melts into a silvery ball, fizzes vigorously (effervescence of $H_2$), darts on surface, solution turns universal indicator purple (alkaline). Potassium burns with a **lilac flame**.

---

#### 2. Group 7: The Halogens ($F_2, Cl_2, Br_2, I_2$)
- **Properties & Appearance**:
  - **Chlorine ($Cl_2$)**: Pale green gas.
  - **Bromine ($Br_2$)**: Red-brown liquid (forms orange vapour).
  - **Iodine ($I_2$)**: Dark grey/black solid (sublimes to purple vapour).
- **Trend in Reactivity**: Reactivity **DECREASES down the group** ($Cl_2 > Br_2 > I_2$).
- **Explanation**:
  1. Atoms get larger down the group with more shells (more shielding).
  2. Incoming electron is less strongly attracted by the nucleus, so it is **harder to gain an electron**.
- **Displacement Reactions**:
  A more reactive halogen displaces a less reactive halide ion from its solution:
  $$Cl_2(aq) + 2KBr(aq) \\rightarrow 2KCl(aq) + Br_2(aq)$$
  *(Colourless solution turns orange/brown due to liberated $Br_2$)*.

---

#### 3. Group 0 / 8: Noble Gases ($He, Ne, Ar, Kr, Xe$)
- **Properties**: Colourless, monatomic, non-flammable.
- **Unreactivity**: Full outer shell of electrons (stable octet, or 2 for Helium), meaning they have no tendency to lose, gain, or share electrons.`;
  }

  // 6. Extraction of Metals & Blast Furnace
  if (q.includes('blast furnace') || q.includes('iron') || q.includes('extraction') || q.includes('bauxite') || q.includes('aluminium') || q.includes('hematite') || q.includes('reactivity series')) {
    return `### 🏭 Extraction of Metals: Iron & Aluminium

---

#### 1. The Blast Furnace (Extraction of Iron from Hematite, $Fe_2O_3$)

Four raw materials enter the top: **Hematite ($Fe_2O_3$)**, **Coke ($C$)**, **Limestone ($CaCO_3$)**, and hot air blasted in from bottom.

##### The 4 Step Reactions:
1. **Combustion of Coke (Generates heat)**:
   $$C + O_2 \\rightarrow CO_2 \\quad (\\text{Exothermic})$$
2. **Formation of the Reducing Agent ($CO$)**:
   $$CO_2 + C \\rightarrow 2CO$$
3. **Reduction of Iron(III) Oxide**:
   $$Fe_2O_3 + 3CO \\rightarrow 2Fe + 3CO_2$$
   *(Molten iron is dense and sinks to the bottom where it is tapped off)*.
4. **Removal of Acidic Sand Impurities ($SiO_2$) by Limestone**:
   - Thermal decomposition of limestone: $$CaCO_3 \\xrightarrow{\\text{heat}} CaO + CO_2$$
   - Neutralisation to form molten slag: $$CaO(s) + SiO_2(s) \\rightarrow CaSiO_3(l) \\quad (\\text{Calcium Silicate})$$
   *(Molten slag is less dense than iron; it floats on top of the molten iron and is tapped off separately for road building)*.

---

#### 2. Extraction of Aluminium (Electrolysis of Bauxite, $Al_2O_3$)
- Aluminium is more reactive than carbon, so it cannot be extracted using a blast furnace; it requires **electrolysis**.
- **Role of Cryolite ($Na_3AlF_6$)**:
  Pure $Al_2O_3$ has a melting point of $>2000^\\circ\\text{C}$! Dissolving it in molten cryolite **lowers the melting point to approximately $950^\\circ\\text{C}$**, drastically reducing electricity/energy costs and improving conductivity.
- **Reactions**:
  - **Cathode (-)**: $$Al^{3+} + 3e^- \\rightarrow Al(l)$$ *(Molten aluminium sinks to bottom)*
  - **Anode (+)**: $$2O^{2-} \\rightarrow O_2(g) + 4e^-$$
- **Why Anodes Must Be Regularly Replaced**:
  The oxygen gas formed at the high operating temperature ($950^\\circ\\text{C}$) reacts with the graphite (carbon) anodes: $$C(s) + O_2(g) \\rightarrow CO_2(g)$$, causing the anodes to burn away over time.`;
  }

  // 7. Organic Chemistry (Alkanes, Alkenes, Polymers, Cracking)
  if (q.includes('alkane') || q.includes('alkene') || q.includes('polymer') || q.includes('cracking') || q.includes('organic') || q.includes('ester') || q.includes('alcohol') || q.includes('fractional distillation')) {
    return `### 🛢️ Organic Chemistry Master Guide (${examBoard})

---

#### 1. Fractional Distillation of Crude Oil
Crude oil is a mixture of hydrocarbons separated by fractional distillation based on **differences in boiling points**:
- Hot vapour enters the fractionating column (hot at the bottom, cooler at the top).
- **Small molecules** (e.g. Refinery gases, Gasoline): Low boiling points, condense near top, runny/low viscosity, highly volatile and flammable.
- **Large molecules** (e.g. Diesel, Fuel oil, Bitumen): High boiling points, condense near bottom, high viscosity, dark colour.

---

#### 2. Alkanes vs Alkenes

| Feature | Alkanes | Alkenes |
| :--- | :--- | :--- |
| **General Formula** | $$C_n H_{2n+2}$$ | $$C_n H_{2n}$$ |
| **Bonding** | Single $C-C$ bonds only (**Saturated**) | Contains $C=C$ double bond (**Unsaturated**) |
| **Bromine Water Test** | Stays **orange-brown** (no reaction in dark) | Decolourises from **orange-brown to colourless** |
| **Key Reaction** | Substitution with $Cl_2$ in **UV light**: $$CH_4 + Cl_2 \\xrightarrow{UV} CH_3Cl + HCl$$ | Addition of $Br_2$, $H_2$ (nickel, 150°C), steam ($H_3PO_4$, 300°C) |

---

#### 3. Catalytic Cracking
- Breaks long-chain alkanes into smaller, more useful **short-chain alkanes** (for petrol) + **alkenes** (for making polymers).
- **Conditions**: High temperature ($600-700^\\circ\\text{C}$) and catalyst (**Aluminium oxide / Silicon dioxide**).
- Example: $$C_{10}H_{22} \\rightarrow C_8H_{18} + C_2H_4$$

---

#### 4. Polymerisation
- **Addition Polymerisation**: Monomers with $C=C$ double bonds join with no other products (e.g. Ethene $\\rightarrow$ Polyethene).
- **Condensation Polymerisation**: Monomers with two functional groups react, eliminating a small molecule (usually $H_2O$ or $HCl$).
  - Polyamide (Nylon): Dicarboxylic acid + Diamine $\\rightarrow$ Amide link ($-CONH-$) $+ H_2O$.
  - Polyester (Terylene): Dicarboxylic acid + Diol $\\rightarrow$ Ester link ($-COO-$) $+ H_2O$.`;
  }

  // 8. Stoichiometry & Mole Calculations
  if (q.includes('mole') || q.includes('stoichiometry') || q.includes('empirical') || q.includes('percentage yield') || q.includes('limiting reactant')) {
    return `### 🔢 Mole Calculations & Stoichiometry Formula Sheet

---

#### 1. The 3 Core Mole Equations

1. **For Solids / Masses**:
   $$\\text{Moles } (n) = \\frac{\\text{Mass in grams } (m)}{\\text{Molar Mass } (M_r)}$$
2. **For Gases at Room Temperature & Pressure (r.t.p.)**:
   $$\\text{Moles } (n) = \\frac{\\text{Volume in } \\text{dm}^3}{24} = \\frac{\\text{Volume in } \\text{cm}^3}{24000}$$
3. **For Solutions**:
   $$\\text{Moles } (n) = \\text{Concentration } (\\text{mol/dm}^3) \\times \\text{Volume } (\\text{dm}^3)$$
   *(To convert $\\text{cm}^3$ to $\\text{dm}^3$, divide by 1000!)*

---

#### 2. Empirical Formula Step-by-Step
1. Write the symbols of each element.
2. Write given masses or percentages.
3. Divide each mass by its **Relative Atomic Mass ($A_r$)** to find moles.
4. Divide all mole values by the **smallest mole value** to find the simplest integer ratio.
*(If you get a ratio ending in .5, multiply all numbers by 2, e.g. $1 : 1.5 \\rightarrow 2 : 3$)*.

---

#### 3. Percentage Yield & Purity
$$\\%\\text{ Yield} = \\frac{\\text{Actual Mass produced in experiment}}{\\text{Theoretical Maximum Mass calculated from equation}} \\times 100\\%$$
$$\\%\\text{ Purity} = \\frac{\\text{Mass of pure substance}}{\\text{Total mass of impure sample}} \\times 100\\%$$`;
  }

  // 9. Identification of Ions & Flame Tests
  const isQualitativeChem = (isChemSubject || isScienceSubject || q.includes('chem')) &&
    (q.includes('flame test') ||
     q.includes('gas test') ||
     /\b(cation|cations|anion|anions|precipitates?)\b/i.test(q) ||
     (/\btest for\b/i.test(q) && /\b(metal|ion|ions|gas|gases|halide|cation|anion)\b/i.test(q)) ||
     q.includes('qualitative analysis'));

  if (isQualitativeChem) {
    return `### 🔍 Qualitative Analysis: Gas & Ion Identification Table

---

#### 1. Flame Tests (Cations)
- **Lithium ($Li^+$)**: **Crimson / Red**
- **Sodium ($Na^+$)**: **Yellow**
- **Potassium ($K^+$)**: **Lilac**
- **Copper(II) ($Cu^{2+}$)**: **Blue-green**
- **Calcium ($Ca^{2+}$)**: **Orange-red**

---

#### 2. Cation Tests using Aqueous Sodium Hydroxide ($NaOH$) & Ammonia ($NH_3$)
- **Copper(II) ($Cu^{2+}$)**: Light blue ppt $\\rightarrow$ Insoluble in excess $NaOH$; dissolves in excess $NH_3$ to form a **deep blue solution**.
- **Iron(II) ($Fe^{2+}$)**: **Green ppt** $\\rightarrow$ Insoluble in excess (turns brown at surface).
- **Iron(III) ($Fe^{3+}$)**: **Red-brown ppt** $\\rightarrow$ Insoluble in excess.
- **Zinc ($Zn^{2+}$)**: White ppt $\\rightarrow$ **Soluble in excess of BOTH** $NaOH$ and $NH_3$ (forms colourless solution).
- **Aluminium ($Al^{3+}$)**: White ppt $\\rightarrow$ Soluble in excess $NaOH$, but **insoluble in excess $NH_3$**.
- **Ammonium ($NH_4^+$)**: No precipitate formed! On warming with $NaOH$, produces ammonia gas ($NH_3$) which turns damp red litmus paper **blue**.

---

#### 3. Anion Tests
- **Carbonate ($CO_3^{2-}$)**: Add dilute acid $\\rightarrow$ effervescence of gas that turns **limewater milky** ($CO_2$).
- **Chloride ($Cl^-$)**: Acidify with dilute $HNO_3$, add aqueous silver nitrate ($AgNO_3$) $\\rightarrow$ **White ppt** ($AgCl$).
- **Bromide ($Br^-$)**: Acidify with $HNO_3$, add $AgNO_3$ $\\rightarrow$ **Cream ppt** ($AgBr$).
- **Iodide ($I^-$)**: Acidify with $HNO_3$, add $AgNO_3$ $\\rightarrow$ **Yellow ppt** ($AgI$).
- **Sulfate ($SO_4^{2-}$)**: Acidify with dilute $HNO_3$, add barium nitrate $Ba(NO_3)_2$ $\\rightarrow$ **White ppt** ($BaSO_4$).

---

#### 4. Gas Tests
- **Hydrogen ($H_2$)**: Lighted wooden splint $\\rightarrow$ **Burns with a squeaky pop**.
- **Oxygen ($O_2$)**: Glowing wooden splint $\\rightarrow$ **Relights the glowing splint**.
- **Carbon Dioxide ($CO_2$)**: Bubble through limewater $\\rightarrow$ **Turns limewater cloudy / milky**.
- **Chlorine ($Cl_2$)**: Damp litmus paper $\\rightarrow$ **Bleaches white**.`;
  }
  } // end of Chemistry topics guard

  // -------------------------------------------------------------
  // PHYSICS TOPICS
  // -------------------------------------------------------------
  if (!isMathSubject && !isEslSubject && (isPhysSubject || isScienceSubject || q.includes('phys'))) {
    if (q.includes('newton') || q.includes('gravity') || q.includes('momentum') || q.includes('terminal velocity') || q.includes('acceleration') || q.includes('speed') || q.includes('velocity')) {
      return `### 🚀 Forces & Motion: IGCSE Physics Master Guide (${examBoard})

---

#### 1. Newton's 3 Laws of Motion
1. **Newton's 1st Law (Inertia)**: An object remains at rest or continues with constant velocity unless acted upon by a resultant force.
2. **Newton's 2nd Law**: Resultant force produces acceleration in the direction of the force:
   $$F = m \\times a \\quad [\\text{Newtons, N}]$$
3. **Newton's 3rd Law**: When body A exerts a force on body B, body B exerts an equal and opposite force on body A.

---

#### 2. Momentum & Impulse
- **Momentum**: $$p = m \\times v \\quad [\\text{kg}\\cdot\\text{m/s}]$$
- **Conservation of Momentum**: Total momentum before a collision = Total momentum after a collision (in an isolated system).
- **Impulse**: Change in momentum:
  $$\\text{Impulse} = F \\times \\Delta t = \\Delta p = m(v - u)$$
  *(Car safety feature: Crumple zones and airbags increase collision time $\\Delta t$, thereby reducing the impact force $F$ on passengers!)*

---

#### 3. Terminal Velocity Mechanism (4-Mark Classic!)
When a parachutist jumps out of an aircraft:
1. Initially, only **Weight (downwards)** acts $\\rightarrow$ large resultant force downwards $\\rightarrow$ accelerating at $g = 9.8\\text{ m/s}^2$.
2. As speed increases, **Air Resistance (upwards)** increases.
3. The resultant force downwards decreases $\\rightarrow$ acceleration decreases (gradient of v-t graph flattens).
4. Eventually, **Air Resistance = Weight** $\\rightarrow$ Resultant force is **ZERO** $\\rightarrow$ Acceleration is zero $\\rightarrow$ Constant **Terminal Velocity** is reached.`;
    }
  }

  // -------------------------------------------------------------
  // BIOLOGY TOPICS
  // -------------------------------------------------------------
  if (!isMathSubject && !isEslSubject && (isBioSubject || isScienceSubject || q.includes('bio'))) {
    if (q.includes('osmosis') || q.includes('diffusion') || q.includes('active transport') || q.includes('turgid') || q.includes('water potential')) {
      return `### 💧 Movement In and Out of Cells: IGCSE Biology

---

#### 1. The 3 Transport Mechanisms Compared

| Feature | Diffusion | Osmosis | Active Transport |
| :--- | :--- | :--- | :--- |
| **Substance** | Solute particles (e.g. $O_2$, $CO_2$, glucose) | **Water molecules only** | Ions / Solutes (e.g. nitrates in roots, glucose in villi) |
| **Concentration Gradient** | Down gradient (High $\\rightarrow$ Low) | Down **water potential gradient** (High $\\Psi \\rightarrow$ Low $\\Psi$) | **Against gradient** (Low $\\rightarrow$ High concentration) |
| **Membrane Required?** | No | Yes (**Partially permeable**) | Yes (**Carrier proteins required**) |
| **Energy ($ATP$) Needed?** | No (Passive) | No (Passive) | **Yes (Active, requires respiration)** |

---

#### 2. Mark-Scheme Definitions
- **Osmosis**: The net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution), through a partially permeable membrane.
- **Active Transport**: The movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration using energy from respiration and carrier proteins.

---

#### 3. Cells in Different Solutions
- **Plant Cell in Pure Water**: Water enters by osmosis $\\rightarrow$ vacuole swells $\\rightarrow$ cytoplasm pushes against rigid cellulose cell wall $\\rightarrow$ cell becomes **turgid** (wall prevents bursting).
- **Plant Cell in Concentrated Salt Solution**: Water leaves by osmosis $\\rightarrow$ cytoplasm shrinks away from cell wall $\\rightarrow$ **plasmolysed** (cell is **flaccid**).
- **Animal Cell (RBC) in Pure Water**: Water enters by osmosis $\\rightarrow$ cell swells and **bursts (lysis)** because it has no cell wall!`;
    }
  }

  // -------------------------------------------------------------
  // ENGLISH AS A SECOND LANGUAGE (ESL 0510 / 4ES1)
  // -------------------------------------------------------------
  if (isEslSubject || q.includes('esl') || q.includes('0510') || q.includes('4es1')) {
    if (q.includes('contrast') || q.includes('however') || q.includes('although') || q.includes('whereas') || q.includes('despite') || q.includes('connector') || q.includes('linking word') || q.includes('sentence')) {
      return `### ✍️ Contrast Sentences & Cohesive Connectors: IGCSE ESL Guide (${examBoard})

In Cambridge IGCSE 0510 (Paper 1: Reading & Writing), using varied and accurate contrast connectors directly boosts your Language Band!

---

#### 1. The Two Main Contrast Structures

##### A. Subordinate Conjunctions: *Although / Even though / Whereas / While*
- Join two clauses in **one single sentence**.
- When placed at the start, place a comma before the main clause:
  $$\\text{"Although urban vertical farming requires high setup capital, it drastically diminishes water usage."}$$
- **CRITICAL EXAMINER TRAP**: Never pair *"Although"* with *"but"*!
  - ❌ *Incorrect*: *"Although it was raining, but they played football."*
  - ✅ *Correct*: *"Although it was raining, they played football."*

##### B. Adverbial Connectors: *However / Conversely / On the other hand / In contrast*
- Connect two separate independent sentences or clauses.
- Require punctuation (full stop/semicolon before, comma after):
  $$\\text{"The renewable energy installation requires significant initial funding. However, long-term operational costs are minimal."}$$

##### C. Prepositional Phrases: *Despite / In spite of*
- MUST be followed by a **noun phrase** or a **gerund (-ing verb)**:
  - ✅ *"Despite the exorbitant price, the system was adopted."*
  - ✅ *"In spite of facing severe weather, crops flourished."*
  - ❌ Never write: *"Despite it was expensive..."* (use *"Despite the fact that it was expensive..."*).

---

#### 2. High-Scoring Model Sentence (1-Mark / Accuracy Benchmark)
$$\\text{"Although public transport networks reduce traffic congestion, their efficiency depends heavily on regular municipal investment."}$$

> 💡 **Examiner Tip for Paper 1:**
> Demonstrating mastery of complex contrast clauses in Exercise 5 (Email) and Exercise 6 (Article/Report) secures marks in the top Language criteria band.`;
    }
  }

  // -------------------------------------------------------------
  // MATHEMATICS TOPICS
  // -------------------------------------------------------------
  if (isMathSubject || q.includes('math') || (!isScienceSubject && !isEslSubject)) {
    if (q.includes('circle theorem') || q.includes('tangent') || q.includes('cyclic') || q.includes('subtend')) {
      return `### ⭕ The 7 Circle Theorems Master Sheet (${examBoard})

To earn full marks in Cambridge 0580 & Edexcel 4MA1, you MUST state the exact geometric reason in words!

---

1. **Angle in a Semicircle**:
   - The angle subtended by a diameter at the circumference is always a right angle (**$90^\\circ$**).
   - *Reason*: *"Angle in a semicircle is $90^\\circ$"*.
2. **Angle at Centre**:
   - The angle subtended at the centre of a circle is **TWICE** the angle subtended at the circumference by the same arc.
   - *Reason*: *"Angle at centre is twice angle at circumference"*.
3. **Angles in the Same Segment**:
   - Angles subtended by the same arc in the same segment are equal ("butterfly / bow-tie rule").
   - *Reason*: *"Angles in the same segment are equal"*.
4. **Cyclic Quadrilateral**:
   - Opposite angles of a cyclic quadrilateral (all 4 vertices touching the circle) add up to **$180^\\circ$**.
   - *Reason*: *"Opposite angles of a cyclic quadrilateral sum to $180^\\circ$"*.
5. **Radius to Tangent**:
   - The angle between a radius and a tangent at the point of contact is **$90^\\circ$**.
   - *Reason*: *"Angle between tangent and radius is $90^\\circ$"*.
6. **Tangents from an External Point**:
   - Tangents drawn to a circle from the same external point are **equal in length**.
   - *Reason*: *"Tangents from an external point are equal in length"*.
7. **Alternate Segment Theorem**:
   - The angle between a tangent and a chord equals the angle subtended by that chord in the alternate segment.
   - *Reason*: *"Alternate segment theorem"*.`;
    }

    if (q.includes('quadratic') || q.includes('completing the square') || q.includes('parabola') || q.includes('turning point')) {
      return `### 📐 Quadratic Equations & Completing the Square (${examBoard})

---

#### 1. Completing the Square: $x^2 + bx + c$
1. Halve the coefficient of $x$: $p = \\frac{b}{2}$.
2. Form $(x + p)^2$.
3. Subtract $p^2$ and add $c$:
   $$x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c$$

#### 2. Deducing the Turning Point (Vertex)
For $y = a(x - h)^2 + k$:
- **Turning Point**: $(h, k)$
- If $a > 0$, the curve is U-shaped with a **minimum** at $(h, k)$.
- If $a < 0$, the curve is inverted with a **maximum** at $(h, k)$.`;
    }
  }

  // Fallback: If not explicitly matched, return null to let dynamic generator build it
  return null;
}
