export type UserRole = 'USER' | 'ADMIN' | 'OWNER' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: string | null;
  discordId: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastIp?: string;
  loginAttempts?: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
  profileImage?: string;
  phoneNumber?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

export type UserWithoutPassword = Omit<User, 'password' | 'twoFactorSecret' | 'resetPasswordToken' | 'resetPasswordExpires'>;
