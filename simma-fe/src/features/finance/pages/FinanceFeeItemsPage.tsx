import React, { useState } from "react";
import { Plus, Edit2, Trash2, Tag, CheckCircle } from "lucide-react";
import { useFeeItems, useDeleteFeeItem } from "../api/finance.api";
import { FeeItemFormModal } from "../components/FeeItemFormModal";
import type { FeeItemDto } from "../types";

export const FinanceFeeItemsPage: React.FC = () => {
  const [selectedFeeItem, setSelectedFeeItem] = useState<FeeItemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: feeItems = [], isLoading } = useFeeItems();
  const rawItems = feeItems as any;
  const itemList: FeeItemDto[] = Array.isArray(rawItems)
    ? rawItems
    : Array.isArray(rawItems?.data)
    ? rawItems.data
    : [];
  const deleteMutation = useDeleteFeeItem();

  const handleEdit = (item: FeeItemDto) => {
    setSelectedFeeItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFeeItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus pos biaya "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal menghapus pos biaya");
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Pos Biaya & Tarif</h1>
          <p className="text-sm text-slate-500">Konfigurasi jenis pembayaran rutin (SPP, dll) dan non-rutin.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pos Biaya</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Pos Biaya</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Memuat daftar pos biaya...
                  </td>
                </tr>
              ) : itemList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada pos biaya yang dikonfigurasi.
                  </td>
                </tr>
              ) : (
                itemList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{f.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{f.name}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize">{f.type === "rutin" ? "Rutin" : "Non-Rutin"}</span>
                    </td>
                    <td className="px-4 py-3 uppercase text-slate-600">{f.category}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {f.gradeLevel ? `Kelas ${f.gradeLevel}` : "Semua"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      Rp {f.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          f.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {f.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(f)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.name)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FeeItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feeItemToEdit={selectedFeeItem}
      />
    </div>
  );
};
