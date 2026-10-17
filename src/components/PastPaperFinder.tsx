import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  Tag,
  AlertCircle,
  Calendar,
  FileText,
  Bookmark,
  Printer,
  RotateCcw,
  Columns,
  Download,
  Share2
} from 'lucide-react';
import { Subject, UserProfile, PastPaperItem, BookmarkItem } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { MathRenderer } from './MathRenderer';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface PastPaperFinderProps {
  activeSubject: Subject;
  subjects?: Subject[];
  profile: UserProfile;
  onOpenSplitViewer?: (paperItem: PastPaperItem) => void;
  onOpenChatWithQuestion?: (question: string) => void;
  onOpenSolverWithQuestion?: (question: string) => void;
}

export const PastPaperFinder: React.FC<PastPaperFinderProps> = ({
  activeSubject,
  subjects = [],
  profile,
  onOpenSplitViewer,
  onOpenChatWithQuestion,
  onOpenSolverWithQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubject.id);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Core' | 'Standard Extended' | 'Grade 9 Challenge'>('All');
  const [viewMode, setViewMode] = useState<'stacked' | 'side-by-side'>('stacked');
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  // Bookmarks local storage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      if (saved) {
        const parsed: BookmarkItem[] = JSON.parse(saved);
        return parsed.map((b) => b.id);
      }
    } catch {}
    return [];
  });

  const toggleBookmark = (paper: PastPaperItem) => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      let current: BookmarkItem[] = saved ? JSON.parse(saved) : [];
      const exists = current.some((b) => b.id === paper.id);

      if (exists) {
        current = current.filter((b) => b.id !== paper.id);
      } else {
        current.push({
          id: paper.id,
          type: 'past-paper',
          title: `${paper.paperCode} ${paper.session} ${paper.questionNumber}`,
          subtitle: `${paper.subjectName} • ${paper.topic}`,
          subjectId: paper.subjectId,
          subjectCode: paper.paperCode,
          tab: 'finder',
          savedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem('simply_igcse_bookmarks', JSON.stringify(current));
      setBookmarks(current.map((b) => b.id));
    } catch (err) {
      console.warn(err);
    }
  };

  // Quick prompt suggestions
  const suggestedSearches = [
    'two cyclists bearing 040',
    'iron extraction blast furnace',
    'transpiration potometer bubble',
    'quadratic sequence nth term',
    'two complement 8 bit overflow',
    'summary 120 words sea turtles',
    'price elasticity demand revenue',
    'edexcel calculus turning points'
  ];

  // Filtering
  const filteredPapers = useMemo(() => {
    return PAST_PAPERS_DATABASE.filter((paper) => {
      // Board filter
      if (selectedBoard !== 'All' && paper.board !== selectedBoard) {
        return false;
      }

      // Subject filter
      if (selectedSubjectId !== 'all') {
        const matchesSub =
          paper.subjectId === selectedSubjectId ||
          isSubjectMatch(paper.subjectId, activeSubject);
        if (!matchesSub) return false;
      }

      // Year filter
      if (selectedYear !== 'All' && paper.year.toString() !== selectedYear) {
        return false;
      }

      // Session filter
      if (selectedSession !== 'All') {
        if (!paper.session.toLowerCase().includes(selectedSession.toLowerCase())) {
          return false;
        }
      }

      // Tier filter
      if (selectedTier !== 'All' && paper.difficultyTier !== selectedTier) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          paper.snippetQuery.toLowerCase().includes(q) ||
          (paper.questionPrompt || paper.questionText || '').toLowerCase().includes(q) ||
          paper.topic.toLowerCase().includes(q) ||
          paper.session.toLowerCase().includes(q) ||
          paper.paperCode.toLowerCase().includes(q) ||
          paper.questionNumber.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    selectedBoard,
    selectedSubjectId,
    activeSubject,
    selectedYear,
    selectedSession,
    selectedTier,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBoard('All');
    setSelectedSubjectId('all');
    setSelectedYear('All');
    setSelectedSession('All');
    setSelectedTier('All');
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Grade 9 Challenge':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Standard Extended':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const handlePrintPaper = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/20 mb-3">
            <Search className="h-3.5 w-3.5" />
            <span>Classified Past Papers & Mark Schemes</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cambridge & Edexcel Past Paper Hub
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Search authentic exam questions by memorable snippet or syllabus topic. Inspect question papers alongside official mark schemes with method mark breakdowns ($M1, A1, B1$) and principal examiner reports.
          </p>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Common Student Searches:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(s)}
                className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-sky-500 hover:bg-sky-950/40 hover:text-white transition cursor-pointer"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Search & Multi-Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, bearings, chemical formulas, or paper ref (e.g. 0580/42 May 2023)..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Exam Board */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Exam Board
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value as any)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Exam Boards</option>
              <option value="CIE">Cambridge (CIE)</option>
              <option value="Edexcel">Pearson Edexcel</option>
            </select>
          </div>

          {/* 2. Subject Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none truncate"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Year Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Exam Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Years</option>
              <option value="2023">2023 Session</option>
              <option value="2022">2022 Session</option>
              <option value="2021">2021 Session</option>
            </select>
          </div>

          {/* 4. Session Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Exam Series
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Series</option>
              <option value="May/June">May / June</option>
              <option value="Oct/Nov">Oct / Nov</option>
              <option value="Feb/March">Feb / March</option>
            </select>
          </div>

          {/* 5. Difficulty Tier */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Difficulty Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="Core">Core</option>
              <option value="Standard Extended">Standard Extended</option>
              <option value="Grade 9 Challenge">Grade 9 Challenge</option>
            </select>
          </div>
        </div>

        {/* Action & Results count bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Showing <strong className="text-white">{filteredPapers.length}</strong> official past paper questions</span>
            {(selectedBoard !== 'All' || selectedSubjectId !== 'all' || selectedYear !== 'All' || selectedSession !== 'All' || selectedTier !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline ml-2"
              >
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Stacked vs Side-by-Side */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              <button
                onClick={() => setViewMode('stacked')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  viewMode === 'stacked'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Stacked View
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side (QP + MS)
              </button>
            </div>

            <button
              onClick={handlePrintPaper}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="Print Question Paper & Mark Scheme Handout"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print Handout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
            <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-slate-300">No past paper matched these filter criteria.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try switching Exam Board to "All Exam Boards", clearing the search term, or selecting "All Subjects".
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredPapers.map((paper) => {
            const isExpanded = expandedPaperId === paper.id || viewMode === 'side-by-side';
            const isBookmarked = bookmarks.includes(paper.id);

            return (
              <div
                key={paper.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl hover:border-slate-700 transition overflow-hidden"
              >
                {/* Paper Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/50">
                  <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
                    <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-300 border border-sky-500/30 font-mono">
                      {paper.paperCode} • {paper.session}
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {paper.questionNumber} ({paper.marks} Marks)
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{paper.subjectName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400 font-medium">{paper.topic}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getTierBadge(paper.difficultyTier)}`}>
                      {paper.difficultyTier}
                    </span>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleBookmark(paper)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isBookmarked
                          ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this question'}
                    >
                      <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>

                    {/* Toggle Mark Scheme */}
                    {viewMode === 'stacked' && (
                      <button
                        onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                      >
                        {isExpanded ? 'Hide Mark Scheme' : 'Reveal Mark Scheme'}
                      </button>
                    )}

                    {/* Solve in AI */}
                    {onOpenSolverWithQuestion && (
                      <button
                        onClick={() => onOpenSolverWithQuestion(paper.questionPrompt)}
                        className="rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-pink-500 hover:to-indigo-500 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Solve in AI</span>
                      </button>
                    )}

                    {/* Split View Launch */}
                    {onOpenSplitViewer && (
                      <button
                        onClick={() => onOpenSplitViewer(paper)}
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition cursor-pointer flex items-center gap-1"
                        title="Open in Timed Split-Screen Exam Mode"
                      >
                        <Columns className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Exam Mode</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content: Either Stacked or Side-by-Side (QP left, MS right) */}
                <div className={`${viewMode === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800' : ''}`}>
                  {/* Question Paper Pane */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Official Question Paper:
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        [{paper.marks} Marks Available]
                      </span>
                    </div>

                    <MathRenderer
                      content={paper.questionPrompt}
                      className="text-sm text-slate-100 leading-relaxed font-medium"
                    />

                    {paper.diagramOrMath && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center overflow-x-auto">
                        <MathRenderer content={`$$${paper.diagramOrMath}$$`} className="text-sm font-bold text-sky-300" />
                      </div>
                    )}
                  </div>

                  {/* Mark Scheme Pane (Side-by-side or expanded stacked) */}
                  {isExpanded && (
                    <div className={`p-4 sm:p-5 space-y-3 ${viewMode === 'stacked' ? 'border-t border-slate-800 bg-slate-950/70' : 'bg-slate-950/50'}`}>
                      <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4" />
                            Official Mark Scheme:
                          </span>
                          <span className="text-xs font-mono font-bold text-white">Final: {paper.finalAnswer}</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {paper.markScheme.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="font-bold text-indigo-400 font-mono shrink-0">{item.markType}</span>
                              <MathRenderer content={item.requirement} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Principal Examiner Report Warning */}
                      {paper.examinerReportSnippet && (
                        <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3.5 text-xs text-amber-200/90 leading-relaxed">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Principal Examiner Report Advice:
                          </div>
                          {paper.examinerReportSnippet}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
