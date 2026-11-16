import React from "react";
import type { TeacherListItem } from "../types";

interface TeacherBioTabProps {
  teacher: TeacherListItem & {
    profile?: {
      nip?: string | null;
      nrg?: string | null;
      pegId?: string | null;
      gtkType?: string | null;
      dutyStatus?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
}

export const TeacherBioTab: React.FC<TeacherBioTabProps> = ({ teacher }) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="p-3 bg-gray-50 rounded-lg col-span-2">
        <span className="text-xs text-gray-500 block">Jabatan Resmi</span>
        <span className="font-medium text-gray-800">
          {teacher.position ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              {teacher.position.name} ({teacher.position.category})
            </span>
          ) : (
            <span className="text-gray-400 italic">Belum diatur</span>
          )}
        </span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">NIP</span>
        <span className="font-medium text-gray-800">{teacher.profile?.nip || "-"}</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">NUPTK</span>
        <span className="font-medium text-gray-800">{teacher.nuptk || "-"}</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">NRG / Sertifikasi</span>
        <span className="font-medium text-gray-800">
          {teacher.profile?.nrg || teacher.certification || "Belum Tersertifikasi"}
        </span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">PegID Simpatika</span>
        <span className="font-medium text-gray-800">{teacher.profile?.pegId || "-"}</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">Jenis PTK</span>
        <span className="font-medium text-gray-800 capitalize">
          {teacher.profile?.gtkType || "pendidik"}
        </span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">Status Tugas</span>
        <span className="font-medium text-gray-800 capitalize">
          {teacher.profile?.dutyStatus || "aktif"}
        </span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">Kontak Telepon</span>
        <span className="font-medium text-gray-800">{teacher.profile?.phone || "-"}</span>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500 block">Email Madrasah</span>
        <span className="font-medium text-gray-800">{teacher.profile?.email || "-"}</span>
      </div>
    </div>
  );
};
