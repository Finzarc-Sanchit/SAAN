import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ValidationError } from '../../shared/errors/validation-error';
import type { ICategoryRepository } from '../category/category.repository.interface';
import type { IOrderRepository } from '../order/order.repository.interface';
import type { IProductRepository } from '../product/product.repository.interface';
import type { IUserRepository } from '../user/user.repository.interface';
import type { IMonthlyTargetRepository } from './target.repository.interface';
import {
  AnalyticsService,
  MAX_STATISTICS_RANGE_MS,
  computeGrowthPercent,
  computePercentAchieved,
  fillMonthlySales,
} from './analytics.service';
import type { MonthlyTarget } from './analytics.types';
import type { Order } from '../order/order.types';
import type { Product } from '../product/product.types';

function createOrderRepositoryMock(): jest.Mocked<IOrderRepository> {
  return {
    findById: jest.fn(),
    findByUser: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    updatePaymentStatus: jest.fn(),
    getMonthlySales: jest.fn(),
    getRevenueBetween: jest.fn(),
    countOrdersBetween: jest.fn(),
    getTimeSeries: jest.fn(),
    getTopSellingProducts: jest.fn(),
    findRecent: jest.fn(),
  };
}

function createUserRepositoryMock(): jest.Mocked<IUserRepository> {
  return {
    findAddresses: jest.fn(),
    countAddresses: jest.fn(),
    addAddress: jest.fn(),
    updateAddress: jest.fn(),
    removeAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
    countUsersBetween: jest.fn(),
  };
}

function createTargetRepositoryMock(): jest.Mocked<IMonthlyTargetRepository> {
  return {
    findByMonthYear: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
  };
}

function createProductRepositoryMock(): jest.Mocked<IProductRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    adjustSizeStock: jest.fn(),
    findByIds: jest.fn(),
    slugExists: jest.fn(),
    updateRatings: jest.fn(),
  };
}

function createCategoryRepositoryMock(): jest.Mocked<ICategoryRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    slugExists: jest.fn(),
  };
}

describe('computeGrowthPercent', () => {
  it('returns percentage change when previous is non-zero', () => {
    expect(computeGrowthPercent(150, 100)).toBe(50);
    expect(computeGrowthPercent(50, 100)).toBe(-50);
  });

  it('returns 0 when previous is 0 (avoids divide-by-zero)', () => {
    expect(computeGrowthPercent(10, 0)).toBe(0);
    expect(computeGrowthPercent(0, 0)).toBe(0);
  });
});

describe('computePercentAchieved', () => {
  it('returns revenue / target * 100', () => {
    expect(computePercentAchieved(2500, 5000)).toBe(50);
  });

  it('returns 0 when target is unset or zero', () => {
    expect(computePercentAchieved(1000, 0)).toBe(0);
    expect(computePercentAchieved(0, 0)).toBe(0);
  });
});

describe('fillMonthlySales', () => {
  it('returns all 12 months even when some buckets are missing', () => {
    const result = fillMonthlySales([
      { month: 1, total: 1000 },
      { month: 3, total: 2500 },
    ]);

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ month: 'Jan', total: 1000 });
    expect(result[1]).toEqual({ month: 'Feb', total: 0 });
    expect(result[2]).toEqual({ month: 'Mar', total: 2500 });
    expect(result[11]).toEqual({ month: 'Dec', total: 0 });
  });
});

describe('AnalyticsService', () => {
  let orderRepository: jest.Mocked<IOrderRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let targetRepository: jest.Mocked<IMonthlyTargetRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let service: AnalyticsService;

  beforeEach(() => {
    orderRepository = createOrderRepositoryMock();
    userRepository = createUserRepositoryMock();
    targetRepository = createTargetRepositoryMock();
    productRepository = createProductRepositoryMock();
    categoryRepository = createCategoryRepositoryMock();
    service = new AnalyticsService(
      orderRepository,
      userRepository,
      targetRepository,
      productRepository,
      categoryRepository,
    );
  });

  it('getSummary computes growth from current vs previous month counts', async () => {
    const now = new Date(Date.UTC(2026, 6, 15));

    userRepository.countUsersBetween
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(10);
    orderRepository.countOrdersBetween
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(4);

    const summary = await service.getSummary(now);

    expect(summary).toEqual({
      customers: { count: 12, growthPercent: 20 },
      orders: { count: 8, growthPercent: 100 },
    });
  });

  it('getMonthlySales defaults to current year and fills 12 months', async () => {
    const now = new Date(Date.UTC(2026, 5, 1));
    orderRepository.getMonthlySales.mockResolvedValue([{ month: 6, total: 9000 }]);

    const sales = await service.getMonthlySales(undefined, now);

    expect(orderRepository.getMonthlySales).toHaveBeenCalledWith(2026);
    expect(sales).toHaveLength(12);
    expect(sales[5]).toEqual({ month: 'Jun', total: 9000 });
  });

  it('getTarget returns zeros when no monthly target is set', async () => {
    const now = new Date(Date.UTC(2026, 6, 15));
    targetRepository.findByMonthYear.mockResolvedValue(null);
    orderRepository.getRevenueBetween
      .mockResolvedValueOnce(4000)
      .mockResolvedValueOnce(2000)
      .mockResolvedValueOnce(500)
      .mockResolvedValueOnce(100);

    const target = await service.getTarget(now);

    expect(target.targetAmount).toBe(0);
    expect(target.percentAchieved).toBe(0);
    expect(target.revenueAmount).toBe(4000);
    expect(target.todayAmount).toBe(500);
    expect(target.revenueTrend).toBe('up');
    expect(target.todayTrend).toBe('up');
  });

  it('getTarget computes percentAchieved against configured target', async () => {
    const now = new Date(Date.UTC(2026, 6, 15));
    const monthlyTarget: MonthlyTarget = {
      id: 't1',
      month: 7,
      year: 2026,
      targetAmount: 10000,
      createdAt: now,
      updatedAt: now,
    };

    targetRepository.findByMonthYear
      .mockResolvedValueOnce(monthlyTarget)
      .mockResolvedValueOnce(null);
    orderRepository.getRevenueBetween
      .mockResolvedValueOnce(2500)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const target = await service.getTarget(now);

    expect(target.percentAchieved).toBe(25);
    expect(target.targetAmount).toBe(10000);
  });

  it('getStatistics rejects ranges longer than 2 years', async () => {
    const from = new Date('2020-01-01T00:00:00.000Z');
    const to = new Date(from.getTime() + MAX_STATISTICS_RANGE_MS + 1);

    await expect(service.getStatistics('monthly', from, to)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('getStatistics returns named orders and revenue series', async () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-04-01T00:00:00.000Z');

    orderRepository.getTimeSeries
      .mockResolvedValueOnce([
        { date: new Date('2026-01-01T00:00:00.000Z'), total: 3 },
        { date: new Date('2026-02-01T00:00:00.000Z'), total: 5 },
      ])
      .mockResolvedValueOnce([
        { date: new Date('2026-01-01T00:00:00.000Z'), total: 1500 },
        { date: new Date('2026-02-01T00:00:00.000Z'), total: 3000 },
      ]);

    const points = await service.getStatistics('monthly', from, to);

    expect(points).toEqual([
      { date: 'Jan 2026', orders: 3, revenue: 1500 },
      { date: 'Feb 2026', orders: 5, revenue: 3000 },
    ]);
  });

  it('getTopSellingProducts computes percent of total units sold', async () => {
    orderRepository.getTopSellingProducts.mockResolvedValue({
      items: [
        { productId: 'p1', productName: 'Linen Shirt', unitsSold: 40 },
        { productId: 'p2', productName: 'Silk Dress', unitsSold: 10 },
      ],
      totalUnitsSold: 100,
    });

    const product: Product = {
      id: 'p1',
      categoryId: 'c1',
      discountId: null,
      name: 'Linen Shirt',
      slug: 'linen-shirt',
      description: 'A linen shirt',
      shortDescription: 'Linen',
      fabric: 'Linen',
      basePrice: 5000,
      ratingsAverage: 0,
      ratingsCount: 0,
      stock: 10,
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      sizes: [],
      images: [{ imageId: 'i1', imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    productRepository.findByIds.mockResolvedValue([product]);

    const result = await service.getTopSellingProducts(5);

    expect(result).toEqual([
      {
        productId: 'p1',
        name: 'Linen Shirt',
        imageUrl: 'https://example.com/shirt.jpg',
        unitsSold: 40,
        percentOfTotal: 40,
      },
      {
        productId: 'p2',
        name: 'Silk Dress',
        imageUrl: null,
        unitsSold: 10,
        percentOfTotal: 10,
      },
    ]);
  });

  it('getRecentOrders enriches primary product and category', async () => {
    const order: Order = {
      id: 'o1',
      userId: 'u1',
      addressSnapshot: {
        firstName: 'A',
        lastName: 'B',
        phone: '1',
        address: 'x',
        apartment: null,
        city: 'Mumbai',
        state: 'MH',
        postalCode: '400001',
      },
      items: [
        {
          orderItemId: 'li1',
          productId: 'p1',
          sizeId: 's1',
          productNameSnapshot: 'Linen Shirt',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
        },
        {
          orderItemId: 'li2',
          productId: 'p1',
          sizeId: 's2',
          productNameSnapshot: 'Linen Shirt',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
        },
      ],
      subtotal: 10000,
      discount: 0,
      shippingCharge: 0,
      total: 10000,
      currency: 'INR',
      status: 'delivered',
      paymentStatus: 'paid',
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-01T00:00:00.000Z'),
    };

    orderRepository.findRecent.mockResolvedValue([order]);
    productRepository.findByIds.mockResolvedValue([
      {
        id: 'p1',
        categoryId: 'cat1',
        discountId: null,
        name: 'Linen Shirt',
        slug: 'linen-shirt',
        description: 'A linen shirt',
        shortDescription: 'Linen',
        fabric: 'Linen',
        basePrice: 5000,
        ratingsAverage: 0,
        ratingsCount: 0,
        stock: 10,
        status: 'active',
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        sizes: [],
        images: [{ imageId: 'i1', imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ]);
    categoryRepository.findMany.mockResolvedValue([
      {
        id: 'cat1',
        name: 'Ready-to-Wear',
        slug: 'ready-to-wear',
      },
    ]);

    const rows = await service.getRecentOrders(5);

    expect(rows).toEqual([
      {
        orderId: 'o1',
        productName: 'Linen Shirt',
        productImageUrl: 'https://example.com/shirt.jpg',
        variantCount: 2,
        categoryName: 'Ready-to-Wear',
        price: 10000,
        currency: 'INR',
        status: 'delivered',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ]);
  });
});
