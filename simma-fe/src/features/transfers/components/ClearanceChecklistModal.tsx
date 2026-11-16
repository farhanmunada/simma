import React, { useState } from "react";
import { BookOpen, DollarSign, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useUpdateClearance } from "../api/transfers.api";
import type { TransferItem, ClearanceDimension } from "../types";

interface ClearanceChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferItem | null;
}

export const ClearanceChecklistModal: React.FC<ClearanceChecklistModalProps> = ({
  isOpen,
  onClose,
  transfer,
}) => {
  const updateClearanceMutation = useUpdateClearance();
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  if (!transfer) return null;
  const clr = transfer.clearance;
  const isEditable = transfer.status === "pending_clearance";

  const handleToggle = (dimension: ClearanceDimension, currentCleared: boolean) => {
    updateClearanceMutation.mutate({
      id: transfer.id,
      dimension,
      cleared: !currentCleared,
      notes: activeNotes[dimension],
    });
  };

  const dimensions = [
    {
      key: "library" as const,
      title: "1. Bebas Pustaka (Perpustakaan)",
      desc: "Tidak ada pinjaman buku tertunggak atau denda keterlambatan buku madrasah.",
      icon: BookOpen,
      cleared: clr?.libraryCleared ?? false,
      notes: clr?.libraryNotes,
      date: clr?.libraryClearedAt,
    },
    {
      key: "finance" as const,
      title: "2. Bebas Keuangan & Administrasi SPP",
      desc: "Seluruh tagihan SPP bulanan, infak gedung, dan biaya asrama telah lunas.",
      icon: DollarSign,
      cleared: clr?.financeCleared ?? false,
      notes: clr?.financeNotes,
      date: clr?.financeClearedAt,
    },
    {
      key: "discipline" as const,
      title: "3. Bebas Pelanggaran & BK (Kedisiplinan)",
      desc: "Catatan poin kedisiplinan dan kasus bimbingan konseling telah tuntas.",
      icon: ShieldAlert,
      cleared: clr?.disciplineCleared ?? false,
      notes: clr?.disciplineNotes,
      date: clr?.disciplineClearedAt,
    },
  ];

  const clearedCount = dimensions.filter((d) => d.cleared).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checklist Clearance Mutasi Siswa" maxWidth="lg">
      <div className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
          <div>
            <p className="font-semibold text-slate-800">{transfer.studentName}</p>
            <p className="text-xs text-slate-500 font-mono">
              Ref: {transfer.referenceNumber} | Status: {transfer.status}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold uppercase text-slate-500">Progres Bebas Masalah</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(clearedCount / 3) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{clearedCount}/3</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.key}
                className={`p-3.5 rounded-lg border transition-all ${
                  dim.cleared
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border mt-0.5 ${
                        dim.cleared
                          ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                          : "bg-slate-100 border-slate-300 text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{dim.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{dim.desc}</p>
                      {dim.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          Catatan: {dim.notes}
                        </p>
                      )}
                      {dim.date && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tercatat: {dim.date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={dim.cleared ? "success" : "warning"} size="sm">
                      {dim.cleared ? "Selesai" : "Belum Bebas"}
                    </Badge>
                    {isEditable && (
                      <Button
                        size="sm"
                        variant={dim.cleared ? "outline" : "primary"}
                        onClick={() => handleToggle(dim.key, dim.cleared)}
                        disabled={updateClearanceMutation.isPending}
                        className="text-xs h-8"
                      >
                        {dim.cleared ? "Batalkan" : "Setujui Bebas"}
                      </Button>
                    )}
                  </div>
                </div>

                {isEditable && !dim.cleared && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Tambahkan catatan (misal: buku telah dikembalikan)"
                      value={activeNotes[dim.key] ?? ""}
                      onChange={(e) =>
                        setActiveNotes((prev) => ({ ...prev, [dim.key]: e.target.value }))
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
