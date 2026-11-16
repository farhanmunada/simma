import {
  ESCALATION_THRESHOLDS,
  type SanctionLevel,
} from "@simma/shared";
import type {
  StudentInfractionRecord,
  EscalationStatusResult,
} from "./discipline.types.js";

/**
 * Kalkulasi skor poin netral santri dari riwayat pelanggaran dan apresiasi.
 * Hanya catatan dengan status "approved" yang dihitung.
 */
export function calculateDisciplineBalance(
  infractions: Pick<StudentInfractionRecord, "points" | "type" | "status">[],
): {
  infractionPoints: number;
  rewardPoints: number;
  netPoints: number;
  totalInfractions: number;
  totalRewards: number;
} {
  let infractionPoints = 0;
  let rewardPoints = 0;
  let totalInfractions = 0;
  let totalRewards = 0;

  for (const item of infractions) {
    if (item.status !== "approved") continue;

    if (item.type === "infraction") {
      infractionPoints += item.points;
      totalInfractions += 1;
    } else if (item.type === "reward") {
      rewardPoints += item.points;
      totalRewards += 1;
    }
  }

  // Poin netral pelanggaran tidak boleh negatif
  const netPoints = Math.max(0, infractionPoints - rewardPoints);

  return {
    infractionPoints,
    rewardPoints,
    netPoints,
    totalInfractions,
    totalRewards,
  };
}

/**
 * Menentukan level sanksi berdasarkan ambang batas poin regulasi Kemenag.
 */
export function determineSanctionLevel(netPoints: number): SanctionLevel {
  if (netPoints >= ESCALATION_THRESHOLDS.SP_3) {
    return "sp_3";
  }
  if (netPoints >= ESCALATION_THRESHOLDS.SP_2) {
    return "sp_2";
  }
  if (netPoints >= ESCALATION_THRESHOLDS.SP_1) {
    return "sp_1";
  }
  if (netPoints >= ESCALATION_THRESHOLDS.TEGURAN_LISAN) {
    return "teguran_lisan";
  }
  return "normal";
}

/**
 * Menghasilkan status eskalasi lengkap dan rekomendasi tindakan.
 */
export function evaluateEscalation(
  studentId: string,
  infractions: Pick<StudentInfractionRecord, "points" | "type" | "status">[],
): EscalationStatusResult {
  const { netPoints } = calculateDisciplineBalance(infractions);
  const sanctionLevel = determineSanctionLevel(netPoints);

  let recommendedAction = "Disiplin santri terpantau baik dalam batas wajar.";
  let requiresSummon = false;

  switch (sanctionLevel) {
    case "sp_3":
      recommendedAction =
        "Pemberlakuan SP-3 aktif. Rekomendasi sidang dewan guru dan proses pengembalian santri ke orang tua/wali.";
      requiresSummon = true;
      break;
    case "sp_2":
      recommendedAction =
        "Pemberlakuan SP-2 aktif. Pemanggilan orang tua kedua dan pemberian skorsing sementara pembinaan.";
      requiresSummon = true;
      break;
    case "sp_1":
      recommendedAction =
        "Pemberlakuan SP-1 aktif. Pemanggilan orang tua/wali ke madrasah untuk penandatanganan pakta disiplin.";
      requiresSummon = true;
      break;
    case "teguran_lisan":
      recommendedAction =
        "Teguran lisan resmi tercatat dan bimbingan konseling bersama wali kelas/Guru BK.";
      requiresSummon = false;
      break;
    default:
      requiresSummon = false;
  }

  return {
    studentId,
    netPoints,
    sanctionLevel,
    requiresSummon,
    recommendedAction,
    exceededFiftyPoints: netPoints >= ESCALATION_THRESHOLDS.SP_1,
  };
}

/**
 * Format nomor resmi surat panggilan naskah dinas Kemenag.
 */
export function formatSummonLetterNumber(
  sequence: number,
  level: SanctionLevel,
  year = new Date().getFullYear(),
): string {
  const padSeq = String(sequence).padStart(3, "0");
  const spCode =
    level === "sp_3" ? "SP-3" : level === "sp_2" ? "SP-2" : "SP-1";
  return `${padSeq}/MA.SIMMA/BK.${spCode}/${year}`;
}
