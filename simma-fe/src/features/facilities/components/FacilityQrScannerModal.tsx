import React, { useState } from "react";
import { Search, CheckCircle2, AlertCircle, Wrench, ShieldCheck } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { useFacilityScan } from "../api/facilities.api";

interface FacilityQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportIssue?: (asset: any) => void;
}

export const FacilityQrScannerModal: React.FC<FacilityQrScannerModalProps> = ({
  isOpen,
  onClose,
  onReportIssue,
}) => {
  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const { data: asset, isLoading, error } = useFacilityScan(activeToken || undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      // If full url pasted, extract token
      const trimmed = tokenInput.trim();
      const token = trimmed.includes("/")
        ? trimmed.substring(trimmed.lastIndexOf("/") + 1)
        : trimmed;
      setActiveToken(token);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Cepat / Pemindaian QR Sarpras"
      maxWidth="md"
    >
      <div className="space-y-4 text-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Masukkan token QR atau tempel link scan..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="w-4 h-4 mr-1" />
            Audit
          </Button>
        </form>

        {isLoading && (
          <div className="p-8 text-center text-slate-400">
            Memeriksa spesifikasi dan riwayat aset...
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-xs">Aset Tidak Ditemukan</div>
              <div className="text-xs mt-0.5">
                Token QR tidak terdaftar di pangkalan data SIMMA. Pastikan token atau kode aset benar.
              </div>
            </div>
          </div>
        )}

        {asset && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {asset.code}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {asset.name}
                </h3>
              </div>
              <Badge
                variant={
                  asset.status === "TERSEDIA"
                    ? "success"
                    : asset.status === "DIPINJAM"
                      ? "warning"
                      : "info"
                }
              >
                {asset.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">Kategori:</span>{" "}
                <span className="font-medium text-slate-800">{asset.category}</span>
              </div>
              <div>
                <span className="text-slate-500">Kondisi:</span>{" "}
                <span className="font-medium text-slate-800">{asset.condition}</span>
              </div>
              <div>
                <span className="text-slate-500">Lokasi:</span>{" "}
                <span className="font-medium text-slate-800">{asset.location || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500">Sumber Dana:</span>{" "}
                <span className="font-medium text-slate-800">{asset.sourceOfFund || "-"}</span>
              </div>
            </div>

            {asset.notes && (
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Catatan:</span> {asset.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              {onReportIssue && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onReportIssue(asset);
                  }}
                  className="text-xs"
                >
                  <Wrench className="w-3.5 h-3.5 mr-1" />
                  Laporkan Kerusakan
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
