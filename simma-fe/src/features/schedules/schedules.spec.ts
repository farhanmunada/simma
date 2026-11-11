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

describe("Schedules Feature Module (Frontend)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have all required API hooks and methods defined", async () => {
    const api = await import("./api/schedules.api");

    expect(typeof api.useScheduleRooms).toBe("function");
    expect(typeof api.useCreateScheduleRoom).toBe("function");
    expect(typeof api.useUpdateScheduleRoom).toBe("function");
    expect(typeof api.useDeleteScheduleRoom).toBe("function");

    expect(typeof api.useScheduleTimeSlots).toBe("function");
    expect(typeof api.useCreateScheduleTimeSlot).toBe("function");
    expect(typeof api.useUpdateScheduleTimeSlot).toBe("function");
    expect(typeof api.useDeleteScheduleTimeSlot).toBe("function");

    expect(typeof api.useScheduleMatrix).toBe("function");
    expect(typeof api.useCheckScheduleCollision).toBe("function");
    expect(typeof api.useCreateSchedule).toBe("function");
    expect(typeof api.useUpdateSchedule).toBe("function");
    expect(typeof api.useDeleteSchedule).toBe("function");
    expect(typeof api.useCreateBatchSchedule).toBe("function");
    expect(typeof api.exportSchedulePdf).toBe("function");
  });

  it("should define structured query keys for cache invalidation", async () => {
    const { SCHEDULE_QUERY_KEYS } = await import("./api/schedules.api");

    expect(SCHEDULE_QUERY_KEYS.rooms).toEqual(["schedules", "rooms"]);
    expect(SCHEDULE_QUERY_KEYS.timeSlots).toEqual(["schedules", "timeSlots"]);
    expect(SCHEDULE_QUERY_KEYS.list({ classroomId: "c1" })).toEqual([
      "schedules",
      "list",
      { classroomId: "c1" },
    ]);
    expect(SCHEDULE_QUERY_KEYS.matrix("classroom", "target-1", "ay-1", "sem-1")).toEqual([
      "schedules",
      "matrix",
      "classroom",
      "target-1",
      "ay-1",
      "sem-1",
    ]);
  });
});
