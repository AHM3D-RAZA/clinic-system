import { Fragment } from "react";
import type { DayChapter } from "@/lib/appointments";
import type { Doctor, ServiceOffering } from "@/types/content";
import { AppointmentChapterLabel } from "./AppointmentChapterLabel";
import { AppointmentEntry } from "./AppointmentEntry";
import styles from "./AppointmentTimeline.module.css";

interface AppointmentTimelineProps {
  chapters: DayChapter[];
  serviceById: Record<string, ServiceOffering>;
  doctorById: Record<string, Doctor>;
}

export function AppointmentTimeline({ chapters, serviceById, doctorById }: AppointmentTimelineProps) {
  let runningIndex = 0;

  return (
    <ul className={styles.stream}>
      {chapters.map((chapter) => (
        <Fragment key={chapter.key}>
          <AppointmentChapterLabel label={chapter.label} count={chapter.appointments.length} />
          {chapter.appointments.map((appointment) => {
            const index = runningIndex++;
            return (
              <AppointmentEntry
                key={appointment.id}
                appointment={appointment}
                index={index}
                serviceName={serviceById[appointment.serviceId]?.name ?? "Unspecified treatment"}
                doctor={doctorById[appointment.doctorId]}
              />
            );
          })}
        </Fragment>
      ))}
    </ul>
  );
}
