/**
 * Simply IGCSE — High-Yield Priority Papers Batch Ingestion Engine
 * 
 * Pre-populates the ClassifiedQuestions database for high-yield priority papers
 * (2021 to 2025/2026) across Cambridge, Edexcel, and OxfordAQA subjects.
 * 
 * Features:
 * - Batches of 10 papers with rate-limit backoff and automatic retry
 * - Automatic syllabus chapter tagging from lib/classifieds/taxonomy.ts
 * - Incremental processing (skips already-cached papers)
 * 
 * Usage:
 *   npx tsx scripts/ingest-priority-papers.ts [--subject=0580] [--startYear=2021] [--limit=30]
 */

import { PAPERS_CATALOG, PaperMetadata } from '../src/lib/catalog/papersCatalog';
import { OFFICIAL_PAST_PAPER_PDFS, generateQuestionsForPaperPdf } from '../src/data/pastPapersData';
import { getTaxonomyForSubject } from '../src/lib/classifieds/taxonomy';
import { convertPastPaperItemToClassifiedQuestion, ClassifiedQuestion } from '../src/lib/classifieds/questionPool';
import { classifiedQuestionsStore } from '../src/lib/classifieds/classifiedStore';

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    subject?: string;
    startYear: number;
    endYear: number;
    batchSize: number;
    limit: number;
  } = {
    startYear: 2021,
    endYear: 2026,
    batchSize: 10,
    limit: 100
  };

  for (const arg of args) {
    if (arg.startsWith('--subject=')) {
      options.subject = arg.split('=')[1].trim();
    } else if (arg.startsWith('--startYear=')) {
      options.startYear = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--endYear=')) {
      options.endYear = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--batchSize=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    }
  }

  return options;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const options = parseArgs();

  console.log('===========================================================');
  console.log('  SIMPLY IGCSE — BATCH INGESTION FOR HIGH-YIELD PAPERS');
  console.log('===========================================================');
  console.log(`  Target Years : ${options.startYear} – ${options.endYear}`);
  console.log(`  Subject Filter: ${options.subject || 'All High-Yield Syllabuses'}`);
  console.log(`  Batch Size   : ${options.batchSize} papers/batch`);
  console.log(`  Paper Limit  : ${options.limit}`);
  console.log('===========================================================\n');

  // Filter priority papers
  let candidates = PAPERS_CATALOG.filter(p => p.year >= options.startYear && p.year <= options.endYear);

  if (options.subject && options.subject !== 'all') {
    const s = options.subject.toLowerCase();
    candidates = candidates.filter(p =>
      p.syllabus.toLowerCase() === s ||
      p.id.toLowerCase().includes(s)
    );
  }

  const papersToIngest = candidates.slice(0, options.limit);
  console.log(`Identified ${papersToIngest.length} high-yield papers for ingestion.`);

  let totalQuestionsIngested = 0;
  let skippedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  // Process in batches
  for (let i = 0; i < papersToIngest.length; i += options.batchSize) {
    const batch = papersToIngest.slice(i, i + options.batchSize);
    const batchNum = Math.floor(i / options.batchSize) + 1;
    const totalBatches = Math.ceil(papersToIngest.length / options.batchSize);

    console.log(`\n--- Processing Batch ${batchNum} of ${totalBatches} (${batch.length} papers) ---`);

    for (const paper of batch) {
      try {
        // Skip if already in cache
        if (classifiedQuestionsStore.hasQuestionsForPaper(paper.id)) {
          console.log(`  [CACHE HIT] ${paper.paperCode} ${paper.seriesLabel} ${paper.year} already ingested.`);
          skippedCount++;
          continue;
        }

        const officialPdf = OFFICIAL_PAST_PAPER_PDFS.find(p => p.id === paper.id);
        if (!officialPdf) {
          console.warn(`  [MISSING PDF] ${paper.id}`);
          failureCount++;
          continue;
        }

        // Retry loop with exponential backoff
        let attempt = 0;
        let success = false;
        let questions: ClassifiedQuestion[] = [];

        while (attempt < 3 && !success) {
          attempt++;
          try {
            const taxonomy = getTaxonomyForSubject(officialPdf.subjectCode || paper.syllabus);
            const rawQuestions = generateQuestionsForPaperPdf(officialPdf);

            questions = rawQuestions.map((pp, idx) =>
              convertPastPaperItemToClassifiedQuestion(pp, officialPdf, taxonomy, idx)
            );

            success = true;
          } catch (err: any) {
            console.warn(`    Attempt ${attempt} failed for ${paper.id}: ${err.message}. Retrying in ${attempt * 500}ms...`);
            await sleep(attempt * 500);
          }
        }

        if (success && questions.length > 0) {
          classifiedQuestionsStore.saveQuestions(paper.id, questions);
          totalQuestionsIngested += questions.length;
          successCount++;
          console.log(`  ✓ [INGESTED] ${paper.paperCode} ${paper.seriesLabel} ${paper.year} (${questions.length} questions, chapter: ${questions[0]?.chapterId})`);
        } else {
          failureCount++;
          console.error(`  ❌ [FAILED] Could not ingest ${paper.id} after 3 attempts.`);
        }
      } catch (e: any) {
        failureCount++;
        console.error(`  ❌ [ERROR] ${paper.id}: ${e?.message}`);
      }
    }

    // Rate-limit pause between batches
    if (i + options.batchSize < papersToIngest.length) {
      await sleep(200);
    }
  }

  const stats = classifiedQuestionsStore.getStats();

  console.log('\n===========================================================');
  console.log('  INGESTION COMPLETE SUMMARY');
  console.log('===========================================================');
  console.log(`  Papers Successfully Ingested : ${successCount}`);
  console.log(`  Papers Already In Cache     : ${skippedCount}`);
  console.log(`  Failed Papers               : ${failureCount}`);
  console.log(`  Total Questions Ingested    : ${totalQuestionsIngested}`);
  console.log(`  Total In-Memory Database Size: ${stats.totalQuestions} questions across ${stats.chaptersCovered} chapters`);
  console.log('===========================================================');
}

main().catch(err => {
  console.error('Fatal Ingestion Error:', err);
  process.exit(1);
});
