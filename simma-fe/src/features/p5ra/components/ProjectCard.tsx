import React from "react";
import { Link } from "react-router";
import { Calendar, Users, ArrowRight, Trash2 } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { P5raProjectItem } from "../types";

interface ProjectCardProps {
  project: P5raProjectItem;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Aktif</Badge>;
      case "completed":
        return <Badge variant="neutral">Selesai</Badge>;
      default:
        return <Badge variant="warning">Draft</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
            {project.theme}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="info">Fase {project.targetFase}</Badge>
            {getStatusBadge(project.status)}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2">
          {project.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {project.startDate ? `${project.startDate} s.d.` : "Periode fleksibel"} {project.endDate || ""}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5"
              title="Hapus Projek"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/p5ra/${project.id}/assess`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Penilaian
            </Button>
          </Link>
          <Link to={`/p5ra/${project.id}`}>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              Detail
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
