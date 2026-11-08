import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../stores/auth.store";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
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
        setServerError("Gagal masuk ke sistem. Silakan periksa kembali kredensial Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-slate-200 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-xs mb-2">
            S
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">SIMMA</h1>
          <p className="text-xs text-slate-500 font-medium">Sistem Informasi Madrasah Aliyah</p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email / Nama Pengguna"
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

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Masuk
          </Button>
        </form>
      </Card>
    </div>
  );
};
