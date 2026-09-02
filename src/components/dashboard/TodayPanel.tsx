import type { BookingRequest } from "@/types/booking";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { BookingListItem } from "./BookingListItem";

interface TodayPanelProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
}

export function TodayPanel({ bookings, serviceNameById }: TodayPanelProps) {
  return (
    <DashboardPanel title="Today">
      {bookings.length === 0 ? (
        <DashboardEmptyState
          title="Nothing preferred for today"
          body="No one has asked for today as their preferred date yet."
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
