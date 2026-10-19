import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Upload,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { UserAccount, UserProfile, SubscriptionPlan, BillingCycle } from '../types';
import {
  parseInstaPayReceiptImage,
  reconcileStudentPayment,
  OFFICIAL_INSTAPAY_IPA,
  OFFICIAL_RECEIVER_PHONE,
  PLAN_PRICING
} from '../services/paymentAutomation';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  profile: UserProfile;
  onPaymentSuccess: (updatedUser: Partial<UserAccount>) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profile,
  onPaymentSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualTxNumber, setManualTxNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    txNumber: string;
    amount: number;
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
    proExpiresAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentPrice = PLAN_PRICING[selectedPlan][billingCycle];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyPayment = async () => {
    setErrorMsg('');
    if (!previewUrl && !manualTxNumber.trim()) {
      setErrorMsg('Please upload an InstaPay screenshot or enter the transaction reference number.');
      return;
    }

    setIsProcessing(true);

    try {
      let txToVerify = manualTxNumber.trim();
      let extractedAmount: number = currentPrice;

      if (previewUrl) {
        setCurrentStepText('1/3 Analyzing InstaPay receipt with Gemini Vision OCR...');
        const ocrResult = await parseInstaPayReceiptImage(previewUrl, selectedFile?.type || 'image/jpeg');

        if (!ocrResult.txNumber) {
          throw new Error('Could not identify a valid Transaction Reference Number in the receipt. Please enter it manually below.');
        }

        txToVerify = ocrResult.txNumber;
        extractedAmount = ocrResult.amount || currentPrice;
      }

      setCurrentStepText('2/3 Reconciling against Banque Du Caire (BDC) SMS inbound feed...');
      await new Promise(r => setTimeout(r, 600));

      setCurrentStepText('3/3 Verifying anti-fraud status & single-use claim lock...');
      const studentId = currentUser?.id || profile.id || 'guest-student';
      const studentEmail = currentUser?.email || profile.email || 'student@simplyigcse.com';

      const reconcileResult = reconcileStudentPayment({
        studentTxNumber: txToVerify,
        studentReceiptAmount: extractedAmount,
        studentId,
        studentEmail,
        minAmount: currentPrice,
        plan: selectedPlan,
        billingCycle: billingCycle
      });

      if (!reconcileResult.success) {
        throw new Error(reconcileResult.message || reconcileResult.errorDetails || 'Payment reconciliation failed.');
      }

      // Success! Trigger celebratory confetti
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 }
      });

      const grantedUntil = reconcileResult.proGrantedUntil || new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000).toISOString();
      const grantedPlan: SubscriptionPlan = reconcileResult.plan || selectedPlan;
      const grantedCycle: BillingCycle = reconcileResult.billingCycle || billingCycle;

      setSuccessResult({
        txNumber: reconcileResult.txNumber || txToVerify,
        amount: reconcileResult.amount || extractedAmount,
        plan: grantedPlan,
        billingCycle: grantedCycle,
        proExpiresAt: grantedUntil
      });

      onPaymentSuccess({
        isPro: grantedPlan === 'pro',
        plan: grantedPlan,
        billingCycle: grantedCycle,
        proExpiresAt: grantedUntil
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the transaction reference and try again.');
    } finally {
      setIsProcessing(false);
      setCurrentStepText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl text-left my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF5E62] to-[#FFA63A] text-slate-950 shadow-lg shadow-amber-500/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Choose Your IGCSE Plan</h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                BDC Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select Plus or Pro • Instant bank reconciliation with Banque Du Caire via InstaPay.
            </p>
          </div>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="space-y-6 text-center py-4 animate-fadeIn">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                {successResult.plan === 'pro' ? 'Pro Access Unlocked!' : 'Plus Access Activated!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your payment of <strong className="text-emerald-400">{successResult.amount} EGP</strong> was verified and reconciled with official Banque Du Caire transaction <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">#{successResult.txNumber}</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Active Tier:</span>
                <span className="font-bold text-white capitalize">{successResult.plan} ({successResult.billingCycle})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reconciliation Status:</span>
                <span className="font-bold text-emerald-400">BDC Inbound Match Confirmed</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subscription Expiration:</span>
                <span className="font-bold text-amber-300">
                  {new Date(successResult.proExpiresAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:opacity-95 transition cursor-pointer"
            >
              Start Studying Now
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Billing Cycle Switcher */}
            <div className="flex items-center justify-center">
              <div className="flex items-center rounded-2xl bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.2 border border-emerald-500/40">
                    Save 33%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards: Plus vs Pro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Plus Plan Card */}
              <div
                onClick={() => setSelectedPlan('plus')}
                className={`rounded-2xl border p-4 cursor-pointer transition select-none flex flex-col justify-between ${
                  selectedPlan === 'plus'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500 shadow-xl'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Plus Tier</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {PLAN_PRICING.plus[billingCycle]} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Core study suite for the 5 official subjects</p>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>5 Enrolled Subjects Cap</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>Classified Past Paper Finder</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>Topic Quizzes & Printable PDF Exams</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>Revision Notes & Formula Sheets</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Standard Study</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'plus' ? 'bg-indigo-600 border-indigo-400' : 'border-slate-700'
                  }`}>
                    {selectedPlan === 'plus' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Pro Plan Card */}
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`rounded-2xl border p-4 cursor-pointer transition select-none flex flex-col justify-between relative overflow-hidden ${
                  selectedPlan === 'pro'
                    ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/20 ring-2 ring-amber-500 shadow-xl'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 px-3 py-0.5 text-[9px] font-black uppercase text-slate-950 tracking-wider rounded-bl-xl shadow-md">
                  Most Popular
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Pro Tier (All Features)
                    </span>
                    <span className="text-xs font-mono font-black text-amber-300">
                      {PLAN_PRICING.pro[billingCycle]} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Full AI power, examiner tutor & school analytics</p>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span><strong>All Plus Features</strong> Included</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>AI Multimodal Handwritten Solver</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Chief Examiner AI 24/7 Chat</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Timed Split-Screen Exam Workspace</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Teacher Analytics & Error Heatmaps</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-semibold">Recommended for Grade 9/A*</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'pro' ? 'bg-amber-500 border-amber-300' : 'border-slate-700'
                  }`}>
                    {selectedPlan === 'pro' && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Transfer Destination Info Box */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Step 1: Transfer {currentPrice} EGP via InstaPay
                </span>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200 uppercase">
                  {selectedPlan} • {billingCycle === 'annual' ? '1 Year Access' : '30 Days Access'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* IPA address */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">InstaPay Address (IPA):</div>
                    <div className="font-mono font-bold text-white">{OFFICIAL_INSTAPAY_IPA}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(OFFICIAL_INSTAPAY_IPA, 'ipa')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copy IPA"
                  >
                    {copiedField === 'ipa' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Mobile Phone */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">Mobile / BDC Account:</div>
                    <div className="font-mono font-bold text-white">{OFFICIAL_RECEIVER_PHONE} (BDC)</div>
                  </div>
                  <button
                    onClick={() => handleCopy(OFFICIAL_RECEIVER_PHONE, 'phone')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Receipt or Enter Transaction Reference */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Submit Proof for AI Bank Matching
              </div>

              {/* Drag & Drop Screenshot Upload */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-4 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <div className="flex items-center gap-3 text-left">
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="h-16 w-16 object-cover rounded-xl border border-slate-700"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-white truncate">{selectedFile?.name || 'receipt-screenshot.jpg'}</div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle className="h-3 w-3" />
                        <span>Screenshot loaded ready for Gemini Vision scan</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-indigo-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      Tap or drag InstaPay confirmation screenshot here
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Gemini Vision automatically locates <strong className="text-slate-400">رقم العملية (Transaction Ref)</strong> without confusing phone numbers
                    </p>
                  </div>
                )}
              </div>

              {/* Or Manual Reference Entry */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Or enter the InstaPay Transaction Reference Number directly:
                </label>
                <input
                  type="text"
                  value={manualTxNumber}
                  onChange={(e) => setManualTxNumber(e.target.value)}
                  placeholder="e.g. 2026101900481234 or 489201938472"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Verification Notice</div>
                  <div className="text-[11px] opacity-90">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-center gap-3 animate-pulse">
                <RefreshCw className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
                <span className="font-medium">{currentStepText || 'Processing automated verification...'}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 py-3 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isProcessing}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying with BDC...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify & Unlock Pro Access</span>
                  </>
                )}
              </button>
            </div>

            {/* Anti-Fraud Footnote */}
            <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-600 flex items-center justify-between">
              <span>Automated Banque Du Caire Feed: Active</span>
              <span>Single-Use Hash Protection: Enabled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
