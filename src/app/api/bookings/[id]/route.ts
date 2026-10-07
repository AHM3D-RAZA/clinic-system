import { NextResponse } from "next/server";
import { bookingService } from "@/services/bookingService";
import { requireStaffApi } from "@/lib/auth/apiGuard";

/**
 * GET /api/bookings/:id
 *
 * Deliberately minimal and read-only. This exists so automated tests
 * can verify a submitted booking actually reached the service/data
 * layer. It returns patient details, so it requires a staff session
 * (401 otherwise) — the proxy also checks, this is the second layer.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const { id } = await params;
  const booking = await bookingService.getById(id);

  if (!booking) {
    return NextResponse.json({ ok: false, message: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, booking });
}
