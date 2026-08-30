"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

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

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  category: string;
  description: string | null;
  date: string;
}

export default function TransactionsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    category: "FOOD",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType !== "ALL") params.append("type", filterType);
    if (filterCategory !== "ALL") params.append("category", filterCategory);
    if (search) params.append("search", search);

    try {
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();
      setTransactions(json.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, search]);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      type: "EXPENSE",
      amount: "",
      category: "FOOD",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount.toString(),
      category: tx.category,
      description: tx.description || "",
      date: new Date(tx.date).toISOString().split("T")[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch {
      alert("Gagal menghapus transaksi");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Jumlah nominal harus lebih besar dari 0");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingTx
        ? `/api/transactions/${editingTx.id}`
        : "/api/transactions";
      const method = editingTx ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menyimpan");
        return;
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch {
      setFormError("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="Riwayat Transaksi"
        subtitle="Pantau arus pemasukan & pengeluaranmu"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {/* Actions & Filters Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="INCOME">Pemasukan (+)</option>
                <option value="EXPENSE">Pengeluaran (-)</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="ALL">Semua Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-500/20 text-xs sm:text-sm active:scale-98 cursor-pointer shrink-0"
          >
            <Plus size={17} />
            Tambah Transaksi
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">Tidak ada transaksi ditemukan.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (≥ 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5 font-medium">Tanggal</th>
                      <th className="px-6 py-3.5 font-medium">Jenis & Kategori</th>
                      <th className="px-6 py-3.5 font-medium">Deskripsi</th>
                      <th className="px-6 py-3.5 font-medium text-right">Nominal</th>
                      <th className="px-6 py-3.5 font-medium text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1.5 rounded-lg text-xs font-semibold ${
                                tx.type === "INCOME"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {tx.type === "INCOME" ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <span className="font-medium text-gray-800">
                              {CATEGORY_MAP[tx.category] || tx.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {tx.description || "-"}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                            tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatRupiah(Number(tx.amount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< 768px) */}
              <div className="block md:hidden divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          tx.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? (
                          <ArrowUpRight size={17} />
                        ) : (
                          <ArrowDownRight size={17} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {tx.description || CATEGORY_MAP[tx.category] || tx.category}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {CATEGORY_MAP[tx.category]} •{" "}
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-bold ${
                          tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatRupiah(Number(tx.amount))}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1 text-gray-400 hover:text-emerald-600"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {editingTx ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                    formData.type === "EXPENSE"
                      ? "bg-white text-red-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pengeluaran (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                    formData.type === "INCOME"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pemasukan (+)
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi goreng malam"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600">{formError}</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
