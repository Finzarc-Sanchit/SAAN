/** Strips HTML tags from user-provided text to reduce stored XSS risk. */
export function sanitizePlainText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
