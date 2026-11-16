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

describe("Finance Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API hooks and methods defined", async () => {
    const api = await import("./api/finance.api");

    expect(typeof api.useFeeItems).toBe("function");
    expect(typeof api.useCreateFeeItem).toBe("function");
    expect(typeof api.useUpdateFeeItem).toBe("function");
    expect(typeof api.useDeleteFeeItem).toBe("function");
    expect(typeof api.useInvoices).toBe("function");
    expect(typeof api.useGenerateInvoices).toBe("function");
    expect(typeof api.useSearchStudents).toBe("function");
    expect(typeof api.useStudentBillingProfile).toBe("function");
    expect(typeof api.useProcessPayment).toBe("function");
    expect(typeof api.useVoidPayment).toBe("function");
    expect(typeof api.useDispensations).toBe("function");
    expect(typeof api.useCreateDispensation).toBe("function");
    expect(typeof api.useUpdateDispensationStatus).toBe("function");
    expect(typeof api.useCashflowReport).toBe("function");
    expect(typeof api.useArrearsReport).toBe("function");
  });

  it("should define structured query keys for cache management", async () => {
    const { financeKeys } = await import("./api/finance.api");

    expect(financeKeys.all).toEqual(["finance"]);
    expect(financeKeys.feeItems()).toEqual(["finance", "feeItems", undefined]);
    expect(financeKeys.feeItem("fee-1")).toEqual(["finance", "feeItem", "fee-1"]);
    expect(financeKeys.invoices()).toEqual(["finance", "invoices", undefined]);
    expect(financeKeys.studentProfile("stu-1")).toEqual(["finance", "studentProfile", "stu-1"]);
    expect(financeKeys.searchStudents("Ahmad")).toEqual(["finance", "searchStudents", "Ahmad"]);
  });

  it("should export all pages and UI components in public index", async () => {
    const mod = await import("./index");

    expect(mod.FinanceRoutes).toBeDefined();
    expect(mod.FinanceCashierPage).toBeDefined();
    expect(mod.FinanceInvoicesPage).toBeDefined();
    expect(mod.FinanceFeeItemsPage).toBeDefined();
    expect(mod.FinanceDispensationsPage).toBeDefined();
    expect(mod.FinanceReportsPage).toBeDefined();
  });
});
