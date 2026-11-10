import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { navItems, roleLabelMap } from "./nav-items";

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Master Vertical Navigation Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-60"
        } bg-white text-slate-600 flex flex-col shrink-0 border-r border-slate-200 transition-all duration-200 select-none shadow-xs`}
      >
        <div className="h-14 px-3 flex items-center justify-between border-b border-slate-100 bg-emerald-50/30">
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 border border-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                  S
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-sm block leading-none">SIMMA</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Madrasah Aliyah</span>
                </div>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Tutup Sidebar"
                className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                title="Buka Sidebar"
                className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
              >
                <PanelLeftOpen className="w-5 h-5 text-emerald-700" />
              </button>
            </div>
          )}
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

            // Collapsed Rail View: Clickable icon with hover tooltip / direct jump
            if (isCollapsed) {
              const targetUrl = item.href || (item.subItems ? item.subItems[0].href : "/");
              const isActive = isDirectActive || isChildActive;

              return (
                <div key={item.title} className="relative group flex justify-center">
                  <Link
                    to={targetUrl}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "text-slate-500 hover:text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>

                  {/* Flyout Submenu / Label on Hover when Collapsed */}
                  <div className="absolute left-full top-0 ml-2 hidden group-hover:flex flex-col bg-white border border-slate-200 shadow-xl rounded-lg py-1.5 px-2 z-50 min-w-44">
                    <p className="text-[11px] font-bold text-slate-800 px-2 py-1 border-b border-slate-100 mb-1">
                      {item.title}
                    </p>
                    {hasSub ? (
                      item.subItems!.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={`text-xs px-2 py-1.5 rounded-md transition-colors ${
                            location.pathname === sub.href
                              ? "bg-emerald-50 text-emerald-800 font-semibold"
                              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                          }`}
                        >
                          {sub.title}
                        </Link>
                      ))
                    ) : (
                      <Link
                        to={item.href!}
                        className="text-xs px-2 py-1 rounded-md text-emerald-800 hover:bg-emerald-50 font-medium"
                      >
                        Buka Halaman
                      </Link>
                    )}
                  </div>
                </div>
              );
            }

            if (hasSub) {
              return (
                <div key={item.title} className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors ${
                      isChildActive
                        ? "text-emerald-800 bg-emerald-50/80 font-semibold"
                        : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
                                ? "bg-emerald-100/70 text-emerald-900 font-semibold"
                                : "text-slate-500 hover:text-emerald-800 hover:bg-emerald-50"
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
                className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors ${
                  isDirectActive
                    ? "bg-emerald-800 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User bar at bottom - clean and isolated */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || "Pengguna"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium truncate">
                  {roleLabelMap[user?.role || ""] || user?.role || "Staff"}
                </p>
              </div>
              <button
                onClick={() => logout()}
                title="Keluar"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => logout()}
              title="Keluar"
              className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            <span>Tahun Ajaran</span>
            <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              2026/2027 Ganjil
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Sistem Terpadu Madrasah
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
