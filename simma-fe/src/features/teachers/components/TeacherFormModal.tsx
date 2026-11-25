import React, { useEffect, useState } from "react";
import { X, Save, UserCheck, KeyRound, User, BookOpenCheck, CheckCircle2 } from "lucide-react";
import type { Role } from "@simma/shared";
import {
  usePositions,
  useTeacherDetail,
  useResetTeacherPassword,
  fetchNextTeacherCode,
} from "../api/teachers.api";
import type { TeacherListItem } from "../types";
import { TeacherAccountTab, type TeacherAccountFormState } from "./form/TeacherAccountTab";
import { TeacherIdentityTab, type TeacherIdentityFormState } from "./form/TeacherIdentityTab";
import { TeacherBioFormTab, type TeacherBioFormState } from "./form/TeacherBioFormTab";
import { TeacherEnrolmentTab, type TeacherEnrolmentFormState } from "./form/TeacherEnrolmentTab";
import {
  DEFAULT_ACCOUNT,
  DEFAULT_IDENTITY,
  DEFAULT_BIO,
  DEFAULT_ENROLMENT,
  mapTeacherToFormStates,
  buildTeacherSubmitPayload,
} from "./form/teacher-form-mapper";

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: TeacherListItem | null;
}

type ModalTab = "account" | "identity" | "bio" | "enrolment";

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData?.id);
  const { data: positions = [] } = usePositions();
  const { data: teacherDetail } = useTeacherDetail(isOpen && initialData?.id ? initialData.id : "");
  const resetPasswordMutation = useResetTeacherPassword();

  const [activeTab, setActiveTab] = useState<ModalTab>("account");
  const [account, setAccount] = useState<TeacherAccountFormState>(DEFAULT_ACCOUNT);
  const [identity, setIdentity] = useState<TeacherIdentityFormState>(DEFAULT_IDENTITY);
  const [bio, setBio] = useState<TeacherBioFormState>(DEFAULT_BIO);
  const [enrolment, setEnrolment] = useState<TeacherEnrolmentFormState>(DEFAULT_ENROLMENT);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleGenerateCode = async (role: Role) => {
    setIsFetchingCode(true);
    try {
      const res = await fetchNextTeacherCode(role);
      setAccount((prev) => ({ ...prev, employeeCode: res.code }));
    } catch {
      // Abaikan jika gagal auto-fetch; operator dapat mengetik manual 4 digit
    } finally {
      setIsFetchingCode(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("account");
    setError(null);
    setResetNotice(null);

    if (!initialData) {
      setAccount(DEFAULT_ACCOUNT);
      setIdentity(DEFAULT_IDENTITY);
      setBio(DEFAULT_BIO);
      setEnrolment(DEFAULT_ENROLMENT);
      void handleGenerateCode("guru_mapel");
      return;
    }

    const detail = teacherDetail && teacherDetail.id === initialData.id ? teacherDetail : null;
    const mapped = mapTeacherToFormStates(detail ?? initialData);
    setAccount(mapped.account);
    setIdentity(mapped.identity);
    setBio(mapped.bio);
    setEnrolment(mapped.enrolment);
  }, [isOpen, initialData, teacherDetail]);

  if (!isOpen) return null;

  const handleResetPassword = async () => {
    if (!initialData?.id) return;
    try {
      const res = await resetPasswordMutation.mutateAsync(initialData.id);
      setResetNotice(`Password berhasil direset ke kode ${res.data.employeeCode}.`);
    } catch (err: any) {
      setError(err?.message || "Gagal mereset password GTK.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identity.fullName.trim()) {
      setActiveTab("identity");
      setError("Nama lengkap & gelar wajib diisi.");
      return;
    }
    if (!/^\d{4}$/.test(account.employeeCode)) {
      setActiveTab("account");
      setError("Kode login GTK wajib tepat 4 digit angka (contoh: 2101).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildTeacherSubmitPayload(account, identity, bio, enrolment));
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan data GTK.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Akun & Kode", icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: "identity", label: "Kepegawaian", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: "bio", label: "Biodata & Kontak", icon: <User className="w-3.5 h-3.5" /> },
    { id: "enrolment", label: "Delegasi Tugas", icon: <BookOpenCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-4">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Data, Akun & Delegasi GTK" : "Tambah GTK & Buat Kode Akun Baru"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Dikelola oleh Operator: biodata lengkap GTK, kode login 4 digit angka, dan penugasan kelas/mapel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-3 border-b border-gray-100 flex gap-1 overflow-x-auto bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}
          {resetNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetNotice}</span>
            </div>
          )}

          {activeTab === "account" && (
            <TeacherAccountTab
              data={account}
              isEdit={isEdit}
              isFetchingCode={isFetchingCode}
              isResetting={resetPasswordMutation.isPending}
              onChange={setAccount}
              onGenerateCode={handleGenerateCode}
              onResetPassword={isEdit ? handleResetPassword : undefined}
            />
          )}

          {activeTab === "identity" && (
            <TeacherIdentityTab data={identity} positions={positions} onChange={setIdentity} />
          )}

          {activeTab === "bio" && <TeacherBioFormTab data={bio} onChange={setBio} />}

          {activeTab === "enrolment" && (
            <TeacherEnrolmentTab data={enrolment} onChange={setEnrolment} />
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan & Terbitkan Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
