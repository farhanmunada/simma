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
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow hover:bg-emerald-700 transition"
              title="Ke Beranda PPDB"
            >
              <GraduationCap className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  PPDB Online Madrasah Aliyah
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  2025/2026
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Penerimaan Peserta Didik Baru Terpadu EMIS 4.0 Kemenag RI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "landing"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Beranda
            </button>

            {(isCandidateLoggedIn || activeApplicant) ? (
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "dashboard"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Portal Pendaftar</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("check-status")}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "check-status"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cek Pengumuman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "login"
                      ? "bg-slate-100 text-slate-900 border border-slate-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masuk Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                    activeTab === "register"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Baru</span>
                </button>
              </>
            )}

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <Link
              to="/login"
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition py-2 px-2"
              title="Akses GTK / Guru / Admin SIMMA"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIMMA GTK</span>
            </Link>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === "landing" && (
            <PpdbPublicLandingSection
              onGoToRegister={() => setActiveTab("register")}
              onGoToLogin={() => setActiveTab("login")}
              onGoToCheckStatus={() => setActiveTab("check-status")}
            />
          )}

          {activeTab === "register" && !isCandidateLoggedIn && !activeApplicant && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveTab("landing")}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                <span>&larr; Kembali ke Beranda PPDB</span>
              </button>
              <PpdbCandidateRegisterForm
                onSuccess={handleRegisterSuccess}
                onGoToLogin={() => setActiveTab("login")}
              />
            </div>
          )}

          {activeTab === "login" && !isCandidateLoggedIn && !activeApplicant && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveTab("landing")}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                <span>&larr; Kembali ke Beranda PPDB</span>
              </button>
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
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setActiveTab("landing")}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                <span>&larr; Kembali ke Beranda PPDB</span>
              </button>
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
