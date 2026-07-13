export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: string;
  paymentGateway: string;
  transactionId: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  orderId: string;
  paymentMethod: string;
  paymentGateway: string;
  gatewayOrderId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface UpdatePaymentStatusOptions {
  paidAt?: Date | null;
  gatewayPaymentId?: string | null;
  transactionId?: string | null;
}

export interface InitiatePaymentResult {
  paymentId: string;
  orderId: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  keyId: string;
}

export interface RazorpayWebhookPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  method?: string;
}

export interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: RazorpayWebhookPaymentEntity;
    };
  };
}
