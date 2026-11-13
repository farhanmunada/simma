import React, { useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { ProjectCard } from "./ProjectCard";
import { ProjectFormModal } from "./ProjectFormModal";
import {
  useP5raProjects,
  useCreateP5raProject,
  useDeleteP5raProject,
} from "../api/p5ra.api";
import { P5RA_THEMES } from "@simma/shared";

export const ProjectsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: projects = [], isLoading } = useP5raProjects({
    theme: selectedTheme || undefined,
    status: selectedStatus || undefined,
  });

  const createMutation = useCreateP5raProject();
  const deleteMutation = useDeleteP5raProject();

  const handleCreate = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Gagal membuat projek P5RA:", err);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus projek ini beserta target capaiannya?")) {
      await deleteMutation.mutateAsync(projectId);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Projek P5RA Madrasah
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin (KMA 347/450)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2 self-start sm:self-auto"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Buat Projek Baru
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul atau tema projek..."
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-60">
          <Select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            options={[
              { label: "Semua Tema Kemenag", value: "" },
              ...P5RA_THEMES.map((t) => ({ label: t, value: t })),
            ]}
          />
        </div>
        <div className="w-full md:w-44">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { label: "Semua Status", value: "" },
              { label: "Draft", value: "draft" },
              { label: "Aktif", value: "active" },
              { label: "Selesai", value: "completed" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Memuat daftar projek P5RA...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">Belum Ada Projek P5RA</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai rancang tema dan target capaian projek profil pelajar Pancasila untuk semester berjalan.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Projek Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
