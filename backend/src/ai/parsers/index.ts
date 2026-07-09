/**
 * Safe JSON parser helper for parsing Gemini responses
 */
export function parseGenerativeJSON<T>(content: string): T | null {
  try {
    // Strip markdown JSON block if present
    const cleaned = content.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    return null;
  }
}
