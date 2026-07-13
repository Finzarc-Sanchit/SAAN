export type DiscountType = 'percentage' | 'flat';

export interface Discount {
  id: string;
  type: DiscountType;
  value: number;
  validFrom: Date;
  validTo: Date;
}

export type CreateDiscountInput = {
  type: DiscountType;
  value: number;
  validFrom: Date;
  validTo: Date;
};

export type UpdateDiscountInput = Partial<CreateDiscountInput>;
