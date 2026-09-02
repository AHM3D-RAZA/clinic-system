import type { BookingRequest } from "@/types/booking";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { BookingListItem } from "./BookingListItem";

interface RecentActivityListProps {
  bookings: BookingRequest[];
  serviceNameById: Record<string, string>;
}

export function RecentActivityList({ bookings, serviceNameById }: RecentActivityListProps) {
  return (
    <DashboardPanel title="Recent activity">
      {bookings.length === 0 ? (
        <DashboardEmptyState
          title="No booking requests yet"
          body="Once patients start requesting appointments through the site, they'll show up here as they come in."
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
