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

import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { EMIS_QUERY_KEYS } from "./api/emis.api";
import { API_ENDPOINTS } from "../../config/endpoints";

describe("Modul 18 Ekspor EMIS 4.0 Frontend Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct EMIS API endpoints configured in centralized registry", () => {
    expect(API_ENDPOINTS.EMIS.AUDIT).toBe("/emis/audit");
    expect(API_ENDPOINTS.EMIS.EXPORT_STUDENTS).toBe("/emis/export/students");
    expect(API_ENDPOINTS.EMIS.EXPORT_TEACHERS).toBe("/emis/export/teachers");
    expect(API_ENDPOINTS.EMIS.EXPORT_CLASSROOMS).toBe("/emis/export/classrooms");
    expect(API_ENDPOINTS.EMIS.EXPORT_INSTITUTION).toBe("/emis/export/institution");
    expect(API_ENDPOINTS.EMIS.EXPORT_BUNDLE).toBe("/emis/export/bundle");
    expect(API_ENDPOINTS.EMIS.BAP_LIST).toBe("/emis/bap");
    expect(API_ENDPOINTS.EMIS.BAP_CREATE).toBe("/emis/bap");
    expect(API_ENDPOINTS.EMIS.BAP_DETAIL("bap-123")).toBe("/emis/bap/bap-123");
    expect(API_ENDPOINTS.EMIS.BAP_APPROVE("bap-123")).toBe("/emis/bap/bap-123/approve");
    expect(API_ENDPOINTS.EMIS.BAP_PDF("bap-123")).toBe("/emis/bap/bap-123/pdf");
  });

  it("should generate proper Query Keys for TanStack Query caching", () => {
    expect(EMIS_QUERY_KEYS.audit).toEqual(["emis", "audit"]);
    expect(EMIS_QUERY_KEYS.bapList).toEqual(["emis", "bap", "list"]);
    expect(EMIS_QUERY_KEYS.bapDetail("bap-456")).toEqual(["emis", "bap", "detail", "bap-456"]);
  });

  it("should have all required query & mutation hooks defined", async () => {
    const api = await import("./api/emis.api");

    expect(typeof api.useEmisAudit).toBe("function");
    expect(typeof api.useEmisBapList).toBe("function");
    expect(typeof api.useEmisBapDetail).toBe("function");
    expect(typeof api.useCreateBapDraft).toBe("function");
    expect(typeof api.useApproveBap).toBe("function");
    expect(typeof api.downloadEmisExport).toBe("function");
    expect(typeof api.downloadBapPdf).toBe("function");
  });
});
