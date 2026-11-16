import { apiClient } from "../../../lib/api-client";
import { useAuthStore, type AuthUser } from "../../../stores/auth.store";
import type { LoginCredentials, LoginResponseData } from "../types";

export async function login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  const payload = {
    email: credentials.email,
    username: credentials.email,
    password: credentials.password,
  };

  const response = await apiClient<LoginResponseData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token = response.token || response.accessToken || "";
  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email || response.user.username || credentials.email,
    fullName: response.user.fullName || response.user.username || response.user.email || "Pengguna",
    role: response.user.role,
    avatarUrl: response.user.avatarUrl || null,
  };

  useAuthStore.getState().setAuth(user, token, response.refreshToken);

  return { user, token };
}

export async function logout(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  try {
    await apiClient("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshToken || undefined }),
    });
  } catch {
    // Sesi lokal tetap dibersihkan meskipun server gagal
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiClient<{ data?: AuthUser } | AuthUser>("/auth/me", {
    method: "GET",
  });

  const rawUser = ("data" in response && response.data ? response.data : response) as any;
  const user: AuthUser = {
    id: rawUser.id,
    email: rawUser.email || rawUser.username || "",
    fullName: rawUser.fullName || rawUser.username || rawUser.email || "Pengguna",
    role: rawUser.role,
    avatarUrl: rawUser.avatarUrl || null,
  };

  return user;
}
