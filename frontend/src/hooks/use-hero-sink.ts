import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* The hero is sticky and .home-sheet slides over it; while that happens the hero text drifts up and fades. */
export function useHeroSink() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".hero-grid", {
        yPercent: -10,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: { trigger: ".home-sheet", start: "top bottom", end: "top 25%", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);
}
