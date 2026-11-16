import React from "react";

export interface ContactFormData {
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
}

interface Props {
  data: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
  disabled?: boolean;
}

export const InstitutionContactForm: React.FC<Props> = ({
  data,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Alamat & Saluran Komunikasi</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Informasi geografis dan kontak resmi untuk kop naskah dinas, rapor RDM, dan verifikasi EMIS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Alamat Lengkap (Jalan, RT/RW, No. Gedung) <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={data.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Contoh: Jl. Pendidikan Islam No. 45, Kompleks Madrasah"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Desa / Kelurahan</label>
          <input
            type="text"
            value={data.village}
            onChange={(e) => onChange("village", e.target.value)}
            placeholder="Contoh: Cilandak Barat"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Kecamatan</label>
          <input
            type="text"
            value={data.district}
            onChange={(e) => onChange("district", e.target.value)}
            placeholder="Contoh: Cilandak"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Kabupaten / Kota</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Contoh: Kota Jakarta Selatan"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Provinsi</label>
          <input
            type="text"
            value={data.province}
            onChange={(e) => onChange("province", e.target.value)}
            placeholder="Contoh: DKI Jakarta"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Kode Pos</label>
          <input
            type="text"
            maxLength={5}
            value={data.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value.replace(/\D/g, ""))}
            placeholder="5 digit (cth: 12430)"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Telepon / TU</label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Contoh: (021) 7891234"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email Resmi</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Contoh: tu@madrasah.sch.id"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Website Lembaga</label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="Contoh: https://madrasah.sch.id"
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
};
