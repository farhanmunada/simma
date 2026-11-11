import React, { useState, useEffect } from "react";
import { Save, Filter, Wand2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import type {
  ExtracurricularItem,
  ExtracurricularMemberItem,
  ExtracurricularGradeScore,
  BatchUpsertExtracurricularGradesInput,
} from "../types";
import { EXTRACURRICULAR_GRADES, EXTRACURRICULAR_PREDICATE_LABELS } from "@simma/shared";

interface Props {
  members: ExtracurricularMemberItem[];
  extracurriculars: ExtracurricularItem[];
  onBatchSave: (data: BatchUpsertExtracurricularGradesInput) => void;
  isSaving: boolean;
  isLoading: boolean;
}

interface GradeRowState {
  memberId: string;
  studentName: string;
  studentNis: string;
  ekskulName: string;
  academicYearId: string;
  semester: "ganjil" | "genap";
  score: ExtracurricularGradeScore;
  notes: string;
}

export const ExtracurricularGradesTab: React.FC<Props> = ({
  members,
  extracurriculars,
  onBatchSave,
  isSaving,
  isLoading,
}) => {
  const [selectedEkskul, setSelectedEkskul] = useState<string>("ALL");
  const [gradeRows, setGradeRows] = useState<Record<string, GradeRowState>>({});

  useEffect(() => {
    const initial: Record<string, GradeRowState> = {};
    for (const m of members) {
      initial[m.id] = {
        memberId: m.id,
        studentName: m.studentName || "Santri",
        studentNis: m.studentNisn || m.studentNis || "-",
        ekskulName: m.extracurricularName || "Ekstrakurikuler",
        academicYearId: m.academicYearId,
        semester: m.semester,
        score: (m.gradeScore as ExtracurricularGradeScore) || "A",
        notes: m.gradeNotes || `Menunjukkan kedisiplinan dan capaian yang sangat baik dalam kegiatan ${m.extracurricularName || ""}.`,
      };
    }
    setGradeRows(initial);
  }, [members]);

  const handleScoreChange = (memberId: string, score: ExtracurricularGradeScore) => {
    setGradeRows((prev) => {
      const cur = prev[memberId];
      if (!cur) return prev;
      let template = cur.notes;
      if (score === "A") {
        template = `Sangat aktif, berprestasi, dan menunjukkan kepemimpinan yang handal dalam kegiatan ${cur.ekskulName}.`;
      } else if (score === "B") {
        template = `Aktif, disiplin, dan mampu bekerja sama dengan baik dalam tim kegiatan ${cur.ekskulName}.`;
      } else if (score === "C") {
        template = `Cukup aktif mengikuti latihan rutin dalam kegiatan ${cur.ekskulName}.`;
      } else if (score === "D") {
        template = `Perlu meningkatkan kehadiran dan kedisiplinan dalam kegiatan ${cur.ekskulName}.`;
      }
      return {
        ...prev,
        [memberId]: { ...cur, score, notes: template },
      };
    });
  };

  const handleNotesChange = (memberId: string, notes: string) => {
    setGradeRows((prev) => {
      const cur = prev[memberId];
      if (!cur) return prev;
      return { ...prev, [memberId]: { ...cur, notes } };
    });
  };

  const handleSaveAll = () => {
    const activeFiltered = members.filter(
      (m) => selectedEkskul === "ALL" || m.extracurricularId === selectedEkskul
    );
    const items = activeFiltered.map((m) => {
      const state = gradeRows[m.id] || {
        score: "A",
        notes: "Sangat baik",
      };
      return {
        extracurricularMemberId: m.id,
        academicYearId: m.academicYearId,
        semester: m.semester,
        score: state.score,
        notes: state.notes,
      };
    });

    if (items.length > 0) {
      onBatchSave({ items });
    }
  };

  const filteredMembers = members.filter(
    (m) => selectedEkskul === "ALL" || m.extracurricularId === selectedEkskul
  );

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedEkskul}
            onChange={(e) => setSelectedEkskul(e.target.value)}
            aria-label="Pilih Ekstrakurikuler Penilaian"
            className="h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Ekstrakurikuler ({members.length} Siswa)</option>
            {extracurriculars.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleSaveAll} isLoading={isSaving} disabled={filteredMembers.length === 0} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-1.5" />
          Simpan Seluruh Nilai RDM
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 w-1/4">Santri & Ekskul</th>
                <th className="px-4 py-3 text-center w-40">Predikat RDM</th>
                <th className="px-4 py-3">Deskripsi Capaian Kompetensi (Rapor RDM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    Memuat matriks penilaian...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada siswa untuk dinilai pada filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const state = gradeRows[m.id] || {
                    score: "A" as ExtracurricularGradeScore,
                    notes: "",
                  };

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-900">{m.studentName || "Santri"}</div>
                        <div className="text-xs text-slate-400 font-mono">{m.studentNis || "-"}</div>
                        <Badge variant="neutral" size="sm" className="mt-1">
                          {m.extracurricularName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                          {EXTRACURRICULAR_GRADES.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleScoreChange(m.id, g)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                                state.score === g
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-1">
                          {EXTRACURRICULAR_PREDICATE_LABELS[state.score]}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="relative">
                          <textarea
                            rows={2}
                            aria-label={`Deskripsi capaian rapor untuk ${m.studentName || "Santri"}`}
                            value={state.notes}
                            onChange={(e) => handleNotesChange(m.id, e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            placeholder="Tuliskan catatan deskripsi capaian rapor siswa..."
                          />
                          <button
                            type="button"
                            onClick={() => handleScoreChange(m.id, state.score)}
                            className="absolute right-2 bottom-3 text-slate-400 hover:text-emerald-600"
                            title="Reset template narasi otomatis"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
