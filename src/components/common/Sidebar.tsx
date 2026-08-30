"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Lightbulb,
  ScanLine,
  User,
  LogOut,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Anggaran", icon: Target },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/scanner", label: "Scanner AI", icon: ScanLine },
  { href: "/profile", label: "Profil", icon: User },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-emerald-950 border-r border-emerald-900/50">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-900/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-400 flex items-center justify-center shadow-lg">
            <Wallet className="h-5 w-5 text-emerald-950" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">Budgetin</span>
            <p className="text-[10px] text-emerald-400 leading-none">Finance Tracker</p>
          </div>
        </div>

        {/* Close Button for Mobile Drawer */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-900/40 font-bold"
                  : "text-emerald-300 hover:bg-emerald-900/60 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-emerald-900/50">
        <button
          id="signout-btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-300 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 z-40">
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
