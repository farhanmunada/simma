import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router";
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  UserCheck,
  Trash2,
  Eye,
  Filter,
  ExternalLink,
  Sparkles,
  School,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  usePpdbApplicants,
  usePpdbStats,
  useUpdateApplicantStatus,
  useEnrollApplicant,
  useDeleteApplicant,
} from "../api/ppdb.api";
import type { PpdbApplicant, PpdbStatus, PpdbMajor } from "../types";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

const STATUS_BADGE_MAP: Record<
  PpdbStatus,
  { label: string; variant: "neutral" | "info" | "success" | "danger" | "warning" }
> = {
  draft: { label: "Draf", variant: "neutral" },
  submitted: { label: "Menunggu", variant: "info" },
  verified: { label: "Terverifikasi", variant: "neutral" },
  accepted: { label: "Diterima", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
  enrolled: { label: "Buku Induk", variant: "success" },
};

export const PpdbDashboardPage: React.FC = () => {
  // Query state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Selected for Detail / Verification Modal
  const [activeApplicant, setActiveApplicant] = useState<PpdbApplicant | null>(null);
  const [newStatus, setNewStatus] = useState<PpdbStatus>("submitted");
  const [notes, setNotes] = useState("");
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  // Enrollment & Delete Targets
  const [enrollTarget, setEnrollTarget] = useState<PpdbApplicant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PpdbApplicant | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    return {
      search: searchTerm.trim() || undefined,
      status: selectedStatus || undefined,
      major: selectedMajor || undefined,
      page,
      limit,
    };
  }, [searchTerm, selectedStatus, selectedMajor, page]);

  const { data: statsData } = usePpdbStats();
  const { data: applicantsResponse, isLoading, isError, refetch } = usePpdbApplicants(queryParams);

  const updateStatusMutation = useUpdateApplicantStatus();
  const enrollMutation = useEnrollApplicant();
  const deleteMutation = useDeleteApplicant();

  const handleOpenDetailModal = (app: PpdbApplicant) => {
    setActiveApplicant(app);
    setNewStatus(app.status);
    setNotes(app.notes || "");
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplicant) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: activeApplicant.id,
        data: {
          status: newStatus,
          notes: notes.trim() || undefined,
        },
      });
      setActiveApplicant(null);
      setActionSuccessMsg(`Status pendaftar ${activeApplicant.fullName} berhasil diperbarui.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal memperbarui status.");
    }
  };

  const handleConfirmEnroll = async () => {
    if (!enrollTarget) return;
    try {
      await enrollMutation.mutateAsync(enrollTarget.id);
      setEnrollTarget(null);
      setActionSuccessMsg(
        `Calon siswa ${enrollTarget.fullName} resmi dipindahkan ke Buku Induk Siswa (status: Aktif Tanpa Rombel)!`
      );
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal mendaftarkan siswa ke buku induk.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setActionSuccessMsg("Data pendaftar berhasil dihapus.");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal menghapus pendaftar.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              PPDB & Verifikasi Pendaftar
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Pintu Masuk Siswa Baru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi berkas calon siswa, penetapan seleksi, dan pendaftaran resmi ke Buku Induk Siswa.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/ppdb"
            target="_blank"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span>Buka Portal Publik Siswa</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
          <Link
            to="/students"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Lihat Buku Induk Siswa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pendaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-1">{statsData?.total || 0}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Menunggu</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-sky-600 mt-1">{statsData?.submitted || 0}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Terverifikasi</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{statsData?.verified || 0}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Diterima</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">{statsData?.accepted || 0}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Buku Induk</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{statsData?.enrolled || 0}</p>
        </div>
      </div>

      {/* Table & Filter Card */}
      <Card className="p-4 space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, NISN, atau No. Registrasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Status Seleksi</option>
              <option value="submitted">Menunggu Verifikasi</option>
              <option value="verified">Terverifikasi (Lolos Berkas)</option>
              <option value="accepted">Diterima</option>
              <option value="rejected">Ditolak</option>
              <option value="enrolled">Terdaftar di Buku Induk</option>
            </select>
          </div>

          <div>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Peminatan</option>
              <option value="MIPA">MIPA</option>
              <option value="IPS">IPS</option>
              <option value="Keagamaan">Keagamaan</option>
              <option value="Bahasa">Bahasa</option>
              <option value="Vokasi">Vokasi</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">No. Registrasi</th>
                <th className="py-2.5 px-3 font-semibold">Nama Lengkap & NIK</th>
                <th className="py-2.5 px-3 font-semibold">Asal Sekolah</th>
                <th className="py-2.5 px-3 font-semibold">Jurusan</th>
                <th className="py-2.5 px-3 font-semibold">Status Seleksi</th>
                <th className="py-2.5 px-3 font-semibold">Tgl Daftar</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Memuat data pendaftar PPDB...
                  </td>
                </tr>
              ) : !applicantsResponse?.data || applicantsResponse.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada pendaftar yang sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                applicantsResponse.data.map((app) => {
                  const badgeConf = STATUS_BADGE_MAP[app.status] || STATUS_BADGE_MAP.submitted;
                  const canEnroll =
                    (app.status === "accepted" || app.status === "verified") && !app.studentId;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-700">
                        {app.registrationNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{app.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIK: {app.nik} {app.nisn ? `| NISN: ${app.nisn}` : ""}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{app.previousSchoolName}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Tipe: {app.previousSchoolType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {app.chosenMajor}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={badgeConf.variant}>{badgeConf.label}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* Detail & Status Modal */}
                          <button
                            title="Detail & Verifikasi Berkas"
                            onClick={() => handleOpenDetailModal(app)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Enroll ke Buku Induk */}
                          {canEnroll && (
                            <button
                              title="Daftarkan ke Buku Induk Siswa"
                              onClick={() => setEnrollTarget(app)}
                              className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center space-x-1 shadow-sm transition-colors"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Ke Buku Induk</span>
                            </button>
                          )}

                          {/* Delete button (hanya jika belum terdaftar di buku induk) */}
                          {app.status !== "enrolled" && (
                            <button
                              title="Hapus Pendaftar"
                              onClick={() => setDeleteTarget(app)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. Modal Detail & Verifikasi */}
      <Modal
        isOpen={Boolean(activeApplicant)}
        onClose={() => setActiveApplicant(null)}
        title="Verifikasi & Penetapan Seleksi PPDB"
        initialFocus={statusSelectRef as unknown as React.MutableRefObject<HTMLElement | null>}
        maxWidth="lg"
      >
        {activeApplicant && (
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Nomor Pendaftaran</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {activeApplicant.registrationNumber}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Pilihan Peminatan</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {activeApplicant.chosenMajor}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Nama Calon Siswa</span>
                <span className="font-semibold text-slate-800">{activeApplicant.fullName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">NIK / NISN</span>
                <span className="font-mono text-slate-700">
                  {activeApplicant.nik} {activeApplicant.nisn ? `(${activeApplicant.nisn})` : ""}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">TTL & Kelamin</span>
                <span className="text-slate-700">
                  {activeApplicant.birthPlace}, {activeApplicant.birthDate} (
                  {activeApplicant.gender === "L" ? "Laki-laki" : "Perempuan"})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Asal Sekolah</span>
                <span className="text-slate-700">
                  {activeApplicant.previousSchoolType} — {activeApplicant.previousSchoolName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Nama Ibu Kandung (EMIS)</span>
                <span className="font-medium text-slate-800">{activeApplicant.motherName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Kontak / HP</span>
                <span className="text-slate-700">
                  {activeApplicant.phone || activeApplicant.motherPhone || "-"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Verifikasi / Seleksi
                </label>
                <select
                  ref={statusSelectRef}
                  value={newStatus}
                  disabled={activeApplicant.status === "enrolled"}
                  onChange={(e) => setNewStatus(e.target.value as PpdbStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="submitted">Menunggu Verifikasi (Submitted)</option>
                  <option value="verified">Terverifikasi / Lolos Berkas (Verified)</option>
                  <option value="accepted">Diterima di Madrasah (Accepted)</option>
                  <option value="rejected">Ditolak / Belum Lolos (Rejected)</option>
                  {activeApplicant.status === "enrolled" && (
                    <option value="enrolled" disabled>
                      Sudah Masuk Buku Induk (Enrolled)
                    </option>
                  )}
                </select>
                {activeApplicant.status === "enrolled" && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Calon siswa sudah resmi tercatat di Buku Induk Siswa (status tidak dapat diubah).
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Panitia (Alasan / Informasi Seleksi)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Berkas fisik KK/Akta lengkap. Lolos wawancara dan tes tahfidz."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`/api/v1/ppdb/applicants/${activeApplicant.id}/card/pdf`, "_blank");
                }}
              >
                Cetak Kartu PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveApplicant(null)}
              >
                Tutup
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={updateStatusMutation.isPending || activeApplicant.status === "enrolled"}
              >
                {updateStatusMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2. Confirm Dialog: Enroll to Buku Induk */}
      <ConfirmDialog
        isOpen={Boolean(enrollTarget)}
        onClose={() => setEnrollTarget(null)}
        onConfirm={handleConfirmEnroll}
        title="Daftarkan ke Buku Induk Siswa?"
        message={`Anda akan memindahkan calon siswa ${enrollTarget?.fullName} (NIK: ${enrollTarget?.nik}) secara resmi ke tabel data pokok Siswa (Buku Induk) dengan status awal 'Aktif Tanpa Rombel'. Profil orang tua akan otomatis dibuat di tabel parents.`}
        confirmText="Ya, Daftarkan ke Buku Induk"
        cancelText="Batal"
        variant="warning"
        isLoading={enrollMutation.isPending}
      />

      {/* 3. Confirm Dialog: Delete Applicant */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Pendaftar PPDB?"
        message={`Data pendaftaran ${deleteTarget?.fullName} (${deleteTarget?.registrationNumber}) akan dihapus secara permanen.`}
        confirmText="Hapus Pendaftar"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
