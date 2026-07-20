import { describe, expect, it } from '@jest/globals';
import { getPrimaryProductImageUrl } from './product-image';

describe('getPrimaryProductImageUrl', () => {
  it('returns the lowest sortOrder image URL', () => {
    expect(
      getPrimaryProductImageUrl([
        { imageUrl: 'https://example.com/second.jpg', sortOrder: 1 },
        { imageUrl: 'https://example.com/first.jpg', sortOrder: 0 },
      ]),
    ).toBe('https://example.com/first.jpg');
  });

  it('returns null when no images exist', () => {
    expect(getPrimaryProductImageUrl([])).toBeNull();
    expect(getPrimaryProductImageUrl(undefined)).toBeNull();
  });
});
