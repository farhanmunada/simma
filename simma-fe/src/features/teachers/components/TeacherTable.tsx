import React from "react";
import { UserCheck, ShieldCheck, KeyRound, ChevronRight } from "lucide-react";
import { GTK_ROLE_OPTIONS } from "@simma/shared";
import type { TeacherListItem } from "../types";

interface TeacherTableProps {
  teachers: TeacherListItem[];
  isLoading: boolean;
  onSelectTeacher: (teacher: TeacherListItem) => void;
}

const roleLabelMap = new Map(GTK_ROLE_OPTIONS.map((r) => [r.role, r.label]));

const empBadgeClass: Record<string, string> = {
  PNS: "bg-blue-50 text-blue-700 border-blue-200",
  PPPK: "bg-indigo-50 text-indigo-700 border-indigo-200",
  GTY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  GTT: "bg-amber-50 text-amber-700 border-amber-200",
};

const dutyBadgeClass: Record<string, string> = {
  aktif: "bg-emerald-50 text-emerald-700",
  cuti: "bg-amber-50 text-amber-700",
  mutasi: "bg-slate-100 text-slate-600",
  pensiun: "bg-red-50 text-red-700",
};

export const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  isLoading,
  onSelectTeacher,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">Belum ada data GTK</h3>
        <p className="text-sm text-gray-500 mt-1">
          Silakan tambahkan Guru &amp; Tenaga Kependidikan atau ubah filter pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Kode</th>
              <th className="py-3.5 px-4">Nama Lengkap &amp; Gelar</th>
              <th className="py-3.5 px-4">Role &amp; Hak Akses</th>
              <th className="py-3.5 px-4">NUPTK / NIK</th>
              <th className="py-3.5 px-4">Status Kepegawaian</th>
              <th className="py-3.5 px-4">Status Akun</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {teachers.map((t) => {
              const primaryRole = t.account?.role;
              const roleLabel = primaryRole
                ? roleLabelMap.get(primaryRole) || primaryRole
                : "Belum Diatur";
              const extraCount = t.account?.secondaryRoles?.length ?? 0;
              const dutyStatus = t.profile?.dutyStatus || "aktif";
              const gtkType = t.profile?.gtkType;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTeacher(t)}
                  className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    {t.employeeCode ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-widest">
                        <KeyRound className="w-3 h-3 text-emerald-400" />
                        {t.employeeCode}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {t.fullName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{t.position?.name || (gtkType === "pendidik" ? "Pendidik" : "Tendik")}</span>
                      {t.certification && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Tersertifikasi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-gray-800">{roleLabel}</div>
                    {extraCount > 0 && (
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        +{extraCount} role tambahan
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                    <div>{t.nuptk || "-"}</div>
                    <div className="text-[11px] text-gray-400">NIK: {t.nik || "-"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${
                          empBadgeClass[t.employmentType] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {t.employmentType}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                          dutyBadgeClass[dutyStatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {dutyStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.userId ? (
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.account?.isActive !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {t.account?.isActive !== false ? "Aktif" : "Nonaktif"}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        Belum Terbit
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTeacher(t);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
