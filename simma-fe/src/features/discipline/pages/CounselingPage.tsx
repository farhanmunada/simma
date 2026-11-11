import { useState } from "react";
import {
  useCounselingSessions,
  useCreateCounselingSession,
  useUpdateCounselingSession,
} from "../api/discipline.api";
import { CounselingFormModal } from "../components/CounselingFormModal";
import { Button } from "../../../components/ui/Button";
import { PlusCircle, Lock, Calendar, CheckCircle, Search, User } from "lucide-react";
import type { CounselingSessionItem } from "../types";

export default function CounselingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: sessionsData, isLoading } = useCounselingSessions({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const createMutation = useCreateCounselingSession();
  const updateMutation = useUpdateCounselingSession();

  const sessions: CounselingSessionItem[] = sessionsData ?? [];

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.studentName?.toLowerCase().includes(q) ||
      s.counselorUsername?.toLowerCase().includes(q) ||
      s.issueCategory.toLowerCase().includes(q) ||
      (s.actionPlan && s.actionPlan.toLowerCase().includes(q))
    );
  });

  const studentsList = [
    { id: "11111111-1111-1111-1111-111111111111", fullName: "Ahmad Dahlan", className: "X-A" },
    { id: "22222222-2222-2222-2222-222222222222", fullName: "Muhammad Hasyim", className: "XI-IPA" },
    { id: "33333333-3333-3333-3333-333333333333", fullName: "Siti Fatimah", className: "X-B" },
    { id: "44444444-4444-4444-4444-444444444444", fullName: "Umar Faruq", className: "XII-IPS" },
  ];

  const handleMarkCompleted = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      data: { status: "selesai" },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Layanan Konseling BK</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendampingan individual santri, konseling kelompok, konferensi kasus, dan rencana tindak lanjut
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-1.5 text-xs">
          <PlusCircle className="w-4 h-4" />
          <span>Jadwalkan Konseling</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri, konselor, atau isu..."
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
          <option value="dijadwalkan">Dijadwalkan</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
          <option value="tindak_lanjut">Tindak Lanjut</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Memuat riwayat bimbingan konseling...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            Belum ada data sesi konseling.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800 text-xs">
                      {item.studentName ?? "Santri"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.isConfidential && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" /> Privat BK
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        item.status === "selesai"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "dijadwalkan"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "tindak_lanjut"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.sessionDate}</span>
                    <span>•</span>
                    <span className="capitalize">{item.sessionType.replace("_", " ")}</span>
                    <span>•</span>
                    <span className="capitalize font-medium text-slate-600">
                      Kategori: {item.issueCategory}
                    </span>
                  </div>

                  <div className="text-slate-800 font-medium text-xs mt-1">
                    {item.problemDescription}
                  </div>

                  {item.counselingNotes && (
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded text-[11px] text-slate-600 italic">
                      "{item.counselingNotes}"
                    </div>
                  )}

                  {item.actionPlan && (
                    <div className="text-[11px] text-slate-600 pt-1">
                      <span className="font-semibold text-slate-700">Rencana Tindak Lanjut: </span>
                      {item.actionPlan}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Konselor: {item.counselorUsername ?? "Guru BK"}</span>
                {item.status !== "selesai" && (
                  <button
                    onClick={() => handleMarkCompleted(item.id)}
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded transition"
                  >
                    <CheckCircle className="w-3 h-3" /> Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CounselingFormModal
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
