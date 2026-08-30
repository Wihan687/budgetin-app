import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDashboardSummary,
  getCategoryBreakdown,
  getWeeklySpending,
  getMonthlyTrend,
  getRecentTransactions,
} from "@/services/insight.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [summary, categoryBreakdown, weeklySpending, monthlyTrend, recentTransactions] =
    await Promise.all([
      getDashboardSummary(session.user.id),
      getCategoryBreakdown(session.user.id),
      getWeeklySpending(session.user.id),
      getMonthlyTrend(session.user.id),
      getRecentTransactions(session.user.id, 5),
    ]);

  return NextResponse.json({
    summary,
    categoryBreakdown,
    weeklySpending,
    monthlyTrend,
    recentTransactions,
  });
}
