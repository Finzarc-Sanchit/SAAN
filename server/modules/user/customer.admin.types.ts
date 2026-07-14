import type { Address } from './user.types';
import type { OrderPaymentStatus, OrderStatus } from '../order/order.types';

export type AdminCustomerListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: Date;
};

export type AdminCustomerListFilter = {
  search?: string;
  isVerified?: boolean;
  from?: Date;
  to?: Date;
};

export type AdminCustomerRecentOrder = {
  id: string;
  total: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  createdAt: Date;
};

export type AdminCustomerDetail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  addresses: Address[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  recentOrders: AdminCustomerRecentOrder[];
  createdAt: Date;
  updatedAt: Date;
};
