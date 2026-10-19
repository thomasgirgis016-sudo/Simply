import React from 'react';
import {
  Lock,
  Clock,
  ShieldAlert,
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  CheckCircle,
  Sparkles,
  Layers,
  BookOpen,
  Zap
} from 'lucide-react';
import { UserAccount } from '../types';
import { SimplyLogo } from './SimplyLogo';

interface AccountGateProps {
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onRefreshStatus?: () => void;
  onLogout?: () => void;
  onOpenPayment?: () => void;
  featureName?: string;
}

export const AccountGate: React.FC<AccountGateProps> = ({
  currentUser,
  onOpenAuth,
  onRefreshStatus,
  onLogout,
  onOpenPayment,
  featureName = 'Simply IGCSE study tools',
}) => {
  // Case 1: User is logged in, but their account status is 'pending' (On Waitlist)
  if (currentUser && currentUser.status === 'pending') {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <SimplyLogo size="md" />
          </div>

          {/* Pending Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 mb-4">
            <Clock className="h-3.5 w-3.5 animate-pulse text-amber-400" />
            <span>Priority Waitlist • Pending Administrator Approval</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Application Under Review
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.name}</strong>! Your account has been registered and placed in the student verification queue.
          </p>

          {/* Waitlist details summary */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Registered Email:</span>
              <span className="font-mono text-amber-300 font-semibold">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Target Grade Level:</span>
              <span className="text-white font-medium">{currentUser.grade}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Current Queue Status:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Awaiting Admin Verification
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Estimated Review Time:</span>
              <span className="text-slate-200">Usually within 24 hours</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Once approved by an administrator, full access to past papers, mark schemes, high-yield revision notes, and the AI Question Solver will unlock automatically.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:opacity-95 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Check Approval Status</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Fast-Track Pro Option via InstaPay / BDC */}
          {onOpenPayment && (
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <p className="text-[11px] text-amber-300 font-medium mb-2.5">
                Need urgent access for homework or mocks?
              </p>
              <button
                onClick={onOpenPayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Fast-Track Instant Access with InstaPay (BDC 30-Day Pro)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Case 2: User is logged in, but account is rejected or suspended
  if (currentUser && (currentUser.status === 'rejected' || currentUser.status === 'suspended')) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
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
            Access for <strong className="text-white">{currentUser.email}</strong> is currently paused. Please contact school administration or support.
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

  // Case 3: Not logged in at all (Mandatory Account Gate)
  return (
    <div className="mx-auto max-w-xl py-12 px-4 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[#FF5E62]/10 blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <SimplyLogo size="xl" />
        </div>

        <span className="inline-block rounded-full bg-[#FF5E62]/15 px-3.5 py-1 text-xs font-bold text-[#FFA63A] border border-[#FF5E62]/30 mb-3">
          Verified Student Account Required
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to Simply IGCSE
        </h2>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          To access {featureName}, past paper mark schemes, worked exam examples, and AI grading, please create an account or sign in.
        </p>

        {/* Value pills */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto text-left text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
            <BookOpen className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 text-[11px] font-medium">Cambridge & Edexcel Notes</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
            <Sparkles className="h-4 w-4 text-[#FFA63A] shrink-0" />
            <span className="text-slate-300 text-[11px] font-medium">AI Step-by-Step Marking</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
            <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 text-[11px] font-medium">Official Exam Questions</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-6 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account & Join Waitlist</span>
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <LogIn className="h-4 w-4 text-amber-400" />
            <span>Sign In to Account</span>
          </button>
        </div>

        <p className="mt-5 text-[11px] text-slate-500">
          Newly registered accounts are submitted for administrator approval to ensure dedicated exam board alignment.
        </p>
      </div>
    </div>
  );
};
