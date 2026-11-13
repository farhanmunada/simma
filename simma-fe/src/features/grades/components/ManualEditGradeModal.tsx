import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { calculateLetterGrade } from "../utils/grade-helpers";
import type { LetterGrade, CreateSemesterGradeDto } from "../types";

export interface EditingSemesterGradeItem {
  id: string;
  studentId: string;
  studentName: string;
  finalScore: number;
  letterGrade: LetterGrade;
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

interface ManualEditGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGrade: EditingSemesterGradeItem | null;
  onSave: (dto: CreateSemesterGradeDto) => Promise<void>;
  isLoading: boolean;
}

export const ManualEditGradeModal: React.FC<ManualEditGradeModalProps> = ({
  isOpen,
  onClose,
  editingGrade,
  onSave,
  isLoading,
}) => {
  const [editScoreInput, setEditScoreInput] = useState<number>(0);
  const [editLetterInput, setEditLetterInput] = useState<LetterGrade>("B");

  useEffect(() => {
    if (editingGrade) {
      setEditScoreInput(editingGrade.finalScore);
      setEditLetterInput(editingGrade.letterGrade);
    }
  }, [editingGrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    await onSave({
      studentId: editingGrade.studentId,
      classroomId: editingGrade.classroomId,
      subjectId: editingGrade.subjectId,
      semesterId: editingGrade.semesterId,
      finalScore: Number(editScoreInput),
      letterGrade: editLetterInput,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Koreksi Nilai Akhir Semester"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
          <p className="text-slate-500">Nama Siswa:</p>
          <p className="font-bold text-slate-800 text-sm">{editingGrade?.studentName}</p>
        </div>

        <Input
          label="Nilai Akhir (0 - 100)"
          type="number"
          min={0}
          max={100}
          step="any"
          value={editScoreInput}
          onChange={(e) => {
            const val = Number(e.target.value);
            setEditScoreInput(val);
            setEditLetterInput(calculateLetterGrade(val));
          }}
          required
        />

        <Select
          label="Predikat Huruf"
          value={editLetterInput}
          onChange={(e) => setEditLetterInput(e.target.value as LetterGrade)}
          options={[
            { value: "A", label: "A (Sangat Baik / >= 85)" },
            { value: "B", label: "B (Baik / >= 75)" },
            { value: "C", label: "C (Cukup / >= 60)" },
            { value: "D", label: "D (Kurang / < 60)" },
          ]}
          required
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Simpan Koreksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
