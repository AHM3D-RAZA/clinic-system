"use client";

import { useMemo, useState } from "react";
import type { Patient } from "@/types/patient";
import type { SwatchKey } from "@/types/content";
import { filterPatients, groupPatientsAlphabetically } from "@/lib/patientDirectory";
import { PatientsHeader } from "./PatientsHeader";
import { PatientSearchField } from "./PatientSearchField";
import { PatientRegisterGroup } from "./PatientRegisterGroup";
import { PatientEmptyState } from "./PatientEmptyState";
import styles from "./PatientsWorkspace.module.css";

interface PatientsWorkspaceProps {
  patients: Patient[];
  doctorNameById: Record<string, string>;
  doctorSwatchById: Record<string, SwatchKey>;
  todayIso: string;
}

/**
 * Top-level composition for `/dashboard/patients`. Owns only the
 * search query; all filtering/grouping logic lives in
 * `lib/patientDirectory.ts` so this stays a thin wiring layer, the
 * same shape as `DashboardOverview`/`ClinicActivityStream` next door.
 */
export function PatientsWorkspace({ patients, doctorNameById, doctorSwatchById, todayIso }: PatientsWorkspaceProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterPatients(patients, query), [patients, query]);
  const groups = useMemo(() => groupPatientsAlphabetically(filtered), [filtered]);

  return (
    <div>
      <PatientsHeader />

      <PatientSearchField
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
        totalCount={patients.length}
      />

      {groups.length === 0 ? (
        <PatientEmptyState query={query} />
      ) : (
        <ul className={styles.register}>
          {groups.map((group) => (
            <PatientRegisterGroup
              key={group.letter}
              group={group}
              doctorNameById={doctorNameById}
              doctorSwatchById={doctorSwatchById}
              todayIso={todayIso}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
