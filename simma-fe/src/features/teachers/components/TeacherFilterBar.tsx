import React from "react";
import { Search, Plus, Download } from "lucide-react";
import { EMPLOYMENT_TYPES, DUTY_STATUSES, type EmploymentType, type DutyStatus } from "@simma/shared";

interface TeacherFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  employmentType?: EmploymentType;
  onEmploymentTypeChange: (val?: EmploymentType) => void;
  dutyStatus?: DutyStatus;
  onDutyStatusChange: (val?: DutyStatus) => void;
  onAddClick: () => void;
  onExportEmisClick: () => void;
}

export const TeacherFilterBar: React.FC<TeacherFilterBarProps> = ({
  search,
  onSearchChange,
  employmentType,
  onEmploymentTypeChange,
  dutyStatus,
  onDutyStatusChange,
  onAddClick,
  onExportEmisClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama GTK, NIK, NUPTK..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={employmentType || ""}
          onChange={(e) => onEmploymentTypeChange((e.target.value as EmploymentType) || undefined)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Status Kepegawaian</option>
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={dutyStatus || ""}
          onChange={(e) => onDutyStatusChange((e.target.value as DutyStatus) || undefined)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Status Penugasan</option>
          {DUTY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExportEmisClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Export EMIS
        </button>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah GTK
        </button>
      </div>
    </div>
  );
};
