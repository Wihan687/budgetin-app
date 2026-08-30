"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Wallet } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Email atau password salah. Coba lagi.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setServerError("Terjadi kesalahan koneksi saat login.");
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

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Selamat datang! 👋</h2>
      <p className="text-emerald-200 text-xs sm:text-sm mb-6 sm:mb-8">Masuk ke akun kamu</p>

      <form
        method="POST"
        action=""
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-4 sm:space-y-5"
        id="login-form"
      >
        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">
            Email
          </label>
          <input
            id="email"
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
          <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1.5">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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

        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-3">
            <p className="text-xs sm:text-sm text-red-300">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          id="login-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-950 font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-400/30 text-xs sm:text-sm cursor-pointer"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-emerald-900/40 border-t-emerald-900 rounded-full animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isSubmitting ? "Masuk..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs sm:text-sm text-emerald-200">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-300 hover:text-white transition"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
