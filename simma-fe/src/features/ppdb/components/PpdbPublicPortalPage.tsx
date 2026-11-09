import React, { useState } from "react";
import { Link } from "react-router";
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  FileText,
  Search,
} from "lucide-react";
import type { PpdbApplicant } from "../types";
import { PpdbRegisterSuccessCard } from "./PpdbRegisterSuccessCard";
import { PpdbRegisterForm } from "./PpdbRegisterForm";
import { PpdbCheckStatusSection } from "./PpdbCheckStatusSection";

export const PpdbPublicPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"register" | "check-status">("register");
  const [successApplicant, setSuccessApplicant] = useState<PpdbApplicant | null>(null);

  const handleRegisterSuccess = (applicant: PpdbApplicant) => {
    setSuccessApplicant(applicant);
  };

  const handleGoToStatus = () => {
    setSuccessApplicant(null);
    setActiveTab("check-status");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Login Sistem</span>
          </Link>
          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
              T.A. 2025/2026
            </span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Penerimaan Peserta Didik Baru Madrasah Aliyah</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portal Pendaftaran Mandiri Siswa Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Selamat datang di Portal PPDB Madrasah Aliyah. Lengkapi biodata kependudukan, data asal
            madrasah/sekolah, dan pantau pengumuman hasil seleksi secara online.
          </p>
        </div>

        {/* Success Card or Tabs */}
        {successApplicant ? (
          <PpdbRegisterSuccessCard
            applicant={successApplicant}
            onGoToStatus={handleGoToStatus}
          />
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "register"
                    ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Formulir Pendaftaran Online</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("check-status")}
                className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "check-status"
                    ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Cek Status & Pengumuman</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "register" ? (
              <PpdbRegisterForm onSuccess={handleRegisterSuccess} />
            ) : (
              <PpdbCheckStatusSection />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-10 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-1.5 font-medium text-slate-400">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>Sistem Informasi Madrasah Aliyah (SIMMA) &copy; 2025</span>
          </div>
          <p>Kementerian Agama Republik Indonesia &bull; Pendataan Mandiri Terintegrasi EMIS 4.0</p>
        </div>
      </div>
    </div>
  );
};
