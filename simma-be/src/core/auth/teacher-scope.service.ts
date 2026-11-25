import { and, eq } from "drizzle-orm";
import type { Role } from "@simma/shared";
import { getDb } from "../database/client.js";
import { ForbiddenError } from "../errors/app-error.js";
import {
  classrooms,
  semesters,
  schedules,
  extracurriculars,
  teacherSubjectAssignments,
  teacherClassroomScopes,
  p5raProjects,
  p5raProjectClassrooms,
} from "../../db/schema/index.js";
import { userHasAnyRole } from "./auth.middleware.js";
import type { JwtAuthPayload } from "./jwt.js";

export interface TeacherScopeData {
  teacherId: string | null;
  homeroomClassroomIds: string[];
  subjectAssignments: Array<{ classroomId: string; subjectId: string }>;
  assignedClassroomIds: string[];
  extracurricularIds: string[];
  tahfidzClassroomIds: string[];
  mutabaahClassroomIds: string[];
  p5raClassroomIds: string[];
  p5raProjectIds: string[];
}

export class TeacherScopeService {
  isPrivileged(user: JwtAuthPayload | undefined | null, bypassRoles: Role[]): boolean {
    return userHasAnyRole(user, "super_admin", "operator", ...bypassRoles);
  }

  async getScopeForUser(user?: JwtAuthPayload | null): Promise<TeacherScopeData> {
    const teacherId = user?.teacherId ?? null;
    if (!teacherId) {
      return {
        teacherId: null,
        homeroomClassroomIds: [],
        subjectAssignments: [],
        assignedClassroomIds: [],
        extracurricularIds: [],
        tahfidzClassroomIds: [],
        mutabaahClassroomIds: [],
        p5raClassroomIds: [],
        p5raProjectIds: [],
      };
    }

    const db = getDb();
    const [activeSem] = await db
      .select({ id: semesters.id })
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    const homeroomConditions = activeSem
      ? and(eq(classrooms.homeroomTeacherId, teacherId), eq(classrooms.semesterId, activeSem.id))
      : eq(classrooms.homeroomTeacherId, teacherId);

    const homeroomRows = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .where(homeroomConditions);

    const assignCond = activeSem
      ? and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.semesterId, activeSem.id),
          eq(teacherSubjectAssignments.isActive, true),
        )
      : and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.isActive, true),
        );

    const explicitAssignRows = await db
      .select({
        classroomId: teacherSubjectAssignments.classroomId,
        subjectId: teacherSubjectAssignments.subjectId,
      })
      .from(teacherSubjectAssignments)
      .where(assignCond);

    const schedCond = activeSem
      ? and(eq(schedules.teacherId, teacherId), eq(schedules.semesterId, activeSem.id))
      : eq(schedules.teacherId, teacherId);

    const scheduleRows = await db
      .select({
        classroomId: schedules.classroomId,
        subjectId: schedules.subjectId,
      })
      .from(schedules)
      .where(schedCond);

    const pairMap = new Map<string, { classroomId: string; subjectId: string }>();
    for (const row of explicitAssignRows) {
      pairMap.set(`${row.classroomId}:${row.subjectId}`, row);
    }
    for (const row of scheduleRows) {
      if (row.subjectId) {
        pairMap.set(`${row.classroomId}:${row.subjectId}`, {
          classroomId: row.classroomId,
          subjectId: row.subjectId,
        });
      }
    }

    const ekskulRows = await db
      .select({ id: extracurriculars.id })
      .from(extracurriculars)
      .where(eq(extracurriculars.coachId, teacherId));

    const scopeCond = activeSem
      ? and(
          eq(teacherClassroomScopes.teacherId, teacherId),
          eq(teacherClassroomScopes.semesterId, activeSem.id),
        )
      : eq(teacherClassroomScopes.teacherId, teacherId);

    const scopeRows = await db
      .select({
        classroomId: teacherClassroomScopes.classroomId,
        scopeType: teacherClassroomScopes.scopeType,
      })
      .from(teacherClassroomScopes)
      .where(scopeCond);

    const p5raCoordRows = await db
      .select({ id: p5raProjects.id })
      .from(p5raProjects)
      .where(eq(p5raProjects.coordinatorTeacherId, teacherId));

    const homeroomClassroomIds = homeroomRows.map((r) => r.id);
    const subjectAssignments = Array.from(pairMap.values());
    const assignedClassroomIds = Array.from(
      new Set([
        ...homeroomClassroomIds,
        ...subjectAssignments.map((a) => a.classroomId),
      ]),
    );

    const tahfidzClassroomIds = Array.from(
      new Set([
        ...homeroomClassroomIds,
        ...scopeRows.filter((s) => s.scopeType === "tahfidz").map((s) => s.classroomId),
      ]),
    );

    const mutabaahClassroomIds = Array.from(
      new Set([
        ...homeroomClassroomIds,
        ...scopeRows.filter((s) => s.scopeType === "mutabaah").map((s) => s.classroomId),
      ]),
    );

    const p5raClassroomIds = Array.from(
      new Set([
        ...homeroomClassroomIds,
        ...scopeRows.filter((s) => s.scopeType === "p5ra").map((s) => s.classroomId),
      ]),
    );

    let p5raProjectIds = p5raCoordRows.map((p) => p.id);
    if (p5raClassroomIds.length > 0) {
      const projClassRows = await db
        .select({
          projectId: p5raProjectClassrooms.projectId,
          classroomId: p5raProjectClassrooms.classroomId,
        })
        .from(p5raProjectClassrooms);
      for (const row of projClassRows) {
        if (p5raClassroomIds.includes(row.classroomId)) {
          p5raProjectIds.push(row.projectId);
        }
      }
      p5raProjectIds = Array.from(new Set(p5raProjectIds));
    }

    return {
      teacherId,
      homeroomClassroomIds,
      subjectAssignments,
      assignedClassroomIds,
      extracurricularIds: ekskulRows.map((r) => r.id),
      tahfidzClassroomIds,
      mutabaahClassroomIds,
      p5raClassroomIds,
      p5raProjectIds,
    };
  }

  async assertHomeroomClassroom(
    user: JwtAuthPayload | undefined | null,
    classroomId: string,
    bypassRoles: Role[] = ["kepala_madrasah", "waka_kurikulum", "admin_tu"],
  ): Promise<void> {
    if (this.isPrivileged(user, bypassRoles)) return;
    const scope = await this.getScopeForUser(user);
    if (!scope.homeroomClassroomIds.includes(classroomId)) {
      throw new ForbiddenError(
        "Akses ditolak: Anda hanya dapat mengelola kelas perwalian Anda sendiri.",
      );
    }
  }

  async assertSubjectClassroom(
    user: JwtAuthPayload | undefined | null,
    classroomId: string,
    subjectId: string,
    bypassRoles: Role[] = ["kepala_madrasah", "waka_kurikulum", "admin_tu"],
  ): Promise<void> {
    if (this.isPrivileged(user, bypassRoles)) return;
    const scope = await this.getScopeForUser(user);
    const allowed = scope.subjectAssignments.some(
      (a) => a.classroomId === classroomId && a.subjectId === subjectId,
    );
    if (!allowed) {
      throw new ForbiddenError(
        "Akses ditolak: Anda tidak didelegasikan mengampu mata pelajaran pada kelas ini.",
      );
    }
  }

  async assertExtracurricular(
    user: JwtAuthPayload | undefined | null,
    extracurricularId: string,
    bypassRoles: Role[] = ["kepala_madrasah", "waka_kesiswaan", "admin_tu"],
  ): Promise<void> {
    if (this.isPrivileged(user, bypassRoles)) return;
    const scope = await this.getScopeForUser(user);
    if (!scope.extracurricularIds.includes(extracurricularId)) {
      throw new ForbiddenError(
        "Akses ditolak: Anda hanya dapat mengelola ekstrakurikuler yang ditugaskan kepada Anda.",
      );
    }
  }
}

export const teacherScopeService = new TeacherScopeService();
