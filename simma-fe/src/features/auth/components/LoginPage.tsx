import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 p-8 shadow-xs">
        <div className="mb-6">
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold text-sm mb-4">
            S
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">SIMMA</h1>
          <p className="text-xs text-slate-500 mt-1">Masuk dengan kredensial madrasah.</p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email / Username"
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

          <Button
            type="submit"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md text-xs transition-colors mt-2"
            isLoading={isLoading}
          >
            Masuk
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a href="/ppdb" className="hover:text-slate-900">
            Portal PPDB
          </a>
          <span>SIMMA Aliyah</span>
        </div>
      </div>
    </div>
  );
};
