import { describe, it, expect } from "vitest";
import { detectScheduleCollisions } from "./schedules.collision.js";
import { buildTimetableMatrix, buildPdfMatrixData } from "./schedules.matrix.js";
import { generateScheduleLandscapePdf } from "./schedules.pdf.js";
import type { ScheduleWithDetails, SchedulePdfData } from "./schedules.types.js";
import type { ScheduleRoom, ScheduleTimeSlot } from "../../db/schema/index.js";
import { DAY_OF_WEEKS } from "@simma/shared";

describe("Modul 14 Schedules - Anti-Bentrok Collision Engine", () => {
  const existingSchedule: ScheduleWithDetails = {
    id: "sched-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    classroomId: "class-1",
    subjectId: "subj-math",
    teacherId: "teacher-1",
    roomId: "room-101",
    timeSlotId: "slot-1",
    dayOfWeek: "senin",
    status: "published",
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    classroomName: "X-A",
    gradeLevel: 10,
    subjectName: "Matematika",
    subjectCode: "MTK",
    teacherName: "Ustadz Abdullah",
    roomName: "Lab Komputer",
    roomNameResolved: "Lab Komputer",
    roomCode: "LAB-01",
    timeSlotName: "Jam ke-1",
    sessionType: "formal",
    timeSlotOrder: 1,
    startTime: "07:30",
    endTime: "08:15",
    isTeachingTime: true,
  };

  it("should detect teacher collision when teacher is already booked at same day and time slot", () => {
    const candidate = {
      dayOfWeek: "senin" as const,
      timeSlotId: "slot-1",
      teacherId: "teacher-1",
      roomId: "room-102",
      classroomId: "class-2",
    };

    const result = detectScheduleCollisions(candidate, [existingSchedule]);

    expect(result.hasCollision).toBe(true);
    expect(result.collisions.some((c) => c.type === "teacher")).toBe(true);
    expect(result.collisions[0].message).toContain("Ustadz Abdullah");
  });

  it("should detect room collision when room is already occupied at same day and time slot", () => {
    const candidate = {
      dayOfWeek: "senin" as const,
      timeSlotId: "slot-1",
      teacherId: "teacher-2",
      roomId: "room-101",
      classroomId: "class-2",
    };

    const result = detectScheduleCollisions(candidate, [existingSchedule]);

    expect(result.hasCollision).toBe(true);
    expect(result.collisions.some((c) => c.type === "room")).toBe(true);
    expect(result.collisions[0].message).toContain("Lab Komputer");
  });

  it("should detect classroom collision when classroom is already occupied at same day and time slot", () => {
    const candidate = {
      dayOfWeek: "senin" as const,
      timeSlotId: "slot-1",
      teacherId: "teacher-2",
      roomId: "room-102",
      classroomId: "class-1",
    };

    const result = detectScheduleCollisions(candidate, [existingSchedule]);

    expect(result.hasCollision).toBe(true);
    expect(result.collisions.some((c) => c.type === "classroom")).toBe(true);
    expect(result.collisions[0].message).toContain("X-A");
  });

  it("should ignore collision with self when updating existing schedule", () => {
    const candidate = {
      id: "sched-1",
      dayOfWeek: "senin" as const,
      timeSlotId: "slot-1",
      teacherId: "teacher-1",
      roomId: "room-101",
      classroomId: "class-1",
    };

    const result = detectScheduleCollisions(candidate, [existingSchedule]);

    expect(result.hasCollision).toBe(false);
    expect(result.collisions).toHaveLength(0);
  });

  it("should return no collision for different day or time slot", () => {
    const candidate = {
      dayOfWeek: "selasa" as const,
      timeSlotId: "slot-1",
      teacherId: "teacher-1",
      roomId: "room-101",
      classroomId: "class-1",
    };

    const result = detectScheduleCollisions(candidate, [existingSchedule]);

    expect(result.hasCollision).toBe(false);
    expect(result.collisions).toHaveLength(0);
  });

  it("should warn about excessive consecutive periods for teacher", () => {
    const createSlot = (order: number): ScheduleWithDetails => ({
      ...existingSchedule,
      id: `sched-${order}`,
      timeSlotId: `slot-${order}`,
      timeSlotOrder: order,
    });

    const activeList = [createSlot(1), createSlot(2), createSlot(3)];

    const candidate = {
      dayOfWeek: "senin" as const,
      timeSlotId: "slot-4",
      periodOrder: 4,
      teacherId: "teacher-1",
      roomId: "room-other",
      classroomId: "class-other",
    };

    const result = detectScheduleCollisions(candidate, activeList);

    expect(result.hasCollision).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("4 jam pelajaran (JTM) berturut-turut");
  });
});

describe("Modul 14 Schedules - Timetable Matrix & PDF Builder", () => {
  const dummyTimeSlots: ScheduleTimeSlot[] = [
    {
      id: "slot-1",
      name: "Jam 1",
      sessionType: "formal",
      dayOfWeek: "senin",
      periodOrder: 1,
      startTime: "07:30",
      endTime: "08:15",
      isTeachingTime: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "slot-2",
      name: "Jam 2",
      sessionType: "formal",
      dayOfWeek: "senin",
      periodOrder: 2,
      startTime: "08:15",
      endTime: "09:00",
      isTeachingTime: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const dummySchedule: ScheduleWithDetails = {
    id: "sched-1",
    academicYearId: "ay-1",
    semesterId: "sem-1",
    classroomId: "class-1",
    subjectId: "subj-1",
    teacherId: "teacher-1",
    roomId: "room-1",
    timeSlotId: "slot-1",
    dayOfWeek: "senin",
    status: "published",
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    classroomName: "X-IPA-1",
    gradeLevel: 10,
    subjectName: "Fiqih",
    subjectCode: "FQH",
    teacherName: "Ust. Ahmad",
    roomName: "R-101",
    roomNameResolved: "R-101",
    roomCode: "101",
    timeSlotName: "Jam 1",
    sessionType: "diniyah",
    timeSlotOrder: 1,
    startTime: "07:30",
    endTime: "08:15",
    isTeachingTime: true,
  };

  it("should build structured timetable matrix correctly", () => {
    const matrix = buildTimetableMatrix(dummyTimeSlots, [dummySchedule], {
      classroomId: "class-1",
    });

    expect(matrix.rows).toHaveLength(2);
    expect(matrix.rows[0].cells.senin).toBeDefined();
    expect(matrix.rows[0].cells.senin?.subjectName).toBe("Fiqih");
    expect(matrix.rows[1].cells.senin).toBeUndefined();
  });

  it("should generate valid landscape timetable PDF buffer", () => {
    const { distinctSlots, matrix } = buildPdfMatrixData(
      dummyTimeSlots,
      [dummySchedule],
      "classroom",
      DAY_OF_WEEKS as any,
    );

    const pdfData: SchedulePdfData = {
      institution: {
        name: "Madrasah Aliyah Al-Hikmah",
        address: "Jl. Pendidikan No. 45",
      },
      title: "JADWAL PELAJARAN KELAS X-IPA-1",
      subTitle: "TAHUN AJARAN 2026/2027",
      academicYearName: "2026/2027",
      semesterType: 1,
      viewType: "classroom",
      targetName: "X-IPA-1",
      days: DAY_OF_WEEKS as any,
      timeSlots: distinctSlots,
      matrix,
      signatoryTitle: "Kepala Madrasah",
      signatoryName: "Dr. H. Maimun, M.Pd.",
    };

    const buffer = generateScheduleLandscapePdf(pdfData);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100);
    expect(buffer.toString("latin1")).toContain("%PDF-1.4");
    expect(buffer.toString("latin1")).toContain("%%EOF");
    expect(buffer.toString("latin1")).toContain("MADRASAH ALIYAH AL-HIKMAH");
    expect(buffer.toString("latin1")).toContain("Fiqih");
  });
});
