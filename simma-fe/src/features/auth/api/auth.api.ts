import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { useAuthStore, type AuthUser } from "../../../stores/auth.store";
import type { LoginCredentials, LoginResponseData, TeacherScopeData } from "../types";

export async function login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
  const payload = {
    email: credentials.email,
    username: credentials.email,
    password: credentials.password,
  };

  const response = await apiClient<LoginResponseData>(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token = response.token || response.accessToken || "";
  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email || response.user.username || credentials.email,
    fullName: response.user.fullName || response.user.username || response.user.email || "Pengguna",
    role: response.user.role,
    secondaryRoles: response.user.secondaryRoles ?? [],
    teacherId: response.user.teacherId ?? null,
    avatarUrl: response.user.avatarUrl || null,
  };

  useAuthStore.getState().setAuth(user, token, response.refreshToken);

  return { user, token };
}

export async function logout(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  try {
    await apiClient(API_ENDPOINTS.AUTH.LOGOUT, {
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
  const response = await apiClient<{ data?: AuthUser } | AuthUser>(API_ENDPOINTS.AUTH.ME, {
    method: "GET",
  });

  const rawUser = ("data" in response && response.data ? response.data : response) as any;
  return {
    id: rawUser.id,
    email: rawUser.email || rawUser.username || "",
    fullName: rawUser.fullName || rawUser.username || rawUser.email || "Pengguna",
    role: rawUser.role,
    secondaryRoles: rawUser.secondaryRoles ?? [],
    teacherId: rawUser.teacherId ?? null,
    avatarUrl: rawUser.avatarUrl || null,
  };
}

export function useMyScope() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<TeacherScopeData>({
    queryKey: ["auth", "my-scope", userId],
    queryFn: () =>
      apiClient<{ data: TeacherScopeData }>(API_ENDPOINTS.AUTH.MY_SCOPE).then((r) => r.data),
    enabled: Boolean(isAuthenticated && userId),
    staleTime: 60 * 1000,
  });
}
