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

describe("Tahfidz Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API functions defined", async () => {
    const api = await import("./api/tahfidz.api");

    expect(typeof api.getTahfidzRecords).toBe("function");
    expect(typeof api.getTahfidzRecordById).toBe("function");
    expect(typeof api.createTahfidzRecord).toBe("function");
    expect(typeof api.updateTahfidzRecord).toBe("function");
    expect(typeof api.deleteTahfidzRecord).toBe("function");
    expect(typeof api.getStudentTahfidzHistory).toBe("function");
    expect(typeof api.getStudentTahfidzProgress).toBe("function");
    expect(typeof api.getTasmiExams).toBe("function");
    expect(typeof api.getTasmiExamById).toBe("function");
    expect(typeof api.createTasmiExam).toBe("function");
    expect(typeof api.updateTasmiExam).toBe("function");
    expect(typeof api.deleteTasmiExam).toBe("function");
  });

  it("should have all query hooks defined", async () => {
    const api = await import("./api/tahfidz.api");

    expect(typeof api.useTahfidzRecords).toBe("function");
    expect(typeof api.useTahfidzRecordById).toBe("function");
    expect(typeof api.useCreateTahfidzRecord).toBe("function");
    expect(typeof api.useUpdateTahfidzRecord).toBe("function");
    expect(typeof api.useDeleteTahfidzRecord).toBe("function");
    expect(typeof api.useStudentTahfidzHistory).toBe("function");
    expect(typeof api.useStudentTahfidzProgress).toBe("function");
    expect(typeof api.useTasmiExams).toBe("function");
    expect(typeof api.useTasmiExamById).toBe("function");
    expect(typeof api.useCreateTasmiExam).toBe("function");
    expect(typeof api.useUpdateTasmiExam).toBe("function");
    expect(typeof api.useDeleteTasmiExam).toBe("function");
  });

  it("should validate 114 Quran Surahs and getSurahName helper", async () => {
    const { QURAN_SURAHS, getSurahName } = await import("./utils");

    expect(QURAN_SURAHS).toHaveLength(114);
    expect(QURAN_SURAHS[0].name).toBe("Al-Fatihah");
    expect(QURAN_SURAHS[113].name).toBe("An-Nas");

    expect(getSurahName(1)).toBe("Al-Fatihah");
    expect(getSurahName(36)).toBe("Ya-Sin");
    expect(getSurahName(114)).toBe("An-Nas");
    expect(getSurahName(999)).toBe("Surah 999");
  });

  it("should successfully fetch tahfidz records using apiClient", async () => {
    const api = await import("./api/tahfidz.api");
    const mockClient = await import("../../lib/api-client");

    const dummyRecords = [
      {
        id: "rec-1",
        studentId: "stu-1",
        type: "Z",
        juz: 30,
        surah: 78,
        ayahStart: 1,
        ayahEnd: 10,
        tajwidScore: 90,
        makhrojScore: 85,
        fluencyScore: 88,
        status: "lulus",
        date: "2026-03-01",
      },
    ];

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummyRecords,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const result = await api.getTahfidzRecords({ juz: 30 });
    expect(result.data).toEqual(dummyRecords);
    expect(result.meta?.total).toBe(1);
  });

  it("should successfully create a new tahfidz record", async () => {
    const api = await import("./api/tahfidz.api");
    const mockClient = await import("../../lib/api-client");

    const newRecord = {
      id: "rec-2",
      studentId: "stu-2",
      type: "M" as const,
      juz: 29,
      surah: 67,
      ayahStart: 1,
      ayahEnd: 30,
      tajwidScore: 95,
      makhrojScore: 90,
      fluencyScore: 92,
      status: "lulus" as const,
      date: "2026-03-02",
    };

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: newRecord,
    });

    const result = await api.createTahfidzRecord({
      studentId: "stu-2",
      type: "M",
      juz: 29,
      surah: 67,
      ayahStart: 1,
      ayahEnd: 30,
      tajwidScore: 95,
      makhrojScore: 90,
      fluencyScore: 92,
      status: "lulus",
      date: "2026-03-02",
    });

    expect(result.id).toBe("rec-2");
    expect(result.type).toBe("M");
  });

  it("should successfully fetch tasmi exams", async () => {
    const api = await import("./api/tahfidz.api");
    const mockClient = await import("../../lib/api-client");

    const dummyExams = [
      {
        id: "tasmi-1",
        studentId: "stu-1",
        juz: 30,
        tajwidScore: 85,
        makhrojScore: 85,
        fluencyScore: 90,
        finalScore: 87,
        status: "lulus",
        examDate: "2026-03-05",
      },
    ];

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummyExams,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const result = await api.getTasmiExams();
    expect(result.data).toEqual(dummyExams);
  });

  it("should successfully fetch student progress data", async () => {
    const api = await import("./api/tahfidz.api");
    const mockClient = await import("../../lib/api-client");

    const dummyProgress = {
      studentId: "stu-1",
      juzMap: [
        {
          juz: 30,
          ziyadahCount: 5,
          murajaahCount: 3,
          totalPassedAyahs: 564,
          tasmiStatus: "lulus",
          isCompleted: true,
        },
      ],
      summary: {
        totalZiyadah: 5,
        totalMurajaah: 3,
        totalTasmiPassed: 1,
        completedJuzCount: 1,
        lastMemorized: {
          juz: 30,
          surah: 114,
          ayahEnd: 6,
          date: "2026-03-05",
        },
      },
    };

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummyProgress,
    });

    const result = await api.getStudentTahfidzProgress("stu-1");
    expect(result.studentId).toBe("stu-1");
    expect(result.summary.completedJuzCount).toBe(1);
    expect(result.juzMap[0].isCompleted).toBe(true);
  });
});
