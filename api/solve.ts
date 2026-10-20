// Vercel Serverless Function: /api/solve
// Directly connects to Google Gemini API using server-side environment keys (GEMINI_API_KEY or VITE_GEMINI_API_KEY)
// Eliminates client Puter popups and exposed keys for students.

export const config = {
  maxDuration: 60,
};

const SENIOR_CAMBRIDGE_SYSTEM_PROMPT =
  'You are a senior Cambridge IGCSE Principal Examiner and autonomous Verification Agent. Follow official CAIE/Edexcel mark scheme conventions strictly: show step-by-step working for method marks [M], accuracy marks [A], independent marks [B], and special case marks [SC]. Bold all required syllabus keywords. Enforce the Cambridge 3 significant figures rule for non-exact numerical values, and include SI units on all physical quantities.\n\nZERO-MISTAKE AUTONOMOUS VERIFICATION PROTOCOL:\nBefore producing your final output, perform a line-by-line verification pass as a Chief Examiner:\n1. Arithmetic & Algebraic Truth: Verify that every calculation (e.g. "12 * 4 = 48", "a^2 + b^2 = c^2") is mathematically exact with zero calculation mistakes.\n2. Strict Marking Protocol: If a student writes a mathematically true step, award the mark (+1 [M1]/[A1]). If a student writes a false equation or contradiction (e.g. "10 + 2 = 8"), IMMEDIATELY WITHHOLD the mark (0 Marks [M0]), explain why on that exact equation ("10 + 2 = 12, not 8. You added instead of subtracting."), and provide the exact corrected line ("Write instead: 10 - 2 = 8").\n3. Significant Figures: Non-exact numerical results must be rounded to exactly 3 significant figures (or 1 d.p. for angles in degrees) unless specified otherwise.\n4. SI Units: All physical, chemical, and mathematical calculated quantities must carry appropriate SI units.';


export default async function handler(req: any, res?: any) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (res?.status) {
      return res.status(200).json({ ok: true });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  try {
    let body: any = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body && typeof req.json === 'function') {
      body = await req.json();
    }
    body = body || {};

    const {
      action = 'solve_question',
      questionText,
      subjectName = 'Mathematics',
      examBoard = 'CIE',
      gradeLevel = 'IGCSE Extended',
      imageBase64,
      imageMimeType = 'image/jpeg',
      studentWorking,
      totalMarks = 4,
      chapter,
      messages = [],
      promptTitle,
      examinerPrompt,
      studentTranscript,
      secondTurnTranscript,
      count = 4,
      topic = 'General Syllabus Topic',
    } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      body.apiKey;

    if (!apiKey || apiKey.trim() === '') {
      const errorPayload = {
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'Server Gemini API key is not configured in Vercel environment variables (GEMINI_API_KEY).',
      };
      if (res?.status) return res.status(500).json(errorPayload);
      return new Response(JSON.stringify(errorPayload), { status: 500, headers });
    }

    const modelName = body.model || 'gemini-1.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

    let systemInstruction = SENIOR_CAMBRIDGE_SYSTEM_PROMPT;
    let userPrompt = '';
    let responseMimeType = 'application/json';

    // Build specific prompt based on action
    if (action === 'solve_question') {
      userPrompt = `You are marking a student question for ${examBoard} IGCSE ${subjectName} (${gradeLevel}).
Question: "${questionText || 'Given Question in Image'}"
${studentWorking ? `Student Working Provided: "${studentWorking}"` : ''}

Output STRICTLY a valid JSON object matching this schema:
{
  "questionText": "Clean summary of question",
  "subject": "${subjectName}",
  "topic": "Specific syllabus topic",
  "totalMarks": ${totalMarks},
  "coreConceptAndFormula": {
    "concept": "Core syllabus concept name and explanation",
    "formula": "Primary formula or equation in LaTeX"
  },
  "stepByStepSolution": [
    {
      "stepNumber": 1,
      "title": "Method Step Title",
      "explanation": "Detailed explanation with bold keywords",
      "mathOrCode": "LaTeX formatted math",
      "markAwarded": "[M1] Method Mark"
    }
  ],
  "finalAnswer": "Concise final answer with exact SI units and rounded to 3 significant figures",
  "examinerTraps": [
    "Common student errors reported in examiner reports"
  ],
  "markSchemeBreakdown": [
    "[M1] Step 1",
    "[A1] Final answer"
  ],
  "examinerTips": [
    "Pro-tip to secure maximum marks"
  ],
  "commonMistakes": [
    "Frequent pitfall to avoid"
  ],
  "relatedTopic": "Related syllabus subtopic"
}`;
    } else if (action === 'handwritten_marking') {
      userPrompt = `You are evaluating a student's handwritten or typed working for ${examBoard} IGCSE ${subjectName}.
Question: "${questionText || 'Question'}"
Student's Working: "${studentWorking || 'See attached image'}"
Total Available Marks: ${totalMarks}

CRITICAL INSTRUCTIONS:
- Transcribe line-by-line.
- Verify EVERY arithmetic calculation and algebraic transposition strictly:
  * If student wrote a correct line (e.g. "10 - 2 = 8"), award [M1] with isCorrect: true, state "✓ Correct step 10 - 2 = 8".
  * If student wrote a false line (e.g. "10 + 2 = 8"), award [M0] with isCorrect: false. You MUST state EXACTLY why: "10 + 2 = 12, not 8. Added instead of subtracted." AND set exactCorrection: "Write instead: 10 - 2 = 8".
- Output STRICTLY JSON matching:
{
  "questionSummary": "Summary",
  "totalMarksPossible": ${totalMarks},
  "marksEarned": 3,
  "percentageScore": 75,
  "breakdownPointOfFailure": "Exact line where method broke down (e.g. Line 1: wrote 10+2=8 instead of 10-2=8)",
  "lineByLineReview": [
    {
      "lineNumber": 1,
      "studentLineText": "Transcribed line",
      "isCorrect": true,
      "markAwarded": "[M1] Method Mark",
      "examinerAnnotation": "Annotation explaining why correct or why incorrect",
      "exactCorrection": "Exact replacement line candidate must write (if incorrect)"
    }
  ],
  "correctWorkingStepByStep": [
    "Correct step 1",
    "Correct step 2"
  ],
  "examinerFinalVerdict": "Senior examiner assessment",
  "examinerTipsToRegainMarks": [
    "Advice to prevent lost marks"
  ]
}`;
    } else if (action === 'esl_speaking_eval') {
      userPrompt = `You are a senior Cambridge IGCSE Examiner for English as a Second Language (0510 / 0511 Component 5 Speaking).
Discussion Card: "${promptTitle || 'Topic Discussion'}"
Part C Examiner Prompt: "${examinerPrompt || 'Prompt'}"
Candidate Initial Turn: "${studentTranscript || ''}"
Candidate Follow-up Turn: "${secondTurnTranscript || 'No second turn recorded'}"

Grade strictly according to official Cambridge Speaking Assessment Criteria (Total 30 Marks):
1. Grammatical Accuracy and Variety (0–10)
2. Vocabulary (0–10)
3. Development and Fluency (0–10)

Output STRICTLY JSON:
{
  "totalScore": 25,
  "maxScore": 30,
  "estimatedGrade": "Grade 9 / A*",
  "grammaticalAccuracyAndVariety": {
    "score": 8,
    "feedback": "Detailed feedback on complex clauses, passive voice, and tense accuracy",
    "quotedPhrases": ["Exact phrase quoted from student"],
    "grammarCorrections": [
      {
        "youSaid": "what the student said",
        "better": "improved Cambridge Band 9 phrasing",
        "ruleExplanation": "grammar rule explanation"
      }
    ]
  },
  "vocabulary": {
    "score": 8,
    "feedback": "Detailed feedback on lexical range, collocations, precision",
    "band9Upgrades": [
      {
        "original": "simple word used",
        "upgraded": "sophisticated Cambridge Band 9 collocation",
        "context": "how to apply it"
      }
    ]
  },
  "developmentAndFluency": {
    "score": 9,
    "feedback": "Feedback on expansion of ideas, cohesive linkers, natural rhythm",
    "discourseMarkersUsed": ["furthermore", "conversely"],
    "pacingWpm": 128,
    "fillerWordsCount": 2,
    "fillerWordsDetected": ["um", "like"]
  },
  "followUpQuestion": "A realistic Cambridge examiner follow-up probing question for Part C discussion",
  "examinerRecommendations": [
    "Key recommendation for exam day"
  ]
}`;
    } else if (action === 'generate_notes') {
      userPrompt = `Generate a comprehensive, syllabus-accurate revision guide for ${examBoard} ${subjectName} on chapter: "${chapter || topic}".
Output STRICTLY JSON:
{
  "id": "rev-${Date.now()}",
  "subjectId": "${subjectName}",
  "title": "${chapter || topic} Revision Guide",
  "chapter": "${chapter || topic}",
  "learningObjectives": [
    "Official syllabus learning objective 1",
    "Official syllabus learning objective 2"
  ],
  "keyConcepts": [
    {
      "heading": "Concept title",
      "points": [
        "Key point with bold keywords",
        "Explanatory point showing mechanism"
      ],
      "formula": "Core equation in LaTeX if applicable"
    }
  ],
  "mustKnowDefinitions": [
    {
      "term": "Key Term",
      "definition": "Official mark scheme definition with **compulsory keywords** bolded"
    }
  ],
  "coreEquationsOrPathways": [
    "Chemical equation or biological pathway (e.g. 6CO2 + 6H2O -> C6H12O6 + 6O2)"
  ],
  "examinerWarnings": [
    "Examiner trap reported in official examiner reports"
  ]
}`;
    } else if (action === 'ai_tutor') {
      responseMimeType = 'text/plain';
      systemInstruction = `You are "Simply IGCSE Co-Pilot", a senior Cambridge examiner and private tutor for ${examBoard} ${subjectName}.
Tone: Encouraging, rigorous, mark-scheme focused. Point out [M] method marks, [A] accuracy marks, and [B] independent marks. Use LaTeX ($...$ or $$...$$) for math and chemical formulas.
If the student provides an exam code and question number (e.g. 0580/42 Q6, 0620/42 Q7, 0625/41 Q2):
- Retrieve the question, full mark scheme breakdown ([M1], [A1], [B1]), and final answer.
- If the student provides their own answer or working to be graded, evaluate it strictly against official Cambridge standards:
  1) State their mark (e.g. "Score: 3 / 4 Marks"),
  2) Detail what each mark was awarded for,
  3) State exactly what was missing and what they need to write to achieve full marks,
  4) Cite relevant Principal Examiner Report traps.`;
      const lastMsg = messages[messages.length - 1]?.content || questionText || '';
      userPrompt = lastMsg;
    } else if (action === 'generate_flashcards') {
      userPrompt = `Generate ${count} high-yield IGCSE flashcards for ${examBoard} ${subjectName} on chapter/topic "${chapter || topic}".
Output STRICTLY JSON array:
[
  {
    "id": "fc-gen-${Date.now()}-1",
    "subjectId": "${subjectName}",
    "topic": "${chapter || topic}",
    "question": "Clear IGCSE question",
    "answer": "Mark-scheme aligned answer with LaTeX formatting",
    "keyFormula": "Formula if applicable",
    "examinerTip": "Examiner report tip",
    "difficulty": "Extended"
  }
]`;
    } else {
      userPrompt = questionText || 'Explain this IGCSE concept.';
    }

    // Build Gemini contents payload
    const parts: any[] = [];
    parts.push({ text: userPrompt });

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    const payload: any = {
      contents: [{ parts }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.2,
      },
    };

    if (responseMimeType === 'application/json') {
      payload.generationConfig.responseMimeType = 'application/json';
    }

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error (${geminiRes.status}): ${errText}`);
    }

    const data = await geminiRes.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini returned empty candidate text.');
    }

    let parsedResult = candidateText;
    if (responseMimeType === 'application/json') {
      const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    if (res?.status) {
      return res.status(200).json(parsedResult);
    }
    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Server AI error in /api/solve:', error);
    const errObj = { error: 'INTERNAL_AI_ERROR', message: error.message || 'Error processing AI request' };
    if (res?.status) return res.status(500).json(errObj);
    return new Response(JSON.stringify(errObj), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
