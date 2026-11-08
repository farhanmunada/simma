import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { getDb, closeDb } from "../core/database/index.js";
import { users } from "./schema/users.js";

async function seed() {
  console.log("Seeding super_admin developer user...");

  const db = getDb();
  const username = "superadmin";
  const plainPassword = "admin123";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(users)
      .set({
        passwordHash,
        role: "super_admin",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.username, username));
    console.log(`Updated existing user '${username}'`);
  } else {
    await db.insert(users).values({
      username,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });
    console.log(`Created new super_admin user '${username}'`);
  }

  console.log("Seed complete:");
  console.log(`- Username: ${username}`);
  console.log(`- Password: ${plainPassword}`);
  console.log("- Role: super_admin");

  await closeDb();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await closeDb();
  process.exit(1);
});
