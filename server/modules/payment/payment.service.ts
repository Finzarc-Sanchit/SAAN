import { ConflictError } from '../../shared/errors/conflict-error';
import { ForbiddenError } from '../../shared/errors/forbidden-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import { USER_ROLES } from '../../shared/constants';
import type { UserRole } from '../../shared/constants';
import { logger } from '../../middlewares/request-logger';
import type { IPaymentGateway } from '../../infrastructure/payment-gateway/payment-gateway.interface';
import type { IOrderRepository } from '../order/order.repository.interface';
import type { IPaymentRepository } from './payment.repository.interface';
import type {
  InitiatePaymentResult,
  Payment,
  RazorpayWebhookPayload,
} from './payment.types';

const TERMINAL_PAYMENT_STATUSES = new Set<Payment['status']>(['paid', 'refunded']);

export class PaymentService {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async initiatePayment(
    orderId: string,
    userId: string,
    role: UserRole,
    paymentMethod: string,
  ): Promise<InitiatePaymentResult> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    this.assertOrderAccess(order.userId, userId, role);

    if (order.paymentStatus !== 'pending') {
      throw new ConflictError('Order payment has already been processed');
    }

    const { gatewayOrderId } = await this.paymentGateway.createGatewayOrder(
      order.total,
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
      amount: payment.amount,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      keyId: this.paymentGateway.getPublicKeyId(),
    };
  }

  async listPaymentsForOrder(
    orderId: string,
    userId: string,
    role: UserRole,
  ): Promise<Payment[]> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    this.assertOrderAccess(order.userId, userId, role);

    return this.paymentRepository.findByOrderId(orderId);
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
      await this.orderRepository.updateStatus(updatedPayment.orderId, 'confirmed');
    } else if (nextStatus === 'failed') {
      await this.orderRepository.updatePaymentStatus(updatedPayment.orderId, 'failed');
    }
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
