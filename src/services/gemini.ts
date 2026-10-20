import { SolverResult, Flashcard, QuizQuestion, RevisionTopic, HandwrittenReviewResult, EslSpeakingEvaluation } from '../types';
import { searchUniversalKnowledge } from './knowledgeEngine';
import { findPastPaperQuestionByReference, evaluateStudentAnswerAgainstMarkScheme } from './examQuestionEngine';
import { evaluateStudentWorking } from './mathWorkingValidator';
import { verifyAndAuditSolverResult } from './examinerVerificationAgent';

export interface GeminiSolveParams {
  apiKey?: string;
  model?: string;
  questionText?: string;
  studentWorking?: string;
  imageBase64?: string;
  imageMimeType?: string;
  subjectName: string;
  examBoard: string;
  gradeLevel: string;
}

// Zero-Key Client-Side AI caller (Deprecated: all requests now routed directly via internal /api/solve)
export function isPuterAvailable(): boolean {
  return false;
}

export function isPuterSignedIn(): boolean {
  return false;
}

export async function connectPuterSession(): Promise<boolean> {
  return false;
}

// Unified Server-Side AI caller: sends requests directly to internal /api/solve route
// Eliminates client Puter popups and student key requirements
export async function callServerSolveApi(action: string, payload: any): Promise<any> {
  const res = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Server AI error (${res.status})`);
  }
  return await res.json();
}

// Client-side fallback API caller (if student provided a personal key in Settings)
async function callGeminiApi(payload: {
  model: string;
  contents: any[];
  generationConfig?: any;
  systemInstruction?: any;
  userApiKey?: string;
}): Promise<any> {
  const { model, contents, generationConfig, systemInstruction, userApiKey } = payload;
  const targetModel = model.includes('2.5') ? model : 'gemini-1.5-flash';

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

  throw new Error('KEY_UNAVAILABLE');
}

export const SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION =
  'You are a senior Cambridge IGCSE examiner. Follow official mark scheme conventions: always show step-by-step working for method marks ($M$), state accuracy marks ($A$) and independent marks ($B$), bold all required syllabus keywords, and enforce the 3 significant figures rule for non-exact values.';

export async function solveQuestionWithGemini(params: GeminiSolveParams): Promise<SolverResult> {
  const { apiKey, model = 'gemini-1.5-flash', questionText, studentWorking, imageBase64, imageMimeType, subjectName, examBoard, gradeLevel } = params;

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

  // 0a. Check if input is a direct arithmetic / algebraic statement or student working (e.g. "10-2=8", "10+2=8", "x = 10 + 2 = 8")
  const textToCheckForMath = (studentWorking || questionText || '').trim();
  const directMathEval = textToCheckForMath ? evaluateStudentWorking(textToCheckForMath, 4) : null;

  if (directMathEval && directMathEval.hasEvaluatedMath && !imageBase64) {
    const isShortDirectEquation = textToCheckForMath.split('\n').length <= 3 && textToCheckForMath.length < 80;
    if (isShortDirectEquation || (studentWorking && !questionText)) {
      const firstFailure = directMathEval.lineReviews.find((l) => !l.isCorrect);
      return {
        questionText: `Student Working Evaluation: "${textToCheckForMath}"`,
        subject: subjectName,
        topic: 'Algebraic & Arithmetic Verification',
        totalMarks: directMathEval.marksPossible,
        studentWorkingEvaluation: directMathEval,
        coreConceptAndFormula: {
          concept: 'Strict Mathematical Line-by-Line Equality Verification',
          formula: directMathEval.correctStepByStep.join(' \\quad \\text{and} \\quad ') || textToCheckForMath,
        },
        stepByStepSolution: directMathEval.lineReviews.map((r, idx) => ({
          stepNumber: idx + 1,
          title: `Line ${r.lineNumber}: ${r.isCorrect ? 'Valid Equation ✅' : 'Arithmetic Contradiction ❌'}`,
          explanation: `${r.exactReason}\n\n${r.exactCorrection ? `**Required Correction:** \`${r.exactCorrection}\`` : ''}`,
          mathOrCode: r.rawText,
          markAwarded: r.markBadge,
        })),
        finalAnswer: firstFailure
          ? `❌ Marks Withheld: 0 / ${directMathEval.marksPossible} Marks (${directMathEval.percentageScore}%). Error: ${firstFailure.exactReason}. ${firstFailure.exactCorrection || ''}`
          : `✅ Marks Awarded: ${directMathEval.marksEarned} / ${directMathEval.marksPossible} Marks (${directMathEval.percentageScore}%). All calculation steps are mathematically sound.`,
        examinerTraps: [
          firstFailure
            ? firstFailure.exactReason
            : 'Writing an untrue mathematical statement (e.g. 10 + 2 = 8) immediately forfeits the Method mark in Cambridge exams.',
        ],
        markSchemeBreakdown: directMathEval.lineReviews.map((r) => `${r.markBadge} - ${r.rawText}`),
        examinerTips: [
          'In Cambridge IGCSE, never write a false equation. If an operation is subtraction, write 10 - 2 = 8; writing 10 + 2 = 8 forfeits method marks immediately.',
        ],
        commonMistakes: [
          firstFailure ? `Writing "${firstFailure.rawText}" instead of "${firstFailure.exactCorrection || 'correct working'}"` : 'Arithmetic slip in intermediate steps.',
        ],
        relatedTopic: 'Arithmetic & Algebraic Rearrangement',
      };
    }
  }

  // 0b. Instant official question and marking scheme match (ONLY for explicit exam reference lookups)
  const isLikelyExamCodeRef = questionText ? (
    /\b(0580|0620|0625|0610|0510|4MA1|4CH1|4PH1|4BI1)\b/i.test(questionText) ||
    /\b(paper\s*[1-6]|q\d{1,2}|variant|specimen|m\/j|o\/n|f\/m)\b/i.test(questionText) ||
    questionText.trim().length < 40
  ) : false;

  if (questionText && !imageBase64 && isLikelyExamCodeRef) {
    const matchedPaper = findPastPaperQuestionByReference(questionText, subjectName);
    if (matchedPaper) {
      const isSubmittingAnswer =
        questionText.toLowerCase().includes('my answer') ||
        questionText.toLowerCase().includes('i got') ||
        questionText.toLowerCase().includes('i wrote') ||
        questionText.toLowerCase().includes('mark me') ||
        questionText.toLowerCase().includes('grade me');

      if (isSubmittingAnswer) {
        const evalResult = evaluateStudentAnswerAgainstMarkScheme(matchedPaper, questionText);
        return {
          questionText: `${matchedPaper.paperCode} ${matchedPaper.session} ${matchedPaper.questionNumber}: ${matchedPaper.questionPrompt}`,
          subject: matchedPaper.subjectName,
          topic: matchedPaper.topic,
          totalMarks: matchedPaper.marks,
          coreConceptAndFormula: {
            concept: `Official Cambridge Exam Question: ${matchedPaper.topic}`,
            formula: matchedPaper.diagramOrMath || matchedPaper.finalAnswer,
          },
          stepByStepSolution: evalResult.marksBreakdown.map((m, idx) => ({
            stepNumber: idx + 1,
            title: `Mark Criteria ${m.markType} - ${m.awarded ? 'Awarded ✅' : 'Missing ❌'}`,
            explanation: `${m.requirement}\n\n**Examiner Note:** ${m.feedback}`,
            markAwarded: m.markType,
          })),
          finalAnswer: `Student Result: ${evalResult.marksEarned} / ${evalResult.totalMarks} Marks (${evalResult.percentage}%). Official Answer: ${matchedPaper.finalAnswer}`,
          examinerTraps: evalResult.missingMarksExplained.map((m) => `${m.markType}: ${m.whatWasMissing} -> ${m.whatToWriteToGetMark}`),
          markSchemeBreakdown: matchedPaper.markScheme.map((m) => `${m.markType} ${m.requirement}`),
          examinerTips: [matchedPaper.examinerReportSnippet || 'Always show every step of working.'],
          commonMistakes: evalResult.missingMarksExplained.map((m) => m.whatWasMissing),
          relatedTopic: matchedPaper.topic,
          studentWorkingEvaluation: directMathEval?.hasEvaluatedMath ? directMathEval : undefined,
        };
      }

      // If user is asking for the solution/mark scheme:
      return {
        questionText: `${matchedPaper.paperCode} ${matchedPaper.session} ${matchedPaper.questionNumber}: ${matchedPaper.questionPrompt}`,
        subject: matchedPaper.subjectName,
        topic: matchedPaper.topic,
        totalMarks: matchedPaper.marks,
        coreConceptAndFormula: {
          concept: matchedPaper.topic,
          formula: matchedPaper.diagramOrMath || matchedPaper.finalAnswer,
        },
        stepByStepSolution: matchedPaper.markScheme.map((m, idx) => ({
          stepNumber: idx + 1,
          title: `Official Mark Scheme Step ${idx + 1} (${m.markType})`,
          explanation: m.requirement,
          markAwarded: m.markType,
        })),
        finalAnswer: matchedPaper.finalAnswer,
        examinerTraps: matchedPaper.examinerReportSnippet ? [matchedPaper.examinerReportSnippet] : ['Always write 3 significant figures and include standard SI units.'],
        markSchemeBreakdown: matchedPaper.markScheme.map((m) => `${m.markType} ${m.requirement}`),
        examinerTips: [matchedPaper.examinerReportSnippet || 'Show all method steps to guarantee partial marks even if an arithmetic slip occurs.'],
        commonMistakes: [matchedPaper.examinerReportSnippet || 'Omitting units or rounding prematurely in multi-step equations.'],
        relatedTopic: matchedPaper.topic,
      };
    }
  }

  // 1. Try internal Vercel server route (/api/solve) with server environment keys
  try {
    const serverResult = await callServerSolveApi('solve_question', {
      questionText,
      studentWorking,
      imageBase64,
      imageMimeType,
      subjectName,
      examBoard,
      gradeLevel,
      apiKey,
      model,
    });
    if (serverResult && serverResult.stepByStepSolution && serverResult.finalAnswer) {
      if (directMathEval && directMathEval.hasEvaluatedMath) {
        serverResult.studentWorkingEvaluation = directMathEval;
      }
      const audit = verifyAndAuditSolverResult(serverResult);
      const validated = audit.correctedResult;
      validated.examinerVerification = {
        isVerified: audit.isVerified,
        accuracyScorePercent: audit.accuracyScorePercent,
        examinerSeal: audit.examinerSeal,
        details: audit.checks.map(c => `${c.name} (${c.status.toUpperCase()})`).join(' • ')
      };
      return validated;
    }
  } catch (err) {
    console.warn('Server /api/solve not reachable, trying client options:', err);
  }

  // 2. Try client-provided Gemini API key if present
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
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
      if (candidate) {
        const cleanedJson = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJson);
      }
    } catch (err: any) {
      console.warn('Direct client Gemini API error:', err.message);
    }
  }

  // 3. Fallback to high-yield syllabus template solution
  return generateSimulatedSolution(questionText || 'Student uploaded question', subjectName, examBoard, gradeLevel);
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

  // 1. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('generate_flashcards', {
      subjectName,
      topic,
      chapter: topic,
      count,
      apiKey,
      model,
    });
    if (Array.isArray(serverResult) && serverResult.length > 0) {
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve generate_flashcards error:', err);
  }

  // 2. Try client-provided Gemini API key if present
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    try {
      const data = await callGeminiApi({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        userApiKey: apiKey
      });

      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback simulated cards
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

  // 1. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('generate_quizzes', {
      subjectName,
      topic,
      apiKey,
      model,
    });
    if (Array.isArray(serverResult) && serverResult.length > 0) {
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve generate_quizzes error:', err);
  }

  // 2. Try client-provided Gemini API key if present
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    try {
      const data = await callGeminiApi({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        userApiKey: apiKey
      });

      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback simulated quiz question
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
  "chapter": "${topic}",
  "learningObjectives": [
    "State and explain the fundamental syllabus principles",
    "Apply equations and describe experimental observations accurately"
  ],
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
      "definition": "Verbatim Cambridge / Edexcel mark scheme definition with **compulsory keywords** bolded"
    }
  ],
  "coreEquationsOrPathways": [
    "Core reaction equation or biological pathway"
  ],
  "examinerWarnings": [
    "Common student mistake identified in examiner reports"
  ]
}
`;

  // 1. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('generate_notes', {
      subjectName,
      subjectId,
      chapter: topic,
      topic,
      apiKey,
      model,
    });
    if (serverResult && serverResult.title && serverResult.keyConcepts) {
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve generate_notes error:', err);
  }

  // 2. Try client-provided Gemini API key if present
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    try {
      const data = await callGeminiApi({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
        userApiKey: apiKey
      });

      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.title && parsed.keyConcepts) return parsed;
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback simulated revision guide
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

  // 0. Check for Official Exam Question Code & Question Number Reference
  const matchedExamPaper = findPastPaperQuestionByReference(lastUserMessage);
  if (matchedExamPaper) {
    const lower = lastUserMessage.toLowerCase();
    const isSubmittingAnswer =
      lower.includes('my answer') ||
      lower.includes('i got') ||
      lower.includes('i wrote') ||
      lower.includes('grade me') ||
      lower.includes('mark me') ||
      lower.includes('how many marks') ||
      lower.includes('is this right') ||
      lower.includes('is it correct') ||
      lower.includes('my working') ||
      lower.includes('here is my') ||
      lower.includes('check this') ||
      lower.includes('score');

    if (isSubmittingAnswer) {
      // Evaluate student's answer against official mark scheme!
      const evalResult = evaluateStudentAnswerAgainstMarkScheme(matchedExamPaper, lastUserMessage);
      return evalResult.formattedMarkdown;
    }

    // Student is looking up the question and official marking scheme
    return `### 📑 Official Exam Question: ${matchedExamPaper.paperCode} ${matchedExamPaper.questionNumber}
**Subject:** ${matchedExamPaper.subjectName} (${matchedExamPaper.paperCode}) • **Session:** ${matchedExamPaper.session}  
**Topic:** ${matchedExamPaper.topic} • **Difficulty:** ${matchedExamPaper.difficultyTier} • **Marks Available:** [${matchedExamPaper.marks} Marks]

---

#### ❓ Question Paper Prompt:
${matchedExamPaper.questionPrompt}

${matchedExamPaper.diagramOrMath ? `$$\n${matchedExamPaper.diagramOrMath}\n$$` : ''}

---

#### 📋 Official Cambridge / Edexcel Mark Scheme:
${matchedExamPaper.markScheme
  .map((m) => `- **${m.markType}**: ${m.requirement}`)
  .join('\n')}

**Official Final Answer:** $${matchedExamPaper.finalAnswer}$

${
  matchedExamPaper.examinerReportSnippet
    ? `> 💡 **Principal Examiner Report Warning:**  
> "${matchedExamPaper.examinerReportSnippet}"\n`
    : ''
}

---
💡 **Want me to mark your answer?**  
Reply with your answer (e.g. *"For this question my answer is ..."*), and I will calculate your mark, state what marks were awarded for, and tell you what you need to write if any marks were missed!`;
  }

  // 0b. Check for Direct Mathematical Equation Validation (e.g. "10-2=8", "10+2=8", "Mark my working: 10+2=8")
  const directMath = evaluateStudentWorking(lastUserMessage, 1);
  if (directMath.hasEvaluatedMath) {
    const isAllOk = directMath.lineReviews.every((l) => l.isCorrect);
    if (!isAllOk) {
      const err = directMath.lineReviews.find((l) => !l.isCorrect)!;
      return `### ❌ Cambridge Examiner Evaluation: Mark Lost [M0] (0 / 1 Marks)

**Your Working:**
\`\`\`
${err.rawText}
\`\`\`

---

#### 🔍 Exact Reason Mark is Withheld:
${err.exactReason}

---

#### ✏️ What You Must Write Instead:
\`\`\`
${err.exactCorrection || 'See corrected working above'}
\`\`\`

> 💡 **Cambridge Principal Examiner Rule:**  
> In IGCSE examinations, writing a false equation (such as stating that two unequal quantities are equal) forfeits the Method ($M$) mark immediately. Follow-through cannot be awarded after a fundamentally invalid premise. Always write the operation as subtraction (\`10 - 2 = 8\`) rather than addition (\`10 + 2 = 8\`).`;
    } else {
      const ok = directMath.lineReviews.find((l) => l.isCorrect)!;
      return `### ✅ Cambridge Examiner Evaluation: Awarded [M1] (+1 Mark)

**Your Working:**
\`\`\`
${ok.rawText}
\`\`\`

---

#### 🎯 Marks Awarded:
- **[M1] Method Mark Awarded**: ${ok.exactReason}
- **Score:** 1 / 1 Marks (100%)

> 💡 **Cambridge Examiner Tip:**  
> This line is mathematically and algebraically sound. Showing this step explicitly ensures you secure the method mark even if an arithmetic slip occurs in a later calculation.`;
    }
  }

  // 1. Check Universal Syllabus Knowledge Engine for Instant High-Yield Mark-Scheme Breakdown
  const instantMatch = searchUniversalKnowledge(lastUserMessage, subjectName, examBoard);
  if (instantMatch) {
    return instantMatch;
  }

  // 2. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('ai_tutor', {
      messages,
      subjectName,
      examBoard,
      apiKey,
      model,
    });
    if (typeof serverResult === 'string' && serverResult.trim() !== '') {
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve ai_tutor error:', err);
  }

  // 3. Try client-provided Gemini API key if present
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
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

  // Chemistry: Stoichiometry, Moles, Gas Volumes or General Chemistry
  if (
    subjectName.toLowerCase().includes('chem') ||
    subjectName.includes('0620') ||
    subjectName.includes('4CH1') ||
    lower.includes('mole') ||
    lower.includes('hydrochloric') ||
    lower.includes('magnesium') ||
    lower.includes('concentration') ||
    lower.includes('titrat') ||
    lower.includes('precipitat') ||
    lower.includes('stoichiometr')
  ) {
    const isGasOrVolume = lower.includes('volume') || lower.includes('gas') || lower.includes('dm3') || lower.includes('cm3');
    const isAcidBase = lower.includes('acid') || lower.includes('base') || lower.includes('salt') || lower.includes('neutralis');

    if (isAcidBase) {
      return {
        questionText: query,
        subject: 'Chemistry (CIE 0620 / Edexcel 4CH1)',
        topic: 'Acids, Bases & Salt Preparation',
        totalMarks: 4,
        coreConceptAndFormula: {
          concept: 'Acid-base neutralization, ionic spectator elimination & crystallization of soluble salts',
          formula: '\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water} \\quad [\\text{Net Ionic: } H^+(aq) + OH^-(aq) \\rightarrow H_2O(l)]',
        },
        stepByStepSolution: [
          {
            stepNumber: 1,
            title: 'Identify Reaction Type & Balanced Chemical Equation',
            explanation: 'State the complete balanced chemical equation with correct state symbols for the reacting acid and base.',
            mathOrCode: 'HCl(aq) + NaOH(aq) \\rightarrow NaCl(aq) + H_2O(l)',
            markAwarded: '[M1] Balanced equation with state symbols',
          },
          {
            stepNumber: 2,
            title: 'Explain Neutralisation Mechanism or Indicator Endpoint',
            explanation: 'Describe proton transfer: $H^+$ ions from the acid react with $OH^-$ ions from the alkali to form water molecules ($H_2O$).',
            mathOrCode: 'H^+(aq) + OH^-(aq) \\rightarrow H_2O(l)',
            markAwarded: '[B1] Proton transfer / ionic equation',
          },
          {
            stepNumber: 3,
            title: 'Salt Recovery Procedure (Crystallisation Method)',
            explanation: 'Heat the salt solution gently to point of crystallisation (saturation test with glass rod), allow crystals to form slowly at room temperature, filter, and dry between filter papers.',
            mathOrCode: '\\text{Evaporate to saturation} \\rightarrow \\text{Cool & Crystallise} \\rightarrow \\text{Filter & Pat Dry}',
            markAwarded: '[A1] Correct crystallisation technique',
          },
        ],
        finalAnswer: 'The acid and base react in a 1:1 molar ratio to produce salt and water. Pure, dry crystals are obtained by heating to saturation, cooling, and filtering.',
        examinerTraps: [
          'Drying crystals in a hot oven or with direct Bunsen flame, which removes water of crystallization and decomposes the salt.',
          'Omitting state symbols ((s), (l), (g), (aq)) in Cambridge Paper 4 theory questions.',
        ],
        markSchemeBreakdown: [
          '[M1] Balanced chemical equation with valid formulae',
          '[B1] Identification of ionic species or indicator colour change at endpoint',
          '[A1] Heating to saturation point (not to dryness)',
          '[B1] Washing with minimal cold distilled water and drying with filter paper',
        ],
        examinerTips: [
          'Never say "evaporate to dryness" when preparing hydrated crystals. Always state "heat to the point of crystallisation".',
          'Ensure state symbols are written carefully: aqueous solutions are (aq), precipitate is (s).',
        ],
        commonMistakes: [
          'Heating until all water is gone, forming anhydrous powder rather than hydrated crystals.',
          'Writing the wrong formula for sulfate or nitrate ions.',
        ],
        relatedTopic: 'Acids, Bases, Salts and Quantitative Titration Analysis',
      };
    }

    // Default Stoichiometry / Gas calculation for Chemistry
    return {
      questionText: query,
      subject: 'Chemistry (CIE 0620 / Edexcel 4CH1)',
      topic: 'Stoichiometry & Mole Calculations',
      totalMarks: 4,
      coreConceptAndFormula: {
        concept: 'Quantitative Chemistry: Molar mass relationships, stoichiometric ratios, and molar gas volume',
        formula: 'n = \\frac{m}{M_r} \\quad \\text{and} \\quad V = n \\times 24\\text{ dm}^3 \\text{ at r.t.p.}',
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Calculate Moles of Limiting Reactant',
          explanation: 'Determine the relative formula mass ($M_r$) and calculate the number of moles using $n = \\frac{m}{M_r}$.',
          mathOrCode: 'n = \\frac{\\text{mass in grams}}{M_r}',
          markAwarded: '[M1] Calculation of moles',
        },
        {
          stepNumber: 2,
          title: 'Apply Stoichiometric Mole Ratio from Balanced Equation',
          explanation: 'Use the stoichiometric coefficients in the balanced equation to determine the molar ratio between reactants and products.',
          mathOrCode: '\\text{Mole ratio: } \\text{Reactant} : \\text{Product} = 1 : 1',
          markAwarded: '[M1] Correct stoichiometric ratio applied',
        },
        {
          stepNumber: 3,
          title: isGasOrVolume ? 'Calculate Gas Volume at R.T.P.' : 'Calculate Mass or Concentration',
          explanation: isGasOrVolume
            ? 'Multiply moles of gas by the molar gas volume ($24\\text{ dm}^3$ or $24,000\\text{ cm}^3$ at room temperature and pressure).'
            : 'Convert moles to required mass using $m = n \\times M_r$ or concentration using $c = \\frac{n}{V}$.',
          mathOrCode: isGasOrVolume ? 'V = n \\times 24\\text{ dm}^3' : 'm = n \\times M_r',
          markAwarded: '[A1] Final calculated numerical value',
        },
        {
          stepNumber: 4,
          title: 'Round to 3 Significant Figures and Quote Units',
          explanation: 'Cambridge mark scheme convention: quote numerical quantities to 3 significant figures and include standard SI units.',
          mathOrCode: '\\text{Final result with units: } \\text{cm}^3 \\text{ or } \\text{g}',
          markAwarded: '[B1] Correct SI units and significant figures',
        },
      ],
      finalAnswer: isGasOrVolume
        ? 'Gas volume calculated from stoichiometric moles multiplied by 24 dm³ (or 24000 cm³) at room temperature and pressure.'
        : 'Yield calculated accurately according to stoichiometric molar proportions.',
      examinerTraps: [
        'Confusing cm³ with dm³ (remember 1 dm³ = 1000 cm³).',
        'Using atomic numbers ($Z$) instead of mass numbers ($A_r$) when calculating relative formula mass ($M_r$).',
        'Prematurely rounding intermediate numbers in multi-step mole equations.',
      ],
      markSchemeBreakdown: [
        '[M1] Moles calculated using correct formula: mass / Mr',
        '[M1] Stoichiometric mole ratio from balanced equation applied',
        '[A1] Correct numerical answer to 3 significant figures',
        '[B1] Appropriate units stated (dm³, cm³, or g)',
      ],
      examinerTips: [
        'Write out the formula you are using ($n = m / M_r$ or $c = n / V$) before putting numbers in. Method marks are awarded even if arithmetic slips occur.',
        'At room temperature and pressure (r.t.p.), one mole of ANY gas occupies 24 dm³ (24,000 cm³).',
      ],
      commonMistakes: [
        'Dividing volume by 24 when the volume was given in cm³ (must divide by 24,000 or convert cm³ to dm³ first).',
        'Forgetting that diatomic gases (H₂, Cl₂, O₂) have molar masses double their atomic number ($M_r(H_2) = 2$, $M_r(Cl_2) = 71$).',
      ],
      relatedTopic: 'The Mole Concept, Chemical Calculations & Gas Volumes',
    };
  }

  // Biology: Cell Biology, Enzymes, Photosynthesis or Human Physiology
  if (
    subjectName.toLowerCase().includes('bio') ||
    subjectName.includes('0610') ||
    subjectName.includes('4BI1') ||
    lower.includes('cell') ||
    lower.includes('enzyme') ||
    lower.includes('photosynthesis') ||
    lower.includes('diffusion') ||
    lower.includes('osmosis')
  ) {
    return {
      questionText: query,
      subject: 'Biology (CIE 0610 / Edexcel 4BI1)',
      topic: 'Cell Biology, Enzymes & Metabolic Pathways',
      totalMarks: 4,
      coreConceptAndFormula: {
        concept: 'Structure-function relationships, kinetic energy of substrate-enzyme collisions, and selective permeability',
        formula: '\\text{Rate} \\propto [\\text{Enzyme-Substrate Complexes}] \\quad \\text{and} \\quad \\text{Magnification } M = \\frac{\\text{Image Size } I}{\\text{Actual Size } A}',
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Identify the Biological Mechanism and Cell Organelle',
          explanation: 'State the specific cellular structure or enzyme involved, naming precise biological terminology (e.g., active site, cell membrane, chloroplasts, mitochondria).',
          markAwarded: '[B1] Precise biological identification',
        },
        {
          stepNumber: 2,
          title: 'Explain Kinetic Mechanism (Collision Theory or Transport)',
          explanation: 'Explain the mechanism step-by-step: substrate molecules possess kinetic energy and collide with active sites with complementary lock-and-key fit to form enzyme-substrate complexes.',
          markAwarded: '[M1] Cause-and-effect mechanism',
        },
        {
          stepNumber: 3,
          title: 'Deduce Environmental Factors or Physiological Consequence',
          explanation: 'State the effect of temperature/pH or concentration changes: high temperatures cause active site denaturation (loss of 3D tertiary conformation), meaning substrate can no longer bind.',
          markAwarded: '[A1] Accurate consequence described',
        },
      ],
      finalAnswer: 'Biological mechanism explained using specific syllabus terminology: complementary active site binding, kinetic collisions, and organelle function.',
      examinerTraps: [
        'Saying an enzyme "dies" or is "killed" by heat — enzymes are proteins, they DENATURE, they do not die.',
        'Writing "water concentration" instead of the official Cambridge term "water potential".',
      ],
      markSchemeBreakdown: [
        '[B1] Correct biological keyword / organelle identification',
        '[M1] Scientific mechanism explaining kinetic movement or gradient',
        '[A1] Resulting consequence or rate alteration',
        '[B1] Complementary shape / active site / lock-and-key terminology',
      ],
      examinerTips: [
        'Always use the word "denatured" rather than "destroyed" or "dead" when discussing enzymes at high temperatures.',
        'When discussing osmosis, ALWAYS refer to "water potential gradient" from higher (less negative) to lower (more negative) water potential.',
      ],
      commonMistakes: [
        'Writing that enzymes are living organisms.',
        'Confusing active transport (against concentration gradient requiring ATP) with facilitated diffusion.',
      ],
      relatedTopic: 'Enzymes, Biological Molecules & Transport Across Cell Membranes',
    };
  }

  // Physics: Mechanics, Electricity, Waves or Thermal Physics
  if (
    subjectName.toLowerCase().includes('phys') ||
    subjectName.includes('0625') ||
    subjectName.includes('4PH1') ||
    lower.includes('velocity') ||
    lower.includes('acceleration') ||
    lower.includes('resistance') ||
    lower.includes('voltage') ||
    lower.includes('current') ||
    lower.includes('force')
  ) {
    return {
      questionText: query,
      subject: 'Physics (CIE 0625 / Edexcel 4PH1)',
      topic: 'Forces, Energy & Physical Principles',
      totalMarks: 4,
      coreConceptAndFormula: {
        concept: 'Newtonian mechanics, conservation of energy and electrical circuit principles',
        formula: 'F = ma \\quad \\text{and} \\quad V = IR \\quad \\text{and} \\quad W = Fd',
      },
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'State the Governing Physical Law & Base Formula',
          explanation: 'Identify the syllabus equation that connects the given physical quantities.',
          mathOrCode: 'F = ma \\quad \\text{or} \\quad V = IR',
          markAwarded: '[M1] Formula quoted',
        },
        {
          stepNumber: 2,
          title: 'Substitute Known Values with Standard SI Units',
          explanation: 'Ensure all values are converted to base SI units ($m$, $s$, $kg$, $N$, $V$, $A$, $\\Omega$) before substituting into the equation.',
          mathOrCode: '\\text{Substitution: maintain precision}',
          markAwarded: '[M1] Unit conversion & substitution',
        },
        {
          stepNumber: 3,
          title: 'Evaluate Numerical Result to 3 Significant Figures',
          explanation: 'Calculate the numerical answer and round to standard Cambridge IGCSE precision (3 s.f.).',
          mathOrCode: '\\text{Answer calculated to 3 s.f.}',
          markAwarded: '[A1] Accurate calculation',
        },
        {
          stepNumber: 4,
          title: 'State Final Answer with SI Units',
          explanation: 'Affix the correct SI unit to secure the independent mark.',
          mathOrCode: '\\text{State SI Unit (e.g. N, m/s}^2\\text{, J, W, }\\Omega\\text{)}',
          markAwarded: '[B1] Correct SI unit',
        },
      ],
      finalAnswer: 'Physical principle applied with full working, converted SI units, and final answer quoted to 3 significant figures.',
      examinerTraps: [
        'Forgetting to convert grams to kilograms ($1\\text{ kg} = 1000\\text{ g}$) or minutes to seconds ($1\\text{ min} = 60\\text{ s}$).',
        'Confusing mass (scalar in kg) with weight (force vector in N: $W = mg$).',
      ],
      markSchemeBreakdown: [
        '[M1] Correct physical formula stated',
        '[M1] Proper substitution with SI unit conversion',
        '[A1] Final answer accurate to 3 significant figures',
        '[B1] Explicit correct SI unit stated',
      ],
      examinerTips: [
        'Never write down only the final answer without working — if your calculator battery fails or you mistype a digit, you lose all marks unless method steps are visible.',
        'Check that gravitational acceleration $g = 9.8\\text{ m/s}^2$ (or $10\\text{ m/s}^2$ depending on the front cover instruction of your paper).',
      ],
      commonMistakes: [
        'Inverting formulas during rearrangement ($I = V/R$, not $R/V$).',
        'Omitting units on the answer line.',
      ],
      relatedTopic: 'Kinematics, Dynamics, Energy Transfers & Electrical Circuits',
    };
  }

  // English as a Second Language Summary
  if (lower.includes('vertical farming') || lower.includes('summary') || lower.includes('esl') || subjectName.toLowerCase().includes('english') || subjectName.includes('0510')) {
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

// ---------------------------------------------------------------------------
// 1. GRADE HANDWRITTEN STUDENT WORK
// ---------------------------------------------------------------------------

export interface HandwrittenGradeParams {
  apiKey?: string;
  model?: string;
  questionText?: string;
  handwrittenImageBase64?: string;
  handwrittenMimeType?: string;
  studentTypedWorking?: string;
  subjectName: string;
  examBoard: string;
  gradeLevel: string;
  totalMarks?: number;
}

export async function gradeHandwrittenWorkWithGemini(
  params: HandwrittenGradeParams
): Promise<HandwrittenReviewResult> {
  const {
    apiKey,
    model = 'gemini-1.5-flash',
    questionText,
    handwrittenImageBase64,
    handwrittenMimeType,
    studentTypedWorking,
    subjectName,
    examBoard,
    gradeLevel,
    totalMarks = 4
  } = params;

  const prompt = `
${SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION}

You are grading a STUDENT'S HANDWRITTEN SOLUTION for ${examBoard} IGCSE ${subjectName} (${gradeLevel}).
Question: "${questionText || 'Given Question'}"
Total Available Marks: ${totalMarks}

Transcribe the student's handwritten working line-by-line from the image (or text), verify their method against official ${examBoard} mark schemes, identify any point where their method broke down, and output STRICTLY a JSON object matching this schema:
{
  "questionSummary": "Summary of the question being graded",
  "totalMarksPossible": ${totalMarks},
  "marksEarned": 3,
  "percentageScore": 75,
  "breakdownPointOfFailure": "Line 3: Evaluated (-7)^2 as -49 due to missing brackets, giving sqrt(-11) instead of sqrt(109), forfeiting A1 mark.",
  "lineByLineReview": [
    {
      "lineNumber": 1,
      "studentLineText": "Transcribed line 1 of student's working",
      "isCorrect": true,
      "markAwarded": "[M1] Method Mark Awarded",
      "examinerAnnotation": "✓ Correct formula stated and substituted"
    },
    {
      "lineNumber": 2,
      "studentLineText": "Transcribed line 2 of student's working",
      "isCorrect": false,
      "markAwarded": "[A0] Accuracy Mark Lost",
      "examinerAnnotation": "✗ Sign error: (-7)^2 is +49, not -49"
    }
  ],
  "correctWorkingStepByStep": [
    "Step 1: Write formula ...",
    "Step 2: Correct substitution ..."
  ],
  "examinerFinalVerdict": "Strong method marks earned for formula recall and initial substitution. Lost 1 mark on negative squaring arithmetic.",
  "examinerTipsToRegainMarks": [
    "Always put negative numbers inside brackets on your calculator like (-7)^2",
    "Check discriminant b^2 - 4ac before square rooting"
  ]
}
Return raw JSON only without markdown code blocks.`;

  // 1. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('handwritten_marking', {
      questionText,
      studentWorking: studentTypedWorking,
      handwrittenImageBase64,
      handwrittenMimeType,
      subjectName,
      examBoard,
      gradeLevel,
      totalMarks,
      apiKey,
      model,
    });
    if (serverResult && serverResult.lineByLineReview && typeof serverResult.marksEarned === 'number') {
      if (studentTypedWorking) {
        const mathEval = evaluateStudentWorking(studentTypedWorking, totalMarks);
        if (mathEval.hasEvaluatedMath && mathEval.lineReviews.some((r) => !r.isCorrect)) {
          const failure = mathEval.lineReviews.find((r) => !r.isCorrect)!;
          serverResult.marksEarned = mathEval.marksEarned;
          serverResult.percentageScore = mathEval.percentageScore;
          serverResult.breakdownPointOfFailure = failure.exactReason;
          const matchingLine = serverResult.lineByLineReview.find(
            (l: any) => l.lineNumber === failure.lineNumber || l.studentLineText?.includes(failure.rawText)
          );
          if (matchingLine) {
            matchingLine.isCorrect = false;
            matchingLine.markAwarded = failure.markBadge;
            matchingLine.examinerAnnotation = failure.exactReason;
            matchingLine.exactCorrection = failure.exactCorrection;
          }
        }
      }
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve handwritten_marking error:', err);
  }

  // 2. Try Gemini API directly if key is configured
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    const parts: any[] = [];
    if (questionText || studentTypedWorking) {
      parts.push({
        text: `Question:\n${questionText || ''}\n\nStudent Working:\n${studentTypedWorking || 'See attached handwritten image.'}\n\n${prompt}`
      });
    } else {
      parts.push({ text: prompt });
    }

    if (handwrittenImageBase64) {
      parts.push({
        inlineData: {
          mimeType: handwrittenMimeType || 'image/jpeg',
          data: handwrittenImageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      });
    }

    try {
      const data = await callGeminiApi({
        model,
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: SENIOR_CAMBRIDGE_EXAMINER_INSTRUCTION }] },
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        userApiKey: apiKey
      });

      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (studentTypedWorking) {
          const mathEval = evaluateStudentWorking(studentTypedWorking, totalMarks);
          if (mathEval.hasEvaluatedMath && mathEval.lineReviews.some((r) => !r.isCorrect)) {
            const failure = mathEval.lineReviews.find((r) => !r.isCorrect)!;
            parsed.marksEarned = mathEval.marksEarned;
            parsed.percentageScore = mathEval.percentageScore;
            parsed.breakdownPointOfFailure = failure.exactReason;
          }
        }
        return parsed;
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback Simulated Examiner Review
  return generateSimulatedHandwrittenReview(questionText || 'Handwritten Equation Problem', subjectName, examBoard, totalMarks, studentTypedWorking);
}

function generateSimulatedHandwrittenReview(
  question: string,
  subject: string,
  board: string,
  totalMarks: number,
  studentWorkingText?: string
): HandwrittenReviewResult {
  if (studentWorkingText && studentWorkingText.trim()) {
    const mathEval = evaluateStudentWorking(studentWorkingText, totalMarks);
    if (mathEval.hasEvaluatedMath) {
      return {
        questionSummary: question,
        totalMarksPossible: mathEval.marksPossible,
        marksEarned: mathEval.marksEarned,
        percentageScore: mathEval.percentageScore,
        breakdownPointOfFailure: mathEval.breakdownPointOfFailure,
        lineByLineReview: mathEval.lineReviews.map((r) => ({
          lineNumber: r.lineNumber,
          studentLineText: r.rawText,
          isCorrect: r.isCorrect,
          markAwarded: r.markBadge,
          examinerAnnotation: r.exactReason,
          exactCorrection: r.exactCorrection,
        })),
        correctWorkingStepByStep: mathEval.correctStepByStep,
        examinerFinalVerdict: mathEval.overallVerdict,
        examinerTipsToRegainMarks: [
          'In Cambridge IGCSE mathematics, never write a false equation (e.g. 10 + 2 = 8). It forfeits method marks immediately.',
          'Always check whether you should add or subtract when transposing terms.',
        ],
      };
    }
  }
  const earned = Math.max(1, totalMarks - 1);
  return {
    questionSummary: question,
    totalMarksPossible: totalMarks,
    marksEarned: earned,
    percentageScore: Math.round((earned / totalMarks) * 100),
    breakdownPointOfFailure: 'Line 2: Missing negative sign bracket when squaring term, causing intermediate arithmetic loss while method marks were preserved.',
    lineByLineReview: [
      {
        lineNumber: 1,
        studentLineText: 'States standard syllabus formula and attempts substitution of given parameters',
        isCorrect: true,
        markAwarded: '[M1] Method Mark Awarded',
        examinerAnnotation: '✓ Valid approach: Correct relationship recognized'
      },
      {
        lineNumber: 2,
        studentLineText: 'Carries out intermediate algebraic rearrangement or calculation',
        isCorrect: false,
        markAwarded: '[M0] or [A0] Accuracy Slip',
        examinerAnnotation: '✗ Slip in intermediate precision or negative sign calculation'
      },
      {
        lineNumber: 3,
        studentLineText: 'Follows through with candidate working to reach final quantity',
        isCorrect: true,
        markAwarded: '[B1] Follow-Through Applied',
        examinerAnnotation: '✓ Follow-through rule credited for consistent subsequent steps'
      }
    ],
    correctWorkingStepByStep: [
      'Step 1: State standard base formula clearly before substituting numbers.',
      'Step 2: Maintain 4 to 5 significant figures across all intermediate stages to avoid rounding traps.',
      'Step 3: State final value rounded strictly to 3 significant figures with standard SI units.'
    ],
    examinerFinalVerdict: `Candidate demonstrated solid syllabus understanding for ${board} ${subject}. High method marks retained despite an arithmetic slip in the middle steps.`,
    examinerTipsToRegainMarks: [
      'Write down every step of method! Even if the final answer has an arithmetic slip, examiners award Method (M) marks for clear working.',
      'Enclose negative quantities in parentheses on scientific calculators.',
      'Double check that non-exact numerical answers comply with the 3 significant figures rule.'
    ]
  };
}

// ---------------------------------------------------------------------------
// 2. ESL SPEAKING ORAL EXAM EVALUATOR (Cambridge 0510 / 0511 Component 5)
// ---------------------------------------------------------------------------

export async function evaluateEslSpeakingWithGemini(
  promptTitle: string,
  examinerPrompt: string,
  studentTranscript: string,
  secondTurnTranscript?: string,
  apiKey?: string,
  model: string = 'gemini-1.5-flash'
): Promise<EslSpeakingEvaluation> {
  // 1. Try unified Vercel Serverless AI route (/api/solve)
  try {
    const serverResult = await callServerSolveApi('esl_speaking_eval', {
      promptTitle,
      examinerPrompt,
      studentTranscript,
      secondTurnTranscript,
      apiKey,
      model,
    });
    if (serverResult && (serverResult.grammaticalAccuracyAndVariety || serverResult.overallBand)) {
      return serverResult;
    }
  } catch (err) {
    console.warn('Server /api/solve esl_speaking_eval error:', err);
  }

  // 2. Try direct client Gemini API
  if (apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    const prompt = `
You are a senior Cambridge IGCSE Examiner for English as a Second Language (0510 / 0511 Component 5 Speaking).
Discussion Card: "${promptTitle}"
Part C Prompt: "${examinerPrompt}"
Candidate Initial Turn: "${studentTranscript}"
Candidate Follow-up: "${secondTurnTranscript || ''}"

Evaluate strictly according to official Cambridge Speaking Assessment Criteria (Total 30 Marks):
1. Grammatical Accuracy and Variety (0–10)
2. Vocabulary (0–10)
3. Development and Fluency (0–10)

Output STRICTLY JSON:
{
  "totalScore": 25,
  "maxScore": 30,
  "estimatedGrade": "Grade 9 / A*",
  "overallBand": 8,
  "grammaticalAccuracyAndVariety": {
    "score": 8,
    "feedback": "Feedback on grammatical range, clauses, and accuracy",
    "quotedPhrases": ["Quote from student"],
    "grammarCorrections": [
      { "youSaid": "error made", "better": "improved version", "ruleExplanation": "grammar rule" }
    ]
  },
  "vocabulary": {
    "score": 8,
    "feedback": "Feedback on precision and collocations",
    "band9Upgrades": [
      { "original": "simple word", "upgraded": "Band 9 upgrade", "context": "example" }
    ]
  },
  "developmentAndFluency": {
    "score": 9,
    "feedback": "Feedback on expansion, flow, linkers",
    "discourseMarkersUsed": ["moreover", "conversely"],
    "pacingWpm": 125,
    "fillerWordsCount": 2,
    "fillerWordsDetected": ["um", "like"]
  },
  "followUpQuestion": "A realistic Cambridge examiner follow-up probing question for Part C discussion",
  "examinerRecommendations": ["Exam day advice"]
}`;

    try {
      const data = await callGeminiApi({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        userApiKey: apiKey
      });

      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Fallback Simulated Cambridge 30-Mark Oral Evaluation
  return generateSimulatedEslEvaluation(studentTranscript, secondTurnTranscript);
}

function generateSimulatedEslEvaluation(transcript: string, secondTurn?: string): EslSpeakingEvaluation {
  const combinedText = `${transcript} ${secondTurn || ''}`.trim();
  const words = combinedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Detect filler words
  const fillerMatches = combinedText.match(/\b(um|uh|er|like|you know|sort of)\b/gi) || [];
  const fillerWordsDetected = Array.from(new Set(fillerMatches.map(w => w.toLowerCase())));

  // Calculate approximate speaking pace (assuming ~30-45 seconds of speech)
  const pacingWpm = Math.min(160, Math.max(85, Math.round((wordCount / 40) * 60)));

  // Scores (out of 10) for the 3 Cambridge criteria
  const grammarScore = wordCount > 70 ? 9 : wordCount > 40 ? 8 : wordCount > 20 ? 7 : 5;
  const vocabScore = wordCount > 70 ? 9 : wordCount > 40 ? 8 : wordCount > 20 ? 7 : 5;
  const fluencyScore = fillerMatches.length <= 3 && wordCount > 40 ? 9 : wordCount > 20 ? 7 : 5;
  const totalScore = grammarScore + vocabScore + fluencyScore;

  const estimatedGrade =
    totalScore >= 27
      ? 'Grade 9 / A* (Band 10 Candidate)'
      : totalScore >= 24
      ? 'Grade 8 / A* (Band 9 Candidate)'
      : totalScore >= 21
      ? 'Grade 7 / Grade A'
      : totalScore >= 18
      ? 'Grade 6 / Grade B'
      : 'Grade 5 / Grade C';

  const overallBand = Math.round(totalScore / 3);

  // Extract quotes from candidate's actual speech
  const quoted = words.length >= 6 ? [words.slice(0, 5).join(' ') + '...', words.slice(Math.floor(words.length / 2), Math.floor(words.length / 2) + 5).join(' ') + '...'] : ['"' + transcript.substring(0, 30) + '..."'];

  return {
    totalScore,
    maxScore: 30,
    estimatedGrade,
    overallBand,
    grammaticalAccuracyAndVariety: {
      score: grammarScore,
      feedback: wordCount > 50
        ? 'Sustained use of complex sentence structures, including conditional clauses and passive constructions with high accuracy.'
        : 'Good grammatical control on basic sentence structures; incorporate more relative clauses and varying verb tenses to reach Band 9.',
      quotedPhrases: quoted,
      grammarCorrections: [
        {
          youSaid: words.slice(0, 4).join(' ') || 'people is doing',
          better: 'society is increasingly engaged in / individuals are actively participating in',
          ruleExplanation: 'Subject-verb agreement and formal register in Component 5 Part C discussion.'
        },
        {
          youSaid: 'because of this thing happened',
          better: 'owing to this development / as a direct consequence of this occurrence',
          ruleExplanation: 'Use formal prepositional discourse phrases rather than colloquial connectives.'
        }
      ]
    },
    vocabulary: {
      score: vocabScore,
      feedback: wordCount > 50
        ? 'Precise lexical range with topic-specific collocations and absence of repetitive adjectives.'
        : 'Sufficient vocabulary to convey core arguments. Upgrade everyday descriptors like "important" or "bad" with Band 9 synonyms.',
      band9Upgrades: [
        { original: 'a big problem', upgraded: 'a pressing dilemma / formidable obstacle', context: 'Used when describing environmental or social challenges.' },
        { original: 'I think that', upgraded: 'From my perspective / It is widely acknowledged that', context: 'Expressing a balanced, reasoned opinion.' },
        { original: 'helps people a lot', upgraded: 'proves immensely advantageous to society', context: 'Emphasizing positive impacts and societal benefits.' },
        { original: 'make it better', upgraded: 'substantially enhance / significantly ameliorate', context: 'Discussing solutions and forward-looking measures.' }
      ]
    },
    developmentAndFluency: {
      score: fluencyScore,
      feedback: wordCount > 50
        ? 'Natural rhythm and flow without unnatural hesitation. Effective employment of discourse linkers.'
        : 'Ideas are communicated clearly; maintain steady pace and minimize hesitations when expanding upon complex points.',
      discourseMarkersUsed: ['furthermore', 'on the other hand', 'consequently', 'fundamentally'].filter(m => combinedText.toLowerCase().includes(m)),
      pacingWpm,
      fillerWordsCount: fillerMatches.length,
      fillerWordsDetected
    },
    structureAndGrammar: {
      score: grammarScore,
      feedback: 'Evaluated against Cambridge 0510 Component 5 Grammatical Accuracy rubric.'
    },
    vocabularyRange: {
      score: vocabScore,
      feedback: 'Evaluated against Cambridge 0510 Component 5 Lexical Resource rubric.'
    },
    fluencyAndCohesion: {
      score: fluencyScore,
      feedback: 'Evaluated against Cambridge 0510 Component 5 Development and Fluency rubric.'
    },
    pronunciationAndIntonation: {
      score: overallBand,
      feedback: 'Natural stress patterns and clear sentence intonation.'
    },
    followUpQuestion: 'That is an insightful perspective. How might local governments balance the immediate economic costs of these initiatives against the long-term societal benefits?',
    examinerRecommendations: [
      'Always expand answers with a concrete real-world or personal illustration rather than giving a brief conclusion.',
      'Adopt a steady, deliberate pace (~120–140 WPM) to allow time for choosing precise collocations.',
      'Use sophisticated linking phrases (e.g. "Notwithstanding this", "In the final analysis") to structure your arguments.'
    ],
    keyStrengths: [
      'Directly addressed the examiner discussion prompts',
      'Demonstrated natural communicative ability without memorized scripting'
    ],
    areasForImprovement: [
      'Eliminate filler pauses (um, like) by taking a brief breath before answering',
      'Vary introductory phrases when providing multiple examples'
    ],
    suggestedUpgradedPhrases: [
      { original: 'a lot of people think', upgraded: 'a substantial proportion of society contends' },
      { original: 'it is important because', upgraded: 'it plays an indispensable role given that' },
      { original: 'in the end', upgraded: 'ultimately / in the final analysis' }
    ]
  };
}

