"use client";

import { useMemo, useState } from "react";
import type { BookingRequest } from "@/types/booking";
import { bookingsSummaryLine, buildTriageGroups } from "@/lib/bookingRequests";
import { BookingsHeader } from "./BookingsHeader";
import { BookingTriageSection } from "./BookingTriageSection";
import { ClosedRequestsToggle } from "./ClosedRequestsToggle";
import { BookingsEmptyState } from "./BookingsEmptyState";

interface BookingsWorkspaceProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
  todayIso: string;
  nowIso: string;
}

export function BookingsWorkspace({ bookings, serviceNameById, doctorNameById, todayIso, nowIso }: BookingsWorkspaceProps) {
  const [showClosed, setShowClosed] = useState(false);

  const groups = useMemo(() => buildTriageGroups(bookings), [bookings]);
  const contextLine = useMemo(() => bookingsSummaryLine(bookings), [bookings]);

  const activeGroups = groups.filter((g) => g.key !== "closed");
  const closedGroup = groups.find((g) => g.key === "closed");

  return (
    <div>
      <BookingsHeader contextLine={contextLine} />

      {groups.length === 0 ? (
        <BookingsEmptyState />
      ) : (
        <>
          {activeGroups.map((group) => (
            <BookingTriageSection
              key={group.key}
              group={group}
              serviceNameById={serviceNameById}
              doctorNameById={doctorNameById}
              todayIso={todayIso}
              nowIso={nowIso}
            />
          ))}

          {closedGroup && (
            <>
              <ClosedRequestsToggle
                count={closedGroup.bookings.length}
                expanded={showClosed}
                onToggle={() => setShowClosed((v) => !v)}
              />
              {showClosed && (
                <BookingTriageSection
                  group={closedGroup}
                  serviceNameById={serviceNameById}
                  doctorNameById={doctorNameById}
                  todayIso={todayIso}
                  nowIso={nowIso}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
