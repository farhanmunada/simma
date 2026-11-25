import { create } from "zustand";
import type { Role } from "@simma/shared";

export type UserRole = Role | "siswa" | "orang_tua";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  secondaryRoles?: UserRole[];
  teacherId?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken?: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const STORAGE_KEY = "simma_auth";

function loadInitialState() {
  try {
    if (typeof localStorage === "undefined") {
      return {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token && parsed.user) {
        return {
          user: parsed.user as AuthUser,
          token: parsed.token as string,
          refreshToken: (parsed.refreshToken || null) as string | null,
          isAuthenticated: true,
        };
      }
    }
  } catch {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitialState(),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, token, refreshToken: refreshToken || null })
    );
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    const allRoles = [user.role, ...(user.secondaryRoles ?? [])];
    if (allRoles.includes("super_admin")) return true;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.some((r) => allRoles.includes(r));
  },
}));
