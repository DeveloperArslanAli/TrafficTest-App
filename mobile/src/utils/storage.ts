/**
 * storage.ts — Offline-first local storage wrapper.
 *
 * Uses @react-native-async-storage/async-storage backed by a
 * synchronous in-memory cache pre-seeded with built-in questions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_QUESTION_BANK } from './seedData';

export const BUNDLED_VERSION = 104;

// ─── In-memory cache pre-seeded with offline bank ──────────────────────────────
const cache: Record<string, string> = {
  question_bank: JSON.stringify(INITIAL_QUESTION_BANK),
  question_bank_version: String(BUNDLED_VERSION),
};

/** Call once at app startup to warm the cache from persistent storage. */
export async function initStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      const pairs = await AsyncStorage.multiGet(keys as string[]);
      for (const [key, value] of pairs) {
        if (value !== null) cache[key] = value;
      }
    }

    // Version migration: if storage has older content, upgrade to bundled bank
    const storedVersion = Number(cache.question_bank_version || '0');
    if (storedVersion < BUNDLED_VERSION) {
      cache.question_bank = JSON.stringify(INITIAL_QUESTION_BANK);
      cache.question_bank_version = String(BUNDLED_VERSION);
      await AsyncStorage.multiSet([
        ['question_bank', cache.question_bank],
        ['question_bank_version', cache.question_bank_version],
      ]);
    }
  } catch (e) {
    console.warn('[storage] initStorage failed:', e);
  }
}

// ─── Sync getters (read from cache) ───────────────────────────────────────────

export const storage = {
  getString(key: string): string | undefined {
    return cache[key];
  },

  getNumber(key: string): number | undefined {
    const v = cache[key];
    return v !== undefined ? Number(v) : undefined;
  },

  getBoolean(key: string): boolean | undefined {
    const v = cache[key];
    return v !== undefined ? v === 'true' : undefined;
  },

  /** Sync write: updates cache immediately, then persists async. */
  set(key: string, value: string | number | boolean): void {
    if (value === undefined || value === null) return;
    const strVal = String(value);
    if (strVal === 'undefined' || strVal === 'null') return;
    cache[key] = strVal;
    AsyncStorage.setItem(key, strVal).catch((e) =>
      console.warn(`[storage] setItem(${key}) failed:`, e),
    );
  },

  delete(key: string): void {
    delete cache[key];
    AsyncStorage.removeItem(key).catch((e) =>
      console.warn(`[storage] removeItem(${key}) failed:`, e),
    );
  },
};

// ─── Typed helper utilities ───────────────────────────────────────────────────

export function storageGetString(key: string): string | undefined {
  return storage.getString(key);
}

export function storageSetString(key: string, value: string): void {
  storage.set(key, value);
}

export function storageGetNumber(key: string): number | undefined {
  return storage.getNumber(key);
}

export function storageSetNumber(key: string, value: number): void {
  storage.set(key, value);
}

export function storageDelete(key: string): void {
  storage.delete(key);
}

export function storageGetBoolean(key: string): boolean | undefined {
  return storage.getBoolean(key);
}

export function storageSetBoolean(key: string, value: boolean): void {
  storage.set(key, value);
}
