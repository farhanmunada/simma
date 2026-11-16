import React, { useState } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import type {
  RegisterApplicantInput,
  PpdbSchoolType,
  PpdbMajor,
  PpdbApplicant,
} from "../types";
import { useRegisterApplicant } from "../api/ppdb.api";
import { PpdbApplicantBiodataFields } from "./PpdbApplicantBiodataFields";
import { PpdbApplicantSchoolFields } from "./PpdbApplicantSchoolFields";
import { PpdbApplicantParentFields } from "./PpdbApplicantParentFields";

interface PpdbRegisterFormProps {
  onSuccess: (applicant: PpdbApplicant) => void;
}

export const PpdbRegisterForm: React.FC<PpdbRegisterFormProps> = ({ onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [phone, setPhone] = useState("");
  const [email] = useState("");
  const [address, setAddress] = useState("");

  const [previousSchoolType, setPreviousSchoolType] = useState<PpdbSchoolType>("MTs");
  const [previousSchoolName, setPreviousSchoolName] = useState("");
  const [npsnOrigin, setNpsnOrigin] = useState("");

  const [chosenMajor, setChosenMajor] = useState<PpdbMajor>("MIPA");

  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [guardianName] = useState("");

  const [registerError, setRegisterError] = useState<string | null>(null);

  const registerMutation = useRegisterApplicant();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (nik.length !== 16) {
      setRegisterError("NIK wajib terdiri dari tepat 16 digit angka kependudukan.");
      return;
    }
    if (!motherName.trim()) {
      setRegisterError("Nama Ibu Kandung wajib diisi sesuai standar pendataan EMIS Kemenag.");
      return;
    }
    if (!previousSchoolName.trim()) {
      setRegisterError("Nama madrasah/sekolah asal wajib diisi.");
      return;
    }

    const payload: RegisterApplicantInput = {
      fullName: fullName.trim(),
      nik: nik.trim(),
      nisn: nisn.trim() || undefined,
      birthPlace: birthPlace.trim(),
      birthDate,
      gender,
      religion: "Islam",
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      previousSchoolType,
      previousSchoolName: previousSchoolName.trim(),
      npsnOrigin: npsnOrigin.trim() || undefined,
      fatherName: fatherName.trim() || undefined,
      fatherPhone: fatherPhone.trim() || undefined,
      motherName: motherName.trim(),
      motherPhone: motherPhone.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      chosenMajor,
      documents: {},
    };

    try {
      const res = await registerMutation.mutateAsync(payload);
      onSuccess(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirim formulir pendaftaran. Periksa kembali kelengkapan data.";
      setRegisterError(msg);
    }
  };

  return (
    <form onSubmit={handleRegisterSubmit} className="space-y-6">
      {registerError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{registerError}</span>
        </div>
      )}

      {/* 1. Biodata Calon Siswa */}
      <PpdbApplicantBiodataFields
        fullName={fullName}
        setFullName={setFullName}
        nik={nik}
        setNik={setNik}
        nisn={nisn}
        setNisn={setNisn}
        birthPlace={birthPlace}
        setBirthPlace={setBirthPlace}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        gender={gender}
        setGender={setGender}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
      />

      {/* 2. Asal Sekolah & Pilihan Jurusan */}
      <PpdbApplicantSchoolFields
        previousSchoolType={previousSchoolType}
        setPreviousSchoolType={setPreviousSchoolType}
        previousSchoolName={previousSchoolName}
        setPreviousSchoolName={setPreviousSchoolName}
        npsnOrigin={npsnOrigin}
        setNpsnOrigin={setNpsnOrigin}
        chosenMajor={chosenMajor}
        setChosenMajor={setChosenMajor}
      />

      {/* 3. Data Orang Tua / Wali */}
      <PpdbApplicantParentFields
        motherName={motherName}
        setMotherName={setMotherName}
        motherPhone={motherPhone}
        setMotherPhone={setMotherPhone}
        fatherName={fatherName}
        setFatherName={setFatherName}
        fatherPhone={fatherPhone}
        setFatherPhone={setFatherPhone}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
        >
          {registerMutation.isPending ? (
            <span>Sedang Menyimpan Data...</span>
          ) : (
            <>
              <span>Kirim Formulir Pendaftaran PPDB</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
