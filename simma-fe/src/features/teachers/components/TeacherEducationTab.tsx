import React, { useState } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import type { TeacherEducationDto } from "../types";
import { useAddEducation, useDeleteEducation } from "../api/teachers.api";

interface TeacherEducationTabProps {
  teacherId: string;
  educations: TeacherEducationDto[];
}

export const TeacherEducationTab: React.FC<TeacherEducationTabProps> = ({ teacherId, educations }) => {
  const addEdu = useAddEducation(teacherId);
  const delEdu = useDeleteEducation(teacherId);

  const [eduLevel, setEduLevel] = useState("S1");
  const [eduInst, setEduInst] = useState("");
  const [eduMajor, setEduMajor] = useState("");
  const [eduYear, setEduYear] = useState(2020);

  const handleCreateEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInst || !eduMajor) return;
    await addEdu.mutateAsync({
      level: eduLevel as any,
      institution: eduInst,
      major: eduMajor,
      graduationYear: Number(eduYear),
      isLinear: true,
    });
    setEduInst("");
    setEduMajor("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateEdu} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-wrap gap-2 items-center text-sm">
        <select value={eduLevel} onChange={(e) => setEduLevel(e.target.value)} className="px-2 py-1.5 border rounded bg-white text-xs">
          <option value="D3">D3</option>
          <option value="D4">D4</option>
          <option value="S1">S1</option>
          <option value="S2">S2</option>
          <option value="S3">S3</option>
        </select>
        <input type="text" placeholder="Nama Kampus/Institusi" value={eduInst} onChange={(e) => setEduInst(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[140px]" required />
        <input type="text" placeholder="Jurusan/Prodi" value={eduMajor} onChange={(e) => setEduMajor(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[120px]" required />
        <input type="number" placeholder="Tahun" value={eduYear} onChange={(e) => setEduYear(Number(e.target.value))} className="w-20 px-2 py-1.5 border rounded text-xs" required />
        <button type="submit" disabled={addEdu.isPending} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium flex items-center gap-1 hover:bg-emerald-700">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </form>
      <div className="divide-y divide-gray-100">
        {educations.map((ed) => (
          <div key={ed.id} className="py-2.5 flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-gray-800">{ed.level} {ed.major}</span>
              <p className="text-xs text-gray-500">{ed.institution} • Lulus {ed.graduationYear}</p>
            </div>
            <button onClick={() => delEdu.mutate(ed.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {educations.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Belum ada riwayat pendidikan terdata.</p>}
      </div>
    </div>
  );
};
