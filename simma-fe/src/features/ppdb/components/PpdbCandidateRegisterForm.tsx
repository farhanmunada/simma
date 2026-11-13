import React, { useState } from "react";
import { AlertCircle, ArrowRight, UserPlus, KeyRound } from "lucide-react";
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
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-7 space-y-6">
      <div className="border-b border-slate-700/80 pb-3 flex items-center space-x-2.5">
        <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Formulir Pendaftaran Akun Calon Siswa Baru
          </h3>
          <p className="text-[11px] text-slate-400">
            Daftarkan akun resmi untuk mengisi formulir, mengunggah berkas, dan memantau seleksi
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Jalur Pendaftaran */}
        <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-700/60">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Jalur Pendaftaran PPDB <span className="text-rose-400">*</span>
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as PpdbTrack)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="reguler">Jalur Reguler (Tes CBT & Rapor)</option>
              <option value="prestasi">Jalur Prestasi / Tahfidz Al-Qur'an</option>
              <option value="afirmasi">Jalur Afirmasi (KIP / PKH / DTKS)</option>
              <option value="perpindahan_ortu">Jalur Perpindahan Tugas Orang Tua / GTK</option>
            </select>
          </div>
        </div>

        {/* Data Diri Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-medium mb-1">
              Nama Lengkap Calon Siswa (Sesuai Akta/Ijazah) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Muhammad Farhan Al-Fatih"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              NIK (16 Digit Angka) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              placeholder="3515xxxxxxxxxxxx"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              placeholder="Kota kelahiran"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "L" | "P")}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Nama Ibu Kandung (Wajib EMIS) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="Sesuai dokumen KK/Akta"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Data Asal Sekolah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Jenis Sekolah Asal</label>
            <select
              value={previousSchoolType}
              onChange={(e) => setPreviousSchoolType(e.target.value as PpdbSchoolType)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Akun & Kontak */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Email Aktif <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@pribadi.com"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              No. WhatsApp / HP <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Buat Kata Sandi Akun <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-8"
              />
              <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-xs text-slate-400 hover:text-white"
          >
            Sudah pernah mendaftar? <span className="text-emerald-400 underline">Masuk Akun</span>
          </button>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-md text-xs shadow-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>{registerMutation.isPending ? "Mendaftarkan..." : "Daftar & Lanjut Unggah Berkas"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
