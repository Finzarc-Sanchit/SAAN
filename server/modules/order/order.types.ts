export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderAddressSnapshot {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  orderItemId: string;
  productId: string;
  sizeId: string;
  productNameSnapshot: string;
  /** Primary product image at time of order (optional for legacy rows). */
  productImageSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  /** Customer-facing order id (e.g. 407-1298468-3682757) — used in confirmation URLs. */
  orderNumber: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemInput {
  productId: string;
  sizeId: string;
  productNameSnapshot: string;
  productImageSnapshot?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderInput {
  userId: string;
  addressSnapshot: OrderAddressSnapshot;
  items: CreateOrderItemInput[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
}

export type PlaceOrderAddressInput =
  | { addressId: string }
  | {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      apartment?: string | null;
      city: string;
      state: string;
      postalCode: string;
    };

export type AdminOrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  itemCount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: Date;
};

export type AdminOrderListFilter = {
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  search?: string;
  from?: Date;
  to?: Date;
};

export type AdminOrderDetail = Order & {
  customer: AdminOrderCustomer;
};
