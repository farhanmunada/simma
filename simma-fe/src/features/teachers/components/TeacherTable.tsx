import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { TeacherListItem } from "../types";

interface TeacherTableProps {
  teachers: TeacherListItem[];
  isLoading: boolean;
  onSelectTeacher: (teacher: TeacherListItem) => void;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  isLoading,
  onSelectTeacher,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 animate-pulse">
        Memuat data GTK madrasah...
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 font-medium">Tidak ada data GTK ditemukan.</p>
        <p className="text-sm text-gray-400 mt-1">
          Gunakan filter pencarian lain atau tambahkan GTK baru.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-5 py-3.5">Nama & Identitas</th>
              <th className="px-4 py-3.5">Status & Jenis</th>
              <th className="px-4 py-3.5">Jabatan</th>
              <th className="px-4 py-3.5">Beban JTM</th>
              <th className="px-4 py-3.5 text-right">Sertifikasi & TPG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((t) => {
              const isPendidik = t.profile?.gtkType !== "tenaga_kependidikan";
              const totalJtm = t.currentWorkload?.totalJtm ?? 0;
              const isEligible = t.currentWorkload?.isEligibleTpg ?? totalJtm >= 24;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTeacher(t)}
                  className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {t.fullName}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 mt-0.5">
                      <span>NIK: {t.nik}</span>
                      {t.profile?.nip && <span>• NIP: {t.profile.nip}</span>}
                      {t.nuptk && <span>• NUPTK: {t.nuptk}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {t.employmentType}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {isPendidik ? "Pendidik (Guru)" : "Tenaga Kependidikan"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {t.position ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.position.name}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">{t.position.category}</div>
                      </div>
                    ) : t.currentRank ? (
                      <div>
                        <span className="font-medium text-gray-800">{t.currentRank.gradeGroup}</span>
                        <div className="text-xs text-gray-500">{t.currentRank.rank}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Belum diatur</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-800">{totalJtm} JTM</div>
                    <div className="text-xs text-gray-500">
                      {t.currentWorkload?.teachingJtm ?? 0} Tatap Muka + {t.currentWorkload?.additionalDutyJtm ?? 0} Tugas
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {isPendidik ? (
                      isEligible ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Memenuhi (24 JTM)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          &lt; 24 JTM
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">Tendik</span>
                    )}
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
