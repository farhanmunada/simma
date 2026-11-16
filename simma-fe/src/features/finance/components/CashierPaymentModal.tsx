import React, { useState, useEffect } from "react";
import { X, CheckCircle, Calculator } from "lucide-react";
import { useProcessPayment } from "../api/finance.api";
import type { PaymentMethod, PaymentTransactionDto, StudentInvoiceDto } from "../types";

interface CashierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  selectedInvoices: StudentInvoiceDto[];
  onPaymentSuccess: (tx: PaymentTransactionDto) => void;
}

export const CashierPaymentModal: React.FC<CashierPaymentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  selectedInvoices,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [invoicePayments, setInvoicePayments] = useState<Record<string, number>>({});
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const processMutation = useProcessPayment();

  // Initialize payment amounts with remaining amount of selected invoices
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      let total = 0;
      selectedInvoices.forEach((inv) => {
        initial[inv.id] = inv.remainingAmount;
        total += inv.remainingAmount;
      });
      setInvoicePayments(initial);
      setReceivedAmount(total);
      setErrorMsg("");
    }
  }, [isOpen, selectedInvoices]);

  if (!isOpen) return null;

  const totalAmount = Object.values(invoicePayments).reduce((sum, val) => sum + (val || 0), 0);
  const changeAmount = Math.max(0, receivedAmount - totalAmount);

  const handleAmountChange = (invoiceId: string, val: number, maxAmount: number) => {
    const safeVal = Math.min(Math.max(0, val), maxAmount);
    setInvoicePayments((prev) => ({
      ...prev,
      [invoiceId]: safeVal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (totalAmount <= 0) {
      setErrorMsg("Total nominal bayar harus lebih dari Rp 0.");
      return;
    }

    if (paymentMethod === "tunai" && receivedAmount < totalAmount) {
      setErrorMsg("Uang tunai yang diterima kurang dari total pembayaran.");
      return;
    }

    const items = selectedInvoices
      .filter((inv) => (invoicePayments[inv.id] || 0) > 0)
      .map((inv) => ({
        invoiceId: inv.id,
        amount: invoicePayments[inv.id],
      }));

    if (items.length === 0) {
      setErrorMsg("Pilih minimal satu tagihan untuk dibayar.");
      return;
    }

    try {
      const tx = await processMutation.mutateAsync({
        studentId,
        paymentMethod,
        receivedAmount: paymentMethod === "tunai" ? receivedAmount : totalAmount,
        notes: notes.trim() || undefined,
        items,
      });
      onPaymentSuccess(tx);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses transaksi kasir";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pembayaran Kasir POS</h3>
            <p className="text-xs text-slate-500">Siswa: {studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-2 bg-slate-50">
            <span className="text-xs font-semibold text-slate-600 block px-1">Rincian Tagihan yang Dibayar:</span>
            {selectedInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 text-xs"
              >
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-slate-800">{inv.feeName || "Tagihan"}</p>
                  <p className="text-slate-500">
                    Sisa: Rp {inv.remainingAmount.toLocaleString()} {inv.month ? `(Bulan ${inv.month}/${inv.year})` : ""}
                  </p>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min="1"
                    max={inv.remainingAmount}
                    value={invoicePayments[inv.id] ?? 0}
                    onChange={(e) => handleAmountChange(inv.id, Number(e.target.value), inv.remainingAmount)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-right text-xs focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Metode Bayar</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="tunai">Tunai (Cash)</option>
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Total Tagihan (Rp)</label>
              <div className="mt-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
                Rp {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {paymentMethod === "tunai" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Uang Diterima (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Kembalian (Rp)</label>
                <div className="mt-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700">
                  Rp {changeAmount.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Catatan Transaksi</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Titipan orang tua via wali kelas"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processMutation.isPending || totalAmount <= 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{processMutation.isPending ? "Memproses..." : "Bayar Sekarang"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
