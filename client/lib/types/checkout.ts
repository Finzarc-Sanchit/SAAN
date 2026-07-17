export type BuyNowItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp?: number;
  currency: string;
  image: string;
  sizeLabel: string;
  sizeId: string;
  quantity: number;
};

export type InitiatePaymentResult = {
  paymentId: string;
  orderId: string;
  gatewayOrderId: string;
  /** Amount in smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
  paymentGateway: string;
  keyId: string;
};

export type VerifyPaymentInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type PlaceOrderAddressIdInput = {
  addressId: string;
};

export type PlaceOrderFreshAddressInput = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
};

export type PlaceOrderInput = PlaceOrderAddressIdInput | PlaceOrderFreshAddressInput;
