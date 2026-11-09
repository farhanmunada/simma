import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Search,
  CheckCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  usePpdbApplicants,
  usePpdbStats,
  useUpdateApplicantStatus,
  useEnrollApplicant,
  useDeleteApplicant,
} from "../api/ppdb.api";
import type { PpdbApplicant, PpdbStatus } from "../types";
import { Card } from "../../../components/ui/Card";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { PpdbStatsCards } from "./PpdbStatsCards";
import { PpdbApplicantTable } from "./PpdbApplicantTable";
import { PpdbDetailModal } from "./PpdbDetailModal";

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
  const { data: applicantsResponse, isLoading } = usePpdbApplicants(queryParams);

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
      <PpdbStatsCards stats={statsData} />

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
        <PpdbApplicantTable
          applicants={applicantsResponse?.data || []}
          isLoading={isLoading}
          onOpenDetailModal={handleOpenDetailModal}
          onEnroll={(app) => setEnrollTarget(app)}
          onDelete={(app) => setDeleteTarget(app)}
        />
      </Card>

      {/* Modal Detail & Verifikasi */}
      <PpdbDetailModal
        applicant={activeApplicant}
        newStatus={newStatus}
        notes={notes}
        isSaving={updateStatusMutation.isPending}
        onClose={() => setActiveApplicant(null)}
        onStatusChange={setNewStatus}
        onNotesChange={setNotes}
        onSubmit={handleSaveStatus}
      />

      {/* Confirm Dialog: Enroll to Buku Induk */}
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

      {/* Confirm Dialog: Delete Applicant */}
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
