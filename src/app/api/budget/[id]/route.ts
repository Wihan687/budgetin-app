import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteBudget } from "@/services/budget.service";

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
    await deleteBudget(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus anggaran" },
      { status: 500 }
    );
  }
}
