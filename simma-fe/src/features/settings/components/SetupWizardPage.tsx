import React, { useState } from "react";
import { SchoolIdentityStep } from "./steps/SchoolIdentityStep";
import { AcademicYearStep } from "./steps/AcademicYearStep";
import { SemesterStep } from "./steps/SemesterStep";
import { ClassroomSetupStep } from "./steps/ClassroomSetupStep";
import { AdminUserStep } from "./steps/AdminUserStep";
import { SetupSummaryStep } from "./steps/SetupSummaryStep";
import type { SetupWizardData } from "../types";

const INITIAL_DATA: SetupWizardData = {
  institution: {
    nsm: "",
    npsn: "",
    name: "",
    status: "SWASTA",
    level: "MA",
    address: "",
    headmasterName: "",
    headmasterNip: "",
    accreditation: "BELUM",
  },
  academicYear: {
    name: "2024/2025",
    startDate: "2024-07-15",
    endDate: "2025-06-20",
  },
  semester: {
    type: 1,
    startDate: "2024-07-15",
    endDate: "2024-12-20",
  },
  classrooms: [
    { name: "X-1", gradeLevel: 10, capacity: 36 },
    { name: "XI-1", gradeLevel: 11, capacity: 36 },
  ],
  adminUser: {
    name: "",
    email: "",
    role: "Administrator SIM",
  },
};

const STEPS = [
  "Identitas Madrasah",
  "Tahun Ajaran",
  "Semester",
  "Rombel & Kelas",
  "Administrator",
  "Ringkasan",
];

export const SetupWizardPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SetupWizardData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return Boolean(
          formData.institution.nsm &&
            formData.institution.npsn &&
            formData.institution.name &&
            formData.institution.headmasterName,
        );
      case 1:
        return Boolean(
          formData.academicYear.name &&
            formData.academicYear.startDate &&
            formData.academicYear.endDate,
        );
      case 2:
        return Boolean(
          formData.semester.startDate && formData.semester.endDate,
        );
      case 3:
        return formData.classrooms.length > 0;
      case 4:
        return Boolean(formData.adminUser.name && formData.adminUser.email);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate or trigger setup finalization
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-200 rounded-lg text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Inisialisasi Madrasah Berhasil
        </h2>
        <p className="text-xs text-slate-600">
          Seluruh konfigurasi awal madrasah telah tersimpan. Sistem SIMMA siap digunakan untuk kegiatan operasional akademik harian.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-6">
      {/* Step Indicators */}
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span>Langkah {currentStep + 1} dari {STEPS.length}: {STEPS[currentStep]}</span>
          <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Selesai</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="py-2">
        {currentStep === 0 && (
          <SchoolIdentityStep
            data={formData.institution}
            onChange={(patch) =>
              setFormData((prev) => ({
                ...prev,
                institution: { ...prev.institution, ...patch },
              }))
            }
          />
        )}
        {currentStep === 1 && (
          <AcademicYearStep
            data={formData.academicYear}
            onChange={(patch) =>
              setFormData((prev) => ({
                ...prev,
                academicYear: { ...prev.academicYear, ...patch },
              }))
            }
          />
        )}
        {currentStep === 2 && (
          <SemesterStep
            data={formData.semester}
            onChange={(patch) =>
              setFormData((prev) => ({
                ...prev,
                semester: { ...prev.semester, ...patch },
              }))
            }
          />
        )}
        {currentStep === 3 && (
          <ClassroomSetupStep
            data={formData.classrooms}
            onChange={(classrooms) =>
              setFormData((prev) => ({ ...prev, classrooms }))
            }
          />
        )}
        {currentStep === 4 && (
          <AdminUserStep
            data={formData.adminUser}
            onChange={(patch) =>
              setFormData((prev) => ({
                ...prev,
                adminUser: { ...prev.adminUser, ...patch },
              }))
            }
          />
        )}
        {currentStep === 5 && <SetupSummaryStep data={formData} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          Kembali
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Lanjutkan
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? "Menyimpan Konfigurasi..." : "Selesaikan Inisialisasi"}
          </button>
        )}
      </div>
    </div>
  );
};