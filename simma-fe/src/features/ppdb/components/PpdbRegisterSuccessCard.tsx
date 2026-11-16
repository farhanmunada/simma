import React from "react";
import { CheckCircle2, Printer, ChevronRight } from "lucide-react";
import type { PpdbApplicant } from "../types";
import { API_ENDPOINTS } from "../../../config/endpoints";

interface PpdbRegisterSuccessCardProps {
  applicant: PpdbApplicant;
  onGoToStatus: () => void;
}

export const PpdbRegisterSuccessCard: React.FC<PpdbRegisterSuccessCardProps> = ({
  applicant,
  onGoToStatus,
}) => {
  return (
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
          {applicant.registrationNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
          <span className="text-slate-500 text-[11px] block">Nama Lengkap</span>
          <span className="font-semibold text-slate-100 text-sm">{applicant.fullName}</span>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
          <span className="text-slate-500 text-[11px] block">NIK / NISN</span>
          <span className="font-semibold text-slate-100 text-sm">
            {applicant.nik} {applicant.nisn ? `(${applicant.nisn})` : ""}
          </span>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
          <span className="text-slate-500 text-[11px] block">Jalur Seleksi</span>
          <span className="font-semibold text-emerald-400 text-sm capitalize">{applicant.track}</span>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
          <span className="text-slate-500 text-[11px] block">Asal Sekolah</span>
          <span className="font-semibold text-slate-100 text-sm">
            {applicant.previousSchoolType} — {applicant.previousSchoolName}
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              window.open(
                `/api/v1${API_ENDPOINTS.PPDB.APPLICANT_CARD_PDF(applicant.id)}`,
                "_blank"
              );
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Unduh Kartu PDF</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Print Layar</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onGoToStatus}
          className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <span>Lanjut Cek Status</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
