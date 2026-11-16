import { eq, and, desc, isNull } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  students,
  classStudents,
  institutions,
  academicYears,
  semesters,
  classrooms,
  subjects,
  teachers,
  semesterGrades,
  attendanceStudents,
  tahfidzRecords,
  tasmiExams,
  type Student,
  type Institution,
  type Classroom,
  type Teacher,
  type Semester,
  type AcademicYear,
  type Subject,
  type SemesterGrade,
  type AttendanceStudent,
  type TahfidzRecord,
  type TasmiExam,
} from "../../db/schema/index.js";
import type { ReportNotesBodyInput } from "./reports.schema.js";
import type { StudentReportNotes } from "./reports.types.js";

export class ReportsRepository {
  async findStudentById(studentId: string): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), isNull(students.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async findFirstInstitution(): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db.select().from(institutions).limit(1);
    return row ?? null;
  }

  async findSemesterWithAcademicYear(semesterId: string): Promise<{
    semester: Semester;
    academicYear: AcademicYear;
  } | null> {
    const db = getDb();
    const rows = await db
      .select({
        semester: semesters,
        academicYear: academicYears,
      })
      .from(semesters)
      .innerJoin(academicYears, eq(semesters.academicYearId, academicYears.id))
      .where(eq(semesters.id, semesterId))
      .limit(1);

    return rows[0] ?? null;
  }

  async findStudentClassroom(
    studentId: string,
    semesterId: string,
  ): Promise<{
    classroom: Classroom;
    homeroomTeacher: Teacher | null;
  } | null> {
    const db = getDb();
    const rows = await db
      .select({
        classroom: classrooms,
        homeroomTeacher: teachers,
      })
      .from(classStudents)
      .innerJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .leftJoin(teachers, eq(classrooms.homeroomTeacherId, teachers.id))
      .where(
        and(
          eq(classStudents.studentId, studentId),
          eq(classrooms.semesterId, semesterId),
        ),
      )
      .limit(1);

    if (rows[0]) return rows[0];

    // Fallback: search classroom without semester filter if student is enrolled
    const fallbackRows = await db
      .select({
        classroom: classrooms,
        homeroomTeacher: teachers,
      })
      .from(classStudents)
      .innerJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .leftJoin(teachers, eq(classrooms.homeroomTeacherId, teachers.id))
      .where(eq(classStudents.studentId, studentId))
      .limit(1);

    return fallbackRows[0] ?? null;
  }

  async findStudentSemesterGrades(
    studentId: string,
    semesterId: string,
  ): Promise<
    Array<{
      grade: SemesterGrade;
      subject: Subject;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        grade: semesterGrades,
        subject: subjects,
      })
      .from(semesterGrades)
      .innerJoin(subjects, eq(semesterGrades.subjectId, subjects.id))
      .where(
        and(
          eq(semesterGrades.studentId, studentId),
          eq(semesterGrades.semesterId, semesterId),
        ),
      );

    return rows;
  }

  async findStudentAttendance(
    studentId: string,
    classroomId?: string,
  ): Promise<AttendanceStudent[]> {
    const db = getDb();
    const conditions = [eq(attendanceStudents.studentId, studentId)];
    if (classroomId) {
      conditions.push(eq(attendanceStudents.classroomId, classroomId));
    }
    return db
      .select()
      .from(attendanceStudents)
      .where(and(...conditions));
  }

  async findStudentTahfidz(studentId: string): Promise<{
    records: TahfidzRecord[];
    tasmiExams: TasmiExam[];
  }> {
    const db = getDb();
    const records = await db
      .select()
      .from(tahfidzRecords)
      .where(eq(tahfidzRecords.studentId, studentId))
      .orderBy(desc(tahfidzRecords.date));

    const exams = await db
      .select()
      .from(tasmiExams)
      .where(eq(tasmiExams.studentId, studentId))
      .orderBy(desc(tasmiExams.examDate));

    return { records, tasmiExams: exams };
  }

  async getStudentNotes(
    studentId: string,
    semesterId: string,
  ): Promise<StudentReportNotes | null> {
    const student = await this.findStudentById(studentId);
    if (!student) return null;

    const emisData = (student.emisData ?? {}) as Record<string, unknown>;
    const reportNotesMap = (emisData.reportNotes ?? {}) as Record<
      string,
      StudentReportNotes
    >;
    return reportNotesMap[semesterId] ?? null;
  }

  async saveStudentNotes(
    studentId: string,
    input: ReportNotesBodyInput,
  ): Promise<StudentReportNotes> {
    const db = getDb();
    const student = await this.findStudentById(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    const currentEmisData = (student.emisData ?? {}) as Record<string, unknown>;
    const currentReportNotes = (currentEmisData.reportNotes ?? {}) as Record<
      string,
      StudentReportNotes
    >;

    const updatedNote: StudentReportNotes = {
      teacherNotes: input.teacherNotes,
      spiritualAttitude: input.spiritualAttitude ?? "",
      socialAttitude: input.socialAttitude ?? "",
      extracurriculars: (input.extracurriculars ?? []).map((e) => ({
        name: e.name,
        score: e.score ?? "Baik",
        description: e.description ?? "",
      })),
      achievements: (input.achievements ?? []).map((a) => ({
        description: a.description,
        type: a.type ?? "Akademik",
      })),
      updatedAt: new Date().toISOString(),
    };

    currentReportNotes[input.semesterId] = updatedNote;
    currentEmisData.reportNotes = currentReportNotes;

    await db
      .update(students)
      .set({
        emisData: currentEmisData,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    return updatedNote;
  }

  async findClassroomById(classroomId: string): Promise<{
    classroom: Classroom;
    homeroomTeacher: Teacher | null;
  } | null> {
    const db = getDb();
    const rows = await db
      .select({
        classroom: classrooms,
        homeroomTeacher: teachers,
      })
      .from(classrooms)
      .leftJoin(teachers, eq(classrooms.homeroomTeacherId, teachers.id))
      .where(eq(classrooms.id, classroomId))
      .limit(1);

    return rows[0] ?? null;
  }

  async findClassroomStudents(classroomId: string): Promise<Student[]> {
    const db = getDb();
    const rows = await db
      .select({
        student: students,
      })
      .from(classStudents)
      .innerJoin(students, eq(classStudents.studentId, students.id))
      .where(
        and(
          eq(classStudents.classroomId, classroomId),
          isNull(students.deletedAt),
        ),
      );

    return rows.map((r) => r.student);
  }

  async findClassroomSemesterGrades(
    classroomId: string,
    semesterId: string,
  ): Promise<
    Array<{
      grade: SemesterGrade;
      subject: Subject;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        grade: semesterGrades,
        subject: subjects,
      })
      .from(semesterGrades)
      .innerJoin(subjects, eq(semesterGrades.subjectId, subjects.id))
      .where(
        and(
          eq(semesterGrades.classroomId, classroomId),
          eq(semesterGrades.semesterId, semesterId),
        ),
      );

    return rows;
  }

  async findClassroomAttendance(
    classroomId: string,
  ): Promise<AttendanceStudent[]> {
    const db = getDb();
    return db
      .select()
      .from(attendanceStudents)
      .where(eq(attendanceStudents.classroomId, classroomId));
  }
}

export const reportsRepository = new ReportsRepository();
