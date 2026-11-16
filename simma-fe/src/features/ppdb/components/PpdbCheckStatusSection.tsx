import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Sparkles,
  AlertCircle,
  Printer,
} from "lucide-react";
import type { PpdbApplicant } from "../types";
import { useCheckPpdbStatus } from "../api/ppdb.api";
import { API_ENDPOINTS } from "../../../config/endpoints";

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

export const PpdbCheckStatusSection: React.FC = () => {
  const [checkRegNumber, setCheckRegNumber] = useState("");
  const [checkNikOrNisn, setCheckNikOrNisn] = useState("");
  const [statusResult, setStatusResult] = useState<PpdbApplicant | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const checkStatusMutation = useCheckPpdbStatus();

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
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">Cek Pengumuman Hasil Seleksi</h3>
          <p className="text-xs text-slate-500">
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
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-xs font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              required
              placeholder="NIK atau NISN"
              value={checkNikOrNisn}
              onChange={(e) => setCheckNikOrNisn(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-xs font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={checkStatusMutation.isPending}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-md text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Status</span>
            </button>
          </div>
        </form>

        {statusError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusError}</span>
          </div>
        )}
      </div>

      {statusResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
          {(() => {
            const conf = STATUS_CONFIG[statusResult.status] || STATUS_CONFIG.submitted;
            const Icon = conf.icon;
            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nomor Pendaftaran</span>
                    <span className="font-mono font-bold text-lg text-emerald-700">
                      {statusResult.registrationNumber}
                    </span>
                  </div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold">
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-900">{conf.label}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-700 leading-relaxed">{conf.desc}</p>
                  {statusResult.notes && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-amber-700">
                      <strong>Catatan Panitia:</strong> {statusResult.notes}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Nama Calon Siswa</span>
                    <span className="font-semibold text-slate-900">{statusResult.fullName}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Jalur Seleksi</span>
                    <span className="font-semibold text-emerald-700 capitalize">{statusResult.track}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Asal Madrasah/Sekolah</span>
                    <span className="font-semibold text-slate-900">
                      {statusResult.previousSchoolType} — {statusResult.previousSchoolName}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Tanggal Pendaftaran</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(statusResult.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        `/api/v1${API_ENDPOINTS.PPDB.APPLICANT_CARD_PDF(statusResult.id)}`,
                        "_blank"
                      );
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Unduh Kartu Tanda Peserta (PDF Resmi)</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
