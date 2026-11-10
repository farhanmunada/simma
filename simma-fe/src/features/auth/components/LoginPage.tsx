import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  School,
  Lock,
  ArrowRight,
} from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Visual & Hero Panel */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                <School className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-xl text-white">SIMMA</span>
                <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  v1.0 Aliyah
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              Sistem Informasi Terpadu Madrasah Aliyah
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Platform tata kelola terintegrasi untuk kurikulum madrasah, presensi digital, tahfidz Al-Qur'an, dan administrasi akademik berstandar Kemenag.
            </p>
          </div>

          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-center space-x-3 text-xs text-emerald-50 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standar Kurikulum Merdeka & RDM Terpadu</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-emerald-50 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Monitoring Harian Tahfidz & Tasmi' Bersanad</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-emerald-50 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Role Access Control Aman & Terenkripsi</span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200/70">
            <span>Kementerian Agama RI</span>
            <span>SIMMA Cloud</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang</h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan masuk menggunakan kredensial madrasah Anda.
              </p>
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 flex items-start space-x-2"
              >
                <span className="font-semibold">Perhatian:</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                id="login-email"
                label="Email atau Nama Pengguna"
                type="text"
                autoComplete="username"
                placeholder="nama@madrasah.sch.id"
                error={errors.email?.message}
                {...register("email", {
                  required: "Email atau nama pengguna wajib diisi",
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
                  minLength: {
                    value: 6,
                    message: "Kata sandi minimal 6 karakter",
                  },
                })}
              />

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sesi login aman</span>
                </span>
                <span className="text-emerald-700 font-medium">Bantuan TU</span>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
                isLoading={isLoading}
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              Calon peserta didik baru?{" "}
              <a href="/ppdb" className="text-emerald-700 font-semibold hover:underline">
                Buka Portal PPDB Online
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
