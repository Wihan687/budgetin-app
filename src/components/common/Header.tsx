"use client";

import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export function Header({ title, subtitle, onOpenMobileMenu }: HeaderProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Kamu";

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition active:scale-95"
            aria-label="Open Mobile Navigation Menu"
          >
            <Menu size={22} />
          </button>
        )}

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <button
          id="notification-btn"
          className="relative h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition active:scale-95"
        >
          <Bell size={16} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-sm font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {firstName}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
