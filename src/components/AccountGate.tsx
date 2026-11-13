import React, { useState, useEffect } from 'react';
import {
  Lock,
  Clock,
  ShieldAlert,
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  CheckCircle,
  GraduationCap,
  Layers,
  BookOpen,
  Zap,
  Key,
  School,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { UserAccount } from '../types';
import { SimplyLogo } from './SimplyLogo';
import { hasActiveSubscription } from '../services/auth';
import { redeemSchoolAccessCode } from '../services/paymentAutomation';
import confetti from 'canvas-confetti';

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
  featureName = 'Fahemny IGCSE study tools',
}) => {
  const [inlineCode, setInlineCode] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Auto-poll approval status every 2.5 seconds when pending
  useEffect(() => {
    if (!currentUser || currentUser.status !== 'pending') return;

    let isPolling = false;
    const poll = async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        if (onRefreshStatus) await onRefreshStatus();
      } catch {} finally {
        isPolling = false;
      }
    };

    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [currentUser?.status, onRefreshStatus]);

  const handleManualCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      if (onRefreshStatus) await onRefreshStatus();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleInlineRedeem = () => {
    setInlineError('');
    if (!inlineCode.trim()) {
      setInlineError('Please enter your School or Class access code.');
      return;
    }
    if (!currentUser) return;

    setIsRedeeming(true);
    try {
      const res = redeemSchoolAccessCode(currentUser.email, inlineCode.trim());
      if (!res.success) {
        setInlineError(res.error || 'Invalid or expired code. Please verify with your teacher.');
        return;
      }

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      if (onRefreshStatus) {
        onRefreshStatus();
      }
    } catch (e: any) {
      setInlineError(e.message || 'Failed to redeem code.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Case 1: User is logged in, but their account status is 'pending' (On Waitlist)
  if (currentUser && currentUser.status === 'pending') {
    return (
      <div className="mx-auto max-w-xl py-2 sm:py-12 px-2.5 sm:px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-9 text-center shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-5">
            <SimplyLogo size="md" />
          </div>

          {/* Pending Badge */}
          <div className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/20 mb-3">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Priority Waitlist • Pending Approval</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Application Under Review
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Welcome, <strong className="text-white">{currentUser.name}</strong>! Your account has been registered and placed in the student verification queue.
          </p>

          {/* Waitlist details summary */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-left space-y-2 text-xs text-zinc-300">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-zinc-400">Registered Email:</span>
              <span className="font-mono text-amber-300 font-semibold">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-zinc-400">Target Grade Level:</span>
              <span className="text-white font-medium">{currentUser.grade}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-zinc-400">Current Queue Status:</span>
              <span className="font-medium text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Awaiting Admin Verification
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400">Estimated Review Time:</span>
              <span className="text-zinc-300">Usually within 24 hours</span>
            </div>
          </div>

          {/* Inline School Code Entry */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Have a School / Class Invite Code?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inlineCode}
                onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                placeholder="e.g. BIO-Y11-S1 or CLS-BIO11-2026"
                className="flex-1 rounded-lg border border-white/[0.08] bg-[#18181b] px-3 py-2 text-xs font-mono font-medium text-amber-300 placeholder-zinc-600 uppercase focus:border-[#FF5B37]/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleInlineRedeem}
                disabled={isRedeeming}
                className="rounded-lg bg-[#FF5B37] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c4b] transition cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
            {inlineError && (
              <p className="text-[11px] text-rose-400">{inlineError}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRefreshStatus && (
              <button
                onClick={handleManualCheckStatus}
                disabled={isCheckingStatus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Checking Server...' : 'Check Approval Status'}</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#222225] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Fast-Track Pro Option via InstaPay / BDC */}
          {onOpenPayment && (
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <p className="text-[11px] text-zinc-400 font-medium mb-2.5">
                Need urgent access for homework or mocks?
              </p>
              <button
                onClick={onOpenPayment}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Fast-Track Instant Access with InstaPay / Telda (BDC Live Feed)</span>
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
      <div className="mx-auto max-w-xl py-2 sm:py-12 px-2.5 sm:px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-[#18181b] p-5 sm:p-9 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3 sm:mb-5">
            <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <span className="inline-block rounded-md bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-300 border border-rose-500/20 mb-2">
            Access Suspended
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Account Inactive
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Access for <strong className="text-white">{currentUser.email}</strong> is currently paused. Please contact school administration or support.
          </p>

          <div className="mt-5 flex justify-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#222225] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
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

  // Case 3: Logged in, approved, but NO ACTIVE PAID SUBSCRIPTION (Paid-Only Wall)
  if (currentUser && !hasActiveSubscription(currentUser)) {
    return (
      <div className="mx-auto max-w-xl py-2 sm:py-12 px-2.5 sm:px-4 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-9 text-center shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-5">
            <SimplyLogo size="md" />
          </div>

          <span className="inline-block rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/20 mb-2">
            Active Paid Subscription Required
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Unlock Full Access
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Hello, <strong className="text-white">{currentUser.name}</strong>! Access to {featureName} requires an active individual subscription or an enrolled school/class seat.
          </p>

          {/* Option A: InstaPay / Telda Checkout */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FF5B37]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Option 1: Individual Student Plan</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/20">
                Instant BDC Inbound
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Choose Plus or Pro tier. Instant automated bank verification via InstaPay or Telda receipt OCR.
            </p>
            {onOpenPayment && (
              <button
                type="button"
                onClick={onOpenPayment}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                <span>Select Plan & Pay via InstaPay / Telda</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Option B: Redeem School Access Code */}
          <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-left space-y-2.5">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Option 2: School / Class Access Code</h4>
            </div>
            <p className="text-xs text-zinc-400">
              Enrolled through your school or teacher? Enter the classroom code provided by your teacher.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={inlineCode}
                onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                placeholder="e.g. BIO-Y11-S1 or CLS-BIO11-2026"
                className="flex-1 rounded-lg border border-white/[0.08] bg-[#18181b] px-3 py-2 text-xs font-mono font-medium text-amber-300 placeholder-zinc-600 uppercase focus:border-[#FF5B37]/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleInlineRedeem}
                disabled={isRedeeming}
                className="rounded-lg bg-[#222225] border border-white/[0.08] hover:bg-[#FF5B37] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming...' : 'Unlock'}
              </button>
            </div>

            {inlineError && (
              <p className="text-[11px] text-rose-400">{inlineError}</p>
            )}

            <p className="text-[10px] text-zinc-500">
              Demo sample codes: <code className="text-zinc-400">BIO-Y11-S1</code>, <code className="text-zinc-400">MTH-0580-X</code>, <code className="text-zinc-400">SCH-CIE-9988</code>
            </p>
          </div>

          {/* Sign Out Option */}
          <div className="mt-5 flex justify-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#222225] px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out of Account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Not logged in at all (Mandatory Account Gate)
  return (
    <div className="mx-auto max-w-xl py-2 sm:py-12 px-2.5 sm:px-4 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-9 text-center shadow-2xl">
        {/* Brand Logo */}
        <div className="flex justify-center mb-3 sm:mb-5">
          <SimplyLogo size="md" />
        </div>

        <span className="inline-block rounded-md bg-[#FF5B37]/10 px-2.5 py-0.5 text-xs font-medium text-[#FF5B37] border border-[#FF5B37]/20 mb-2">
          Verified Student Account & Subscription Required
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Welcome to Fahemny IGCSE
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          To access {featureName}, past paper mark schemes, worked exam examples, and verified examiner grading, please create an account or sign in with your active subscription.
        </p>

        {/* Value pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-md mx-auto text-left text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#141416] p-2.5">
            <BookOpen className="h-4 w-4 text-[#FF5B37] shrink-0" />
            <span className="text-zinc-300 text-[11px] font-medium">Cambridge & Edexcel Notes</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#141416] p-2.5">
            <GraduationCap className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-zinc-300 text-[11px] font-medium">Step-by-Step Marking</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#141416] p-2.5">
            <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300 text-[11px] font-medium">Official Exam Questions</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account & Join Waitlist</span>
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#222225] px-5 py-2.5 text-xs font-medium text-zinc-200 hover:bg-[#28282c] transition cursor-pointer"
          >
            <LogIn className="h-4 w-4 text-amber-400" />
            <span>Sign In to Account</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-zinc-500">
          Individual subscriptions and school/class licenses include access to all 5 Cambridge & Pearson Edexcel subjects.
        </p>
      </div>
    </div>
  );
};
