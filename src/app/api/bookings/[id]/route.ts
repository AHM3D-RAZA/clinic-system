import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";

/**
 * GET /api/bookings/:id
 *
 * Deliberately minimal and read-only. This exists so automated tests
 * can verify a submitted booking actually reached the service/data
 * layer — not just that the UI displayed a success message — without
 * building any dashboard UI on top of it. No list endpoint, no update,
 * no auth: scope stays limited to "prove persistence happened."
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await bookingService.getById(id);

  if (!booking) {
    return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, booking });
}
