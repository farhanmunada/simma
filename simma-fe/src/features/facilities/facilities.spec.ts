import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";

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

describe("Facilities Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API hooks and methods defined", async () => {
    const api = await import("./api/facilities.api");

    expect(typeof api.useFacilityStats).toBe("function");
    expect(typeof api.useFacilityAssets).toBe("function");
    expect(typeof api.useFacilityScan).toBe("function");
    expect(typeof api.useCreateFacilityAsset).toBe("function");
    expect(typeof api.useUpdateFacilityAsset).toBe("function");
    expect(typeof api.useDeleteFacilityAsset).toBe("function");
    expect(typeof api.useFacilityLoans).toBe("function");
    expect(typeof api.useCreateFacilityLoan).toBe("function");
    expect(typeof api.useReturnFacilityLoan).toBe("function");
    expect(typeof api.useFacilityMaintenanceTickets).toBe("function");
    expect(typeof api.useCreateFacilityMaintenanceTicket).toBe("function");
    expect(typeof api.useUpdateFacilityMaintenanceTicket).toBe("function");
  });

  it("should define structured query keys for cache management", async () => {
    const { FACILITY_QUERY_KEYS } = await import("./api/facilities.api");

    expect(FACILITY_QUERY_KEYS.stats).toEqual(["facilities", "stats"]);
    expect(FACILITY_QUERY_KEYS.assets()).toEqual(["facilities", "assets", undefined]);
    expect(FACILITY_QUERY_KEYS.assetDetail("ast-1")).toEqual([
      "facilities",
      "assets",
      "detail",
      "ast-1",
    ]);
    expect(FACILITY_QUERY_KEYS.scan("qr-token")).toEqual([
      "facilities",
      "scan",
      "qr-token",
    ]);
    expect(FACILITY_QUERY_KEYS.loans()).toEqual(["facilities", "loans", undefined]);
    expect(FACILITY_QUERY_KEYS.maintenance()).toEqual([
      "facilities",
      "maintenance",
      undefined,
    ]);
  });

  it("should export pages and public hooks in public index", async () => {
    const mod = await import("./index");

    expect(mod.FacilitiesPage).toBeDefined();
    expect(mod.FacilityPublicScanPage).toBeDefined();
    expect(mod.useFacilityAssets).toBeDefined();
    expect(mod.useFacilityStats).toBeDefined();
  });
});
