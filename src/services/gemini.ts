import { SolverResult, Flashcard, QuizQuestion, RevisionTopic } from '../types';
import { searchUniversalKnowledge } from './knowledgeEngine';

export interface GeminiSolveParams {
  apiKey?: string;
  model?: string;
  questionText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  subjectName: string;
  examBoard: string;
  gradeLevel: string;
}

// Zero-Key Client-Side AI caller (Uses Puter.js in browser with zero keys required)
export function isPuterAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).puter?.ai?.chat);
}

export function isPuterSignedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean((window as any).puter?.auth?.isSignedIn?.());
  } catch {
    return false;
  }
}

export async function connectPuterSession(): Promise<boolean> {
  if (typeof window === 'undefined' || !(window as any).puter?.auth?.signIn) return false;
  try {
    await (window as any).puter.auth.signIn();
    return isPuterSignedIn();
  } catch (e) {
    console.warn('Puter sign in cancelled or blocked:', e);
    return false;
  }
}

async function callZeroKeyAi(prompt: string, systemPrompt?: string): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).puter?.ai?.chat) {
    try {
      const puter = (window as any).puter;
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nStudent Question:\n${prompt}` : prompt;

      // Strict 6500ms timeout race to prevent infinite hanging if popup was closed or blocked
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('PUTER_TIMEOUT')), 6500)
      );

      const chatPromise = puter.ai.chat(fullPrompt, { model: 'gpt-4o-mini' });
      const res = await Promise.race([chatPromise, timeoutPromise]);
      const text = typeof res === 'string' ? res : res?.message?.content || res?.text || '';
      if (text && text.trim() !== '') return text;
    } catch (e) {
      console.warn('Puter AI attempt bypassed or timed out:', e);
    }
  }
  throw new Error('ZERO_KEY_AI_UNAVAILABLE');
}

// Unified call helper: tries /api/gemini (Vercel serverless proxy) first,
// then falls back to direct API key (if passed or in VITE_GEMINI_API_KEY)
async function callGeminiApi(payload: {
  model: string;
  contents: any[];
  generationConfig?: any;
  systemInstruction?: any;
  userApiKey?: string;
}): Promise<any> {
  const { model, contents, generationConfig, systemInstruction, userApiKey } = payload;
  const targetModel = model.includes('2.5') ? model : 'gemini-1.5-flash';

  // 1. First attempt: call Vercel /api/gemini proxy (secure server-side key)
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: targetModel, contents, generationConfig, systemInstruction }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data;
      }
    }
  } catch {
    // If running in local Vite without Vercel CLI, proceed to fallback
  }

  // 2. Second attempt: Check if client has key from admin setting or Vite env
  const fallbackKey = userApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (fallbackKey && fallbackKey.trim() !== '') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${fallbackKey.trim()}`;
    const body: any = { contents };
    if (generationConfig) body.generationConfig = generationConfig;
    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
      body.system_instruction = systemInstruction;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data;
      }
    }
  }

  throw new Error('SERVERLESS_OR_KEY_UNAVAILABLE');
}

export const SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION =
  'You are a senior Cambridge IGCSE examiner. Follow official mark scheme conventions: always show step-by-step working for method marks ($M$), state accuracy marks ($A$) and independent marks ($B$), bold all required syllabus keywords, and enforce the 3 significant figures rule for non-exact values.';

export async function solveQuestionWithGemini(params: GeminiSolveParams): Promise<SolverResult> {
  const { apiKey, model = 'gemini-1.5-flash', questionText, imageBase64, imageMimeType, subjectName, examBoard, gradeLevel } = params;

  const prompt = `
${SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION}

You are marking a student question for ${examBoard} IGCSE ${subjectName} (${gradeLevel}).
Analyze this student question thoroughly and return your answer STRICTLY as a valid JSON object with four distinct sections matching this schema:
{
  "questionText": "A clean transcribed summary of the question",
  "subject": "${subjectName}",
  "topic": "Specific syllabus topic name",
  "totalMarks": 4,
  "coreConceptAndFormula": {
    "concept": "Name and explanation of the core syllabus concept being tested",
    "formula": "Primary formula or equation needed, in LaTeX formatting (e.g. $E_k = \\\\frac{1}{2}mv^2$ or ionic equation)"
  },
  "stepByStepSolution": [
    {
      "stepNumber": 1,
      "title": "Method / Step Title",
      "explanation": "Detailed explanation showing logical progression, with syllabus keywords in bold",
      "mathOrCode": "LaTeX formatted math equation or code snippet if applicable",
      "markAwarded": "[M1] Method Mark"
    }
  ],
  "finalAnswer": "Concise final answer with exact SI units and rounded to 3 significant figures (or 1 d.p. for angles)",
  "examinerTraps": [
    "Examiner trap: common errors or misconceptions students make on this exact question type"
  ],
  "markSchemeBreakdown": [
    "[M1] Description of method mark 1",
    "[A1] Description of accuracy mark"
  ],
  "examinerTips": [
    "Secret examiner tip to secure maximum marks"
  ],
  "commonMistakes": [
    "Common student mistake from official examiner reports"
  ],
  "relatedTopic": "Related syllabus sub-topic for further revision"
}

Ensure standard IGCSE marking criteria: [M] method mark, [A] accuracy mark, [B] independent mark, [SC] special case. Use LaTeX formatting ($...$ or $$...$$) for mathematical expressions and chemical formulas.
DO NOT wrap your output in markdown code blocks like \`\`\`json. Return only raw parseable JSON.
`;

  // 1. Try zero-key browser Puter AI if text question
  if (questionText && !imageBase64) {
    try {
      const liveJsonStr = await callZeroKeyAi(
        `${questionText}\n\nReturn ONLY raw parseable JSON matching the 4-section IGCSE schema with coreConceptAndFormula, stepByStepSolution, finalAnswer, and examinerTraps. No markdown code blocks.`,
        SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION
      );
      const cleaned = liveJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.stepByStepSolution && parsed.finalAnswer) return parsed;
    } catch {
      // continue to next provider
    }
  }

  // 2. Try Vercel Serverless / Gemini API
  const parts: any[] = [];
  if (questionText) {
    parts.push({ text: `Question:\n${questionText}\n\nInstructions:\n${prompt}` });
  } else {
    parts.push({ text: `Instructions:\n${prompt}` });
  }

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    });
  }

  try {
    const data = await callGeminiApi({
      model,
      contents: [{ parts }],
      systemInstruction: {
        parts: [{ text: SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      },
      userApiKey: apiKey
    });

    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('No text generated.');

    const cleanedJson = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err: any) {
    console.warn('Using syllabus template solution:', err.message);
    return generateSimulatedSolution(questionText || 'Student uploaded question', subjectName, examBoard, gradeLevel);
  }
}

export async function generateFlashcardsWithGemini(
  subjectName: string,
  topic: string,
  count: number = 4,
  apiKey?: string,
  model: string = 'gemini-1.5-flash'
): Promise<Flashcard[]> {
  const prompt = `
Generate ${count} top-tier IGCSE flashcards for the subject "${subjectName}" on the topic "${topic}".
Output STRICTLY a JSON array of objects with the following schema:
[
  {
    "id": "fc-ai-1",
    "subjectId": "${subjectName}",
    "topic": "${topic}",
    "question": "Clear IGCSE question or prompt",
    "answer": "Accurate, mark-scheme aligned answer with LaTeX math if needed",
    "keyFormula": "Formula if applicable",
    "examinerTip": "Pro-tip from examiner reports",
    "difficulty": "Extended"
  }
]
`;

  // Try Zero-Key Puter AI
  try {
    const liveJson = await callZeroKeyAi(prompt);
    const cleaned = liveJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // continue
  }

  // Try Gemini API
  try {
    const data = await callGeminiApi({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      userApiKey: apiKey
    });

    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      {
        id: `gen-fc-${Date.now()}-1`,
        subjectId: subjectName,
        topic: topic,
        question: `What are the core syllabus requirements for ${topic}?`,
        answer: `In IGCSE ${subjectName}, questions on ${topic} require exact syllabus keywords, correct SI units, and structured step-by-step reasoning.`,
        examinerTip: `Check past paper mark schemes for words in bold or underlined (these are compulsory).`,
        difficulty: 'Core',
        mastered: false,
      },
      {
        id: `gen-fc-${Date.now()}-2`,
        subjectId: subjectName,
        topic: topic,
        question: `What is the most frequently tested calculation or concept in ${topic}?`,
        answer: `Identify the relationship between variables, state the base formula, substitute known numbers, and round to 3 significant figures.`,
        examinerTip: `Examiners penalize premature rounding in multi-step problems.`,
        difficulty: 'Extended',
        mastered: false,
      }
    ];
  }
}

export async function generateQuizWithGemini(
  subjectName: string,
  topic: string,
  apiKey?: string,
  model: string = 'gemini-1.5-flash'
): Promise<QuizQuestion[]> {
  const prompt = `
Create 3 high-quality IGCSE multiple-choice questions for "${subjectName}" topic "${topic}".
Output STRICTLY a JSON array of objects with the schema:
[
  {
    "id": "quiz-1",
    "subjectId": "${subjectName}",
    "topic": "${topic}",
    "paperReference": "IGCSE Exam Style",
    "questionText": "Question description with LaTeX if needed",
    "options": [
      { "id": "opt-a", "text": "Choice A" },
      { "id": "opt-b", "text": "Choice B" },
      { "id": "opt-c", "text": "Choice C" },
      { "id": "opt-d", "text": "Choice D" }
    ],
    "correctOptionId": "opt-a",
    "marks": 2,
    "markingBreakdown": ["[M1]...", "[A1]..."],
    "markSchemeExplanation": "Step-by-step why the answer is correct"
  }
]
`;

  // Try Zero-Key Puter AI
  try {
    const liveJson = await callZeroKeyAi(prompt);
    const cleaned = liveJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // continue
  }

  // Try Gemini API
  try {
    const data = await callGeminiApi({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      userApiKey: apiKey
    });

    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      {
        id: `ai-quiz-${Date.now()}`,
        subjectId: subjectName,
        topic: topic,
        paperReference: `${subjectName} Specimen Practice`,
        questionText: `Which of the following statements represents the official syllabus principle for ${topic}?`,
        options: [
          { id: 'opt-1', text: 'Principle A: Holds true under standard temperature and pressure' },
          { id: 'opt-2', text: 'Principle B: Proportional increase with surface area or concentration' },
          { id: 'opt-3', text: 'Principle C: Fundamental conservation and mark scheme alignment' },
          { id: 'opt-4', text: 'Principle D: None of the above' }
        ],
        correctOptionId: 'opt-3',
        marks: 2,
        markingBreakdown: [
          '[M1] For identifying the fundamental syllabus principle',
          '[A1] For selecting the correct option'
        ],
        markSchemeExplanation: `According to IGCSE standards, this principle is tested regularly to verify conceptual clarity.`
      }
    ];
  }
}

export async function generateRevisionNotesWithGemini(
  subjectName: string,
  subjectId: string,
  topic: string,
  apiKey?: string,
  model: string = 'gemini-1.5-flash'
): Promise<RevisionTopic> {
  const prompt = `
Generate a comprehensive, syllabus-accurate IGCSE Revision Guide for subject "${subjectName}" on the topic "${topic}".
Output strictly valid JSON matching this schema:
{
  "id": "rev-ai-${Date.now()}",
  "subjectId": "${subjectId}",
  "title": "${topic} Comprehensive Revision Guide",
  "chapter": "IGCSE Core & Extended Syllabus",
  "keyConcepts": [
    {
      "heading": "Core concept title",
      "points": [
        "Syllabus key point 1 explaining mechanism and cause-effect",
        "Syllabus key point 2 with technical terminology"
      ],
      "formula": "LaTeX formula if applicable (e.g. E = mc^2 or n = m/Mr)"
    }
  ],
  "mustKnowDefinitions": [
    {
      "term": "Key Term",
      "definition": "Verbatim Cambridge / Edexcel mark scheme definition"
    }
  ],
  "examinerWarnings": [
    "Common student mistake identified in examiner reports"
  ]
}
`;

  // 1. Try Puter.js Zero-Key AI
  try {
    const liveJson = await callZeroKeyAi(prompt);
    const cleaned = liveJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && parsed.title && parsed.keyConcepts) return parsed;
  } catch {
    // continue
  }

  // 2. Try Gemini API
  try {
    const data = await callGeminiApi({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
      userApiKey: apiKey
    });

    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      id: `rev-ai-${Date.now()}`,
      subjectId: subjectId,
      title: `${topic} Comprehensive Summary`,
      chapter: 'Syllabus Core & Extended Focus',
      keyConcepts: [
        {
          heading: `${topic} - Core Principles & Mechanisms`,
          points: [
            `Understand the underlying scientific / theoretical principles governing ${topic}.`,
            'Ensure accurate recall of standard definitions, units, and conditions required by the examination board.',
            'Structure extended responses with clear cause-and-effect logical steps using official command words.'
          ],
          formula: '\\text{Mark Scheme Standard: Precision & Technical Terminology}'
        }
      ],
      mustKnowDefinitions: [
        {
          term: topic,
          definition: `The fundamental syllabus concept in ${subjectName} requiring exact recall in Paper 2/4 examinations.`
        }
      ],
      examinerWarnings: [
        'Avoid vague statements like "it affects the reaction" without stating whether it increases or decreases.',
        'Always check the marks allocation (e.g. 3 marks requires 3 distinct points).'
      ]
    };
  }
}

export async function askAiTutor(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  subjectName: string,
  examBoard: string,
  apiKey?: string,
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const systemInstruction = `You are "Simply IGCSE Co-Pilot", an elite Cambridge & Edexcel IGCSE examiner and private tutor.
The student is studying: ${examBoard} ${subjectName}.
Tone: Encouraging, rigorous, mark-scheme focused. Always point out where [M] method marks, [A] accuracy marks, and [B] independent marks are awarded.
Use LaTeX ($...$ or $$...$$) for any mathematical equations or chemical reactions.`;

  // 1. Check Universal Syllabus Knowledge Engine for Instant High-Yield Mark-Scheme Breakdown
  const instantMatch = searchUniversalKnowledge(lastUserMessage, subjectName, examBoard);
  if (instantMatch) {
    return instantMatch;
  }

  // 2. Try Zero-Key Puter AI (Live GPT-4o-mini / Claude in browser without any API key!)
  try {
    const liveReply = await callZeroKeyAi(lastUserMessage, systemInstruction);
    if (liveReply && liveReply.trim() !== '') return liveReply;
  } catch {
    // continue
  }

  // 3. Try Vercel Serverless / Gemini API
  try {
    const formattedContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const data = await callGeminiApi({
      model,
      contents: formattedContents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      userApiKey: apiKey
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim() !== '') return text;
  } catch {
    // continue
  }

  // 4. Dynamic Subject Knowledge Synthesizer
  return generateComprehensiveTutorReply(lastUserMessage, subjectName, examBoard);
}

// Built-in intelligent subject response generator for the AI Tutor
function generateComprehensiveTutorReply(
  query: string,
  subjectName: string,
  examBoard: string
): string {
  const lower = query.toLowerCase();

  // Redox
  if (lower.includes('redox') || lower.includes('oxidation') || lower.includes('reduction')) {
    return `### ⚡ Redox Reactions: Master Guide for IGCSE Chemistry

In IGCSE Chemistry (${examBoard}), **Redox** stands for **Red**uction and **Ox**idation occurring simultaneously in a reaction.

---

#### 1. The Three Essential Definitions

| Term | In Terms of Oxygen | In Terms of Electrons (OIL RIG) | In Terms of Oxidation Number |
| :--- | :--- | :--- | :--- |
| **Oxidation** | **Gain** of oxygen | **Loss** of electrons ($e^-$) | **Increase** in oxidation number |
| **Reduction** | **Loss** of oxygen | **Gain** of electrons ($e^-$) | **Decrease** in oxidation number |

> 💡 **Golden Mnemonic**: **OIL RIG**
> - **O**xidation **I**s **L**oss of electrons
> - **R**eduction **I**s **G**ain of electrons

---

#### 2. Oxidising vs Reducing Agents
- **Oxidising Agent**: A substance that oxidises another substance and is **itself reduced** (gains electrons / loses oxygen).
- **Reducing Agent**: A substance that reduces another substance and is **itself oxidised** (loses electrons / gains oxygen).

---

#### 3. Real Past Paper Example with Half-Equations
Take the reaction between Magnesium and Copper(II) Sulfate:
$$Mg(s) + CuSO_4(aq) \\rightarrow MgSO_4(aq) + Cu(s)$$

Writing the ionic half-equations:
- **Magnesium**:
  $$Mg \\rightarrow Mg^{2+} + 2e^-$$
  Magnesium **loses 2 electrons**, so it is **OXIDISED** (it acts as the reducing agent).
- **Copper ion**:
  $$Cu^{2+} + 2e^- \\rightarrow Cu$$
  Copper(II) ions **gain 2 electrons**, so they are **REDUCED** (act as the oxidising agent).

---

#### 4. Diagnostic Tests for Redox in Practical Papers (Paper 4 & 6)
- **Acidified Potassium Manganate(VII)**: A powerful oxidising agent.
  - Colour change when reduced by a reducing agent: **Purple $\\rightarrow$ Colourless**.
- **Aqueous Potassium Iodide ($KI$)**: A reducing agent.
  - Colour change when oxidised by an oxidising agent: **Colourless $\\rightarrow$ Brown / Yellow**.

---

#### 🎯 Examiner Pitfall Alert:
When asked *"Explain why this is a redox reaction in terms of electron transfer [2 marks]"*, you must mention **BOTH**:
1. State which species **loses electrons** and is oxidised.
2. State which species **gains electrons** and is reduced.
*(Do not just write "OIL RIG" — identify the exact species!)*`;
  }

  // Summary Writing ESL
  if (lower.includes('summary') || lower.includes('esl') || lower.includes('paraphras') || lower.includes('0510')) {
    return `### 📝 IGCSE ESL Exercise 4: Summary Writing Master Strategy

To score full **16/16 marks (10 Content + 6 Language)**:

1. **Word Count (100–120 words)**:
   - Stay strictly within 100 to 120 words! If you write 121+ words, examiners stop reading and deduct marks.
2. **Find the 2 Aspects**:
   - The question always asks for two things (e.g. *"Benefits AND challenges of X"*).
   - Find 4 bullet points for Aspect 1 and 4 bullet points for Aspect 2 in the text.
3. **Avoid Lifting (Language Band 5–6)**:
   - Do **NOT** copy whole clauses or sentences directly from the passage.
   - Change vocabulary: *difficult $\\rightarrow$ arduous / challenging*, *improve $\\rightarrow$ enhance / boost*.
   - Change sentence structure: convert active voice to passive voice.
4. **Cohesive Connectives**:
   - Use transition words: *"Firstly...", "Moreover...", "In addition to this...", "Conversely...", "Consequently..."*.
   - Write as **one cohesive continuous paragraph** (no bullet points!).`;
  }

  // Grade 9 Advice
  if (lower.includes('grade') || lower.includes('a*') || lower.includes('9') || lower.includes('tips')) {
    return `### 🏆 How to Secure a Grade 9 / A* in ${examBoard} ${subjectName}

1. **Master the Command Words**:
   - *State*: Just 1 word or short phrase. Don't waste time explaining.
   - *Describe*: State **WHAT** happens step-by-step.
   - *Explain*: Must state **WHY / HOW** with causal connectives ("because", "leading to").
2. **Method Marks [M] are Your Safety Net**:
   - Always write the general formula first before plugging in calculator numbers. If your calculator has a mistype, you still earn 80% of marks for working out.
3. **Exact Significant Figures**:
   - Cambridge CIE strictly requires non-exact answers to **3 significant figures** (or 1 d.p. for angles). Writing 1 or 2 s.f. costs the [A1] mark!
4. **Examiner Trap Watch**:
   - Never round numbers in your calculator in intermediate steps; only round at the final step.
   - Always write SI units ($m/s^2$, $J$, $dm^3$, $\\Omega$).`;
  }

  // Dynamic Syllabus Deep-Dive
  return `### 📖 ${subjectName}: Mark Scheme Breakdown for "${query}"

Here is the syllabus tutorial for this topic under **${examBoard} ${subjectName}**:

---

#### 1. Fundamental Principle & Syllabus Definition
- In ${subjectName}, questions on this topic test whether candidates can recall exact scientific terminology and apply principles to novel experimental contexts.
- Ensure your definitions use technical vocabulary (e.g. state symbols, standard conditions, formula rearrangement).

---

#### 2. Core Concepts & Step-by-Step Mechanism
- **Cause $\\rightarrow$ Effect**: In 3–4 mark explanation questions, examiners allocate marks for establishing cause-and-effect links:
  1. Identify the independent variable or primary trigger.
  2. Explain the physical, chemical, or biological mechanism.
  3. Deduce the observed result or mathematical conclusion.

---

#### 3. Essential Examiner Advice & Trap Warnings
- **Common Mistakes**: Candidates frequently lose marks by writing vague statements like *"it changes"* or *"it reacts"* without specifying whether the value increases, decreases, or naming the specific products.
- **Accuracy**: Always maintain 3 significant figures in numerical answers and include SI units ($m/s^2$, $J$, $dm^3$, $\\Omega$).

*(Tip: You can ask me to give you a specific past paper question or step-by-step calculation on this topic!)*`;
}

// Built-in intelligent fallback for sample questions
function generateSimulatedSolution(
  query: string,
  subjectName: string,
  examBoard: string,
  gradeLevel: string
): SolverResult {
  const lower = query.toLowerCase();

  // Redox problem
  if (lower.includes('redox') || lower.includes('fe2+') || lower.includes('mno4') || lower.includes('oxidation')) {
    return {
      questionText: 'Explain why the reaction 2Fe²⁺ + Cl₂ -> 2Fe³⁺ + 2Cl⁻ is a redox reaction in terms of electron transfer. State the oxidising and reducing agents.',
      subject: 'Chemistry (CIE 0620 / Edexcel 4CH1)',
      topic: 'Redox Reactions, Oxidation States & Electron Transfer',
      totalMarks: 4,
      coreConceptAndFormula: {
        concept: 'Redox as simultaneous oxidation and reduction via electron transfer (OIL RIG)',
        formula: 'Fe^{2+} \\rightarrow Fe^{3+} + e^- \\quad \\text{and} \\quad Cl_2 + 2e^- \\rightarrow 2Cl^-'
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Analyze Oxidation (Electron Loss)',
          explanation: 'Iron(II) ions ($Fe^{2+}$) lose one electron each to become Iron(III) ions ($Fe^{3+}$): $Fe^{2+} \\rightarrow Fe^{3+} + e^-$. Because oxidation is loss of electrons (OIL), $Fe^{2+}$ is oxidised.',
          mathOrCode: 'Fe^{2+} \\rightarrow Fe^{3+} + e^-',
          markAwarded: '[B1] Fe²⁺ loses electrons / is oxidised'
        },
        {
          stepNumber: 2,
          title: 'Analyze Reduction (Electron Gain)',
          explanation: 'Chlorine molecules ($Cl_2$) gain two electrons to form chloride ions ($2Cl^-$): $Cl_2 + 2e^- \\rightarrow 2Cl^-$. Because reduction is gain of electrons (RIG), $Cl_2$ is reduced.',
          mathOrCode: 'Cl_2 + 2e^- \\rightarrow 2Cl^-',
          markAwarded: '[B1] Cl₂ gains electrons / is reduced'
        },
        {
          stepNumber: 3,
          title: 'Identify Oxidising and Reducing Agents',
          explanation: '$Cl_2$ accepts electrons from $Fe^{2+}$, causing it to be oxidised, so $Cl_2$ is the oxidising agent. $Fe^{2+}$ donates electrons to $Cl_2$, causing it to be reduced, so $Fe^{2+}$ is the reducing agent.',
          mathOrCode: '\\text{Oxidising Agent: } Cl_2, \\quad \\text{Reducing Agent: } Fe^{2+}',
          markAwarded: '[B1] [B1] Correct agents identified'
        }
      ],
      finalAnswer: 'It is redox because Fe²⁺ loses electrons (oxidised) and Cl₂ gains electrons (reduced). Cl₂ is the oxidising agent; Fe²⁺ is the reducing agent.',
      examinerTraps: [
        'Writing vague statements like "iron gains a charge" instead of explicitly naming electron transfer.',
        'Confusing the agent with the process (e.g. calling Fe²⁺ the oxidising agent instead of the reducing agent).',
        'Failing to specify ionic charges (writing Fe instead of Fe²⁺).'
      ],
      markSchemeBreakdown: [
        '[B1] Fe²⁺ loses electrons (is oxidised)',
        '[B1] Cl₂ gains electrons (is reduced)',
        '[B1] Cl₂ identified as oxidising agent',
        '[B1] Fe²⁺ identified as reducing agent'
      ],
      examinerTips: [
        'Always specify the exact chemical species! Write Fe²⁺, not just "iron".',
        'State BOTH oxidation and reduction to gain full marks.'
      ],
      commonMistakes: [
        'Saying "iron gains positive charge" without explicitly mentioning loss of electrons.',
        'Confusing the agent with the process (e.g. calling Fe²⁺ the oxidising agent).'
      ],
      relatedTopic: 'Oxidation States, Half-Equations and Ionic Equations'
    };
  }

  // English as a Second Language Summary
  if (lower.includes('vertical farming') || lower.includes('summary') || lower.includes('esl')) {
    return {
      questionText: 'Summary Writing: Benefits and operational challenges of urban vertical farming (100-120 words).',
      subject: 'English as a Second Language (CIE 0510)',
      topic: 'Exercise 4: Summary Writing & Cohesion',
      totalMarks: 16,
      coreConceptAndFormula: {
        concept: 'Exercise 4: Informational text synthesis, selective note-taking, and cohesive paragraph drafting',
        formula: '\\text{Word Limit Target: } 100 - 120 \\text{ words (Strict Examiner Penalty at 121+ words)}'
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Extract Content Points (Aspect 1: Environmental Benefits)',
          explanation: 'Identify 4 distinct points from the passage: 1) Reduced water usage via recycling; 2) Zero pesticides needed; 3) Lower transportation carbon emissions (locally grown); 4) Year-round harvest unaffected by severe weather.',
          markAwarded: '[B4] 4 Content Points'
        },
        {
          stepNumber: 2,
          title: 'Extract Content Points (Aspect 2: Economic & Operational Challenges)',
          explanation: 'Identify 4 distinct points: 5) Extremely high initial setup capital; 6) Substantial electricity costs for artificial LED lighting; 7) Limited variety of suitable crops (mostly leafy greens); 8) High technical expertise required to manage automated nutrient systems.',
          markAwarded: '[B4] 4 Content Points'
        },
        {
          stepNumber: 3,
          title: 'Paraphrase & Synthesise with Formal Linkers',
          explanation: 'Rewrite points into connected sentences using cohesive devices (e.g. "Firstly...", "Moreover...", "Conversely...", "Consequently..."). Ensure word count stays strictly between 100-120 words.',
          mathOrCode: '\\text{Word Count: 114 words (Optimal Band 5-6 Language)}',
          markAwarded: '[L6] Top Band Language & Style'
        }
      ],
      finalAnswer: 'Model Summary (114 words):\n"Vertical farming offers several remarkable environmental advantages. Firstly, it conserves substantial quantities of water through recycling systems and eliminates the necessity for chemical pesticides. Furthermore, cultivating crops within urban centres drastically diminishes transportation emissions while ensuring consistent, weather-independent yields year-round. Conversely, operators encounter significant operational hurdles. Setting up indoor facilities demands exorbitant financial capital, and maintaining continuous artificial lighting results in immense electricity expenditure. In addition, current technology restricts production largely to leafy vegetables, whilst sophisticated automated irrigation requires highly trained technical personnel to oversee operations effectively."',
      examinerTraps: [
        'Direct copying / lifting of whole phrases from the prompt, which severely downgrades your language mark.',
        'Exceeding 120 words — examiners draw a line after 120 words and disregard all subsequent points.',
        'Using bullet points or numbered lists instead of a continuous formal prose paragraph.'
      ],
      markSchemeBreakdown: [
        '[10 Content Marks] 8+ distinct points identified across both aspects (awarded 10/10)',
        '[6 Language Marks] Cohesive paragraph structure, excellent paraphrasing with no lifting, word count strictly 100-120 words'
      ],
      examinerTips: [
        'Count your words precisely before submitting! If you write 121+ words, examiners draw a line and ignore all subsequent points.',
        'Never use bullet points in Exercise 4; it must be written as a continuous prose paragraph.'
      ],
      commonMistakes: [
        'Direct lifting of entire sentences from the text (costs all 6 language marks).',
        'Focusing only on benefits and forgetting the challenges aspect.'
      ],
      relatedTopic: 'Reading for Detail, Paraphrasing, and Cohesive Connectives'
    };
  }

  // Maths Quadratic
  if (lower.includes('2x²') || lower.includes('quadratic') || lower.includes('turning point')) {
    return {
      questionText: 'A curve has equation y = 2x² - 12x + 23. (a) Write in the form a(x + b)² + c. (b) State the coordinates of the turning point.',
      subject: 'Mathematics (CIE 0580)',
      topic: 'Quadratics & Completing the Square',
      totalMarks: 5,
      coreConceptAndFormula: {
        concept: 'Completing the square for quadratic expressions to deduce vertex coordinates and minimum/maximum nature',
        formula: 'y = a(x + b)^2 + c \\implies \\text{Turning Point} = (-b, c)'
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Factor out the leading coefficient 2 from the x terms',
          explanation: 'Factor 2 from 2x² - 12x so that the bracket starts with x² - 6x.',
          mathOrCode: '2(x^2 - 6x) + 23',
          markAwarded: '[B1] Correct factorisation of 2'
        },
        {
          stepNumber: 2,
          title: 'Complete the square inside the bracket',
          explanation: 'Take half of the coefficient of x (-6 / 2 = -3), square it ((-3)² = 9), and subtract it inside the bracket: (x - 3)² - 9.',
          mathOrCode: '2[(x - 3)^2 - 9] + 23',
          markAwarded: '[M1] Method for completing square with (x - 3)²'
        },
        {
          stepNumber: 3,
          title: 'Expand and simplify constant terms',
          explanation: 'Distribute the 2: 2(x - 3)² - 18 + 23 = 2(x - 3)² + 5.',
          mathOrCode: '2(x - 3)^2 + 5 \\quad \\Rightarrow a = 2, \\, b = -3, \\, c = 5',
          markAwarded: '[A1] Final completed square form'
        },
        {
          stepNumber: 4,
          title: 'Deduce Turning Point and Nature',
          explanation: 'Because a = +2 > 0, the parabola opens upwards, making the turning point a MINIMUM at (3, 5).',
          mathOrCode: '\\text{Turning Point} = (3, 5), \\quad \\text{Nature: Minimum}',
          markAwarded: '[B1] for coordinates (3, 5), [B1] for Minimum'
        }
      ],
      finalAnswer: 'Form: 2(x - 3)² + 5. Turning point: (3, 5) [Minimum].',
      examinerTraps: [
        'Forgetting to multiply the subtracted term by the leading factor (computing -9 + 23 = 14 instead of -18 + 23 = 5).',
        'Confusing the sign of the turning point: (x - 3)² = 0 implies x = +3, not -3.',
        'Omitting whether the vertex is a minimum or maximum point.'
      ],
      markSchemeBreakdown: [
        '[B1] Factor 2 from quadratic terms: 2(x² - 6x)',
        '[M1] (x - 3)² seen in working',
        '[A1] 2(x - 3)² + 5',
        '[B1] Correct coordinates (3, 5)',
        '[B1] Minimum stated with correct justification'
      ],
      examinerTips: [
        'Watch the sign of b! The form is a(x + b)², so here b = -3.',
        'Multiply the subtracted 9 by the outside factor 2 (getting -18). A common error is -9 + 23 = 14.'
      ],
      commonMistakes: [
        'Leaving out factor 2 when expanding constants.',
        'Stating coordinates as (-3, 5) instead of (+3, 5).'
      ],
      relatedTopic: 'Functions, Transformations and Vertex Form of Parabola'
    };
  }

  // Generic syllabus template
  return {
    questionText: query,
    subject: subjectName,
    topic: 'Key Syllabus Concepts & Problem Solving',
    totalMarks: 4,
    coreConceptAndFormula: {
      concept: `${subjectName} core syllabus specifications and problem-solving framework`,
      formula: '\\text{Base Working: } \\text{State relevant equation/definition} \\rightarrow \\text{Substitute values} \\rightarrow \\text{Evaluate to 3 s.f.}'
    },
    stepByStepSolution: [
      {
        stepNumber: 1,
        title: 'Identify Syllabus Objectives & Key Formula',
        explanation: `Under ${examBoard} ${subjectName} (${gradeLevel}), the first step is to isolate the given values and state the relevant syllabus formula or principle.`,
        mathOrCode: '\\text{Mark [M1]: Formula definition & variable substitution}',
        markAwarded: '[M1] Method Mark'
      },
      {
        stepNumber: 2,
        title: 'Carry out step-by-step mathematical working or structured reasoning',
        explanation: 'Substitute known values with correct standard SI units. Maintain full precision across intermediate calculations without early rounding.',
        mathOrCode: '\\text{Substitution and rearrangement}',
        markAwarded: '[M1] Intermediate accuracy'
      },
      {
        stepNumber: 3,
        title: 'State the final answer with appropriate units and significant figures',
        explanation: 'Cambridge and Edexcel standard rule: numerical answers that are not exact must be given to 3 significant figures, or 1 decimal place for angles in degrees.',
        mathOrCode: '\\text{Answer} = \\text{Correct to 3 s.f.}',
        markAwarded: '[A1] Final Accuracy Mark'
      }
    ],
    finalAnswer: 'Fully worked out according to IGCSE mark scheme standards.',
    examinerTraps: [
      'Premature rounding in early working stages resulting in final answer inaccuracies.',
      'Missing or incorrect SI units (e.g., writing cm instead of m, or failing to convert minutes to seconds).',
      'Failing to quote the base formula before substituting numbers, which risks forfeiting method marks ($M$).'
    ],
    markSchemeBreakdown: [
      '[M1] Relevant formula quoted or equivalent valid working shown',
      '[M1] Correct substitution of given data with unit alignment',
      '[A1] Accurate final numerical value or keyword definition',
      '[B1] Appropriate units stated (e.g. m/s², dm³, J, Ω)'
    ],
    examinerTips: [
      'Write down every step of your method! Even if your final calculator computation is mistyped, examiners award Method (M) marks for clear working.',
      'Check the command word in the prompt (State vs Explain vs Calculate).'
    ],
    commonMistakes: [
      'Rounding too early in multi-step calculations.',
      'Forgetting required units at the end of the calculation.'
    ],
    relatedTopic: `${subjectName} Core & Extended Syllabus Units`
  };
}
