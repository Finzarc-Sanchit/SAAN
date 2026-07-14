export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderAddressSnapshot = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
};

export type OrderItem = {
  orderItemId: string;
  productId: string;
  sizeId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  addressSnapshot: OrderAddressSnapshot;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminOrderListItem = {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  itemCount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
};

export type AdminOrderDetail = Order & {
  customer: AdminOrderCustomer;
};

export type AdminOrderListParams = {
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded';

export type Payment = {
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
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};
