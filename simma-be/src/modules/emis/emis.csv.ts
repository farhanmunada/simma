import type {
  EmisStudentExportRow,
  EmisTeacherExportRow,
  EmisClassroomExportRow,
  EmisInstitutionExportRow,
} from "./emis.types.js";

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function formatEmisStudentsCsv(rows: EmisStudentExportRow[]): string {
  const headers = [
    "No",
    "NIK",
    "NISN",
    "NIS",
    "Nama Lengkap",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Nama Ibu Kandung",
    "NIK Ibu",
    "Nama Ayah",
    "NIK Ayah",
    "Rombel",
    "Tingkat",
    "Status Keaktifan",
  ];

  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];

  for (const r of rows) {
    const row = [
      r.no,
      r.nik,
      r.nisn,
      r.nis,
      r.fullName,
      r.gender,
      r.birthPlace,
      r.birthDate,
      r.motherName,
      r.motherNik,
      r.fatherName,
      r.fatherNik,
      r.classroomName,
      r.gradeLevel,
      r.status,
    ];
    lines.push(row.map((v) => escapeCsvCell(v)).join(","));
  }

  return lines.join("\r\n");
}

export function formatEmisTeachersCsv(rows: EmisTeacherExportRow[]): string {
  const headers = [
    "No",
    "NIK",
    "NUPTK",
    "PegID",
    "NIP",
    "Nama Lengkap",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Status Kepegawaian",
    "Jenis GTK",
    "Status Tugas",
    "Pendidikan Terakhir",
    "Program Studi",
    "Sertifikasi",
    "Bidang Sertifikasi",
    "Beban JTM",
  ];

  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];

  for (const r of rows) {
    const row = [
      r.no,
      r.nik,
      r.nuptk,
      r.pegId,
      r.nip,
      r.fullName,
      r.gender,
      r.birthPlace,
      r.birthDate,
      r.employmentType,
      r.gtkType,
      r.dutyStatus,
      r.highestEducation,
      r.major,
      r.isCertified,
      r.certificationField,
      r.totalJtm,
    ];
    lines.push(row.map((v) => escapeCsvCell(v)).join(","));
  }

  return lines.join("\r\n");
}

export function formatEmisClassroomsCsv(rows: EmisClassroomExportRow[]): string {
  const headers = [
    "No",
    "Nama Rombel",
    "Tingkat Kelas",
    "Wali Kelas",
    "NUPTK/NIK Wali Kelas",
    "Jumlah Siswa",
    "Kapasitas Rombel",
  ];

  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];

  for (const r of rows) {
    const row = [
      r.no,
      r.classroomName,
      r.gradeLevel,
      r.homeroomTeacherName,
      r.homeroomTeacherNuptk,
      r.studentCount,
      r.capacity,
    ];
    lines.push(row.map((v) => escapeCsvCell(v)).join(","));
  }

  return lines.join("\r\n");
}

export function formatEmisInstitutionCsv(row: EmisInstitutionExportRow): string {
  const headers = [
    "NSM",
    "NPSN",
    "Nama Madrasah",
    "Status Madrasah",
    "Alamat",
    "Tahun Ajaran",
    "Semester",
    "Kepala Madrasah",
  ];

  const lines = [
    headers.map((h) => escapeCsvCell(h)).join(","),
    [
      row.nsm,
      row.npsn,
      row.name,
      row.status,
      row.address,
      row.academicYear,
      row.semester,
      row.headmasterName,
    ]
      .map((v) => escapeCsvCell(v))
      .join(","),
  ];

  return lines.join("\r\n");
}
