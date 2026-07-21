import { describe, expect, it } from '@jest/globals';
import { calculateReadMinutes, normalizeJournalBlocks } from './journal.helpers';

describe('journal.helpers', () => {
  it('drops empty blocks and normalizes heading levels', () => {
    expect(
      normalizeJournalBlocks([
        { type: 'paragraph', value: '  Hello world  ' },
        { type: 'paragraph', value: '   ' },
        { type: 'heading', value: 'Section', level: 3 },
        { type: 'heading', value: 'Other' },
        { type: 'image', src: 'https://example.com/a.jpg', alt: 'A' },
        { type: 'image', src: '  ' },
        { type: 'blockquote', value: 'Quiet luxury.' },
      ]),
    ).toEqual([
      { type: 'paragraph', value: 'Hello world' },
      { type: 'heading', value: 'Section', level: 3 },
      { type: 'heading', value: 'Other', level: 2 },
      { type: 'image', src: 'https://example.com/a.jpg', alt: 'A' },
      { type: 'blockquote', value: 'Quiet luxury.' },
    ]);
  });

  it('calculates a minimum read time of one minute', () => {
    expect(calculateReadMinutes('Short.', [])).toBe(1);
  });

  it('estimates read time from excerpt and block text', () => {
    const words = Array.from({ length: 450 }, (_, index) => `word${index}`).join(' ');
    expect(calculateReadMinutes(words, [{ type: 'paragraph', value: words }])).toBe(5);
  });
});
