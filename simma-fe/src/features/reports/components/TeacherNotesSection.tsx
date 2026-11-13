import React from "react";
import { Card } from "../../../components/ui/Card";
import type { StudentReportNotes } from "../types";

interface TeacherNotesSectionProps {
  notes?: StudentReportNotes;
}

export const TeacherNotesSection: React.FC<TeacherNotesSectionProps> = ({ notes }) => {
  return (
    <Card header="Penilaian Sikap & Catatan Wali Kelas">
      <div className="space-y-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
          <span className="font-semibold text-slate-800 block mb-1">Catatan Wali Kelas:</span>
          <p className="text-slate-700 leading-relaxed italic">
            "{notes?.teacherNotes || "Tingkatkan terus prestasi dan semangat belajarmu."}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">Sikap Spiritual:</span>
            <p className="text-slate-600 leading-relaxed">
              {notes?.spiritualAttitude || "Menunjukkan ketaatan beribadah dan sikap berdoa dengan sangat baik."}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">Sikap Sosial:</span>
            <p className="text-slate-600 leading-relaxed">
              {notes?.socialAttitude || "Menunjukkan sikap santun, disiplin, peduli, dan tanggung jawab yang baik."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
