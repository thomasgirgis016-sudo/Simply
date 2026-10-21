import { OFFICIAL_EXAM_TIMETABLE, ScheduledExamPaper } from '../data/examTimetableData';

export interface CountdownState {
  targetPaper: ScheduledExamPaper;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  totalHoursRemaining: number;
  isPast: boolean;
  recommendedDailyPapers: number;
  recommendedDailyMistakeClears: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const getNextScheduledPaper = (subjectCode?: string): CountdownState | null => {
  const now = new Date();

  // Filter papers for active subject if specified, else look across all
  const matchingPapers = OFFICIAL_EXAM_TIMETABLE.filter((p) => {
    if (!subjectCode) return true;
    return p.subjectCode === subjectCode;
  });

  // Sort chronologically
  const sorted = [...matchingPapers].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  // Find first paper that hasn't passed yet (or the closest upcoming)
  const target = sorted.find((p) => new Date(`${p.examDate}T09:00:00Z`).getTime() > now.getTime()) || sorted[0];

  if (!target) return null;

  const examTime = new Date(`${target.examDate}T09:00:00Z`).getTime();
  const diffMs = examTime - now.getTime();

  if (diffMs <= 0) {
    return {
      targetPaper: target,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      totalHoursRemaining: 0,
      isPast: true,
      recommendedDailyPapers: 1,
      recommendedDailyMistakeClears: 3,
      urgencyLevel: 'critical'
    };
  }

  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const totalHoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));

  // Determine urgency and study quotas
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let recommendedDailyPapers = 1;
  let recommendedDailyMistakeClears = 2;

  if (daysRemaining <= 7) {
    urgencyLevel = 'critical';
    recommendedDailyPapers = 2;
    recommendedDailyMistakeClears = 5;
  } else if (daysRemaining <= 21) {
    urgencyLevel = 'high';
    recommendedDailyPapers = 2;
    recommendedDailyMistakeClears = 4;
  } else if (daysRemaining <= 45) {
    urgencyLevel = 'medium';
    recommendedDailyPapers = 1;
    recommendedDailyMistakeClears = 3;
  }

  return {
    targetPaper: target,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    totalHoursRemaining,
    isPast: false,
    recommendedDailyPapers,
    recommendedDailyMistakeClears,
    urgencyLevel
  };
};
