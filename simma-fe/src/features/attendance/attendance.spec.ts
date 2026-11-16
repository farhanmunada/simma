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

describe("Attendance Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required student & teacher API functions defined", async () => {
    const api = await import("./api/attendance.api");

    expect(typeof api.getStudentAttendances).toBe("function");
    expect(typeof api.getStudentAttendanceById).toBe("function");
    expect(typeof api.recordStudentAttendance).toBe("function");
    expect(typeof api.bulkRecordStudents).toBe("function");
    expect(typeof api.updateStudentAttendance).toBe("function");
    expect(typeof api.deleteStudentAttendance).toBe("function");
    expect(typeof api.getClassroomAttendance).toBe("function");
    expect(typeof api.getStudentSummary).toBe("function");

    expect(typeof api.getTeacherAttendances).toBe("function");
    expect(typeof api.getTeacherAttendanceById).toBe("function");
    expect(typeof api.recordTeacherAttendance).toBe("function");
    expect(typeof api.bulkRecordTeachers).toBe("function");
    expect(typeof api.updateTeacherAttendance).toBe("function");
    expect(typeof api.deleteTeacherAttendance).toBe("function");
    expect(typeof api.getTeacherDailyAttendance).toBe("function");
    expect(typeof api.getTeacherSummary).toBe("function");
  });

  it("should have all TanStack Query hooks defined", async () => {
    const api = await import("./api/attendance.api");

    expect(typeof api.useStudentAttendances).toBe("function");
    expect(typeof api.useStudentAttendanceById).toBe("function");
    expect(typeof api.useRecordStudentAttendance).toBe("function");
    expect(typeof api.useBulkRecordStudents).toBe("function");
    expect(typeof api.useUpdateStudentAttendance).toBe("function");
    expect(typeof api.useDeleteStudentAttendance).toBe("function");
    expect(typeof api.useClassroomAttendance).toBe("function");
    expect(typeof api.useStudentSummary).toBe("function");

    expect(typeof api.useTeacherAttendances).toBe("function");
    expect(typeof api.useTeacherAttendanceById).toBe("function");
    expect(typeof api.useRecordTeacherAttendance).toBe("function");
    expect(typeof api.useBulkRecordTeachers).toBe("function");
    expect(typeof api.useUpdateTeacherAttendance).toBe("function");
    expect(typeof api.useDeleteTeacherAttendance).toBe("function");
    expect(typeof api.useTeacherDailyAttendance).toBe("function");
    expect(typeof api.useTeacherSummary).toBe("function");
  });

  it("should validate student and teacher attendance status configs", async () => {
    const {
      STUDENT_ATTENDANCE_STATUSES,
      TEACHER_ATTENDANCE_STATUSES,
      STUDENT_STATUS_CONFIG,
      TEACHER_STATUS_CONFIG,
    } = await import("./types");

    expect(STUDENT_ATTENDANCE_STATUSES).toEqual(["hadir", "izin", "sakit", "alpa"]);
    expect(TEACHER_ATTENDANCE_STATUSES).toEqual([
      "hadir",
      "izin",
      "sakit",
      "alpa",
      "dinas_luar",
    ]);

    expect(STUDENT_STATUS_CONFIG.hadir.label).toBe("Hadir");
    expect(STUDENT_STATUS_CONFIG.izin.label).toBe("Izin");
    expect(STUDENT_STATUS_CONFIG.sakit.label).toBe("Sakit");
    expect(STUDENT_STATUS_CONFIG.alpa.label).toBe("Alpa");

    expect(TEACHER_STATUS_CONFIG.dinas_luar.label).toBe("Dinas Luar");
    expect(TEACHER_STATUS_CONFIG.dinas_luar.short).toBe("DL");
  });

  it("should call apiClient with correct query params for student attendances", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const mockResponse = {
      data: [
        {
          id: "att-1",
          studentId: "stu-1",
          classroomId: "cls-1",
          date: "2026-03-01",
          status: "hadir",
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce(mockResponse as any);

    const result = await api.getStudentAttendances({
      classroomId: "cls-1",
      date: "2026-03-01",
      status: "hadir",
    });

    expect(clientSpy).toHaveBeenCalledTimes(1);
    expect(clientSpy.mock.calls[0][0]).toBe("/attendance/students");
    expect(clientSpy.mock.calls[0][1]).toEqual({
      params: {
        classroomId: "cls-1",
        date: "2026-03-01",
        status: "hadir",
      },
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("att-1");
  });

  it("should call apiClient with correct payload for bulkRecordStudents", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce([
      { id: "att-1", studentId: "stu-1", status: "hadir" },
      { id: "att-2", studentId: "stu-2", status: "sakit" },
    ] as any);

    const payload = {
      classroomId: "cls-1",
      date: "2026-03-01",
      attendances: [
        { studentId: "stu-1", status: "hadir" as const, note: null },
        { studentId: "stu-2", status: "sakit" as const, note: "Flu" },
      ],
    };

    const result = await api.bulkRecordStudents(payload);

    expect(clientSpy).toHaveBeenCalledWith("/attendance/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toHaveLength(2);
  });

  it("should call apiClient with correct payload for bulkRecordTeachers", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce([
      { id: "att-t1", teacherId: "tch-1", status: "hadir" },
      { id: "att-t2", teacherId: "tch-2", status: "dinas_luar" },
    ] as any);

    const payload = {
      date: "2026-03-01",
      attendances: [
        { teacherId: "tch-1", status: "hadir" as const, note: null },
        { teacherId: "tch-2", status: "dinas_luar" as const, note: "MGMP" },
      ],
    };

    const result = await api.bulkRecordTeachers(payload);

    expect(clientSpy).toHaveBeenCalledWith("/attendance/teachers/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toHaveLength(2);
  });

  it("should call apiClient for getClassroomAttendance", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const mockClassroomData = {
      classroomId: "cls-1",
      date: "2026-03-01",
      attendances: [
        { studentId: "stu-1", status: "hadir", note: null },
      ],
      summary: { total: 1, hadir: 1, izin: 0, sakit: 0, alpa: 0 },
    };

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: mockClassroomData,
    } as any);

    const result = await api.getClassroomAttendance("cls-1", "2026-03-01");

    expect(clientSpy).toHaveBeenCalledWith("/attendance/classroom/cls-1/date/2026-03-01");
    expect(result.classroomId).toBe("cls-1");
    expect(result.attendances).toHaveLength(1);
  });

  it("should call apiClient for getStudentSummary and calculate percentage", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const mockSummary = {
      studentId: "stu-1",
      hadir: 18,
      izin: 1,
      sakit: 1,
      alpa: 0,
      total: 20,
      attendancePercentage: 90,
    };

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: mockSummary,
    } as any);

    const result = await api.getStudentSummary("stu-1");

    expect(clientSpy).toHaveBeenCalledWith("/attendance/student/stu-1/summary", {
      params: undefined,
    });
    expect(result.attendancePercentage).toBe(90);
    expect(result.total).toBe(20);
  });

  it("should call apiClient for getTeacherSummary", async () => {
    const api = await import("./api/attendance.api");
    const mockClient = await import("../../lib/api-client");

    const mockSummary = {
      teacherId: "tch-1",
      hadir: 20,
      izin: 1,
      sakit: 0,
      alpa: 0,
      dinasLuar: 3,
      total: 24,
      attendancePercentage: 96,
    };

    const clientSpy = vi.spyOn(mockClient, "apiClient").mockResolvedValueOnce({
      data: mockSummary,
    } as any);

    const result = await api.getTeacherSummary("tch-1");

    expect(clientSpy).toHaveBeenCalledWith("/attendance/teacher/tch-1/summary", {
      params: undefined,
    });
    expect(result.attendancePercentage).toBe(96);
    expect(result.dinasLuar).toBe(3);
  });
});
