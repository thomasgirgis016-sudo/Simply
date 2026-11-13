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
  FileCheck,
  Download,
  Layers,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCheck
} from 'lucide-react';
import { DetailedStudentReport, formatWeeklyReportWhatsAppMessage } from '../services/studentReports';
import { openWhatsAppWeb } from '../services/whatsappService';

interface DetailedStudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DetailedStudentReport | null;
  onDispatched?: () => void;
}

export const DetailedStudentReportModal: React.FC<DetailedStudentReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onDispatched
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawPhone = report.parentWhatsapp || '';
    const message = formatWeeklyReportWhatsAppMessage(report);
    openWhatsAppWeb(rawPhone, message);
    if (onDispatched) onDispatched();
  };

  const formattedDate = new Date(report.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl my-4 sm:my-8 bg-[#18181b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-full print:bg-white">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.08] bg-[#141416] no-print gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#FF5B37]" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-100 uppercase tracking-wider block">
                Official Academic Assessment Audit
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">
                Ref: {report.verificationHash}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 sm:px-4 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title={report.parentWhatsapp ? `Send to ${report.parentWhatsapp}` : 'Share on WhatsApp'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp Dispatch Details Notice (Hidden in Print) */}
        <div className="bg-[#141416] border-b border-white/[0.08] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs no-print">
          <div className="flex items-center gap-2 text-zinc-300">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Registered Parent WhatsApp: <strong className="font-mono text-emerald-400">{report.parentWhatsapp || 'Not registered'}</strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCheck className="w-3 h-3" /> Auto-Sync Active
          </span>
        </div>

        {/* Formal Printable Document */}
        <div
          ref={printRef}
          className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-[#18181b] text-zinc-200 print:bg-white print:text-black print:p-6"
        >
          {/* 1. Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-5 sm:pb-6 gap-3 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white print:text-black">
                  FAHEMNY<span className="text-[#FF5B37] print:text-black"> IGCSE</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-zinc-300 print:border-black print:text-black">
                  Verified Academic Statement
                </span>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600 mt-1">
                Cambridge Assessment International Education (CAIE) & Pearson Edexcel Preparation Suite
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-zinc-400 print:text-gray-600 space-y-0.5">
              <div className="font-medium text-zinc-200 print:text-black">
                Date Issued: {formattedDate}
              </div>
              <div className="font-mono">Audit ID: {report.reportId}</div>
              <div className="text-[11px] text-emerald-400 print:text-black font-medium">
                ✓ Official Examiner Verification Passed
              </div>
            </div>
          </div>

          {/* 2. Candidate Profile Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-[#141416] border border-white/[0.08] print:bg-gray-50 print:border-gray-300">
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Candidate Name
              </div>
              <div className="text-sm sm:text-base font-semibold text-zinc-100 print:text-black mt-0.5">
                {report.studentName}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">{report.studentEmail}</div>
            </div>

            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Cohort Level
              </div>
              <div className="text-xs sm:text-sm font-medium text-zinc-300 print:text-black mt-0.5">
                {report.gradeLevel}
              </div>
              <div className="text-[10px] text-zinc-500">2026 Examination Series</div>
            </div>

            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Target Grade
              </div>
              <div className="text-xs sm:text-sm font-mono font-semibold text-[#FF5B37] print:text-black mt-0.5">
                {report.targetGrade}
              </div>
              <div className="text-[10px] text-zinc-500">Candidate Goal</div>
            </div>

            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 print:text-gray-500 font-medium">
                Projected Grade
              </div>
              <div className="text-xs sm:text-sm font-mono font-semibold text-emerald-400 print:text-black mt-0.5">
                {report.projectedGrade}
              </div>
              <div className="text-[10px] font-mono text-emerald-400/80">Readiness: {report.readinessIndex}%</div>
            </div>
          </div>

          {/* 3. Primary Academic KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-xl sm:text-3xl font-semibold text-[#FF5B37] print:text-black font-mono">
                {report.mockExamAverage}%
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Mock Exam Average
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Weighted Cambridge series
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-xl sm:text-3xl font-semibold text-emerald-400 print:text-black font-mono">
                {report.totalQuestionsSolved}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Questions Mastered
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Official past paper items
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-xl sm:text-3xl font-semibold text-amber-400 print:text-black font-mono flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                {report.studyStreakDays}d
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Active Study Streak
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Consistent daily revision
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#141416] border border-white/[0.08] text-center print:border-gray-300 print:bg-white">
              <div className="text-xl sm:text-3xl font-semibold text-rose-400 print:text-black font-mono">
                +{report.totalMarksRecovered}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-zinc-300 print:text-gray-700 mt-1">
                Recovered Marks
              </div>
              <div className="text-[10px] text-zinc-500 print:text-gray-500">
                Via Rematch Quizzes
              </div>
            </div>
          </div>

          {/* 4. Detailed Component Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-400 print:text-black flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF5B37] print:text-black" />
              Syllabus & Component Breakdown (P2, P4, P6)
            </h3>

            <div className="space-y-3">
              {report.subjects.map((sub) => (
                <div
                  key={sub.subjectId}
                  className="rounded-xl border border-white/[0.08] bg-[#141416] p-3.5 sm:p-4 print:border-gray-300 print:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5 print:border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[#FF5B37] print:text-black text-xs sm:text-sm">
                        {sub.subjectCode}
                      </span>
                      <span className="font-medium text-zinc-100 print:text-black text-xs sm:text-sm">
                        {sub.subjectName}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({sub.examBoard})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-medium text-zinc-300 print:text-black">
                        Overall: {sub.overallScore}%
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          sub.status === 'Mastered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {sub.status === 'Mastered' ? '✓ Grade 9 Track' : '⚠️ Practice Needed'}
                      </span>
                    </div>
                  </div>

                  {/* Components Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 pt-1">
                    {sub.components.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-lg bg-[#18181b] p-2 border border-white/[0.08] print:bg-gray-50 print:border-gray-200"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-zinc-300 print:text-black">
                            {c.componentCode} ({c.weightPercent}%)
                          </span>
                          <span className="font-mono font-medium text-[#FF5B37] print:text-black">
                            {c.scorePercent}%
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 print:text-gray-600 truncate mt-0.5">
                          {c.componentName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Diagnostic Error Analysis Heatmap */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-400 print:text-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 print:text-black" />
              Diagnostic Error Classification (From Mistake Notebook)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.mistakeBreakdown.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.08] bg-[#141416] p-3 flex items-center justify-between print:border-gray-300 print:bg-white"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-zinc-200 print:text-black block">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 print:text-gray-600">
                      Total Lost: {m.marksLost} marks ({m.count} questions)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-amber-400 print:text-black">
                    {m.percentage}% of slips
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Examiner Action Plan for Next 7 Days */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#141416] border border-white/[0.08] space-y-2.5 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#FF5B37] print:text-black">
              <FileCheck className="w-4 h-4 text-[#FF5B37] print:text-black" />
              Official Examiner Commentary & Next 7-Day Strategy
            </div>
            <p className="text-xs text-zinc-300 print:text-gray-700 leading-relaxed">
              {report.examinerCommentary}
            </p>

            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-medium text-zinc-200 print:text-black block mb-1">
                Priority Action Checklist:
              </span>
              <ul className="text-xs text-zinc-400 print:text-gray-700 space-y-1">
                {report.next7DayPriorities.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#FF5B37] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7. Verification Stamp & Footer */}
          <div className="pt-4 sm:pt-6 border-t border-white/[0.08] print:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 print:text-gray-600 gap-2 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>Electronically signed & verified via Fahemny IGCSE Assessment Engine</span>
            </div>
            <div className="text-[10px]">
              London • Cairo • Cambridge International Standards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
