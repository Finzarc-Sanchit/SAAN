import { describe, expect, it } from '@jest/globals';
import { resolveUniqueSlug, slugifyName } from './slug';

describe('slugifyName', () => {
  it('converts a name into a lowercase hyphenated slug', () => {
    expect(slugifyName('Linen Coord Set')).toBe('linen-coord-set');
  });

  it('strips special characters and collapses hyphens', () => {
    expect(slugifyName('  SAAN / Atelier  ')).toBe('saan-atelier');
  });

  it('falls back when the result would be empty', () => {
    expect(slugifyName('!!!')).toBe('item');
  });
});

describe('resolveUniqueSlug', () => {
  it('returns the base slug when it is available', async () => {
    const slug = await resolveUniqueSlug('Linen', async () => false);
    expect(slug).toBe('linen');
  });

  it('appends a numeric suffix when the base slug is taken', async () => {
    const taken = new Set(['linen', 'linen-2']);

    const slug = await resolveUniqueSlug('Linen', async (candidate) => taken.has(candidate));
    expect(slug).toBe('linen-3');
  });
});
