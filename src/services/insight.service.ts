import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfDay, endOfDay, subMonths, format } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

function toNumber(d: Decimal | null | undefined): number {
  return d ? Number(d) : 0;
}

export async function getDashboardSummary(userId: string) {
  const now = new Date();

  const [todayIncome, todayExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startOfDay(now), lte: endOfDay(now) } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfDay(now), lte: endOfDay(now) } },
      _sum: { amount: true },
    }),
  ]);

  const [weekExpense, monthExpense, yearExpense, totalIncome, totalExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfWeek(now), lte: endOfWeek(now) } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfYear(now), lte: endOfYear(now) } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    balance: toNumber(totalIncome._sum.amount) - toNumber(totalExpense._sum.amount),
    todaySpend: toNumber(todayExpense._sum.amount),
    todayIncome: toNumber(todayIncome._sum.amount),
    weekSpend: toNumber(weekExpense._sum.amount),
    monthSpend: toNumber(monthExpense._sum.amount),
    yearSpend: toNumber(yearExpense._sum.amount),
  };
}

export async function getCategoryBreakdown(userId: string) {
  const now = new Date();
  const transactions = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth(now), lte: endOfMonth(now) },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return transactions.map((t: { category: string; _sum: { amount: Decimal | null } }) => ({
    category: t.category,
    total: toNumber(t._sum.amount),
  }));

}

export async function getWeeklySpending(userId: string) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const results = await Promise.all(
    days.map(async (day) => {
      const agg = await prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startOfDay(day), lte: endOfDay(day) },
        },
        _sum: { amount: true },
      });
      return {
        day: format(day, "EEE"),
        total: toNumber(agg._sum.amount),
      };
    })
  );

  return results;
}

export async function getMonthlyTrend(userId: string) {
  const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));

  const results = await Promise.all(
    months.map(async (month) => {
      const [income, expense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            type: "INCOME",
            date: { gte: startOfMonth(month), lte: endOfMonth(month) },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: "EXPENSE",
            date: { gte: startOfMonth(month), lte: endOfMonth(month) },
          },
          _sum: { amount: true },
        }),
      ]);
      return {
        month: format(month, "MMM"),
        income: toNumber(income._sum.amount),
        expense: toNumber(expense._sum.amount),
      };
    })
  );

  return results;
}

export async function getRecentTransactions(userId: string, limit = 5) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });
}
