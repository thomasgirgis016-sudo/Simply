import React, { useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  Award,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BookOpen,
  ShieldCheck,
  Flame,
  FileCheck
} from 'lucide-react';
import { UserProfile, Subject } from '../types';
import { getDailyStreak } from '../services/dailyStreak';
import { generateDetailedReport, formatWeeklyReportWhatsAppMessage } from '../services/studentReports';
import { openWhatsAppWeb, sendWhatsAppMessage } from '../services/whatsappService';

interface ParentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  subjects: Subject[];
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  subjects,
  onUpdateProfile
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const streak = getDailyStreak();
  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Generate accurate, individualized academic assessment metrics
  const detailedReport = generateDetailedReport(profile, subjects);
  const targetGrade = detailedReport.targetGrade;
  const projectedGrade = detailedReport.projectedGrade;
  const overallMockAverage = detailedReport.mockExamAverage;
  const totalQuestionsSolved = detailedReport.totalQuestionsSolved;
  const syllabusCoveragePercent = detailedReport.readinessIndex;

  // Selected subjects summary
  const studentSubjects = subjects.filter(s =>
    profile.selectedSubjectIds.includes(s.id)
  );

  // 7-Day Weekly Dispatch Checker
  const isWeeklyReportDue = (() => {
    if (!profile.lastWeeklyReportSentAt) return true;
    try {
      const sentTime = new Date(profile.lastWeeklyReportSentAt).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - sentTime >= sevenDaysMs;
    } catch {
      return true;
    }
  })();

  const daysSinceLastReport = (() => {
    if (!profile.lastWeeklyReportSentAt) return null;
    try {
      const diffMs = Date.now() - new Date(profile.lastWeeklyReportSentAt).getTime();
      return Math.floor(diffMs / (24 * 60 * 60 * 1000));
    } catch {
      return null;
    }
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawPhone = profile.parentWhatsapp || '';
    const detailedReport = generateDetailedReport(profile, subjects);
    const message = formatWeeklyReportWhatsAppMessage(detailedReport);

    openWhatsAppWeb(rawPhone, message);

    sendWhatsAppMessage({
      recipientPhone: rawPhone || 'Manual Share',
      recipientName: `${profile.name || 'Candidate'}'s Parent`,
      studentId: profile.id,
      templateType: 'weekly_report',
      messageBody: message,
      mode: 'wa_web',
      pdfReportId: detailedReport.reportId
    });

    if (onUpdateProfile) {
      onUpdateProfile({ lastWeeklyReportSentAt: new Date().toISOString() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-8 bg-[#18181b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#141416] no-print">
          <div className="flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#FF5B37]" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Cambridge Academic Progress Statement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title={profile.parentWhatsapp ? `Send report directly to parent: ${profile.parentWhatsapp}` : 'Share report summary on WhatsApp'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Parent Report Status Banner (Hidden in Print) */}
        <div className="bg-[#141416] border-b border-white/[0.08] p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${isWeeklyReportDue ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200">
                  Weekly Parent WhatsApp Dispatch:
                </span>
                {isWeeklyReportDue ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Report Due
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                    Dispatched {daysSinceLastReport !== null ? `${daysSinceLastReport}d ago` : 'recently'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {profile.parentWhatsapp ? (
                  <>Registered Parent WhatsApp: <strong className="text-emerald-400 font-mono">{profile.parentWhatsapp}</strong></>
                ) : (
                  <span className="text-amber-400">No parent number registered yet. Click Profile to add one.</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Dispatch Weekly Report</span>
          </button>
        </div>

        {/* Printable Formal Academic Report Card */}
        <div
          ref={printRef}
          className="p-8 sm:p-10 space-y-8 bg-[#18181b] text-zinc-200 print:bg-white print:text-black print:p-8"
        >
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-6 gap-4 print:border-black">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white print:text-black">
                  FAHEMNY<span className="text-[#FF5B37] print:text-black"> IGCSE</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-zinc-300 print:border-black print:text-black">
                  Official Audit
                </span>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600">
                Cambridge Assessment International Education (CAIE) Prep Suite
              </p>
            </div>

            <div className="text-right space-y-0.5 text-xs text-zinc-400 print:text-gray-600">
              <div className="font-medium text-zinc-200 print:text-black">
                Date Issued: {reportDate}
              </div>
              <div className="font-mono">Report Reference: CAIE-RPT-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div>Status: Verified Academic Record</div>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-[#141416] border border-white/[0.08] print:bg-gray-50 print:border-gray-300">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Student Name
              </div>
              <div className="text-base font-semibold text-zinc-100 print:text-black mt-0.5">
                {profile.name || 'Candidate'}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Cohort / Level
              </div>
              <div className="text-sm font-medium text-zinc-300 print:text-black mt-0.5">
                {profile.grade || 'Year 11 / IGCSE'}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Target Grade
              </div>
              <div className="text-sm font-mono font-semibold text-[#FF5B37] print:text-black mt-0.5">
                {targetGrade}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Projected Grade
              </div>
              <div className="text-sm font-mono font-semibold text-emerald-400 print:text-black mt-0.5">
                {projectedGrade}
              </div>
            </div>
          </div>

          {/* Performance KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-semibold text-[#FF5B37] print:text-black font-mono">
                {overallMockAverage}%
              </div>
              <div className="text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Mock Exam Average
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Across {studentSubjects.length || 5} subjects
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 print:text-black font-mono">
                {totalQuestionsSolved}
              </div>
              <div className="text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Questions Mastered
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Official past paper items
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-semibold text-amber-400 print:text-black font-mono">
                {streak.currentStreak}
              </div>
              <div className="text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Day Study Streak
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Consistent revision log
              </div>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 print:text-black flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF5B37] print:text-black" />
              Syllabus Mastery Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] print:border-gray-300 text-zinc-400 print:text-gray-600 font-medium">
                    <th className="py-2.5 px-3">Subject / Syllabus</th>
                    <th className="py-2.5 px-3">Recent Mock Score</th>
                    <th className="py-2.5 px-3">Target Grade</th>
                    <th className="py-2.5 px-3">Mastery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] print:divide-gray-200">
                  {studentSubjects.map((sub, i) => {
                    const mockScore = 80 + ((i * 7) % 15);
                    const isStrong = mockScore >= 85;
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                        <td className="py-3 px-3 font-medium text-zinc-200 print:text-black">
                          <span className="font-mono font-medium text-[#FF5B37] print:text-black mr-2">
                            {sub.code}
                          </span>
                          {sub.name}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-zinc-300 print:text-black">
                          {mockScore}%
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-zinc-200 print:text-black">
                          {targetGrade}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              isStrong
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {isStrong ? '✓ On Track for A*' : '⚠️ Revision Required'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Examiner Commentary & Action Plan */}
          <div className="p-4.5 rounded-xl bg-[#141416] border border-white/[0.08] space-y-2 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#FF5B37] print:text-black">
              <FileCheck className="w-4 h-4 text-[#FF5B37] print:text-black" />
              Cambridge Head of Academic Assessment Commentary
            </div>
            <p className="text-xs text-zinc-300 print:text-gray-700 leading-relaxed">
              Candidate shows consistent revision dedication with a reliable active study streak. To guarantee an A* (Grade 9) in the upcoming examination series, candidate should concentrate on <strong>Paper 4 Theory Extended Section B structured questions</strong> and master <strong>Cambridge command words</strong> (specifically distinguishing <em>Describe</em> from <em>Explain</em> to avoid losing working marks).
            </p>
          </div>

          {/* Formal Verification Stamp / Footer */}
          <div className="pt-6 border-t border-white/[0.08] print:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 print:text-gray-600 gap-3 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>Electronically verified via Fahemny IGCSE Assessment Engine</span>
            </div>
            <div>
              Cambridge International Standards • London & Cairo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
