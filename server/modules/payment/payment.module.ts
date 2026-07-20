import { MongoPaymentRepository } from '../../infrastructure/database/mongodb/repositories/payment.repository';
import { emailQueue } from '../../infrastructure/email/email.module';
import { RazorpayGatewayService } from '../../infrastructure/payment-gateway/razorpay-gateway.service';
import { authRepository } from '../auth/auth.module';
import { cartService } from '../cart/cart.module';
import { orderRepository } from '../order/order.module';
import { PaymentController } from './payment.controller';
import { createOrderPaymentRoutes, createPaymentWebhookRoutes } from './payment.routes';
import { createAdminPaymentRoutes } from './payment.admin.routes';
import { PaymentService } from './payment.service';

const paymentRepository = new MongoPaymentRepository();
const paymentGateway = new RazorpayGatewayService();
const paymentService = new PaymentService(
  paymentRepository,
  orderRepository,
  paymentGateway,
  cartService,
  authRepository,
  emailQueue,
);
const paymentController = new PaymentController(paymentService);

export const orderPaymentRoutes = createOrderPaymentRoutes(paymentController);
export const paymentWebhookRoutes = createPaymentWebhookRoutes(paymentController);
export const adminPaymentRoutes = createAdminPaymentRoutes(paymentController);

export { paymentService, paymentRepository, paymentController, paymentGateway };
