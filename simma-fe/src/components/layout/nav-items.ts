import React from "react";
import {
  Mail,
  Settings,
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
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles?: string[];
  subItems?: { title: string; href: string }[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    group: "Utama",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Administrasi & TU",
    items: [
      {
        title: "Tata Usaha & Surat",
        icon: Mail,
        roles: ["super_admin", "admin_tu", "kepala_madrasah"],
        subItems: [
          { title: "Surat Masuk", href: "/letters/incoming" },
          { title: "Disposisi Kamad", href: "/letters/dispositions" },
          { title: "Surat Keluar", href: "/letters/outgoing" },
          { title: "Buku Ekspedisi", href: "/letters/expeditions" },
          { title: "Klasifikasi KMA 44", href: "/letters/classifications" },
        ],
      },
      {
        title: "Master Data",
        icon: Settings,
        roles: ["super_admin", "admin_tu", "waka_kurikulum"],
        subItems: [
          { title: "Tahun Ajaran", href: "/settings/academic-years" },
          { title: "Semester", href: "/settings/semesters" },
          { title: "Kelas & Rombel", href: "/settings/classrooms" },
          { title: "Mata Pelajaran", href: "/settings/subjects" },
          { title: "Guru & GTK", href: "/settings/teachers" },
        ],
      },
      {
        title: "Kepegawaian GTK",
        icon: UserCheck,
        roles: [
          "super_admin",
          "admin_tu",
          "kepala_madrasah",
          "waka_kurikulum",
          "guru",
          "guru_mapel",
          "wali_kelas",
        ],
        subItems: [
          { title: "Direktori GTK", href: "/teachers" },
          { title: "Beban Kerja (24 JTM)", href: "/teachers/workloads" },
          { title: "Monitoring Mutu", href: "/teachers/monitoring" },
        ],
      },
      {
        title: "Keuangan & SPP",
        icon: CreditCard,
        roles: ["super_admin", "admin_tu", "kepala_madrasah", "bendahara"],
        subItems: [
          { title: "Kasir Loket Cepat", href: "/finance/cashier" },
          { title: "Tagihan Siswa", href: "/finance/invoices" },
          { title: "Pos & Tarif Biaya", href: "/finance/fee-items" },
          { title: "Dispensasi", href: "/finance/dispensations" },
          { title: "Laporan Keuangan", href: "/finance/reports" },
        ],
      },
    ],
  },
  {
    group: "Kesiswaan & Karakter",
    items: [
      {
        title: "Kesiswaan",
        icon: Users,
        roles: ["super_admin", "admin_tu", "waka_kesiswaan", "wali_kelas"],
        subItems: [
          { title: "PPDB & Pendaftar", href: "/ppdb-admin" },
          { title: "Buku Induk Siswa", href: "/students" },
          { title: "Penempatan Rombel", href: "/students/assign" },
        ],
      },
      {
        title: "Tahfidz & Tasmi'",
        icon: BookOpen,
        roles: ["super_admin", "guru", "wali_kelas"],
        subItems: [
          { title: "Setoran Hafalan", href: "/tahfidz" },
          { title: "Ujian Tasmi'", href: "/tahfidz/tasmi" },
        ],
      },
      {
        title: "Mutaba'ah Yaumiyah",
        icon: ClipboardCheck,
        roles: [
          "super_admin",
          "admin_tu",
          "kepala_madrasah",
          "waka_kesiswaan",
          "wali_kelas",
          "guru",
        ],
        subItems: [
          { title: "Checklist Harian", href: "/mutabaah/checklist" },
          { title: "Monitoring & Rapor", href: "/mutabaah/compliance" },
          { title: "Katalog Amalan", href: "/mutabaah/activities" },
        ],
      },
    ],
  },
  {
    group: "Akademik & Pembelajaran",
    items: [
      {
        title: "Presensi",
        icon: CalendarCheck,
        roles: ["super_admin", "admin_tu", "guru", "wali_kelas"],
        subItems: [
          { title: "Presensi Siswa", href: "/attendance/students" },
          { title: "Presensi Guru", href: "/attendance/teachers" },
          { title: "Rekapitulasi", href: "/attendance/recap" },
        ],
      },
      {
        title: "Penilaian",
        href: "/grades",
        icon: GraduationCap,
        roles: ["super_admin", "guru", "wali_kelas"],
      },
      {
        title: "Jadwal Pelajaran",
        href: "/schedules",
        icon: Calendar,
        roles: ["super_admin", "admin_tu", "kepala_madrasah", "waka_kurikulum", "guru", "wali_kelas"],
      },
      {
        title: "Projek P5RA",
        href: "/p5ra",
        icon: Layers,
        roles: ["super_admin", "kepala_madrasah", "waka_kurikulum", "guru", "wali_kelas"],
      },
      {
        title: "Rapor & Legger",
        icon: FileSpreadsheet,
        roles: ["super_admin", "admin_tu", "kepala_madrasah", "waka_kurikulum", "wali_kelas", "guru"],
        subItems: [
          { title: "Rapor Siswa", href: "/reports" },
          { title: "Legger Nilai", href: "/reports/legger" },
        ],
      },
      {
        title: "Tata Tertib & BK",
        icon: ShieldAlert,
        roles: [
          "super_admin",
          "kepala_madrasah",
          "waka_kesiswaan",
          "guru_bk",
          "wali_kelas",
          "guru",
          "guru_mapel",
          "admin_tu",
        ],
        subItems: [
          { title: "Dashboard & Leaderboard", href: "/discipline" },
          { title: "Pelanggaran & Apresiasi", href: "/discipline/infractions" },
          { title: "Bimbingan Konseling (BK)", href: "/discipline/counseling" },
          { title: "Panggilan Orang Tua", href: "/discipline/summons" },
          { title: "Katalog Aturan Tatib", href: "/discipline/rules" },
        ],
      },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export const roleLabelMap: Record<string, string> = {
  super_admin: "Super Admin",
  admin_tu: "Admin TU",
  kepala_madrasah: "Kepala Madrasah",
  waka_kurikulum: "Waka Kurikulum",
  waka_kesiswaan: "Waka Kesiswaan",
  guru_bk: "Guru BK",
  bendahara: "Bendahara",
  wali_kelas: "Wali Kelas",
  guru_mapel: "Guru Mapel",
  guru: "Guru",
  siswa: "Siswa",
  orang_tua: "Orang Tua",
};
