import { NextResponse } from "next/server";
import { isClamAVConfigured, isClamAVRequired, scanBufferWithClamAV } from "@/lib/server/clamav";

export const runtime = "nodejs";

export async function GET() {
  if (!isClamAVConfigured()) {
    return NextResponse.json(
      {
        ok: !isClamAVRequired(),
        configured: false,
        required: isClamAVRequired(),
        detail: "scanner_not_configured",
      },
      { status: isClamAVRequired() ? 503 : 200 }
    );
  }

  const verdict = await scanBufferWithClamAV(Buffer.from("healthcheck"));
  const ok = verdict.scanned && verdict.clean;
  return NextResponse.json(
    {
      ok,
      configured: true,
      required: isClamAVRequired(),
      scanned: verdict.scanned,
      detail: verdict.detail,
    },
    { status: ok ? 200 : 503 }
  );
}

