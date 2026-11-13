import React, { useState } from "react";
import { GraduationCap, CheckCircle, Users } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { useGraduations, useProcessGraduation } from "../api/transfers.api";

interface AcademicYearOption {
  id: string;
  name: string;
}

interface ClassroomOption {
  id: string;
  name: string;
}

interface StudentGrade12Option {
  id: string;
  name: string;
  nisn?: string | null;
  classroomName?: string | null;
}

interface GraduationTabProps {
  academicYears: AcademicYearOption[];
  currentAcademicYearId?: string;
  grade12Students: StudentGrade12Option[];
  classrooms: ClassroomOption[];
}

export const GraduationTab: React.FC<GraduationTabProps> = ({
  academicYears,
  currentAcademicYearId,
  grade12Students,
}) => {
  const [selectedYearId, setSelectedYearId] = useState(currentAcademicYearId ?? academicYears[0]?.id ?? "");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: gradData, isLoading } = useGraduations({
    academicYearId: selectedYearId || undefined,
  });

  const batchGraduationMutation = useProcessGraduation();

  const handleSelectAll = () => {
    if (selectedStudentIds.length === grade12Students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(grade12Students.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleProcessBatch = () => {
    if (!selectedYearId || selectedStudentIds.length === 0) return;
    batchGraduationMutation.mutate(
      {
        academicYearId: selectedYearId,
        graduationDate,
        students: selectedStudentIds.map((studentId) => ({
          studentId,
          graduationStatus: "lulus" as const,
        })),
      },
      {
        onSuccess: () => {
          setSelectedStudentIds([]);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Batch Graduation Card */}
      <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-800">Yudisium & Kelulusan Massal Kelas XII</h3>
              <p className="text-xs text-slate-500">
                Pilih siswa kelas akhir untuk diproses status kelulusannya menjadi ALUMNI secara kolektif.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  TA {ay.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={graduationDate}
              onChange={(e) => setGraduationDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 border rounded bg-white text-slate-700 focus:outline-none"
            />
            <Button
              size="sm"
              variant="primary"
              disabled={selectedStudentIds.length === 0 || batchGraduationMutation.isPending}
              onClick={handleProcessBatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs whitespace-nowrap"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Proses Lulus ({selectedStudentIds.length})
            </Button>
          </div>
        </div>

        {grade12Students.length > 0 && (
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-2 pb-2 border-b text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Daftar Calon Lulusan ({grade12Students.length} siswa)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:underline font-medium"
              >
                {selectedStudentIds.length === grade12Students.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {grade12Students.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/60 border-indigo-200 text-indigo-900" : "hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleStudent(s.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="truncate">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{s.classroomName ?? "-"} | {s.nisn ?? "-"}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Graduation History Table */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-slate-800">Riwayat & Daftar Siswa Lulus</h4>
        {isLoading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Memuat data kelulusan...</p>
        ) : !gradData?.data || gradData.data.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded border">
            Belum ada data kelulusan tercatat pada tahun ajaran ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5 text-left">Nama Siswa</th>
                  <th className="px-3 py-2.5 text-left">NISN / NIS</th>
                  <th className="px-3 py-2.5 text-left">Kelas Terakhir</th>
                  <th className="px-3 py-2.5 text-left">Tanggal Lulus</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">No. Ijazah/SKL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {gradData.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{item.studentName}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500">{item.studentNisn ?? item.studentNis ?? "-"}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.classroomName ?? "-"}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.graduationDate}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="success" size="sm">
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-700">{item.certificateNumber ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
