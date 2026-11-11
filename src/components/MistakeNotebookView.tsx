import React, { useState, useMemo, useEffect } from 'react';
import {
  BookMarked,
  Plus,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ChevronRight,
  Printer,
  X,
  Target,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Subject, UserProfile, MistakeItem, MistakeReason } from '../types';
import {
  getMistakeNotebook,
  saveMistakeNotebook,
  addMistakeItem,
  markMistakeMastered,
  deleteMistakeItem,
  getReasonMetadata
} from '../services/mistakeNotebook';
import { MathRenderer } from './MathRenderer';

interface MistakeNotebookViewProps {
  subjects: Subject[];
  profile: UserProfile;
  activeSubject?: Subject;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  subjects,
  profile,
  activeSubject,
}) => {
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => getMistakeNotebook());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'mastered'>('unresolved');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Interactive States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRematchMode, setIsRematchMode] = useState(false);
  const [rematchIndex, setRematchIndex] = useState(0);
  const [rematchShowAnswer, setRematchShowAnswer] = useState(false);
  const [rematchStudentInput, setRematchStudentInput] = useState('');

  // Form State for Adding New Mistake - initialized with active subject
  const [newSubjectCode, setNewSubjectCode] = useState(activeSubject?.code || subjects[0]?.code || '0580');

  // Synchronize newSubjectCode if activeSubject changes
  useEffect(() => {
    if (activeSubject?.code) {
      setNewSubjectCode(activeSubject.code);
    }
  }, [activeSubject?.code]);

  const handleOpenAddModal = () => {
    if (activeSubject?.code) {
      setNewSubjectCode(activeSubject.code);
    }
    setIsAddModalOpen(true);
  };
  const [newTopic, setNewTopic] = useState('');
  const [newPaperCode, setNewPaperCode] = useState('');
  const [newQuestionNum, setNewQuestionNum] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newMyAnswer, setNewMyAnswer] = useState('');
  const [newMarkScheme, setNewMarkScheme] = useState('');
  const [newExaminerTip, setNewExaminerTip] = useState('');
  const [newReason, setNewReason] = useState<MistakeReason>('careless_math');
  const [newMarksLost, setNewMarksLost] = useState<number>(2);
  const [newTotalMarks, setNewTotalMarks] = useState<number>(3);

  // Sync listener
  useEffect(() => {
    const handleUpdate = (e: any) => {
      setMistakes(e.detail || getMistakeNotebook());
    };
    window.addEventListener('simply_mistakes_updated', handleUpdate);
    return () => window.removeEventListener('simply_mistakes_updated', handleUpdate);
  }, []);

  // Filtered mistakes
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      const matchSubject =
        selectedSubjectId === 'all' ||
        m.subjectId === selectedSubjectId ||
        m.subjectCode === selectedSubjectId;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unresolved' && !m.isMastered) ||
        (statusFilter === 'mastered' && m.isMastered);

      const matchReason =
        reasonFilter === 'all' || m.reason === reasonFilter;

      const matchSearch =
        !searchQuery.trim() ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.questionPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.paperCode && m.paperCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.markSchemeAnswer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSubject && matchStatus && matchReason && matchSearch;
    });
  }, [mistakes, selectedSubjectId, statusFilter, reasonFilter, searchQuery]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.isMastered).length;
    const unresolved = total - mastered;
    const recoverableMarks = mistakes
      .filter((m) => !m.isMastered)
      .reduce((sum, m) => sum + (m.marksLost || 0), 0);

    const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, unresolved, recoverableMarks, masteryPercent };
  }, [mistakes]);

  // Unresolved list for rematch mode
  const rematchPool = useMemo(() => {
    return filteredMistakes.filter((m) => !m.isMastered);
  }, [filteredMistakes]);

  const handleStartRematch = () => {
    if (rematchPool.length === 0) return;
    setRematchIndex(0);
    setRematchShowAnswer(false);
    setRematchStudentInput('');
    setIsRematchMode(true);
  };

  const handleRematchNext = (markAsMastered: boolean) => {
    const currentQuestion = rematchPool[rematchIndex];
    if (currentQuestion && markAsMastered) {
      markMistakeMastered(currentQuestion.id, true);
    }
    if (rematchIndex < rematchPool.length - 1) {
      setRematchIndex(rematchIndex + 1);
      setRematchShowAnswer(false);
      setRematchStudentInput('');
    } else {
      setIsRematchMode(false);
    }
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newMarkScheme.trim()) return;

    const matchedSubject = subjects.find((s) => s.code === newSubjectCode) || subjects[0];

    addMistakeItem({
      subjectId: matchedSubject ? matchedSubject.id : 'sub-custom',
      subjectCode: newSubjectCode,
      topic: newTopic.trim() || 'General Chapter',
      paperCode: newPaperCode.trim() || undefined,
      questionNumber: newQuestionNum.trim() || undefined,
      questionPrompt: newPrompt.trim(),
      myMistakeAnswer: newMyAnswer.trim() || 'Miscalculated without final check',
      markSchemeAnswer: newMarkScheme.trim(),
      examinerTip: newExaminerTip.trim() || undefined,
      reason: newReason,
      marksLost: Number(newMarksLost) || 1,
      totalMarks: Number(newTotalMarks) || 2,
    });

    // Reset Form
    setNewPrompt('');
    setNewMyAnswer('');
    setNewMarkScheme('');
    setNewExaminerTip('');
    setNewTopic('');
    setNewPaperCode('');
    setNewQuestionNum('');
    setIsAddModalOpen(false);
  };

  const activeRematchQuestion = rematchPool[rematchIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-[#18181B] p-4 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5B37]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#FF5B37] border border-[#FF5B37]/20">
                <BookMarked className="h-3.5 w-3.5 text-[#FF5B37]" />
                <span>Personal Error &amp; Mistake Log</span>
              </span>
              <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] sm:text-xs font-medium text-zinc-300 border border-white/[0.08] font-mono">
                Grade 9 Recovery System
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Personal Error Notebook &amp; Rematch Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed hidden sm:block">
              Top Cambridge candidates never repeat the same error twice. Log every question you lost marks on, diagnose the exact reason, and replay them in <strong className="text-zinc-200">Rematch Mode</strong> until 100% mastered.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleStartRematch}
              disabled={rematchPool.length === 0}
              className={`flex-1 sm:flex-initial rounded-xl sm:rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                rematchPool.length > 0
                  ? 'bg-[#FF5B37] hover:bg-[#e04825] text-white'
                  : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
              <span>Rematch ({rematchPool.length})</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex-1 sm:flex-initial rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#1E1E22] hover:bg-white/[0.08] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FF5B37]" />
              <span>Log Mistake</span>
            </button>

            <button
              onClick={() => window.print()}
              className="hidden sm:flex rounded-2xl border border-white/[0.08] bg-[#1E1E22] hover:bg-white/[0.08] p-3 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Print Mistake Log for Revision"
            >
              <Printer className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* 2. Key Analytics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3.5 sm:pt-6 mt-3.5 sm:mt-6 border-t border-white/[0.06]">
          <div className="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#111113] p-2.5 sm:p-3.5 text-center">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Logged</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-zinc-100 mt-0.5">{stats.total}</div>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 hidden sm:block">Historical slips</span>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#111113] p-2.5 sm:p-3.5 text-center">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-[#FF5B37]">Unresolved Slips</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-[#FF5B37] mt-0.5">{stats.unresolved}</div>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 hidden sm:block">Needs rematch</span>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#111113] p-2.5 sm:p-3.5 text-center">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-emerald-400">Mastered</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-300 mt-0.5">{stats.mastered}</div>
            <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-medium">{stats.masteryPercent}% Mastery</span>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/[0.06] bg-[#111113] p-2.5 sm:p-3.5 text-center">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-amber-400">Recoverable</span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-amber-300 mt-0.5">+{stats.recoverableMarks}</div>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 hidden sm:block">Boost to Grade 9</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#18181B] p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistakes by topic, paper code (e.g. 0580/42), or prompt keyword..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#111113] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#FF5B37] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#111113] p-1 self-start sm:self-auto shrink-0">
            {(['unresolved', 'mastered', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer capitalize ${
                  statusFilter === tab
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab === 'unresolved' ? `Unresolved (${stats.unresolved})` : tab === 'mastered' ? `Mastered (${stats.mastered})` : `All (${stats.total})`}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-medium text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Error Reason:
          </span>
          {[
            { id: 'all', label: 'All Reasons' },
            { id: 'careless_math', label: 'Careless Arithmetic (±)' },
            { id: 'misread_command', label: 'Misread Command (⚠️)' },
            { id: 'formula_forgotten', label: 'Formula Slip (📐)' },
            { id: 'unit_confusion', label: 'Unit Trap (📏)' },
            { id: 'concept_gap', label: 'Concept Gap (🧠)' },
            { id: 'time_pressure', label: 'Time Pressure (⏱️)' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setReasonFilter(pill.id)}
              className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                reasonFilter === pill.id
                  ? 'bg-[#FF5B37] text-white'
                  : 'bg-white/[0.03] text-zinc-300 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Active Mistake Cards Grid */}
      {filteredMistakes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#18181b] p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#141416] text-white/40 border border-white/[0.06]">
            <BookMarked className="h-6 w-6 text-white/40" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No mistakes found</h3>
            <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
              {statusFilter === 'unresolved'
                ? 'Terrific job! You have no unresolved mistakes under this filter. Keep completing past paper questions!'
                : 'No mistake logs match your active filters or search terms.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-4 py-2 text-xs font-medium text-white shadow-sm transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Log a Mistake Manually</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((mistake) => {
            const meta = getReasonMetadata(mistake.reason);

            return (
              <div
                key={mistake.id}
                className={`rounded-xl border p-5 transition shadow-sm relative ${
                  mistake.isMastered
                    ? 'border-[#4cc38a]/20 bg-[#18181b]/70 opacity-90'
                    : 'border-white/[0.06] bg-[#18181b] hover:border-white/[0.12]'
                }`}
              >
                {/* Card Top: Badges & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[#222225] px-2 py-0.5 text-xs font-mono font-medium text-white/80 border border-white/[0.08]">
                      {mistake.subjectCode}
                    </span>
                    {mistake.paperCode && (
                      <span className="rounded-md bg-[#141416] px-2 py-0.5 text-[11px] font-mono text-white/60 border border-white/[0.06]">
                        {mistake.paperCode} {mistake.questionNumber && `• ${mistake.questionNumber}`}
                      </span>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${meta.color}`}>
                      {meta.iconText} {meta.label}
                    </span>
                    <span className="text-xs font-medium text-white/80">
                      {mistake.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-mono font-semibold text-[#FF5B37] bg-[#FF5B37]/10 px-2 py-0.5 rounded border border-[#FF5B37]/20 tabular-nums">
                      Lost: -{mistake.marksLost} / {mistake.totalMarks} Marks
                    </span>

                    <button
                      onClick={() => markMistakeMastered(mistake.id, !mistake.isMastered)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        mistake.isMastered
                          ? 'bg-[#4cc38a]/15 text-[#4cc38a] border border-[#4cc38a]/30 hover:bg-[#4cc38a]/25'
                          : 'bg-[#141416] text-white/70 border border-white/[0.08] hover:text-white hover:bg-[#222225]'
                      }`}
                    >
                      <CheckCircle className={`h-3.5 w-3.5 ${mistake.isMastered ? 'text-[#4cc38a]' : 'text-white/40'}`} />
                      <span>{mistake.isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>

                    <button
                      onClick={() => deleteMistakeItem(mistake.id)}
                      className="rounded-lg p-1 text-white/40 hover:text-[#e5484d] hover:bg-[#e5484d]/10 transition cursor-pointer"
                      title="Delete from log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="rounded-lg bg-[#141416] p-3.5 text-xs sm:text-sm text-white/90 border border-white/[0.06] font-sans leading-relaxed mb-3">
                  <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-white/40 mb-1">
                    Question Prompt:
                  </div>
                  <MathRenderer content={mistake.questionPrompt} />
                </div>

                {/* Side-by-Side: What I Wrote vs Official Mark Scheme */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg border border-[#e5484d]/20 bg-[#e5484d]/[0.03] p-3">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#e5484d] flex items-center gap-1 mb-1">
                      <span>Past Slip / What I Wrote:</span>
                    </div>
                    <div className="text-xs text-[#e5484d] leading-relaxed font-mono">
                      <MathRenderer content={mistake.myMistakeAnswer} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#4cc38a]/20 bg-[#4cc38a]/[0.03] p-3">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4cc38a] flex items-center gap-1 mb-1">
                      <span>Official Mark Scheme Solution:</span>
                    </div>
                    <div className="text-xs text-[#4cc38a] leading-relaxed font-mono">
                      <MathRenderer content={mistake.markSchemeAnswer} />
                    </div>
                  </div>
                </div>

                {/* Examiner Report Warning / Advice */}
                {mistake.examinerTip && (
                  <div className="rounded-lg border border-white/[0.06] bg-[#141416] p-2.5 flex items-start gap-2 text-xs text-white/80">
                    <AlertTriangle className="h-4 w-4 text-[#FF5B37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-medium block mb-0.5 font-mono">Examiner Insight:</strong>
                      <span className="font-sans text-white/70">{mistake.examinerTip}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Rematch Mode Modal Overlay */}
      {isRematchMode && activeRematchQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl p-6 sm:p-8 space-y-5 text-white/90">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5B37]/10 text-[#FF5B37] border border-[#FF5B37]/20">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Rematch Sprint ({rematchIndex + 1} of {rematchPool.length})
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    {activeRematchQuestion.subjectCode} • {activeRematchQuestion.topic} ({activeRematchQuestion.paperCode || 'Practice'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRematchMode(false)}
                className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-[#222225] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Question Display */}
            <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4 space-y-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#FF5B37]">
                Solve this problem again:
              </span>
              <div className="text-sm sm:text-base text-white leading-relaxed font-sans">
                <MathRenderer content={activeRematchQuestion.questionPrompt} />
              </div>
            </div>

            {/* Student Working / Answer Area */}
            {!rematchShowAnswer ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-white/70 block">
                  Your New Method & Final Answer:
                </label>
                <textarea
                  rows={3}
                  value={rematchStudentInput}
                  onChange={(e) => setRematchStudentInput(e.target.value)}
                  placeholder="Type your working or final answer here to verify..."
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-3 text-xs sm:text-sm font-mono text-white placeholder-white/30 focus:border-[#FF5B37] focus:outline-none"
                />
                <button
                  onClick={() => setRematchShowAnswer(true)}
                  className="w-full rounded-lg bg-[#FF5B37] hover:bg-[#F97316] py-3 text-xs sm:text-sm font-medium text-white shadow-sm transition cursor-pointer"
                >
                  Reveal Mark Scheme & Check My Solution
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* Comparison Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#e5484d]/30 bg-[#e5484d]/[0.04] p-3 text-xs">
                    <span className="text-[10px] font-mono font-semibold text-[#e5484d] uppercase tracking-wider block mb-1">
                      Your Previous Error:
                    </span>
                    <div className="text-[#e5484d] font-mono">
                      <MathRenderer content={activeRematchQuestion.myMistakeAnswer} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#4cc38a]/30 bg-[#4cc38a]/[0.04] p-3 text-xs">
                    <span className="text-[10px] font-mono font-semibold text-[#4cc38a] uppercase tracking-wider block mb-1">
                      Official Mark Scheme Steps:
                    </span>
                    <div className="text-[#4cc38a] font-mono">
                      <MathRenderer content={activeRematchQuestion.markSchemeAnswer} />
                    </div>
                  </div>
                </div>

                {activeRematchQuestion.examinerTip && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs text-amber-200/90">
                    <strong className="text-amber-300 block mb-0.5 font-mono">Examiner Advice:</strong>
                    <span className="font-sans">{activeRematchQuestion.examinerTip}</span>
                  </div>
                )}

                {/* Mastery Verdict */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleRematchNext(false)}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-[#141416] py-2.5 text-xs font-medium text-white/70 hover:text-white hover:bg-[#222225] transition cursor-pointer"
                  >
                    Still Needs Work (Keep Unresolved)
                  </button>

                  <button
                    onClick={() => handleRematchNext(true)}
                    className="flex-1 rounded-lg bg-[#4cc38a] hover:bg-[#3fb07a] py-2.5 text-xs font-semibold text-slate-950 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Got It Right! Mark Mastered (+25 XP)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Add New Mistake Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl p-6 sm:p-7 space-y-4 text-white/90">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5B37]/10 text-[#FF5B37] border border-[#FF5B37]/20">
                  <Plus className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-white">Log a Question to Error Log</h3>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-[#222225] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-medium text-white/70 block mb-1">Subject</label>
                  <select
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-white/70 block mb-1">Paper Code (Optional)</label>
                  <input
                    type="text"
                    value={newPaperCode}
                    onChange={(e) => setNewPaperCode(e.target.value)}
                    placeholder="e.g. 0580/42/M/J/23"
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-medium text-white/70 block mb-1">Question & Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Q4(b) - Bearings"
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-white/70 block mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Paste the question statement (KaTeX formulas supported, e.g. $2x + 3 = 11$)..."
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-medium text-[#e5484d] block mb-1 font-mono">What I Wrote / My Error *</label>
                  <textarea
                    rows={2}
                    required
                    value={newMyAnswer}
                    onChange={(e) => setNewMyAnswer(e.target.value)}
                    placeholder="e.g. Forgot to convert to seconds, wrote 15 instead of 900..."
                    className="w-full rounded-lg border border-[#e5484d]/30 bg-[#141416] p-2.5 text-xs text-[#e5484d] focus:border-[#e5484d] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#4cc38a] block mb-1 font-mono">Official Mark Scheme Solution *</label>
                  <textarea
                    rows={2}
                    required
                    value={newMarkScheme}
                    onChange={(e) => setNewMarkScheme(e.target.value)}
                    placeholder="e.g. 900 J (M1 for 15 x 60, A1 for 900)..."
                    className="w-full rounded-lg border border-[#4cc38a]/30 bg-[#141416] p-2.5 text-xs text-[#4cc38a] focus:border-[#4cc38a] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-medium text-white/70 block mb-1">Primary Error Reason</label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value as MistakeReason)}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                  >
                    <option value="careless_math">Careless Arithmetic / Sign Slip</option>
                    <option value="misread_command">Misread Command / Question Trap</option>
                    <option value="formula_forgotten">Formula / Theorem Slip</option>
                    <option value="unit_confusion">Unit Conversion Trap</option>
                    <option value="concept_gap">Syllabus Concept Gap</option>
                    <option value="time_pressure">Time Pressure / Rushed</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-white/70 block mb-1">Marks Lost</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newMarksLost}
                    onChange={(e) => setNewMarksLost(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-white/70 block mb-1">Total Question Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-white/70 block mb-1">Examiner Advice (Optional)</label>
                <input
                  type="text"
                  value={newExaminerTip}
                  onChange={(e) => setNewExaminerTip(e.target.value)}
                  placeholder="e.g. Always check if the question says 'Give your answer in standard form'..."
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white focus:border-[#FF5B37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-white/[0.08] bg-[#141416] px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-[#222225] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-5 py-2 text-xs font-medium text-white shadow-sm transition cursor-pointer"
                >
                  Save to Error Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
