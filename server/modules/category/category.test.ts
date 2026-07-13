import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { ICategoryRepository } from './category.repository.interface';
import { CategoryService } from './category.service';
import type { Category } from './category.types';

const baseCategory: Category = {
  id: 'cat-1',
  name: 'Linen',
  slug: 'linen',
};

function createRepositoryMock(): jest.Mocked<ICategoryRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    slugExists: jest.fn(),
  };
}

describe('CategoryService', () => {
  let repository: jest.Mocked<ICategoryRepository>;
  let service: CategoryService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new CategoryService(repository);
  });

  it('createCategory auto-generates slug from name', async () => {
    repository.slugExists.mockResolvedValue(false);
    repository.create.mockResolvedValue(baseCategory);

    await service.createCategory({ name: 'Linen' });

    expect(repository.create).toHaveBeenCalledWith({ name: 'Linen', slug: 'linen' });
  });

  it('createCategory appends a suffix when the generated slug already exists', async () => {
    repository.slugExists.mockImplementation(async (slug) => slug === 'linen');
    repository.create.mockResolvedValue({ ...baseCategory, slug: 'linen-2' });

    await service.createCategory({ name: 'Linen' });

    expect(repository.create).toHaveBeenCalledWith({ name: 'Linen', slug: 'linen-2' });
  });

  it('updateCategory throws NotFoundError when category does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.updateCategory('missing', { name: 'New' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('getCategoryById returns category when found', async () => {
    repository.findById.mockResolvedValue(baseCategory);

    await expect(service.getCategoryById('cat-1')).resolves.toEqual(baseCategory);
  });
});
