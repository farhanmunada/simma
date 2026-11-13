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

describe("Mutabaah Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API hooks defined", async () => {
    const api = await import("./api/mutabaah.api");

    expect(typeof api.useMutabaahActivities).toBe("function");
    expect(typeof api.useCreateMutabaahActivity).toBe("function");
    expect(typeof api.useUpdateMutabaahActivity).toBe("function");
    expect(typeof api.useDeleteMutabaahActivity).toBe("function");
    expect(typeof api.useDailyChecklist).toBe("function");
    expect(typeof api.useSaveDailyChecklist).toBe("function");
    expect(typeof api.useUzurRecords).toBe("function");
    expect(typeof api.useCreateUzurRecord).toBe("function");
    expect(typeof api.useDeleteUzurRecord).toBe("function");
    expect(typeof api.useComplianceRecap).toBe("function");
    expect(typeof api.useEarlyWarnings).toBe("function");
    expect(typeof api.fetchMonthlyReportPdf).toBe("function");
  });

  it("should define structured query keys for cache invalidation", async () => {
    const { mutabaahKeys } = await import("./api/mutabaah.api");

    expect(mutabaahKeys.all).toEqual(["mutabaah"]);
    expect(mutabaahKeys.activities()).toEqual(["mutabaah", "activities", { category: undefined }]);
    expect(mutabaahKeys.checklist({ date: "2026-11-10" })).toEqual([
      "mutabaah",
      "checklist",
      { date: "2026-11-10" },
    ]);
    expect(mutabaahKeys.uzur("s1")).toEqual(["mutabaah", "uzur", { studentId: "s1" }]);
  });

  it("should export all pages and UI components", async () => {
    const mod = await import("./index");

    expect(mod.MutabaahDailyChecklistPage).toBeDefined();
    expect(mod.MutabaahCompliancePage).toBeDefined();
    expect(mod.MutabaahActivitiesPage).toBeDefined();
    expect(mod.MutabaahRoutes).toBeDefined();
    expect(mod.ChecklistGrid).toBeDefined();
    expect(mod.UzurModal).toBeDefined();
    expect(mod.EarlyWarningAlertBanner).toBeDefined();
    expect(mod.ComplianceTable).toBeDefined();
    expect(mod.ActivityFormModal).toBeDefined();
  });
});
