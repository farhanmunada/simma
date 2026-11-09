import React from "react";
import type { StudentReportCard, StudentReportGrade } from "../types";
import { formatSemesterType } from "../utils";

interface ReportCardPrintLayoutProps {
  report: StudentReportCard;
}

export const ReportCardPrintLayout: React.FC<ReportCardPrintLayoutProps> = ({ report }) => {
  const groupedGrades = React.useMemo(() => {
    const groups: Record<string, StudentReportGrade[]> = {};
    report.grades.forEach((g) => {
      const key = g.group || "A";
      if (!groups[key]) groups[key] = [];
      groups[key].push(g);
    });
    return groups;
  }, [report.grades]);

  return (
    <div className="hidden print:block text-slate-900 bg-white font-serif p-6">
      {/* Official Letterhead / Kop Surat */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h2 className="text-sm font-bold tracking-wider uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
        <h1 className="text-base font-extrabold uppercase mt-0.5">{report.institution.name}</h1>
        <p className="text-[10px] text-slate-700 mt-0.5">{report.institution.address}</p>
        <p className="text-[10px] text-slate-700">
          NSM: {report.institution.nsm} | NPSN: {report.institution.npsn}
        </p>
      </div>

      {/* Document Title */}
      <div className="text-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wide">
          LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
        </h3>
      </div>

      {/* Student & School Metadata */}
      <div className="grid grid-cols-2 gap-4 text-[10.5px] mb-4">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-28 py-0.5">Nama Peserta Didik</td>
              <td className="w-3">:</td>
              <td className="font-bold">{report.student.fullName}</td>
            </tr>
            <tr>
              <td className="py-0.5">NISN / NIS</td>
              <td>:</td>
              <td>{report.student.nisn || "-"} / {report.student.nis || "-"}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tempat, Tgl Lahir</td>
              <td>:</td>
              <td>{report.student.birthPlace}, {report.student.birthDate}</td>
            </tr>
            <tr>
              <td className="py-0.5">Jenis Kelamin</td>
              <td>:</td>
              <td>{report.student.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-28 py-0.5">Madrasah</td>
              <td className="w-3">:</td>
              <td>{report.institution.name}</td>
            </tr>
            <tr>
              <td className="py-0.5">Kelas / Semester</td>
              <td>:</td>
              <td>{report.classroom.name} / {formatSemesterType(report.semester.type)}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tahun Pelajaran</td>
              <td>:</td>
              <td>{report.academicYear.name}</td>
            </tr>
            <tr>
              <td className="py-0.5">Wali Kelas</td>
              <td>:</td>
              <td>{report.classroom.homeroomTeacher?.fullName || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table Capaian Hasil Belajar */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold mb-1">A. Capaian Kompetensi Hasil Belajar</h4>
        <table className="w-full border-collapse border border-slate-900 text-[10px]">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-900">
              <th className="border border-slate-900 py-1.5 px-2 w-8 text-center">No</th>
              <th className="border border-slate-900 py-1.5 px-2">Mata Pelajaran</th>
              <th className="border border-slate-900 py-1.5 px-2 w-14 text-center">Nilai</th>
              <th className="border border-slate-900 py-1.5 px-2 w-14 text-center">Predikat</th>
              <th className="border border-slate-900 py-1.5 px-2">Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedGrades).map(([grp, items]) => (
              <React.Fragment key={grp}>
                <tr className="font-bold bg-slate-50">
                  <td colSpan={5} className="border border-slate-900 py-1 px-2">
                    Kelompok: {grp}
                  </td>
                </tr>
                {items.map((it, idx) => (
                  <tr key={it.subjectId}>
                    <td className="border border-slate-900 py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 py-1 px-2 font-medium">{it.subjectName}</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                      {it.finalScore.toFixed(0)}
                    </td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-bold">{it.letterGrade}</td>
                    <td className="border border-slate-900 py-1 px-2 leading-tight">{it.description}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Ekstrakurikuler & Kehadiran */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
        <div>
          <h4 className="text-[11px] font-bold mb-1">B. Kegiatan Ekstrakurikuler</h4>
          <table className="w-full border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="border border-slate-900 py-1 px-2 w-8 text-center">No</th>
                <th className="border border-slate-900 py-1 px-2">Kegiatan</th>
                <th className="border border-slate-900 py-1 px-2 w-16 text-center">Nilai</th>
                <th className="border border-slate-900 py-1 px-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {report.notes?.extracurriculars && report.notes.extracurriculars.length > 0 ? (
                report.notes.extracurriculars.map((ek, i) => (
                  <tr key={i}>
                    <td className="border border-slate-900 py-1 px-2 text-center">{i + 1}</td>
                    <td className="border border-slate-900 py-1 px-2">{ek.name}</td>
                    <td className="border border-slate-900 py-1 px-2 text-center">{ek.score || "Baik"}</td>
                    <td className="border border-slate-900 py-1 px-2">{ek.description || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-slate-900 py-2 text-center italic">
                    - Tidak ada catatan -
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-[11px] font-bold mb-1">C. Ketidakhadiran</h4>
          <table className="w-full border-collapse border border-slate-900">
            <tbody>
              <tr>
                <td className="border border-slate-900 py-1 px-2 w-32">Sakit (S)</td>
                <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                  {report.attendance?.sakit ?? 0} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 py-1 px-2">Izin (I)</td>
                <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                  {report.attendance?.izin ?? 0} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 py-1 px-2">Tanpa Keterangan (A)</td>
                <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                  {report.attendance?.alpa ?? 0} hari
                </td>
              </tr>
            </tbody>
          </table>

          {report.tahfidz && (
            <div className="mt-2 text-[9.5px]">
              <span className="font-bold">Capaian Tahfidz:</span> {report.tahfidz.totalJuz} Juz dihafal (Ujian Tasmi' Lulus: {report.tahfidz.passedExamsCount})
            </div>
          )}
        </div>
      </div>

      {/* Notes & Attitudes */}
      <div className="border border-slate-900 p-2 mb-6 text-[10px]">
        <h4 className="font-bold mb-1">D. Catatan Wali Kelas:</h4>
        <p className="italic mb-2">"{report.notes?.teacherNotes || "Tingkatkan terus prestasi dan semangat belajarmu."}"</p>
        {report.notes?.spiritualAttitude && (
          <p className="mb-1"><span className="font-semibold">Sikap Spiritual:</span> {report.notes.spiritualAttitude}</p>
        )}
        {report.notes?.socialAttitude && (
          <p><span className="font-semibold">Sikap Sosial:</span> {report.notes.socialAttitude}</p>
        )}
      </div>

      {/* Validation & Signatures */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-6">
        <div>
          <p>Mengetahui,</p>
          <p>Orang Tua / Wali Siswa</p>
          <div className="h-16" />
          <p className="font-bold border-b border-slate-900 inline-block min-w-32">
            ..........................................
          </p>
        </div>

        <div>
          <p>&nbsp;</p>
          <p>Wali Kelas</p>
          <div className="h-16" />
          <p className="font-bold border-b border-slate-900 inline-block min-w-32">
            {report.classroom.homeroomTeacher?.fullName || "...................................."}
          </p>
          {report.classroom.homeroomTeacher?.nuptk && (
            <p className="text-[9px]">NUPTK: {report.classroom.homeroomTeacher.nuptk}</p>
          )}
        </div>

        <div>
          <p>Diberikan di, .........................</p>
          <p>Kepala Madrasah</p>
          <div className="h-16" />
          <p className="font-bold border-b border-slate-900 inline-block min-w-32">
            ..........................................
          </p>
          <p className="text-[9px]">NIP / NSM: {report.institution.nsm}</p>
        </div>
      </div>
    </div>
  );
};
