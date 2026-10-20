// Platform Audit & Change Tracking System: src/services/auditTrail.ts
// Persists all administrative, access control, user role, pricing, and system changes
// with actor identification (who made the change), timestamps, and granular details.

export type AuditTargetType = 
  | 'user' 
  | 'access_code' 
  | 'pricing' 
  | 'payment' 
  | 'question' 
  | 'classroom' 
  | 'system';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601 string
  actorId: string;
  actorName: string;
  actorRole: 'founder' | 'admin' | 'teacher' | 'student' | 'system';
  actorEmail?: string;
  action: string; // e.g. 'UPDATED_ACCESS_CODE'
  actionLabel: string; // Human-readable e.g. 'Updated Access Code'
  targetType: AuditTargetType;
  targetId?: string;
  targetLabel: string; // e.g. 'Thomas (Founder Code)' or 'student@school.com'
  details: string; // Human-readable explanation of what changed
  previousValue?: string;
  newValue?: string;
}

const STORAGE_AUDIT_LOGS_KEY = 'simply_platform_audit_logs';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_init_001',
    timestamp: '2026-10-20T18:00:00.000Z',
    actorId: 'founder_thomas',
    actorName: 'Thomas',
    actorRole: 'founder',
    actorEmail: 'thomas@simplyigcse.com',
    action: 'SYSTEM_SECURITY_PROVISIONED',
    actionLabel: 'Provisioned Security Portal',
    targetType: 'access_code',
    targetLabel: 'Founder Access Code (2011)',
    details: 'Provisioned master Founder Access Code for Thomas with root platform administration rights.',
    newValue: 'Code 2011 (Founder Role)'
  },
  {
    id: 'audit_init_002',
    timestamp: '2026-10-20T18:05:00.000Z',
    actorId: 'founder_thomas',
    actorName: 'Thomas',
    actorRole: 'founder',
    actorEmail: 'thomas@simplyigcse.com',
    action: 'PAST_PAPER_ARCHIVE_EXPANDED',
    actionLabel: 'Scaled Past Paper Engine',
    targetType: 'question',
    targetLabel: '45,000+ Exam Questions',
    details: 'Expanded Question Finder index across 3,500+ official Cambridge & Edexcel past papers (2016-2025).',
    newValue: '3,500+ Papers Indexed'
  },
  {
    id: 'audit_init_003',
    timestamp: '2026-10-20T18:10:00.000Z',
    actorId: 'system',
    actorName: 'Security Automation',
    actorRole: 'system',
    action: 'AUTH_LOCKDOWN',
    actionLabel: 'Hardened Authentication Gate',
    targetType: 'system',
    targetLabel: 'Global Authentication Gate',
    details: 'Removed visible pre-filled passwords and enabled single-device active session enforcement.',
    newValue: 'Encrypted Access Code Auth'
  }
];

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
    if (!raw) {
      saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_LOGS;
  } catch (err) {
    console.error('Failed to load audit logs:', err);
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 1000))); // Keep last 1,000 entries
  } catch (err) {
    console.error('Failed to save audit logs:', err);
  }
}

export function logAuditEvent(entry: {
  actorName: string;
  actorRole: 'founder' | 'admin' | 'teacher' | 'student' | 'system';
  actorId?: string;
  actorEmail?: string;
  action: string;
  actionLabel: string;
  targetType: AuditTargetType;
  targetId?: string;
  targetLabel: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}): AuditLogEntry {
  const newLog: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actorId: entry.actorId || (entry.actorRole === 'founder' ? 'founder_thomas' : 'admin_root'),
    actorName: entry.actorName || (entry.actorRole === 'founder' ? 'Thomas (Founder)' : 'Administrator'),
    actorRole: entry.actorRole,
    actorEmail: entry.actorEmail,
    action: entry.action,
    actionLabel: entry.actionLabel,
    targetType: entry.targetType,
    targetId: entry.targetId,
    targetLabel: entry.targetLabel,
    details: entry.details,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
  };

  const logs = getAuditLogs();
  logs.unshift(newLog); // Prepend to the top
  saveAuditLogs(logs);

  console.log(`[AUDIT TRAIL] [${newLog.actorName} - ${newLog.actorRole.toUpperCase()}] ${newLog.actionLabel}: ${newLog.details}`);
  return newLog;
}

export function clearAuditLogs(actorName: string = 'Thomas', actorRole: 'founder' | 'admin' = 'founder'): void {
  const resetLog: AuditLogEntry = {
    id: `audit_reset_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorId: 'founder_thomas',
    actorName,
    actorRole,
    action: 'AUDIT_LOG_ARCHIVED',
    actionLabel: 'Archived Audit Trail',
    targetType: 'system',
    targetLabel: 'Audit History',
    details: `Audit trail history was reset and fresh tracking initiated by ${actorName}.`
  };
  saveAuditLogs([resetLog]);
}
