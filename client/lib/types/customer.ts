import type { OrderPaymentStatus, OrderStatus } from '@/lib/types/order';

export type CustomerAddress = {
  addressId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export type AdminCustomerListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
};

export type AdminCustomerRecentOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
};

export type AdminCustomerDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  addresses: CustomerAddress[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  recentOrders: AdminCustomerRecentOrder[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerListParams = {
  search?: string;
  isVerified?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
