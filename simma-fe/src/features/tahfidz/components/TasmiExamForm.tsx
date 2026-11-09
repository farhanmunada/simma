import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import type {
  TasmiExam,
  TasmiStatus,
  CreateTasmiExamDto,
  UpdateTasmiExamDto,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export interface TasmiExamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTasmiExamDto | (UpdateTasmiExamDto & { id: string })) => Promise<void>;
  editingExam?: TasmiExam | null;
  isSubmitting?: boolean;
}

export const TasmiExamForm: React.FC<TasmiExamFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingExam,
  isSubmitting = false,
}) => {
  const [studentId, setStudentId] = useState("");
  const [juz, setJuz] = useState(30);
  const [tajwidScore, setTajwidScore] = useState(85);
  const [makhrojScore, setMakhrojScore] = useState(85);
  const [fluencyScore, setFluencyScore] = useState(85);
  const [finalScore, setFinalScore] = useState(85);
  const [status, setStatus] = useState<TasmiStatus>("lulus");
  const [notes, setNotes] = useState("");
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingExam) {
      setStudentId(editingExam.studentId);
      setJuz(editingExam.juz);
      setTajwidScore(editingExam.tajwidScore);
      setMakhrojScore(editingExam.makhrojScore);
      setFluencyScore(editingExam.fluencyScore);
      setFinalScore(editingExam.finalScore);
      setStatus(editingExam.status);
      setNotes(editingExam.notes || "");
      setExamDate(editingExam.examDate);
    } else {
      setStudentId("");
      setJuz(30);
      setTajwidScore(85);
      setMakhrojScore(85);
      setFluencyScore(85);
      setFinalScore(85);
      setStatus("lulus");
      setNotes("");
      setExamDate(new Date().toISOString().split("T")[0]);
    }
    setFormError(null);
  }, [editingExam, isOpen]);

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
        await onSubmit({
          id: editingExam.id,
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
      } else {
        await onSubmit({
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
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data ujian Tasmi'.");
    }
  };

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Simpan Penilaian
          </Button>
        </div>
      </form>
    </Modal>
  );
};
