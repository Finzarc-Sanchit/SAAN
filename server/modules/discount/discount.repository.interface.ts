import type { CreateDiscountInput, Discount, UpdateDiscountInput } from './discount.types';

export interface IDiscountRepository {
  findById(id: string): Promise<Discount | null>;
  findMany(): Promise<Discount[]>;
  create(data: CreateDiscountInput): Promise<Discount>;
  update(id: string, data: UpdateDiscountInput): Promise<Discount>;
  delete(id: string): Promise<void>;
}
