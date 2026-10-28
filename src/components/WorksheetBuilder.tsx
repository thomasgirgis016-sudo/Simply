import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  CheckCircle,
  BookOpen,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  Award,
  Layers
} from 'lucide-react';
import { Subject, PastPaperItem, UserProfile } from '../types';
import { getAllPastPapers } from '../data/pastPapersData';
import { MathRenderer } from './MathRenderer';

interface WorksheetBuilderProps {
  subject: Subject;
  profile?: UserProfile;
}

export const WorksheetBuilder: React.FC<WorksheetBuilderProps> = ({
  subject,
}) => {
  const [worksheetTitle, setWorksheetTitle] = useState(`${subject.name} Unit Revision & Mastery Test`);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Core' | 'Extended' | 'Grade 9 Challenge'>('All');
  const [targetMarks, setTargetMarks] = useState<number>(25);
  const [activeView, setActiveView] = useState<'student-qp' | 'teacher-ms'>('student-qp');

  const subjectPapers = useMemo(() => {
    const all = getAllPastPapers();
    return all.filter(p => p.subjectId === subject.id || p.subjectId.includes(subject.code));
  }, [subject]);

  // Extract unique topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    subjectPapers.forEach(p => {
      if (p.topic) set.add(p.topic);
    });
    return Array.from(set);
  }, [subjectPapers]);

  // Initialize with all topics if empty
  const activeSelectedTopics = selectedTopics.length > 0 ? selectedTopics : availableTopics;

  // Selected questions that fit target mark quota
  const generatedQuestions = useMemo(() => {
    let pool = subjectPapers.filter(p => {
      const matchTopic = selectedTopics.length === 0 || selectedTopics.includes(p.topic);
      const matchDiff = difficultyFilter === 'All' || p.difficultyTier === difficultyFilter;
      return matchTopic && matchDiff;
    });

    if (pool.length === 0) pool = subjectPapers;

    let accumulatedMarks = 0;
    const selected: PastPaperItem[] = [];

    for (const q of pool) {
      const qMarks = q.marks || 4;
      if (accumulatedMarks > 0 && accumulatedMarks + qMarks > targetMarks + 2) {
        continue;
      }
      selected.push(q);
      accumulatedMarks += qMarks;
      if (accumulatedMarks >= targetMarks) break;
    }

    // If filtered pool didn't reach target, pull from broader subject papers
    if (accumulatedMarks < targetMarks) {
      const remainingPool = subjectPapers.filter(p => !selected.some(s => s.id === p.id));
      for (const q of remainingPool) {
        const qMarks = q.marks || 4;
        if (accumulatedMarks > 0 && accumulatedMarks + qMarks > targetMarks + 2) {
          continue;
        }
        selected.push(q);
        accumulatedMarks += qMarks;
        if (accumulatedMarks >= targetMarks) break;
      }
    }

    // Fallback: If still under target and nothing fit within threshold, add closest candidate
    if (selected.length === 0 && pool.length > 0) {
      selected.push(pool[0]);
    }

    return selected.length > 0 ? selected : subjectPapers.slice(0, 2);
  }, [subjectPapers, selectedTopics, difficultyFilter, targetMarks]);

  const totalCalculatedMarks = useMemo(() => {
    return generatedQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
  }, [generatedQuestions]);

  const handlePrint = () => {
    window.print();
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn pb-12">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Screen-Only Configuration Toolbar                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="print:hidden space-y-6">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-black text-indigo-300 border border-indigo-500/30">
                <FileText className="h-3.5 w-3.5" />
                <span>Cambridge Assessment Worksheet & Test Builder</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                1-Click Past Paper Worksheet Generator
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Generate authentic Cambridge-formatted student question papers and teacher mark schemes for homework, revision packs, and unit tests in seconds.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Customization Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Worksheet / Test Title</label>
              <input
                type="text"
                value={worksheetTitle}
                onChange={(e) => setWorksheetTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between mb-1">
                <span>Target Total Marks</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">Generated: {totalCalculatedMarks} Marks</span>
              </label>
              <select
                value={targetMarks}
                onChange={(e) => setTargetMarks(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={15}>15 Marks (~20 mins)</option>
                <option value={25}>25 Marks (~30 mins)</option>
                <option value={30}>30 Marks (~35 mins)</option>
                <option value={40}>40 Marks (~50 mins)</option>
                <option value={60}>60 Marks (~1 hour 15 mins)</option>
                <option value={80}>80 Marks (~Full Extended Paper)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Difficulty Tier</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Tiers (Balanced)</option>
                <option value="Standard Extended">Standard Extended</option>
                <option value="Grade 9 Challenge">Grade 9 Challenge (A*)</option>
                <option value="Core">Core Foundations</option>
              </select>
            </div>
          </div>

          {/* Topic Selector Pills */}
          {availableTopics.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 block">Filter by Syllabus Topics:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {availableTopics.map(topic => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'border border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Mode Toggle: Student QP vs Teacher MS */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('student-qp')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeView === 'student-qp'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Student Question Paper ({generatedQuestions.length} Qs • {totalCalculatedMarks} Marks)
              </button>

              <button
                type="button"
                onClick={() => setActiveView('teacher-ms')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeView === 'teacher-ms'
                    ? 'bg-purple-600 text-white font-black shadow-md'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Teacher Mark Scheme & Solutions
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Ready to print on standard A4 paper
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PRINTABLE DOCUMENT AREA                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 p-6 sm:p-12 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Cover Sheet Box */}
        <div className="border-b-2 border-black/80 pb-6 mb-8 text-black dark:text-white print:text-black">
          <div className="flex justify-between items-start border-b border-black/40 pb-4 mb-4">
            <div>
              <div className="text-sm font-black uppercase tracking-widest text-slate-500 print:text-black">
                Cambridge Assessment International Education
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {worksheetTitle}
              </h2>
              <div className="text-xs font-bold text-slate-400 print:text-black mt-0.5">
                {subject.name} ({subject.code}) • {activeView === 'student-qp' ? 'Question Paper' : 'Official Mark Scheme'}
              </div>
            </div>

            <div className="text-right font-mono text-xs border border-black/30 p-2 rounded">
              <div>MAXIMUM MARK: <strong className="text-base">{totalCalculatedMarks}</strong></div>
              <div>TIME: <strong>{Math.round(totalCalculatedMarks * 1.2)} minutes</strong></div>
            </div>
          </div>

          {activeView === 'student-qp' && (
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border border-black/40 p-3 rounded">
              <div>CANDIDATE NAME: ___________________________</div>
              <div>CENTRE NUMBER: ___________________________</div>
              <div>CANDIDATE NUMBER: ___________________________</div>
              <div>SCORE ATTAINED: _______ / {totalCalculatedMarks}</div>
            </div>
          )}
        </div>

        {/* Questions Rendered */}
        {activeView === 'student-qp' ? (
          <div className="space-y-10">
            {generatedQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-4 break-inside-avoid">
                <div className="flex justify-between items-start font-bold">
                  <span className="text-sm sm:text-base font-black">
                    {idx + 1}. ({q.topic})
                  </span>
                  <span className="text-xs font-mono font-bold">
                    [{q.marks || 4} Marks]
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed text-slate-200 print:text-black">
                  <MathRenderer content={q.questionPrompt} />
                </div>

                {q.diagramOrMath && (
                  <div className="p-3 bg-slate-900/60 print:bg-slate-100 rounded text-center my-2">
                    <MathRenderer content={q.diagramOrMath} />
                  </div>
                )}

                {/* Blank Working Lines for Students to Write On */}
                <div className="space-y-2 pt-2">
                  <div className="border-b border-dashed border-slate-700/60 print:border-black/30 h-6" />
                  <div className="border-b border-dashed border-slate-700/60 print:border-black/30 h-6" />
                  <div className="border-b border-dashed border-slate-700/60 print:border-black/30 h-6" />
                  <div className="flex justify-end pt-2 text-xs font-mono font-bold text-slate-400 print:text-black">
                    Answer: _____________________________________
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Teacher Mark Scheme Table */
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 print:text-black border-b border-slate-700 pb-2">
              Teacher Mark Scheme & Criteria Breakdown
            </h3>

            <div className="divide-y divide-slate-800 print:divide-black/20">
              {generatedQuestions.map((q, idx) => (
                <div key={q.id} className="py-4 space-y-2 break-inside-avoid">
                  <div className="flex justify-between items-center font-bold text-xs">
                    <span className="text-sm font-black text-amber-300 print:text-black">
                      Question {idx + 1} ({q.topic})
                    </span>
                    <span className="font-mono text-emerald-400 print:text-black">
                      [{q.marks || 4} Marks]
                    </span>
                  </div>

                  <div className="bg-slate-900/60 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-black/20 text-xs font-mono space-y-1.5">
                    <div className="text-emerald-300 print:text-black font-bold">
                      Correct Final Answer: {q.finalAnswer}
                    </div>

                    {q.markScheme?.map((ms, msIdx) => (
                      <div key={msIdx} className="text-slate-300 print:text-black text-[11px]">
                        <strong>{ms.markType}:</strong> {ms.requirement}
                      </div>
                    ))}

                    {q.examinerReportSnippet && (
                      <div className="text-slate-400 print:text-black text-[10px] italic pt-1 border-t border-slate-800 print:border-black/10">
                        Cambridge Examiner Tip: {q.examinerReportSnippet}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
