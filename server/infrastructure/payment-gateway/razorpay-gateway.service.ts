import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env';
import type { CreateGatewayOrderResult, IPaymentGateway } from './payment-gateway.interface';

function equalHex(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

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
    amountSubunits: number,
    currency: string,
    internalOrderId: string,
  ): Promise<CreateGatewayOrderResult> {
    // Receipt must be unique per Razorpay order (max 40 chars).
    const receipt = `${internalOrderId.slice(-12)}-${Date.now().toString(36)}`.slice(0, 40);

    const order = await this.client.orders.create({
      amount: amountSubunits,
      currency,
      receipt,
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

    return equalHex(expectedSignature, signature);
  }

  verifyCheckoutSignature(
    gatewayOrderId: string,
    gatewayPaymentId: string,
    signature: string,
  ): boolean {
    if (!gatewayOrderId || !gatewayPaymentId || !signature) {
      return false;
    }

    const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    return equalHex(expectedSignature, signature);
  }
}
