import React from "react";
import { X, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type { PaymentTransactionDto } from "../types";

interface ReceiptViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransactionDto | null;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handleDownloadPdf = () => {
    const url = `/api/v1${API_ENDPOINTS.FINANCE.CASHIER_RECEIPT_PDF(transaction.id)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">Kwitansi Pembayaran</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Kwitansi:</span>
              <span className="font-bold text-slate-800">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-medium text-slate-700">
                {new Date(transaction.paymentDate).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Siswa:</span>
              <span className="font-semibold text-slate-800">{transaction.studentName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kelas / NIS:</span>
              <span className="text-slate-700">
                {transaction.classroomName || "-"} / {transaction.studentNis || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Bayar:</span>
              <span className="font-medium text-slate-700 uppercase">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-semibold uppercase ${
                  transaction.status === "success" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 block">Item Pembayaran:</span>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg max-h-40 overflow-y-auto">
              {transaction.items?.map((item) => (
                <div key={item.id} className="flex justify-between p-2 text-xs">
                  <div>
                    <span className="font-medium text-slate-800">{item.feeName}</span>
                    {item.month && (
                      <span className="text-slate-500 block text-[11px]">
                        Bulan: {item.month}/{item.year}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-800">
                    Rp {item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 space-y-1 border border-emerald-100 text-xs">
            <div className="flex justify-between text-emerald-950 font-bold text-sm">
              <span>Total Bayar:</span>
              <span>Rp {transaction.totalAmount.toLocaleString()}</span>
            </div>
            {transaction.paymentMethod === "tunai" && (
              <>
                <div className="flex justify-between text-emerald-800">
                  <span>Diterima:</span>
                  <span>Rp {transaction.receivedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Kembalian:</span>
                  <span>Rp {transaction.changeAmount.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak PDF Kwitansi</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
