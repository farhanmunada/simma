import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  useStudent,
  useStudentParents,
  useUpdateStudent,
  useCreateAndLinkParent,
} from "../api/students.api";
import type { UpdateStudentDto, CreateAndLinkParentDto } from "../types";
import { Button } from "../../../components/ui/Button";
import { StudentProfileCard } from "./StudentProfileCard";
import { StudentAcademicHistoryCard } from "./StudentAcademicHistoryCard";
import { StudentParentCard } from "./StudentParentCard";
import { EditStudentModal } from "./EditStudentModal";
import { AddParentModal } from "./AddParentModal";

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddParentModalOpen, setIsAddParentModalOpen] = useState(false);

  const {
    data: student,
    isLoading: isStudentLoading,
    isError: isStudentError,
    error: studentError,
  } = useStudent(id);

  const {
    data: parents = [],
    isLoading: isParentsLoading,
  } = useStudentParents(id);

  const updateStudentMutation = useUpdateStudent();
  const createParentMutation = useCreateAndLinkParent();

  const handleUpdateStudent = async (payload: UpdateStudentDto) => {
    if (!id) return;
    await updateStudentMutation.mutateAsync({ id, data: payload });
  };

  const handleAddParent = async (payload: CreateAndLinkParentDto) => {
    if (!id) return;
    await createParentMutation.mutateAsync({ studentId: id, data: payload });
  };

  if (isStudentLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Memuat data lengkap siswa...
      </div>
    );
  }

  if (isStudentError || !student) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-xs text-red-600 font-medium">
          Gagal memuat data siswa: {(studentError as Error)?.message || "Data tidak ditemukan."}
        </p>
        <Button size="sm" variant="outline" onClick={() => navigate("/students")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Kembali ke Daftar Siswa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/students")}
          className="text-xs text-slate-600"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Kembali ke Buku Induk Siswa
        </Button>
      </div>

      {/* Primary Identity Card */}
      <StudentProfileCard
        student={student}
        onEdit={() => setIsEditModalOpen(true)}
      />

      {/* Academic & Placement Card */}
      <StudentAcademicHistoryCard student={student} />

      {/* Parents & Guardians Card */}
      <StudentParentCard
        parents={parents}
        isLoading={isParentsLoading}
        onAddParent={() => setIsAddParentModalOpen(true)}
      />

      {/* Modal Edit Siswa */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student}
        onSubmit={handleUpdateStudent}
        isLoading={updateStudentMutation.isPending}
      />

      {/* Modal Tambah Orang Tua / Wali */}
      <AddParentModal
        isOpen={isAddParentModalOpen}
        onClose={() => setIsAddParentModalOpen(false)}
        onSubmit={handleAddParent}
        isLoading={createParentMutation.isPending}
      />
    </div>
  );
};
