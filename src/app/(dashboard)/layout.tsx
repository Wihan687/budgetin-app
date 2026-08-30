"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/common/Sidebar";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50/80 antialiased">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0 w-full overflow-x-hidden">
          {/* Inject onOpenMobileMenu to children if needed or pass via context/header */}
          {children}
        </div>
        <MobileBottomNav />
      </div>
    </SessionProvider>
  );
}
