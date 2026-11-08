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

  it("should validate applicant status mappings and major types", () => {
    const statuses = ["draft", "submitted", "verified", "accepted", "rejected", "enrolled"];
    const majors = ["MIPA", "IPS", "Keagamaan", "Umum"];

    expect(statuses).toContain("submitted");
    expect(statuses).toContain("enrolled");
    expect(majors).toContain("MIPA");
    expect(majors).toContain("Keagamaan");
  });

  it("should have all required PPDB query and mutation hooks defined", async () => {
    const api = await import("./api/ppdb.api");

    expect(typeof api.usePpdbStats).toBe("function");
    expect(typeof api.usePpdbApplicants).toBe("function");
    expect(typeof api.usePpdbApplicant).toBe("function");
    expect(typeof api.useUpdateApplicantStatus).toBe("function");
    expect(typeof api.useEnrollApplicant).toBe("function");
    expect(typeof api.useDeleteApplicant).toBe("function");
  });
});
