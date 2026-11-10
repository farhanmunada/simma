import type {
  NewMutabaahActivity,
  MutabaahActivity,
  MutabaahDailyEntry,
  MutabaahUzurRecord,
  StudentDailyChecklistRow,
  StudentChecklistEntry,
  StudentComplianceSummary,
} from "./mutabaah.types.js";

export const DEFAULT_ACTIVITIES: Omit<NewMutabaahActivity, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Shalat Subuh Berjama'ah", category: "fardhu", weight: 3, isMandatory: true, orderIndex: 1, targetCount: 1, unit: "waktu", genderSpecific: "all", isActive: true },
  { name: "Shalat Dzuhur Berjama'ah", category: "fardhu", weight: 3, isMandatory: true, orderIndex: 2, targetCount: 1, unit: "waktu", genderSpecific: "all", isActive: true },
  { name: "Shalat Ashar Berjama'ah", category: "fardhu", weight: 3, isMandatory: true, orderIndex: 3, targetCount: 1, unit: "waktu", genderSpecific: "all", isActive: true },
  { name: "Shalat Maghrib Berjama'ah", category: "fardhu", weight: 3, isMandatory: true, orderIndex: 4, targetCount: 1, unit: "waktu", genderSpecific: "all", isActive: true },
  { name: "Shalat Isya Berjama'ah", category: "fardhu", weight: 3, isMandatory: true, orderIndex: 5, targetCount: 1, unit: "waktu", genderSpecific: "all", isActive: true },
  { name: "Qiyamul Lail / Tahajud", category: "sunnah", weight: 2, isMandatory: false, orderIndex: 6, targetCount: 1, unit: "kali", genderSpecific: "all", isActive: true },
  { name: "Shalat Dhuha", category: "sunnah", weight: 2, isMandatory: false, orderIndex: 7, targetCount: 1, unit: "kali", genderSpecific: "all", isActive: true },
  { name: "Tilawah Al-Qur'an", category: "quran", weight: 2, isMandatory: false, orderIndex: 8, targetCount: 1, unit: "juz", genderSpecific: "all", isActive: true },
  { name: "Dzikir Pagi & Petang", category: "dzikir", weight: 1, isMandatory: false, orderIndex: 9, targetCount: 2, unit: "kali", genderSpecific: "all", isActive: true },
  { name: "Puasa Sunnah", category: "sunnah", weight: 1, isMandatory: false, orderIndex: 10, targetCount: 1, unit: "hari", genderSpecific: "all", isActive: true },
  { name: "Kajian Kitab Kuning", category: "kajian", weight: 2, isMandatory: false, orderIndex: 11, targetCount: 1, unit: "sesi", genderSpecific: "all", isActive: true },
];

export interface StudentScoreMetrics {
  totalMandatory: number;
  completed: number;
  masbuk: number;
  uzur: number;
  missed: number;
  earnedScore: number;
  maxScore: number;
  missedFardhu: number;
}

export function computeStudentEntriesMetrics(
  entries: MutabaahDailyEntry[],
  fardhuActivityIds: Set<string>,
): StudentScoreMetrics {
  let totalMandatory = 0;
  let completed = 0;
  let masbuk = 0;
  let uzur = 0;
  let missed = 0;
  let earnedScore = 0;
  let maxScore = 0;
  let missedFardhu = 0;

  for (const e of entries) {
    totalMandatory++;
    if (e.status === "terlaksana") {
      completed++;
      earnedScore += 100;
      maxScore += 100;
    } else if (e.status === "masbuk") {
      masbuk++;
      earnedScore += 70;
      maxScore += 100;
    } else if (e.status === "uzur") {
      uzur++;
    } else if (e.status === "tidak_terlaksana") {
      missed++;
      maxScore += 100;
      if (fardhuActivityIds.has(e.activityId)) {
        missedFardhu++;
      }
    }
  }

  return {
    totalMandatory,
    completed,
    masbuk,
    uzur,
    missed,
    earnedScore,
    maxScore,
    missedFardhu,
  };
}

export function calculateComplianceScore(earned: number, max: number): number {
  if (max === 0) return 100;
  return Math.round((earned / max) * 100);
}

export function determineComplianceStatus(
  score: number,
): "istiqamah" | "perhatian" | "konseling" {
  if (score >= 80) return "istiqamah";
  if (score >= 60) return "perhatian";
  return "konseling";
}

export function buildStudentComplianceSummaries(
  studentIds: string[],
  studentRows: any[],
  studentEntriesMap: Map<string, MutabaahDailyEntry[]>,
  fardhuIds: Set<string>,
): StudentComplianceSummary[] {
  return studentIds.map((stId) => {
    const st = studentRows.find((s) => s.id === stId)!;
    const stEntries = studentEntriesMap.get(stId) ?? [];
    const metrics = computeStudentEntriesMetrics(stEntries, fardhuIds);
    const complianceScore = calculateComplianceScore(metrics.earnedScore, metrics.maxScore);
    const status = determineComplianceStatus(complianceScore);

    return {
      studentId: stId,
      studentName: st.fullName,
      nisn: st.nisn,
      gender: st.gender,
      className: st.className,
      totalMandatoryActivities: metrics.totalMandatory,
      completedActivities: metrics.completed,
      masbukActivities: metrics.masbuk,
      uzurActivities: metrics.uzur,
      missedActivities: metrics.missed,
      complianceScore,
      status,
      consecutiveMissedFardhu: metrics.missedFardhu,
      hasEarlyWarning: metrics.missedFardhu > 2,
    };
  });
}

export function buildStudentChecklistRows(params: {
  studentRows: any[];
  activities: MutabaahActivity[];
  entryMap: Map<string, MutabaahDailyEntry>;
  uzurMap: Map<string, MutabaahUzurRecord>;
}): StudentDailyChecklistRow[] {
  const { studentRows, activities, entryMap, uzurMap } = params;

  return studentRows.map((s) => {
    const activeUzur = uzurMap.get(s.id);
    const isUzur = Boolean(activeUzur && s.gender === "P");

    const studentEntries: StudentChecklistEntry[] = activities.map((act) => {
      const existing = entryMap.get(`${s.id}_${act.id}`);
      if (existing) {
        return {
          activityId: act.id,
          activityName: act.name,
          category: act.category,
          weight: act.weight,
          status: existing.status,
          score: existing.score,
          volume: existing.volume,
          notes: existing.notes,
        };
      }
      const defaultStatus = isUzur && act.category === "fardhu" ? "uzur" : "terlaksana";
      return {
        activityId: act.id,
        activityName: act.name,
        category: act.category,
        weight: act.weight,
        status: defaultStatus,
        score: 100,
        volume: 1,
        notes: null,
      };
    });

    return {
      studentId: s.id,
      studentName: s.fullName,
      nisn: s.nisn,
      gender: s.gender,
      classroomId: s.classroomId,
      className: s.className,
      isUzur,
      uzurNotes: activeUzur?.notes ?? null,
      entries: studentEntries,
    };
  });
}

export function buildMonthlyReportActivityStats(
  activities: MutabaahActivity[],
  entries: MutabaahDailyEntry[],
) {
  return activities.map((act) => {
    const actEntries = entries.filter((e) => e.activityId === act.id);
    const comp = actEntries.filter((e) => e.status === "terlaksana").length;
    const mas = actEntries.filter((e) => e.status === "masbuk").length;
    const uz = actEntries.filter((e) => e.status === "uzur").length;
    const mis = actEntries.filter((e) => e.status === "tidak_terlaksana").length;
    const valid = actEntries.length - uz;
    const percentage = valid <= 0 ? 100 : Math.round(((comp * 100 + mas * 70) / (valid * 100)) * 100);

    return {
      activityId: act.id,
      activityName: act.name,
      category: act.category,
      targetCount: actEntries.length,
      completedCount: comp,
      masbukCount: mas,
      uzurCount: uz,
      missedCount: mis,
      percentage,
    };
  });
}
