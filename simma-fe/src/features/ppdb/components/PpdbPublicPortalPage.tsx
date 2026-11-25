import React, { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  UserPlus,
  LogIn,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { DEFAULT_INSTITUTION_PUBLIC_PROFILE } from "@simma/shared";
import { PpdbApplicant } from "../types";
import { PpdbPublicLandingSection } from "./PpdbPublicLandingSection";
import { PpdbCandidateRegisterForm } from "./PpdbCandidateRegisterForm";
import { PpdbPortalLoginSection } from "./PpdbPortalLoginSection";
import { PpdbCandidateDashboard } from "./PpdbCandidateDashboard";
import { PpdbCheckStatusSection } from "./PpdbCheckStatusSection";
import { useMyApplication, usePpdbPublicInfo } from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";

type PortalTab = "landing" | "register" | "login" | "dashboard" | "check-status";

export const PpdbPublicPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>("landing");
  const [currentApplicant, setCurrentApplicant] = useState<PpdbApplicant | null>(null);

  const { token, user } = useAuthStore();
  const isCandidateLoggedIn = !!token && user?.role === "calon_siswa";

  const { data: publicInfo } = usePpdbPublicInfo();
  const { data: myApp, refetch } = useMyApplication();

  const activeApplicant = currentApplicant || myApp || null;
  const institution = publicInfo?.institution ?? DEFAULT_INSTITUTION_PUBLIC_PROFILE;
  const academicYear = publicInfo?.academicYear ?? "2026/2027";

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className="cursor-pointer w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shadow-2xs hover:border-emerald-400 transition shrink-0 overflow-hidden"
              title="Ke Beranda PPDB"
              aria-label="Ke Beranda PPDB"
            >
              <img
                src={institution.logoUrl || "/images/logo-manbaul-hikmah.png"}
                alt={`Logo ${institution.name}`}
                className="w-8 h-8 object-contain"
              />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  PPDB Online {institution.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {academicYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {institution.district}, {institution.city} &bull; Terintegrasi EMIS 4.0 Kemenag RI
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Navigasi PPDB">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "landing"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Beranda
            </button>

            {isCandidateLoggedIn || activeApplicant ? (
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Portal Pendaftar</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("check-status")}
                  className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === "check-status"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Cek Pengumuman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === "login"
                      ? "bg-slate-100 text-slate-900 border border-slate-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs whitespace-nowrap ${
                    activeTab === "register"
                      ? "bg-emerald-800 text-white"
                      : "bg-emerald-700 text-white hover:bg-emerald-800"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Daftar Baru</span>
                </button>
              </>
            )}

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-medium transition py-2 px-2 whitespace-nowrap"
              title="Akses GTK / Guru / Admin SIMMA"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">SIMMA GTK</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "landing" && (
          <PpdbPublicLandingSection
            publicInfo={publicInfo}
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
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
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
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
            >
              <span>&larr; Kembali ke Beranda PPDB</span>
            </button>
            <PpdbPortalLoginSection
              onLoginSuccess={handleLoginSuccess}
              onGoToRegister={() => setActiveTab("register")}
            />
          </div>
        )}

        {(activeTab === "dashboard" || isCandidateLoggedIn || activeApplicant) &&
          activeTab !== "check-status" &&
          activeTab !== "landing" &&
          (activeApplicant ? (
            <PpdbCandidateDashboard
              applicant={activeApplicant}
              onRefresh={refetch}
              onLogout={handleLogout}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs text-xs text-slate-500 space-y-3">
              <p>Silakan masuk terlebih dahulu untuk mengakses data formulir dan berkas Anda.</p>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="cursor-pointer px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
              >
                Masuk Sekarang
              </button>
            </div>
          ))}

        {activeTab === "check-status" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveTab("landing")}
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
            >
              <span>&larr; Kembali ke Beranda PPDB</span>
            </button>
            <PpdbCheckStatusSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-800">
          {institution.name} &bull; Sistem Informasi Madrasah (SIMMA) &copy; 2026
        </p>
        <p>{institution.address}</p>
      </footer>
    </div>
  );
};
