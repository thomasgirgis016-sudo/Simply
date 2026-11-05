import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  ShieldCheck,
  Crown,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount, GradeLevel, ExamBoard, TargetGrade, MAX_STUDENT_SUBJECTS } from '../types';
import { registerStudent, loginStudent, loginWithAccessCode, requestPasswordReset, completePasswordReset } from '../services/auth';
import { IGCSE_SUBJECTS } from '../data/subjects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'access_code' | 'forgot_request' | 'forgot_confirm' | 'reset_success'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Year 11 / Grade 10 (IGCSE Exam Yr)');
  const [board, setBoard] = useState<ExamBoard>('Both');
  const [targetGrade, setTargetGrade] = useState<TargetGrade>('9 / A*');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'cie-math-0580',
    'cie-esl-0510',
    'cie-physics-0625',
    'cie-chem-0620',
    'cie-bio-0610'
  ]);

  // Forgot password flow state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setInfoMsg('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await loginStudent(email, password);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await loginWithAccessCode(accessCode);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Invalid staff / founder access code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await registerStudent({
        name,
        email,
        password,
        grade,
        board,
        targetGrade,
        selectedSubjectIds: selectedSubjects
      });

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to create student account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    resetMessages();

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setInfoMsg(`A 6-digit verification code has been dispatched to ${email}. Check your inbox!`);
        setMode('forgot_confirm');
      } else {
        setErrorMsg(res.error || 'Unable to find an account with this email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await completePasswordReset(email, resetCode, newPassword);
      if (res.success) {
        setMode('reset_success');
      } else {
        setErrorMsg(res.error || 'Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (id: string) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(prev => prev.filter(s => s !== id));
      setErrorMsg('');
    } else {
      if (selectedSubjects.length >= MAX_STUDENT_SUBJECTS) {
        setErrorMsg(`IGCSE System Limit: You can select up to ${MAX_STUDENT_SUBJECTS} subjects.`);
        return;
      }
      setSelectedSubjects(prev => [...prev, id]);
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />

      {/* Electric Glow Rotating Border Container */}
      <div className="electric-glow-border relative my-auto w-full max-w-lg shadow-2xl transition-all duration-300">
        
        {/* Embossed Main Card Surface */}
        <div className="embossed-surface relative p-5 sm:p-8 max-h-[92dvh] overflow-y-auto">
          
          {/* Circular Embossed Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 transition cursor-pointer"
            style={{
              background: '#0d131f',
              boxShadow: '4px 4px 8px #06090e, -4px -4px 8px #182335'
            }}
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Brand Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-cyan-400"
              style={{
                background: '#0d131f',
                boxShadow: '5px 5px 12px #06090e, -5px -5px 12px #182335'
              }}
            >
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">Simply IGCSE</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                  Account
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'signin' && 'Sign in to access your subjects, progress & flashcards'}
                {mode === 'signup' && 'Create your student account with instant activation'}
                {mode === 'access_code' && 'Enter your unique Staff or Founder Access Code'}
                {mode.startsWith('forgot') && 'Reset your student account password'}
                {mode === 'reset_success' && 'Password successfully updated'}
              </p>
            </div>
          </div>

          {/* Alerts / Error messages */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300"
                 style={{ boxShadow: 'inset 2px 2px 5px #06090e' }}>
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3 text-xs text-cyan-300"
                 style={{ boxShadow: 'inset 2px 2px 5px #06090e' }}>
              <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Embossed Tab Switcher Track */}
          {(mode === 'signin' || mode === 'signup' || mode === 'access_code') && (
            <div className="embossed-tab-track mb-6 flex gap-1">
              <button
                type="button"
                onClick={() => { setMode('signin'); resetMessages(); }}
                className={`embossed-tab-pill flex-1 py-2.5 text-xs font-bold transition cursor-pointer ${
                  mode === 'signin'
                    ? 'active text-cyan-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); resetMessages(); }}
                className={`embossed-tab-pill flex-1 py-2.5 text-xs font-bold transition cursor-pointer ${
                  mode === 'signup'
                    ? 'active text-cyan-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setMode('access_code'); resetMessages(); }}
                className={`embossed-tab-pill flex-1 py-2.5 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'access_code'
                    ? 'active text-amber-400 font-extrabold'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Access Code</span>
              </button>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.com"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-3 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_request'); resetMessages(); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-11 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Raised Embossed Button */}
              <button
                type="submit"
                disabled={loading}
                className="embossed-action-btn mt-6 w-full py-3.5 text-sm font-extrabold text-cyan-400 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="pt-3 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setMode('access_code'); resetMessages(); }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Staff or Founder? Log in with Access Code</span>
                </button>
              </div>
            </form>
          )}

          {/* 1b. ACCESS CODE FORM (Thomas Founder & Staff) */}
          {mode === 'access_code' && (
            <form onSubmit={handleAccessCodeLogin} className="space-y-4 animate-fadeIn">
              <div
                className="rounded-2xl border border-amber-500/30 p-4 text-xs text-amber-200"
                style={{
                  background: 'linear-gradient(145deg, #161208, #0d0f17)',
                  boxShadow: 'inset 4px 4px 8px #06090e, inset -4px -4px 8px #1a160d'
                }}
              >
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                  <Crown className="h-4 w-4 text-amber-400" />
                  Staff & Founder Portal
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Platform founders and staff authenticate using an individual Security Access Code. Passwords are never written down or exposed.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Security Access Code
                  </label>
                  <span className="text-[10px] text-amber-400/90 font-medium">Single-Device Auth</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code (e.g. 2011)"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-3 text-base sm:text-sm text-white font-mono tracking-wider placeholder-slate-500 focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="embossed-action-btn mt-6 w-full py-3.5 text-sm font-extrabold text-amber-400 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Access Code...</span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Unlock Founder / Staff Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); resetMessages(); }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer transition"
                >
                  ← Back to Student Sign In
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div
                className="rounded-xl border border-emerald-500/30 p-3 text-xs text-emerald-200/90 leading-relaxed flex items-center gap-2"
                style={{
                  background: 'linear-gradient(145deg, #071610, #0d131f)',
                  boxShadow: 'inset 3px 3px 6px #06090e, inset -3px -3px 6px #0d1f18'
                }}
              >
                <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span><strong className="text-emerald-300 font-semibold">Instant Student Activation:</strong> Access past papers, step-by-step mark scheme solvers, flashcards, and classified exam questions immediately!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Full Name / Nickname
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thomas"
                    className="embossed-input-field w-full rounded-xl py-2.5 pl-11 pr-3 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.com"
                    className="embossed-input-field w-full rounded-xl py-2.5 pl-11 pr-3 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="embossed-input-field w-full rounded-xl py-2.5 pl-11 pr-11 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Academic Board & Grade Level */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                    Exam Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value as ExamBoard)}
                    className="embossed-input-field w-full rounded-xl py-2.5 px-3 text-xs text-white"
                  >
                    <option value="Both">Cambridge & Edexcel (Both)</option>
                    <option value="CIE">Cambridge IGCSE (CIE)</option>
                    <option value="Edexcel">Pearson Edexcel IGCSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                    Target Grade Goal
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value as TargetGrade)}
                    className="embossed-input-field w-full rounded-xl py-2.5 px-3 text-xs text-amber-400 font-bold"
                  >
                    <option value="9 / A*">Grade 9 / A*</option>
                    <option value="8 / A*">Grade 8 / A*</option>
                    <option value="7 / A">Grade 7 / A</option>
                    <option value="6 / B">Grade 6 / B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Current Year Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="embossed-input-field w-full rounded-xl py-2.5 px-3 text-xs text-white"
                >
                  <option value="Year 9 / Grade 8">Year 9 / Grade 8 (Foundations)</option>
                  <option value="Year 10 / Grade 9 (IGCSE Yr 1)">Year 10 / Grade 9 (IGCSE Year 1)</option>
                  <option value="Year 11 / Grade 10 (IGCSE Exam Yr)">Year 11 / Grade 10 (IGCSE Exam Year / Finals)</option>
                  <option value="Year 12 / Grade 11 (AS Level)">Year 12 / Grade 11 (AS Level)</option>
                  <option value="Year 13 / Grade 12 (A Level)">Year 13 / Grade 12 (A Level)</option>
                </select>
              </div>

              {/* Quick Subjects Check */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Enrolled Subjects ({selectedSubjects.length}/{MAX_STUDENT_SUBJECTS} selected)
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">Max 5 Capped</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {IGCSE_SUBJECTS.map((s) => {
                    const isSel = selectedSubjects.includes(s.id);
                    const isCapped = !isSel && selectedSubjects.length >= MAX_STUDENT_SUBJECTS;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isCapped}
                        onClick={() => toggleSubject(s.id)}
                        className={`flex items-center justify-between gap-1.5 rounded-xl p-2 text-left text-xs transition cursor-pointer ${
                          isCapped
                            ? 'opacity-40 cursor-not-allowed text-slate-500'
                            : isSel
                            ? 'text-cyan-300 font-medium'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        style={{
                          background: isSel ? 'linear-gradient(135deg, #0e1e2d, #09131d)' : '#090e17',
                          boxShadow: isSel 
                            ? 'inset 3px 3px 6px #05080e, inset -3px -3px 6px #152538, 0 0 10px rgba(6, 182, 212, 0.25)' 
                            : 'inset 2px 2px 4px #04070c, inset -2px -2px 4px #131c2c',
                          border: isSel ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-2 w-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded border border-slate-700/80 text-slate-400 shrink-0">
                          {s.level === 'A Level' ? 'A2' : s.level === 'AS Level' ? 'AS' : 'OL'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="embossed-action-btn mt-6 w-full py-3.5 text-sm font-extrabold text-cyan-400 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Complete Registration & Start Studying'}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD - STEP 1 (REQUEST CODE) */}
          {mode === 'forgot_request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter the email address you registered with. We will generate a secure 6-digit verification code to reset your password.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Your Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.com"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-3 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); resetMessages(); }}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ← Back to Sign In
                </button>

                <button
                  type="submit"
                  className="embossed-action-btn px-5 py-2.5 text-xs font-extrabold text-cyan-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Send Reset Code</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD - STEP 2 (CONFIRM CODE & SET NEW PASSWORD) */}
          {mode === 'forgot_confirm' && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div
                className="rounded-2xl border border-sky-500/30 p-4 text-sky-200"
                style={{
                  background: 'linear-gradient(145deg, #091a28, #0d131f)',
                  boxShadow: 'inset 3px 3px 6px #06090e, inset -3px -3px 6px #10263b'
                }}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-sky-300 mb-1">
                  <Mail className="h-4 w-4 text-sky-400" />
                  Security Verification Code Dispatched to Your Email
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have sent a 6-digit verification code to <strong className="text-white font-mono">{email}</strong>. Please check your inbox and enter the code below.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Didn't receive it?</span>
                  <button
                    type="button"
                    onClick={() => handleRequestReset()}
                    className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  6-Digit Security Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-3 text-base sm:text-sm text-white font-mono tracking-widest placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="embossed-input-field w-full rounded-xl py-3 pl-11 pr-11 text-base sm:text-sm text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition cursor-pointer p-1"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('forgot_request'); resetMessages(); }}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="embossed-action-btn px-5 py-2.5 text-xs font-extrabold text-emerald-400 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET SUCCESS */}
          {mode === 'reset_success' && (
            <div className="text-center py-4 space-y-4">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-emerald-400"
                style={{
                  background: '#0d131f',
                  boxShadow: '6px 6px 14px #06090e, -6px -6px 14px #182335'
                }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Password Updated!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setMode('signin'); resetMessages(); }}
                className="embossed-action-btn w-full py-3.5 text-sm font-extrabold text-cyan-400 cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
