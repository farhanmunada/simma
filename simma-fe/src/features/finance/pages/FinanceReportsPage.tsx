import React, { useState } from "react";
import { TrendingUp, AlertTriangle, Calendar, Filter, DollarSign } from "lucide-react";
import { useCashflowReport, useArrearsReport } from "../api/finance.api";

export const FinanceReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"cashflow" | "arrears">("cashflow");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: cashflow, isLoading: isLoadingCashflow } = useCashflowReport({
    startDate,
    endDate,
  });

  const { data: arrears, isLoading: isLoadingArrears } = useArrearsReport();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Keuangan Madrasah</h1>
          <p className="text-sm text-slate-500">
            Rekap arus kas penerimaan kasir POS dan rekapitulasi tunggakan siswa.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "cashflow" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Arus Kas Penerimaan
          </button>
          <button
            onClick={() => setActiveTab("arrears")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "arrears" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rekap Tunggakan
          </button>
        </div>
      </div>

      {activeTab === "cashflow" ? (
        <div className="space-y-6">
          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Rentang Tanggal:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Metric cards */}
          {cashflow && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <span className="text-xs font-semibold text-emerald-800">Total Penerimaan</span>
                <p className="mt-1 text-2xl font-bold text-emerald-950">
                  Rp {cashflow.summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <span className="text-xs font-semibold text-blue-800">Jumlah Transaksi</span>
                <p className="mt-1 text-2xl font-bold text-blue-950">
                  {cashflow.summary.transactionCount} Transaksi
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-xs font-semibold text-slate-600">Penerimaan Tunai</span>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Rp {(cashflow.summary.byMethod["tunai"] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">No. Kwitansi</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kasir</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoadingCashflow ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Memuat data arus kas...
                      </td>
                    </tr>
                  ) : !cashflow || cashflow.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada transaksi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    cashflow.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{t.receiptNumber}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(t.paymentDate).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{t.studentName}</td>
                        <td className="px-4 py-3 text-slate-600">{t.cashierName || "-"}</td>
                        <td className="px-4 py-3 uppercase text-slate-600">{t.paymentMethod}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          Rp {t.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Arrears */}
          {arrears && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                <span className="text-xs font-semibold text-red-800">Total Tunggakan Madrasah</span>
                <p className="mt-1 text-2xl font-bold text-red-950">
                  Rp {arrears.summary.totalArrears.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                <span className="text-xs font-semibold text-amber-800">Jumlah Tagihan Tertunggak</span>
                <p className="mt-1 text-2xl font-bold text-amber-950">
                  {arrears.summary.totalUnpaidInvoices} Tagihan
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-xs font-semibold text-slate-600">Siswa Tertunggak</span>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {arrears.summary.affectedStudentsCount} Santri/Siswa
                </p>
              </div>
            </div>
          )}

          {/* Arrears per Classroom */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Rombel / Kelas</th>
                    <th className="px-4 py-3 text-center">Jumlah Siswa Menunggak</th>
                    <th className="px-4 py-3 text-center">Total Tagihan Belum Lunas</th>
                    <th className="px-4 py-3 text-right">Total Nominal Tunggakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoadingArrears ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Memuat data rekapitulasi tunggakan...
                      </td>
                    </tr>
                  ) : !arrears || arrears.byClassroom.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Alhamdulillah, tidak ada data tunggakan aktif.
                      </td>
                    </tr>
                  ) : (
                    arrears.byClassroom.map((row) => (
                      <tr key={row.classroomId || "unknown"} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.classroomName}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{row.studentCount} Siswa</td>
                        <td className="px-4 py-3 text-center text-slate-700">{row.unpaidCount} Tagihan</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">
                          Rp {row.totalArrears.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
