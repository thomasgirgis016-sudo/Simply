import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Award,
  Crown,
  Key,
  Users,
  Filter,
  CheckCheck,
  FileText,
  Layers,
  Database,
  Upload,
  Plus,
  BookOpen,
  Receipt,
  CheckCircle2,
  Copy,
  ExternalLink,
  Activity,
  Cpu,
  Send,
  Zap,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Info,
  ChevronDown,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import {
  UserAccount,
  AccountStatus,
  UserRole,
  GradeLevel,
  ExamBoard,
  TargetGrade,
  Flashcard,
  PastPaperItem,
  BankTransaction,
  PastPaperQaSummaryReport,
  PastPaperQaItemIssue,
  SubscriptionPlan,
  BillingCycle
} from '../types';
import {
  getAllUsers,
  approveUser,
  rejectUser,
  toggleUserRole,
  deleteUser,
  approveAllPendingUsers,
  rejectAllPendingUsers,
  createPreApprovedUser,
  grantUserProSubscription,
  updateUserSubscriptionPlan
} from '../services/auth';
import { IGCSE_SUBJECTS } from '../data/subjects';
import { getCustomPastPapers, saveCustomPastPapers } from '../data/pastPapersData';
import {
  getBankTransactions,
  addBankTransaction,
  saveBankTransactions,
  parseBdcSmsText,
  SUBSCRIPTION_PRICE_EGP,
  BDC_ACCOUNT_NUMBER_MASKED,
  OFFICIAL_INSTAPAY_IPA
} from '../services/paymentAutomation';
import { runPastPaperQaAgent, validateKatexSyntax } from '../services/pastPaperQaAgent';
import { SimplyLogo } from './SimplyLogo';
import { TeacherAnalyticsDashboard } from './TeacherAnalyticsDashboard';

interface AdminDashboardProps {
  currentUser: UserAccount;
  onRefreshUser?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Add Account Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newGrade, setNewGrade] = useState<GradeLevel>('Year 11 / Grade 10 (IGCSE Exam Yr)');
  const [newBoard, setNewBoard] = useState<ExamBoard>('Both');
  const [newTarget, setNewTarget] = useState<TargetGrade>('9 / A*');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const reloadUsers = () => {
    setUsers(getAllUsers());
    if (onRefreshUser) onRefreshUser();
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleSetUserPlan = (userId: string, plan: SubscriptionPlan, cycle: BillingCycle = 'monthly') => {
    const res = updateUserSubscriptionPlan(userId, plan, cycle);
    if (res.success) {
      reloadUsers();
      showToast(`Updated student subscription to ${plan.toUpperCase()} (${cycle})!`);
    } else {
      alert(res.error || 'Failed to update plan');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const pending = users.filter((u) => u.status === 'pending').length;
    const approved = users.filter((u) => u.status === 'approved' || !u.status).length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, pending, approved, admins };
  }, [users]);

  // Financial Revenue Telemetry
  const financialMetrics = useMemo(() => {
    const plusUsers = users.filter(u => u.plan === 'plus');
    const proUsers = users.filter(u => u.plan === 'pro' || u.isPro);
    const plusMonthly = plusUsers.filter(u => u.billingCycle !== 'annual').length;
    const plusAnnual = plusUsers.filter(u => u.billingCycle === 'annual').length;
    const proMonthly = proUsers.filter(u => u.billingCycle !== 'annual').length;
    const proAnnual = proUsers.filter(u => u.billingCycle === 'annual').length;

    const estimatedMrr = (plusMonthly * 150) + (plusAnnual * 100) + (proMonthly * 250) + (proAnnual * 166.6);
    const estimatedArr = estimatedMrr * 12;

    return {
      plusCount: plusUsers.length,
      proCount: proUsers.length,
      freeCount: users.filter(u => (!u.plan || u.plan === 'free') && !u.isPro).length,
      estimatedMrr: Math.round(estimatedMrr),
      estimatedArr: Math.round(estimatedArr),
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && (u.status === 'approved' || !u.status)) ||
        u.status === statusFilter;

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'student' && (!u.role || u.role === 'student')) ||
        u.role === roleFilter;

      const matchesPlan =
        planFilter === 'all' ||
        (planFilter === 'free' && (!u.plan || u.plan === 'free') && !u.isPro) ||
        (planFilter === 'pro' && (u.plan === 'pro' || u.isPro)) ||
        u.plan === planFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesPlan;
    });
  }, [users, searchQuery, statusFilter, roleFilter, planFilter]);

  const handleApprove = (u: UserAccount) => {
    const ok = approveUser(u.id, currentUser.email);
    if (ok) {
      reloadUsers();
      showToast(`Account for ${u.name} (${u.email}) approved successfully!`);
    }
  };

  const handleReject = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot suspend your own admin account.");
      return;
    }
    const ok = rejectUser(u.id);
    if (ok) {
      reloadUsers();
      showToast(`Account for ${u.name} suspended.`);
    }
  };

  const handleToggleRole = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot remove your own admin role.");
      return;
    }
    const ok = toggleUserRole(u.id);
    if (ok) {
      reloadUsers();
      showToast(`Role updated for ${u.name}.`);
    }
  };

  const handleDelete = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete account: ${u.email}?`)) {
      const ok = deleteUser(u.id);
      if (ok) {
        reloadUsers();
        showToast(`Account ${u.email} permanently removed.`);
      }
    }
  };

  const handleApproveAll = () => {
    const count = approveAllPendingUsers(currentUser.email);
    reloadUsers();
    showToast(`Approved ${count} pending student account${count === 1 ? '' : 's'}!`);
  };

  const handleRejectAll = () => {
    if (confirm(`Are you sure you want to suspend/reject all ${metrics.pending} pending accounts?`)) {
      const count = rejectAllPendingUsers(currentUser.email);
      reloadUsers();
      showToast(`Suspended ${count} pending account${count === 1 ? '' : 's'}.`);
    }
  };

  // CMS & Admin Sections State
  const [adminActiveTab, setAdminActiveTab] = useState<'accounts' | 'cms' | 'payments' | 'qa' | 'classroom'>('accounts');
  const [cmsSection, setCmsSection] = useState<'flashcards' | 'pastpapers'>('flashcards');

  // Flashcards CMS form state
  const [fcSubjectId, setFcSubjectId] = useState('cie-math-0580');
  const [fcTopic, setFcTopic] = useState('');
  const [fcQuestion, setFcQuestion] = useState('');
  const [fcAnswer, setFcAnswer] = useState('');
  const [fcFormula, setFcFormula] = useState('');
  const [fcTip, setFcTip] = useState('');
  const [fcTier, setFcTier] = useState<'Core' | 'Extended' | 'Hard'>('Extended');
  const [fcJsonRaw, setFcJsonRaw] = useState('');

  // Past Papers CMS form state
  const [ppSubjectId, setPpSubjectId] = useState('cie-math-0580');
  const [ppSession, setPpSession] = useState('May/June 2024 Paper 42');
  const [ppPaperCode, setPpPaperCode] = useState('0580/42');
  const [ppYear, setPpYear] = useState('2024');
  const [ppQNum, setPpQNum] = useState('Q1(a)');
  const [ppTopic, setPpTopic] = useState('');
  const [ppMarks, setPpMarks] = useState('4');
  const [ppTier, setPpTier] = useState<'Core' | 'Standard Extended' | 'Grade 9 Challenge'>('Standard Extended');
  const [ppPrompt, setPpPrompt] = useState('');
  const [ppFormula, setPpFormula] = useState('');
  const [ppAnswer, setPpAnswer] = useState('');
  const [ppStepReq, setPpStepReq] = useState('');
  const [ppReport, setPpReport] = useState('');
  const [ppPdfUrl, setPpPdfUrl] = useState('');
  const [ppJsonRaw, setPpJsonRaw] = useState('');
  const [customPapers, setCustomPapers] = useState<PastPaperItem[]>(() => getCustomPastPapers());

  const handleCreateFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fcTopic.trim() || !fcQuestion.trim() || !fcAnswer.trim()) {
      alert('Please fill out the Topic, Question, and Answer.');
      return;
    }

    const newCard: Flashcard = {
      id: `fc-cms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: fcSubjectId,
      topic: fcTopic.trim(),
      question: fcQuestion.trim(),
      answer: fcAnswer.trim(),
      keyFormula: fcFormula.trim() || undefined,
      examinerTip: fcTip.trim() || undefined,
      difficulty: fcTier,
    };

    try {
      const existingStr = localStorage.getItem('simply_igcse_flashcards');
      const existing: Flashcard[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newCard, ...existing];
      localStorage.setItem('simply_igcse_flashcards', JSON.stringify(updated));
      setFcTopic('');
      setFcQuestion('');
      setFcAnswer('');
      setFcFormula('');
      setFcTip('');
      showToast(`Added new flashcard to ${fcSubjectId} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to save flashcard to storage.');
    }
  };

  const handleImportFlashcardsJson = () => {
    if (!fcJsonRaw.trim()) return;
    try {
      const parsed = JSON.parse(fcJsonRaw.trim());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('JSON must be a non-empty array of flashcard objects.');
        return;
      }
      const existingStr = localStorage.getItem('simply_igcse_flashcards');
      const existing: Flashcard[] = existingStr ? JSON.parse(existingStr) : [];
      const formatted: Flashcard[] = parsed.map((item, idx) => ({
        id: item.id || `fc-import-${Date.now()}-${idx}`,
        subjectId: item.subjectId || fcSubjectId,
        topic: item.topic || 'General Topic',
        question: item.question || 'Question',
        answer: item.answer || 'Answer',
        keyFormula: item.keyFormula,
        examinerTip: item.examinerTip,
        difficulty: item.difficulty || 'Extended',
      }));

      const updated = [...formatted, ...existing];
      localStorage.setItem('simply_igcse_flashcards', JSON.stringify(updated));
      setFcJsonRaw('');
      showToast(`Successfully imported ${formatted.length} flashcards into storage!`);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleCreatePastPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppTopic.trim() || !ppPrompt.trim() || !ppAnswer.trim()) {
      alert('Please fill out Topic, Question Prompt, and Final Answer.');
      return;
    }

    const matchedSubject = IGCSE_SUBJECTS.find(s => s.id === ppSubjectId);
    const newPaper: PastPaperItem = {
      id: `pp-cms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: ppSubjectId,
      subjectName: matchedSubject?.name || 'Mathematics',
      board: matchedSubject?.board || 'CIE',
      session: ppSession.trim(),
      paperCode: ppPaperCode.trim(),
      year: parseInt(ppYear, 10) || 2024,
      questionNumber: ppQNum.trim() || 'Q1',
      topic: ppTopic.trim(),
      difficultyTier: ppTier,
      snippetQuery: `${ppSession} ${ppPaperCode} ${ppTopic} ${ppPrompt.substring(0, 30)}`,
      questionPrompt: ppPrompt.trim(),
      diagramOrMath: ppFormula.trim() || undefined,
      marks: parseInt(ppMarks, 10) || 4,
      markScheme: [
        {
          markType: '[M1] / [A1]',
          requirement: ppStepReq.trim() || 'Correct method and calculation as required by published mark scheme.'
        }
      ],
      finalAnswer: ppAnswer.trim(),
      examinerReportSnippet: ppReport.trim() || undefined,
      pdfUrl: ppPdfUrl.trim() || undefined,
    };

    const updated = [newPaper, ...customPapers];
    saveCustomPastPapers(updated);
    setCustomPapers(updated);
    setPpTopic('');
    setPpPrompt('');
    setPpFormula('');
    setPpAnswer('');
    setPpStepReq('');
    setPpReport('');
    setPpPdfUrl('');
    showToast(`Added ${newPaper.paperCode} ${newPaper.questionNumber} to question bank!`);
  };

  const handleImportPastPapersJson = () => {
    if (!ppJsonRaw.trim()) return;
    try {
      const parsed = JSON.parse(ppJsonRaw.trim());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('JSON must be a non-empty array of PastPaperItem objects.');
        return;
      }
      const updated = [...parsed, ...customPapers];
      saveCustomPastPapers(updated);
      setCustomPapers(updated);
      setPpJsonRaw('');
      showToast(`Successfully imported ${parsed.length} past paper questions!`);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleDeleteCustomPaper = (id: string) => {
    if (confirm('Delete this custom past paper question?')) {
      const updated = customPapers.filter(p => p.id !== id);
      saveCustomPastPapers(updated);
      setCustomPapers(updated);
      showToast('Custom question removed from question bank.');
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);

    try {
      const res = await createPreApprovedUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        grade: newGrade,
        board: newBoard,
        targetGrade: newTarget,
        adminEmail: currentUser.email,
      });

      if (res.success) {
        reloadUsers();
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        showToast(`Account for ${res.user?.name} created & pre-approved!`);
      } else {
        setAddError(res.error || 'Failed to create account.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Module 1: BDC Bank Feed & Reconciliation State & Handlers
  // ─────────────────────────────────────────────────────────────
  const [bankTxs, setBankTxs] = useState<BankTransaction[]>(() => getBankTransactions());
  const [smsSimulatorText, setSmsSimulatorText] = useState('');
  const [isSimulatingSms, setIsSimulatingSms] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'unclaimed' | 'claimed'>('all');
  const [manualMatchTx, setManualMatchTx] = useState<BankTransaction | null>(null);
  const [manualMatchEmail, setManualMatchEmail] = useState('');

  // Module 4: Past Paper QA Verification Agent State
  const [qaReport, setQaReport] = useState<PastPaperQaSummaryReport>(() => runPastPaperQaAgent());
  const [isScanningQa, setIsScanningQa] = useState(false);
  const [testKatexInput, setTestKatexInput] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [testKatexResult, setTestKatexResult] = useState<{ isValid: boolean; error?: string }>(() =>
    validateKatexSyntax('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
  );

  const reloadBankTxs = () => {
    setBankTxs(getBankTransactions());
  };

  const handleSimulateSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsSimulatorText.trim()) return;
    setIsSimulatingSms(true);
    try {
      const parsed = parseBdcSmsText(smsSimulatorText);
      if (!parsed) {
        alert('Could not parse transaction reference or amount from the provided SMS text. Please verify the format.');
        return;
      }
      const res = addBankTransaction({
        txNumber: parsed.txNumber,
        amount: parsed.amount,
        source: 'BDC',
        status: 'unclaimed',
        receivedAt: parsed.timestamp || new Date().toISOString(),
        rawSmsText: parsed.rawText,
      });

      if (res.success) {
        reloadBankTxs();
        setSmsSimulatorText('');
        showToast(`BDC Inbound SMS Ingested: Tx #${parsed.txNumber} (EGP ${parsed.amount.toFixed(2)}) recorded!`);
      } else {
        alert(res.error || 'Failed to add bank transaction.');
      }
    } finally {
      setIsSimulatingSms(false);
    }
  };

  const handleQuickSmsTemplate = (type: 'arabic' | 'english') => {
    const randomRef = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    if (type === 'arabic') {
      setSmsSimulatorText(
        `تم تحويل مبلغ 250.00 جم إلى حسابك رقم **4812 طرف بنك القاهرة. الرقم المرجعي للعملية: ${randomRef}. بنك القاهرة`
      );
    } else {
      setSmsSimulatorText(
        `Credit Alert: EGP 250.00 received in your BDC account **4812 via InstaPay. Transaction Ref: ${randomRef}. Banque Du Caire`
      );
    }
  };

  const handleManualClaim = (tx: BankTransaction) => {
    if (!manualMatchEmail.trim()) {
      alert('Please enter or select a student email.');
      return;
    }
    const targetEmail = manualMatchEmail.trim().toLowerCase();
    const current = getBankTransactions();
    const updated = current.map((t) => {
      if (t.id === tx.id || t.txNumber === tx.txNumber) {
        return {
          ...t,
          status: 'claimed' as const,
          claimedBy: targetEmail,
          claimedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveBankTransactions(updated);
    reloadBankTxs();

    const grantRes = grantUserProSubscription(targetEmail, 30);
    reloadUsers();
    setManualMatchTx(null);
    setManualMatchEmail('');

    if (grantRes.success) {
      showToast(`Matched Tx #${tx.txNumber} with ${targetEmail}! 30-day Pro granted.`);
    } else {
      showToast(`Matched Tx #${tx.txNumber}. (Account will receive Pro upon signup).`);
    }
  };

  const handleDeleteBankTx = (id: string) => {
    if (confirm('Delete this bank ledger record?')) {
      const current = getBankTransactions().filter((t) => t.id !== id);
      saveBankTransactions(current);
      reloadBankTxs();
      showToast('Bank transaction removed from ledger.');
    }
  };

  const handleRunQaScan = () => {
    setIsScanningQa(true);
    setTimeout(() => {
      const report = runPastPaperQaAgent();
      setQaReport(report);
      setIsScanningQa(false);
      showToast(`QA Scan complete: ${report.totalQuestionsScanned} questions scanned, ${report.issues.length} issues.`);
    }, 400);
  };

  const filteredBankTxs = useMemo(() => {
    return bankTxs.filter((t) => {
      if (txFilter === 'all') return true;
      return t.status === txFilter;
    });
  }, [bankTxs, txFilter]);

  const bankMetrics = useMemo(() => {
    const total = bankTxs.length;
    const unclaimed = bankTxs.filter((t) => t.status === 'unclaimed').length;
    const claimed = bankTxs.filter((t) => t.status === 'claimed').length;
    const totalEgp = bankTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const unclaimedEgp = bankTxs.filter((t) => t.status === 'unclaimed').reduce((sum, t) => sum + (t.amount || 0), 0);
    return { total, unclaimed, claimed, totalEgp, unclaimedEgp };
  }, [bankTxs]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#FF5E62]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SimplyLogo size="sm" />
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5E62]/15 px-3 py-0.5 text-xs font-bold text-[#FFA63A] border border-[#FF5E62]/30">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FF5E62]" />
                <span>Administrative Portal (Hidden)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admissions Waitlist & Student Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Manage student waitlist verification, review new applicants, authorize access to Cambridge & Edexcel study suites, and publish content.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={reloadUsers}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Pre-Approve Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Mode Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setAdminActiveTab('accounts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            adminActiveTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Student Accounts & Access</span>
          <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[10px] text-slate-300">
            {metrics.total}
          </span>
        </button>

        <button
          onClick={() => setAdminActiveTab('cms')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            adminActiveTab === 'cms'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Question & Flashcard CMS</span>
          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-500/30">
            Authoring
          </span>
        </button>

        <button
          onClick={() => setAdminActiveTab('payments')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            adminActiveTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>BDC Bank Feed & InstaPay</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
            {bankMetrics.unclaimed} Unclaimed
          </span>
        </button>

        <button
          onClick={() => setAdminActiveTab('classroom')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            adminActiveTab === 'classroom'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Teacher Classroom</span>
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300 border border-violet-500/30">
            Cohorts & Heatmaps
          </span>
        </button>

        <button
          onClick={() => setAdminActiveTab('qa')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            adminActiveTab === 'qa'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Past Paper QA Agent</span>
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-300 border border-sky-500/30">
            {qaReport.failedCount === 0 ? '100% Passed' : `${qaReport.issues.length} Issues`}
          </span>
        </button>
      </div>

      {adminActiveTab === 'accounts' && (
        <>
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Accounts</span>
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">{metrics.total}</div>
              <span className="text-[10px] text-slate-500">Registered users</span>
            </div>

            <div className={`rounded-2xl border p-4 shadow-md transition ${
              metrics.pending > 0
                ? 'border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30'
                : 'border-slate-800 bg-slate-900/80'
            }`}>
              <div className="flex items-center justify-between text-xs font-medium text-amber-300">
                <span>Pending Approvals</span>
                <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">{metrics.pending}</div>
              <span className="text-[10px] text-amber-400/80">Requires your review</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Students</span>
                <UserCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{metrics.approved}</div>
              <span className="text-[10px] text-slate-500">Full tool access</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Administrators</span>
                <Crown className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300 mt-1 font-mono">{metrics.admins}</div>
              <span className="text-[10px] text-slate-500">System managers</span>
            </div>
          </div>

          {/* Subscription Revenue Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3">
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 shadow-md">
              <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold">
                <span>Plus Subscribers</span>
                <span className="text-[10px] font-bold bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">150 EGP/mo</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">{financialMetrics.plusCount}</div>
              <span className="text-[10px] text-slate-400">Classified & quiz members</span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-md">
              <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
                <span>Pro Subscribers</span>
                <span className="text-[10px] font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">250 EGP/mo</span>
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">{financialMetrics.proCount}</div>
              <span className="text-[10px] text-slate-400">Full AI & solver access</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-md">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                <span>Estimated MRR</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">EGP {financialMetrics.estimatedMrr.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400">Monthly recurring inflow</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Projected ARR</span>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">EGP {financialMetrics.estimatedArr.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400">Annualized subscription base</span>
            </div>
          </div>

          {/* Batch Approval Banner if Pending Accounts Exist */}
          {metrics.pending > 0 && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {metrics.pending} student account{metrics.pending === 1 ? '' : 's'} waiting for approval
                  </h4>
                  <p className="text-xs text-amber-200/80">
                    These students cannot access study tools or past papers until approved.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition cursor-pointer"
                >
                  <UserX className="h-4 w-4" />
                  <span>Reject All</span>
                </button>
                <button
                  onClick={handleApproveAll}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer shadow-md"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Approve All ({metrics.pending})</span>
                </button>
              </div>
            </div>
          )}

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1">Status:</span>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1">Plan:</span>
            {(['all', 'pro', 'plus', 'free'] as const).map((pl) => (
              <button
                key={pl}
                onClick={() => setPlanFilter(pl)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  planFilter === pl
                    ? pl === 'pro'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : pl === 'plus'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pl === 'all' ? 'All Plans' : pl.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1">Role:</span>
            {(['all', 'student', 'admin'] as const).map((rl) => (
              <button
                key={rl}
                onClick={() => setRoleFilter(rl)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                  roleFilter === rl
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rl === 'all' ? 'All' : rl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Accounts ({filteredUsers.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Current Admin: <strong className="text-slate-300">{currentUser.email}</strong>
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No accounts matched your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map((u) => {
              const isPending = u.status === 'pending';
              const isApproved = u.status === 'approved' || !u.status;
              const isRejected = u.status === 'rejected' || u.status === 'suspended';
              const isAdmin = u.role === 'admin';
              const isSelf = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isPending ? 'bg-amber-950/10' : 'hover:bg-slate-900'
                  }`}
                >
                  {/* Left: User Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm uppercase ${
                        isAdmin
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isAdmin ? <Crown className="h-5 w-5" /> : u.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        {isSelf && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-300">
                            YOU
                          </span>
                        )}
                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                              : isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isPending ? 'Pending Approval' : isApproved ? 'Active Student' : 'Suspended'}
                        </span>

                        {/* Plan Badge */}
                        {(u.plan === 'pro' || u.isPro) ? (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                            <Crown className="h-3 w-3 text-amber-400" />
                            <span>PRO ({u.billingCycle === 'annual' ? 'Annual' : 'Monthly'})</span>
                          </span>
                        ) : u.plan === 'plus' ? (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <span>PLUS ({u.billingCycle === 'annual' ? 'Annual' : 'Monthly'})</span>
                          </span>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            FREE TIER
                          </span>
                        )}

                        {/* Subject Quota Badge */}
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/80" title="Enforced maximum: 5 subjects">
                          {u.selectedSubjectIds?.length || 0}/5 Subjects
                        </span>

                        {/* Role Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isAdmin
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isAdmin ? 'Admin' : 'Student'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                        {u.email}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span>{u.grade?.split('(')[0] || 'Year 11'}</span>
                        <span>•</span>
                        <span>Board: {u.board || 'Both'}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">Goal: {u.targetGrade || '9 / A*'}</span>
                        <span>•</span>
                        <span className="text-slate-400">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap pt-2 md:pt-0 border-t border-slate-800/60 md:border-t-0">
                    {/* Quick Plan Switcher */}
                    <div className="flex items-center gap-1">
                      <select
                        value={`${u.plan || (u.isPro ? 'pro' : 'free')}-${u.billingCycle || 'monthly'}`}
                        onChange={(e) => {
                          const [newPlan, newCycle] = e.target.value.split('-') as [SubscriptionPlan, BillingCycle];
                          handleSetUserPlan(u.id, newPlan, newCycle);
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:border-slate-500 focus:border-amber-500 focus:outline-none cursor-pointer"
                        title="Change student subscription tier & billing cycle"
                      >
                        <option value="free-monthly">Plan: Free</option>
                        <option value="plus-monthly">Plan: Plus (150 EGP/mo)</option>
                        <option value="plus-annual">Plan: Plus (1,200 EGP/yr)</option>
                        <option value="pro-monthly">Plan: Pro (250 EGP/mo)</option>
                        <option value="pro-annual">Plan: Pro (2,000 EGP/yr)</option>
                      </select>
                    </div>

                    {/* Approve Button */}
                    {isPending && (
                      <button
                        onClick={() => handleApprove(u)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 px-4 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                        title="Accept & activate student account"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept Account</span>
                      </button>
                    )}

                    {/* Re-activate if rejected */}
                    {isRejected && (
                      <button
                        onClick={() => handleApprove(u)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Reactivate</span>
                      </button>
                    )}

                    {/* Suspend / Reject button */}
                    {isApproved && !isSelf && (
                      <button
                        onClick={() => handleReject(u)}
                        className="flex-1 sm:flex-initial rounded-xl border border-slate-800 bg-slate-900/80 py-2 px-3 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                        title="Suspend access"
                      >
                        Suspend
                      </button>
                    )}

                    {/* Role toggle button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`flex-1 sm:flex-initial rounded-xl border py-2 px-3 text-xs font-semibold transition cursor-pointer ${
                          isAdmin
                            ? 'border-purple-500/30 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                        }`}
                        title={isAdmin ? 'Demote to regular student' : 'Grant Administrator privileges'}
                      >
                        {isAdmin ? 'Make Student' : 'Make Admin'}
                      </button>
                    )}

                    {/* Delete button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="rounded-xl p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete account permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {adminActiveTab === 'cms' && (
        /* CMS (Content Management System) Section */
        <div className="space-y-6">
          {/* CMS Sub-navigation */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setCmsSection('flashcards')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                cmsSection === 'flashcards'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Flashcard Decks CMS</span>
            </button>

            <button
              onClick={() => setCmsSection('pastpapers')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                cmsSection === 'pastpapers'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Past Paper & Question Bank CMS</span>
              {customPapers.length > 0 && (
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                  {customPapers.length} custom
                </span>
              )}
            </button>
          </div>

          {cmsSection === 'flashcards' ? (
            /* Flashcards Management */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Single Flashcard Creator */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400 border border-purple-500/30">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Create Single Flashcard</h3>
                    <p className="text-[11px] text-slate-400">Add a new revision card to the student deck</p>
                  </div>
                </div>

                <form onSubmit={handleCreateFlashcard} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Subject</label>
                      <select
                        value={fcSubjectId}
                        onChange={(e) => setFcSubjectId(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                      >
                        {IGCSE_SUBJECTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} · {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Difficulty Tier</label>
                      <select
                        value={fcTier}
                        onChange={(e) => setFcTier(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="Core">Core</option>
                        <option value="Extended">Extended</option>
                        <option value="Hard">Grade 9 Challenge</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Topic / Unit Name</label>
                    <input
                      type="text"
                      required
                      value={fcTopic}
                      onChange={(e) => setFcTopic(e.target.value)}
                      placeholder="e.g. Coordinate Geometry, Quadratic Sequences"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Card Question / Prompt</label>
                    <textarea
                      required
                      rows={3}
                      value={fcQuestion}
                      onChange={(e) => setFcQuestion(e.target.value)}
                      placeholder="e.g. State the formula for the distance between two coordinate points (x1, y1) and (x2, y2)."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Model Answer / Definition</label>
                    <textarea
                      required
                      rows={3}
                      value={fcAnswer}
                      onChange={(e) => setFcAnswer(e.target.value)}
                      placeholder="e.g. d = √((x2 - x1)² + (y2 - y1)²)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">LaTeX Formula (Optional)</label>
                      <input
                        type="text"
                        value={fcFormula}
                        onChange={(e) => setFcFormula(e.target.value)}
                        placeholder="e.g. d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Examiner Tip (Optional)</label>
                      <input
                        type="text"
                        value={fcTip}
                        onChange={(e) => setFcTip(e.target.value)}
                        placeholder="e.g. Never round interim values before squaring"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Flashcard</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Bulk JSON Flashcard Importer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Bulk JSON Importer</h3>
                      <p className="text-[11px] text-slate-400">Upload multiple flashcards at once in JSON format</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paste a JSON array of cards. Each card must include <code className="text-purple-300 font-mono">topic</code>, <code className="text-purple-300 font-mono">question</code>, and <code className="text-purple-300 font-mono">answer</code>.
                  </p>

                  <div className="relative">
                    <textarea
                      rows={12}
                      value={fcJsonRaw}
                      onChange={(e) => setFcJsonRaw(e.target.value)}
                      placeholder={`[\n  {\n    "topic": "Algebra",\n    "question": "What is the discriminant?",\n    "answer": "b^2 - 4ac",\n    "difficulty": "Extended"\n  }\n]`}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleImportFlashcardsJson}
                    disabled={!fcJsonRaw.trim()}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import Flashcards Array</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Past Papers Management */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Single Question Authoring Form */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400 border border-purple-500/30">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Author Past Paper Question</h3>
                      <p className="text-[11px] text-slate-400">Add an official or predicted question to the database</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreatePastPaper} className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Subject</label>
                        <select
                          value={ppSubjectId}
                          onChange={(e) => setPpSubjectId(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        >
                          {IGCSE_SUBJECTS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.code} · {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Session</label>
                        <input
                          type="text"
                          required
                          value={ppSession}
                          onChange={(e) => setPpSession(e.target.value)}
                          placeholder="e.g. May/June 2024 Paper 42"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Paper Code</label>
                        <input
                          type="text"
                          required
                          value={ppPaperCode}
                          onChange={(e) => setPpPaperCode(e.target.value)}
                          placeholder="0580/42"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Year</label>
                        <input
                          type="number"
                          required
                          value={ppYear}
                          onChange={(e) => setPpYear(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Q Number</label>
                        <input
                          type="text"
                          required
                          value={ppQNum}
                          onChange={(e) => setPpQNum(e.target.value)}
                          placeholder="Q3(b)"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Marks</label>
                        <input
                          type="number"
                          required
                          value={ppMarks}
                          onChange={(e) => setPpMarks(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Tier</label>
                        <select
                          value={ppTier}
                          onChange={(e) => setPpTier(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="Core">Core</option>
                          <option value="Standard Extended">Extended</option>
                          <option value="Grade 9 Challenge">Grade 9</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Topic</label>
                      <input
                        type="text"
                        required
                        value={ppTopic}
                        onChange={(e) => setPpTopic(e.target.value)}
                        placeholder="e.g. Trigonometry & Sine Rule"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Question Prompt</label>
                      <textarea
                        required
                        rows={3}
                        value={ppPrompt}
                        onChange={(e) => setPpPrompt(e.target.value)}
                        placeholder="Calculate angle ABC using the Sine Rule..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">LaTeX Formula / Diagram (Optional)</label>
                      <input
                        type="text"
                        value={ppFormula}
                        onChange={(e) => setPpFormula(e.target.value)}
                        placeholder="e.g. \frac{a}{\sin A} = \frac{b}{\sin B}"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Mark Scheme Requirement</label>
                        <input
                          type="text"
                          value={ppStepReq}
                          onChange={(e) => setPpStepReq(e.target.value)}
                          placeholder="[M1] for \sin B = (12 \times \sin 38) / 9.5"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Final Answer</label>
                        <input
                          type="text"
                          required
                          value={ppAnswer}
                          onChange={(e) => setPpAnswer(e.target.value)}
                          placeholder="51.2° or 51.21°"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Examiner Report Snippet</label>
                        <input
                          type="text"
                          value={ppReport}
                          onChange={(e) => setPpReport(e.target.value)}
                          placeholder="Candidates often forgot to set their calculator to DEG mode."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Official PDF URL (Optional)</label>
                        <input
                          type="url"
                          value={ppPdfUrl}
                          onChange={(e) => setPpPdfUrl(e.target.value)}
                          placeholder="https://.../paper.pdf"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Question to Bank</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Bulk JSON Past Paper Importer */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Bulk Past Papers Importer</h3>
                        <p className="text-[11px] text-slate-400">Import an array of PastPaperItem objects</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Paste a JSON array of past paper questions. Each entry supports question text, diagrams, mark scheme criteria, and PDF URLs.
                    </p>

                    <div className="relative">
                      <textarea
                        rows={14}
                        value={ppJsonRaw}
                        onChange={(e) => setPpJsonRaw(e.target.value)}
                        placeholder={`[\n  {\n    "id": "custom-pp-01",\n    "subjectId": "cie-math-0580",\n    "subjectName": "Cambridge IGCSE Mathematics",\n    "board": "CIE",\n    "session": "May/June 2024 Paper 42",\n    "paperCode": "0580/42",\n    "year": 2024,\n    "questionNumber": "Q1",\n    "topic": "Percentages",\n    "difficultyTier": "Standard Extended",\n    "questionPrompt": "Calculate the compound interest...",\n    "marks": 3,\n    "finalAnswer": "$1,450.80"\n  }\n]`}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleImportPastPapersJson}
                      disabled={!ppJsonRaw.trim()}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import Past Papers Array</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Questions List */}
              {customPapers.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Custom Added Past Paper Questions ({customPapers.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {customPapers.map((cp) => (
                      <div key={cp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[10px] font-bold font-mono">
                              {cp.paperCode} · {cp.questionNumber}
                            </span>
                            <span className="text-xs font-bold text-white">{cp.topic}</span>
                            <span className="text-[10px] text-slate-400">({cp.marks} Marks)</span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-1">{cp.questionPrompt}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteCustomPaper(cp.id)}
                          className="rounded-lg p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete custom question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* Module 1: BDC Bank Feed & InstaPay Reconciliation Tab     */}
      {/* ───────────────────────────────────────────────────────── */}
      {adminActiveTab === 'payments' && (
        <div className="space-y-6">
          {/* Bank Ledger Header Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 border border-emerald-500/30">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Banque Du Caire (BDC) & InstaPay Feed</h2>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                    Live Ledger
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Automated two-way reconciliation pipeline matching official BDC inbound bank SMS with student InstaPay transaction numbers.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                  <span>Bank: <strong className="text-emerald-300">Banque Du Caire (BDC) {BDC_ACCOUNT_NUMBER_MASKED}</strong></span>
                  <span>•</span>
                  <span>InstaPay IPA: <strong className="text-amber-300">{OFFICIAL_INSTAPAY_IPA}</strong></span>
                  <span>•</span>
                  <span>Standard Pro Price: <strong className="text-white">EGP {SUBSCRIPTION_PRICE_EGP}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={reloadBankTxs}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sync Feed</span>
                </button>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total BDC Credits</span>
                <Receipt className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">{bankMetrics.total}</div>
              <span className="text-[10px] text-slate-500">Total SMS records</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 ring-1 ring-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span>Unclaimed Transfers</span>
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">{bankMetrics.unclaimed}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">EGP {bankMetrics.unclaimedEgp.toFixed(2)} ready to match</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Claimed / Pro Granted</span>
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">{bankMetrics.claimed}</div>
              <span className="text-[10px] text-slate-500">Matched student accounts</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total Volume</span>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">EGP {bankMetrics.totalEgp.toFixed(0)}</div>
              <span className="text-[10px] text-slate-500">Gross subscription inflow</span>
            </div>
          </div>

          {/* 📱 How to Connect Your BDC Bank SMS Messages Automatically Guide */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Smartphone className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>How to Connect Your Banque Du Caire (BDC) SMS Messages</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      Zero Human Effort
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Follow this 60-second setup on your iPhone to forward BDC bank alert SMS automatically to Simply.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/bdc-sms`);
                    showToast('Copied Webhook URL to clipboard!');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Webhook URL</span>
                </button>
              </div>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-black text-white">
                    1
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Shortcuts App</span>
                </div>
                <h4 className="text-xs font-black text-white">Open iPhone Shortcuts</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Open the built-in <strong>Shortcuts (الاختصارات)</strong> app on your iPhone. Tap the <strong>Automation (التحكم التلقائي)</strong> tab at the bottom, then tap <strong>+ (New Automation)</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-black text-white">
                    2
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Trigger Rule</span>
                </div>
                <h4 className="text-xs font-black text-white">Set Message Filter</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select <strong>Message</strong>. In <em>Sender</em>, choose or type <strong>BDC</strong>. In <em>Message Contains</em>, enter <strong>جم</strong> or <strong>EGP</strong>. Select <strong>Run Immediately</strong> (تشغيل فوراً).
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-black text-white">
                    3
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">POST Action</span>
                </div>
                <h4 className="text-xs font-black text-white">Get Contents of URL</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Add action: <strong>Get Contents of URL</strong>.<br />
                  • Method: <code className="text-indigo-300 font-mono">POST</code><br />
                  • Header: <code className="text-indigo-300 font-mono">Content-Type: application/json</code><br />
                  • Body: JSON <code className="text-emerald-300 font-mono">{`{"smsText": ShortcutInput}`}</code>
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 font-mono text-xs font-black text-white">
                    4
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Instant Match</span>
                </div>
                <h4 className="text-xs font-black text-white">Instant Pro Access</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every time BDC sends a deposit SMS, your phone sends it here. When the student uploads their InstaPay receipt, Gemini matches the Reference # and activates Pro in under 2 seconds!
                </p>
              </div>
            </div>

            {/* Quick Copy Snippet */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300">
                  Webhook Target: <code className="text-indigo-300 font-mono">{window.location.origin}/api/webhooks/bdc-sms</code>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Payload format: <span className="text-emerald-400">{`{ "smsText": "..." }`}</span>
              </div>
            </div>
          </div>

          {/* iPhone Shortcut Inbound SMS Webhook Simulator */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400 border border-indigo-500/30">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">iPhone Shortcut Webhook Simulator</h3>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="text-indigo-300 font-mono">POST /api/webhooks/bdc-sms</code> (Extracts Bank Ref # and EGP)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickSmsTemplate('arabic')}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
                >
                  Template: Arabic BDC SMS
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSmsTemplate('english')}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
                >
                  Template: English Alert
                </button>
              </div>
            </div>

            <form onSubmit={handleSimulateSms} className="space-y-3">
              <textarea
                value={smsSimulatorText}
                onChange={(e) => setSmsSimulatorText(e.target.value)}
                rows={3}
                placeholder="Paste incoming SMS text from Banque Du Caire (BDC) or click one of the quick templates above..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Parses Reference Number (الرقم المرجعي) and Amount (جم / EGP) automatically.
                </span>

                <button
                  type="submit"
                  disabled={!smsSimulatorText.trim() || isSimulatingSms}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSimulatingSms ? 'Parsing...' : 'Ingest to Bank Ledger'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Bank Ledger Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Bank Transactions Ledger ({filteredBankTxs.length})</h3>
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'unclaimed', 'claimed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTxFilter(filter)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer ${
                      txFilter === filter
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredBankTxs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No bank transactions found in this view.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold">
                      <th className="p-3">Reference / Tx #</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Source & Bank</th>
                      <th className="p-3">Received Time</th>
                      <th className="p-3">Claimed By</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredBankTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>#{tx.txNumber}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tx.txNumber);
                                showToast(`Copied #${tx.txNumber}`);
                              }}
                              className="text-slate-500 hover:text-slate-300 p-0.5"
                              title="Copy Reference"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3 font-bold text-emerald-400">
                          EGP {tx.amount.toFixed(2)}
                        </td>

                        <td className="p-3">
                          {tx.status === 'unclaimed' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 animate-pulse">
                              <Zap className="h-2.5 w-2.5" />
                              <span>Unclaimed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span>Claimed</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-400 text-[11px]">
                          BDC Bank Alert
                        </td>

                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(tx.receivedAt).toLocaleString()}
                        </td>

                        <td className="p-3 text-[11px]">
                          {tx.claimedBy ? (
                            <span className="text-indigo-300 font-semibold">{tx.claimedBy}</span>
                          ) : (
                            <span className="text-slate-500 italic">None (Ready to match)</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status === 'unclaimed' && (
                              <button
                                onClick={() => {
                                  setManualMatchTx(tx);
                                  setManualMatchEmail('');
                                }}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 px-2 py-1 text-[11px] font-bold text-emerald-300 transition cursor-pointer"
                              >
                                <CheckCheck className="h-3 w-3" />
                                <span>Match / Grant Pro</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteBankTx(tx.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* Module 4: Past Paper QA Verification Agent Tab           */}
      {/* ───────────────────────────────────────────────────────── */}
      {adminActiveTab === 'qa' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-400 border border-sky-500/30">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Past Paper QA Verification Agent</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    qaReport.failedCount === 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {qaReport.failedCount === 0 ? '100% Passed (0 Errors)' : `${qaReport.issues.length} Issues Detected`}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Internal verification engine scanning every question, sub-part, step mark scheme rubric, examiner report, and KaTeX math expression.
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  Last Scanned: {new Date(qaReport.scannedAt).toLocaleTimeString()} • Verified Against Cambridge (CIE) & Pearson Edexcel Syllabuses
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRunQaScan}
                  disabled={isScanningQa}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isScanningQa ? 'animate-spin' : ''}`} />
                  <span>{isScanningQa ? 'Running QA Agent...' : 'Run Comprehensive Scan'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* QA Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Total Questions</span>
                <Database className="h-4 w-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono">{qaReport.totalQuestionsScanned}</div>
              <span className="text-[10px] text-slate-500">Across all subjects</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span>KaTeX Math Syntax</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
                {qaReport.katexSyntaxErrors === 0 ? 'PERFECT' : `${qaReport.katexSyntaxErrors} Errors`}
              </div>
              <span className="text-[10px] text-emerald-400">All braces & dollar signs closed</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Mark Scheme Steps</span>
                <Layers className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300 mt-1 font-mono">
                {qaReport.missingMarkSchemes === 0 ? 'COMPLETE' : `${qaReport.missingMarkSchemes} Missing`}
              </div>
              <span className="text-[10px] text-slate-500">[M1], [A1], [B1] rubrics present</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Official PDF Links</span>
                <FileText className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">{qaReport.totalPdfsScanned} Papers</div>
              <span className="text-[10px] text-slate-500">Linked to official PDFs</span>
            </div>
          </div>

          {/* Interactive KaTeX Syntax Test Bed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-400 border border-sky-500/30">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Interactive KaTeX Math Syntax Test Bed</h3>
                <p className="text-[11px] text-slate-400">
                  Test mathematical formulas, command tokens, and delimiter pairs before publishing.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testKatexInput}
                  onChange={(e) => {
                    setTestKatexInput(e.target.value);
                    setTestKatexResult(validateKatexSyntax(e.target.value));
                  }}
                  placeholder="Enter KaTeX expression (e.g. \int_{0}^{\pi} \sin(x) dx)"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Validation Status:</span>
                  {testKatexResult.isValid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Valid KaTeX & Balanced Braces</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{testKatexResult.error}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>Currency signs: use <code className="text-amber-300">\$</code> to avoid math delimiter traps.</span>
                </div>
              </div>
            </div>
          </div>

          {/* QA Scan Results Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Database Verification Report</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {qaReport.issues.length === 0 ? 'Status: 0 Issues Found' : `${qaReport.issues.length} Issues Found`}
              </span>
            </div>

            {qaReport.issues.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white">All Database Past Papers Verified</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Every past paper component has valid KaTeX math formatting, complete mark schemes, step criteria rubrics, and valid PDF examiner resources.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-semibold">
                      <th className="p-3">Paper Code</th>
                      <th className="p-3">Question</th>
                      <th className="p-3">Issue Type</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {qaReport.issues.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 text-white font-bold">{issue.paperCode}</td>
                        <td className="p-3 text-slate-300">{issue.questionNumber}</td>
                        <td className="p-3 text-amber-300">{issue.issueType}</td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          <div>{issue.details}</div>
                          {issue.snippet && (
                            <code className="block mt-1 text-[10px] text-amber-200 bg-slate-950 p-1 rounded">
                              {issue.snippet}
                            </code>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Classroom & Diagnostic Analytics Portal */}
      {adminActiveTab === 'classroom' && (
        <div className="space-y-4 animate-fadeIn">
          <TeacherAnalyticsDashboard
            currentUser={currentUser}
            subjects={IGCSE_SUBJECTS}
          />
        </div>
      )}

      {/* Manual Match & Grant Pro Modal for BDC Transactions */}
      {manualMatchTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setManualMatchTx(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Match BDC Bank Transfer</h3>
                <p className="text-xs text-slate-400">Grant 30-Day Pro Subscription Access</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Ref #:</span>
                <span className="text-white font-bold">#{manualMatchTx.txNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-emerald-400 font-bold">EGP {manualMatchTx.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Received:</span>
                <span className="text-slate-300">{new Date(manualMatchTx.receivedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-300 block">
                Assign to Student Account Email:
              </label>
              <input
                type="email"
                required
                value={manualMatchEmail}
                onChange={(e) => setManualMatchEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />

              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">Or pick from registered waitlist:</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {users.slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setManualMatchEmail(u.email)}
                      className="rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white hover:border-slate-700"
                    >
                      {u.name} ({u.email})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setManualMatchTx(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleManualClaim(manualMatchTx)}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95 shadow-md shadow-emerald-500/20"
              >
                Confirm Match & Grant 30-Day Pro
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400 border border-indigo-500/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enroll New Student Account</h3>
                <p className="text-xs text-slate-400">Pre-approved with immediate access</p>
              </div>
            </div>

            {addError && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex.morgan@school.edu"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Account Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Grade</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as TargetGrade)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="9 / A*">9 / A*</option>
                    <option value="8 / A*">8 / A*</option>
                    <option value="7 / A">7 / A</option>
                    <option value="6 / B">6 / B</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  {isAdding ? 'Creating...' : 'Enroll Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
