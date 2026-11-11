import { useState } from "react";
import {
  useDisciplineRules,
  useCreateDisciplineRule,
  useUpdateDisciplineRule,
} from "../api/discipline.api";
import { RuleFormModal } from "../components/RuleFormModal";
import { Button } from "../../../components/ui/Button";
import { PlusCircle, Edit, Search, CheckCircle, XCircle } from "lucide-react";
import type { DisciplineRuleItem } from "../types";

export default function RulesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DisciplineRuleItem | null>(null);

  const { data: rulesData, isLoading } = useDisciplineRules({
    type: typeFilter !== "all" ? (typeFilter as any) : undefined,
  });

  const createMutation = useCreateDisciplineRule();
  const updateMutation = useUpdateDisciplineRule();

  const rules: DisciplineRuleItem[] = rulesData ?? [];

  const filtered = rules.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const handleEditClick = (rule: DisciplineRuleItem) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (rule: DisciplineRuleItem) => {
    await updateMutation.mutateAsync({
      id: rule.id,
      data: { isActive: !rule.isActive },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Katalog Master Tata Tertib</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar aturan madrasah, klasifikasi pelanggaran, pembobotan poin, dan apresiasi keteladanan
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Aturan Baru</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, judul, atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
        >
          <option value="all">Semua Jenis Aturan</option>
          <option value="infraction">Pelanggaran</option>
          <option value="reward">Apresiasi / Prestasi</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Kode</th>
                <th className="py-2.5 px-3">Aturan / Deskripsi</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-center">Poin</th>
                <th className="py-2.5 px-3 text-center">Default Sanksi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Memuat katalog aturan tata tertib...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Belum ada aturan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {rule.code}
                    </td>
                    <td className="py-2.5 px-3 max-w-[280px]">
                      <div className="font-semibold text-slate-800">{rule.name}</div>
                      {rule.description && (
                        <div className="text-[10px] text-slate-400 truncate">{rule.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600">{rule.category}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          rule.type === "reward"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {rule.type === "reward" ? `-${rule.points}` : `+${rule.points}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center capitalize text-slate-600 text-[11px]">
                      {rule.defaultSanction ? rule.defaultSanction.replace("_", " ") : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                          rule.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {rule.isActive ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5" /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RuleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        initialData={editingRule}
        onSubmit={async (data) => {
          if (editingRule) {
            await updateMutation.mutateAsync({ id: editingRule.id, data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
