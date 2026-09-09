import { storage } from '../utils/storage';
import { INITIAL_QUESTION_BANK } from '../utils/seedData';
import type { Question } from '../types';

const KEY_BANK = 'question_bank';
const KEY_SELECTED_COUNTRY = 'selected_country_code';
const KEY_SELECTED_JURISDICTION = 'selected_jurisdiction_code';

export interface CategoryCounts {
  warning: number;
  regulatory: number;
  signals: number;
  general: number;
  total: number;
}

/** Unbiased in-place Fisher-Yates shuffle */
export function fisherYatesShuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Deep question & option shuffler (Anti-Rote / Anti-Ratta).
 * Shuffles options while recalculating correctIndex.
 */
export function prepareShuffledQuestions(rawPool: Question[]): Question[] {
  const shuffledQuestions = fisherYatesShuffle(rawPool);

  return shuffledQuestions.map((q) => {
    const correctText = q.options[q.correctIndex];
    const shuffledOptions = fisherYatesShuffle(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    return {
      ...q,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  });
}

export const QuestionRepository = {
  /**
   * Get all active questions from local storage cache.
   */
  getAll(): Question[] {
    try {
      const raw = storage.getString(KEY_BANK);
      if (raw && raw !== 'undefined' && raw !== 'null') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_QUESTION_BANK;
  },

  /**
   * Filter questions by country and category.
   * Matches both modern names (e.g. WARNING_SIGNS) and legacy names (e.g. WARNING).
   */
  getFiltered(params: {
    category?: string;
    countryCode?: string;
    jurisdictionCode?: string;
  }): Question[] {
    const all = this.getAll();
    const { category, countryCode, jurisdictionCode } = params;

    return all.filter((q) => {
      // 1. Country match: if specific country requested, allow that country's questions + universal global questions
      if (countryCode && countryCode !== 'GLOBAL') {
        const qCountry = q.countryCode || 'GLOBAL';
        if (qCountry !== countryCode && qCountry !== 'GLOBAL') {
          return false;
        }
        if (jurisdictionCode && q.jurisdictionCode && q.jurisdictionCode !== jurisdictionCode) {
          return false;
        }
      }
      // In GLOBAL mode or unspecified, all active published questions are accessible (276 total)

      // 2. Category match
      if (category && category !== 'ALL') {
        const cat = q.category;
        if (category === 'WARNING' || category === 'WARNING_SIGNS') {
          return cat === 'WARNING' || cat === 'WARNING_SIGNS';
        }
        if (category === 'REGULATORY' || category === 'TRAFFIC_REGULATORY') {
          return cat === 'REGULATORY' || cat === 'TRAFFIC_REGULATORY';
        }
        if (category === 'SIGNAL' || category === 'TRAFFIC_SIGNALS') {
          return cat === 'SIGNAL' || cat === 'TRAFFIC_SIGNALS';
        }
        if (category === 'GENERAL' || category === 'GENERAL_KNOWLEDGE') {
          return cat === 'GENERAL' || cat === 'GENERAL_KNOWLEDGE';
        }
        return cat === category;
      }

      return true;
    });
  },

  /**
   * Calculate live dynamic counts per category for the selected country.
   */
  getCategoryCounts(countryCode?: string): CategoryCounts {
    const pool = this.getFiltered({ countryCode });
    let warning = 0;
    let regulatory = 0;
    let signals = 0;
    let general = 0;

    for (const q of pool) {
      const cat = q.category;
      if (cat === 'WARNING' || cat === 'WARNING_SIGNS') warning++;
      else if (cat === 'REGULATORY' || cat === 'TRAFFIC_REGULATORY') regulatory++;
      else if (cat === 'SIGNAL' || cat === 'TRAFFIC_SIGNALS') signals++;
      else if (cat === 'GENERAL' || cat === 'GENERAL_KNOWLEDGE') general++;
    }

    return {
      warning,
      regulatory,
      signals,
      general,
      total: pool.length,
    };
  },

  /**
   * Prepare randomized practice batch without fixed question count limits.
   */
  getRandomPracticeBatch(params: {
    category?: string;
    countryCode?: string;
    jurisdictionCode?: string;
    limit?: number;
  }): Question[] {
    const filtered = this.getFiltered(params);
    const shuffled = prepareShuffledQuestions(filtered);
    if (params.limit && params.limit > 0 && params.limit < shuffled.length) {
      return shuffled.slice(0, params.limit);
    }
    return shuffled;
  },

  // Active user country preferences
  getSelectedCountry(): string {
    return storage.getString(KEY_SELECTED_COUNTRY) || 'GLOBAL';
  },

  setSelectedCountry(code: string): void {
    storage.set(KEY_SELECTED_COUNTRY, code);
  },

  getSelectedJurisdiction(): string | undefined {
    return storage.getString(KEY_SELECTED_JURISDICTION);
  },

  setSelectedJurisdiction(code: string | undefined): void {
    if (code) storage.set(KEY_SELECTED_JURISDICTION, code);
    else storage.delete(KEY_SELECTED_JURISDICTION);
  },
};
