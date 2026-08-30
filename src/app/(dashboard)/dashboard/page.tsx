"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Makanan",
  TRANSPORTATION: "Transportasi",
  BOARDING_HOUSE: "Kos",
  EDUCATION: "Pendidikan",
  STATIONERY: "ATK",
  INTERNET: "Internet",
  HEALTH: "Kesehatan",
  ENTERTAINMENT: "Hiburan",
  SHOPPING: "Belanja",
  OTHER: "Lainnya",
};

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#6b7280",
];

interface DashboardData {
  summary: {
    balance: number;
    todaySpend: number;
    todayIncome: number;
    weekSpend: number;
    monthSpend: number;
    yearSpend: number;
  };
  categoryBreakdown: { category: string; total: number }[];
  weeklySpending: { day: string; total: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  recentTransactions: {
    id: string;
    type: string;
    amount: string;
    category: string;
    description: string | null;
    date: string;
  }[];
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center sm:items-start gap-3 sm:gap-4">
      <div
        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 truncate">
          {formatRupiah(value)}
        </p>
        {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const pieData =
    data?.categoryBreakdown.map((c) => ({
      name: CATEGORY_LABELS[c.category] ?? c.category,
      value: c.total,
    })) ?? [];

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="Dashboard"
        subtitle="Selamat datang! 👋"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <SummaryCard
                  label="Total Saldo"
                  value={data?.summary.balance ?? 0}
                  icon={Wallet}
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>
              <SummaryCard
                label="Pengeluaran Hari Ini"
                value={data?.summary.todaySpend ?? 0}
                icon={TrendingDown}
                color="bg-red-100 text-red-500"
              />
              <SummaryCard
                label="Pengeluaran Minggu Ini"
                value={data?.summary.weekSpend ?? 0}
                icon={Calendar}
                color="bg-blue-100 text-blue-500"
              />
              <SummaryCard
                label="Pengeluaran Bulan Ini"
                value={data?.summary.monthSpend ?? 0}
                icon={TrendingDown}
                color="bg-orange-100 text-orange-500"
              />
              <SummaryCard
                label="Pengeluaran Tahun Ini"
                value={data?.summary.yearSpend ?? 0}
                icon={TrendingUp}
                color="bg-purple-100 text-purple-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Pengeluaran Bulan Ini
                </h2>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-44 text-gray-400 text-xs">
                    Belum ada data pengeluaran
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatRupiah(Number(value || 0))}
                      />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Pengeluaran 7 Hari Terakhir
                </h2>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={data?.weeklySpending ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v: any) => formatRupiah(Number(v || 0))} />
                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Tren 6 Bulan Terakhir
                </h2>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={data?.monthlyTrend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v: any) => formatRupiah(Number(v || 0))} />

                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Pemasukan" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} name="Pengeluaran" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700">Transaksi Terbaru</h2>
                <a href="/transactions" className="text-xs text-emerald-600 hover:underline font-medium">
                  Lihat semua →
                </a>
              </div>
              {!data?.recentTransactions.length ? (
                <p className="text-gray-400 text-xs text-center py-6">
                  Belum ada transaksi
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2.5">
                      <div
                        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                          {CATEGORY_LABELS[tx.category]} •{" "}
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-xs sm:text-sm font-semibold shrink-0 ${
                          tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatRupiah(Number(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
