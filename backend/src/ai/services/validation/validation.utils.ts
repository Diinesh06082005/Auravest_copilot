/**
 * Verifies that a ticker contains only alphanumeric characters and is 1-5 letters long.
 */
export function isValidTicker(ticker: string): boolean {
  if (!ticker) return false;
  const cleaned = ticker.trim();
  return /^[A-Z0-9.]{1,10}$/i.test(cleaned);
}

/**
 * Parses and returns a clean ISO string representation of any date or string date, falling back to current date.
 */
export function normalizeDate(dateVal: any): string {
  if (!dateVal) return new Date().toISOString();
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return new Date().toISOString();
    }
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Standardizes raw percentage numbers to a clean two-decimal-place float.
 */
export function normalizePercentage(val: any): number {
  const num = Number(val);
  if (isNaN(num)) return 0;
  return +num.toFixed(2);
}

/**
 * Standardizes currency and numeric counts to a clean two-decimal-place float.
 */
export function normalizeCurrency(val: any): number {
  const num = Number(val);
  if (isNaN(num)) return 0;
  return +num.toFixed(2);
}
