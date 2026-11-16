import type { UserRole, AuthUser } from "../../stores/auth.store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    fullName?: string;
    role: UserRole;
    avatarUrl?: string | null;
  };
}

export type { UserRole, AuthUser };
