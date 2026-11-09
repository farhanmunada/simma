import React from "react";
import { Link } from "react-router";
import { Edit3, Trash2, FileEdit } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { formatAssessmentTypeLabel } from "../utils/grade-helpers";
import type { Assessment } from "../types";
import type { ReferenceItem } from "../hooks/useGradesReferences";

interface AssessmentsTableProps {
  assessments: Assessment[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  classrooms: ReferenceItem[];
  subjects: ReferenceItem[];
  onEdit: (item: Assessment) => void;
  onDelete: (id: string) => void;
}

export const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  isLoading,
  isError,
  error,
  classrooms,
  subjects,
  onEdit,
  onDelete,
}) => {
  const getClassName = (id: string) =>
    classrooms.find((c) => c.id === id)?.name ||
    classrooms.find((c) => c.id === id)?.code ||
    id;

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ||
    subjects.find((s) => s.id === id)?.code ||
    id;

  return (
    <Card>
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Memuat daftar penilaian...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-red-600 text-sm">
          Terjadi kesalahan: {(error as Error)?.message || "Gagal memuat data"}
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-sm">
          Belum ada rencana penilaian yang dibuat. Silakan tambahkan rencana penilaian baru.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Tipe</th>
                <th className="py-2.5 px-3 font-semibold">Judul Penilaian</th>
                <th className="py-2.5 px-3 font-semibold">Kelas</th>
                <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                <th className="py-2.5 px-3 font-semibold text-center">Skor Maks</th>
                <th className="py-2.5 px-3 font-semibold text-center">Bobot</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3">
                    <Badge variant="info">{formatAssessmentTypeLabel(item.type)}</Badge>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.title}</td>
                  <td className="py-2.5 px-3 text-slate-600">{getClassName(item.classroomId)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{getSubjectName(item.subjectId)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.maxScore}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.weight}x</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link to={`/grades/assessments/${item.id}/input`}>
                        <Button
                          size="sm"
                          variant="primary"
                          className="h-7 px-2.5 text-xs flex items-center gap-1"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Input Nilai</span>
                        </Button>
                      </Link>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="Ubah Rencana"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
