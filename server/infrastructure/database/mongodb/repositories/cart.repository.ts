import { Types } from 'mongoose';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { ICartRepository } from '../../../../modules/cart/cart.repository.interface';
import type { AddCartItemInput, Cart, CartItem } from '../../../../modules/cart/cart.types';
import { CartModel, type CartDocument, type CartItemDocument } from '../models/cart.model';

function toDomainCartItem(doc: CartItemDocument): CartItem {
  return {
    cartItemId: doc._id.toString(),
    productId: doc.productId.toString(),
    sizeId: doc.sizeId,
    quantity: doc.quantity,
    addedAt: doc.addedAt,
  };
}

function toDomainCart(doc: CartDocument): Cart {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    items: doc.items.map(toDomainCartItem),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function buildAddItemPipeline(
  productObjectId: Types.ObjectId,
  sizeId: string,
  quantity: number,
  newItem: CartItemDocument,
): Record<string, unknown>[] {
  const itemsExpression = { $ifNull: ['$items', []] };
  const matchesLine = {
    $and: [
      { $eq: ['$$item.productId', productObjectId] },
      { $eq: ['$$item.sizeId', sizeId] },
    ],
  };

  return [
    {
      $set: {
        items: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: itemsExpression,
                      as: 'item',
                      cond: matchesLine,
                    },
                  },
                },
                0,
              ],
            },
            then: {
              $map: {
                input: itemsExpression,
                as: 'item',
                in: {
                  $cond: {
                    if: matchesLine,
                    then: {
                      $mergeObjects: [
                        '$$item',
                        { quantity: { $add: ['$$item.quantity', quantity] } },
                      ],
                    },
                    else: '$$item',
                  },
                },
              },
            },
            else: {
              $concatArrays: [itemsExpression, [newItem]],
            },
          },
        },
      },
    },
  ];
}

export class MongoCartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const doc = await CartModel.findOne({ userId }).lean<CartDocument>().exec();
    return doc ? toDomainCart(doc) : null;
  }

  async createForUser(userId: string): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true, new: true },
    )
      .lean<CartDocument>()
      .exec();

    return toDomainCart(doc);
  }

  async addItem(userId: string, item: AddCartItemInput): Promise<Cart> {
    const productObjectId = new Types.ObjectId(item.productId);
    const now = new Date();
    const newItem: CartItemDocument = {
      _id: new Types.ObjectId(),
      productId: productObjectId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      addedAt: now,
    };

    const doc = await CartModel.findOneAndUpdate(
      { userId },
      buildAddItemPipeline(productObjectId, item.sizeId, item.quantity, newItem),
      { new: true },
    )
      .lean<CartDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Cart not found');
    }

    return toDomainCart(doc);
  }

  async updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId, 'items._id': cartItemId },
      { $set: { 'items.$[target].quantity': quantity } },
      {
        arrayFilters: [{ 'target._id': new Types.ObjectId(cartItemId) }],
        new: true,
      },
    )
      .lean<CartDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Cart item not found');
    }

    return toDomainCart(doc);
  }

  async removeItem(userId: string, cartItemId: string): Promise<Cart> {
    const doc = await CartModel.findOneAndUpdate(
      { userId, 'items._id': cartItemId },
      {
        $pull: {
          items: { _id: new Types.ObjectId(cartItemId) },
        },
      },
      { new: true },
    )
      .lean<CartDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Cart item not found');
    }

    return toDomainCart(doc);
  }

  async clear(userId: string): Promise<void> {
    const doc = await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true },
    )
      .lean<CartDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Cart not found');
    }
  }
}
