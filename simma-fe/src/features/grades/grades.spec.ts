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

describe("Grades & Assessments Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API functions defined", async () => {
    const api = await import("./api/grades.api");

    expect(typeof api.getAssessments).toBe("function");
    expect(typeof api.getAssessmentById).toBe("function");
    expect(typeof api.createAssessment).toBe("function");
    expect(typeof api.updateAssessment).toBe("function");
    expect(typeof api.deleteAssessment).toBe("function");
    expect(typeof api.getGradesByAssessmentId).toBe("function");
    expect(typeof api.batchUpsertGrades).toBe("function");
    expect(typeof api.getSemesterGrades).toBe("function");
    expect(typeof api.calculateSemesterGrades).toBe("function");
    expect(typeof api.upsertSemesterGrade).toBe("function");
  });

  it("should have all required query & mutation hooks defined", async () => {
    const api = await import("./api/grades.api");

    expect(typeof api.useAssessments).toBe("function");
    expect(typeof api.useAssessmentById).toBe("function");
    expect(typeof api.useCreateAssessment).toBe("function");
    expect(typeof api.useUpdateAssessment).toBe("function");
    expect(typeof api.useDeleteAssessment).toBe("function");
    expect(typeof api.useGradesByAssessmentId).toBe("function");
    expect(typeof api.useBatchUpsertGrades).toBe("function");
    expect(typeof api.useSemesterGrades).toBe("function");
    expect(typeof api.useCalculateSemesterGrades).toBe("function");
    expect(typeof api.useUpsertSemesterGrade).toBe("function");
  });

  it("should validate grade helper functions correctly", async () => {
    const {
      calculateLetterGrade,
      normalizeAssessmentType,
      formatAssessmentTypeLabel,
      getLetterGradeBadgeClass,
      ASSESSMENT_TYPE_OPTIONS,
    } = await import("./types");

    // Predicates
    expect(calculateLetterGrade(95)).toBe("A");
    expect(calculateLetterGrade(85)).toBe("A");
    expect(calculateLetterGrade(84.9)).toBe("B");
    expect(calculateLetterGrade(75)).toBe("B");
    expect(calculateLetterGrade(74.9)).toBe("C");
    expect(calculateLetterGrade(60)).toBe("C");
    expect(calculateLetterGrade(59.9)).toBe("D");
    expect(calculateLetterGrade(0)).toBe("D");

    // Type normalization
    expect(normalizeAssessmentType("formatif")).toBe("harian");
    expect(normalizeAssessmentType("sumatif_lingkup_materi")).toBe("tugas");
    expect(normalizeAssessmentType("sumatif_tengah_semester")).toBe("uts");
    expect(normalizeAssessmentType("sumatif_akhir_semester")).toBe("uas");
    expect(normalizeAssessmentType("harian")).toBe("harian");
    expect(normalizeAssessmentType("tugas")).toBe("tugas");
    expect(normalizeAssessmentType("uts")).toBe("uts");
    expect(normalizeAssessmentType("uas")).toBe("uas");

    // Labels
    expect(formatAssessmentTypeLabel("harian")).toContain("Formatif");
    expect(formatAssessmentTypeLabel("uts")).toContain("STS");
    expect(formatAssessmentTypeLabel("uas")).toContain("SAS");

    // CSS class check
    expect(getLetterGradeBadgeClass("A")).toContain("emerald");
    expect(getLetterGradeBadgeClass("B")).toContain("sky");
    expect(getLetterGradeBadgeClass("C")).toContain("amber");
    expect(getLetterGradeBadgeClass("D")).toContain("rose");

    expect(ASSESSMENT_TYPE_OPTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it("should successfully fetch assessments using apiClient", async () => {
    const api = await import("./api/grades.api");
    const mockClient = await import("../../lib/api-client");

    const dummyAssessments = [
      {
        id: "asm-1",
        title: "Ulangan Harian Bab 1",
        type: "harian" as const,
        classroomId: "cls-1",
        subjectId: "sub-1",
        teacherId: "tch-1",
        academicYearId: "ay-1",
        semesterId: "sem-1",
        maxScore: 100,
        weight: 1,
        createdAt: "2026-03-01",
      },
    ];

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummyAssessments,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const result = await api.getAssessments({ classroomId: "cls-1" });
    expect(result.data).toEqual(dummyAssessments);
    expect(result.meta?.total).toBe(1);
  });

  it("should successfully create an assessment", async () => {
    const api = await import("./api/grades.api");
    const mockClient = await import("../../lib/api-client");

    const createdAssessment = {
      id: "asm-2",
      title: "Sumatif Tengah Semester 1",
      type: "uts" as const,
      classroomId: "cls-1",
      subjectId: "sub-1",
      academicYearId: "ay-1",
      semesterId: "sem-1",
      maxScore: 100,
      weight: 2,
    };

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: createdAssessment,
    });

    const result = await api.createAssessment({
      title: "Sumatif Tengah Semester 1",
      type: "sumatif_tengah_semester",
      classroomId: "cls-1",
      subjectId: "sub-1",
      academicYearId: "ay-1",
      semesterId: "sem-1",
      maxScore: 100,
      weight: 2,
    });

    expect(result.id).toBe("asm-2");
    expect(result.title).toBe("Sumatif Tengah Semester 1");
  });

  it("should successfully perform batch upsert of grades", async () => {
    const api = await import("./api/grades.api");
    const mockClient = await import("../../lib/api-client");

    const dummyBatchGrades = [
      {
        id: "grd-1",
        assessmentId: "asm-1",
        studentId: "stu-1",
        score: 92,
        feedback: "Sangat baik",
      },
      {
        id: "grd-2",
        assessmentId: "asm-1",
        studentId: "stu-2",
        score: 80,
        feedback: null,
      },
    ];

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummyBatchGrades,
    });

    const result = await api.batchUpsertGrades({
      assessmentId: "asm-1",
      grades: [
        { studentId: "stu-1", score: 92, feedback: "Sangat baik" },
        { studentId: "stu-2", score: 80 },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(92);
  });

  it("should successfully calculate and fetch semester grades", async () => {
    const api = await import("./api/grades.api");
    const mockClient = await import("../../lib/api-client");

    // Calculation response
    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: {
        success: true,
        calculatedCount: 25,
      },
    });

    const calcResult = await api.calculateSemesterGrades({
      classroomId: "cls-1",
      subjectId: "sub-1",
      semesterId: "sem-1",
    });

    expect(calcResult.calculatedCount).toBe(25);

    // Fetch semester grades
    const dummySemesterGrades = [
      {
        id: "semgrd-1",
        studentId: "stu-1",
        classroomId: "cls-1",
        subjectId: "sub-1",
        semesterId: "sem-1",
        finalScore: 88,
        letterGrade: "A" as const,
      },
    ];

    vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: dummySemesterGrades,
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const fetchResult = await api.getSemesterGrades({
      classroomId: "cls-1",
      subjectId: "sub-1",
      semesterId: "sem-1",
    });

    expect(fetchResult.data).toHaveLength(1);
    expect(fetchResult.data[0].finalScore).toBe(88);
    expect(fetchResult.data[0].letterGrade).toBe("A");
  });
});
