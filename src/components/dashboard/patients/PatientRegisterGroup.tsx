import type { PatientGroup } from "@/lib/patientDirectory";
import type { SwatchKey } from "@/types/content";
import { PatientRow } from "./PatientRow";
import styles from "./PatientRegisterGroup.module.css";

interface PatientRegisterGroupProps {
  group: PatientGroup;
  doctorNameById: Record<string, string>;
  doctorSwatchById: Record<string, SwatchKey>;
  todayIso: string;
}

/**
 * A single lettered section of the register — a hand-marked letter
 * beside a short rule, echoing the daybook's chapter labels without
 * reusing that component directly (this is a different room).
 */
export function PatientRegisterGroup({ group, doctorNameById, doctorSwatchById, todayIso }: PatientRegisterGroupProps) {
  return (
    <li className={styles.section}>
      <h2 className={styles.letter} aria-label={`Patients starting with ${group.letter}`}>
        {group.letter}
      </h2>
      <ul className={styles.rows}>
        {group.patients.map((patient) => (
          <PatientRow
            key={patient.id}
            patient={patient}
            doctorName={doctorNameById[patient.primaryDoctorId] ?? "Unassigned"}
            doctorSwatch={doctorSwatchById[patient.primaryDoctorId] ?? "ink"}
            todayIso={todayIso}
          />
        ))}
      </ul>
    </li>
  );
}
