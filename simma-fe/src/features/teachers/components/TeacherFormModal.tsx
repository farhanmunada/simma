import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  EMPLOYMENT_TYPES,
  GTK_TYPES,
  DUTY_STATUSES,
  type EmploymentType,
  type GtkType,
  type DutyStatus,
} from "@simma/shared";
import type { TeacherListItem, TeacherProfileDto } from "../types";
import { usePositions } from "../api/teachers.api";

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: TeacherListItem | null;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { data: positions = [] } = usePositions();
  const [fullName, setFullName] = useState("");
  const [positionId, setPositionId] = useState<string>("");
  const [nik, setNik] = useState("");
  const [nuptk, setNuptk] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("GTY");
  const [certification, setCertification] = useState("");
  const [nip, setNip] = useState("");
  const [pegId, setPegId] = useState("");
  const [nrg, setNrg] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [gtkType, setGtkType] = useState<GtkType>("pendidik");
  const [dutyStatus, setDutyStatus] = useState<DutyStatus>("aktif");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      setPositionId(initialData.positionId || "");
      setNik(initialData.nik || "");
      setNuptk(initialData.nuptk || "");
      setEmploymentType(initialData.employmentType || "GTY");
      setCertification(initialData.certification || "");
      const p = initialData.profile;
      setNip(p?.nip || "");
      setPegId(p?.pegId || "");
      setNrg(p?.nrg || "");
      setGender((p?.gender as "L" | "P") || "L");
      setGtkType(p?.gtkType || "pendidik");
      setDutyStatus(p?.dutyStatus || "aktif");
      setPhone(p?.phone || "");
      setEmail(p?.email || "");
    } else {
      setFullName("");
      setPositionId("");
      setNik("");
      setNuptk("");
      setEmploymentType("GTY");
      setCertification("");
      setNip("");
      setPegId("");
      setNrg("");
      setGender("L");
      setGtkType("pendidik");
      setDutyStatus("aktif");
      setPhone("");
      setEmail("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setError("Nama lengkap wajib diisi");
    if (nik.length !== 16) return setError("NIK harus tepat 16 digit");

    setLoading(true);
    setError(null);
    try {
      const payload = {
        fullName: fullName.trim(),
        positionId: positionId || null,
        nik: nik.trim(),
        nuptk: nuptk.trim() || null,
        employmentType,
        certification: certification.trim() || null,
        profile: {
          nip: nip.trim() || null,
          pegId: pegId.trim() || null,
          nrg: nrg.trim() || null,
          gender,
          gtkType,
          dutyStatus,
          phone: phone.trim() || null,
          email: email.trim() || null,
        },
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan data GTK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? "Edit Biodata GTK" : "Tambah Guru & Tendik (GTK)"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap (Gelar) *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Dra. Hj. Siti Zubaidah, M.Ag."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan Resmi Madrasah</label>
              <select
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="">-- Pilih Jabatan Resmi --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NIK (16 Digit) *</label>
              <input
                type="text"
                maxLength={16}
                required
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                placeholder="3201..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NUPTK (16 Digit)</label>
              <input
                type="text"
                maxLength={16}
                value={nuptk}
                onChange={(e) => setNuptk(e.target.value.replace(/\D/g, ""))}
                placeholder="Opsional / Jika ada"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status Kepegawaian *</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis GTK *</label>
              <select
                value={gtkType}
                onChange={(e) => setGtkType(e.target.value as GtkType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {GTK_TYPES.map((t) => (
                  <option key={t} value={t}>{t === "pendidik" ? "Pendidik (Guru)" : "Tenaga Kependidikan (Tendik)"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NIP (PNS/PPPK)</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="1985..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NRG (Nomor Registrasi Guru)</label>
              <input
                type="text"
                value={nrg}
                onChange={(e) => setNrg(e.target.value)}
                placeholder="Bagi guru tersertifikasi"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">PegID Simpatika</label>
              <input
                type="text"
                value={pegId}
                onChange={(e) => setPegId(e.target.value)}
                placeholder="ID Akun Simpatika"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "L"}
                    onChange={() => setGender("L")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Laki-Laki
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "P"}
                    onChange={() => setGender("P")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Perempuan
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Resmi / Madrasah</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@madrasah.sch.id"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan GTK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
