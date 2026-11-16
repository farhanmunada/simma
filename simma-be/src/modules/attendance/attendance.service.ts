import { NotFoundError } from "../../core/errors/index.js";
import {
  AttendanceRepository,
  attendanceRepository,
} from "./attendance.repository.js";
import type {
  AttendanceStudent,
  NewAttendanceStudent,
  AttendanceTeacher,
  NewAttendanceTeacher,
  StudentAttendanceSummary,
  TeacherAttendanceSummary,
  ClassroomDailyAttendance,
} from "./attendance.types.js";
import type {
  RecordStudentAttendanceInput,
  UpdateStudentAttendanceInput,
  BulkStudentAttendanceInput,
  StudentAttendanceQueryParams,
  RecordTeacherAttendanceInput,
  UpdateTeacherAttendanceInput,
  BulkTeacherAttendanceInput,
  TeacherAttendanceQueryParams,
} from "./attendance.schema.js";

export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository = attendanceRepository,
  ) {}

  // --- Student Attendance ---

  async recordStudentAttendance(
    input: RecordStudentAttendanceInput,
    fallbackTeacherId?: string | null,
  ): Promise<AttendanceStudent> {
    const data: NewAttendanceStudent = {
      studentId: input.studentId,
      classroomId: input.classroomId,
      date: input.date,
      status: input.status,
      note: input.note ?? null,
      teacherId: input.teacherId ?? fallbackTeacherId ?? null,
    };
    return this.repo.upsertStudentAttendance(data);
  }

  async bulkRecordStudentAttendance(
    input: BulkStudentAttendanceInput,
    fallbackTeacherId?: string | null,
  ): Promise<AttendanceStudent[]> {
    const teacherId = input.teacherId ?? fallbackTeacherId ?? null;
    const records: NewAttendanceStudent[] = input.attendances.map((item) => ({
      studentId: item.studentId,
      classroomId: input.classroomId,
      date: input.date,
      status: item.status,
      note: item.note ?? null,
      teacherId,
    }));
    return this.repo.bulkUpsertStudentAttendance(records);
  }

  async getStudentAttendanceById(id: string): Promise<AttendanceStudent> {
    const row = await this.repo.findStudentAttendanceById(id);
    if (!row) {
      throw new NotFoundError("Data presensi siswa tidak ditemukan");
    }
    return row;
  }

  async updateStudentAttendance(
    id: string,
    input: UpdateStudentAttendanceInput,
  ): Promise<AttendanceStudent> {
    await this.getStudentAttendanceById(id);
    const updated = await this.repo.updateStudentAttendance(id, {
      ...(input.status && { status: input.status }),
      ...(input.note !== undefined && { note: input.note }),
      ...(input.teacherId !== undefined && { teacherId: input.teacherId }),
    });
    if (!updated) {
      throw new NotFoundError("Data presensi siswa gagal diperbarui");
    }
    return updated;
  }

  async deleteStudentAttendance(id: string): Promise<void> {
    await this.getStudentAttendanceById(id);
    await this.repo.deleteStudentAttendance(id);
  }

  async getStudentAttendances(
    params: StudentAttendanceQueryParams,
  ): Promise<{ data: AttendanceStudent[]; total: number; page: number; limit: number }> {
    const result = await this.repo.findStudentAttendances(params);
    return {
      ...result,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
  }

  async getClassroomAttendance(
    classroomId: string,
    date: string,
  ): Promise<ClassroomDailyAttendance> {
    const attendances = await this.repo.findClassroomAttendanceByDate(
      classroomId,
      date,
    );
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    for (const att of attendances) {
      if (att.status === "hadir") hadir++;
      else if (att.status === "izin") izin++;
      else if (att.status === "sakit") sakit++;
      else if (att.status === "alpa") alpa++;
    }

    const total = attendances.length;
    const attendancePercentage =
      total > 0 ? Math.round((hadir / total) * 100 * 100) / 100 : 0;

    return {
      classroomId,
      date,
      attendances,
      summary: {
        hadir,
        izin,
        sakit,
        alpa,
        total,
        attendancePercentage,
      },
    };
  }

  async getStudentAttendanceSummary(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<StudentAttendanceSummary> {
    const records = await this.repo.findStudentAttendanceHistory(
      studentId,
      startDate,
      endDate,
    );

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    for (const att of records) {
      if (att.status === "hadir") hadir++;
      else if (att.status === "izin") izin++;
      else if (att.status === "sakit") sakit++;
      else if (att.status === "alpa") alpa++;
    }

    const total = records.length;
    const attendancePercentage =
      total > 0 ? Math.round((hadir / total) * 100 * 100) / 100 : 0;

    return {
      studentId,
      hadir,
      izin,
      sakit,
      alpa,
      total,
      attendancePercentage,
    };
  }

  // --- Teacher Attendance ---

  async recordTeacherAttendance(
    input: RecordTeacherAttendanceInput,
  ): Promise<AttendanceTeacher> {
    const data: NewAttendanceTeacher = {
      teacherId: input.teacherId,
      date: input.date,
      status: input.status,
      note: input.note ?? null,
    };
    return this.repo.upsertTeacherAttendance(data);
  }

  async bulkRecordTeacherAttendance(
    input: BulkTeacherAttendanceInput,
  ): Promise<AttendanceTeacher[]> {
    const records: NewAttendanceTeacher[] = input.attendances.map((item) => ({
      teacherId: item.teacherId,
      date: input.date,
      status: item.status,
      note: item.note ?? null,
    }));
    return this.repo.bulkUpsertTeacherAttendance(records);
  }

  async getTeacherAttendanceById(id: string): Promise<AttendanceTeacher> {
    const row = await this.repo.findTeacherAttendanceById(id);
    if (!row) {
      throw new NotFoundError("Data presensi guru tidak ditemukan");
    }
    return row;
  }

  async updateTeacherAttendance(
    id: string,
    input: UpdateTeacherAttendanceInput,
  ): Promise<AttendanceTeacher> {
    await this.getTeacherAttendanceById(id);
    const updated = await this.repo.updateTeacherAttendance(id, {
      ...(input.status && { status: input.status }),
      ...(input.note !== undefined && { note: input.note }),
    });
    if (!updated) {
      throw new NotFoundError("Data presensi guru gagal diperbarui");
    }
    return updated;
  }

  async deleteTeacherAttendance(id: string): Promise<void> {
    await this.getTeacherAttendanceById(id);
    await this.repo.deleteTeacherAttendance(id);
  }

  async getTeacherAttendances(
    params: TeacherAttendanceQueryParams,
  ): Promise<{ data: AttendanceTeacher[]; total: number; page: number; limit: number }> {
    const result = await this.repo.findTeacherAttendances(params);
    return {
      ...result,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
  }

  async getTeacherAttendanceSummary(
    teacherId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TeacherAttendanceSummary> {
    const records = await this.repo.findTeacherAttendanceHistory(
      teacherId,
      startDate,
      endDate,
    );

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let dinasLuar = 0;

    for (const att of records) {
      if (att.status === "hadir") hadir++;
      else if (att.status === "izin") izin++;
      else if (att.status === "sakit") sakit++;
      else if (att.status === "alpa") alpa++;
      else if (att.status === "dinas_luar") dinasLuar++;
    }

    const total = records.length;
    // Hadir + Dinas Luar count towards present percentage
    const presentCount = hadir + dinasLuar;
    const attendancePercentage =
      total > 0 ? Math.round((presentCount / total) * 100 * 100) / 100 : 0;

    return {
      teacherId,
      hadir,
      izin,
      sakit,
      alpa,
      dinasLuar,
      total,
      attendancePercentage,
    };
  }
}

export const attendanceService = new AttendanceService();
