import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router";
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles?: string[];
  subItems?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
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
      { title: "Penempatan Rombel", href: "/students/classes" },
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
    title: "Rapor & Legger",
    icon: FileSpreadsheet,
    roles: ["super_admin", "admin_tu", "kepala_madrasah", "waka_kurikulum", "wali_kelas", "guru"],
    subItems: [
      { title: "Rapor Siswa", href: "/reports" },
      { title: "Legger Nilai", href: "/reports/legger" },
    ],
  },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Master Data": true,
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const roleLabelMap: Record<string, string> = {
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

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Master Vertical Navigation Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              S
            </div>
            <span className="font-bold text-slate-100 tracking-tight text-sm">SIMMA</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400">
            MA
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-xs">
          {navItems.map((item) => {
            if (item.roles && !hasRole(item.roles as any)) {
              return null;
            }

            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.title];
            const isDirectActive = item.href && location.pathname === item.href;
            const isChildActive =
              hasSub && item.subItems?.some((sub) => location.pathname === sub.href);

            if (hasSub) {
              return (
                <div key={item.title} className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md font-medium transition-colors ${
                      isChildActive
                        ? "text-emerald-400 bg-slate-800/80"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 pr-1 space-y-0.5 pt-0.5">
                      {item.subItems!.map((sub) => {
                        const isSubActive = location.pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            className={`block px-2.5 py-1.5 rounded-md transition-colors ${
                              isSubActive
                                ? "bg-emerald-600/20 text-emerald-400 font-medium"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.href!}
                className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-md font-medium transition-colors ${
                  isDirectActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User bar at bottom - clean and isolated */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.fullName || "Pengguna"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {roleLabelMap[user?.role || ""] || user?.role || "Staff"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="text-xs font-medium text-slate-500">
            Tahun Ajaran <span className="font-semibold text-slate-800">2026/2027 Ganjil</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sistem Aktif
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
