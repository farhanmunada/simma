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
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
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

  // Modul Fitur Cepat Berdasar Kategori
  const featureModules = [
    {
      title: "Kesiswaan & Buku Induk",
      desc: "Manajemen data induk santri, penempatan rombel, dan mutasi EMIS 4.0.",
      icon: Users,
      href: "/students",
      color: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-700 border-blue-200",
      count: totalStudents > 0 ? `${totalStudents} Santri` : "Data Siswa",
    },
    {
      title: "PPDB Madrasah",
      desc: "Pendaftaran online calon siswa baru, seleksi nilai rapor, dan verifikasi berkas.",
      icon: GraduationCap,
      href: "/ppdb-admin",
      color: "from-emerald-600 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
      count: totalPpdbApplicants > 0 ? `${totalPpdbApplicants} Pendaftar` : "Portal Aktif",
    },
    {
      title: "Tahfidz & Tasmi' Al-Qur'an",
      desc: "Pencatatan mutaba'ah harian juz/surah, ujian tasmi', dan predikat kelulusan.",
      icon: BookOpen,
      href: "/tahfidz",
      color: "from-amber-600 to-orange-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-200",
      count: "Halaqah & Ujian",
    },
    {
      title: "Presensi Santri & Guru",
      desc: "Pencatatan kehadiran harian siswa, jurnal guru mapel, dan rekapitulasi kehadiran.",
      icon: UserCheck,
      href: "/attendance/students",
      color: "from-cyan-600 to-blue-600",
      bgLight: "bg-cyan-50 text-cyan-700 border-cyan-200",
      count: "Presensi Harian",
    },
    {
      title: "Penilaian Akademik (KMA)",
      desc: "Input nilai asesmen formatif, sumatif, pembobotan, dan kalkulasi nilai akhir.",
      icon: Award,
      href: "/grades",
      color: "from-purple-600 to-pink-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-200",
      count: "Kurikulum Merdeka",
    },
    {
      title: "Rapor & Legger RDM",
      desc: "Cetak format buku rapor Kemenag RDM, legger kelas, dan ekspor CSV.",
      icon: FileSpreadsheet,
      href: "/reports",
      color: "from-rose-600 to-red-600",
      bgLight: "bg-rose-50 text-rose-700 border-rose-200",
      count: "RDM Kemenag",
    },
    {
      title: "Tata Usaha & Persuratan",
      desc: "Registrasi surat dinas masuk/keluar, disposisi kepala madrasah, dan buku ekspedisi.",
      icon: Inbox,
      href: "/letters/incoming",
      color: "from-teal-600 to-emerald-700",
      bgLight: "bg-teal-50 text-teal-700 border-teal-200",
      count: "Arsip Digital",
    },
    {
      title: "Master Konfigurasi Madrasah",
      desc: "Pengaturan tahun ajaran aktif, semester, GTK guru, mata pelajaran, dan rombel.",
      icon: Settings,
      href: "/settings/academic-years",
      color: "from-slate-700 to-slate-900",
      bgLight: "bg-slate-100 text-slate-700 border-slate-300",
      count: `${totalClassrooms} Rombel / ${totalTeachers} GTK`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white shadow-sm border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Informasi Madrasah Aliyah Aktif</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Ahlan wa Sahlan, {user?.fullName || "Staff Madrasah"}!
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 mt-1 max-w-xl">
              Tahun Ajaran <span className="font-semibold text-white">2026/2027 Ganjil</span>. Kelola modul pembelajaran, persuratan tata usaha, dan santri dalam satu portal.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/students"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center space-x-1.5"
            >
              <span>Buku Induk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors"
            >
              Cetak Rapor
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Data Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Siswa Aktif</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {isStudentsLoading ? "..." : totalStudents}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center mt-0.5">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Terdaftar Buku Induk
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pendaftar PPDB</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {isPpdbLoading ? "..." : totalPpdbApplicants}
            </p>
            <span className="text-[10px] text-slate-500 font-medium inline-flex items-center mt-0.5">
              Tahun Ajaran Baru
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rombel Aktif</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalClassrooms}</p>
            <span className="text-[10px] text-indigo-600 font-medium inline-flex items-center mt-0.5">
              Kelas X, XI, XII
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pendidik & GTK</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalTeachers}</p>
            <span className="text-[10px] text-teal-600 font-medium inline-flex items-center mt-0.5">
              <Activity className="w-3 h-3 mr-0.5" /> Guru & Tenaga TU
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Feature Grid with Dedicated Icons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Katalog Fitur & Modul Akademik
          </h2>
          <span className="text-xs text-slate-400">Pilih modul untuk akses instan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                to={module.href}
                className="group relative bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${module.bgLight}`}>
                      {module.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {module.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
