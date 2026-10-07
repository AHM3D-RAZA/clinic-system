import { NotFoundPanel } from ".";
import { SITE_NOT_FOUND } from "./notFoundCopy";
import styles from "./NotFoundPanel.module.css";

/** The public-site 404: panel + the page landmark and spacing the site pages use. */
export function SiteNotFound() {
  return (
    <main className={`wrap ${styles.sitePage}`}>
      <NotFoundPanel {...SITE_NOT_FOUND} />
    </main>
  );
}
