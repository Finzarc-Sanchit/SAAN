import { MongoCartRepository } from '../../infrastructure/database/mongodb/repositories/cart.repository';
import { productRepository, productService } from '../product/product.module';
import { CartController } from './cart.controller';
import { createCartRoutes } from './cart.routes';
import { CartService } from './cart.service';

const cartRepository = new MongoCartRepository();
const cartService = new CartService(cartRepository, productRepository, productService);
const cartController = new CartController(cartService);

export const cartRoutes = createCartRoutes(cartController);

export { cartService, cartRepository, cartController };
