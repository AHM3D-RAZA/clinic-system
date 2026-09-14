import type { Doctor } from "@/types/content";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import styles from "./DoctorMark.module.css";

interface DoctorMarkProps {
  doctor: Doctor | undefined;
}

/** A small gradient initials circle identifying which doctor an appointment belongs to. */
export function DoctorMark({ doctor }: DoctorMarkProps) {
  if (!doctor) {
    return (
      <span className={styles.mark} data-unassigned="true" aria-hidden="true">
        ?
      </span>
    );
  }

  const style = {
    background: `linear-gradient(160deg, ${swatchToCssVar(doctor.swatch)}, ${swatchToCssVarDeep(doctor.swatch)})`,
  } as React.CSSProperties;

  return (
    <span className={styles.mark} style={style} title={doctor.name}>
      {doctor.initials}
    </span>
  );
}
