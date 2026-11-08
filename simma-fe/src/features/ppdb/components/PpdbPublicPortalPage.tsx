import React, { useState } from "react";
import { Link } from "react-router";
import {
  GraduationCap,
  FileCheck,
  Search,
  User,
  School,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  usePpdbPublicInfo,
  useRegisterApplicant,
  useCheckPpdbStatus,
} from "../api/ppdb.api";
import type {
  RegisterApplicantInput,
  PpdbSchoolType,
  PpdbMajor,
  PpdbApplicant,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "neutral" | "info" | "success" | "danger" | "warning"; icon: any; desc: string }
> = {
  submitted: {
    label: "Menunggu Verifikasi",
    variant: "info",
    icon: Clock,
    desc: "Berkas formulir online telah diterima oleh sistem dan sedang dalam antrean verifikasi panitia.",
  },
  verified: {
    label: "Terverifikasi (Lolos Berkas)",
    variant: "neutral",
    icon: FileCheck,
    desc: "Berkas pendaftaran telah diverifikasi valid. Silakan ikuti tes seleksi/wawancara sesuai jadwal.",
  },
  accepted: {
    label: "Selamat! Anda Diterima",
    variant: "success",
    icon: CheckCircle2,
    desc: "Selamat! Calon siswa dinyatakan DITERIMA di Madrasah Aliyah. Silakan segera daftar ulang ke loket TU.",
  },
  rejected: {
    label: "Belum Memenuhi Syarat",
    variant: "danger",
    icon: XCircle,
    desc: "Mohon maaf, pendaftaran belum memenuhi kualifikasi kuota atau syarat berkas madrasah tahun ini.",
  },
  enrolled: {
    label: "Resmi Terdaftar di Buku Induk",
    variant: "success",
    icon: Sparkles,
    desc: "Selamat! Calon siswa telah terdaftar resmi di Buku Induk Siswa Madrasah Aliyah.",
  },
};

export const PpdbPublicPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"register" | "status">("register");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [previousSchoolType, setPreviousSchoolType] = useState<PpdbSchoolType>("MTs");
  const [previousSchoolName, setPreviousSchoolName] = useState("");
  const [npsnOrigin, setNpsnOrigin] = useState("");

  const [chosenMajor, setChosenMajor] = useState<PpdbMajor>("MIPA");

  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");

  const [registeredResult, setRegisteredResult] = useState<PpdbApplicant | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Status Check State
  const [checkRegNumber, setCheckRegNumber] = useState("");
  const [checkNikOrNisn, setCheckNikOrNisn] = useState("");
  const [statusResult, setStatusResult] = useState<PpdbApplicant | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const { data: publicInfo } = usePpdbPublicInfo();
  const registerMutation = useRegisterApplicant();
  const checkStatusMutation = useCheckPpdbStatus();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (nik.length !== 16) {
      setRegisterError("NIK wajib terdiri dari tepat 16 digit angka kependudukan.");
      return;
    }
    if (!motherName.trim()) {
      setRegisterError("Nama Ibu Kandung wajib diisi sesuai standar pendataan EMIS Kemenag.");
      return;
    }
    if (!previousSchoolName.trim()) {
      setRegisterError("Nama madrasah/sekolah asal wajib diisi.");
      return;
    }

    const payload: RegisterApplicantInput = {
      fullName: fullName.trim(),
      nik: nik.trim(),
      nisn: nisn.trim() || undefined,
      birthPlace: birthPlace.trim(),
      birthDate,
      gender,
      religion: "Islam",
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      previousSchoolType,
      previousSchoolName: previousSchoolName.trim(),
      npsnOrigin: npsnOrigin.trim() || undefined,
      fatherName: fatherName.trim() || undefined,
      fatherPhone: fatherPhone.trim() || undefined,
      motherName: motherName.trim(),
      motherPhone: motherPhone.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      chosenMajor,
      documents: {},
    };

    try {
      const res = await registerMutation.mutateAsync(payload);
      setRegisteredResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirim formulir pendaftaran. Periksa kembali kelengkapan data.";
      setRegisterError(msg);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);
    setStatusResult(null);

    if (!checkRegNumber.trim() || !checkNikOrNisn.trim()) {
      setStatusError("Mohon masukkan Nomor Pendaftaran dan NIK/NISN calon siswa.");
      return;
    }

    try {
      const res = await checkStatusMutation.mutateAsync({
        registrationNumber: checkRegNumber.trim(),
        nikOrNisn: checkNikOrNisn.trim(),
      });
      setStatusResult(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Data pendaftar tidak ditemukan. Pastikan Nomor Pendaftaran dan NIK/NISN telah benar.";
      setStatusError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/40">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-base tracking-tight">PPDB Online</span>
              <span className="text-xs text-emerald-400 block -mt-0.5 font-medium">
                Madrasah Aliyah — SIMMA
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              Login Staf / Guru
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800/80 to-slate-900 py-10 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Penerimaan Peserta Didik Baru Tahun Ajaran {publicInfo?.academicYear?.name || "2025/2026"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Portal Pendaftaran Mandiri Calon Santri & Siswa Baru
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Layanan resmi pendaftaran santri baru Madrasah Aliyah berbasis Kurikulum Merdeka Kemenag.
            Cepat, transparan, dan terintegrasi standar EMIS.
          </p>

          {/* Navigation Tabs */}
          <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700 mt-4">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-2 ${
                activeTab === "register"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Formulir Pendaftaran</span>
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-2 ${
                activeTab === "status"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status & Pengumuman</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab === "register" ? (
          registeredResult ? (
            /* Success Registration Proof Card */
            <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="text-center space-y-2 border-b border-slate-700/80 pb-6">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Pendaftaran Berhasil Dikirim!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Simpan Nomor Pendaftaran berikut untuk cek status seleksi dan verifikasi berkas fisik di madrasah.
                </p>
                <div className="inline-block px-5 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-400 font-mono text-xl sm:text-2xl font-bold tracking-wider mt-2">
                  {registeredResult.registrationNumber}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Nama Lengkap</span>
                  <span className="font-semibold text-slate-100 text-sm">{registeredResult.fullName}</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <span className="text-slate-500 text-[11px] block">NIK / NISN</span>
                  <span className="font-semibold text-slate-100 text-sm">
                    {registeredResult.nik} {registeredResult.nisn ? `(${registeredResult.nisn})` : ""}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Peminatan / Jurusan</span>
                  <span className="font-semibold text-emerald-400 text-sm">{registeredResult.chosenMajor}</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Asal Sekolah</span>
                  <span className="font-semibold text-slate-100 text-sm">
                    {registeredResult.previousSchoolType} — {registeredResult.previousSchoolName}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700/60 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-200">Langkah Selanjutnya:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Datang ke Panitia PPDB Madrasah Aliyah membawa cetak bukti pendaftaran dan fotokopi KK/Akta.</li>
                  <li>Mengikuti observasi baca Al-Qur'an dan wawancara peminatan.</li>
                  <li>Pantau hasil pengumuman secara berkala di tab "Cek Status & Pengumuman".</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Tanda Bukti</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredResult(null);
                    setFullName("");
                    setNik("");
                    setNisn("");
                    setActiveTab("status");
                  }}
                  className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Lanjut Cek Status</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {registerError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}

              {/* 1. Biodata Calon Siswa */}
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

              {/* 2. Asal Sekolah & Pilihan Jurusan */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-slate-700/80 pb-3">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">2. Asal Sekolah & Pilihan Jurusan</h3>
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
                    <label className="block text-slate-300 font-medium mb-1">
                      Pilihan Peminatan Kurikulum Merdeka <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={chosenMajor}
                      onChange={(e) => setChosenMajor(e.target.value as PpdbMajor)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-emerald-400 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="MIPA">Matematika & IPA (MIPA)</option>
                      <option value="IPS">Ilmu Pengetahuan Sosial (IPS)</option>
                      <option value="Keagamaan">Ilmu-ilmu Keagamaan (IIK)</option>
                      <option value="Bahasa">Bahasa & Budaya</option>
                      <option value="Vokasi">Keterampilan / Vokasi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Data Orang Tua / Wali */}
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
                >
                  {registerMutation.isPending ? (
                    <span>Sedang Menyimpan Data...</span>
                  ) : (
                    <>
                      <span>Kirim Formulir Pendaftaran PPDB</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        ) : (
          /* Tab Status & Pengumuman */
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Cek Pengumuman Hasil Seleksi</h3>
                <p className="text-xs text-slate-400">
                  Masukkan Nomor Pendaftaran (misal: REG-2025-00001) dan NIK atau NISN calon siswa
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Nomor Pendaftaran (REG-...)"
                    value={checkRegNumber}
                    onChange={(e) => setCheckRegNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NIK atau NISN"
                    value={checkNikOrNisn}
                    onChange={(e) => setCheckNikOrNisn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={checkStatusMutation.isPending}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-md text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Cari Status</span>
                  </button>
                </div>
              </form>

              {statusError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusError}</span>
                </div>
              )}
            </div>

            {statusResult && (
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 space-y-5 shadow-xl">
                {(() => {
                  const conf = STATUS_CONFIG[statusResult.status] || STATUS_CONFIG.submitted;
                  const Icon = conf.icon;
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Nomor Pendaftaran</span>
                          <span className="font-mono font-bold text-lg text-emerald-400">
                            {statusResult.registrationNumber}
                          </span>
                        </div>
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold">
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span className="text-white">{conf.label}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-700/60">
                        <p className="text-xs text-slate-300 leading-relaxed">{conf.desc}</p>
                        {statusResult.notes && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-amber-300">
                            <strong>Catatan Panitia:</strong> {statusResult.notes}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[11px] block">Nama Calon Siswa</span>
                          <span className="font-semibold text-white">{statusResult.fullName}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[11px] block">Peminatan Jurusan</span>
                          <span className="font-semibold text-emerald-400">{statusResult.chosenMajor}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[11px] block">Asal Madrasah/Sekolah</span>
                          <span className="font-semibold text-white">
                            {statusResult.previousSchoolType} — {statusResult.previousSchoolName}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[11px] block">Tanggal Pendaftaran</span>
                          <span className="font-semibold text-white">
                            {new Date(statusResult.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 SIMMA — Sistem Informasi Madrasah Aliyah. PPDB Modul Kurikulum Merdeka.</p>
      </footer>
    </div>
  );
};
