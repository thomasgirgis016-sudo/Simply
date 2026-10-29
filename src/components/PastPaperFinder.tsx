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
  Check,
  Edit3,
  Headphones,
  Volume2
} from 'lucide-react';
import { Subject, UserProfile, PastPaperItem, BookmarkItem, OfficialPaperPdf, PastPaperSubPart } from '../types';
import {
  getAllPastPapers,
  getQuestionsForPdfs,
  getPaperDownloadUrl,
  OFFICIAL_PAST_PAPER_PDFS,
  findQuestionByExamCode,
  TOTAL_ARCHIVE_PAPERS_COUNT,
  TOTAL_ARCHIVE_QUESTIONS_COUNT
} from '../data/pastPapersData';
import {
  getPapersForSubject,
  getSubjectPaperSpec,
  getListeningAudioUrls,
  normalizeSubjectCode,
  SUBJECT_PAPER_SPECIFICATIONS,
  SubjectPaperSpec
} from '../data/subjectPaperSpecs';
import { synthesizeQuestion } from '../services/questionKnowledgeBase';
import { evaluateStudentAnswerAgainstMarkScheme, ExamGradingResult } from '../services/examQuestionEngine';
import { MathRenderer } from './MathRenderer';
import { isSubjectMatch } from '../utils/subjectMatcher';
import { parseExamCodeString, ParsedExamCode } from '../utils/examCodeParser';

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

  // Dual Search Mode for Questions (Mode A: Exam Code Bar vs Mode B: Visual Filter Layout)
  const [searchMode, setSearchMode] = useState<'modeA' | 'modeB'>('modeA');
  const [selectedQuestionPill, setSelectedQuestionPill] = useState<string>('All');
  const [activeSubPartMap, setActiveSubPartMap] = useState<Record<string, number | 'all'>>({});

  // Modal PDF Previewer
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    backupUrl?: string;
    title: string;
    subtitle?: string;
    paperCode?: string;
    board?: string;
    type: 'qp' | 'ms' | 'er' | 'gt';
    hasAudio?: boolean;
    audioStreamUrl?: string;
    audioDownloadUrl?: string;
  } | null>(null);

  // Viewer Engine in Modal: 'proxy' (Verified Proxy Stream) vs 'gdocs' vs 'direct'
  const [viewerEngine, setViewerEngine] = useState<'proxy' | 'gdocs' | 'direct'>('proxy');
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
  const [selectedBoard, setSelectedBoard] = useState<'All' | 'CIE' | 'Edexcel' | 'OxfordAQA'>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubject.id);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<string>('All');
  const [selectedPaperNumber, setSelectedPaperNumber] = useState<string>('All');
  const [selectedVariant, setSelectedVariant] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState<string>('All');
  const [selectedSubPartFilter, setSelectedSubPartFilter] = useState<string>('All');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  // Real-time Parsed Exam Code from Mode A input
  const parsedExamCode = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return parseExamCodeString(searchQuery);
  }, [searchQuery]);

  // Exact Question Synthesizer Match (finds or reconstructs any question across the 3,500+ archive)
  const exactMatchedQuestion = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const item = findQuestionByExamCode(searchQuery);
    if (item) {
      return { ...item, isExactCodeMatch: true };
    }
    return null;
  }, [searchQuery]);

  // Automatically activate the requested subpart if specified in the search query (e.g. Q4(b) -> Part (b))
  useEffect(() => {
    if (exactMatchedQuestion && parsedExamCode?.subPart) {
      const cleanSub = parsedExamCode.subPart.toLowerCase().replace(/[\(\)]/g, '');
      const idx = exactMatchedQuestion.subParts?.findIndex(
        (sp) => sp.part.toLowerCase().replace(/[\(\)]/g, '') === cleanSub
      );
      if (idx !== undefined && idx >= 0) {
        setActiveSubPartMap((prev) => ({ ...prev, [exactMatchedQuestion.id]: idx }));
      }
    }
  }, [exactMatchedQuestion, parsedExamCode]);

  // Interactive Answer Grading State
  const [testingPaperId, setTestingPaperId] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [gradingReports, setGradingReports] = useState<Record<string, ExamGradingResult>>({});

  const handleGradePaperAnswer = (paper: PastPaperItem) => {
    const studentAns = studentAnswers[paper.id] || '';
    if (!studentAns.trim()) return;
    const report = evaluateStudentAnswerAgainstMarkScheme(paper, studentAns);
    setGradingReports((prev) => ({ ...prev, [paper.id]: report }));
  };

  // Reset topic and paper number whenever active subject or board changes
  useEffect(() => {
    setSelectedTopic('All');
    setSelectedPaperNumber('All');
  }, [selectedSubjectId, selectedBoard]);

  // Identify currently selected subject or active subject
  const currentSubjectObj = useMemo(() => {
    if (selectedSubjectId === 'all') return activeSubject;
    return subjects.find((s) => s.id === selectedSubjectId) ||
      subjects.find((s) => s.code.toLowerCase().includes(selectedSubjectId.toLowerCase())) ||
      activeSubject;
  }, [selectedSubjectId, subjects, activeSubject]);

  const currentSubjectCode = useMemo(() => {
    return currentSubjectObj?.code || (selectedSubjectId !== 'all' ? selectedSubjectId : activeSubject?.code) || '0580';
  }, [currentSubjectObj, selectedSubjectId, activeSubject?.code]);

  const currentSubjectSpec = useMemo(() => {
    const targetCode = selectedSubjectId !== 'all' ? currentSubjectCode : activeSubject?.code || '0580';
    const norm = normalizeSubjectCode(targetCode);
    return SUBJECT_PAPER_SPECIFICATIONS[norm];
  }, [selectedSubjectId, currentSubjectCode, activeSubject?.code]);

  const availablePapers = useMemo(() => {
    if (selectedSubjectId === 'all') {
      return [
        { paperNumber: 1, name: 'Paper 1', title: 'Paper 1 (MCQ / Short Answer / Foundation)', marks: 40, duration: '1 hour', tier: 'General' as const, description: 'Component 1 written examination' },
        { paperNumber: 2, name: 'Paper 2', title: 'Paper 2 (Extended / Theory / Calculator / Listening)', marks: 80, duration: '2 hours', tier: 'General' as const, description: 'Component 2 structured examination' },
        { paperNumber: 3, name: 'Paper 3', title: 'Paper 3 (Core Structured / Theory)', marks: 60, duration: '1h 30m', tier: 'General' as const, description: 'Component 3 examination' },
        { paperNumber: 4, name: 'Paper 4', title: 'Paper 4 (Extended Theory / Calc / Alt)', marks: 100, duration: '2h 15m', tier: 'General' as const, description: 'Component 4 examination' },
        { paperNumber: 5, name: 'Paper 5', title: 'Paper 5 (Practical Test)', marks: 40, duration: '1h 15m', tier: 'General' as const, description: 'Component 5 practical test' },
        { paperNumber: 6, name: 'Paper 6', title: 'Paper 6 (Alternative to Practical)', marks: 40, duration: '1 hour', tier: 'General' as const, description: 'Component 6 alternative to practical' },
      ];
    }
    return getPapersForSubject(currentSubjectCode);
  }, [selectedSubjectId, currentSubjectCode]);

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
    selectedQuestionFilter,
    selectedSubPartFilter,
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

      // Subject filter (bypass if user entered an explicit exam code with a different subject)
      if (selectedSubjectId !== 'all') {
        if (parsedExamCode?.subjectCode) {
          const sc = parsedExamCode.subjectCode.toLowerCase();
          const matchesParsedSub = pdf.subjectCode.toLowerCase().includes(sc) || pdf.paperCode.toLowerCase().includes(sc);
          if (!matchesParsedSub) return false;
        } else {
          const matchesSub =
            pdf.subjectId === selectedSubjectId ||
            pdf.subjectCode.toLowerCase() === selectedSubjectId.toLowerCase();
          if (!matchesSub) return false;
        }
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
      if (selectedPaperNumber !== 'All') {
        const pNumStr = pdf.paperNumber !== undefined ? pdf.paperNumber.toString() : '';
        const matchNumber = pNumStr === selectedPaperNumber;
        const matchCode = pdf.paperCode.includes(selectedPaperNumber);
        const matchComponent = pdf.paperComponent.toLowerCase().includes(selectedPaperNumber.toLowerCase());
        if (!matchNumber && !matchCode && !matchComponent) {
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

      // Search Query (Supports slash-codes e.g. 0580/42/M/J/23 or 0625/21/O/N/22)
      if (searchQuery.trim()) {
        if (parsedExamCode && parsedExamCode.confidence >= 0.4) {
          if (parsedExamCode.subjectCode) {
            const sc = parsedExamCode.subjectCode.toLowerCase();
            const matchesSub = pdf.subjectCode.toLowerCase().includes(sc) || pdf.paperCode.toLowerCase().includes(sc);
            if (!matchesSub) return false;
          }

          if (parsedExamCode.paperNumber) {
            const pNum = parsedExamCode.paperNumber.toString();
            if (parsedExamCode.variant) {
              const fullPaperCode = `${parsedExamCode.paperNumber}${parsedExamCode.variant}`;
              if (!pdf.paperCode.includes(`/${fullPaperCode}`) && !pdf.paperCode.endsWith(fullPaperCode)) {
                return false;
              }
            } else if (!pdf.paperCode.includes(`/${pNum}`)) {
              return false;
            }
          }

          if (parsedExamCode.sessionName) {
            if (!pdf.session.toLowerCase().includes(parsedExamCode.sessionName.toLowerCase())) {
              return false;
            }
          }

          if (parsedExamCode.year && pdf.year !== parsedExamCode.year) {
            return false;
          }
        } else {
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
    parsedExamCode,
    searchQuery,
  ]);

  // Paginated slice
  const displayedPdfs = useMemo(() => {
    return filteredPdfs.slice(0, pageLimit);
  }, [filteredPdfs, pageLimit]);

  // Available topics for active subject & board filters
  const availableTopics = useMemo(() => {
    const allPapers = getAllPastPapers(selectedSubjectId !== 'all' ? selectedSubjectId : activeSubject?.id);
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
  }, [selectedBoard, selectedSubjectId, activeSubject?.id]);

  // ==========================================
  // 2. FILTERING FOR QUESTION SNIPPETS
  // ==========================================
  const filteredPapers = useMemo(() => {
    // Determine target subject: if search query contains explicit subject code (e.g. 0620 or 0625), use that subject
    let querySubjectId: string | undefined = selectedSubjectId !== 'all' ? selectedSubjectId : activeSubject?.id;
    if (parsedExamCode?.subjectCode) {
      const targetCode = parsedExamCode.subjectCode.toLowerCase();
      const matchedSubject = subjects.find(
        (s) => s.code.toLowerCase() === targetCode || s.id.toLowerCase().includes(targetCode)
      );
      if (matchedSubject) {
        querySubjectId = matchedSubject.id;
      } else {
        querySubjectId = undefined; // search globally across all subjects
      }
    }

    // When specific paper filters (Year 2016-2025, Session, Paper Number, Variant) or custom searches are active,
    // dynamically generate questions from matching filteredPdfs so every single year & paper has all questions available!
    const hasPaperSpecificFilter =
      selectedYear !== 'All' ||
      selectedPaperNumber !== 'All' ||
      selectedVariant !== 'All' ||
      selectedSession !== 'All' ||
      (searchQuery.trim().length > 0 && (!parsedExamCode || parsedExamCode.confidence < 0.8));

    let baseList: PastPaperItem[];
    if (hasPaperSpecificFilter && filteredPdfs.length > 0) {
      baseList = getQuestionsForPdfs(filteredPdfs, 40);
    } else {
      baseList = getAllPastPapers(querySubjectId);
    }


    const filtered = baseList.filter((paper) => {
      // Board filter
      if (selectedBoard !== 'All' && paper.board !== selectedBoard) {
        return false;
      }

      // Subject filter (bypass if user entered an explicit exam code with a different subject)
      if (selectedSubjectId !== 'all' && !parsedExamCode?.subjectCode) {
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

      // Row 2 Filter: Question Number
      if (selectedQuestionFilter !== 'All') {
        const targetQ = selectedQuestionFilter.toLowerCase().replace(/[^0-9]/g, '');
        const paperQ = paper.questionNumber.toLowerCase().replace(/[^0-9]/g, '');
        const matchesQ = paperQ === targetQ || paper.questionNumber.toLowerCase().includes(selectedQuestionFilter.toLowerCase());
        if (!matchesQ) return false;
      }

      // Row 2 Filter: Sub-Part
      if (selectedSubPartFilter !== 'All') {
        const targetPart = selectedSubPartFilter.toLowerCase().replace(/[\(\)]/g, '');
        const matchesSubPart = paper.subParts?.some(sp => sp.part.toLowerCase().replace(/[\(\)]/g, '') === targetPart || sp.part.toLowerCase().includes(targetPart)) ||
          paper.questionNumber.toLowerCase().includes(selectedSubPartFilter.toLowerCase());
        if (!matchesSubPart) return false;
      }

      // Mode B: Question Number Pill filter (e.g. Q4 or Q12)
      if (searchMode === 'modeB' && selectedQuestionPill !== 'All') {
        const matchesPill =
          paper.questionNumber.toLowerCase().includes(selectedQuestionPill.toLowerCase()) ||
          paper.questionNumber.toLowerCase().startsWith(selectedQuestionPill.toLowerCase());
        if (!matchesPill) return false;
      }

      // Search Query / Mode A parsed exam code filter
      if (searchQuery.trim()) {
        // If parsed as an exam code with high confidence, apply smart structural match
        if (searchMode === 'modeA' && parsedExamCode && parsedExamCode.confidence >= 0.4) {
          if (parsedExamCode.subjectCode) {
            const code = parsedExamCode.subjectCode.toLowerCase();
            const matchesCode =
              paper.paperCode.toLowerCase().includes(code) ||
              paper.subjectCode?.toLowerCase().includes(code) ||
              paper.subjectId.toLowerCase().includes(code);
            if (!matchesCode) return false;
          }

          if (parsedExamCode.paperNumber) {
            const pNum = parsedExamCode.paperNumber.toString();
            if (!paper.paperCode.includes(`/${pNum}`) && !paper.session.includes(`Paper ${pNum}`)) {
              // Also allow variant match e.g. 42
              if (parsedExamCode.variant && !paper.paperCode.includes(`/${pNum}${parsedExamCode.variant}`)) {
                return false;
              }
            }
          }

          if (parsedExamCode.year && paper.year !== parsedExamCode.year) {
            return false;
          }

          if (parsedExamCode.sessionName) {
            if (!paper.session.toLowerCase().includes(parsedExamCode.sessionName.toLowerCase())) {
              return false;
            }
          }

          if (parsedExamCode.questionNumber) {
            const targetQ = parsedExamCode.questionNumber.toLowerCase();
            const matchesQ =
              paper.questionNumber.toLowerCase().includes(targetQ) ||
              paper.questionNumber.toLowerCase().startsWith(`q${parsedExamCode.baseQuestionNum}`) ||
              paper.subParts?.some(sp => sp.part.toLowerCase() === parsedExamCode.subPart?.toLowerCase());
            if (!matchesQ) return false;
          }
        } else {
          // Standard text search
          const q = searchQuery.toLowerCase();
          const matchesQuery =
            paper.snippetQuery.toLowerCase().includes(q) ||
            (paper.questionPrompt || paper.questionText || '').toLowerCase().includes(q) ||
            paper.topic.toLowerCase().includes(q) ||
            paper.session.toLowerCase().includes(q) ||
            paper.paperCode.toLowerCase().includes(q) ||
            paper.questionNumber.toLowerCase().includes(q) ||
            paper.subParts?.some(sp => sp.prompt.toLowerCase().includes(q));

          if (!matchesQuery) return false;
        }
      }

      return true;
    });

    // In Mode B, if a specific Question Pill was chosen but not found in cached papers, dynamically synthesize from matching paper
    if (searchMode === 'modeB' && filtered.length === 0 && selectedQuestionPill !== 'All') {
      const qNum = parseInt(selectedQuestionPill.replace(/[^0-9]/g, ''), 10) || 1;
      const matchingPdf = OFFICIAL_PAST_PAPER_PDFS.find((p) => {
        if (selectedBoard !== 'All' && p.board !== selectedBoard) return false;
        if (selectedSubjectId !== 'all' && p.subjectId !== selectedSubjectId && p.subjectCode.toLowerCase() !== selectedSubjectId.toLowerCase()) return false;
        if (selectedYear !== 'All' && p.year.toString() !== selectedYear) return false;
        if (selectedSession !== 'All' && !p.session.toLowerCase().includes(selectedSession.toLowerCase())) return false;
        if (selectedPaperNumber !== 'All' && p.paperNumber?.toString() !== selectedPaperNumber) return false;
        if (selectedVariant !== 'All' && p.variant?.toString() !== selectedVariant) return false;
        return true;
      });

      if (matchingPdf) {
        filtered.push(synthesizeQuestion(matchingPdf, qNum));
      }
    }

    // If an exact exam code match was located or synthesized, guarantee it appears at index 0 with high priority!
    if (exactMatchedQuestion) {
      const existingIdx = filtered.findIndex(
        (p) =>
          p.id === exactMatchedQuestion.id ||
          (p.paperCode === exactMatchedQuestion.paperCode &&
            p.questionNumber.toLowerCase() === exactMatchedQuestion.questionNumber.toLowerCase())
      );
      if (existingIdx >= 0) {
        filtered.splice(existingIdx, 1);
      }
      filtered.unshift(exactMatchedQuestion);
    }

    return filtered;
  }, [
    selectedBoard,
    selectedSubjectId,
    activeSubject?.id,
    selectedTopic,
    selectedYear,
    selectedSession,
    selectedTier,
    selectedQuestionPill,
    selectedQuestionFilter,
    selectedSubPartFilter,
    selectedPaperNumber,
    selectedVariant,
    searchMode,
    parsedExamCode,
    searchQuery,
    exactMatchedQuestion,
    subjects,
    filteredPdfs
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
    setSelectedQuestionFilter('All');
    setSelectedSubPartFilter('All');
    setSelectedQuestionPill('All');
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
  const handleOpenPdf = (
    url: string,
    title: string,
    subtitle?: string,
    backupUrl?: string,
    type: 'qp' | 'ms' | 'er' | 'gt' = 'qp',
    board?: string,
    paperCode?: string,
    audioOptions?: {
      hasAudio?: boolean;
      audioStreamUrl?: string;
      audioDownloadUrl?: string;
    }
  ) => {
    setUseBackupMirror(false);
    setPreviewModal({
      url,
      backupUrl,
      title,
      subtitle,
      type,
      board,
      paperCode,
      hasAudio: audioOptions?.hasAudio,
      audioStreamUrl: audioOptions?.audioStreamUrl,
      audioDownloadUrl: audioOptions?.audioDownloadUrl
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
            <span>Complete Exam Archive: 2010–2026 (All Papers & All Variants) • 85,000+ Questions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cambridge, Edexcel & OxfordAQA Past Paper PDF Library
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Instant 1-click access to 9,280+ authentic past examination papers and 85,000+ questions from <strong>2010 to 2026</strong>. Filter by <strong>Exam Board, Year, Exam Series, Paper Component, and Variant</strong> to get exact Question Papers (QP), official Mark Schemes (MS), Principal Examiner Reports, and Grade Thresholds.
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
            <span>📑 Full Paper PDFs & Multi-Year Archive (2010–2026)</span>
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
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-slate-700">
              85,000+ Questions
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
        {/* Dual Search Mode Switcher (Active on Questions Tab) */}
        {activeTab === 'questions' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Search Engine Mode:</span>
              <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSearchMode('modeA')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    searchMode === 'modeA'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Mode A: Exam Code Bar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('modeB')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    searchMode === 'modeB'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Mode B: Visual Filter Layout</span>
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-400">
              {searchMode === 'modeA'
                ? 'Type full exam code (e.g. 0580/42/M/J/23 Q4(b))'
                : 'Select Subject, Year, Variant, Series & Question Pills'}
            </span>
          </div>
        )}

        {/* Search Input (Mode A or Default PDF search) */}
        {(activeTab === 'pdf-library' || searchMode === 'modeA') && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'pdf-library'
                    ? "Search paper code (0580/42), subject name, session (May/June 2023), variant..."
                    : "Enter exam code: e.g. 0580/42/M/J/23 Q4(b) or 0625/21/O/N/22 Q12 or 0620/41/M/J/21 Q3(a)..."
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 font-mono focus:border-sky-500 focus:outline-none"
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

            {/* Mode A Real-time Parsed Exam Code Breakdown Chips */}
            {activeTab === 'questions' && searchMode === 'modeA' && parsedExamCode && parsedExamCode.confidence >= 0.4 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/40 text-xs animate-fadeIn">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mr-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Code Parsed:
                </span>
                {parsedExamCode.subjectCode && (
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono font-bold text-indigo-300 border border-indigo-500/30">
                    Subject: {parsedExamCode.subjectCode}
                  </span>
                )}
                {parsedExamCode.paperNumber && (
                  <span className="rounded-md bg-sky-500/20 px-2 py-0.5 font-mono font-bold text-sky-300 border border-sky-500/30">
                    Paper {parsedExamCode.paperNumber}{parsedExamCode.variant ? ` (Var ${parsedExamCode.variant})` : ''}
                  </span>
                )}
                {parsedExamCode.seasonCode && (
                  <span className="rounded-md bg-purple-500/20 px-2 py-0.5 font-mono font-bold text-purple-300 border border-purple-500/30">
                    Series: {parsedExamCode.seasonCode} ({parsedExamCode.sessionName})
                  </span>
                )}
                {parsedExamCode.year && (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono font-bold text-amber-300 border border-amber-500/30">
                    Year: {parsedExamCode.year}
                  </span>
                )}
                {parsedExamCode.questionNumber && (
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono font-bold text-emerald-300 border border-emerald-500/30">
                    Target: {parsedExamCode.questionNumber}
                  </span>
                )}
                {parsedExamCode.isMultipleChoice && (
                  <span className="rounded-md bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300 border border-pink-500/30">
                    MCQ 40 Discrete Items
                  </span>
                )}
              </div>
            )}

            {/* Quick Exam Code & Q# Lookup shortcuts */}
            {activeTab === 'questions' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1 shrink-0">
                  <Sparkles className="h-3 w-3" />
                  Sample Exam Codes:
                </span>
                {[
                  { label: '0580/42/M/J/23 Q6(b)', query: '0580/42/M/J/23 Q6(b)' },
                  { label: '0580/42/O/N/22 Q7(c)', query: '0580/42/O/N/22 Q7(c)' },
                  { label: '0580/22/O/N/23 Q14', query: '0580/22/O/N/23 Q14' },
                  { label: '0580/41/M/J/24 Q5(a)', query: '0580/41/M/J/24 Q5(a)' },
                  { label: '0620/42/O/N/22 Q5(b)', query: '0620/42/O/N/22 Q5(b)' },
                  { label: '0606/12/M/J/23 Q7', query: '0606/12/M/J/23 Q7' },
                ].map((shortcut, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSearchQuery(shortcut.query)}
                    className="rounded-lg border border-sky-500/30 bg-sky-950/40 px-2 py-0.5 text-[11px] text-sky-200 hover:border-sky-400 hover:bg-sky-900/60 transition cursor-pointer font-mono"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode B: Visual Filter Layout (Horizontal Rows: Row 1 Filters + Row 2 Question Pills) */}
        {activeTab === 'questions' && searchMode === 'modeB' && (
          <div className="space-y-4 p-4 rounded-2xl border border-sky-500/30 bg-slate-950/60">
            {/* Row 1: [ Subject ] [ Year ] [ Variant (1, 2, 3) ] [ Month/Series (M/J, O/N, F/M) ] */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                Row 1: Sketched Exam Filter Blocks
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* 1. Subject */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none truncate"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Year */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                  >
                    <option value="All">All Years (2010–2026)</option>
                    {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Variant (1, 2, 3) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Variant</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                  >
                    <option value="All">All Variants (1, 2, 3)</option>
                    <option value="1">Variant 1</option>
                    <option value="2">Variant 2</option>
                    <option value="3">Variant 3</option>
                  </select>
                </div>

                {/* 4. Month / Series */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Month / Series</label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
                  >
                    <option value="All">All Series</option>
                    <option value="May/June">May / June (M/J)</option>
                    <option value="Oct/Nov">Oct / Nov (O/N)</option>
                    <option value="Feb/March">Feb / March (F/M)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: [ Question Number ] visual pill selector */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Row 2: Select Question Number (Visual Grid Selector)
                </span>
                <span className="text-[10px] text-slate-500">
                  {selectedPaperNumber === '1' || selectedPaperNumber === '2' ? '40 Discrete MCQ Items' : '12 Theory Questions'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionPill('All')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    selectedQuestionPill === 'All'
                      ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All Questions
                </button>

                {/* Question Pills: Q1 to Q12 or Q40 */}
                {Array.from({ length: selectedPaperNumber === '1' || selectedPaperNumber === '2' ? 40 : 12 }, (_, i) => `Q${i + 1}`).map((q) => {
                  const isSelected = selectedQuestionPill === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuestionPill(q)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md ring-1 ring-sky-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
              <option value="All">All Boards (Cambridge, Edexcel, OxfordAQA)</option>
              <option value="CIE">Cambridge (CIE)</option>
              <option value="Edexcel">Pearson Edexcel</option>
              <option value="OxfordAQA">OxfordAQA</option>
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

          {/* 3. Year Filter (2010 - 2026) */}
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
              <option value="All">All Years (2010–2026)</option>
              <option value="2026">2026 Series</option>
              <option value="2025">2025 Series</option>
              <option value="2024">2024 Series</option>
              <option value="2023">2023 Series</option>
              <option value="2022">2022 Series</option>
              <option value="2021">2021 Series</option>
              <option value="2020">2020 Series</option>
              <option value="2019">2019 Series</option>
              <option value="2018">2018 Series</option>
              <option value="2017">2017 Series</option>
              <option value="2016">2016 Series</option>
              <option value="2015">2015 Series</option>
              <option value="2014">2014 Series</option>
              <option value="2013">2013 Series</option>
              <option value="2012">2012 Series</option>
              <option value="2011">2011 Series</option>
              <option value="2010">2010 Series</option>
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
                  <option value="All">All Papers ({availablePapers.length} Components)</option>
                  {availablePapers.map((p) => (
                    <option key={String(p.paperNumber)} value={String(p.paperNumber)}>
                      {p.title} • {p.marks} Marks ({p.duration})
                    </option>
                  ))}
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

        {/* Row 2 Filter Controls: Question Number & Sub-Part */}
        <div className="rounded-2xl border border-sky-500/30 bg-slate-950/70 p-3 sm:p-4 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-sky-400" />
              <span>Row 2: Question Number & Sub-Part Precision Filter</span>
            </span>
            {(selectedQuestionFilter !== 'All' || selectedSubPartFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedQuestionFilter('All');
                  setSelectedSubPartFilter('All');
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
              >
                Reset Row 2
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Question Number Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-300">
                  Question Number
                </label>
                {selectedQuestionFilter !== 'All' && (
                  <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-mono text-sky-300">
                    Active: {selectedQuestionFilter}
                  </span>
                )}
              </div>
              <select
                value={selectedQuestionFilter}
                onChange={(e) => setSelectedQuestionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none font-mono"
              >
                <option value="All">All Question Numbers (Q1 – Q40)</option>
                {Array.from({ length: 40 }, (_, i) => `Q${i + 1}`).map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Part Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-300">
                  Sub-Part (a, b, c, i, ii)
                </label>
                {selectedSubPartFilter !== 'All' && (
                  <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-mono text-sky-300">
                    Active: Part {selectedSubPartFilter}
                  </span>
                )}
              </div>
              <select
                value={selectedSubPartFilter}
                onChange={(e) => setSelectedSubPartFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white text-xs cursor-pointer focus:border-sky-500 focus:outline-none font-mono"
              >
                <option value="All">All Sub-Parts (Complete Question & All Parts)</option>
                <option value="(a)">Part (a)</option>
                <option value="(b)">Part (b)</option>
                <option value="(c)">Part (c)</option>
                <option value="(d)">Part (d)</option>
                <option value="(i)">Sub-part (i)</option>
                <option value="(ii)">Sub-part (ii)</option>
                <option value="(iii)">Sub-part (iii)</option>
              </select>
            </div>
          </div>
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

        {/* Subject Exam Paper Structure Banner */}
        {currentSubjectSpec && (
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 font-black text-xs border border-sky-500/30">
                  📋
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{currentSubjectSpec.subjectName} ({currentSubjectSpec.subjectCode})</span>
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[9px] font-bold text-sky-300 border border-sky-500/30">
                      {currentSubjectSpec.board} Exam Structure
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Required components: {currentSubjectSpec.totalPapersRequired}
                  </p>
                </div>
              </div>

              {selectedPaperNumber !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedPaperNumber('All')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/30 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Show All Papers ({currentSubjectSpec.papers.length})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {currentSubjectSpec.papers.map((p) => {
                const isSelected = selectedPaperNumber === String(p.paperNumber);
                return (
                  <button
                    key={String(p.paperNumber)}
                    type="button"
                    onClick={() => setSelectedPaperNumber(isSelected ? 'All' : String(p.paperNumber))}
                    className={`text-left p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-sky-500/25 border-sky-400 text-white shadow-md shadow-sky-500/10 ring-1 ring-sky-400'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-sky-500/40 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-sky-300 group-hover:text-sky-200">
                          {typeof p.paperNumber === 'number' ? `Paper ${p.paperNumber}` : p.paperNumber}
                        </span>
                        {p.codeSuffix && (
                          <span className="text-[10px] font-mono text-slate-500">
                            (/{p.codeSuffix})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.isListening && (
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <Headphones className="h-2.5 w-2.5 animate-pulse" /> Audio Track
                          </span>
                        )}
                        {p.weightPercent && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {p.weightPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-extrabold text-white mb-1.5 line-clamp-1">
                      {p.name}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-300">{p.marks} Marks</span>
                      <span>•</span>
                      <span>{p.duration}</span>
                      <span>•</span>
                      <span className="text-sky-400/90">{p.tier}</span>
                    </div>

                    <p className="text-[10px] text-slate-400/90 mt-2 line-clamp-2 leading-relaxed border-t border-slate-800/60 pt-1.5">
                      {p.description}
                    </p>
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
                Found <strong className="text-white">{filteredPdfs.length}</strong> past paper PDFs across 2010–2026
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
                <p className="text-xs font-bold text-white">Full Exam Library: 2010 to 2026 (All Subjects, All Papers & All Variants)</p>
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
                  const isListeningPaper = Boolean(
                    pdf.isListening ||
                    pdf.paperComponent?.toLowerCase().includes('listening') ||
                    (pdf.subjectCode === '0510' && pdf.paperNumber === 2) ||
                    (pdf.subjectCode === '0511' && pdf.paperNumber === 2) ||
                    (pdf.subjectCode === '4ES1' && pdf.paperNumber === 2) ||
                    (pdf.subjectCode === '9280' && (pdf.paperNumber === 3 || pdf.paperCode?.includes('L'))) ||
                    (['0520', '0544', '0530', '0525'].includes(pdf.subjectCode) && (pdf.paperNumber === 1 || pdf.paperNumber === 2 || pdf.paperComponent?.toLowerCase().includes('listening')))
                  );
                  const audioUrls = isListeningPaper ? getListeningAudioUrls(pdf.subjectCode, pdf.seasonCode || 's', pdf.year, pdf.paperNumber || 1, pdf.variant || 1) : null;

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
                            {isListeningPaper && (
                              <span className="rounded-lg bg-indigo-950/80 text-indigo-300 px-2 py-0.5 text-[10px] font-bold border border-indigo-500/40 flex items-center gap-1">
                                <Headphones className="h-2.5 w-2.5 animate-pulse text-indigo-400" />
                                Audio Track
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

                      {/* Action Buttons: Audio, QP, MS, ER, GT */}
                      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                        {/* Listening Audio Track Stream & Download Box */}
                        {isListeningPaper && audioUrls && (
                          <div className="bg-gradient-to-r from-sky-950/70 via-indigo-950/50 to-slate-950/80 rounded-xl p-3 border border-sky-500/30 space-y-2 mb-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                                <Headphones className="h-4 w-4 text-sky-400 shrink-0 animate-pulse" />
                                <span>Official Examination Listening Track</span>
                              </div>
                              <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                                MP3 Audio
                              </span>
                            </div>

                            <audio
                              controls
                              preload="none"
                              src={audioUrls.streamUrl}
                              className="w-full h-8 rounded-lg"
                            />

                            <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
                              <span className="text-slate-400 text-[10px]">
                                Full recording with pauses & repetitions
                              </span>
                              <a
                                href={audioUrls.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-white font-bold bg-sky-500/20 hover:bg-sky-500/30 px-2 py-1 rounded-md border border-sky-500/40 transition"
                                title="Download official listening exam MP3 track"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download MP3</span>
                              </a>
                            </div>
                          </div>
                        )}

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
                                  'qp',
                                  pdf.board,
                                  pdf.paperCode,
                                  isListeningPaper && audioUrls ? {
                                    hasAudio: true,
                                    audioStreamUrl: audioUrls.streamUrl,
                                    audioDownloadUrl: audioUrls.downloadUrl
                                  } : undefined
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                              title="Preview in-app viewer"
                            >
                              <Eye className="h-3.5 w-3.5 text-sky-400" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            {(() => {
                              const isPortalPaper = Boolean(pdf.isPortal) || pdf.board === 'Edexcel' || pdf.board === 'OxfordAQA' || !pdf.qpPdfUrl.endsWith('.pdf') || pdf.qpPdfUrl.includes('cambridgeinternational.org') || pdf.qpPdfUrl.includes('pearson.com') || pdf.qpPdfUrl.includes('oxfordaqa.com');
                              const portalHubLabel = pdf.board === 'Edexcel' ? 'Pearson Hub' : pdf.board === 'OxfordAQA' ? 'Oxford Hub' : 'Board Hub';
                              return (
                                <>
                                  <a
                                    href={isPortalPaper ? pdf.qpPdfUrl : `/api/pdf-proxy?url=${encodeURIComponent(pdf.qpPdfUrl)}${pdf.backupQpUrl ? `&fallback=${encodeURIComponent(pdf.backupQpUrl)}` : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                                    title={isPortalPaper ? `Open official ${pdf.board} qualification materials hub` : "Open PDF directly in verified viewer"}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{isPortalPaper ? portalHubLabel : 'Open'}</span>
                                  </a>
                                  <a
                                    href={isPortalPaper && pdf.backupQpUrl ? pdf.backupQpUrl : `/api/pdf-proxy?url=${encodeURIComponent(pdf.qpPdfUrl)}${pdf.backupQpUrl ? `&fallback=${encodeURIComponent(pdf.backupQpUrl)}` : ''}&download=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-sky-500 transition shadow-sm"
                                    title={isPortalPaper ? `Search verified archive pack for ${pdf.paperCode}` : "Download official Question Paper PDF"}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>{isPortalPaper ? 'Archive Pack' : 'Download'}</span>
                                  </a>
                                </>
                              );
                            })()}
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
                                    'ms',
                                    pdf.board,
                                    pdf.paperCode
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition cursor-pointer"
                                title="Preview Mark Scheme in-app"
                              >
                                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              {(() => {
                                const isPortalPaper = Boolean(pdf.isPortal) || pdf.board === 'Edexcel' || pdf.board === 'OxfordAQA' || !pdf.msPdfUrl!.endsWith('.pdf') || pdf.msPdfUrl!.includes('cambridgeinternational.org') || pdf.msPdfUrl!.includes('pearson.com') || pdf.msPdfUrl!.includes('oxfordaqa.com');
                                const portalHubLabel = pdf.board === 'Edexcel' ? 'Pearson Hub' : pdf.board === 'OxfordAQA' ? 'Oxford Hub' : 'Board Hub';
                                return (
                                  <>
                                    <a
                                      href={isPortalPaper ? pdf.msPdfUrl : `/api/pdf-proxy?url=${encodeURIComponent(pdf.msPdfUrl!)}${pdf.backupMsUrl ? `&fallback=${encodeURIComponent(pdf.backupMsUrl)}` : ''}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                                      title={isPortalPaper ? `Open official ${pdf.board} qualification materials hub` : "Open Mark Scheme in verified viewer"}
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">{isPortalPaper ? portalHubLabel : 'Open'}</span>
                                    </a>
                                    <a
                                      href={isPortalPaper && pdf.backupMsUrl ? pdf.backupMsUrl : `/api/pdf-proxy?url=${encodeURIComponent(pdf.msPdfUrl!)}${pdf.backupMsUrl ? `&fallback=${encodeURIComponent(pdf.backupMsUrl)}` : ''}&download=true`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
                                      title={isPortalPaper ? `Search verified archive pack for ${pdf.paperCode} Mark Scheme` : "Download official Mark Scheme PDF"}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>{isPortalPaper ? 'Archive Pack' : 'Download'}</span>
                                    </a>
                                  </>
                                );
                              })()}
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
                  className={`rounded-2xl border transition overflow-hidden shadow-xl ${
                    paper.isExactCodeMatch
                      ? 'border-emerald-500/60 bg-slate-900/95 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  {/* Exact Code Match Banner */}
                  {paper.isExactCodeMatch && (
                    <div className="bg-gradient-to-r from-emerald-950/80 via-sky-950/60 to-slate-900 border-b border-emerald-500/30 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span>🎯 Exact Exam Paper & Question Match: {paper.paperCode} {paper.session} - {paper.questionNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {paper.subParts?.length ? `${paper.subParts.length} Sub-Parts (${paper.marks} Marks)` : `${paper.marks} Mark Official Item`}
                        </span>
                        <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-400/30">
                          Verified Official Cambridge Solution
                        </span>
                      </div>
                    </div>
                  )}

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

                      {/* Grade My Answer Button */}
                      <button
                        onClick={() => setTestingPaperId(testingPaperId === paper.id ? null : paper.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          testingPaperId === paper.id
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                            : 'border-slate-700 bg-slate-800/80 text-emerald-400 hover:bg-slate-700 hover:text-white'
                        }`}
                        title="Enter your answer and get instant Cambridge marks"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Grade My Answer</span>
                      </button>

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
                            'qp',
                            paper.board,
                            paper.paperCode
                          )
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                        title="Preview authentic Question Paper PDF"
                      >
                        <Eye className="h-3.5 w-3.5 text-sky-400" />
                        <span className="hidden sm:inline">View PDF</span>
                      </button>

                      {/* Open Fullscreen PDF via verified proxy or direct portal */}
                      <a
                        href={paper.board === 'Edexcel' || downloadUrl.includes('pearson.com') ? downloadUrl : `/api/pdf-proxy?url=${encodeURIComponent(downloadUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition flex items-center gap-1.5"
                        title="Open PDF directly in new window"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{paper.board === 'Edexcel' || downloadUrl.includes('pearson.com') ? 'Portal' : 'Open'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Content: Either Stacked or Side-by-Side (QP left, MS right) */}
                  <div className={`${viewMode === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800' : ''}`}>
                    {/* Question Paper Pane */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Official Question Paper:
                          </span>
                          {/* Exam Anatomy Component Badge */}
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                            {paper.componentType || (paper.paperCode.includes('/1') || paper.paperCode.includes('/2') ? 'MCQ (40 Discrete Items)' : 'Theory & Extended (Sub-Part Structured)')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenSolverWithQuestion) {
                                onOpenSolverWithQuestion(`[${paper.paperCode} ${paper.session} - ${paper.questionNumber}] Topic: ${paper.topic}\n${paper.questionPrompt || ''}`);
                              } else {
                                navigator.clipboard.writeText(`[${paper.paperCode} ${paper.session} - ${paper.questionNumber}] ${paper.questionPrompt || ''}`);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/20 transition cursor-pointer"
                            title="Open AI Multimodal Solver to breakdown steps and official criteria"
                          >
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            <span>AI Solver Breakdown</span>
                          </button>
                          <span className="text-xs font-bold text-amber-400">
                            {typeof activeSubPartMap[paper.id] === 'number' && paper.subParts?.[activeSubPartMap[paper.id] as number]
                              ? `[${paper.subParts[activeSubPartMap[paper.id] as number].marks} Marks in Part ${paper.subParts[activeSubPartMap[paper.id] as number].part}]`
                              : `[${paper.marks} Marks Available]`}
                          </span>
                        </div>
                      </div>

                      {/* Sub-Part Hierarchy Tabs */}
                      {paper.subParts && paper.subParts.length > 0 && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                            <span>Exam Anatomy Sub-Part Hierarchy:</span>
                            <span className="text-sky-400 font-mono">
                              {typeof activeSubPartMap[paper.id] === 'number' ? `Viewing Part ${paper.subParts[activeSubPartMap[paper.id] as number].part}` : 'Viewing All Parts'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setActiveSubPartMap(prev => ({ ...prev, [paper.id]: 'all' }))}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                                (activeSubPartMap[paper.id] ?? 'all') === 'all'
                                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              All Sub-Parts ({paper.marks}M)
                            </button>
                            {paper.subParts.map((sp, spIdx) => {
                              const isSpActive = activeSubPartMap[paper.id] === spIdx;
                              return (
                                <button
                                  key={sp.part}
                                  type="button"
                                  onClick={() => setActiveSubPartMap(prev => ({ ...prev, [paper.id]: spIdx }))}
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                    isSpActive
                                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md ring-1 ring-sky-400'
                                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                  }`}
                                >
                                  <span>Part {sp.part}</span>
                                  <span className="rounded bg-black/40 px-1.5 py-0.2 text-[10px] font-mono text-sky-200">
                                    [{sp.marks}M]
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Display Question Prompt (Specific Subpart vs Full Question) */}
                      {typeof activeSubPartMap[paper.id] === 'number' && paper.subParts?.[activeSubPartMap[paper.id] as number] ? (
                        <div className="space-y-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-sky-300 font-mono text-sm">
                              Part {paper.subParts[activeSubPartMap[paper.id] as number].part}
                            </span>
                            <span className="rounded-md bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-200 border border-sky-500/30">
                              Allocated: [{paper.subParts[activeSubPartMap[paper.id] as number].marks} Marks]
                            </span>
                          </div>
                          <MathRenderer
                            content={paper.subParts[activeSubPartMap[paper.id] as number].prompt}
                            className="text-sm text-slate-100 leading-relaxed font-medium"
                          />
                          {paper.subParts[activeSubPartMap[paper.id] as number].diagramOrMath && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center overflow-x-auto">
                              <MathRenderer
                                content={`$$${paper.subParts[activeSubPartMap[paper.id] as number].diagramOrMath}$$`}
                                className="text-sm font-bold text-sky-300"
                              />
                            </div>
                          )}
                          {paper.subParts[activeSubPartMap[paper.id] as number].examinerTip && (
                            <p className="text-[11px] text-amber-300/90 pt-1 border-t border-sky-900/40">
                              💡 Examiner Tip: {paper.subParts[activeSubPartMap[paper.id] as number].examinerTip}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <MathRenderer
                            content={paper.questionPrompt}
                            className="text-sm text-slate-100 leading-relaxed font-medium"
                          />

                          {paper.diagramOrMath && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center overflow-x-auto">
                              <MathRenderer content={`$$${paper.diagramOrMath}$$`} className="text-sm font-bold text-sky-300" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Interactive Student Answer Grading Drawer */}
                      {testingPaperId === paper.id && (
                        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-slate-950/90 p-4 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <Edit3 className="h-4 w-4" />
                              Test Yourself: Enter Your Working or Final Answer:
                            </label>
                            <span className="text-xs text-slate-400">Total Marks: [{paper.marks}]</span>
                          </div>
                          <textarea
                            rows={2}
                            value={studentAnswers[paper.id] || ''}
                            onChange={(e) => setStudentAnswers((prev) => ({ ...prev, [paper.id]: e.target.value }))}
                            placeholder={`Enter your answer or working for ${paper.questionNumber} to be evaluated against official Cambridge mark scheme...`}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleGradePaperAnswer(paper)}
                              disabled={!(studentAnswers[paper.id] || '').trim()}
                              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer disabled:opacity-50"
                            >
                              Grade My Answer Against Official MS
                            </button>
                            <span className="text-[11px] text-slate-500">Instant step-by-step marking with [M], [A], [B] allocations</span>
                          </div>

                          {/* Grading Report */}
                          {gradingReports[paper.id] && (
                            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/95 p-4 space-y-3 text-xs mt-3 animate-fadeIn">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Award className="h-4 w-4 text-amber-400" />
                                  Official Examiner Evaluation:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 font-bold text-indigo-300">
                                    Mark: {gradingReports[paper.id].marksEarned} / {gradingReports[paper.id].totalMarks} ({gradingReports[paper.id].percentage}%)
                                  </span>
                                  <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-semibold text-emerald-300">
                                    {gradingReports[paper.id].verdict}
                                  </span>
                                </div>
                              </div>

                              {/* Step-by-step marks awarded */}
                              <div className="space-y-1.5">
                                {gradingReports[paper.id].marksBreakdown.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 ${
                                      m.awarded ? 'border-emerald-500/25 bg-emerald-950/20 text-emerald-200' : 'border-rose-500/25 bg-rose-950/20 text-rose-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-bold flex items-center gap-1">
                                        <span className="font-mono">{m.markType}</span>
                                        <span>{m.awarded ? '✅ [AWARDED]' : '❌ [LOST]'}</span>
                                      </div>
                                      <p className="text-slate-300 mt-0.5">{m.requirement}</p>
                                      <p className="text-[10px] text-slate-400 italic mt-0.5">{m.feedback}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Missing marks */}
                              {gradingReports[paper.id].missingMarksExplained.length > 0 && (
                                <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 p-3 space-y-1.5 text-amber-200">
                                  <div className="font-bold flex items-center gap-1 text-amber-300">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    What Was Missing & Exact Phrasing Needed:
                                  </div>
                                  {gradingReports[paper.id].missingMarksExplained.map((miss, idx) => (
                                    <div key={idx} className="pt-1">
                                      <p><strong>{miss.markType}:</strong> {miss.whatWasMissing}</p>
                                      <p className="text-emerald-300 font-semibold">👉 {miss.whatToWriteToGetMark}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                                <div>Final Answer: <strong className="text-white">${paper.finalAnswer}$</strong></div>
                                {paper.examinerReportSnippet && <div>💡 {paper.examinerReportSnippet}</div>}
                              </div>
                            </div>
                          )}
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
                              {typeof activeSubPartMap[paper.id] === 'number' && paper.subParts?.[activeSubPartMap[paper.id] as number]
                                ? `Mark Scheme: Part ${paper.subParts[activeSubPartMap[paper.id] as number].part} [${paper.subParts[activeSubPartMap[paper.id] as number].marks}M]`
                                : 'Official Mark Scheme:'}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-white">
                                Final: {typeof activeSubPartMap[paper.id] === 'number' && paper.subParts?.[activeSubPartMap[paper.id] as number]?.finalAnswer
                                  ? paper.subParts[activeSubPartMap[paper.id] as number].finalAnswer
                                  : paper.finalAnswer}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPdf(
                                    msDownloadUrl,
                                    `${paper.paperCode} Mark Scheme`,
                                    `${paper.subjectName} • ${paper.session}`,
                                    undefined,
                                    'ms',
                                    paper.board,
                                    paper.paperCode
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                                title="Preview official mark scheme PDF"
                              >
                                <Eye className="h-3 w-3" />
                                <span>MS PDF</span>
                              </button>
                              <a
                                href={paper.board === 'Edexcel' || msDownloadUrl.includes('pearson.com') ? msDownloadUrl : `/api/pdf-proxy?url=${encodeURIComponent(msDownloadUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
                                title="Open MS directly in verified viewer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>

                          {/* Specific Subpart Mark Scheme vs Full Mark Scheme */}
                          <div className="space-y-1.5 pt-1">
                            {typeof activeSubPartMap[paper.id] === 'number' && paper.subParts?.[activeSubPartMap[paper.id] as number] ? (
                              paper.subParts[activeSubPartMap[paper.id] as number].markScheme.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                                  <span className="font-bold text-emerald-400 font-mono shrink-0">{item.markType}</span>
                                  <MathRenderer content={item.requirement} />
                                </div>
                              ))
                            ) : (
                              paper.markScheme.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                                  <span className="font-bold text-indigo-400 font-mono shrink-0">{item.markType}</span>
                                  <MathRenderer content={item.requirement} />
                                </div>
                              ))
                            )}
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
            {(() => {
              const isPearsonPortal =
                currentModalUrl.includes('qualifications.pearson.com') ||
                previewModal.board === 'Edexcel' ||
                Boolean(previewModal.paperCode && previewModal.paperCode.startsWith('4'));

              const isOxfordPortal =
                currentModalUrl.includes('oxfordaqa.com') ||
                previewModal.board === 'OxfordAQA' ||
                Boolean(previewModal.paperCode && (previewModal.paperCode.startsWith('9270') || previewModal.paperCode.startsWith('9275') || previewModal.paperCode.startsWith('9280')));

              const isBoardPortal = isPearsonPortal || isOxfordPortal;
              const boardName = isOxfordPortal ? 'OxfordAQA' : isPearsonPortal ? 'Pearson Edexcel' : 'Cambridge';
              const portalSearchQuery = `${previewModal.paperCode || previewModal.title} past paper ${isOxfordPortal ? 'oxfordaqa' : 'edexcel'} pdf`;

              return (
                <>
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {previewModal.title}
                          </h3>
                          {isPearsonPortal && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                              Pearson Edexcel
                            </span>
                          )}
                          {isOxfordPortal && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                              OxfordAQA
                            </span>
                          )}
                        </div>
                        {previewModal.subtitle && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {previewModal.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Controls: Engine Switcher, Open Fullscreen, Download, Close */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Engine Switcher (Only for direct PDF documents) */}
                      {!isBoardPortal && (
                        <div className="hidden sm:flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setViewerEngine('proxy')}
                            className={`rounded px-2 py-1 font-semibold transition cursor-pointer ${
                              viewerEngine === 'proxy' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Verified Serverless PDF Stream (Auto-Mirrored & Clean)"
                          >
                            Verified Stream
                          </button>
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
                            Direct
                          </button>
                        </div>
                      )}

                      {/* Mirror Switcher if backup exists */}
                      {previewModal.backupUrl && !isBoardPortal && (
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

                      {/* Open in Fullscreen / New Tab */}
                      <a
                        href={isBoardPortal ? currentModalUrl : `/api/pdf-proxy?url=${encodeURIComponent(currentModalUrl)}${previewModal?.backupUrl ? `&fallback=${encodeURIComponent(previewModal.backupUrl)}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition"
                        title={isBoardPortal ? `Launch ${boardName} Official Portal` : 'Open PDF directly in full browser window'}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{isBoardPortal ? 'Launch Portal' : 'Open Fullscreen'}</span>
                      </a>

                      {/* Direct Download (For direct PDFs) */}
                      {!isBoardPortal && (
                        <a
                          href={`/api/pdf-proxy?url=${encodeURIComponent(currentModalUrl)}${previewModal?.backupUrl ? `&fallback=${encodeURIComponent(previewModal.backupUrl)}` : ''}&download=true`}
                          download
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-sm"
                          title="Download PDF to computer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )}

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

                  {/* Floating Audio Player HUD in Modal Viewer */}
                  {previewModal.hasAudio && previewModal.audioStreamUrl && (
                    <div className="bg-gradient-to-r from-sky-950/95 via-indigo-950/90 to-slate-950 border-b border-sky-500/30 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                        <Headphones className="h-4 w-4 text-sky-400 animate-pulse shrink-0" />
                        <span>Official Listening Exam Track:</span>
                      </div>
                      <div className="flex-1 min-w-[220px] max-w-md">
                        <audio controls preload="metadata" src={previewModal.audioStreamUrl} className="w-full h-8 rounded-lg" />
                      </div>
                      {previewModal.audioDownloadUrl && (
                        <a
                          href={previewModal.audioDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download MP3</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Helper notice */}
                  <div className="bg-sky-950/40 border-b border-sky-500/20 px-4 py-2 text-[11px] text-sky-200 flex items-center justify-between gap-2 flex-wrap">
                    {isBoardPortal ? (
                      <span>
                        🔒 <strong>{boardName} Materials Hub:</strong> Official {boardName} past papers & mark schemes are hosted on the exam board's official qualifications repository.
                      </span>
                    ) : (
                      <span>
                        💡 <strong>Mobile / Tablet tip:</strong> If the PDF appears small or doesn't display inline, tap <strong>Open Fullscreen</strong> above or toggle <strong>Google Viewer</strong>.
                      </span>
                    )}
                    <a
                      href={currentModalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold text-sky-300 hover:text-white ml-auto"
                    >
                      {isBoardPortal ? `Launch ${boardName} Portal ↗` : 'Launch Direct PDF ↗'}
                    </a>
                  </div>

                  {/* Modal Body: Board Hub Card vs PDF Viewer */}
                  {isBoardPortal ? (
                    <div className="relative flex-1 w-full bg-slate-950 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
                      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="h-4 w-4" />
                          Official {boardName} Archive
                        </div>

                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-white">
                            {previewModal.title}
                          </h2>
                          {previewModal.subtitle && (
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                              {previewModal.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
                          <p className="font-bold text-slate-200 flex items-center gap-2">
                            <span>✅</span> Verified Exam Board Portal Search
                          </p>
                          <p className="text-slate-400 leading-relaxed">
                            {boardName} provides international past papers & mark schemes via their official qualifications portal. We have prepared the exact pre-filtered portal search and direct backup mirrors for this paper below:
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <a
                            href={currentModalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-3 text-sm font-bold text-white transition shadow-lg shadow-sky-600/25 cursor-pointer"
                          >
                            <span>Launch Official {boardName} Portal</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          {previewModal.backupUrl && (
                            <a
                              href={previewModal.backupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-2.5 text-xs font-semibold text-slate-300 transition"
                            >
                              <span>Search on PapaCambridge Archive</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}

                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(portalSearchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-2.5 text-xs font-semibold text-slate-300 transition"
                          >
                            <span>Search Google for Direct PDF Mirror</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                          Simply IGCSE Platform • Fast, Verified Exam Preparation
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
                      <iframe
                        src={
                          viewerEngine === 'proxy'
                            ? `/api/pdf-proxy?url=${encodeURIComponent(currentModalUrl)}${previewModal.backupUrl ? `&fallback=${encodeURIComponent(previewModal.backupUrl)}` : ''}`
                            : viewerEngine === 'gdocs'
                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(currentModalUrl)}&embedded=true`
                            : currentModalUrl
                        }
                        className="w-full h-full border-0 bg-white"
                        title={previewModal.title}
                      />
                    </div>
                  )}

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
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
