import { eq, asc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import {
  p5raProjectTargets,
  type P5raProjectTarget,
  type NewP5raProjectTarget,
} from "../../../db/schema/index.js";

export class TargetsRepository {
  async listProjectTargets(projectId: string): Promise<P5raProjectTarget[]> {
    const db = getDb();
    return await db
      .select()
      .from(p5raProjectTargets)
      .where(eq(p5raProjectTargets.projectId, projectId))
      .orderBy(asc(p5raProjectTargets.orderIndex), asc(p5raProjectTargets.createdAt));
  }

  async findTargetById(targetId: string): Promise<P5raProjectTarget | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(p5raProjectTargets)
      .where(eq(p5raProjectTargets.id, targetId))
      .limit(1);
    return row ?? null;
  }

  async createTarget(
    projectId: string,
    data: NewP5raProjectTarget,
  ): Promise<P5raProjectTarget> {
    const db = getDb();
    const [row] = await db
      .insert(p5raProjectTargets)
      .values({ ...data, projectId })
      .returning();
    return row;
  }

  async updateTarget(
    id: string,
    data: Partial<NewP5raProjectTarget>,
  ): Promise<P5raProjectTarget | null> {
    const db = getDb();
    const [row] = await db
      .update(p5raProjectTargets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(p5raProjectTargets.id, id))
      .returning();
    return row ?? null;
  }

  async deleteTarget(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(p5raProjectTargets)
      .where(eq(p5raProjectTargets.id, id))
      .returning();
    return rows.length > 0;
  }
}

export const targetsRepository = new TargetsRepository();
