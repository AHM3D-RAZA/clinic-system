import { NextResponse } from "next/server";

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Authentication required." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}
