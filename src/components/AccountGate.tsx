import React, { useState } from 'react';
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
  AlertTriangle,
  Crown
} from 'lucide-react';
import { UserAccount } from '../types';
import { SimplyLogo } from './SimplyLogo';
import { hasActiveSubscription, loginWithAccessCode } from '../services/auth';
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
  featureName = 'Simply IGCSE study tools',
}) => {
  const [inlineCode, setInlineCode] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isSwitchingFounder, setIsSwitchingFounder] = useState(false);

  const handleSwitchToFounder = async () => {
    setIsSwitchingFounder(true);
    try {
      const res = await loginWithAccessCode('2011');
      if (res.success && res.user) {
        if (onRefreshStatus) onRefreshStatus();
        window.location.reload();
      } else {
        if (onOpenAuth) onOpenAuth('signin');
      }
    } catch (e) {
      console.error(e);
      if (onOpenAuth) onOpenAuth('signin');
    } finally {
      setIsSwitchingFounder(false);
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 p-4 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-6">
            <SimplyLogo size="md" />
          </div>

          {/* Pending Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold text-amber-300 border border-amber-500/30 mb-2 sm:mb-4">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-amber-400" />
            <span>Priority Waitlist • Pending Approval</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
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

          {/* Inline School Code Entry */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Have a School / Class Invite Code?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inlineCode}
                onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                placeholder="e.g. BIO-Y11-S1 or CLS-BIO11-2026"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder-slate-600 uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleInlineRedeem}
                disabled={isRedeeming}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
            {inlineError && (
              <p className="text-[11px] text-rose-400">{inlineError}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
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

          {/* Quick Founder Switch Portal */}
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900/90 p-4 text-left shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Are you Thomas / Platform Founder?</span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-black text-amber-300 border border-amber-500/30">Code 2011</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Switch to the Founder Console now to review and approve this pending student account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwitchToFounder}
                disabled={isSwitchingFounder}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer shrink-0 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                <Crown className="h-4 w-4" />
                <span>{isSwitchingFounder ? 'Switching...' : 'Switch to Founder (2011)'}</span>
              </button>
            </div>
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 p-4 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-lg mb-3 sm:mb-6">
            <ShieldAlert className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          <span className="inline-block rounded-full bg-rose-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-rose-300 border border-rose-500/30 mb-2 sm:mb-3">
            Access Suspended
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Account Inactive
          </h2>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300">
            Access for <strong className="text-white">{currentUser.email}</strong> is currently paused. Please contact school administration or support.
          </p>

          <div className="mt-4 sm:mt-6 flex justify-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 p-4 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-6">
            <SimplyLogo size="md" />
          </div>

          <span className="inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold text-amber-300 border border-amber-500/30 mb-2 sm:mb-3">
            Active Paid Subscription Required
          </span>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Unlock Full Access
          </h2>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Hello, <strong className="text-white">{currentUser.name}</strong>! Access to {featureName} requires an active individual subscription or an enrolled school/class seat.
          </p>

          {/* Option A: InstaPay / Telda Checkout */}
          <div className="mt-4 sm:mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 sm:p-5 text-left space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Option 1: Individual Student Plan</h4>
              </div>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Instant BDC Inbound
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Choose Plus or Pro tier. Instant automated bank verification via InstaPay or Telda receipt OCR.
            </p>
            {onOpenPayment && (
              <button
                type="button"
                onClick={onOpenPayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 sm:py-3 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition cursor-pointer"
              >
                <span>Select Plan & Pay via InstaPay / Telda</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Option B: Redeem School Access Code */}
          <div className="mt-3 sm:mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 sm:p-5 text-left space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-amber-400" />
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Option 2: School / Class Access Code</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Enrolled through your school or teacher? Enter the classroom code provided by your teacher.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={inlineCode}
                onChange={(e) => setInlineCode(e.target.value.toUpperCase())}
                placeholder="e.g. BIO-Y11-S1 or CLS-BIO11-2026"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder-slate-600 uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleInlineRedeem}
                disabled={isRedeeming}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-5 py-2 text-xs font-black text-slate-950 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming...' : 'Unlock'}
              </button>
            </div>

            {inlineError && (
              <p className="text-[11px] text-rose-400">{inlineError}</p>
            )}

            <p className="text-[10px] text-slate-500">
              Demo sample codes: <code className="text-slate-400">BIO-Y11-S1</code>, <code className="text-slate-400">MTH-0580-X</code>, <code className="text-slate-400">SCH-CIE-9988</code>
            </p>
          </div>

          {/* Sign Out Option */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[#FF5E62]/10 blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex justify-center mb-3 sm:mb-6">
          <SimplyLogo size="md" />
        </div>

        <span className="inline-block rounded-full bg-[#FF5E62]/15 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold text-[#FFA63A] border border-[#FF5E62]/30 mb-2 sm:mb-3">
          Verified Student Account & Subscription Required
        </span>

        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to Simply IGCSE
        </h2>

        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          To access {featureName}, past paper mark schemes, worked exam examples, and verified examiner grading, please create an account or sign in with your active subscription.
        </p>

        {/* Value pills */}
        <div className="mt-3 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2.5 max-w-md mx-auto text-left text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2 sm:p-2.5">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 text-[10px] sm:text-[11px] font-medium">Cambridge & Edexcel Notes</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2 sm:p-2.5">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FFA63A] shrink-0" />
            <span className="text-slate-300 text-[10px] sm:text-[11px] font-medium">Step-by-Step Examiner Marking</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2 sm:p-2.5">
            <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 text-[10px] sm:text-[11px] font-medium">Official Exam Questions</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account & Join Waitlist</span>
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <LogIn className="h-4 w-4 text-amber-400" />
            <span>Sign In to Account</span>
          </button>
        </div>

        <p className="mt-3 sm:mt-5 text-[10px] sm:text-[11px] text-slate-500">
          Individual subscriptions and school/class licenses include access to all 5 Cambridge & Pearson Edexcel subjects.
        </p>
      </div>
    </div>
  );
};
