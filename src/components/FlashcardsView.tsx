import React, { useState } from 'react';
import {
  RotateCw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Award,
  Lightbulb,
  Layers,
  X
} from 'lucide-react';
import { Subject, Flashcard, UserProfile } from '../types';
import { MathRenderer } from './MathRenderer';
import { generateFlashcardsWithGemini } from '../services/gemini';
import { isSubjectMatch } from '../utils/subjectMatcher';

interface FlashcardsViewProps {
  subject: Subject;
  profile: UserProfile;
  flashcards: Flashcard[];
  onAddFlashcards: (newCards: Flashcard[]) => void;
  onUpdateFlashcardMastery: (id: string, mastered: boolean) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  subject,
  profile,
  flashcards,
  onAddFlashcards,
  onUpdateFlashcardMastery,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter flashcards for this subject and topic
  const subjectCards = flashcards.filter(c => isSubjectMatch(c.subjectId, subject));
  const filteredCards = selectedTopic === 'All'
    ? subjectCards
    : subjectCards.filter(c => c.topic === selectedTopic);

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleToggleMastery = (mastered: boolean) => {
    if (!currentCard) return;
    onUpdateFlashcardMastery(currentCard.id, mastered);
    handleNext();
  };

  const handleGenerateAiDeck = async () => {
    if (!aiTopicInput.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateFlashcardsWithGemini(
        subject.name,
        aiTopicInput.trim(),
        4,
        profile.geminiApiKey,
        profile.selectedModel
      );
      onAddFlashcards(generated);
      setIsAiModalOpen(false);
      setAiTopicInput('');
      setSelectedTopic('All');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const masteredCount = subjectCards.filter(c => c.mastered).length;
  const masteryPercentage = subjectCards.length > 0
    ? Math.round((masteredCount / subjectCards.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner & Mastery Progress */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              {subject.code} • {subject.name}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Smart Spaced Repetition Flashcards</h2>
            <p className="text-xs text-slate-400">Master definitions, formulas and mark scheme keywords</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mastery Progress</p>
              <p className="text-sm font-extrabold text-emerald-400">
                {masteredCount} / {subjectCards.length} Cards ({masteryPercentage}%)
              </p>
            </div>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Deck</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>

        {/* Topic filter pill bar */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => { setSelectedTopic('All'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 ${
              selectedTopic === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Topics ({subjectCards.length})
          </button>
          {subject.topics.map((t) => {
            const count = subjectCards.filter(c => c.topic === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => { setSelectedTopic(t); setCurrentIndex(0); setIsFlipped(false); }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 ${
                  selectedTopic === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Arena */}
      {filteredCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No flashcards found for this topic</h3>
          <p className="mt-1 text-xs text-slate-500">
            Click "Generate AI Deck" above to generate cards for this syllabus unit!
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition"
          >
            <Sparkles className="h-4 w-4" />
            Generate with Gemini
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Card Container with 3D Flip */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative h-80 sm:h-96 w-full cursor-pointer perspective-1000 select-none"
          >
            <div
              className={`relative h-full w-full rounded-2xl sm:rounded-3xl border border-slate-700/80 bg-gradient-to-br transition-all duration-500 transform-style-preserve-3d shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              } ${
                currentCard?.mastered
                  ? 'border-emerald-500/40 from-slate-900 via-slate-900 to-emerald-950/30'
                  : 'from-slate-900 via-slate-900 to-indigo-950/40'
              }`}
            >
              {/* FRONT SIDE */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-7 backface-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 sm:pb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-indigo-300">
                      {currentCard?.topic}
                    </span>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-400">
                      {currentCard?.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentCard?.mastered && (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        <Award className="h-3 w-3" /> Mastered
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500">
                      {currentIndex + 1} of {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="my-auto text-center px-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Question / Prompt
                  </p>
                  <MathRenderer
                    content={currentCard?.question || ''}
                    className="text-lg md:text-xl font-bold text-white"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <RotateCw className="h-3.5 w-3.5 group-hover:rotate-180 transition duration-500" />
                    Click anywhere to reveal answer & mark scheme
                  </span>
                  <span className="font-semibold text-indigo-400">FLIP ↺</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 flex flex-col justify-between p-7 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 rounded-3xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                    Syllabus Mark Scheme Answer
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {currentIndex + 1} of {filteredCards.length}
                  </span>
                </div>

                {/* Answer Content */}
                <div className="my-auto overflow-y-auto px-2 max-h-56">
                  <MathRenderer
                    content={currentCard?.answer || ''}
                    className="text-sm md:text-base text-slate-100 font-medium leading-relaxed"
                  />

                  {currentCard?.examinerTip && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Examiner Pro-Tip:
                      </div>
                      <p className="text-xs text-amber-200/90">{currentCard.examinerTip}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <span className="text-slate-500">Click to flip back</span>
                  <span className="font-semibold text-indigo-400">FLIP ↺</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Review Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Confidence Ratings */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleMastery(false)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Still Learning</span>
              </button>
              <button
                onClick={() => handleToggleMastery(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mastered (+1)</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Generate Deck Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Generate IGCSE Flashcards</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Enter any topic from the {subject.name} syllabus (e.g. "Kinematics & v-t graphs", "Electrolysis of brine", "Circle Theorems") and Gemini will generate exam-aligned cards.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Syllabus Topic or Subtopic
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="e.g. Organic Chemistry Alkanes & Alkenes"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {subject.topics.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiTopicInput(t)}
                    className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white"
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
                onClick={handleGenerateAiDeck}
                disabled={isGenerating || !aiTopicInput.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Generating Cards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Cards</span>
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
