import React from "react";
import { Sparkles, FileText } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { P5RA_PREDICATES, type P5raPredicate } from "@simma/shared";
import type { StudentAssessmentRow, P5raTargetItem } from "../types";

interface AssessmentRowProps {
  row: StudentAssessmentRow;
  index: number;
  targets: P5raTargetItem[];
  assessmentMap: Record<string, Record<string, P5raPredicate>>;
  notesMap: Record<string, string>;
  generatingNotesId: string | null;
  onPredicateChange: (studentId: string, targetId: string, predicate: P5raPredicate) => void;
  onNoteChange: (studentId: string, note: string) => void;
  onAutoGenerateNote: (studentId: string) => void;
  onViewReport: (studentId: string) => void;
}

export function AssessmentRow({
  row,
  index,
  targets,
  assessmentMap,
  notesMap,
  generatingNotesId,
  onPredicateChange,
  onNoteChange,
  onAutoGenerateNote,
  onViewReport,
}: AssessmentRowProps) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="p-3 text-center text-slate-400">{index + 1}</td>
      <td className="p-3">
        <span className="font-semibold text-slate-900 block">{row.student.fullName}</span>
        <span className="text-[10px] text-slate-400 block">
          {row.student.nisn || row.student.nis || "-"}
        </span>
      </td>
      <td className="p-3 text-slate-600">{row.classroom?.name || "-"}</td>

      {targets.map((tg) => {
        const currentVal = assessmentMap[row.student.id]?.[tg.id];
        return (
          <td key={tg.id} className="p-2 border-l border-slate-100 text-center">
            <div className="inline-flex rounded-md shadow-2xs border border-slate-200 overflow-hidden">
              {P5RA_PREDICATES.map((pred) => (
                <button
                  key={pred}
                  type="button"
                  onClick={() => onPredicateChange(row.student.id, tg.id, pred)}
                  className={`px-1.5 py-1 text-[11px] font-medium border-r border-slate-200 last:border-r-0 transition-colors ${
                    currentVal === pred
                      ? pred === "SAB"
                        ? "bg-emerald-600 text-white"
                        : pred === "BSH"
                        ? "bg-blue-600 text-white"
                        : pred === "SB"
                        ? "bg-amber-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                  title={pred}
                >
                  {pred}
                </button>
              ))}
            </div>
          </td>
        );
      })}

      <td className="p-2 border-l border-slate-100">
        <div className="flex items-center gap-1.5">
          <textarea
            value={notesMap[row.student.id] || ""}
            onChange={(e) => onNoteChange(row.student.id, e.target.value)}
            rows={2}
            className="w-full text-xs p-1.5 rounded border border-slate-200 focus:outline-none focus:border-emerald-500"
            placeholder="Deskripsi proses perkembangan siswa..."
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAutoGenerateNote(row.student.id)}
            isLoading={generatingNotesId === row.student.id}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50"
            title="Auto-generate narasi catatan dari predikat"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>

      <td className="p-2 text-center border-l border-slate-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onViewReport(row.student.id)}
          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
          title="Lihat Rapor Siswa"
        >
          <FileText className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
