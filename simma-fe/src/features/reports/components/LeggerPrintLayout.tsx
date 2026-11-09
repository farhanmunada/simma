import React from "react";
import type { ClassroomLegger } from "../types";
import { formatSemesterType } from "../utils";

interface LeggerPrintLayoutProps {
  legger: ClassroomLegger;
}

export const LeggerPrintLayout: React.FC<LeggerPrintLayoutProps> = ({ legger }) => {
  return (
    <div className="hidden print:block text-slate-900 bg-white font-serif p-4 text-[10px]">
      {/* Header Kop */}
      <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider">
          KEMENTERIAN AGAMA REPUBLIK INDONESIA
        </h2>
        <h1 className="text-sm font-extrabold uppercase mt-0.5">
          BUKU LEGGER NILAI HASIL BELAJAR KELAS (RDM)
        </h1>
        <p className="text-[9px] text-slate-600 mt-0.5">
          Kelas: <span className="font-bold">{legger.classroom?.name}</span> | Semester:{" "}
          <span className="font-bold">{formatSemesterType(legger.semester?.type)}</span> | Tahun Ajaran:{" "}
          <span className="font-bold">{legger.academicYear?.name}</span> | Wali Kelas:{" "}
          <span className="font-bold">{legger.classroom?.homeroomTeacher?.fullName || "-"}</span>
        </p>
      </div>

      {/* Table Legger for Print */}
      <table className="w-full border-collapse border border-slate-900 text-[9px] mb-4">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-900">
            <th className="border border-slate-900 py-1 px-1 text-center w-6">No</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-16">NISN</th>
            <th className="border border-slate-900 py-1 px-2 text-left">Nama Siswa</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-6">L/P</th>

            {legger.subjects.map((sub) => (
              <th
                key={sub.id}
                className="border border-slate-900 py-1 px-1 text-center min-w-10"
              >
                {sub.code || sub.name}
              </th>
            ))}

            <th className="border border-slate-900 py-1 px-1 text-center w-10 font-bold">Total</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-10 font-bold">Rata²</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-8 font-bold">Rank</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-6">H</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-6">I</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-6">S</th>
            <th className="border border-slate-900 py-1 px-1 text-center w-6">A</th>
          </tr>
        </thead>
        <tbody>
          {legger.students.map((st, i) => {
            const map = new Map<string, number>();
            st.grades.forEach((g) => map.set(g.subjectId, g.score));

            return (
              <tr key={st.studentId}>
                <td className="border border-slate-900 py-1 px-1 text-center">{i + 1}</td>
                <td className="border border-slate-900 py-1 px-1 text-center font-mono">
                  {st.nisn || "-"}
                </td>
                <td className="border border-slate-900 py-1 px-2 font-medium">{st.fullName}</td>
                <td className="border border-slate-900 py-1 px-1 text-center">{st.gender}</td>

                {legger.subjects.map((sub) => {
                  const sc = map.get(sub.id);
                  return (
                    <td key={sub.id} className="border border-slate-900 py-1 px-1 text-center font-mono">
                      {sc !== undefined ? sc.toFixed(0) : "-"}
                    </td>
                  );
                })}

                <td className="border border-slate-900 py-1 px-1 text-center font-bold font-mono">
                  {st.totalScore.toFixed(0)}
                </td>
                <td className="border border-slate-900 py-1 px-1 text-center font-bold font-mono">
                  {st.averageScore.toFixed(1)}
                </td>
                <td className="border border-slate-900 py-1 px-1 text-center font-bold">
                  {st.rank}
                </td>
                <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.hadir ?? 0}</td>
                <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.izin ?? 0}</td>
                <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.sakit ?? 0}</td>
                <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.alpa ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Validation signatures */}
      <div className="grid grid-cols-2 gap-8 text-center text-[9.5px] mt-6">
        <div>
          <p>Mengetahui,</p>
          <p>Kepala Madrasah</p>
          <div className="h-14" />
          <p className="font-bold border-b border-slate-900 inline-block min-w-36">
            ..........................................
          </p>
          <p>NIP/NSM: ..............................</p>
        </div>

        <div>
          <p>Dibuat di, .........................</p>
          <p>Wali Kelas</p>
          <div className="h-14" />
          <p className="font-bold border-b border-slate-900 inline-block min-w-36">
            {legger.classroom?.homeroomTeacher?.fullName || "...................................."}
          </p>
          <p>NUPTK: {legger.classroom?.homeroomTeacher?.nuptk || "........................."}</p>
        </div>
      </div>
    </div>
  );
};
