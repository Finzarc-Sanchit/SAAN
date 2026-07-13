import { SIZE_ID_LENGTH, SIZE_ID_PREFIX, SIZE_ID_SUFFIX_LENGTH } from '../constants/size-id';

export function isValidSizeIdFormat(value: string): boolean {
  return (
    value.length === SIZE_ID_LENGTH &&
    value.startsWith(SIZE_ID_PREFIX) &&
    /^\d{12}$/.test(value)
  );
}

/** Generate a unique 12-digit size ID: fixed 7-digit prefix + random 5-digit suffix. */
export async function generateUniqueSizeId(
  exists: (sizeId: string) => Promise<boolean>,
): Promise<string> {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const suffix = String(Math.floor(Math.random() * 100_000)).padStart(SIZE_ID_SUFFIX_LENGTH, '0');
    const sizeId = `${SIZE_ID_PREFIX}${suffix}`;

    if (!(await exists(sizeId))) {
      return sizeId;
    }
  }

  throw new Error('Unable to generate a unique size ID');
}
