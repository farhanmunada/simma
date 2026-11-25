import React from "react";
import { Calendar, FileText, CheckCircle2, Award } from "lucide-react";

interface Props {
  tracks: Array<{ id: string; name: string }>;
}

const STEPS = [
  {
    step: 1,
    title: "Buat Akun Portal",
    desc: "Isi NIK, NISN, nama lengkap, kontak WhatsApp/email, dan buat kata sandi pendaftar.",
  },
  {
    step: 2,
    title: "Lengkapi Formulir",
    desc: "Masuk ke portal pendaftar untuk mengisi biodata diri, asal sekolah, dan data orang tua/wali.",
  },
  {
    step: 3,
    title: "Unggah Berkas",
    desc: "Unggah pas foto, KK, Akta Kelahiran, SKL/Rapor, serta sertifikat prestasi atau KIP jika ada.",
  },
  {
    step: 4,
    title: "Finalisasi & Cetak Kartu",
    desc: "Kunci data pendaftaran dan unduh Kartu Tanda Peserta PPDB resmi ber-QR Code.",
  },
];

const REQUIRED_DOCS = [
  "Pas Foto Formal Berwarna 3x4 (latar belakang merah/biru)",
  "Scan Kartu Keluarga (KK) & Akta Kelahiran Asli",
  "Surat Keterangan Lulus (SKL) / Ijazah MTs atau SMP",
  "Scan Buku Rapor semester 1 s.d. 5 terakhir",
  "Sertifikat Tahfidz Al-Qur'an / Piagam Prestasi (Jalur Prestasi)",
  "Kartu KIP / PKH / KKS (khusus Jalur Afirmasi)",
];

export const PpdbFlowAndRequirementsSection: React.FC<Props> = ({ tracks }) => {
  return (
    <section className="space-y-6" aria-labelledby="alur-pendaftaran-heading">
      {/* Jalur Seleksi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-slate-900">Jalur Seleksi Resmi PPDB</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5"
            >
              <span className="text-xs font-bold text-emerald-800 block">{track.name}</span>
              <span className="text-[11px] text-slate-600 mt-0.5 block">
                Seleksi transparan sesuai regulasi Kemenag RI &amp; EMIS 4.0.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Langkah Pendaftaran */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <h2 id="alur-pendaftaran-heading" className="text-base font-bold text-slate-900">
            Alur Pendaftaran Online (4 Langkah Mudah)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Persyaratan Dokumen */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-900">
            Kelengkapan Dokumen yang Perlu Disiapkan
          </h3>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
          {REQUIRED_DOCS.map((doc) => (
            <li key={doc} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
