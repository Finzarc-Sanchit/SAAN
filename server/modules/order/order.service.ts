import { ConflictError } from '../../shared/errors/conflict-error';
import { ForbiddenError } from '../../shared/errors/forbidden-error';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import type { IIdempotencyStore } from '../../shared/idempotency/idempotency-store.interface';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { IAuthRepository } from '../auth/auth.repository.interface';
import type { CartService } from '../cart/cart.service';
import type { ProductService } from '../product/product.service';
import type { UserService } from '../user/user.service';
import { ORDER_CONSTANTS } from './order.constants';
import { computeOrderTotals } from './order.pricing';
import type { IOrderRepository } from './order.repository.interface';
import type {
  AdminOrderDetail,
  AdminOrderListFilter,
  AdminOrderListItem,
  Order,
  OrderAddressSnapshot,
  OrderPaymentStatus,
  OrderStatus,
  PlaceOrderAddressInput,
} from './order.types';

type PreparedOrderLine = {
  productId: string;
  sizeId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  basePrice: number;
};

type StockAdjustment = {
  productId: string;
  sizeId: string;
  quantity: number;
  productNameSnapshot: string;
};

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function toAddressSnapshot(address: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
}): OrderAddressSnapshot {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    address: address.address,
    apartment: address.apartment,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
  };
}

export class OrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly idempotencyStore: IIdempotencyStore,
    private readonly authRepository: IAuthRepository,
  ) {}

  async listOrdersForUser(userId: string, pagination: Pagination): Promise<Paginated<Order>> {
    return this.orderRepository.findByUser(userId, pagination);
  }

  async listOrdersAdmin(
    filter: AdminOrderListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminOrderListItem>> {
    return this.orderRepository.findManyAdmin(filter, pagination);
  }

  async getOrderAdminDetail(orderId: string): Promise<AdminOrderDetail> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const user = await this.authRepository.findById(order.userId);

    return {
      ...order,
      customer: user
        ? {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        : {
            email: 'Unknown',
            firstName: '',
            lastName: '',
          },
    };
  }

  async getOrderById(orderId: string, requesterId: string, isAdmin: boolean): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!isAdmin && order.userId !== requesterId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    return order;
  }

  async placeOrder(
    userId: string,
    addressInput: PlaceOrderAddressInput,
    idempotencyKey: string,
  ): Promise<Order> {
    const claim = await this.idempotencyStore.claimOrGetExisting(
      ORDER_CONSTANTS.IDEMPOTENCY_SCOPE,
      userId,
      idempotencyKey,
      ORDER_CONSTANTS.IDEMPOTENCY_TTL_SECONDS,
    );

    if (claim.type === 'existing') {
      const existingOrder = await this.orderRepository.findById(claim.resourceId);
      if (!existingOrder) {
        throw new NotFoundError('Order not found');
      }

      return existingOrder;
    }

    if (claim.type === 'in_progress') {
      throw new ConflictError('An order with this idempotency key is already being processed');
    }

    try {
      const order = await this.createOrderFromCart(userId, addressInput);

      await this.idempotencyStore.markComplete(
        ORDER_CONSTANTS.IDEMPOTENCY_SCOPE,
        userId,
        idempotencyKey,
        order.id,
        ORDER_CONSTANTS.IDEMPOTENCY_TTL_SECONDS,
      );

      return order;
    } catch (error) {
      await this.idempotencyStore.markFailed(
        ORDER_CONSTANTS.IDEMPOTENCY_SCOPE,
        userId,
        idempotencyKey,
      );
      throw error;
    }
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.orderRepository.updateStatus(orderId, status);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: OrderPaymentStatus): Promise<Order> {
    return this.orderRepository.updatePaymentStatus(orderId, paymentStatus);
  }

  private async createOrderFromCart(
    userId: string,
    addressInput: PlaceOrderAddressInput,
  ): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new ValidationError('Cart is empty', [
        { field: 'cart', message: 'Add items to your cart before placing an order' },
      ]);
    }

    const preparedLines = await this.prepareOrderLines(cart.items);
    const addressSnapshot = await this.resolveAddressSnapshot(userId, addressInput);
    const totals = computeOrderTotals(
      preparedLines.map((line) => ({
        quantity: line.quantity,
        basePrice: line.basePrice,
        unitPrice: line.unitPrice,
      })),
    );

    await this.decrementStockForLines(preparedLines);

    try {
      const order = await this.orderRepository.create({
        userId,
        addressSnapshot,
        items: preparedLines.map((line) => ({
          productId: line.productId,
          sizeId: line.sizeId,
          productNameSnapshot: line.productNameSnapshot,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingCharge: totals.shippingCharge,
        total: totals.total,
        currency: ORDER_CONSTANTS.CURRENCY,
        status: 'pending',
        paymentStatus: 'pending',
      });

      await this.cartService.clearCart(userId);
      return order;
    } catch (error) {
      await this.rollbackStock(
        preparedLines.map((line) => ({
          productId: line.productId,
          sizeId: line.sizeId,
          quantity: line.quantity,
          productNameSnapshot: line.productNameSnapshot,
        })),
      );
      throw error;
    }
  }

  private async prepareOrderLines(
    cartItems: Array<{
      productId: string;
      sizeId: string;
      quantity: number;
    }>,
  ): Promise<PreparedOrderLine[]> {
    const lines: PreparedOrderLine[] = [];

    for (const item of cartItems) {
      const product = await this.productService.getProductById(item.productId);

      if (product.status !== 'active') {
        throw new NotFoundError(`Product not found`);
      }

      const size = product.sizes.find((entry) => entry.sizeId === item.sizeId);
      if (!size) {
        throw new NotFoundError('Size not found');
      }

      if (item.quantity > size.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for ${product.name}`,
          [{ field: 'quantity', message: `Only ${size.quantity} available for size ${size.size}` }],
        );
      }

      const unitPrice = await this.productService.computeEffectivePrice(product);
      const totalPrice = roundMoney(item.quantity * unitPrice);

      lines.push({
        productId: item.productId,
        sizeId: item.sizeId,
        productNameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        basePrice: product.basePrice,
      });
    }

    return lines;
  }

  private async resolveAddressSnapshot(
    userId: string,
    addressInput: PlaceOrderAddressInput,
  ): Promise<OrderAddressSnapshot> {
    if ('addressId' in addressInput) {
      const address = await this.userService.getAddressById(userId, addressInput.addressId);
      return toAddressSnapshot(address);
    }

    return toAddressSnapshot({
      firstName: addressInput.firstName,
      lastName: addressInput.lastName,
      phone: addressInput.phone,
      address: addressInput.address,
      apartment: addressInput.apartment ?? null,
      city: addressInput.city,
      state: addressInput.state,
      postalCode: addressInput.postalCode,
    });
  }

  private async decrementStockForLines(lines: PreparedOrderLine[]): Promise<void> {
    const decremented: StockAdjustment[] = [];

    try {
      for (const line of lines) {
        try {
          await this.productService.adjustStock(line.productId, line.sizeId, -line.quantity);
          decremented.push({
            productId: line.productId,
            sizeId: line.sizeId,
            quantity: line.quantity,
            productNameSnapshot: line.productNameSnapshot,
          });
        } catch (error) {
          if (error instanceof InsufficientStockError) {
            throw new InsufficientStockError(
              `Insufficient stock for ${line.productNameSnapshot}`,
              [
                {
                  field: 'quantity',
                  message: `Not enough stock available for ${line.productNameSnapshot}`,
                },
              ],
            );
          }

          throw error;
        }
      }
    } catch (error) {
      await this.rollbackStock(decremented);
      throw error;
    }
  }

  private async rollbackStock(adjustments: StockAdjustment[]): Promise<void> {
    for (const adjustment of [...adjustments].reverse()) {
      await this.productService.adjustStock(
        adjustment.productId,
        adjustment.sizeId,
        adjustment.quantity,
      );
    }
  }
}
