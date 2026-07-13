import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import type { WishlistController } from './wishlist.controller';
import {
  addWishlistItemBodyDto,
  moveToCartBodyDto,
  wishlistItemIdParamsDto,
} from './wishlist.dto';

export function createWishlistRoutes(wishlistController: WishlistController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', wishlistController.getWishlist);
  router.post('/items', validate(addWishlistItemBodyDto), wishlistController.addItem);
  router.delete(
    '/items/:wishlistItemId',
    validate(wishlistItemIdParamsDto, 'params'),
    wishlistController.removeItem,
  );
  router.post(
    '/items/:wishlistItemId/move-to-cart',
    validate(wishlistItemIdParamsDto, 'params'),
    validate(moveToCartBodyDto),
    wishlistController.moveToCart,
  );

  return router;
}
