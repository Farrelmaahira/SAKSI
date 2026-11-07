import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/* Words sit in a clipping mask, chars are what gets animated. Masks are padded so descenders survive line-height 1. */
export function splitChars(el: HTMLElement) {
  const split = SplitText.create(el, { type: "words,chars", mask: "words" });
  split.masks.forEach((m) => Object.assign((m as HTMLElement).style, { paddingBlock: "0.1em", marginBlock: "-0.1em" }));
  gsap.set(el, { visibility: "visible" });
  return split;
}

/* Chars rise out of the mask and untilt (same motion as thisismagma.com headlines). */
export const charsIn = {
  from: { yPercent: 110, rotationZ: 45 },
  to: { yPercent: 0, rotationZ: 0, duration: 1.5, stagger: 0.02, ease: "expo.out" },
};
