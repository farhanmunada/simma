import { useState } from "react";
import {
  useStudentInfractions,
  useCreateStudentInfraction,
  useUpdateInfractionApproval,
  useDisciplineRules,
} from "../api/discipline.api";
import { InfractionStatusBadge } from "../components/SanctionBadge";
import { InfractionFormModal } from "../components/InfractionFormModal";
import { ApprovalModal } from "../components/ApprovalModal";
import { Button } from "../../../components/ui/Button";
import { PlusCircle, CheckCircle2, Search } from "lucide-react";
import type { StudentInfractionItem } from "../types";

export default function InfractionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInfraction, setSelectedInfraction] = useState<StudentInfractionItem | null>(null);

  const { data: infractionsData, isLoading } = useStudentInfractions({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    type: typeFilter !== "all" ? (typeFilter as any) : undefined,
  });

  const { data: rulesData } = useDisciplineRules();
  const createMutation = useCreateStudentInfraction();
  const approveMutation = useUpdateInfractionApproval();

  const infractions: StudentInfractionItem[] = infractionsData ?? [];

  const filtered = infractions.filter((item: StudentInfractionItem) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const studentsList = [
    { id: "11111111-1111-1111-1111-111111111111", fullName: "Ahmad Dahlan", className: "X-A" },
    { id: "22222222-2222-2222-2222-222222222222", fullName: "Muhammad Hasyim", className: "XI-IPA" },
    { id: "33333333-3333-3333-3333-333333333333", fullName: "Siti Fatimah", className: "X-B" },
    { id: "44444444-4444-4444-4444-444444444444", fullName: "Umar Faruq", className: "XII-IPS" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Catatan Pelanggaran & Apresiasi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pelaporan kejadian santri, pembobotan poin, dan alur otorisasi berjenjang
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-1.5 text-xs">
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Catatan Baru</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri, judul, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Jenis</option>
            <option value="infraction">Pelanggaran</option>
            <option value="reward">Apresiasi / Prestasi</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Santri</th>
                <th className="py-2.5 px-3">Bentuk Kejadian</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-center">Poin</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Memuat data pelanggaran & prestasi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Belum ada data kejadian yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      <div>{item.studentName ?? "Santri"}</div>
                      <div className="text-[10px] text-slate-400">Pelapor: {item.reporterName ?? "Staf"}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-[260px] truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          item.type === "reward"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.type === "reward" ? `-${item.points}` : `+${item.points}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <InfractionStatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === "pending_approval" ? (
                        <button
                          onClick={() => setSelectedInfraction(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Otorisasi
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InfractionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        rules={rulesData ?? []}
        studentsList={studentsList}
        isLoading={createMutation.isPending}
      />

      <ApprovalModal
        isOpen={!!selectedInfraction}
        onClose={() => setSelectedInfraction(null)}
        infraction={selectedInfraction}
        onApprove={async (id, notes) => {
          await approveMutation.mutateAsync({ id, data: { status: "approved", notes } });
        }}
        onReject={async (id, notes) => {
          await approveMutation.mutateAsync({ id, data: { status: "rejected", notes } });
        }}
        isLoading={approveMutation.isPending}
      />
    </div>
  );
}
