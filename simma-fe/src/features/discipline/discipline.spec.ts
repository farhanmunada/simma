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

describe("Discipline Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should define all required API hooks", async () => {
    const api = await import("./api/discipline.api");
    expect(typeof api.useDisciplineRules).toBe("function");
    expect(typeof api.useCreateDisciplineRule).toBe("function");
    expect(typeof api.useUpdateDisciplineRule).toBe("function");
    expect(typeof api.useDeleteDisciplineRule).toBe("function");
    expect(typeof api.useStudentInfractions).toBe("function");
    expect(typeof api.useCreateStudentInfraction).toBe("function");
    expect(typeof api.useUpdateInfractionApproval).toBe("function");
    expect(typeof api.useDeleteStudentInfraction).toBe("function");
    expect(typeof api.useDisciplineLeaderboard).toBe("function");
    expect(typeof api.useStudentDisciplineProfile).toBe("function");
    expect(typeof api.useCounselingSessions).toBe("function");
    expect(typeof api.useCreateCounselingSession).toBe("function");
    expect(typeof api.useUpdateCounselingSession).toBe("function");
    expect(typeof api.useDeleteCounselingSession).toBe("function");
    expect(typeof api.useParentSummons).toBe("function");
    expect(typeof api.useCreateParentSummon).toBe("function");
    expect(typeof api.useUpdateParentSummon).toBe("function");
    expect(typeof api.downloadSummonPdf).toBe("function");
  });

  it("should export all pages and components", async () => {
    const mod = await import("./index");
    expect(mod.DisciplineDashboardPage).toBeDefined();
    expect(mod.InfractionsPage).toBeDefined();
    expect(mod.CounselingPage).toBeDefined();
    expect(mod.SummonsPage).toBeDefined();
    expect(mod.RulesPage).toBeDefined();
    expect(mod.DisciplineRoutes).toBeDefined();
  });

  it("should define structured query keys", async () => {
    const { DISCIPLINE_QUERY_KEYS } = await import("./api/discipline.api");
    expect(DISCIPLINE_QUERY_KEYS.rules).toEqual(["discipline", "rules"]);
    expect(DISCIPLINE_QUERY_KEYS.studentProfile("st1")).toEqual(["discipline", "student", "st1"]);
  });
});
