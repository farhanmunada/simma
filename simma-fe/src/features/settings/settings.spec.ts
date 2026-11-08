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
});
