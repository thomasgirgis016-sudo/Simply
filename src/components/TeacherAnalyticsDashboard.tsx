import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Plus,
  Send,
  FileText,
  Search,
  CheckCircle,
  HelpCircle,
  Award,
  Layers,
  BarChart3,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ClassroomCohort, DiagnosticErrorItem, ClassRemedialDrill, Subject, UserAccount } from '../types';
import {
  getCohorts,
  createCohort,
  getDiagnosticErrorsForCohort,
  generateClassRemedialDrill
} from '../services/teacherAnalytics';

interface TeacherAnalyticsDashboardProps {
  currentUser: UserAccount | null;
  subjects: Subject[];
  onOpenQuizWithDrill?: (questions: any[]) => void;
  onOpenChatWithTopic?: (topic: string) => void;
}

export const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsDashboardProps> = ({
  currentUser,
  subjects,
  onOpenQuizWithDrill,
  onOpenChatWithTopic
}) => {
  const [cohorts, setCohorts] = useState<ClassroomCohort[]>(() => getCohorts());
  const [selectedCohortId, setSelectedCohortId] = useState<string>(cohorts[0]?.id || 'cohort-bio-1');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Remedial drill state
  const [generatedDrill, setGeneratedDrill] = useState<ClassRemedialDrill | null>(null);
  const [drillSuccessToast, setDrillSuccessToast] = useState<string | null>(null);

  // Modal for new cohort
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortSubjectId, setNewCohortSubjectId] = useState(subjects[0]?.id || 'cie-math-0580');
  const [newCohortDomain, setNewCohortDomain] = useState('cairoschool.edu.eg');

  const activeCohort = cohorts.find(c => c.id === selectedCohortId) || cohorts[0];
  const diagnosticErrors = activeCohort ? getDiagnosticErrorsForCohort(activeCohort.id) : [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortName.trim()) return;

    const matchedSubject = subjects.find(s => s.id === newCohortSubjectId) || subjects[0];
    const created = createCohort({
      name: newCohortName.trim(),
      subjectId: matchedSubject.id,
      subjectCode: matchedSubject.code,
      subjectName: matchedSubject.name,
      teacherName: currentUser?.name || 'Lead Examiner',
      teacherEmail: currentUser?.email || 'teacher@simplyigcse.com',
      schoolDomain: newCohortDomain.trim()
    });

    setCohorts(getCohorts());
    setSelectedCohortId(created.id);
    setIsCreateModalOpen(false);
    setNewCohortName('');
  };

  const handleTriggerRemedialDrill = () => {
    if (!activeCohort) return;
    const drill = generateClassRemedialDrill(activeCohort);
    setGeneratedDrill(drill);
    setDrillSuccessToast(`Targeted Remedial Drill generated for ${activeCohort.name}!`);
    setTimeout(() => setDrillSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Toast */}
      {drillSuccessToast && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl border border-emerald-500/40 bg-emerald-950/95 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{drillSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Google Classroom Diagnostic Suite for IGCSE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              School & Teacher Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track student cohorts, identify aggregate misconception clusters from past paper submissions, and generate automated class remedial drills.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Cohort</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Selector & Info Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Class Cohort:
          </span>
          {cohorts.map((c) => {
            const isSelected = c.id === selectedCohortId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCohortId(c.id);
                  setGeneratedDrill(null);
                }}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400/40'
                    : 'border border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {activeCohort && (
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            {/* Invite Code Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs">
              <span className="text-amber-300/80 font-medium text-[11px]">Student Invite Code:</span>
              <span className="font-mono font-black text-amber-300">{activeCohort.inviteCode}</span>
              <button
                onClick={() => handleCopyCode(activeCohort.inviteCode)}
                className="p-1 rounded text-amber-400 hover:text-white hover:bg-amber-500/20 transition cursor-pointer"
                title="Copy student join code"
              >
                {copiedCode === activeCohort.inviteCode ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* School Domain */}
            {activeCohort.schoolDomain && (
              <span className="hidden sm:inline-block rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[11px] font-mono text-slate-400">
                @{activeCohort.schoolDomain}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cohort Diagnostic Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">
            {activeCohort?.studentIds.length ? activeCohort.studentIds.length * 7 + 3 : 28}
          </div>
          <span className="text-[10px] text-slate-500">Active submissions tracked</span>
        </div>

        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 shadow-md ring-1 ring-rose-500/20">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>Top Misconception</span>
            <Flame className="h-4 w-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-1 font-mono">
            {diagnosticErrors[0]?.failureRatePercent || 78}%
          </div>
          <span className="text-[10px] text-rose-300/80 truncate block">
            {diagnosticErrors[0]?.topic || 'Active Site Denaturation'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Class Cohort Average</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
            68.4%
          </div>
          <span className="text-[10px] text-slate-500">Targeting Cambridge Grade 9 / A*</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Weak Chapters Flagged</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1 font-mono">
            {diagnosticErrors.length} Chapters
          </div>
          <span className="text-[10px] text-slate-500">Requires targeted practice</span>
        </div>
      </div>

      {/* Action Header: Error Heatmap + 1-Click Remedial Drill Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>Diagnostic Error Heatmap</span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
              Live Aggregate Failures
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic identification of specific past paper questions and syllabus keywords where students lose method marks.
          </p>
        </div>

        {/* 1-Click Generate Class Remedial Drill Button */}
        <button
          onClick={handleTriggerRemedialDrill}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-amber-500/20 hover:opacity-95 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate Class Remedial Drill</span>
        </button>
      </div>

      {/* Generated Remedial Drill Alert Card (if triggered) */}
      {generatedDrill && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-amber-950/20 p-6 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Targeted Class Remedial Drill Active</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {generatedDrill.className} — Focus Practice Session
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                {generatedDrill.instructions}
              </p>
            </div>
            <button
              onClick={() => setGeneratedDrill(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {generatedDrill.targetedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 hover:border-amber-500/40 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-300">{q.paperCode} {q.questionNumber}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-semibold">{q.marks} Marks</span>
                </div>
                <div className="text-xs font-bold text-white">{q.topic}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{q.questionPrompt}</p>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold">Targets: {q.topic}</span>
                  <button
                    onClick={() => onOpenChatWithTopic?.(q.topic)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Remediate</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Error Heatmap Cards */}
      <div className="space-y-4">
        {diagnosticErrors.map((item) => {
          const isExtreme = item.failureRatePercent >= 70;
          const isHigh = item.failureRatePercent >= 60 && item.failureRatePercent < 70;

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 sm:p-6 transition shadow-xl space-y-4 ${
                isExtreme
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900'
                  : isHigh
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                      {item.questionRef}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">•</span>
                    <span className="text-xs font-semibold text-slate-300">{item.chapter}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                      {item.tier}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">{item.topic}</h3>
                </div>

                {/* Percentage Failure Rate Gauge */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <div className={`text-xl sm:text-2xl font-black font-mono ${
                      isExtreme ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-yellow-400'
                    }`}>
                      {item.failureRatePercent}%
                    </div>
                    <span className="text-[10px] text-slate-400">Class Dropped Marks</span>
                  </div>
                  <div className="w-16 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isExtreme ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${item.failureRatePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Error Pattern Summary */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Common Error Pattern & Misconception:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {item.errorPatternSummary}
                </p>
              </div>

              {/* Syllabus Scientific Keyword Omissions Section */}
              {item.scientificKeywordOmissions && item.scientificKeywordOmissions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span>Compulsory Syllabus Keywords Repeatedly Omitted by Students:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.scientificKeywordOmissions.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300"
                      >
                        <span className="text-rose-400 font-mono text-[10px]">[Lost Mark]</span>
                        <span>"{kw}"</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examiner Remedial Recommendation Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-400">
                  <strong className="text-emerald-400 font-semibold">Teacher Action: </strong>
                  <span>{item.remedialRecommendation}</span>
                </div>

                <button
                  onClick={() => onOpenChatWithTopic?.(`Generate a focused teaching explanation and mark scheme rubric for ${item.topic} to correct the misconception: "${item.errorPatternSummary}"`)}
                  className="shrink-0 flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  <span>Open Examiner Guidance</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Cohort Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl text-left">
            <h3 className="text-lg font-black text-white mb-2">Create New Class Cohort</h3>
            <p className="text-xs text-slate-400 mb-4">
              Students can join your class using the generated invite code or via verified school domain.
            </p>

            <form onSubmit={handleCreateCohortSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cohort / Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year 11 Biology Set 1"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject & Syllabus
                </label>
                <select
                  value={newCohortSubjectId}
                  onChange={(e) => setNewCohortSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s.board})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. school.edu.eg"
                  value={newCohortDomain}
                  onChange={(e) => setNewCohortDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
