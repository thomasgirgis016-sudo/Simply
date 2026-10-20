import React, { useState, useEffect, useMemo } from 'react';
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
import { HomeView } from './components/HomeView';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountGate } from './components/AccountGate';
import { TeacherAnalyticsDashboard } from './components/TeacherAnalyticsDashboard';
import { PaymentModal } from './components/PaymentModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ScientificCalculator } from './components/ScientificCalculator';
import { SecretAdminModal } from './components/SecretAdminModal';
import { SimplyLogo } from './components/SimplyLogo';
import { getActiveUser, setActiveUser, grantUserProSubscription, hasActiveSubscription, updateUserAccount, validateActiveSession, logoutUser } from './services/auth';
import {
  Camera,
  Layers,
  GraduationCap,
  BookOpen,
  BookmarkCheck,
  MessageSquare,
  Calculator,
  Home,
  FileText
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
    'cie-bio-0610'
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // 4. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // 4b. Theme & Accessibility State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [fontSize, setFontSize] = useState<'default' | 'medium' | 'large'>(() => {
    try {
      const saved = localStorage.getItem('simply_igcse_font_size');
      if (saved === 'default' || saved === 'medium' || saved === 'large') return saved;
    } catch {
      // ignore
    }
    return 'default';
  });

  useEffect(() => {
    try {
      localStorage.setItem('simply_igcse_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      console.warn('Theme storage sync error:', e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('simply_igcse_font_size', fontSize);
      const sizeMap = {
        default: '100%',
        medium: '112%',
        large: '125%',
      };
      document.documentElement.style.fontSize = sizeMap[fontSize] || '100%';
    } catch (e) {
      console.warn('Font size sync error:', e);
    }
  }, [fontSize]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Global Escape Key Listener for Modals & Overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCalculatorOpen(false);
        setIsSettingsOpen(false);
        setIsProfileOpen(false);
        setIsAuthOpen(false);
        setIsSecretAdminOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret Admin Access via URL (?admin=portal / ?admin=true) or Hotkey (Ctrl+Shift+A)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'portal' || params.get('admin') === 'true') {
        setIsSecretAdminOpen(true);
        params.delete('admin');
        const cleanUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch (e) {
      console.warn('Admin param detection bypassed:', e);
    }

    const handleSecretShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSecretAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleSecretShortcut);
    return () => window.removeEventListener('keydown', handleSecretShortcut);
  }, []);

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
        // Merge initial topics with saved data so newly added diagrams and worked examples appear
        return INITIAL_REVISION_NOTES.map(initNote => {
          const savedNote = parsed.find(p => p.id === initNote.id);
          return savedNote ? { ...savedNote, ...initNote } : initNote;
        }).concat(parsed.filter(p => !INITIAL_REVISION_NOTES.some(i => i.id === p.id)));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVISION_NOTES;
  });

  const [formulas] = useState<FormulaItem[]>(INITIAL_FORMULAS);

  // 5b. Single Device Session Conflict Alert
  const [deviceConflictAlert, setDeviceConflictAlert] = useState<string | null>(null);

  // 6. Active Subject (Guarantees CIE 0610 Biology is always available in header selector)
  const enrolledSubjects = useMemo(() => {
    let ids = profile.selectedSubjectIds || [];
    if (!ids.includes('cie-bio-0610') && ids.length < 5) {
      ids = [...ids, 'cie-bio-0610'];
    }
    const filtered = IGCSE_SUBJECTS.filter(s => ids.includes(s.id));
    return filtered.length > 0 ? filtered : IGCSE_SUBJECTS.slice(0, 5);
  }, [profile.selectedSubjectIds]);

  const [activeSubject, setActiveSubject] = useState<Subject>(
    () => enrolledSubjects[0] || IGCSE_SUBJECTS[0]
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

  // Single Device Enforcement Heartbeat: logs out if logged in elsewhere
  useEffect(() => {
    if (!currentUser) return;

    const checkSessionIntegrity = () => {
      const validation = validateActiveSession(currentUser);
      if (!validation.valid) {
        setDeviceConflictAlert(
          validation.reason ||
          'You have been logged out because this account was logged into from another device. Only 1 device is allowed at a time.'
        );
        handleLogout();
      }
    };

    const interval = setInterval(checkSessionIntegrity, 4000);
    window.addEventListener('focus', checkSessionIntegrity);
    window.addEventListener('storage', checkSessionIntegrity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSessionIntegrity);
      window.removeEventListener('storage', checkSessionIntegrity);
    };
  }, [currentUser]);

  // URL Query Parameters Routing (?tab=...&subject=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const subjectParam = params.get('subject');

      const validTabs: ActiveTab[] = [
        'home',
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
        'split',
        'analytics',
        'admin'
      ];

      if (tabParam === 'classroom' || tabParam === 'analytics') {
        setActiveTab('analytics');
      } else if (tabParam && validTabs.includes(tabParam as ActiveTab)) {
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
      selectedSubjectIds: user.selectedSubjectIds,
      role: user.role,
      status: user.status
    }));

    // Find first enrolled subject for this user
    const firstSubject = IGCSE_SUBJECTS.find(s => user.selectedSubjectIds.includes(s.id));
    if (firstSubject) setActiveSubject(firstSubject);
  };

  const handleRefreshStatus = () => {
    const user = getActiveUser();
    setCurrentUser(user);
    if (user) {
      setProfile(prev => ({
        ...prev,
        role: user.role,
        status: user.status
      }));
    }
  };

  const handleLogout = () => {
    logoutUser();
    setActiveUser(null);
    setCurrentUser(null);
    setProfile(DEFAULT_PROFILE);
    const first = IGCSE_SUBJECTS.find(s => DEFAULT_PROFILE.selectedSubjectIds.includes(s.id));
    if (first) setActiveSubject(first);
  };

  const handleSecretAdminSuccess = (admin: UserAccount) => {
    setCurrentUser(admin);
    setProfile(prev => ({
      ...prev,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      grade: admin.grade,
      board: admin.board,
      targetGrade: admin.targetGrade,
      selectedSubjectIds: admin.selectedSubjectIds,
      role: 'admin',
      status: 'approved',
    }));
    setActiveTab('admin');
    setIsSecretAdminOpen(false);
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

  const canAccessTools = Boolean(
    currentUser && (currentUser.role === 'admin' || currentUser.role === 'founder' || (currentUser.status === 'approved' && hasActiveSubscription(currentUser)))
  );

  const getTabFeatureName = (tab: ActiveTab): string => {
    switch (tab) {
      case 'solver': return 'the AI Question Solver & Grading Engine';
      case 'finder': return 'the Past Papers & Mark Schemes Hub';
      case 'revision': return 'the Revision Notes & Examiner Summaries';
      case 'quiz': return 'Past Paper Mock Quizzes & Tests';
      case 'flashcards': return 'Flashcards & Spaced Repetition';
      case 'formulas': return 'Formulas & Command Words';
      case 'chat': return 'the AI Chief Examiner Chat';
      case 'checklist': return 'the Interactive Syllabus Checklist';
      case 'esl-speaking': return 'the ESL Speaking Oral Exam Simulator';
      case 'boundaries': return 'the Grade Boundaries Calculator';
      case 'split': return 'the Split-Screen Exam Viewer';
      case 'analytics': return 'the School & Teacher Analytics Diagnostics';
      case 'admin': return 'the Administrative & Founder Console';
      default: return 'this study resource';
    }
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
        onOpenPayment={() => setIsPaymentOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSecretAdmin={() => setIsSecretAdminOpen(true)}
      />

      {/* Main Container */}
      <main className={`flex-1 px-3 py-4 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full ${activeTab === 'chat' ? 'pb-24 md:pb-8' : 'pb-28 md:pb-12'}`}>
        {/* Single Device Session Conflict Banner */}
        {deviceConflictAlert && (
          <div className="mb-6 rounded-2xl border border-rose-500/50 bg-rose-950/80 p-4 text-xs font-semibold text-rose-200 shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <span>{deviceConflictAlert}</span>
            </div>
            <button
              onClick={() => setDeviceConflictAlert(null)}
              className="rounded-lg bg-rose-900/60 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-800 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Dashboard (Only when activeTab is admin and current user has admin or founder role) */}
        {activeTab === 'admin' ? (
          (currentUser?.role === 'admin' || currentUser?.role === 'founder') ? (
            <AdminDashboard
              currentUser={currentUser}
              onRefreshUser={handleRefreshStatus}
            />
          ) : (
            <AccountGate
              currentUser={currentUser}
              onOpenAuth={(mode) => {
                setAuthMode(mode || 'signin');
                setIsAuthOpen(true);
              }}
              onRefreshStatus={handleRefreshStatus}
              onLogout={handleLogout}
              onOpenPayment={() => setIsPaymentOpen(true)}
              featureName={getTabFeatureName('admin')}
            />
          )
        ) : !canAccessTools ? (
          /* Mandatory Account & Waitlist Access Gate for all visitors and pending accounts */
          <AccountGate
            currentUser={currentUser}
            onOpenAuth={(mode) => {
              setAuthMode(mode || 'signup');
              setIsAuthOpen(true);
            }}
            onRefreshStatus={handleRefreshStatus}
            onLogout={handleLogout}
            onOpenPayment={() => setIsPaymentOpen(true)}
            featureName={getTabFeatureName(activeTab)}
          />
        ) : (
          /* Approved Students & Admins: Full study platform views */
          <>
            {activeTab === 'home' && (
              <HomeView
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                activeSubject={activeSubject}
                onSelectSubject={setActiveSubject}
                onNavigateTab={setActiveTab}
                profile={profile}
                currentUser={currentUser}
                onOpenAuth={(mode) => {
                  setAuthMode(mode || 'signin');
                  setIsAuthOpen(true);
                }}
              />
            )}

            {activeTab === 'solver' && (
              <QuestionSolver
                subject={activeSubject}
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                onSelectSubject={setActiveSubject}
                profile={profile}
                onOpenChatWithQuestion={handleOpenChatWithQuestion}
              />
            )}

            {activeTab === 'finder' && (
              <PastPaperFinder
                activeSubject={activeSubject}
                subjects={IGCSE_SUBJECTS}
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
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                onSelectSubject={setActiveSubject}
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

            {activeTab === 'analytics' && (
              <TeacherAnalyticsDashboard
                currentUser={currentUser}
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                onOpenQuizWithDrill={(drillQuestions) => {
                  handleAddQuizzes(drillQuestions as any);
                  setActiveTab('quiz');
                }}
                onOpenChatWithTopic={(topic) => {
                  setChatInitialQuestion(`Please create an urgent 5-question diagnostic exam drill with official Cambridge mark scheme rubrics targeting: "${topic}".`);
                  setActiveTab('chat');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Phone Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        {[
          { id: 'home', label: 'Home', icon: Home, color: 'text-indigo-400' },
          { id: 'finder', label: 'Papers', icon: FileText, color: 'text-amber-400' },
          { id: 'revision', label: 'Notes', icon: BookOpen, color: 'text-cyan-400' },
          { id: 'quiz', label: 'Quizzes', icon: GraduationCap, color: 'text-emerald-400' },
          { id: 'solver', label: 'AI Solver', icon: Camera, color: 'text-pink-400' },
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
          <div className="flex items-center gap-2.5">
            <SimplyLogo size="sm" showText={false} />
            <span className="font-bold text-slate-200">Simply IGCSE AI Co-Pilot</span>
            <span className="text-slate-600">|</span>
            <span>Cambridge (CIE) & Pearson Edexcel Curriculum</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {currentUser ? (
              <span className="text-emerald-400 font-medium">Signed in as {currentUser.name}</span>
            ) : (
              <button
                onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Create Account & Join Waitlist
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
              Target: <span className="font-bold text-amber-400">{profile.targetGrade}</span>
            </span>
            <span>•</span>
            {/* Discreet Secret Admin Trigger */}
            <button
              onClick={() => setIsSecretAdminOpen(true)}
              className="text-slate-600 hover:text-slate-400 transition p-1 cursor-default opacity-40 hover:opacity-100"
              title="System"
            >
              ©
            </button>
          </div>
        </div>
      </footer>

      {/* Secret Admin Passcode Modal (Hidden Portal) */}
      <SecretAdminModal
        isOpen={isSecretAdminOpen}
        onClose={() => setIsSecretAdminOpen(false)}
        onSuccess={handleSecretAdminSuccess}
      />

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
        theme={theme}
        onToggleTheme={handleToggleTheme}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
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

      {/* Payment Modal (InstaPay & BDC SMS Two-Way Matcher) */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        currentUser={currentUser}
        profile={profile}
        onPaymentSuccess={(updatedData) => {
          if (currentUser) {
            updateUserAccount(currentUser.id, updatedData);
          }
          handleRefreshStatus();
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}

export default App;
