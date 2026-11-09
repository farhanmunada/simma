import React from "react";
import type { SetupWizardData } from "../../types";

interface AcademicYearStepProps {
  data: SetupWizardData["academicYear"];
  onChange: (data: Partial<SetupWizardData["academicYear"]>) => void;
}

export const AcademicYearStep: React.FC<AcademicYearStepProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Tahun Ajaran Perdana
        </h3>
        <p className="text-xs text-slate-500">
          Tentukan periode tahun ajaran aktif yang akan digunakan sebagai basis data akademik awal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Tahun Ajaran *
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Contoh: 2024/2025"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tanggal Mulai *
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
              Tanggal Selesai *
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