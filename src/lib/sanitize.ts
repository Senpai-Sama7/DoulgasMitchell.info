/**
 * Input sanitization utilities.
 * Strips potentially dangerous content from user-submitted strings.
 */

const HTML_PATTERN = /<[^>]*>/g;
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const JAVASCRIPT_URL = /\bjavascript\s*:/gi;
const EVENT_HANDLER = /\bon\w+\s*=/gi;

function stripHtml(input: string): string {
  return input
    .replace(SCRIPT_PATTERN, '')
    .replace(HTML_PATTERN, '')
    .replace(JAVASCRIPT_URL, '')
    .replace(EVENT_HANDLER, '')
    .trim();
}

export function sanitizeText(input: string, maxLength = 5000): string {
  const stripped = stripHtml(input);
  return stripped.slice(0, maxLength).trim();
}

export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().slice(0, 254);
}

export function sanitizeSubject(input: string): string {
  return stripHtml(input).slice(0, 200).trim();
}

export function sanitizeName(input: string): string {
  return stripHtml(input).slice(0, 100).trim();
}

export function sanitizeUrl(input: string): string {
  const trimmed = input.trim().slice(0, 2048);
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'javascript:' || url.protocol === 'data:') {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
}

export function sanitizeSearchQuery(input: string): string {
  return stripHtml(input).slice(0, 200).trim();
}
