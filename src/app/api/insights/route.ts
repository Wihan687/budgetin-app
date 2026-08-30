import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  // Current vs Previous month spending
  const [currSpend, prevSpend] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: currentMonthStart, lte: currentMonthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),
  ]);

  const currentTotal = currSpend._sum.amount ? Number(currSpend._sum.amount) : 0;
  const prevTotal = prevSpend._sum.amount ? Number(prevSpend._sum.amount) : 0;
  const diffPercent = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0;

  // Top category
  const topCategories = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId, type: "EXPENSE", date: { gte: currentMonthStart, lte: currentMonthEnd } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1,
  });

  const topCategory = topCategories[0]
    ? {
        category: topCategories[0].category,
        total: Number(topCategories[0]._sum.amount),
      }
    : null;

  // Rule-based advice generation for college students
  const recommendations: string[] = [];
  if (topCategory?.category === "FOOD") {
    recommendations.push(
      "Pengeluaran makan kamu adalah yang terbesar! Coba pertimbangkan masak sendiri atau beli paket hemat mingguan untuk menghemat hingga 30%."
    );
  }
  if (topCategory?.category === "ENTERTAINMENT") {
    recommendations.push(
      "Kategori hiburan mengambil porsi terbesar bulan ini. Coba batasi nongkrong/nonton 1-2 kali seminggu."
    );
  }
  if (topCategory?.category === "SHOPPING") {
    recommendations.push(
      "Pengeluaran belanja cukup tinggi. Terapkan aturan 24 jam sebelum checkout keranjang e-commerce kamu!"
    );
  }
  if (diffPercent > 20) {
    recommendations.push(
      `Pengeluaranmu naik ${diffPercent}% dari bulan lalu. Periksa kembali daftar transaksi dan kurangi pembelian impulsif.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Pengeluaran kamu terkendali dengan sangat baik bulan ini! Pertahankan ritme menabung kamu."
    );
  }

  return NextResponse.json({
    currentTotal,
    prevTotal,
    diffPercent,
    topCategory,
    recommendations,
  });
}
