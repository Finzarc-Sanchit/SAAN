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
): Promise<string> {
  const baseSlug = slugifyName(name);
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
