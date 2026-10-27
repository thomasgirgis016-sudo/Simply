import { COMPREHENSIVE_REVISION_NOTES } from '../src/data/revisionData';
import { PAST_PAPERS_DATABASE, OFFICIAL_PAST_PAPER_PDFS } from '../src/data/pastPapersData';
import { IGCSE_SUBJECTS } from '../src/data/subjects';

console.log('=== VERIFIED TOTALS IN MEMORY ===');
console.log(`Total Revision Topics: ${COMPREHENSIVE_REVISION_NOTES.length}`);

const topicsBySubject: Record<string, number> = {};
for (const topic of COMPREHENSIVE_REVISION_NOTES) {
  topicsBySubject[topic.subjectId] = (topicsBySubject[topic.subjectId] || 0) + 1;
}

console.log('\nTopics breakdown:');
for (const [subId, count] of Object.entries(topicsBySubject)) {
  console.log(`  - ${subId}: ${count} topics`);
}

console.log(`\nTotal Subjects: ${IGCSE_SUBJECTS.length}`);
console.log(`Total Question Bank Items: ${PAST_PAPERS_DATABASE.length}`);
console.log(`Total Official Past Paper Archives: ${OFFICIAL_PAST_PAPER_PDFS.length}`);
