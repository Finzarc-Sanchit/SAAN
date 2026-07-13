import type { UserRole } from '../../shared/constants';

export interface Address {
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
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  apartment?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  isDefault?: boolean;
}
