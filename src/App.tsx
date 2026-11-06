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
import { type ActiveTab } from './components/Navbar';
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
import { ListeningSimulator } from './components/ListeningSimulator';
import { TanzimCalculator } from './components/TanzimCalculator';
import { FormulaMemoryQuizzer } from './components/FormulaMemoryQuizzer';
import { HomeView } from './components/HomeView';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountGate } from './components/AccountGate';
import { TeacherAnalyticsDashboard } from './components/TeacherAnalyticsDashboard';
import { MockExamSimulator } from './components/MockExamSimulator';
import { WorksheetBuilder } from './components/WorksheetBuilder';
import { PrintableClassifiedsGenerator } from './components/PrintableClassifiedsGenerator';
import { WeakSpotRadar } from './components/WeakSpotRadar';
import { PredictedPaperView } from './components/PredictedPaperView';
import { ScienceAtpMaster } from './components/ScienceAtpMaster';
import { StudyRoadmap } from './components/StudyRoadmap';
import { CommandWordsTrapDetector } from './components/CommandWordsTrapDetector';
import { ExaminerPitfallsHeatmap } from './components/ExaminerPitfallsHeatmap';
import { UnitConversionBlitz } from './components/UnitConversionBlitz';
import { MistakeNotebookView } from './components/MistakeNotebookView';
import { NightBeforeCheatSheets } from './components/NightBeforeCheatSheets';
import { HandwritingScannerModal } from './components/HandwritingScannerModal';
import { ParentReportModal } from './components/ParentReportModal';
import { DetailedStudentReportModal } from './components/DetailedStudentReportModal';
import { StudyDuelModal } from './components/StudyDuelModal';
import { PaymentModal } from './components/PaymentModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ScientificCalculator } from './components/ScientificCalculator';
import { SecretAdminModal } from './components/SecretAdminModal';
import { AboutSimplyModal } from './components/AboutSimplyModal';
import { ExamReferenceHudModal } from './components/ExamReferenceHudModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { CompleteRevisionKitModal } from './components/CompleteRevisionKitModal';
import { initPwaListener } from './services/pwaService';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { SimplyLogo } from './components/SimplyLogo';
import { getActiveUser, setActiveUser, grantUserProSubscription, hasActiveSubscription, updateUserAccount, validateActiveSession, validateActiveSessionAsync, logoutUser, getAllUsers, syncUsersWithServer } from './services/auth';
import { getAutoSchedulerConfig, runAutomatedWeeklyDispatch, isWeeklyReportDue } from './services/whatsappService';
import { generateDetailedReport, DetailedStudentReport } from './services/studentReports';
import { safeSetItem } from './services/storage';
import {
  Camera,
  Layers,
  GraduationCap,
  BookOpen,
  BookmarkCheck,
  MessageSquare,
  Calculator,
  Home,
  FileText,
  Menu,
  BookMarked
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
  selectedModel: 'gemini-1.5-flash',
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
        extraSubjectIds: active.extraSubjectIds,
        parentWhatsapp: active.parentWhatsapp,
        lastWeeklyReportSentAt: active.lastWeeklyReportSentAt,
        geminiApiKey: '',
        selectedModel: 'gemini-1.5-flash',
      };
    }
    try {
      const saved = localStorage.getItem('simply_igcse_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedModel?.includes('2.5')) parsed.selectedModel = 'gemini-1.5-flash';
        return { ...DEFAULT_PROFILE, ...parsed };
      }
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
  const [isParentReportOpen, setIsParentReportOpen] = useState(false);
  const [isStudyDuelOpen, setIsStudyDuelOpen] = useState(false);
  const [isHandwritingScannerOpen, setIsHandwritingScannerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isExamHudOpen, setIsExamHudOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isRevisionKitOpen, setIsRevisionKitOpen] = useState(false);
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);
  const [viewedReport, setViewedReport] = useState<DetailedStudentReport | null>(null);

  // Initialize PWA beforeinstallprompt listener
  useEffect(() => {
    initPwaListener();
  }, []);

  // 4b. Liquid vs Executive Design System & Theme
  const [designTheme, setDesignTheme] = useState<'liquid' | 'executive'>(() => {
    try {
      const saved = localStorage.getItem('simply_design_theme');
      if (saved === 'executive' || saved === 'liquid') return saved;
    } catch {
      // fallback
    }
    return 'liquid'; // Default to user requested Liquid Glass UI
  });

  const handleToggleDesignTheme = () => {
    setDesignTheme((prev) => {
      const next = prev === 'liquid' ? 'executive' : 'liquid';
      try {
        localStorage.setItem('simply_design_theme', next);
      } catch {
        // fallback
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('simply_design_theme', designTheme);
      if (designTheme === 'liquid') {
        document.documentElement.classList.add('liquid-theme');
        document.documentElement.classList.remove('executive-theme');
      } else {
        document.documentElement.classList.add('executive-theme');
        document.documentElement.classList.remove('liquid-theme');
      }
    } catch (e) {
      console.warn('Design theme sync error:', e);
    }
  }, [designTheme]);

  // 4c. Theme & Accessibility State
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
        setIsExamHudOpen(false);
        setIsPwaModalOpen(false);
        setIsRevisionKitOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret Admin Access (?admin=portal) & Direct Weekly Report Viewer (?tab=report&id=...)
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

      if (params.get('tab') === 'report') {
        const studentId = params.get('id');
        const allRegistered = getAllUsers();
        const targetStudent = studentId ? allRegistered.find(u => u.id === studentId) || profile : profile;
        const rep = generateDetailedReport(targetStudent, IGCSE_SUBJECTS);
        setViewedReport(rep);
        setIsDetailedReportOpen(true);
      }
    } catch (e) {
      console.warn('URL param detection bypassed:', e);
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

  // Automated 7-Day Weekly Parent Report Dispatch Background Scheduler
  useEffect(() => {
    let intervalId: any;
    const runAutoWeeklySchedule = async () => {
      try {
        const config = getAutoSchedulerConfig();
        if (!config.enabled) return;

        const users = getAllUsers();
        const due = users.filter(u => u.role === 'student' && isWeeklyReportDue(u));
        if (due.length > 0) {
          console.log(`[Simply AutoScheduler] Found ${due.length} weekly parent reports due. Running automated dispatch...`);
          const result = await runAutomatedWeeklyDispatch(users, IGCSE_SUBJECTS);
          if (result.totalDispatched > 0) {
            console.log(`[Simply AutoScheduler] Successfully dispatched ${result.totalDispatched} automated weekly reports.`);
          }
        }
      } catch (err) {
        console.warn('[Simply AutoScheduler] Weekly dispatch runner warning:', err);
      }
    };

    // Initial check 3.5 seconds after app startup
    const timeoutId = setTimeout(runAutoWeeklySchedule, 3500);

    // Periodic background check every 15 minutes
    intervalId = setInterval(runAutoWeeklySchedule, 15 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
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

  // Auto-clean bloated legacy caches from localStorage to guarantee quota is always free
  useEffect(() => {
    try {
      localStorage.removeItem('simply_igcse_revision');
      // If flashcards/quizzes in storage match initial, remove them to free 2MB+ of storage
      const savedCards = localStorage.getItem('simply_igcse_flashcards');
      if (savedCards && JSON.parse(savedCards).length === INITIAL_FLASHCARDS.length) {
        localStorage.removeItem('simply_igcse_flashcards');
      }
      const savedQuiz = localStorage.getItem('simply_igcse_quizzes');
      if (savedQuiz && JSON.parse(savedQuiz).length === INITIAL_QUIZZES.length) {
        localStorage.removeItem('simply_igcse_quizzes');
      }
    } catch {}
  }, []);

  // Safe sync to local storage (Protected against QuotaExceededError)
  useEffect(() => {
    safeSetItem('simply_igcse_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (flashcards.length !== INITIAL_FLASHCARDS.length) {
      safeSetItem('simply_igcse_flashcards', JSON.stringify(flashcards));
    }
  }, [flashcards]);

  useEffect(() => {
    if (quizzes.length !== INITIAL_QUIZZES.length) {
      safeSetItem('simply_igcse_quizzes', JSON.stringify(quizzes));
    }
  }, [quizzes]);

  // Cross-Device Single Active Session Enforcement Heartbeat
  useEffect(() => {
    // Founder and Admin accounts have permanent multi-device access and are never kicked out
    if (!currentUser || currentUser.role === 'founder' || currentUser.role === 'admin' || currentUser.id === 'founder_thomas') {
      return;
    }

    let isChecking = false;
    const checkSessionIntegrity = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const validation = await validateActiveSessionAsync(currentUser);
        if (!validation.valid) {
          setDeviceConflictAlert(
            validation.reason ||
            'You have been logged out because this account was logged into from another device. Only 1 device is allowed at a time.'
          );
          handleLogout();
        }
      } catch {
        // Fallback local check
        const localValidation = validateActiveSession(currentUser);
        if (!localValidation.valid) {
          setDeviceConflictAlert(localValidation.reason || 'You have been logged out because this account was logged into elsewhere.');
          handleLogout();
        }
      } finally {
        isChecking = false;
      }
    };

    // Immediate check
    checkSessionIntegrity();

    const interval = setInterval(checkSessionIntegrity, 3000);
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
        'listening',
        'flashcards',
        'quiz',
        'revision',
        'formulas',
        'chat',
        'boundaries',
        'split',
        'analytics',
        'admin',
        'atp',
        'roadmap',
        'traps',
        'pitfalls',
        'blitz',
        'mistakes',
        'cheatsheets',
        'mock',
        'worksheet',
        'classifieds',
        'tanzim',
        'formula-quiz',
        'radar',
        'predicted'
      ];

      if (tabParam === 'report') {
        setIsParentReportOpen(true);
      } else if (tabParam === 'classroom' || tabParam === 'analytics') {
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

  // Automated Weekly WhatsApp Dispatch Background Scheduler
  useEffect(() => {
    try {
      const config = getAutoSchedulerConfig();
      if (!config.enabled) return;

      const lastRun = config.lastRunTimestamp ? new Date(config.lastRunTimestamp).getTime() : 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      // If never run or more than 24 hours since last automated check
      if (Date.now() - lastRun >= oneDayMs) {
        const allUsers = getAllUsers();
        runAutomatedWeeklyDispatch(allUsers, IGCSE_SUBJECTS).then((result) => {
          if (result.totalDispatched > 0) {
            console.log(`[Auto-Scheduler] Automatically dispatched ${result.totalDispatched} weekly parent WhatsApp reports.`);
          }
        });
      }
    } catch (e) {
      console.warn('Auto-scheduler background runner error:', e);
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
      extraSubjectIds: user.extraSubjectIds,
      parentWhatsapp: user.parentWhatsapp,
      lastWeeklyReportSentAt: user.lastWeeklyReportSentAt,
      role: user.role,
      status: user.status
    }));

    // Find first enrolled subject for this user
    const firstSubject = IGCSE_SUBJECTS.find(s => user.selectedSubjectIds.includes(s.id));
    if (firstSubject) setActiveSubject(firstSubject);
  };

  const handleRefreshStatus = async () => {
    try {
      await syncUsersWithServer();
    } catch {}
    const user = getActiveUser();
    setCurrentUser(user ? { ...user } : null);
    if (user) {
      setProfile(prev => ({
        ...prev,
        role: user.role,
        status: user.status
      }));
    }
  };

  // Cross-tab and live sync listener for user status and approval changes
  useEffect(() => {
    const handleUsersUpdated = () => {
      const freshActive = getActiveUser();
      if (freshActive) {
        setCurrentUser({ ...freshActive });
        setProfile(prev => ({
          ...prev,
          role: freshActive.role,
          status: freshActive.status
        }));
      }
    };
    window.addEventListener('simply_users_updated', handleUsersUpdated);
    window.addEventListener('storage', handleUsersUpdated);
    return () => {
      window.removeEventListener('simply_users_updated', handleUsersUpdated);
      window.removeEventListener('storage', handleUsersUpdated);
    };
  }, []);

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
      const allEnrolled = [...(next.selectedSubjectIds || []), ...(next.extraSubjectIds || [])];
      if (allEnrolled.length > 0 && !allEnrolled.includes(activeSubject.id)) {
        const first = IGCSE_SUBJECTS.find(s => allEnrolled.includes(s.id));
        if (first) setActiveSubject(first);
      }
      return next;
    });

    if (currentUser) {
      const updatedUser = updateUserAccount(currentUser.id, {
        name: updated.name ?? currentUser.name,
        grade: updated.grade ?? currentUser.grade,
        board: updated.board ?? currentUser.board,
        targetGrade: updated.targetGrade ?? currentUser.targetGrade,
        selectedSubjectIds: updated.selectedSubjectIds ?? currentUser.selectedSubjectIds,
        extraSubjectIds: updated.extraSubjectIds ?? currentUser.extraSubjectIds,
        parentWhatsapp: updated.parentWhatsapp !== undefined ? updated.parentWhatsapp : currentUser.parentWhatsapp,
        lastWeeklyReportSentAt: updated.lastWeeklyReportSentAt !== undefined ? updated.lastWeeklyReportSentAt : currentUser.lastWeeklyReportSentAt,
      });
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
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
      case 'atp': return 'the Science Paper 6 Alternative to Practical (ATP) Master';
      case 'roadmap': return 'the Exam Countdown & Daily Study Roadmap';
      case 'traps': return 'the Cambridge Command Words Trap Detector';
      case 'pitfalls': return 'the Examiner Pitfalls Heatmap';
      case 'blitz': return 'the Topic Classified Drills';
      case 'solver': return 'the Mark Scheme Step-by-Step Solver';
      case 'finder': return 'the Past Papers & Mark Schemes Hub';
      case 'mock': return 'the Timed Mock Exam Simulator & Grade Boundaries';
      case 'worksheet': return 'the Worksheet & Test Builder';
      case 'radar': return 'the Weak-Spot Radar & Grade 9 Diagnostic';
      case 'predicted': return 'the 2025/2026 Predicted Papers Engine';
      case 'revision': return 'the High-Yield Syllabus Summaries';
      case 'quiz': return 'Past Paper Mock Quizzes & Tests';
      case 'flashcards': return 'the Topic Active Recall Decks';
      case 'formulas': return 'Formulas & Command Words';
      case 'chat': return 'the Examiner Walkthrough Co-Pilot';
      case 'checklist': return 'the Interactive Syllabus Checklist';
      case 'esl-speaking': return 'the ESL Speaking Oral Exam Simulator';
      case 'listening': return 'the Multi-Board English Listening Simulator';
      case 'tanzim': return 'the Egyptian University Tanzim Equivalence Calculator';
      case 'formula-quiz': return 'the Interactive Formula Memory Quizzer';
      case 'boundaries': return 'the Grade Boundaries Calculator';
      case 'split': return 'the Split-Screen Exam Viewer';
      case 'analytics': return 'the School & Teacher Analytics Diagnostics';
      case 'admin': return 'the Administrative & Founder Console';
      default: return 'this study resource';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Modern Collapsible Sidebar (Desktop & Mobile Drawer) */}
      <AppSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        activeSubject={activeSubject}
        onSelectSubject={setActiveSubject}
        profile={profile}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenPayment={() => setIsPaymentOpen(true)}
        onOpenHandwritingScanner={() => setIsHandwritingScannerOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenExamHud={() => setIsExamHudOpen(true)}
        onOpenRevisionKit={() => setIsRevisionKitOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        onOpenParentReport={() => setIsParentReportOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        designTheme={designTheme}
        onToggleDesignTheme={handleToggleDesignTheme}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          activeTab={activeTab}
          subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
          activeSubject={activeSubject}
          onSelectSubject={setActiveSubject}
          profile={profile}
          currentUser={currentUser}
          designTheme={designTheme}
          onToggleDesignTheme={handleToggleDesignTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenPayment={() => setIsPaymentOpen(true)}
          onOpenHandwritingScanner={() => setIsHandwritingScannerOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenExamHud={() => setIsExamHudOpen(true)}
          onOpenRevisionKit={() => setIsRevisionKitOpen(true)}
          onOpenPwaModal={() => setIsPwaModalOpen(true)}
          onOpenParentReport={() => setIsParentReportOpen(true)}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'signin');
            setIsAuthOpen(true);
          }}
          onNavigateTab={setActiveTab}
        />

        {/* Main Container */}
        <main className={`flex-1 px-3 py-4 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full overflow-x-hidden ${activeTab === 'chat' ? 'pb-24 md:pb-10' : 'pb-24 sm:pb-16'}`}>
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
                onOpenParentReport={() => setIsParentReportOpen(true)}
                onOpenStudyDuel={() => setIsStudyDuelOpen(true)}
                onOpenHandwritingScanner={() => setIsHandwritingScannerOpen(true)}
                onOpenAbout={() => setIsAboutOpen(true)}
                onOpenExamHud={() => setIsExamHudOpen(true)}
                onOpenRevisionKit={() => setIsRevisionKitOpen(true)}
                onOpenPwaModal={() => setIsPwaModalOpen(true)}
              />
            )}

            {activeTab === 'atp' && (
              <ScienceAtpMaster
                subject={activeSubject}
                profile={profile}
              />
            )}

            {activeTab === 'roadmap' && (
              <StudyRoadmap
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                profile={profile}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'traps' && (
              <CommandWordsTrapDetector />
            )}

            {activeTab === 'pitfalls' && (
              <ExaminerPitfallsHeatmap
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                profile={profile}
              />
            )}

            {activeTab === 'blitz' && (
              <UnitConversionBlitz />
            )}

            {activeTab === 'mistakes' && (
              <MistakeNotebookView
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                profile={profile}
                activeSubject={activeSubject}
              />
            )}

            {activeTab === 'cheatsheets' && (
              <NightBeforeCheatSheets
                subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
                profile={profile}
                activeSubject={activeSubject}
                onSelectSubject={setActiveSubject}
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

            {activeTab === 'mock' && (
              <MockExamSimulator
                subject={activeSubject}
                profile={profile}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
              />
            )}

            {activeTab === 'worksheet' && (
              <WorksheetBuilder
                subject={activeSubject}
                profile={profile}
              />
            )}

            {activeTab === 'classifieds' && (
              <PrintableClassifiedsGenerator
                subject={activeSubject}
                profile={profile}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'radar' && (
              <WeakSpotRadar
                subject={activeSubject}
                profile={profile}
                onLaunchTopicPractice={(topic) => {
                  setChatInitialQuestion(`Please test me with 3 high-yield Cambridge examination questions on: "${topic}" with full mark scheme steps.`);
                  setActiveTab('chat');
                }}
              />
            )}

            {activeTab === 'predicted' && (
              <PredictedPaperView
                subject={activeSubject}
                profile={profile}
                onSitPredictedMock={() => setActiveTab('mock')}
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

            {activeTab === 'listening' && (
              <ListeningSimulator
                subject={activeSubject}
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

            {activeTab === 'formula-quiz' && (
              <FormulaMemoryQuizzer
                subject={activeSubject}
                profile={profile}
              />
            )}

            {activeTab === 'tanzim' && (
              <TanzimCalculator
                profile={profile}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-2xl px-1 pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around h-16">
        {[
          { id: 'home', label: 'Home', icon: Home, color: 'text-indigo-400' },
          { id: 'finder', label: 'Papers', icon: FileText, color: 'text-amber-400' },
          { id: 'solver', label: 'Solver', icon: Calculator, color: 'text-blue-400' },
          { id: 'mistakes', label: 'Mistakes', icon: BookMarked, color: 'text-rose-400' },
          { id: 'menu', label: 'All Tools', icon: Menu, color: 'text-indigo-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'menu') {
                  setIsMobileSidebarOpen(true);
                } else {
                  setActiveTab(tab.id as ActiveTab);
                }
              }}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 transition-all active:scale-90 cursor-pointer ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-sans ${isActive ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer (with bottom padding so it never hides behind mobile nav) */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 text-xs text-slate-400 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <SimplyLogo size="sm" showText={false} />
              <span className="font-bold text-slate-200">Simply IGCSE Platform</span>
              <span className="text-slate-600">|</span>
              <span>Cambridge (CIE) & Pearson Edexcel Curriculum</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Curated by experienced IGCSE educators, head of departments, and past examiners across Cairo, Alexandria, and the UK.
            </p>
            <p className="text-[10px] text-slate-500">
              Strictly aligned with Cambridge Assessment International Education (CAIE) 2024–2026 specifications.
            </p>
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
              onClick={() => setIsAboutOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              About Platform
            </button>
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
      </div>

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

      {/* Floating Scientific Calculator Toggle (Desktop only to prevent mobile overlap; mobile uses header calculator button) */}
      <button
        onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
        className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
        title="Open IGCSE Scientific Calculator (DEG/RAD)"
      >
        <Calculator className="h-4 w-4" />
        <span>Scientific Calc</span>
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

      {/* 1-Click Cambridge Parent Progress Report Card Modal */}
      <ParentReportModal
        isOpen={isParentReportOpen}
        onClose={() => setIsParentReportOpen(false)}
        profile={profile}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Official Academic Assessment Audit & PDF Statement Modal */}
      <DetailedStudentReportModal
        isOpen={isDetailedReportOpen}
        onClose={() => setIsDetailedReportOpen(false)}
        report={viewedReport}
      />

      {/* Collaborative Study Duel (Past Paper Sprint) Modal */}
      <StudyDuelModal
        isOpen={isStudyDuelOpen}
        onClose={() => setIsStudyDuelOpen(false)}
        profile={profile}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
      />

      {/* Snap Handwritten Working Camera OCR Modal */}
      <HandwritingScannerModal
        isOpen={isHandwritingScannerOpen}
        onClose={() => setIsHandwritingScannerOpen(false)}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        profile={profile}
      />

      {/* Platform Briefing Modal */}
      <AboutSimplyModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* Cambridge Interactive Periodic Table & Exam Formula Reference HUD */}
      <ExamReferenceHudModal
        isOpen={isExamHudOpen}
        onClose={() => setIsExamHudOpen(false)}
        activeSubject={activeSubject}
      />

      {/* PWA Mobile App Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* 1-Click Cambridge Complete Revision Kit PDF Exporter */}
      <CompleteRevisionKitModal
        isOpen={isRevisionKitOpen}
        onClose={() => setIsRevisionKitOpen(false)}
        activeSubject={activeSubject}
        subjects={enrolledSubjects.length > 0 ? enrolledSubjects : IGCSE_SUBJECTS}
        profile={profile}
      />
    </div>
  );
}

export default App;
