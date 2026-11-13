import React from "react";
import { AlertTriangle, UserCheck } from "lucide-react";
import type { EarlyWarningAlert } from "../types";

interface EarlyWarningAlertBannerProps {
  warnings: EarlyWarningAlert[];
  onSelectStudent?: (studentId: string) => void;
}

export const EarlyWarningAlertBanner: React.FC<EarlyWarningAlertBannerProps> = ({
  warnings,
  onSelectStudent,
}) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-900">
              Peringatan Dini Kedisiplinan Ibadah ({warnings.length} Santri)
            </h3>
            <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Perlu Pembinaan
            </span>
          </div>
          <p className="mt-1 text-sm text-amber-800">
            Terdeteksi santri yang meninggalkan shalat fardhu berjama&apos;ah berturut-turut atau indeks istiqamah di bawah batas minimum:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {warnings.map((w) => (
              <button
                key={w.studentId}
                type="button"
                onClick={() => onSelectStudent?.(w.studentId)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 shadow-2xs hover:bg-amber-100/50 hover:border-amber-400 transition"
              >
                <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-semibold">{w.studentName}</span>
                {w.className && <span className="text-amber-600">({w.className})</span>}
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">
                  {w.missedFardhuCount}x Lalai
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
