import React, { useState, useMemo } from "react";
import type { EmisAnomalyItem, EmisEntityType } from "../types";

interface AuditAnomalyListProps {
  anomalies: EmisAnomalyItem[];
}

export const AuditAnomalyList: React.FC<AuditAnomalyListProps> = ({ anomalies }) => {
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    return anomalies.filter((item) => {
      if (selectedEntity !== "all" && item.entityType !== selectedEntity) return false;
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = item.entityName.toLowerCase().includes(query);
        const matchId = item.identifier.toLowerCase().includes(query);
        const matchField = item.fieldName.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchField) return false;
      }
      return true;
    });
  }, [anomalies, selectedEntity, selectedSeverity, search]);

  const entityLabels: Record<EmisEntityType, string> = {
    all: "Semua",
    student: "Siswa",
    teacher: "GTK / Guru",
    classroom: "Rombel",
    institution: "Lembaga",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Daftar Temuan Anomali & Perbaikan Data ({anomalies.length})
          </h3>
          <p className="text-sm text-gray-500">
            Selesaikan anomali berikut sebelum mengunggah berkas ekspor ke EMIS 4.0 Kemenag.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="all">Semua Entitas</option>
            <option value="student">Siswa</option>
            <option value="teacher">GTK / Guru</option>
            <option value="classroom">Rombongan Belajar</option>
            <option value="institution">Lembaga</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="all">Semua Keparahan</option>
            <option value="critical">Kritis (Tolak EMIS)</option>
            <option value="warning">Peringatan</option>
          </select>

          <input
            type="text"
            placeholder="Cari nama/NISN/NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-3 py-1.5 w-44"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm font-semibold text-emerald-700">
            ✓ Tidak ada data anomali yang cocok dengan kriteria filter.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Data madrasah telah memenuhi integritas pendataan EMIS 4.0.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <th className="py-2.5 px-3">Tingkat</th>
                <th className="py-2.5 px-3">Entitas</th>
                <th className="py-2.5 px-3">Nama / Identitas</th>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Deskripsi Anomali</th>
                <th className="py-2.5 px-3">Saran Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.severity === "critical"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.severity === "critical" ? "Kritis" : "Peringatan"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-700">
                    {entityLabels[item.entityType] || item.entityType}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-gray-900">{item.entityName}</div>
                    <div className="text-[11px] text-gray-500">{item.identifier}</div>
                    {item.classroomName && (
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Kelas: {item.classroomName}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                    {item.fieldName}
                  </td>
                  <td className="py-2.5 px-3 text-rose-600 font-medium">
                    {item.issueDescription}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {item.suggestedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
