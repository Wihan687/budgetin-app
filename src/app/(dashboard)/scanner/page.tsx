"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import {
  Camera,
  Upload,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Edit3,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Eye,
  Sliders,
  ShieldCheck,
  PieChart,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CompleteReceiptAnalysis, ReceiptItem, CategoryType } from "@/services/scanner.service";

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: "Makanan & Minuman", value: "FOOD" },
  { label: "Transportasi", value: "TRANSPORTATION" },
  { label: "Kosan / Tempat Tinggal", value: "BOARDING_HOUSE" },
  { label: "Edukasi & Kuliah", value: "EDUCATION" },
  { label: "Alat Tulis & Fotokopi", value: "STATIONERY" },
  { label: "Internet & Pulsa", value: "INTERNET" },
  { label: "Kesehatan", value: "HEALTH" },
  { label: "Hiburan", value: "ENTERTAINMENT" },
  { label: "Belanja", value: "SHOPPING" },
  { label: "Lainnya", value: "OTHER" },
];

export default function ScannerPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [step, setStep] = useState<
    "SOURCE_SELECTION" | "PREPROCESSING" | "SCANNING" | "PREVIEW" | "MANUAL_EDIT" | "SUCCESS"
  >("SOURCE_SELECTION");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentProcessingStep, setCurrentProcessingStep] = useState<number>(1);
  const [analysis, setAnalysis] = useState<CompleteReceiptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  
  const [editStoreName, setEditStoreName] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editItems, setEditItems] = useState<ReceiptItem[]>([]);
  const [showRawText, setShowRawText] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
    setAnalysis(null);
    setStep("PREPROCESSING");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const startPipelineScan = async () => {
    if (!file) return;

    setStep("SCANNING");
    setError(null);
    setCurrentProcessingStep(2);

    const stepInterval = setInterval(() => {
      setCurrentProcessingStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Foto nota kurang jelas, silakan ulangi");
        setStep("PREPROCESSING");
        return;
      }

      const data: CompleteReceiptAnalysis = json.result;

      if (data.detection && !data.detection.isReceipt) {
        setError(data.detection.qualityMessage || "Foto nota kurang jelas, silakan ulangi");
        setStep("PREPROCESSING");
        return;
      }

      setAnalysis(data);
      setEditStoreName(data.structuredData.storeName || "Toko Nota");
      setEditDate(data.structuredData.date || new Date().toISOString().split("T")[0]);
      setEditItems(data.structuredData.items || []);
      
      setStep("PREVIEW");
    } catch {
      clearInterval(stepInterval);
      setError("Terjadi kesalahan jaringan saat memproses nota.");
      setStep("PREPROCESSING");
    }
  };

  const calculateGrandTotal = () => {
    return editItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  };

  const handleSaveToDatabase = async () => {
    if (editItems.length === 0) return;
    setSaving(true);

    try {
      for (const item of editItems) {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "EXPENSE",
            amount: Number(item.amount),
            category: item.category || "OTHER",
            description: `${editStoreName} - ${item.name}`,
            date: editDate || new Date().toISOString().split("T")[0],
          }),
        });
      }

      setStep("SUCCESS");
    } catch {
      alert("Gagal menyimpan beberapa transaksi ke database.");
    } finally {
      setSaving(false);
    }
  };

  const addItemToEditList = () => {
    setEditItems([
      ...editItems,
      { name: "Item Baru", quantity: 1, amount: 10000, category: "FOOD" },
    ]);
  };

  const removeItemFromEditList = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setStep("SOURCE_SELECTION");
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-x-hidden">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <Header
        title="AI Receipt Scanner"
        subtitle="Foto/upload nota dan biarkan AI mencatatnya otomatis!"
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <main className="flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
        {/* Step Indicator Header (Mobile Touch Horizontal Scroll) */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 min-w-[580px] justify-between text-[11px] sm:text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step === "SOURCE_SELECTION" ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</span>
              <span>Pilih Gambar</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === "PREPROCESSING" ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
              <span>Preprocessing</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === "SCANNING" ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
              <span>Deteksi AI</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === "PREVIEW" || step === "MANUAL_EDIT" ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
              <span>Preview</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === "SUCCESS" ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">5</span>
              <span>Selesai</span>
            </div>
          </div>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* STEP 1: PILIH SUMBER GAMBAR */}
        {step === "SOURCE_SELECTION" && (
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-xs border border-gray-100 max-w-2xl mx-auto text-center space-y-5">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 mb-2">
                <Sparkles size={13} /> Langkah 1: Pilih Sumber Gambar
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Unggah Gambar Nota Anda</h2>
              <p className="text-xs text-gray-500 mt-1">
                Gunakan Kamera HP langsung atau pilih gambar dari Galeri HP Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center gap-3 transition text-center cursor-pointer active:scale-98"
              >
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Camera size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Kamera HP</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ambil foto nota langsung</p>
                </div>
              </button>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center gap-3 transition text-center cursor-pointer active:scale-98"
              >
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Upload size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Upload Galeri</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pilih foto dari penyimpanan HP</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 & 3: PREPROCESSING */}
        {step === "PREPROCESSING" && previewUrl && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Sliders size={18} className="text-emerald-600" /> Preprocessing Nota
                </h2>
                <p className="text-xs text-gray-500">Perspektif dan kejelasan teks dioptimalkan otomatis.</p>
              </div>
              <button
                onClick={resetAll}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg active:scale-95"
              >
                <RotateCcw size={13} /> Ganti Foto
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle size={17} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{error}</p>
                  <p className="mt-0.5 text-red-600 text-[11px]">
                    Tips: Pastikan pencahayaan terang, nota lurus, dan tulisan terlihat jelas.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-[300px] sm:max-h-[360px] w-auto object-contain rounded-lg shadow-xl"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Area Nota Terdeteksi
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Optimasi Otomatis AI
                  </h3>
                  
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Perspective & Crop Alignment</p>
                      <p className="text-[11px] text-gray-500">Penyesuaian posisi nota otomatis</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Kejelasan Teks & Kontras</p>
                      <p className="text-[11px] text-gray-500">Menghilangkan bayangan mengganggu</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startPipelineScan}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
                >
                  <ScanLine size={18} />
                  Proses Nota dengan AI
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SCANNING IN PROGRESS */}
        {step === "SCANNING" && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xs border border-gray-100 text-center max-w-lg mx-auto space-y-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-75" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Sparkles size={32} className="animate-spin" />
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">AI Sedang Membaca Nota</h2>
              <p className="text-xs text-gray-500 mt-1">
                Menjalankan ekstraksi teks OCR, pemahaman dokumen, dan validasi data.
              </p>
            </div>

            <div className="space-y-1.5 text-left bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-[11px] sm:text-xs">
              <div className={`flex items-center justify-between p-2 rounded-lg ${currentProcessingStep >= 2 ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-gray-400"}`}>
                <span>Pengecekan Kualitas Nota</span>
                {currentProcessingStep >= 2 && <Check size={14} />}
              </div>
              <div className={`flex items-center justify-between p-2 rounded-lg ${currentProcessingStep >= 4 ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-gray-400"}`}>
                <span>Ekstraksi Teks OCR</span>
                {currentProcessingStep >= 4 && <Check size={14} />}
              </div>
              <div className={`flex items-center justify-between p-2 rounded-lg ${currentProcessingStep >= 5 ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-gray-400"}`}>
                <span>Pemahaman & Validasi Data</span>
                {currentProcessingStep >= 5 && <Check size={14} />}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5, 6, 7: PREVIEW HASIL SCAN & EDIT MANUAL */}
        {(step === "PREVIEW" || step === "MANUAL_EDIT") && analysis && (
          <div className="space-y-4 sm:space-y-6">
            {analysis.validation && !analysis.validation.isTotalMatching && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Peringatan Total:</strong> Total item ({formatRupiah(calculateGrandTotal())}) berbeda dengan total terbaca nota ({formatRupiah(analysis.structuredData.totalAmount)}).
                  </span>
                </div>
                <button
                  onClick={() => setStep("MANUAL_EDIT")}
                  className="bg-amber-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-amber-700 transition shrink-0 text-xs"
                >
                  Edit Manual
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              {/* Left Column: Image Preview */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Foto Nota</h3>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Receipt"
                      className="w-full max-h-[260px] sm:max-h-[320px] object-contain rounded-xl border border-gray-100 bg-gray-50 p-2"
                    />
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-2">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="w-full flex items-center justify-between text-xs font-bold text-gray-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} className="text-purple-600" /> Teks Mentah OCR
                    </span>
                    <span className="text-purple-600">{showRawText ? "Tutup" : "Lihat"}</span>
                  </button>

                  {showRawText && (
                    <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[10px] sm:text-[11px] rounded-xl overflow-x-auto max-h-40 whitespace-pre-wrap mt-2">
                      {analysis.rawText || "Tidak ada raw text terdeteksi."}
                    </pre>
                  )}
                </div>
              </div>

              {/* Right Column: Structured Data */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-600" /> Hasil Scan Nota
                      </h2>
                      <p className="text-xs text-gray-500">Periksa detail transaksi Anda.</p>
                    </div>

                    {step === "PREVIEW" ? (
                      <button
                        onClick={() => setStep("MANUAL_EDIT")}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep("PREVIEW")}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                      >
                        <Check size={13} /> Selesai
                      </button>
                    )}
                  </div>

                  {/* Store Name & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase">Toko / Merchant</label>
                      {step === "MANUAL_EDIT" ? (
                        <input
                          type="text"
                          value={editStoreName}
                          onChange={(e) => setEditStoreName(e.target.value)}
                          className="w-full mt-1 p-2 text-xs bg-white border border-emerald-300 rounded-lg font-bold text-gray-800"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{editStoreName || "-"}</p>
                      )}
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase">Tanggal</label>
                      {step === "MANUAL_EDIT" ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full mt-1 p-2 text-xs bg-white border border-emerald-300 rounded-lg font-bold text-gray-800"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{editDate || "-"}</p>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Daftar Produk ({editItems.length})
                      </h3>
                      {step === "MANUAL_EDIT" && (
                        <button
                          onClick={addItemToEditList}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Plus size={14} /> Tambah Item
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {editItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                          {step === "MANUAL_EDIT" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const copy = [...editItems];
                                  copy[idx].name = e.target.value;
                                  setEditItems(copy);
                                }}
                                className="p-2 text-xs border border-gray-300 rounded-lg bg-white font-medium"
                                placeholder="Nama Barang"
                              />
                              <select
                                value={item.category}
                                onChange={(e) => {
                                  const copy = [...editItems];
                                  copy[idx].category = e.target.value as CategoryType;
                                  setEditItems(copy);
                                }}
                                className="p-2 text-xs border border-gray-300 rounded-lg bg-white"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => {
                                    const copy = [...editItems];
                                    copy[idx].amount = Number(e.target.value);
                                    setEditItems(copy);
                                  }}
                                  className="p-2 text-xs border border-gray-300 rounded-lg bg-white font-bold w-full"
                                  placeholder="Harga (Rp)"
                                />
                                <button
                                  onClick={() => removeItemFromEditList(idx)}
                                  className="text-red-500 hover:text-red-700 p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-gray-800">{item.name}</p>
                                <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                                  {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-emerald-700">
                                {formatRupiah(item.amount)}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grand Total Footer */}
                  <div className="p-4 bg-emerald-500 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-500/20">
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-emerald-100 font-semibold">Total Struk</p>
                      <p className="text-lg sm:text-xl font-black">{formatRupiah(calculateGrandTotal())}</p>
                    </div>

                    <button
                      onClick={handleSaveToDatabase}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer text-xs sm:text-sm active:scale-98"
                    >
                      {saving ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <Check size={17} />
                          Simpan ke Transaksi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: SUCCESS */}
        {step === "SUCCESS" && (
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs border border-gray-100 text-center max-w-lg mx-auto space-y-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 mb-2">
                <PieChart size={14} /> Terhubung ke Laporan Keuangan
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Transaksi Berhasil Disimpan!</h2>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                AI telah meng-update statistik bulanan, grafik pengeluaran, dan sisa budget Anda.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" /> Total {editItems.length} barang tercatat di database.
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" /> Laporan & grafik keuangan otomatis sinkron.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={resetAll}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Scan Nota Lain
              </button>
              <button
                onClick={() => router.push("/transactions")}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20"
              >
                Lihat Transaksi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
