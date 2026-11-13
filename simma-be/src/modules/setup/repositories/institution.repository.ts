import { eq } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { institutions } from "../../../db/schema/setup";
import type { Institution, NewInstitution } from "../setup.types.js";

export class InstitutionRepository {
  async findFirstInstitution(): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db.select().from(institutions).limit(1);
    return row ?? null;
  }

  async findInstitutionById(id: string): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(institutions)
      .where(eq(institutions.id, id))
      .limit(1);
    return row ?? null;
  }

  async createInstitution(data: NewInstitution): Promise<Institution> {
    const db = getDb();
    const [row] = await db.insert(institutions).values(data).returning();
    return row;
  }

  async updateInstitution(
    id: string,
    data: Partial<NewInstitution>,
  ): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db
      .update(institutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return row ?? null;
  }
}

export const institutionRepository = new InstitutionRepository();
