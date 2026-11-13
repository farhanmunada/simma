import { describe, it, expect, beforeAll } from "vitest";
import { P5RA_THEMES, P5RA_FASES, P5RA_DIMENSIONS, P5RA_PREDICATES } from "@simma/shared";

let p5raQueryKeys: typeof import("./api/p5ra.api").p5raQueryKeys;

beforeAll(async () => {
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

  const mod = await import("./api/p5ra.api");
  p5raQueryKeys = mod.p5raQueryKeys;
});

describe("P5RA Frontend Module", () => {
  describe("Query Keys", () => {
    it("generates correct query keys for projects list", () => {
      const keys = p5raQueryKeys.projects({ theme: "Kewirausahaan" });
      expect(keys).toEqual(["p5ra", "projects", { theme: "Kewirausahaan" }]);
    });

    it("generates correct query keys for project detail", () => {
      const keys = p5raQueryKeys.projectDetail("proj-123");
      expect(keys).toEqual(["p5ra", "project", "proj-123"]);
    });

    it("generates correct query keys for assessments", () => {
      const keys = p5raQueryKeys.assessments("proj-123", "class-456");
      expect(keys).toEqual(["p5ra", "assessments", "proj-123", "class-456"]);
    });

    it("generates correct query keys for student report", () => {
      const keys = p5raQueryKeys.studentReport("proj-123", "stud-789");
      expect(keys).toEqual(["p5ra", "student-report", "proj-123", "stud-789"]);
    });
  });

  describe("Constants & Domain Definitions", () => {
    it("has 8 standard Kemenag themes", () => {
      expect(P5RA_THEMES.length).toBe(8);
      expect(P5RA_THEMES).toContain("Gaya Hidup Berkelanjutan");
      expect(P5RA_THEMES).toContain("Kearifan Lokal");
      expect(P5RA_THEMES).toContain("Bhinneka Tunggal Ika");
      expect(P5RA_THEMES).toContain("Bangunlah Jiwa dan Raganya");
      expect(P5RA_THEMES).toContain("Suara Demokrasi");
      expect(P5RA_THEMES).toContain("Rekayasa & Teknologi");
      expect(P5RA_THEMES).toContain("Kewirausahaan");
      expect(P5RA_THEMES).toContain("Kebekerjaan");
    });

    it("has 4 assessment predicates in standard order", () => {
      expect(P5RA_PREDICATES).toEqual(["MB", "SB", "BSH", "SAB"]);
    });

    it("contains MA curriculum fases E and F", () => {
      expect(P5RA_FASES).toContain("E");
      expect(P5RA_FASES).toContain("F");
    });

    it("contains 6 standard dimensions", () => {
      expect(P5RA_DIMENSIONS.length).toBe(6);
    });
  });
});
