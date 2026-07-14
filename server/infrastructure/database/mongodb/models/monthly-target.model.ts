import { Schema, model, type Types } from 'mongoose';

const monthlyTargetSchema = new Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    targetAmount: { type: Number, required: true, min: 0 },
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

monthlyTargetSchema.index({ month: 1, year: 1 }, { unique: true });

export const MonthlyTargetModel = model('MonthlyTarget', monthlyTargetSchema);

export type MonthlyTargetDocument = {
  _id: Types.ObjectId;
  month: number;
  year: number;
  targetAmount: number;
  createdAt: Date;
  updatedAt: Date;
};
