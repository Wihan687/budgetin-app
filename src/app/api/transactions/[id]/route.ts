import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  updateTransaction,
  deleteTransaction,
  transactionSchema,
} from "@/services/transaction.service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const transaction = await updateTransaction(
      id,
      session.user.id,
      parsed.data
    );
    return NextResponse.json({ transaction });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui transaksi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteTransaction(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}
