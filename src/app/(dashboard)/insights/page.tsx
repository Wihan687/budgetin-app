"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { Lightbulb, TrendingUp, TrendingDown, Award, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const CATEGORY_MAP: Record<string, string> = {
  FOOD: "Makanan & Minuman",
  TRANSPORTATION: "Transportasi",
  BOARDING_HOUSE: "Biaya Kos",
  EDUCATION: "Pendidikan & Kuliah",
  STATIONERY: "Alat Tulis & Buku",
  INTERNET: "Paket Data & Internet",
  HEALTH: "Kesehatan & Obat",
  ENTERTAINMENT: "Hiburan & Main",
  SHOPPING: "Belanja & Baju",
  OTHER: "Lain-lain",
};

interface InsightData {
  currentTotal: number;
  prevTotal: number;
  diffPercent: number;
  topCategory: { category: string; total: number } | null;
  recommendations: string[];
}

export default function InsightsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="Financial Insights"
        subtitle="Analisis pintar dan rekomendasi hemat khusus untuk kamu"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* MoM Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Perbandingan Bulan Ini vs Lalu
                  </span>
                  {data && data.diffPercent > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      <TrendingUp size={14} /> +{data.diffPercent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <TrendingDown size={14} /> {data?.diffPercent}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[11px] text-gray-500">Bulan Lalu</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800 mt-0.5 truncate">
                      {formatRupiah(data?.prevTotal ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-600 font-medium">Bulan Ini</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-950 mt-0.5 truncate">
                      {formatRupiah(data?.currentTotal ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Spending Category Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-amber-500" size={18} />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Pengeluaran Terbesar Bulan Ini
                    </span>
                  </div>
                  {data?.topCategory ? (
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {CATEGORY_MAP[data.topCategory.category] || data.topCategory.category}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-600 mt-1">
                        {formatRupiah(data.topCategory.total)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">Belum ada pengeluaran</p>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-3">
                  Fokus hemat di kategori ini untuk dampak terbaik pada tabunganmu!
                </p>
              </div>
            </div>

            {/* AI Financial Recommendations */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold">Rekomendasi Hemat Budgetin</h2>
                  <p className="text-xs text-emerald-200">
                    Saran otomatis berdasarkan kebiasaan pengeluaranmu
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {data?.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-start gap-2.5"
                  >
                    <AlertCircle size={17} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
