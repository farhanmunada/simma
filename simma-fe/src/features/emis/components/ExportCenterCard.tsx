import React, { useState } from "react";
import type { EmisExportType, EmisExportFormat } from "../types";
import { downloadEmisExport } from "../api/emis.api";

interface ExportCenterCardProps {
  isReadyForExport: boolean;
  overallPercentage: number;
}

export const ExportCenterCard: React.FC<ExportCenterCardProps> = ({
  isReadyForExport,
  overallPercentage,
}) => {
  const [format, setFormat] = useState<EmisExportFormat>("csv");
  const [downloadingType, setDownloadingType] = useState<EmisExportType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async (type: EmisExportType) => {
    try {
      setErrorMessage(null);
      setDownloadingType(type);
      await downloadEmisExport(type, format);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunduh berkas ekspor EMIS.");
    } finally {
      setDownloadingType(null);
    }
  };

  const exportItems: {
    type: EmisExportType;
    title: string;
    description: string;
    icon: string;
  }[] = [
    {
      type: "students",
      title: "Data Siswa EMIS",
      description: "NIK, NISN, NIS, Nama Lengkap, Tempat/Tgl Lahir, Nama & NIK Ibu Kandung, Rombel.",
      icon: "🎓",
    },
    {
      type: "teachers",
      title: "Data GTK & Pendidik",
      description: "NIK, NUPTK, PegID, NIP, Nama, Jenis Kelamin, Pendidikan, Sertifikasi, JTM.",
      icon: "👨‍🏫",
    },
    {
      type: "classrooms",
      title: "Rombongan Belajar",
      description: "Nama Rombel, Tingkat Kelas, NUPTK & Nama Wali Kelas, Jumlah Siswa.",
      icon: "🏫",
    },
    {
      type: "institution",
      title: "Profil Madrasah",
      description: "NSM, NPSN, Nama Resmi, Alamat, Tahun Ajaran, Semester, Kepala Madrasah.",
      icon: "🏛️",
    },
    {
      type: "bundle",
      title: "Master Bundle EMIS",
      description: "Paket lengkap seluruh data siswa, GTK, rombel, profil lembaga dengan checksum.",
      icon: "📦",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Pusat Unduhan & Ekspor Format EMIS 4.0
          </h3>
          <p className="text-sm text-gray-500">
            Ekspor data madrasah dalam format CSV template resmi Kemenag atau JSON arsip.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Pilihan Format:</span>
          <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
            <button
              onClick={() => setFormat("csv")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                format === "csv"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              CSV Resmi
            </button>
            <button
              onClick={() => setFormat("json")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                format === "json"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              JSON Bundle
            </button>
          </div>
        </div>
      </div>

      {!isReadyForExport && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
          <span className="text-base leading-none">⚠️</span>
          <div>
            <span className="font-bold">Peringatan Kesiapan Data ({overallPercentage}%): </span>
            Masih terdapat anomali data di atas ambang batas toleransi. Anda tetap dapat mengunduh
            data ini untuk pemeriksaan internal, namun berkas berpotensi ditolak pada sistem EMIS Pusat.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {exportItems.map((item) => (
          <div
            key={item.type}
            className="p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{item.icon}</span>
                <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">{item.description}</p>
            </div>

            <button
              onClick={() => handleDownload(item.type)}
              disabled={downloadingType === item.type}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {downloadingType === item.type ? (
                <span>Menyiapkan Berkas...</span>
              ) : (
                <span>Unduh {format.toUpperCase()}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
