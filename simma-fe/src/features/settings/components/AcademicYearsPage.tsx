import React, { useState } from "react";
import { Plus, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import {
  useAcademicYears,
  useCreateAcademicYear,
  usePatchAcademicYearStatus,
} from "../api/settings.api";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";

export const AcademicYearsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: academicYears = [], isLoading, isError, error } = useAcademicYears();
  const createMutation = useCreateAcademicYear();
  const activateMutation = usePatchAcademicYearStatus();

  const handleOpenModal = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama tahun ajaran wajib diisi.");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setFormError("Tanggal selesai harus lebih besar dari tanggal mulai.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        startDate,
        endDate,
        isActive: false,
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data tahun ajaran.");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync({ id, isActive: true });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal mengaktifkan tahun ajaran.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Tahun Ajaran</h1>
          <p className="text-xs text-slate-500">Kelola kalender dan tahun akademik madrasah</p>
        </div>
        <Button onClick={handleOpenModal} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Ajaran</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data tahun ajaran...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : academicYears.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada data tahun ajaran. Klik tombol Tambah Tahun Ajaran untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Tahun Ajaran</th>
                  <th className="py-2.5 px-4">Tanggal Mulai</th>
                  <th className="py-2.5 px-4">Tanggal Selesai</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{item.startDate}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{item.endDate}</td>
                    <td className="py-2.5 px-4 text-center">
                      {item.isActive ? (
                        <Badge variant="success" size="sm">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(item.id)}
                          isLoading={activateMutation.isPending && activateMutation.variables?.id === item.id}
                        >
                          Aktifkan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Tahun Ajaran Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <Input
            label="Nama Tahun Ajaran"
            placeholder="Contoh: 2026/2027"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              label="Tanggal Mulai"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="date"
              label="Tanggal Selesai"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={createMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
