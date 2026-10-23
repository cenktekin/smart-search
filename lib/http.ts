const CHAT_TIMEOUT_MS = 30000;
const DEFAULT_TIMEOUT_MS = 10000;

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryFetch = async (
  url: string,
  options: RequestInit,
  maxRetries: number,
  baseDelay: number
): Promise<Response> => {
  const timeoutMs = url.includes('/chat/completions') ? CHAT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      if (response.status >= 500) {
        if (attempt < maxRetries) {
          await sleep(baseDelay * Math.pow(2, attempt));
          continue;
        }
        throw new Error(`API error after ${maxRetries} retries: ${response.status} ${response.statusText}`);
      }

      const errorData = await response.json().catch(() => ({}));
      const detail = errorData?.message ?? JSON.stringify(errorData);
      throw new Error(`Client error: ${response.status} ${response.statusText} - ${detail}`);
    } catch (error) {
      clearTimeout(timeoutId);

      const isTimeout = (error as Error).name === 'AbortError';
      const isClientError = error instanceof Error && error.message.startsWith('Client error');

      if (isTimeout) {
        if (attempt < maxRetries) {
          await sleep(baseDelay * Math.pow(2, attempt));
          continue;
        }
        throw new TimeoutError(`Timeout after ${maxRetries} retries: ${timeoutMs}ms timeout exceeded.`);
      }

      if (isClientError) {
        throw error;
      }

      if (attempt < maxRetries) {
        await sleep(baseDelay * Math.pow(2, attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
};
