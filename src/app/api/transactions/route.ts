import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTransactions,
  createTransaction,
  transactionSchema,
} from "@/services/transaction.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as any;
  const category = searchParams.get("category") as any;
  const search = searchParams.get("search") || undefined;

  const transactions = await getTransactions(session.user.id, {
    type: type || undefined,
    category: category || undefined,
    search,
  });

  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(session.user.id, parsed.data);
    return NextResponse.json({ transaction }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat transaksi" },
      { status: 500 }
    );
  }
}
