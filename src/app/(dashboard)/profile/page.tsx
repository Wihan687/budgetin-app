"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { User, Mail, Shield, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="Profil Saya"
        subtitle="Kelola informasi akun Budgetin kamu"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 max-w-2xl mx-auto w-full space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-5 sm:space-y-6">
          {/* Avatar Header */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5 sm:pb-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md shadow-emerald-500/20 shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {session?.user?.name || "Pengguna"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{session?.user?.email}</p>
              <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1">
                Akun Mahasiswa / Active
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-gray-50 rounded-xl">
              <User size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-400">Nama Lengkap</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  {session?.user?.name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-gray-50 rounded-xl">
              <Mail size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-400">Alamat Email</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  {session?.user?.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-gray-50 rounded-xl">
              <Shield size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-400">Keamanan & Password</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  Tersimpan secara aman (Bcrypt Encrypted)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition active:scale-98 cursor-pointer"
            >
              <LogOut size={16} />
              Keluar Akun
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
