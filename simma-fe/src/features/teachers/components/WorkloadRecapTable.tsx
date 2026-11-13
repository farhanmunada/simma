import React from "react";
import { CheckCircle2, AlertTriangle, Edit } from "lucide-react";
import type { WorkloadSummaryDto } from "../types";

interface WorkloadRecapTableProps {
  items: WorkloadSummaryDto[];
  isLoading: boolean;
  onEditWorkload: (item: WorkloadSummaryDto) => void;
}

export const WorkloadRecapTable: React.FC<WorkloadRecapTableProps> = ({
  items,
  isLoading,
  onEditWorkload,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 animate-pulse">
        Memuat rekapitulasi beban mengajar GTK...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        Belum ada data beban mengajar untuk periode ini.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-5 py-3.5">Nama Guru</th>
              <th className="px-4 py-3.5">Status Pegawai</th>
              <th className="px-4 py-3.5 text-center">Tatap Muka</th>
              <th className="px-4 py-3.5">Tugas Tambahan</th>
              <th className="px-4 py-3.5 text-center">Total JTM</th>
              <th className="px-4 py-3.5">Status Simpatika</th>
              <th className="px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isEligible = item.totalJtm >= 24;
              return (
                <tr key={item.teacherId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{item.fullName}</div>
                    <div className="text-xs text-gray-500">NUPTK: {item.nuptk || "-"}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                      {item.employmentType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-800 whitespace-nowrap">
                    {item.teachingJtm} Jam
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs capitalize font-medium text-gray-700">
                      {item.additionalDutyType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      (+{item.additionalDutyJtm} Jam)
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{item.totalJtm} JTM</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Layak TPG (≥24 JTM)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Kurang ({item.totalJtm}/24 JTM)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onEditWorkload(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Atur Beban
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
