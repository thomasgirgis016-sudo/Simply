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
  FileText,
  School,
  Users,
  Key,
  Building2,
  GraduationCap
} from 'lucide-react';
import { UserAccount, UserProfile, SubscriptionPlan, BillingCycle } from '../types';
import {
  parseInstaPayReceiptImage,
  reconcileStudentPayment,
  redeemSchoolAccessCode,
  OFFICIAL_INSTAPAY_IPA,
  OFFICIAL_RECEIVER_PHONE,
  PLAN_PRICING
} from '../services/paymentAutomation';
import { getPricingSettings, PricingSettings, getTimeRemaining } from '../services/pricingConfig';
import { SchoolQuestionnaireModal } from './SchoolQuestionnaireModal';
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
  const [modalTab, setModalTab] = useState<'individual' | 'school' | 'redeem'>('individual');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualTxNumber, setManualTxNumber] = useState('');
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSchoolQuestionnaire, setShowSchoolQuestionnaire] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(getPricingSettings);
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(pricingSettings.discountEndsAt));

  React.useEffect(() => {
    const handleUpdate = () => {
      const s = getPricingSettings();
      setPricingSettings(s);
      setTimeLeft(getTimeRemaining(s.discountEndsAt));
    };
    window.addEventListener('simply_pricing_updated', handleUpdate);
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(pricingSettings.discountEndsAt));
    }, 1000);
    return () => {
      window.removeEventListener('simply_pricing_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [pricingSettings.discountEndsAt]);
  const [successResult, setSuccessResult] = useState<{
    txNumber: string;
    amount: number;
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
    proExpiresAt: string;
    cohortName?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isDiscountActive = pricingSettings.discountActive && !timeLeft.isExpired;

  const getPlanDisplayPricing = (planKey: SubscriptionPlan) => {
    const normalized = planKey === 'free' ? 'pro' : planKey;
    const configKey = normalized === 'class' ? 'teacher' : normalized;
    const planConfig = pricingSettings.plans[configKey as 'plus' | 'pro' | 'teacher' | 'school'];
    const baseMonthly = planConfig.basePrice;
    const discountMonthly = planConfig.discountPrice;

    if (billingCycle === 'annual') {
      const baseAnnual = Math.round(baseMonthly * 10);
      const discountAnnual = Math.round(discountMonthly * 8);
      return {
        base: baseAnnual,
        current: isDiscountActive ? discountAnnual : baseAnnual,
        isDiscounted: isDiscountActive
      };
    }

    return {
      base: baseMonthly,
      current: isDiscountActive ? discountMonthly : baseMonthly,
      isDiscounted: isDiscountActive
    };
  };

  const currentPrice = getPlanDisplayPricing(selectedPlan).current;

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
      setErrorMsg('Please upload an InstaPay / Telda screenshot or enter the transaction reference number.');
      return;
    }

    setIsProcessing(true);

    try {
      let txToVerify = manualTxNumber.trim();
      let extractedAmount: number = currentPrice;

      if (previewUrl) {
        setCurrentStepText('1/3 Analyzing receipt with Gemini Vision OCR...');
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
        particleCount: 140,
        spread: 90,
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
        isPro: true,
        plan: grantedPlan,
        billingCycle: grantedCycle,
        proExpiresAt: grantedUntil,
        isTeacher: grantedPlan === 'class' || grantedPlan === 'school'
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the transaction reference and try again.');
    } finally {
      setIsProcessing(false);
      setCurrentStepText('');
    }
  };

  const handleRedeemCode = () => {
    setErrorMsg('');
    if (!schoolCodeInput.trim()) {
      setErrorMsg('Please enter a School or Class access code.');
      return;
    }

    const studentEmail = currentUser?.email || profile.email || 'student@simplyigcse.com';
    const result = redeemSchoolAccessCode(studentEmail, schoolCodeInput.trim());

    if (!result.success) {
      setErrorMsg(result.error || 'Invalid access code. Please check with your teacher.');
      return;
    }

    // Success!
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.6 }
    });

    const grantedUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    setSuccessResult({
      txNumber: `CODE-${schoolCodeInput.trim().toUpperCase()}`,
      amount: 0,
      plan: 'pro',
      billingCycle: 'annual',
      proExpiresAt: grantedUntil,
      cohortName: result.cohortName
    });

    onPaymentSuccess({
      isPro: true,
      plan: 'pro',
      billingCycle: 'annual',
      proExpiresAt: grantedUntil,
      isEnrolledViaSchool: true,
      schoolCode: schoolCodeInput.trim().toUpperCase(),
      schoolName: result.cohortName
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl text-left my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF5E62] to-[#FFA63A] text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white">Unlock Simply IGCSE Access</h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                BDC Live Inbound
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant BDC SMS bank matching via InstaPay & Telda • Or redeem your school code.
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
                {successResult.cohortName ? 'Class Enrolled Successfully!' : 'Subscription Activated!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {successResult.cohortName ? (
                  <>
                    You are now enrolled in <strong className="text-emerald-400">{successResult.cohortName}</strong> with full Pro privileges.
                  </>
                ) : (
                  <>
                    Your payment of <strong className="text-emerald-400">{successResult.amount} EGP</strong> was verified with official Banque Du Caire transaction <code className="bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">#{successResult.txNumber}</code>.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Active Tier:</span>
                <span className="font-bold text-white capitalize">{successResult.plan} ({successResult.billingCycle})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Verification Method:</span>
                <span className="font-bold text-emerald-400">
                  {successResult.cohortName ? 'School / Class Access Code' : 'Banque Du Caire Match'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Access Granted Until:</span>
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
            {/* Promotional Countdown Banner */}
            {isDiscountActive && (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-inner animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <span className="font-black text-amber-300 uppercase tracking-wider text-[11px] mr-2">
                      ⚡ {pricingSettings.promoTitle}
                    </span>
                    <span className="text-[11px] text-slate-300">Limited launch offer — save up to 45% platform-wide!</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-black text-amber-300 bg-slate-950/90 px-3 py-1 rounded-xl border border-amber-500/40 text-[11px] shrink-0 self-end sm:self-auto">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>
                    {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}

            {/* Top Navigation Tabs: Individual, School, Redeem */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setModalTab('individual');
                  if (selectedPlan === 'class' || selectedPlan === 'school') setSelectedPlan('pro');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  modalTab === 'individual'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Individual</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('school');
                  if (selectedPlan === 'plus' || selectedPlan === 'pro') setSelectedPlan('class');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  modalTab === 'school'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <School className="h-3.5 w-3.5" />
                <span>School / Class</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('redeem');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  modalTab === 'redeem'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="h-3.5 w-3.5" />
                <span>Redeem Code</span>
              </button>
            </div>

            {/* TAB 1: INDIVIDUAL PLANS */}
            {modalTab === 'individual' && (
              <div className="space-y-4 animate-fadeIn">
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
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-slate-500 font-mono">
                              {getPlanDisplayPricing('plus').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-white">
                            {getPlanDisplayPricing('plus').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
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
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-slate-500 font-mono">
                              {getPlanDisplayPricing('pro').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-black text-amber-300">
                            {getPlanDisplayPricing('pro').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Full AI power, line-by-line mark grading & speaking</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span><strong>All Plus Features</strong> Included</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>AI Multimodal Step-by-Step Solver</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Official Cambridge 30-Mark ESL Speaking</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Timed Split-Screen Exam Workspace</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Full Flashcard Decks & Spaced Repetition</span>
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
              </div>
            )}

            {/* TAB 2: SCHOOL & TEACHER PLANS */}
            {modalTab === 'school' && (
              <div className="space-y-4 animate-fadeIn">
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
                        Save 75%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plan Cards: Class vs Full School */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Class Plan */}
                  <div
                    onClick={() => setSelectedPlan('class')}
                    className={`rounded-2xl border p-4 cursor-pointer transition select-none flex flex-col justify-between ${
                      selectedPlan === 'class'
                        ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500 shadow-xl'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          Class / Teacher
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-slate-500 font-mono">
                              {getPlanDisplayPricing('class').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-white">
                            {getPlanDisplayPricing('class').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Up to 35 students per classroom cohort</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span><strong>35 Pro Student Seats</strong> Included</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>Teacher Analytics Dashboard</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>Diagnostic Error Heatmap by Topic</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>1-Click Class Remedial Drill Pusher</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>Auto-generated Class Invite Code</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Single Teacher / Set</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'class' ? 'bg-indigo-600 border-indigo-400' : 'border-slate-700'
                      }`}>
                        {selectedPlan === 'class' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Full School License */}
                  <div
                    onClick={() => setSelectedPlan('school')}
                    className={`rounded-2xl border p-4 cursor-pointer transition select-none flex flex-col justify-between relative overflow-hidden ${
                      selectedPlan === 'school'
                        ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/20 ring-2 ring-amber-500 shadow-xl'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 px-3 py-0.5 text-[9px] font-black uppercase text-slate-950 tracking-wider rounded-bl-xl shadow-md">
                      Institutional
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-amber-400" />
                          Full School License
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-slate-500 font-mono">
                              {getPlanDisplayPricing('school').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-black text-amber-300">
                            {getPlanDisplayPricing('school').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Multi-class management for entire school departments</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span><strong>Unlimited Students & Teachers</strong></span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Multi-Department Year 10 & 11 Sets</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>School Domain Auto-Enrollment</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Exportable Diagnostic Grade Reports</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Dedicated Cambridge / Edexcel Consultant</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-amber-300 font-semibold">Department Wide</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'school' ? 'bg-amber-500 border-amber-300' : 'border-slate-700'
                      }`}>
                        {selectedPlan === 'school' && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Questionnaire Callout */}
                <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-amber-400" />
                      <span>Enrolling an Entire School, Department or Multi-Teacher Cohort?</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Complete our 2-minute school onboarding questionnaire for custom invoices, bank transfers & bulk class seats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchoolQuestionnaire(true)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <span>School Questionnaire</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: REDEEM CODE */}
            {modalTab === 'redeem' ? (
              <div className="space-y-4 py-2 animate-fadeIn">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Enter Your School or Class Access Code</h4>
                      <p className="text-xs text-slate-400">
                        Provided by your teacher or school department to grant you instant Pro access.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={schoolCodeInput}
                      onChange={(e) => setSchoolCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. BIO-Y11-S1 or CLS-BIO11-2026"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 px-4 text-sm font-mono font-bold text-amber-300 placeholder-slate-600 tracking-wider focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Sample codes: <code className="text-slate-400">BIO-Y11-S1</code>, <code className="text-slate-400">MTH-0580-X</code>, <code className="text-slate-400">CHM-0620-Y10</code>, <code className="text-slate-400">SCH-CIE-9988</code>
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRedeemCode}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>Redeem Code & Unlock Pro</span>
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT INSTRUCTIONS & VERIFICATION (for Individual & School tabs) */
              <div className="space-y-4">
                {/* Step 1: Transfer Destination Info Box */}
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Step 1: Transfer {currentPrice} EGP via InstaPay or Telda
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
                        <div className="font-mono font-bold text-white">{pricingSettings.paymentDetails.instapayIpa || OFFICIAL_INSTAPAY_IPA}</div>
                      </div>
                      <button
                        onClick={() => handleCopy(pricingSettings.paymentDetails.instapayIpa || OFFICIAL_INSTAPAY_IPA, 'ipa')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Copy IPA"
                      >
                        {copiedField === 'ipa' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Mobile Phone / BDC Account */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold">BDC Account / Telda:</div>
                        <div className="font-mono font-bold text-white">{pricingSettings.paymentDetails.bdcAccountNumber || OFFICIAL_RECEIVER_PHONE} ({pricingSettings.paymentDetails.teldaTag || 'Telda'})</div>
                      </div>
                      <button
                        onClick={() => handleCopy(pricingSettings.paymentDetails.bdcAccountNumber || OFFICIAL_RECEIVER_PHONE, 'phone')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Copy Account"
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
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
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
                          Tap or drag InstaPay / Telda confirmation screenshot here
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
                      Or enter the Transaction Reference Number directly:
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
                        <span>Verify & Unlock {selectedPlan.toUpperCase()} Access</span>
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
        )}
      </div>

      <SchoolQuestionnaireModal
        isOpen={showSchoolQuestionnaire}
        onClose={() => setShowSchoolQuestionnaire(false)}
      />
    </div>
  );
};
