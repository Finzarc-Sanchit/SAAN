import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IDiscountRepository } from './discount.repository.interface';
import { DiscountService } from './discount.service';
import type { Discount } from './discount.types';

const baseDiscount: Discount = {
  id: 'discount-1',
  type: 'percentage',
  value: 10,
  validFrom: new Date('2026-01-01'),
  validTo: new Date('2026-12-31'),
};

function createRepositoryMock(): jest.Mocked<IDiscountRepository> {
  return {
    findById: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('DiscountService', () => {
  let repository: jest.Mocked<IDiscountRepository>;
  let service: DiscountService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new DiscountService(repository);
  });

  it('updateDiscount throws NotFoundError when discount does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.updateDiscount('missing', { value: 20 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('deleteDiscount throws NotFoundError when discount does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.deleteDiscount('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getDiscountById returns discount when found', async () => {
    repository.findById.mockResolvedValue(baseDiscount);

    await expect(service.getDiscountById('discount-1')).resolves.toEqual(baseDiscount);
  });
});
