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
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles?: string[];
  subItems?: { title: string; href: string }[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
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
];

export const roleLabelMap: Record<string, string> = {
  super_admin: "Super Admin",
  admin_tu: "Admin TU",
  kepala_madrasah: "Kepala Madrasah",
  waka_kurikulum: "Waka Kurikulum",
  waka_kesiswaan: "Waka Kesiswaan",
  wali_kelas: "Wali Kelas",
  guru_mapel: "Guru Mapel",
  guru: "Guru",
  siswa: "Siswa",
  orang_tua: "Orang Tua",
};
