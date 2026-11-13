import React from "react";

export interface LeadershipFormData {
  headmaster: string;
  headmasterNip: string;
  skPendirian: string;
  skIzinOperasional: string;
}

interface Props {
  data: LeadershipFormData;
  onChange: (field: keyof LeadershipFormData, value: string) => void;
  disabled?: boolean;
}

export const InstitutionLeadershipForm: React.FC<Props> = ({
  data,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Kepemimpinan & Legalitas Lembaga</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Data kepala madrasah dan dasar hukum operasional untuk tanda tangan rapor dan surat kedinasan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nama Kepala Madrasah (Beserta Gelar)
          </label>
          <input
            type="text"
            value={data.headmaster}
            onChange={(e) => onChange("headmaster", e.target.value)}
            placeholder="Contoh: Dr. H. Ahmad Dahlan, M.Pd.I"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            NIP / PegID Kepala Madrasah
          </label>
          <input
            type="text"
            value={data.headmasterNip}
            onChange={(e) => onChange("headmasterNip", e.target.value)}
            placeholder="18 digit NIP atau tanda '-' jika non-PNS"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nomor SK Pendirian
          </label>
          <input
            type="text"
            value={data.skPendirian}
            onChange={(e) => onChange("skPendirian", e.target.value)}
            placeholder="Nomor ketetapan pendirian madrasah"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nomor SK Izin Operasional
          </label>
          <input
            type="text"
            value={data.skIzinOperasional}
            onChange={(e) => onChange("skIzinOperasional", e.target.value)}
            placeholder="SK penetapan izin operasional Kemenag"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
};
