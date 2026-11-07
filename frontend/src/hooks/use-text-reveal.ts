import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { charsIn, splitChars } from "@/lib/split-chars";

gsap.registerPlugin(ScrollTrigger);

/* Headings marked data-split rise char by char when they scroll into view. */
export function useTextReveal() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    let dead = false;

    // Split after the webfont is applied, otherwise the line breaks are measured with the fallback font.
    document.fonts.ready.then(() => {
      if (dead) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          const { chars } = splitChars(el);
          gsap.fromTo(chars, charsIn.from, { ...charsIn.to, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
      });
    });

    return () => {
      dead = true;
      ctx?.revert();
    };
  }, []);
}
