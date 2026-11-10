import React, { useState } from "react";
import { Plus, Search, FileText, Download, CheckCircle, Sparkles, QrCode } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import {
  useOutgoingLetters,
  useClassifications,
  useDownloadOutgoingLetterPdf,
} from "../api/letters.api";
import { CreateOutgoingLetterModal } from "./CreateOutgoingLetterModal";
import { GenerateLetterModal } from "./GenerateLetterModal";
import type { OutgoingLetter } from "../types";

export const OutgoingLettersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { data, isLoading } = useOutgoingLetters({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const letters: OutgoingLetter[] = data?.data ?? [];

  const downloadPdfMutation = useDownloadOutgoingLetterPdf();

  const handleDownloadPdf = async (id: string, letterNumber: string) => {
    try {
      const safeFilename = letterNumber.replace(/[/\\?%*:|"<>]/g, "_");
      await downloadPdfMutation.mutateAsync({
        id,
        filename: `Surat_${safeFilename}.pdf`,
      });
    } catch (err) {
      console.error("Gagal mengunduh PDF surat keluar:", err);
    }
  };

  const handleCopyVerification = (hash: string) => {
    const url = `${window.location.origin}/verify-letter/${hash}`;
    navigator.clipboard.writeText(url);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge variant="success">Ditandatangani</Badge>;
      case "sent":
        return <Badge variant="info">Terkirim</Badge>;
      case "archived":
        return <Badge variant="neutral">Diarsipkan</Badge>;
      default:
        return <Badge variant="warning">Konsep</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perihal / nomor naskah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
          >
            <option value="">Semua Status</option>
            <option value="signed">Ditandatangani</option>
            <option value="sent">Terkirim</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Generator Surat Resmi
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Catat Surat Keluar
          </button>
        </div>
      </div>

      {/* Letters Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Nomor Surat Resmi (PMA 12/2024)</th>
                <th className="px-4 py-3">Tujuan Penerima</th>
                <th className="px-4 py-3">Perihal & Klasifikasi</th>
                <th className="px-4 py-3">Penandatangan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data surat keluar...
                  </td>
                </tr>
              ) : letters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada naskah dinas keluar tercatat
                  </td>
                </tr>
              ) : (
                letters.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-emerald-700">
                        {row.letterNumber}
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                        Urut #{row.sequenceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{row.recipientName}</p>
                      {row.recipientAddress && (
                        <p className="text-[11px] text-slate-400">{row.recipientAddress}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{row.subject}</p>
                      <span className="font-mono text-[10px] text-slate-500">
                        Klasifikasi: {row.classificationCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{row.signerName || "Kamad"}</p>
                      <span className="text-[10px] text-slate-400">
                        Tgl: {row.month}/{row.year}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(row.id, row.letterNumber)}
                          disabled={downloadPdfMutation.isPending}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer disabled:opacity-50"
                          title="Unduh PDF Resmi"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyVerification(row.verificationHash)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Salin Link QR Verifikasi"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          {copiedHash === row.verificationHash ? "Tersalin!" : "QR"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOutgoingLetterModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <GenerateLetterModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />
    </div>
  );
};
