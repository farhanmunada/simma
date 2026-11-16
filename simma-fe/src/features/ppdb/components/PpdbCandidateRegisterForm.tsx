import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  UserPlus,
  KeyRound,
  GraduationCap,
  User,
  School,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type {
  PpdbSchoolType,
  PpdbMajor,
  PpdbTrack,
  PpdbApplicant,
  PpdbRegisterAccountInput,
} from "../types";
import { useRegisterAccount } from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";

interface PpdbCandidateRegisterFormProps {
  onSuccess: (applicant: PpdbApplicant) => void;
  onGoToLogin: () => void;
}

export const PpdbCandidateRegisterForm: React.FC<PpdbCandidateRegisterFormProps> = ({
  onSuccess,
  onGoToLogin,
}) => {
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [motherName, setMotherName] = useState("");

  const [track, setTrack] = useState<PpdbTrack>("reguler");
  const [previousSchoolType, setPreviousSchoolType] = useState<PpdbSchoolType>("MTs");
  const [previousSchoolName, setPreviousSchoolName] = useState("");
  const [chosenMajor, setChosenMajor] = useState<PpdbMajor>("MIPA");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useRegisterAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (nik.length !== 16) {
      setErrorMsg("NIK wajib tepat 16 digit angka kependudukan.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi pendaftar minimal 6 karakter.");
      return;
    }
    if (!motherName.trim()) {
      setErrorMsg("Nama ibu kandung wajib diisi (standar validasi EMIS).");
      return;
    }
    if (!previousSchoolName.trim()) {
      setErrorMsg("Nama sekolah/madrasah asal wajib diisi.");
      return;
    }

    const payload: PpdbRegisterAccountInput = {
      fullName: fullName.trim(),
      nik: nik.trim(),
      nisn: nisn.trim() || null,
      birthPlace: birthPlace.trim() || "Kota Asal",
      birthDate: birthDate || "2008-01-01",
      gender,
      motherName: motherName.trim(),
      previousSchoolType,
      previousSchoolName: previousSchoolName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      track,
      chosenMajor,
    };

    try {
      const res = await registerMutation.mutateAsync(payload);

      // Otomatis login ke store dengan role calon_siswa
      useAuthStore.getState().setAuth(
        {
          id: res.applicant.id,
          email: res.applicant.email || email.trim(),
          fullName: res.applicant.fullName,
          role: "calon_siswa",
        },
        res.token
      );

      onSuccess(res.applicant);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mendaftarkan akun. Periksa kembali NIK atau Email yang digunakan."
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Form */}
      <div className="px-6 py-6 bg-gradient-to-r from-emerald-50/70 via-white to-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Formulir Pendaftaran Siswa Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Isi kelengkapan identitas calon santri untuk memperoleh nomor registrasi dan akses portal
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span>T.A. 2025/2026</span>
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-8">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Pendaftaran belum dapat diproses</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bagian 1: Jalur Pendaftaran */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Pilihan Jalur Seleksi PPDB</span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-medium text-xs mb-1.5">
                Jalur Seleksi Pendaftaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as PpdbTrack)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              >
                <option value="reguler">Jalur Reguler (Tes CBT Potensi Akademik & Rapor)</option>
                <option value="prestasi">Jalur Prestasi (Tahfidz Al-Qur'an / Kejuaraan Sains)</option>
                <option value="afirmasi">Jalur Afirmasi (Keluarga Prasejahtera / KIP / PKH)</option>
                <option value="perpindahan_ortu">Jalur Perpindahan Tugas Orang Tua / GTK Kemenag</option>
              </select>
            </div>
          </div>

          {/* Bagian 2: Biodata Calon Siswa */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <User className="w-4 h-4 text-emerald-600" />
              <span>2. Biodata & Identitas Kependudukan Calon Siswa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Nama Lengkap Calon Siswa (Sesuai Akta Kelahiran/Ijazah) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan Al-Fatih"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  NIK Calon Siswa (16 Digit Sesuai KK) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  placeholder="3515xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  NISN (10 Digit Angka, opsional)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                  placeholder="008xxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Kota / Kabupaten Lahir"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "L" | "P")}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Nama Ibu Kandung (Wajib EMIS Kemenag) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Sesuai dokumen Kartu Keluarga"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Asal Sekolah / Madrasah */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <School className="w-4 h-4 text-emerald-600" />
              <span>3. Asal Madrasah / Sekolah Sebelumnya</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Jenis Lembaga Pendidikan Asal <span className="text-rose-500">*</span>
                </label>
                <select
                  value={previousSchoolType}
                  onChange={(e) => setPreviousSchoolType(e.target.value as PpdbSchoolType)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                >
                  <option value="MTs">Madrasah Tsanawiyah (MTs)</option>
                  <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
                  <option value="Pesantren">Pendidikan Diniyah / Pesantren</option>
                  <option value="Lainnya">Paket B / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Nama Madrasah / Sekolah Asal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={previousSchoolName}
                  onChange={(e) => setPreviousSchoolName(e.target.value)}
                  placeholder="Contoh: MTsN 1 Kota Semarang"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bagian 4: Akun & Akses Masuk */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>4. Kontak & Kata Sandi Akun Portal Mandiri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Alamat Email Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@pribadi.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1.5">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm pr-9"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Submit & Aksi */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-xs sm:text-sm text-slate-600 hover:text-emerald-700 transition"
            >
              Sudah memiliki akun pendaftaran?{" "}
              <span className="font-bold text-emerald-700 underline">Masuk di sini</span>
            </button>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5"
            >
              <span>{registerMutation.isPending ? "Menyimpan Data..." : "Daftarkan Diri & Dapatkan Akun"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
