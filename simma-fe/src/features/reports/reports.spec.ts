import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";
import type { ClassroomLegger } from "./types";

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

describe("Reports & Legger RDM Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API functions defined", async () => {
    const api = await import("./api/reports.api");

    expect(typeof api.getStudentReportCard).toBe("function");
    expect(typeof api.getStudentReportPdf).toBe("function");
    expect(typeof api.downloadStudentReportPdf).toBe("function");
    expect(typeof api.getClassroomLegger).toBe("function");
    expect(typeof api.saveStudentNotes).toBe("function");
  });

  it("should have all required query & mutation hooks defined", async () => {
    const api = await import("./api/reports.api");

    expect(typeof api.useStudentReportCard).toBe("function");
    expect(typeof api.useClassroomLegger).toBe("function");
    expect(typeof api.useDownloadReportPdf).toBe("function");
    expect(typeof api.useSaveStudentNotes).toBe("function");
  });

  it("should validate query key structure correctly", async () => {
    const { reportsQueryKeys } = await import("./api/reports.api");

    expect(reportsQueryKeys.all).toEqual(["reports"]);
    expect(reportsQueryKeys.student("student-1", "sem-1")).toEqual([
      "reports",
      "student",
      "student-1",
      "sem-1",
      undefined,
    ]);
    expect(
      reportsQueryKeys.legger("class-1", "sem-1", { sortBy: "rank", order: "asc" })
    ).toEqual([
      "reports",
      "legger",
      "class-1",
      "sem-1",
      { sortBy: "rank", order: "asc" },
    ]);
  });

  it("should validate helper functions correctly", async () => {
    const {
      calculateLetterGrade,
      getLetterGradeBadgeClass,
      formatSemesterType,
    } = await import("./types");

    // Letter grade thresholds
    expect(calculateLetterGrade(95)).toBe("A");
    expect(calculateLetterGrade(85)).toBe("A");
    expect(calculateLetterGrade(84.9)).toBe("B");
    expect(calculateLetterGrade(75)).toBe("B");
    expect(calculateLetterGrade(74.9)).toBe("C");
    expect(calculateLetterGrade(60)).toBe("C");
    expect(calculateLetterGrade(59.9)).toBe("D");
    expect(calculateLetterGrade(0)).toBe("D");

    // Badge CSS classes
    expect(getLetterGradeBadgeClass("A")).toContain("emerald");
    expect(getLetterGradeBadgeClass("B")).toContain("sky");
    expect(getLetterGradeBadgeClass("C")).toContain("amber");
    expect(getLetterGradeBadgeClass("D")).toContain("rose");
    expect(getLetterGradeBadgeClass("X")).toContain("slate");

    // Semester type labels
    expect(formatSemesterType(1)).toContain("Ganjil");
    expect(formatSemesterType(2)).toContain("Genap");
    expect(formatSemesterType("1")).toContain("Ganjil");
  });

  it("should generate RFC 4180 CSV with UTF-8 BOM for classroom legger", async () => {
    const { generateLeggerCsvContent } = await import("./types");

    const mockLegger: ClassroomLegger = {
      classroom: {
        id: "class-1",
        name: "X-A",
        gradeLevel: 10,
        homeroomTeacher: {
          id: "teacher-1",
          fullName: "Ustadz Ahmad, S.Pd.I",
          nuptk: "12345678",
        },
      },
      academicYear: {
        id: "ay-1",
        name: "2026/2027",
      },
      semester: {
        id: "sem-1",
        type: 1,
      },
      subjects: [
        { id: "sub-1", code: "PAI", name: "Pendidikan Agama Islam", group: "A" },
        { id: "sub-2", code: "", name: "Matematika, Wajib", group: "A" },
      ],
      students: [
        {
          studentId: "st-1",
          fullName: 'Fulan "The Great", bin Fulan',
          nisn: "0012345678",
          nis: "2026001",
          gender: "L",
          grades: [
            { subjectId: "sub-1", subjectCode: "PAI", score: 90, letterGrade: "A" },
            { subjectId: "sub-2", subjectCode: "MTK", score: 85, letterGrade: "A" },
          ],
          totalScore: 175,
          averageScore: 87.5,
          rank: 1,
          attendance: { hadir: 50, izin: 1, sakit: 1, alpa: 0 },
        },
      ],
      classStatistics: {
        totalStudents: 1,
        classAverage: 87.5,
        highestScore: 175,
        lowestScore: 175,
      },
    };

    const csv = generateLeggerCsvContent(mockLegger);

    // Verify UTF-8 BOM
    expect(csv.startsWith("\uFEFF")).toBe(true);

    // Verify metadata and subject columns
    expect(csv).toContain("BUKU LEGGER NILAI KELAS - X-A");
    expect(csv).toContain("PAI");
    expect(csv).toContain('"Matematika, Wajib"');

    // Verify RFC 4180 escaped cell with quotes and commas
    expect(csv).toContain('"Fulan ""The Great"", bin Fulan"');
    expect(csv).toContain("0012345678");
    expect(csv).toContain("175");
    expect(csv).toContain("87.5");
    expect(csv).toContain("Total Siswa: 1");
  });

  it("should call getStudentReportCard API correctly", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      data: {
        student: { id: "st-1", fullName: "Ahmad" },
        grades: [],
      },
    });

    const { getStudentReportCard } = await import("./api/reports.api");
    const res = await getStudentReportCard("st-1", "sem-1", {
      includeTahfidz: true,
      includeAttendance: false,
    });

    expect(apiClientSpy).toHaveBeenCalledWith(
      "/reports/student/st-1/semester/sem-1",
      expect.objectContaining({
        params: {
          includeTahfidz: true,
          includeAttendance: false,
        },
      })
    );
    expect(res).toBeDefined();
    expect(res.student.fullName).toBe("Ahmad");
  });

  it("should call getClassroomLegger API correctly", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      data: {
        classroom: { id: "c-1", name: "X-A" },
        students: [],
      },
    });

    const { getClassroomLegger } = await import("./api/reports.api");
    const res = await getClassroomLegger("c-1", "sem-1", {
      sortBy: "rank",
      order: "asc",
    });

    expect(apiClientSpy).toHaveBeenCalledWith(
      "/reports/classroom/c-1/semester/sem-1/legger",
      expect.objectContaining({
        params: {
          sortBy: "rank",
          order: "asc",
        },
      })
    );
    expect(res).toBeDefined();
    expect(res.classroom.name).toBe("X-A");
  });

  it("should call saveStudentNotes API correctly", async () => {
    const apiClientModule = await import("../../lib/api-client");
    const apiClientSpy = vi.spyOn(apiClientModule, "apiClient").mockResolvedValueOnce({
      data: {
        teacherNotes: "Sangat baik",
      },
    });

    const { saveStudentNotes } = await import("./api/reports.api");
    const payload = {
      semesterId: "sem-1",
      teacherNotes: "Sangat baik",
      spiritualAttitude: "Taat beribadah",
      socialAttitude: "Santun dan disiplin",
      extracurriculars: [{ name: "Pramuka", score: "A", description: "Aktif" }],
      achievements: [{ description: "Juara 1", type: "Akademik" }],
    };

    const res = await saveStudentNotes("st-1", payload);

    expect(apiClientSpy).toHaveBeenCalledWith(
      "/reports/student/st-1/notes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
    expect(res.teacherNotes).toBe("Sangat baik");
  });
});
