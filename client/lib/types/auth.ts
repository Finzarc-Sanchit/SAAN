export type UserRole = 'customer' | 'admin';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  csrfToken?: string;
};

export type RegisterResponse = {
  email: string;
  message: string;
};

export type GenericMessageResponse = {
  message: string;
};

export type LogoutResponse = {
  message: string;
};
