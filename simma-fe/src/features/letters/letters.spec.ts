import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

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

describe("Letters & Madrasah Correspondence Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required query keys defined correctly", async () => {
    const { lettersQueryKeys } = await import("./api/letters.api");

    expect(lettersQueryKeys.all).toEqual(["letters"]);
    expect(lettersQueryKeys.classifications()).toEqual(["letters", "classifications", { search: undefined }]);
    expect(lettersQueryKeys.incoming({ page: 1, limit: 10 })).toEqual([
      "letters",
      "incoming",
      { page: 1, limit: 10 },
    ]);
    expect(lettersQueryKeys.dispositions({ status: "pending" })).toEqual([
      "letters",
      "dispositions",
      { status: "pending" },
    ]);
    expect(lettersQueryKeys.outgoing({ search: "tugas" })).toEqual([
      "letters",
      "outgoing",
      { search: "tugas" },
    ]);
    expect(lettersQueryKeys.expeditions()).toEqual([
      "letters",
      "expeditions",
      undefined,
    ]);
    expect(lettersQueryKeys.verify("hash123")).toEqual([
      "letters",
      "verify",
      "hash123",
    ]);
  });

  it("should export all required API functions and hooks", async () => {
    const api = await import("./api/letters.api");

    expect(typeof api.getClassifications).toBe("function");
    expect(typeof api.useClassifications).toBe("function");
    expect(typeof api.useCreateClassification).toBe("function");

    expect(typeof api.getIncomingLetters).toBe("function");
    expect(typeof api.useIncomingLetters).toBe("function");
    expect(typeof api.useCreateIncomingLetter).toBe("function");
    expect(typeof api.useUpdateIncomingLetterStatus).toBe("function");

    expect(typeof api.getDispositions).toBe("function");
    expect(typeof api.useDispositions).toBe("function");
    expect(typeof api.useCreateDisposition).toBe("function");
    expect(typeof api.useUpdateDispositionStatus).toBe("function");

    expect(typeof api.getOutgoingLetters).toBe("function");
    expect(typeof api.useOutgoingLetters).toBe("function");
    expect(typeof api.useCreateOutgoingLetter).toBe("function");
    expect(typeof api.useUpdateOutgoingLetterStatus).toBe("function");

    expect(typeof api.getExpeditions).toBe("function");
    expect(typeof api.useExpeditions).toBe("function");
    expect(typeof api.useCreateExpedition).toBe("function");
  });

  it("should export all letter generator hooks and verification", async () => {
    const generatorApi = await import("./api/letters-generator.api");

    expect(typeof generatorApi.useGenerateStudentLetter).toBe("function");
    expect(typeof generatorApi.useGenerateTeacherLetter).toBe("function");
    expect(typeof generatorApi.useGenerateInvitationLetter).toBe("function");
    expect(typeof generatorApi.useVerifyLetter).toBe("function");
  });

  it("should call getIncomingLetters API with proper query params", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      success: true,
      data: [{ id: "letter-1", subject: "Undangan Rakor" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const { getIncomingLetters } = await import("./api/letters.api");
    const res = await getIncomingLetters({ page: 1, search: "Rakor" });

    expect(apiClientSpy).toHaveBeenCalledWith(
      expect.stringContaining("/letters/incoming?page=1&search=Rakor")
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].subject).toBe("Undangan Rakor");
  });

  it("should call getOutgoingLetters API with proper query params", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      success: true,
      data: [{ id: "out-1", letterNumber: "B-001/Ma.13.04/PP.00.6/05/2026" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const { getOutgoingLetters } = await import("./api/letters.api");
    const res = await getOutgoingLetters({ status: "signed" });

    expect(apiClientSpy).toHaveBeenCalledWith(
      expect.stringContaining("/letters/outgoing?status=signed")
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].letterNumber).toBe("B-001/Ma.13.04/PP.00.6/05/2026");
  });

  it("should call getDispositions API correctly", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      success: true,
      data: [{ id: "disp-1", instruction: "tindak_lanjuti", urgency: "segera" }],
    });

    const { getDispositions } = await import("./api/letters.api");
    const res = await getDispositions({ status: "pending" });

    expect(apiClientSpy).toHaveBeenCalledWith(
      expect.stringContaining("/letters/dispositions?status=pending")
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].urgency).toBe("segera");
  });

  it("should call getClassifications API correctly", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      success: true,
      data: [{ id: "class-1", code: "PP.00.6", name: "Madrasah Aliyah" }],
    });

    const { getClassifications } = await import("./api/letters.api");
    const res = await getClassifications();

    expect(apiClientSpy).toHaveBeenCalledWith(
      expect.stringContaining("/letters/classifications")
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].code).toBe("PP.00.6");
  });
});
