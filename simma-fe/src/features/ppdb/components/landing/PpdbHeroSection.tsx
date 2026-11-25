import React from "react";
import {
  UserPlus,
  LogIn,
  Search,
  ArrowRight,
  GraduationCap,
  Clock,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import type { InstitutionPublicProfile } from "../../types";

interface Props {
  institution: InstitutionPublicProfile;
  academicYear: string;
  isOpen: boolean;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onGoToCheckStatus: () => void;
}

export const PpdbHeroSection: React.FC<Props> = ({
  institution,
  academicYear,
  isOpen,
  onGoToRegister,
  onGoToLogin,
  onGoToCheckStatus,
}) => {
  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 sm:p-10 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${isOpen ? "bg-amber-400" : "bg-slate-400"}`}
              aria-hidden="true"
            />
            <span>PPDB Online T.A. {academicYear}</span>
            <span className="text-emerald-300/70" aria-hidden="true">&bull;</span>
            <span>Est. {institution.foundedYear}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {institution.name}
            <span className="block text-emerald-200 text-lg sm:text-2xl font-semibold mt-1.5">
              Unggul dalam IMTAK, Berprestasi dalam IPTEK
            </span>
          </h1>

          <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Memadukan kurikulum formal Madrasah Aliyah Kemenag RI dengan pendidikan Pondok Pesantren Salafiyah sejak {institution.foundedYear}. Daftar mandiri secara online, unggah berkas persyaratan, dan pantau hasil seleksi dari rumah.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onGoToRegister}
              className="cursor-pointer inline-flex items-center justify-center gap-2 min-h-11 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>Daftar Santri / Siswa Baru</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
              className="cursor-pointer inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Masuk Portal</span>
            </button>

            <button
              type="button"
              onClick={onGoToCheckStatus}
              className="cursor-pointer inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 font-medium text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Cek Kelulusan</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/15 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-100/85">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              Akses Pendaftaran 24 Jam
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              Terintegrasi EMIS 4.0 Kemenag
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              {institution.district}, {institution.city}
            </span>
          </div>
        </div>

        {/* Right Panel: Education Levels */}
        <div className="lg:col-span-5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-300" aria-hidden="true" />
              <h2 className="text-sm font-bold text-white">Jenjang Pendidikan Tersedia</h2>
            </div>
            <span className="text-[11px] font-medium text-emerald-200">
              Pengasuh: {institution.pengasuh}
            </span>
          </div>

          <div className="space-y-2.5">
            {institution.educationLevels.map((lvl) => (
              <div
                key={lvl.code}
                className="rounded-lg bg-emerald-950/50 border border-white/10 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300">{lvl.code}</span>
                  <span className="text-[11px] font-medium text-emerald-100 truncate">
                    {lvl.title}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-relaxed">{lvl.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
