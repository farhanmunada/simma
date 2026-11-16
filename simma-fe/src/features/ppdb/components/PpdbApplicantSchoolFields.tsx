import React from "react";
import { School } from "lucide-react";
import type { PpdbSchoolType, PpdbMajor } from "../types";

interface PpdbApplicantSchoolFieldsProps {
  previousSchoolType: PpdbSchoolType;
  setPreviousSchoolType: (val: PpdbSchoolType) => void;
  previousSchoolName: string;
  setPreviousSchoolName: (val: string) => void;
  npsnOrigin: string;
  setNpsnOrigin: (val: string) => void;
  chosenMajor: PpdbMajor;
  setChosenMajor: (val: PpdbMajor) => void;
}

export const PpdbApplicantSchoolFields: React.FC<PpdbApplicantSchoolFieldsProps> = ({
  previousSchoolType,
  setPreviousSchoolType,
  previousSchoolName,
  setPreviousSchoolName,
  npsnOrigin,
  setNpsnOrigin,
  chosenMajor,
  setChosenMajor,
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-700/80 pb-3">
        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
          <School className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">2. Asal Sekolah & Data Madrasah</h3>
          <p className="text-[11px] text-slate-400">Pendidikan jenjang sebelumnya dan minat konsentrasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Jenis Sekolah Asal <span className="text-rose-400">*</span>
          </label>
          <select
            value={previousSchoolType}
            onChange={(e) => setPreviousSchoolType(e.target.value as PpdbSchoolType)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="MTs">Madrasah Tsanawiyah (MTs)</option>
            <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
            <option value="Pesantren">Pendidikan Pesantren</option>
            <option value="Lainnya">Lainnya / Kesetaraan</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Nama Madrasah / Sekolah Asal <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={previousSchoolName}
            onChange={(e) => setPreviousSchoolName(e.target.value)}
            placeholder="Contoh: MTsN 1 Malang"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">NPSN Sekolah Asal (opsional)</label>
          <input
            type="text"
            value={npsnOrigin}
            onChange={(e) => setNpsnOrigin(e.target.value)}
            placeholder="2058xxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Jenjang Madrasah</label>
          <input
            type="text"
            readOnly
            value="Madrasah Aliyah (Reguler / Tanpa Penjurusan)"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-emerald-400 font-medium focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
