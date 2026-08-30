import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfMonth, endOfMonth } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

export const budgetSchema = z.object({
  category: z.enum([
    "FOOD",
    "TRANSPORTATION",
    "BOARDING_HOUSE",
    "EDUCATION",
    "STATIONERY",
    "INTERNET",
    "HEALTH",
    "ENTERTAINMENT",
    "SHOPPING",
    "OTHER",
  ]),
  limitAmount: z.coerce.number().positive("Batas anggaran harus lebih dari 0"),
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

export async function getBudgetsWithUsage(
  userId: string,
  month: number,
  year: number
) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const usageByCategory = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const usageMap = new Map<string, number>();
  usageByCategory.forEach((u: { category: string; _sum: { amount: Decimal | null } }) => {
    usageMap.set(u.category, u._sum.amount ? Number(u._sum.amount) : 0);
  });

  return budgets.map((b: { id: string; category: string; limitAmount: Decimal; month: number; year: number }) => {
    const used = usageMap.get(b.category) || 0;
    const limit = Number(b.limitAmount);
    const percentage = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

    return {
      id: b.id,
      category: b.category,
      limitAmount: limit,
      usedAmount: used,
      percentage,
      month: b.month,
      year: b.year,
    };
  });
}

export async function setBudget(userId: string, data: BudgetInput) {
  return prisma.budget.upsert({
    where: {
      userId_category_month_year: {
        userId,
        category: data.category as any,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      limitAmount: data.limitAmount,
    },
    create: {
      userId,
      category: data.category as any,
      limitAmount: data.limitAmount,
      month: data.month,
      year: data.year,
    },
  });
}

export async function deleteBudget(id: string, userId: string) {
  return prisma.budget.delete({ where: { id, userId } });
}

export async function getBudgetCategoryDetails(
  userId: string,
  category: string,
  month: number,
  year: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      category: category as any,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  });

  return transactions;
}

