import { createHmac } from 'crypto';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import { USER_ROLES } from '../../shared/constants';
import type { IPaymentGateway } from '../../infrastructure/payment-gateway/payment-gateway.interface';
import { RazorpayGatewayService } from '../../infrastructure/payment-gateway/razorpay-gateway.service';
import type { IOrderRepository } from '../order/order.repository.interface';
import type { Order } from '../order/order.types';
import type { IPaymentRepository } from './payment.repository.interface';
import { PaymentService } from './payment.service';
import type { Payment } from './payment.types';

jest.mock('razorpay', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  return {
    __esModule: true,
    default: jestGlobals.fn().mockImplementation(() => ({
      orders: {
        create: jestGlobals.fn(),
      },
    })),
  };
});

const RAZORPAY_SAMPLE_WEBHOOK_BODY = JSON.stringify({
  entity: 'event',
  account_id: 'acc_HjRrMR3JAXCmIJ',
  event: 'payment.captured',
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: 'pay_DEX6ipHsLiO4XX',
        entity: 'payment',
        amount: 10000,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_DEX6pnlpxyJrHo',
        method: 'card',
        captured: true,
        email: 'gaurav.kumar@example.com',
        contact: '+919999999999',
        created_at: 1567674795,
      },
    },
  },
  created_at: 1567674795,
});

function signRazorpayWebhook(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: '407-1298468-3682757',
    userId: 'user-1',
    addressSnapshot: {
      firstName: 'Test',
      lastName: 'User',
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
    shippingCharge: 0,
    total: 10000,
    currency: 'INR',
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function createPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'payment-1',
    orderId: 'order-1',
    paymentMethod: 'card',
    paymentGateway: 'razorpay',
    transactionId: null,
    gatewayOrderId: 'order_DEX6pnlpxyJrHo',
    gatewayPaymentId: null,
    amount: 10000,
    currency: 'INR',
    status: 'created',
    paidAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function createPaymentRepositoryMock(): jest.Mocked<IPaymentRepository> {
  return {
    findById: jest.fn(),
    findByOrderId: jest.fn(),
    findByGatewayPaymentId: jest.fn(),
    findByGatewayOrderId: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    findManyAdmin: jest.fn(),
  };
}

function createOrderRepositoryMock(): jest.Mocked<IOrderRepository> {
  return {
    findById: jest.fn(),
    findByOrderNumber: jest.fn(),
    findByIdOrNumber: jest.fn(),
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
    findManyAdmin: jest.fn(),
  };
}

function createPaymentGatewayMock(): jest.Mocked<IPaymentGateway> {
  return {
    createGatewayOrder: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    verifyCheckoutSignature: jest.fn(),
    getPublicKeyId: jest.fn<() => string>().mockReturnValue('rzp_test_key_id'),
    getGatewayName: jest.fn<() => string>().mockReturnValue('razorpay'),
  };
}

function createCartServiceMock(): { clearCart: jest.MockedFunction<(userId: string) => Promise<void>> } {
  return {
    clearCart: jest.fn<(userId: string) => Promise<void>>().mockResolvedValue(undefined),
  };
}

function createAuthRepositoryMock(): {
  findById: jest.MockedFunction<(id: string) => Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null>>;
} {
  return {
    findById: jest.fn<(id: string) => Promise<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    } | null>>().mockResolvedValue({
      id: 'user-1',
      email: 'customer@example.com',
      firstName: 'Test',
      lastName: 'User',
    }),
  };
}

function createEmailQueueMock(): { enqueue: jest.MockedFunction<(...args: unknown[]) => Promise<void>> } {
  return {
    enqueue: jest.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
  };
}

describe('PaymentService', () => {
  let paymentRepository: jest.Mocked<IPaymentRepository>;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;
  let cartService: { clearCart: jest.MockedFunction<(userId: string) => Promise<void>> };
  let authRepository: ReturnType<typeof createAuthRepositoryMock>;
  let emailQueue: ReturnType<typeof createEmailQueueMock>;
  let service: PaymentService;

  beforeEach(() => {
    paymentRepository = createPaymentRepositoryMock();
    orderRepository = createOrderRepositoryMock();
    paymentGateway = createPaymentGatewayMock();
    cartService = createCartServiceMock();
    authRepository = createAuthRepositoryMock();
    emailQueue = createEmailQueueMock();
    service = new PaymentService(
      paymentRepository,
      orderRepository,
      paymentGateway,
      cartService as unknown as import('../cart/cart.service').CartService,
      authRepository as unknown as import('../auth/auth.repository.interface').IAuthRepository,
      emailQueue as unknown as import('../../infrastructure/email/email-queue.interface').IEmailQueue,
    );
  });

  describe('initiatePayment', () => {
    it('rejects an already-paid order without creating a payment', async () => {
      orderRepository.findByIdOrNumber.mockResolvedValue(
        createOrder({ paymentStatus: 'paid', status: 'confirmed' }),
      );

      await expect(
        service.initiatePayment('order-1', 'user-1', USER_ROLES.CUSTOMER, 'card'),
      ).rejects.toThrow(ConflictError);

      expect(paymentGateway.createGatewayOrder).not.toHaveBeenCalled();
      expect(paymentRepository.create).not.toHaveBeenCalled();
    });

    it('creates a gateway order and local payment for a pending order', async () => {
      const order = createOrder();
      const payment = createPayment();

      orderRepository.findByIdOrNumber.mockResolvedValue(order);
      paymentRepository.findByOrderId.mockResolvedValue([]);
      paymentGateway.createGatewayOrder.mockResolvedValue({ gatewayOrderId: 'order_DEX6pnlpxyJrHo' });
      paymentRepository.create.mockResolvedValue(payment);

      const result = await service.initiatePayment(
        'order-1',
        'user-1',
        USER_ROLES.CUSTOMER,
        'card',
      );

      expect(paymentGateway.createGatewayOrder).toHaveBeenCalledWith(1_000_000, 'INR', 'order-1');
      expect(paymentRepository.create).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentMethod: 'card',
        paymentGateway: 'razorpay',
        gatewayOrderId: 'order_DEX6pnlpxyJrHo',
        amount: 10000,
        currency: 'INR',
        status: 'created',
      });
      expect(result.gatewayOrderId).toBe('order_DEX6pnlpxyJrHo');
      expect(result.amount).toBe(1_000_000);
      expect(result.keyId).toBe('rzp_test_key_id');
    });

    it('creates a fresh gateway order and retires any open payment sessions', async () => {
      const order = createOrder();
      const existing = createPayment({ status: 'created' });
      const payment = createPayment({ gatewayOrderId: 'order_new' });

      orderRepository.findByIdOrNumber.mockResolvedValue(order);
      paymentRepository.findByOrderId.mockResolvedValue([existing]);
      paymentRepository.updateStatus.mockResolvedValue({ ...existing, status: 'failed' });
      paymentGateway.createGatewayOrder.mockResolvedValue({ gatewayOrderId: 'order_new' });
      paymentRepository.create.mockResolvedValue(payment);

      const result = await service.initiatePayment(
        'order-1',
        'user-1',
        USER_ROLES.CUSTOMER,
        'card',
      );

      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(existing.id, 'failed');
      expect(paymentGateway.createGatewayOrder).toHaveBeenCalledWith(1_000_000, 'INR', 'order-1');
      expect(result.gatewayOrderId).toBe('order_new');
      expect(result.amount).toBe(1_000_000);
    });
  });

  describe('verifyCheckoutPayment', () => {
    it('marks payment and order paid when checkout signature is valid', async () => {
      const order = createOrder();
      const payment = createPayment();
      const paidPayment = createPayment({
        status: 'paid',
        gatewayPaymentId: 'pay_DEX6ipHsLiO4XX',
        transactionId: 'pay_DEX6ipHsLiO4XX',
        paidAt: new Date('2026-01-02'),
      });

      orderRepository.findByIdOrNumber.mockResolvedValue(order);
      paymentRepository.findByGatewayOrderId.mockResolvedValue(payment);
      paymentGateway.verifyCheckoutSignature.mockReturnValue(true);
      paymentRepository.updateStatus.mockResolvedValue(paidPayment);
      orderRepository.updatePaymentStatus.mockResolvedValue(
        createOrder({ paymentStatus: 'paid', status: 'confirmed' }),
      );
      orderRepository.updateStatus.mockResolvedValue(
        createOrder({ paymentStatus: 'paid', status: 'confirmed' }),
      );

      const result = await service.verifyCheckoutPayment('order-1', 'user-1', USER_ROLES.CUSTOMER, {
        razorpayOrderId: 'order_DEX6pnlpxyJrHo',
        razorpayPaymentId: 'pay_DEX6ipHsLiO4XX',
        razorpaySignature: 'valid-signature',
      });

      expect(result.status).toBe('paid');
      expect(orderRepository.updatePaymentStatus).toHaveBeenCalledWith('order-1', 'paid');
      expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', 'confirmed');
      expect(cartService.clearCart).toHaveBeenCalledWith('user-1');

      await Promise.resolve();
      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order-confirmation',
          to: 'customer@example.com',
          orderNumber: '407-1298468-3682757',
        }),
        { deduplicationId: 'order-confirmation-order-1' },
      );
      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order-admin-notification',
          customerEmail: 'customer@example.com',
          orderNumber: '407-1298468-3682757',
        }),
        { deduplicationId: 'order-admin-order-1' },
      );
    });

    it('rejects invalid checkout signatures', async () => {
      orderRepository.findByIdOrNumber.mockResolvedValue(createOrder());
      paymentRepository.findByGatewayOrderId.mockResolvedValue(createPayment());
      paymentGateway.verifyCheckoutSignature.mockReturnValue(false);

      await expect(
        service.verifyCheckoutPayment('order-1', 'user-1', USER_ROLES.CUSTOMER, {
          razorpayOrderId: 'order_DEX6pnlpxyJrHo',
          razorpayPaymentId: 'pay_DEX6ipHsLiO4XX',
          razorpaySignature: 'bad-signature',
        }),
      ).rejects.toThrow(UnauthorizedError);

      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('listPaymentsAdmin', () => {
    it('delegates to the repository with filters and pagination', async () => {
      paymentRepository.findManyAdmin.mockResolvedValue({
        items: [],
        page: 1,
        limit: 20,
        total: 0,
      });

      const result = await service.listPaymentsAdmin(
        { status: 'paid', search: 'customer@example.com' },
        { page: 1, limit: 20 },
      );

      expect(paymentRepository.findManyAdmin).toHaveBeenCalledWith(
        { status: 'paid', search: 'customer@example.com' },
        { page: 1, limit: 20 },
      );
      expect(result.total).toBe(0);
    });
  });

  describe('handleWebhook', () => {
    it('rejects invalid signatures without touching repository data', async () => {
      paymentGateway.verifyWebhookSignature.mockReturnValue(false);

      await expect(
        service.handleWebhook(RAZORPAY_SAMPLE_WEBHOOK_BODY, 'invalid-signature'),
      ).rejects.toThrow(UnauthorizedError);

      expect(paymentRepository.findByGatewayPaymentId).not.toHaveBeenCalled();
      expect(paymentRepository.findByGatewayOrderId).not.toHaveBeenCalled();
      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
      expect(orderRepository.updatePaymentStatus).not.toHaveBeenCalled();
      expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('is idempotent when the same paid webhook is processed twice', async () => {
      const paidPayment = createPayment({
        status: 'paid',
        gatewayPaymentId: 'pay_DEX6ipHsLiO4XX',
        paidAt: new Date('2026-01-02'),
      });

      paymentGateway.verifyWebhookSignature.mockReturnValue(true);
      paymentRepository.findByGatewayPaymentId.mockResolvedValue(paidPayment);

      await service.handleWebhook(
        RAZORPAY_SAMPLE_WEBHOOK_BODY,
        signRazorpayWebhook(RAZORPAY_SAMPLE_WEBHOOK_BODY, 'whsec_test_webhook_secret'),
      );

      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
      expect(orderRepository.updatePaymentStatus).not.toHaveBeenCalled();
      expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('marks payment and order as paid on a valid captured webhook', async () => {
      const pendingPayment = createPayment();
      const paidPayment = createPayment({
        status: 'paid',
        gatewayPaymentId: 'pay_DEX6ipHsLiO4XX',
        transactionId: 'pay_DEX6ipHsLiO4XX',
        paidAt: new Date('2026-01-02'),
      });

      paymentGateway.verifyWebhookSignature.mockReturnValue(true);
      paymentRepository.findByGatewayPaymentId.mockResolvedValue(null);
      paymentRepository.findByGatewayOrderId.mockResolvedValue(pendingPayment);
      paymentRepository.updateStatus.mockResolvedValue(paidPayment);
      orderRepository.updatePaymentStatus.mockResolvedValue(
        createOrder({ paymentStatus: 'paid', status: 'confirmed' }),
      );
      orderRepository.updateStatus.mockResolvedValue(
        createOrder({ paymentStatus: 'paid', status: 'confirmed' }),
      );

      await service.handleWebhook(
        RAZORPAY_SAMPLE_WEBHOOK_BODY,
        signRazorpayWebhook(RAZORPAY_SAMPLE_WEBHOOK_BODY, 'whsec_test_webhook_secret'),
      );

      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
        'payment-1',
        'paid',
        expect.objectContaining({
          gatewayPaymentId: 'pay_DEX6ipHsLiO4XX',
          transactionId: 'pay_DEX6ipHsLiO4XX',
        }),
      );
      expect(orderRepository.updatePaymentStatus).toHaveBeenCalledWith('order-1', 'paid');
      expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', 'confirmed');
    });
  });
});

describe('RazorpayGatewayService.verifyWebhookSignature', () => {
  it('validates Razorpay sample webhook payloads using HMAC SHA256', () => {
    const gateway = new RazorpayGatewayService();
    const signature = signRazorpayWebhook(
      RAZORPAY_SAMPLE_WEBHOOK_BODY,
      process.env.RAZORPAY_WEBHOOK_SECRET!,
    );

    expect(gateway.verifyWebhookSignature(RAZORPAY_SAMPLE_WEBHOOK_BODY, signature)).toBe(true);
    expect(gateway.verifyWebhookSignature(RAZORPAY_SAMPLE_WEBHOOK_BODY, 'bad-signature')).toBe(
      false,
    );
  });
});
