import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Trash2, Eye, Users } from "lucide-react";
import {
  useStudents,
  useCreateStudent,
  useDeleteStudent,
} from "../api/students.api";
import type {
  Student,
  StudentStatus,
  Gender,
  CreateStudentDto,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

const STATUS_BADGE_MAP: Record<
  StudentStatus,
  { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string }
> = {
  aktif: { variant: "success", label: "Aktif" },
  lulus: { variant: "info", label: "Lulus" },
  mutasi_keluar: { variant: "warning", label: "Mutasi Keluar" },
  do: { variant: "danger", label: "Drop Out" },
  tidak_aktif: { variant: "danger", label: "Tidak Aktif" },
  aktif_tanpa_rombel: { variant: "neutral", label: "Non-Rombel" },
};

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("L");
  const [motherName, setMotherName] = useState("");
  const [status, setStatus] = useState<StudentStatus>("aktif");

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: searchTerm.trim() || undefined,
      status: (selectedStatus as StudentStatus) || undefined,
      gender: (selectedGender as Gender) || undefined,
    };
  }, [page, limit, searchTerm, selectedStatus, selectedGender]);

  const { data, isLoading, isError, error } = useStudents(queryParams);
  const createMutation = useCreateStudent();
  const deleteMutation = useDeleteStudent();

  const students = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleOpenAddModal = () => {
    setNik("");
    setNisn("");
    setNis("");
    setFullName("");
    setBirthPlace("");
    setBirthDate("");
    setGender("L");
    setMotherName("");
    setStatus("aktif");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!nik.trim()) return "NIK wajib diisi.";
    if (nik.trim().length !== 16 || !/^\d{16}$/.test(nik.trim())) {
      return "NIK harus tepat 16 digit angka.";
    }
    if (!fullName.trim()) return "Nama lengkap siswa wajib diisi.";
    if (!birthPlace.trim()) return "Tempat lahir wajib diisi.";
    if (!birthDate.trim()) return "Tanggal lahir wajib diisi.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      return "Format tanggal lahir harus YYYY-MM-DD.";
    }
    if (!motherName.trim()) return "Nama ibu kandung wajib diisi.";
    if (nisn.trim() && (nisn.trim().length !== 10 || !/^\d{10}$/.test(nisn.trim()))) {
      return "NISN harus tepat 10 digit angka jika diisi.";
    }
    return null;
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    const payload: CreateStudentDto = {
      nik: nik.trim(),
      nisn: nisn.trim() || null,
      nis: nis.trim() || null,
      fullName: fullName.trim(),
      birthPlace: birthPlace.trim(),
      birthDate: birthDate.trim(),
      gender,
      motherName: motherName.trim(),
      status,
    };

    try {
      await createMutation.mutateAsync(payload);
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal mendaftarkan siswa baru.");
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal menghapus data siswa.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">Daftar Siswa</h1>
          <p className="text-xs text-slate-500">
            Total {meta.total} siswa terdaftar di sistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / NISN / NIK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Semua Jenis Kelamin" },
                { value: "L", label: "Laki-laki (L)" },
                { value: "P", label: "Perempuan (P)" },
              ]}
              className="py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center">
            {(searchTerm || selectedStatus || selectedGender) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("");
                  setSelectedGender("");
                  setPage(1);
                }}
                className="text-xs text-slate-500"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Data */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data siswa...</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-600">
            Terjadi kesalahan saat memuat data: {(error as Error)?.message || "Gagal memuat"}
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">Tidak ada data siswa ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">NIK / NISN</th>
                  <th className="py-2.5 px-3">JK</th>
                  <th className="py-2.5 px-3">Kelas / Rombel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const statusInfo =
                    STATUS_BADGE_MAP[student.status] || {
                      variant: "neutral",
                      label: student.status,
                    };
                  const rowNumber = (meta.page - 1) * meta.limit + idx + 1;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{rowNumber}</td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/students/${student.id}`}
                          className="font-medium text-slate-800 hover:text-emerald-700"
                        >
                          {student.fullName}
                        </Link>
                        {student.nis && (
                          <span className="block text-[11px] text-slate-400">
                            NIS: {student.nis}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>NIK: {student.nik}</div>
                        {student.nisn ? (
                          <div className="text-[11px] text-slate-500">NISN: {student.nisn}</div>
                        ) : (
                          <div className="text-[11px] text-slate-400">NISN: -</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {student.gender === "L" ? "L" : "P"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {student.classroom ? (
                          <span className="font-medium text-slate-700">
                            {student.classroom.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum ditempatkan</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/students/${student.id}`)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(student)}
                          title="Hapus Siswa"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tambah Siswa */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Tambah Siswa Baru"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-3">
          {formError && (
            <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="NIK (16 Digit)*"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              maxLength={16}
              placeholder="3201xxxxxxxxxxxx"
              required
            />
            <Input
              label="NISN (10 Digit)"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              maxLength={10}
              placeholder="00xxxxxxxx"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nama Lengkap Siswa*"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              required
            />
            <Input
              label="NIS Lokal"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Contoh: 2026001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tempat Lahir*"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="Contoh: Bandung"
              required
            />
            <Input
              label="Tanggal Lahir*"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Jenis Kelamin*"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              options={[
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ]}
              required
            />
            <Select
              label="Status Awal*"
              value={status}
              onChange={(e) => setStatus(e.target.value as StudentStatus)}
              options={[
                { value: "aktif", label: "Aktif" },
                { value: "aktif_tanpa_rombel", label: "Aktif Non-Rombel" },
                { value: "tidak_aktif", label: "Tidak Aktif" },
              ]}
              required
            />
          </div>

          <div>
            <Input
              label="Nama Ibu Kandung*"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="Nama lengkap ibu kandung"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCloseAddModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
            >
              Simpan Siswa
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus Siswa"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus data siswa{" "}
            <span className="font-semibold text-slate-800">
              {deleteTarget?.fullName}
            </span>{" "}
            (NIK: {deleteTarget?.nik})?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={handleDeleteStudent}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
