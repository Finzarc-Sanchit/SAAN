import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { ValidationError } from '../../shared/errors/validation-error';
import type { IAuthRepository } from '../auth/auth.repository.interface';
import type { CartService } from '../cart/cart.service';
import type { ProductService } from '../product/product.service';
import type { UserService } from '../user/user.service';
import type { IOrderRepository } from './order.repository.interface';
import { OrderService } from './order.service';
import type { Cart } from '../cart/cart.types';
import type { Order } from './order.types';
import type { Product } from '../product/product.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  collectionId: 'collection-1',
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'A linen shirt',
  shortDescription: 'Linen shirt',
  fabric: 'Linen',
  color: 'Ivory',
  occasion: ['Daily'],
  fitNotes: "Model is 5'6\" wearing S. Fit relaxed.",
  care: [
    'Dry Clean Only',
    'Do not Wash',
    'Do not Wring',
    'Iron at low temperature',
    'Tumble dry on Low Heat',
  ],
  basePrice: 5000,
  salePrice: null,
  discountPercent: null,
  discountEnabled: false,
  discountStartDate: null,
  discountEndDate: null,
  ratingsAverage: 0,
  ratingsCount: 0,
  stock: 15,
  status: 'active',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [
    {
      sizeId: 'size-1',
      size: 'S',
      quantity: 5,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      sizeId: 'size-2',
      size: 'M',
      quantity: 10,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ],
  images: [{ imageId: 'image-1', imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const discountedProduct: Product = {
  ...baseProduct,
  id: 'product-2',
  name: 'Silk Dress',
  basePrice: 10000,
  salePrice: 9000,
  discountPercent: 10,
  discountEnabled: true,
  discountStartDate: new Date('2026-01-01'),
  discountEndDate: new Date('2027-01-01'),
};

const cartWithItems: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      cartItemId: 'line-1',
      productId: 'product-1',
      sizeId: 'size-1',
      quantity: 2,
      addedAt: new Date('2026-01-02'),
    },
    {
      cartItemId: 'line-2',
      productId: 'product-2',
      sizeId: 'size-1',
      quantity: 1,
      addedAt: new Date('2026-01-02'),
    },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const savedAddress = {
  addressId: 'address-1',
  firstName: 'Asha',
  lastName: 'Mehta',
  phone: '+91 98765 43210',
  address: '12 MG Road',
  apartment: 'Apt 4B',
  city: 'Mumbai',
  state: 'Maharashtra',
  postalCode: '400001',
  isDefault: true,
};

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

function createCartServiceMock(): jest.Mocked<Pick<CartService, 'getCart' | 'clearCart'>> {
  return {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };
}

function createUserServiceMock(): jest.Mocked<Pick<UserService, 'getAddressById'>> {
  return {
    getAddressById: jest.fn(),
  };
}

function createProductServiceMock(): jest.Mocked<
  Pick<ProductService, 'getProductById' | 'computeEffectivePrice' | 'adjustStock'>
> {
  return {
    getProductById: jest.fn(),
    computeEffectivePrice: jest.fn(),
    adjustStock: jest.fn(),
  };
}

function createAuthRepositoryMock(): jest.Mocked<Pick<IAuthRepository, 'findById'>> {
  return {
    findById: jest.fn(),
  };
}

function createIdempotencyStoreMock(): jest.Mocked<IIdempotencyStore> {
  return {
    claimOrGetExisting: jest.fn(),
    markComplete: jest.fn(),
    markFailed: jest.fn(),
  };
}

describe('OrderService.placeOrder', () => {
  let orderRepository: jest.Mocked<IOrderRepository>;
  let cartService: jest.Mocked<Pick<CartService, 'getCart' | 'clearCart'>>;
  let userService: jest.Mocked<Pick<UserService, 'getAddressById'>>;
  let productService: jest.Mocked<
    Pick<ProductService, 'getProductById' | 'computeEffectivePrice' | 'adjustStock'>
  >;
  let idempotencyStore: jest.Mocked<IIdempotencyStore>;
  let authRepository: jest.Mocked<Pick<IAuthRepository, 'findById'>>;
  let orderService: OrderService;

  beforeEach(() => {
    orderRepository = createOrderRepositoryMock();
    cartService = createCartServiceMock();
    userService = createUserServiceMock();
    productService = createProductServiceMock();
    idempotencyStore = createIdempotencyStoreMock();
    authRepository = createAuthRepositoryMock();
    orderService = new OrderService(
      orderRepository,
      cartService as unknown as CartService,
      userService as unknown as UserService,
      productService as unknown as ProductService,
      idempotencyStore,
      authRepository as unknown as IAuthRepository,
    );

    idempotencyStore.claimOrGetExisting.mockResolvedValue({ type: 'claimed' });
    cartService.getCart.mockResolvedValue(cartWithItems);
    userService.getAddressById.mockResolvedValue(savedAddress);
    productService.getProductById.mockImplementation(async (id: string) => {
      if (id === 'product-1') {
        return baseProduct;
      }
      return discountedProduct;
    });
    productService.computeEffectivePrice.mockImplementation(async (product: Product) => {
      if (product.id === 'product-2') {
        return 9000;
      }
      return 5000;
    });
    productService.adjustStock.mockResolvedValue(baseProduct);
    cartService.clearCart.mockResolvedValue(undefined);
  });

  it('rejects an empty cart', async () => {
    cartService.getCart.mockResolvedValue({
      ...cartWithItems,
      items: [],
    });

    await expect(
      orderService.placeOrder('user-1', { addressId: savedAddress.addressId }, 'idem-1'),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(orderRepository.create).not.toHaveBeenCalled();
    expect(idempotencyStore.markFailed).toHaveBeenCalled();
  });

  it('snapshots the saved address when addressId is provided', async () => {
    const createdOrder: Order = {
      id: 'order-1',
      userId: 'user-1',
      addressSnapshot: {
        firstName: savedAddress.firstName,
        lastName: savedAddress.lastName,
        phone: savedAddress.phone,
        address: savedAddress.address,
        apartment: savedAddress.apartment,
        city: savedAddress.city,
        state: savedAddress.state,
        postalCode: savedAddress.postalCode,
      },
      items: [],
      subtotal: 0,
      discount: 0,
      shippingCharge: 0,
      total: 0,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.create.mockResolvedValue(createdOrder);

    await orderService.placeOrder('user-1', { addressId: savedAddress.addressId }, 'idem-1');

    expect(userService.getAddressById).toHaveBeenCalledWith('user-1', savedAddress.addressId);
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        addressSnapshot: {
          firstName: 'Asha',
          lastName: 'Mehta',
          phone: '+91 98765 43210',
          address: '12 MG Road',
          apartment: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
        },
      }),
    );
  });

  it('snapshots a fresh address payload without persisting it', async () => {
    orderRepository.create.mockImplementation(async (input) => ({
      id: 'order-1',
      userId: input.userId,
      addressSnapshot: input.addressSnapshot,
      items: input.items.map((item, index) => ({
        orderItemId: `item-${index}`,
        ...item,
      })),
      subtotal: input.subtotal,
      discount: input.discount,
      shippingCharge: input.shippingCharge,
      total: input.total,
      currency: input.currency,
      status: input.status,
      paymentStatus: input.paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await orderService.placeOrder(
      'user-1',
      {
        firstName: 'Riya',
        lastName: 'Kapoor',
        phone: '+91 90000 11111',
        address: '88 Park Street',
        apartment: null,
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700016',
      },
      'idem-2',
    );

    expect(userService.getAddressById).not.toHaveBeenCalled();
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        addressSnapshot: expect.objectContaining({
          firstName: 'Riya',
          city: 'Kolkata',
          apartment: null,
        }),
      }),
    );
  });

  it('computes totals server-side from live prices and snapshots line items', async () => {
    orderRepository.create.mockImplementation(async (input) => ({
      id: 'order-1',
      userId: input.userId,
      addressSnapshot: input.addressSnapshot,
      items: input.items.map((item, index) => ({
        orderItemId: `item-${index}`,
        ...item,
      })),
      subtotal: input.subtotal,
      discount: input.discount,
      shippingCharge: input.shippingCharge,
      total: input.total,
      currency: input.currency,
      status: input.status,
      paymentStatus: input.paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const order = await orderService.placeOrder(
      'user-1',
      { addressId: savedAddress.addressId },
      'idem-3',
    );

    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 20000,
        discount: 1000,
        shippingCharge: 0,
        total: 19000,
        items: [
          expect.objectContaining({
            productId: 'product-1',
            productNameSnapshot: 'Linen Shirt',
            quantity: 2,
            unitPrice: 5000,
            totalPrice: 10000,
          }),
          expect.objectContaining({
            productId: 'product-2',
            productNameSnapshot: 'Silk Dress',
            quantity: 1,
            unitPrice: 9000,
            totalPrice: 9000,
          }),
        ],
      }),
    );
    expect(order.total).toBe(19000);
    expect(cartService.clearCart).not.toHaveBeenCalled();
  });

  it('rolls back stock decremented for earlier items when a later item fails', async () => {
    productService.adjustStock
      .mockResolvedValueOnce(baseProduct)
      .mockRejectedValueOnce(new InsufficientStockError('Insufficient stock for Silk Dress'));

    await expect(
      orderService.placeOrder('user-1', { addressId: savedAddress.addressId }, 'idem-4'),
    ).rejects.toBeInstanceOf(InsufficientStockError);

    expect(productService.adjustStock).toHaveBeenCalledTimes(3);
    expect(productService.adjustStock).toHaveBeenNthCalledWith(1, 'product-1', 'size-1', -2);
    expect(productService.adjustStock).toHaveBeenNthCalledWith(2, 'product-2', 'size-1', -1);
    expect(productService.adjustStock).toHaveBeenNthCalledWith(3, 'product-1', 'size-1', 2);
    expect(orderRepository.create).not.toHaveBeenCalled();
    expect(cartService.clearCart).not.toHaveBeenCalled();
  });

  it('returns the existing order for a repeated idempotency key', async () => {
    const existingOrder: Order = {
      id: 'order-existing',
      userId: 'user-1',
      addressSnapshot: {
        firstName: 'Asha',
        lastName: 'Mehta',
        phone: '+91 98765 43210',
        address: '12 MG Road',
        apartment: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      items: [],
      subtotal: 10000,
      discount: 0,
      shippingCharge: 99,
      total: 10099,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    idempotencyStore.claimOrGetExisting.mockResolvedValue({
      type: 'existing',
      resourceId: 'order-existing',
    });
    orderRepository.findById.mockResolvedValue(existingOrder);

    const order = await orderService.placeOrder(
      'user-1',
      { addressId: savedAddress.addressId },
      'idem-repeat',
    );

    expect(order.id).toBe('order-existing');
    expect(cartService.getCart).not.toHaveBeenCalled();
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it('rejects concurrent duplicate placement while the first request is in progress', async () => {
    idempotencyStore.claimOrGetExisting.mockResolvedValue({ type: 'in_progress' });

    await expect(
      orderService.placeOrder('user-1', { addressId: savedAddress.addressId }, 'idem-busy'),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('cancelPendingOrder restores stock and marks the order cancelled', async () => {
    const pendingOrder = {
      id: 'order-pending',
      userId: 'user-1',
      addressSnapshot: {
        firstName: 'Asha',
        lastName: 'Rao',
        phone: '+91 98765 43210',
        address: '12 MG Road',
        apartment: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      items: [
        {
          orderItemId: 'line-1',
          productId: 'product-1',
          sizeId: 'size-m',
          productNameSnapshot: 'Linen Shirt',
          quantity: 1,
          unitPrice: 4500,
          totalPrice: 4500,
        },
      ],
      subtotal: 4500,
      discount: 0,
      shippingCharge: 0,
      total: 4500,
      currency: 'INR',
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.findById.mockResolvedValue(pendingOrder);
    orderRepository.updatePaymentStatus.mockResolvedValue({
      ...pendingOrder,
      paymentStatus: 'failed',
    });
    orderRepository.updateStatus.mockResolvedValue({
      ...pendingOrder,
      status: 'cancelled',
      paymentStatus: 'failed',
    });

    const result = await orderService.cancelPendingOrder('order-pending', 'user-1');

    expect(productService.adjustStock).toHaveBeenCalledWith('product-1', 'size-m', 1);
    expect(orderRepository.updatePaymentStatus).toHaveBeenCalledWith('order-pending', 'failed');
    expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-pending', 'cancelled');
    expect(result.status).toBe('cancelled');
  });
});

describe('computeOrderTotals', () => {
  it('applies free shipping above the merchandise threshold', async () => {
    const { computeOrderTotals } = await import('./order.pricing');

    const totals = computeOrderTotals([
      { quantity: 1, basePrice: 6000, unitPrice: 6000 },
    ]);

    expect(totals.subtotal).toBe(6000);
    expect(totals.discount).toBe(0);
    expect(totals.shippingCharge).toBe(0);
    expect(totals.total).toBe(6000);
  });
});
