import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ExternalLink } from "lucide-react";
import type { PpdbApplicant, PpdbDocumentType } from "../types";
import { useUploadDocument, useDeleteDocument } from "../api/ppdb.api";
import { API_BASE_URL } from "../../../config/endpoints";

interface PpdbDocumentUploadSectionProps {
  applicant: PpdbApplicant;
  onRefresh: () => void;
}

interface DocRequirement {
  type: PpdbDocumentType;
  title: string;
  description: string;
  required: boolean;
  formats: string;
}

export const PpdbDocumentUploadSection: React.FC<PpdbDocumentUploadSectionProps> = ({
  applicant,
  onRefresh,
}) => {
  const [selectedType, setSelectedType] = useState<PpdbDocumentType>("pas_foto");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const requirements: DocRequirement[] = [
    {
      type: "pas_foto",
      title: "Pas Foto Resmi (3x4)",
      description: "Background merah/biru, seragam sekolah asal (JPG/PNG maks 1MB)",
      required: true,
      formats: ".jpg,.jpeg,.png",
    },
    {
      type: "kartu_keluarga",
      title: "Kartu Keluarga (KK)",
      description: "Scan asli atau fotokopi legalisir (PDF/JPG maks 2MB)",
      required: true,
      formats: ".pdf,.jpg,.jpeg,.png",
    },
    {
      type: "akta_kelahiran",
      title: "Akta Kelahiran",
      description: "Scan asli atau fotokopi legalisir (PDF/JPG maks 2MB)",
      required: false,
      formats: ".pdf,.jpg,.jpeg,.png",
    },
    {
      type: "ijazah_skl",
      title: "Ijazah / SKL / Ket. Lulus",
      description: "Surat Keterangan Lulus dari MTs/SMP (PDF/JPG maks 2MB)",
      required: false,
      formats: ".pdf,.jpg,.jpeg,.png",
    },
    ...(applicant.track === "prestasi"
      ? [
          {
            type: "prestasi_tahfidz" as PpdbDocumentType,
            title: "Piagam Juara / Syahadah Tahfidz",
            description: "Wajib untuk pendaftar Jalur Prestasi/Tahfidz (PDF/JPG maks 3MB)",
            required: true,
            formats: ".pdf,.jpg,.jpeg,.png",
          },
        ]
      : []),
    ...(applicant.track === "afirmasi"
      ? [
          {
            type: "kip_pkh" as PpdbDocumentType,
            title: "Kartu KIP / PKH / KKS",
            description: "Wajib untuk pendaftar Jalur Afirmasi / Bantuan Sosial",
            required: true,
            formats: ".pdf,.jpg,.jpeg,.png",
          },
        ]
      : []),
  ];

  const uploadedDocs = applicant.documentsList || [];
  const uploadedTypeMap = new Map(uploadedDocs.map((d) => [d.documentType, d]));

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!fileToUpload) {
      setUploadError("Pilih file dokumen terlebih dahulu.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: fileToUpload,
        documentType: selectedType,
      });
      setFileToUpload(null);
      onRefresh();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || "Gagal mengunggah berkas.");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await deleteMutation.mutateAsync(docId);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal menghapus berkas.");
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Unggah Berkas Persyaratan PPDB</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Unggah dokumen scan asli sesuai jalur yang Anda pilih
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {uploadedDocs.length} Berkas Diunggah
        </span>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Form Upload */}
      {!applicant.isFinalized && (
        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-lg border border-slate-700/60">
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Pilih Jenis Berkas
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PpdbDocumentType)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {requirements.map((req) => (
                <option key={req.type} value={req.type}>
                  {req.title} {req.required ? "(Wajib)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Pilih File Dokumen
            </label>
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploadMutation.isPending || !fileToUpload}
              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadMutation.isPending ? "Mengunggah..." : "Unggah Berkas"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Daftar Persyaratan & Status Upload */}
      <div className="space-y-2">
        {requirements.map((req) => {
          const uploaded = uploadedTypeMap.get(req.type);
          const fileUrl = uploaded ? `${API_BASE_URL}/ppdb/documents/${uploaded.id}/file` : null;

          return (
            <div
              key={req.type}
              className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-200">{req.title}</span>
                  {req.required && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/20 font-medium">
                      Wajib
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{req.description}</p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {uploaded ? (
                  <>
                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terunggah ({Math.round(uploaded.fileSize / 1024)} KB)</span>
                    </span>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="Buka Berkas"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {!applicant.isFinalized && (
                      <button
                        type="button"
                        onClick={() => handleDelete(uploaded.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/40 transition-colors"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 text-[11px] italic">Belum diunggah</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
