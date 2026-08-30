"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  ScanLine,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/scanner", label: "Scan AI", icon: ScanLine, isPrimary: true },
  { href: "/budget", label: "Anggaran", icon: Target },
  { href: "/profile", label: "Profil", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 px-2 py-1.5 shadow-lg shadow-gray-900/10">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {mobileNavItems.map(({ href, label, icon: Icon, isPrimary }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          if (isPrimary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center relative -top-4 group"
              >
                <div
                  className={cn(
                    "w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                    isActive
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-emerald-500/40"
                      : "bg-emerald-500 text-white shadow-emerald-500/30 group-hover:scale-105"
                  )}
                >
                  <Icon size={24} className="stroke-[2.5]" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold mt-1 tracking-tight",
                    isActive ? "text-emerald-600" : "text-gray-500"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl transition-colors active:scale-95",
                isActive ? "text-emerald-600 font-bold" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={20} className={cn(isActive && "stroke-[2.5]")} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
