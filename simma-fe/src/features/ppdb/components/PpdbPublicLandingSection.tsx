import React from "react";
import {
  Sparkles,
  UserPlus,
  LogIn,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight,
} from "lucide-react";

interface PpdbLandingProps {
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onGoToCheckStatus: () => void;
}

export const PpdbPublicLandingSection: React.FC<PpdbLandingProps> = ({
  onGoToRegister,
  onGoToLogin,
  onGoToCheckStatus,
}) => {
  return (
    <div className="space-y-12">
      {/* Hero Box */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white p-6 sm:p-10 shadow-sm text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Penerimaan Peserta Didik Baru (PPDB) T.A. 2025/2026</span>
        </div>

        <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Selamat Datang di Portal Resmi Seleksi Siswa Baru Madrasah Aliyah
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Penerimaan siswa madrasah aliyah terpadu dan transparan. Daftarkan diri secara mandiri,
          unggah kelengkapan dokumen persyaratan, pantau hasil seleksi, dan cetak kartu tanda peserta.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGoToRegister}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow hover:bg-emerald-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun Siswa Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onGoToLogin}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white border border-emerald-600 text-emerald-700 font-semibold text-sm shadow-sm hover:bg-emerald-50 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Portal Pendaftar</span>
          </button>

          <button
            type="button"
            onClick={onGoToCheckStatus}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Cek Status / Kelulusan</span>
          </button>
        </div>
      </div>

      {/* 3 Pillars / Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Kurikulum Holistik</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pendidikan madrasah aliyah integratif menyatukan sains, teknologi, dan pendalaman ilmu
            agama Islam tanpa sekat pemisahan jurusan.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Seleksi Transparan</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verifikasi berkas digital, penilaian tes kompetensi, dan pemeringkatan pendaftar secara
            terpadu dengan sistem EMIS 4.0 Kemenag RI.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Jalur Prestasi & Reguler</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tersedia kuota khusus bagi santri tahfidz Al-Qur'an, juara kejuaraan akademik/non-akademik,
            serta afirmasi KIP/PKH dan jalur tes reguler.
          </p>
        </div>
      </div>

      {/* Alur Pendaftaran */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">Alur & Langkah Pendaftaran</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                1
              </span>
              <span>Buat Akun</span>
            </div>
            <p className="text-xs text-slate-600">
              Isi data dasar (NISN, NIK, nama lengkap, kontak) dan buat kata sandi portal mandiri.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>Lengkapi Data</span>
            </div>
            <p className="text-xs text-slate-600">
              Masuk portal pendaftar untuk melengkapi biodata kesiswaan dan identitas orang tua/wali.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                3
              </span>
              <span>Unggah Berkas</span>
            </div>
            <p className="text-xs text-slate-600">
              Unggah pas foto, KK, Akta Kelahiran, Rapor/SKL, dan sertifikat prestasi yang dimiliki.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                4
              </span>
              <span>Cetak Kartu</span>
            </div>
            <p className="text-xs text-slate-600">
              Lakukan finalisasi formulir dan unduh Kartu Peserta Ujian PPDB resmi bertanda QR panitia.
            </p>
          </div>
        </div>
      </div>

      {/* Persyaratan Dokumen */}
      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Kelengkapan Dokumen yang Perlu Disiapkan</h3>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pas Foto Formal Berwarna (latar belakang merah/biru)</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Scan Kartu Keluarga (KK) & Akta Kelahiran Asli</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Surat Keterangan Lulus (SKL) / Ijazah MTs/SMP</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Scan Buku Rapor semester ganjil/genap terakhir</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sertifikat Tahfidz Al-Qur'an / Piagam Juara (jika ada)</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kartu KIP/PKH bagi pendaftar jalur afirmasi</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
