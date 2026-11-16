import React, { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import type { TeacherDocumentDto } from "../types";
import { useAddDocument, useDeleteDocument } from "../api/teachers.api";

interface TeacherDocumentTabProps {
  teacherId: string;
  documents: TeacherDocumentDto[];
}

export const TeacherDocumentTab: React.FC<TeacherDocumentTabProps> = ({ teacherId, documents }) => {
  const addDoc = useAddDocument(teacherId);
  const delDoc = useDeleteDocument(teacherId);

  const [docType, setDocType] = useState("ijazah");
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docUrl) return;
    await addDoc.mutateAsync({
      documentType: docType as any,
      title: docTitle,
      fileUrl: docUrl,
      verificationStatus: "verified",
    });
    setDocTitle("");
    setDocUrl("");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateDoc} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-2 items-center text-sm">
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-2 py-1.5 border rounded bg-white text-xs">
          <option value="«redacted:sk_…»">SK Pengangkatan</option>
          <option value="«redacted:sk_…»">SK Pembagian Tugas</option>
          <option value="ijazah">Ijazah</option>
          <option value="sertifikat_pendidik">Sertifikat Pendidik</option>
          <option value="lainnya">Lainnya</option>
        </select>
        <input type="text" placeholder="Judul Dokumen" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[140px]" required />
        <input type="url" placeholder="File URL / Cloud Link" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[140px]" required />
        <button type="submit" disabled={addDoc.isPending} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium flex items-center gap-1 hover:bg-blue-700">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </form>
      <div className="divide-y divide-gray-100">
        {documents.map((dc) => (
          <div key={dc.id} className="py-2.5 flex items-center justify-between text-sm">
            <div>
              <a href={dc.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{dc.title}</a>
              <p className="text-xs text-gray-500 capitalize">{dc.documentType.replace(/_/g, " ")}</p>
            </div>
            <button onClick={() => delDoc.mutate(dc.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {documents.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Belum ada berkas digital terunggah.</p>}
      </div>
    </div>
  );
};
