import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Subject, UserProfile, PastPaperItem } from '../types';
import { PAST_PAPERS_DATABASE } from '../data/pastPapersData';
import { MathRenderer } from './MathRenderer';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface PastPaperFinderProps {
  activeSubject: Subject;
  profile: UserProfile;
  onOpenSplitViewer?: (paperItem: PastPaperItem) => void;
  onOpenChatWithQuestion?: (question: string) => void;
  onOpenSolverWithQuestion?: (question: string) => void;
}

export const PastPaperFinder: React.FC<PastPaperFinderProps> = ({
  activeSubject,
  profile,
  onOpenSplitViewer,
  onOpenChatWithQuestion,
  onOpenSolverWithQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Core' | 'Standard Extended' | 'Grade 9 Challenge'>('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(activeSubject.id);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

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
  const filteredPapers = PAST_PAPERS_DATABASE.filter((paper) => {
    // Subject filter
    const matchesSubject = selectedSubjectFilter === 'all' || isSubjectMatch(paper.subjectId, activeSubject);

    // Tier filter
    const matchesTier = selectedTier === 'All' || paper.difficultyTier === selectedTier;

    // Search query matching (matches snippetQuery, questionText, topic, session, paperCode)
    if (!searchQuery.trim()) return matchesSubject && matchesTier;

    const q = searchQuery.toLowerCase();
    const matchesQuery =
      paper.snippetQuery.toLowerCase().includes(q) ||
      (paper.questionPrompt || paper.questionText || '').toLowerCase().includes(q) ||
      paper.topic.toLowerCase().includes(q) ||
      paper.session.toLowerCase().includes(q) ||
      paper.paperCode.toLowerCase().includes(q) ||
      paper.questionNumber.toLowerCase().includes(q);

    return matchesSubject && matchesTier && matchesQuery;
  });

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/20 mb-3">
            <Search className="h-3.5 w-3.5" />
            <span>Natural-Language Question Search & Classifier</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            IGCSE Past Paper & Mark Scheme Finder
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Type any phrase you remember from past papers (e.g. <em>"two cyclists bearing 040"</em>, <em>"iron extraction blast furnace"</em>, or <em>"terminal velocity parachutist"</em>) to instantly retrieve the exact paper session, question number, and official Cambridge/Edexcel mark scheme.
          </p>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Try Common Student Queries:
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

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type question keywords, bearings, chemical names, or paper code (e.g. 0580/42 May 2023)..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Difficulty Tier Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-semibold mr-1">Difficulty:</span>
            {(['All', 'Core', 'Standard Extended', 'Grade 9 Challenge'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedTier === tier
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSubjectFilter(selectedSubjectFilter === 'all' ? activeSubject.id : 'all')}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{selectedSubjectFilter === 'all' ? 'All Subjects Indexed' : `Only ${activeSubject.name}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span>Found {filteredPapers.length} classified past paper question{filteredPapers.length === 1 ? '' : 's'}</span>
          <span>Official Cambridge & Edexcel Repositories</span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
            <FileText className="mx-auto h-10 w-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No exact past paper matched your search snippet.</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try broader keywords like "cosine rule", "electrolysis", "terminal velocity", or switch to "All Subjects".
            </p>
          </div>
        ) : (
          filteredPapers.map((paper) => {
            const isExpanded = expandedPaperId === paper.id;
            return (
              <div
                key={paper.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg hover:border-slate-700 transition overflow-hidden"
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40">
                  <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
                    <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-xs font-bold text-sky-300 border border-sky-500/30">
                      {paper.paperCode} • {paper.session}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {paper.questionNumber} ({paper.marks} Marks)
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-medium">{paper.topic}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getTierBadge(paper.difficultyTier)}`}>
                      {paper.difficultyTier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                    >
                      {isExpanded ? 'Hide Mark Scheme' : 'View Mark Scheme'}
                    </button>
                    {onOpenSolverWithQuestion && (
                      <button
                        onClick={() => onOpenSolverWithQuestion(paper.questionPrompt)}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Solve in AI</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Question Paper:
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

                {/* Expandable Mark Scheme & Examiner Report */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/80 p-4 sm:p-5 space-y-4 animate-fadeIn">
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          Official Cambridge / Edexcel Mark Scheme:
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

                    {paper.examinerReportSnippet && (
                      <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3.5 text-xs text-amber-200/90 leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Principal Examiner Report Warning:
                        </div>
                        {paper.examinerReportSnippet}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
