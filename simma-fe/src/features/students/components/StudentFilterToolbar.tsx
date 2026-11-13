import React from "react";
import { Search } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";

export interface StudentFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  onReset: () => void;
}

export const StudentFilterToolbar: React.FC<StudentFilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedGender,
  onGenderChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(searchTerm || selectedStatus || selectedGender);

  return (
    <Card className="p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama / NISN / NIK..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div>
          <Select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "aktif", label: "Aktif" },
              { value: "aktif_tanpa_rombel", label: "Aktif Non-Rombel" },
              { value: "lulus", label: "Lulus" },
              { value: "mutasi_keluar", label: "Mutasi Keluar" },
              { value: "tidak_aktif", label: "Tidak Aktif" },
              { value: "do", label: "Drop Out" },
            ]}
            className="py-1.5 text-xs"
          />
        </div>

        <div>
          <Select
            value={selectedGender}
            onChange={(e) => onGenderChange(e.target.value)}
            options={[
              { value: "", label: "Semua Jenis Kelamin" },
              { value: "L", label: "Laki-laki (L)" },
              { value: "P", label: "Perempuan (P)" },
            ]}
            className="py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-500"
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
