import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { SIZE_ID_PREFIX } from '../../shared/constants/size-id';
import type { ISizeRepository } from './size.repository.interface';
import { SizeService } from './size.service';
import type { GarmentSize } from './size.types';

const baseSize: GarmentSize = {
  id: 'size-doc-1',
  sizeId: `${SIZE_ID_PREFIX}00001`,
  label: 'M',
  sortOrder: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createRepositoryMock(): jest.Mocked<ISizeRepository> {
  return {
    findById: jest.fn(),
    findBySizeId: jest.fn(),
    findByLabel: jest.fn(),
    findMany: jest.fn(),
    findBySizeIds: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    sizeIdExists: jest.fn(),
    labelExists: jest.fn(),
    isSizeInUse: jest.fn(),
  };
}

describe('SizeService', () => {
  let repository: jest.Mocked<ISizeRepository>;
  let service: SizeService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new SizeService(repository);
    repository.sizeIdExists.mockResolvedValue(false);
    repository.labelExists.mockResolvedValue(false);
  });

  it('creates a size with a generated sizeId', async () => {
    repository.create.mockImplementation(async (data) => ({
      ...baseSize,
      label: data.label.toUpperCase(),
      sizeId: data.sizeId,
      sortOrder: data.sortOrder ?? 0,
    }));

    const result = await service.createSize({ label: 'M' });

    expect(result.sizeId.startsWith(SIZE_ID_PREFIX)).toBe(true);
    expect(result.label).toBe('M');
    expect(repository.create).toHaveBeenCalled();
  });

  it('throws ConflictError when label already exists', async () => {
    repository.labelExists.mockResolvedValue(true);

    await expect(service.createSize({ label: 'M' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('prevents deleting a size that is used by products', async () => {
    repository.findById.mockResolvedValue(baseSize);
    repository.isSizeInUse.mockResolvedValue(true);

    await expect(service.deleteSize('size-doc-1')).rejects.toBeInstanceOf(ConflictError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when updating a missing size', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.updateSize('missing', { label: 'L' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
