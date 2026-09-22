"use client";

import { useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";
import type { Doctor, ServiceOffering } from "@/types/content";
import { addDaysIso, appointmentsOnDate, buildDayChapters, buildDayStrip, buildDaySummaryLine } from "@/lib/appointments";
import { formatDateForDisplay } from "@/lib/utils";
import { useLocalAppointments } from "./useLocalAppointments";
import { AppointmentsHeader } from "./AppointmentsHeader";
import { AppointmentDayNav } from "./AppointmentDayNav";
import { AppointmentTimeline } from "./AppointmentTimeline";
import { AppointmentEmptyState } from "./AppointmentEmptyState";
import styles from "./AppointmentsWorkspace.module.css";

interface AppointmentsWorkspaceProps {
  appointments: Appointment[];
  services: ServiceOffering[];
  doctors: Doctor[];
  todayIso: string;
}

/**
 * Owns which day is selected and which row is expanded; every
 * grouping/formatting decision (which chapters exist, the strip's day
 * range, the summary line, the detail sentence) lives in
 * lib/appointments.ts, so this component only wires state to the
 * small presentational pieces below it.
 */
export function AppointmentsWorkspace({ appointments: initialAppointments, services, doctors, todayIso }: AppointmentsWorkspaceProps) {
  const [selectedIso, setSelectedIso] = useState(todayIso);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { appointments, updateStatus } = useLocalAppointments(initialAppointments);

  const serviceById = useMemo(() => Object.fromEntries(services.map((s) => [s.id, s])), [services]);
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);

  const dayAppointments = useMemo(() => appointmentsOnDate(appointments, selectedIso), [appointments, selectedIso]);
  const chapters = useMemo(() => buildDayChapters(dayAppointments), [dayAppointments]);
  const days = useMemo(
    () => buildDayStrip(appointments, todayIso, selectedIso),
    [appointments, todayIso, selectedIso],
  );

  // A row expanded on one day has no meaning on another day. Rather
  // than reset state in an effect when `selectedIso` changes, treat
  // the id as "live" only if it's actually in today's list — switching
  // days naturally collapses it, no synchronization step needed.
  const effectiveExpandedId = dayAppointments.some((a) => a.id === expandedId) ? expandedId : null;

  const dateHeading =
    selectedIso === todayIso ? `Today — ${formatDateForDisplay(selectedIso)}` : formatDateForDisplay(selectedIso);
  const summaryLine = buildDaySummaryLine(dayAppointments);

  return (
    <div className={styles.workspace}>
      <AppointmentsHeader dateHeading={dateHeading} summaryLine={summaryLine} />

      <AppointmentDayNav
        days={days}
        selectedIso={selectedIso}
        onSelect={setSelectedIso}
        onPrevDay={() => setSelectedIso((iso) => addDaysIso(iso, -1))}
        onNextDay={() => setSelectedIso((iso) => addDaysIso(iso, 1))}
        onToday={() => setSelectedIso(todayIso)}
      />

      {dayAppointments.length === 0 ? (
        <AppointmentEmptyState dateLabel={formatDateForDisplay(selectedIso)} />
      ) : (
        <AppointmentTimeline
          chapters={chapters}
          serviceById={serviceById}
          doctorById={doctorById}
          dateLabel={formatDateForDisplay(selectedIso)}
          expandedId={effectiveExpandedId}
          onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
