import React, { useState } from "react";
import { Search, CreditCard, Clock, FileText, CheckSquare, Square } from "lucide-react";
import { useSearchStudents, useStudentBillingProfile } from "../api/finance.api";
import { CashierPaymentModal } from "../components/CashierPaymentModal";
import { DispensationModal } from "../components/DispensationModal";
import { ReceiptViewModal } from "../components/ReceiptViewModal";
import { StudentBillingCard } from "../components/StudentBillingCard";
import type { StudentInvoiceDto, PaymentTransactionDto } from "../types";

export const FinanceCashierPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDispensationModalOpen, setIsDispensationModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentTransactionDto | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useSearchStudents(searchQuery);
  const { data: profile, isLoading: isLoadingProfile } = useStudentBillingProfile(
    selectedStudentId ?? undefined
  );

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setSelectedInvoiceIds([]);
  };

  const toggleInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!profile) return;
    if (selectedInvoiceIds.length === profile.unpaidInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(profile.unpaidInvoices.map((i) => i.invoice.id));
    }
  };

  const selectedInvoices: StudentInvoiceDto[] = profile
    ? profile.unpaidInvoices
        .filter((i) => selectedInvoiceIds.includes(i.invoice.id))
        .map((i) => ({ ...i.invoice, feeName: i.feeName, feeCategory: i.feeCategory }))
    : [];

  const totalSelectedAmount = selectedInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Loket Kasir & POS SPP</h1>
          <p className="text-sm text-slate-500">Pencarian siswa dan pemrosesan pembayaran tagihan madrasah.</p>
        </div>
      </div>

      {/* Student Search Bar */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Siswa (Nama / NIS / NISN)</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik minimal 2 karakter nama siswa atau NIS..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
          <div className="absolute left-4 right-4 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {searchResults.map((std) => (
              <button
                key={std.id}
                onClick={() => {
                  handleSelectStudent(std.id);
                  setSearchQuery("");
                }}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{std.fullName}</p>
                  <p className="text-xs text-slate-500">
                    NIS: {std.nis || "-"} | Kelas: {std.classroomName || "-"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Pilih Siswa
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile & Billing Workspace */}
      {selectedStudentId && profile && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Identity & Summary Card */}
          <StudentBillingCard
            profile={profile}
            onOpenDispensation={() => setIsDispensationModalOpen(true)}
          />

          {/* Unpaid Invoices Workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800">Daftar Tagihan Belum Lunas</h3>
                </div>
                {profile.unpaidInvoices.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    {selectedInvoiceIds.length === profile.unpaidInvoices.length ? (
                      <>
                        <CheckSquare className="h-4 w-4" /> Batal Pilih Semua
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" /> Pilih Semua Tagihan
                      </>
                    )}
                  </button>
                )}
              </div>

              {profile.unpaidInvoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p>Tidak ada tagihan aktif atau siswa sudah lunas.</p>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {profile.unpaidInvoices.map(({ invoice, feeName }) => {
                    const isSelected = selectedInvoiceIds.includes(invoice.id);
                    return (
                      <div
                        key={invoice.id}
                        onClick={() => toggleInvoice(invoice.id)}
                        className={`flex cursor-pointer items-center justify-between p-3 transition hover:bg-slate-50 ${
                          isSelected ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by row click
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{feeName}</p>
                            <p className="text-xs text-slate-500">
                              No. Inv: {invoice.invoiceNumber}
                              {invoice.month ? ` | Bln ${invoice.month}/${invoice.year}` : ` | Thn ${invoice.year}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            Rp {invoice.remainingAmount.toLocaleString()}
                          </p>
                          <span className="text-[11px] uppercase font-semibold text-amber-600">
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkout Bar */}
              {profile.unpaidInvoices.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xs text-slate-500">Total Dipilih:</span>
                    <p className="text-lg font-bold text-slate-900">
                      Rp {totalSelectedAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    disabled={selectedInvoices.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Bayar di Loket ({selectedInvoices.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Payment History */}
            {profile.history.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <h4 className="font-bold text-slate-800 text-sm">Riwayat Pembayaran Siswa</h4>
                </div>
                <div className="mt-3 divide-y divide-slate-100 text-xs">
                  {profile.history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-semibold text-slate-800">{tx.receiptNumber}</p>
                        <p className="text-slate-400">
                          {new Date(tx.paymentDate).toLocaleDateString("id-ID")} | Metode: {tx.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">Rp {tx.totalAmount.toLocaleString()}</span>
                        <span className="block text-[10px] uppercase font-semibold text-emerald-600">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStudentId && profile && (
        <>
          <CashierPaymentModal
            isOpen={isPayModalOpen}
            onClose={() => setIsPayModalOpen(false)}
            studentId={selectedStudentId}
            studentName={profile.student.fullName}
            selectedInvoices={selectedInvoices}
            onPaymentSuccess={(tx) => {
              setIsPayModalOpen(false);
              setSelectedInvoiceIds([]);
              setActiveReceipt(tx);
            }}
          />

          <DispensationModal
            isOpen={isDispensationModalOpen}
            onClose={() => setIsDispensationModalOpen(false)}
            studentId={selectedStudentId}
            studentName={profile.student.fullName}
          />
        </>
      )}

      <ReceiptViewModal
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
        transaction={activeReceipt}
      />
    </div>
  );
};
