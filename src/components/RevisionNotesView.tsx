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
  X,
  Bookmark
} from 'lucide-react';
import { Subject, RevisionTopic, UserProfile, BookmarkItem } from '../types';
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

  const toggleBookmark = (topic: RevisionTopic) => {
    try {
      const saved = localStorage.getItem('simply_igcse_bookmarks');
      let current: BookmarkItem[] = saved ? JSON.parse(saved) : [];
      const exists = current.some((b) => b.id === topic.id);
      if (exists) {
        current = current.filter((b) => b.id !== topic.id);
      } else {
        current.push({
          id: topic.id,
          type: 'revision-topic',
          title: topic.title,
          subtitle: `${subject.code} • ${topic.chapter}`,
          subjectId: subject.id,
          subjectCode: subject.code,
          tab: 'revision',
          savedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem('simply_igcse_bookmarks', JSON.stringify(current));
      setBookmarks(current.map((b) => b.id));
    } catch (err) {
      console.warn(err);
    }
  };

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

  const [selectedChapterToGenerate, setSelectedChapterToGenerate] = useState(subject.topics[0] || '');
  const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);

  const handleQuickGenerateChapter = async (chapterName: string) => {
    if (!chapterName) return;
    setIsGeneratingChapter(true);
    try {
      const generated = await generateRevisionNotesWithGemini(
        subject.name,
        subject.id,
        chapterName,
        profile.geminiApiKey,
        profile.selectedModel
      );
      onAddRevisionNote(generated);
      setSelectedTopicId(generated.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingChapter(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          nav, header, footer, button, .no-print { display: none !important; }
          .rounded-2xl, .rounded-xl { border: 1px solid #d1d5db !important; box-shadow: none !important; background: #ffffff !important; color: #111827 !important; }
          .text-white, .text-slate-200, .text-slate-300 { color: #111827 !important; }
          .text-cyan-400, .text-indigo-400, .text-amber-300 { color: #0369a1 !important; font-weight: bold; }
        }
      `}</style>

      {/* Top Banner */}
      <div className="no-print rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
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
              <span>Custom Topic Sheet</span>
            </button>
          </div>
        </div>

        {/* Biology & Chemistry Fast Chapter Notes Workflow */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">Chapter Revision Generator:</span>
          </div>

          <div className="flex flex-1 items-center gap-2 min-w-[260px] max-w-md">
            <select
              value={selectedChapterToGenerate}
              onChange={(e) => setSelectedChapterToGenerate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {subject.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleQuickGenerateChapter(selectedChapterToGenerate || subject.topics[0])}
              disabled={isGeneratingChapter}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-500 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isGeneratingChapter ? 'animate-spin' : ''}`} />
              <span>{isGeneratingChapter ? 'Generating...' : '⚡ Generate'}</span>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeTopic)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    bookmarks.includes(activeTopic.id)
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title={bookmarks.includes(activeTopic.id) ? 'Saved to Bookmarks' : 'Bookmark this revision note'}
                >
                  <Bookmark className="h-4 w-4" fill={bookmarks.includes(activeTopic.id) ? 'currentColor' : 'none'} />
                </button>
                <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                  IGCSE Syllabus Aligned
                </span>
              </div>
            </div>

            {/* Part 1: Learning Objectives */}
            {activeTopic.learningObjectives && activeTopic.learningObjectives.length > 0 && (
              <div className="mt-6 rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  <span>Part 1: Official Syllabus Learning Objectives</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeTopic.learningObjectives.map((obj, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
                        ✓
                      </span>
                      <span className="text-slate-200 leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part 2: Must-Know Definitions Callout */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookmarkCheck className="h-4 w-4 text-cyan-400" />
                Part 2: Must-Know Definitions (Compulsory Mark Scheme Keywords)
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

            {/* Part 3: Core Equations / Chemical & Biological Pathways */}
            {activeTopic.coreEquationsOrPathways && activeTopic.coreEquationsOrPathways.length > 0 && (
              <div className="mt-6 rounded-xl border border-indigo-500/25 bg-indigo-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Part 3: Core Equations & Reaction / Biological Pathways</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeTopic.coreEquationsOrPathways.map((eq, eIdx) => (
                    <div key={eIdx} className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/30">
                      <MathRenderer content={eq} className="text-slate-200 leading-relaxed" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Concepts & Methodologies */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-400" />
                Detailed Concepts & Methodologies
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

            {/* Part 4: Examiner Report Warnings: Official Examiner Reports Common Mistakes Box */}
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Part 4: Cambridge Chief Examiner Reports: Top Traps & Recurring Mistakes</span>
                </div>
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/25">
                  Guaranteed Mark Saver
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {(activeTopic.examinerWarnings && activeTopic.examinerWarnings.length >= 3
                  ? activeTopic.examinerWarnings.slice(0, 3)
                  : [
                      activeTopic.examinerWarnings?.[0] || 'Premature rounding in early working stages resulting in final answer inaccuracies.',
                      activeTopic.examinerWarnings?.[1] || 'Failing to quote the exact syllabus keywords identified in bold on official mark schemes.',
                      activeTopic.examinerWarnings?.[2] || 'Missing or incorrect standard SI units or confusing command words (State vs Explain).'
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
