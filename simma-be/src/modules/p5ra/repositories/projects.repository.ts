import { eq, and, inArray, asc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import {
  p5raProjects,
  p5raProjectClassrooms,
  p5raProjectTargets,
  classrooms,
  type P5raProject,
  type Classroom,
} from "../../../db/schema/index.js";
import type { ProjectWithClassrooms } from "../p5ra.types.js";
import type {
  CreateP5raProjectInput,
  UpdateP5raProjectInput,
  P5raProjectQueryInput,
} from "../p5ra.schema.js";

export class ProjectsRepository {
  async listProjects(filter: P5raProjectQueryInput): Promise<ProjectWithClassrooms[]> {
    const db = getDb();
    const conditions = [];

    if (filter.academicYearId) {
      conditions.push(eq(p5raProjects.academicYearId, filter.academicYearId));
    }
    if (filter.semesterId) {
      conditions.push(eq(p5raProjects.semesterId, filter.semesterId));
    }
    if (filter.status) {
      conditions.push(eq(p5raProjects.status, filter.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const projectRows = await db
      .select()
      .from(p5raProjects)
      .where(whereClause)
      .orderBy(asc(p5raProjects.createdAt));

    if (projectRows.length === 0) return [];

    const projectIds = projectRows.map((p) => p.id);
    const classroomLinks = await db
      .select({
        projectId: p5raProjectClassrooms.projectId,
        classroom: classrooms,
      })
      .from(p5raProjectClassrooms)
      .innerJoin(classrooms, eq(p5raProjectClassrooms.classroomId, classrooms.id))
      .where(inArray(p5raProjectClassrooms.projectId, projectIds));

    const classroomMap = new Map<string, Classroom[]>();
    for (const link of classroomLinks) {
      const list = classroomMap.get(link.projectId) || [];
      list.push(link.classroom);
      classroomMap.set(link.projectId, list);
    }

    const targets = await db
      .select({ projectId: p5raProjectTargets.projectId })
      .from(p5raProjectTargets)
      .where(inArray(p5raProjectTargets.projectId, projectIds));

    const targetCountMap = new Map<string, number>();
    for (const t of targets) {
      targetCountMap.set(t.projectId, (targetCountMap.get(t.projectId) || 0) + 1);
    }

    return projectRows
      .filter((p) => {
        if (!filter.classroomId) return true;
        const cls = classroomMap.get(p.id) || [];
        return cls.some((c) => c.id === filter.classroomId);
      })
      .map((p) => ({
        ...p,
        classrooms: classroomMap.get(p.id) || [],
        targetCount: targetCountMap.get(p.id) || 0,
      }));
  }

  async findProjectById(id: string): Promise<ProjectWithClassrooms | null> {
    const db = getDb();
    const [project] = await db
      .select()
      .from(p5raProjects)
      .where(eq(p5raProjects.id, id))
      .limit(1);

    if (!project) return null;

    const classroomLinks = await db
      .select({ classroom: classrooms })
      .from(p5raProjectClassrooms)
      .innerJoin(classrooms, eq(p5raProjectClassrooms.classroomId, classrooms.id))
      .where(eq(p5raProjectClassrooms.projectId, id));

    return {
      ...project,
      classrooms: classroomLinks.map((c) => c.classroom),
    };
  }

  async createProject(input: CreateP5raProjectInput): Promise<P5raProject> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(p5raProjects)
        .values({
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
          title: input.title,
          theme: input.theme,
          description: input.description,
          targetFase: input.targetFase,
          coordinatorTeacherId: input.coordinatorTeacherId ?? null,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
        })
        .returning();

      if (input.classroomIds && input.classroomIds.length > 0) {
        await tx.insert(p5raProjectClassrooms).values(
          input.classroomIds.map((cid) => ({
            projectId: inserted.id,
            classroomId: cid,
          })),
        );
      }

      return inserted;
    });
  }

  async updateProject(
    id: string,
    input: UpdateP5raProjectInput,
  ): Promise<P5raProject | null> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      const { classroomIds, ...projectData } = input;
      const [updated] = await tx
        .update(p5raProjects)
        .set({
          ...projectData,
          updatedAt: new Date(),
        })
        .where(eq(p5raProjects.id, id))
        .returning();

      if (!updated) return null;

      if (classroomIds !== undefined) {
        await tx
          .delete(p5raProjectClassrooms)
          .where(eq(p5raProjectClassrooms.projectId, id));

        if (classroomIds.length > 0) {
          await tx.insert(p5raProjectClassrooms).values(
            classroomIds.map((cid) => ({
              projectId: id,
              classroomId: cid,
            })),
          );
        }
      }

      return updated;
    });
  }

  async deleteProject(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(p5raProjects)
      .where(eq(p5raProjects.id, id))
      .returning();
    return rows.length > 0;
  }
}

export const projectsRepository = new ProjectsRepository();
