export const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const isRateLimit = lastError.message.toLowerCase().includes('429') ||
                         lastError.message.toLowerCase().includes('too many requests');

      // Only retry on rate limit errors and if we have attempts left
      if (isRateLimit && attempt < maxRetries) {
        console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        throw lastError;
      }
    }
  }

  throw lastError!;
};