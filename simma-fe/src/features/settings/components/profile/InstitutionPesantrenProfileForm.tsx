import React from "react";
import { Sparkles, Phone, Globe } from "lucide-react";

export interface PesantrenProfileFormData {
  foundedYear: string;
  pengasuh: string;
  about: string;
  vision: string;
  missionsText: string;
  whatsappKonsultasi: string;
  whatsappPutra: string;
  whatsappPutri: string;
  whatsappBendahara: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

interface Props {
  data: PesantrenProfileFormData;
  onChange: (field: keyof PesantrenProfileFormData, value: string) => void;
  disabled?: boolean;
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50";

export const InstitutionPesantrenProfileForm: React.FC<Props> = ({
  data,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Profil Pesantren, Visi-Misi & Layanan PPDB Publik
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Data ini ditampilkan otomatis pada Portal PPDB Publik dan informasi resmi madrasah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Tahun Berdiri
          </label>
          <input
            type="text"
            maxLength={4}
            value={data.foundedYear}
            onChange={(e) => onChange("foundedYear", e.target.value.replace(/\D/g, ""))}
            placeholder="Contoh: 1998"
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Pengasuh Pondok Pesantren
          </label>
          <input
            type="text"
            value={data.pengasuh}
            onChange={(e) => onChange("pengasuh", e.target.value)}
            placeholder="Contoh: K. Nur Yasin"
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Sekilas Tentang Madrasah & Pesantren
          </label>
          <textarea
            rows={2}
            value={data.about}
            onChange={(e) => onChange("about", e.target.value)}
            placeholder="Ringkasan sejarah dan asas pendidikan madrasah..."
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Visi Madrasah</label>
          <textarea
            rows={2}
            value={data.vision}
            onChange={(e) => onChange("vision", e.target.value)}
            placeholder="Visi resmi madrasah..."
            disabled={disabled}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Misi Madrasah (1 poin per baris)
          </label>
          <textarea
            rows={4}
            value={data.missionsText}
            onChange={(e) => onChange("missionsText", e.target.value)}
            placeholder="Tulis setiap poin misi di baris baru..."
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          Kontak WhatsApp Layanan & PPDB (format 628xxx)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              WA Konsultasi
            </label>
            <input
              type="text"
              value={data.whatsappKonsultasi}
              onChange={(e) => onChange("whatsappKonsultasi", e.target.value.replace(/\D/g, ""))}
              placeholder="6285602015153"
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              WA Pengurus Putra
            </label>
            <input
              type="text"
              value={data.whatsappPutra}
              onChange={(e) => onChange("whatsappPutra", e.target.value.replace(/\D/g, ""))}
              placeholder="6285799218349"
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              WA Pengurus Putri
            </label>
            <input
              type="text"
              value={data.whatsappPutri}
              onChange={(e) => onChange("whatsappPutri", e.target.value.replace(/\D/g, ""))}
              placeholder="6282329477596"
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              WA Bendahara
            </label>
            <input
              type="text"
              value={data.whatsappBendahara}
              onChange={(e) => onChange("whatsappBendahara", e.target.value.replace(/\D/g, ""))}
              placeholder="6281578964250"
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Media Sosial Resmi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Facebook</label>
            <input
              type="text"
              value={data.facebook}
              onChange={(e) => onChange("facebook", e.target.value)}
              placeholder="pipp.hikmah"
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Instagram</label>
            <input
              type="text"
              value={data.instagram}
              onChange={(e) => onChange("instagram", e.target.value)}
              placeholder="pipp.manbaulhikmah"
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">YouTube</label>
            <input
              type="text"
              value={data.youtube}
              onChange={(e) => onChange("youtube", e.target.value)}
              placeholder="Pipp Manba'ul Hikmah"
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
