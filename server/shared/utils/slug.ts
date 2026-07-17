/** Convert a display name into a URL-safe slug. */
export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

  return slug.length > 0 ? slug : 'item';
}

/** Pick the first available slug, appending -2, -3, … when the base is taken. */
export async function resolveUniqueSlug(
  name: string,
  slugExists: (slug: string) => Promise<boolean>,
  maxLength = 200,
): Promise<string> {
  const baseSlug = slugifyName(name).slice(0, maxLength).replace(/-+$/g, '') || 'item';
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    const suffixText = `-${suffix}`;
    const truncatedBase = baseSlug
      .slice(0, Math.max(1, maxLength - suffixText.length))
      .replace(/-+$/g, '');
    candidate = `${truncatedBase}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}
