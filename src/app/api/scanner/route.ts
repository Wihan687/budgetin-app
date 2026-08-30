import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseReceiptWithGemini } from "@/services/scanner.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File struk tidak ditemukan" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const scannedData = await parseReceiptWithGemini(base64, mimeType);
    return NextResponse.json({ result: scannedData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses struk dengan AI" },
      { status: 500 }
    );
  }
}
