import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { resolveUniqueSlug } from '../../shared/utils/slug';
import type { ICollectionRepository } from './collection.repository.interface';
import type {
  Collection,
  CollectionRepositoryUpdateInput,
  CreateCollectionInput,
  UpdateCollectionInput,
} from './collection.types';

export class CollectionService {
  constructor(private readonly collectionRepository: ICollectionRepository) {}

  async listPublishedCollections(): Promise<Collection[]> {
    return this.collectionRepository.findPublished();
  }

  async getPublishedCollectionBySlug(slug: string): Promise<Collection> {
    const collection = await this.collectionRepository.findPublishedBySlug(slug);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    return collection;
  }

  async listCollections(): Promise<Collection[]> {
    return this.collectionRepository.findMany();
  }

  async getCollectionById(id: string): Promise<Collection> {
    const collection = await this.collectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    return collection;
  }

  async createCollection(input: CreateCollectionInput): Promise<Collection> {
    const slug = await this.resolveSlug(input.title);
    return this.collectionRepository.create({
      ...input,
      slug,
      status: input.status ?? 'draft',
      featured: input.featured ?? false,
    });
  }

  async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    await this.getCollectionById(id);
    const updatePayload: CollectionRepositoryUpdateInput = { ...input };
    if (input.title) {
      updatePayload.slug = await this.resolveSlug(input.title, id);
    }
    return this.collectionRepository.update(id, updatePayload);
  }

  async deleteCollection(id: string): Promise<void> {
    await this.getCollectionById(id);
    if (await this.collectionRepository.isCollectionInUse(id)) {
      throw new ConflictError(
        'This collection cannot be deleted while products are assigned to it',
      );
    }
    await this.collectionRepository.delete(id);
  }

  private resolveSlug(title: string, excludeId?: string): Promise<string> {
    return resolveUniqueSlug(
      title,
      (candidate) => this.collectionRepository.slugExists(candidate, excludeId),
      160,
    );
  }
}
