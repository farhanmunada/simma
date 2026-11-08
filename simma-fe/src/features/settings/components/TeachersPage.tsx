import React, { useState } from "react";
import { Plus, AlertCircle, Award, UserCheck } from "lucide-react";
import { useTeachers, useCreateTeacher } from "../api/settings.api";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const TeachersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Form State
  const [nik, setNik] = useState("");
  const [nuptk, setNuptk] = useState("");
  const [fullName, setFullName] = useState("");
  const [employmentType, setEmploymentType] = useState<"PNS" | "PPPK" | "GTY" | "GTT">("GTY");
  const [certification, setCertification] = useState("");

  const queryParams = React.useMemo(() => {
    return {
      ...(selectedType ? { employmentType: selectedType as "PNS" | "PPPK" | "GTY" | "GTT" } : {}),
      ...(search ? { search } : {}),
    };
  }, [selectedType, search]);

  const { data: teachers = [], isLoading, isError, error } = useTeachers(queryParams);
  const createMutation = useCreateTeacher();

  const handleOpenModal = () => {
    setNik("");
    setNuptk("");
    setFullName("");
    setEmploymentType("GTY");
    setCertification("");
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

    const cleanNik = nik.trim();
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setFormError("NIK harus berupa 16 digit angka.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Nama lengkap guru wajib diisi.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        nik: cleanNik,
        nuptk: nuptk.trim() || null,
        fullName: fullName.trim(),
        employmentType,
        certification: certification.trim() || null,
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data guru.");
    }
  };

  const getEmploymentBadgeVariant = (type: string): "info" | "success" | "warning" | "neutral" => {
    switch (type) {
      case "PNS":
        return "success";
      case "PPPK":
        return "info";
      case "GTY":
        return "neutral";
      default:
        return "warning";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Guru & GTK</h1>
          <p className="text-xs text-slate-500">Kelola data guru dan tenaga kependidikan madrasah</p>
        </div>
        <Button onClick={handleOpenModal} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah GTK</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
        <div className="w-64">
          <Input
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: "", label: "Semua Status Kepegawaian" },
              { value: "PNS", label: "PNS" },
              { value: "PPPK", label: "PPPK" },
              { value: "GTY", label: "Guru Tetap Yayasan (GTY)" },
              { value: "GTT", label: "Guru Tidak Tetap (GTT)" },
            ]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>
        {(selectedType || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedType("");
              setSearch("");
            }}
          >
            Reset
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data guru & tenaga kependidikan...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada data GTK. Klik tombol Tambah GTK untuk mendaftarkan guru baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Lengkap</th>
                  <th className="py-2.5 px-4">NIP / NUPTK</th>
                  <th className="py-2.5 px-4">NIK</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Sertifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item.fullName}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700 text-xs">
                      {item.nuptk || "-"}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 text-xs">{item.nik}</td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={getEmploymentBadgeVariant(item.employmentType)} size="sm">
                        {item.employmentType}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 text-xs">
                      {item.certification ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <Award className="w-3.5 h-3.5" />
                          {item.certification}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Guru / GTK Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <Input
            label="Nama Lengkap & Gelar"
            placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="NIK (16 Digit)"
              placeholder="3201..."
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              required
            />
            <Input
              label="NIP / NUPTK (Opsional)"
              placeholder="19800101..."
              value={nuptk}
              onChange={(e) => setNuptk(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status Kepegawaian"
              options={[
                { value: "GTY", label: "Guru Tetap Yayasan (GTY)" },
                { value: "PNS", label: "Pegawai Negeri Sipil (PNS)" },
                { value: "PPPK", label: "PPPK Kemenag" },
                { value: "GTT", label: "Guru Tidak Tetap (GTT)" },
              ]}
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as "PNS" | "PPPK" | "GTY" | "GTT")}
              required
            />
            <Input
              label="Sertifikasi Guru (Opsional)"
              placeholder="Contoh: Pendidik Profesional Fikih"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
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
