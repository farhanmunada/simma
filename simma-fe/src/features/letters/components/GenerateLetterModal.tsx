import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import {
  useGenerateStudentLetter,
  useGenerateTeacherLetter,
  useGenerateInvitationLetter,
} from "../api/letters-generator.api";
import { useStudents } from "../../students/api/students.api";
import { useTeachers } from "../../settings/api/settings.api";

export interface GenerateLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateLetterModal: React.FC<GenerateLetterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [templateType, setTemplateType] = useState<
    "active_student" | "skkb" | "duty_teacher" | "parent_invitation"
  >("active_student");

  const { data: studentsData } = useStudents({ page: 1, limit: 100 });
  const { data: teachers = [] } = useTeachers();

  const studentsList = studentsData?.data || [];

  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [purpose, setPurpose] = useState("Pengurusan Beasiswa PIP Kemenag RI");
  const [assignmentName, setAssignmentName] = useState("Pendampingan Kompetisi Sains Madrasah (KSM)");
  const [destination, setDestination] = useState("Kantor Kemenag Wilayah Provinsi");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventName, setEventName] = useState("Rapat Koordinasi Persiapan Asesmen Madrasah");
  const [eventDate, setEventDate] = useState("Senin, 18 Mei 2026");
  const [eventTime, setEventTime] = useState("09.00 - 12.00 WIB");
  const [eventLocation, setEventLocation] = useState("Aula Pertemuan Madrasah Aliyah");
  const [agenda, setAgenda] = useState("Sosialisasi Teknis Asesmen Madrasah Berbasis Komputer");

  const studentMutation = useGenerateStudentLetter();
  const teacherMutation = useGenerateTeacherLetter();
  const invitationMutation = useGenerateInvitationLetter();

  const isPending =
    studentMutation.isPending ||
    teacherMutation.isPending ||
    invitationMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultSigner = {
      signerName: "H. Ahmad Syarif, M.Pd.I",
      signerNip: "197508152003121002",
      signerRole: "Kepala Madrasah",
    };

    if (templateType === "active_student" || templateType === "skkb") {
      if (!studentId) return;
      studentMutation.mutate(
        { studentId, purpose, classificationCode: "PP.00.6", ...defaultSigner },
        { onSuccess: onClose }
      );
    } else if (templateType === "duty_teacher") {
      if (!teacherId) return;
      teacherMutation.mutate(
        {
          teacherId,
          assignmentName,
          destination,
          startDate,
          endDate,
          transportation: "Kendaraan Dinas / Umum",
          budgetSource: "DIPA Madrasah Aliyah",
          classificationCode: "KP.00",
          ...defaultSigner,
        },
        { onSuccess: onClose }
      );
    } else {
      invitationMutation.mutate(
        {
          eventName,
          eventDate,
          eventTime,
          eventLocation,
          agenda,
          classificationCode: "HM.00",
          ...defaultSigner,
        },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generator Surat Resmi Otomatis (F-TU-06 s/d 09)"
      description="Biodata siswa/GTK ditarik otomatis dari basis data dengan penomoran resmi Kemenag."
    >
      <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Pilih Jenis Template Naskah Dinas</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as any)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="active_student">Surat Keterangan Aktif Siswa (PP.00.6)</option>
            <option value="skkb">Surat Keterangan Berkelakuan Baik / SKKB (PP.00.6)</option>
            <option value="duty_teacher">Surat Perintah Tugas GTK (KP.00)</option>
            <option value="parent_invitation">Surat Undangan Orang Tua / Wali (HM.00)</option>
          </select>
        </div>

        {(templateType === "active_student" || templateType === "skkb") && (
          <>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Pilih Siswa Terdaftar</label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Cari / Pilih Siswa --</option>
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} - NISN: {s.nisn || "-"} ({s.nis || "Aktif"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tujuan / Keperluan Surat</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </>
        )}

        {templateType === "duty_teacher" && (
          <>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Pilih Guru / GTK Ditugaskan</label>
              <select
                required
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Cari / Pilih Guru / GTK --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} - NUPTK: {t.nuptk || "-"} ({t.employmentType})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama Tugas Dinas</label>
              <input
                type="text"
                required
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tempat / Lokasi Tujuan</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tgl. Mulai</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tgl. Selesai</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </>
        )}

        {templateType === "parent_invitation" && (
          <>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama Acara</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Hari & Tanggal</label>
                <input
                  type="text"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Waktu</label>
                <input
                  type="text"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tempat</label>
              <input
                type="text"
                required
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Agenda Acara</label>
              <textarea
                rows={2}
                required
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            {isPending ? "Mengenerate..." : "Generate Surat & Terbitkan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
