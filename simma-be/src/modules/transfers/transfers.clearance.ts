import { randomBytes } from "node:crypto";
import type {
  ClearanceDimension,
  ClearanceVerificationResult,
  TransferClearanceRow,
} from "./transfers.types.js";

export function evaluateClearanceStatus(
  clearance: Pick<
    TransferClearanceRow,
    "libraryCleared" | "financeCleared" | "disciplineCleared"
  >
): ClearanceVerificationResult {
  const pendingDimensions: ClearanceDimension[] = [];

  if (!clearance.libraryCleared) pendingDimensions.push("library");
  if (!clearance.financeCleared) pendingDimensions.push("finance");
  if (!clearance.disciplineCleared) pendingDimensions.push("discipline");

  const allCleared = pendingDimensions.length === 0;
  const clearedCount = 3 - pendingDimensions.length;
  let status: "pending" | "in_progress" | "cleared" = "pending";
  if (allCleared) {
    status = "cleared";
  } else if (clearedCount > 0) {
    status = "in_progress";
  }

  return {
    allCleared,
    libraryCleared: clearance.libraryCleared,
    financeCleared: clearance.financeCleared,
    disciplineCleared: clearance.disciplineCleared,
    status,
    clearedCount,
    pendingDimensions,
  };
}

export function generateTransferReference(type: "masuk" | "keluar"): string {
  const year = new Date().getFullYear();
  const prefix = type === "masuk" ? "MUT-IN" : "MUT-OUT";
  const randomSuffix = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}/${year}/${randomSuffix}`;
}

export function generateVerificationCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}
