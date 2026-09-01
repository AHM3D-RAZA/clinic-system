import type { Doctor } from "@/types/content";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import styles from "./DoctorSection.module.css";

interface DoctorSectionProps {
  doctors: Doctor[];
}

export function DoctorSection({ doctors }: DoctorSectionProps) {
  return (
    <section className={styles.team} id="team">
      <div className="wrap">
        <RevealOnScroll className={styles.head}>
          <span className="sectionLabel">Who you&apos;ll meet</span>
          <h2>Three people, one very calm hallway.</h2>
          <p>No lab coats in front of a bookshelf. Just the people who&apos;ll actually be looking in your mouth.</p>
        </RevealOnScroll>

        <div className={styles.grid}>
          {doctors.map((doctor, i) => (
            <RevealOnScroll key={doctor.id} as="div" className={styles.doctorWrap}>
              <article className={styles.doctor} data-index={i}>
                <div className={styles.tape} />
                <div
                  className={styles.photo}
                  style={
                    {
                      background: `linear-gradient(160deg, ${swatchToCssVar(doctor.swatch)}, ${swatchToCssVarDeep(doctor.swatch)})`,
                      "--tilt": `${TILTS[i % TILTS.length]}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span className={styles.initials}>{doctor.initials}</span>
                </div>
                <div className={styles.info}>
                  <h3>{doctor.name}</h3>
                  <p className={styles.role}>{doctor.role}</p>
                  <p className={styles.bio}>{doctor.bio}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const TILTS = [-3, 2, -2, 3];
