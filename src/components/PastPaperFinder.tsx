import React, { useState, useMemo, useEffect } from 'react';
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
  Share2,
  Eye,
  X,
  FileDown,
  Maximize2
} from 'lucide-react';
import { Subject, UserProfile, PastPaperItem, BookmarkItem, OfficialPaperPdf } from '../types';
import { getAllPastPapers, getPaperDownloadUrl, OFFICIAL_PAST_PAPER_PDFS } from '../data/pastPapersData';
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
  // Main View Switcher: Official PDFs vs Question Finder
  const [activeTab, setActiveTab] = useState<'pdf-library' | 'questions'>('pdf-library');

  // Modal PDF Previewer
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    type: 'qp' | 'ms' | 'er';
  } | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewModal) {
        setPreviewModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModal]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubject.id);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
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
    '0580 May June 2024 Paper 41',
    'two cyclists bearing 040',
    '0625 Physics Theory Extended',
    'iron extraction blast furnace',
    '0610 Biology Theory Extended',
    'two complement 8 bit overflow',
    '0455 Economics Specimen',
    '0510 ESL Reading and Writing'
  ];

  // ==========================================
  // 1. FILTERING FOR OFFICIAL FULL PAPER PDFS
  // ==========================================
  const filteredPdfs = useMemo(() => {
    return OFFICIAL_PAST_PAPER_PDFS.filter((pdf) => {
      // Board filter
      if (selectedBoard !== 'All' && pdf.board !== selectedBoard) {
        return false;
      }

      // Subject filter
      if (selectedSubjectId !== 'all') {
        const matchesSub =
          pdf.subjectId === selectedSubjectId ||
          isSubjectMatch(pdf.subjectId, activeSubject);
        if (!matchesSub) return false;
      }

      // Year filter
      if (selectedYear !== 'All' && pdf.year.toString() !== selectedYear) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'All' && pdf.tier !== selectedTier) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          pdf.paperCode.toLowerCase().includes(q) ||
          pdf.paperComponent.toLowerCase().includes(q) ||
          pdf.subjectName.toLowerCase().includes(q) ||
          pdf.subjectCode.toLowerCase().includes(q) ||
          pdf.session.toLowerCase().includes(q) ||
          pdf.board.toLowerCase().includes(q);

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    selectedBoard,
    selectedSubjectId,
    activeSubject,
    selectedYear,
    selectedTier,
    searchQuery,
  ]);

  // ==========================================
  // 2. FILTERING FOR QUESTION SNIPPETS
  // ==========================================
  const filteredPapers = useMemo(() => {
    return getAllPastPapers().filter((paper) => {
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
      case 'Extended':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Standard Extended':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Core':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
  };

  const handlePrintPaper = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/20 mb-3">
            <Search className="h-3.5 w-3.5" />
            <span>Official Past Papers & Question Classification Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cambridge & Edexcel Past Paper PDF Library
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Download genuine full exam Question Papers (QP), official Mark Schemes (MS), and Examiner Reports as PDFs. Or use the natural-language question finder to study classified questions by topic with method marks ($M1, A1, B1$).
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('pdf-library')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'pdf-library'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            <FileDown className="h-4 w-4" />
            <span>📑 Full Paper PDFs & Official Downloads</span>
            <span className="rounded-full bg-sky-950/80 px-2 py-0.5 text-[10px] font-mono text-sky-200 border border-sky-400/30">
              {OFFICIAL_PAST_PAPER_PDFS.length} Papers
            </span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>🔍 Question & Mark Scheme Finder</span>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
              {getAllPastPapers().length} Qs
            </span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/50">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Quick Shortcuts:
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
            placeholder={
              activeTab === 'pdf-library'
                ? "Search past paper code (0580/41), subject name, session (May/June 2024), or component..."
                : "Search keywords, bearings, chemical formulas, or paper ref (e.g. 0580/42 May 2023)..."
            }
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
              <option value="2027">2027 Specimen</option>
              <option value="2025">2025 Specimen</option>
              <option value="2024">2024 Series</option>
              <option value="2023">2023 Series</option>
              <option value="2022">2022 Series</option>
              <option value="2021">2021 Series</option>
            </select>
          </div>

          {/* 4. Session / Series */}
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
              <option value="Specimen">Specimen Series</option>
            </select>
          </div>

          {/* 5. Difficulty Tier */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Tier / Syllabus Level
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="Extended">Extended Tier</option>
              <option value="Core">Core Tier</option>
              <option value="General">General / Single Tier</option>
              <option value="Grade 9 Challenge">Grade 9 Challenge</option>
            </select>
          </div>
        </div>

        {/* Action & Results count bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            {activeTab === 'pdf-library' ? (
              <span>
                Showing <strong className="text-white">{filteredPdfs.length}</strong> official past paper PDF documents
              </span>
            ) : (
              <span>
                Showing <strong className="text-white">{filteredPapers.length}</strong> official past paper questions
              </span>
            )}
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
            {activeTab === 'questions' && (
              /* View Mode Toggle: Stacked vs Side-by-Side */
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
            )}

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

      {/* ==================================================== */}
      {/* VIEW 1: OFFICIAL PAST PAPER PDFS & DOWNLOADS         */}
      {/* ==================================================== */}
      {activeTab === 'pdf-library' && (
        <div className="space-y-4">
          {/* Information callout banner */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/60 p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
                <FileDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Genuine Cambridge & Edexcel PDFs Directly Available</p>
                <p className="text-[11px] text-slate-400">All PDFs are hosted locally for zero wait time, guaranteed 100% uptime, and direct in-browser inspection.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 font-semibold flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> QP + MS Paired
              </span>
              <span className="rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 font-semibold flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> In-Browser Preview
              </span>
            </div>
          </div>

          {filteredPdfs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">No past paper PDFs match your current filters.</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try setting Exam Board to "All Exam Boards", clearing search keywords, or selecting "All Subjects".
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPdfs.map((pdf) => {
                const isCie = pdf.board === 'CIE';
                return (
                  <div
                    key={pdf.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                              isCie
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {pdf.board}
                          </span>
                          <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-200 border border-slate-700">
                            {pdf.paperCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {pdf.fileSizeBytes && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pdf.fileSizeBytes}
                            </span>
                          )}
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${getTierBadge(pdf.tier)}`}>
                            {pdf.tier}
                          </span>
                        </div>
                      </div>

                      {/* Title & Component */}
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <span>{pdf.subjectName}</span>
                        <span className="text-xs text-slate-400 font-normal">({pdf.subjectCode})</span>
                      </h3>
                      <p className="text-xs text-sky-300 font-semibold mt-1">
                        {pdf.session}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {pdf.paperComponent}
                      </p>
                    </div>

                    {/* Action Buttons: QP, MS, ER */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                      {/* Question Paper Row */}
                      <div className="flex items-center justify-between gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                          <span>Question Paper (QP)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewModal({
                                url: pdf.qpPdfUrl,
                                title: `${pdf.paperCode} ${pdf.subjectName} Question Paper`,
                                subtitle: `${pdf.session} • ${pdf.paperComponent}`,
                                type: 'qp'
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                            title="Preview Question Paper PDF in browser"
                          >
                            <Eye className="h-3.5 w-3.5 text-sky-400" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={pdf.qpPdfUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-sky-500 transition shadow-sm"
                            title="Download official Question Paper PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>

                      {/* Mark Scheme Row (if available) */}
                      {pdf.msPdfUrl && (
                        <div className="flex items-center justify-between gap-2 bg-emerald-950/20 rounded-xl p-2.5 border border-emerald-500/20">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span>Mark Scheme (MS)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewModal({
                                  url: pdf.msPdfUrl!,
                                  title: `${pdf.paperCode} ${pdf.subjectName} Mark Scheme`,
                                  subtitle: `${pdf.session} • ${pdf.paperComponent}`,
                                  type: 'ms'
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition cursor-pointer"
                              title="Preview Mark Scheme PDF in browser"
                            >
                              <Eye className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={pdf.msPdfUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
                              title="Download official Mark Scheme PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Examiner Report Row (if available) */}
                      {pdf.examinerReportUrl && (
                        <div className="flex items-center justify-between gap-2 bg-indigo-950/20 rounded-xl p-2.5 border border-indigo-500/20">
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                            <Award className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span>Examiner Report (ER)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewModal({
                                  url: pdf.examinerReportUrl!,
                                  title: `${pdf.paperCode} ${pdf.subjectName} Examiner Report`,
                                  subtitle: `${pdf.session} • Official Cambridge Insights`,
                                  type: 'er'
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 transition cursor-pointer"
                              title="Preview Examiner Report in browser"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={pdf.examinerReportUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
                              title="Download Examiner Report PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: QUESTION & MARK SCHEME SNIPPET FINDER        */}
      {/* ==================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {filteredPapers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">No past paper questions matched these filter criteria.</h4>
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
              const downloadUrl = getPaperDownloadUrl(paper, 'qp');
              const msDownloadUrl = getPaperDownloadUrl(paper, 'ms');

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
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
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
                          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                        >
                          {isExpanded ? 'Hide Mark Scheme' : 'Reveal Mark Scheme'}
                        </button>
                      )}

                      {/* Solve in AI */}
                      {onOpenSolverWithQuestion && (
                        <button
                          onClick={() => onOpenSolverWithQuestion(paper.questionPrompt)}
                          className="rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-pink-500 hover:to-indigo-500 transition cursor-pointer flex items-center gap-1.5"
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

                      {/* Preview or Download Original PDF */}
                      {downloadUrl.startsWith('/past-papers/') ? (
                        <button
                          onClick={() =>
                            setPreviewModal({
                              url: downloadUrl,
                              title: `${paper.paperCode} ${paper.subjectName} Full Paper`,
                              subtitle: `${paper.session} • Question ${paper.questionNumber}`,
                              type: 'qp'
                            })
                          }
                          className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                          title="Preview full paper PDF in browser"
                        >
                          <Eye className="h-3.5 w-3.5 text-sky-400" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                      ) : (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
                          title="Download official examination question paper PDF"
                        >
                          <Download className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
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
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4" />
                              Official Mark Scheme:
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-white">Final: {paper.finalAnswer}</span>
                              {msDownloadUrl.startsWith('/past-papers/') ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      url: msDownloadUrl,
                                      title: `${paper.paperCode} ${paper.subjectName} Mark Scheme`,
                                      subtitle: `${paper.session} • ${paper.questionNumber}`,
                                      type: 'ms'
                                    })
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                                  title="Preview official mark scheme PDF"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>MS PDF</span>
                                </button>
                              ) : (
                                <a
                                  href={msDownloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                                  title="Download official mark scheme PDF"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>MS PDF</span>
                                </a>
                              )}
                            </div>
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
      )}

      {/* ==================================================== */}
      {/* IN-BROWSER PDF PREVIEW MODAL                         */}
      {/* ==================================================== */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-fadeIn"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="flex flex-col w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    previewModal.type === 'ms'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : previewModal.type === 'er'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {previewModal.title}
                  </h3>
                  {previewModal.subtitle && (
                    <p className="text-[11px] text-slate-400 truncate">
                      {previewModal.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Top Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewModal.url}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-sm"
                  title="Download PDF to computer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                  title="Open in new window"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModal(null)}
                  className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Close preview (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Iframe */}
            <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
              <iframe
                src={previewModal.url}
                className="w-full h-full border-0 bg-white"
                title={previewModal.title}
              />
            </div>

            {/* Modal Footer (fallback note for devices with restrictive PDF handling) */}
            <div className="p-2 sm:p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-4">
              <span>Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">Esc</kbd> to close</span>
              <a
                href={previewModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Trouble viewing? Open original PDF</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
