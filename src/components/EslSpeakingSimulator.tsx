import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Clock,
  Send,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Subject, UserProfile, EslSpeakingPrompt, EslSpeakingEvaluation } from '../types';
import { evaluateEslSpeakingWithGemini } from '../services/gemini';

const SAMPLE_SPEAKING_CARDS: EslSpeakingPrompt[] = [
  {
    id: 'esl-card-1',
    title: 'Candidate Card A: Social Media & Modern Communication',
    part: 2,
    examinerPrompt:
      'Many young people now communicate primarily through instant messaging and social media applications rather than face-to-face.\nDiscuss this topic with the examiner.',
    topicCardBulletPoints: [
      'The ways you and your friends prefer to stay in touch',
      'The advantages of being able to contact people instantaneously around the world',
      'The disadvantages or pressures of always being reachable online',
      'Whether emojis and abbreviations are undermining standard language',
      'The view that virtual relationships will eventually replace physical communities'
    ],
    suggestedPhrases: [
      'From my perspective...',
      'It is widely acknowledged that...',
      'Notwithstanding the obvious benefits...',
      'On the flip side of the argument...',
      'In the final analysis...'
    ],
    sampleBand9Response:
      'From my perspective, instant messaging has completely revolutionized adolescent discourse. While the immediacy of global connectivity is undeniably advantageous, it often fosters an unsustainable expectation of constant availability. Consequently, digital communication should complement rather than supplant face-to-face interaction.'
  },
  {
    id: 'esl-card-2',
    title: 'Candidate Card B: Environmental Protection & Individual Responsibility',
    part: 2,
    examinerPrompt:
      'Climate change and plastic pollution are major global challenges.\nDiscuss whether individual lifestyle changes can genuinely make an impact.',
    topicCardBulletPoints: [
      'Eco-friendly habits you practice in your daily life',
      'Whether small actions like recycling actually reduce global pollution',
      'The role governments and multinational corporations should play compared to citizens',
      'How schools can foster active ecological responsibility in students',
      'The perspective that economic growth inevitably compromises the natural environment'
    ],
    suggestedPhrases: [
      'It is increasingly apparent that...',
      'While individual endeavors are commendable...',
      'A multifaceted approach is essential...',
      'Governments must enact stringent regulations...',
      'Ultimately, sustainable development hinges upon...'
    ],
    sampleBand9Response:
      'While individual endeavors such as recycling are commendable, they remain largely symbolic unless supported by systemic corporate accountability. Governments must enact stringent carbon taxes and subsidize renewable infrastructure to achieve meaningful ecological preservation.'
  },
  {
    id: 'esl-card-3',
    title: 'Candidate Card C: Artificial Intelligence & Future Careers',
    part: 2,
    examinerPrompt:
      'Artificial intelligence and automated robotics are transforming workplaces.\nDiscuss the future of employment and education.',
    topicCardBulletPoints: [
      'Jobs you think will be completely automated in the next twenty years',
      'Human skills that machines can never truly replicate (e.g. empathy, creativity)',
      'How schools should adapt curricula to prepare students for an AI-driven economy',
      'The ethical implications of autonomous decision-making in healthcare and law',
      'Whether AI will create more prosperity or exacerbate global inequality'
    ],
    suggestedPhrases: [
      'Undoubtedly, automation will disrupt...',
      'Human faculties such as emotional intelligence...',
      'Educational institutions ought to prioritize...',
      'This presents profound ethical dilemmas...',
      'In conclusion, human-machine synergy is paramount...'
    ],
    sampleBand9Response:
      'Undoubtedly, automation will disrupt conventional clerical and routine analytical professions. However, uniquely human faculties such as emotional intelligence and lateral creativity remain irreplaceable. Hence, pedagogical paradigms must pivot away from rote memorization toward critical synthesis.'
  }
];

interface EslSpeakingSimulatorProps {
  activeSubject: Subject;
  profile: UserProfile;
}

export const EslSpeakingSimulator: React.FC<EslSpeakingSimulatorProps> = ({
  activeSubject,
  profile,
}) => {
  const [selectedCard, setSelectedCard] = useState<EslSpeakingPrompt>(SAMPLE_SPEAKING_CARDS[0]);
  const [studentResponseText, setStudentResponseText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(120); // 2 minutes official card prep
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState(false);
  const [isSpeakingExaminer, setIsSpeakingExaminer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EslSpeakingEvaluation | null>(null);

  const recognitionRef = useRef<any>(null);

  // Prep Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isPrepTimerRunning && prepSecondsLeft > 0) {
      timer = setInterval(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0) {
      setIsPrepTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isPrepTimerRunning, prepSecondsLeft]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-GB';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setStudentResponseText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not natively supported in this browser. Please type your spoken response directly into the text box below.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Text-to-Speech: Examiner speaks the prompt
  const handleSpeakPrompt = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeakingExaminer) {
      window.speechSynthesis.cancel();
      setIsSpeakingExaminer(false);
      return;
    }

    const textToRead = `Candidate Card: ${selectedCard.title}. ${selectedCard.examinerPrompt}. Here are the discussion bullet points: ${selectedCard.topicCardBulletPoints?.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingExaminer(false);
    utterance.onerror = () => setIsSpeakingExaminer(false);

    setIsSpeakingExaminer(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluate = async () => {
    if (!studentResponseText.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await evaluateEslSpeakingWithGemini(
        selectedCard.title,
        selectedCard.examinerPrompt,
        studentResponseText,
        profile.geminiApiKey,
        profile.selectedModel
      );
      setEvaluation(res);
    } catch (err) {
      console.error('ESL Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setStudentResponseText('');
    setEvaluation(null);
    setPrepSecondsLeft(120);
    setIsPrepTimerRunning(false);
    if (isSpeakingExaminer && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeakingExaminer(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20 mb-3">
              <Mic className="h-3.5 w-3.5" />
              <span>Voice-Enabled Cambridge Speaking Simulator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              IGCSE ESL Speaking Oral Examiner
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Simulate the official Cambridge IGCSE English as a Second Language (0510 / 0511) Speaking Test. The AI examiner speaks prompts aloud, listens to your verbal response, and awards a formal Band 1 to 10 score with rubric feedback.
            </p>
          </div>

          {/* Card Selector */}
          <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3.5 shadow-lg shrink-0">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Candidate Card:
            </label>
            <select
              value={selectedCard.id}
              onChange={(e) => {
                const found = SAMPLE_SPEAKING_CARDS.find((c) => c.id === e.target.value);
                if (found) {
                  setSelectedCard(found);
                  handleReset();
                }
              }}
              className="rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none cursor-pointer max-w-[240px] truncate"
            >
              {SAMPLE_SPEAKING_CARDS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Oral Examination Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Candidate Topic Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-lg backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="rounded-md bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                Official Candidate Card
              </span>

              {/* 2-Minute Preparation Countdown Timer */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono font-bold text-white">
                  {Math.floor(prepSecondsLeft / 60)}:{(prepSecondsLeft % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => setIsPrepTimerRunning(!isPrepTimerRunning)}
                  className="ml-1 text-[10px] font-bold text-indigo-400 hover:text-white"
                >
                  {isPrepTimerRunning ? 'Pause' : 'Start Prep (2m)'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{selectedCard.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedCard.examinerPrompt}
              </p>
            </div>

            {/* Official Discussion Points A to E */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Discussion Prompts (Cover as many as possible):
              </p>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedCard.topicCardBulletPoints?.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-bold text-cyan-400 shrink-0 font-mono">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-snug">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Listen to Examiner Voice Action */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSpeakPrompt}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 transition active:scale-95 cursor-pointer"
              >
                {isSpeakingExaminer ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                <span>{isSpeakingExaminer ? 'Stop Voice Prompt' : 'Examiner: Speak Prompt Aloud'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentResponseText(selectedCard.sampleBand9Response)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Load Sample Band 9 Speech
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Speech Input & AI Rubric Scoring */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-lg backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Spoken Answer
                </span>
                {isRecording && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Recording Speech...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'border border-cyan-500/40 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                  }`}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span>{isRecording ? 'Stop Mic' : 'Record Voice'}</span>
                </button>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="space-y-1">
              <textarea
                rows={5}
                value={studentResponseText}
                onChange={(e) => setStudentResponseText(e.target.value)}
                placeholder="Speak into your microphone or type your spoken response here (aim for 60 to 120 words to show fluency)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{studentResponseText.trim().split(/\s+/).filter(Boolean).length} words recorded</span>
                <span>Cambridge Guideline: 2-3 mins speech</span>
              </div>
            </div>

            {/* Suggested Connectives Pill Bar */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Band 9 Transition Phrases:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedCard.suggestedPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setStudentResponseText((prev) =>
                        prev ? `${prev} ${phrase} ` : `${phrase} `
                      )
                    }
                    className="rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 hover:border-cyan-500 hover:text-white transition cursor-pointer"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluate Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={!studentResponseText.trim() || isEvaluating}
                onClick={handleEvaluate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isEvaluating ? 'Evaluating Cambridge Rubrics...' : 'Assess My Speaking Response'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EVALUATION RESULTS CARD */}
      {evaluation && (
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/25 mb-1.5">
                <Award className="h-3.5 w-3.5" />
                <span>Cambridge IGCSE Speaking Examination Report</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Oral Performance Assessment</h2>
            </div>

            {/* Overall Band Pill */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Official Grade
              </div>
              <div className="text-3xl font-black text-amber-300 font-mono mt-0.5">
                Band {evaluation.overallBand} / 10
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {evaluation.overallBand >= 9 ? 'A* Distinction' : evaluation.overallBand >= 7 ? 'Grade A Standard' : 'Developing Fluency'}
              </div>
            </div>
          </div>

          {/* 4 Core Cambridge Criteria Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Structure & Grammar</span>
                <span className="font-bold text-cyan-400 font-mono">{evaluation.structureAndGrammar.score}/10</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{evaluation.structureAndGrammar.feedback}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Vocabulary Range</span>
                <span className="font-bold text-cyan-400 font-mono">{evaluation.vocabularyRange.score}/10</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{evaluation.vocabularyRange.feedback}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Fluency & Cohesion</span>
                <span className="font-bold text-cyan-400 font-mono">{evaluation.fluencyAndCohesion.score}/10</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{evaluation.fluencyAndCohesion.feedback}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Pronunciation & Stress</span>
                <span className="font-bold text-cyan-400 font-mono">{evaluation.pronunciationAndIntonation.score}/10</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{evaluation.pronunciationAndIntonation.feedback}</p>
            </div>
          </div>

          {/* Upgraded Phrases Recommendation */}
          {evaluation.suggestedUpgradedPhrases && evaluation.suggestedUpgradedPhrases.length > 0 && (
            <div className="rounded-2xl border border-indigo-500/25 bg-indigo-950/20 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Examiner Phrase Upgrades to Boost Your Band:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                {evaluation.suggestedUpgradedPhrases.map((u, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-rose-300/90 line-through">{u.original}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="font-bold text-emerald-300">{u.upgraded}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                What You Did Well:
              </div>
              <ul className="space-y-1 text-emerald-200/90 list-disc list-inside">
                {evaluation.keyStrengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Areas to Target for Band 9/10:
              </div>
              <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                {evaluation.areasForImprovement.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
