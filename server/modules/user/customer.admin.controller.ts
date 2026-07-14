import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { AdminCustomerListQueryDto } from './customer.admin.dto';
import type { CustomerAdminService } from './customer.admin.service';

export class CustomerAdminController {
  constructor(private readonly customerAdminService: CustomerAdminService) {}

  listCustomers = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AdminCustomerListQueryDto;
    const { page, limit, search, isVerified, from, to } = query;

    const result = await this.customerAdminService.listCustomers(
      { search, isVerified, from, to },
      { page, limit },
    );

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  getCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const customer = await this.customerAdminService.getCustomerById(id);
    res.status(200).json(successResponse(customer));
  };
}
