import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Send,
  CheckCheck,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  ExternalLink,
  Download,
  Users,
  Eye,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  Check,
  PhoneCall,
  Flame,
  Award,
  Zap,
  RefreshCw,
  Trash2,
  Copy,
  Settings,
  Share2
} from 'lucide-react';
import { UserAccount, Subject } from '../types';
import {
  WhatsAppTemplateType,
  WhatsAppDispatchLog,
  getWhatsAppLogs,
  saveWhatsAppLogs,
  clearWhatsAppLogs,
  getAutoSchedulerConfig,
  saveAutoSchedulerConfig,
  isWeeklyReportDue,
  buildTemplateMessage,
  openWhatsAppWeb,
  sendWhatsAppMessage,
  runAutomatedWeeklyDispatch,
  resetAllWeeklyReportTimers,
  sanitizeWhatsAppPhone
} from '../services/whatsappService';
import { generateDetailedReport, DetailedStudentReport } from '../services/studentReports';
import { DetailedStudentReportModal } from './DetailedStudentReportModal';

interface WhatsAppTestingDashboardProps {
  students: UserAccount[];
  subjects: Subject[];
  onRefreshStudents?: () => void;
}

export const WhatsAppTestingDashboard: React.FC<WhatsAppTestingDashboardProps> = ({
  students,
  subjects,
  onRefreshStudents
}) => {
  // Config & Logs State
  const [logs, setLogs] = useState<WhatsAppDispatchLog[]>(() => getWhatsAppLogs());
  const [autoConfig, setAutoConfig] = useState(() => getAutoSchedulerConfig());
  const [activeTab, setActiveTab] = useState<'tester' | 'scheduler' | 'logs'>('tester');

  // Interactive Message Tester Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [templateType, setTemplateType] = useState<WhatsAppTemplateType>('weekly_report');
  const [customText, setCustomText] = useState<string>('');
  const [weakTopic, setWeakTopic] = useState<string>('Paper 4 Extended Calculations');
  const [targetGrade, setTargetGrade] = useState<string>('9 / A*');

  // Status & Feedback State
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<DetailedStudentReport | null>(null);
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<WhatsAppDispatchLog | null>(null);

  // Automated Batch Run State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState<{
    totalScanned: number;
    totalDispatched: number;
    dispatched: Array<{ student: UserAccount; phone: string; reportId: string }>;
    skipped: Array<{ student: UserAccount; reason: string }>;
  } | null>(null);

  // Roster Search
  const [rosterSearch, setRosterSearch] = useState('');
  const [webhookUrlInput, setWebhookUrlInput] = useState(autoConfig.webhookUrl || '');
  const [isGatewaySettingsOpen, setIsGatewaySettingsOpen] = useState(false);

  // Reload logs periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setLogs(getWhatsAppLogs());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active target student
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Generate detailed report for the active student
  const activeDetailedReport = useMemo(() => {
    if (!activeStudent) return null;
    return generateDetailedReport(activeStudent, subjects);
  }, [activeStudent, subjects]);

  // Compute live prefilled message body
  const liveMessageBody = useMemo(() => {
    const name = customName.trim() || activeStudent?.name || 'Candidate';
    const phone = customPhone.trim() || activeStudent?.parentWhatsapp || '';

    return buildTemplateMessage(templateType, {
      studentName: name,
      targetGrade: targetGrade || activeStudent?.targetGrade,
      parentPhone: phone,
      detailedReport: activeDetailedReport || undefined,
      customText,
      weakTopic,
      streakDays: activeDetailedReport?.studyStreakDays || 7,
      webReportUrl: activeDetailedReport ? `https://simply-igcse.com/?tab=report&id=${activeDetailedReport.studentId}` : undefined
    });
  }, [templateType, customName, customPhone, activeStudent, activeDetailedReport, customText, weakTopic, targetGrade]);

  // Statistics
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const deliveredCount = logs.filter(l => l.status === 'delivered' || l.status === 'read').length;
    const deliveryRate = totalLogs > 0 ? Math.round((deliveredCount / totalLogs) * 100) : 100;
    const registeredParents = students.filter(s => s.parentWhatsapp && s.parentWhatsapp.trim()).length;
    const dueCount = students.filter(s => isWeeklyReportDue(s)).length;

    return { totalLogs, deliveryRate, registeredParents, dueCount };
  }, [logs, students]);

  // Filtered student roster
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (s.role !== 'student') return false;
      if (!rosterSearch.trim()) return true;
      const q = rosterSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.parentWhatsapp && s.parentWhatsapp.includes(q))
      );
    });
  }, [students, rosterSearch]);

  // Action: Launch WhatsApp Web (wa.me)
  const handleSendViaWeb = () => {
    const phone = customPhone.trim() || activeStudent?.parentWhatsapp || '';
    if (!phone) {
      showToast('⚠️ Please enter or select a parent WhatsApp phone number');
      return;
    }

    openWhatsAppWeb(phone, liveMessageBody);

    // Also record dispatch log
    sendWhatsAppMessage({
      recipientPhone: phone,
      recipientName: customName.trim() || `${activeStudent?.name || 'Student'}'s Parent`,
      studentId: activeStudent?.id,
      templateType,
      messageBody: liveMessageBody,
      mode: 'wa_web',
      pdfReportId: activeDetailedReport?.reportId
    });

    setLogs(getWhatsAppLogs());
    if (onRefreshStudents) onRefreshStudents();
    showToast('✓ WhatsApp Web launched and dispatch logged!');
  };

  // Action: Automated API simulation
  const handleSendViaApi = async () => {
    const phone = customPhone.trim() || activeStudent?.parentWhatsapp || '';
    if (!phone) {
      showToast('⚠️ Please provide a recipient WhatsApp phone number');
      return;
    }

    setIsDispatching(true);
    try {
      const res = await sendWhatsAppMessage({
        recipientPhone: phone,
        recipientName: customName.trim() || `${activeStudent?.name || 'Student'}'s Parent`,
        studentId: activeStudent?.id,
        templateType,
        messageBody: liveMessageBody,
        mode: 'automated_api',
        pdfReportId: activeDetailedReport?.reportId
      });

      setLogs(getWhatsAppLogs());
      if (onRefreshStudents) onRefreshStudents();

      if (res.success) {
        showToast(`✓ Automated message queued for ${phone}! Simulated webhook delivery in progress.`);
      } else {
        showToast(`⚠️ Message logged but phone format (${phone}) may be invalid.`);
      }
    } finally {
      setIsDispatching(false);
    }
  };

  // Action: Run batch auto-dispatch for all due students (or force test all)
  const handleRunBatchAutoDispatch = async (forceAll: boolean = false) => {
    setIsBatchRunning(true);
    setBatchResults(null);
    try {
      const result = await runAutomatedWeeklyDispatch(students, subjects, { forceAll });
      setBatchResults(result);
      setLogs(getWhatsAppLogs());
      if (onRefreshStudents) onRefreshStudents();
      showToast(`✓ Batch dispatch completed! Sent ${result.totalDispatched} weekly reports.`);
    } catch (e: any) {
      showToast(`❌ Batch dispatch failed: ${e.message}`);
    } finally {
      setIsBatchRunning(false);
    }
  };

  const handleResetAllTimers = () => {
    const count = resetAllWeeklyReportTimers(students);
    setLogs(getWhatsAppLogs());
    if (onRefreshStudents) onRefreshStudents();
    showToast(`✓ Reset 7-day cooldown for ${count} students. Reports are now ready for re-testing!`);
  };

  const handleToggleAutoScheduler = () => {
    const next = saveAutoSchedulerConfig({ enabled: !autoConfig.enabled });
    setAutoConfig(next);
    showToast(next.enabled ? '✓ Automated weekly dispatch engine ACTIVATED' : '⚠️ Automated weekly dispatch engine PAUSED');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl border border-emerald-500/50 bg-slate-900/95 p-4 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-xl animate-fadeIn flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 p-4 sm:p-7 shadow-xl">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30 mb-2.5">
              <Smartphone className="h-3.5 w-3.5" />
              <span>WhatsApp Cloud API & Automated Parent Dispatch Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              WhatsApp Testing & Automated Report Console
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Test message templates live, simulate automated webhook deliveries, preview student PDF statements, and manage automatic weekly parent WhatsApp dispatches.
            </p>
          </div>

          {/* Quick Engine Status Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAutoScheduler}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer shadow-lg ${
                autoConfig.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
              }`}
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Auto-Dispatch: {autoConfig.enabled ? 'ACTIVE (Weekly)' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Analytics Counter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-800/80">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Dispatches</span>
            <div className="text-lg sm:text-2xl font-black font-mono text-white mt-0.5">{stats.totalLogs}</div>
            <span className="text-[10px] text-slate-500">Historical messages</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Registered Parents</span>
            <div className="text-lg sm:text-2xl font-black font-mono text-emerald-300 mt-0.5">{stats.registeredParents}</div>
            <span className="text-[10px] text-emerald-400/80 font-bold">WhatsApp enabled</span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Weekly Reports Due</span>
            <div className="text-lg sm:text-2xl font-black font-mono text-amber-300 mt-0.5">{stats.dueCount}</div>
            <span className="text-[10px] text-amber-400/80 font-bold">Needs dispatch</span>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Delivery Rate</span>
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-300 mt-0.5">{stats.deliveryRate}%</div>
            <span className="text-[10px] text-cyan-400/80 font-bold">Delivered & Read</span>
          </div>
        </div>
      </div>

      {/* Segmented Controller Tab Bar */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab('tester')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'tester'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>Interactive Message Tester</span>
        </button>

        <button
          onClick={() => setActiveTab('scheduler')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'scheduler'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Automated Weekly Dispatcher ({stats.dueCount} Due)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCheck className="h-4 w-4" />
          <span>Delivery & Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE MESSAGE TESTER */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Controls & Variables (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Send className="h-4 w-4 text-emerald-400" />
              <span>Configure WhatsApp Message Test</span>
            </h3>

            {/* Recipient Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Existing Student (Auto-fills Parent WhatsApp & Academic Metrics):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setCustomPhone('');
                  setCustomName('');
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email}) — Parent WhatsApp: {s.parentWhatsapp || 'None'}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Override Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Override Student Name:
                </label>
                <input
                  type="text"
                  placeholder={activeStudent?.name || 'Student Name'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  Override Phone (with Country Code):
                </label>
                <input
                  type="text"
                  placeholder={activeStudent?.parentWhatsapp || '+20 100 123 4567'}
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Message Template Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'weekly_report', label: '📊 Weekly Audit Report' },
                  { id: 'payment_receipt', label: '💳 Payment Receipt' },
                  { id: 'diagnostic_alert', label: '⚠️ Diagnostic Alert' },
                  { id: 'streak_reminder', label: '🔥 Streak Reminder' },
                  { id: 'school_seat_invite', label: '🏫 School Invite' },
                  { id: 'custom', label: '✏️ Custom Message' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateType(t.id as WhatsAppTemplateType)}
                    className={`rounded-xl p-2.5 text-xs font-bold text-left transition border cursor-pointer ${
                      templateType === t.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Template Input if custom or diagnostic */}
            {templateType === 'custom' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Custom WhatsApp Text (*bold*, _italic_, emoji):
                </label>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type any custom WhatsApp message to test formatting..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {templateType === 'diagnostic_alert' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Weak Syllabus Chapter to Flag:
                </label>
                <input
                  type="text"
                  value={weakTopic}
                  onChange={(e) => setWeakTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleSendViaWeb}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Launch in WhatsApp (wa.me)</span>
              </button>

              <button
                type="button"
                onClick={handleSendViaApi}
                disabled={isDispatching}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>{isDispatching ? 'Dispatching...' : 'Simulate Cloud API Dispatch'}</span>
              </button>

              {activeDetailedReport && (
                <button
                  type="button"
                  onClick={() => setActiveReportModal(activeDetailedReport)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-indigo-400" />
                  <span>View Detailed In-App Report & PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Phone Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  WA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Live Preview</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {customPhone.trim() || activeStudent?.parentWhatsapp || 'No Phone'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(liveMessageBody);
                  showToast('✓ Copied formatted WhatsApp text to clipboard!');
                }}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
                title="Copy formatted text"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="rounded-xl bg-[#0B141A] p-3 text-slate-100 font-sans text-xs shadow-inner min-h-[380px] max-h-[500px] overflow-y-auto space-y-2 border border-slate-900">
              {/* WhatsApp Received Message Bubble */}
              <div className="rounded-2xl rounded-tl-sm bg-[#005C4B] p-3 shadow-md space-y-1.5 text-[11px] leading-relaxed text-slate-100 whitespace-pre-wrap select-text">
                {liveMessageBody}

                {/* Bubble Timestamp & Double Ticks */}
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-300/80 pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="h-3 w-3 text-cyan-400" />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Exact formatting rendering with WhatsApp markdown (*bold*, _italic_, bullets & emojis)
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED WEEKLY REPORT SCHEDULER & STUDENT ROSTER */}
      {activeTab === 'scheduler' && (
        <div className="space-y-4">
          {/* Batch Dispatch Control Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Automated 7-Day Weekly Dispatch Engine</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Automatically scans all students whose weekly report was dispatched more than 7 days ago (or never sent), compiles their latest diagnostic metrics, and sends the update to their parent's WhatsApp.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-slate-400">
                  Reports Due Now: <strong className="text-amber-300">{stats.dueCount} students</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Last Run: <strong className="text-slate-300">{autoConfig.lastRunTimestamp ? new Date(autoConfig.lastRunTimestamp).toLocaleString() : 'Never'}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRunBatchAutoDispatch(false)}
                disabled={isBatchRunning || stats.dueCount === 0}
                className={`rounded-xl px-4 py-2.5 text-xs font-black shadow-xl flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  stats.dueCount > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>{isBatchRunning ? 'Dispatching...' : `Dispatch Due (${stats.dueCount})`}</span>
              </button>

              <button
                onClick={() => handleRunBatchAutoDispatch(true)}
                disabled={isBatchRunning}
                className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer flex items-center gap-1.5"
                title="Test dispatch immediately for all enrolled students without waiting 7 days"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Force Test All</span>
              </button>

              <button
                onClick={handleResetAllTimers}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Reset all student sent timers to test 7-day due state"
              >
                <span>Reset Timers</span>
              </button>
            </div>
          </div>

          {/* Batch Result Summary if available */}
          {batchResults && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Check className="h-4 w-4" />
                <span>Batch Automated Dispatch Summary: Successfully dispatched {batchResults.totalDispatched} reports out of {batchResults.totalScanned} scanned students!</span>
              </div>
              {batchResults.dispatched.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {batchResults.dispatched.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      ✓ {d.student.name} ({d.phone})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outbound Webhook / Live Dispatch Gateway Settings */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGatewaySettingsOpen(!isGatewaySettingsOpen)}>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Outbound Live WhatsApp Gateway & Webhook Settings</span>
                {autoConfig.webhookUrl && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Webhook Bound
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white transition"
              >
                {isGatewaySettingsOpen ? '▲ Hide' : '▼ Configure'}
              </button>
            </div>

            {isGatewaySettingsOpen && (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Connect any live WhatsApp HTTP Webhook gateway (e.g. <strong>CallMeBot</strong>, <strong>Green API</strong>, <strong>UltraMsg</strong>, <strong>Twilio</strong>, or <strong>Make/Zapier</strong>). When the automated background engine runs, it automatically dispatches HTTP POST payloads to your gateway.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://api.ultramsg.com/instance/messages/chat or your webhook URL..."
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const next = saveAutoSchedulerConfig({ webhookUrl: webhookUrlInput.trim() });
                      setAutoConfig(next);
                      showToast('✓ Outbound WhatsApp Gateway Webhook URL saved successfully!');
                    }}
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Save Webhook URL
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoOpenWebCheck"
                    checked={Boolean(autoConfig.autoOpenWebLink)}
                    onChange={(e) => {
                      const next = saveAutoSchedulerConfig({ autoOpenWebLink: e.target.checked });
                      setAutoConfig(next);
                      showToast(e.target.checked ? '✓ WhatsApp Web auto-launch on dispatch ENABLED' : 'WhatsApp Web auto-launch disabled');
                    }}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoOpenWebCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                    Automatically launch WhatsApp Web / App (wa.me) when dispatching individual reports
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Student Roster Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email or phone..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <span className="text-xs text-slate-400">
                Showing {filteredStudents.length} Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Parent WhatsApp</th>
                    <th className="py-3 px-3">Weekly Report Status</th>
                    <th className="py-3 px-3">Last Sent</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((student) => {
                    const isDue = isWeeklyReportDue(student);
                    const hasPhone = Boolean(student.parentWhatsapp && student.parentWhatsapp.trim());
                    const report = generateDetailedReport(student, subjects);

                    return (
                      <tr key={student.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{student.email}</div>
                        </td>

                        <td className="py-3 px-3">
                          {hasPhone ? (
                            <span className="font-mono text-emerald-300 font-semibold">
                              {student.parentWhatsapp}
                            </span>
                          ) : (
                            <span className="text-amber-400/80 text-[11px] italic">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {!hasPhone ? (
                            <span className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-700">
                              Missing Phone
                            </span>
                          ) : isDue ? (
                            <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40 animate-pulse">
                              📅 Report Due Now
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                              ✓ Up to Date
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                          {student.lastWeeklyReportSentAt
                            ? new Date(student.lastWeeklyReportSentAt).toLocaleDateString()
                            : 'Never sent'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View in-app detailed report & Download PDF */}
                            <button
                              onClick={() => setActiveReportModal(report)}
                              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white transition"
                              title="View In-Website Report & Download PDF"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>

                            {/* Direct WhatsApp Web Launch (wa.me) */}
                            <button
                              disabled={!hasPhone}
                              onClick={() => {
                                const msg = buildTemplateMessage('weekly_report', {
                                  studentName: student.name,
                                  targetGrade: student.targetGrade,
                                  detailedReport: report,
                                  webReportUrl: `https://simply-igcse.com/?tab=report&id=${student.id}`
                                });
                                openWhatsAppWeb(student.parentWhatsapp!, msg);
                                sendWhatsAppMessage({
                                  recipientPhone: student.parentWhatsapp!,
                                  recipientName: `${student.name}'s Parent`,
                                  studentId: student.id,
                                  templateType: 'weekly_report',
                                  messageBody: msg,
                                  mode: 'wa_web',
                                  pdfReportId: report.reportId
                                });
                                setLogs(getWhatsAppLogs());
                                if (onRefreshStudents) onRefreshStudents();
                                showToast(`✓ WhatsApp Web launched with weekly report for ${student.name}!`);
                              }}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                              title="Open directly in WhatsApp Web / App"
                            >
                              <Share2 className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </button>

                            {/* Dispatch individual report via Automated API */}
                            <button
                              disabled={!hasPhone}
                              onClick={async () => {
                                const msg = buildTemplateMessage('weekly_report', {
                                  studentName: student.name,
                                  targetGrade: student.targetGrade,
                                  detailedReport: report,
                                  webReportUrl: `https://simply-igcse.com/?tab=report&id=${student.id}`
                                });

                                await sendWhatsAppMessage({
                                  recipientPhone: student.parentWhatsapp!,
                                  recipientName: `${student.name}'s Parent`,
                                  studentId: student.id,
                                  templateType: 'weekly_report',
                                  messageBody: msg,
                                  mode: 'automated_api',
                                  pdfReportId: report.reportId
                                });

                                setLogs(getWhatsAppLogs());
                                if (onRefreshStudents) onRefreshStudents();
                                showToast(`✓ Dispatched automated report to ${student.name}'s parent!`);
                              }}
                              className="rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                              title="Send weekly report via automated API / webhook"
                            >
                              <Zap className="h-3 w-3" />
                              <span>Auto Dispatch</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY & AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Delivery History
              </h3>
              <p className="text-[11px] text-slate-400">
                Complete record of outbound messages, delivery states, and payloads.
              </p>
            </div>

            <button
              onClick={() => {
                clearWhatsAppLogs();
                setLogs([]);
                showToast('✓ WhatsApp dispatch logs cleared');
              }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No WhatsApp messages dispatched yet. Use the Interactive Tester or Automated Dispatcher to send your first message.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-3">Recipient</th>
                      <th className="py-3 px-3">Template</th>
                      <th className="py-3 px-3">Channel</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Message Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{log.recipientName}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">{log.recipientPhone}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="capitalize text-slate-300 font-semibold">
                            {log.templateType.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                            {log.mode === 'automated_api' ? 'Cloud API' : 'wa.me'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              log.status === 'read'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : log.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : log.status === 'sent'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            <CheckCheck className="h-3 w-3" />
                            <span>{log.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedLogForPreview(log)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-white transition cursor-pointer"
                          >
                            Inspect Body
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: In-Website Detailed Report & PDF Generator */}
      {activeReportModal && (
        <DetailedStudentReportModal
          isOpen={Boolean(activeReportModal)}
          onClose={() => setActiveReportModal(null)}
          report={activeReportModal}
          onDispatched={() => {
            setLogs(getWhatsAppLogs());
            if (onRefreshStudents) onRefreshStudents();
            showToast('✓ WhatsApp dispatch logged successfully!');
          }}
        />
      )}

      {/* Modal: Inspect Full Dispatched Message Body */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Full WhatsApp Payload ({selectedLogForPreview.id})
              </h4>
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-[#0B141A] p-4 text-[11px] font-mono text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto border border-slate-950">
              {selectedLogForPreview.messageBody}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-400 font-mono">{selectedLogForPreview.recipientPhone}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLogForPreview.messageBody);
                  showToast('✓ Copied message payload to clipboard');
                }}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 font-bold text-white"
              >
                Copy Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
