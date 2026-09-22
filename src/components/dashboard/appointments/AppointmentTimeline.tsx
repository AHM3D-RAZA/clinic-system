import { Fragment } from "react";
import type { DayChapter } from "@/lib/appointments";
import type { Doctor, ServiceOffering } from "@/types/content";
import type { BookingStatus } from "@/types/booking";
import { AppointmentChapterLabel } from "./AppointmentChapterLabel";
import { AppointmentEntry } from "./AppointmentEntry";
import styles from "./AppointmentTimeline.module.css";

interface AppointmentTimelineProps {
  chapters: DayChapter[];
  serviceById: Record<string, ServiceOffering>;
  doctorById: Record<string, Doctor>;
  dateLabel: string;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, nextStatus: BookingStatus) => void;
}

export function AppointmentTimeline({
  chapters,
  serviceById,
  doctorById,
  dateLabel,
  expandedId,
  onToggleExpand,
  onStatusChange,
}: AppointmentTimelineProps) {
  let runningIndex = 0;

  return (
    <ul className={styles.stream}>
      {chapters.map((chapter) => (
        <Fragment key={chapter.key}>
          <AppointmentChapterLabel label={chapter.label} count={chapter.appointments.length} />
          {chapter.appointments.map((appointment) => {
            const index = runningIndex++;
            const doctor = doctorById[appointment.doctorId];
            return (
              <AppointmentEntry
                key={appointment.id}
                appointment={appointment}
                index={index}
                serviceName={serviceById[appointment.serviceId]?.name ?? "Unspecified treatment"}
                doctor={doctor}
                doctorName={doctor ? doctor.name : "Doctor to be assigned"}
                dateLabel={dateLabel}
                isExpanded={expandedId === appointment.id}
                onToggle={() => onToggleExpand(appointment.id)}
                onStatusChange={(nextStatus) => onStatusChange(appointment.id, nextStatus)}
              />
            );
          })}
        </Fragment>
      ))}
    </ul>
  );
}
