import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TeacherScopeType } from "@simma/shared";
import { useClassrooms, useSubjects } from "../../../settings/api/settings.api";
import { useExtracurriculars } from "../../../extracurricular/api/extracurricular.api";

export interface TeacherEnrolmentFormState {
  homeroomClassroomId: string;
  subjectAssignments: Array<{ classroomId: string; subjectId: string }>;
  extracurricularIds: string[];
  classroomScopes: Array<{ classroomId: string; scopeType: TeacherScopeType }>;
}

interface Props {
  data: TeacherEnrolmentFormState;
  onChange: (next: TeacherEnrolmentFormState) => void;
}

export const TeacherEnrolmentTab: React.FC<Props> = ({ data, onChange }) => {
  const { data: classrooms = [] } = useClassrooms();
  const { data: subjects = [] } = useSubjects();
  const { data: ekskulRes } = useExtracurriculars();
  const extracurriculars = ekskulRes?.data ?? [];

  const [pickClassId, setPickClassId] = useState("");
  const [pickSubjectId, setPickSubjectId] = useState("");

  const addSubjectPair = () => {
    if (!pickClassId || !pickSubjectId) return;
    const exists = data.subjectAssignments.some(
      (a) => a.classroomId === pickClassId && a.subjectId === pickSubjectId,
    );
    if (exists) return;
    onChange({
      ...data,
      subjectAssignments: [
        ...data.subjectAssignments,
        { classroomId: pickClassId, subjectId: pickSubjectId },
      ],
    });
  };

  const removeSubjectPair = (idx: number) => {
    onChange({
      ...data,
      subjectAssignments: data.subjectAssignments.filter((_, i) => i !== idx),
    });
  };

  const toggleEkskul = (id: string) => {
    const exists = data.extracurricularIds.includes(id);
    onChange({
      ...data,
      extracurricularIds: exists
        ? data.extracurricularIds.filter((e) => e !== id)
        : [...data.extracurricularIds, id],
    });
  };

  const classMap = new Map(classrooms.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-5">
      {/* 1. Wali Kelas */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700">
          Delegasi Wali Kelas (Semester Aktif)
        </label>
        <select
          value={data.homeroomClassroomId}
          onChange={(e) => onChange({ ...data, homeroomClassroomId: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
        >
          <option value="">-- Tidak Menjabat Wali Kelas --</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (Tingkat {c.gradeLevel})
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500">
          Wali kelas hanya dapat mengakses legger, catatan wali, dan cetak rapor kelas yang dipilih di sini.
        </p>
      </div>

      {/* 2. Guru Mapel (Kelas + Mata Pelajaran) */}
      <div className="pt-3 border-t border-gray-100 space-y-2.5">
        <label className="block text-xs font-semibold text-gray-700">
          Delegasi Guru Mapel / Diniyah (Kombinasi Kelas &amp; Mata Pelajaran)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={pickClassId}
            onChange={(e) => setPickClassId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- Pilih Kelas --</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={pickSubjectId}
            onChange={(e) => setPickSubjectId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addSubjectPair}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>

        {data.subjectAssignments.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.subjectAssignments.map((pair, idx) => (
              <span
                key={`${pair.classroomId}-${pair.subjectId}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium"
              >
                <span>
                  {classMap.get(pair.classroomId) || "Kelas"} &bull;{" "}
                  {subjectMap.get(pair.subjectId) || "Mapel"}
                </span>
                <button
                  type="button"
                  onClick={() => removeSubjectPair(idx)}
                  className="text-emerald-700 hover:text-red-600"
                  title="Hapus penugasan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Belum ada mapel/kelas yang didelegasikan.</p>
        )}
      </div>

      {/* 3. Pembina Ekstrakurikuler */}
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          Delegasi Pembina Ekstrakurikuler
        </label>
        {extracurriculars.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Belum ada data master ekstrakurikuler.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
            {extracurriculars.map((eks) => (
              <label
                key={eks.id}
                className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={data.extracurricularIds.includes(eks.id)}
                  onChange={() => toggleEkskul(eks.id)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="truncate">{eks.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
