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
import { PpdbApplicant } from "../types";
import { PpdbPublicLandingSection } from "./PpdbPublicLandingSection";
import { PpdbCandidateRegisterForm } from "./PpdbCandidateRegisterForm";
import { PpdbPortalLoginSection } from "./PpdbPortalLoginSection";
import { PpdbCandidateDashboard } from "./PpdbCandidateDashboard";
import { PpdbCheckStatusSection } from "./PpdbCheckStatusSection";
import { useMyApplication } from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";

export const PpdbPublicPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"landing" | "register" | "login" | "dashboard" | "check-status">("landing");
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
    setActiveTab("landing");
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Masuk ke SIMMA Internal</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              PPDB Online T.A. 2025/2026
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Penerimaan Peserta Didik Baru Madrasah Aliyah</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Portal Seleksi Siswa Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Layanan resmi pendaftaran mandiri calon siswa madrasah aliyah, upload dokumen persyaratan,
            dan cetak kartu ujian peserta.
          </p>
        </div>

        <div className="space-y-6">
          {/* Tabs Navigasi */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 rounded-xl border">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className={`flex items-center space-x-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === "landing"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Beranda & Panduan</span>
            </button>

            {(isCandidateLoggedIn || activeApplicant) ? (
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Akun Saya & Berkas</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex items-center space-x-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeTab === "register"
                      ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Akun Siswa Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex items-center space-x-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                    activeTab === "login"
                      ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Masuk Portal Pendaftar</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("check-status")}
              className={`flex items-center space-x-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === "check-status"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Cek Status / Pengumuman</span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "landing" && (
            <PpdbPublicLandingSection
              onGoToRegister={() => setActiveTab("register")}
              onGoToLogin={() => setActiveTab("login")}
              onGoToCheckStatus={() => setActiveTab("check-status")}
            />
          )}

          {activeTab === "register" && !isCandidateLoggedIn && !activeApplicant && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <PpdbCandidateRegisterForm
                onSuccess={handleRegisterSuccess}
                onGoToLogin={() => setActiveTab("login")}
              />
            </div>
          )}

          {activeTab === "login" && !isCandidateLoggedIn && !activeApplicant && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <PpdbPortalLoginSection
                onLoginSuccess={handleLoginSuccess}
                onGoToRegister={() => setActiveTab("register")}
              />
            </div>
          )}

          {(activeTab === "dashboard" || isCandidateLoggedIn || activeApplicant) && activeTab !== "check-status" && activeTab !== "landing" && (
            activeApplicant ? (
              <PpdbCandidateDashboard
                applicant={activeApplicant}
                onRefresh={refetch}
                onLogout={handleLogout}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-xs text-slate-500 space-y-3">
                <p>Silakan masuk terlebih dahulu untuk mengakses data formulir dan berkas Anda.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Masuk Sekarang
                </button>
              </div>
            )
          )}

          {activeTab === "check-status" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <PpdbCheckStatusSection />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-1.5 font-medium text-slate-700">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Sistem Informasi Madrasah Aliyah (SIMMA) &copy; 2025</span>
          </div>
          <p>Kementerian Agama Republik Indonesia &bull; Pendataan Mandiri Terintegrasi EMIS 4.0</p>
        </div>
      </div>
    </div>
  );
};
