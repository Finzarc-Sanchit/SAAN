import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import type { CartService } from './cart.service';

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.cartService.getCartWithLiveData(req.user!.id);
    res.status(200).json(successResponse(cart));
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as AddCartItemDto;
    const cart = await this.cartService.addItem(req.user!.id, body);
    res.status(200).json(successResponse(cart));
  };

  updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
    const { cartItemId } = req.params as { cartItemId: string };
    const { quantity } = req.body as UpdateCartItemDto;
    const cart = await this.cartService.updateItemQuantity(req.user!.id, cartItemId, quantity);
    res.status(200).json(successResponse(cart));
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const { cartItemId } = req.params as { cartItemId: string };
    const cart = await this.cartService.removeItem(req.user!.id, cartItemId);
    res.status(200).json(successResponse(cart));
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    await this.cartService.clearCart(req.user!.id);
    res.status(200).json(successResponse({ message: 'Cart cleared' }));
  };
}
