import type {
  Collection,
  CollectionRepositoryCreateInput,
  CollectionRepositoryUpdateInput,
} from './collection.types';

export interface ICollectionRepository {
  findById(id: string): Promise<Collection | null>;
  findByIds(ids: string[]): Promise<Collection[]>;
  findPublishedBySlug(slug: string): Promise<Collection | null>;
  findMany(): Promise<Collection[]>;
  findPublished(): Promise<Collection[]>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  create(data: CollectionRepositoryCreateInput): Promise<Collection>;
  update(id: string, data: CollectionRepositoryUpdateInput): Promise<Collection>;
  isCollectionInUse(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
