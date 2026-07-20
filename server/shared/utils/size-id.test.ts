import { describe, expect, it, jest } from '@jest/globals';
import { SIZE_ID_PREFIX } from '../constants/size-id';
import { generateUniqueSizeId, isValidSizeIdFormat } from './size-id';

describe('isValidSizeIdFormat', () => {
  it('accepts 12-digit IDs with the fixed prefix', () => {
    expect(isValidSizeIdFormat(`${SIZE_ID_PREFIX}12345`)).toBe(true);
    expect(isValidSizeIdFormat('500000012345')).toBe(false);
    expect(isValidSizeIdFormat(`${SIZE_ID_PREFIX}1234`)).toBe(false);
  });
});

describe('generateUniqueSizeId', () => {
  it('generates a unique ID with the shared prefix', async () => {
    const exists = jest.fn<(sizeId: string) => Promise<boolean>>().mockResolvedValue(false);
    const sizeId = await generateUniqueSizeId(exists);

    expect(sizeId.startsWith(SIZE_ID_PREFIX)).toBe(true);
    expect(isValidSizeIdFormat(sizeId)).toBe(true);
    expect(exists).toHaveBeenCalledWith(sizeId);
  });

  it('retries when a generated ID already exists', async () => {
    const exists = jest
      .fn<(sizeId: string) => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const sizeId = await generateUniqueSizeId(exists);

    expect(exists).toHaveBeenCalledTimes(2);
    expect(isValidSizeIdFormat(sizeId)).toBe(true);
  });
});
