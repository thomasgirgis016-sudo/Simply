import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  AlertTriangle,
  BookmarkCheck,
  CheckCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  X
} from 'lucide-react';
import { Subject, RevisionTopic, UserProfile } from '../types';
import { MathRenderer } from './MathRenderer';
import { generateRevisionNotesWithGemini } from '../services/gemini';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface RevisionNotesViewProps {
  subject: Subject;
  profile: UserProfile;
  revisionNotes: RevisionTopic[];
  onAddRevisionNote: (note: RevisionTopic) => void;
}

export const RevisionNotesView: React.FC<RevisionNotesViewProps> = ({
  subject,
  profile,
  revisionNotes,
  onAddRevisionNote,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const subjectNotes = revisionNotes.filter(
    r => isSubjectMatch(r.subjectId, subject)
  );

  const activeTopic = subjectNotes.find(r => r.id === selectedTopicId) || subjectNotes[0];

  const handleGenerateAiNotes = async () => {
    if (!aiTopicInput.trim()) return;
    setIsGenerating(true);

    try {
      const generated = await generateRevisionNotesWithGemini(
        subject.name,
        subject.id,
        aiTopicInput,
        profile.geminiApiKey,
        profile.selectedModel
      );
      onAddRevisionNote(generated);
      setSelectedTopicId(generated.id);
      setIsAiModalOpen(false);
      setAiTopicInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              {subject.code} • Syllabus Revision Summaries
            </span>
            <h2 className="text-xl font-bold text-white mt-1">High-Yield Revision & Cheat Sheets</h2>
            <p className="text-xs text-slate-400">Guaranteed marks: Key definitions, formula sheets & examiner traps</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 hover:text-white transition cursor-pointer shadow-sm active:scale-95"
              title="1-Click export printable revision cheat sheet"
            >
              <Printer className="h-4 w-4 text-cyan-400" />
              <span>1-Click Summary Sheet Export (PDF)</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 transition cursor-pointer active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* Available Topics Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {subjectNotes.map((note) => {
            const isActive = (activeTopic?.id === note.id);
            return (
              <button
                key={note.id}
                onClick={() => setSelectedTopicId(note.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {note.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Revision Sheet Body */}
      {activeTopic ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {activeTopic.chapter}
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">{activeTopic.title}</h3>
              </div>
              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                IGCSE Syllabus Aligned
              </span>
            </div>

            {/* Must-Know Definitions Callout */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookmarkCheck className="h-4 w-4 text-cyan-400" />
                Must-Know Definitions (Guaranteed Exam Marks)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTopic.mustKnowDefinitions.map((def, dIdx) => (
                  <div
                    key={dIdx}
                    className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4"
                  >
                    <p className="font-bold text-xs text-cyan-300 mb-1">
                      {def.term}
                    </p>
                    <MathRenderer content={def.definition} className="text-xs text-slate-200 leading-relaxed" />
                  </div>
                ))}
              </div>
            </div>

            {/* Key Concepts & Step-by-Step Rules */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-400" />
                Core Concepts & Methodologies
              </h4>

              {activeTopic.keyConcepts.map((concept, cIdx) => (
                <div
                  key={cIdx}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-3"
                >
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    {concept.heading}
                  </h5>

                  <ul className="space-y-2 pl-4 text-xs text-slate-300">
                    {concept.points.map((pt, pIdx) => (
                      <li key={pIdx} className="list-disc leading-relaxed">
                        <MathRenderer content={pt} />
                      </li>
                    ))}
                  </ul>

                  {concept.formula && (
                    <div className="mt-2 rounded-lg bg-slate-900 border border-slate-800 p-3 text-center">
                      <MathRenderer content={`$$${concept.formula}$$`} className="text-sm text-cyan-300" />
                    </div>
                  )}

                  {concept.diagramDescription && (
                    <p className="text-[11px] italic text-slate-400">
                      💡 Exam Diagram Tip: {concept.diagramDescription}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Examiner Report Warnings: 3-Bullet Official Examiner Reports Common Mistakes Box */}
            {(activeTopic.examinerWarnings?.length ?? 0) > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 p-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Official Cambridge Examiner Reports: Top 3 Recurring Mistakes</span>
                  </div>
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/25">
                    Chief Examiner Summary
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {(activeTopic.examinerWarnings && activeTopic.examinerWarnings.length >= 3
                    ? activeTopic.examinerWarnings.slice(0, 3)
                    : [
                        activeTopic.examinerWarnings[0] || 'Premature rounding in early working stages resulting in final answer inaccuracies.',
                        activeTopic.examinerWarnings[1] || 'Failing to quote the exact syllabus keywords identified in bold on official mark schemes.',
                        activeTopic.examinerWarnings[2] || 'Missing or incorrect standard SI units or confusing command words (State vs Explain).'
                      ]
                  ).map((warn, wIdx) => (
                    <div key={wIdx} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-300 font-mono">
                        {wIdx + 1}
                      </span>
                      <span className="text-amber-100/90 leading-relaxed">{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No revision notes added yet for {subject.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Generate an instant high-yield cheat sheet with AI!
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition"
          >
            <Sparkles className="h-4 w-4" />
            Generate Revision Guide
          </button>
        </div>
      )}

      {/* AI Generate Notes Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Generate IGCSE Revision Guide</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Enter any syllabus unit from {subject.name} to compile key definitions, concept notes, and examiner pitfalls.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="e.g. Thermal Physics, Photosynthesis, Quadratic graphs"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {subject.topics.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiTopicInput(t)}
                    className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-cyan-500 hover:text-white"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiNotes}
                disabled={isGenerating || !aiTopicInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Compiling Cheat Sheet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
