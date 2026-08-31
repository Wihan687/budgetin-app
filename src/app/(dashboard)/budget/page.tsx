"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { Plus, Target, AlertTriangle, CheckCircle2, Trash2, X, Eye, Receipt, Calendar } from "lucide-react";
import { formatRupiah, formatDate, formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";

const CATEGORIES = [
  { id: "FOOD", label: "Makanan & Minuman" },
  { id: "TRANSPORTATION", label: "Transportasi" },
  { id: "BOARDING_HOUSE", label: "Biaya Kos" },
  { id: "EDUCATION", label: "Pendidikan & Kuliah" },
  { id: "STATIONERY", label: "Alat Tulis & Buku" },
  { id: "INTERNET", label: "Paket Data & Internet" },
  { id: "HEALTH", label: "Kesehatan & Obat" },
  { id: "ENTERTAINMENT", label: "Hiburan & Main" },
  { id: "SHOPPING", label: "Belanja & Baju" },
  { id: "OTHER", label: "Lain-lain" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

interface BudgetItem {
  id: string;
  category: string;
  limitAmount: number;
  usedAmount: number;
  percentage: number;
  month: number;
  year: number;
}

interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export default function BudgetPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Add Budget Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("FOOD");
  const [limitAmount, setLimitAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedBudgetForDetail, setSelectedBudgetForDetail] = useState<BudgetItem | null>(null);
  const [detailTransactions, setDetailTransactions] = useState<TransactionDetail[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?month=${month}&year=${year}`);
      const json = await res.json();
      setBudgets(json.budgets || []);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleOpenDetail = async (budget: BudgetItem) => {
    setSelectedBudgetForDetail(budget);
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `/api/budget?category=${budget.category}&month=${month}&year=${year}`
      );
      const json = await res.json();
      setDetailTransactions(json.transactions || []);
    } catch {
      setDetailTransactions([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus batas anggaran ini?")) return;
    try {
      await fetch(`/api/budget/${id}`, { method: "DELETE" });
      fetchBudgets();
    } catch {
      alert("Gagal menghapus anggaran");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = parseNumberFromDots(limitAmount);
    if (!limitAmount || parsedLimit <= 0) {
      setError("Batas nominal harus lebih dari 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          limitAmount: parsedLimit,
          month,
          year,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan");
        return;
      }

      setIsModalOpen(false);
      setLimitAmount("");
      fetchBudgets();
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500 text-red-600";
    if (percentage >= 80) return "bg-amber-500 text-amber-600";
    return "bg-emerald-500 text-emerald-600";
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="Manajemen Anggaran"
        subtitle="Atur dan kendalikan batasan pengeluaran bulananmu"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center gap-2.5">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-500/20 text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            <Plus size={17} />
            Atur Anggaran Kategori
          </button>
        </div>

        {/* Budgets List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-xs border border-gray-100 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Target size={24} />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Belum ada batas anggaran bulan ini
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Buat batasan pengeluaran per kategori agar keuangan kamu tetap terkontrol dengan baik!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {budgets.map((b) => {
              const colorClass = getProgressColor(b.percentage);
              const isOver = b.percentage >= 100;
              const isWarning = b.percentage >= 80 && !isOver;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        {CATEGORY_MAP[b.category] || b.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(b)}
                          title="Lihat Detail Transaksi"
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={13} />
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          title="Hapus Anggaran"
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <p className="text-gray-500">
                        Terpakai:{" "}
                        <span className="font-semibold text-gray-800">
                          {formatRupiah(b.usedAmount)}
                        </span>
                      </p>
                      <p className="text-gray-400">
                        Batas: {formatRupiah(b.limitAmount)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${colorClass.split(" ")[0]}`}
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-xs font-medium text-gray-500">
                      {b.percentage}% terpakai
                    </span>
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={12} /> Over Budget!
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={12} /> Mendekati Batas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Aman
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Detail Transaksi Anggaran */}
      {selectedBudgetForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Receipt size={19} className="text-emerald-600" />
                  Detail Anggaran: {CATEGORY_MAP[selectedBudgetForDetail.category]}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Periode {monthNames[month - 1]} {year}
                </p>
              </div>
              <button
                onClick={() => setSelectedBudgetForDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Overview Summary */}
            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 border border-gray-100 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Total Terpakai:</span>
                <span className="font-bold text-gray-900">
                  {formatRupiah(selectedBudgetForDetail.usedAmount)} / {formatRupiah(selectedBudgetForDetail.limitAmount)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(selectedBudgetForDetail.percentage).split(" ")[0]}`}
                  style={{ width: `${Math.min(selectedBudgetForDetail.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* List of Transactions */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[160px]">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-36">
                  <span className="h-7 w-7 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : detailTransactions.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">
                    Belum ada pengeluaran pada kategori ini
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Transaksi yang kamu tambahkan pada kategori ini di bulan {monthNames[month - 1]} akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                    Daftar Transaksi ({detailTransactions.length})
                  </p>
                  {detailTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-200 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                          {tx.description || CATEGORY_MAP[tx.category]}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                          <Calendar size={12} />
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-red-600 shrink-0">
                        -{formatRupiah(Number(tx.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="pt-2 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedBudgetForDetail(null)}
                className="w-full sm:w-auto px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Set Anggaran Kategori
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Batas Anggaran Bulanan (Rp)
                </label>
                <input
                  type="text"
                  placeholder="500.000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(formatNumberWithDots(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan Anggaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
