export interface CreateGatewayOrderResult {
  gatewayOrderId: string;
}

export interface IPaymentGateway {
  /**
   * @param amountSubunits Amount in the smallest currency unit (paise for INR).
   */
  createGatewayOrder(
    amountSubunits: number,
    currency: string,
    internalOrderId: string,
  ): Promise<CreateGatewayOrderResult>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
  verifyCheckoutSignature(
    gatewayOrderId: string,
    gatewayPaymentId: string,
    signature: string,
  ): boolean;
  getPublicKeyId(): string;
  getGatewayName(): string;
}
