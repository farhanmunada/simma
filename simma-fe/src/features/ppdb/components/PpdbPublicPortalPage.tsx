import React, { useState } from "react";
import { Link } from "react-router";
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  UserPlus,
  LogIn,
  Search,
  LayoutDashboard,
} from "lucide-react";
import type { PpdbApplicant } from "../types";
import { PpdbCandidateRegisterForm } from "./PpdbCandidateRegisterForm";
import { PpdbPortalLoginSection } from "./PpdbPortalLoginSection";
import { PpdbCandidateDashboard } from "./PpdbCandidateDashboard";
import { PpdbCheckStatusSection } from "./PpdbCheckStatusSection";
import { useMyApplication } from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";

export const PpdbPublicPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"register" | "login" | "dashboard" | "check-status">("register");
  const [currentApplicant, setCurrentApplicant] = useState<PpdbApplicant | null>(null);

  const { token, user } = useAuthStore();
  const isCandidateLoggedIn = !!token && user?.role === "calon_siswa";

  const { data: myApp, refetch } = useMyApplication();

  const activeApplicant = currentApplicant || myApp || null;

  const handleRegisterSuccess = (applicant: PpdbApplicant) => {
    setCurrentApplicant(applicant);
    setActiveTab("dashboard");
  };

  const handleLoginSuccess = (applicant: PpdbApplicant) => {
    setCurrentApplicant(applicant);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setCurrentApplicant(null);
    setActiveTab("login");
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
            Portal PPDB & Seleksi Siswa Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Layanan registrasi mandiri, unggah berkas digital, verifikasi panitia, dan pencetakan
            Kartu Peserta Ujian Madrasah Aliyah.
          </p>
        </div>

        <div className="space-y-6">
          {/* Tabs Navigasi */}
          <div className="flex border-b border-slate-800 overflow-x-auto">
            {(isCandidateLoggedIn || activeApplicant) ? (
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "dashboard"
                    ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Akun Saya & Berkas</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === "register"
                      ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === "login"
                      ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal Pendaftar</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("check-status")}
              className={`flex items-center space-x-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "check-status"
                  ? "border-emerald-500 text-emerald-400 bg-slate-800/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status / Pengumuman Cepat</span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "register" && !isCandidateLoggedIn && !activeApplicant && (
            <PpdbCandidateRegisterForm
              onSuccess={handleRegisterSuccess}
              onGoToLogin={() => setActiveTab("login")}
            />
          )}

          {activeTab === "login" && !isCandidateLoggedIn && !activeApplicant && (
            <PpdbPortalLoginSection
              onLoginSuccess={handleLoginSuccess}
              onGoToRegister={() => setActiveTab("register")}
            />
          )}

          {(activeTab === "dashboard" || isCandidateLoggedIn || activeApplicant) && activeTab !== "check-status" && (
            activeApplicant ? (
              <PpdbCandidateDashboard
                applicant={activeApplicant}
                onRefresh={refetch}
                onLogout={handleLogout}
              />
            ) : (
              <div className="p-8 text-center bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-3">
                <p>Silakan masuk terlebih dahulu untuk mengakses data dan berkas Anda.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded"
                >
                  Masuk Sekarang
                </button>
              </div>
            )
          )}

          {activeTab === "check-status" && <PpdbCheckStatusSection />}
        </div>

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
