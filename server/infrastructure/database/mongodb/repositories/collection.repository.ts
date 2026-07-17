import { Types } from 'mongoose';
import type { ICollectionRepository } from '../../../../modules/collection/collection.repository.interface';
import type {
  Collection,
  CollectionRepositoryCreateInput,
  CollectionRepositoryUpdateInput,
} from '../../../../modules/collection/collection.types';
import { ConflictError } from '../../../../shared/errors/conflict-error';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { isMongoDuplicateKeyError } from '../../../../shared/utils/mongo';
import { CollectionModel, type CollectionDocument } from '../models/collection.model';
import { ProductModel } from '../models/product.model';

function toDomainCollection(doc: CollectionDocument, productCount = 0): Collection {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    tagline: doc.tagline,
    imageUrl: doc.imageUrl,
    imageAlt: doc.imageAlt,
    status: doc.status,
    sortOrder: doc.sortOrder,
    featured: doc.featured,
    productCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getProductCounts(collectionIds: Types.ObjectId[]): Promise<Map<string, number>> {
  if (collectionIds.length === 0) {
    return new Map();
  }

  const counts = await ProductModel.aggregate<{ _id: Types.ObjectId; productCount: number }>([
    { $match: { collectionId: { $in: collectionIds } } },
    { $group: { _id: '$collectionId', productCount: { $sum: 1 } } },
  ]).exec();

  return new Map(counts.map((entry) => [entry._id.toString(), entry.productCount]));
}

async function toDomainCollections(docs: CollectionDocument[]): Promise<Collection[]> {
  const counts = await getProductCounts(docs.map((doc) => doc._id));
  return docs.map((doc) => toDomainCollection(doc, counts.get(doc._id.toString()) ?? 0));
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function throwSlugConflict(error: unknown, slug: string): never {
  if (isMongoDuplicateKeyError(error)) {
    throw new ConflictError(`Collection slug "${slug}" is already in use`);
  }
  throw error;
}

export class MongoCollectionRepository implements ICollectionRepository {
  async findById(id: string): Promise<Collection | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await CollectionModel.findById(id).lean<CollectionDocument>().exec();
    if (!doc) return null;
    const counts = await getProductCounts([doc._id]);
    return toDomainCollection(doc, counts.get(doc._id.toString()) ?? 0);
  }

  async findByIds(ids: string[]): Promise<Collection[]> {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (objectIds.length === 0) {
      return [];
    }
    const docs = await CollectionModel.find({ _id: { $in: objectIds } })
      .lean<CollectionDocument[]>()
      .exec();
    return toDomainCollections(docs);
  }

  async findPublishedBySlug(slug: string): Promise<Collection | null> {
    const doc = await CollectionModel.findOne({
      slug: normalizeSlug(slug),
      status: 'published',
    })
      .lean<CollectionDocument>()
      .exec();
    if (!doc) return null;
    const counts = await getProductCounts([doc._id]);
    return toDomainCollection(doc, counts.get(doc._id.toString()) ?? 0);
  }

  async findMany(): Promise<Collection[]> {
    const docs = await CollectionModel.find()
      .sort({ sortOrder: 1, title: 1 })
      .lean<CollectionDocument[]>()
      .exec();
    return toDomainCollections(docs);
  }

  async findPublished(): Promise<Collection[]> {
    const docs = await CollectionModel.find({ status: 'published' })
      .sort({ sortOrder: 1, title: 1 })
      .lean<CollectionDocument[]>()
      .exec();
    return toDomainCollections(docs);
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug: normalizeSlug(slug) };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await CollectionModel.countDocuments(query).exec()) > 0;
  }

  async create(data: CollectionRepositoryCreateInput): Promise<Collection> {
    try {
      const doc = await CollectionModel.create({
        ...data,
        slug: normalizeSlug(data.slug),
        status: data.status ?? 'draft',
        featured: data.featured ?? false,
      });
      return toDomainCollection(doc.toObject() as CollectionDocument);
    } catch (error: unknown) {
      throwSlugConflict(error, data.slug);
    }
  }

  async update(id: string, data: CollectionRepositoryUpdateInput): Promise<Collection> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Collection not found');
    }
    const updatePayload: CollectionRepositoryUpdateInput = { ...data };
    if (data.slug !== undefined) {
      updatePayload.slug = normalizeSlug(data.slug);
    }
    try {
      const doc = await CollectionModel.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
        .lean<CollectionDocument>()
        .exec();
      if (!doc) {
        throw new NotFoundError('Collection not found');
      }
      const counts = await getProductCounts([doc._id]);
      return toDomainCollection(doc, counts.get(doc._id.toString()) ?? 0);
    } catch (error: unknown) {
      throwSlugConflict(error, data.slug ?? 'requested');
    }
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Collection not found');
    }
    const result = await CollectionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundError('Collection not found');
    }
  }

  async isCollectionInUse(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    return (await ProductModel.countDocuments({ collectionId: new Types.ObjectId(id) }).exec()) > 0;
  }
}
