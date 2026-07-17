export type CartItem = {
  productId: string;
  /** Required for server cart sync / checkout. */
  sizeId?: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  size?: string;
};
