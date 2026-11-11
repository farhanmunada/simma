import type { DayOfWeek } from "@simma/shared";
import type {
  CollisionCheckResult,
  ScheduleCollisionDetail,
  ScheduleWithDetails,
} from "./schedules.types.js";

export interface CandidatePlot {
  id?: string;
  classroomId: string;
  classroomName?: string;
  dayOfWeek: DayOfWeek;
  timeSlotId: string;
  timeSlotName?: string;
  periodOrder?: number;
  teacherId?: string | null;
  teacherName?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  subjectName?: string | null;
}

export function detectScheduleCollisions(
  candidate: CandidatePlot,
  existingPlots: ScheduleWithDetails[],
): CollisionCheckResult {
  const collisions: ScheduleCollisionDetail[] = [];
  const warnings: string[] = [];

  for (const existing of existingPlots) {
    // Skip checking against itself when updating
    if (candidate.id && existing.id === candidate.id) {
      continue;
    }

    // Only same day & time slot can conflict directly
    const isSameSlot =
      existing.dayOfWeek === candidate.dayOfWeek &&
      existing.timeSlotId === candidate.timeSlotId;

    if (!isSameSlot) {
      continue;
    }

    // 1. Check Teacher Collision (Guru mengajar di >1 rombel pada slot jam & hari yang sama)
    if (
      candidate.teacherId &&
      existing.teacherId &&
      candidate.teacherId === existing.teacherId
    ) {
      const teacherName =
        candidate.teacherName || existing.teacherName || "Guru";
      const targetClassroom =
        existing.classroomName || "Kelas lain";
      const slotName =
        candidate.timeSlotName || existing.timeSlotName || "slot ini";

      collisions.push({
        type: "teacher",
        message: `Bentrok: ${teacherName} sudah dijadwalkan di ${targetClassroom} pada ${candidate.dayOfWeek.toUpperCase()} (${slotName})`,
        conflictingScheduleId: existing.id,
        conflictDetails: {
          dayOfWeek: candidate.dayOfWeek,
          timeSlotName: slotName,
          teacherName,
          classroomName: targetClassroom,
        },
      });
    }

    // 2. Check Room Collision (Ruangan terpakai ganda)
    if (
      candidate.roomId &&
      existing.roomId &&
      candidate.roomId === existing.roomId
    ) {
      const roomName =
        candidate.roomName ||
        existing.roomNameResolved ||
        (existing as any).roomName ||
        "Ruangan ini";
      const targetClassroom =
        existing.classroomName || "Kelas lain";
      const slotName =
        candidate.timeSlotName || existing.timeSlotName || "slot ini";

      collisions.push({
        type: "room",
        message: `Bentrok Ruangan: ${roomName} sudah digunakan oleh ${targetClassroom} pada ${candidate.dayOfWeek.toUpperCase()} (${slotName})`,
        conflictingScheduleId: existing.id,
        conflictDetails: {
          dayOfWeek: candidate.dayOfWeek,
          timeSlotName: slotName,
          roomName,
          classroomName: targetClassroom,
        },
      });
    }

    // 3. Check Classroom Collision (Rombel menerima >1 mapel pada slot jam yang sama)
    if (candidate.classroomId === existing.classroomId) {
      const classroomName =
        candidate.classroomName || existing.classroomName || "Rombel ini";
      const existingSubject =
        existing.subjectName || "kegiatan lain";
      const slotName =
        candidate.timeSlotName || existing.timeSlotName || "slot ini";

      collisions.push({
        type: "classroom",
        message: `Bentrok Rombel: ${classroomName} sudah memiliki jadwal (${existingSubject}) pada ${candidate.dayOfWeek.toUpperCase()} (${slotName})`,
        conflictingScheduleId: existing.id,
        conflictDetails: {
          dayOfWeek: candidate.dayOfWeek,
          timeSlotName: slotName,
          classroomName,
        },
      });
    }
  }

  // 4. Check Teacher Consecutive Workload Warning (Monitoring beban harian guru)
  if (candidate.teacherId) {
    const teacherDailySlots = existingPlots
      .filter(
        (p) =>
          p.teacherId === candidate.teacherId &&
          p.dayOfWeek === candidate.dayOfWeek &&
          p.id !== candidate.id,
      )
      .map((p) => p.timeSlotOrder);

    if (candidate.periodOrder) {
      teacherDailySlots.push(candidate.periodOrder);
    }
    teacherDailySlots.sort((a, b) => a - b);

    let maxConsecutive = 1;
    let currentConsecutive = 1;
    for (let i = 1; i < teacherDailySlots.length; i++) {
      if (teacherDailySlots[i] === teacherDailySlots[i - 1] + 1) {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutive) {
          maxConsecutive = currentConsecutive;
        }
      } else if (teacherDailySlots[i] !== teacherDailySlots[i - 1]) {
        currentConsecutive = 1;
      }
    }

    if (maxConsecutive >= 4) {
      const teacherName =
        candidate.teacherName || "Guru bersangkutan";
      warnings.push(
        `Peringatan Beban Kerja: ${teacherName} dijadwalkan mengajar ${maxConsecutive} jam pelajaran (JTM) berturut-turut pada hari ${candidate.dayOfWeek.toUpperCase()}. Disarankan memberikan jeda istirahat.`,
      );
    }
  }

  return {
    hasCollision: collisions.length > 0,
    collisions,
    warnings,
  };
}
