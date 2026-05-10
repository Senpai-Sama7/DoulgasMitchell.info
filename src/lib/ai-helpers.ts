/**
 * AI availability helper — returns a consistent explanation when
 * Gemini API keys are not configured.
 */

export function getAiApiKey(): string | null {
  return process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || null;
}

export function getAiNotAvailableMessage(): string {
  return 'AI features require a Gemini API key. Add GOOGLE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/apikey';
}
