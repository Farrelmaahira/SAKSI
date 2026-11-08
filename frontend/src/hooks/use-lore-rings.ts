import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Lore section: rings grow and the big number counts up, both tied to scroll position. */
export function useLoreRings() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".lore-center", start: "top 85%", end: "center 55%", scrub: 0.6 } })
        .from(".lore-center .ring", { scale: 0.4, opacity: 0, stagger: 0.1 }, 0)
        .from(".lore-center .figure.big", { textContent: 0, snap: { textContent: 1 } }, 0);
    });
    return () => mm.revert();
  }, []);
}
