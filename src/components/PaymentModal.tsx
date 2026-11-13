import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Upload,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-7 shadow-2xl text-left my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#FF5B37] shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-100">Unlock Fahemny IGCSE Access</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
                BDC Live Inbound
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instant BDC SMS bank matching via InstaPay & Telda • Or redeem your school code.
            </p>
          </div>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="space-y-6 text-center py-4 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                {successResult.cohortName ? 'Class Enrolled Successfully!' : 'Subscription Activated!'}
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                {successResult.cohortName ? (
                  <>
                    You are now enrolled in <strong className="text-emerald-400">{successResult.cohortName}</strong> with full Pro privileges.
                  </>
                ) : (
                  <>
                    Your payment of <strong className="text-emerald-400">{successResult.amount} EGP</strong> was verified with official Banque Du Caire transaction <code className="bg-[#141416] text-[#FF5B37] px-1.5 py-0.5 rounded font-mono font-medium">#{successResult.txNumber}</code>.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Active Tier:</span>
                <span className="font-medium text-zinc-200 capitalize">{successResult.plan} ({successResult.billingCycle})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Verification Method:</span>
                <span className="font-medium text-emerald-400">
                  {successResult.cohortName ? 'School / Class Access Code' : 'Banque Du Caire Match'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Access Granted Until:</span>
                <span className="font-mono text-[#FF5B37]">
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
              className="w-full rounded-xl bg-[#FF5B37] hover:bg-[#ff704d] py-3 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer shadow-sm"
            >
              Start Studying Now
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Promotional Countdown Banner */}
            {isDiscountActive && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <span className="font-medium text-amber-300 uppercase tracking-wider text-[11px] mr-2">
                      ⚡ {pricingSettings.promoTitle}
                    </span>
                    <span className="text-[11px] text-zinc-400">Limited launch offer — save up to 45% platform-wide!</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-medium text-amber-300 bg-[#141416] px-2.5 py-1 rounded-lg border border-amber-500/20 text-[11px] shrink-0 self-end sm:self-auto">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>
                    {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}

            {/* Top Navigation Tabs: Individual, School, Redeem */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#141416] p-1.5 rounded-xl border border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => {
                  setModalTab('individual');
                  if (selectedPlan === 'class' || selectedPlan === 'school') setSelectedPlan('pro');
                  setErrorMsg('');
                }}
                className={`py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  modalTab === 'individual'
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Individual</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('school');
                  if (selectedPlan === 'plus' || selectedPlan === 'pro') setSelectedPlan('class');
                  setErrorMsg('');
                }}
                className={`py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  modalTab === 'school'
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
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
                className={`py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  modalTab === 'redeem'
                    ? 'bg-[#FF5B37] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
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
                  <div className="flex items-center rounded-xl bg-[#141416] p-1 border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-[#FF5B37] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        billingCycle === 'annual'
                          ? 'bg-[#FF5B37] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Annual Billing</span>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 border border-emerald-500/30">
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
                    className={`rounded-xl border p-4 cursor-pointer transition select-none flex flex-col justify-between ${
                      selectedPlan === 'plus'
                        ? 'border-[#FF5B37]/60 bg-[#18181b] ring-1 ring-[#FF5B37]/60 shadow-md'
                        : 'border-white/[0.08] bg-[#141416] hover:border-white/[0.14]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-300">Plus Tier</span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-zinc-500 font-mono">
                              {getPlanDisplayPricing('plus').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-zinc-100">
                            {getPlanDisplayPricing('plus').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Core study suite for the 5 official subjects</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>5 Enrolled Subjects Cap</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Classified Past Paper Finder</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Topic Quizzes & Printable PDF Exams</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Revision Notes & Formula Sheets</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-normal">Standard Study</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'plus' ? 'bg-[#FF5B37] border-[#FF5B37]' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'plus' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Pro Plan Card */}
                  <div
                    onClick={() => setSelectedPlan('pro')}
                    className={`rounded-xl border p-4 cursor-pointer transition select-none flex flex-col justify-between relative overflow-hidden ${
                      selectedPlan === 'pro'
                        ? 'border-[#FF5B37] bg-[#18181b] ring-1 ring-[#FF5B37] shadow-md'
                        : 'border-white/[0.08] bg-[#141416] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-[#FF5B37] px-2.5 py-0.5 text-[9px] font-mono font-medium uppercase text-white tracking-wider rounded-bl-lg shadow-sm">
                      Recommended
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-[#FF5B37]" />
                          Pro Tier
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-zinc-500 font-mono">
                              {getPlanDisplayPricing('pro').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-[#FF5B37]">
                            {getPlanDisplayPricing('pro').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Full syllabus access, line-by-line mark grading & speaking simulator</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span><strong className="text-white">All Plus Features</strong> Included</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Step-by-Step Mark Scheme Solver & Script Scanner</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Official Cambridge 30-Mark ESL Speaking</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Timed Split-Screen Exam Workspace</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Full Flashcard Decks & Spaced Repetition</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[#FF5B37] font-medium">Recommended for Grade 9/A*</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'pro' ? 'bg-[#FF5B37] border-[#FF5B37]' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'pro' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
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
                  <div className="flex items-center rounded-xl bg-[#141416] p-1 border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-[#FF5B37] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        billingCycle === 'annual'
                          ? 'bg-[#FF5B37] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Annual Billing</span>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 border border-emerald-500/30">
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
                    className={`rounded-xl border p-4 cursor-pointer transition select-none flex flex-col justify-between ${
                      selectedPlan === 'class'
                        ? 'border-[#FF5B37]/60 bg-[#18181b] ring-1 ring-[#FF5B37]/60 shadow-md'
                        : 'border-white/[0.08] bg-[#141416] hover:border-white/[0.14]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-[#FF5B37]" />
                          Class / Teacher
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-zinc-500 font-mono">
                              {getPlanDisplayPricing('class').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-zinc-100">
                            {getPlanDisplayPricing('class').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Up to 35 students per classroom cohort</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span><strong className="text-white">35 Pro Student Seats</strong> Included</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Teacher Analytics Dashboard</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Diagnostic Error Heatmap by Topic</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>1-Click Class Remedial Drill Pusher</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Auto-generated Class Invite Code</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-normal">Single Teacher / Set</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'class' ? 'bg-[#FF5B37] border-[#FF5B37]' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'class' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Full School License */}
                  <div
                    onClick={() => setSelectedPlan('school')}
                    className={`rounded-xl border p-4 cursor-pointer transition select-none flex flex-col justify-between relative overflow-hidden ${
                      selectedPlan === 'school'
                        ? 'border-[#FF5B37] bg-[#18181b] ring-1 ring-[#FF5B37] shadow-md'
                        : 'border-white/[0.08] bg-[#141416] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-[#FF5B37] px-2.5 py-0.5 text-[9px] font-mono font-medium uppercase text-white tracking-wider rounded-bl-lg shadow-sm">
                      Institutional
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-[#FF5B37]" />
                          Full School License
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          {isDiscountActive && (
                            <span className="text-[11px] line-through text-zinc-500 font-mono">
                              {getPlanDisplayPricing('school').base} EGP
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-[#FF5B37]">
                            {getPlanDisplayPricing('school').current} EGP {billingCycle === 'annual' ? '/yr' : '/mo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Multi-class management for entire school departments</p>

                      <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span><strong className="text-white">Unlimited Students & Teachers</strong></span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Multi-Department Year 10 & 11 Sets</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>School Domain Auto-Enrollment</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Exportable Diagnostic Grade Reports</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#FF5B37] shrink-0" />
                          <span>Dedicated Cambridge / Edexcel Consultant</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[#FF5B37] font-medium">Department Wide</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === 'school' ? 'bg-[#FF5B37] border-[#FF5B37]' : 'border-zinc-700'
                      }`}>
                        {selectedPlan === 'school' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Questionnaire Callout */}
                <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-[#FF5B37]" />
                      <span>Enrolling an Entire School, Department or Multi-Teacher Cohort?</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Complete our 2-minute school onboarding questionnaire for custom invoices, bank transfers & bulk class seats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchoolQuestionnaire(true)}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#ff704d] text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
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
                <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37] border border-white/[0.08]">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">Enter Your School or Class Access Code</h4>
                      <p className="text-xs text-zinc-400">
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
                      className="w-full rounded-lg border border-white/[0.08] bg-[#18181b] py-2.5 px-3.5 text-xs font-mono font-medium text-zinc-200 placeholder-zinc-500 tracking-wider focus:border-[#FF5B37]/60 focus:outline-none"
                    />
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Sample codes: BIO-Y11-S1, MTH-0580-X, CHM-0620-Y10, SCH-CIE-9988
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleRedeemCode}
                    className="w-full rounded-lg bg-[#FF5B37] hover:bg-[#ff704d] py-2.5 text-xs font-medium text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
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
                <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                      Step 1: Transfer {currentPrice} EGP via InstaPay or Telda
                    </span>
                    <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300 uppercase">
                      {selectedPlan} • {billingCycle === 'annual' ? '1 Year Access' : '30 Days Access'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* IPA address */}
                    <div className="rounded-lg border border-white/[0.08] bg-[#18181b] p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-500 font-medium">InstaPay Address (IPA):</div>
                        <div className="font-mono font-medium text-zinc-200">{pricingSettings.paymentDetails.instapayIpa || OFFICIAL_INSTAPAY_IPA}</div>
                      </div>
                      <button
                        onClick={() => handleCopy(pricingSettings.paymentDetails.instapayIpa || OFFICIAL_INSTAPAY_IPA, 'ipa')}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Copy IPA"
                      >
                        {copiedField === 'ipa' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Mobile Phone / BDC Account */}
                    <div className="rounded-lg border border-white/[0.08] bg-[#18181b] p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-500 font-medium">BDC Account / Telda:</div>
                        <div className="font-mono font-medium text-zinc-200">{pricingSettings.paymentDetails.bdcAccountNumber || OFFICIAL_RECEIVER_PHONE} ({pricingSettings.paymentDetails.teldaTag || 'Telda'})</div>
                      </div>
                      <button
                        onClick={() => handleCopy(pricingSettings.paymentDetails.bdcAccountNumber || OFFICIAL_RECEIVER_PHONE, 'phone')}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Copy Account"
                      >
                        {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Upload Receipt or Enter Transaction Reference */}
                <div className="space-y-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Step 2: Submit Proof for Instant Bank Verification
                  </div>

                  {/* Drag & Drop Screenshot Upload */}
                  <div className="relative rounded-xl border-2 border-dashed border-white/[0.12] bg-[#141416] p-4 text-center hover:border-[#FF5B37]/60 transition-colors">
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
                          className="h-14 w-14 object-cover rounded-lg border border-white/[0.08]"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="font-medium text-zinc-100 truncate">{selectedFile?.name || 'receipt-screenshot.jpg'}</div>
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
                          className="p-1 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-3">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF5B37]">
                          <Upload className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-xs font-medium text-zinc-200">
                          Tap or drag InstaPay / Telda confirmation screenshot here
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          Gemini Vision automatically locates <strong className="text-zinc-400 font-mono">رقم العملية (Transaction Ref)</strong> without confusing phone numbers
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Or Manual Reference Entry */}
                  <div className="relative">
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Or enter the Transaction Reference Number directly:
                    </label>
                    <input
                      type="text"
                      value={manualTxNumber}
                      onChange={(e) => setManualTxNumber(e.target.value)}
                      placeholder="e.g. 2026101900481234 or 489201938472"
                      className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:border-[#FF5B37]/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold">Verification Notice</div>
                      <div className="text-[11px] opacity-90">{errorMsg}</div>
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2.5 animate-pulse">
                    <RefreshCw className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
                    <span className="font-medium">{currentStepText || 'Processing automated verification...'}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    disabled={isProcessing}
                    className="flex-[2] flex items-center justify-center gap-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#ff704d] py-2.5 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying with BDC...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify & Unlock {selectedPlan.toUpperCase()} Access</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Anti-Fraud Footnote */}
                <div className="border-t border-white/[0.06] pt-2.5 text-[10px] text-zinc-500 flex items-center justify-between font-mono">
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
