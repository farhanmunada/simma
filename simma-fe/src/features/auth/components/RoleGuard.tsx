import React from "react";
import { Link } from "react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { type UserRole, useAuthStore } from "../../../stores/auth.store";

export interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback = null }) => {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const ForbiddenPage: React.FC = () => (
  <div className="max-w-lg mx-auto my-12 rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-xs space-y-4">
    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
      <ShieldAlert className="w-6 h-6" aria-hidden="true" />
    </div>
    <div className="space-y-1">
      <h2 className="text-lg font-bold text-slate-900">Akses Ditolak (403)</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Akun Anda tidak memiliki hak akses untuk membuka halaman atau modul ini. Hubungi Super Admin atau Admin TU jika diperlukan penyesuaian peran.
      </p>
    </div>
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
    >
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Kembali ke Dashboard</span>
    </Link>
  </div>
);

export const RouteRoleGuard: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => (
  <RoleGuard roles={roles} fallback={<ForbiddenPage />}>
    {children}
  </RoleGuard>
);
