import { eq } from "drizzle-orm";
import { getDb } from "../../core/database/index.js";
import { users } from "../../db/schema/users.js";
import type { UserRecord } from "./auth.types.js";

export const authRepository = {
  async findByUsername(username: string): Promise<UserRecord | null> {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user ?? null;
  },

  async findById(id: string): Promise<UserRecord | null> {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  },

  async updateLastLogin(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },
};
