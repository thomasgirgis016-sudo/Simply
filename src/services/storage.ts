/**
 * Safe LocalStorage Helper
 * Protects against QuotaExceededError and private-mode/webview storage restrictions.
 */

const DISPOSABLE_KEYS = [
  'simply_igcse_revision',
  'simply_igcse_flashcards',
  'simply_igcse_quizzes',
  'simply_igcse_custom_past_papers',
  'simply_audit_logs_v1',
  'simply_whatsapp_logs_v1'
];

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    // Check for QuotaExceededError
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuota) {
      console.warn(`[Storage] Quota exceeded while saving "${key}". Purging disposable caches...`);
      // Evict large disposable caches to free up quota
      for (const k of DISPOSABLE_KEYS) {
        if (k !== key) {
          try {
            localStorage.removeItem(k);
          } catch {}
        }
      }

      // Retry once after eviction
      try {
        localStorage.setItem(key, value);
        console.log(`[Storage] Successfully saved "${key}" after cache eviction.`);
        return true;
      } catch (retryErr) {
        console.error(`[Storage] Unable to save "${key}" even after cache eviction:`, retryErr);
        return false;
      }
    }

    console.warn(`[Storage] Failed to set "${key}":`, err);
    return false;
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to get "${key}":`, err);
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove "${key}":`, err);
  }
}
