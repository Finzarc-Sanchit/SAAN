import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { ICollectionRepository } from './collection.repository.interface';
import { CollectionService } from './collection.service';
import type { Collection, CreateCollectionInput } from './collection.types';

const baseCollection: Collection = {
  id: 'collection-1',
  slug: 'bloody-maroon',
  title: 'Bloody Maroon',
  description: 'A study in depth.',
  tagline: 'The red that commands a room.',
  imageUrl: 'https://example.com/bloody-maroon.jpg',
  imageAlt: 'Bloody Maroon',
  status: 'published',
  sortOrder: 0,
  featured: false,
  productCount: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const createInput: CreateCollectionInput = {
  title: baseCollection.title,
  description: baseCollection.description,
  tagline: baseCollection.tagline,
  imageUrl: baseCollection.imageUrl,
  imageAlt: baseCollection.imageAlt,
  sortOrder: 0,
};

function createCollectionRepositoryMock(): jest.Mocked<ICollectionRepository> {
  return {
    findById: jest.fn(),
    findByIds: jest.fn(),
    findPublishedBySlug: jest.fn(),
    findMany: jest.fn(),
    findPublished: jest.fn(),
    slugExists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    isCollectionInUse: jest.fn(),
    delete: jest.fn(),
  };
}

describe('CollectionService', () => {
  let collectionRepository: jest.Mocked<ICollectionRepository>;
  let service: CollectionService;

  beforeEach(() => {
    collectionRepository = createCollectionRepositoryMock();
    service = new CollectionService(collectionRepository);
  });

  it('returns published collections from the repository', async () => {
    collectionRepository.findPublished.mockResolvedValue([baseCollection]);

    await expect(service.listPublishedCollections()).resolves.toEqual([baseCollection]);
    expect(collectionRepository.findPublished).toHaveBeenCalledTimes(1);
  });

  it('returns a published collection by slug', async () => {
    collectionRepository.findPublishedBySlug.mockResolvedValue(baseCollection);

    await expect(service.getPublishedCollectionBySlug(baseCollection.slug)).resolves.toEqual(
      baseCollection,
    );
  });

  it('hides missing or unpublished slugs behind a not-found error', async () => {
    collectionRepository.findPublishedBySlug.mockResolvedValue(null);

    await expect(service.getPublishedCollectionBySlug('draft-collection')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('creates a draft, non-featured collection by default', async () => {
    collectionRepository.slugExists.mockResolvedValue(false);
    collectionRepository.create.mockResolvedValue({
      ...baseCollection,
      status: 'draft',
    });

    await service.createCollection(createInput);

    expect(collectionRepository.create).toHaveBeenCalledWith({
      ...createInput,
      slug: 'bloody-maroon',
      status: 'draft',
      featured: false,
    });
  });

  it('generates unique slugs when creating and renaming collections', async () => {
    collectionRepository.slugExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    collectionRepository.create.mockResolvedValue({
      ...baseCollection,
      slug: 'bloody-maroon-2',
    });

    await service.createCollection(createInput);
    expect(collectionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'bloody-maroon-2' }),
    );

    collectionRepository.findById.mockResolvedValue(baseCollection);
    collectionRepository.slugExists.mockResolvedValue(false);
    collectionRepository.update.mockResolvedValue({
      ...baseCollection,
      title: 'Evening Light',
      slug: 'evening-light',
    });

    await service.updateCollection(baseCollection.id, { title: 'Evening Light' });

    expect(collectionRepository.slugExists).toHaveBeenLastCalledWith(
      'evening-light',
      baseCollection.id,
    );
    expect(collectionRepository.update).toHaveBeenCalledWith(
      baseCollection.id,
      { title: 'Evening Light', slug: 'evening-light' },
    );
  });

  it('deletes an existing collection normally', async () => {
    collectionRepository.findById.mockResolvedValue(baseCollection);
    collectionRepository.isCollectionInUse.mockResolvedValue(false);
    collectionRepository.delete.mockResolvedValue();

    await service.deleteCollection(baseCollection.id);

    expect(collectionRepository.delete).toHaveBeenCalledWith(baseCollection.id);
  });

  it('prevents deleting a collection that still has products', async () => {
    collectionRepository.findById.mockResolvedValue({ ...baseCollection, productCount: 1 });
    collectionRepository.isCollectionInUse.mockResolvedValue(true);

    await expect(service.deleteCollection(baseCollection.id)).rejects.toBeInstanceOf(ConflictError);
    expect(collectionRepository.delete).not.toHaveBeenCalled();
  });
});
