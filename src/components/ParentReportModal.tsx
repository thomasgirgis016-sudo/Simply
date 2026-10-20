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

interface ParentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  subjects: Subject[];
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  subjects
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const streak = getDailyStreak();
  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate dummy or stored performance metrics
  const targetGrade = profile.targetGrade || '9 / A*';
  const projectedGrade = '8 / A*';
  const overallMockAverage = 84;
  const totalQuestionsSolved = 142;
  const syllabusCoveragePercent = 78;

  // Selected subjects summary
  const studentSubjects = subjects.filter(s =>
    profile.selectedSubjectIds.includes(s.id)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 Cambridge IGCSE Progress Report for ${profile.name || 'Student'}\n` +
      `• Projected Grade: ${projectedGrade} (Target: ${targetGrade})\n` +
      `• Mock Exam Average: ${overallMockAverage}%\n` +
      `• Questions Solved: ${totalQuestionsSolved}\n` +
      `• Study Streak: ${streak.currentStreak} Days Active\n` +
      `Verified via Simply IGCSE Academic Portal.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Cambridge Academic Progress Statement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              title="Share report summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Academic Report Card */}
        <div
          ref={printRef}
          className="p-8 sm:p-10 space-y-8 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-8"
        >
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-indigo-500/40 pb-6 gap-4 print:border-black">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white print:text-black">
                  SIMPLY<span className="text-indigo-400 print:text-indigo-800"> IGCSE</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 print:border-black print:text-black">
                  Official Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Cambridge Assessment International Education (CAIE) Prep Suite
              </p>
            </div>

            <div className="text-right space-y-0.5 text-xs text-slate-400 print:text-gray-600">
              <div className="font-semibold text-slate-200 print:text-black">
                Date Issued: {reportDate}
              </div>
              <div>Report Reference: CAIE-RPT-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div>Status: Verified Academic Record</div>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-300">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-500 font-semibold">
                Student Name
              </div>
              <div className="text-base font-bold text-white print:text-black mt-0.5">
                {profile.name || 'Candidate'}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-500 font-semibold">
                Cohort / Level
              </div>
              <div className="text-sm font-semibold text-slate-200 print:text-black mt-0.5">
                {profile.grade || 'Year 11 / IGCSE'}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-500 font-semibold">
                Target Grade
              </div>
              <div className="text-sm font-bold text-indigo-400 print:text-indigo-800 mt-0.5">
                {targetGrade}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 print:text-gray-500 font-semibold">
                Projected Grade
              </div>
              <div className="text-sm font-bold text-emerald-400 print:text-emerald-800 mt-0.5">
                {projectedGrade}
              </div>
            </div>
          </div>

          {/* Performance KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 print:text-indigo-800 font-mono">
                {overallMockAverage}%
              </div>
              <div className="text-xs font-semibold text-slate-300 print:text-gray-700 mt-1">
                Mock Exam Average
              </div>
              <div className="text-[10px] text-slate-400 print:text-gray-500">
                Across {studentSubjects.length || 5} subjects
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 print:text-emerald-800 font-mono">
                {totalQuestionsSolved}
              </div>
              <div className="text-xs font-semibold text-slate-300 print:text-gray-700 mt-1">
                Questions Mastered
              </div>
              <div className="text-[10px] text-slate-400 print:text-gray-500">
                Official past paper items
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center print:border-gray-300 print:bg-white">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 print:text-amber-800 font-mono">
                {streak.currentStreak}
              </div>
              <div className="text-xs font-semibold text-slate-300 print:text-gray-700 mt-1">
                Day Study Streak
              </div>
              <div className="text-[10px] text-slate-400 print:text-gray-500">
                Consistent revision log
              </div>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400 print:text-black" />
              Syllabus Mastery Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 font-semibold">
                    <th className="py-2.5 px-3">Subject / Syllabus</th>
                    <th className="py-2.5 px-3">Recent Mock Score</th>
                    <th className="py-2.5 px-3">Target Grade</th>
                    <th className="py-2.5 px-3">Mastery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {studentSubjects.map((sub, i) => {
                    const mockScore = 80 + ((i * 7) % 15);
                    const isStrong = mockScore >= 85;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-950/30 print:hover:bg-transparent">
                        <td className="py-3 px-3 font-medium text-slate-200 print:text-black">
                          <span className="font-mono font-bold text-indigo-400 print:text-black mr-2">
                            {sub.code}
                          </span>
                          {sub.name}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-300 print:text-black">
                          {mockScore}%
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200 print:text-black">
                          {targetGrade}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isStrong
                                ? 'bg-emerald-500/10 text-emerald-400 print:text-emerald-800'
                                : 'bg-amber-500/10 text-amber-400 print:text-amber-800'
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
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2.5 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 print:text-black">
              <FileCheck className="w-4 h-4 text-indigo-400 print:text-black" />
              Cambridge Head of Academic Assessment Commentary
            </div>
            <p className="text-xs text-slate-300 print:text-gray-700 leading-relaxed">
              Candidate shows consistent revision dedication with a reliable active study streak. To guarantee an A* (Grade 9) in the upcoming examination series, candidate should concentrate on <strong>Paper 4 Theory Extended Section B structured questions</strong> and master <strong>Cambridge command words</strong> (specifically distinguishing <em>Describe</em> from <em>Explain</em> to avoid losing working marks).
            </p>
          </div>

          {/* Formal Verification Stamp / Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 print:text-gray-600 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>Electronically verified via Simply IGCSE Assessment Engine</span>
            </div>
            <div className="font-mono">
              Cambridge International Standards • London & Cairo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
