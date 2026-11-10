import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { School, ArrowRight, Lock } from "lucide-react";
import { useAuthStore } from "../../../stores/auth.store";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { login } from "../api/auth.api";
import { ApiError } from "../../../lib/api-client";
import type { LoginCredentials } from "../types";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginCredentials) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Gagal masuk ke sistem. Silakan periksa kredensial Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950/10 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Left Panel: Madrasah Green & Neutral Slate */}
        <div className="md:col-span-5 bg-emerald-800 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center font-bold text-white text-lg">
                <School className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="font-bold tracking-tight text-xl text-white">SIMMA</span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2 leading-snug">
              Sistem Informasi Madrasah Aliyah
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Tata kelola terpadu kurikulum Kemenag, presensi santri, data induk kesiswaan, dan tata usaha madrasah.
            </p>
          </div>

          <div className="pt-6 border-t border-emerald-700/60 text-[11px] text-emerald-200/80 flex items-center justify-between">
            <span>Kementerian Agama RI</span>
            <span>Tahun Ajaran 2026/2027</span>
          </div>
        </div>

        {/* Right Panel: Clean Modern Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Masuk Akun</h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan akun resmi untuk mengakses sistem.
              </p>
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                id="login-email"
                label="Email atau Username"
                type="text"
                autoComplete="username"
                placeholder="nama@madrasah.sch.id"
                error={errors.email?.message}
                {...register("email", {
                  required: "Email atau username wajib diisi",
                })}
              />

              <Input
                id="login-password"
                label="Kata Sandi"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password", {
                  required: "Kata sandi wajib diisi",
                })}
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Koneksi aman</span>
                </span>
                <a href="/ppdb" className="text-emerald-700 font-medium hover:underline">
                  Portal PPDB
                </a>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
                isLoading={isLoading}
              >
                <span>Masuk Sistem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              SIMMA Aliyah &copy; 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
