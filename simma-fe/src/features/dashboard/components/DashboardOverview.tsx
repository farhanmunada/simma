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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Selamat datang, {user?.fullName || "Staff"}.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/students"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
          >
            Buku Induk
          </Link>
          <Link
            to="/reports"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors"
          >
            Cetak Rapor
          </Link>
        </div>
      </div>

      {/* Visual Data Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Total Siswa Aktif</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">
            {isStudentsLoading ? "..." : totalStudents}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 inline-flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-slate-400" /> Terdaftar
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Pendaftar PPDB</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">
            {isPpdbLoading ? "..." : totalPpdbApplicants}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Tahun Ajaran Baru</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Rombel Aktif</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{totalClassrooms}</p>
          <p className="text-[11px] text-slate-400 mt-1">Kelas X, XI, XII</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Pendidik & GTK</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{totalTeachers}</p>
          <p className="text-[11px] text-slate-400 mt-1">Guru & Staff</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
          Modul Kerja
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                to={module.href}
                className="group bg-white rounded-lg p-5 border border-slate-200 hover:border-slate-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {module.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 group-hover:text-slate-950">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {module.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600 group-hover:text-slate-900">
                  <span>Buka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
