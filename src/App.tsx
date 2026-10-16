import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Subject,
  Flashcard,
  QuizQuestion,
  RevisionTopic,
  FormulaItem
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
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { Sparkles, GraduationCap, ShieldCheck, Heart } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
  board: 'Both',
  targetGrade: '9 / A*',
  selectedSubjectIds: [
    'cie-math-0580',
    'cie-physics-0625',
    'cie-chem-0620',
    'cie-bio-0610',
    'cie-cs-0478',
    'cie-econ-0455'
  ],
  geminiApiKey: '',
  selectedModel: 'gemini-2.5-flash',
};

export function App() {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_profile');
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('solver');

  // 3. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 4. Content Data State (Flashcards, Quizzes, Notes, Formulas)
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_flashcards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FLASHCARDS;
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_quizzes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUIZZES;
  });

  const [revisionNotes, setRevisionNotes] = useState<RevisionTopic[]>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_revision');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVISION_NOTES;
  });

  const [formulas] = useState<FormulaItem[]>(INITIAL_FORMULAS);

  // 5. Active Subject
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

  // Handlers
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updated };
      // Check if current active subject is still in enrolled
      if (next.selectedSubjectIds.length > 0 && !next.selectedSubjectIds.includes(activeSubject.id)) {
        const first = IGCSE_SUBJECTS.find(s => s.id === next.selectedSubjectIds[0]);
        if (first) setActiveSubject(first);
      }
      return next;
    });
  };

  const handleAddFlashcards = (newCards: Flashcard[]) => {
    setFlashcards(prev => [...newCards, ...prev]);
  };

  const handleUpdateFlashcardMastery = (id: string, mastered: boolean) => {
    setFlashcards(prev =>
      prev.map(c => (c.id === id ? { ...c, mastered } : c))
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        activeSubject={activeSubject}
        onSelectSubject={setActiveSubject}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 py-6 sm:px-6 md:py-8 max-w-7xl mx-auto w-full">
        {activeTab === 'solver' && (
          <QuestionSolver
            subject={activeSubject}
            profile={profile}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-200">Simply IGCSE AI Co-Pilot</span>
            <span className="text-slate-600">|</span>
            <span>Crafted for Cambridge (CIE) & Pearson Edexcel Students</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              Grade & Subjects
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              AI Key Settings
            </button>
            <span>•</span>
            <span className="text-slate-500 flex items-center gap-1">
              Targeting <span className="font-bold text-amber-400">{profile.targetGrade}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
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
    </div>
  );
}

export default App;
