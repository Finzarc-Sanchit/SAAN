import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ORDER_CONSTANTS } from '../../../modules/order/order.constants';
import { CounterModel } from './models/counter.model';
import { OrderModel } from './models/order.model';
import { allocateOrderNumber, formatOrderNumberParts } from './order-number';

jest.mock('./models/counter.model', () => ({
  CounterModel: {
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('./models/order.model', () => ({
  OrderModel: {
    findOne: jest.fn(),
  },
}));

describe('formatOrderNumberParts', () => {
  it('pads each segment to the marketplace-style width', () => {
    expect(formatOrderNumberParts(407, 1298468, 3682757)).toBe('407-1298468-3682757');
    expect(formatOrderNumberParts(100, 0, 1)).toBe('100-0000000-0000001');
  });
});

describe('allocateOrderNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a unique order number from the counter sequence', async () => {
    jest.mocked(CounterModel.findByIdAndUpdate).mockReturnValue({
      lean: () => ({
        exec: async () => ({ seq: 42 }),
      }),
    } as never);
    jest.mocked(OrderModel.findOne).mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: async () => null,
        }),
      }),
    } as never);

    const orderNumber = await allocateOrderNumber();

    expect(ORDER_CONSTANTS.ORDER_NUMBER_PATTERN.test(orderNumber)).toBe(true);
    expect(orderNumber.endsWith('-0000042')).toBe(true);
  });

  it('retries when a generated number already exists', async () => {
    jest
      .mocked(CounterModel.findByIdAndUpdate)
      .mockReturnValueOnce({
        lean: () => ({
          exec: async () => ({ seq: 1 }),
        }),
      } as never)
      .mockReturnValueOnce({
        lean: () => ({
          exec: async () => ({ seq: 2 }),
        }),
      } as never);

    jest
      .mocked(OrderModel.findOne)
      .mockReturnValueOnce({
        select: () => ({
          lean: () => ({
            exec: async () => ({ _id: 'existing' }),
          }),
        }),
      } as never)
      .mockReturnValueOnce({
        select: () => ({
          lean: () => ({
            exec: async () => null,
          }),
        }),
      } as never);

    const orderNumber = await allocateOrderNumber();

    expect(CounterModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(orderNumber.endsWith('-0000002')).toBe(true);
  });
});
