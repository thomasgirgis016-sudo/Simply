// Daily Cambridge Challenge & Study Streak Engine
// Persists student revision habits, daily streak, and questions solved.

import { Subject, PastPaperItem } from '../types';
import { getAllPastPapers } from '../data/pastPapersData';

export interface DailyStreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // 'YYYY-MM-DD'
  totalQuestionsSolved: number;
  xpPoints: number;
  completedHistory: {
    date: string; // 'YYYY-MM-DD'
    questionId: string;
    paperCode: string;
    marksEarned: number;
    subjectId: string;
  }[];
}

const STORAGE_STREAK_KEY = 'simply_igcse_daily_streak_v1';

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailyStreak(): DailyStreakState {
  try {
    const raw = localStorage.getItem(STORAGE_STREAK_KEY);
    if (!raw) {
      const initial: DailyStreakState = {
        currentStreak: 1, // Welcome streak
        longestStreak: 1,
        lastCompletedDate: null,
        totalQuestionsSolved: 0,
        xpPoints: 50,
        completedHistory: []
      };
      saveDailyStreak(initial);
      return initial;
    }
    const parsed: DailyStreakState = JSON.parse(raw);
    
    // Check if streak was broken (missed more than 1 day)
    const today = getTodayDateString();
    if (parsed.lastCompletedDate) {
      const lastDate = new Date(parsed.lastCompletedDate);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Streak broken
        parsed.currentStreak = 0;
        saveDailyStreak(parsed);
      }
    }
    
    return parsed;
  } catch {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: null,
      totalQuestionsSolved: 0,
      xpPoints: 50,
      completedHistory: []
    };
  }
}

export function saveDailyStreak(streak: DailyStreakState): void {
  try {
    localStorage.setItem(STORAGE_STREAK_KEY, JSON.stringify(streak));
  } catch (err) {
    console.error('Failed to save daily streak:', err);
  }
}

export function completeDailyChallenge(params: {
  questionId: string;
  paperCode: string;
  marksEarned: number;
  subjectId: string;
}): { success: boolean; newStreak: number; earnedXp: number; isFirstToday: boolean } {
  const current = getDailyStreak();
  const today = getTodayDateString();
  const isFirstToday = current.lastCompletedDate !== today;

  let newStreak = current.currentStreak;
  if (isFirstToday) {
    newStreak += 1;
    if (newStreak > current.longestStreak) {
      current.longestStreak = newStreak;
    }
  }

  const earnedXp = params.marksEarned * 10 + 25; // 10 XP per mark + 25 daily bonus

  current.currentStreak = newStreak;
  current.lastCompletedDate = today;
  current.totalQuestionsSolved += 1;
  current.xpPoints += earnedXp;
  current.completedHistory.unshift({
    date: today,
    questionId: params.questionId,
    paperCode: params.paperCode,
    marksEarned: params.marksEarned,
    subjectId: params.subjectId
  });

  saveDailyStreak(current);
  window.dispatchEvent(new CustomEvent('simply_streak_updated', { detail: current }));

  return {
    success: true,
    newStreak,
    earnedXp,
    isFirstToday
  };
}

// Deterministically picks today's high-yield Cambridge challenge question for a subject
export function getDailyChallengeQuestion(subject: Subject): PastPaperItem {
  const all = getAllPastPapers();
  const matched = all.filter(p => p.subjectId === subject.id || p.subjectId.includes(subject.code));
  const pool = matched.length > 0 ? matched : all;

  // Use date hash for consistent question of the day across all users
  const today = getTodayDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}
