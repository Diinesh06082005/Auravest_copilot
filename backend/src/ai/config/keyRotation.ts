import { config } from '../../shared/config';
import { logger } from '../../shared/logger';

interface KeySlot {
  key: string;
  callCount: number;
  quotaHit: boolean;
  quotaResetAt: number; // timestamp ms
}

class GeminiKeyRotator {
  private slots: KeySlot[] = [];
  private cursor = 0;

  constructor() {
    const keys = config.gemini.apiKeys;
    this.slots = keys.map((key) => ({
      key,
      callCount: 0,
      quotaHit: false,
      quotaResetAt: 0,
    }));
    logger.info(`[KeyRotator] Initialized with ${this.slots.length} Gemini API key(s).`);
  }

  /**
   * Returns the next available API key using round-robin rotation.
   * Skips keys that have recently hit quota limits (backoff for 60s).
   */
  public getNextKey(): string {
    const now = Date.now();
    const total = this.slots.length;

    for (let attempt = 0; attempt < total; attempt++) {
      const slot = this.slots[this.cursor % total];
      this.cursor = (this.cursor + 1) % total;

      // Reset quota flag after 60-second backoff window
      if (slot.quotaHit && now > slot.quotaResetAt) {
        slot.quotaHit = false;
        logger.info(`[KeyRotator] Key slot ${this.cursor} quota backoff expired — re-enabling.`);
      }

      if (!slot.quotaHit) {
        slot.callCount++;
        return slot.key;
      }
    }

    // All keys quota-hit — return primary key and let caller handle the error
    logger.warn('[KeyRotator] All Gemini API keys are in quota backoff. Using primary key as last resort.');
    return this.slots[0].key;
  }

  /**
   * Mark a key as quota-exceeded. It will be skipped for 60 seconds.
   */
  public markQuotaExceeded(key: string): void {
    const slot = this.slots.find((s) => s.key === key);
    if (slot) {
      slot.quotaHit = true;
      slot.quotaResetAt = Date.now() + 60_000; // 60-second cooldown
      logger.warn(`[KeyRotator] Key ending in ...${key.slice(-8)} hit quota limit. Cooling down for 60s.`);
    }
  }

  /**
   * Returns usage stats for logging/debugging.
   */
  public getStats(): { key: string; calls: number; quotaHit: boolean }[] {
    return this.slots.map((s) => ({
      key: `...${s.key.slice(-8)}`,
      calls: s.callCount,
      quotaHit: s.quotaHit,
    }));
  }
}

// Singleton instance shared across the entire AI layer
export const geminiKeyRotator = new GeminiKeyRotator();
