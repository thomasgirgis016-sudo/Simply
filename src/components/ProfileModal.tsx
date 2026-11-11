import React, { useState, useMemo } from 'react';
import { User, Award, BookOpen, X, Check, School, AlertCircle, Layers, Lock, Sparkles, Plus, Trash2 } from 'lucide-react';
import { UserProfile, ExamBoard, GradeLevel, TargetGrade, SubjectLevel, Subject, MAX_STUDENT_SUBJECTS, EXTRA_SUBJECT_PRICE_GBP } from '../types';
import { IGCSE_SUBJECTS } from '../data/subjects';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [board, setBoard] = useState<ExamBoard>(profile.board);
  const [grade, setGrade] = useState<GradeLevel>(profile.grade);
  const [targetGrade, setTargetGrade] = useState<TargetGrade>(profile.targetGrade);
  const [parentWhatsapp, setParentWhatsapp] = useState(profile.parentWhatsapp || '');

  // Base enrolled subjects are locked permanently after signup (max 5)
  const baseSubjectIds = useMemo(() => {
    return profile.selectedSubjectIds && profile.selectedSubjectIds.length > 0
      ? profile.selectedSubjectIds.slice(0, MAX_STUDENT_SUBJECTS)
      : ['cie-math-0580', 'cie-physics-0625', 'cie-chem-0620', 'cie-bio-0610', 'cie-esl-0510'];
  }, [profile.selectedSubjectIds]);

  // Extra subjects added at £28 / month
  const [extraSubjectIds, setExtraSubjectIds] = useState<string[]>(() => {
    const fromProfile = profile.extraSubjectIds || [];
    // Also include any subjects in selectedSubjectIds beyond the first 5
    const overflow = (profile.selectedSubjectIds || []).slice(MAX_STUDENT_SUBJECTS);
    return Array.from(new Set([...fromProfile, ...overflow]));
  });

  const [pendingExtraSubject, setPendingExtraSubject] = useState<Subject | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'All' | SubjectLevel>('All');
  const [warningMsg, setWarningMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubjectClick = (sub: Subject) => {
    // 1. If base subject: strictly locked, cannot be removed after registration
    if (baseSubjectIds.includes(sub.id)) {
      setWarningMsg(`🔒 Base Subject Locked: "${sub.name}" was chosen during signup and is permanently part of your core curriculum.`);
      setTimeout(() => setWarningMsg(''), 5000);
      return;
    }

    // 2. If already an extra subject: ask to remove
    if (extraSubjectIds.includes(sub.id)) {
      setExtraSubjectIds(prev => prev.filter(id => id !== sub.id));
      setSuccessMsg(`Removed extra subject "${sub.name}" (-£28/mo).`);
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }

    // 3. Otherwise: prompt to add as an extra subject (+£28/mo)
    setPendingExtraSubject(sub);
  };

  const handleConfirmExtraSubject = () => {
    if (!pendingExtraSubject) return;
    setExtraSubjectIds(prev => [...prev, pendingExtraSubject.id]);
    setSuccessMsg(`🎉 Successfully added "${pendingExtraSubject.name}" as an extra subject (+£${EXTRA_SUBJECT_PRICE_GBP}/mo).`);
    setPendingExtraSubject(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      board,
      grade,
      targetGrade,
      selectedSubjectIds: baseSubjectIds,
      extraSubjectIds,
      parentWhatsapp: parentWhatsapp.trim() || undefined,
    });
    onClose();
  };

  const filteredSubjects = IGCSE_SUBJECTS.filter(s => {
    const matchesBoard = board === 'Both' || s.board === board || s.board === 'Both';
    const matchesLevel = selectedLevel === 'All' || s.level === selectedLevel;
    return matchesBoard && matchesLevel;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222225] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-[#222225] border border-white/[0.08] p-2 text-[#FF5B37]">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-medium text-[#ededed]">Student Academic Profile</h2>
            <p className="text-xs text-[#a1a1a6]">Personalize your IGCSE curriculum, exam board & subjects</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Student Name & Parent WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Your name / Nickname
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thomas"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 pl-9 pr-3 text-xs text-[#ededed] placeholder-zinc-500 focus:border-[#FF5B37] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#a1a1a6]">
                  Parent's WhatsApp
                </label>
                <span className="text-[10px] text-[#4cc38a] font-medium font-mono">Weekly Report</span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="tel"
                  value={parentWhatsapp}
                  onChange={(e) => setParentWhatsapp(e.target.value)}
                  placeholder="e.g. +20 100 123 4567"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 pl-9 pr-3 text-xs text-[#ededed] placeholder-zinc-500 font-mono focus:border-[#FF5B37] focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-[#85858b] mt-1">Automatic weekly report sent to this number</p>
            </div>
          </div>

          {/* Exam Board */}
          <div>
            <label className="block text-xs font-medium text-[#a1a1a6] mb-2">
              Exam board
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['CIE', 'Edexcel', 'Both'] as ExamBoard[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  className={`rounded-lg border p-3 text-left transition cursor-pointer ${
                    board === b
                      ? 'border-[#FF5B37] bg-[#222225] text-white shadow-sm'
                      : 'border-white/[0.08] bg-[#141416] text-zinc-400 hover:border-white/[0.14] hover:text-[#ededed]'
                  }`}
                >
                  <p className="text-xs font-medium">{b === 'CIE' ? 'Cambridge (CIE)' : b === 'Edexcel' ? 'Pearson Edexcel' : 'Dual / Both'}</p>
                  <p className="text-[10px] text-[#85858b] mt-0.5">
                    {b === 'CIE' ? '0580, 0625, 0620...' : b === 'Edexcel' ? '4MA1, 4PH1, 4CH1...' : 'All syllabus codes'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Grade / Year Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-2">
                Current year / Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#141416] py-2 px-3 text-xs text-[#ededed] focus:border-[#FF5B37] focus:outline-none transition cursor-pointer"
              >
                <option value="Year 9 / Grade 8">Year 9 / Grade 8 (Foundations & Prep)</option>
                <option value="Year 10 / Grade 9 (IGCSE Yr 1)">Year 10 / Grade 9 (IGCSE Year 1)</option>
                <option value="Year 11 / Grade 10 (IGCSE Exam Yr)">Year 11 / Grade 10 (IGCSE Exam Year / Finals)</option>
                <option value="Year 12 / Grade 11 (AS Level)">Year 12 / Grade 11 (Cambridge & Edexcel AS Level)</option>
                <option value="Year 13 / Grade 12 (A Level)">Year 13 / Grade 12 (Cambridge & Edexcel A Level)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-2">
                Target grade goal
              </label>
              <div className="flex items-center gap-2">
                {(['9 / A*', '8 / A*', '7 / A'] as TargetGrade[]).map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    onClick={() => setTargetGrade(tg)}
                    className={`flex-1 rounded-lg border py-2 text-center text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      targetGrade === tg
                        ? 'border-[#FF5B37] bg-[#222225] text-white shadow-sm'
                        : 'border-white/[0.08] bg-[#141416] text-zinc-400 hover:border-white/[0.14] hover:text-[#ededed]'
                    }`}
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    {tg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subjects Selection with Locked Base Curriculum and Extra Subjects (+£28/mo) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a6]">
                  Enrolled subjects ({baseSubjectIds.length} Core Locked + {extraSubjectIds.length} Extra)
                </label>
                <p className="text-[11px] text-[#85858b]">
                  Core subjects chosen at registration are <strong className="text-zinc-300 font-medium">permanently locked</strong>. Extra subjects can be added for <strong className="text-amber-400 font-medium">+£{EXTRA_SUBJECT_PRICE_GBP}/month</strong>.
                </p>
              </div>

              {/* Subject Level Filter Tabs */}
              <div className="flex items-center gap-1 rounded-lg bg-[#141416] p-1 border border-white/[0.06] self-start sm:self-auto">
                {(['All', 'O Level / IGCSE', 'AS Level', 'A Level'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-[#222225] border border-white/[0.08] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'All' ? 'All Levels' : lvl.split(' / ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Banners */}
            {warningMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-[#141416] p-2.5 text-xs text-amber-300 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{warningMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-[#4cc38a]/40 bg-[#141416] p-2.5 text-xs text-[#4cc38a] animate-fadeIn">
                <Check className="h-4 w-4 shrink-0 text-[#4cc38a]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Interactive Extra Subject Enrollment Confirmation Card */}
            {pendingExtraSubject && (
              <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-medium text-sm text-[#ededed] block">
                        Add extra subject: {pendingExtraSubject.name} ({pendingExtraSubject.code})
                      </span>
                      <span className="text-[11px] text-[#85858b]">
                        {pendingExtraSubject.board} • {pendingExtraSubject.level || 'IGCSE / O Level'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingExtraSubject(null)}
                    className="text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Students cannot replace their 5 core registered subjects, but you can enroll in additional syllabuses for <strong className="text-amber-300">£{EXTRA_SUBJECT_PRICE_GBP} per month</strong>. Immediate access to topical classifieds, mark schemes, and examiner AI grading is included.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                  <span className="text-xs font-mono font-medium text-amber-300 bg-[#222225] px-2.5 py-1 rounded-md border border-white/[0.08]">
                    +£{EXTRA_SUBJECT_PRICE_GBP} / month
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingExtraSubject(null)}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#222225] text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmExtraSubject}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] text-xs font-medium text-white transition cursor-pointer"
                    >
                      Confirm & Add (+£{EXTRA_SUBJECT_PRICE_GBP}/mo)
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredSubjects.map((sub) => {
                const isBase = baseSubjectIds.includes(sub.id);
                const isExtra = extraSubjectIds.includes(sub.id);

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSubjectClick(sub)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 transition select-none cursor-pointer ${
                      isBase
                        ? 'border-[#FF5B37]/50 bg-[#222225] text-white shadow-sm'
                        : isExtra
                        ? 'border-amber-500/40 bg-[#222225] text-amber-200'
                        : 'border-white/[0.06] bg-[#141416] text-zinc-400 hover:border-white/[0.12] hover:bg-[#1a1a1d] hover:text-[#ededed]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-medium text-[#ededed] leading-tight truncate">{sub.name}</p>
                          <span className="rounded px-1.5 py-0.5 text-[9px] font-mono border border-white/[0.08] text-zinc-400">
                            {sub.level || 'O Level'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#85858b] truncate mt-0.5">{sub.code} • {sub.category}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isBase ? (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141416] border border-white/[0.08] text-[10px] font-mono text-[#FF5B37]"
                          title="Core base subject chosen at signup (Permanently locked)"
                        >
                          <Lock className="h-3 w-3" />
                          <span>Core</span>
                        </span>
                      ) : isExtra ? (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141416] border border-amber-500/30 text-[10px] font-mono text-amber-300 hover:text-rose-300 transition"
                          title="Extra enrolled subject (+£28/mo). Click to remove."
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>+£{EXTRA_SUBJECT_PRICE_GBP}/mo</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#222225] border border-white/[0.08] text-[10px] font-mono text-zinc-400">
                          <Plus className="h-3 w-3" />
                          <span>+£{EXTRA_SUBJECT_PRICE_GBP}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#F97316] px-4 py-2 text-xs font-medium text-white transition cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            Save Profile & Update Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
