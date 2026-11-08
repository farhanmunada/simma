import React, { useState } from "react";
import { Plus, AlertCircle, Users } from "lucide-react";
import {
  useClassrooms,
  useSemesters,
  useTeachers,
  useCreateClassroom,
} from "../api/settings.api";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const ClassroomsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Form State
  const [semesterId, setSemesterId] = useState("");
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(36);

  const { data: semesters = [] } = useSemesters();
  const { data: teachers = [] } = useTeachers();

  const queryParams = React.useMemo(() => {
    return {
      ...(selectedGrade ? { gradeLevel: Number(selectedGrade) } : {}),
      ...(selectedSemester ? { semesterId: selectedSemester } : {}),
    };
  }, [selectedGrade, selectedSemester]);

  const { data: classrooms = [], isLoading, isError, error } = useClassrooms(queryParams);
  const createMutation = useCreateClassroom();

  const teacherMap = React.useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t) => map.set(t.id, t.fullName));
    return map;
  }, [teachers]);

  const semesterMap = React.useMemo(() => {
    const map = new Map<string, string>();
    semesters.forEach((s) => {
      const typeStr = s.type === 1 ? "Ganjil" : "Genap";
      map.set(s.id, `Semester ${typeStr} (${s.startDate.slice(0, 4)})`);
    });
    return map;
  }, [semesters]);

  const handleOpenModal = () => {
    const activeSemester = semesters.find((s) => s.isActive)?.id || semesters[0]?.id || "";
    setSemesterId(activeSemester);
    setName("");
    setGradeLevel(10);
    setHomeroomTeacherId("");
    setCapacity(36);
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

    if (!semesterId) {
      setFormError("Semester wajib dipilih.");
      return;
    }
    if (!name.trim()) {
      setFormError("Nama kelas/rombel wajib diisi.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        semesterId,
        name: name.trim(),
        gradeLevel: Number(gradeLevel),
        homeroomTeacherId: homeroomTeacherId || null,
        capacity: Number(capacity) || 36,
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan rombel kelas.");
    }
  };

  const gradeBadgeVariant = (grade: number): "info" | "neutral" | "warning" => {
    if (grade === 10) return "info";
    if (grade === 11) return "warning";
    return "neutral";
  };

  const gradeDisplay = (grade: number) => {
    if (grade === 10) return "Tingkat X";
    if (grade === 11) return "Tingkat XI";
    if (grade === 12) return "Tingkat XII";
    return `Tingkat ${grade}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Kelas & Rombel</h1>
          <p className="text-xs text-slate-500">Kelola rombongan belajar tingkat X, XI, XII dan penugasan wali kelas</p>
        </div>
        <Button onClick={handleOpenModal} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Rombel</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
        <div className="w-40">
          <Select
            options={[
              { value: "", label: "Semua Tingkat" },
              { value: "10", label: "Tingkat X" },
              { value: "11", label: "Tingkat XI" },
              { value: "12", label: "Tingkat XII" },
            ]}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          />
        </div>
        <div className="w-52">
          <Select
            options={[
              { value: "", label: "Semua Semester" },
              ...semesters.map((s) => ({
                value: s.id,
                label: `Semester ${s.type === 1 ? "Ganjil" : "Genap"}${s.isActive ? " (Aktif)" : ""}`,
              })),
            ]}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          />
        </div>
        {(selectedGrade || selectedSemester) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedGrade("");
              setSelectedSemester("");
            }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data kelas & rombel...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada data rombel kelas. Klik tombol Tambah Rombel untuk membuat kelas baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Rombel / Kelas</th>
                  <th className="py-2.5 px-4">Tingkat</th>
                  <th className="py-2.5 px-4">Wali Kelas</th>
                  <th className="py-2.5 px-4">Semester</th>
                  <th className="py-2.5 px-4 text-center">Kapasitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classrooms.map((item, idx) => {
                  const teacherName = item.homeroomTeacherId
                    ? teacherMap.get(item.homeroomTeacherId) || "Wali Kelas Ditugaskan"
                    : "-";
                  const semesterLabel = semesterMap.get(item.semesterId) || "-";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={gradeBadgeVariant(item.gradeLevel)} size="sm">
                          {gradeDisplay(item.gradeLevel)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{teacherName}</td>
                      <td className="py-2.5 px-4 text-slate-600 text-xs">{semesterLabel}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {item.capacity} siswa
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Rombel Kelas Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <Select
            label="Semester"
            options={
              semesters.length > 0
                ? semesters.map((s) => ({
                    value: s.id,
                    label: `Semester ${s.type === 1 ? "Ganjil" : "Genap"}${s.isActive ? " (Aktif)" : ""}`,
                  }))
                : [{ value: "", label: "Belum ada data semester" }]
            }
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tingkat Kelas"
              options={[
                { value: 10, label: "Kelas 10 (Fase E)" },
                { value: 11, label: "Kelas 11 (Fase F)" },
                { value: 12, label: "Kelas 12 (Fase F)" },
              ]}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              required
            />
            <Input
              type="number"
              label="Kapasitas Siswa"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Nama Kelas / Rombel"
            placeholder="Contoh: X Keagamaan 1, XI MIPA 2, XII IPS"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Wali Kelas (Opsional)"
            options={[
              { value: "", label: "-- Belum Ditentukan --" },
              ...teachers.map((t) => ({
                value: t.id,
                label: `${t.fullName} (${t.employmentType})`,
              })),
            ]}
            value={homeroomTeacherId}
            onChange={(e) => setHomeroomTeacherId(e.target.value)}
          />

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
