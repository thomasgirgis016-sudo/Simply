import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Layers,
  Zap,
  Mic,
  Calculator,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  Star,
  BookMarked
} from 'lucide-react';
import { Subject, UserProfile, BookmarkItem } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { INITIAL_REVISION_NOTES, INITIAL_FORMULAS } from '../data/initialData';
import { ActiveTab } from './Navbar';

interface HomeViewProps {
  subjects: Subject[];
  activeSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  profile: UserProfile;
}

export const HomeView: React.FC<HomeViewProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
  onNavigateTab,
  profile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [subjects]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesBoard =
        boardFilter === 'All' ||
        subject.board === boardFilter ||
        subject.board === 'Both';
      const matchesCategory =
        categoryFilter === 'All' || subject.category === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesBoard && matchesCategory && matchesSearch;
    });
  }, [subjects, boardFilter, categoryFilter, searchQuery]);

  // Live Omnisearch Matches (Subjects, Past Papers, Revision Topics, Formulas)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return null;
    const q = searchQuery.toLowerCase();

    const matchedSubjects = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.topics.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedPapers = PAST_PAPERS_DATABASE.filter(
      (p) =>
        p.snippetQuery.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.paperCode.toLowerCase().includes(q) ||
        p.session.toLowerCase().includes(q) ||
        p.questionPrompt.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedNotes = INITIAL_REVISION_NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.chapter.toLowerCase().includes(q) ||
        n.keyConcepts.some((c) => c.heading.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedFormulas = INITIAL_FORMULAS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      subjects: matchedSubjects,
      papers: matchedPapers,
      notes: matchedNotes,
      formulas: matchedFormulas,
    };
  }, [searchQuery, subjects]);

  const handleSelectSubjectAndTab = (subject: Subject, tab: ActiveTab) => {
    onSelectSubject(subject);
    onNavigateTab(tab);
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('simply_igcse_bookmarks', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-24 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Cambridge (CIE) & Pearson Edexcel Syllabuses
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              Target Grade 9 / A* Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Complete IGCSE Revision & Exam Co-Pilot
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Authentic classified past papers, mark schemes with method mark breakdowns ($M1, A1, B1$), syllabus revision notes with Cambridge examiner report traps, and multimodal AI grading.
          </p>

          {/* Prominent Universal Search Bar */}
          <div className="relative mt-7 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any subject, topic (e.g. 0580, Redox, Bearings), or past paper question..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 py-3.5 pl-12 pr-10 text-sm text-white placeholder-slate-400 shadow-xl backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Maths 0580', 'Chemistry 0620', 'Physics 0625', 'ESL 0510', 'Edexcel 4MA1', 'Circle Theorems'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Live Search Dropdown */}
            {searchResults && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
                {searchResults.subjects.length === 0 &&
                searchResults.papers.length === 0 &&
                searchResults.notes.length === 0 &&
                searchResults.formulas.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No results found for "{searchQuery}". Try a syllabus code like "0580" or topic like "Algebra".
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Subjects */}
                    {searchResults.subjects.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-1">
                          Subjects ({searchResults.subjects.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.subjects.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectSubject(sub);
                                onNavigateTab('revision');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 font-mono">
                                  {sub.code}
                                </span>
                                <span className="text-xs font-semibold text-white">{sub.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{sub.board}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Papers */}
                    {searchResults.papers.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-1">
                          Past Paper Questions ({searchResults.papers.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.papers.map((paper) => (
                            <button
                              key={paper.id}
                              onClick={() => {
                                const targetSub = subjects.find((s) => s.id === paper.subjectId);
                                if (targetSub) onSelectSubject(targetSub);
                                onNavigateTab('finder');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-200">
                                  {paper.session} {paper.questionNumber} • {paper.topic}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">
                                  {paper.questionPrompt}
                                </div>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold text-amber-400 ml-2">
                                {paper.marks} Marks
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Revision Notes */}
                    {searchResults.notes.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-1">
                          Revision Notes ({searchResults.notes.length})
                        </div>
                        <div className="space-y-1">
                          {searchResults.notes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => {
                                const targetSub = subjects.find((s) => s.id === note.subjectId);
                                if (targetSub) onSelectSubject(targetSub);
                                onNavigateTab('revision');
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-slate-900 transition"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-200">{note.title}</span>
                                <span className="text-[10px] text-slate-400 ml-2">({note.chapter})</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main 4 Core Action Pillars (Instant Access) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Primary Revision Tools
            </h2>
            <p className="text-xs text-slate-400">
              Everything you need to master your syllabus and ace exam day
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Select any module to start
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Past Papers & Mark Schemes */}
          <div
            onClick={() => onNavigateTab('finder')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 mb-4 group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                Real Past Papers
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition">
                Past Paper Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Filter by subject, year, session, and tier. View question papers alongside authentic mark schemes with $M1, A1, B1$ points.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Open Past Papers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 2: Revision Notes & Examiner Traps */}
          <div
            onClick={() => onNavigateTab('revision')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 mb-4 group-hover:scale-105 transition">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
                High-Yield Summaries
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-cyan-300 transition">
                Revision Notes
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Concise, syllabus-aligned chapter notes with Cambridge Chief Examiner Report warnings, definitions, and 1-click printable PDF summaries.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition">
              <span>Browse Revision Notes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 3: Practice Quizzes & Flashcards */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 mb-4 group-hover:scale-105 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                Active Recall & Timed
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition">
                Mock Quizzes & Cards
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Test yourself under realistic exam timing (1 min/mark) with spaced repetition flashcards and instant mark scheme feedback.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Start Practice Quiz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 4: AI Examiner & Photo Solver */}
          <div
            onClick={() => onNavigateTab('solver')}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-pink-500/50 hover:bg-slate-900 transition cursor-pointer"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 mb-4 group-hover:scale-105 transition">
                <Camera className="h-5 w-5" />
              </div>
              <span className="rounded-md bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-300 font-mono">
                Multimodal AI Vision
              </span>
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-pink-300 transition">
                AI Solver & Grader
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Grade your handwritten student working with red-ink annotations ($M1, A1, B1$) or snap a picture of any tricky textbook problem.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-pink-400 group-hover:translate-x-1 transition">
              <span>Grade My Working</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Secondary Utility Modules Bar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Interactive Exam Utilities</h3>
          </div>
          <span className="text-xs text-slate-400">Official tools tailored for Year 10 & 11 candidates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('checklist')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-emerald-500/40 hover:bg-slate-900 transition"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Syllabus Tracker</div>
              <div className="text-[10px] text-slate-400">RAG confidence list</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('esl-speaking')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-purple-500/40 hover:bg-slate-900 transition"
          >
            <Mic className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">ESL Speaking Oral</div>
              <div className="text-[10px] text-slate-400">Voice examiner & timer</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('boundaries')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-teal-500/40 hover:bg-slate-900 transition"
          >
            <TrendingUp className="h-5 w-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Grade Boundaries</div>
              <div className="text-[10px] text-slate-400">Historical thresholds</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('split')}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-sky-500/40 hover:bg-slate-900 transition"
          >
            <Layers className="h-5 w-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Split-Screen QP/MS</div>
              <div className="text-[10px] text-slate-400">Dual-pane paper exam</div>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Bookmarks & Saved Resources (if any exist) */}
      {bookmarks.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Bookmark className="h-4 w-4 text-amber-400" />
              <span>Your Saved & Bookmarked Items ({bookmarks.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Stored in browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  const targetSub = subjects.find((s) => s.id === b.subjectId);
                  if (targetSub) onSelectSubject(targetSub);
                  onNavigateTab(b.tab as ActiveTab);
                }}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-3 hover:border-amber-500/40 transition cursor-pointer"
              >
                <div>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">
                    {b.subjectCode}
                  </span>
                  <div className="text-xs font-bold text-white mt-1">{b.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{b.subtitle}</div>
                </div>
                <button
                  onClick={(e) => handleRemoveBookmark(b.id, e)}
                  className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove bookmark"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Subject Catalog & Resource Navigation Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Curriculum & Subject Directory
            </h2>
            <p className="text-xs text-slate-400">
              Select a subject to instantly jump into Past Papers, Revision Notes, Formulas, or Quizzes
            </p>
          </div>

          {/* Board Selector Tabs: All vs Cambridge vs Edexcel */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 self-start sm:self-auto">
            {(['All', 'CIE', 'Edexcel'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBoardFilter(b)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  boardFilter === b
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b === 'All' ? 'All Boards' : b === 'CIE' ? 'Cambridge (CIE)' : 'Pearson Edexcel'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-xl px-3 py-1 font-semibold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const isCurrentlyActive = sub.id === activeSubject.id;
            const isCambridge = sub.board === 'CIE';

            return (
              <div
                key={sub.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition shadow-md ${
                  isCurrentlyActive
                    ? 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/30 to-slate-900 ring-1 ring-indigo-500/30'
                    : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  {/* Top Bar: Syllabus Code & Board Distinction */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-black font-mono border ${
                        isCambridge
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {sub.code}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isCambridge
                          ? 'bg-blue-900/40 text-blue-200'
                          : 'bg-cyan-900/40 text-cyan-200'
                      }`}
                    >
                      {isCambridge ? 'Cambridge IGCSE' : 'Pearson Edexcel'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mt-1">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {sub.topics.slice(0, 3).join(' • ')}...
                  </p>
                </div>

                {/* Resource Direct Links for this Subject */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Direct Subject Resources:
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'finder')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 transition"
                      title="Open Past Papers"
                    >
                      Papers
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'revision')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition"
                      title="Open Revision Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'quiz')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition"
                      title="Open Past Paper Quizzes"
                    >
                      Quizzes
                    </button>
                    <button
                      onClick={() => handleSelectSubjectAndTab(sub, 'solver')}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 py-1.5 px-1 text-[11px] font-semibold text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/40 transition"
                      title="Open AI Solver"
                    >
                      AI Solver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
