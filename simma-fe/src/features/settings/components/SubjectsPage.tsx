import React, { useState } from "react";
import { Plus, AlertCircle, BookOpen } from "lucide-react";
import { useSubjects, useCreateSubject } from "../api/settings.api";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

const SUBJECT_GROUPS = [
  { value: "Pendidikan Agama Islam", label: "Pendidikan Agama Islam (PAI Kemenag)" },
  { value: "Kelompok A Umum", label: "Kelompok A (Umum)" },
  { value: "Kelompok B Umum", label: "Kelompok B (Umum)" },
  { value: "Kelompok C Peminatan", label: "Kelompok C (Peminatan)" },
];

export const SubjectsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("Pendidikan Agama Islam");
  const [phase, setPhase] = useState<"E" | "F">("E");
  const [jpPerWeek, setJpPerWeek] = useState<number>(2);
  const [isRequired, setIsRequired] = useState<string>("true");

  const queryParams = React.useMemo(() => {
    return {
      ...(selectedPhase ? { phase: selectedPhase as "E" | "F" } : {}),
    };
  }, [selectedPhase]);

  const { data: subjectsRaw = [], isLoading, isError, error } = useSubjects(queryParams);
  const createMutation = useCreateSubject();

  // Filter by group on client if selected
  const subjects = React.useMemo(() => {
    if (!selectedGroup) return subjectsRaw;
    return subjectsRaw.filter((s) => s.group.toLowerCase().includes(selectedGroup.toLowerCase()));
  }, [subjectsRaw, selectedGroup]);

  const handleOpenModal = () => {
    setCode("");
    setName("");
    setGroup("Pendidikan Agama Islam");
    setPhase("E");
    setJpPerWeek(2);
    setIsRequired("true");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim()) {
      setFormError("Kode dan nama mata pelajaran wajib diisi.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        group,
        phase,
        jpPerWeek: Number(jpPerWeek) || 2,
        isRequired: isRequired === "true",
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan mata pelajaran.");
    }
  };

  const getGroupBadge = (grp: string) => {
    if (grp.toLowerCase().includes("agama") || grp.toLowerCase().includes("pai")) {
      return <Badge variant="success" size="sm">PAI Kemenag</Badge>;
    }
    if (grp.toLowerCase().includes("peminatan") || grp.includes("C")) {
      return <Badge variant="warning" size="sm">Peminatan</Badge>;
    }
    return <Badge variant="info" size="sm">Umum</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Mata Pelajaran</h1>
          <p className="text-xs text-slate-500">
            Kelola kurikulum, beban JP, dan mapel PAI (Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab)
          </p>
        </div>
        <Button onClick={handleOpenModal} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
        <div className="w-64">
          <Select
            options={[
              { value: "", label: "Semua Kelompok Mapel" },
              ...SUBJECT_GROUPS,
            ]}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            options={[
              { value: "", label: "Semua Fase" },
              { value: "E", label: "Fase E (Kelas 10)" },
              { value: "F", label: "Fase F (Kelas 11-12)" },
            ]}
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
          />
        </div>
        {(selectedGroup || selectedPhase) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedGroup("");
              setSelectedPhase("");
            }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data mata pelajaran...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada data mata pelajaran. Klik tombol Tambah Mata Pelajaran untuk mendaftarkan mapel baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4 w-28">Kode</th>
                  <th className="py-2.5 px-4">Nama Mata Pelajaran</th>
                  <th className="py-2.5 px-4">Kelompok</th>
                  <th className="py-2.5 px-4 text-center">Fase</th>
                  <th className="py-2.5 px-4 text-center">Beban (JP)</th>
                  <th className="py-2.5 px-4 text-center">Sifat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700 text-xs">{item.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 px-4">{getGroupBadge(item.group)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-semibold text-slate-700">Fase {item.phase}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-700">
                      {item.jpPerWeek} JP / mgg
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {item.isRequired ? (
                        <Badge variant="neutral" size="sm">
                          Wajib
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pilihan
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tambah Mata Pelajaran Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                label="Kode Mapel"
                placeholder="Contoh: QUR-10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Nama Mata Pelajaran"
                placeholder="Contoh: Al-Qur'an Hadis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <Select
            label="Kelompok Mata Pelajaran"
            options={SUBJECT_GROUPS}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Fase Kurikulum"
              options={[
                { value: "E", label: "Fase E (Kelas 10)" },
                { value: "F", label: "Fase F (Kelas 11-12)" },
              ]}
              value={phase}
              onChange={(e) => setPhase(e.target.value as "E" | "F")}
              required
            />
            <Input
              type="number"
              label="Beban Belajar (JP/Minggu)"
              min={1}
              max={20}
              value={jpPerWeek}
              onChange={(e) => setJpPerWeek(Number(e.target.value))}
              required
            />
            <Select
              label="Sifat Mapel"
              options={[
                { value: "true", label: "Wajib" },
                { value: "false", label: "Pilihan" },
              ]}
              value={isRequired}
              onChange={(e) => setIsRequired(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={createMutation.isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
