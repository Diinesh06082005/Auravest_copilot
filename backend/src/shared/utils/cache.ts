export class SimpleCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  /**
   * Get value from cache if it exists and has not expired.
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  /**
   * Put value into cache with a specific Time To Live (TTL). Default: 10 minutes.
   */
  public set<T>(key: string, value: T, ttlMs = 10 * 60 * 1000): void {
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  /**
   * Clear all cache entries.
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache();
