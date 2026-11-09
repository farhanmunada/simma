import React from "react";
import type { SetupWizardData } from "../../types";

interface SemesterStepProps {
  data: SetupWizardData["semester"];
  onChange: (data: Partial<SetupWizardData["semester"]>) => void;
}

export const SemesterStep: React.FC<SemesterStepProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Semester Aktif
        </h3>
        <p className="text-xs text-slate-500">
          Pilih semester awal dan rentang tanggal berlakunya kalender akademik madrasah.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Jenis Semester *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ type: 1 })}
              className={`py-2 px-4 rounded-md border text-sm font-medium text-center transition-colors ${
                data.type === 1
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Semester Ganjil (1)
            </button>
            <button
              type="button"
              onClick={() => onChange({ type: 2 })}
              className={`py-2 px-4 rounded-md border text-sm font-medium text-center transition-colors ${
                data.type === 2
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Semester Genap (2)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tanggal Mulai Semester *
            </label>
            <input
              type="date"
              required
              value={data.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tanggal Selesai Semester *
            </label>
            <input
              type="date"
              required
              value={data.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};