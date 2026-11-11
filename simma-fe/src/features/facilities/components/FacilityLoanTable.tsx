import React from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { FacilityLoan, FacilityAsset } from "../types";

interface FacilityLoanTableProps {
  loans: FacilityLoan[];
  assets: FacilityAsset[];
  isLoading: boolean;
  onReturn: (loan: FacilityLoan) => void;
}

export const FacilityLoanTable: React.FC<FacilityLoanTableProps> = ({
  loans,
  assets,
  isLoading,
  onReturn,
}) => {
  const getAssetName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.name} (${asset.code})` : assetId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DIPINJAM":
        return <Badge variant="warning">Sedang Dipinjam</Badge>;
      case "DIKEMBALIKAN":
        return <Badge variant="success">Sudah Dikembalikan</Badge>;
      case "TERLAMBAT":
        return <Badge variant="danger">Terlambat</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Barang / Aset</th>
            <th className="px-4 py-3">Peminjam</th>
            <th className="px-4 py-3">Tgl Pinjam</th>
            <th className="px-4 py-3">Batas Kembali</th>
            <th className="px-4 py-3">Tgl Kembali</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                Memuat riwayat peminjaman...
              </td>
            </tr>
          ) : loans.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                Belum ada transaksi peminjaman tercatat.
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {getAssetName(loan.assetId)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-800 font-medium">
                    {loan.borrowerName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {loan.borrowerType}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {loan.loanDate}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {loan.dueDate}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {loan.returnDate || "-"}
                </td>
                <td className="px-4 py-3">{getStatusBadge(loan.status)}</td>
                <td className="px-4 py-3 text-right">
                  {loan.status !== "DIKEMBALIKAN" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReturn(loan)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 border-emerald-300"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Kembalikan
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Selesai</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
