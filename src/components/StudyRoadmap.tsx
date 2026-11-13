import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  Target,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface ExamDateEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  paperName: string;
  examDate: string; // YYYY-MM-DD
  targetGrade: string;
}

interface DailyTask {
  id: string;
  dayNumber: number;
  dateStr: string;
  subjectCode: string;
  title: string;
  category: 'past-paper' | 'flashcards' | 'weak-spot' | 'atp-practical' | 'mock-drill';
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'normal';
}

interface StudyRoadmapProps {
  subjects: Subject[];
  profile: UserProfile;
  onNavigateToTab?: (tab: any, params?: any) => void;
}

const DEFAULT_EXAMS: ExamDateEntry[] = [
  {
    id: 'exam-1',
    subjectCode: '0580',
    subjectName: 'Cambridge IGCSE Mathematics',
    paperName: 'Paper 4 (Extended Theory)',
    examDate: '2025-05-08',
    targetGrade: '9 / A*'
  },
  {
    id: 'exam-2',
    subjectCode: '0625',
    subjectName: 'Cambridge IGCSE Physics',
    paperName: 'Paper 4 (Theory Extended)',
    examDate: '2025-05-14',
    targetGrade: '9 / A*'
  },
  {
    id: 'exam-3',
    subjectCode: '0620',
    subjectName: 'Cambridge IGCSE Chemistry',
    paperName: 'Paper 4 (Theory Extended)',
    examDate: '2025-05-19',
    targetGrade: '9 / A*'
  },
  {
    id: 'exam-4',
    subjectCode: '0610',
    subjectName: 'Cambridge IGCSE Biology',
    paperName: 'Paper 4 (Theory Extended)',
    examDate: '2025-05-22',
    targetGrade: '9 / A*'
  },
  {
    id: 'exam-5',
    subjectCode: '0510',
    subjectName: 'Cambridge IGCSE English as a Second Language',
    paperName: 'Paper 2 (Reading & Writing)',
    examDate: '2025-05-05',
    targetGrade: '8 / A*'
  }
];

export const StudyRoadmap: React.FC<StudyRoadmapProps> = ({
  subjects,
  profile,
  onNavigateToTab
}) => {
  // 1. Saved Exam Timetable
  const [exams, setExams] = useState<ExamDateEntry[]>(() => {
    try {
      const saved = localStorage.getItem('simply_exam_timetable');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXAMS;
  });

  // 2. Saved Daily Checklist Roadmap
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem('simply_daily_roadmap_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateDefaultRoadmapTasks(DEFAULT_EXAMS);
  });

  // Filter state for tasks
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Form state for adding an exam
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newSubjectCode, setNewSubjectCode] = useState('0580');
  const [newPaperName, setNewPaperName] = useState('Paper 2 (Extended)');
  const [newDate, setNewDate] = useState('');
  const [newTarget, setNewTarget] = useState<string>(profile.targetGrade || '9 / A*');

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('simply_exam_timetable', JSON.stringify(exams));
    } catch (e) {
      console.error(e);
    }
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem('simply_daily_roadmap_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Calculate days remaining helper
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examD = new Date(dateString);
    examD.setHours(0, 0, 0, 0);
    const diffMs = examD.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Toggle task complete
  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Add exam
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    const subObj = subjects.find(s => s.code === newSubjectCode);
    const newEntry: ExamDateEntry = {
      id: `exam-${Date.now()}`,
      subjectCode: newSubjectCode,
      subjectName: subObj ? subObj.name : `Syllabus ${newSubjectCode}`,
      paperName: newPaperName,
      examDate: newDate,
      targetGrade: newTarget
    };
    const updatedExams = [...exams, newEntry].sort((a, b) =>
      a.examDate.localeCompare(b.examDate)
    );
    setExams(updatedExams);
    setIsAddingExam(false);
    setNewDate('');
  };

  // Remove exam
  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  // Regenerate dynamic 14-day intensive roadmap from active exams
  const handleRegenerateRoadmap = () => {
    const freshTasks = generateDefaultRoadmapTasks(exams);
    setTasks(freshTasks);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'pending' && task.completed) return false;
    if (selectedFilter === 'completed' && !task.completed) return false;
    if (selectedSubjectFilter !== 'all' && task.subjectCode !== selectedSubjectFilter) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Closest upcoming exam
  const sortedExams = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  const upcomingExams = sortedExams.filter(e => getDaysRemaining(e.examDate) >= 0);
  const closestExam = upcomingExams[0];
  const closestDays = closestExam ? getDaysRemaining(closestExam.examDate) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#18181b] border border-white/[0.08] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FF5B37]/10 border border-[#FF5B37]/20 text-[#FF5B37] text-xs font-mono font-medium tracking-wide uppercase">
              <Calendar className="w-3.5 h-3.5 text-[#FF5B37]" />
              Cambridge Exam Countdown &amp; Revision Planner
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Personalized Cambridge Study Roadmap
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track your registered examination dates and follow a structured daily milestone checklist calibrated to your target grades.
            </p>
          </div>

          {/* Quick Stat Pill */}
          {closestExam && (
            <div className="bg-[#141416] border border-white/[0.08] rounded-xl p-4 sm:p-4.5 flex items-center gap-4 shadow-sm shrink-0">
              <div className="w-12 h-12 rounded-lg bg-white/[0.06] border border-white/[0.08] flex flex-col items-center justify-center text-white">
                <span className="text-xl font-semibold font-mono tabular-nums leading-none">{closestDays}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mt-0.5">Days</span>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#FF5B37] font-medium uppercase tracking-wider">
                  Next Official Exam
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {closestExam.subjectCode} • {closestExam.paperName}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {closestExam.examDate}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Left Column (Exams & Countdown Clocks) | Right Column (Daily Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Exam Timetable (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#18181b] rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF5B37]" />
                  Official Exam Timetable
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {exams.length} papers entered • Live countdown
                </p>
              </div>
              <button
                onClick={() => setIsAddingExam(!isAddingExam)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Paper
              </button>
            </div>

            {/* Add Exam Modal / Form Dropdown */}
            {isAddingExam && (
              <form
                onSubmit={handleAddExam}
                className="bg-[#141416] border border-white/[0.08] rounded-xl p-4 space-y-3 animate-fadeIn"
              >
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                  Add Official Paper Date
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Select Subject
                  </label>
                  <select
                    value={newSubjectCode}
                    onChange={e => setNewSubjectCode(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/[0.08] text-zinc-200 text-xs rounded-lg p-2 focus:border-[#FF5B37] focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    value={newPaperName}
                    onChange={e => setNewPaperName(e.target.value)}
                    placeholder="e.g. Paper 4 (Extended Theory)"
                    className="w-full bg-[#18181b] border border-white/[0.08] text-zinc-200 text-xs rounded-lg p-2 focus:border-[#FF5B37] focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/[0.08] text-zinc-200 text-xs rounded-lg p-2 focus:border-[#FF5B37] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">
                      Target Grade
                    </label>
                    <select
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/[0.08] text-zinc-200 text-xs rounded-lg p-2 focus:border-[#FF5B37] focus:outline-none font-mono"
                    >
                      <option value="9 / A*">9 / A*</option>
                      <option value="8 / A*">8 / A*</option>
                      <option value="7 / A">7 / A</option>
                      <option value="6 / B">6 / B</option>
                      <option value="5 / C">5 / C</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingExam(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#FF5B37] hover:bg-[#F97316] text-white rounded-lg cursor-pointer transition"
                  >
                    Save Paper
                  </button>
                </div>
              </form>
            )}

            {/* List of Exams with Clocks */}
            <div className="space-y-2.5">
              {sortedExams.map(item => {
                const days = getDaysRemaining(item.examDate);
                const isUrgent = days >= 0 && days <= 14;
                const isPast = days < 0;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isPast
                        ? 'bg-[#141416]/50 border-white/[0.04] opacity-50'
                        : isUrgent
                        ? 'bg-[#141416] border-amber-500/30'
                        : 'bg-[#141416] border-white/[0.08] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-200">
                            {item.subjectCode}
                          </span>
                          <span className="text-xs text-zinc-400 truncate max-w-[180px]">
                            {item.subjectName}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-white">{item.paperName}</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{item.examDate}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-[#4cc38a] font-medium">Target: {item.targetGrade}</span>
                        </div>
                      </div>

                      {/* Right: Days badge & delete */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`px-2.5 py-1 rounded-lg border text-center font-mono ${
                            isPast
                              ? 'bg-white/[0.04] border-white/[0.06] text-zinc-500 text-xs'
                              : isUrgent
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold'
                              : 'bg-white/[0.06] border-white/[0.08] text-zinc-200 font-semibold'
                          }`}
                        >
                          <div className="text-sm font-semibold tabular-nums leading-none">
                            {isPast ? 'Done' : days}
                          </div>
                          {!isPast && (
                            <div className="text-[8px] uppercase tracking-wider text-zinc-400 mt-0.5">
                              {days === 1 ? 'day' : 'days'}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteExam(item.id)}
                          className="text-zinc-500 hover:text-[#e5484d] p-1 transition-colors cursor-pointer"
                          title="Remove exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revision Strategy Card */}
          <div className="bg-[#18181b] border border-white/[0.08] rounded-xl p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold uppercase tracking-wider font-mono">
              <Award className="w-4 h-4 text-[#FF5B37]" />
              Cambridge Examiner Revision Rule
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200 font-medium">The 3-Pass Rule:</strong> Candidates who review official mark scheme rubrics before sitting timed papers gain an average of +12% in method marks. Pair 15 minutes of flashcards with 1 focused question paper drill daily.
            </p>
          </div>
        </div>

        {/* Right Column: Daily Adaptive Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#18181b] rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" />
                  Daily Milestone Checklist
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete these high-yield revision blocks each day for syllabus readiness.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateRoadmap}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141416] hover:bg-white/[0.06] text-zinc-300 flex items-center gap-1.5 border border-white/[0.08] transition cursor-pointer"
                  title="Recalculate tasks based on active exam dates"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-[#141416] rounded-xl p-4 border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">
                  Overall Completion Rate ({completedCount} of {tasks.length} tasks)
                </span>
                <span className="font-mono font-semibold text-[#4cc38a] tabular-nums">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="bg-[#4cc38a] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-lg border border-white/[0.08]">
                {(['all', 'pending', 'completed'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setSelectedFilter(tabKey)}
                    className={`px-3 py-1 rounded-md capitalize transition font-medium cursor-pointer ${
                      selectedFilter === tabKey
                        ? 'bg-white/[0.12] text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>

              {/* Subject selector */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={selectedSubjectFilter}
                  onChange={e => setSelectedSubjectFilter(e.target.value)}
                  className="bg-[#141416] border border-white/[0.08] text-zinc-300 rounded-lg px-2.5 py-1 text-xs focus:border-[#FF5B37] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs bg-[#141416] rounded-xl border border-white/[0.08]">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const categoryBadge = {
                    'past-paper': { label: 'Past Paper', color: 'bg-white/[0.06] text-zinc-200 border-white/[0.08]' },
                    'flashcards': { label: 'Active Recall', color: 'bg-white/[0.06] text-zinc-200 border-white/[0.08]' },
                    'weak-spot': { label: 'Weak Spot Drill', color: 'bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/20' },
                    'atp-practical': { label: 'Paper 6 ATP', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
                    'mock-drill': { label: 'Timed Mock', color: 'bg-[#4cc38a]/10 text-[#4cc38a] border-[#4cc38a]/20' }
                  }[task.category];

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 select-none ${
                        task.completed
                          ? 'bg-[#141416]/50 border-white/[0.04] opacity-50'
                          : 'bg-[#141416] border-white/[0.08] hover:border-white/[0.16]'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-zinc-500 hover:text-[#4cc38a] shrink-0 transition"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500 hover:text-zinc-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                            {task.subjectCode}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${categoryBadge.color}`}
                          >
                            {categoryBadge.label}
                          </span>
                          {task.priority === 'high' && (
                            <span className="text-[10px] font-mono font-medium text-[#e5484d] uppercase tracking-wider flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#e5484d]" /> High Yield
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-zinc-400 ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {task.durationMinutes} mins
                          </span>
                        </div>

                        <div
                          className={`text-xs sm:text-sm font-medium ${
                            task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{task.dateStr}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to construct a structured 14-day intensive roadmap from active exams
function generateDefaultRoadmapTasks(exams: ExamDateEntry[]): DailyTask[] {
  const tasks: DailyTask[] = [];
  const today = new Date();

  // Pick unique syllabus codes
  const uniqueCodes = Array.from(new Set(exams.map(e => e.subjectCode)));

  const sampleTitles: Record<string, { title: string; category: DailyTask['category']; mins: number }[]> = {
    '0580': [
      { title: 'Algebraic fractions & quadratic formula drills (Paper 4 Q3)', category: 'past-paper', mins: 45 },
      { title: 'Trigonometry: Sine/Cosine rule & 3D Pythagoras past paper challenge', category: 'weak-spot', mins: 40 },
      { title: 'Paper 2 Speed Test: Complete 15 non-calculator quick marks in 20 mins', category: 'mock-drill', mins: 30 }
    ],
    '0625': [
      { title: 'Thermal Physics: Specific heat capacity & latent heat calculation drill', category: 'past-paper', mins: 40 },
      { title: 'Electromagnetism: Motor effect & Lenz law mark scheme criteria memorization', category: 'flashcards', mins: 25 },
      { title: 'Paper 6 Alternative to Practical: Reading micrometer & circuit fault diagnostics', category: 'atp-practical', mins: 35 }
    ],
    '0620': [
      { title: 'Stoichiometry & Mole calculations: Gas volumes & titration concentrations', category: 'weak-spot', mins: 45 },
      { title: 'Cation & Anion Tests: NaOH & NH3 precipitate colors & excess memorization', category: 'atp-practical', mins: 30 },
      { title: 'Organic Chemistry: Esterification, addition polymers & fermentation conditions', category: 'past-paper', mins: 40 }
    ],
    '0610': [
      { title: 'Human Transport: Heart valves, blood flow diagram & coronary heart disease', category: 'flashcards', mins: 30 },
      { title: 'Genetics & Punnett Squares: Codominance & sex-linked inheritance questions', category: 'past-paper', mins: 40 },
      { title: 'Paper 6 Practical: Food tests (Benedict, Biuret, Iodine, DCPIP) & magnification calculations', category: 'atp-practical', mins: 35 }
    ],
    '0510': [
      { title: 'Exercise 6: Formal / Informal email structure & Cambridge connectives checklist', category: 'past-paper', mins: 45 },
      { title: 'Exercise 5: Note-taking & summary writing avoiding word-count traps', category: 'weak-spot', mins: 35 }
    ]
  };

  let dayIndex = 1;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateFormatted = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const code = uniqueCodes[i % uniqueCodes.length] || '0580';
    const pool = sampleTitles[code] || [
      { title: `Complete official past paper Section A for syllabus ${code}`, category: 'past-paper', mins: 45 },
      { title: `Active recall: Review 25 core syllabus flashcards for ${code}`, category: 'flashcards', mins: 25 }
    ];
    const taskSpec = pool[i % pool.length];

    tasks.push({
      id: `task-${i + 1}`,
      dayNumber: dayIndex,
      dateStr: `Day ${dayIndex} • ${dateFormatted}`,
      subjectCode: code,
      title: taskSpec.title,
      category: taskSpec.category,
      durationMinutes: taskSpec.mins,
      completed: i === 0, // 1st marked done as sample
      priority: i % 2 === 0 ? 'high' : 'normal'
    });

    if ((i + 1) % 2 === 0) dayIndex++;
  }

  return tasks;
}
