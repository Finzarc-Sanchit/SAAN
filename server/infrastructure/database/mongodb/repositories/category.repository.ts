import { Types } from 'mongoose';
import type { ICategoryRepository } from '../../../../modules/category/category.repository.interface';
import type {
  Category,
  CategoryListItem,
  CategoryRepositoryCreateInput,
  CategoryRepositoryUpdateInput,
} from '../../../../modules/category/category.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { CategoryModel, type CategoryDocument } from '../models/category.model';
import { ProductModel } from '../models/product.model';

function toDomainCategory(doc: CategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
  };
}

type CategoryProductCountRow = {
  _id: Types.ObjectId;
  count: number;
};

export class MongoCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await CategoryModel.findById(id).lean<CategoryDocument>().exec();
    return doc ? toDomainCategory(doc) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const doc = await CategoryModel.findOne({ slug: slug.toLowerCase() })
      .lean<CategoryDocument>()
      .exec();
    return doc ? toDomainCategory(doc) : null;
  }

  async findMany(): Promise<CategoryListItem[]> {
    const [docs, countRows] = await Promise.all([
      CategoryModel.find().sort({ name: 1 }).lean<CategoryDocument[]>().exec(),
      ProductModel.aggregate<CategoryProductCountRow>([
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const countByCategoryId = new Map(
      countRows.map((row) => [row._id.toString(), row.count] as const),
    );

    return docs.map((doc) => ({
      ...toDomainCategory(doc),
      productCount: countByCategoryId.get(doc._id.toString()) ?? 0,
    }));
  }

  async create(data: CategoryRepositoryCreateInput): Promise<Category> {
    const doc = await CategoryModel.create({
      name: data.name,
      slug: data.slug.toLowerCase(),
    });

    return toDomainCategory(doc.toObject() as CategoryDocument);
  }

  async update(id: string, data: CategoryRepositoryUpdateInput): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Category not found');
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (data.slug) {
      updatePayload.slug = data.slug.toLowerCase();
    }

    const doc = await CategoryModel.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })
      .lean<CategoryDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Category not found');
    }

    return toDomainCategory(doc);
  }

  async slugExists(slug: string, excludeCategoryId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug: slug.toLowerCase() };

    if (excludeCategoryId && Types.ObjectId.isValid(excludeCategoryId)) {
      query._id = { $ne: new Types.ObjectId(excludeCategoryId) };
    }

    const count = await CategoryModel.countDocuments(query).exec();
    return count > 0;
  }
}
