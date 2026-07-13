import type {
  CreatePaymentInput,
  Payment,
  UpdatePaymentStatusOptions,
} from './payment.types';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  findByGatewayPaymentId(gatewayPaymentId: string): Promise<Payment | null>;
  findByGatewayOrderId(gatewayOrderId: string): Promise<Payment | null>;
  create(data: CreatePaymentInput): Promise<Payment>;
  updateStatus(
    id: string,
    status: Payment['status'],
    options?: UpdatePaymentStatusOptions,
  ): Promise<Payment>;
}
