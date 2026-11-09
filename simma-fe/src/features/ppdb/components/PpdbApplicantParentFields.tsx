import React from "react";
import { Users } from "lucide-react";

interface PpdbApplicantParentFieldsProps {
  motherName: string;
  setMotherName: (val: string) => void;
  motherPhone: string;
  setMotherPhone: (val: string) => void;
  fatherName: string;
  setFatherName: (val: string) => void;
  fatherPhone: string;
  setFatherPhone: (val: string) => void;
}

export const PpdbApplicantParentFields: React.FC<PpdbApplicantParentFieldsProps> = ({
  motherName,
  setMotherName,
  motherPhone,
  setMotherPhone,
  fatherName,
  setFatherName,
  fatherPhone,
  setFatherPhone,
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-700/80 pb-3">
        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">3. Data Orang Tua / Wali</h3>
          <p className="text-[11px] text-slate-400">
            Nama Ibu Kandung wajib diisi sesuai standar validasi EMIS Kemenag RI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Nama Ibu Kandung <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            placeholder="Nama lengkap ibu kandung"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">No. HP / WA Ibu</label>
          <input
            type="tel"
            value={motherPhone}
            onChange={(e) => setMotherPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Nama Ayah</label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder="Nama lengkap ayah"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">No. HP / WA Ayah</label>
          <input
            type="tel"
            value={fatherPhone}
            onChange={(e) => setFatherPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
