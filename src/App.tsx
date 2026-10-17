import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Subject,
  Flashcard,
  QuizQuestion,
  RevisionTopic,
  FormulaItem,
  UserAccount
} from './types';
import { IGCSE_SUBJECTS } from './data/subjects';
import {
  INITIAL_FLASHCARDS,
  INITIAL_QUIZZES,
  INITIAL_REVISION_NOTES,
  INITIAL_FORMULAS
} from './data/initialData';
import { Navbar, ActiveTab } from './components/Navbar';
import { QuestionSolver } from './components/QuestionSolver';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { RevisionNotesView } from './components/RevisionNotesView';
import { FormulaDictionary } from './components/FormulaDictionary';
import { AiTutorChat } from './components/AiTutorChat';
import { GradeBoundariesCalculator } from './components/GradeBoundariesCalculator';
import { SplitScreenPaperViewer } from './components/SplitScreenPaperViewer';
import { PastPaperFinder } from './components/PastPaperFinder';
import { SyllabusChecklist } from './components/SyllabusChecklist';
import { EslSpeakingSimulator } from './components/EslSpeakingSimulator';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ScientificCalculator } from './components/ScientificCalculator';
import { getActiveUser, setActiveUser } from './services/auth';
import {
  Camera,
  Layers,
  GraduationCap,
  BookOpen,
  BookmarkCheck,
  MessageSquare,
  Calculator
} from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
  board: 'Both',
  targetGrade: '9 / A*',
  selectedSubjectIds: [
    'cie-math-0580',
    'cie-esl-0510',
    'cie-physics-0625',
    'cie-chem-0620',
    'cie-bio-0610',
    'cie-cs-0478',
    'cie-econ-0455',
    'cie-history-0470'
  ],
  geminiApiKey: '',
  selectedModel: 'gemini-2.5-flash',
};

export function App() {
  // 1. Current Logged-In User Account
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getActiveUser());

  // 2. Profile State (Synced with active user if logged in)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const active = getActiveUser();
    if (active) {
      return {
        id: active.id,
        name: active.name,
        email: active.email,
        grade: active.grade,
        board: active.board,
        targetGrade: active.targetGrade,
        selectedSubjectIds: active.selectedSubjectIds,
        geminiApiKey: '',
        selectedModel: 'gemini-2.5-flash',
      };
    }
    try {
      const saved = localStorage.getItem('simply_igcse_profile');
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // 3. Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');

  // 4. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // 5. Content Data State (Merge with INITIAL data so new cards/quizzes/notes automatically appear)
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_flashcards');
      if (saved) {
        const parsed: Flashcard[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = INITIAL_FLASHCARDS.filter(c => !existingIds.has(c.id));
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FLASHCARDS;
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_quizzes');
      if (saved) {
        const parsed: QuizQuestion[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(q => q.id));
        const missing = INITIAL_QUIZZES.filter(q => !existingIds.has(q.id));
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUIZZES;
  });

  const [revisionNotes, setRevisionNotes] = useState<RevisionTopic[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_revision');
      if (saved) {
        const parsed: RevisionTopic[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(r => r.id));
        const missing = INITIAL_REVISION_NOTES.filter(r => !existingIds.has(r.id));
        return [...parsed, ...missing];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVISION_NOTES;
  });

  const [formulas] = useState<FormulaItem[]>(INITIAL_FORMULAS);

  // 6. Active Subject
  const enrolledSubjects = IGCSE_SUBJECTS.filter(s =>
    profile.selectedSubjectIds.includes(s.id)
  );
  const [activeSubject, setActiveSubject] = useState<Subject>(
    enrolledSubjects[0] || IGCSE_SUBJECTS[0]
  );

  // Cross-component question passing to chat
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('simply_igcse_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('simply_igcse_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('simply_igcse_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('simply_igcse_revision', JSON.stringify(revisionNotes));
  }, [revisionNotes]);

  // URL Query Parameters Routing (?tab=...&subject=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const subjectParam = params.get('subject');

      const validTabs: ActiveTab[] = [
        'solver',
        'finder',
        'checklist',
        'esl-speaking',
        'flashcards',
        'quiz',
        'revision',
        'formulas',
        'chat',
        'boundaries',
        'split'
      ];
      if (tabParam && validTabs.includes(tabParam as ActiveTab)) {
        setActiveTab(tabParam as ActiveTab);
      }

      if (subjectParam) {
        const found = IGCSE_SUBJECTS.find(
          s =>
            s.id.toLowerCase() === subjectParam.toLowerCase() ||
            s.code.toLowerCase().includes(subjectParam.toLowerCase())
        );
        if (found) {
          setActiveSubject(found);
        }
      }
    } catch (e) {
      console.warn('URL routing read bypassed:', e);
    }
  }, []);

  // Synchronize URL with activeTab and activeSubject changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);
      params.set('subject', activeSubject.id);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      console.warn('URL sync bypassed:', e);
    }
  }, [activeTab, activeSubject]);

  // Auth Handlers
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setProfile(prev => ({
      ...prev,
      id: user.id,
      name: user.name,
      email: user.email,
      grade: user.grade,
      board: user.board,
      targetGrade: user.targetGrade,
      selectedSubjectIds: user.selectedSubjectIds
    }));

    // Find first enrolled subject for this user
    const firstSubject = IGCSE_SUBJECTS.find(s => user.selectedSubjectIds.includes(s.id));
    if (firstSubject) setActiveSubject(firstSubject);
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentUser(null);
    setProfile(DEFAULT_PROFILE);
    const first = IGCSE_SUBJECTS.find(s => DEFAULT_PROFILE.selectedSubjectIds.includes(s.id));
    if (first) setActiveSubject(first);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updated };
      if (next.selectedSubjectIds.length > 0 && !next.selectedSubjectIds.includes(activeSubject.id)) {
        const first = IGCSE_SUBJECTS.find(s => next.selectedSubjectIds.includes(s.id));
        if (first) setActiveSubject(first);
      }
      return next;
    });
  };

  const handleAddFlashcards = (newCards: Flashcard[]) => {
    setFlashcards(prev => [...newCards, ...prev]);
  };

  const handleUpdateFlashcardMastery = (id: string, mastered: boolean, intervalDays?: number) => {
    const nextDate = intervalDays
      ? new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    setFlashcards(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              mastered,
              intervalDays: intervalDays ?? c.intervalDays,
              nextReviewDate: nextDate ?? c.nextReviewDate,
              reviewCount: (c.reviewCount || 0) + 1,
            }
          : c
      )
    );
  };

  const handleAddQuizzes = (newQuizzes: QuizQuestion[]) => {
    setQuizzes(prev => [...newQuizzes, ...prev]);
  };

  const handleAddRevisionNote = (newNote: RevisionTopic) => {
    setRevisionNotes(prev => [newNote, ...prev]);
  };

  const handleOpenChatWithQuestion = (question: string) => {
    setChatInitialQuestion(`Can you explain this question and break down the mark scheme:\n"${question}"`);
    setActiveTab('chat');
  };

  const handleTriggerDiagnosticQuiz = (weakTopics: string[]) => {
    const prompt = `Please create an urgent 5-question diagnostic exam drill with official Cambridge mark scheme rubrics targeting my weak syllabus topics: ${weakTopics.join(', ')}.`;
    setChatInitialQuestion(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        currentUser={currentUser}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        activeSubject={activeSubject}
        onSelectSubject={setActiveSubject}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Main Container */}
      <main className={`flex-1 px-3 py-3 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full ${activeTab === 'chat' ? 'pb-20 md:pb-8' : 'pb-24 md:pb-8'}`}>
        {activeTab === 'solver' && (
          <QuestionSolver
            subject={activeSubject}
            profile={profile}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
          />
        )}

        {activeTab === 'finder' && (
          <PastPaperFinder
            activeSubject={activeSubject}
            profile={profile}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
            onOpenSolverWithQuestion={() => setActiveTab('solver')}
            onOpenSplitViewer={() => setActiveTab('split')}
          />
        )}

        {activeTab === 'checklist' && (
          <SyllabusChecklist
            activeSubject={activeSubject}
            profile={profile}
            onTriggerDiagnosticQuiz={handleTriggerDiagnosticQuiz}
            onOpenAiChatWithTopic={(topic) => {
              setChatInitialQuestion(`Explain official Cambridge syllabus topic: "${topic}". Include key definitions, formulas, and typical exam questions with mark scheme points.`);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'esl-speaking' && (
          <EslSpeakingSimulator
            activeSubject={activeSubject}
            profile={profile}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            subject={activeSubject}
            profile={profile}
            flashcards={flashcards}
            onAddFlashcards={handleAddFlashcards}
            onUpdateFlashcardMastery={handleUpdateFlashcardMastery}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            subject={activeSubject}
            profile={profile}
            quizzes={quizzes}
            onAddQuizzes={handleAddQuizzes}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionNotesView
            subject={activeSubject}
            profile={profile}
            revisionNotes={revisionNotes}
            onAddRevisionNote={handleAddRevisionNote}
          />
        )}

        {activeTab === 'formulas' && (
          <FormulaDictionary
            subject={activeSubject}
            formulas={formulas}
          />
        )}

        {activeTab === 'chat' && (
          <AiTutorChat
            subject={activeSubject}
            profile={profile}
            initialQuestion={chatInitialQuestion}
            onClearInitialQuestion={() => setChatInitialQuestion(undefined)}
          />
        )}

        {activeTab === 'boundaries' && (
          <GradeBoundariesCalculator
            activeSubject={activeSubject}
            profile={profile}
          />
        )}

        {activeTab === 'split' && (
          <SplitScreenPaperViewer
            activeSubject={activeSubject}
            profile={profile}
          />
        )}
      </main>

      {/* Mobile Phone Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        {[
          { id: 'solver', label: 'Solver', icon: Camera, color: 'text-pink-400' },
          { id: 'flashcards', label: 'Cards', icon: Layers, color: 'text-indigo-400' },
          { id: 'quiz', label: 'Quizzes', icon: GraduationCap, color: 'text-emerald-400' },
          { id: 'revision', label: 'Notes', icon: BookOpen, color: 'text-cyan-400' },
          { id: 'formulas', label: 'Formulas', icon: BookmarkCheck, color: 'text-amber-400' },
          { id: 'chat', label: 'AI Tutor', icon: MessageSquare, color: 'text-purple-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 cursor-pointer min-w-[48px] min-h-[48px] ${
                isActive ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-200">Simply IGCSE AI Co-Pilot</span>
            <span className="text-slate-600">|</span>
            <span>Cambridge (CIE) & Pearson Edexcel IGCSE Curriculum</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {currentUser ? (
              <span className="text-emerald-400 font-medium">Signed in as {currentUser.name}</span>
            ) : (
              <button
                onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Create Student Account
              </button>
            )}
            <span>•</span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              Curriculum & Subjects
            </button>
            <span>•</span>
            <span className="text-slate-500 flex items-center gap-1">
              Target Goal: <span className="font-bold text-amber-400">{profile.targetGrade}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Sign in, Sign up, Forgot password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Settings Modal (Optional Admin / Developer override) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Floating Scientific Calculator Toggle (Permitted in Exam Papers 4 & 2) */}
      <button
        onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
        className="fixed bottom-20 right-3.5 md:bottom-6 md:right-6 z-30 flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
        title="Open IGCSE Scientific Calculator (DEG/RAD)"
      >
        <Calculator className="h-4 w-4" />
        <span className="hidden sm:inline">Scientific Calc</span>
      </button>

      {/* Embedded Scientific Calculator */}
      <ScientificCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}

export default App;
