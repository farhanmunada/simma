import React, { useState } from "react";
import { FileText, Layers, Search, Filter } from "lucide-react";
import { useInvoices } from "../api/finance.api";
import { GenerateInvoicesModal } from "../components/GenerateInvoicesModal";
import type { StudentInvoiceDto } from "../types";
import type { InvoiceStatus } from "../types";

export const FinanceInvoicesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const queryParams = {
    status: statusFilter ? (statusFilter as InvoiceStatus) : undefined,
    year: yearFilter,
    month: monthFilter ? Number(monthFilter) : undefined,
  };

  const { data: invoices = [], isLoading } = useInvoices(queryParams);
  const rawInvoices = invoices as any;
  const invoiceList: StudentInvoiceDto[] = Array.isArray(rawInvoices)
    ? rawInvoices
    : Array.isArray(rawInvoices?.data)
    ? rawInvoices.data
    : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tagihan Siswa</h1>
          <p className="text-sm text-slate-500">Kelola dan monitoring tagihan biaya pendidikan madrasah.</p>
        </div>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Layers className="h-4 w-4" />
          <span>Generate Tagihan Masal</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Status Tagihan</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="unpaid">Belum Dibayar (Unpaid)</option>
            <option value="partial">Sebagian (Partial)</option>
            <option value="paid">Lunas (Paid)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun</label>
          <input
            type="number"
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Bulan</label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Bulan</option>
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((m, i) => (
              <option key={m} value={i + 1}>
                {i + 1} - {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">No. Tagihan</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Pos Biaya</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Dibayar</th>
                <th className="px-4 py-3 text-right">Sisa</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Memuat data tagihan...
                  </td>
                </tr>
              ) : invoiceList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada tagihan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                invoiceList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{inv.studentName || "-"}</p>
                      <p className="text-[11px] text-slate-400">{inv.classroomName || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{inv.feeName || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.month ? `${inv.month}/${inv.year}` : inv.year}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      Rp {inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      Rp {inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      Rp {inv.remainingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : inv.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateInvoicesModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
    </div>
  );
};
