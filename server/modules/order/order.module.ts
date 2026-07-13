import { RedisIdempotencyStore } from '../../infrastructure/database/redis/idempotency.store';
import { MongoOrderRepository } from '../../infrastructure/database/mongodb/repositories/order.repository';
import { cartService } from '../cart/cart.module';
import { productService } from '../product/product.module';
import { userService } from '../user/user.module';
import { OrderController } from './order.controller';
import { createOrderRoutes } from './order.routes';
import { OrderService } from './order.service';

const orderRepository = new MongoOrderRepository();
const idempotencyStore = new RedisIdempotencyStore();
const orderService = new OrderService(
  orderRepository,
  cartService,
  userService,
  productService,
  idempotencyStore,
);
const orderController = new OrderController(orderService);

export const orderRoutes = createOrderRoutes(orderController);

export { orderService, orderRepository, orderController, idempotencyStore };
