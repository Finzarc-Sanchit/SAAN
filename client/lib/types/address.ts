export type Address = {
  addressId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export type CreateAddressInput = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
};
