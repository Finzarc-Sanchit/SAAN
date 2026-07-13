import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IDiscountRepository } from './discount.repository.interface';
import type { CreateDiscountInput, Discount, UpdateDiscountInput } from './discount.types';

export class DiscountService {
  constructor(private readonly discountRepository: IDiscountRepository) {}

  async listDiscounts(): Promise<Discount[]> {
    return this.discountRepository.findMany();
  }

  async createDiscount(input: CreateDiscountInput): Promise<Discount> {
    return this.discountRepository.create(input);
  }

  async updateDiscount(id: string, input: UpdateDiscountInput): Promise<Discount> {
    const existing = await this.discountRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Discount not found');
    }

    return this.discountRepository.update(id, input);
  }

  async deleteDiscount(id: string): Promise<void> {
    const existing = await this.discountRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Discount not found');
    }

    await this.discountRepository.delete(id);
  }

  async getDiscountById(id: string): Promise<Discount> {
    const discount = await this.discountRepository.findById(id);
    if (!discount) {
      throw new NotFoundError('Discount not found');
    }

    return discount;
  }
}
