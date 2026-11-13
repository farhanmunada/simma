import React, { useState } from "react";
import { X, GraduationCap, Award, FileText, User, Edit3, Trash2 } from "lucide-react";
import { useTeacherDetail } from "../api/teachers.api";
import type { TeacherListItem } from "../types";
import { TeacherBioTab } from "./TeacherBioTab";
import { TeacherEducationTab } from "./TeacherEducationTab";
import { TeacherRankTab } from "./TeacherRankTab";
import { TeacherDocumentTab } from "./TeacherDocumentTab";

interface TeacherDetailModalProps {
  teacherId: string | null;
  onClose: () => void;
  onEdit?: (teacher: TeacherListItem) => void;
  onDelete?: (id: string, name: string) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacherId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"bio" | "edu" | "rank" | "doc">("bio");
  const { data: teacher, isLoading } = useTeacherDetail(teacherId || "");

  if (!teacherId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{teacher?.fullName || "Detail GTK"}</h3>
            <p className="text-xs text-gray-500">NIK: {teacher?.nik} • Status: {teacher?.employmentType}</p>
          </div>
          <div className="flex items-center gap-2">
            {teacher && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(teacher);
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Data
              </button>
            )}
            {teacher && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(teacher.id, teacher.fullName);
                }}
                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200 px-6 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("bio")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "bio" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4" /> Biodata & SK
          </button>
          <button
            onClick={() => setActiveTab("edu")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "edu" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Pendidikan ({teacher?.educations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("rank")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "rank" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="w-4 h-4" /> Kepangkatan ({teacher?.ranks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("doc")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "doc" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Brankas Digital ({teacher?.documents?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400">Memuat rincian GTK...</div>
          ) : !teacher ? (
            <div className="py-12 text-center text-gray-400">Data GTK tidak ditemukan.</div>
          ) : (
            <>
              {activeTab === "bio" && <TeacherBioTab teacher={teacher} />}
              {activeTab === "edu" && (
                <TeacherEducationTab teacherId={teacher.id} educations={teacher.educations || []} />
              )}
              {activeTab === "rank" && (
                <TeacherRankTab teacherId={teacher.id} ranks={teacher.ranks || []} />
              )}
              {activeTab === "doc" && (
                <TeacherDocumentTab teacherId={teacher.id} documents={teacher.documents || []} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
