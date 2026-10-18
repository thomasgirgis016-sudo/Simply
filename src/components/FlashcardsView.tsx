import React, { useState, useEffect } from 'react';
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
  X,
  Download
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
  onUpdateFlashcardMastery: (id: string, mastered: boolean, intervalDays?: number) => void;
  subjects?: Subject[];
  onSelectSubject?: (subject: Subject) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  subject,
  profile,
  flashcards,
  onAddFlashcards,
  onUpdateFlashcardMastery,
  subjects,
  onSelectSubject,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Core' | 'Extended'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mobile Touch Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // AI Modal & 10-Card Fast Engine
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTen, setIsGeneratingTen] = useState(false);

  // Filter flashcards for this subject, topic, and tier
  const subjectCards = flashcards.filter(c => isSubjectMatch(c.subjectId, subject));
  const filteredCards = subjectCards.filter(c => {
    const matchesTopic = selectedTopic === 'All' || c.topic === selectedTopic;
    const matchesTier = selectedTier === 'All' || c.difficulty === selectedTier;
    return matchesTopic && matchesTier;
  });

  const currentCard = filteredCards[currentIndex];

  const handleExportAnkiCsv = () => {
    if (subjectCards.length === 0) return;

    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
    let csvContent = 'Front,Back,Topic,ExaminerTip,Tags\n';
    
    subjectCards.forEach((c) => {
      const front = escapeCsv(c.question);
      const back = escapeCsv(`${c.answer}${c.keyFormula ? `\n\nKey Formula: ${c.keyFormula}` : ''}`);
      const topic = escapeCsv(c.topic);
      const tip = escapeCsv(c.examinerTip || '');
      const tags = escapeCsv(`IGCSE ${subject.name.replace(/\s+/g, '_')} ${c.difficulty}`);
      csvContent += `${front},${back},${topic},${tip},${tags}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject.code.replace(/[^a-zA-Z0-9]/g, '_')}_Flashcards_Anki.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45; // 45px swipe threshold

    if (distance > minSwipeDistance) {
      // Swiped left -> next card
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous card
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleRateCard = (rating: 'again' | 'good' | 'easy') => {
    if (!currentCard) return;
    const intervalMap = {
      again: 1,
      good: 3,
      easy: 7,
    };
    const intervalDays = intervalMap[rating];
    const isMastered = rating !== 'again';
    onUpdateFlashcardMastery(currentCard.id, isMastered, intervalDays);
    handleNext();
  };

  // Keyboard navigation shortcuts: Space/Enter = Flip, ArrowLeft = Still Learning, ArrowRight = Mastered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (isAiModalOpen || !currentCard) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleRateCard('again');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleRateCard('good');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, isAiModalOpen]);

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

  const handleGenerateNext10Cards = async () => {
    const chapterName = selectedTopic !== 'All' ? selectedTopic : (subject.topics[0] || 'Core Exam Definitions');
    setIsGeneratingTen(true);
    try {
      const generated = await generateFlashcardsWithGemini(
        subject.name,
        chapterName,
        10,
        profile.geminiApiKey,
        profile.selectedModel
      );
      if (generated && generated.length > 0) {
        onAddFlashcards(generated);
        if (selectedTopic === 'All' && generated[0].topic) {
          setSelectedTopic(generated[0].topic);
        }
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Failed to generate 10 cards:', err);
    } finally {
      setIsGeneratingTen(false);
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mastery Progress</p>
              <p className="text-sm font-extrabold text-emerald-400">
                {masteredCount} / {subjectCards.length} ({masteryPercentage}%)
              </p>
            </div>

            <button
              onClick={handleExportAnkiCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer shadow-sm"
              title="Download flashcards in Anki-compatible CSV format"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export Deck (Anki)</span>
            </button>

            {/* Fast 1-Click Generate Next 10 Cards Button */}
            <button
              onClick={handleGenerateNext10Cards}
              disabled={isGeneratingTen}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Generate the next 10 high-yield exam flashcards for this chapter via AI"
            >
              <Sparkles className={`h-4 w-4 ${isGeneratingTen ? 'animate-spin' : ''}`} />
              <span>{isGeneratingTen ? 'Generating 10 Cards...' : '⚡ AI Generate Next 10 Cards'}</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-indigo-400" />
              <span>Custom Prompt</span>
            </button>
          </div>
        </div>

        {/* Linked Dropdowns: Select Subject & Select Chapter */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Subject:
            </label>
            <select
              value={subject.id}
              onChange={(e) => {
                const found = subjects?.find((s) => s.id === e.target.value);
                if (found && onSelectSubject) {
                  onSelectSubject(found);
                  setSelectedTopic('All');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {subjects && subjects.length > 0 ? (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.board} {s.code} - {s.name}
                  </option>
                ))
              ) : (
                <option value={subject.id}>{subject.board} {subject.code} - {subject.name}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Chapter / Topic:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Chapters ({subjectCards.length} cards total)</option>
              {subject.topics.map((t) => {
                const count = subjectCards.filter((c) => c.topic === t).length;
                return (
                  <option key={t} value={t}>
                    {t} {count > 0 ? `(${count} cards)` : '(0 cards - click AI Generate)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>

        {/* Tier & Topic Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
          {/* Core vs Extended filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="px-2 text-[11px] font-bold text-slate-400">Tier:</span>
            {(['All', 'Core', 'Extended'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => { setSelectedTier(tier); setCurrentIndex(0); setIsFlipped(false); }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedTier === tier
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredCards.length} cards
          </span>
        </div>

        {/* Topic filter pill bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => { setSelectedTopic('All'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${
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
          {/* Active Card Container with 3D Flip & Mobile Touch Swipes */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="group relative h-80 sm:h-96 w-full cursor-pointer perspective-1000 select-none touch-pan-y"
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

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {currentCard?.intervalDays && (
                      <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/25">
                        Interval: {currentCard.intervalDays}d
                      </span>
                    )}
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
                <div className="my-auto text-center px-2 sm:px-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Question / Prompt
                  </p>
                  <MathRenderer
                    content={currentCard?.question || ''}
                    className="text-base sm:text-lg md:text-xl font-bold text-white leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs">
                    <RotateCw className="h-3.5 w-3.5 group-hover:rotate-180 transition duration-500" />
                    Tap anywhere to flip card
                  </span>
                  <span className="font-semibold text-indigo-400">FLIP ↺</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-7 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 rounded-2xl sm:rounded-3xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 sm:pb-3">
                  <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-emerald-300">
                    Syllabus Mark Scheme Answer
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {currentIndex + 1} of {filteredCards.length}
                  </span>
                </div>

                {/* Answer Content */}
                <div className="my-auto overflow-y-auto px-1 sm:px-2 max-h-56">
                  <MathRenderer
                    content={currentCard?.answer || ''}
                    className="text-xs sm:text-sm md:text-base text-slate-100 font-medium leading-relaxed"
                  />

                  {currentCard?.examinerTip && (
                    <div className="mt-3 sm:mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5 sm:p-3 text-left">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Examiner Pro-Tip:
                      </div>
                      <p className="text-xs text-amber-200/90">{currentCard.examinerTip}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <span className="text-slate-400 text-[11px] sm:text-xs">Tap anywhere to flip back</span>
                  <span className="font-semibold text-indigo-400">FLIP ↺</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Swipe Guidance */}
          <div className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>👈 Swipe left for next card • Swipe right for previous 👉</span>
          </div>

          {/* Bottom Review Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 shadow-md">
            {/* Prev / Next buttons */}
            <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1">
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 sm:py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 sm:py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 active:scale-95 transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 3-Button Spaced Repetition Ratings */}
            <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => handleRateCard('again')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-3.5 py-2 sm:py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition cursor-pointer"
                title="Review tomorrow (1 day interval)"
              >
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Again (1d)</span>
              </button>
              <button
                type="button"
                onClick={() => handleRateCard('good')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 sm:px-3.5 py-2 sm:py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition cursor-pointer"
                title="Review in 3 days"
              >
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Good (3d)</span>
              </button>
              <button
                type="button"
                onClick={() => handleRateCard('easy')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-3.5 py-2 sm:py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition cursor-pointer"
                title="Review in 7 days"
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>Easy (7d)</span>
              </button>
            </div>
          </div>

          {/* Desktop & Tablet Keyboard Shortcuts Guide */}
          <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> Flip Card
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">←</kbd> Still Learning (1d)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">→</kbd> Mastered (3d)
            </span>
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
