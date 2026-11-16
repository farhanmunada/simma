import React from "react";

export interface IdentityFormData {
  nsm: string;
  npsn: string;
  name: string;
  status: "negeri" | "swasta" | "NEGERI" | "SWASTA";
  akreditasi: string;
  kurikulum: string;
}

interface Props {
  data: IdentityFormData;
  onChange: (field: keyof IdentityFormData, value: string) => void;
  disabled?: boolean;
}

export const InstitutionIdentityForm: React.FC<Props> = ({
  data,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Identitas Pokok Madrasah</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Identitas resmi madrasah terdaftar di Kemenag RI dan basis data EMIS 4.0.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nomor Statistik Madrasah (NSM) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={12}
            value={data.nsm}
            onChange={(e) => onChange("nsm", e.target.value.replace(/\D/g, ""))}
            placeholder="12 digit numerik (cth: 131132040001)"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
          <p className="text-[11px] text-slate-400 mt-1">Wajib 12 digit sesuai piagam izin Kemenag</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NPSN Kemdikbud/Kemenag <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={8}
            value={data.npsn}
            onChange={(e) => onChange("npsn", e.target.value.replace(/\D/g, ""))}
            placeholder="8 digit numerik (cth: 20277001)"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
          <p className="text-[11px] text-slate-400 mt-1">Wajib 8 digit data referensi Dapodik/EMIS</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Resmi Madrasah <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Contoh: MAS Al-Hikmah SIMMA"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status Lembaga</label>
          <select
            value={data.status.toLowerCase()}
            onChange={(e) => onChange("status", e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white disabled:bg-slate-50"
          >
            <option value="swasta">Swasta (Yayasan/Mandiri)</option>
            <option value="negeri">Negeri (MAN)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Akreditasi BAN-PDM</label>
          <select
            value={data.akreditasi}
            onChange={(e) => onChange("akreditasi", e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white disabled:bg-slate-50"
          >
            <option value="A">A (Unggul)</option>
            <option value="B">B (Baik)</option>
            <option value="C">C (Cukup)</option>
            <option value="Belum">Belum Terakreditasi</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Kurikulum Aktif</label>
          <input
            type="text"
            value={data.kurikulum}
            onChange={(e) => onChange("kurikulum", e.target.value)}
            placeholder="Contoh: Kurikulum Merdeka Kemenag (KMA 450/2024)"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
};
