import React, { useState } from 'react';
import {
  X,
  School,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Smartphone,
  Copy,
  GraduationCap
} from 'lucide-react';
import { getPricingSettings } from '../services/pricingConfig';
import confetti from 'canvas-confetti';

export interface SchoolQuestionnaireSubmission {
  id: string;
  role: 'principal' | 'teacher' | 'tutor';
  fullName: string;
  workEmail: string;
  whatsappPhone: string;
  schoolName: string;
  cityCountry: string;
  examBoards: 'cie' | 'edexcel' | 'both';
  selectedSubjects: string[];
  yearGroups: string[];
  cohortSize: 'up_to_35' | '36_100' | '100_300' | '300_plus';
  recommendedPlan: 'class' | 'school';
  recommendedPriceEGP: number;
  submittedAt: string;
  status: 'pending' | 'contacted' | 'activated';
}

const STORAGE_KEY = 'simply_school_enquiries';

export function getSchoolSubmissions(): SchoolQuestionnaireSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchoolSubmission(submission: SchoolQuestionnaireSubmission) {
  try {
    const current = getSchoolSubmissions();
    const updated = [submission, ...current.filter(s => s.id !== submission.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('simply_school_enquiry_submitted'));
  } catch (err) {
    console.error('Failed to save school submission:', err);
  }
}

export function updateSchoolSubmissionStatus(id: string, status: 'pending' | 'contacted' | 'activated') {
  try {
    const current = getSchoolSubmissions();
    const updated = current.map(s => s.id === id ? { ...s, status } : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('simply_school_enquiry_submitted'));
  } catch (err) {
    console.error('Failed to update submission status:', err);
  }
}

export function resetSchoolSubmissions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('simply_school_enquiry_submitted'));
  } catch (err) {
    console.error('Failed to reset submissions:', err);
  }
}

interface SchoolQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (submission: SchoolQuestionnaireSubmission) => void;
}

const AVAILABLE_SUBJECTS = [
  'Mathematics (0580)',
  'Physics (0625)',
  'Chemistry (0620)',
  'Biology (0610)',
  'English as a Second Language (0510)',
  'Computer Science (0478)',
  'Economics (0455)',
  'Accounting (0452)',
  'Business Studies (0450)',
  'History (0470)'
];

const AVAILABLE_YEARS = ['Year 9', 'Year 10', 'Year 11', 'Year 12 (AS)', 'Year 13 (A2)'];

export const SchoolQuestionnaireModal: React.FC<SchoolQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [role, setRole] = useState<'principal' | 'teacher' | 'tutor'>('teacher');
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [cityCountry, setCityCountry] = useState('Cairo, Egypt');
  const [examBoards, setExamBoards] = useState<'cie' | 'edexcel' | 'both'>('cie');

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics (0580)', 'Physics (0625)']);
  const [yearGroups, setYearGroups] = useState<string[]>(['Year 10', 'Year 11']);
  const [cohortSize, setCohortSize] = useState<'up_to_35' | '36_100' | '100_300' | '300_plus'>('up_to_35');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const pricing = getPricingSettings();
  const isClassPlan = cohortSize === 'up_to_35';
  const recommendedPlan: 'class' | 'school' = isClassPlan ? 'class' : 'school';
  const basePrice = isClassPlan ? pricing.plans.teacher.basePrice : pricing.plans.school.basePrice;
  const discountPrice = isClassPlan ? pricing.plans.teacher.discountPrice : pricing.plans.school.discountPrice;
  const effectivePrice = pricing.discountActive ? discountPrice : basePrice;

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleYearGroup = (yr: string) => {
    setYearGroups(prev =>
      prev.includes(yr) ? prev.filter(y => y !== yr) : [...prev, yr]
    );
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = () => {
    const submission: SchoolQuestionnaireSubmission = {
      id: `sch-${Date.now()}`,
      role,
      fullName: fullName.trim() || 'Educator',
      workEmail: workEmail.trim() || 'educator@school.edu.eg',
      whatsappPhone: whatsappPhone.trim() || '01000000000',
      schoolName: schoolName.trim() || 'International School',
      cityCountry: cityCountry.trim() || 'Cairo, Egypt',
      examBoards,
      selectedSubjects,
      yearGroups,
      cohortSize,
      recommendedPlan,
      recommendedPriceEGP: effectivePrice,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    saveSchoolSubmission(submission);
    setIsSubmitted(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (onSuccess) onSuccess(submission);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">School & Teacher Questionnaire</h2>
              <p className="text-xs text-slate-400">Step {step} of 4: Fast-track classroom & department onboarding</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="py-4">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-400 mb-1.5">
            <span className={step >= 1 ? 'text-amber-400' : ''}>1. About You</span>
            <span className={step >= 2 ? 'text-amber-400' : ''}>2. School Details</span>
            <span className={step >= 3 ? 'text-amber-400' : ''}>3. Cohort & Scope</span>
            <span className={step >= 4 ? 'text-amber-400' : ''}>4. Recommendation</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-[300px]">
          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">What is your primary role?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      role === 'teacher'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs block">Subject Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('principal')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      role === 'principal'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                    <span className="text-xs block">Principal / HOD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tutor')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      role === 'tutor'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                    <span className="text-xs block">Private IGCSE Tutor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Mansour"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Work / School Email</label>
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="s.mansour@cairoschool.edu.eg"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCHOOL DETAILS */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">School, Center, or Institution Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Cairo British International School"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">City / Country</label>
                <input
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder="e.g. New Cairo, Egypt"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Exam Boards Delivered</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamBoards('cie')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      examBoards === 'cie'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    Cambridge (CIE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamBoards('edexcel')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      examBoards === 'edexcel'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    Pearson Edexcel
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamBoards('both')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      examBoards === 'both'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    Both Syllabuses
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUBJECTS & COHORT SIZE */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Subjects Taught (Select all that apply)</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1">
                  {AVAILABLE_SUBJECTS.map((sub) => {
                    const isSel = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          isSel
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {isSel && <Check className="h-3 w-3" />}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Year Groups</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_YEARS.map((yr) => {
                    const isSel = yearGroups.includes(yr);
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => toggleYearGroup(yr)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          isSel
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Estimated Total Students</label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { id: 'up_to_35', label: 'Up to 35', sub: 'Class Tier' },
                    { id: '36_100', label: '36–100', sub: 'Dept Tier' },
                    { id: '100_300', label: '100–300', sub: 'School Tier' },
                    { id: '300_plus', label: '300+', sub: 'Campus Tier' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCohortSize(tier.id as any)}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                        cohortSize === tier.id
                          ? 'border-amber-500 bg-amber-500/15 text-white font-bold ring-1 ring-amber-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{tier.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tier.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INSTANT RECOMMENDATION & CHECKOUT */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Recommendation Card */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Recommended Plan for {schoolName || 'Your School'}
                    </span>
                  </div>
                  {pricing.discountActive && (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-bold">
                      Launch Discount Applied
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-xl font-black text-white">
                    {isClassPlan ? 'Class / Teacher License (up to 35 students)' : 'Full School License (Unlimited)'}
                  </h3>
                  <div className="text-right">
                    {pricing.discountActive && (
                      <span className="text-xs text-slate-500 line-through mr-2 font-mono">
                        {basePrice} EGP
                      </span>
                    )}
                    <span className="text-2xl font-black text-amber-300 font-mono">
                      {effectivePrice} EGP
                    </span>
                    <span className="text-[10px] text-slate-400 block">per month</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2">
                  Includes unique Class Access Code generator, Teacher Error Heatmap, 1-Click Remedial Quiz push, and full Pro access for all enrolled students.
                </p>
              </div>

              {/* Instant InstaPay / Telda Checkout Details */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Fast Payment via InstaPay or Telda:</span>
                  <span className="text-amber-400 font-mono font-bold">{effectivePrice} EGP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">InstaPay Address (IPA)</span>
                      <span className="font-mono font-bold text-sky-300">{pricing.paymentDetails.instapayIpa}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(pricing.paymentDetails.instapayIpa, 'ipa')}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {copiedField === 'ipa' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Telda Tag</span>
                      <span className="font-mono font-bold text-emerald-300">{pricing.paymentDetails.teldaTag}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(pricing.paymentDetails.teldaTag, 'telda')}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {copiedField === 'telda' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  After transfer, your class setup and invite codes will be provisioned instantly. Our syllabus coordinator will also message your WhatsApp ({whatsappPhone || 'provided'}) for onboarding.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:opacity-95 transition cursor-pointer"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Application Submitted!</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit & Unlock Classroom</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
