import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";
import { API_ENDPOINTS } from "../../config/endpoints";

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

describe("Modul 17 Ekstrakurikuler Frontend Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("harus mendaftarkan semua endpoint API terpusat untuk ekstrakurikuler", () => {
    expect(API_ENDPOINTS.EXTRACURRICULAR).toBeDefined();
    expect(API_ENDPOINTS.EXTRACURRICULAR.STATS).toBe("/extracurricular/stats");
    expect(API_ENDPOINTS.EXTRACURRICULAR.LIST).toBe("/extracurricular");
    expect(API_ENDPOINTS.EXTRACURRICULAR.DETAIL("abc-123")).toBe("/extracurricular/abc-123");
    expect(API_ENDPOINTS.EXTRACURRICULAR.MEMBERS).toBe("/extracurricular/members");
    expect(API_ENDPOINTS.EXTRACURRICULAR.MEMBER_DETAIL("mem-1")).toBe("/extracurricular/members/mem-1");
    expect(API_ENDPOINTS.EXTRACURRICULAR.GRADES).toBe("/extracurricular/grades");
    expect(API_ENDPOINTS.EXTRACURRICULAR.GRADES_BATCH).toBe("/extracurricular/grades/batch");
    expect(API_ENDPOINTS.EXTRACURRICULAR.STUDENT_GRADES("stu-1")).toBe("/extracurricular/grades/student/stu-1");
  });

  it("harus mengekspor seluruh React Query hooks dengan benar", async () => {
    const api = await import("./api/extracurricular.api");

    expect(typeof api.useExtracurricularStats).toBe("function");
    expect(typeof api.useExtracurriculars).toBe("function");
    expect(typeof api.useExtracurricularDetail).toBe("function");
    expect(typeof api.useCreateExtracurricular).toBe("function");
    expect(typeof api.useUpdateExtracurricular).toBe("function");
    expect(typeof api.useDeleteExtracurricular).toBe("function");
    expect(typeof api.useExtracurricularMembers).toBe("function");
    expect(typeof api.useRegisterExtracurricularMember).toBe("function");
    expect(typeof api.useUpdateExtracurricularMember).toBe("function");
    expect(typeof api.useDeleteExtracurricularMember).toBe("function");
    expect(typeof api.useExtracurricularGrades).toBe("function");
    expect(typeof api.useUpsertExtracurricularGrade).toBe("function");
    expect(typeof api.useBatchUpsertExtracurricularGrades).toBe("function");
  });

  it("harus mengekspor seluruh komponen UI dari barrel file", async () => {
    const mod = await import("./index");

    expect(mod.ExtracurricularPage).toBeDefined();
    expect(mod.ExtracurricularTable).toBeDefined();
    expect(mod.ExtracurricularFormModal).toBeDefined();
    expect(mod.ExtracurricularMembersTab).toBeDefined();
    expect(mod.ExtracurricularGradesTab).toBeDefined();
    expect(mod.ExtracurricularStatsCards).toBeDefined();
  });
});
