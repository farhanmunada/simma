import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

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

describe("Students Feature Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API functions and hooks defined", async () => {
    const studentsApi = await import("./api/students.api");

    expect(typeof studentsApi.getStudents).toBe("function");
    expect(typeof studentsApi.getStudentById).toBe("function");
    expect(typeof studentsApi.createStudent).toBe("function");
    expect(typeof studentsApi.updateStudent).toBe("function");
    expect(typeof studentsApi.deleteStudent).toBe("function");
    expect(typeof studentsApi.getStudentParents).toBe("function");
    expect(typeof studentsApi.createAndLinkParent).toBe("function");
    expect(typeof studentsApi.assignClassroom).toBe("function");

    expect(typeof studentsApi.useStudents).toBe("function");
    expect(typeof studentsApi.useStudent).toBe("function");
    expect(typeof studentsApi.useCreateStudent).toBe("function");
    expect(typeof studentsApi.useUpdateStudent).toBe("function");
    expect(typeof studentsApi.useDeleteStudent).toBe("function");
    expect(typeof studentsApi.useStudentParents).toBe("function");
    expect(typeof studentsApi.useCreateAndLinkParent).toBe("function");
    expect(typeof studentsApi.useAssignClassroom).toBe("function");
  });

  it("getStudents should fetch with query params and format response", async () => {
    const { getStudents } = await import("./api/students.api");

    const mockStudents = [
      {
        id: "s-1",
        nik: "3201010101010001",
        fullName: "Ahmad Fauzi",
        birthPlace: "Bandung",
        birthDate: "2008-05-12",
        gender: "L",
        motherName: "Siti Aminah",
        status: "aktif",
      },
    ];

    const mockResponse = {
      data: mockStudents,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getStudents({ page: 1, limit: 10, search: "Ahmad", status: "aktif" });

    expect(global.fetch).toHaveBeenCalled();
    const fetchUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(fetchUrl).toContain("/students");
    expect(fetchUrl).toContain("page=1");
    expect(fetchUrl).toContain("limit=10");
    expect(fetchUrl).toContain("search=Ahmad");
    expect(fetchUrl).toContain("status=aktif");

    expect(result.data).toHaveLength(1);
    expect(result.data[0].fullName).toBe("Ahmad Fauzi");
    expect(result.meta.total).toBe(1);
  });

  it("createStudent should send POST request with payload", async () => {
    const { createStudent } = await import("./api/students.api");

    const payload = {
      nik: "3201010101010002",
      fullName: "Nurul Aini",
      birthPlace: "Jakarta",
      birthDate: "2008-11-20",
      gender: "P" as const,
      motherName: "Fatimah",
      status: "aktif" as const,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: "s-2", ...payload } }),
    });

    const result = await createStudent(payload);

    expect(global.fetch).toHaveBeenCalled();
    const [fetchUrl, fetchOptions] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchUrl).toContain("/students");
    expect(fetchOptions.method).toBe("POST");
    expect(JSON.parse(fetchOptions.body as string)).toEqual(payload);
    expect(result.id).toBe("s-2");
    expect(result.fullName).toBe("Nurul Aini");
  });

  it("updateStudent should send PATCH request with partial data", async () => {
    const { updateStudent } = await import("./api/students.api");

    const updatePayload = {
      status: "lulus" as const,
      nis: "2026999",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: "s-1",
          nik: "3201010101010001",
          fullName: "Ahmad Fauzi",
          ...updatePayload,
        },
      }),
    });

    const result = await updateStudent("s-1", updatePayload);

    expect(global.fetch).toHaveBeenCalled();
    const [fetchUrl, fetchOptions] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchUrl).toContain("/students/s-1");
    expect(fetchOptions.method).toBe("PATCH");
    expect(JSON.parse(fetchOptions.body as string)).toEqual(updatePayload);
    expect(result.status).toBe("lulus");
  });

  it("deleteStudent should send DELETE request", async () => {
    const { deleteStudent } = await import("./api/students.api");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    await deleteStudent("s-1");

    expect(global.fetch).toHaveBeenCalled();
    const [fetchUrl, fetchOptions] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchUrl).toContain("/students/s-1");
    expect(fetchOptions.method).toBe("DELETE");
  });

  it("assignClassroom should send POST to /students/assign-classroom", async () => {
    const { assignClassroom } = await import("./api/students.api");

    const assignPayload = {
      classroomId: "c-10-a",
      studentIds: ["s-1", "s-2", "s-3"],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { assignedCount: 3 } }),
    });

    const result = await assignClassroom(assignPayload);

    expect(global.fetch).toHaveBeenCalled();
    const [fetchUrl, fetchOptions] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchUrl).toContain("/students/assign-classroom");
    expect(fetchOptions.method).toBe("POST");
    expect(JSON.parse(fetchOptions.body as string)).toEqual(assignPayload);
    expect(result.assignedCount).toBe(3);
  });
});
