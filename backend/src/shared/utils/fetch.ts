import { logger } from '../logger';

export interface FetchOptions extends RequestInit {
  retries?: number;
  delay?: number;
}

/**
 * Perform native fetch request with retry-backoff support for transient errors
 */
export const fetchWithRetry = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { retries = 3, delay = 1000, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    if (response.ok) {
      return response;
    }

    const isTransient = response.status === 429 || response.status >= 500;
    if (isTransient && retries > 0) {
      logger.warn(`Fetch to ${url} failed with status ${response.status}. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, { ...options, retries: retries - 1, delay: delay * 2 });
    }

    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  } catch (error: any) {
    if (retries > 0) {
      logger.warn(`Fetch connection to ${url} failed: ${error.message}. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, { ...options, retries: retries - 1, delay: delay * 2 });
    }
    throw error;
  }
};
