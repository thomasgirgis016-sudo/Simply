import fs from 'fs';
import path from 'path';

// Audit content in Simply
console.log('=== SIMPLY IGCSE CONTENT AUDIT RUNNER ===');

// 1. Revision Notes Analysis
const revisionDataPath = path.resolve('src/data/revisionData.ts');
const revisionContent = fs.readFileSync(revisionDataPath, 'utf8');

const topicRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?subjectId:\s*['"]([^'"]+)['"][\s\S]*?chapter:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"]/g;
let match;
const notes = [];
while ((match = topicRegex.exec(revisionContent)) !== null) {
  notes.push({
    id: match[1],
    subjectId: match[2],
    chapter: match[3],
    title: match[4]
  });
}

console.log(`\n1. REVISION NOTES INVENTORY: ${notes.length} total topics`);
const notesBySubject = {};
notes.forEach(n => {
  notesBySubject[n.subjectId] = (notesBySubject[n.subjectId] || 0) + 1;
  console.log(`  - [${n.subjectId}] Chapter: "${n.chapter}" -> Title: "${n.title}"`);
});
console.log('\nNotes breakdown by subjectId:', notesBySubject);

// 2. Subjects List
const subjectsPath = path.resolve('src/data/subjects.ts');
const subjectsContent = fs.readFileSync(subjectsPath, 'utf8');
const subjectIdMatches = [...subjectsContent.matchAll(/id:\s*['"]([a-z0-9-]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*code:\s*['"]([^'"]+)['"],\s*board:\s*['"]([^'"]+)['"]/g)];
console.log(`\n2. CONFIGURED SUBJECTS: ${subjectIdMatches.length} subjects found`);
subjectIdMatches.forEach(s => {
  const hasNotes = (notesBySubject[s[1]] || 0);
  console.log(`  - ${s[1]} (${s[2]}, ${s[3]}, ${s[4]}): ${hasNotes} note topics`);
});

// 3. Past Papers Analysis
const pastPapersPath = path.resolve('src/data/pastPapersData.ts');
const pastPapersContent = fs.readFileSync(pastPapersPath, 'utf8');

const qRegex = /id:\s*['"](pp-[a-z0-9-]+)['"][\s\S]*?subjectId:\s*['"]([^'"]+)['"][\s\S]*?subjectCode:\s*['"]([^'"]+)['"][\s\S]*?session:\s*['"]([^'"]+)['"][\s\S]*?questionNumber:\s*['"]([^'"]+)['"][\s\S]*?topic:\s*['"]([^'"]+)['"]/g;
const pastPaperQuestions = [];
while ((match = qRegex.exec(pastPapersContent)) !== null) {
  pastPaperQuestions.push({
    id: match[1],
    subjectId: match[2],
    subjectCode: match[3],
    session: match[4],
    questionNumber: match[5],
    topic: match[6]
  });
}
console.log(`\n3. PAST PAPER QUESTION BANK: ${pastPaperQuestions.length} questions registered in PAST_PAPERS_DATABASE`);

// 4. Knowledge Base Blueprints Analysis
const kbPath = path.resolve('src/services/questionKnowledgeBase.ts');
const kbContent = fs.readFileSync(kbPath, 'utf8');
const blueprints = [...kbContent.matchAll(/qNum:\s*(\d+)[\s\S]*?topic:\s*['"]([^'"]+)['"]/g)];
console.log(`\n4. KNOWLEDGE BASE BLUEPRINTS: ${blueprints.length} question blueprints found`);
