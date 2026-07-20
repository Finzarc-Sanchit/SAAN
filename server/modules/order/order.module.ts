import { RedisIdempotencyStore } from '../../infrastructure/database/redis/idempotency.store';
import { MongoOrderRepository } from '../../infrastructure/database/mongodb/repositories/order.repository';
import { MongoPaymentRepository } from '../../infrastructure/database/mongodb/repositories/payment.repository';
import { authRepository } from '../auth/auth.module';
import { cartService } from '../cart/cart.module';
import { productService } from '../product/product.module';
import { userService } from '../user/user.module';
import { OrderController } from './order.controller';
import { createAdminOrderRoutes } from './order.admin.routes';
import { createOrderRoutes } from './order.routes';
import { OrderService } from './order.service';

const orderRepository = new MongoOrderRepository();
const paymentRepository = new MongoPaymentRepository();
const idempotencyStore = new RedisIdempotencyStore();
const orderService = new OrderService(
  orderRepository,
  cartService,
  userService,
  productService,
  idempotencyStore,
  authRepository,
  paymentRepository,
);
const orderController = new OrderController(orderService);

export const orderRoutes = createOrderRoutes(orderController);
export const adminOrderRoutes = createAdminOrderRoutes(orderController);

export { orderService, orderRepository, orderController, idempotencyStore };
