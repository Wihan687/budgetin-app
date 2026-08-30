import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – Budgetin",
  description: "Masuk ke akun Budgetin kamu",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
