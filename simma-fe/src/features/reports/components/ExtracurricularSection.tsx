import React from "react";
import { Award } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { StudentReportNotes } from "../types";

interface ExtracurricularSectionProps {
  notes?: StudentReportNotes;
}

export const ExtracurricularSection: React.FC<ExtracurricularSectionProps> = ({ notes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Extracurriculars */}
      <Card header="Kegiatan Ekstrakurikuler">
        {notes?.extracurriculars && notes.extracurriculars.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notes.extracurriculars.map((ekskul, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{ekskul.name}</p>
                  {ekskul.description && (
                    <p className="text-slate-500 text-[11px]">{ekskul.description}</p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                  {ekskul.score || "Baik"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">
            Belum ada catatan kegiatan ekstrakurikuler.
          </p>
        )}
      </Card>

      {/* Achievements */}
      <Card header="Prestasi Siswa">
        {notes?.achievements && notes.achievements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notes.achievements.map((ach, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2 text-xs">
                <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{ach.description}</p>
                  <span className="text-[10px] text-slate-400 uppercase">{ach.type || "Akademik"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">
            Belum ada catatan prestasi yang dicapai pada semester ini.
          </p>
        )}
      </Card>
    </div>
  );
};
