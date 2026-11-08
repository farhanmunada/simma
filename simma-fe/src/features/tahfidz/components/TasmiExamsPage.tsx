import React, { useState } from "react";
import {
  Plus,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import {
  useTasmiExams,
  useCreateTasmiExam,
  useUpdateTasmiExam,
  useDeleteTasmiExam,
} from "../api/tahfidz.api";
import type {
  TasmiExam,
  TasmiStatus,
  TasmiQueryParams,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const TasmiExamsPage: React.FC = () => {
  // Filters
  const [filterJuz, setFilterJuz] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const queryParams: TasmiQueryParams = {
    juz: filterJuz ? parseInt(filterJuz, 10) : undefined,
    status: filterStatus ? (filterStatus as TasmiStatus) : undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const { data: examsData, isLoading, isError, error } = useTasmiExams(queryParams);
  const exams = examsData?.data || [];

  const createMutation = useCreateTasmiExam();
  const updateMutation = useUpdateTasmiExam();
  const deleteMutation = useDeleteTasmiExam();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<TasmiExam | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState("");
  const [juz, setJuz] = useState(30);
  const [tajwidScore, setTajwidScore] = useState(85);
  const [makhrojScore, setMakhrojScore] = useState(85);
  const [fluencyScore, setFluencyScore] = useState(85);
  const [finalScore, setFinalScore] = useState(85);
  const [status, setStatus] = useState<TasmiStatus>("lulus");
  const [notes, setNotes] = useState("");
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setStudentId("");
    setJuz(30);
    setTajwidScore(85);
    setMakhrojScore(85);
    setFluencyScore(85);
    setFinalScore(85);
    setStatus("lulus");
    setNotes("");
    setExamDate(new Date().toISOString().split("T")[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: TasmiExam) => {
    setEditingExam(exam);
    setStudentId(exam.studentId);
    setJuz(exam.juz);
    setTajwidScore(exam.tajwidScore);
    setMakhrojScore(exam.makhrojScore);
    setFluencyScore(exam.fluencyScore);
    setFinalScore(exam.finalScore);
    setStatus(exam.status);
    setNotes(exam.notes || "");
    setExamDate(exam.examDate);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setFormError(null);
  };

  // Recalculate average when component scores change
  const handleScoreChange = (
    type: "tajwid" | "makhroj" | "fluency",
    val: number
  ) => {
    const safeVal = Math.max(0, Math.min(100, val || 0));
    const newT = type === "tajwid" ? safeVal : tajwidScore;
    const newM = type === "makhroj" ? safeVal : makhrojScore;
    const newF = type === "fluency" ? safeVal : fluencyScore;

    if (type === "tajwid") setTajwidScore(safeVal);
    if (type === "makhroj") setMakhrojScore(safeVal);
    if (type === "fluency") setFluencyScore(safeVal);

    const calculatedAvg = Math.round((newT + newM + newF) / 3);
    setFinalScore(calculatedAvg);

    // Auto suggest status
    if (calculatedAvg >= 75) {
      setStatus("lulus");
    } else if (calculatedAvg >= 60) {
      setStatus("perlu_perbaikan");
    } else {
      setStatus("tidak_lulus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!studentId.trim()) {
      setFormError("ID Siswa wajib diisi.");
      return;
    }
    if (juz < 1 || juz > 30) {
      setFormError("Juz harus di antara 1 sampai 30.");
      return;
    }
    if (
      tajwidScore < 0 ||
      tajwidScore > 100 ||
      makhrojScore < 0 ||
      makhrojScore > 100 ||
      fluencyScore < 0 ||
      fluencyScore > 100 ||
      finalScore < 0 ||
      finalScore > 100
    ) {
      setFormError("Semua skor harus berada di antara 0 sampai 100.");
      return;
    }

    try {
      if (editingExam) {
        await updateMutation.mutateAsync({
          id: editingExam.id,
          data: {
            studentId: studentId.trim(),
            juz,
            tajwidScore,
            makhrojScore,
            fluencyScore,
            finalScore,
            status,
            notes: notes.trim() || null,
            examDate,
          },
        });
      } else {
        await createMutation.mutateAsync({
          studentId: studentId.trim(),
          juz,
          tajwidScore,
          makhrojScore,
          fluencyScore,
          finalScore,
          status,
          notes: notes.trim() || null,
          examDate,
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data ujian Tasmi'.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ujian Tasmi' ini?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal menghapus data ujian Tasmi'.");
    }
  };

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Ujian Tasmi' Al-Qur'an</h1>
          <p className="text-xs text-slate-500">
            Penilaian ujian sekali duduk per juz oleh dewan asatidz / penguji
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Ujian Tasmi'</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Ujian</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <Select
            label="Juz"
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            options={[{ value: "", label: "Semua Juz" }, ...juzOptions]}
          />
          <Select
            label="Status Kelulusan"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "lulus", label: "Lulus" },
              { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
              { value: "tidak_lulus", label: "Tidak Lulus" },
            ]}
          />
          <Input
            type="date"
            label="Mulai Tanggal"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Table Data */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data ujian Tasmi'...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data ujian Tasmi'."}</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada rekam data ujian Tasmi'.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Tanggal Ujian</th>
                  <th className="py-2.5 px-3">Siswa ID</th>
                  <th className="py-2.5 px-3 text-center">Juz</th>
                  <th className="py-2.5 px-3 text-center">Skor (T / M / K)</th>
                  <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Catatan Penguji</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {item.examDate}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">
                      {item.studentId.slice(0, 8)}...
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      Juz {item.juz}
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-700">
                      <span title="Tajwid">{item.tajwidScore}</span> /{" "}
                      <span title="Makhroj">{item.makhrojScore}</span> /{" "}
                      <span title="Kelancaran">{item.fluencyScore}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-sm font-mono text-slate-900">
                      {item.finalScore}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === "lulus" ? (
                        <Badge variant="success" size="sm">
                          Lulus
                        </Badge>
                      ) : item.status === "perlu_perbaikan" ? (
                        <Badge variant="warning" size="sm">
                          Perlu Perbaikan
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Tidak Lulus
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                      {item.notes || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Edit Ujian"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          title="Hapus Ujian"
                          onClick={() => handleDelete(item.id)}
                          isLoading={
                            deleteMutation.isPending &&
                            deleteMutation.variables === item.id
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Input / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExam ? "Edit Nilai Ujian Tasmi'" : "Input Penilaian Ujian Tasmi'"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="UUID Siswa (Student ID)"
                placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <Input
              type="date"
              label="Tanggal Ujian"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Juz yang Diujikan"
              value={juz}
              onChange={(e) => setJuz(parseInt(e.target.value, 10))}
              options={juzOptions}
            />
            <div className="flex items-end">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Ujian Sekali Duduk</span>
                <span className="text-xs font-mono font-bold text-emerald-700">1 Juz Penuh</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Komponen Penilaian (Bobot Setara Rata-rata)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="number"
                label="Skor Tajwid (0-100)"
                min={0}
                max={100}
                value={tajwidScore}
                onChange={(e) => handleScoreChange("tajwid", parseInt(e.target.value, 10))}
                required
              />
              <Input
                type="number"
                label="Skor Makhroj (0-100)"
                min={0}
                max={100}
                value={makhrojScore}
                onChange={(e) => handleScoreChange("makhroj", parseInt(e.target.value, 10))}
                required
              />
              <Input
                type="number"
                label="Skor Kelancaran (0-100)"
                min={0}
                max={100}
                value={fluencyScore}
                onChange={(e) => handleScoreChange("fluency", parseInt(e.target.value, 10))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              label="Nilai Akhir (Kalkulasi / Manual)"
              min={0}
              max={100}
              value={finalScore}
              onChange={(e) => setFinalScore(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Select
              label="Status Kelulusan"
              value={status}
              onChange={(e) => setStatus(e.target.value as TasmiStatus)}
              options={[
                { value: "lulus", label: "Lulus (>= 75)" },
                { value: "perlu_perbaikan", label: "Perlu Perbaikan (60 - 74)" },
                { value: "tidak_lulus", label: "Tidak Lulus (< 60)" },
              ]}
            />
          </div>

          <Input
            label="Catatan Penguji / Dewan Asatidz"
            placeholder="Contoh: Bacaan tartil, perhatikan konsistensi mad thobi'i"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              Simpan Penilaian
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
