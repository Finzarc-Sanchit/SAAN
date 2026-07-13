import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { WishlistService } from './wishlist.service';

export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  getWishlist = async (req: Request, res: Response): Promise<void> => {
    const wishlist = await this.wishlistService.getWishlistWithLiveData(req.user!.id);
    res.status(200).json(successResponse(wishlist));
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const wishlist = await this.wishlistService.addItem(req.user!.id, req.body.productId);
    res.status(201).json(successResponse(wishlist));
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const { wishlistItemId } = req.params as { wishlistItemId: string };
    const wishlist = await this.wishlistService.removeItem(req.user!.id, wishlistItemId);
    res.status(200).json(successResponse(wishlist));
  };

  moveToCart = async (req: Request, res: Response): Promise<void> => {
    const { wishlistItemId } = req.params as { wishlistItemId: string };
    const { sizeId, quantity } = req.body as { sizeId: string; quantity: number };
    const wishlist = await this.wishlistService.moveToCart(
      req.user!.id,
      wishlistItemId,
      sizeId,
      quantity,
    );
    res.status(200).json(successResponse(wishlist));
  };
}
