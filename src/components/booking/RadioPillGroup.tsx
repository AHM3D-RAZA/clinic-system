import { cn } from "@/lib/utils";
import styles from "./BookingForm.module.css";

interface RadioPillOption {
  value: string;
  label: string;
}

interface RadioPillGroupProps {
  name: string;
  ariaLabel: string;
  groupLabel: string;
  options: RadioPillOption[];
  selected: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * The pill-styled radio group markup was previously duplicated between
 * "patient type" and "preferred time of day" almost line for line.
 * One reusable component now backs both.
 */
export function RadioPillGroup({ name, ariaLabel, groupLabel, options, selected, onChange, error }: RadioPillGroupProps) {
  return (
    <div className={styles.field}>
      <span className={styles.groupLabel}>{groupLabel}</span>
      <div className={styles.radioRow} role="radiogroup" aria-label={ariaLabel} aria-required="true">
        {options.map((option) => (
          <label key={option.value} className={cn(styles.radioPill, selected === option.value && styles.radioPillActive)}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={(e) => onChange(e.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}
