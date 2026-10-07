import { useEffect, useState } from "react";

const TOP_ZONE = 80; // px from the top where the launcher always shows
const BOTTOM_ZONE = 160; // px from the page end where it always shows
const JITTER = 8; // ignore scroll movements smaller than this

/**
 * True while the reader is moving down through the middle of the page.
 * The launcher uses it (on small screens) to step aside instead of
 * sitting on top of text and tap targets, and comes back as soon as
 * they scroll up or reach the top/bottom of the page.
 */
export function useScrollTuck(): boolean {
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const nearBottom = y + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_ZONE;
      if (y < TOP_ZONE || nearBottom) {
        setTucked(false);
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < JITTER) return;
      setTucked(y > lastY);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return tucked;
}
