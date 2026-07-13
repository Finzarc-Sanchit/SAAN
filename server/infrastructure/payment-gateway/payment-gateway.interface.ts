export interface CreateGatewayOrderResult {
  gatewayOrderId: string;
}

export interface IPaymentGateway {
  createGatewayOrder(
    amount: number,
    currency: string,
    internalOrderId: string,
  ): Promise<CreateGatewayOrderResult>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
  getPublicKeyId(): string;
  getGatewayName(): string;
}
