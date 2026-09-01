import type { GalleryItem } from "@/types/content";
import { swatchToCssVar, swatchToCssVarDeep } from "@/lib/theme";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import styles from "./ClinicGallery.module.css";

interface ClinicGalleryProps {
  items: GalleryItem[];
}

/**
 * Loose, overlapping tile positions — not a grid. Each tile's
 * placement/rotation/size is layout (part of the authored composition),
 * while its color comes from the item's swatch, so re-theming a clinic
 * re-colors the room without touching the arrangement.
 */
const TILE_LAYOUTS = [
  { width: "30%", aspect: "4/5", top: "0%", left: "2%", rotate: "-6deg" },
  { width: "24%", aspect: "1/1", top: "6%", left: "36%", rotate: "4deg" },
  { width: "22%", aspect: "3/4", top: "2%", right: "4%", rotate: "-3deg" },
  { width: "26%", aspect: "5/4", top: "44%", left: "8%", rotate: "3deg" },
  { width: "22%", aspect: "4/5", top: "38%", left: "38%", rotate: "-5deg" },
  { width: "26%", aspect: "4/3", top: "50%", right: "3%", rotate: "5deg" },
  { width: "34%", aspect: "16/9", top: "75%", left: "18%", rotate: "-2deg" },
] as const;

export function ClinicGallery({ items }: ClinicGalleryProps) {
  return (
    <section className={styles.clinic} id="clinic">
      <RevealOnScroll className={styles.head}>
        <div className={styles.headText}>
          <span className="sectionLabel">The room itself</span>
          <h2>A studio, not a corridor.</h2>
        </div>
        <p>
          Warm light from the courtyard windows, chairs you can actually sink into, and yes —
          that&apos;s a real ceramics shelf in the waiting room.
        </p>
      </RevealOnScroll>

      <RevealOnScroll as="div" className={styles.scatter}>
        {items.map((item, i) => {
          const layout = TILE_LAYOUTS[i % TILE_LAYOUTS.length];
          return (
            <div
              key={item.id}
              className={styles.tile}
              style={{
                width: layout.width,
                aspectRatio: layout.aspect,
                top: layout.top,
                left: "left" in layout ? layout.left : undefined,
                right: "right" in layout ? layout.right : undefined,
                transform: `rotate(${layout.rotate})`,
                background: `linear-gradient(160deg, ${swatchToCssVar(item.swatch)}, ${swatchToCssVarDeep(item.swatch)})`,
              }}
            >
              <div className={styles.fill}>
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </RevealOnScroll>
    </section>
  );
}
