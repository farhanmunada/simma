import { eq, and, or, ilike, count, desc, isNull, inArray } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  students,
  parents,
  studentParents,
  classStudents,
} from "../../db/schema/students.js";
import { classrooms, type Classroom } from "../../db/schema/setup.js";
import type {
  Student,
  NewStudent,
  Parent,
  NewParent,
  StudentParent,
  NewStudentParent,
  ClassStudent,
  NewClassStudent,
  StudentParentDetail,
} from "./students.types.js";

export class StudentsRepository {
  async findStudents(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    gender?: string;
    classroomId?: string;
  }): Promise<{ data: Student[]; total: number }> {
    const db = getDb();
    const conditions = [isNull(students.deletedAt)];

    if (params.search) {
      const term = `%${params.search}%`;
      conditions.push(
        or(
          ilike(students.fullName, term),
          ilike(students.nik, term),
          ilike(students.nis, term),
          ilike(students.nisn, term),
        )!,
      );
    }

    if (params.status) {
      conditions.push(eq(students.status, params.status));
    }

    if (params.gender) {
      conditions.push(eq(students.gender, params.gender));
    }

    if (params.classroomId) {
      const studentIdsInClass = db
        .select({ studentId: classStudents.studentId })
        .from(classStudents)
        .where(eq(classStudents.classroomId, params.classroomId));

      conditions.push(inArray(students.id, studentIdsInClass));
    }

    const whereClause = and(...conditions);
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(students)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(students)
      .where(whereClause)
      .orderBy(desc(students.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findStudentById(id: string): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async findStudentByNik(nik: string): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.nik, nik), isNull(students.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async findStudentByNisn(nisn: string): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(students)
      .where(and(eq(students.nisn, nisn), isNull(students.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async createStudent(data: NewStudent): Promise<Student> {
    const db = getDb();
    const [row] = await db.insert(students).values(data).returning();
    return row;
  }

  async updateStudent(
    id: string,
    data: Partial<NewStudent>,
  ): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .update(students)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .returning();
    return row ?? null;
  }

  async softDeleteStudent(id: string): Promise<Student | null> {
    const db = getDb();
    const [row] = await db
      .update(students)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .returning();
    return row ?? null;
  }

  async findParentsByStudentId(studentId: string): Promise<StudentParentDetail[]> {
    const db = getDb();
    const rows = await db
      .select({
        id: parents.id,
        nik: parents.nik,
        name: parents.name,
        birthPlace: parents.birthPlace,
        birthDate: parents.birthDate,
        gender: parents.gender,
        education: parents.education,
        occupation: parents.occupation,
        income: parents.income,
        phone: parents.phone,
        address: parents.address,
        emisData: parents.emisData,
        createdAt: parents.createdAt,
        updatedAt: parents.updatedAt,
        relationType: studentParents.relationType,
        isGuardian: studentParents.isGuardian,
      })
      .from(studentParents)
      .innerJoin(parents, eq(studentParents.parentId, parents.id))
      .where(eq(studentParents.studentId, studentId));

    return rows;
  }

  async findParentById(id: string): Promise<Parent | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(parents)
      .where(eq(parents.id, id))
      .limit(1);
    return row ?? null;
  }

  async createParent(data: NewParent): Promise<Parent> {
    const db = getDb();
    const [row] = await db.insert(parents).values(data).returning();
    return row;
  }

  async linkStudentParent(data: NewStudentParent): Promise<StudentParent> {
    const db = getDb();
    const [row] = await db.insert(studentParents).values(data).returning();
    return row;
  }

  async createAndLinkParent(
    studentId: string,
    parentData: NewParent,
    linkData: { relationType: "ayah" | "ibu" | "wali"; isGuardian: boolean },
  ): Promise<StudentParentDetail> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      const [parent] = await tx.insert(parents).values(parentData).returning();
      const [link] = await tx
        .insert(studentParents)
        .values({
          studentId,
          parentId: parent.id,
          relationType: linkData.relationType,
          isGuardian: linkData.isGuardian,
        })
        .returning();

      return {
        ...parent,
        relationType: link.relationType,
        isGuardian: link.isGuardian,
      };
    });
  }

  async findClassroomById(id: string): Promise<Classroom | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.id, id))
      .limit(1);
    return row ?? null;
  }

  async assignStudentToClassroom(data: NewClassStudent): Promise<ClassStudent> {
    const db = getDb();
    const [row] = await db
      .insert(classStudents)
      .values(data)
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async assignStudentsToClassroom(
    classroomId: string,
    studentIds: string[],
  ): Promise<number> {
    const db = getDb();
    let assignedCount = 0;
    for (const studentId of studentIds) {
      const [existing] = await db
        .select()
        .from(classStudents)
        .where(
          and(
            eq(classStudents.classroomId, classroomId),
            eq(classStudents.studentId, studentId),
          ),
        )
        .limit(1);

      if (!existing) {
        await db.insert(classStudents).values({
          classroomId,
          studentId,
        });
        assignedCount++;
      }
    }
    return assignedCount;
  }
}

export const studentsRepository = new StudentsRepository();
