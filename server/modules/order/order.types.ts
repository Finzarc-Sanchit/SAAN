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
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemInput {
  productId: string;
  sizeId: string;
  productNameSnapshot: string;
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
