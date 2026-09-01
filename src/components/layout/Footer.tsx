import Link from "next/link";
import type { ClinicConfig } from "@/types/clinic";
import type { NavLink } from "@/types/content";
import { formatPhoneReadable } from "@/lib/utils";
import styles from "./Footer.module.css";

interface FooterProps {
  clinic: ClinicConfig;
  nav: NavLink[];
}

export function Footer({ clinic, nav }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.mark}>{clinic.name}</div>
          <div className={styles.cols}>
            <div className={styles.col}>
              <h4>Visit</h4>
              <p>{clinic.contact.address}</p>
              <p>{clinic.contact.hours}</p>
            </div>
            <div className={styles.col}>
              <h4>Explore</h4>
              {nav
                .filter((link) => link.href !== "/#home")
                .map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
            </div>
            <div className={styles.col}>
              <h4>Say hi</h4>
              <a href={`mailto:${clinic.contact.email}`}>{clinic.contact.email}</a>
              <a href={`tel:${clinic.contact.phone}`}>{formatPhoneReadable(clinic.contact.phone)}</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>
            &copy; {year} {clinic.name}.
          </span>
          <span>Designed with a little too much care.</span>
        </div>
      </div>
    </footer>
  );
}

