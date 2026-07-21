import { Schema, model, type Types } from 'mongoose';
import {
  JOURNAL_BLOCK_TYPES,
  JOURNAL_CATEGORIES,
  JOURNAL_STATUSES,
  type JournalBlockType,
  type JournalCategory,
  type JournalStatus,
} from '../../../../modules/journal/journal.types';

const contentBlockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: JOURNAL_BLOCK_TYPES,
    },
    value: { type: String, trim: true },
    level: { type: Number, enum: [2, 3] },
    src: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const journalSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 220,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1_200,
    },
    category: {
      type: String,
      required: true,
      enum: JOURNAL_CATEGORIES,
      index: true,
    },
    imageUrl: { type: String, required: true, trim: true },
    imageAlt: { type: String, required: true, trim: true, maxlength: 300 },
    blocks: { type: [contentBlockSchema], default: [] },
    status: {
      type: String,
      enum: JOURNAL_STATUSES,
      required: true,
      default: 'draft',
      index: true,
    },
    featured: { type: Boolean, required: true, default: false, index: true },
    readMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 999,
      default: 1,
    },
    publishedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

journalSchema.index({ status: 1, publishedAt: -1 });
journalSchema.index({ status: 1, category: 1, publishedAt: -1 });
journalSchema.index({ title: 'text', excerpt: 'text' });
journalSchema.index({ updatedAt: -1 });

export const JournalModel = model('Journal', journalSchema);

export type JournalBlockDocument = {
  type: JournalBlockType;
  value?: string;
  level?: 2 | 3;
  src?: string;
  alt?: string;
  caption?: string;
};

export type JournalDocument = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  imageUrl: string;
  imageAlt: string;
  blocks: JournalBlockDocument[];
  status: JournalStatus;
  featured: boolean;
  readMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
