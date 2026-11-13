import type { DayOfWeek } from "@simma/shared";
import type {
  ScheduleTimeSlot,
  ScheduleWithDetails,
  TimetableMatrixView,
  TimetableRow,
  SchedulePdfData,
} from "./schedules.types.js";

export function buildTimetableMatrix(
  timeSlots: ScheduleTimeSlot[],
  schedulesList: ScheduleWithDetails[],
  query: {
    semesterId?: string;
    classroomId?: string;
    teacherId?: string;
    roomId?: string;
  },
): TimetableMatrixView {
  const distinctSlotMap = new Map<number, ScheduleTimeSlot>();
  timeSlots.forEach((slot) => {
    if (!distinctSlotMap.has(slot.periodOrder)) {
      distinctSlotMap.set(slot.periodOrder, slot);
    }
  });

  const rows: TimetableRow[] = Array.from(distinctSlotMap.values())
    .sort((a, b) => a.periodOrder - b.periodOrder)
    .map((slot) => {
      const cells: Partial<Record<DayOfWeek, any>> = {};
      schedulesList
        .filter((s) => s.timeSlotOrder === slot.periodOrder)
        .forEach((s) => {
          cells[s.dayOfWeek] = {
            scheduleId: s.id,
            subjectId: s.subjectId,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
            roomId: s.roomId,
            roomName: s.roomNameResolved || s.roomName,
            status: s.status,
            notes: s.notes,
          };
        });

      return {
        timeSlotId: slot.id,
        periodOrder: slot.periodOrder,
        name: slot.name,
        sessionType: slot.sessionType,
        isTeachingTime: slot.isTeachingTime,
        startTime: slot.startTime,
        endTime: slot.endTime,
        cells,
      };
    });

  return {
    title: "Matriks Jadwal Pelajaran",
    ...query,
    timeSlots,
    rows,
  };
}

export function buildPdfMatrixData(
  slots: ScheduleTimeSlot[],
  schedulesList: ScheduleWithDetails[],
  viewType: "classroom" | "teacher" | "room",
  days: DayOfWeek[],
) {
  const distinctSlots = Array.from(
    new Map(slots.map((s) => [s.periodOrder, s])).values(),
  ).sort((a, b) => a.periodOrder - b.periodOrder);

  const matrix: Record<string, Record<DayOfWeek, any>> = {};

  distinctSlots.forEach((slot) => {
    matrix[slot.id] = {} as any;
    days.forEach((day) => {
      const item = schedulesList.find(
        (s) => s.dayOfWeek === day && s.timeSlotOrder === slot.periodOrder,
      );
      if (item) {
        matrix[slot.id][day] = {
          title: item.subjectName || item.subjectCode || "Pelajaran",
          subtitle:
            viewType === "teacher"
              ? `Kelas ${item.classroomName}`
              : item.teacherName || "-",
          room: item.roomNameResolved || item.roomName || undefined,
        };
      }
    });
  });

  return { distinctSlots, matrix };
}
