import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Printer, LogOut, Lock, Edit3 } from "lucide-react";
import type { PpdbApplicant } from "../types";
import {
  useUpdateMyApplication,
  useFinalizeMyApplication,
} from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";
import { PpdbDocumentUploadSection } from "./PpdbDocumentUploadSection";
import { API_BASE_URL } from "../../../config/endpoints";

interface PpdbCandidateDashboardProps {
  applicant: PpdbApplicant;
  onRefresh: () => void;
  onLogout: () => void;
}

export const PpdbCandidateDashboard: React.FC<PpdbCandidateDashboardProps> = ({
  applicant,
  onRefresh,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: applicant.fullName || "",
    birthPlace: applicant.birthPlace || "",
    birthDate: applicant.birthDate || "",
    gender: applicant.gender || "L",
    religion: applicant.religion || "Islam",
    phone: applicant.phone || "",
    address: applicant.address || "",
    previousSchoolName: applicant.previousSchoolName || "",
    npsnOrigin: applicant.npsnOrigin || "",
    fatherName: applicant.fatherName || "",
    fatherPhone: applicant.fatherPhone || "",
    fatherJob: applicant.fatherJob || "",
    motherName: applicant.motherName || "",
    motherPhone: applicant.motherPhone || "",
    motherJob: applicant.motherJob || "",
    tahfidzJuzCount: applicant.tahfidzJuzCount || 0,
    achievementNotes: applicant.achievementNotes || "",
  });

  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const updateMutation = useUpdateMyApplication();
  const finalizeMutation = useFinalizeMyApplication();

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        ...formData,
        tahfidzJuzCount: Number(formData.tahfidzJuzCount) || undefined,
      });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal memperbarui formulir.");
    }
  };

  const handleFinalize = async () => {
    setFinalizeError(null);
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin memfinalisasi data pendaftaran? Setelah difinalisasi, seluruh data dan berkas akan DIKUNCI permanen dan tidak dapat diubah kembali."
    );
    if (!confirmed) return;

    try {
      await finalizeMutation.mutateAsync();
      onRefresh();
    } catch (err: any) {
      setFinalizeError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memfinalisasi pendaftaran. Pastikan seluruh berkas wajib telah diunggah."
      );
    }
  };

  const handleSignOut = () => {
    useAuthStore.getState().logout();
    onLogout();
  };

  const cardPdfUrl = `${API_BASE_URL}/ppdb/portal/me/card/pdf`;

  return (
    <div className="space-y-6">
      {/* Top Banner / Account Header */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              {applicant.registrationNumber}
            </span>
            <span className="text-xs text-slate-400">&bull; Jalur {applicant.track.toUpperCase()}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            {applicant.fullName}
          </h2>
          <p className="text-xs text-slate-400">
            NIK: {applicant.nik} {applicant.nisn ? `| NISN: ${applicant.nisn}` : ""} | Jurusan: {applicant.chosenMajor}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {applicant.isFinalized && (
            <a
              href={cardPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu Ujian/PPDB</span>
            </a>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Progress & Status Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1">
          <span className="text-[11px] text-slate-400 block">Status Pengisian Data</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Biodata Lengkap</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1">
          <span className="text-[11px] text-slate-400 block">Status Berkas Persyaratan</span>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
            <span>{applicant.documentsList?.length || 0} Berkas Terunggah</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-1">
          <span className="text-[11px] text-slate-400 block">Status Akun Pendaftaran</span>
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            {applicant.isFinalized ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Data Terkunci (Final)</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Masih Draft (Belum Final)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {finalizeError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{finalizeError}</span>
        </div>
      )}

      {/* Upload Dokumen Section */}
      <PpdbDocumentUploadSection
        applicant={applicant}
        onRefresh={onRefresh}
      />

      {/* Formulir Biodata & Sekolah */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Kelengkapan Formulir Pendaftar</h3>
            <p className="text-[11px] text-slate-400">Data identitas, asal sekolah, dan orang tua</p>
          </div>
          {!applicant.isFinalized && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Batal Edit" : "Ubah Data Formulir"}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">No. HP / WA Calon Siswa</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nama Ibu Kandung</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nama Ayah Kandung</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/40 rounded border border-slate-700/50">
              <span className="text-[10px] text-slate-500 block">TTL & Jenis Kelamin</span>
              <span className="text-slate-200 font-medium">
                {applicant.birthPlace}, {applicant.birthDate} ({applicant.gender === "L" ? "Laki-laki" : "Perempuan"})
              </span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded border border-slate-700/50">
              <span className="text-[10px] text-slate-500 block">Sekolah Asal</span>
              <span className="text-slate-200 font-medium">
                {applicant.previousSchoolType} — {applicant.previousSchoolName}
              </span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded border border-slate-700/50">
              <span className="text-[10px] text-slate-500 block">Data Orang Tua</span>
              <span className="text-slate-200 font-medium">
                Ibu: {applicant.motherName} {applicant.fatherName ? `| Ayah: ${applicant.fatherName}` : ""}
              </span>
            </div>
            <div className="p-3 bg-slate-900/40 rounded border border-slate-700/50">
              <span className="text-[10px] text-slate-500 block">Nomor Kontak / WhatsApp</span>
              <span className="text-slate-200 font-medium">
                {applicant.phone || applicant.motherPhone || "-"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Finalisasi Data Action */}
      {!applicant.isFinalized ? (
        <div className="p-5 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-xl space-y-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-white text-sm">Finalisasi & Kunci Data Pendaftaran</h4>
              <p className="text-slate-300">
                Sebelum mengunci data, pastikan formulir identitas telah terisi benar dan seluruh berkas
                scan wajib (Pas Foto & KK) telah diunggah. Setelah difinalisasi, Anda dapat mencetak
                Kartu Peserta PPDB resmi untuk jadwal tes/verifikasi berkas di madrasah.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleFinalize}
              disabled={finalizeMutation.isPending}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-md text-xs font-bold shadow-lg transition-colors flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{finalizeMutation.isPending ? "Memfinalisasi..." : "Finalisasi & Kunci Pendaftaran"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Pendaftaran Anda Telah Terkunci (Final)</h4>
              <p className="text-xs text-slate-300">
                Nomor pendaftaran resmi Anda: <span className="font-mono text-emerald-400 font-bold">{applicant.registrationNumber}</span>.
                Silakan unduh kartu ujian untuk dibawa saat seleksi.
              </p>
            </div>
          </div>
          <a
            href={cardPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold flex items-center justify-center space-x-2 transition-colors shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Unduh Kartu Ujian (PDF)</span>
          </a>
        </div>
      )}
    </div>
  );
};
