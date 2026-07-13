import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import type { IWishlistRepository } from '../../../../modules/wishlist/wishlist.repository.interface';
import type { Wishlist, WishlistItem } from '../../../../modules/wishlist/wishlist.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import {
  WishlistModel,
  type WishlistDocument,
  type WishlistItemDocument,
} from '../models/wishlist.model';

function toObjectId(id: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
}

function toDomainItem(doc: WishlistItemDocument): WishlistItem {
  return {
    wishlistItemId: doc.wishlistItemId,
    productId: doc.productId.toString(),
    addedAt: doc.addedAt,
  };
}

function toDomainWishlist(doc: WishlistDocument): Wishlist {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    items: doc.items.map(toDomainItem),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoWishlistRepository implements IWishlistRepository {
  async findByUserId(userId: string): Promise<Wishlist | null> {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      return null;
    }

    const doc = await WishlistModel.findOne({ userId: userObjectId }).lean<WishlistDocument>().exec();
    return doc ? toDomainWishlist(doc) : null;
  }

  async createForUser(userId: string): Promise<Wishlist> {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new NotFoundError('User not found');
    }

    const doc = await WishlistModel.create({
      userId: userObjectId,
      items: [],
    });

    return toDomainWishlist(doc.toObject() as WishlistDocument);
  }

  async addItem(userId: string, productId: string): Promise<Wishlist> {
    const userObjectId = toObjectId(userId);
    const productObjectId = toObjectId(productId);

    if (!userObjectId || !productObjectId) {
      throw new NotFoundError('Wishlist not found');
    }

    const newItem: WishlistItemDocument = {
      wishlistItemId: randomUUID(),
      productId: productObjectId,
      addedAt: new Date(),
    };

    const updated = await WishlistModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'items.productId': { $ne: productObjectId },
      },
      { $push: { items: newItem } },
      { new: true },
    )
      .lean<WishlistDocument>()
      .exec();

    if (updated) {
      return toDomainWishlist(updated);
    }

    const existing = await WishlistModel.findOne({ userId: userObjectId }).lean<WishlistDocument>().exec();
    if (!existing) {
      throw new NotFoundError('Wishlist not found');
    }

    return toDomainWishlist(existing);
  }

  async removeItem(userId: string, wishlistItemId: string): Promise<Wishlist> {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
      throw new NotFoundError('Wishlist not found');
    }

    const doc = await WishlistModel.findOneAndUpdate(
      { userId: userObjectId, 'items.wishlistItemId': wishlistItemId },
      {
        $pull: {
          items: { wishlistItemId },
        },
      },
      { new: true },
    )
      .lean<WishlistDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Wishlist item not found');
    }

    return toDomainWishlist(doc);
  }
}
