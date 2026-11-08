import React, { useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  Plus,
  ShieldCheck,
  Edit2,
} from "lucide-react";
import {
  useStudent,
  useUpdateStudent,
  useStudentParents,
  useCreateAndLinkParent,
} from "../api/students.api";
import type {
  StudentStatus,
  ParentRelationType,
  UpdateStudentDto,
  CreateAndLinkParentDto,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

const STATUS_BADGE_MAP: Record<
  StudentStatus,
  { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string }
> = {
  aktif: { variant: "success", label: "Aktif" },
  lulus: { variant: "info", label: "Lulus" },
  mutasi_keluar: { variant: "warning", label: "Mutasi Keluar" },
  do: { variant: "danger", label: "Drop Out" },
  tidak_aktif: { variant: "danger", label: "Tidak Aktif" },
  aktif_tanpa_rombel: { variant: "neutral", label: "Non-Rombel" },
};

export const StudentDetailPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();

  const { data: student, isLoading: isStudentLoading, isError: isStudentError, error: studentError } =
    useStudent(id);
  const { data: parents = [], isLoading: isParentsLoading } = useStudentParents(id);

  const updateStudentMutation = useUpdateStudent();
  const linkParentMutation = useCreateAndLinkParent();

  // Edit Student Modal
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<StudentStatus>("aktif");
  const [editNisn, setEditNisn] = useState("");
  const [editNis, setEditNis] = useState("");
  const [editStudentError, setEditStudentError] = useState<string | null>(null);

  // Add Parent Modal
  const [isAddParentModalOpen, setIsAddParentModalOpen] = useState(false);
  const [relationType, setRelationType] = useState<ParentRelationType>("ayah");
  const [isGuardian, setIsGuardian] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentNik, setParentNik] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentBirthPlace, setParentBirthPlace] = useState("");
  const [parentBirthDate, setParentBirthDate] = useState("");
  const [parentOccupation, setParentOccupation] = useState("");
  const [parentEducation, setParentEducation] = useState("");
  const [parentIncome, setParentIncome] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [parentFormError, setParentFormError] = useState<string | null>(null);

  const handleOpenEditStudent = () => {
    if (!student) return;
    setEditStatus(student.status);
    setEditNisn(student.nisn || "");
    setEditNis(student.nis || "");
    setEditStudentError(null);
    setIsEditStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setEditStudentError(null);

    if (editNisn.trim() && (editNisn.trim().length !== 10 || !/^\d{10}$/.test(editNisn.trim()))) {
      setEditStudentError("NISN harus tepat 10 digit angka jika diisi.");
      return;
    }

    const payload: UpdateStudentDto = {
      status: editStatus,
      nisn: editNisn.trim() || null,
      nis: editNis.trim() || null,
    };

    try {
      await updateStudentMutation.mutateAsync({ id: student.id, data: payload });
      setIsEditStudentModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setEditStudentError(apiErr?.message || "Gagal memperbarui data siswa.");
    }
  };

  const handleOpenAddParent = () => {
    setRelationType("ayah");
    setIsGuardian(false);
    setParentName("");
    setParentNik("");
    setParentPhone("");
    setParentBirthPlace("");
    setParentBirthDate("");
    setParentOccupation("");
    setParentEducation("");
    setParentIncome("");
    setParentAddress("");
    setParentFormError(null);
    setIsAddParentModalOpen(true);
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setParentFormError(null);

    if (!parentName.trim()) {
      setParentFormError("Nama lengkap orang tua/wali wajib diisi.");
      return;
    }
    if (parentNik.trim() && (parentNik.trim().length !== 16 || !/^\d{16}$/.test(parentNik.trim()))) {
      setParentFormError("NIK orang tua harus tepat 16 digit angka jika diisi.");
      return;
    }

    const payload: CreateAndLinkParentDto = {
      relationType,
      isGuardian,
      parent: {
        name: parentName.trim(),
        nik: parentNik.trim() || null,
        phone: parentPhone.trim() || null,
        birthPlace: parentBirthPlace.trim() || null,
        birthDate: parentBirthDate.trim() || null,
        occupation: parentOccupation.trim() || null,
        education: parentEducation.trim() || null,
        income: parentIncome.trim() || null,
        address: parentAddress.trim() || null,
      },
    };

    try {
      await linkParentMutation.mutateAsync({ studentId: student.id, data: payload });
      setIsAddParentModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setParentFormError(apiErr?.message || "Gagal menambahkan data orang tua/wali.");
    }
  };

  if (isStudentLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">Memuat profil siswa...</div>
    );
  }

  if (isStudentError || !student) {
    return (
      <div className="space-y-4">
        <Link
          to="/students"
          className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Daftar Siswa
        </Link>
        <Card className="p-6 text-center text-xs text-red-600">
          Data siswa tidak ditemukan atau terjadi kesalahan:{" "}
          {(studentError as Error)?.message || "ID tidak valid"}
        </Card>
      </div>
    );
  }

  const statusBadge =
    STATUS_BADGE_MAP[student.status] || {
      variant: "neutral",
      label: student.status,
    };

  return (
    <div className="space-y-4">
      {/* Navigation Back */}
      <div>
        <Link
          to="/students"
          className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Daftar Siswa
        </Link>
      </div>

      {/* Primary Identity Card: Photo strictly isolated here */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-bold text-slate-800">Data Pokok Siswa</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditStudent}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Perbarui Data
            </Button>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Isolated Avatar Box (Strictly in this identity card) */}
          <div className="flex flex-col items-center justify-center w-28 h-32 bg-slate-100 border border-slate-200 rounded-md shrink-0 text-slate-400 p-2 text-center">
            {student.photoPath ? (
              <img
                src={student.photoPath}
                alt={student.fullName}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <>
                <User className="w-10 h-10 mb-1 text-slate-300" />
                <span className="text-[10px] text-slate-400 font-medium">Foto Siswa</span>
              </>
            )}
          </div>

          {/* Core Info Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
              <span className="font-semibold text-slate-900 text-sm">{student.fullName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Status Siswa</span>
              <div className="mt-0.5">
                <Badge variant={statusBadge.variant} size="sm">
                  {statusBadge.label}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Kelas / Rombel</span>
              <span className="font-medium text-slate-800">
                {student.classroom ? student.classroom.name : "Belum ditempatkan"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">NIK</span>
              <span className="font-mono text-slate-700">{student.nik}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">NISN</span>
              <span className="font-mono text-slate-700">{student.nisn || "-"}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">NIS Lokal</span>
              <span className="font-mono text-slate-700">{student.nis || "-"}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Tempat, Tanggal Lahir</span>
              <span className="text-slate-700">
                {student.birthPlace}, {student.birthDate}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Jenis Kelamin</span>
              <span className="text-slate-700">
                {student.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Nama Ibu Kandung</span>
              <span className="text-slate-700">{student.motherName}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Sub-section: Data Orang Tua / Wali */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-sm font-bold text-slate-800">Data Orang Tua / Wali</span>
              <span className="text-xs text-slate-400 ml-2">({parents.length} terhubung)</span>
            </div>
            <Button
              size="sm"
              onClick={handleOpenAddParent}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah Orang Tua / Wali
            </Button>
          </div>
        }
      >
        {isParentsLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Memuat data orang tua/wali...
          </div>
        ) : parents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada data orang tua atau wali yang terhubung dengan siswa ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.map((p) => {
              const relLabel =
                p.relationType === "ayah"
                  ? "Ayah Kandung"
                  : p.relationType === "ibu"
                  ? "Ibu Kandung"
                  : "Wali Siswa";

              return (
                <div
                  key={p.id}
                  className="p-3 rounded-md border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                      <Badge variant="info" size="sm">
                        {relLabel}
                      </Badge>
                    </div>
                    {p.isGuardian && (
                      <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Wali Utama
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-slate-600 pt-1">
                    {p.nik && <div>NIK: <span className="font-mono text-slate-700">{p.nik}</span></div>}
                    {p.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                    {p.occupation && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{p.occupation}</span>
                      </div>
                    )}
                    {p.education && <div>Pendidikan: {p.education}</div>}
                    {p.address && (
                      <div className="col-span-full flex items-start gap-1 pt-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{p.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Edit Status / Identitas Siswa */}
      <Modal
        isOpen={isEditStudentModalOpen}
        onClose={() => setIsEditStudentModalOpen(false)}
        title="Perbarui Data Siswa"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-3">
          {editStudentError && (
            <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {editStudentError}
            </div>
          )}

          <Select
            label="Status Siswa"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "aktif_tanpa_rombel", label: "Aktif Non-Rombel" },
              { value: "lulus", label: "Lulus" },
              { value: "mutasi_keluar", label: "Mutasi Keluar" },
              { value: "tidak_aktif", label: "Tidak Aktif" },
              { value: "do", label: "Drop Out" },
            ]}
          />

          <Input
            label="NISN (10 Digit)"
            value={editNisn}
            onChange={(e) => setEditNisn(e.target.value)}
            maxLength={10}
            placeholder="00xxxxxxxx"
          />

          <Input
            label="NIS Lokal"
            value={editNis}
            onChange={(e) => setEditNis(e.target.value)}
            placeholder="Nomor Induk Siswa lokal"
          />

          <p className="text-[11px] text-slate-500 italic">
            Catatan: Perubahan 6 field identitas primer (NIK, Nama Lengkap, TTL, JK, Nama Ibu) dikunci sesuai aturan regulasi EMIS/Kemenag.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditStudentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={updateStudentMutation.isPending}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Orang Tua / Wali */}
      <Modal
        isOpen={isAddParentModalOpen}
        onClose={() => setIsAddParentModalOpen(false)}
        title="Tambah Orang Tua / Wali"
        maxWidth="lg"
      >
        <form onSubmit={handleAddParent} className="space-y-3">
          {parentFormError && (
            <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {parentFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Hubungan dengan Siswa*"
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as ParentRelationType)}
              options={[
                { value: "ayah", label: "Ayah Kandung" },
                { value: "ibu", label: "Ibu Kandung" },
                { value: "wali", label: "Wali" },
              ]}
              required
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isGuardian}
                  onChange={(e) => setIsGuardian(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                Ditetapkan sebagai Wali Utama
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nama Lengkap Orang Tua / Wali*"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Contoh: Rahmat Hidayat"
              required
            />
            <Input
              label="NIK (16 Digit)"
              value={parentNik}
              onChange={(e) => setParentNik(e.target.value)}
              maxLength={16}
              placeholder="3201xxxxxxxxxxxx"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="No. Telepon / WhatsApp"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
            />
            <Input
              label="Pekerjaan"
              value={parentOccupation}
              onChange={(e) => setParentOccupation(e.target.value)}
              placeholder="PNS / Wiraswasta / Karyawan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Pendidikan Terakhir"
              value={parentEducation}
              onChange={(e) => setParentEducation(e.target.value)}
              placeholder="SMA / S1 / S2"
            />
            <Input
              label="Penghasilan Bulanan"
              value={parentIncome}
              onChange={(e) => setParentIncome(e.target.value)}
              placeholder="Contoh: 3.000.000 - 5.000.000"
            />
          </div>

          <div>
            <Input
              label="Alamat Tempat Tinggal"
              value={parentAddress}
              onChange={(e) => setParentAddress(e.target.value)}
              placeholder="Jl. Raya No. ..., Kelurahan ..., Kecamatan ..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddParentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={linkParentMutation.isPending}
            >
              Simpan & Hubungkan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
