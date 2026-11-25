import bcrypt from "bcrypt";
import { and, eq, inArray, like } from "drizzle-orm";
import {
  getGtkPrefixForRole,
  type Role,
  type TeacherScopeType,
} from "@simma/shared";
import { getDb } from "../../core/database/client.js";
import { ConflictError } from "../../core/errors/app-error.js";
import {
  users,
  teachers,
  semesters,
  classrooms,
  extracurriculars,
  teacherSubjectAssignments,
  teacherClassroomScopes,
} from "../../db/schema/index.js";
import type {
  TeacherAccountSummary,
  TeacherAssignmentsDetail,
} from "./teachers.types.js";

const BCRYPT_ROUNDS = 12;

export class TeachersAccountRepository {
  async generateNextEmployeeCode(role: Role): Promise<string> {
    const db = getDb();
    const prefix = getGtkPrefixForRole(role);
    const [teacherMatches, userMatches] = await Promise.all([
      db
        .select({ code: teachers.employeeCode })
        .from(teachers)
        .where(like(teachers.employeeCode, `${prefix}%`)),
      db
        .select({ username: users.username })
        .from(users)
        .where(like(users.username, `${prefix}%`)),
    ]);

    const used = new Set<string>();
    for (const r of teacherMatches) {
      if (r.code) used.add(r.code);
    }
    for (const u of userMatches) {
      used.add(u.username);
    }

    for (let seq = 1; seq <= 99; seq++) {
      const candidate = `${prefix}${String(seq).padStart(2, "0")}`;
      if (!used.has(candidate)) {
        return candidate;
      }
    }

    throw new ConflictError(
      `Nomor urut kode untuk gugus ${prefix} sudah penuh (01-99).`,
    );
  }

  async provisionAccountInTx(
    tx: any,
    params: {
      teacherId: string;
      existingUserId: string | null;
      existingCode: string | null;
      primaryRole: Role;
      secondaryRoles?: Role[];
      employeeCode?: string;
      isActive?: boolean;
      resetPasswordToCode?: boolean;
    },
  ): Promise<{ userId: string; employeeCode: string }> {
    const code = params.employeeCode ?? params.existingCode ?? (await this.generateNextEmployeeCode(params.primaryRole));
    const secondary = Array.from(
      new Set((params.secondaryRoles ?? []).filter((r) => r !== params.primaryRole)),
    );
    const isActive = params.isActive ?? true;

    const [conflictTeacher] = await tx
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.employeeCode, code))
      .limit(1);
    if (conflictTeacher && conflictTeacher.id !== params.teacherId) {
      throw new ConflictError(`Kode GTK ${code} sudah dipakai oleh GTK lain.`);
    }

    const [conflictUser] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, code))
      .limit(1);
    if (conflictUser && conflictUser.id !== params.existingUserId) {
      throw new ConflictError(`Kode login ${code} sudah terdaftar pada akun lain.`);
    }

    let userId = params.existingUserId;
    const shouldHashCode =
      !userId || params.resetPasswordToCode || code !== params.existingCode;

    if (userId) {
      const updatePayload: Record<string, unknown> = {
        username: code,
        role: params.primaryRole,
        secondaryRoles: secondary,
        teacherId: params.teacherId,
        isActive,
        updatedAt: new Date(),
      };
      if (shouldHashCode) {
        updatePayload.passwordHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
      }
      await tx.update(users).set(updatePayload).where(eq(users.id, userId));
    } else {
      const passwordHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
      const [created] = await tx
        .insert(users)
        .values({
          username: code,
          passwordHash,
          role: params.primaryRole,
          secondaryRoles: secondary,
          teacherId: params.teacherId,
          isActive,
        })
        .returning({ id: users.id });
      userId = created.id;
    }

    await tx
      .update(teachers)
      .set({ employeeCode: code, userId, updatedAt: new Date() })
      .where(eq(teachers.id, params.teacherId));

    return { userId: userId!, employeeCode: code };
  }

  async syncAssignmentsInTx(
    tx: any,
    teacherId: string,
    assignments: {
      homeroomClassroomId?: string | null;
      subjectAssignments?: Array<{ classroomId: string; subjectId: string }>;
      extracurricularIds?: string[];
      classroomScopes?: Array<{ classroomId: string; scopeType: TeacherScopeType }>;
    },
  ): Promise<void> {
    const [activeSem] = await tx
      .select({ id: semesters.id, academicYearId: semesters.academicYearId })
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    if (assignments.homeroomClassroomId !== undefined) {
      const clearCond = activeSem
        ? and(eq(classrooms.homeroomTeacherId, teacherId), eq(classrooms.semesterId, activeSem.id))
        : eq(classrooms.homeroomTeacherId, teacherId);

      await tx
        .update(classrooms)
        .set({ homeroomTeacherId: null, updatedAt: new Date() })
        .where(clearCond);

      if (assignments.homeroomClassroomId) {
        await tx
          .update(classrooms)
          .set({ homeroomTeacherId: teacherId, updatedAt: new Date() })
          .where(eq(classrooms.id, assignments.homeroomClassroomId));
      }
    }

    if (assignments.subjectAssignments !== undefined && activeSem) {
      await tx
        .delete(teacherSubjectAssignments)
        .where(
          and(
            eq(teacherSubjectAssignments.teacherId, teacherId),
            eq(teacherSubjectAssignments.semesterId, activeSem.id),
          ),
        );

      const dedup = new Map<string, { classroomId: string; subjectId: string }>();
      for (const pair of assignments.subjectAssignments) {
        dedup.set(`${pair.classroomId}:${pair.subjectId}`, pair);
      }

      if (dedup.size > 0) {
        await tx.insert(teacherSubjectAssignments).values(
          Array.from(dedup.values()).map((pair) => ({
            teacherId,
            academicYearId: activeSem.academicYearId,
            semesterId: activeSem.id,
            classroomId: pair.classroomId,
            subjectId: pair.subjectId,
            isActive: true,
          })),
        );
      }
    }

    if (assignments.extracurricularIds !== undefined) {
      await tx
        .update(extracurriculars)
        .set({ coachId: null, updatedAt: new Date() })
        .where(eq(extracurriculars.coachId, teacherId));

      if (assignments.extracurricularIds.length > 0) {
        await tx
          .update(extracurriculars)
          .set({ coachId: teacherId, updatedAt: new Date() })
          .where(inArray(extracurriculars.id, assignments.extracurricularIds));
      }
    }

    if (assignments.classroomScopes !== undefined && activeSem) {
      await tx
        .delete(teacherClassroomScopes)
        .where(
          and(
            eq(teacherClassroomScopes.teacherId, teacherId),
            eq(teacherClassroomScopes.semesterId, activeSem.id),
          ),
        );

      const dedupScope = new Map<string, { classroomId: string; scopeType: TeacherScopeType }>();
      for (const item of assignments.classroomScopes) {
        dedupScope.set(`${item.classroomId}:${item.scopeType}`, item);
      }

      if (dedupScope.size > 0) {
        await tx.insert(teacherClassroomScopes).values(
          Array.from(dedupScope.values()).map((item) => ({
            teacherId,
            semesterId: activeSem.id,
            classroomId: item.classroomId,
            scopeType: item.scopeType,
          })),
        );
      }
    }
  }

  async getBatchAccountMap(teacherIds: string[]): Promise<Map<string, TeacherAccountSummary>> {
    if (teacherIds.length === 0) return new Map();
    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        secondaryRoles: users.secondaryRoles,
        teacherId: users.teacherId,
        isActive: users.isActive,
      })
      .from(users)
      .where(inArray(users.teacherId, teacherIds));

    const map = new Map<string, TeacherAccountSummary>();
    for (const r of rows) {
      if (r.teacherId) {
        map.set(r.teacherId, {
          userId: r.id,
          username: r.username,
          role: r.role,
          secondaryRoles: r.secondaryRoles ?? [],
          isActive: r.isActive,
        });
      }
    }
    return map;
  }

  async getTeacherAssignmentsDetail(teacherId: string): Promise<TeacherAssignmentsDetail> {
    const db = getDb();
    const [activeSem] = await db
      .select({ id: semesters.id })
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    const homeroomCond = activeSem
      ? and(eq(classrooms.homeroomTeacherId, teacherId), eq(classrooms.semesterId, activeSem.id))
      : eq(classrooms.homeroomTeacherId, teacherId);

    const assignCond = activeSem
      ? and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.semesterId, activeSem.id),
        )
      : eq(teacherSubjectAssignments.teacherId, teacherId);

    const scopeCond = activeSem
      ? and(
          eq(teacherClassroomScopes.teacherId, teacherId),
          eq(teacherClassroomScopes.semesterId, activeSem.id),
        )
      : eq(teacherClassroomScopes.teacherId, teacherId);

    const [homerooms, subjectsList, ekskuls, scopes] = await Promise.all([
      db.select({ id: classrooms.id }).from(classrooms).where(homeroomCond).limit(1),
      db
        .select({
          classroomId: teacherSubjectAssignments.classroomId,
          subjectId: teacherSubjectAssignments.subjectId,
        })
        .from(teacherSubjectAssignments)
        .where(assignCond),
      db
        .select({ id: extracurriculars.id })
        .from(extracurriculars)
        .where(eq(extracurriculars.coachId, teacherId)),
      db
        .select({
          classroomId: teacherClassroomScopes.classroomId,
          scopeType: teacherClassroomScopes.scopeType,
        })
        .from(teacherClassroomScopes)
        .where(scopeCond),
    ]);

    return {
      homeroomClassroomId: homerooms[0]?.id ?? null,
      subjectAssignments: subjectsList,
      extracurricularIds: ekskuls.map((e) => e.id),
      classroomScopes: scopes,
    };
  }
}

export const teachersAccountRepository = new TeachersAccountRepository();
