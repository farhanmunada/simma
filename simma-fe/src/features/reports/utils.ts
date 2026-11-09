export { exportLeggerToCsv, generateLeggerCsvContent } from "../../lib/csv-exporter";

/**
 * Standard RDM letter grade calculation
 */
export function calculateLetterGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

/**
 * Letter grade badge CSS styles
 * A: emerald, B: sky, C: amber, D: rose
 */
export function getLetterGradeBadgeClass(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold";
    case "B":
      return "bg-sky-50 text-sky-700 border border-sky-200 font-semibold";
    case "C":
      return "bg-amber-50 text-amber-700 border border-amber-200 font-semibold";
    case "D":
      return "bg-rose-50 text-rose-700 border border-rose-200 font-semibold";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200 font-medium";
  }
}

/**
 * Formats semester type number to label
 */
export function formatSemesterType(type: number | string): string {
  const num = Number(type);
  if (num === 1) return "Ganjil (1)";
  if (num === 2) return "Genap (2)";
  return `Semester ${type}`;
}
