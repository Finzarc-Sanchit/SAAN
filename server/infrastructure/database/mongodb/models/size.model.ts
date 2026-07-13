import { Schema, model, type Types } from 'mongoose';

const sizeSchema = new Schema(
  {
    sizeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
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

export const SizeModel = model('Size', sizeSchema);

export type SizeDocument = {
  _id: Types.ObjectId;
  sizeId: string;
  label: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
