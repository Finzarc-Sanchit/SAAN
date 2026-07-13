import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  addCartItemDto,
  cartItemIdParamsDto,
  updateCartItemDto,
} from './cart.dto';
import type { CartController } from './cart.controller';

export function createCartRoutes(cartController: CartController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', cartController.getCart);
  router.post('/items', validate(addCartItemDto), cartController.addItem);
  router.patch(
    '/items/:cartItemId',
    validate(cartItemIdParamsDto, 'params'),
    validate(updateCartItemDto),
    cartController.updateItemQuantity,
  );
  router.delete(
    '/items/:cartItemId',
    validate(cartItemIdParamsDto, 'params'),
    cartController.removeItem,
  );
  router.delete('/', cartController.clearCart);

  return router;
}
