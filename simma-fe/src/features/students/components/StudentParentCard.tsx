import React from "react";
import { Users, Plus, Phone, Briefcase, GraduationCap, MapPin } from "lucide-react";
import type { StudentParentDetail } from "../types";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export interface StudentParentCardProps {
  parents: StudentParentDetail[];
  isLoading: boolean;
  onAddParent: () => void;
}

export const StudentParentCard: React.FC<StudentParentCardProps> = ({
  parents,
  isLoading,
  onAddParent,
}) => {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">
            Data Orang Tua / Wali Siswa
          </h3>
        </div>
        <Button size="sm" variant="outline" onClick={onAddParent}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Tambah Orang Tua / Wali
        </Button>
      </div>

      <div className="pt-3">
        {isLoading ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Memuat data orang tua...
          </div>
        ) : parents.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada data orang tua atau wali yang terhubung dengan siswa ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parents.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <Badge variant="neutral" size="sm">
                      {p.relationType === "ayah"
                        ? "Ayah"
                        : p.relationType === "ibu"
                        ? "Ibu"
                        : "Wali"}
                    </Badge>
                  </div>
                  {p.isGuardian && (
                    <Badge variant="success" size="sm">
                      Wali Utama
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-slate-600 text-[11px]">
                  {p.nik && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">NIK:</span>
                      <span className="font-mono text-slate-700">{p.nik}</span>
                    </div>
                  )}
                  {p.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                  {p.occupation && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{p.occupation}</span>
                    </div>
                  )}
                  {p.education && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      <span>Pendidikan: {p.education}</span>
                    </div>
                  )}
                  {p.address && (
                    <div className="flex items-start gap-1.5 pt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500">{p.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
