import { NextResponse } from "next/server";
import { confirmBooking } from "@/services/confirmationService";
import { requireStaffApi } from "@/lib/auth/apiGuard";

/**
 * POST /api/bookings/:id/confirm
 *
 * The only write this route exposes: confirm one booking request with
 * one chosen doctor. Deliberately not a generic PATCH/PUT on bookings —
 * there is no way to reach this route and change anything other than
 * "confirm with this doctor." All the actual validation and the
 * appointment-creation-then-booking-update sequencing lives in
 * `services/confirmationService.ts`; this handler only translates its
 * result into HTTP. Staff-only: 401 when no staff session is present.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const { id } = await params;

  let body: { doctorId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "That request wasn't valid JSON." }, { status: 400 });
  }

  const doctorId = typeof body.doctorId === "string" ? body.doctorId.trim() : "";
  if (!doctorId) {
    return NextResponse.json({ ok: false, message: "Choose a doctor before confirming." }, { status: 400 });
  }

  const result = await confirmBooking(id, doctorId);

  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : result.code === "persistence_error" ? 500 : 422;
    return NextResponse.json({ ok: false, message: result.message }, { status });
  }

  return NextResponse.json({ ok: true, booking: result.booking, appointment: result.appointment }, { status: 200 });
}
