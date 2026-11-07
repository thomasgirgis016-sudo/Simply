/**
 * Automated test script for:
 * 1. Detailed Student Academic Progress Report Generation
 * 2. WhatsApp Message Formatting (Markdown, Emojis, Live Links, PDF Reference)
 * 3. Interactive Testing Dashboard & Delivery Logs
 * 4. Automated Weekly Report Dispatch Engine
 */

import { generateDetailedReport, formatWeeklyReportWhatsAppMessage } from '../src/services/studentReports';
import {
  buildTemplateMessage,
  sendWhatsAppMessage,
  getWhatsAppLogs,
  runAutomatedWeeklyDispatch,
  isWeeklyReportDue,
  sanitizeWhatsAppPhone
} from '../src/services/whatsappService';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { UserAccount } from '../src/types';

console.log('===========================================================');
console.log('  TESTING WHATSAPP TESTER, DETAILED REPORTS & AUTO-DISPATCH');
console.log('===========================================================');

// Mock localStorage if in Node environment
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (k: string) => store[k] || null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

const mockStudent: UserAccount = {
  id: 'usr-test-101',
  name: 'Kareem Mansour',
  email: 'kareem.mansour@igcse.edu',
  passwordHash: 'dummy',
  grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
  board: 'Both',
  targetGrade: '9 / A*',
  selectedSubjectIds: ['sub-0580', 'sub-0625', 'sub-0620'],
  role: 'student',
  status: 'approved',
  createdAt: new Date().toISOString(),
  parentWhatsapp: '+20 102 345 6789',
  lastWeeklyReportSentAt: undefined
};

// 1. Detailed Student Report Generation
console.log('\n--- 1. Detailed Student Academic Progress Report Generation ---');
const report = generateDetailedReport(mockStudent, IGCSE_SUBJECTS);

if (!report.reportId.startsWith('RPT-')) {
  console.error('❌ Failed: Report ID should start with RPT-');
  process.exit(1);
}
if (report.subjects.length < 3) {
  console.error(`❌ Failed: Expected at least 3 subjects, got ${report.subjects.length}`);
  process.exit(1);
}
if (!report.subjects[0].components || report.subjects[0].components.length === 0) {
  console.error('❌ Failed: Subject should have components (P2, P4, P6)');
  process.exit(1);
}

console.log(`  ✓ Generated Report ID: ${report.reportId}`);
console.log(`  ✓ Student: ${report.studentName} | Projected Grade: ${report.projectedGrade} | Readiness: ${report.readinessIndex}%`);
console.log(`  ✓ Subjects (${report.subjects.length}):`);
report.subjects.forEach(s => {
  console.log(`    - ${s.subjectCode} ${s.subjectName}: Overall ${s.overallScore}% (${s.components.map(c => `${c.componentCode}: ${c.scorePercent}%`).join(', ')})`);
});
console.log(`  ✓ Diagnostic Error Categories (${report.mistakeBreakdown.length}): ${report.mistakeBreakdown.map(m => m.label).slice(0, 2).join(', ')}`);

// 2. WhatsApp Message Formatting
console.log('\n--- 2. WhatsApp Message Formatting (Markdown, Emojis, PDF/Web Link) ---');
const waMessage = formatWeeklyReportWhatsAppMessage(report);

if (!waMessage.includes('FAHEMNY IGCSE — OFFICIAL WEEKLY PROGRESS AUDIT')) {
  console.error('❌ Failed: Missing report header in WhatsApp message');
  process.exit(1);
}
if (!waMessage.includes(mockStudent.name)) {
  console.error('❌ Failed: Student name missing in WhatsApp message');
  process.exit(1);
}
if (!waMessage.includes('https://simply-igcse.com/?tab=report')) {
  console.error('❌ Failed: Digital report URL missing in WhatsApp message');
  process.exit(1);
}

console.log('  ✓ Generated WhatsApp Message Sample Preview:');
console.log('  --------------------------------------------');
console.log(waMessage.split('\n').slice(0, 10).join('\n') + '\n  ...');
console.log('  --------------------------------------------');

// 3. WhatsApp Templates & Dispatch Log Pipeline
console.log('\n--- 3. WhatsApp Templates & Delivery Log Pipeline ---');
const receiptMsg = buildTemplateMessage('payment_receipt', {
  studentName: mockStudent.name,
  planName: 'Simply IGCSE Term Pass',
  amountPaid: 'EGP 420.00'
});

if (!receiptMsg.includes('PAYMENT & ACCESS CONFIRMATION')) {
  console.error('❌ Failed: Payment receipt template failed');
  process.exit(1);
}
console.log('  ✓ Generated Payment Confirmation Receipt template successfully');

// Dispatch test message
const sendResult = await sendWhatsAppMessage({
  recipientPhone: mockStudent.parentWhatsapp!,
  recipientName: `${mockStudent.name}'s Parent`,
  studentId: mockStudent.id,
  templateType: 'weekly_report',
  messageBody: waMessage,
  mode: 'automated_api',
  pdfReportId: report.reportId
});

if (!sendResult.success) {
  console.error('❌ Failed: WhatsApp message dispatch reported failure');
  process.exit(1);
}

const logs = getWhatsAppLogs();
if (logs.length === 0 || logs[0].recipientPhone !== mockStudent.parentWhatsapp) {
  console.error('❌ Failed: Dispatch log not saved properly');
  process.exit(1);
}
console.log(`  ✓ Dispatched message logged: ID ${logs[0].id} (Status: ${logs[0].status})`);

// 4. Automated Weekly Report Dispatch Engine
console.log('\n--- 4. Automated Weekly Report Dispatch Engine ---');

const studentDue: UserAccount = {
  ...mockStudent,
  id: 'usr-due-1',
  name: 'Sara El-Sayed',
  parentWhatsapp: '+20 100 999 8888',
  lastWeeklyReportSentAt: undefined // never sent -> due!
};

const studentRecent: UserAccount = {
  ...mockStudent,
  id: 'usr-recent-2',
  name: 'Youssef Nabil',
  parentWhatsapp: '+20 100 777 6666',
  lastWeeklyReportSentAt: new Date().toISOString() // sent today -> not due!
};

const studentNoPhone: UserAccount = {
  ...mockStudent,
  id: 'usr-nophone-3',
  name: 'Nour Adel',
  parentWhatsapp: undefined // no phone -> skip
};

console.log(`  • studentDue (never sent): isWeeklyReportDue? ${isWeeklyReportDue(studentDue)} (Expected: true)`);
console.log(`  • studentRecent (sent today): isWeeklyReportDue? ${isWeeklyReportDue(studentRecent)} (Expected: false)`);
console.log(`  • studentNoPhone: isWeeklyReportDue? ${isWeeklyReportDue(studentNoPhone)} (Expected: false)`);

if (!isWeeklyReportDue(studentDue) || isWeeklyReportDue(studentRecent)) {
  console.error('❌ Failed: isWeeklyReportDue logic error');
  process.exit(1);
}

// Run batch auto-dispatch
const batchResult = await runAutomatedWeeklyDispatch(
  [studentDue, studentRecent, studentNoPhone],
  IGCSE_SUBJECTS
);

console.log(`  ✓ Batch Auto-Dispatch completed:`);
console.log(`    - Total Scanned: ${batchResult.totalScanned}`);
console.log(`    - Total Dispatched: ${batchResult.totalDispatched} (Expected: 1)`);
console.log(`    - Dispatched to: ${batchResult.dispatched.map(d => `${d.student.name} (${d.phone})`).join(', ')}`);
console.log(`    - Skipped: ${batchResult.skipped.map(s => `${s.student.name}: ${s.reason}`).join(' | ')}`);

if (batchResult.totalDispatched !== 1) {
  console.error(`❌ Failed: Expected 1 dispatched report, got ${batchResult.totalDispatched}`);
  process.exit(1);
}

console.log('\n===========================================================');
console.log('  ALL WHATSAPP TESTING, PDF & AUTO-DISPATCH TESTS PASSED (100%)!');
console.log('===========================================================');
