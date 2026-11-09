import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { Inbox, FileText, Send, BookOpen, Layers } from "lucide-react";
import { IncomingLettersPage } from "./components/IncomingLettersPage";
import { DispositionsPage } from "./components/DispositionsPage";
import { OutgoingLettersPage } from "./components/OutgoingLettersPage";
import { ExpeditionPage } from "./components/ExpeditionPage";
import { ClassificationsPage } from "./components/ClassificationsPage";

const tabs = [
  { name: "Surat Masuk", href: "/letters", icon: Inbox },
  { name: "Disposisi Kamad", href: "/letters/dispositions", icon: FileText },
  { name: "Surat Keluar & Generator", href: "/letters/outgoing", icon: Send },
  { name: "Buku Ekspedisi", href: "/letters/expeditions", icon: BookOpen },
  { name: "Master Klasifikasi KMA 44", href: "/letters/classifications", icon: Layers },
];

export const LettersRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tabHref: string) => {
    if (tabHref === "/letters") {
      return (
        location.pathname === "/letters" ||
        location.pathname === "/letters/" ||
        location.pathname.startsWith("/letters/incoming")
      );
    }
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            Tata Usaha & Persuratan Madrasah
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda naskah dinas masuk, disposisi digital kepala madrasah, generator surat resmi, dan buku ekspedisi (PMA 12/2024).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Letters Navigation">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex items-center gap-2 whitespace-nowrap py-2.5 px-1 border-b-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-emerald-600 text-emerald-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Child Routes */}
      <Routes>
        <Route index element={<IncomingLettersPage />} />
        <Route path="incoming" element={<IncomingLettersPage />} />
        <Route path="dispositions" element={<DispositionsPage />} />
        <Route path="outgoing" element={<OutgoingLettersPage />} />
        <Route path="expeditions" element={<ExpeditionPage />} />
        <Route path="classifications" element={<ClassificationsPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
