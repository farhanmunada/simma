import React from "react";
import { FileText, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import type { PpdbDocument } from "../types";
import { useVerifyDocument } from "../api/ppdb.api";
import { API_BASE_URL } from "../../../config/endpoints";

interface PpdbDocumentVerificationListProps {
  applicantId: string;
  documents: PpdbDocument[];
  onRefetch?: () => void;
}

const DOC_LABEL_MAP: Record<string, string> = {
  pas_foto: "Pas Foto Resmi (3x4)",
  kartu_keluarga: "Kartu Keluarga (KK)",
  akta_kelahiran: "Akta Kelahiran",
  ijazah_skl: "Ijazah / SKL SMP/MTs",
  rapor_semester: "Rekap Nilai Rapor Smt 1-5",
  prestasi_tahfidz: "Piagam / Syahadah Tahfidz",
  kip_pkh: "Kartu KIP / PKH / DTKS",
  surat_tugas_ortu: "SK Penugasan Orang Tua",
  sptjm: "Surat SPTJM Bermaterai",
};

export const PpdbDocumentVerificationList: React.FC<PpdbDocumentVerificationListProps> = ({
  documents,
}) => {
  const verifyMutation = useVerifyDocument();

  const handleVerify = async (
    docId: string,
    status: "valid" | "invalid" | "pending"
  ) => {
    let notes: string | undefined;
    if (status === "invalid") {
      const inputNotes = window.prompt(
        "Alasan penolakan dokumen (contoh: Dokumen buram/tidak terbaca):"
      );
      if (inputNotes === null) return;
      notes = inputNotes.trim() || "Dokumen tidak memenuhi kriteria verifikasi.";
    }

    try {
      await verifyMutation.mutateAsync({
        documentId: docId,
        data: {
          verificationStatus: status,
          notes: notes,
        },
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal verifikasi dokumen.");
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-800 text-xs">
        Belum ada berkas scan yang diunggah oleh pendaftar ini.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <span className="font-semibold text-slate-700 text-xs">
          Berkas Unggahan Calon Siswa ({documents.length})
        </span>
        <span className="text-[11px] text-slate-400">Verifikasi keabsahan dokumen</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
        {documents.map((doc) => {
          const fileUrl = `${API_BASE_URL}/ppdb/documents/${doc.id}/file`;
          const isPending = doc.verificationStatus === "pending";
          const isVerified = doc.verificationStatus === "valid";
          const isRejected = doc.verificationStatus === "invalid";

          return (
            <div
              key={doc.id}
              className="py-2 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {DOC_LABEL_MAP[doc.documentType] || doc.documentType}
                  </span>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-0.5 text-[11px] font-semibold"
                    title="Buka / Unduh Berkas"
                  >
                    <span>Lihat</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">{doc.originalName}</span>
                  <span>&bull;</span>
                  <span>{Math.round(doc.fileSize / 1024)} KB</span>
                  {doc.verificationNotes && (
                    <span className="text-rose-600 truncate">
                      ({doc.verificationNotes})
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center space-x-1 shrink-0">
                {isVerified && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid</span>
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-medium border border-rose-200">
                    <XCircle className="w-3 h-3" />
                    <span>Ditolak</span>
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium border border-amber-200">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                )}

                <div className="flex items-center space-x-0.5 ml-1">
                  <button
                    type="button"
                    onClick={() => handleVerify(doc.id, "valid")}
                    disabled={verifyMutation.isPending || isVerified}
                    title="Verifikasi Valid"
                    className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(doc.id, "invalid")}
                    disabled={verifyMutation.isPending || isRejected}
                    title="Tolak Dokumen"
                    className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 disabled:opacity-40 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
