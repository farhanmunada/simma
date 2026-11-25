import React, { useState } from "react";
import { X, Edit2, Trash2, KeyRound, CheckCircle2 } from "lucide-react";
import { GTK_ROLE_OPTIONS } from "@simma/shared";
import { useTeacherDetail, useResetTeacherPassword } from "../api/teachers.api";
import type { TeacherFullDetailDto } from "../types";
import { TeacherBioTab } from "./TeacherBioTab";
import { TeacherEducationTab } from "./TeacherEducationTab";
import { TeacherRankTab } from "./TeacherRankTab";
import { TeacherDocumentTab } from "./TeacherDocumentTab";

interface TeacherDetailModalProps {
  teacherId: string | null;
  onClose: () => void;
  onEdit: (teacher: TeacherFullDetailDto) => void;
  onDelete: (id: string, name: string) => void;
}

const roleLabelMap = new Map(GTK_ROLE_OPTIONS.map((r) => [r.role, r.label]));

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacherId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { data: teacher, isLoading } = useTeacherDetail(teacherId || "");
  const resetPasswordMutation = useResetTeacherPassword();
  const [activeTab, setActiveTab] = useState<"bio" | "education" | "rank" | "documents">("bio");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  if (!teacherId) return null;

  const handleResetPassword = async () => {
    if (!teacher) return;
    if (!window.confirm(`Reset password akun ${teacher.fullName} ke kode ${teacher.employeeCode || "akun"}?`)) {
      return;
    }
    const res = await resetPasswordMutation.mutateAsync(teacher.id);
    setResetMessage(`Password direset ke kode ${res.data.employeeCode}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100 my-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
          <div className="min-w-0 pr-4">
            {isLoading || !teacher ? (
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {teacher.employeeCode && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-widest">
                      {teacher.employeeCode}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 truncate">{teacher.fullName}</h3>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {teacher.position?.name || "Pendidik & Tenaga Kependidikan"} &bull;{" "}
                  {teacher.account?.role ? roleLabelMap.get(teacher.account.role) || teacher.account.role : "Belum ada role"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {teacher && (
              <>
                {teacher.account && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                    title="Reset Password ke Kode 4 Digit"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Password</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(teacher)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(teacher.id, teacher.fullName)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Hapus GTK"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-3 border-b border-gray-100 flex gap-2 bg-gray-50/50 overflow-x-auto">
          {[
            { id: "bio", label: "Biodata & Penugasan" },
            { id: "education", label: `Riwayat Pendidikan (${teacher?.educations?.length || 0})` },
            { id: "rank", label: `Kepangkatan (${teacher?.ranks?.length || 0})` },
            { id: "documents", label: `Dokumen (${teacher?.documents?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4">
          {resetMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetMessage}</span>
            </div>
          )}

          {isLoading || !teacher ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat detail GTK...</div>
          ) : (
            <>
              {activeTab === "bio" && <TeacherBioTab teacher={teacher} />}
              {activeTab === "education" && (
                <TeacherEducationTab teacherId={teacher.id} educations={teacher.educations || []} />
              )}
              {activeTab === "rank" && (
                <TeacherRankTab teacherId={teacher.id} ranks={teacher.ranks || []} />
              )}
              {activeTab === "documents" && (
                <TeacherDocumentTab teacherId={teacher.id} documents={teacher.documents || []} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
