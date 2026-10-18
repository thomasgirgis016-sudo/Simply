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
  Maximize2,
  BarChart2,
  TrendingUp,
  RefreshCw,
  Copy,
  Check
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
    backupUrl?: string;
    title: string;
    subtitle?: string;
    paperCode?: string;
    type: 'qp' | 'ms' | 'er' | 'gt';
  } | null>(null);

  // Viewer Engine in Modal: 'gdocs' (Universal Embed) vs 'direct'
  const [viewerEngine, setViewerEngine] = useState<'gdocs' | 'direct'>('gdocs');
  // Mirror toggle: primary CDN vs backup CDN
  const [useBackupMirror, setUseBackupMirror] = useState<boolean>(false);

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

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<'All' | 'CIE' | 'Edexcel'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubject.id);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [selectedPaperNumber, setSelectedPaperNumber] = useState<string>('All');
  const [selectedVariant, setSelectedVariant] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  // Reset topic whenever active subject or board changes
  useEffect(() => {
    setSelectedTopic('All');
  }, [selectedSubjectId, selectedBoard]);

  // Pagination / Page Limit for rendering performance
  const [pageLimit, setPageLimit] = useState<number>(24);

  // Reset page limit whenever filters change
  useEffect(() => {
    setPageLimit(24);
  }, [
    selectedBoard,
    selectedSubjectId,
    selectedTopic,
    selectedYear,
    selectedSession,
    selectedPaperNumber,
    selectedVariant,
    selectedTier,
    searchQuery
  ]);

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
    '0580/42 May/June 2023',
    '0580/22 May/June 2024',
    '0625/41 May/June 2023',
    '0620/42 Oct/Nov 2022',
    '0610/41 May/June 2023',
    '0478/12 May/June 2023',
    '0455/22 May/June 2023',
    '0510/12 May/June 2023'
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
          pdf.subjectCode.toLowerCase() === selectedSubjectId.toLowerCase();
        if (!matchesSub) return false;
      }

      // Year filter
      if (selectedYear !== 'All' && pdf.year.toString() !== selectedYear) {
        return false;
      }

      // Session / Series filter
      if (selectedSession !== 'All') {
        if (!pdf.session.toLowerCase().includes(selectedSession.toLowerCase())) {
          return false;
        }
      }

      // Paper Number filter
      if (selectedPaperNumber !== 'All' && pdf.paperNumber !== undefined) {
        if (pdf.paperNumber.toString() !== selectedPaperNumber) {
          return false;
        }
      }

      // Variant filter
      if (selectedVariant !== 'All' && pdf.variant !== undefined) {
        if (pdf.variant.toString() !== selectedVariant) {
          return false;
        }
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
    selectedSession,
    selectedPaperNumber,
    selectedVariant,
    selectedTier,
    searchQuery,
  ]);

  // Paginated slice
  const displayedPdfs = useMemo(() => {
    return filteredPdfs.slice(0, pageLimit);
  }, [filteredPdfs, pageLimit]);

  // Available topics for active subject & board filters
  const availableTopics = useMemo(() => {
    const allPapers = getAllPastPapers();
    const filtered = allPapers.filter((paper) => {
      if (selectedBoard !== 'All' && paper.board !== selectedBoard) return false;
      if (selectedSubjectId !== 'all') {
        const matchesSub =
          paper.subjectId === selectedSubjectId ||
          paper.subjectCode?.toLowerCase() === selectedSubjectId.toLowerCase();
        if (!matchesSub) return false;
      }
      return true;
    });

    const topicSet = new Set<string>();
    filtered.forEach((p) => {
      if (p.topic) topicSet.add(p.topic);
    });
    return Array.from(topicSet).sort();
  }, [selectedBoard, selectedSubjectId]);

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
          paper.subjectCode?.toLowerCase() === selectedSubjectId.toLowerCase();
        if (!matchesSub) return false;
      }

      // Topic filter
      if (selectedTopic !== 'All' && paper.topic !== selectedTopic) {
        return false;
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
    selectedTopic,
    selectedYear,
    selectedSession,
    selectedTier,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBoard('All');
    setSelectedSubjectId('all');
    setSelectedTopic('All');
    setSelectedYear('All');
    setSelectedSession('All');
    setSelectedPaperNumber('All');
    setSelectedVariant('All');
    setSelectedTier('All');
    setPageLimit(24);
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

  // Helper to open PDF in a new window or trigger viewer
  const handleOpenPdf = (url: string, title: string, subtitle?: string, backupUrl?: string, type: 'qp' | 'ms' | 'er' | 'gt' = 'qp') => {
    setUseBackupMirror(false);
    setPreviewModal({
      url,
      backupUrl,
      title,
      subtitle,
      type
    });
  };

  const handleCopyQuestion = (paper: PastPaperItem) => {
    const msLines = paper.markScheme?.map((m) => `${m.markType}: ${m.requirement}`).join('\n') || '';
    const textToCopy = `[${paper.paperCode} ${paper.session} - ${paper.questionNumber}] (${paper.marks} Marks)\nTopic: ${paper.topic} | Tier: ${paper.difficultyTier}\n\nQUESTION:\n${paper.questionPrompt || paper.questionText}\n\nMARK SCHEME & EXPLANATION:\n${msLines}\n\nFinal Answer: ${paper.finalAnswer || 'N/A'}${paper.examinerReportSnippet ? `\n\nPrincipal Examiner Report Advice:\n${paper.examinerReportSnippet}` : ''}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopiedQuestionId(paper.id);
    setTimeout(() => setCopiedQuestionId(null), 2500);
  };

  // Active URL in modal (considering backup mirror toggle)
  const currentModalUrl = previewModal
    ? (useBackupMirror && previewModal.backupUrl ? previewModal.backupUrl : previewModal.url)
    : '';

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/20 mb-3">
            <Search className="h-3.5 w-3.5" />
            <span>Complete Exam Archive: 2018–2024 (All Papers & All Variants)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cambridge & Edexcel Past Paper PDF Library
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Instant 1-click access to thousands of authentic past examination papers from <strong>2018 to 2024</strong>. Filter by <strong>Year, Exam Series, Paper Component, and Variant</strong> to get exact Question Papers (QP), official Mark Schemes (MS), Principal Examiner Reports, and Grade Thresholds.
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
            <span>📑 Full Paper PDFs & Multi-Year Archive (2018–2024)</span>
            <span className="rounded-full bg-sky-950/80 px-2 py-0.5 text-[10px] font-mono text-sky-200 border border-sky-400/30">
              {OFFICIAL_PAST_PAPER_PDFS.length}+ Papers
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
            <span>🔍 Classified Topic & Question Finder</span>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
              {getAllPastPapers().length} Qs
            </span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/50">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Popular Exam Papers:
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

      {/* Comprehensive Search & Multi-Filter Bar with Year, Paper, Variant */}
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
                ? "Search paper code (0580/42), subject name, session (May/June 2023), variant..."
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

        {/* Detailed 6-Column Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
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
              <option value="All">All Boards</option>
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

          {/* 3. Year Filter (2018 - 2025) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
              <span>Exam Year</span>
              {selectedYear !== 'All' && <span className="text-[9px] text-sky-300">Active</span>}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="All">All Years (2016–2025)</option>
              <option value="2025">2025 Specimen Series</option>
              <option value="2024">2024 Series</option>
              <option value="2023">2023 Series</option>
              <option value="2022">2022 Series</option>
              <option value="2021">2021 Series</option>
              <option value="2020">2020 Series</option>
              <option value="2019">2019 Series</option>
              <option value="2018">2018 Series</option>
              <option value="2017">2017 Series</option>
              <option value="2016">2016 Series</option>
            </select>
          </div>

          {/* 4. Session / Series Filter */}
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
              <option value="May/June">May / June (Summer - s)</option>
              <option value="Oct/Nov">Oct / Nov (Winter - w)</option>
              <option value="Feb/March">Feb / March (Spring - m)</option>
              <option value="January">January Series (Edexcel)</option>
              <option value="Specimen">Specimen Series</option>
            </select>
          </div>

          {/* 5 & 6: Context-Sensitive Filters depending on active tab */}
          {activeTab === 'pdf-library' ? (
            <>
              {/* 5. Paper Component Filter (Paper 1, 2, 3, 4, 5, 6) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                  <span>Paper Number</span>
                  {selectedPaperNumber !== 'All' && <span className="text-[9px] text-sky-300">Active</span>}
                </label>
                <select
                  value={selectedPaperNumber}
                  onChange={(e) => setSelectedPaperNumber(e.target.value)}
                  className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                >
                  <option value="All">All Papers</option>
                  <option value="1">Paper 1 (MCQ / Short / Foundation)</option>
                  <option value="2">Paper 2 (Extended / Theory / Calculator)</option>
                  <option value="3">Paper 3 (Core Structured)</option>
                  <option value="4">Paper 4 (Extended Theory / Calc)</option>
                  <option value="5">Paper 5 (Practical Test)</option>
                  <option value="6">Paper 6 (Alternative to Practical)</option>
                </select>
              </div>

              {/* 6. Variant Filter (1, 2, 3 & Regional) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                  <span>Variant</span>
                  {selectedVariant !== 'All' && <span className="text-[9px] text-sky-300">Active</span>}
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                >
                  <option value="All">All Variants (1, 2, 3 & Regional)</option>
                  <option value="1">Variant 1 (e.g. 11, 21, 41 / Standard)</option>
                  <option value="2">Variant 2 (e.g. 12, 22, 42 / Regional "R")</option>
                  <option value="3">Variant 3 (e.g. 13, 23, 43)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* 5. Classified Topic Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                  <span>Classified Topic</span>
                  {selectedTopic !== 'All' && <span className="text-[9px] text-sky-300">Active</span>}
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                >
                  <option value="All">All Topics ({availableTopics.length})</option>
                  {availableTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Difficulty Tier Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                  <span>Difficulty Tier</span>
                  {selectedTier !== 'All' && <span className="text-[9px] text-sky-300">Active</span>}
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full rounded-xl border border-sky-500/40 bg-slate-950 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                >
                  <option value="All">All Difficulty Tiers</option>
                  <option value="Grade 9 Challenge">Grade 9 Challenge / Hard</option>
                  <option value="Extended">Extended</option>
                  <option value="Standard Extended">Standard Extended</option>
                  <option value="Core">Core / Foundation</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Quick Topic Pills Bar (when viewing Classified Question Finder) */}
        {activeTab === 'questions' && availableTopics.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-sky-400" />
                Quick Filter by Topic ({availableTopics.length} topics):
              </span>
              {selectedTopic !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic('All')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  Clear topic filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedTopic('All')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTopic === 'All'
                    ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>All Topics</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${selectedTopic === 'All' ? 'bg-sky-900/90 text-sky-100' : 'bg-slate-900 text-slate-400'}`}>
                  {getAllPastPapers().filter((p) => {
                    if (selectedBoard !== 'All' && p.board !== selectedBoard) return false;
                    if (selectedSubjectId !== 'all') {
                      const matches = p.subjectId === selectedSubjectId || p.subjectCode?.toLowerCase() === selectedSubjectId.toLowerCase();
                      if (!matches) return false;
                    }
                    return true;
                  }).length}
                </span>
              </button>
              {availableTopics.map((top) => {
                const count = getAllPastPapers().filter(
                  (p) =>
                    (selectedBoard === 'All' || p.board === selectedBoard) &&
                    (selectedSubjectId === 'all' || p.subjectId === selectedSubjectId || p.subjectCode?.toLowerCase() === selectedSubjectId.toLowerCase()) &&
                    p.topic === top
                ).length;
                const isSelected = selectedTopic === top;
                return (
                  <button
                    key={top}
                    type="button"
                    onClick={() => setSelectedTopic(isSelected ? 'All' : top)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{top}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isSelected ? 'bg-sky-900/90 text-sky-100' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action & Results count bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            {activeTab === 'pdf-library' ? (
              <span>
                Found <strong className="text-white">{filteredPdfs.length}</strong> past paper PDFs across 2016–2025
                {filteredPdfs.length > displayedPdfs.length && (
                  <span className="text-sky-400 ml-1.5">(Showing first {displayedPdfs.length})</span>
                )}
              </span>
            ) : (
              <span>
                Showing <strong className="text-white">{filteredPapers.length}</strong> official past paper questions
                {selectedTopic !== 'All' && (
                  <span className="ml-1 text-sky-400 font-medium">in topic "{selectedTopic}"</span>
                )}
              </span>
            )}
            {(selectedBoard !== 'All' || selectedSubjectId !== 'all' || selectedTopic !== 'All' || selectedYear !== 'All' || selectedSession !== 'All' || selectedPaperNumber !== 'All' || selectedVariant !== 'All' || selectedTier !== 'All' || searchQuery) && (
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
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 shrink-0">
                <FileDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Exam Library: 2016 to 2025 (All Subjects, All Papers & All Variants)</p>
                <p className="text-[11px] text-slate-400">
                  Click <strong>Open Fullscreen</strong> to open in native viewer, or <strong>View</strong> to inspect in-app with Google Docs & direct mirrors.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 font-semibold flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> QP + MS Paired
              </span>
              <span className="rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 font-semibold flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Examiner Reports
              </span>
              <span className="rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Grade Thresholds
              </span>
            </div>
          </div>

          {filteredPdfs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">No past paper PDFs match your current filters.</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try setting Exam Board to "All Boards", setting Variant or Paper Number to "All", or resetting filters.
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedPdfs.map((pdf) => {
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
                            <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-slate-700">
                              {pdf.paperCode}
                            </span>
                            {pdf.variant && (
                              <span className="rounded-lg bg-sky-950/60 text-sky-300 px-2 py-0.5 text-[10px] font-semibold border border-sky-500/30">
                                Variant {pdf.variant}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${getTierBadge(pdf.tier)}`}>
                              {pdf.tier}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pdf.year}
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

                      {/* Action Buttons: QP, MS, ER, GT */}
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
                                handleOpenPdf(
                                  pdf.qpPdfUrl,
                                  `${pdf.paperCode} Question Paper`,
                                  `${pdf.subjectName} • ${pdf.session}`,
                                  pdf.backupQpUrl,
                                  'qp'
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                              title="Preview in-app viewer"
                            >
                              <Eye className="h-3.5 w-3.5 text-sky-400" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <a
                              href={pdf.qpPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                              title="Open PDF in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Open</span>
                            </a>
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

                        {/* Mark Scheme Row */}
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
                                  handleOpenPdf(
                                    pdf.msPdfUrl!,
                                    `${pdf.paperCode} Mark Scheme`,
                                    `${pdf.subjectName} • ${pdf.session}`,
                                    pdf.backupMsUrl,
                                    'ms'
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition cursor-pointer"
                                title="Preview Mark Scheme in-app"
                              >
                                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              <a
                                href={pdf.msPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                                title="Open Mark Scheme in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Open</span>
                              </a>
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

                        {/* Extra Session Materials: Examiner Report & Grade Thresholds */}
                        {(pdf.examinerReportUrl || pdf.gradeThresholdsUrl) && (
                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                            {pdf.examinerReportUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPdf(
                                    pdf.examinerReportUrl!,
                                    `${pdf.subjectName} (${pdf.subjectCode}) Examiner Report`,
                                    `${pdf.session} • Cambridge Principal Examiner Report`,
                                    undefined,
                                    'er'
                                  )
                                }
                                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                              >
                                <Award className="h-3.5 w-3.5" />
                                <span>Examiner Report</span>
                              </button>
                            )}
                            {pdf.gradeThresholdsUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPdf(
                                    pdf.gradeThresholdsUrl!,
                                    `${pdf.subjectName} (${pdf.subjectCode}) Grade Thresholds`,
                                    `${pdf.session} • Official Grade Boundaries`,
                                    undefined,
                                    'gt'
                                  )
                                }
                                className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer font-semibold ml-auto"
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>Grade Thresholds</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button if results exceed pageLimit */}
              {filteredPdfs.length > pageLimit && (
                <div className="pt-6 pb-2 text-center">
                  <button
                    onClick={() => setPageLimit((prev) => prev + 36)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 text-xs font-bold text-white transition shadow-lg cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4 text-sky-400" />
                    <span>Load More Papers (Showing {displayedPdfs.length} of {filteredPdfs.length})</span>
                  </button>
                  <button
                    onClick={() => setPageLimit(filteredPdfs.length)}
                    className="ml-3 inline-flex items-center gap-1 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <span>Show All ({filteredPdfs.length})</span>
                  </button>
                </div>
              )}
            </>
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
                {selectedTopic !== 'All' 
                  ? `No questions found under topic "${selectedTopic}". Try choosing "All Topics" or resetting filters.`
                  : 'Try switching Exam Board to "All Boards", clearing the search term, or selecting "All Subjects".'}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {selectedTopic !== 'All' && (
                  <button
                    onClick={() => setSelectedTopic('All')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition cursor-pointer"
                  >
                    Clear Topic: "{selectedTopic}"
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </button>
              </div>
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
                      <button
                        type="button"
                        onClick={() => setSelectedTopic(paper.topic)}
                        className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-medium transition cursor-pointer"
                        title={`Filter questions by topic: ${paper.topic}`}
                      >
                        {paper.topic}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTier(paper.difficultyTier)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold border cursor-pointer hover:opacity-85 transition ${getTierBadge(paper.difficultyTier)}`}
                        title={`Filter questions by tier: ${paper.difficultyTier}`}
                      >
                        {paper.difficultyTier}
                      </button>
                    </div>

                    {/* Top Right Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      {/* Copy Question & Mark Scheme */}
                      <button
                        onClick={() => handleCopyQuestion(paper)}
                        className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                          copiedQuestionId === paper.id
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title="Copy Question & Mark Scheme text to clipboard"
                      >
                        {copiedQuestionId === paper.id ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline text-[11px] font-semibold">Copy</span>
                          </>
                        )}
                      </button>

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

                      {/* Preview PDF */}
                      <button
                        onClick={() =>
                          handleOpenPdf(
                            downloadUrl,
                            `${paper.paperCode} Question Paper`,
                            `${paper.subjectName} • ${paper.session}`,
                            undefined,
                            'qp'
                          )
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                        title="Preview authentic Question Paper PDF"
                      >
                        <Eye className="h-3.5 w-3.5 text-sky-400" />
                        <span className="hidden sm:inline">View PDF</span>
                      </button>

                      {/* Open Fullscreen PDF */}
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition flex items-center gap-1.5"
                        title="Open PDF directly in new window"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Open</span>
                      </a>
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
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPdf(
                                    msDownloadUrl,
                                    `${paper.paperCode} Mark Scheme`,
                                    `${paper.subjectName} • ${paper.session}`,
                                    undefined,
                                    'ms'
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                                title="Preview official mark scheme PDF"
                              >
                                <Eye className="h-3 w-3" />
                                <span>MS PDF</span>
                              </button>
                              <a
                                href={msDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
                                title="Open MS directly"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
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
      {/* FOOLPROOF IN-BROWSER PDF PREVIEW MODAL               */}
      {/* ==================================================== */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="flex flex-col w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    previewModal.type === 'ms'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : previewModal.type === 'er'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : previewModal.type === 'gt'
                      ? 'bg-purple-500/20 text-purple-400'
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

              {/* Controls: Engine Switcher, Open Fullscreen, Download, Close */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Engine Switcher */}
                <div className="hidden sm:flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewerEngine('gdocs')}
                    className={`rounded px-2 py-1 font-semibold transition cursor-pointer ${
                      viewerEngine === 'gdocs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Universal Google Docs Embed Viewer (Recommended on mobile/tablets)"
                  >
                    Google Viewer
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerEngine('direct')}
                    className={`rounded px-2 py-1 font-semibold transition cursor-pointer ${
                      viewerEngine === 'direct' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Direct PDF Embed"
                  >
                    Direct Frame
                  </button>
                </div>

                {/* Mirror Switcher if backup exists */}
                {previewModal.backupUrl && (
                  <button
                    type="button"
                    onClick={() => setUseBackupMirror(!useBackupMirror)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                    title="Switch between Primary CDN and Backup CDN"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="hidden md:inline">{useBackupMirror ? 'Mirror 2 (Active)' : 'Switch Mirror'}</span>
                  </button>
                )}

                {/* Open in Fullscreen / New Tab (Guaranteed to work 100% on phones and desktops) */}
                <a
                  href={currentModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                  title="Open PDF directly in full browser window"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Fullscreen</span>
                </a>

                {/* Direct Download */}
                <a
                  href={currentModalUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-sm"
                  title="Download PDF to computer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Close Button */}
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

            {/* Helper notice for phone users */}
            <div className="bg-sky-950/40 border-b border-sky-500/20 px-4 py-2 text-[11px] text-sky-200 flex items-center justify-between gap-2 flex-wrap">
              <span>
                💡 <strong>Mobile / Tablet tip:</strong> If the PDF appears small or doesn't display inline, tap <strong>Open Fullscreen</strong> above for your browser's native PDF reader with pinch-to-zoom.
              </span>
              <a
                href={currentModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-sky-300 hover:text-white ml-auto"
              >
                Launch Direct PDF ↗
              </a>
            </div>

            {/* Modal Body: PDF Iframe / Google Docs Viewer */}
            <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
              <iframe
                src={
                  viewerEngine === 'gdocs' && !currentModalUrl.startsWith('/past-papers/')
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(currentModalUrl)}&embedded=true`
                    : currentModalUrl
                }
                className="w-full h-full border-0 bg-white"
                title={previewModal.title}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-2 sm:p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">Esc</kbd> to close</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{currentModalUrl}</span>
              </div>
              <a
                href={currentModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Trouble viewing inline? Open original document</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
