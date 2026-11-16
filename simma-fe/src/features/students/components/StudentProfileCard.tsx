import React from "react";
import { User, Edit2, ShieldAlert } from "lucide-react";
import type { Student, StudentStatus } from "../types";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export const STATUS_BADGE_MAP: Record<
  StudentStatus,
  { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string }
> = {
  aktif: { variant: "success", label: "Aktif" },
  lulus: { variant: "info", label: "Lulus" },
  mutasi_keluar: { variant: "warning", label: "Mutasi Keluar" },
  do: { variant: "danger", label: "Drop Out" },
  tidak_aktif: { variant: "danger", label: "Tidak Aktif" },
  aktif_tanpa_rombel: { variant: "neutral", label: "Non-Rombel" },
};

export interface StudentProfileCardProps {
  student: Student;
  onEdit: () => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  student,
  onEdit,
}) => {
  const statusInfo = STATUS_BADGE_MAP[student.status] || {
    variant: "neutral",
    label: student.status,
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg overflow-hidden shrink-0">
            {student.photoPath ? (
              <img
                src={student.photoPath}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">{student.fullName}</h2>
              <Badge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NISN: <span className="font-semibold text-slate-700">{student.nisn || "-"}</span> |{" "}
              NIS: <span className="font-semibold text-slate-700">{student.nis || "-"}</span>
            </p>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
          Ubah Data Siswa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
        <div className="space-y-2.5">
          <h3 className="font-semibold text-slate-700 flex items-center gap-1.5">
            Data Pokok Siswa (Buku Induk)
          </h3>
          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">NIK (Kependudukan)</span>
              <span className="font-mono font-medium text-slate-800">{student.nik}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tempat, Tanggal Lahir</span>
              <span className="font-medium text-slate-800">
                {student.birthPlace}, {student.birthDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jenis Kelamin</span>
              <span className="font-medium text-slate-800">
                {student.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Ibu Kandung</span>
              <span className="font-medium text-slate-800">{student.motherName}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="font-semibold text-slate-700 flex items-center gap-1.5">
            Status Kunci & Keamanan
          </h3>
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">
                Data NIK, NISN, Tempat Lahir, Tanggal Lahir, dan Ibu Kandung terkunci sesuai
                aturan <strong>F-SIS-02</strong>. Perubahan hanya dapat dilakukan oleh pengguna
                dengan hak akses <strong>super_admin</strong>.
              </p>
            </div>
            <div className="flex justify-between pt-1 border-t border-amber-200/40 text-[11px]">
              <span className="text-amber-700">Tanggal Terdaftar:</span>
              <span className="font-medium text-amber-900">
                {student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
