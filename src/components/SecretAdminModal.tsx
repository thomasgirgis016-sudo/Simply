import React, { useState } from 'react';
import { ShieldCheck, KeyRound, X, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { SimplyLogo } from './SimplyLogo';
import { verifyAdminPasscode, loginAsMasterAdmin } from '../services/auth';
import { UserAccount } from '../types';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: UserAccount) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passcode.trim()) {
      setError('Please enter the administrative master passcode.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyAdminPasscode(passcode.trim());
      if (isValid) {
        const admin = await loginAsMasterAdmin(passcode.trim());
        onSuccess(admin);
        onClose();
        setPasscode('');
      } else {
        setError('Invalid access code. Access restricted to authorized personnel.');
      }
    } catch {
      setError('Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex justify-center">
            <SimplyLogo size="md" showText={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Staff & Founder Portal</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Administrator Console
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Authorized staff and founder access portal. Enter your security access code below.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span>Staff / Founder Access Code:</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access code (e.g. 2011)..."
                autoFocus
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-rose-400 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying authorization...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Unlock Admin Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
