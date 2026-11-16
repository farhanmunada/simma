import React, { useState, useEffect } from "react";
import type {
  TahfidzRecord,
  TahfidzType,
  TahfidzStatus,
  CreateTahfidzRecordDto,
  UpdateTahfidzRecordDto,
} from "../types";
import { QURAN_SURAHS } from "../utils";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export interface TahfidzEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTahfidzRecordDto | (UpdateTahfidzRecordDto & { id: string })) => Promise<void>;
  editingRecord?: TahfidzRecord | null;
  isSubmitting?: boolean;
}

export const TahfidzEntryForm: React.FC<TahfidzEntryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  isSubmitting = false,
}) => {
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<TahfidzType>("Z");
  const [juz, setJuz] = useState(30);
  const [surah, setSurah] = useState(78);
  const [ayahStart, setAyahStart] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(10);
  const [tajwidScore, setTajwidScore] = useState(85);
  const [makhrojScore, setMakhrojScore] = useState(85);
  const [fluencyScore, setFluencyScore] = useState(85);
  const [status, setStatus] = useState<TahfidzStatus>("lulus");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRecord) {
      setStudentId(editingRecord.studentId);
      setType(editingRecord.type);
      setJuz(editingRecord.juz);
      setSurah(editingRecord.surah);
      setAyahStart(editingRecord.ayahStart);
      setAyahEnd(editingRecord.ayahEnd);
      setTajwidScore(editingRecord.tajwidScore);
      setMakhrojScore(editingRecord.makhrojScore);
      setFluencyScore(editingRecord.fluencyScore);
      setStatus(editingRecord.status);
      setNotes(editingRecord.notes || "");
      setDate(editingRecord.date);
    } else {
      setStudentId("");
      setType("Z");
      setJuz(30);
      setSurah(78);
      setAyahStart(1);
      setAyahEnd(10);
      setTajwidScore(85);
      setMakhrojScore(85);
      setFluencyScore(85);
      setStatus("lulus");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    }
    setFormError(null);
  }, [editingRecord, isOpen]);

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
    if (surah < 1 || surah > 114) {
      setFormError("Nomor surah harus di antara 1 sampai 114.");
      return;
    }
    if (ayahStart <= 0 || ayahEnd <= 0) {
      setFormError("Nomor ayat harus lebih besar dari 0.");
      return;
    }
    if (ayahStart > ayahEnd) {
      setFormError("Ayat awal tidak boleh lebih besar dari ayat akhir.");
      return;
    }
    if (
      tajwidScore < 0 ||
      tajwidScore > 100 ||
      makhrojScore < 0 ||
      makhrojScore > 100 ||
      fluencyScore < 0 ||
      fluencyScore > 100
    ) {
      setFormError("Skor penilaian harus dalam rentang 0 - 100.");
      return;
    }

    try {
      const payload = {
        studentId: studentId.trim(),
        type,
        juz,
        surah,
        ayahStart,
        ayahEnd,
        tajwidScore,
        makhrojScore,
        fluencyScore,
        status,
        notes: notes.trim() || null,
        date,
      };

      if (editingRecord) {
        await onSubmit({ ...payload, id: editingRecord.id });
      } else {
        await onSubmit(payload);
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data setoran.");
    }
  };

  const surahOptions = QURAN_SURAHS.map((s) => ({
    value: s.number,
    label: `${s.number}. ${s.name} (${s.totalAyahs} ayat)`,
  }));

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? "Edit Setoran Hafalan" : "Tambah Setoran Hafalan"}
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
            label="Tanggal Setoran"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipe Setoran"
            value={type}
            onChange={(e) => setType(e.target.value as TahfidzType)}
            options={[
              { value: "Z", label: "Ziyadah (Setoran Baru)" },
              { value: "M", label: "Muraja'ah (Pengulangan)" },
            ]}
          />
          <Select
            label="Juz"
            value={juz}
            onChange={(e) => setJuz(parseInt(e.target.value, 10))}
            options={juzOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Select
              label="Surah"
              value={surah}
              onChange={(e) => setSurah(parseInt(e.target.value, 10))}
              options={surahOptions}
            />
          </div>
          <Input
            type="number"
            label="Ayat Mulai"
            min={1}
            value={ayahStart}
            onChange={(e) => setAyahStart(parseInt(e.target.value, 10) || 1)}
            required
          />
          <Input
            type="number"
            label="Ayat Selesai"
            min={1}
            value={ayahEnd}
            onChange={(e) => setAyahEnd(parseInt(e.target.value, 10) || 1)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="number"
            label="Skor Tajwid (0-100)"
            min={0}
            max={100}
            value={tajwidScore}
            onChange={(e) => setTajwidScore(parseInt(e.target.value, 10) || 0)}
            required
          />
          <Input
            type="number"
            label="Skor Makhroj (0-100)"
            min={0}
            max={100}
            value={makhrojScore}
            onChange={(e) => setMakhrojScore(parseInt(e.target.value, 10) || 0)}
            required
          />
          <Input
            type="number"
            label="Skor Kelancaran (0-100)"
            min={0}
            max={100}
            value={fluencyScore}
            onChange={(e) => setFluencyScore(parseInt(e.target.value, 10) || 0)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status Kelulusan"
            value={status}
            onChange={(e) => setStatus(e.target.value as TahfidzStatus)}
            options={[
              { value: "lulus", label: "Lulus" },
              { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
            ]}
          />
          <Input
            label="Catatan Guru / Pembimbing"
            placeholder="Contoh: Perhatikan mad wajib dan ghunnah"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
          >
            Simpan Setoran
          </Button>
        </div>
      </form>
    </Modal>
  );
};
