import { create } from "zustand";

export type UserRole =
  | "super_admin"
  | "admin_tu"
  | "kepala_madrasah"
  | "waka_kurikulum"
  | "waka_kesiswaan"
  | "wali_kelas"
  | "guru_mapel"
  | "guru"
  | "siswa"
  | "orang_tua"
  | "calon_siswa";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
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
    localStorage.removeItem(STORAGE_KEY);
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
    if (user.role === "super_admin") return true;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(user.role);
  },
}));
