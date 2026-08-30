import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getBudgetsWithUsage,
  getBudgetCategoryDetails,
  setBudget,
  budgetSchema,
} from "@/services/budget.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || `${new Date().getMonth() + 1}`);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`);
  const category = searchParams.get("category");

  if (category) {
    const transactions = await getBudgetCategoryDetails(
      session.user.id,
      category,
      month,
      year
    );
    return NextResponse.json({ transactions });
  }

  const budgets = await getBudgetsWithUsage(session.user.id, month, year);
  return NextResponse.json({ budgets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const budget = await setBudget(session.user.id, parsed.data);
    return NextResponse.json({ budget }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan anggaran" },
      { status: 500 }
    );
  }
}
