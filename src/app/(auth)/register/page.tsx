"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Wallet } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Registrasi gagal");
        return;
      }

      // Auto-login after successful register
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      window.location.href = "/dashboard";
    } catch {
      setServerError("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-400 flex items-center justify-center shadow-lg">
          <Wallet className="h-5 w-5 text-emerald-950" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Budgetin</h1>
          <p className="text-xs text-emerald-300">Kelola keuanganmu</p>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Buat akun baru 🚀</h2>
      <p className="text-emerald-200 text-xs sm:text-sm mb-6 sm:mb-8">Gratis selamanya!</p>

      <form
        method="POST"
        action=""
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
        id="register-form"
      >
        {/* Name */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">Nama</label>
          <input
            id="name"
            type="text"
            placeholder="Nama kamu"
            {...register("name")}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="kamu@email.com"
            {...register("email")}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">Password</label>
          <div className="relative flex items-center">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
              {...register("password")}
              className="w-full px-4 py-2.5 pr-12 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 p-2 rounded-lg text-emerald-200 hover:text-white active:scale-95 transition z-10 cursor-pointer"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">Konfirmasi Password</label>
          <div className="relative flex items-center">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi password"
              {...register("confirmPassword")}
              className="w-full px-4 py-2.5 pr-12 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 p-2 rounded-lg text-emerald-200 hover:text-white active:scale-95 transition z-10 cursor-pointer"
              aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-3">
            <p className="text-xs sm:text-sm text-red-300">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          id="register-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-950 font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-400/30 mt-2 text-xs sm:text-sm cursor-pointer"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-emerald-900/40 border-t-emerald-900 rounded-full animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isSubmitting ? "Mendaftar..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs sm:text-sm text-emerald-200">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-300 hover:text-white transition"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
