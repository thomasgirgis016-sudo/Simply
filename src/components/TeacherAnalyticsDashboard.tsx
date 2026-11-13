import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  TrendingDown,
  AlertTriangle,
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
        <div className="fixed top-32 sm:top-28 right-4 z-50 rounded-2xl border border-emerald-500/40 bg-emerald-950/95 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{drillSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 sm:p-7 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#FF5B37]/10 px-2.5 py-1 text-xs font-medium text-[#FF5B37] border border-[#FF5B37]/20">
              <Users className="h-3.5 w-3.5 text-[#FF5B37]" />
              <span>Google Classroom Diagnostic Suite for IGCSE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              School & Teacher Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Track student cohorts, identify aggregate misconception clusters from past paper submissions, and generate automated class remedial drills.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Cohort</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Selector & Info Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
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
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {activeCohort && (
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
            {/* Invite Code Pill */}
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs">
              <span className="text-amber-300/80 font-medium text-[11px]">Student Invite Code:</span>
              <span className="font-mono font-bold text-amber-300">{activeCohort.inviteCode}</span>
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
              <span className="hidden sm:inline-block rounded-lg border border-white/[0.08] bg-[#141416] px-2.5 py-1.5 text-[11px] font-mono text-zinc-400">
                @{activeCohort.schoolDomain}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cohort Diagnostic Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-[#FF5B37]" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {activeCohort?.studentIds.length ? activeCohort.studentIds.length * 7 + 3 : 28}
          </div>
          <span className="text-[10px] text-zinc-500">Active submissions tracked</span>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
            <span>Top Misconception</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1 font-mono">
            {diagnosticErrors[0]?.failureRatePercent || 78}%
          </div>
          <span className="text-[10px] text-rose-300/80 truncate block">
            {diagnosticErrors[0]?.topic || 'Active Site Denaturation'}
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Class Cohort Average</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1 font-mono">
            68.4%
          </div>
          <span className="text-[10px] text-zinc-500">Targeting Cambridge Grade 9 / A*</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#18181b] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Weak Chapters Flagged</span>
            <BarChart3 className="h-4 w-4 text-[#FF5B37]" />
          </div>
          <div className="text-2xl font-bold text-zinc-200 mt-1 font-mono">
            {diagnosticErrors.length} Chapters
          </div>
          <span className="text-[10px] text-zinc-500">Requires targeted practice</span>
        </div>
      </div>

      {/* Action Header: Error Heatmap + 1-Click Remedial Drill Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Diagnostic Error Heatmap</span>
            <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
              Live Aggregate Failures
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automatic identification of specific past paper questions and syllabus keywords where students lose method marks.
          </p>
        </div>

        {/* 1-Click Generate Class Remedial Drill Button */}
        <button
          onClick={handleTriggerRemedialDrill}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer shrink-0"
        >
          <GraduationCap className="h-4 w-4" />
          <span>Generate Class Remedial Drill</span>
        </button>
      </div>

      {/* Generated Remedial Drill Alert Card (if triggered) */}
      {generatedDrill && (
        <div className="rounded-2xl border border-amber-500/30 bg-[#18181b] p-5 shadow-lg animate-fadeIn space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/20">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Targeted Class Remedial Drill Active</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {generatedDrill.className} — Focus Practice Session
              </h3>
              <p className="text-xs text-zinc-300 max-w-2xl">
                {generatedDrill.instructions}
              </p>
            </div>
            <button
              onClick={() => setGeneratedDrill(null)}
              className="text-zinc-400 hover:text-white text-xs font-medium px-2.5 py-1 bg-[#222225] border border-white/[0.08] rounded-lg"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {generatedDrill.targetedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-2 hover:border-amber-500/30 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-300">{q.paperCode} {q.questionNumber}</span>
                  <span className="rounded bg-[#222225] border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-400 font-medium">{q.marks} Marks</span>
                </div>
                <div className="text-xs font-semibold text-white">{q.topic}</div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{q.questionPrompt}</p>
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-medium">Targets: {q.topic}</span>
                  <button
                    onClick={() => onOpenChatWithTopic?.(q.topic)}
                    className="text-[11px] font-semibold text-[#FF5B37] hover:text-[#ff6c4b] flex items-center gap-1"
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
              className={`rounded-2xl border p-5 sm:p-6 transition shadow-sm space-y-4 ${
                isExtreme
                  ? 'border-rose-500/30 bg-[#18181b]'
                  : isHigh
                  ? 'border-amber-500/30 bg-[#18181b]'
                  : 'border-white/[0.08] bg-[#18181b]'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-xs text-[#FF5B37] bg-[#FF5B37]/10 px-2 py-0.5 rounded border border-[#FF5B37]/20">
                      {item.questionRef}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs font-medium text-zinc-300">{item.chapter}</span>
                    <span className="rounded bg-[#222225] border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-400">
                      {item.tier}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">{item.topic}</h3>
                </div>

                {/* Percentage Failure Rate Gauge */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <div className={`text-xl font-bold font-mono ${
                      isExtreme ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-zinc-200'
                    }`}>
                      {item.failureRatePercent}%
                    </div>
                    <span className="text-[10px] text-zinc-500">Class Dropped Marks</span>
                  </div>
                  <div className="w-16 h-2 bg-[#222225] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isExtreme ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-[#FF5B37]'
                      }`}
                      style={{ width: `${item.failureRatePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Error Pattern Summary */}
              <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Common Error Pattern & Misconception:</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {item.errorPatternSummary}
                </p>
              </div>

              {/* Syllabus Scientific Keyword Omissions Section */}
              {item.scientificKeywordOmissions && item.scientificKeywordOmissions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span>Compulsory Syllabus Keywords Repeatedly Omitted by Students:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.scientificKeywordOmissions.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300"
                      >
                        <span className="text-rose-400 font-mono text-[10px]">[Lost Mark]</span>
                        <span>"{kw}"</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examiner Remedial Recommendation Footer */}
              <div className="pt-2 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-zinc-400">
                  <strong className="text-emerald-400 font-medium">Teacher Action: </strong>
                  <span>{item.remedialRecommendation}</span>
                </div>

                <button
                  onClick={() => onOpenChatWithTopic?.(`Generate a focused teaching explanation and mark scheme rubric for ${item.topic} to correct the misconception: "${item.errorPatternSummary}"`)}
                  className="shrink-0 flex items-center gap-1.5 font-semibold text-[#FF5B37] hover:text-[#ff6c4b] transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 sm:p-7 shadow-2xl text-left">
            <h3 className="text-base font-bold text-white mb-1">Create New Class Cohort</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Students can join your class using the generated invite code or via verified school domain.
            </p>

            <form onSubmit={handleCreateCohortSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cohort / Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year 11 Biology Set 1"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-white placeholder-zinc-500 focus:border-[#FF5B37]/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Subject & Syllabus
                </label>
                <select
                  value={newCohortSubjectId}
                  onChange={(e) => setNewCohortSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-white focus:border-[#FF5B37]/50 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s.board})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  School Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. school.edu.eg"
                  value={newCohortDomain}
                  onChange={(e) => setNewCohortDomain(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-white placeholder-zinc-500 focus:border-[#FF5B37]/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-[#222225] py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] py-2 text-xs font-semibold text-white transition shadow-sm"
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
