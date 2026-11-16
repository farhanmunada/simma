import React from "react";
import { GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";
import type { Student } from "../types";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export interface StudentAcademicHistoryCardProps {
  student: Student;
}

export const StudentAcademicHistoryCard: React.FC<StudentAcademicHistoryCardProps> = ({
  student,
}) => {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <GraduationCap className="w-4 h-4 text-emerald-600" />
        <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">
          Status Rombel & Riwayat Akademik
        </h3>
      </div>

      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Kelas / Rombel Aktif</span>
            {student.classroom ? (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {student.classroom.name}
              </span>
            ) : (
              <span className="text-slate-400 italic">Belum ditempatkan</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tingkat Pendidikan</span>
            <span className="font-medium text-slate-700">
              {student.classroom ? `Kelas ${student.classroom.gradeLevel}` : "-"}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Sinkronisasi EMIS 4.0</span>
            <Badge variant={student.nisn ? "success" : "warning"} size="sm">
              {student.nisn ? "Terdaftar EMIS" : "Belum Sinkron"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            {student.nik.length === 16 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span>NIK Dukcapil Valid (16 Digit)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            {student.nisn ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span>Nomor Induk Siswa Nasional (NISN)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
