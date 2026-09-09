import { useState, useEffect, useCallback } from 'react';
import { SyncRepository } from '../repositories/SyncRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

interface SyncResult {
  isSyncing: boolean;
  lastSynced: Date | null;
  syncNow: () => Promise<void>;
}

/**
 * useSyncBank
 *
 * Checks server content version and updates local bank without hardcoded question limits.
 */
export function useSyncBank(): SyncResult {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(SyncRepository.getLastSynced());

  const sync = useCallback(async () => {
    try {
      setIsSyncing(true);
      const selectedCountry = QuestionRepository.getSelectedCountry();
      const outcome = await SyncRepository.sync(selectedCountry);
      if (outcome.synced) {
        console.log(`[useSyncBank] Synced ${outcome.questionCount} questions for ${selectedCountry} (v${outcome.version})`);
      }
      setLastSynced(SyncRepository.getLastSynced() || new Date());
    } catch (err) {
      console.warn('[useSyncBank] Sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  return { isSyncing, lastSynced, syncNow: sync };
}

export default useSyncBank;
