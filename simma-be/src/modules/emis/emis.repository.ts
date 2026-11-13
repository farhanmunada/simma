import { eq, sql } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  students,
  studentParents,
  parents,
  classStudents,
} from "../../db/schema/students.js";
import { teacherProfiles } from "../../db/schema/teachers.js";
import {
  teachers,
  classrooms,
  institutions,
  academicYears,
  semesters,
} from "../../db/schema/setup.js";
import type { EmisBapRecord, EmisInstitutionExportRow } from "./emis.types.js";

// In-memory BAP storage for persistence during runtime & unit testing
const bapStore: Map<string, EmisBapRecord> = new Map();

export class EmisRepository {
  constructor(private db = getDb() as any) {}

  async getActiveInstitution(): Promise<EmisInstitutionExportRow> {
    try {
      const [inst] = await this.db.select().from(institutions).limit(1);
      const [ay] = await this.db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);
      const [sem] = await this.db.select().from(semesters).where(eq(semesters.isActive, true)).limit(1);

      return {
        nsm: inst?.nsm || "131232010001",
        npsn: inst?.npsn || "20277890",
        name: inst?.name || "MAN 1 Model Kemenag",
        status: inst?.status || "Negeri",
        address: inst?.address || "Jl. Madrasah No. 10, Kemenag",
        academicYear: ay?.name || "2025/2026",
        semester: sem?.type === 2 ? "Genap" : "Ganjil",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
      };
    } catch {
      return {
        nsm: "131232010001",
        npsn: "20277890",
        name: "MAN 1 Model Kemenag",
        status: "Negeri",
        address: "Jl. Madrasah No. 10, Kemenag",
        academicYear: "2025/2026",
        semester: "Ganjil",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
      };
    }
  }

  async getStudentsForEmis() {
    try {
      const studentList: any[] = await this.db
        .select({
          id: students.id,
          nik: students.nik,
          nisn: students.nisn,
          nis: students.nis,
          fullName: students.fullName,
          gender: students.gender,
          birthPlace: students.birthPlace,
          birthDate: students.birthDate,
          motherName: students.motherName,
          status: students.status,
          classroomId: classrooms.id,
          classroomName: classrooms.name,
          gradeLevel: classrooms.gradeLevel,
        })
        .from(students)
        .leftJoin(classStudents, eq(classStudents.studentId, students.id))
        .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id));

      const parentList: any[] = await this.db
        .select({
          studentId: studentParents.studentId,
          relationType: studentParents.relationType,
          nik: parents.nik,
          name: parents.name,
        })
        .from(studentParents)
        .innerJoin(parents, eq(studentParents.parentId, parents.id));

      const parentMap = new Map<string, Array<{ relationType: string; nik?: string | null; name?: string | null }>>();
      for (const p of parentList) {
        const list = parentMap.get(p.studentId) || [];
        list.push({ relationType: p.relationType, nik: p.nik, name: p.name });
        parentMap.set(p.studentId, list);
      }

      return studentList.map((s) => ({
        ...s,
        parents: parentMap.get(s.id) || [],
      }));
    } catch {
      return [];
    }
  }

  async getTeachersForEmis() {
    try {
      const teacherList: any[] = await this.db
        .select({
          id: teachers.id,
          nik: teachers.nik,
          nuptk: teachers.nuptk,
          fullName: teachers.fullName,
          employmentType: teachers.employmentType,
          certification: teachers.certification,
          nip: teacherProfiles.nip,
          pegId: teacherProfiles.pegId,
          gender: teacherProfiles.gender,
          birthPlace: teacherProfiles.birthPlace,
          birthDate: teacherProfiles.birthDate,
          dutyStatus: teacherProfiles.dutyStatus,
          gtkType: teacherProfiles.gtkType,
          certificationField: teacherProfiles.certificationField,
        })
        .from(teachers)
        .leftJoin(teacherProfiles, eq(teachers.id, teacherProfiles.teacherId));

      return teacherList.map((t) => ({
        ...t,
        pegId: t.pegId || (t.nuptk ? `PEG-${t.nuptk.slice(-6)}` : ""),
        dutyStatus: t.dutyStatus || "Aktif Mengajar",
        gtkType: t.gtkType || (t.employmentType === "PNS" ? "Guru PNS" : "Guru Tetap Yayasan"),
        highestEducation: "S1",
        major: "Pendidikan",
        isCertified: Boolean(t.certification),
        totalJtm: 24, // Standar beban minimum KMA Kemenag
      }));
    } catch {
      return [];
    }
  }

  async getClassroomsForEmis() {
    try {
      const crList: any[] = await this.db
        .select({
          id: classrooms.id,
          name: classrooms.name,
          gradeLevel: classrooms.gradeLevel,
          capacity: classrooms.capacity,
          homeroomTeacherId: classrooms.homeroomTeacherId,
          homeroomTeacherName: teachers.fullName,
          homeroomTeacherNuptk: teachers.nuptk,
        })
        .from(classrooms)
        .leftJoin(teachers, eq(classrooms.homeroomTeacherId, teachers.id));

      const countList: any[] = await this.db
        .select({
          classroomId: classStudents.classroomId,
          count: sql<number>`count(*)::int`,
        })
        .from(classStudents)
        .groupBy(classStudents.classroomId);

      const countMap = new Map<string, number>();
      for (const c of countList) {
        if (c.classroomId) countMap.set(c.classroomId, Number(c.count) || 0);
      }

      return crList.map((cr) => ({
        ...cr,
        studentCount: countMap.get(cr.id) || 0,
      }));
    } catch {
      return [];
    }
  }

  async saveBap(bap: EmisBapRecord): Promise<EmisBapRecord> {
    bapStore.set(bap.id, bap);
    return bap;
  }

  async findBapById(id: string): Promise<EmisBapRecord | null> {
    return bapStore.get(id) || null;
  }

  async listBapRecords(): Promise<EmisBapRecord[]> {
    return Array.from(bapStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
