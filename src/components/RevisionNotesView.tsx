import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  BookmarkCheck,
  CheckCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
  Bookmark,
  Compass,
  Award,
  CheckSquare,
  FileQuestion,
  FileText,
  RefreshCw
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
      <div className="no-print rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-[#FF5B37]/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-[#FF5B37] border border-[#FF5B37]/20 tabular-nums">
              {subject.code} • High-Yield Revision Summaries
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Syllabus Revision Notes</h2>
            <p className="text-xs text-white/50">Compulsory definitions, key formulas, chemical equations & Chief Examiner warnings</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#141416] hover:bg-[#222225] px-3.5 py-2 text-xs font-medium text-white/80 hover:text-white transition cursor-pointer active:scale-95"
              title="1-Click export printable revision cheat sheet"
            >
              <Printer className="h-4 w-4 text-white/60" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-4 py-2 text-xs font-medium text-white shadow-sm transition cursor-pointer active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Custom Topic Sheet</span>
            </button>
          </div>
        </div>

        {/* Fast Chapter Notes Workflow */}
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#141416] p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#FF5B37]" />
            <span className="text-xs font-medium text-white/80">Generate Chapter Summary:</span>
          </div>

          <div className="flex flex-1 items-center gap-2 min-w-[260px] max-w-md">
            <select
              value={selectedChapterToGenerate}
              onChange={(e) => setSelectedChapterToGenerate(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#18181b] px-3 py-1.5 text-xs text-white/90 focus:border-[#FF5B37] focus:outline-none cursor-pointer"
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
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#222225] hover:bg-[#28282c] border border-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-white transition cursor-pointer disabled:opacity-50"
            >
              <FileText className={`h-3.5 w-3.5 ${isGeneratingChapter ? 'animate-spin' : ''}`} />
              <span>{isGeneratingChapter ? 'Generating...' : 'Generate Notes'}</span>
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
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                  isActive
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'bg-[#141416] text-white/60 hover:text-white border border-white/[0.06] hover:bg-[#222225]'
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
          <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-xs font-mono font-medium text-[#FF5B37]">
                  {activeTopic.chapter}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-0.5">{activeTopic.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeTopic)}
                  className={`p-2 rounded-lg border transition cursor-pointer ${
                    bookmarks.includes(activeTopic.id)
                      ? 'border-[#FF5B37]/30 bg-[#FF5B37]/10 text-[#FF5B37]'
                      : 'border-white/[0.08] bg-[#141416] text-white/60 hover:text-white'
                  }`}
                  title={bookmarks.includes(activeTopic.id) ? 'Saved to Bookmarks' : 'Bookmark this revision note'}
                >
                  <Bookmark className="h-4 w-4" fill={bookmarks.includes(activeTopic.id) ? 'currentColor' : 'none'} />
                </button>
                <span className="rounded-lg bg-[#141416] border border-white/[0.06] px-3 py-1 text-xs font-mono text-white/60">
                  IGCSE Syllabus Aligned
                </span>
              </div>
            </div>

            {/* Part 1: Learning Objectives */}
            {activeTopic.learningObjectives && activeTopic.learningObjectives.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-3">
                <div className="flex items-center gap-2 text-white/90 font-medium text-xs">
                  <CheckCircle className="h-4 w-4 text-[#4cc38a]" />
                  <span>Part 1: Official Syllabus Learning Objectives</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeTopic.learningObjectives.map((obj, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2.5 bg-[#18181b] p-3 rounded-lg border border-white/[0.04]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4cc38a]/15 text-[10px] font-bold text-[#4cc38a]">
                        ✓
                      </span>
                      <span className="text-white/80 leading-relaxed font-sans">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Part 2: Must-Know Definitions Callout */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <BookmarkCheck className="h-4 w-4 text-[#FF5B37]" />
                Part 2: Must-Know Definitions (Compulsory Mark Scheme Keywords)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTopic.mustKnowDefinitions.map((def, dIdx) => (
                  <div
                    key={dIdx}
                    className="rounded-xl border border-white/[0.08] bg-[#141416] p-4"
                  >
                    <p className="font-semibold text-xs text-[#FF5B37] mb-1 font-mono">
                      {def.term}
                    </p>
                    <MathRenderer content={def.definition} className="text-xs text-white/80 leading-relaxed font-sans" />
                  </div>
                ))}
              </div>
            </div>

            {/* Part 3: Core Equations / Chemical & Biological Pathways */}
            {activeTopic.coreEquationsOrPathways && activeTopic.coreEquationsOrPathways.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-3">
                <div className="flex items-center gap-2 text-white/90 font-medium text-xs">
                  <BookOpen className="h-4 w-4 text-[#FF5B37]" />
                  <span>Part 3: Core Equations & Reaction / Biological Pathways</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {activeTopic.coreEquationsOrPathways.map((eq, eIdx) => (
                    <div key={eIdx} className="bg-[#18181b] p-3 rounded-lg border border-white/[0.06]">
                      <MathRenderer content={eq} className="text-white/90 leading-relaxed font-mono" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Concepts & Methodologies */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#FF5B37]" />
                Detailed Concepts & Methodologies
              </h4>

              {activeTopic.keyConcepts.map((concept, cIdx) => (
                <div
                  key={cIdx}
                  className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-3"
                >
                  <h5 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5B37]" />
                    {concept.heading}
                  </h5>

                  <ul className="space-y-2 pl-4 text-xs text-white/70">
                    {concept.points.map((pt, pIdx) => (
                      <li key={pIdx} className="list-disc leading-relaxed font-sans">
                        <MathRenderer content={pt} />
                      </li>
                    ))}
                  </ul>

                  {concept.formula && (
                    <div className="mt-2 rounded-lg bg-[#18181b] border border-white/[0.06] p-3 text-center">
                      <MathRenderer content={`$$${concept.formula}$$`} className="text-sm text-white font-mono" />
                    </div>
                  )}

                  {concept.diagramDescription && (
                    <p className="text-[11px] italic text-white/50">
                      Exam Diagram Tip: {concept.diagramDescription}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Part 4: Examiner Report Warnings: Official Examiner Reports Common Mistakes Box */}
            <div className="mt-6 rounded-xl border border-[#e5484d]/30 bg-[#e5484d]/[0.03] p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e5484d]/20 pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-[#e5484d] font-semibold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Part 4: Cambridge Chief Examiner Reports: Top Traps & Recurring Mistakes</span>
                </div>
                <span className="rounded-md bg-[#e5484d]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#e5484d] border border-[#e5484d]/20">
                  Essential Mark Saver
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
                  <div key={wIdx} className="flex items-start gap-2.5 bg-[#18181b] p-3 rounded-lg border border-white/[0.06]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5484d]/15 text-[11px] font-semibold text-[#e5484d] font-mono tabular-nums">
                      {wIdx + 1}
                    </span>
                    <span className="text-white/85 leading-relaxed font-sans">{warn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 5: Scientific Apparatus & Technical Diagram */}
            {activeTopic.diagramSvg && (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#141416] p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-4">
                  <div className="flex items-center gap-2 text-white/90 font-semibold text-xs">
                    <Compass className="h-4 w-4 text-[#FF5B37]" />
                    <span>Part 5: Technical Visual Diagram & Apparatus / Schematic Drawing</span>
                  </div>
                  <span className="rounded-md bg-[#222225] px-2 py-0.5 text-[10px] font-mono text-white/70 border border-white/[0.06]">
                    Examiner Illustrated
                  </span>
                </div>

                {activeTopic.diagramTitle && (
                  <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF5B37]" />
                    {activeTopic.diagramTitle}
                  </h5>
                )}

                <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#18181b] p-4 flex items-center justify-center">
                  <div
                    className="w-full max-w-2xl text-slate-100 flex items-center justify-center [&>svg]:w-full [&>svg]:max-h-[380px] [&>svg]:h-auto"
                    dangerouslySetInnerHTML={{ __html: activeTopic.diagramSvg }}
                  />
                </div>
                <p className="mt-2.5 text-center text-[11px] text-white/50">
                  Cambridge / Edexcel Spec Drawing: Study all labels, arrows, and apparatus setups closely for Paper 4 and Paper 6 (Alternative to Practical).
                </p>
              </div>
            )}

            {/* Part 6: Official Worked Exam Examples with Mark Scheme Allocations */}
            {activeTopic.workedExamples && activeTopic.workedExamples.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2 text-white/90 font-semibold text-xs">
                    <Award className="h-4 w-4 text-[#4cc38a]" />
                    <span>Part 6: Official Cambridge / Edexcel Worked Exam Examples & Mark Rubric</span>
                  </div>
                  <span className="rounded-md bg-[#222225] px-2 py-0.5 text-[10px] font-mono font-medium text-white/70 border border-white/[0.06]">
                    Method [M1] & Accuracy [A1]
                  </span>
                </div>

                {activeTopic.workedExamples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 shadow-sm space-y-4"
                  >
                    {/* Question header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#222225] border border-white/[0.06] text-xs font-semibold text-white/90 font-mono tabular-nums">
                          #{exIdx + 1}
                        </span>
                        <h5 className="text-sm font-semibold text-white">{ex.title}</h5>
                      </div>
                      <span className="self-start sm:self-auto rounded-md bg-[#222225] border border-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-white/90 font-mono tabular-nums">
                        Total: {ex.totalMarks} Marks
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="rounded-lg border border-white/[0.06] bg-[#18181b] p-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2">
                        <FileQuestion className="h-3.5 w-3.5 text-[#FF5B37]" />
                        <span>Official Exam Question Prompt</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/90 whitespace-pre-line leading-relaxed font-sans">
                        {ex.examQuestion}
                      </p>
                    </div>

                    {/* Step-by-Step Mark Scheme Solution */}
                    <div className="space-y-3">
                      <h6 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-[#4cc38a]" />
                        <span>Step-by-Step Cambridge Marking Breakdown</span>
                      </h6>

                      {ex.steps.map((st) => (
                        <div
                          key={st.stepNumber}
                          className="rounded-lg border border-white/[0.04] bg-[#18181b] p-3.5 transition hover:border-white/[0.08]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#222225] text-[10px] font-semibold text-white/70 font-mono tabular-nums">
                                {st.stepNumber}
                              </span>
                              <span className="text-xs font-medium text-white/90">{st.title}</span>
                            </div>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold font-mono tabular-nums border ${
                              st.markAwarded.includes('[A1]')
                                ? 'bg-[#4cc38a]/15 text-[#4cc38a] border-[#4cc38a]/30'
                                : st.markAwarded.includes('[M1]')
                                ? 'bg-white/[0.06] text-white/90 border-white/[0.1]'
                                : 'bg-white/[0.04] text-white/70 border-white/[0.06]'
                            }`}>
                              {st.markAwarded}
                            </span>
                          </div>

                          {st.working && (
                            <div className="my-2 rounded-lg bg-[#141416] p-2.5 font-mono text-xs text-white/90 border border-white/[0.06]">
                              <MathRenderer content={st.working} />
                            </div>
                          )}

                          <p className="text-xs text-white/60 leading-relaxed font-sans">
                            {st.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Final Answer */}
                    <div className="rounded-lg border border-[#4cc38a]/30 bg-[#4cc38a]/[0.05] p-3.5 flex items-start gap-3">
                      <div className="rounded-md bg-[#4cc38a]/15 p-1.5 text-[#4cc38a] mt-0.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#4cc38a]">Final Answer</span>
                        <div className="text-sm font-semibold text-white font-mono mt-0.5">
                          <MathRenderer content={ex.finalAnswer} />
                        </div>
                      </div>
                    </div>

                    {/* Principal Examiner Commentary */}
                    {ex.examinerCommentary && (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3.5 text-xs text-amber-200/90 leading-relaxed">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Principal Examiner Commentary & Common Student Traps
                        </span>
                        <p className="font-sans">{ex.examinerCommentary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#18181b] p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-white/20 mb-3" />
          <h3 className="text-base font-semibold text-white/80">No revision notes added yet for {subject.name}</h3>
          <p className="mt-1 text-xs text-white/50">
            Compile an instant high-yield syllabus revision guide!
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-4 py-2 text-xs font-medium text-white shadow-sm transition cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            Generate Revision Guide
          </button>
        </div>
      )}

      {/* Generate Notes Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#18181b] p-6 shadow-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:bg-[#222225] hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg bg-[#FF5B37]/10 p-2 text-[#FF5B37] border border-[#FF5B37]/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Generate Syllabus Revision Guide</h3>
            </div>

            <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
              Enter any syllabus unit from {subject.name} to compile key definitions, concept notes, and examiner pitfalls.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="e.g. Thermal Physics, Photosynthesis, Quadratic graphs"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] p-2.5 text-xs text-white placeholder-white/30 focus:border-[#FF5B37] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {subject.topics.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiTopicInput(t)}
                    className="rounded-md border border-white/[0.06] bg-[#141416] px-2.5 py-1 text-[11px] text-white/70 hover:border-[#FF5B37]/40 hover:text-white cursor-pointer transition"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-white/60 hover:bg-[#222225] hover:text-white cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiNotes}
                disabled={isGenerating || !aiTopicInput.trim()}
                className="flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-5 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-50 cursor-pointer transition"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Compiling Summary Sheet...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
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
