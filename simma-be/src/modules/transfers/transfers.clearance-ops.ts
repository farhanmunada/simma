import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { studentTransfers, transferClearances } from "../../db/schema/transfers.js";
import { students, classStudents } from "../../db/schema/students.js";
import type { ClearanceDimension } from "./transfers.schema.js";
import { evaluateClearanceStatus } from "./transfers.clearance.js";

export class TransfersClearanceOps {
  constructor(private readonly db: PostgresJsDatabase) {}

  async updateClearance(
    transferId: string,
    dimension: ClearanceDimension,
    cleared: boolean,
    userId: string,
    notes?: string | null
  ) {
    return await this.db.transaction(async (tx) => {
      const [clearance] = await tx
        .select()
        .from(transferClearances)
        .where(eq(transferClearances.transferId, transferId))
        .limit(1);

      if (!clearance) throw new Error("Data clearance tidak ditemukan");

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (dimension === "library") {
        updateData.libraryCleared = cleared;
        updateData.libraryClearedById = userId;
        updateData.libraryClearedAt = new Date();
        if (notes !== undefined) updateData.libraryNotes = notes;
      } else if (dimension === "finance") {
        updateData.financeCleared = cleared;
        updateData.financeClearedById = userId;
        updateData.financeClearedAt = new Date();
        if (notes !== undefined) updateData.financeNotes = notes;
      } else if (dimension === "discipline") {
        updateData.disciplineCleared = cleared;
        updateData.disciplineClearedById = userId;
        updateData.disciplineClearedAt = new Date();
        if (notes !== undefined) updateData.disciplineNotes = notes;
      }

      const merged = {
        libraryCleared: dimension === "library" ? cleared : clearance.libraryCleared,
        financeCleared: dimension === "finance" ? cleared : clearance.financeCleared,
        disciplineCleared: dimension === "discipline" ? cleared : clearance.disciplineCleared,
      };
      const evalResult = evaluateClearanceStatus(merged);
      updateData.status = evalResult.status;

      const [updatedClearance] = await tx
        .update(transferClearances)
        .set(updateData)
        .where(eq(transferClearances.id, clearance.id))
        .returning();

      if (evalResult.allCleared) {
        await tx
          .update(studentTransfers)
          .set({ status: "pending_approval", updatedAt: new Date() })
          .where(eq(studentTransfers.id, transferId));
      }

      return updatedClearance;
    });
  }

  async finalizeTransferApproval(
    transferId: string,
    approved: boolean,
    approverId: string,
    notes?: string | null,
    verificationCode?: string
  ) {
    return await this.db.transaction(async (tx) => {
      const [transfer] = await tx
        .select()
        .from(studentTransfers)
        .where(eq(studentTransfers.id, transferId))
        .limit(1);

      if (!transfer) throw new Error("Mutasi tidak ditemukan");

      if (approved) {
        await tx
          .update(students)
          .set({ status: "mutasi_keluar", updatedAt: new Date() })
          .where(eq(students.id, transfer.studentId));

        await tx.delete(classStudents).where(eq(classStudents.studentId, transfer.studentId));

        const [updatedTransfer] = await tx
          .update(studentTransfers)
          .set({
            status: "completed",
            approvedById: approverId,
            approvedAt: new Date(),
            approvalNotes: notes,
            verificationCode,
            updatedAt: new Date(),
          })
          .where(eq(studentTransfers.id, transferId))
          .returning();

        return updatedTransfer;
      } else {
        const [updatedTransfer] = await tx
          .update(studentTransfers)
          .set({
            status: "rejected",
            approvedById: approverId,
            approvedAt: new Date(),
            approvalNotes: notes,
            updatedAt: new Date(),
          })
          .where(eq(studentTransfers.id, transferId))
          .returning();

        return updatedTransfer;
      }
    });
  }
}
