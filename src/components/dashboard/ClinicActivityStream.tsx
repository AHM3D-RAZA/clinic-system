"use client";

import { useState } from "react";
import type { DashboardOverviewSummary } from "@/types/dashboard";
import type { ActivityChapterKey } from "@/lib/activityStream";
import { buildActivityStreamNodes } from "@/lib/activityStream";
import { ActivityStreamChapterLabel } from "./ActivityStreamChapterLabel";
import { ActivityStreamEntry } from "./ActivityStreamEntry";
import { ActivityStreamEmptyNote } from "./ActivityStreamEmptyNote";
import { ActivityStreamToggle } from "./ActivityStreamToggle";
import { ActivityStreamOverflowNote } from "./ActivityStreamOverflowNote";
import styles from "./ClinicActivityStream.module.css";

interface ClinicActivityStreamProps {
  summary: DashboardOverviewSummary;
  serviceNameById: Record<string, string>;
  doctorNameById: Record<string, string>;
  todayIso: string;
}

/**
 * The daybook stream — a single connected list threading chapter labels,
 * booking entries, expand/collapse toggles, and empty/overflow notes
 * together instead of three separate card panels. Curation (how many
 * entries show, when a toggle appears) is entirely decided by
 * `buildActivityStreamNodes` in lib/activityStream.ts; this component
 * only owns *which* chapters are currently expanded and renders whatever
 * nodes come back.
 */
export function ClinicActivityStream({ summary, serviceNameById, doctorNameById, todayIso }: ClinicActivityStreamProps) {
  const [expandedChapters, setExpandedChapters] = useState<ReadonlySet<ActivityChapterKey>>(() => new Set());

  if (summary.totalCount === 0) {
    return (
      <div className={styles.quiet}>
        <p className={styles.quietTitle}>It&apos;s quiet in here.</p>
        <p className={styles.quietBody}>
          Once patients start requesting appointments through the site, they&apos;ll show up here as they come in.
        </p>
      </div>
    );
  }

  function toggleChapter(key: ActivityChapterKey) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const nodes = buildActivityStreamNodes(summary, todayIso, expandedChapters);

  return (
    <ul className={styles.stream}>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "chapterLabel":
            return <ActivityStreamChapterLabel key={node.key} label={node.label} note={node.note} />;
          case "emptyNote":
            return <ActivityStreamEmptyNote key={node.key} message={node.message} />;
          case "overflowNote":
            return <ActivityStreamOverflowNote key={node.key} message={node.message} />;
          case "toggle":
            return (
              <ActivityStreamToggle
                key={node.key}
                label={node.label}
                expanded={node.expanded}
                onToggle={() => toggleChapter(node.chapterKey)}
              />
            );
          case "entry":
            return (
              <ActivityStreamEntry
                key={node.key}
                index={index}
                booking={node.booking}
                serviceName={serviceNameById[node.booking.serviceId] ?? "Unspecified treatment"}
                doctorName={node.booking.assignedDoctorId ? doctorNameById[node.booking.assignedDoctorId] : undefined}
                todayIso={todayIso}
              />
            );
        }
      })}
    </ul>
  );
}
