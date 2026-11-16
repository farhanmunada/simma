import React from "react";
import {
  QrCode,
  Edit2,
  Trash2,
  HandHelping,
  Wrench,
  ImageIcon,
  Calendar,
  MapPin,
  Tag,
  Coins,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import type { FacilityAsset } from "../types";

interface FacilityAssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FacilityAsset | null;
  onEdit: (asset: FacilityAsset) => void;
  onDelete: (asset: FacilityAsset) => void;
  onViewQr: (asset: FacilityAsset) => void;
  onBorrow: (asset: FacilityAsset) => void;
  onReportIssue: (asset: FacilityAsset) => void;
}

export const FacilityAssetDetailModal: React.FC<FacilityAssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onEdit,
  onDelete,
  onViewQr,
  onBorrow,
  onReportIssue,
}) => {
  if (!asset) return null;

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "BAIK":
        return <Badge variant="success">Baik</Badge>;
      case "RUSAK_RINGAN":
        return <Badge variant="warning">Rusak Ringan</Badge>;
      case "RUSAK_BERAT":
        return <Badge variant="danger">Rusak Berat</Badge>;
      default:
        return <Badge variant="neutral">{condition}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TERSEDIA":
        return <Badge variant="success">Tersedia</Badge>;
      case "DIPINJAM":
        return <Badge variant="warning">Dipinjam</Badge>;
      case "DALAM_PERBAIKAN":
        return <Badge variant="info">Dalam Perbaikan</Badge>;
      case "DIHAPUSKAN":
        return <Badge variant="neutral">Dihapuskan</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Aset Sarana & Prasarana"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-sm text-slate-700">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded inline-block">
              {asset.code}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{asset.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              {getConditionBadge(asset.condition)}
              {getStatusBadge(asset.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onViewQr(asset);
              }}
              className="text-xs"
            >
              <QrCode className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Lihat QR
            </Button>
            {asset.status === "TERSEDIA" && asset.condition !== "RUSAK_BERAT" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onBorrow(asset);
                }}
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <HandHelping className="w-3.5 h-3.5 mr-1" />
                Pinjam
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onReportIssue(asset);
              }}
              className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Wrench className="w-3.5 h-3.5 mr-1" />
              Lapor Servis
            </Button>
          </div>
        </div>

        {/* Gallery / Photos: Minimal 2 (Depan & Detail Label) */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Dokumentasi Fisik Aset (Minimal 2 Foto)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Foto 1: Tampak Depan */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto 1: Tampak Depan</span>
              </div>
              <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {asset.frontImageUrl ? (
                  <img
                    src={asset.frontImageUrl}
                    alt={`${asset.name} - Tampak Depan`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <span className="text-xs">Belum ada foto tampak depan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Foto 2: Detail / Label Pabrikan */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto 2: Detail / Label Resmi Pabrikan</span>
              </div>
              <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {asset.detailImageUrl ? (
                  <img
                    src={asset.detailImageUrl}
                    alt={`${asset.name} - Detail Pabrikan`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <Tag className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <span className="text-xs">Belum ada foto label/serial number</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spesifikasi & Informasi Terinci */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">Kategori:</span>
            <span className="font-medium text-slate-800">{asset.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">Lokasi Penempatan:</span>
            <span className="font-medium text-slate-800">{asset.location || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">Tanggal Pengadaan:</span>
            <span className="font-medium text-slate-800">{asset.purchaseDate || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">Sumber Dana:</span>
            <span className="font-medium text-slate-800">{asset.sourceOfFund || "-"}</span>
          </div>
        </div>

        {/* Catatan Tambahan */}
        {asset.notes && (
          <div className="text-xs">
            <span className="font-semibold text-slate-700 block mb-1">
              Catatan / Spesifikasi Teknis:
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 whitespace-pre-line leading-relaxed">
              {asset.notes}
            </div>
          </div>
        )}

        {/* Footer Actions: Edit & Hapus Ada di Sini */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onClose();
              onDelete(asset);
            }}
            disabled={asset.status === "DIPINJAM" || asset.status === "DALAM_PERBAIKAN"}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Hapus Aset
          </Button>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onEdit(asset);
              }}
              className="text-xs"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Data Aset
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
