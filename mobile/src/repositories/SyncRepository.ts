import { api } from '../services/api';
import { storage } from '../utils/storage';
import type { Question } from '../types';

const KEY_VERSION = 'question_bank_version';
const KEY_BANK = 'question_bank';
const KEY_LAST_SYNCED = 'last_synced_timestamp';

export interface SyncOutcome {
  synced: boolean;
  questionCount: number;
  version: number;
  error?: string;
}

export const SyncRepository = {
  /**
   * Perform version-based content synchronization with the server.
   */
  async sync(countryCode = 'GLOBAL'): Promise<SyncOutcome> {
    try {
      const localVersion = storage.getNumber(KEY_VERSION) ?? -1;

      // 1. Fetch remote version
      const versionRes = await api.get<{ version: number }>('/quiz/version', {
        params: { country: countryCode },
      });
      const remoteVersion = versionRes.data?.version ?? 0;

      // 2. Check if update is needed
      const cachedBankRaw = storage.getString(KEY_BANK);
      let localBank: Question[] = [];
      if (cachedBankRaw) {
        try {
          const parsed = JSON.parse(cachedBankRaw);
          if (Array.isArray(parsed)) localBank = parsed;
        } catch {}
      }

      const needsSync = remoteVersion > localVersion || localBank.length === 0;

      if (needsSync) {
        // 3. Download updated questions
        const bankRes = await api.get<Question[]>('/quiz/bank', {
          params: { country: countryCode },
        });

        const remoteQuestions = bankRes.data;

        if (Array.isArray(remoteQuestions) && remoteQuestions.length > 0) {
          // 4. Merge transactionally into local bank by ID
          const questionMap = new Map<string, Question>();
          // Prime with existing local items
          localBank.forEach((q) => questionMap.set(q.id, q));
          // Overwrite / add remote questions
          remoteQuestions.forEach((q) => questionMap.set(q.id, q));

          const mergedBank = Array.from(questionMap.values());

          // 5. Save to local storage
          storage.set(KEY_BANK, JSON.stringify(mergedBank));
          storage.set(KEY_VERSION, remoteVersion);
          storage.set(KEY_LAST_SYNCED, Date.now());

          return {
            synced: true,
            questionCount: mergedBank.length,
            version: remoteVersion,
          };
        }
      }

      return {
        synced: false,
        questionCount: localBank.length,
        version: localVersion,
      };
    } catch (err: any) {
      return {
        synced: false,
        questionCount: 0,
        version: storage.getNumber(KEY_VERSION) ?? 0,
        error: err?.message || 'Sync failed',
      };
    }
  },

  getLastSynced(): Date | null {
    const ts = storage.getNumber(KEY_LAST_SYNCED);
    return ts ? new Date(ts) : null;
  },
};
