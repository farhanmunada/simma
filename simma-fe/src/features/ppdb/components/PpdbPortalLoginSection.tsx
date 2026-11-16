import React, { useState } from "react";
import { LogIn, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { useLoginCalonSiswa } from "../api/ppdb.api";
import { useAuthStore } from "../../../stores/auth.store";
import type { PpdbApplicant } from "../types";

interface PpdbPortalLoginSectionProps {
  onLoginSuccess: (applicant: PpdbApplicant) => void;
  onGoToRegister: () => void;
}

export const PpdbPortalLoginSection: React.FC<PpdbPortalLoginSectionProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLoginCalonSiswa();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim() || !password) {
      setErrorMsg("Mohon masukkan NIK/NISN/No. Registrasi dan Password Anda.");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({
        identifier: identifier.trim(),
        password,
      });

      // Simpan session auth ke store (role: calon_siswa)
      useAuthStore.getState().setAuth(
        {
          id: res.applicant.id,
          email: res.applicant.email || `${res.applicant.registrationNumber}@ppdb.local`,
          fullName: res.applicant.fullName,
          role: "calon_siswa",
        },
        res.token
      );

      onLoginSuccess(res.applicant);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal masuk portal. Periksa kembali NIK/NISN dan kata sandi Anda."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Masuk ke Portal Calon Siswa
        </h2>
        <p className="text-xs text-slate-500">
          Gunakan NIK (16 digit), NISN, atau No. Pendaftaran dan kata sandi Anda
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">
            NIK, NISN, atau No. Pendaftaran <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Contoh: 3515... atau REG-2025-..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Kata Sandi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-md text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <span>{loginMutation.isPending ? "Memverifikasi..." : "Masuk ke Akun Pendaftar"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Belum memiliki akun pendaftaran?{" "}
        <button
          type="button"
          onClick={onGoToRegister}
          className="text-emerald-700 font-semibold hover:underline"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );
};
