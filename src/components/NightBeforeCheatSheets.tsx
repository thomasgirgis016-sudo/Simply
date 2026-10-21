import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bookmark
} from 'lucide-react';
import { Subject, UserProfile, SubjectCheatSheet } from '../types';
import { CHEAT_SHEETS_DATABASE, getCheatSheetForSubject } from '../data/cheatSheetsData';
import { MathRenderer } from './MathRenderer';

interface NightBeforeCheatSheetsProps {
  subjects: Subject[];
  profile: UserProfile;
  activeSubject?: Subject;
  onSelectSubject?: (subject: Subject) => void;
}

export const NightBeforeCheatSheets: React.FC<NightBeforeCheatSheetsProps> = ({
  subjects,
  profile,
  activeSubject,
  onSelectSubject,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    if (activeSubject && CHEAT_SHEETS_DATABASE.some((c) => c.subjectCode === activeSubject.code)) {
      return activeSubject.code;
    }
    return '0580';
  });

  const [searchQuery, setSearchQuery] = useState('');

  const currentSheet = useMemo(() => {
    return getCheatSheetForSubject(selectedCode);
  }, [selectedCode]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentSheet.sections;
    const q = searchQuery.toLowerCase();

    return currentSheet.sections
      .map((sec) => {
        const matchingItems = sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.notes.toLowerCase().includes(q) ||
            (item.formula && item.formula.toLowerCase().includes(q)) ||
            (item.warning && item.warning.toLowerCase().includes(q))
        );
        return {
          ...sec,
          items: matchingItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [currentSheet, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden print:hidden">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black text-indigo-300 border border-indigo-500/40">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Night Before the Exam</span>
              </span>
              <span className="rounded-md bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 font-mono">
                1-Page High-Yield Cheat Sheet
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Emergency 1-Page Revision Summaries
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Read 12 to 24 hours before your Cambridge examination. Ultra-dense formulas, guaranteed examiner traps, and chemical test tables formatted for clean 1-click A4 printing.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-black text-slate-950 hover:brightness-110 active:scale-95 transition shadow-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF (A4 Clean)</span>
          </button>
        </div>
      </div>

      {/* 2. Subject Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar print:hidden">
        {CHEAT_SHEETS_DATABASE.map((sheet) => {
          const isActive = selectedCode === sheet.subjectCode;
          return (
            <button
              key={sheet.subjectCode}
              onClick={() => {
                setSelectedCode(sheet.subjectCode);
                const sub = subjects.find((s) => s.code === sheet.subjectCode);
                if (sub && onSelectSubject) onSelectSubject(sub);
              }}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                isActive
                  ? 'border-indigo-500/60 bg-indigo-600/20 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="font-mono rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] text-amber-300 border border-slate-800">
                {sheet.subjectCode}
              </span>
              <span>{sheet.subjectName}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Quick Filters */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${currentSheet.subjectName} formulas & rules...`}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>{currentSheet.estimatedReadTime}</span>
        </div>
      </div>

      {/* 4. Active Cheat Sheet Render Box (Print-Ready Document) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl print:border-none print:bg-white print:p-0 print:text-black">
        {/* Document Header for Screen & Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 print:border-b-2 print:border-black print:pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30 print:bg-gray-200 print:text-black print:border-black">
                {currentSheet.subjectCode} • {currentSheet.board}
              </span>
              <span className="text-xs font-bold text-slate-400 print:text-gray-700">
                {currentSheet.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 print:text-black">
              {currentSheet.subjectName} — High-Yield Cheat Sheet
            </h2>
          </div>

          <div className="text-left sm:text-right text-[11px] text-slate-400 print:text-gray-700 font-mono">
            <div>{currentSheet.lastUpdated}</div>
            <div className="text-amber-400 font-bold print:text-black">Simply IGCSE Verified</div>
          </div>
        </div>

        {/* Critical Cambridge Non-Negotiables Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 print:border print:border-black print:bg-gray-100 print:text-black">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 print:text-black uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4 text-amber-400 print:text-black" />
            <span>Golden Cambridge Exam Hall Directives (Do Not Lose Marks Here!)</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-200/90 print:text-gray-800 font-sans">
            {currentSheet.criticalRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-400 print:text-black font-bold shrink-0">✓</span>
                <span className="leading-relaxed">
                  <MathRenderer content={rule} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cheat Sheet Sections Grid */}
        <div className="space-y-6">
          {filteredSections.map((section, sIdx) => {
            return (
              <div
                key={sIdx}
                className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 print:border print:border-gray-300 print:bg-white print:p-3"
              >
                <h3 className="text-sm font-black text-white print:text-black flex items-center justify-between border-b border-slate-800/60 pb-2 print:border-gray-300">
                  <span>{section.title}</span>
                  <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase tracking-wider font-mono">
                    {section.items.length} High-Yield Focus Points
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 flex flex-col justify-between print:border print:border-gray-300 print:bg-gray-50"
                    >
                      <div>
                        <div className="text-xs font-bold text-indigo-300 print:text-black flex items-center justify-between">
                          <span>{item.label}</span>
                        </div>

                        {item.formula && (
                          <div className="rounded-lg bg-slate-900/90 p-2 my-1.5 text-xs font-mono text-amber-300 print:bg-white print:text-black border border-slate-800 print:border-gray-300 overflow-x-auto no-scrollbar">
                            <MathRenderer content={item.formula} />
                          </div>
                        )}

                        <p className="text-[11px] text-slate-300 print:text-gray-700 leading-relaxed">
                          <MathRenderer content={item.notes} />
                        </p>
                      </div>

                      {item.warning && (
                        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2 text-[10px] text-rose-300 print:border-red-400 print:bg-red-50 print:text-red-900 leading-snug">
                          <strong className="block text-rose-400 print:text-red-700 font-bold mb-0.5">
                            Examiner Trap:
                          </strong>
                          <span>
                            <MathRenderer content={item.warning} />
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
