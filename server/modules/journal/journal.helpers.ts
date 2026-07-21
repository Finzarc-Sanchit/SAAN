import type { JournalContentBlock } from './journal.types';

const WORDS_PER_MINUTE = 200;
const MIN_READ_MINUTES = 1;
const MAX_READ_MINUTES = 999;

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Normalize content blocks — trim strings and drop empty / invalid entries. */
export function normalizeJournalBlocks(
  blocks: readonly JournalContentBlock[],
): JournalContentBlock[] {
  const normalized: JournalContentBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'image') {
      const src = block.src?.trim();
      if (!src) continue;
      const next: JournalContentBlock = { type: 'image', src };
      const alt = block.alt?.trim();
      const caption = block.caption?.trim();
      if (alt) next.alt = alt;
      if (caption) next.caption = caption;
      normalized.push(next);
      continue;
    }

    const value = block.value?.trim();
    if (!value) continue;

    if (block.type === 'heading') {
      normalized.push({
        type: 'heading',
        value,
        level: block.level === 3 ? 3 : 2,
      });
      continue;
    }

    normalized.push({ type: block.type, value });
  }

  return normalized;
}

/** Estimate reading time from excerpt + text blocks. */
export function calculateReadMinutes(
  excerpt: string,
  blocks: readonly JournalContentBlock[],
): number {
  const blockText = blocks
    .map((block) => {
      if (block.type === 'image') {
        return [block.alt, block.caption].filter(Boolean).join(' ');
      }
      return block.value ?? '';
    })
    .join(' ');

  const words = countWords(`${excerpt} ${blockText}`);
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return Math.min(MAX_READ_MINUTES, Math.max(MIN_READ_MINUTES, minutes || MIN_READ_MINUTES));
}
