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
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(() => !hasSubjectFormulas);

  // Default non-STEM / subjects with no formulas to "commands" tab
  useEffect(() => {
    const hasFormulas = formulas.some((f) => isSubjectMatch(f.subjectId, subject));
    if (!hasFormulas) {
      setActiveTab('commands');
      setShowAllSubjects(true);
    }
  }, [subject.id, formulas]);

  // Filter formulas
  const filteredFormulas = formulas.filter((f) => {
    const matchesSubject = showAllSubjects || isSubjectMatch(f.subjectId, subject);
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              Exam Toolset
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Formula Sheet & Command Words Dictionary
            </h2>
            <p className="text-xs text-slate-400">
              Instant formula recall, units, and official examiner command word criteria
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('formulas');
                if (!hasSubjectFormulas) {
                  setShowAllSubjects(true);
                }
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'formulas'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formula Sheets
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                activeTab === 'commands'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
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
                  ? 'Search formulas, units or variables (e.g. kinetic energy, Snell, sphere)...'
                  : 'Search command word (e.g. State, Explain, Evaluate, Calculate)...'
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {activeTab === 'formulas' && (
            <button
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                showAllSubjects
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{showAllSubjects ? 'Showing All Subjects' : `Only ${subject.name}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* FORMULAS VIEW */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFormulas.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
              <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No formulas match your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try toggling "Showing All Subjects" or clear search filter.</p>
            </div>
          ) : (
            filteredFormulas.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-lg hover:border-slate-700 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
                      {f.topic}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white mt-1.5">{f.name}</h4>
                  </div>
                </div>

                {/* Big Formula Box with responsive scroll and scaling */}
                <div className="rounded-xl border border-slate-700/60 bg-slate-950/90 p-4 sm:p-5 text-center overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-700/50 my-1">
                  <div className="inline-block min-w-full py-1">
                    <MathRenderer content={`$$${f.formula}$$`} className="text-xs sm:text-sm md:text-base text-amber-300 font-bold tracking-wide" />
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="font-bold text-slate-400 shrink-0">Variables:</span>
                    <span className="leading-relaxed">{f.whereVariables}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="font-bold text-slate-400 shrink-0">Standard Units:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{f.units}</span>
                  </div>
                </div>

                {/* Exam Tip */}
                {f.examTip && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 p-3.5 mt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 mb-1">
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
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-200 leading-relaxed">
            <p className="font-bold text-indigo-300 mb-1">🎯 Why Command Words Matter in IGCSE:</p>
            Cambridge (CIE) and Pearson Edexcel strictly design mark schemes around command words.
            Writing an explanation when asked to <em>State</em> wastes precious time; merely describing when asked to <em>Explain</em> loses 50-100% of the available marks!
          </div>

          <div className="space-y-4">
            {filteredCommandWords.map((cw, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="text-amber-400">“</span>
                    {cw.word}
                    <span className="text-amber-400">”</span>
                  </h4>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                    Syllabus Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800">
                    <p className="font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Formal Definition:
                    </p>
                    <p className="text-slate-200 leading-relaxed">{cw.definition}</p>
                  </div>

                  <div className="rounded-xl bg-emerald-950/20 p-3.5 border border-emerald-500/20">
                    <p className="font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      What Mark Schemes Require:
                    </p>
                    <p className="text-emerald-200/90 leading-relaxed">{cw.whatExaminersExpect}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
                  <span className="font-bold text-indigo-400">Exam Example: </span>
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
