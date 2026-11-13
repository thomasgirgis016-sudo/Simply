import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Search,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  Filter
} from 'lucide-react';
import { Subject, FormulaItem, CommandWord } from '../types';
import { IGCSE_COMMAND_WORDS } from '../data/subjects';
import { MathRenderer } from './MathRenderer';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface FormulaDictionaryProps {
  subject: Subject;
  formulas: FormulaItem[];
}

export const FormulaDictionary: React.FC<FormulaDictionaryProps> = ({
  subject,
  formulas,
}) => {
  const hasSubjectFormulas = formulas.some((f) => isSubjectMatch(f.subjectId, subject));

  const [activeTab, setActiveTab] = useState<'formulas' | 'commands'>(() => {
    return hasSubjectFormulas ? 'formulas' : 'commands';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Default non-STEM / subjects with no formulas to "commands" tab
  useEffect(() => {
    const hasFormulas = formulas.some((f) => isSubjectMatch(f.subjectId, subject));
    if (!hasFormulas) {
      setActiveTab('commands');
    }
  }, [subject.id, formulas]);

  // Strict subject scoping: ONLY formulas belonging to the active subject
  const filteredFormulas = formulas.filter((f) => {
    const matchesSubject = isSubjectMatch(f.subjectId, subject);
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formula.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filter command words
  const filteredCommandWords = IGCSE_COMMAND_WORDS.filter((cw) => {
    return (
      cw.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cw.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cw.whatExaminersExpect.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-[#FF5B37]/10 px-2 py-0.5 text-xs font-semibold text-[#FF5B37] border border-[#FF5B37]/20">
              Exam Toolset
            </span>
            <h2 className="text-xl font-semibold text-white mt-1">
              Formula Sheet & Command Words Dictionary
            </h2>
            <p className="text-xs text-slate-400">
              Instant formula recall, units, and official examiner command word criteria
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-lg bg-[#141416] p-1 border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('formulas')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeTab === 'formulas'
                  ? 'bg-[#FF5B37] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formula Sheets
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeTab === 'commands'
                  ? 'bg-[#FF5B37] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Command Words Guide
            </button>
          </div>
        </div>

        {/* Search bar & filter */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'formulas'
                  ? `Search formulas for ${subject.code} (e.g. formula name, unit, variable)...`
                  : 'Search command word (e.g. State, Explain, Evaluate, Calculate)...'
              }
              className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#FF5B37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#222225] px-3 py-2 text-xs font-medium text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Syllabus: <strong className="text-white font-mono">{subject.code}</strong></span>
          </div>
        </div>
      </div>

      {/* FORMULAS VIEW */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFormulas.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-white/[0.08] bg-[#18181b] p-8 text-center text-slate-400">
              <FileText className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 mt-1">Check your keyword search or switch to another enrolled subject.</p>
            </div>
          ) : (
            filteredFormulas.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 shadow-xl hover:border-white/[0.15] transition space-y-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div>
                    <span className="rounded-md bg-[#FF5B37]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF5B37] border border-[#FF5B37]/20">
                      {f.topic}
                    </span>
                    <h4 className="text-base font-semibold text-white mt-1.5">{f.name}</h4>
                  </div>
                </div>

                {/* Big Formula Box with responsive scroll and scaling */}
                <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-center overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-white/[0.1] my-1">
                  <div className="inline-block min-w-full py-1">
                    <MathRenderer content={`$$${f.formula}$$`} className="text-sm sm:text-base text-slate-100 font-semibold tracking-wide" />
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="font-semibold text-slate-400 shrink-0">Variables:</span>
                    <span className="leading-relaxed text-slate-300">{f.whereVariables}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="font-semibold text-slate-400 shrink-0">Standard Units:</span>
                    <span className="font-mono text-[#FF5B37] font-semibold">{f.units}</span>
                  </div>
                </div>

                {/* Exam Tip */}
                {f.examTip && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 mt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Examiner Trap & Warning:
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">{f.examTip}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* COMMAND WORDS VIEW */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-[#FF5B37] mb-1">🎯 Why Command Words Matter in IGCSE:</p>
            Cambridge (CIE) and Pearson Edexcel strictly design mark schemes around command words.
            Writing an explanation when asked to <em>State</em> wastes precious time; merely describing when asked to <em>Explain</em> loses 50-100% of the available marks!
          </div>

          <div className="space-y-4">
            {filteredCommandWords.map((cw, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <h4 className="text-base font-semibold text-white flex items-center gap-1.5">
                    <span className="text-[#FF5B37]">“</span>
                    {cw.word}
                    <span className="text-[#FF5B37]">”</span>
                  </h4>
                  <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs font-mono text-slate-400 border border-white/[0.06]">
                    Syllabus Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-[#141416] p-3.5 border border-white/[0.08]">
                    <p className="font-semibold uppercase tracking-wider text-slate-400 mb-1 text-[11px]">
                      Formal Definition:
                    </p>
                    <p className="text-slate-300 leading-relaxed">{cw.definition}</p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 p-3.5 border border-emerald-500/20">
                    <p className="font-semibold uppercase tracking-wider text-emerald-400 mb-1 text-[11px]">
                      What Mark Schemes Require:
                    </p>
                    <p className="text-emerald-200/90 leading-relaxed">{cw.whatExaminersExpect}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#141416] p-3 border border-white/[0.08] text-xs">
                  <span className="font-semibold text-[#FF5B37]">Exam Example: </span>
                  <span className="text-slate-300 italic">{cw.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
