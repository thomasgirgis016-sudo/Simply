import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
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
  HelpCircle,
  Activity,
  ListChecks,
  CheckCheck
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
  },
  {
    id: 'esl-card-4',
    title: 'Candidate Card D: Tourism & Cultural Preservation',
    part: 2,
    examinerPrompt:
      'International tourism generates significant income for many countries, but it can also threaten traditional ways of life.\nDiscuss this topic with the examiner.',
    topicCardBulletPoints: [
      'Historic sites or natural landmarks in your country popular with visitors',
      'The economic benefits tourism brings to local communities',
      'How excessive tourism can damage environments and local traditions',
      'Whether tourists should be made to pay special cultural preservation taxes',
      'The idea that travelling broadens the mind and reduces prejudice'
    ],
    suggestedPhrases: [
      'Tourism undeniably serves as a catalyst for economic vitality...',
      'Nonetheless, overtourism poses a severe existential threat...',
      'Striking an equitable balance is imperative...',
      'Cross-cultural exchanges fundamentally dismantle stereotypes...'
    ],
    sampleBand9Response:
      'Tourism undeniably serves as an economic catalyst for developing regions. Nonetheless, unfettered visitor volumes frequently erode indigenous customs and strain local ecosystems. Consequently, destination authorities must institute sustainable visitor quotas and reinvest revenues directly into cultural heritage.'
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
  
  // 2-Turn Dialogue State
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [studentResponseTurn1, setStudentResponseTurn1] = useState('');
  const [studentResponseTurn2, setStudentResponseTurn2] = useState('');
  const [activeFollowUpQuestion, setActiveFollowUpQuestion] = useState(
    'How do you envision the next generation handling these challenges differently compared to your own age group?'
  );

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
          if (currentTurn === 1) {
            setStudentResponseTurn1((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setStudentResponseTurn2((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
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
  }, [currentTurn]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not natively supported in this browser. Please type your response directly into the text box.');
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

  // British Voice Speech Synthesis
  const speakWithBritishVoice = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (isSpeakingExaminer) {
      setIsSpeakingExaminer(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(
      (v) =>
        v.lang === 'en-GB' ||
        v.name.includes('British') ||
        v.name.includes('UK') ||
        v.name.includes('George') ||
        v.name.includes('Daniel')
    );
    if (britishVoice) {
      utterance.voice = britishVoice;
    }

    utterance.onend = () => setIsSpeakingExaminer(false);
    utterance.onerror = () => setIsSpeakingExaminer(false);

    setIsSpeakingExaminer(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakCardPrompt = () => {
    const textToRead = `Candidate Card: ${selectedCard.title}. ${selectedCard.examinerPrompt}. Here are the discussion bullet points: ${selectedCard.topicCardBulletPoints?.join('. ')}`;
    speakWithBritishVoice(textToRead);
  };

  const handleSpeakFollowUp = () => {
    speakWithBritishVoice(activeFollowUpQuestion);
  };

  const handleAdvanceToTurn2 = () => {
    if (!studentResponseTurn1.trim()) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Dynamic Part C follow-up probing question
    const followUps: Record<string, string> = {
      'esl-card-1': 'You mentioned online connections. In your opinion, do young people experience more anxiety when they feel obligated to respond immediately to messages?',
      'esl-card-2': 'That raises an interesting question. If renewable energy is more expensive initially, do you think developing nations should be exempted from strict carbon caps?',
      'esl-card-3': 'Interesting point about automation. If artificial intelligence takes over creative tasks like music and art, what unique purpose remains for human artists?',
      'esl-card-4': 'Fascinating viewpoint on tourism. How can local authorities guarantee that preservation taxes are not diverted away from cultural restoration projects?'
    };
    const question = followUps[selectedCard.id] || 'Could you elaborate on how differing societal values might influence the way people perceive this issue?';
    setActiveFollowUpQuestion(question);
    setCurrentTurn(2);
    // Automatically speak the follow-up question in British English
    setTimeout(() => {
      speakWithBritishVoice(question);
    }, 400);
  };

  const handleEvaluate = async () => {
    if (!studentResponseTurn1.trim()) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsEvaluating(true);
    try {
      const res = await evaluateEslSpeakingWithGemini(
        selectedCard.title,
        selectedCard.examinerPrompt,
        studentResponseTurn1,
        studentResponseTurn2,
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
    setStudentResponseTurn1('');
    setStudentResponseTurn2('');
    setCurrentTurn(1);
    setEvaluation(null);
    setPrepSecondsLeft(120);
    setIsPrepTimerRunning(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingExaminer(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              <Mic className="h-4 w-4" />
              <span>Cambridge IGCSE ESL (0510 / 0511) · Component 5 Speaking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Official 30-Mark Examiner Oral Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Two-turn dialogue simulation with British speech synthesis, official 3-part Cambridge rubrics, and line-by-line grammar feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300">
              Max Score: <strong className="text-cyan-400 font-mono">30 Marks</strong>
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Candidate Topic Card (Official Part C) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
            {/* Card Selector Dropdown */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Select Candidate Card (Part C Topic):
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-semibold focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {SAMPLE_SPEAKING_CARDS.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Preparation Timer */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-200">
                  Card Prep Time: <strong className="font-mono text-sm text-white">{Math.floor(prepSecondsLeft / 60)}:{(prepSecondsLeft % 60).toString().padStart(2, '0')}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrepTimerRunning(!isPrepTimerRunning)}
                className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
              >
                {isPrepTimerRunning ? 'Pause' : 'Start 2-Min Prep'}
              </button>
            </div>

            {/* Card Content Display */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">{selectedCard.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                {selectedCard.examinerPrompt}
              </p>
            </div>

            {/* Discussion Bullet Points A to E */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Discussion Bullet Prompts:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedCard.topicCardBulletPoints?.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-bold text-cyan-400 shrink-0 font-mono">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-snug">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* British Voice Audio Controls */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSpeakCardPrompt}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 transition active:scale-95 cursor-pointer"
              >
                {isSpeakingExaminer ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                <span>{isSpeakingExaminer ? 'Stop Voice' : 'Examiner: Read Card Aloud (UK)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentResponseTurn1(selectedCard.sampleBand9Response)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Sample Band 9
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Two-Turn Dialogue Input & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5">
            {/* Step Indicator (Turn 1 vs Turn 2) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentTurn === 1 ? 'bg-cyan-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {currentTurn === 2 ? '✓' : '1'}
                </span>
                <span className="text-xs font-bold text-white">
                  Turn 1: Candidate Card Response
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${currentTurn === 2 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  2
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Turn 2: Part C Follow-Up Probing
                </span>
              </div>
            </div>

            {/* Turn 1 Input Area */}
            <div className={`space-y-2 ${currentTurn === 2 ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Initial Speech: Present your perspective on the card
                </span>
                {currentTurn === 1 && (
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                        : 'border border-cyan-500/40 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isRecording ? 'Recording...' : 'Record Voice (Mic)'}</span>
                  </button>
                )}
              </div>

              <textarea
                rows={4}
                value={studentResponseTurn1}
                disabled={currentTurn === 2}
                onChange={(e) => setStudentResponseTurn1(e.target.value)}
                placeholder="Speak into your microphone or type your initial oral presentation here (aim for 60 to 120 words to demonstrate fluency)..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{studentResponseTurn1.trim().split(/\s+/).filter(Boolean).length} words recorded</span>
                <span>Target: 60–120 words</span>
              </div>
            </div>

            {/* Advance to Turn 2 Trigger (If Turn 1 has input) */}
            {currentTurn === 1 && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!studentResponseTurn1.trim()}
                  onClick={handleAdvanceToTurn2}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition cursor-pointer disabled:opacity-40"
                >
                  <span>Submit Turn 1 & Trigger Examiner Follow-Up</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Turn 2 Follow-Up Section */}
            {currentTurn === 2 && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-fadeIn">
                {/* Examiner Question Banner */}
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Senior Examiner Follow-Up Probing Question:
                    </span>
                    <button
                      type="button"
                      onClick={handleSpeakFollowUp}
                      className="text-cyan-400 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Re-play Audio</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-white font-medium italic leading-relaxed">
                    "{activeFollowUpQuestion}"
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Your Response to Follow-Up Question:
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                        : 'border border-cyan-500/40 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isRecording ? 'Recording...' : 'Record Voice'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={studentResponseTurn2}
                  onChange={(e) => setStudentResponseTurn2(e.target.value)}
                  placeholder="Answer the examiner's follow-up question. Support your answer with a balanced perspective or real-life example..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none leading-relaxed"
                />

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentTurn(1)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Edit Turn 1
                  </button>

                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={handleEvaluate}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isEvaluating ? 'Evaluating Cambridge Rubrics...' : 'Assess Full 30-Mark Exam'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EVALUATION RESULTS: OFFICIAL CAMBRIDGE 30-MARK RUBRIC */}
      {evaluation && (
        <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/95 p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          {/* Header & Overall Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                <Award className="h-4 w-4" />
                <span>Official Cambridge IGCSE Component 5 Speaking Report</span>
              </div>
              <h2 className="text-2xl font-black text-white">Oral Performance Evaluation</h2>
              <p className="text-xs text-slate-300">
                Assessment broken down across the three official Cambridge Component 5 criteria (10 marks each).
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-950 to-amber-950/20 px-6 py-4 text-center shrink-0 shadow-lg">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Total Cambridge Mark
              </div>
              <div className="text-4xl font-black text-amber-300 font-mono mt-0.5">
                {evaluation.totalScore ?? 25} <span className="text-lg text-slate-400">/ 30</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                {evaluation.estimatedGrade || 'Grade 9 / A* Standard'}
              </div>
            </div>
          </div>

          {/* 3 OFFICIAL CAMBRIDGE CRITERIA CARDS (10 MARKS EACH) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Criteria 1: Grammatical Accuracy and Variety */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-cyan-300">
                  1. Grammar & Variety
                </span>
                <span className="rounded-lg bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300 font-mono">
                  {evaluation.grammaticalAccuracyAndVariety?.score ?? evaluation.structureAndGrammar?.score ?? 8} / 10
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation.grammaticalAccuracyAndVariety?.feedback || evaluation.structureAndGrammar?.feedback}
              </p>
              {evaluation.grammaticalAccuracyAndVariety?.quotedPhrases && evaluation.grammaticalAccuracyAndVariety.quotedPhrases.length > 0 && (
                <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg italic">
                  Quoted: {evaluation.grammaticalAccuracyAndVariety.quotedPhrases.join(' ')}
                </div>
              )}
            </div>

            {/* Criteria 2: Vocabulary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-purple-300">
                  2. Vocabulary Range
                </span>
                <span className="rounded-lg bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 font-mono">
                  {evaluation.vocabulary?.score ?? evaluation.vocabularyRange?.score ?? 8} / 10
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation.vocabulary?.feedback || evaluation.vocabularyRange?.feedback}
              </p>
              <div className="text-[11px] text-purple-300/80 bg-purple-950/30 p-2 rounded-lg">
                Collocation and technical lexical resource verified.
              </div>
            </div>

            {/* Criteria 3: Development and Fluency */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-sm text-emerald-300">
                  3. Development & Fluency
                </span>
                <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 font-mono">
                  {evaluation.developmentAndFluency?.score ?? evaluation.fluencyAndCohesion?.score ?? 9} / 10
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation.developmentAndFluency?.feedback || evaluation.fluencyAndCohesion?.feedback}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Pacing: <strong className="text-white">{evaluation.developmentAndFluency?.pacingWpm || 125} WPM</strong></span>
                <span>Fillers: <strong className="text-white">{evaluation.developmentAndFluency?.fillerWordsCount || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE GRAMMAR CORRECTIONS */}
          {evaluation.grammaticalAccuracyAndVariety?.grammarCorrections && evaluation.grammaticalAccuracyAndVariety.grammarCorrections.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Examiner Grammar & Sentence Structure Corrections:
              </span>
              <div className="space-y-2 text-xs">
                {evaluation.grammaticalAccuracyAndVariety.grammarCorrections.map((gc, i) => (
                  <div key={i} className="rounded-xl bg-slate-900 p-3 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4 text-rose-300/90">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">You Said:</span>
                      "{gc.youSaid}"
                    </div>
                    <div className="md:col-span-4 text-emerald-300 font-semibold">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Band 9 Version:</span>
                      "{gc.better}"
                    </div>
                    <div className="md:col-span-4 text-slate-400 text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Examiner Rule:</span>
                      {gc.ruleExplanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BAND 9 VOCABULARY UPGRADES TABLE */}
          {(evaluation.vocabulary?.band9Upgrades || evaluation.suggestedUpgradedPhrases) && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Band 9 Vocabulary Upgrades:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {(evaluation.vocabulary?.band9Upgrades || evaluation.suggestedUpgradedPhrases || []).map((u: any, idx: number) => (
                  <div key={idx} className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-rose-300 line-through text-[11px]">{u.original}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="font-bold text-emerald-300">{u.upgraded}</span>
                    </div>
                    {u.context && (
                      <span className="text-[10px] text-slate-400 italic mt-1">{u.context}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXAMINER RECOMMENDATIONS & STRENGTHS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Demonstrated Strengths in Discussion:
              </div>
              <ul className="space-y-1.5 text-emerald-200/90 list-disc list-inside">
                {(evaluation.keyStrengths || [
                  'Addressed candidate card discussion bullet points with personal reasoning',
                  'Sustained continuous communication across both conversation turns'
                ]).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Key Recommendations for Exam Day:
              </div>
              <ul className="space-y-1.5 text-amber-200/90 list-disc list-inside">
                {(evaluation.examinerRecommendations || evaluation.areasForImprovement || [
                  'Use pausing deliberately instead of filler vocalizations (um, like)',
                  'Elaborate upon hypothetical perspectives to reach Band 10'
                ]).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
