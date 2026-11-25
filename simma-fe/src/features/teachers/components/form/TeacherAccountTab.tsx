import React from "react";
import { KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { GTK_ROLE_OPTIONS, type Role } from "@simma/shared";

export interface TeacherAccountFormState {
  primaryRole: Role;
  secondaryRoles: Role[];
  employeeCode: string;
  isActive: boolean;
}

interface Props {
  data: TeacherAccountFormState;
  isEdit: boolean;
  isFetchingCode?: boolean;
  isResetting?: boolean;
  onChange: (next: TeacherAccountFormState) => void;
  onGenerateCode: (role: Role) => void;
  onResetPassword?: () => void;
}

export const TeacherAccountTab: React.FC<Props> = ({
  data,
  isEdit,
  isFetchingCode = false,
  isResetting = false,
  onChange,
  onGenerateCode,
  onResetPassword,
}) => {
  const toggleSecondary = (role: Role) => {
    const exists = data.secondaryRoles.includes(role);
    const next = exists
      ? data.secondaryRoles.filter((r) => r !== role)
      : [...data.secondaryRoles, role];
    onChange({ ...data, secondaryRoles: next });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Autentikasi Kode Unik 4 Digit Angka (Dikelola Operator)</span>
        </div>
        <p className="text-emerald-800/90 leading-relaxed">
          Username dan password awal GTK menggunakan <strong>kode 4 digit angka</strong> (2 digit gugus tugas + 2 digit nomor urut). Guru tidak dapat mengubah password sendiri; hanya Operator yang dapat mengatur atau mereset kode akun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Role / Tugas Utama *
          </label>
          <select
            value={data.primaryRole}
            onChange={(e) => {
              const nextRole = e.target.value as Role;
              onChange({
                ...data,
                primaryRole: nextRole,
                secondaryRoles: data.secondaryRoles.filter((r) => r !== nextRole),
              });
              if (!isEdit) {
                onGenerateCode(nextRole);
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            {GTK_ROLE_OPTIONS.map((opt) => (
              <option key={opt.role} value={opt.role}>
                [{opt.prefix}xx] {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Kode Unik Login &amp; Password (4 Digit Angka) *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={data.employeeCode}
              onChange={(e) =>
                onChange({ ...data, employeeCode: e.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              placeholder="Cth: 2101"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold tracking-widest"
            />
            <button
              type="button"
              onClick={() => onGenerateCode(data.primaryRole)}
              disabled={isFetchingCode}
              className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 inline-flex items-center gap-1.5"
              title="Generate kode otomatis sesuai prefix tugas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCode ? "animate-spin" : ""}`} />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => onChange({ ...data, isActive: e.target.checked })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Akun Login Aktif (GTK diizinkan masuk ke SIMMA)</span>
        </label>

        {isEdit && onResetPassword && (
          <button
            type="button"
            onClick={onResetPassword}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isResetting ? "Mereset..." : `Reset Password ke ${data.employeeCode || "Kode"}`}</span>
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          Role / Tugas Tambahan (Opsional — jika merangkap jabatan)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
          {GTK_ROLE_OPTIONS.filter((o) => o.role !== data.primaryRole).map((opt) => (
            <label
              key={opt.role}
              className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-white"
            >
              <input
                type="checkbox"
                checked={data.secondaryRoles.includes(opt.role)}
                onChange={() => toggleSecondary(opt.role)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
