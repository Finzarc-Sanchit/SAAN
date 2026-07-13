import type { Request, Response } from 'express';
import { USER_ROLES } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response';
import type { OrderListQueryDto, PlaceOrderDto, UpdateOrderStatusDto } from './order.dto';
import type { OrderService } from './order.service';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  listOrders = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.query as unknown as OrderListQueryDto;
    const result = await this.orderService.listOrdersForUser(req.user!.id, { page, limit });

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const isAdmin = req.user?.role === USER_ROLES.ADMIN;
    const order = await this.orderService.getOrderById(id, req.user!.id, isAdmin);
    res.status(200).json(successResponse(order));
  };

  placeOrder = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as PlaceOrderDto;
    const order = await this.orderService.placeOrder(req.user!.id, body, req.idempotencyKey!);
    res.status(201).json(successResponse(order));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body as UpdateOrderStatusDto;
    const order = await this.orderService.updateStatus(id, status);
    res.status(200).json(successResponse(order));
  };
}
