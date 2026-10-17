import React from 'react';
import {
  Lock,
  Clock,
  ShieldAlert,
  Sparkles,
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  CheckCircle,
  ShieldCheck,
  GraduationCap,
  KeyRound
} from 'lucide-react';
import { UserAccount } from '../types';

interface AccountGateProps {
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onRefreshStatus?: () => void;
  onLogout?: () => void;
  featureName?: string;
}

export const AccountGate: React.FC<AccountGateProps> = ({
  currentUser,
  onOpenAuth,
  onRefreshStatus,
  onLogout,
  featureName = 'this study module',
}) => {
  // Case 1: User is logged in, but their account status is 'pending'
  if (currentUser && currentUser.status === 'pending') {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Pending Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-6">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 mb-3">
            Status: Pending Administrator Approval
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Account Awaiting Verification
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.name}</strong>! Your account (<code className="text-amber-300 bg-slate-950 px-2 py-0.5 rounded font-mono text-xs">{currentUser.email}</code>) has been registered.
          </p>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            An administrator must accept your account before you can unlock full access to the AI Question Solver, Past Papers, Revision Notes, and Mock Quizzes.
          </p>

          {/* Admin Demo Hint */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-400 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1.5 font-bold text-indigo-300 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Are you an administrator?</span>
            </div>
            Sign in with <strong className="text-slate-200">admin@simplyigcse.com</strong> to accept this student account from the Admin Console.
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Check Approval Status</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User is logged in, but account is rejected or suspended
  if (currentUser && (currentUser.status === 'rejected' || currentUser.status === 'suspended')) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-900 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-lg mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30 mb-3">
            Access Suspended
          </span>

          <h2 className="text-2xl font-black text-white">
            Account Inactive
          </h2>

          <p className="mt-3 text-sm text-slate-300">
            Access for <strong className="text-white">{currentUser.email}</strong> is currently paused by an administrator. Please reach out to your teacher or school coordinator.
          </p>

          <div className="mt-6 flex justify-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Not logged in at all (Authentication Required)
  return (
    <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 mb-6">
          <Lock className="h-8 w-8" />
        </div>

        <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 mb-3">
          Account Required for Full Access
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Sign In to Access {featureName}
        </h2>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          Simply IGCSE provides authentic Cambridge & Edexcel past papers, mark schemes, high-yield revision notes, and AI examiner grading.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Please sign in to your verified student account or create one to get started.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition active:scale-95 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Account</span>
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-indigo-400" />
            <span>Create Student Account</span>
          </button>
        </div>

        {/* Admin Login Shortcut */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>School Coordinator or Admin?</span>
          <button
            onClick={() => onOpenAuth('signin')}
            className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
          >
            Admin Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
