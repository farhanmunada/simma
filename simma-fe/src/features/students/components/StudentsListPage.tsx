import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Trash2, Eye, Users } from "lucide-react";
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
import { StudentFilterToolbar } from "./StudentFilterToolbar";
import { CreateStudentModal } from "./CreateStudentModal";
import { STATUS_BADGE_MAP } from "./StudentProfileCard";

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

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedGender("");
    setPage(1);
  };

  const handleCreateStudent = async (payload: CreateStudentDto) => {
    await createMutation.mutateAsync(payload);
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
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <StudentFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        selectedGender={selectedGender}
        onGenderChange={(val) => {
          setSelectedGender(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

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
      <CreateStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateStudent}
        isLoading={createMutation.isPending}
      />

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
