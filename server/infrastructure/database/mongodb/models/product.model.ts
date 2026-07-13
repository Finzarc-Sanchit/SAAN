import { Schema, model, type Types } from 'mongoose';

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
    discountId: { type: Schema.Types.ObjectId, ref: 'Discount', required: false, default: null },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, trim: true },
    fabric: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
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

        if (ret.discountId) {
          ret.discountId = String(ret.discountId);
        } else {
          ret.discountId = null;
        }

        return ret;
      },
    },
  },
);

productSchema.index({ categoryId: 1, basePrice: 1 });
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
  discountId: Types.ObjectId | null;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  fabric: string;
  basePrice: number;
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
