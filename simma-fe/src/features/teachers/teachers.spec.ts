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

describe("Teachers & Staff (GTK) Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API hooks and methods defined", async () => {
    const api = await import("./api/teachers.api");

    expect(typeof api.useTeachersList).toBe("function");
    expect(typeof api.useTeacherDetail).toBe("function");
    expect(typeof api.useTeacherStats).toBe("function");
    expect(typeof api.useTeacherWorkloads).toBe("function");
    expect(typeof api.useCreateTeacher).toBe("function");
    expect(typeof api.useUpdateTeacher).toBe("function");
    expect(typeof api.useDeleteTeacher).toBe("function");
    expect(typeof api.useAddEducation).toBe("function");
    expect(typeof api.useDeleteEducation).toBe("function");
    expect(typeof api.useAddRank).toBe("function");
    expect(typeof api.useDeleteRank).toBe("function");
    expect(typeof api.useAddDocument).toBe("function");
    expect(typeof api.useDeleteDocument).toBe("function");
    expect(typeof api.useUpsertTeacherWorkload).toBe("function");
    expect(typeof api.fetchEmisGtkData).toBe("function");
  });

  it("should define structured query keys for cache management", async () => {
    const { teacherKeys } = await import("./api/teachers.api");

    expect(teacherKeys.all).toEqual(["teachers"]);
    expect(teacherKeys.lists()).toEqual(["teachers", "list"]);
    expect(teacherKeys.detail("t123")).toEqual(["teachers", "detail", "t123"]);
    expect(teacherKeys.stats()).toEqual(["teachers", "stats"]);
    expect(teacherKeys.workloads()).toEqual(["teachers", "workloads", undefined]);
    expect(teacherKeys.workloads({ academicYearId: "ay1", semesterId: "s1" })).toEqual([
      "teachers",
      "workloads",
      { academicYearId: "ay1", semesterId: "s1" },
    ]);
  });

  it("should export all pages and UI components in public index", async () => {
    const mod = await import("./index");

    expect(mod.TeacherListPage).toBeDefined();
    expect(mod.TeacherWorkloadPage).toBeDefined();
    expect(mod.TeacherMonitoringPage).toBeDefined();
    expect(mod.TeachersRoutes).toBeDefined();
    expect(mod.TeacherTable).toBeDefined();
    expect(mod.TeacherFilterBar).toBeDefined();
    expect(mod.TeacherStatsCards).toBeDefined();
    expect(mod.TeacherFormModal).toBeDefined();
    expect(mod.TeacherDetailModal).toBeDefined();
    expect(mod.WorkloadRecapTable).toBeDefined();
    expect(mod.WorkloadModal).toBeDefined();
  });
});
