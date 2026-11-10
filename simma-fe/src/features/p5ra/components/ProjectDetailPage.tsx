import React, { useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Users,
  BarChart3,
  Layers,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { TargetFormModal } from "./TargetFormModal";
import { ProjectFormModal } from "./ProjectFormModal";
import {
  useP5raProjectDetail,
  useUpdateP5raProject,
  useCreateP5raTarget,
  useDeleteP5raTarget,
} from "../api/p5ra.api";

export const ProjectDetailPage: React.FC = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  const { data: project, isLoading } = useP5raProjectDetail(projectId);
  const updateProjectMutation = useUpdateP5raProject(projectId);
  const createTargetMutation = useCreateP5raTarget(projectId);
  const deleteTargetMutation = useDeleteP5raTarget(projectId);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Memuat detail projek P5RA...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Projek P5RA tidak ditemukan.
      </div>
    );
  }

  const handleAddTarget = async (data: Parameters<typeof createTargetMutation.mutateAsync>[0]) => {
    try {
      await createTargetMutation.mutateAsync(data);
      setIsAddTargetOpen(false);
    } catch (err) {
      console.error("Gagal menambahkan target:", err);
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (window.confirm("Hapus target capaian ini?")) {
      await deleteTargetMutation.mutateAsync(targetId);
    }
  };

  const handleUpdateProject = async (data: Parameters<typeof updateProjectMutation.mutateAsync>[0]) => {
    try {
      await updateProjectMutation.mutateAsync(data);
      setIsEditProjectOpen(false);
    } catch (err) {
      console.error("Gagal memperbarui projek:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/p5ra"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar Projek
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/p5ra/${projectId}/recap`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              Rekap & Rapor
            </Button>
          </Link>
          <Link to={`/p5ra/${projectId}/assess`}>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Input Penilaian
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
                {project.theme}
              </span>
              <Badge variant="info">Fase {project.targetFase}</Badge>
              <Badge variant={project.status === "active" ? "success" : "neutral"}>
                {project.status.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditProjectOpen(true)}
            className="gap-1.5 text-xs self-start"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Rombongan Belajar (Rombel):</span>
            <div className="flex flex-wrap gap-1.5">
              {project.classrooms?.length ? (
                project.classrooms.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200"
                  >
                    {c.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">Belum ada kelas yang dialokasikan</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Rentang Pelaksanaan:</span>
            <span className="text-slate-700 font-medium">
              {project.startDate || "Belum diatur"} s.d. {project.endDate || "Belum diatur"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Target Capaian Dimensi & Elemen ({project.targets?.length || 0})
            </h2>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddTargetOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Target
          </Button>
        </div>

        {!project.targets || project.targets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada target capaian dimensi yang ditambahkan. Klik "Tambah Target" untuk memasukkan dimensi dan elemen Kemenag.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {project.targets.map((target, idx) => (
              <div key={target.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                      #{idx + 1} {target.dimension}
                    </span>
                    {target.valuePra && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                        PRA: {target.valuePra} {target.subValuePra ? `(${target.subValuePra})` : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">
                    {target.element} <span className="text-slate-400 font-normal">→</span> {target.subElement}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {target.targetDescription}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTarget(target.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
                  title="Hapus Target"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TargetFormModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        onSubmit={handleAddTarget}
        isLoading={createTargetMutation.isPending}
      />

      <ProjectFormModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
        isLoading={updateProjectMutation.isPending}
        initialData={project}
      />
    </div>
  );
};
