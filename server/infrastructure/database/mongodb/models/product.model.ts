import { Schema, model, type Types } from 'mongoose';
import { PRODUCT_OCCASIONS, type ProductOccasion } from '../../../../shared/constants';

const productSizeSchema = new Schema(
  {
    sizeId: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    _id: false,
    timestamps: true,
  },
);

const productImageSchema = new Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    sortOrder: { type: Number, required: true, min: 0 },
  },
  {
    _id: true,
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.imageId = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

const productSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, trim: true },
    fabric: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true, maxlength: 100 },
    occasion: {
      type: [
        {
          type: String,
          enum: PRODUCT_OCCASIONS,
        },
      ],
      required: true,
      validate: {
        validator: (values: unknown[]) => Array.isArray(values) && values.length > 0,
        message: 'At least one occasion is required',
      },
      index: true,
    },
    fitNotes: { type: String, required: true, maxlength: 2000 },
    care: {
      type: [String],
      required: true,
      validate: {
        validator: (values: unknown[]) => Array.isArray(values) && values.length > 0,
        message: 'At least one care instruction is required',
      },
    },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    discountPercent: { type: Number, default: null, min: 1, max: 99 },
    discountEnabled: { type: Boolean, default: false },
    discountStartDate: { type: Date, default: null },
    discountEndDate: { type: Date, default: null },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    sizes: {
      type: [productSizeSchema],
      required: true,
      validate: {
        validator: (sizes: unknown[]) => Array.isArray(sizes) && sizes.length > 0,
        message: 'At least one size is required',
      },
    },
    images: {
      type: [productImageSchema],
      required: true,
      validate: {
        validator: (images: unknown[]) => Array.isArray(images) && images.length > 0,
        message: 'At least one image is required',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        if (ret.categoryId) {
          ret.categoryId = String(ret.categoryId);
        }
        if (ret.collectionId) {
          ret.collectionId = String(ret.collectionId);
        }

        if (ret.salePrice === undefined) {
          ret.salePrice = null;
        }
        if (ret.discountPercent === undefined) {
          ret.discountPercent = null;
        }
        if (ret.discountStartDate === undefined) {
          ret.discountStartDate = null;
        }
        if (ret.discountEndDate === undefined) {
          ret.discountEndDate = null;
        }

        return ret;
      },
    },
  },
);

productSchema.index({ categoryId: 1, basePrice: 1 });
productSchema.index({ collectionId: 1, status: 1 });
productSchema.index({ occasion: 1, status: 1 });
productSchema.index({ 'sizes.size': 1 });
productSchema.index({ 'sizes.sizeId': 1 });
productSchema.index({ name: 'text', description: 'text' });

export const ProductModel = model('Product', productSchema);

export type ProductSizeDocument = {
  sizeId: string;
  size: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImageDocument = {
  _id: Types.ObjectId;
  imageUrl: string;
  sortOrder: number;
};

export type ProductDocument = {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  collectionId?: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  fabric: string;
  /** Present on new documents; may be absent on legacy records until edited. */
  color?: string;
  occasion?: ProductOccasion | ProductOccasion[];
  fitNotes?: string;
  care?: string[];
  basePrice: number;
  salePrice: number | null;
  discountPercent: number | null;
  discountEnabled: boolean;
  discountStartDate: Date | null;
  discountEndDate: Date | null;
  ratingsAverage: number;
  ratingsCount: number;
  stock: number;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sizes: ProductSizeDocument[];
  images: ProductImageDocument[];
  createdAt: Date;
  updatedAt: Date;
};
