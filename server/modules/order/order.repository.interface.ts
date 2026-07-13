import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { CreateOrderInput, Order, OrderPaymentStatus, OrderStatus } from './order.types';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUser(userId: string, pagination: Pagination): Promise<Paginated<Order>>;
  create(data: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  updatePaymentStatus(id: string, paymentStatus: OrderPaymentStatus): Promise<Order>;
}
