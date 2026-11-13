import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import type { ExtracurricularItem, ExtracurricularCategory } from "../types";
import { EXTRACURRICULAR_CATEGORIES } from "@simma/shared";

interface Props {
  items: ExtracurricularItem[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: ExtracurricularItem) => void;
  onDelete: (id: string) => void;
}

export const ExtracurricularTable: React.FC<Props> = ({
  items,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

  const getCategoryBadgeVariant = (cat: ExtracurricularCategory) => {
    switch (cat) {
      case "kepanduan":
        return "success";
      case "keilmuan":
        return "info";
      case "olahraga":
        return "warning";
      case "keagamaan":
        return "neutral";
      case "seni":
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Cari ekskul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter Kategori"
            className="h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Kategori</option>
            {EXTRACURRICULAR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Ekskul
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Kode & Nama</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jadwal & Lokasi</th>
                <th className="px-4 py-3 text-center">Kapasitas</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Memuat data ekstrakurikuler...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada kegiatan ekstrakurikuler yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.code}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getCategoryBadgeVariant(item.category)}>
                        {item.category.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.scheduleDay || "-"} {item.scheduleTime ? `(${item.scheduleTime})` : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.venue || "Belum ditentukan"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.maxCapacity ? `${item.maxCapacity} siswa` : "Tanpa batas"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={item.isActive ? "success" : "neutral"}>
                        {item.isActive ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                        className="text-slate-600 hover:text-emerald-600"
                        title="Edit Ekskul"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(item.id)}
                        className="text-slate-600 hover:text-red-600"
                        title="Hapus Ekskul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
