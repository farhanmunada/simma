import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStorage = vi.hoisted(() => {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    length: 0,
    key: () => null,
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
  return store;
});

import { useAuthStore } from "../../stores/auth.store";
import { login, logout, getMe } from "./api/auth.api";

describe("Auth Store & API Integration", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.restoreAllMocks();
  });

  it("should have initial unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should evaluate hasRole correctly", () => {
    const store = useAuthStore.getState();
    store.setAuth(
      {
        id: "user-1",
        email: "guru@simma.sch.id",
        fullName: "Ustadz Ahmad",
        role: "guru",
      },
      "fake-jwt-token"
    );

    const updatedState = useAuthStore.getState();
    expect(updatedState.hasRole("guru")).toBe(true);
    expect(updatedState.hasRole(["guru", "wali_kelas"])).toBe(true);
    expect(updatedState.hasRole("super_admin")).toBe(false);
    expect(updatedState.hasRole("admin_tu")).toBe(false);
  });

  it("super_admin should pass all hasRole checks", () => {
    const store = useAuthStore.getState();
    store.setAuth(
      {
        id: "admin-1",
        email: "admin@simma.sch.id",
        fullName: "Super Administrator",
        role: "super_admin",
      },
      "admin-token"
    );

    const updatedState = useAuthStore.getState();
    expect(updatedState.hasRole("guru")).toBe(true);
    expect(updatedState.hasRole("admin_tu")).toBe(true);
    expect(updatedState.hasRole("kepala_madrasah")).toBe(true);
  });

  it("login should set auth store state on success", async () => {
    const mockResponse = {
      token: "jwt-test-token",
      refreshToken: "refresh-test-token",
      user: {
        id: "u-123",
        email: "staff@simma.sch.id",
        fullName: "Staff TU",
        role: "admin_tu" as const,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await login({
      email: "staff@simma.sch.id",
      password: "password123",
    });

    expect(result.token).toBe("jwt-test-token");
    expect(result.user.role).toBe("admin_tu");

    const storeState = useAuthStore.getState();
    expect(storeState.isAuthenticated).toBe(true);
    expect(storeState.user?.email).toBe("staff@simma.sch.id");
    expect(storeState.token).toBe("jwt-test-token");
  });

  it("logout should clear auth store", async () => {
    const store = useAuthStore.getState();
    store.setAuth(
      {
        id: "u-123",
        email: "staff@simma.sch.id",
        fullName: "Staff TU",
        role: "admin_tu",
      },
      "jwt-test-token",
      "refresh-test-token"
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Logged out" }),
    });

    await logout();

    const clearedState = useAuthStore.getState();
    expect(clearedState.isAuthenticated).toBe(false);
    expect(clearedState.user).toBeNull();
    expect(clearedState.token).toBeNull();
  });

  it("getMe should fetch current user profile", async () => {
    const mockUserData = {
      id: "u-999",
      email: "kepala@simma.sch.id",
      fullName: "Drs. H. Ahmad Fauzi, M.Pd",
      role: "kepala_madrasah" as const,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: mockUserData }),
    });

    const user = await getMe();
    expect(user.id).toBe("u-999");
    expect(user.fullName).toBe("Drs. H. Ahmad Fauzi, M.Pd");
    expect(user.role).toBe("kepala_madrasah");
  });
});
