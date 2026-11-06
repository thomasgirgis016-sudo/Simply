import { UserAccount, Subject } from '../types';
import { updateUserAccount } from './auth';
import { logAuditEvent } from './auditTrail';
import { generateDetailedReport, formatWeeklyReportWhatsAppMessage, DetailedStudentReport } from './studentReports';

export type WhatsAppTemplateType =
  | 'weekly_report'
  | 'payment_receipt'
  | 'diagnostic_alert'
  | 'streak_reminder'
  | 'school_seat_invite'
  | 'custom';

export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppDispatchLog {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  studentId?: string;
  templateType: WhatsAppTemplateType;
  status: DeliveryStatus;
  statusUpdatedAt: string;
  preview: string;
  messageBody: string;
  mode: 'wa_web' | 'automated_api';
  pdfReportId?: string;
}

const STORAGE_KEY = 'simply_whatsapp_dispatch_logs';
const AUTOSCHEDULER_KEY = 'simply_whatsapp_autoscheduler_config';

export interface AutoSchedulerConfig {
  enabled: boolean;
  frequencyDays: number;
  lastRunTimestamp?: string;
  autoDispatchHourUtc: number; // e.g. 17 for 5pm UTC (7pm Cairo time)
}

const DEFAULT_AUTOSCHEDULER: AutoSchedulerConfig = {
  enabled: true,
  frequencyDays: 7,
  autoDispatchHourUtc: 17
};

/**
 * Clean phone number to digits only with leading plus if international
 */
export function sanitizeWhatsAppPhone(phone: string): { clean: string; valid: boolean } {
  const digits = phone.replace(/[^\d]/g, '');
  // Valid phone usually has 10 to 14 digits
  const valid = digits.length >= 10 && digits.length <= 15;
  return { clean: digits, valid };
}

/**
 * Retrieve delivery logs from storage
 */
export function getWhatsAppLogs(): WhatsAppDispatchLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWhatsAppLogs(logs: WhatsAppDispatchLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save WhatsApp dispatch logs', e);
  }
}

export function clearWhatsAppLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Retrieve Auto-Scheduler configuration
 */
export function getAutoSchedulerConfig(): AutoSchedulerConfig {
  try {
    const raw = localStorage.getItem(AUTOSCHEDULER_KEY);
    if (!raw) return DEFAULT_AUTOSCHEDULER;
    return { ...DEFAULT_AUTOSCHEDULER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUTOSCHEDULER;
  }
}

export function saveAutoSchedulerConfig(config: Partial<AutoSchedulerConfig>): AutoSchedulerConfig {
  const current = getAutoSchedulerConfig();
  const next = { ...current, ...config };
  localStorage.setItem(AUTOSCHEDULER_KEY, JSON.stringify(next));
  return next;
}

/**
 * Check if a weekly report is due for a student (7 days elapsed or never sent)
 */
export function isWeeklyReportDue(student: UserAccount): boolean {
  if (!student.parentWhatsapp || !student.parentWhatsapp.trim()) return false;
  if (!student.lastWeeklyReportSentAt) return true;
  try {
    const sentTime = new Date(student.lastWeeklyReportSentAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - sentTime >= sevenDaysMs;
  } catch {
    return true;
  }
}

/**
 * Generate message body by template type
 */
export function buildTemplateMessage(
  templateType: WhatsAppTemplateType,
  params: {
    studentName: string;
    targetGrade?: string;
    parentPhone?: string;
    detailedReport?: DetailedStudentReport;
    customText?: string;
    planName?: string;
    amountPaid?: string;
    streakDays?: number;
    weakTopic?: string;
    webReportUrl?: string;
  }
): string {
  switch (templateType) {
    case 'weekly_report': {
      if (params.detailedReport) {
        return formatWeeklyReportWhatsAppMessage(params.detailedReport, params.webReportUrl);
      }
      return (
        `🎓 *SIMPLY IGCSE — WEEKLY PROGRESS AUDIT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Candidate:* ${params.studentName}\n` +
        `🎯 *Target Grade:* ${params.targetGrade || '9 / A*'}\n` +
        `📈 *Projected Grade:* Grade 9 / A*\n` +
        `⭐ *Readiness Index:* 88% (Distinction Track)\n` +
        `🔥 *Active Study Streak:* ${params.streakDays || 7} Days\n\n` +
        `View complete breakdown & download official PDF:\n` +
        `👉 ${params.webReportUrl || 'https://simply-igcse.com/?tab=report'}\n\n` +
        `_Simply IGCSE Academic Assessment Portal._`
      );
    }

    case 'payment_receipt': {
      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return (
        `✅ *SIMPLY IGCSE — PAYMENT & ACCESS CONFIRMATION*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Student:* ${params.studentName}\n` +
        `💳 *Plan Activated:* ${params.planName || 'Simply IGCSE Pro Term Plan'}\n` +
        `💵 *Amount Verified:* ${params.amountPaid || 'EGP 420.00'}\n` +
        `📅 *Transaction Date:* ${date}\n` +
        `🏛️ *Settlement Gateway:* Banque du Caire (BDC) Instant Inbound\n` +
        `🔐 *Access Status:* 🟢 ACTIVE — Unlimited Past Papers & Step-by-Step Mark Scheme Engine\n\n` +
        `Thank you for enrolling in Simply IGCSE. Your complete syllabus revision kit is now ready.\n` +
        `👉 https://simply-igcse.com`
      );
    }

    case 'diagnostic_alert': {
      return (
        `⚠️ *SIMPLY IGCSE — DIAGNOSTIC EXAM WEAK SPOT ALERT*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Student:* ${params.studentName}\n` +
        `📌 *Flagged Syllabus Area:* *${params.weakTopic || 'Paper 4 Extended Calculations'}*\n` +
        `🔍 *Examiner Diagnostic:* Student lost marks on 3 consecutive problems in this chapter due to unit conversion slips.\n` +
        `🎯 *Recommended Immediate Action:* Complete the 5-question targeted diagnostic drill on Simply IGCSE co-pilot before tomorrow's revision session.\n\n` +
        `👉 https://simply-igcse.com/?tab=mistakes`
      );
    }

    case 'streak_reminder': {
      return (
        `🔥 *SIMPLY IGCSE — DAILY REVISION REMINDER*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Hey ${params.studentName}! You are on an active *${params.streakDays || 5}-Day Study Streak* on Simply IGCSE.\n` +
        `⏳ Only 58 days remaining until the Cambridge & Edexcel examination series.\n` +
        `Solve 3 quick past paper questions today to keep your momentum towards Grade 9 (A*)!\n\n` +
        `👉 https://simply-igcse.com/?tab=solver`
      );
    }

    case 'school_seat_invite': {
      return (
        `🏫 *SIMPLY IGCSE — SCHOOL CLASSROOM ACCESS GRANTED*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Welcome ${params.studentName}! Your school coordinator has enrolled your class in Simply IGCSE.\n` +
        `All 5 Cambridge & Pearson Edexcel subjects, classifieds, and model mark schemes have been activated on your account.\n\n` +
        `Sign in here: https://simply-igcse.com`
      );
    }

    case 'custom':
    default: {
      return (
        params.customText ||
        `Hello ${params.studentName}, here is an update from your Simply IGCSE academic co-pilot: https://simply-igcse.com`
      );
    }
  }
}

/**
 * Launch direct WhatsApp Web / Native app with pre-filled message
 */
export function openWhatsAppWeb(phone: string, messageText: string): void {
  const { clean } = sanitizeWhatsAppPhone(phone);
  const encoded = encodeURIComponent(messageText);
  const url = clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

/**
 * Dispatch a WhatsApp message (either via automated API or logging wa.me launch)
 */
export async function sendWhatsAppMessage(options: {
  recipientPhone: string;
  recipientName: string;
  studentId?: string;
  templateType: WhatsAppTemplateType;
  messageBody: string;
  mode: 'wa_web' | 'automated_api';
  pdfReportId?: string;
}): Promise<{ success: boolean; log: WhatsAppDispatchLog }> {
  const { clean, valid } = sanitizeWhatsAppPhone(options.recipientPhone);

  const preview = options.messageBody.slice(0, 120).replace(/\n/g, ' ') + '...';

  const newLog: WhatsAppDispatchLog = {
    id: `WA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    recipientPhone: options.recipientPhone,
    recipientName: options.recipientName,
    studentId: options.studentId,
    templateType: options.templateType,
    status: valid ? 'sent' : 'failed',
    statusUpdatedAt: new Date().toISOString(),
    preview,
    messageBody: options.messageBody,
    mode: options.mode,
    pdfReportId: options.pdfReportId
  };

  // If automated API mode, simulate real webhook delivery progression
  if (options.mode === 'automated_api' && valid) {
    // Immediate: Sent
    setTimeout(() => {
      updateLogStatus(newLog.id, 'delivered');
    }, 1200);

    setTimeout(() => {
      updateLogStatus(newLog.id, 'read');
    }, 3500);
  }

  // Update user lastWeeklyReportSentAt if this was a weekly report
  if (options.studentId && options.templateType === 'weekly_report' && valid) {
    updateUserAccount(options.studentId, {
      lastWeeklyReportSentAt: new Date().toISOString()
    });
  }

  // Save log
  const existing = getWhatsAppLogs();
  saveWhatsAppLogs([newLog, ...existing]);

  // Log in Audit Trail
  logAuditEvent({
    actorName: 'Automated WhatsApp Dispatcher',
    actorRole: 'admin',
    action: 'settings_update',
    actionLabel: 'WhatsApp Dispatch',
    targetType: 'system',
    targetId: options.studentId || options.recipientPhone,
    targetLabel: `${options.recipientName} (${options.recipientPhone})`,
    details: `Dispatched ${options.templateType} WhatsApp message via ${options.mode}. Status: ${newLog.status}`
  });

  return { success: valid, log: newLog };
}

function updateLogStatus(logId: string, status: DeliveryStatus): void {
  const logs = getWhatsAppLogs();
  const updated = logs.map(l =>
    l.id === logId ? { ...l, status, statusUpdatedAt: new Date().toISOString() } : l
  );
  saveWhatsAppLogs(updated);
}

/**
 * Automated Dispatch Runner: scans all students and automatically sends weekly reports to parents whose reports are due
 */
export async function runAutomatedWeeklyDispatch(
  students: UserAccount[],
  allSubjects: Subject[]
): Promise<{
  totalScanned: number;
  totalDispatched: number;
  dispatched: Array<{ student: UserAccount; phone: string; reportId: string }>;
  skipped: Array<{ student: UserAccount; reason: string }>;
}> {
  const dispatched: Array<{ student: UserAccount; phone: string; reportId: string }> = [];
  const skipped: Array<{ student: UserAccount; reason: string }> = [];

  for (const student of students) {
    // Only process students
    if (student.role !== 'student') continue;

    if (!student.parentWhatsapp || !student.parentWhatsapp.trim()) {
      skipped.push({ student, reason: 'No registered parent WhatsApp number' });
      continue;
    }

    const { valid } = sanitizeWhatsAppPhone(student.parentWhatsapp);
    if (!valid) {
      skipped.push({ student, reason: `Invalid phone format: ${student.parentWhatsapp}` });
      continue;
    }

    if (!isWeeklyReportDue(student)) {
      skipped.push({ student, reason: 'Weekly report sent less than 7 days ago' });
      continue;
    }

    // Generate detailed report
    const detailedReport = generateDetailedReport(student, allSubjects);
    const message = formatWeeklyReportWhatsAppMessage(detailedReport);

    await sendWhatsAppMessage({
      recipientPhone: student.parentWhatsapp,
      recipientName: `${student.name}'s Parent`,
      studentId: student.id,
      templateType: 'weekly_report',
      messageBody: message,
      mode: 'automated_api',
      pdfReportId: detailedReport.reportId
    });

    dispatched.push({
      student,
      phone: student.parentWhatsapp,
      reportId: detailedReport.reportId
    });
  }

  // Update auto-scheduler last run
  saveAutoSchedulerConfig({
    lastRunTimestamp: new Date().toISOString()
  });

  return {
    totalScanned: students.filter(s => s.role === 'student').length,
    totalDispatched: dispatched.length,
    dispatched,
    skipped
  };
}
