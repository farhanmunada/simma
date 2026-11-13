import React from "react";
import {
  QrCode,
  HandHelping,
  Wrench,
  Search,
  Filter,
  ImageIcon,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { FacilityAsset } from "../types";

interface FacilityAssetTableProps {
  assets: FacilityAsset[];
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onSelectAsset: (asset: FacilityAsset) => void;
  onViewQr: (asset: FacilityAsset) => void;
  onBorrow: (asset: FacilityAsset) => void;
  onReportIssue: (asset: FacilityAsset) => void;
}

export const FacilityAssetTable: React.FC<FacilityAssetTableProps> = ({
  assets,
  isLoading,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectAsset,
  onViewQr,
  onBorrow,
  onReportIssue,
}) => {
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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, nama, lokasi..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700"
            >
              <option value="">Semua Kategori</option>
              <option value="ELEKTRONIK">Elektronik</option>
              <option value="FURNITUR">Furnitur</option>
              <option value="RUANGAN">Ruangan</option>
              <option value="LABORATORIUM">Laboratorium</option>
              <option value="KENDARAAN">Kendaraan</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700"
            >
              <option value="">Semua Status</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="DALAM_PERBAIKAN">Dalam Perbaikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Kode & Nama Aset</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Kondisi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Opsi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Memuat data aset...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada aset sarana prasarana yang sesuai.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                >
                  {/* Foto Miniatur */}
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {asset.frontImageUrl ? (
                        <img
                          src={asset.frontImageUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {asset.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {asset.code}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {asset.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {asset.location || "-"}
                  </td>
                  <td className="px-4 py-3">{getConditionBadge(asset.condition)}</td>
                  <td className="px-4 py-3">{getStatusBadge(asset.status)}</td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewQr(asset)}
                        title="QR Code & Cetak Label"
                        className="p-1.5 text-slate-500 hover:text-emerald-600"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      {asset.status === "TERSEDIA" &&
                        asset.condition !== "RUSAK_BERAT" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onBorrow(asset)}
                            title="Pinjamkan Aset"
                            className="p-1.5 text-slate-500 hover:text-blue-600"
                          >
                            <HandHelping className="w-4 h-4" />
                          </Button>
                        )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReportIssue(asset)}
                        title="Lapor Kerusakan"
                        className="p-1.5 text-slate-500 hover:text-amber-600"
                      >
                        <Wrench className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
