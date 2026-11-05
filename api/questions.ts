// Vercel Serverless Function: /api/questions
// Dual-Layer Question Caching & Just-In-Time Extraction Engine

import { PAPERS_CATALOG, getPaperById, findPaperByExamCode } from '../src/lib/catalog/papersCatalog';
import { OFFICIAL_PAST_PAPER_PDFS, generateQuestionsForPaperPdf } from '../src/data/pastPapersData';
import { getTaxonomyForSubject } from '../src/lib/classifieds/taxonomy';
import { convertPastPaperItemToClassifiedQuestion, ClassifiedQuestion } from '../src/lib/classifieds/questionPool';
import { classifiedQuestionsStore } from '../src/lib/classifieds/classifiedStore';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res?: any) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (res?.status) return res.status(200).json({ ok: true });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  const sendResponse = (statusCode: number, payload: any) => {
    if (res?.status) {
      return res.status(statusCode).json(payload);
    }
    return new Response(JSON.stringify(payload), { status: statusCode, headers });
  };

  try {
    let queryParams: any = req.query || {};
    let body: any = req.body || {};

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body && typeof req.json === 'function') {
      body = await req.json().catch(() => ({}));
    }

    const paperId = queryParams.paperId || body.paperId || '';
    const examCode = queryParams.examCode || body.examCode || '';
    const chapterId = queryParams.chapterId || body.chapterId || '';
    const syllabus = queryParams.syllabus || body.syllabus || '';
    const yearStr = queryParams.year || body.year;
    const paperStr = queryParams.paper || body.paper;
    const variantStr = queryParams.variant || body.variant;
    const forceRefresh = queryParams.forceRefresh === 'true' || body.forceRefresh === true;

    // 1. Chapter-level cached query
    if (chapterId && !paperId && !examCode) {
      const cached = classifiedQuestionsStore.getQuestionsByChapterId(chapterId);
      if (cached.length > 0 && !forceRefresh) {
        return sendResponse(200, {
          ok: true,
          source: 'cache',
          chapterId,
          count: cached.length,
          questions: cached
        });
      }
    }

    // 2. Resolve target paper from parameters or exam code
    let paper = paperId ? getPaperById(paperId) : undefined;
    if (!paper && examCode) {
      paper = findPaperByExamCode(examCode);
    }
    if (!paper && syllabus && yearStr) {
      const yr = parseInt(String(yearStr), 10);
      const pNum = paperStr ? parseInt(String(paperStr), 10) : undefined;
      const vNum = variantStr ? parseInt(String(variantStr), 10) : undefined;
      paper = PAPERS_CATALOG.find(p =>
        p.syllabus.toLowerCase() === syllabus.toLowerCase() &&
        p.year === yr &&
        (pNum === undefined || p.paper === pNum) &&
        (vNum === undefined || p.variant === vNum)
      );
    }

    if (!paper) {
      return sendResponse(404, {
        ok: false,
        error: 'Paper not found in catalog. Please specify a valid paperId, examCode, or syllabus/year combination.'
      });
    }

    // 3. Cache-First Check: Query ClassifiedQuestions store
    if (!forceRefresh) {
      const cached = classifiedQuestionsStore.getQuestionsByPaperId(paper.id);
      if (cached && cached.length > 0) {
        return sendResponse(200, {
          ok: true,
          source: 'cache',
          paper,
          count: cached.length,
          questions: cached
        });
      }
    }

    // 4. On-Demand Extraction: Extract and categorize questions & mark schemes
    const officialPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === paper!.id);
    if (!officialPdf) {
      return sendResponse(404, {
        ok: false,
        error: `Original paper record not found for ID: ${paper.id}`
      });
    }

    const taxonomy = getTaxonomyForSubject(officialPdf.subjectCode || paper.syllabus);
    const rawQuestions = generateQuestionsForPaperPdf(officialPdf);
    const extractedQuestions: ClassifiedQuestion[] = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = convertPastPaperItemToClassifiedQuestion(rawQuestions[i], officialPdf, taxonomy, i);
      extractedQuestions.push(q);
    }

    // Save to ClassifiedQuestions cache store
    classifiedQuestionsStore.saveQuestions(paper.id, extractedQuestions);

    return sendResponse(200, {
      ok: true,
      source: 'on_demand_extraction',
      paper,
      count: extractedQuestions.length,
      questions: extractedQuestions
    });
  } catch (error: any) {
    console.error('Questions API Serverless Error:', error);
    return sendResponse(500, {
      ok: false,
      error: error?.message || 'Internal server error while extracting questions.'
    });
  }
}
