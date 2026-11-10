import React from "react";
import { Link } from "react-router";
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  FileSpreadsheet,
  Inbox,
  Settings,
  GraduationCap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useStudents } from "../../students";
import { usePpdbStats } from "../../ppdb";
import { useClassrooms, useTeachers } from "../../settings";
import { useAuthStore } from "../../../stores/auth.store";

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ page: 1, limit: 1 });
  const { data: ppdbStats, isLoading: isPpdbLoading } = usePpdbStats();
  const { data: classrooms = [] } = useClassrooms();
  const { data: teachers = [] } = useTeachers();

  const totalStudents = studentsData?.meta?.total || 0;
  const totalPpdbApplicants = ppdbStats?.total || 0;
  const totalClassrooms = Array.isArray(classrooms) ? classrooms.length : 0;
  const totalTeachers = Array.isArray(teachers) ? teachers.length : 0;

  const featureModules = [
    {
      title: "Kesiswaan & Buku Induk",
      desc: "Data induk siswa, rombel, dan mutasi.",
      icon: Users,
      href: "/students",
      count: totalStudents > 0 ? `${totalStudents} Siswa` : "Siswa",
    },
    {
      title: "PPDB Madrasah",
      desc: "Pendaftaran calon siswa dan seleksi berkas.",
      icon: GraduationCap,
      href: "/ppdb-admin",
      count: totalPpdbApplicants > 0 ? `${totalPpdbApplicants} Pendaftar` : "PPDB",
    },
    {
      title: "Tahfidz & Tasmi'",
      desc: "Setoran hafalan harian dan ujian tasmi'.",
      icon: BookOpen,
      href: "/tahfidz",
      count: "Tahfidz",
    },
    {
      title: "Presensi Santri & Guru",
      desc: "Kehadiran harian dan jurnal kelas.",
      icon: UserCheck,
      href: "/attendance/students",
      count: "Presensi",
    },
    {
      title: "Penilaian Akademik",
      desc: "Input nilai asesmen formatif dan sumatif.",
      icon: Award,
      href: "/grades",
      count: "Akademik",
    },
    {
      title: "Rapor & Legger RDM",
      desc: "Cetak format rapor Kemenag dan legger.",
      icon: FileSpreadsheet,
      href: "/reports",
      count: "Rapor",
    },
    {
      title: "Tata Usaha & Persuratan",
      desc: "Surat masuk, keluar, dan naskah dinas.",
      icon: Inbox,
      href: "/letters/incoming",
      count: "Persuratan",
    },
    {
      title: "Master Konfigurasi",
      desc: "Tahun ajaran, kelas, mapel, dan GTK.",
      icon: Settings,
      href: "/settings/academic-years",
      count: `${totalClassrooms} Rombel / ${totalTeachers} GTK`,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ringkasan Madrasah
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Selamat bertugas, <span className="font-semibold text-emerald-800">{user?.fullName || "Staff Madrasah"}</span>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/students"
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            Buku Induk
          </Link>
          <Link
            to="/reports"
            className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
          >
            Cetak Rapor
          </Link>
        </div>
      </div>

      {/* Visual Data Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {isStudentsLoading ? "..." : totalStudents}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 inline-flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Terdaftar Buku Induk
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendaftar PPDB</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {isPpdbLoading ? "..." : totalPpdbApplicants}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Tahun Ajaran Baru</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rombel Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalClassrooms}</p>
          <p className="text-[11px] text-slate-500 mt-1">Kelas X, XI, XII</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendidik & GTK</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalTeachers}</p>
          <p className="text-[11px] text-slate-500 mt-1">Guru & Tenaga TU</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Menu Operasional
          </h2>
          <span className="text-[11px] text-slate-400">Pilih modul kerja</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                to={module.href}
                className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-emerald-800 font-medium px-2 py-0.5 rounded-full bg-emerald-50/80 border border-emerald-100">
                      {module.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {module.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-emerald-800 transition-colors">
                  <span>Buka</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
