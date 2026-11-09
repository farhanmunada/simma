import React, { useState } from "react";
import { Plus, Search, Check, X } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { useClassifications, useCreateClassification } from "../api/letters.api";
import type { LetterClassification, CreateClassificationInput } from "../types";

export const ClassificationsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: classifications = [], isLoading } = useClassifications();
  const createMutation = useCreateClassification();

  const [form, setForm] = useState<CreateClassificationInput>({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  const filtered = classifications.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setIsModalOpen(false);
        setForm({ code: "", name: "", description: "", isActive: true });
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode (PP, KP, HM) atau nama klasifikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Klasifikasi
        </button>
      </div>

      {/* Classifications Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Kode KMA 44/2010</th>
                <th className="px-4 py-3">Uraian Klasifikasi</th>
                <th className="px-4 py-3">Deskripsi / Ruang Lingkup</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Memuat kode klasifikasi Kemenag...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    Tidak ditemukan kode klasifikasi yang sesuai
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-sm">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                          <X className="w-3.5 h-3.5" /> Non-Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Klasifikasi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Klasifikasi Naskah Dinas (KMA 44/2010)"
        description="Daftarkan kode klasifikasi persuratan resmi Kementerian Agama RI."
      >
        <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kode Klasifikasi (Contoh: PP.00.6, KP.00)</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg uppercase"
              placeholder="PP.00.6"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nama Klasifikasi</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              placeholder="Pendidikan Madrasah Aliyah"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Deskripsi / Catatan Ruang Lingkup</label>
            <textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan Klasifikasi"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
