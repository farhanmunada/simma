import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import type {
  StudentReportCard,
  ExtracurricularItem,
  AchievementItem,
  ReportNotesBodyInput,
} from "../types";
import { useSaveStudentNotes } from "../api/reports.api";

interface EditNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: StudentReportCard;
  selectedStudentId: string;
  selectedSemesterId: string;
  selectedClassroomId: string;
}

export const EditNotesModal: React.FC<EditNotesModalProps> = ({
  isOpen,
  onClose,
  report,
  selectedStudentId,
  selectedSemesterId,
  selectedClassroomId,
}) => {
  const [teacherNotes, setTeacherNotes] = useState("");
  const [spiritualAttitude, setSpiritualAttitude] = useState("");
  const [socialAttitude, setSocialAttitude] = useState("");
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  const saveNotesMutation = useSaveStudentNotes();

  useEffect(() => {
    if (report?.notes) {
      setTeacherNotes(report.notes.teacherNotes || "");
      setSpiritualAttitude(report.notes.spiritualAttitude || "");
      setSocialAttitude(report.notes.socialAttitude || "");
      setExtracurriculars(
        report.notes.extracurriculars ? [...report.notes.extracurriculars] : []
      );
      setAchievements(
        report.notes.achievements ? [...report.notes.achievements] : []
      );
    } else {
      setTeacherNotes("");
      setSpiritualAttitude("");
      setSocialAttitude("");
      setExtracurriculars([]);
      setAchievements([]);
    }
  }, [report, isOpen]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSemesterId) return;

    const payload: ReportNotesBodyInput = {
      semesterId: selectedSemesterId,
      classroomId: selectedClassroomId,
      teacherNotes,
      spiritualAttitude: spiritualAttitude || undefined,
      socialAttitude: socialAttitude || undefined,
      extracurriculars: extracurriculars.filter((item) => item.name.trim() !== ""),
      achievements: achievements.filter((item) => item.description.trim() !== ""),
    };

    try {
      await saveNotesMutation.mutateAsync({
        studentId: selectedStudentId,
        data: payload,
      });
      onClose();
    } catch {
      // Handled by mutation toast / error boundary
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Catatan & Penilaian Sikap - ${report?.student.fullName || ""}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
        {/* Catatan Wali Kelas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Wali Kelas <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={teacherNotes}
            onChange={(e) => setTeacherNotes(e.target.value)}
            placeholder="Tuliskan catatan motivasi, perkembangan belajar, dan saran bagi peserta didik..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
          />
        </div>

        {/* Sikap Spiritual */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sikap Spiritual
          </label>
          <textarea
            rows={2}
            value={spiritualAttitude}
            onChange={(e) => setSpiritualAttitude(e.target.value)}
            placeholder="Deskripsi capaian sikap spiritual (ketaatan ibadah, doa, toleransi)..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
          />
        </div>

        {/* Sikap Sosial */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sikap Sosial
          </label>
          <textarea
            rows={2}
            value={socialAttitude}
            onChange={(e) => setSocialAttitude(e.target.value)}
            placeholder="Deskripsi capaian sikap sosial (kejujuran, disiplin, santun, gotong royong)..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
          />
        </div>

        {/* Ekstrakurikuler Builder */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">Kegiatan Ekstrakurikuler</span>
            <button
              type="button"
              onClick={() =>
                setExtracurriculars((prev) => [
                  ...prev,
                  { name: "", score: "Baik", description: "" },
                ])
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Ekstrakurikuler
            </button>
          </div>

          <div className="space-y-2">
            {extracurriculars.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...extracurriculars];
                    updated[idx].name = e.target.value;
                    setExtracurriculars(updated);
                  }}
                  placeholder="Nama ekskul (e.g. Pramuka, PMR)"
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <select
                  value={item.score || "Baik"}
                  onChange={(e) => {
                    const updated = [...extracurriculars];
                    updated[idx].score = e.target.value;
                    setExtracurriculars(updated);
                  }}
                  className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs bg-white"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                </select>
                <input
                  type="text"
                  value={item.description || ""}
                  onChange={(e) => {
                    const updated = [...extracurriculars];
                    updated[idx].description = e.target.value;
                    setExtracurriculars(updated);
                  }}
                  placeholder="Keterangan singkat"
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setExtracurriculars((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {extracurriculars.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">Belum ada baris ekstrakurikuler.</p>
            )}
          </div>
        </div>

        {/* Prestasi Builder */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">Prestasi Siswa</span>
            <button
              type="button"
              onClick={() =>
                setAchievements((prev) => [
                  ...prev,
                  { description: "", type: "Akademik" },
                ])
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Prestasi
            </button>
          </div>

          <div className="space-y-2">
            {achievements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={item.type || "Akademik"}
                  onChange={(e) => {
                    const updated = [...achievements];
                    updated[idx].type = e.target.value;
                    setAchievements(updated);
                  }}
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs bg-white"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Non-Akademik">Non-Akademik</option>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Seni / Olahraga">Seni / Olahraga</option>
                </select>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...achievements];
                    updated[idx].description = e.target.value;
                    setAchievements(updated);
                  }}
                  placeholder="Uraian prestasi (e.g. Juara 1 KSM Matematika)"
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAchievements((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">Belum ada baris prestasi.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={saveNotesMutation.isPending}
          >
            Simpan Catatan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
