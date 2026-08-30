import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;
export type TransactionType = keyof typeof TransactionType;

export const Category = {
  FOOD: "FOOD",
  TRANSPORTATION: "TRANSPORTATION",
  BOARDING_HOUSE: "BOARDING_HOUSE",
  EDUCATION: "EDUCATION",
  STATIONERY: "STATIONERY",
  INTERNET: "INTERNET",
  HEALTH: "HEALTH",
  ENTERTAINMENT: "ENTERTAINMENT",
  SHOPPING: "SHOPPING",
  OTHER: "OTHER",
} as const;
export type Category = keyof typeof Category;

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
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
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export async function getTransactions(
  userId: string,
  filters?: {
    type?: TransactionType;
    category?: Category;
    from?: Date;
    to?: Date;
    search?: string;
  }
) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.from || filters?.to
        ? {
            date: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to }),
            },
          }
        : {}),
      ...(filters?.search && {
        description: { contains: filters.search },
      }),

    },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(
  userId: string,
  data: TransactionInput
) {
  return prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: new Date(data.date),
    },
  });
}

export async function updateTransaction(
  id: string,
  userId: string,
  data: TransactionInput
) {
  return prisma.transaction.update({
    where: { id, userId },
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: new Date(data.date),
    },
  });
}

export async function deleteTransaction(id: string, userId: string) {
  return prisma.transaction.delete({ where: { id, userId } });
}
