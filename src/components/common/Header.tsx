"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Bell,
  Menu,
  User,
  Target,
  Lightbulb,
  LogOut,
  CheckCheck,
  Sparkles,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "success" | "info";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Anggaran Makanan",
    message: "Batas pengeluaran kategori makanan kamu telah mencapai 80%.",
    time: "2 jam lalu",
    type: "warning",
    read: false,
  },
  {
    id: "2",
    title: "AI Receipt Scanner",
    message: "Nota belanja kamu berhasil diproses & dicatat ke database.",
    time: "5 jam lalu",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Tips Keuangan",
    message: "Catat setiap pengeluaran harianmu untuk menjaga arus kas tetap aman!",
    time: "1 hari lalu",
    type: "info",
    read: true,
  },
];

export function Header({ title, subtitle, onOpenMobileMenu }: HeaderProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Kamu";
  const fullName = session?.user?.name ?? "User Budgetin";
  const email = session?.user?.email ?? "user@budgetin.id";

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
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

      {/* Right Controls (Notifications & Profile) */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Notification Menu Button & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative h-9 w-9 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Notifikasi"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800">
                    Notifikasi ({notifications.length})
                  </h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    Tandai Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 flex items-start gap-3 transition ${
                        item.read ? "bg-white" : "bg-emerald-50/40"
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          item.type === "warning"
                            ? "bg-amber-100 text-amber-600"
                            : item.type === "success"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {item.type === "warning" ? (
                          <AlertCircle size={15} />
                        ) : item.type === "success" ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Sparkles size={15} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                          {item.message}
                        </p>
                      </div>

                      <button
                        onClick={() => removeNotification(item.id)}
                        className="text-gray-300 hover:text-gray-500 p-0.5 rounded cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Button & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="header-profile-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 transition active:scale-98 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0 border border-emerald-300/40">
              <span className="text-sm font-bold text-white">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">
                {firstName}
              </p>
              <p className="text-[11px] text-gray-400 truncate max-w-[130px]">
                {email}
              </p>
            </div>

            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Panel */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 space-y-1 p-2">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60 space-y-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">{fullName}</p>
                <p className="text-[11px] text-emerald-700 truncate">{email}</p>
              </div>

              <div className="py-1 space-y-0.5 text-xs font-medium text-gray-700">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <User size={15} className="text-emerald-600" />
                  <span>Profil Saya</span>
                </Link>

                <Link
                  href="/budget"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <Target size={15} className="text-amber-500" />
                  <span>Kelola Anggaran</span>
                </Link>

                <Link
                  href="/insights"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <Lightbulb size={15} className="text-blue-500" />
                  <span>Insight Keuangan</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
