import React from "react";
import { Link } from "react-router";
import {
  Users,
  UserPlus,
  Calendar,
  BookOpen,
  FileText,
  ArrowUpRight,
  GraduationCap,
  CheckSquare,
  Award,
  Layers,
  Wallet,
  KeyRound,
  Briefcase,
  Building2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { useAuthStore, type UserRole } from "../../../stores/auth.store";
import { MODULE_ROLES } from "../../../config/roles";
import { useMyScope } from "../../auth/api/auth.api";
import { useStudents } from "../../students";
import { usePpdbStats } from "../../ppdb";
import { useClassrooms, useTeachers } from "../../settings";

interface DashboardModule {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  roles: UserRole[];
}

const ADMIN_METRICS_ROLES: UserRole[] = [
  "super_admin",
  "operator",
  "kepala_madrasah",
  "admin_tu",
  "waka_kurikulum",
  "waka_kesiswaan",
];

const AdminMetricsSection: React.FC = () => {
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ page: 1, limit: 1 });
  const { data: ppdbStats, isLoading: isPpdbLoading } = usePpdbStats();
  const { data: classrooms = [] } = useClassrooms();
  const { data: teachers = [] } = useTeachers();

  const totalStudents = studentsData?.meta?.total ?? studentsData?.data?.length ?? 0;
  const totalPpdb = ppdbStats?.total ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Siswa Aktif</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">
              {isStudentsLoading ? "..." : totalStudents}
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-700">Terintegrasi Buku Induk</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pendaftar PPDB</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">
              {isPpdbLoading ? "..." : totalPpdb}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {ppdbStats?.verified ?? 0} terverifikasi • {ppdbStats?.accepted ?? 0} diterima
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Rombongan Belajar</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{classrooms.length}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Tingkat X, XI, dan XII</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Guru &amp; Tenaga Pendidik</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{teachers.length}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">GTK Madrasah Aliyah</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export const DashboardOverview: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const canViewAdminMetrics = hasRole(ADMIN_METRICS_ROLES);
  const canViewSetupYears = hasRole(MODULE_ROLES.STUDENTS_MASTER);
  const canViewReports = hasRole(MODULE_ROLES.REPORTS);
  const { data: scope } = useMyScope();

  const featureModules: DashboardModule[] = [
    {
      title: "Penilaian & Nilai Akhir",
      desc: "Input asesmen formatif, sumatif, serta kalkulasi nilai rapor mapel.",
      href: "/grades",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      roles: MODULE_ROLES.GRADES,
    },
    {
      title: "Rapor RDM Kemenag",
      desc: "Legger kelas, catatan wali kelas, dan cetak rapor PDF KMA 450/2024.",
      href: "/reports",
      icon: <Award className="h-5 w-5" />,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      roles: MODULE_ROLES.REPORTS,
    },
    {
      title: "Presensi Harian",
      desc: "Pencatatan kehadiran harian santri dan rekapitulasi absensi kelas.",
      href: "/attendance",
      icon: <CheckSquare className="h-5 w-5" />,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      roles: MODULE_ROLES.ATTENDANCE,
    },
    {
      title: "Tahfidz Al-Qur'an",
      desc: "Rekaman setoran Ziyadah, Muraja'ah, dan ujian Tasmi'.",
      href: "/tahfidz",
      icon: <Layers className="h-5 w-5" />,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      roles: MODULE_ROLES.TAHFIDZ,
    },
    {
      title: "Ekstrakurikuler",
      desc: "Kelola anggota ekskul dan nilai predikat untuk Rapor RDM.",
      href: "/extracurricular",
      icon: <Award className="h-5 w-5" />,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      roles: MODULE_ROLES.EXTRACURRICULAR,
    },
    {
      title: "Kepegawaian GTK",
      desc: "Kelola kode 4-digit, reset password, dan delegasi tugas guru/tendik.",
      href: "/teachers",
      icon: <Briefcase className="h-5 w-5" />,
      color: "bg-violet-50 text-violet-700 border-violet-200",
      roles: MODULE_ROLES.TEACHERS,
    },
    {
      title: "Keuangan & SPP",
      desc: "Kasir POS SPP, tagihan santri, dan laporan arus kas bendahara.",
      href: "/finance",
      icon: <Wallet className="h-5 w-5" />,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      roles: MODULE_ROLES.FINANCE_MENU,
    },
    {
      title: "Sarana & Prasarana",
      desc: "Inventaris aset QR madrasah dan pelaporan tiket kerusakan.",
      href: "/facilities",
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-slate-50 text-slate-700 border-slate-200",
      roles: MODULE_ROLES.FACILITIES,
    },
  ];

  const visibleModules = featureModules.filter((mod) => hasRole(mod.roles));

  return (
    <div className="space-y-6">
      {/* Header Welcome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Selamat Datang, {user?.fullName || "Pengguna"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem Informasi Madrasah Aliyah (SIMMA) &bull; Kode Akun:{" "}
            <span className="font-mono font-semibold text-slate-700">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canViewSetupYears && (
            <Link
              to="/students/academic-years"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              Tahun Ajaran
            </Link>
          )}
          {canViewReports && (
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Lihat Rapor RDM
            </Link>
          )}
        </div>
      </div>

      {/* Role-Gated KPI Metrics */}
      {canViewAdminMetrics && <AdminMetricsSection />}

      {/* Delegated Scope Summary (for Teachers & Staff) */}
      {scope && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ringkasan Penugasan &amp; Delegasi Anda</h2>
                <p className="text-xs text-slate-600">
                  Akses data kelas, mapel, dan ekstrakurikuler disaring otomatis sesuai delegasi Operator.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                Wali Kelas: <strong>{scope.homeroomClassroomIds.length}</strong> kelas
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                Mapel Diampu: <strong>{scope.subjectAssignments.length}</strong> penugasan
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                Pembina Ekskul: <strong>{scope.extracurricularIds.length}</strong> ekskul
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Module Shortcuts */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3">Akses Cepat Modul Sesuai Hak Anda</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleModules.map((mod) => (
            <Link
              key={mod.title}
              to={mod.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div>
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${mod.color}`}>
                  {mod.icon}
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{mod.desc}</p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700">
                <span>Buka Modul</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
