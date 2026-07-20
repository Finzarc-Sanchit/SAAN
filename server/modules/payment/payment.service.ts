import { ConflictError } from '../../shared/errors/conflict-error';
import { ForbiddenError } from '../../shared/errors/forbidden-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import { USER_ROLES } from '../../shared/constants';
import type { UserRole } from '../../shared/constants';
import { env } from '../../config/env';
import { logger } from '../../middlewares/request-logger';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import type { IPaymentGateway } from '../../infrastructure/payment-gateway/payment-gateway.interface';
import { toSmallestCurrencyUnit } from '../../shared/utils/money';
import type { IAuthRepository } from '../auth/auth.repository.interface';
import type { CartService } from '../cart/cart.service';
import type { IOrderRepository } from '../order/order.repository.interface';
import type { Order } from '../order/order.types';
import type { IPaymentRepository } from './payment.repository.interface';
import type {
  AdminPaymentListFilter,
  AdminPaymentListItem,
  InitiatePaymentResult,
  Payment,
  RazorpayWebhookPayload,
  VerifyCheckoutPaymentInput,
} from './payment.types';
import type { Paginated, Pagination } from '../../shared/types/pagination';

const TERMINAL_PAYMENT_STATUSES = new Set<Payment['status']>(['paid', 'refunded']);

export class PaymentService {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly cartService: CartService,
    private readonly authRepository: IAuthRepository,
    private readonly emailQueue: IEmailQueue,
  ) {}

  async initiatePayment(
    orderId: string,
    userId: string,
    role: UserRole,
    paymentMethod: string,
  ): Promise<InitiatePaymentResult> {
    const order = await this.orderRepository.findByIdOrNumber(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    this.assertOrderAccess(order.userId, userId, role);

    if (order.paymentStatus !== 'pending') {
      throw new ConflictError('Order payment has already been processed');
    }

    const amountSubunits = toSmallestCurrencyUnit(order.total, order.currency);

    if (amountSubunits < 100) {
      throw new ConflictError('Order total is below the minimum payable amount');
    }

    // Invalidate open gateway sessions before creating a new one. Reusing an
    // order_id created under a previous RAZORPAY_KEY_ID causes checkout AJAX 400s.
    const existingPayments = await this.paymentRepository.findByOrderId(order.id);
    const openPayments = existingPayments.filter(
      (entry) => entry.status === 'created' || entry.status === 'pending',
    );

    await Promise.all(
      openPayments.map((entry) => this.paymentRepository.updateStatus(entry.id, 'failed')),
    );

    const { gatewayOrderId } = await this.paymentGateway.createGatewayOrder(
      amountSubunits,
      order.currency,
      order.id,
    );

    const payment = await this.paymentRepository.create({
      orderId: order.id,
      paymentMethod,
      paymentGateway: this.paymentGateway.getGatewayName(),
      gatewayOrderId,
      amount: order.total,
      currency: order.currency,
      status: 'created',
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      gatewayOrderId,
      /** Amount in smallest currency unit for Razorpay Checkout. */
      amount: amountSubunits,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      keyId: this.paymentGateway.getPublicKeyId(),
    };
  }

  async verifyCheckoutPayment(
    orderId: string,
    userId: string,
    role: UserRole,
    input: VerifyCheckoutPaymentInput,
  ): Promise<Payment> {
    const order = await this.orderRepository.findByIdOrNumber(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    this.assertOrderAccess(order.userId, userId, role);

    if (order.paymentStatus === 'paid') {
      const payments = await this.paymentRepository.findByOrderId(order.id);
      const paid = payments.find((entry) => entry.status === 'paid');
      if (paid) {
        return paid;
      }
    }

    if (order.paymentStatus !== 'pending') {
      throw new ConflictError('Order payment has already been processed');
    }

    const payment = await this.paymentRepository.findByGatewayOrderId(input.razorpayOrderId);

    if (!payment || payment.orderId !== order.id) {
      throw new NotFoundError('Payment not found for this order');
    }

    if (payment.status === 'paid') {
      return payment;
    }

    if (
      !this.paymentGateway.verifyCheckoutSignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature,
      )
    ) {
      logger.warn(
        { orderId: order.id, gatewayOrderId: input.razorpayOrderId },
        'Rejected checkout payment with invalid signature',
      );
      throw new UnauthorizedError('Invalid payment signature');
    }

    const updatedPayment = await this.paymentRepository.updateStatus(payment.id, 'paid', {
      paidAt: new Date(),
      gatewayPaymentId: input.razorpayPaymentId,
      transactionId: input.razorpayPaymentId,
    });

    await this.orderRepository.updatePaymentStatus(order.id, 'paid');
    const confirmedOrder = await this.orderRepository.updateStatus(order.id, 'confirmed');
    await this.cartService.clearCart(order.userId);

    // QStash publish only — never waits for SMTP.
    this.enqueueOrderPaidEmails(confirmedOrder);

    return updatedPayment;
  }

  async listPaymentsForOrder(
    orderId: string,
    userId: string,
    role: UserRole,
  ): Promise<Payment[]> {
    const order = await this.orderRepository.findByIdOrNumber(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    this.assertOrderAccess(order.userId, userId, role);

    return this.paymentRepository.findByOrderId(order.id);
  }

  async listPaymentsAdmin(
    filter: AdminPaymentListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminPaymentListItem>> {
    return this.paymentRepository.findManyAdmin(filter, pagination);
  }

  async handleWebhook(rawPayload: string | Buffer, signature: string): Promise<void> {
    const payloadString = typeof rawPayload === 'string' ? rawPayload : rawPayload.toString('utf8');

    if (!this.paymentGateway.verifyWebhookSignature(payloadString, signature)) {
      logger.warn({ signaturePresent: Boolean(signature) }, 'Rejected payment webhook with invalid signature');
      throw new UnauthorizedError('Invalid webhook signature');
    }

    const event = JSON.parse(payloadString) as RazorpayWebhookPayload;
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity) {
      logger.info({ event: event.event }, 'Ignoring payment webhook without payment entity');
      return;
    }

    const payment =
      (paymentEntity.id
        ? await this.paymentRepository.findByGatewayPaymentId(paymentEntity.id)
        : null) ??
      (paymentEntity.order_id
        ? await this.paymentRepository.findByGatewayOrderId(paymentEntity.order_id)
        : null);

    if (!payment) {
      logger.warn(
        {
          gatewayPaymentId: paymentEntity.id,
          gatewayOrderId: paymentEntity.order_id,
          event: event.event,
        },
        'Payment webhook received for unknown payment',
      );
      return;
    }

    const nextStatus = this.mapWebhookEventToStatus(event.event, paymentEntity.status);

    if (!nextStatus) {
      logger.info({ event: event.event, paymentId: payment.id }, 'Ignoring unsupported payment webhook event');
      return;
    }

    if (this.isIdempotentWebhook(payment.status, nextStatus)) {
      logger.info(
        { paymentId: payment.id, status: payment.status, event: event.event },
        'Skipping duplicate payment webhook',
      );
      return;
    }

    const paidAt = nextStatus === 'paid' ? new Date() : payment.paidAt;
    const updatedPayment = await this.paymentRepository.updateStatus(payment.id, nextStatus, {
      paidAt,
      gatewayPaymentId: paymentEntity.id,
      transactionId: paymentEntity.id,
    });

    if (nextStatus === 'paid') {
      await this.orderRepository.updatePaymentStatus(updatedPayment.orderId, 'paid');
      const confirmedOrder = await this.orderRepository.updateStatus(
        updatedPayment.orderId,
        'confirmed',
      );
      await this.cartService.clearCart(confirmedOrder.userId);
      this.enqueueOrderPaidEmails(confirmedOrder);
    } else if (nextStatus === 'failed') {
      await this.orderRepository.updatePaymentStatus(updatedPayment.orderId, 'failed');
    }
  }

  /**
   * Marks open gateway payments as failed when a pending order is abandoned.
   * Prevents reusing a Razorpay order created under a different key or amount.
   */
  async abandonOpenPayments(orderId: string): Promise<void> {
    const payments = await this.paymentRepository.findByOrderId(orderId);

    await Promise.all(
      payments
        .filter((entry) => entry.status === 'created' || entry.status === 'pending')
        .map((entry) => this.paymentRepository.updateStatus(entry.id, 'failed')),
    );
  }

  /**
   * Fire-and-forget QStash enqueue so verify/webhook responses are not blocked by SMTP.
   * Deduplication IDs keep client verify + webhook from double-sending.
   */
  private enqueueOrderPaidEmails(order: Order): void {
    void this.notifyOrderPaid(order).catch((error: unknown) => {
      logger.error(
        { err: error, orderId: order.id, orderNumber: order.orderNumber },
        'Failed to enqueue order paid emails',
      );
    });
  }

  private async notifyOrderPaid(order: Order): Promise<void> {
    const user = await this.authRepository.findById(order.userId);
    const rawEmail = user?.email?.trim();
    if (!user || !rawEmail) {
      logger.warn({ orderId: order.id }, 'Skipping order emails — customer email missing');
      return;
    }

    const customerEmail = rawEmail.toLowerCase();
    const customerName =
      `${order.addressSnapshot.firstName} ${order.addressSnapshot.lastName}`.trim() ||
      `${user.firstName} ${user.lastName}`.trim() ||
      'Customer';

    const itemSummary =
      order.items
        .map(
          (line) =>
            `${line.productNameSnapshot} × ${line.quantity}`,
        )
        .join('\n') || 'Order items';

    const confirmationUrl = `${env.APP_URL.replace(/\/$/, '')}/order-confirmation/${encodeURIComponent(order.orderNumber)}`;
    const adminOrderUrl = `${env.APP_URL.replace(/\/$/, '')}/admin/orders/${encodeURIComponent(order.orderNumber)}`;

    await Promise.all([
      this.emailQueue.enqueue(
        {
          type: 'order-confirmation',
          to: customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          total: order.total,
          currency: order.currency,
          itemSummary,
          confirmationUrl,
        },
        { deduplicationId: `order-confirmation-${order.id}` },
      ),
      this.emailQueue.enqueue(
        {
          type: 'order-admin-notification',
          customerName,
          customerEmail,
          orderNumber: order.orderNumber,
          total: order.total,
          currency: order.currency,
          itemSummary,
          adminOrderUrl,
        },
        { deduplicationId: `order-admin-${order.id}` },
      ),
    ]);
  }

  private assertOrderAccess(orderUserId: string, requestUserId: string, role: UserRole): void {
    if (role === USER_ROLES.ADMIN) {
      return;
    }

    if (orderUserId !== requestUserId) {
      throw new ForbiddenError('You do not have access to this order');
    }
  }

  private mapWebhookEventToStatus(
    event: string,
    entityStatus: string,
  ): Payment['status'] | null {
    if (event === 'payment.captured' || entityStatus === 'captured') {
      return 'paid';
    }

    if (event === 'payment.failed' || entityStatus === 'failed') {
      return 'failed';
    }

    return null;
  }

  private isIdempotentWebhook(currentStatus: Payment['status'], nextStatus: Payment['status']): boolean {
    if (currentStatus === nextStatus) {
      return true;
    }

    if (TERMINAL_PAYMENT_STATUSES.has(currentStatus) && nextStatus === 'paid') {
      return true;
    }

    return false;
  }
}
