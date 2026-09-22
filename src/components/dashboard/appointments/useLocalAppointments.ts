import { useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";
import type { BookingStatus } from "@/types/booking";

/**
 * Applies status changes on top of the server-fetched appointment
 * list, in memory only. Phase 2 asks for "a restrained action" here,
 * not a persistence layer — nothing is written back to
 * `appointmentService` or an API route, so a page refresh reverts to
 * the server data. That's a deliberate scope choice, not an oversight.
 */
export function useLocalAppointments(initial: Appointment[]) {
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({});

  const appointments = useMemo(
    () => initial.map((a) => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a)),
    [initial, overrides],
  );

  function updateStatus(id: string, nextStatus: BookingStatus) {
    setOverrides((prev) => ({ ...prev, [id]: nextStatus }));
  }

  return { appointments, updateStatus };
}
