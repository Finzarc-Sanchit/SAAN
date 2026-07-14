import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import { createAddressDto } from '../user/address.dto';

const freshAddressDto = createAddressDto.omit({ isDefault: true });

export const placeOrderDto = z.union([
  z.object({
    addressId: z.string().uuid('Invalid address ID'),
  }),
  freshAddressDto,
]);

export const orderListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const orderIdParamsDto = z.object({
  id: z.string().min(1, 'Order ID is required'),
});

export const updateOrderStatusDto = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export const adminOrderListQueryDto = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  search: z.string().min(1).max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export type PlaceOrderDto = z.infer<typeof placeOrderDto>;
export type OrderListQueryDto = z.infer<typeof orderListQueryDto>;
export type OrderIdParamsDto = z.infer<typeof orderIdParamsDto>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusDto>;
export type AdminOrderListQueryDto = z.infer<typeof adminOrderListQueryDto>;
