import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env';
import type { CreateGatewayOrderResult, IPaymentGateway } from './payment-gateway.interface';

export class RazorpayGatewayService implements IPaymentGateway {
  private readonly client: Razorpay;

  constructor() {
    this.client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  getGatewayName(): string {
    return 'razorpay';
  }

  getPublicKeyId(): string {
    return env.RAZORPAY_KEY_ID;
  }

  async createGatewayOrder(
    amount: number,
    currency: string,
    internalOrderId: string,
  ): Promise<CreateGatewayOrderResult> {
    const order = await this.client.orders.create({
      amount,
      currency,
      receipt: internalOrderId,
    });

    return { gatewayOrderId: order.id };
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const body = typeof payload === 'string' ? payload : payload.toString('utf8');
    const expectedSignature = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  }
}
