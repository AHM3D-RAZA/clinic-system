import type { BookingRequest } from "@/types/booking";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { BookingListItem } from "./BookingListItem";

interface AttentionPanelProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
}

export function AttentionPanel({ bookings, serviceNameById }: AttentionPanelProps) {
  return (
    <DashboardPanel title="Needs attention" tone="highlight">
      {bookings.length === 0 ? (
        <DashboardEmptyState
          title="You're caught up"
          body="No pending requests right now — new booking requests will show up here first."
        />
      ) : (
        <ul>
          {bookings.map((booking) => (
            <BookingListItem
              key={booking.id}
              booking={booking}
              serviceName={serviceNameById[booking.serviceId] ?? "Unspecified treatment"}
            />
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
