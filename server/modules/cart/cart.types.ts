export interface CartItem {
  cartItemId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithLiveData {
  cartItemId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  addedAt: Date;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  sizeLabel: string;
  stock: number;
}

export interface CartWithLiveData {
  id: string;
  userId: string;
  items: CartItemWithLiveData[];
  createdAt: Date;
  updatedAt: Date;
}

export type AddCartItemInput = {
  productId: string;
  sizeId: string;
  quantity: number;
};
