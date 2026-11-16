import React from "react";
import { User } from "lucide-react";

interface PpdbApplicantBiodataFieldsProps {
  fullName: string;
  setFullName: (val: string) => void;
  nik: string;
  setNik: (val: string) => void;
  nisn: string;
  setNisn: (val: string) => void;
  birthPlace: string;
  setBirthPlace: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  gender: "L" | "P";
  setGender: (val: "L" | "P") => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export const PpdbApplicantBiodataFields: React.FC<PpdbApplicantBiodataFieldsProps> = ({
  fullName,
  setFullName,
  nik,
  setNik,
  nisn,
  setNisn,
  birthPlace,
  setBirthPlace,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  phone,
  setPhone,
  address,
  setAddress,
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-700/80 pb-3">
        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">1. Data Diri Calon Siswa</h3>
          <p className="text-[11px] text-slate-400">Wajib sesuai Kartu Keluarga (KK) dan Akta Kelahiran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="sm:col-span-2">
          <label className="block text-slate-300 font-medium mb-1">
            Nama Lengkap Calon Siswa <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Muhammad Farhan Al-Fatih"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={16}
            value={nik}
            onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
            placeholder="3515xxxxxxxxxxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">NISN (10 Digit, opsional)</label>
          <input
            type="text"
            maxLength={10}
            value={nisn}
            onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
            placeholder="008xxxxxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Tempat Lahir <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Kota/Kabupaten Lahir"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Tanggal Lahir <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Jenis Kelamin <span className="text-rose-400">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "L" | "P")}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">No. WhatsApp / HP Calon Siswa</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-300 font-medium mb-1">Alamat Domisili Lengkap</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nama jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
