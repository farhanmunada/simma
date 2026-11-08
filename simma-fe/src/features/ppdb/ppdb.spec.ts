import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {
  if (typeof globalThis.localStorage === "undefined") {
    const store: Record<string, string> = {};
    const storageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      length: 0,
      key: () => null,
    };
    Object.defineProperty(globalThis, "localStorage", {
      value: storageMock,
      writable: true,
      configurable: true,
    });
  }
});

describe("PPDB Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required PPDB API hooks defined", async () => {
    const ppdbApi = await import("./api/ppdb.api");

    expect(typeof ppdbApi.usePpdbPublicInfo).toBe("function");
    expect(typeof ppdbApi.useRegisterApplicant).toBe("function");
    expect(typeof ppdbApi.useCheckPpdbStatus).toBe("function");
    expect(typeof ppdbApi.usePpdbStats).toBe("function");
    expect(typeof ppdbApi.usePpdbApplicants).toBe("function");
    expect(typeof ppdbApi.usePpdbApplicant).toBe("function");
    expect(typeof ppdbApi.useUpdateApplicantStatus).toBe("function");
    expect(typeof ppdbApi.useEnrollApplicant).toBe("function");
    expect(typeof ppdbApi.useDeleteApplicant).toBe("function");
  });

  it("should have public portal and dashboard page components defined", async () => {
    const portalModule = await import("./components/PpdbPublicPortalPage");
    const dashboardModule = await import("./components/PpdbDashboardPage");
    const routesModule = await import("./PpdbRoutes");

    expect(typeof portalModule.PpdbPublicPortalPage).toBe("function");
    expect(typeof dashboardModule.PpdbDashboardPage).toBe("function");
    expect(typeof routesModule.PpdbRoutes).toBe("function");
  });

  it("should export all necessary types and components from barrel index", async () => {
    const indexModule = await import("./index");

    expect(typeof indexModule.PpdbPublicPortalPage).toBe("function");
    expect(typeof indexModule.PpdbDashboardPage).toBe("function");
    expect(typeof indexModule.PpdbRoutes).toBe("function");
    expect(typeof indexModule.usePpdbApplicants).toBe("function");
    expect(typeof indexModule.useEnrollApplicant).toBe("function");
  });
});
