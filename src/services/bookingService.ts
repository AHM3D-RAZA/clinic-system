import { bookingRequestsTable } from "@/data/mockDb";
import { generateId } from "@/lib/utils";
import type { BookingRequest, BookingStatus, CreateBookingInput } from "@/types/booking";

/**
 * The only part of the app that knows booking data currently lives in
 * an in-memory mock table. Callers (the API route today; a dashboard
 * later) only ever talk to this service. Swapping `data/mockDb.ts` for
 * a real database/ORM means changing the four function bodies below —
 * nothing about this module's exported shape, or anything that calls
 * it, needs to change.
 *
 * Every method is `async` on purpose, even though the mock work is
 * synchronous — it keeps the call sites identical to what they'll look
 * like once this hits a real network/database call.
 */
async function create(input: CreateBookingInput): Promise<BookingRequest> {
  const now = new Date().toISOString();
  const record: BookingRequest = {
    ...input,
    id: generateId("bkg"),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  return bookingRequestsTable.insert(record);
}

async function getById(id: string): Promise<BookingRequest | undefined> {
  return bookingRequestsTable.findById(id);
}

async function listByClinic(clinicId: string): Promise<BookingRequest[]> {
  return bookingRequestsTable.findByClinic(clinicId);
}

async function updateStatus(
  id: string,
  status: BookingStatus,
): Promise<BookingRequest | undefined> {
  return bookingRequestsTable.updateStatus(id, status);
}

export const bookingService = { create, getById, listByClinic, updateStatus };
