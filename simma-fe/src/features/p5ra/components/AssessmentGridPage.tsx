import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Save, Check } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { StudentReportModal } from "./StudentReportModal";
import { AssessmentRow } from "./AssessmentRow";
import {
  useP5raProjectDetail,
  useP5raAssessments,
  useSaveBatchAssessments,
  useSaveStudentNotes,
  generateStudentNotes,
} from "../api/p5ra.api";
import type { P5raPredicate } from "@simma/shared";

export const AssessmentGridPage: React.FC = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [activeReportStudentId, setActiveReportStudentId] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const { data: project } = useP5raProjectDetail(projectId);
  const { data: studentRows = [], isLoading } = useP5raAssessments(
    projectId,
    selectedClassroomId || undefined
  );

  const [assessmentMap, setAssessmentMap] = useState<
    Record<string, Record<string, P5raPredicate>>
  >({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [generatingNotesId, setGeneratingNotesId] = useState<string | null>(null);

  const saveBatchMutation = useSaveBatchAssessments(projectId);
  const saveNotesMutation = useSaveStudentNotes(projectId);

  useEffect(() => {
    if (studentRows.length > 0) {
      const initialAssessments: Record<string, Record<string, P5raPredicate>> = {};
      const initialNotes: Record<string, string> = {};

      studentRows.forEach((row) => {
        initialAssessments[row.student.id] = {};
        row.assessments?.forEach((a) => {
          initialAssessments[row.student.id][a.targetId] = a.predicate;
        });
        if (row.processNotes) {
          initialNotes[row.student.id] = row.processNotes.processNotes;
        }
      });

      setAssessmentMap(initialAssessments);
      setNotesMap(initialNotes);
    }
  }, [studentRows]);

  const handlePredicateChange = (
    studentId: string,
    targetId: string,
    predicate: P5raPredicate
  ) => {
    setAssessmentMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [targetId]: predicate,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotesMap((prev) => ({
      ...prev,
      [studentId]: note,
    }));
  };

  const handleAutoGenerateNote = async (studentId: string) => {
    try {
      setGeneratingNotesId(studentId);
      const res = await generateStudentNotes(projectId, studentId);
      if (res?.processNotes) {
        handleNoteChange(studentId, res.processNotes);
      }
    } catch (err) {
      console.error("Gagal men-generate catatan:", err);
    } finally {
      setGeneratingNotesId(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSavedSuccess(false);
      const itemsToSave: Array<{
        targetId: string;
        studentId: string;
        predicate: P5raPredicate;
      }> = [];

      Object.entries(assessmentMap).forEach(([stId, targets]) => {
        Object.entries(targets).forEach(([tgId, pred]) => {
          if (pred) {
            itemsToSave.push({
              studentId: stId,
              targetId: tgId,
              predicate: pred,
            });
          }
        });
      });

      if (itemsToSave.length > 0) {
        await saveBatchMutation.mutateAsync(itemsToSave);
      }

      // Save student notes
      for (const [stId, noteText] of Object.entries(notesMap)) {
        if (noteText?.trim()) {
          await saveNotesMutation.mutateAsync({
            studentId: stId,
            processNotes: noteText.trim(),
          });
        }
      }

      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal menyimpan penilaian:", err);
    }
  };

  const targets = project?.targets || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to={`/p5ra/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Detail Projek
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Input Penilaian & Asesmen P5RA
          </h1>
          <p className="text-xs text-slate-500">
            {project?.title} • Fase {project?.targetFase} ({targets.length} Target Capaian)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project?.classrooms && project.classrooms.length > 0 && (
            <div className="w-44">
              <Select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                options={[
                  { label: "Semua Rombel", value: "" },
                  ...project.classrooms.map((c) => ({ label: c.name, value: c.id })),
                ]}
              />
            </div>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAll}
            isLoading={saveBatchMutation.isPending || saveNotesMutation.isPending}
            className="gap-1.5 text-xs font-semibold"
          >
            {isSavedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                Tersimpan!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Penilaian
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          Memuat daftar siswa dan lembar asesmen...
        </div>
      ) : targets.length === 0 ? (
        <div className="p-8 text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
          Belum ada target capaian dimensi yang ditambahkan ke projek ini. Silakan tambahkan target capaian di halaman detail projek terlebih dahulu.
        </div>
      ) : studentRows.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
          Tidak ada siswa yang terdaftar pada rombel projek ini.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 w-48">Nama Siswa</th>
                <th className="p-3 w-24">Kelas</th>
                {targets.map((tg, idx) => (
                  <th key={tg.id} className="p-3 w-44 text-center border-l border-slate-200">
                    <span className="block font-bold text-slate-800">Target #{idx + 1}</span>
                    <span className="block text-[10px] text-slate-500 font-normal truncate" title={tg.subElement}>
                      {tg.subElement}
                    </span>
                  </th>
                ))}
                <th className="p-3 w-64 border-l border-slate-200">Catatan Proses</th>
                <th className="p-3 w-20 text-center border-l border-slate-200">Aksi</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-slate-100">
              {studentRows.map((row, idx) => (
                <AssessmentRow
                  key={row.student.id}
                  row={row}
                  index={idx}
                  targets={targets}
                  assessmentMap={assessmentMap}
                  notesMap={notesMap}
                  generatingNotesId={generatingNotesId}
                  onPredicateChange={handlePredicateChange}
                  onNoteChange={handleNoteChange}
                  onAutoGenerateNote={handleAutoGenerateNote}
                  onViewReport={setActiveReportStudentId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReportStudentId && (
        <StudentReportModal
          isOpen={Boolean(activeReportStudentId)}
          onClose={() => setActiveReportStudentId(null)}
          projectId={projectId}
          studentId={activeReportStudentId}
        />
      )}
    </div>
  );
};
