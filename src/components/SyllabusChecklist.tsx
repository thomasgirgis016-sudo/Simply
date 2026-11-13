import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  TrendingUp,
  RotateCcw,
  Zap,
  BookOpen,
  ArrowRight,
  Award,
  Target,
  MessageSquare
} from 'lucide-react';
import { Subject, UserProfile, SyllabusChecklistItem } from '../types';
import { INITIAL_SYLLABUS_SPECS } from '../data/syllabusSpecsData';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface SyllabusChecklistProps {
  activeSubject: Subject;
  profile: UserProfile;
  onTriggerDiagnosticQuiz?: (weakTopics: string[]) => void;
  onOpenAiChatWithTopic?: (topic: string) => void;
}

export const SyllabusChecklist: React.FC<SyllabusChecklistProps> = ({
  activeSubject,
  profile,
  onTriggerDiagnosticQuiz,
  onOpenAiChatWithTopic,
}) => {
  const [items, setItems] = useState<SyllabusChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_syllabus_checklist');
      if (saved) {
        const parsed: SyllabusChecklistItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((i) => i.id));
        const missing = INITIAL_SYLLABUS_SPECS.filter((i) => !existingIds.has(i.id));
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.warn('Checklist load error:', e);
    }
    return INITIAL_SYLLABUS_SPECS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'All' | 'red' | 'amber' | 'green'>('All');
  const [tierFilter, setTierFilter] = useState<'All' | 'Core' | 'Extended'>('All');

  useEffect(() => {
    try {
      localStorage.setItem('simply_igcse_syllabus_checklist', JSON.stringify(items));
    } catch (e) {
      console.warn('Checklist save error:', e);
    }
  }, [items]);

  // Filter items matching activeSubject
  const subjectItems = items.filter((item) => isSubjectMatch(item.subjectId, activeSubject));

  const filteredItems = subjectItems.filter((item) => {
    const matchesConfidence = confidenceFilter === 'All' || item.confidence === confidenceFilter;
    const matchesTier = tierFilter === 'All' || item.tier === tierFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesConfidence && matchesTier && matchesSearch;
  });

  const greenCount = subjectItems.filter((i) => i.confidence === 'green').length;
  const amberCount = subjectItems.filter((i) => i.confidence === 'amber').length;
  const redCount = subjectItems.filter((i) => i.confidence === 'red').length;
  const total = subjectItems.length || 1;

  const masteryPercentage = Math.round(((greenCount * 1.0 + amberCount * 0.5) / total) * 100);

  const handleSetConfidence = (id: string, confidence: 'green' | 'amber' | 'red') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, confidence } : item))
    );
  };

  const weakTopics = subjectItems
    .filter((i) => i.confidence === 'red' || i.confidence === 'amber')
    .map((i) => `${i.unitTitle}: ${i.specCode}`);

  const handleLaunchDiagnostic = () => {
    if (onTriggerDiagnosticQuiz) {
      onTriggerDiagnosticQuiz(weakTopics);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF5B37]/15 px-3 py-1 text-xs font-mono font-semibold text-[#FF5B37] border border-[#FF5B37]/30 mb-3">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Official Syllabus Specification Checklist</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Interactive Syllabus Mastery Tracker
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-sans">
              Track official learning objectives for <span className="font-semibold text-white">{activeSubject.name} ({activeSubject.code})</span>. Rate your confidence (Red, Amber, Green) to spot syllabus blindspots and trigger targeted past paper drills.
            </p>
          </div>

          {/* Mastery Circular / Gauge Card */}
          <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 sm:p-5 text-center min-w-[190px] shadow-sm shrink-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Syllabus Coverage
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">
              {masteryPercentage}%
            </div>
            <div className="w-full bg-[#111113] h-2 rounded-full mt-2.5 overflow-hidden border border-white/[0.08]">
              <div
                className="bg-[#4cc38a] h-full rounded-full transition-all duration-500"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono font-semibold">
              <span className="text-emerald-400">{greenCount} Mastered</span>
              <span className="text-amber-400">{amberCount} Reviewing</span>
              <span className="text-rose-400">{redCount} Weak</span>
            </div>
          </div>
        </div>

        {/* AI Diagnostic Quiz Launch Action Bar */}
        {weakTopics.length > 0 && (
          <div className="mt-6 border-t border-white/[0.08] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Zap className="h-4 w-4 text-[#FF5B37] shrink-0" />
              <span>
                <strong className="text-white font-semibold">{weakTopics.length} objectives</strong> flagged as needing revision.
              </span>
            </div>

            <button
              onClick={handleLaunchDiagnostic}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#FF5B37] hover:bg-[#e04f2e] px-4 py-2 text-xs font-semibold text-white shadow-none transition cursor-pointer shrink-0"
            >
              <Target className="h-4 w-4" />
              <span>Launch Past Paper Error Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSubject.name} objectives (e.g. circle theorems, electrolysis, vectors)...`}
            className="w-full rounded-xl border border-white/[0.1] bg-[#111113] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#FF5B37] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Confidence Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
            {[
              { id: 'All', label: 'All Objectives' },
              { id: 'red', label: `🔴 Weak Areas (${redCount})` },
              { id: 'amber', label: `🟡 Reviewing (${amberCount})` },
              { id: 'green', label: `🟢 Mastered (${greenCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setConfidenceFilter(f.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                  confidenceFilter === f.id
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'bg-[#141416] border border-white/[0.08] text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Tier:</span>
            {(['All', 'Core', 'Extended'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  tierFilter === tier
                    ? 'bg-[#222225] border border-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-8 text-center text-slate-400">
            <BookOpen className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold">No syllabus objectives match your search or filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status filter to "All Objectives".</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isGreen = item.confidence === 'green';
            const isAmber = item.confidence === 'amber';
            const isRed = item.confidence === 'red';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-4 sm:p-5 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-[#222225] px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-200">
                        {item.specCode}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {item.unitNumber} • {item.unitTitle}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                          item.tier === 'Extended'
                            ? 'bg-[#FF5B37]/15 text-[#FF5B37] border border-[#FF5B37]/30'
                            : 'bg-[#222225] text-slate-400'
                        }`}
                      >
                        {item.tier}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-100 font-normal leading-relaxed font-sans">
                      {item.statement}
                    </p>
                  </div>

                  {/* 3-Button Confidence Rating */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleSetConfidence(item.id, 'red')}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                        isRed
                          ? 'bg-[#e5484d] text-white shadow-sm'
                          : 'bg-[#141416] border border-white/[0.08] text-rose-300 hover:bg-[#e5484d]/15'
                      }`}
                      title="Flag as Weak Area"
                    >
                      <span>🔴 Weak</span>
                    </button>
                    <button
                      onClick={() => handleSetConfidence(item.id, 'amber')}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                        isAmber
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-[#141416] border border-white/[0.08] text-amber-300 hover:bg-amber-500/15'
                      }`}
                      title="Reviewing / Needs Consolidation"
                    >
                      <span>🟡 Review</span>
                    </button>
                    <button
                      onClick={() => handleSetConfidence(item.id, 'green')}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                        isGreen
                          ? 'bg-[#4cc38a] text-slate-950 font-bold shadow-sm'
                          : 'bg-[#141416] border border-white/[0.08] text-emerald-300 hover:bg-emerald-500/15'
                      }`}
                      title="Mark as Mastered"
                    >
                      <span>🟢 Mastered</span>
                    </button>

                    {onOpenAiChatWithTopic && (
                      <button
                        onClick={() => onOpenAiChatWithTopic(item.statement)}
                        className="p-1.5 rounded-xl border border-white/[0.08] bg-[#141416] text-slate-400 hover:text-white hover:bg-[#222225] transition cursor-pointer"
                        title="Consult Examiner Walkthrough on this objective"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#FF5B37]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
