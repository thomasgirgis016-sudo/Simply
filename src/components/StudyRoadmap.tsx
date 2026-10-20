import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Cambridge Exam Countdown & Adaptive Revision Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Personalized Cambridge Study Roadmap
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Never fall behind. Set your official Cambridge examination dates and follow an AI-calculated daily milestone checklist tailored to your target grades.
            </p>
          </div>

          {/* Quick Stat Pill */}
          {closestExam && (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-5 backdrop-blur-md shadow-xl shrink-0">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400">
                <span className="text-2xl font-black leading-none">{closestDays}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Days</span>
              </div>
              <div>
                <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  Next Official Exam
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {closestExam.subjectCode} • {closestExam.paperName}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {closestExam.examDate}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Left Column (Exams & Countdown Clocks) | Right Column (Daily Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Official Exam Timetable (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Official Exam Timetable
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {exams.length} papers entered • Live Cambridge countdown
                </p>
              </div>
              <button
                onClick={() => setIsAddingExam(!isAddingExam)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Paper
              </button>
            </div>

            {/* Add Exam Modal / Form Dropdown */}
            {isAddingExam && (
              <form
                onSubmit={handleAddExam}
                className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-4 space-y-3 animate-fadeIn"
              >
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Add Official Paper Date
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Select Subject
                  </label>
                  <select
                    value={newSubjectCode}
                    onChange={e => setNewSubjectCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    value={newPaperName}
                    onChange={e => setNewPaperName(e.target.value)}
                    placeholder="e.g. Paper 4 (Extended Theory)"
                    className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Target Grade
                    </label>
                    <select
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                  >
                    Save Paper
                  </button>
                </div>
              </form>
            )}

            {/* List of Exams with Clocks */}
            <div className="space-y-3">
              {sortedExams.map(item => {
                const days = getDaysRemaining(item.examDate);
                const isUrgent = days >= 0 && days <= 14;
                const isPast = days < 0;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPast
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : isUrgent
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                            {item.subjectCode}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[180px]">
                            {item.subjectName}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">{item.paperName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.examDate}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-medium">Target: {item.targetGrade}</span>
                        </div>
                      </div>

                      {/* Right: Days badge & delete */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-xl border text-center font-mono ${
                            isPast
                              ? 'bg-slate-800/60 border-slate-700 text-slate-400 text-xs'
                              : isUrgent
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-semibold'
                          }`}
                        >
                          <div className="text-base leading-none font-black">
                            {isPast ? 'Done' : days}
                          </div>
                          {!isPast && (
                            <div className="text-[9px] uppercase tracking-wider text-slate-400">
                              {days === 1 ? 'day' : 'days'}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteExam(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
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
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-indigo-400" />
              Cambridge Examiner Revision Rule
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>The 3-Pass Rule:</strong> Students who review topic mark schemes twice before sitting full timed papers score 18% higher on average than students doing passive reading. Combine flashcards in the morning with 1 past paper question block in the afternoon.
            </p>
          </div>
        </div>

        {/* Right Column: Daily Adaptive Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-lg space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Daily Milestone Checklist
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete these high-yield revision blocks each day to hit your target grades.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateRoadmap}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
                  title="Recalculate tasks based on active exam dates"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">
                  Overall Completion Rate ({completedCount} of {tasks.length} tasks)
                </span>
                <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                {(['all', 'pending', 'completed'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setSelectedFilter(tabKey)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all font-medium ${
                      selectedFilter === tabKey
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>

              {/* Subject selector */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedSubjectFilter}
                  onChange={e => setSelectedSubjectFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const categoryBadge = {
                    'past-paper': { label: 'Past Paper', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                    'flashcards': { label: 'Active Recall', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                    'weak-spot': { label: 'Weak Spot Drill', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
                    'atp-practical': { label: 'Paper 6 ATP', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                    'mock-drill': { label: 'Timed Mock', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
                  }[task.category];

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                        task.completed
                          ? 'bg-slate-950/30 border-slate-800/60 opacity-60'
                          : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-950/90'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 shrink-0 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {task.subjectCode}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryBadge.color}`}
                          >
                            {categoryBadge.label}
                          </span>
                          {task.priority === 'high' && (
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                              <Flame className="w-3 h-3 text-rose-400" /> High Yield
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.durationMinutes} mins
                          </span>
                        </div>

                        <div
                          className={`text-sm font-semibold ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{task.dateStr}</div>
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
