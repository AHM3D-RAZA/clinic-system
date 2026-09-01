import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { toCreateBookingInput, validateBookingForm } from "@/lib/validators";
import { getClinicContentById } from "@/config/clinics";
import type { RawBookingFormValues } from "@/lib/validators";

/**
 * POST /api/bookings
 *
 * Creates a booking request. This route is the real boundary between
 * "client" and "server" — the client never talks to bookingService or
 * mockDb directly. When a real database arrives, this handler's body
 * barely changes; it already treats bookingService as the source of
 * truth.
 */
export async function POST(request: Request) {
  let body: RawBookingFormValues & { clinicId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That request wasn't valid JSON." },
      { status: 400 },
    );
  }

  const clinicId = body.clinicId;
  const clinicBundle = clinicId ? getClinicContentById(clinicId) : undefined;
  if (!clinicBundle) {
    return NextResponse.json(
      { ok: false, message: "Unknown or missing clinic." },
      { status: 400 },
    );
  }

  const knownServiceIds = clinicBundle.services.map((s) => s.id);
  const { valid, errors } = validateBookingForm(body, knownServiceIds);
  if (!valid) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const input = toCreateBookingInput(body, clinicId!);

  try {
    const booking = await bookingService.create(input);
    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch {
    // Persistence failed (e.g. the mock store's file write failed).
    // Never report success when nothing was actually saved.
    return NextResponse.json(
      { ok: false, message: "We couldn't save your booking. Please try again." },
      { status: 500 },
    );
  }
}
