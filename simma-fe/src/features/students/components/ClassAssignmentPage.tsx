import React, { useState, useMemo } from "react";
import { Users, CheckSquare, Square, Check, AlertCircle } from "lucide-react";
import { useStudents, useAssignClassroom } from "../api/students.api";
import { useClassrooms } from "../../settings";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Select } from "../../../components/ui/Select";

export const ClassAssignmentPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [filterClassless, setFilterClassless] = useState(true);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassrooms();
  const { data: studentsData, isLoading: isStudentsLoading, refetch } = useStudents({
    limit: 100,
    search: search.trim() || undefined,
  });

  const assignMutation = useAssignClassroom();

  const students = studentsData?.data || [];

  // Filter students: if filterClassless is true, show students without classroom
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterClassless && s.classroom) return false;
      return true;
    });
  }, [students, filterClassless]);

  const classroomOptions = useMemo(() => {
    const list = classrooms.map((c) => ({
      value: c.id,
      label: `Kelas ${c.gradeLevel} - ${c.name} (Kapasitas: ${c.capacity})`,
    }));
    return [{ value: "", label: "-- Pilih Rombel / Kelas Tujuan --" }, ...list];
  }, [classrooms]);

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    setStatusMessage(null);
    if (!selectedClassroomId) {
      setStatusMessage({
        type: "error",
        text: "Pilih kelas tujuan terlebih dahulu.",
      });
      return;
    }
    if (selectedStudentIds.length === 0) {
      setStatusMessage({
        type: "error",
        text: "Pilih minimal satu siswa untuk ditempatkan.",
      });
      return;
    }

    try {
      const res = await assignMutation.mutateAsync({
        classroomId: selectedClassroomId,
        studentIds: selectedStudentIds,
      });

      const count = res?.assignedCount || selectedStudentIds.length;
      setStatusMessage({
        type: "success",
        text: `Berhasil menempatkan ${count} siswa ke kelas terpilih.`,
      });
      setSelectedStudentIds([]);
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setStatusMessage({
        type: "error",
        text: apiErr?.message || "Gagal menempatkan siswa ke kelas.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">Penempatan Kelas (Rombel)</h1>
          <p className="text-xs text-slate-500">
            Pilih rombel target dan tentukan siswa yang akan ditempatkan.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 text-xs rounded-md border flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Control Card */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Select
              label="Kelas / Rombel Tujuan*"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              options={classroomOptions}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-medium">
              Terpilih: <strong className="text-emerald-700">{selectedStudentIds.length}</strong> siswa
            </span>
            <Button
              size="sm"
              disabled={selectedStudentIds.length === 0 || !selectedClassroomId}
              isLoading={assignMutation.isPending}
              onClick={handleAssign}
            >
              Tempatkan ke Kelas
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter and Selection List */}
      <Card className="overflow-hidden p-0">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterClassless}
                onChange={(e) => setFilterClassless(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              Hanya siswa belum punya kelas
            </label>
          </div>

          <div className="w-64">
            <input
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {isStudentsLoading || isClassroomsLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data siswa...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">Tidak ada siswa yang sesuai kriteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 w-10">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-600 hover:text-slate-900 focus:outline-none"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">NIK / NISN</th>
                  <th className="py-2.5 px-3">JK</th>
                  <th className="py-2.5 px-3">Kelas Saat Ini</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      onClick={() => handleToggleStudent(student.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? "bg-emerald-50/50" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(student.id)}
                          className="focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {student.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span>{student.nik}</span>
                        {student.nisn && (
                          <span className="text-[11px] text-slate-400 ml-1">
                            ({student.nisn})
                          </span>
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
                          <span className="text-slate-400 italic">Belum ada kelas</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="neutral" size="sm">
                          {student.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
