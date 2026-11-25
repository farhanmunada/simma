import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { CreditCard, FileText, Tag, ShieldAlert, BarChart3 } from "lucide-react";
import { FinanceCashierPage } from "./pages/FinanceCashierPage";
import { FinanceInvoicesPage } from "./pages/FinanceInvoicesPage";
import { FinanceFeeItemsPage } from "./pages/FinanceFeeItemsPage";
import { FinanceDispensationsPage } from "./pages/FinanceDispensationsPage";
import { FinanceReportsPage } from "./pages/FinanceReportsPage";
import { RouteRoleGuard } from "../auth";
import { MODULE_ROLES } from "../../config/roles";
import { useAuthStore } from "../../stores/auth.store";

const tabs = [
  { name: "Kasir POS", href: "/finance/cashier", icon: CreditCard, roles: MODULE_ROLES.FINANCE_ADMIN },
  { name: "Tagihan Siswa", href: "/finance/invoices", icon: FileText },
  { name: "Pos Biaya & Tarif", href: "/finance/fee-items", icon: Tag, roles: MODULE_ROLES.FINANCE_ADMIN },
  { name: "Dispensasi", href: "/finance/dispensations", icon: ShieldAlert, roles: MODULE_ROLES.FINANCE_ADMIN },
  { name: "Laporan & Arus Kas", href: "/finance/reports", icon: BarChart3, roles: MODULE_ROLES.FINANCE_ADMIN },
];

export const FinanceRoutes: React.FC = () => {
  const location = useLocation();
  const hasRole = useAuthStore((s) => s.hasRole);
  const visibleTabs = tabs.filter((tab) => !tab.roles || hasRole(tab.roles));

  const isTabActive = (tabHref: string) => {
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route
          index
          element={
            <Navigate
              to={hasRole(MODULE_ROLES.FINANCE_ADMIN) ? "cashier" : "invoices"}
              replace
            />
          }
        />
        <Route
          path="cashier"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.FINANCE_ADMIN}>
              <FinanceCashierPage />
            </RouteRoleGuard>
          }
        />
        <Route path="invoices" element={<FinanceInvoicesPage />} />
        <Route
          path="fee-items"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.FINANCE_ADMIN}>
              <FinanceFeeItemsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="dispensations"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.FINANCE_ADMIN}>
              <FinanceDispensationsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="reports"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.FINANCE_ADMIN}>
              <FinanceReportsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={hasRole(MODULE_ROLES.FINANCE_ADMIN) ? "cashier" : "invoices"}
              replace
            />
          }
        />
      </Routes>
    </div>
  );
};
