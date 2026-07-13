import { MongoWishlistRepository } from '../../infrastructure/database/mongodb/repositories/wishlist.repository';
import { cartService } from '../cart/cart.module';
import { productRepository, productService } from '../product/product.module';
import { WishlistController } from './wishlist.controller';
import { createWishlistRoutes } from './wishlist.routes';
import { WishlistService } from './wishlist.service';

const wishlistRepository = new MongoWishlistRepository();
const wishlistService = new WishlistService(
  wishlistRepository,
  productRepository,
  productService,
  cartService,
);
const wishlistController = new WishlistController(wishlistService);

export const wishlistRoutes = createWishlistRoutes(wishlistController);

export { wishlistService, wishlistRepository, wishlistController };
