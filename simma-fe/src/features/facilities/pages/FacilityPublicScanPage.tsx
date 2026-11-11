import React, { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useFacilityScan } from "../api/facilities.api";
import { FacilityMaintenanceModal } from "../components/FacilityMaintenanceModal";

export const FacilityPublicScanPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { data: asset, isLoading, error } = useFacilityScan(token);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Package className="w-10 h-10 text-emerald-600 animate-pulse mx-auto" />
          <p className="text-sm text-slate-600 font-medium">
            Memuat informasi spesifikasi aset...
          </p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">
            Aset Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500">
            Token QR tidak valid atau barang belum terdaftar pada sistem sarana prasarana SIMMA.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm" className="mt-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Beranda
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full p-6 shadow-md border border-slate-200 bg-white space-y-5">
        <div className="text-center border-b border-slate-100 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Audit Cepat QR Sarpras
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2">{asset.name}</h1>
          <p className="font-mono text-xs font-semibold text-slate-500 mt-0.5">
            {asset.code}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Status Ketersediaan:</span>
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

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Kondisi Fisik:</span>
            <Badge
              variant={
                asset.condition === "BAIK"
                  ? "success"
                  : asset.condition === "RUSAK_RINGAN"
                    ? "warning"
                    : "danger"
              }
            >
              {asset.condition}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Kategori:</span>
            <span className="font-medium text-slate-800">{asset.category}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Lokasi Penempatan:</span>
            <span className="font-medium text-slate-800">
              {asset.location || "Madrasah"}
            </span>
          </div>

          {asset.purchaseDate && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Tahun Pengadaan:</span>
              <span className="font-medium text-slate-800">
                {asset.purchaseDate}
              </span>
            </div>
          )}

          {asset.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-slate-700">
                Spesifikasi & Keterangan:
              </span>
              <p className="text-slate-600">{asset.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReportModalOpen(true)}
            className="w-full text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <Wrench className="w-3.5 h-3.5 mr-1" />
            Laporkan Kendala / Kerusakan
          </Button>
          <Link to="/facilities" className="w-full">
            <Button size="sm" variant="ghost" className="w-full text-xs">
              Buka Modul Sarpras Lengkap
            </Button>
          </Link>
        </div>
      </Card>

      <FacilityMaintenanceModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedAsset={asset}
        assets={[asset]}
      />
    </div>
  );
};
