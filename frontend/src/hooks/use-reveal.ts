import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Elements marked data-reveal slide up and fade in as they enter the viewport (CSS keeps them hidden until then). */
export function useReveal() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.fromTo(els, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 2, stagger: 0.1, ease: "expo.out", overwrite: true }),
      });
    });
    return () => mm.revert();
  }, []);
}
