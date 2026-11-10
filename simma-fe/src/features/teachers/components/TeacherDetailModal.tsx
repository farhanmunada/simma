import React, { useState } from "react";
import { X, GraduationCap, Award, FileText, User, Plus, Trash2 } from "lucide-react";
import {
  useTeacherDetail,
  useAddEducation,
  useDeleteEducation,
  useAddRank,
  useDeleteRank,
  useAddDocument,
  useDeleteDocument,
} from "../api/teachers.api";

interface TeacherDetailModalProps {
  teacherId: string | null;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({ teacherId, onClose }) => {
  const [activeTab, setActiveTab] = useState<"bio" | "edu" | "rank" | "doc">("bio");
  const { data: teacher, isLoading } = useTeacherDetail(teacherId || "");

  const addEdu = useAddEducation(teacherId || "");
  const delEdu = useDeleteEducation(teacherId || "");
  const addRank = useAddRank(teacherId || "");
  const delRank = useDeleteRank(teacherId || "");
  const addDoc = useAddDocument(teacherId || "");
  const delDoc = useDeleteDocument(teacherId || "");

  // Form states
  const [eduLevel, setEduLevel] = useState("S1");
  const [eduInst, setEduInst] = useState("");
  const [eduMajor, setEduMajor] = useState("");
  const [eduYear, setEduYear] = useState(2020);

  const [rankName, setRankName] = useState("Penata Muda");
  const [rankGroup, setRankGroup] = useState("III/a");
  const [rankSk, setRankSk] = useState("");
  const [rankDate, setRankDate] = useState("");
  const [rankTmt, setRankTmt] = useState("");

  const [docType, setDocType] = useState("ijazah");
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  if (!teacherId) return null;

  const handleCreateEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInst || !eduMajor) return;
    await addEdu.mutateAsync({
      level: eduLevel as any,
      institution: eduInst,
      major: eduMajor,
      graduationYear: Number(eduYear),
      isLinear: true,
    });
    setEduInst("");
    setEduMajor("");
  };

  const handleCreateRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankSk || !rankTmt) return;
    await addRank.mutateAsync({
      rank: rankName,
      gradeGroup: rankGroup as any,
      skNumber: rankSk,
      skDate: rankDate || rankTmt,
      tmtRank: rankTmt,
      isCurrent: true,
    });
    setRankSk("");
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{teacher?.fullName || "Detail GTK"}</h3>
            <p className="text-xs text-gray-500">NIK: {teacher?.nik} • Status: {teacher?.employmentType}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
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
            <GraduationCap className="w-4 h-4" /> Pendidikan ({teacher?.educations.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("rank")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "rank" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="w-4 h-4" /> Kepangkatan ({teacher?.ranks.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("doc")}
            className={`py-3 border-b-2 flex items-center gap-2 ${
              activeTab === "doc" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Brankas Digital ({teacher?.documents.length || 0})
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
              {activeTab === "bio" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">NIP</span>
                    <span className="font-medium text-gray-800">{teacher.profile?.nip || "-"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">NUPTK</span>
                    <span className="font-medium text-gray-800">{teacher.nuptk || "-"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">NRG / Sertifikasi</span>
                    <span className="font-medium text-gray-800">{teacher.profile?.nrg || teacher.certification || "Belum Tersertifikasi"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">PegID Simpatika</span>
                    <span className="font-medium text-gray-800">{teacher.profile?.pegId || "-"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Jenis PTK</span>
                    <span className="font-medium text-gray-800 capitalize">{teacher.profile?.gtkType || "pendidik"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Status Tugas</span>
                    <span className="font-medium text-gray-800 capitalize">{teacher.profile?.dutyStatus || "aktif"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Kontak Telepon</span>
                    <span className="font-medium text-gray-800">{teacher.profile?.phone || "-"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Email Madrasah</span>
                    <span className="font-medium text-gray-800">{teacher.profile?.email || "-"}</span>
                  </div>
                </div>
              )}

              {activeTab === "edu" && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateEdu} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-wrap gap-2 items-center text-sm">
                    <select value={eduLevel} onChange={(e) => setEduLevel(e.target.value)} className="px-2 py-1.5 border rounded bg-white text-xs">
                      <option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
                    </select>
                    <input type="text" placeholder="Institusi / Kampus" value={eduInst} onChange={(e) => setEduInst(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[140px]" required />
                    <input type="text" placeholder="Jurusan / Prodi" value={eduMajor} onChange={(e) => setEduMajor(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[140px]" required />
                    <input type="number" placeholder="Tahun Lulus" value={eduYear} onChange={(e) => setEduYear(Number(e.target.value))} className="w-20 px-2 py-1.5 border rounded text-xs" required />
                    <button type="submit" disabled={addEdu.isPending} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium flex items-center gap-1 hover:bg-emerald-700">
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </form>
                  <div className="divide-y divide-gray-100">
                    {teacher.educations.map((ed) => (
                      <div key={ed.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold text-gray-800">{ed.level} {ed.major}</span>
                          <p className="text-xs text-gray-500">{ed.institution} • Lulus {ed.graduationYear}</p>
                        </div>
                        <button onClick={() => delEdu.mutate(ed.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {teacher.educations.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Belum ada riwayat pendidikan terdata.</p>}
                  </div>
                </div>
              )}

              {activeTab === "rank" && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateRank} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-wrap gap-2 items-center text-sm">
                    <input type="text" placeholder="Nama Pangkat" value={rankName} onChange={(e) => setRankName(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[120px]" required />
                    <input type="text" placeholder="Golongan (III/a)" value={rankGroup} onChange={(e) => setRankGroup(e.target.value)} className="w-24 px-2 py-1.5 border rounded text-xs" required />
                    <input type="text" placeholder="Nomor SK" value={rankSk} onChange={(e) => setRankSk(e.target.value)} className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[120px]" required />
                    <input type="date" value={rankTmt} onChange={(e) => setRankTmt(e.target.value)} className="px-2 py-1.5 border rounded text-xs" required />
                    <button type="submit" disabled={addRank.isPending} className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium flex items-center gap-1 hover:bg-purple-700">
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </form>
                  <div className="divide-y divide-gray-100">
                    {teacher.ranks.map((rk) => (
                      <div key={rk.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold text-gray-800">{rk.gradeGroup} - {rk.rank} {rk.isCurrent && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Aktif</span>}</span>
                          <p className="text-xs text-gray-500">SK: {rk.skNumber} • TMT: {rk.tmtRank} • KGB Berikutnya: {rk.nextKgbDate || "-"}</p>
                        </div>
                        <button onClick={() => delRank.mutate(rk.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {teacher.ranks.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Belum ada riwayat kepangkatan terdata.</p>}
                  </div>
                </div>
              )}

              {activeTab === "doc" && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateDoc} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-2 items-center text-sm">
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className="px-2 py-1.5 border rounded bg-white text-xs">
                      <option value="sk_pengangkatan">SK Pengangkatan</option>
                      <option value="sk_pembagian_tugas">SK Pembagian Tugas</option>
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
                    {teacher.documents.map((dc) => (
                      <div key={dc.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <a href={dc.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">{dc.title}</a>
                          <p className="text-xs text-gray-500 capitalize">{dc.documentType.replace(/_/g, " ")}</p>
                        </div>
                        <button onClick={() => delDoc.mutate(dc.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {teacher.documents.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Belum ada berkas digital terunggah.</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
