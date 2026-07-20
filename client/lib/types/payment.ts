export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded';

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
  paidAt: string | null;
  createdAt: string;
};

export type AdminPaymentListParams = {
  status?: PaymentStatus;
  paymentMethod?: string;
  paymentGateway?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
