/**
 * Simply IGCSE — Dual-Layer ClassifiedQuestions Database & Cache Store
 * 
 * Provides high-speed in-memory indexing, persistence across warm serverless sessions,
 * and seamless fallback across local storage and memory.
 */

import { ClassifiedQuestion } from './questionPool';
import { AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS } from './questionPool';

export interface ClassifiedQuestionsTable {
  paperId: string;
  questions: ClassifiedQuestion[];
  extractedAt: string;
  source: 'cache' | 'ingestion' | 'gemini_extraction';
}

class ClassifiedQuestionsStore {
  private questionsByPaperId = new Map<string, ClassifiedQuestion[]>();
  private questionsById = new Map<string, ClassifiedQuestion>();
  private questionsByChapterId = new Map<string, ClassifiedQuestion[]>();
  private questionsBySyllabus = new Map<string, ClassifiedQuestion[]>();
  private isHydrated = false;

  constructor() {
    this.hydrateFromBrowserStorage();
  }

  private ensureHydrated() {
    if (this.isHydrated) return;
    try {
      if (typeof AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS !== 'undefined' && Array.isArray(AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS)) {
        for (const q of AUTHENTIC_PAST_PAPER_CLASSIFIED_QUESTIONS) {
          this.insertQuestion(q);
        }
        this.isHydrated = true;
      }
    } catch {
      // ignore circular initialization
    }
  }

  private hydrateFromBrowserStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = localStorage.getItem('simply_classified_questions_v2');
      if (raw) {
        const parsed: ClassifiedQuestion[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const q of parsed) {
            this.insertQuestion(q);
          }
        }
      }
    } catch (e) {
      console.warn('ClassifiedQuestionsStore browser hydration skipped:', e);
    }
  }

  private persistToBrowserStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const all = Array.from(this.questionsById.values());
      // Save up to 5,000 recent questions to localStorage
      const slice = all.slice(-5000);
      localStorage.setItem('simply_classified_questions_v2', JSON.stringify(slice));
    } catch (e) {
      console.warn('ClassifiedQuestionsStore browser persist skipped:', e);
    }
  }

  private insertQuestion(q: ClassifiedQuestion) {
    if (!q || !q.id) return;
    this.questionsById.set(q.id, q);

    // By Chapter
    if (q.chapterId) {
      if (!this.questionsByChapterId.has(q.chapterId)) {
        this.questionsByChapterId.set(q.chapterId, []);
      }
      const list = this.questionsByChapterId.get(q.chapterId)!;
      if (!list.some(item => item.id === q.id)) {
        list.push(q);
      }
    }

    // By Syllabus
    const syl = q.subjectCode?.toLowerCase() || '0580';
    if (!this.questionsBySyllabus.has(syl)) {
      this.questionsBySyllabus.set(syl, []);
    }
    const sylList = this.questionsBySyllabus.get(syl)!;
    if (!sylList.some(item => item.id === q.id)) {
      sylList.push(q);
    }
  }

  /**
   * Check if questions for a specific paper ID are already in cache
   */
  public hasQuestionsForPaper(paperId: string): boolean {
    if (!paperId) return false;
    this.ensureHydrated();
    const cleanId = paperId.trim();
    if (this.questionsByPaperId.has(cleanId)) return true;
    
    // Check if any question's id starts with or matches paperId
    for (const q of this.questionsById.values()) {
      if (q.id.includes(cleanId) || (q.source && cleanId.includes(q.subjectCode) && cleanId.includes(String(q.year)))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieve cached questions for a specific paper ID
   */
  public getQuestionsByPaperId(paperId: string): ClassifiedQuestion[] | undefined {
    if (!paperId) return undefined;
    this.ensureHydrated();
    const cleanId = paperId.trim();
    
    if (this.questionsByPaperId.has(cleanId)) {
      return this.questionsByPaperId.get(cleanId);
    }

    const matches: ClassifiedQuestion[] = [];
    for (const q of this.questionsById.values()) {
      if (q.id.includes(cleanId)) {
        matches.push(q);
      }
    }

    if (matches.length > 0) {
      this.questionsByPaperId.set(cleanId, matches);
      return matches;
    }

    return undefined;
  }

  /**
   * Save extracted or synthesized questions to the ClassifiedQuestions store
   */
  public saveQuestions(paperId: string, questions: ClassifiedQuestion[]): void {
    if (!questions || questions.length === 0) return;
    this.ensureHydrated();
    const cleanId = paperId ? paperId.trim() : `paper-${Date.now()}`;
    
    this.questionsByPaperId.set(cleanId, questions);
    for (const q of questions) {
      this.insertQuestion(q);
    }

    this.persistToBrowserStorage();
  }

  /**
   * Retrieve questions by syllabus chapter ID (e.g. "0580-01", "0620-03")
   */
  public getQuestionsByChapterId(chapterId: string): ClassifiedQuestion[] {
    if (!chapterId) return [];
    this.ensureHydrated();
    return this.questionsByChapterId.get(chapterId) || [];
  }

  /**
   * Retrieve questions by syllabus code (e.g. "0580", "4MA1")
   */
  public getQuestionsBySyllabus(syllabus: string): ClassifiedQuestion[] {
    if (!syllabus) return [];
    this.ensureHydrated();
    return this.questionsBySyllabus.get(syllabus.toLowerCase()) || [];
  }

  /**
   * Retrieve all cached questions across all subjects
   */
  public getAllCachedQuestions(): ClassifiedQuestion[] {
    this.ensureHydrated();
    return Array.from(this.questionsById.values());
  }

  /**
   * Query database statistics
   */
  public getStats() {
    this.ensureHydrated();
    return {
      totalQuestions: this.questionsById.size,
      papersCached: this.questionsByPaperId.size,
      chaptersCovered: this.questionsByChapterId.size,
      syllabiCovered: this.questionsBySyllabus.size
    };
  }
}

// Global Singleton Store Instance
export const classifiedQuestionsStore = new ClassifiedQuestionsStore();
