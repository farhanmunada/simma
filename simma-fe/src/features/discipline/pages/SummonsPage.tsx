import { useState } from "react";
import {
  useParentSummons,
  useCreateParentSummon,
  useUpdateParentSummon,
  downloadSummonPdf,
} from "../api/discipline.api";
import { ParentSummonModal } from "../components/ParentSummonModal";
import { Button } from "../../../components/ui/Button";
import { PlusCircle, Printer, Calendar, Clock, MapPin, Search } from "lucide-react";
import type { ParentSummonItem } from "../types";

export default function SummonsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: summonsData, isLoading } = useParentSummons({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const createMutation = useCreateParentSummon();
  const updateMutation = useUpdateParentSummon();

  const summons: ParentSummonItem[] = summonsData ?? [];

  const filtered = summons.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.parentName.toLowerCase().includes(q) ||
      item.letterNumber.toLowerCase().includes(q)
    );
  });

  const studentsList = [
    { id: "11111111-1111-1111-1111-111111111111", fullName: "Ahmad Dahlan", className: "X-A" },
    { id: "22222222-2222-2222-2222-222222222222", fullName: "Muhammad Hasyim", className: "XI-IPA" },
    { id: "33333333-3333-3333-3333-333333333333", fullName: "Siti Fatimah", className: "X-B" },
    { id: "44444444-4444-4444-4444-444444444444", fullName: "Umar Faruq", className: "XII-IPS" },
  ];

  const handleDownloadPdf = async (id: string, letterNumber: string) => {
    try {
      setDownloadingId(id);
      await downloadSummonPdf(id, letterNumber);
    } catch (err) {
      console.error("Gagal mendownload PDF surat panggilan:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleMarkAttended = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      data: { status: "hadir" },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Surat Pemanggilan Orang Tua / Wali</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan surat resmi format dinas Kemenag, rekam jejak pengiriman, dan kehadiran wali
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-1.5 text-xs">
          <PlusCircle className="w-4 h-4" />
          <span>Terbitkan Surat Panggilan</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri, wali, nomor surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
        >
          <option value="all">Semua Status</option>
          <option value="terbit">Terbit</option>
          <option value="terkirim">Terkirim</option>
          <option value="hadir">Hadir</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">No. Surat & Tanggal</th>
                <th className="py-2.5 px-3">Santri & Wali</th>
                <th className="py-2.5 px-3">Jadwal Kehadiran</th>
                <th className="py-2.5 px-3">Lokasi / Ruang</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Memuat daftar surat panggilan orang tua...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Belum ada surat pemanggilan orang tua yang diterbitkan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-800 text-[11px]">
                        {item.letterNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.createdAt.slice(0, 10)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{item.studentName ?? "Santri"}</div>
                      <div className="text-[11px] text-slate-500">Wali: {item.parentName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.summonDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.summonTime} WIB</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          item.status === "hadir"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "terbit"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "terkirim"
                            ? "bg-purple-100 text-purple-800"
                            : item.status === "selesai"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf(item.id, item.letterNumber)}
                          disabled={downloadingId === item.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition"
                          title="Cetak Surat Panggilan PDF"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>{downloadingId === item.id ? "Mengunduh..." : "Cetak PDF"}</span>
                        </button>
                        {item.status !== "hadir" && item.status !== "selesai" && (
                          <button
                            onClick={() => handleMarkAttended(item.id)}
                            disabled={updateMutation.isPending}
                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded transition"
                          >
                            Hadir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ParentSummonModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        studentsList={studentsList}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
