import { Types } from 'mongoose';
import type { IProductRepository } from '../../../../modules/product/product.repository.interface';
import type {
  Product,
  ProductFilter,
  ProductImage,
  ProductListSort,
  ProductRepositoryCreateInput,
  ProductRepositoryUpdateInput,
  ProductSize,
} from '../../../../modules/product/product.types';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { isValidSizeIdFormat } from '../../../../shared/utils/size-id';
import {
  ProductModel,
  type ProductDocument,
  type ProductImageDocument,
  type ProductSizeDocument,
} from '../models/product.model';

function sumSizeQuantities(sizes: Pick<ProductSizeDocument, 'quantity'>[]): number {
  return sizes.reduce((total, item) => total + item.quantity, 0);
}

function toDomainSize(doc: ProductSizeDocument): ProductSize {
  return {
    sizeId: doc.sizeId,
    size: doc.size,
    quantity: doc.quantity,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toDomainImage(doc: ProductImageDocument): ProductImage {
  return {
    imageId: doc._id.toString(),
    imageUrl: doc.imageUrl,
    sortOrder: doc.sortOrder,
  };
}

function toDomainProduct(doc: ProductDocument): Product {
  return {
    id: doc._id.toString(),
    categoryId: doc.categoryId.toString(),
    discountId: doc.discountId ? doc.discountId.toString() : null,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    shortDescription: doc.shortDescription,
    fabric: doc.fabric,
    basePrice: doc.basePrice,
    ratingsAverage: doc.ratingsAverage,
    ratingsCount: doc.ratingsCount,
    stock: doc.stock,
    status: doc.status,
    isFeatured: doc.isFeatured,
    isNewArrival: doc.isNewArrival,
    isBestSeller: doc.isBestSeller,
    sizes: doc.sizes.map(toDomainSize),
    images: doc.images.map(toDomainImage),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function buildSort(sort?: ProductListSort): Record<string, 1 | -1> {
  switch (sort) {
    case 'price_asc':
      return { basePrice: 1 };
    case 'price_desc':
      return { basePrice: -1 };
    case 'name_asc':
      return { name: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

function buildMongoFilter(filter: ProductFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filter.categoryId) {
    query.categoryId = Types.ObjectId.isValid(filter.categoryId)
      ? new Types.ObjectId(filter.categoryId)
      : filter.categoryId;
  }

  if (filter.status) {
    query.status = filter.status;
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.basePrice = {
      ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
      ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
    };
  }

  if (filter.size) {
    query['sizes.size'] = filter.size;
  }

  if (filter.search) {
    query.$text = { $search: filter.search };
  }

  return query;
}

function buildCreatePayload(data: ProductRepositoryCreateInput): Record<string, unknown> {
  return {
    categoryId: new Types.ObjectId(data.categoryId),
    discountId: data.discountId ? new Types.ObjectId(data.discountId) : null,
    name: data.name,
    slug: data.slug.toLowerCase(),
    description: data.description,
    shortDescription: data.shortDescription,
    fabric: data.fabric,
    basePrice: data.basePrice,
    status: data.status,
    isFeatured: data.isFeatured,
    isNewArrival: data.isNewArrival,
    isBestSeller: data.isBestSeller,
    sizes: data.sizes,
    images: data.images,
    stock: sumSizeQuantities(data.sizes),
  };
}

export class MongoProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await ProductModel.findById(id).lean<ProductDocument>().exec();
    return doc ? toDomainProduct(doc) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const doc = await ProductModel.findOne({ slug: slug.toLowerCase() })
      .lean<ProductDocument>()
      .exec();
    return doc ? toDomainProduct(doc) : null;
  }

  async findMany(filter: ProductFilter, pagination: Pagination): Promise<Paginated<Product>> {
    const query = buildMongoFilter(filter);
    const skip = (pagination.page - 1) * pagination.limit;
    const sort = buildSort(filter.sort);

    const [docs, total] = await Promise.all([
      ProductModel.find(query).sort(sort).skip(skip).limit(pagination.limit).lean<ProductDocument[]>().exec(),
      ProductModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map(toDomainProduct),
      page: pagination.page,
      limit: pagination.limit,
      total,
    };
  }

  async create(data: ProductRepositoryCreateInput): Promise<Product> {
    const doc = await ProductModel.create(buildCreatePayload(data));
    return toDomainProduct(doc.toObject() as ProductDocument);
  }

  async update(id: string, data: ProductRepositoryUpdateInput): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Product not found');
    }

    const updatePayload: Record<string, unknown> = { ...data };

    if (data.categoryId) {
      updatePayload.categoryId = new Types.ObjectId(data.categoryId);
    }

    if (data.discountId !== undefined) {
      updatePayload.discountId = data.discountId ? new Types.ObjectId(data.discountId) : null;
    }

    if (data.slug) {
      updatePayload.slug = data.slug.toLowerCase();
    }

    if (data.sizes) {
      updatePayload.sizes = data.sizes;
      updatePayload.stock = sumSizeQuantities(data.sizes);
    }

    const doc = await ProductModel.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })
      .lean<ProductDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Product not found');
    }

    return toDomainProduct(doc);
  }

  async archive(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Product not found');
    }

    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true },
    ).exec();

    if (!doc) {
      throw new NotFoundError('Product not found');
    }
  }

  async adjustSizeStock(
    productId: string,
    sizeId: string,
    quantityDelta: number,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(productId) || !isValidSizeIdFormat(sizeId)) {
      return false;
    }

    const filter: Record<string, unknown> = {
      _id: new Types.ObjectId(productId),
      sizes: {
        $elemMatch: {
          sizeId,
          ...(quantityDelta < 0 ? { quantity: { $gte: -quantityDelta } } : {}),
        },
      },
    };

    const result = await ProductModel.updateOne(filter, [
      {
        $set: {
          sizes: {
            $map: {
              input: '$sizes',
              as: 's',
              in: {
                $cond: [
                  { $eq: ['$$s.sizeId', sizeId] },
                  {
                    $mergeObjects: [
                      '$$s',
                      { quantity: { $add: ['$$s.quantity', quantityDelta] } },
                    ],
                  },
                  '$$s',
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          stock: {
            $sum: {
              $map: {
                input: '$sizes',
                as: 's',
                in: '$$s.quantity',
              },
            },
          },
        },
      },
    ]).exec();

    return result.matchedCount > 0 && result.modifiedCount > 0;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const objectIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    const docs = await ProductModel.find({ _id: { $in: objectIds } })
      .lean<ProductDocument[]>()
      .exec();

    return docs.map(toDomainProduct);
  }

  async slugExists(slug: string, excludeProductId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug: slug.toLowerCase() };

    if (excludeProductId && Types.ObjectId.isValid(excludeProductId)) {
      query._id = { $ne: new Types.ObjectId(excludeProductId) };
    }

    const count = await ProductModel.countDocuments(query).exec();
    return count > 0;
  }

  async updateRatings(
    id: string,
    ratings: { ratingsAverage: number; ratingsCount: number },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Product not found');
    }

    const doc = await ProductModel.findByIdAndUpdate(
      id,
      {
        ratingsAverage: ratings.ratingsAverage,
        ratingsCount: ratings.ratingsCount,
      },
      { new: true },
    ).exec();

    if (!doc) {
      throw new NotFoundError('Product not found');
    }
  }
}
