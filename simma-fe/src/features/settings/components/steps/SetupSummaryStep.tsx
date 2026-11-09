import React from "react";
import type { SetupWizardData } from "../../types";

interface SetupSummaryStepProps {
  data: SetupWizardData;
}

export const SetupSummaryStep: React.FC<SetupSummaryStepProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Konfirmasi Konfigurasi Awal
        </h3>
        <p className="text-xs text-slate-500">
          Periksa kembali ringkasan konfigurasi sebelum menyimpan dan mengaktifkan madrasah.
        </p>
      </div>

      <div className="space-y-3">
        {/* Madrasah */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
          <span className="font-semibold text-slate-700 block">Identitas Madrasah</span>
          <div className="text-slate-600">
            <span className="font-medium text-slate-900">{data.institution.name}</span> (NSM: {data.institution.nsm} / NPSN: {data.institution.npsn})
          </div>
          <div className="text-slate-500">
            Status: {data.institution.status} • Akreditasi: {data.institution.accreditation}
          </div>
          <div className="text-slate-500">
            Kepala: {data.institution.headmasterName}
          </div>
        </div>

        {/* Periode Akademik */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
          <span className="font-semibold text-slate-700 block">Tahun Ajaran & Semester</span>
          <div className="text-slate-600">
            Tahun Ajaran: <span className="font-medium text-slate-900">{data.academicYear.name}</span> ({data.academicYear.startDate} s/d {data.academicYear.endDate})
          </div>
          <div className="text-slate-500">
            Semester Aktif: {data.semester.type === 1 ? "Ganjil" : "Genap"} ({data.semester.startDate} s/d {data.semester.endDate})
          </div>
        </div>

        {/* Rombel */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
          <span className="font-semibold text-slate-700 block">
            Rombongan Belajar ({data.classrooms.length} Kelas)
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.classrooms.map((c, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium"
              >
                {c.name} (Tingkat {c.gradeLevel})
              </span>
            ))}
          </div>
        </div>

        {/* Admin */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
          <span className="font-semibold text-slate-700 block">Administrator Penanggung Jawab</span>
          <div className="text-slate-600">
            <span className="font-medium text-slate-900">{data.adminUser.name}</span> ({data.adminUser.email})
          </div>
          <div className="text-slate-500">Jabatan: {data.adminUser.role}</div>
        </div>
      </div>
    </div>
  );
};