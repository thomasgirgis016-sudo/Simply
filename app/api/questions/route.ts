// Next.js / Edge Route Handler: /app/api/questions/route.ts
// Dual-Layer Question Caching & Just-In-Time Extraction Engine

import { PAPERS_CATALOG, getPaperById, findPaperByExamCode } from '../../../src/lib/catalog/papersCatalog';
import { OFFICIAL_PAST_PAPER_PDFS, generateQuestionsForPaperPdf } from '../../../src/data/pastPapersData';
import { getTaxonomyForSubject } from '../../../src/lib/classifieds/taxonomy';
import { convertPastPaperItemToClassifiedQuestion, ClassifiedQuestion } from '../../../src/lib/classifieds/questionPool';
import { classifiedQuestionsStore } from '../../../src/lib/classifieds/classifiedStore';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paperId = url.searchParams.get('paperId') || '';
    const examCode = url.searchParams.get('examCode') || '';
    const chapterId = url.searchParams.get('chapterId') || '';
    const syllabus = url.searchParams.get('syllabus') || '';
    const yearStr = url.searchParams.get('year') || '';
    const paperStr = url.searchParams.get('paper') || '';
    const variantStr = url.searchParams.get('variant') || '';
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';

    // 1. Chapter-level cached query
    if (chapterId && !paperId && !examCode) {
      const cached = classifiedQuestionsStore.getQuestionsByChapterId(chapterId);
      if (cached.length > 0 && !forceRefresh) {
        return new Response(
          JSON.stringify({
            ok: true,
            source: 'cache',
            chapterId,
            count: cached.length,
            questions: cached
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }

    // 2. Resolve target paper from parameters or exam code
    let paper = paperId ? getPaperById(paperId) : undefined;
    if (!paper && examCode) {
      paper = findPaperByExamCode(examCode);
    }
    if (!paper && syllabus && yearStr) {
      const yr = parseInt(yearStr, 10);
      const pNum = paperStr ? parseInt(paperStr, 10) : undefined;
      const vNum = variantStr ? parseInt(variantStr, 10) : undefined;
      paper = PAPERS_CATALOG.find(p =>
        p.syllabus.toLowerCase() === syllabus.toLowerCase() &&
        p.year === yr &&
        (pNum === undefined || p.paper === pNum) &&
        (vNum === undefined || p.variant === vNum)
      );
    }

    if (!paper) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Paper not found in catalog. Please specify a valid paperId, examCode, or syllabus/year combination.'
        }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 3. Cache-First Check: Query ClassifiedQuestions store
    if (!forceRefresh) {
      const cached = classifiedQuestionsStore.getQuestionsByPaperId(paper.id);
      if (cached && cached.length > 0) {
        return new Response(
          JSON.stringify({
            ok: true,
            source: 'cache',
            paper,
            count: cached.length,
            questions: cached
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }

    // 4. On-Demand Extraction: Extract and categorize questions & mark schemes
    const officialPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === paper!.id);
    if (!officialPdf) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Original paper record not found for ID: ${paper.id}`
        }),
        { status: 404, headers: CORS_HEADERS }
      );
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

    return new Response(
      JSON.stringify({
        ok: true,
        source: 'on_demand_extraction',
        paper,
        count: extractedQuestions.length,
        questions: extractedQuestions
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Questions API Error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || 'Internal server error while extracting questions.'
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      paperId = '',
      examCode = '',
      chapterId = '',
      syllabus = '',
      year,
      paper: paperNum,
      variant: variantNum,
      forceRefresh = false
    } = body;

    // Direct forwarding to extraction logic
    let paper = paperId ? getPaperById(paperId) : undefined;
    if (!paper && examCode) {
      paper = findPaperByExamCode(examCode);
    }
    if (!paper && syllabus && year) {
      paper = PAPERS_CATALOG.find(p =>
        p.syllabus.toLowerCase() === String(syllabus).toLowerCase() &&
        p.year === Number(year) &&
        (paperNum === undefined || p.paper === Number(paperNum)) &&
        (variantNum === undefined || p.variant === Number(variantNum))
      );
    }

    if (!paper) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Target paper could not be resolved from metadata catalog.' }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (!forceRefresh) {
      const cached = classifiedQuestionsStore.getQuestionsByPaperId(paper.id);
      if (cached && cached.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, source: 'cache', paper, count: cached.length, questions: cached }),
          { status: 200, headers: CORS_HEADERS }
        );
      }
    }

    const officialPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === paper!.id);
    if (!officialPdf) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Official paper PDF metadata missing.' }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const taxonomy = getTaxonomyForSubject(officialPdf.subjectCode || paper.syllabus);
    const rawQuestions = generateQuestionsForPaperPdf(officialPdf);
    const extractedQuestions: ClassifiedQuestion[] = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = convertPastPaperItemToClassifiedQuestion(rawQuestions[i], officialPdf, taxonomy, i);
      extractedQuestions.push(q);
    }

    classifiedQuestionsStore.saveQuestions(paper.id, extractedQuestions);

    return new Response(
      JSON.stringify({
        ok: true,
        source: 'on_demand_extraction',
        paper,
        count: extractedQuestions.length,
        questions: extractedQuestions
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || 'Failed to process request.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
