import React from "react";
import type { SetupWizardData } from "../../types";

interface SchoolIdentityStepProps {
  data: SetupWizardData["institution"];
  onChange: (data: Partial<SetupWizardData["institution"]>) => void;
}

export const SchoolIdentityStep: React.FC<SchoolIdentityStepProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Identitas Madrasah
        </h3>
        <p className="text-xs text-slate-500">
          Lengkapi data pokok madrasah sesuai nomor statistik dan izin operasional Kemenag.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nomor Statistik Madrasah (NSM) *
          </label>
          <input
            type="text"
            required
            maxLength={12}
            value={data.nsm}
            onChange={(e) => onChange({ nsm: e.target.value })}
            placeholder="Contoh: 131132010001"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NPSN *
          </label>
          <input
            type="text"
            required
            maxLength={8}
            value={data.npsn}
            onChange={(e) => onChange({ npsn: e.target.value })}
            placeholder="Contoh: 20123456"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Resmi Madrasah *
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Contoh: MAS Al-Falah Jakarta"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status Lembaga
          </label>
          <select
            value={data.status}
            onChange={(e) =>
              onChange({ status: e.target.value as "NEGERI" | "SWASTA" })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="SWASTA">Swasta</option>
            <option value="NEGERI">Negeri</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status Akreditasi
          </label>
          <select
            value={data.accreditation}
            onChange={(e) =>
              onChange({
                accreditation: e.target.value as "A" | "B" | "C" | "BELUM",
              })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="A">A (Unggul)</option>
            <option value="B">B (Baik)</option>
            <option value="C">C (Cukup)</option>
            <option value="BELUM">Belum Terakreditasi</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Alamat Lengkap
          </label>
          <textarea
            rows={2}
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Jl. Raya No. 123..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Kepala Madrasah *
          </label>
          <input
            type="text"
            required
            value={data.headmasterName}
            onChange={(e) => onChange({ headmasterName: e.target.value })}
            placeholder="Drs. H. Ahmad Fauzi, M.Pd"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NIP Kepala Madrasah (Opsional)
          </label>
          <input
            type="text"
            value={data.headmasterNip || ""}
            onChange={(e) => onChange({ headmasterNip: e.target.value })}
            placeholder="197501012000031001"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};