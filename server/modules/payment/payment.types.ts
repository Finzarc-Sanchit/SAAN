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

export type AdminPaymentListFilter = {
  status?: PaymentStatus;
  paymentMethod?: string;
  paymentGateway?: string;
  search?: string;
  from?: Date;
  to?: Date;
};

export type AdminPaymentListItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
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
};

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
  /** Amount in smallest currency unit (paise for INR) for Razorpay Checkout. */
  amount: number;
  currency: string;
  paymentGateway: string;
  keyId: string;
}

export interface VerifyCheckoutPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
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
