import { MongoPaymentRepository } from '../../infrastructure/database/mongodb/repositories/payment.repository';
import { RazorpayGatewayService } from '../../infrastructure/payment-gateway/razorpay-gateway.service';
import { orderRepository } from '../order/order.module';
import { PaymentController } from './payment.controller';
import { createOrderPaymentRoutes, createPaymentWebhookRoutes } from './payment.routes';
import { PaymentService } from './payment.service';

const paymentRepository = new MongoPaymentRepository();
const paymentGateway = new RazorpayGatewayService();
const paymentService = new PaymentService(paymentRepository, orderRepository, paymentGateway);
const paymentController = new PaymentController(paymentService);

export const orderPaymentRoutes = createOrderPaymentRoutes(paymentController);
export const paymentWebhookRoutes = createPaymentWebhookRoutes(paymentController);

export { paymentService, paymentRepository, paymentController, paymentGateway };
