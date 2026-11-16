import React from "react";
import { Award, Clock, FileWarning, CheckCircle } from "lucide-react";
import { useTeachersList, useTeacherStats } from "../api/teachers.api";

export const TeacherMonitoringPage: React.FC = () => {
  const { data: listData, isLoading: listLoading } = useTeachersList({});
  const { data: stats, isLoading: statsLoading } = useTeacherStats();

  const teachers = listData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring & Mutu GTK</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pemantauan masa berkala kenaikan gaji berkala (KGB), kenaikan pangkat, dan kelengkapan dokumen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">GTK Sertifikasi</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {statsLoading ? "..." : stats?.certifiedCount || 0} Guru
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Memiliki sertifikat pendidik</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Status PNS / ASN</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              {statsLoading ? "..." : (stats?.pnsCount || 0) + (stats?.pppkCount || 0)} GTK
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">PNS & PPPK Kemenag</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Guru Tetap Yayasan (GTY)</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">
              {statsLoading ? "..." : stats?.gtyCount || 0} Guru
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Yayasan Madrasah</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabel Pemantauan KGB & Pangkat */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Rekap Masa Kepangkatan & KGB Terakhir</h2>
          <p className="text-xs text-gray-500">Estimasi jadwal Kenaikan Gaji Berkala (2 tahunan) dan Kenaikan Pangkat reguler.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Nama Pegawai</th>
                <th className="px-4 py-3">Golongan / Pangkat</th>
                <th className="px-4 py-3">Nomor SK</th>
                <th className="px-4 py-3">TMT Pangkat</th>
                <th className="px-4 py-3">Proyeksi KGB Berikutnya</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data pegawai.</td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {t.fullName}
                      <div className="text-xs text-gray-500 font-normal">{t.employmentType}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.currentRank ? `${t.currentRank.gradeGroup} (${t.currentRank.rank})` : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {t.currentRank?.skNumber || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {t.currentRank?.tmtRank || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-purple-700">
                      {t.currentRank?.nextKgbDate || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                        {t.profile?.dutyStatus || "Aktif"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
