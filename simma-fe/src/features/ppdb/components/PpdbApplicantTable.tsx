import React from "react";
import { Eye, UserCheck, Trash2 } from "lucide-react";
import type { PpdbApplicant, PpdbStatus } from "../types";
import { Badge } from "../../../components/ui/Badge";

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

interface PpdbApplicantTableProps {
  applicants: PpdbApplicant[];
  isLoading: boolean;
  onOpenDetailModal: (applicant: PpdbApplicant) => void;
  onEnroll: (applicant: PpdbApplicant) => void;
  onDelete: (applicant: PpdbApplicant) => void;
}

export const PpdbApplicantTable: React.FC<PpdbApplicantTableProps> = ({
  applicants,
  isLoading,
  onOpenDetailModal,
  onEnroll,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <th className="py-2.5 px-3 font-semibold">No. Registrasi</th>
            <th className="py-2.5 px-3 font-semibold">Nama Lengkap & NIK</th>
            <th className="py-2.5 px-3 font-semibold">Asal Sekolah</th>
            <th className="py-2.5 px-3 font-semibold">Jalur</th>
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
          ) : !applicants || applicants.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-slate-400">
                Tidak ada pendaftar yang sesuai filter pencarian.
              </td>
            </tr>
          ) : (
            applicants.map((app) => {
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
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                      {app.track}
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
                      <button
                        title="Detail & Verifikasi Berkas"
                        onClick={() => onOpenDetailModal(app)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {canEnroll && (
                        <button
                          title="Daftarkan ke Buku Induk Siswa"
                          onClick={() => onEnroll(app)}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center space-x-1 shadow-sm transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Ke Buku Induk</span>
                        </button>
                      )}

                      {app.status !== "enrolled" && (
                        <button
                          title="Hapus Pendaftar"
                          onClick={() => onDelete(app)}
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
  );
};
