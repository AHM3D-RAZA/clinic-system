"use client";

import { useMemo, useState } from "react";
import type { BookingRequest, BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/content";
import { bookingsSummaryLine, buildTriageGroups } from "@/lib/bookingRequests";
import { BookingsHeader } from "./BookingsHeader";
import { BookingTriageSection } from "./BookingTriageSection";
import { ClosedRequestsToggle } from "./ClosedRequestsToggle";
import { BookingsEmptyState } from "./BookingsEmptyState";

interface BookingsWorkspaceProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
  doctors: Doctor[];
  todayIso: string;
  nowIso: string;
}

const CONFIRMABLE_STATUSES: BookingStatus[] = ["pending", "contacted"];

export function BookingsWorkspace({ bookings, serviceNameById, doctorNameById, doctors, todayIso, nowIso }: BookingsWorkspaceProps) {
  const [showClosed, setShowClosed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => buildTriageGroups(bookings), [bookings]);
  const contextLine = useMemo(() => bookingsSummaryLine(bookings), [bookings]);

  const activeGroups = groups.filter((g) => g.key !== "closed");
  const closedGroup = groups.find((g) => g.key === "closed");

  // A row can only be expanded while it's still pending/contacted —
  // once a confirm succeeds and fresh data arrives (via router.refresh
  // in BookingDetailPanel), the booking's status has moved on, and
  // this naturally stops being "live" without any effect/reset step.
  const effectiveExpandedId = bookings.some((b) => b.id === expandedId && CONFIRMABLE_STATUSES.includes(b.status))
    ? expandedId
    : null;

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
              doctors={doctors}
              todayIso={todayIso}
              nowIso={nowIso}
              expandedId={effectiveExpandedId}
              onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
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
                  doctors={doctors}
                  todayIso={todayIso}
                  nowIso={nowIso}
                  expandedId={effectiveExpandedId}
                  onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
