import React, { useState } from "react";
import { UserPlus, Trash2, Filter } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import type {
  ExtracurricularItem,
  ExtracurricularMemberItem,
  CreateExtracurricularMemberInput,
} from "../types";

interface Props {
  members: ExtracurricularMemberItem[];
  extracurriculars: ExtracurricularItem[];
  isLoading: boolean;
  onRegister: (data: CreateExtracurricularMemberInput) => void;
  onDeleteMember: (id: string) => void;
  isRegistering: boolean;
}

export const ExtracurricularMembersTab: React.FC<Props> = ({
  members,
  extracurriculars,
  isLoading,
  onRegister,
  onDeleteMember,
  isRegistering,
}) => {
  const [selectedEkskul, setSelectedEkskul] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState("");
  const [extracurricularId, setExtracurricularId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("00000000-0000-0000-0000-000000000001");
  const [semester, setSemester] = useState<"ganjil" | "genap">("ganjil");
  const [role, setRole] = useState<"MEMBER" | "LEADER" | "SECRETARY">("MEMBER");

  const filteredMembers = members.filter((m) => {
    return selectedEkskul === "ALL" || m.extracurricularId === selectedEkskul;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !extracurricularId) return;

    onRegister({
      studentId,
      extracurricularId,
      academicYearId,
      semester,
      role,
      joinedDate: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
    });
    setIsModalOpen(false);
    setStudentId("");
  };

  return (
    <div className="space-y-4">
      {/* Filters and action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedEkskul}
            onChange={(e) => setSelectedEkskul(e.target.value)}
            aria-label="Filter Ekstrakurikuler"
            className="h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Ekstrakurikuler</option>
            {extracurriculars.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Daftarkan Santri
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3">NISN / NIS</th>
                <th className="px-4 py-3">Ekstrakurikuler</th>
                <th className="px-4 py-3 text-center">Peran</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Memuat data anggota santri...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Belum ada santri terdaftar pada ekstrakurikuler yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {m.studentName || "Santri"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {m.studentNisn || m.studentNis || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {m.extracurricularName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={m.role === "LEADER" ? "warning" : "neutral"} size="sm">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={m.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                        {m.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteMember(m.id)}
                        className="text-slate-600 hover:text-red-600"
                        title="Hapus Keanggotaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pendaftaran */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan Santri ke Ekstrakurikuler"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
          <Input
            label="ID Siswa / UUID Santri"
            placeholder="Masukkan UUID Santri"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

          <Select
            label="Pilih Ekstrakurikuler"
            value={extracurricularId}
            onChange={(e) => setExtracurricularId(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Ekskul --" },
              ...extracurriculars
                .filter((e) => e.isActive)
                .map((e) => ({ value: e.id, label: `${e.name} (${e.category})` })),
            ]}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value as any)}
              options={[
                { value: "ganjil", label: "Ganjil" },
                { value: "genap", label: "Genap" },
              ]}
            />
            <Select
              label="Peran"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: "MEMBER", label: "Anggota (Member)" },
                { value: "LEADER", label: "Ketua (Leader)" },
                { value: "SECRETARY", label: "Sekretaris" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isRegistering}>
              Daftarkan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
