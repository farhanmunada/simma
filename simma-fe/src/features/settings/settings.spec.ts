import { describe, it, expect, beforeAll } from "vitest";

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

describe("Settings Feature Module", () => {
  it("should have all required query functions defined", async () => {
    const {
      getAcademicYears,
      getSemesters,
      getClassrooms,
      getSubjects,
      getTeachers,
    } = await import("./api/settings.api");

    expect(typeof getAcademicYears).toBe("function");
    expect(typeof getSemesters).toBe("function");
    expect(typeof getClassrooms).toBe("function");
    expect(typeof getSubjects).toBe("function");
    expect(typeof getTeachers).toBe("function");
  });

  it("should export SetupWizardPage and step components", async () => {
    const { SetupWizardPage } = await import("./components/SetupWizardPage");
    const { SchoolIdentityStep } = await import("./components/steps/SchoolIdentityStep");
    const { AcademicYearStep } = await import("./components/steps/AcademicYearStep");
    const { SemesterStep } = await import("./components/steps/SemesterStep");
    const { ClassroomSetupStep } = await import("./components/steps/ClassroomSetupStep");
    const { AdminUserStep } = await import("./components/steps/AdminUserStep");
    const { SetupSummaryStep } = await import("./components/steps/SetupSummaryStep");

    expect(typeof SetupWizardPage).toBe("function");
    expect(typeof SchoolIdentityStep).toBe("function");
    expect(typeof AcademicYearStep).toBe("function");
    expect(typeof SemesterStep).toBe("function");
    expect(typeof ClassroomSetupStep).toBe("function");
    expect(typeof AdminUserStep).toBe("function");
    expect(typeof SetupSummaryStep).toBe("function");
  });
});
