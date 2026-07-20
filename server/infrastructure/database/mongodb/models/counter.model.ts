import { Schema, model } from 'mongoose';

/**
 * Atomic sequence counters (e.g. customer-facing order numbers).
 * Kept in the Mongo infra layer so repositories can allocate IDs without races.
 */
const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

export const CounterModel = model('Counter', counterSchema);

export type CounterDocument = {
  _id: string;
  seq: number;
};
