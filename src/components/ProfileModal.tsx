import React, { useState } from 'react';
import { User, Award, BookOpen, X, Check, School } from 'lucide-react';
import { UserProfile, ExamBoard, GradeLevel, TargetGrade } from '../types';
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
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(profile.selectedSubjectIds);

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      board,
      grade,
      targetGrade,
      selectedSubjectIds: selectedSubjects.length > 0 ? selectedSubjects : ['cie-math-0580', 'cie-physics-0625'],
    });
    onClose();
  };

  const filteredSubjects = IGCSE_SUBJECTS.filter(s => {
    if (board === 'Both') return true;
    return s.board === board || s.board === 'Both';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 sm:p-6 shadow-2xl shadow-indigo-500/10 max-h-[92dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 text-white shadow-lg shadow-cyan-500/30">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Student Academic Profile</h2>
            <p className="text-xs text-slate-400">Personalize your IGCSE curriculum, exam board & subjects</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Name / Nickname
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thomas"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-3 text-base sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exam Board */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Exam Board
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['CIE', 'Edexcel', 'Both'] as ExamBoard[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  className={`rounded-xl border p-3 text-left transition ${
                    board === b
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500 shadow-md'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">{b === 'CIE' ? 'Cambridge (CIE)' : b === 'Edexcel' ? 'Pearson Edexcel' : 'Dual / Both'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {b === 'CIE' ? '0580, 0625, 0620...' : b === 'Edexcel' ? '4MA1, 4PH1, 4CH1...' : 'All syllabus codes'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Grade / Year Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Current Year / Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Year 9 / Grade 8">Year 9 / Grade 8 (Foundations & Prep)</option>
                <option value="Year 10 / Grade 9 (IGCSE Yr 1)">Year 10 / Grade 9 (IGCSE Year 1)</option>
                <option value="Year 11 / Grade 10 (IGCSE Exam Yr)">Year 11 / Grade 10 (IGCSE Exam Year / Finals)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Target Grade Goal
              </label>
              <div className="flex items-center gap-2">
                {(['9 / A*', '8 / A*', '7 / A'] as TargetGrade[]).map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    onClick={() => setTargetGrade(tg)}
                    className={`flex-1 rounded-xl border py-2.5 text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      targetGrade === tg
                        ? 'border-amber-500 bg-amber-950/30 text-amber-300 ring-1 ring-amber-500 shadow-md'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    {tg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subjects Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Enrolled Subjects ({selectedSubjects.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setSelectedSubjects(filteredSubjects.map(s => s.id))}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{sub.name}</p>
                        <p className="text-[10px] text-slate-400">{sub.code} • {sub.category}</p>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition"
          >
            <BookOpen className="h-4 w-4" />
            Save Profile & Update Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
