import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  listAddresses = async (req: Request, res: Response): Promise<void> => {
    const addresses = await this.userService.listAddresses(req.user!.id);
    res.status(200).json(successResponse(addresses));
  };

  addAddress = async (req: Request, res: Response): Promise<void> => {
    const address = await this.userService.addAddress(req.user!.id, req.body);
    res.status(201).json(successResponse(address));
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    const { addressId } = req.params as { addressId: string };
    const address = await this.userService.updateAddress(req.user!.id, addressId, req.body);
    res.status(200).json(successResponse(address));
  };

  removeAddress = async (req: Request, res: Response): Promise<void> => {
    const { addressId } = req.params as { addressId: string };
    await this.userService.removeAddress(req.user!.id, addressId);
    res.status(200).json(successResponse({ message: 'Address removed' }));
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    const { addressId } = req.params as { addressId: string };
    const address = await this.userService.setDefaultAddress(req.user!.id, addressId);
    res.status(200).json(successResponse(address));
  };
}
