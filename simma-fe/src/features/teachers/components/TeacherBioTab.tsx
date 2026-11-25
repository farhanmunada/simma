import React from "react";
import { KeyRound, BookOpen, Home, Trophy, User } from "lucide-react";
import { GTK_ROLE_OPTIONS } from "@simma/shared";
import { useClassrooms, useSubjects } from "../../settings/api/settings.api";
import { useExtracurriculars } from "../../extracurricular/api/extracurricular.api";
import type { TeacherFullDetailDto } from "../types";

interface TeacherBioTabProps {
  teacher: TeacherFullDetailDto;
}

const roleLabelMap = new Map(GTK_ROLE_OPTIONS.map((r) => [r.role, r.label]));

const InfoRow: React.FC<{ label: string; value?: string | null; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <p className={`text-sm font-medium text-gray-900 mt-0.5 ${mono ? "font-mono" : ""}`}>
      {value || "-"}
    </p>
  </div>
);

export const TeacherBioTab: React.FC<TeacherBioTabProps> = ({ teacher }) => {
  const { data: classrooms = [] } = useClassrooms();
  const { data: subjects = [] } = useSubjects();
  const { data: ekskulRes } = useExtracurriculars();

  const classMap = new Map(classrooms.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const ekskulMap = new Map((ekskulRes?.data ?? []).map((e) => [e.id, e.name]));

  const p = teacher.profile;
  const acc = teacher.account;
  const asg = teacher.assignments;
  const primaryRoleLabel = acc?.role ? roleLabelMap.get(acc.role) || acc.role : "-";
  const secondaryLabels = (acc?.secondaryRoles ?? []).map((r) => roleLabelMap.get(r) || r);

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Akun & Enrolment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Akun Internal GTK</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Kode Login (4 Digit)" value={teacher.employeeCode || acc?.username} mono />
            <InfoRow label="Status Akun" value={acc ? (acc.isActive ? "Aktif" : "Nonaktif") : "Belum Terbit"} />
            <InfoRow label="Role Utama" value={primaryRoleLabel} />
            <InfoRow
              label="Role Tambahan"
              value={secondaryLabels.length > 0 ? secondaryLabels.join(", ") : "Tidak ada"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Delegasi Tugas Mengajar &amp; Kelas</span>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Home className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-700">Wali Kelas: </span>
                {asg?.homeroomClassroomId
                  ? classMap.get(asg.homeroomClassroomId) || asg.homeroomClassroomId
                  : "Tidak menjabat"}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-700">Guru Mapel: </span>
                {asg?.subjectAssignments?.length ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {asg.subjectAssignments.map((s) => (
                      <span
                        key={`${s.classroomId}-${s.subjectId}`}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium"
                      >
                        {classMap.get(s.classroomId) || s.classroomId} &bull;{" "}
                        {subjectMap.get(s.subjectId) || s.subjectId}
                      </span>
                    ))}
                  </div>
                ) : (
                  "Belum ada mapel didelegasikan"
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Trophy className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-700">Pembina Ekskul: </span>
                {asg?.extracurricularIds?.length
                  ? asg.extracurricularIds.map((id) => ekskulMap.get(id) || id).join(", ")
                  : "Tidak ada"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Kepegawaian & Sertifikasi */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase mb-3">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Data Kepegawaian &amp; Sertifikasi</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="NIK (KTP)" value={teacher.nik} mono />
          <InfoRow label="NUPTK" value={teacher.nuptk} mono />
          <InfoRow label="NIP (PNS/PPPK)" value={p?.nip} mono />
          <InfoRow label="NRG (Serdik)" value={p?.nrg} mono />
          <InfoRow label="PegID Simpatika" value={p?.pegId} mono />
          <InfoRow label="Status Kepegawaian" value={teacher.employmentType} />
          <InfoRow label="Tipe GTK" value={p?.gtkType === "pendidik" ? "Pendidik / Guru" : "Tenaga Kependidikan"} />
          <InfoRow label="Status Tugas" value={p?.dutyStatus || "aktif"} />
          <InfoRow label="Jabatan Madrasah" value={teacher.position?.name} />
          <InfoRow label="TMT Pertama Mengajar" value={p?.tmtFirst} />
          <InfoRow label="TMT PNS / PPPK" value={p?.tmtPns} />
          <InfoRow label="Bidang Sertifikasi" value={p?.certificationField || teacher.certification} />
        </div>
      </div>

      {/* 3. Biodata Pribadi & Kontak */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-800 uppercase mb-3">Biodata Pribadi &amp; Kontak</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Nomor KK" value={p?.noKk} mono />
          <InfoRow
            label="Tempat, Tanggal Lahir"
            value={
              p?.birthPlace || p?.birthDate
                ? `${p?.birthPlace || "-"}, ${p?.birthDate || "-"}`
                : "-"
            }
          />
          <InfoRow label="Jenis Kelamin" value={p?.gender === "P" ? "Perempuan" : "Laki-Laki"} />
          <InfoRow label="Agama" value={p?.religion || "Islam"} />
          <InfoRow label="Status Pernikahan" value={p?.marriageStatus} />
          <InfoRow label="No. HP / WhatsApp" value={p?.phone} />
          <InfoRow label="Email Pribadi" value={p?.email} />
          <div className="col-span-2 sm:col-span-3">
            <InfoRow label="Alamat Domisili" value={p?.address} />
          </div>
        </div>
      </div>
    </div>
  );
};
