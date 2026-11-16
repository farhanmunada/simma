import { eq, desc } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import { ppdbDocuments } from "../../db/schema/ppdb.js";
import type { PpdbDocument, NewPpdbDocument } from "./ppdb.types.js";

export class PpdbDocumentRepository {
  async createDocument(data: NewPpdbDocument): Promise<PpdbDocument> {
    const db = getDb();
    const [row] = await db.insert(ppdbDocuments).values(data).returning();
    return row;
  }

  async findDocumentsByApplicantId(applicantId: string): Promise<PpdbDocument[]> {
    const db = getDb();
    return db
      .select()
      .from(ppdbDocuments)
      .where(eq(ppdbDocuments.applicantId, applicantId))
      .orderBy(desc(ppdbDocuments.createdAt));
  }

  async findDocumentById(id: string): Promise<PpdbDocument | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbDocuments)
      .where(eq(ppdbDocuments.id, id))
      .limit(1);
    return row || null;
  }

  async updateDocumentVerification(
    id: string,
    status: string,
    notes?: string | null,
    verifiedBy?: string | null
  ): Promise<PpdbDocument | null> {
    const db = getDb();
    const [row] = await db
      .update(ppdbDocuments)
      .set({
        verificationStatus: status,
        verificationNotes: notes || null,
        verifiedBy: verifiedBy || null,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ppdbDocuments.id, id))
      .returning();
    return row || null;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(ppdbDocuments).where(eq(ppdbDocuments.id, id));
    return (res.rowCount ?? 0) > 0;
  }
}
