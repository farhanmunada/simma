import React from "react";
import type { SetupWizardData } from "../../types";

interface AdminUserStepProps {
  data: SetupWizardData["adminUser"];
  onChange: (data: Partial<SetupWizardData["adminUser"]>) => void;
}

export const AdminUserStep: React.FC<AdminUserStepProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Penanggung Jawab Sistem (Administrator)
        </h3>
        <p className="text-xs text-slate-500">
          Tentukan identitas pengelola utama SIMMA pada madrasah ini.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Lengkap Administrator *
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Contoh: Muhammad Farhan"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email Resmi Administrator *
          </label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="admin@madrasah.sch.id"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Peran / Jabatan
          </label>
          <input
            type="text"
            value={data.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="Operator SIM / Staf Tata Usaha"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};