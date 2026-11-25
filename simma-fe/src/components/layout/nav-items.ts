import React from "react";
import {
  Mail,
  Building2,
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  FileSpreadsheet,
  LayoutDashboard,
  Layers,
  ClipboardCheck,
  UserCheck,
  CreditCard,
  Calendar,
  ShieldAlert,
  Award,
  Database,
  Package,
} from "lucide-react";
import { MODULE_ROLES } from "../../config/roles";
import type { UserRole } from "../../stores/auth.store";

export interface NavSubItem {
  title: string;
  href: string;
  roles?: UserRole[];
}

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles?: UserRole[];
  subItems?: NavSubItem[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    group: "Utama & Harian",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Presensi",
        icon: CalendarCheck,
        roles: MODULE_ROLES.ATTENDANCE,
        subItems: [
          { title: "Presensi Siswa", href: "/attendance/students" },
          {
            title: "Presensi Guru",
            href: "/attendance/teachers",
            roles: MODULE_ROLES.ATTENDANCE_TEACHERS,
          },
          { title: "Rekapitulasi", href: "/attendance/recap" },
        ],
      },
      {
        title: "Tahfidz & Tasmi'",
        icon: BookOpen,
        roles: MODULE_ROLES.TAHFIDZ,
        subItems: [
          { title: "Setoran Hafalan", href: "/tahfidz" },
          { title: "Ujian Tasmi'", href: "/tahfidz/tasmi" },
        ],
      },
      {
        title: "Mutaba'ah Yaumiyah",
        icon: ClipboardCheck,
        roles: MODULE_ROLES.MUTABAAH,
        subItems: [
          { title: "Checklist Harian", href: "/mutabaah/checklist" },
          { title: "Monitoring & Rapor", href: "/mutabaah/compliance" },
          {
            title: "Katalog Amalan",
            href: "/mutabaah/activities",
            roles: MODULE_ROLES.MUTABAAH_ACTIVITIES,
          },
        ],
      },
      {
        title: "Tata Tertib & BK",
        icon: ShieldAlert,
        roles: MODULE_ROLES.DISCIPLINE,
        subItems: [
          { title: "Dashboard & Leaderboard", href: "/discipline" },
          { title: "Pelanggaran & Apresiasi", href: "/discipline/infractions" },
          {
            title: "Bimbingan Konseling (BK)",
            href: "/discipline/counseling",
            roles: MODULE_ROLES.DISCIPLINE_COUNSELING,
          },
          {
            title: "Panggilan Orang Tua",
            href: "/discipline/summons",
            roles: MODULE_ROLES.DISCIPLINE_SUMMONS,
          },
          { title: "Katalog Aturan Tatib", href: "/discipline/rules" },
        ],
      },
      {
        title: "Keuangan & SPP",
        icon: CreditCard,
        roles: MODULE_ROLES.FINANCE_MENU,
        subItems: [
          {
            title: "Kasir Loket Cepat",
            href: "/finance/cashier",
            roles: MODULE_ROLES.FINANCE_CASHIER,
          },
          { title: "Tagihan Siswa", href: "/finance/invoices" },
          {
            title: "Pos & Tarif Biaya",
            href: "/finance/fee-items",
            roles: MODULE_ROLES.FINANCE_ADMIN,
          },
          {
            title: "Dispensasi",
            href: "/finance/dispensations",
            roles: MODULE_ROLES.FINANCE_CASHIER,
          },
          {
            title: "Laporan Keuangan",
            href: "/finance/reports",
            roles: MODULE_ROLES.FINANCE_ADMIN,
          },
        ],
      },
    ],
  },
  {
    group: "Akademik & Pembelajaran",
    items: [
      {
        title: "Penilaian",
        href: "/grades",
        icon: GraduationCap,
        roles: MODULE_ROLES.GRADES,
      },
      {
        title: "Jadwal Pelajaran",
        href: "/schedules",
        icon: Calendar,
        roles: MODULE_ROLES.SCHEDULES,
      },
      {
        title: "Tata Usaha & Surat",
        icon: Mail,
        roles: MODULE_ROLES.LETTERS_MENU,
        subItems: [
          { title: "Surat Masuk", href: "/letters/incoming" },
          { title: "Disposisi Kamad", href: "/letters/dispositions" },
          { title: "Surat Keluar", href: "/letters/outgoing" },
          { title: "Buku Ekspedisi", href: "/letters/expeditions" },
          { title: "Klasifikasi KMA 44", href: "/letters/classifications" },
        ],
      },
      {
        title: "Projek P5RA",
        href: "/p5ra",
        icon: Layers,
        roles: MODULE_ROLES.P5RA,
      },
      {
        title: "Ekstrakurikuler",
        href: "/extracurricular",
        icon: Award,
        roles: MODULE_ROLES.EXTRACURRICULAR,
      },
      {
        title: "Rapor & Legger",
        icon: FileSpreadsheet,
        roles: MODULE_ROLES.REPORTS,
        subItems: [
          { title: "Rapor Siswa", href: "/reports" },
          { title: "Legger Nilai", href: "/reports/legger" },
        ],
      },
    ],
  },
  {
    group: "Kepegawaian & Fasilitas",
    items: [
      {
        title: "Kepegawaian GTK",
        icon: UserCheck,
        roles: MODULE_ROLES.TEACHERS,
        subItems: [
          { title: "Direktori & Akun GTK", href: "/teachers" },
          { title: "Beban Kerja (24 JTM)", href: "/teachers/workloads" },
          { title: "Monitoring Mutu", href: "/teachers/monitoring" },
        ],
      },
      {
        title: "Sarana & Prasarana",
        href: "/facilities",
        icon: Package,
        roles: MODULE_ROLES.FACILITIES,
      },
    ],
  },
  {
    group: "Kesiswaan & Registrasi Tahunan",
    items: [
      {
        title: "Kesiswaan",
        icon: Users,
        roles: MODULE_ROLES.STUDENTS_SIDEBAR,
        subItems: [
          {
            title: "PPDB & Pendaftar",
            href: "/ppdb-admin",
            roles: MODULE_ROLES.PPDB_ADMIN,
          },
          {
            title: "Kesiswaan & Buku Induk",
            href: "/students",
            roles: MODULE_ROLES.STUDENTS,
          },
          {
            title: "Kelas & Rombel",
            href: "/students/classrooms",
            roles: MODULE_ROLES.STUDENTS_MASTER,
          },
          {
            title: "Penempatan Rombel",
            href: "/students/assign",
            roles: MODULE_ROLES.STUDENTS_MASTER,
          },
          {
            title: "Mutasi & Kelulusan",
            href: "/transfers",
            roles: MODULE_ROLES.TRANSFERS,
          },
          {
            title: "Tahun Ajaran",
            href: "/students/academic-years",
            roles: MODULE_ROLES.STUDENTS_MASTER,
          },
          {
            title: "Semester",
            href: "/students/semesters",
            roles: MODULE_ROLES.STUDENTS_MASTER,
          },
          {
            title: "Mata Pelajaran",
            href: "/students/subjects",
            roles: MODULE_ROLES.STUDENTS_MASTER,
          },
        ],
      },
      {
        title: "Ekspor EMIS 4.0",
        href: "/emis",
        icon: Database,
        roles: MODULE_ROLES.EMIS,
      },
    ],
  },
  {
    group: "Pengaturan & Lembaga",
    items: [
      {
        title: "Profil Madrasah",
        href: "/settings/profile",
        icon: Building2,
        roles: MODULE_ROLES.SETTINGS,
      },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export const roleLabelMap: Record<string, string> = {
  super_admin: "Super Admin",
  operator: "Operator Madrasah",
  admin_tu: "Admin TU",
  kepala_madrasah: "Kepala Madrasah",
  waka_sarpras: "Waka Sarpras",
  waka_kurikulum: "Waka Kurikulum",
  waka_kesiswaan: "Waka Kesiswaan",
  guru_bk: "Guru BK",
  bendahara: "Bendahara",
  wali_kelas: "Wali Kelas",
  guru_mapel: "Guru Mapel",
  guru_diniyah: "Guru Diniyah",
  guru_tahfidz: "Guru Tahfidz",
  pembina_ekskul: "Pembina Ekskul",
  musyrif: "Musyrif Asrama",
  pustakawan: "Pustakawan",
  guru: "Guru",
  siswa: "Siswa",
  orang_tua: "Orang Tua",
  calon_siswa: "Calon Siswa",
};
